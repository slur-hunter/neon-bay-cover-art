# Neon Bay Cover Art

[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/slur-hunter/neon-bay-cover-art/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/slur-hunter/neon-bay-cover-art/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

Neon Bay Cover Art turns your photos and a caption into a GTA-style multi-panel poster, and exports it as a PNG to share. It is an entry for the make.fun GTA 6 cover art bounty.

## What it does

- Loads your own photos from your machine (or the two bundled samples) into a tray. Nothing is uploaded.
- Arranges them in three panels under three layouts: Hero + strip, Triptych, and Split screen.
- Lets you crop and position each photo per panel, with zoom and pan sliders, and pick the photo for each panel.
- Writes a bold caption in the vendored Anton typeface with a neon glow and a gradient underline, plus a letter-spaced tagline, in four ink colours.
- Washes the poster in one of three colour grades (Sunset, Neon nights, Vice pink) with a strength slider, a vignette, and the app's own NEON BAY wordmark chip.
- Exports the cover as a PNG at 1080 x 1080, 1080 x 1350 or 1920 x 1080.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080 in desktop Chrome. Add photos, pick a layout, write the caption, and press Export PNG.

## Files

- `app/index.html` — the editor page
- `app/style.css` — the dark neon editor theme, with the vendored Anton face
- `app/src/cover.js` — the cover renderer: layouts, grades, caption, wordmark
- `app/src/main.js` — the editor wiring: photo tray, controls, PNG export
- `app/src/shots.js` — fixed scenes for screenshots (`?shot=1..4`)
- `app/fonts/Anton-Regular.ttf` — Anton, SIL Open Font License (see OFL.txt)
- `app/samples/` — two bundled sample photos, free to use
- `main.ts` — hands the app in: copies app/ and screenshots/ and writes dossier.json
- `serve.ts` — the local static server
- `shots.json` — the four screenshot scenes
- `screenshots/` — four real screenshots of the app at work
