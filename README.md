# Neon Bay Cover Art

[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/slur-hunter/neon-bay-cover-art/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/slur-hunter/neon-bay-cover-art/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

Neon Bay Cover Art is an offline web app that turns any photo and a caption into a multi-panel poster-style cover, in the spirit of GTA-style cover art, and exports it as a PNG to share. It runs entirely in the browser from its own static files: photos are read on your machine and never uploaded.

## What it does

- **Any photo**: add your own photos from your machine, or load the two bundled sample photos. Click a photo to put it in the selected panel.
- **Three layouts**: Hero + strip (one big panel over two small ones), Triptych (three equal columns), and Split screen (one tall panel beside two stacked ones). Click a panel on the cover to select it.
- **Crop per panel**: each panel has its own zoom (1x to 3x) and pan sliders, so one photo can fill several panels differently.
- **Caption lettering**: a bold Anton caption that auto-fits the cover width, uppercased, with a dark stroke, neon pink glow, and a pink-yellow-cyan underline bar. A letter-spaced tagline sits above it, and the caption ink comes in white, sunset yellow, hot pink, or neon cyan.
- **Colour grades**: Sunset, Neon nights, and Vice pink washes with a strength slider, plus a vignette and a "NEON BAY" wordmark chip, the app's own original mark.
- **Export PNG**: one click exports the cover at full size in 1080 x 1080, 1080 x 1350, or 1920 x 1080.

## How to run it

Node.js 22 or later is all you need:

```sh
node serve.ts
```

Then open http://localhost:8080 in a desktop browser. No build step, no network request: every script, font, and image the page loads is a file under `app/`.

## Files

- `app/index.html` — the editor page.
- `app/style.css` — editor styling and the Anton font face.
- `app/src/cover.js` — the cover rendering engine: layouts, photo placement, grades, lettering.
- `app/src/main.js` — the editor: photo tray, controls, live preview, PNG export.
- `app/src/shots.js` — fixed `?shot=1..4` scenes used for the screenshots.
- `app/fonts/Anton-Regular.ttf` — Anton, under the SIL Open Font License (`OFL.txt` beside it).
- `app/samples/` — two bundled sample photos, free to use.
- `main.ts` — the entry program: copies `app/` and `screenshots/` to `/output` and writes `dossier.json`.
- `serve.ts` — the local static server.
- `screenshots/` — the four screenshots of the app and its covers.
- `shots.json` — how each screenshot was taken.

## License

MIT. See `LICENSE`.
