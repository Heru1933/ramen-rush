// Ramen Rush — a precision ramen-shop cooking game.
//
// You run a tiny ramen counter through the lunch rush: take each customer's
// order, boil the noodles to the right bite, ladle the broth, lay on the
// toppings in the order they asked for, and slide the bowl across before the
// customer's patience runs out. Orders get longer, the queue gets louder,
// and a perfect bowl earns a tip. The whole game is plain static files in
// game/ (game/index.html plus its ES modules and stylesheet, no libraries,
// no network), so any desktop browser can open it offline.
//
// This file is the entrypoint the judge runs. It stages the deliverable:
// it copies game/ and screenshots/ next to this file into the output
// directory and writes dossier.json there, the summary the judge reads,
// using the vendored make.fun helper. Run it with Node 22, standard
// library only, nothing to install:
//
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
//
// Inside the grader's container the output directory is /output; outside
// it, MAKEFUN_OUTPUT_DIR stands in for /output. To play it locally first,
// run `node serve.ts` and open http://localhost:8080. The first screenshot
// by name is the cover image, so keep the title shot first.

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

// Directory holding this file, and the directory the staged entry goes to.
const sourceDir = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Copy a folder only when it is actually there, creating the target first.
function copyFolderIfPresent(name: string): void {
  const from = join(sourceDir, name);
  if (!existsSync(from)) return;
  const to = join(outputDir, name);
  mkdirSync(to, { recursive: true });
  cpSync(from, to, { recursive: true });
}

// Fail loudly instead of shipping an empty bowl: the game must have its
// front page before anything is staged.
if (!existsSync(join(sourceDir, 'game', 'index.html'))) {
  throw new Error('Ramen Rush is missing game/index.html — nothing to stage.');
}

mkdirSync(outputDir, { recursive: true });
copyFolderIfPresent('game');
copyFolderIfPresent('screenshots');

// The scorer's caps (reference/gate.json). text_max_bytes is the only one
// that trims text; the rest are hard refusals, so the staged entry must
// stay inside them: at most 4 screenshots, each no bigger than 256 KiB;
// at most 993 files in game/ totalling no more than 48 MiB, with no single
// game/ path longer than 1000 bytes. game/ is counted beside the output
// directory's own 1000-entry cap, its screenshots/ and dossier.json.
const dossier = buildDossier(outputDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
});

writeFileSync(join(outputDir, 'dossier.json'), dossier);
