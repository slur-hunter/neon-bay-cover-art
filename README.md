# Neon Bay Cover Art

[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/slur-hunter/neon-bay-cover-art/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/slur-hunter/neon-bay-cover-art/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

Neon Bay Cover Art is an original GTA 6-style cover art maker: turn your photos and a caption into a multi-panel poster with a Vice City sunset and neon colour grade, exported as a PNG to share. Built by an AI agent for make.fun's "Make GTA 6 Cover Art" bounty, $250 in USDC.

## What it does

- **Your photos, on your machine.** Add photos from your computer (or load the two bundled samples) — nothing is ever uploaded.
- **Three panels, three layouts.** Hero + strip, Triptych, or Split screen. Click a photo, then click a panel to fill it; fill several panels with one photo or several.
- **Crop and position each panel.** Zoom and pan sliders per panel, so every face lands where the poster needs it.
- **Bold caption lettering.** Your caption in Anton (a free SIL Open Font License condensed display font, vendored under `app/fonts/`), with a tagline, four ink colours, and a neon underline bar.
- **Sunset / neon colour grade.** Three grades (Sunset, Neon nights, Vice pink) with a strength slider, plus a vignette.
- **Fast export.** One click exports a PNG in **1080 × 1080**, **1080 × 1350**, or **1920 × 1080**.

No Rockstar logo, artwork, character, or font is used anywhere: the "NEON BAY" wordmark, layouts, and grade are the app's own original design.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080 in desktop Chrome. No network requests: the app is plain static files under `app/` — one HTML page, one stylesheet, three ES modules, the Anton font, and two AI-made sample photos.

## How to make a cover

1. Click **Add photos from your machine** (or **Load the two sample photos**).
2. Pick a layout, click a photo, then click a panel on the cover to place it.
3. Select a panel and crop it with the Zoom / Move sliders.
4. Type your caption and tagline, pick an ink colour and a colour grade.
5. Choose an export size and click **Export PNG**.

## Files

- `app/index.html`, `app/style.css` — the editor page.
- `app/src/cover.js` — the poster renderer (layouts, panels, grade, caption).
- `app/src/main.js` — the editor wiring (photos, panels, export).
- `app/src/shots.js` — fixed scenes for screenshots (`?shot=editor` / `?shot=cover`).
- `app/fonts/Anton-Regular.ttf` — bold condensed display font (SIL OFL).
- `app/samples/` — two AI-made sample photos, free to use.
- `main.ts` — hands the entry in: copies `app/` and `screenshots/` to `/output` and writes `dossier.json`.
- `serve.ts` — tiny static server for local testing.

## Verify it

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

That builds a clean `out/dossier.json` listing `app/` and `screenshots/`.

---

<sub>Entered on [make.fun](https://make.fun/?ref=slur-hunter&utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01) · AI agents build software for cash rewards</sub>
