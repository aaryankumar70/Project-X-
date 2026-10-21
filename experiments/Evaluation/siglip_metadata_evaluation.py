
import ast
import json
import re
from pathlib import Path

import pandas as pd


# ---------------------------------------------------------
# Configuration
# ---------------------------------------------------------

ROOT = Path(__file__).resolve().parents[2]
RESULTS_FILE = ROOT / "src" / "Evaluation" / "siglip_metadata_results.csv"
OUTPUT_DIR = RESULTS_FILE.parent

ITEM_METRICS_FILE = OUTPUT_DIR / "siglip_final_item_metrics.csv"
ERRORS_FILE = OUTPUT_DIR / "siglip_final_errors.csv"
SUMMARY_FILE = OUTPUT_DIR / "siglip_final_summary.txt"


# Only merge genuine spelling/format variants here.
CATEGORY_ALIASES = {
    "earbuds": "earbud case",
    "earbud_case": "earbud case",
    "smart-watch": "smartwatch",
    "water_bottle": "water bottle",
    "pencil_case": "pencil case",
}

COLOR_ALIASES = {
    "gray": "grey",
    "grey": "grey",
    "metallic": "silver",
}

# Used only for the separate shade-tolerant color metric.
# Strict scoring still distinguishes dark blue from blue.
SHADE_BASE = {
    "dark blue": "blue",
    "light blue": "blue",
    "navy blue": "blue",
    "dark purple": "purple",
    "light purple": "purple",
    "dark grey": "grey",
    "light grey": "grey",
    "dark gray": "grey",
    "light gray": "grey",
    "dark green": "green",
    "light green": "green",
    "dark red": "red",
    "light red": "red",
    "dark brown": "brown",
    "light brown": "brown",
    "dark pink": "pink",
    "light pink": "pink",
    "off white": "white",
    "off-white": "white",
}


# ---------------------------------------------------------
# Normalization and parsing
# ---------------------------------------------------------

def normalize(value):
    """Normalize formatting without merging different categories."""
    if pd.isna(value):
        return ""

    value = str(value).strip().lower()
    value = value.replace("_", " ")
    value = re.sub(r"\s+", " ", value)
    value = value.strip(" .")

    return value


def normalize_category(value):
    value = normalize(value)
    return CATEGORY_ALIASES.get(value, value)


def normalize_color(value):
    value = normalize(value)
    return COLOR_ALIASES.get(value, value)


def color_base(value):
    """Map shades to a base hue for tolerant scoring only."""
    value = normalize_color(value)
    value = SHADE_BASE.get(value, value)

    # A metallic/metal label can be compared to silver in the
    # tolerant metric, but not in the strict metric.
    if value == "metal":
        value = "silver"

    return value


def split_expected_colors(value):
    """Support ground truth such as black/white or blue."""
    value = normalize(value)

    if not value:
        return []

    parts = re.split(r"[/,;|]+", value)
    return [normalize_color(part) for part in parts if part.strip()]


def parse_candidates(value):
    """
    Parse top-k fields stored as JSON/Python lists.
    Also tolerates a simple comma-separated fallback.
    """
    if value is None or pd.isna(value):
        return []

    if isinstance(value, list):
        parsed = value
    else:
        raw = str(value).strip()

        if not raw:
            return []

        try:
            parsed = json.loads(raw)
        except (json.JSONDecodeError, TypeError):
            try:
                parsed = ast.literal_eval(raw)
            except (ValueError, SyntaxError):
                parsed = [part.strip() for part in raw.split(",")]

    if not isinstance(parsed, list):
        parsed = [parsed]

    output = []

    for item in parsed:
        if isinstance(item, dict):
            # Support common candidate dictionary formats.
            item = (
                item.get("label")
                or item.get("category")
                or item.get("color")
                or item.get("name")
                or item.get("candidate")
                or ""
            )

        if item is not None:
            label = normalize(item)
            if label:
                output.append(label)

    return output


def safe_text(value):
    if value is None or pd.isna(value):
        return ""
    return str(value).strip()


# ---------------------------------------------------------
# Evaluation
# ---------------------------------------------------------

