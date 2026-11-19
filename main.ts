// Neon Bay Cover Art — the entry program for make.fun gta6-cover-art-01.
// Node 22, standard library only. The app itself is plain static files under app/
// (app/index.html and its ES modules, plus a vendored OFL font and two sample
// photos; no library, no network request), so handing it in means copying app/
// and screenshots/ beside this file into /output and writing /output/dossier.json
// with the vendored make.fun library.
//
// The app: a multi-panel GTA-style cover maker. Load your own photos (or the two
// bundled samples), fill three panels in a Hero, Triptych or Split-screen layout,
// crop and position each panel, write a caption and tagline, pick a sunset/neon
// colour grade, and export a PNG in 1080 x 1080, 1080 x 1350 or 1920 x 1080.
//
// Try it locally with `node serve.ts`, then open http://localhost:8080.
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-app.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });

// The scorer's own caps (reference/gate.json): only text_max_bytes shapes the
// bytes; the rest refuse an entry the scorer would refuse — more than 4
// screenshots or one over 256 KiB; more than 993 files in app/ or 48 MiB of app
// files in all, or a path under app/ over 1000 bytes. app/ counts beside
// /output's own 1000-entry cap, its screenshots/ and dossier.json.
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
    app_path_max_bytes: 1000,
  }),
);
