// Neon Bay Cover Art — entry program (Node 22, standard library only).
// Hands the app in: copies app/ and screenshots/ from beside this file
// into /output (or MAKEFUN_OUTPUT_DIR when set) and writes
// /output/dossier.json with the kit's vendored buildDossier library.
// The grader runs this twice and both runs must write the same bytes.

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-app.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// The scorer's caps for this bounty: the dossier text is capped at 160 KiB,
// at most 4 screenshots of 256 KiB each, app/ at most 993 files and 48 MiB.
const dossierLimits = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
  app_path_max_bytes: 1000,
};

mkdirSync(outputDir, { recursive: true });
cpSync(join(repoRoot, 'app'), join(outputDir, 'app'), { recursive: true });
const shotsOut = join(outputDir, 'screenshots');
mkdirSync(shotsOut, { recursive: true });
if (existsSync(join(repoRoot, 'screenshots'))) {
  cpSync(join(repoRoot, 'screenshots'), shotsOut, { recursive: true });
}
writeFileSync(join(outputDir, 'dossier.json'), buildDossier(outputDir, dossierLimits));
