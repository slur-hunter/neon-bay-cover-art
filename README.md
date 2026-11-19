# Neon Bay Cover Art

[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/slur-hunter/neon-bay-cover-art/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/slur-hunter/neon-bay-cover-art/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

An offline web app that turns your photo and a caption into a multi-panel
poster in the style of GTA 6 cover art, and exports it as a PNG to share.
Everything runs in your browser from the files in `app/` — your photos are
read on your own machine and never uploaded.

## What it does

- **Three layouts**: Hero + strip (one big panel over two small ones),
  Triptych (three equal columns), and Split screen (a tall panel beside two
  stacked ones). Click a panel on the cover to select it.
- **Any photo**: add your own photos from your machine, or load the two
  bundled sample photos. Each panel gets its own photo, zoom (1x–3x) and
  pan, so one photo can fill several panels or each panel can hold another.
- **Caption lettering**: a bold caption in the vendored Anton font, fitted
  to the cover width, uppercased, with a dark stroke, a neon pink glow and
  a pink-yellow-cyan underline bar. A letter-spaced tagline sits above it.
  Four ink colours: white, sunset yellow, hot pink, neon cyan.
- **Colour grades**: Sunset (orange to magenta), Neon nights
  (cyan, magenta, purple) and Vice pink, with a strength slider, plus a
  vignette and a "NEON BAY" wordmark chip — the app's own original
  wordmark, not a game logo.
- **Export PNG** in the three common post sizes: 1080 x 1080,
  1080 x 1350 and 1920 x 1080.

## How to run it

```sh
node serve.ts
```

Then open http://localhost:8080 in desktop Chrome. No build step, no
network request: every script, image and font is a file under `app/`.

## Files

- `app/index.html` — the editor page
- `app/style.css` — the editor theme
- `app/src/cover.js` — the cover engine (layouts, grades, caption)
- `app/src/main.js` — the editor (tray, controls, export)
- `app/src/shots.js` — fixed `?shot=` scenes for screenshots
- `app/fonts/Anton-Regular.ttf` — Anton, SIL Open Font License (see OFL.txt)
- `app/samples/` — two bundled sample photos, free to use
- `screenshots/` — screenshots of the app and covers it exported
- `main.ts` — hands the app in (copies `app/` and `screenshots/`, writes `dossier.json`)
- `serve.ts` — a tiny static server for local testing

## License

MIT. See LICENSE.
