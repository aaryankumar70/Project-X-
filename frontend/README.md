# Boomerang: campus lost & found (frontend)

React + Vite + Tailwind + Framer Motion. Works on phones and laptops: bottom tab bar on mobile, sidebar on desktop.

## Run it

```bash
npm install
npm run dev
```

Open the local URL it prints. Sign in with any email and any 6 digits (demo mode).

## Try the full flow

1. Tap **I lost something**, type `white headphones`, search.
2. Open a match and answer the questions. For the headphones: tan, a small sticker on the left cup, and `sony` for the brand. You need 2 of 3 right.
3. See the unlocked photo card and the contact / drop-off step.
4. Tap **I found something** to go through the finder flow.

## Where things live

- `src/services/api.js`: every backend call, mocked. Replace each function body with a real request and keep the return shape. The route mapping is listed at the top of the file.
- `src/mocks/data.js`: demo found items, with their questions.
- `src/config.js`: app name, campus spots, attempts, item lifetime, allowed email domains.
- `tailwind.config.js`: colour palette and fonts.
- `src/components/`: shared UI (Button, Sheet, TagCard, AppShell...).
- `src/pages/`: one file per screen.

## Backend notes

- The search response should be a text-only public view (no photo URL, no questions).
- Verification answers must be checked on the server. The mock keeps answers out of `getQuestions`, but the real app should never ship them to the browser at all.
- Contact goes through your server so neither email is exposed.
