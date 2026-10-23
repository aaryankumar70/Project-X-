// Class names are written out in full so Tailwind can see them.
export const TONES = {
  sky: { tint: 'bg-sky-tint', solid: 'bg-sky', deep: 'text-sky-deep', border: 'border-sky-deep' },
  butter: { tint: 'bg-butter-tint', solid: 'bg-butter', deep: 'text-butter-deep', border: 'border-butter-deep' },
  blush: { tint: 'bg-blush-tint', solid: 'bg-blush', deep: 'text-blush-deep', border: 'border-blush-deep' },
  mint: { tint: 'bg-mint-tint', solid: 'bg-mint', deep: 'text-mint-deep', border: 'border-mint-deep' },
  lilac: { tint: 'bg-lilac-tint', solid: 'bg-lilac', deep: 'text-lilac-deep', border: 'border-lilac-deep' },
};

export const tone = (key) => TONES[key] || TONES.sky;