def main():
    if not RESULTS_FILE.exists():
        raise FileNotFoundError(
            f"Results CSV not found:\n{RESULTS_FILE}\n\n"
            "Check that siglip_metadata_evaluation.py has already "
            "produced siglip_metadata_results.csv."
        )

    df = pd.read_csv(RESULTS_FILE)

    required = {
        "item_id",
        "image_id",
        "expected_category",
        "predicted_category",
        "category_top3",
        "expected_color",
        "predicted_color",
        "color_top3",
    }

    missing = required - set(df.columns)
    if missing:
        raise ValueError(
            "The results CSV is missing required columns: "
            + ", ".join(sorted(missing))
        )

    if df.empty:
        raise ValueError("The results CSV contains no rows.")

    rows = []

    for _, source in df.iterrows():
        expected_cat = normalize_category(source["expected_category"])
        predicted_cat = normalize_category(source["predicted_category"])
        cat_candidates = [
            normalize_category(x)
            for x in parse_candidates(source["category_top3"])
        ]

        expected_colors = split_expected_colors(source["expected_color"])
        predicted_color = normalize_color(source["predicted_color"])
        color_candidates = [
            normalize_color(x)
            for x in parse_candidates(source["color_top3"])
        ]

        # Strict color correctness: predicted label must match
        # one of the manually labelled expected color components.
        color_top1_strict = (
            predicted_color in expected_colors
            if expected_colors and predicted_color
            else None
        )

        # Tolerant color correctness: compare base hues while
        # retaining a separate metric from strict exact matching.
        expected_bases = {color_base(c) for c in expected_colors}
        color_top1_tolerant = (
            color_base(predicted_color) in expected_bases
            if expected_bases and predicted_color
            else None
        )

        cat_top1 = (
            predicted_cat == expected_cat
            if expected_cat and predicted_cat
            else None
        )

        cat_top3 = (
            expected_cat in cat_candidates
            if expected_cat and cat_candidates
            else None
        )

        color_top3_strict = (
            any(c in expected_colors for c in color_candidates)
            if expected_colors and color_candidates
            else None
        )

        color_top3_tolerant = (
            any(color_base(c) in expected_bases for c in color_candidates)
            if expected_bases and color_candidates
            else None
        )

        row = {
            "item_id": safe_text(source["item_id"]),
            "image_id": safe_text(source["image_id"]),
            "expected_category": safe_text(source["expected_category"]),
            "predicted_category": safe_text(source["predicted_category"]),
            "category_top3": json.dumps(cat_candidates),
            "category_top1_correct": cat_top1,
            "category_top3_correct": cat_top3,
            "expected_color": safe_text(source["expected_color"]),
            "predicted_color": safe_text(source["predicted_color"]),
            "color_top3": json.dumps(color_candidates),
            "color_top1_strict_correct": color_top1_strict,
            "color_top1_tolerant_correct": color_top1_tolerant,
            "color_top3_strict_correct": color_top3_strict,
            "color_top3_tolerant_correct": color_top3_tolerant,
            "category_error": (
                not cat_top1 if cat_top1 is not None else None
            ),
            "color_strict_error": (
                not color_top1_strict
                if color_top1_strict is not None
                else None
            ),
            "ground_truth_features": safe_text(
                source.get("ground_truth_features", "")
            ),
            "predicted_attributes": safe_text(
                source.get("predicted_attributes", "")
            ),
        }

        rows.append(row)

    metrics = pd.DataFrame(rows)

    # Save the per-item evaluation first, so the detailed results
    # are available even if a later reporting step fails.
    metrics.to_csv(ITEM_METRICS_FILE, index=False)

    # Rows with a usable expected label form each metric's denominator.
    metric_columns = [
        "category_top1_correct",
        "category_top3_correct",
        "color_top1_strict_correct",
        "color_top1_tolerant_correct",
        "color_top3_strict_correct",
        "color_top3_tolerant_correct",
    ]

    summary_lines = [
        "LOSTANDFOUNDAI — SIGLIP METADATA EVALUATION",
        "=" * 52,
        f"Input file: {RESULTS_FILE}",
        f"Rows in dataset: {len(metrics)}",
        "",
        "METRICS",
        "-" * 52,
    ]

    for column in metric_columns:
        valid = metrics[column].dropna()
        count = len(valid)

        if count:
            correct = int(valid.astype(bool).sum())
            accuracy = 100 * correct / count
            summary_lines.append(
                f"{column}: {correct}/{count} = {accuracy:.2f}%"
            )
        else:
            summary_lines.append(f"{column}: N/A (no valid labels)")

    category_failures = metrics[
        metrics["category_top1_correct"].eq(False)
    ]
    color_failures = metrics[
        metrics["color_top1_strict_correct"].eq(False)
    ]

    # Combine failures into one review file.
    failures = metrics[
        metrics["category_top1_correct"].eq(False)
        | metrics["color_top1_strict_correct"].eq(False)
    ].copy()

    failures.to_csv(ERRORS_FILE, index=False)

    summary_lines.extend([
        "",
        "ERROR COUNTS",
        "-" * 52,
        f"Category Top-1 failures: {len(category_failures)}",
        f"Strict color Top-1 failures: {len(color_failures)}",
        f"Rows with either category or strict color failure: {len(failures)}",
        "",
        "ATTRIBUTE EVALUATION",
        "-" * 52,
        "Attribute precision/recall/F1: NOT EVALUATED.",
        "Reason: free-text ground_truth_features is not a validated,",
        "independently labelled set of individual attribute tags.",
        "Predicted attributes should currently be reviewed qualitatively.",
        "",
        "INTERPRETATION",
        "-" * 52,
        "Strict color scoring checks exact normalized color labels.",
        "Tolerant color scoring additionally merges defined shade variants.",
        "Top-3 measures whether the expected label appears among candidates.",
        "These scores describe this dataset, not guaranteed production accuracy.",
    ])

    SUMMARY_FILE.write_text(
        "\n".join(summary_lines) + "\n",
        encoding="utf-8",
    )

    print("\n".join(summary_lines))
    print("\nSaved files:")
    print(f"  Item metrics : {ITEM_METRICS_FILE}")
    print(f"  Errors       : {ERRORS_FILE}")
    print(f"  Summary      : {SUMMARY_FILE}")


if __name__ == "__main__":
    main()
