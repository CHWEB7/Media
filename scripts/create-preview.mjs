import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const url = 'https://raw.githubusercontent.com/CHWEB7/Media/main/index.html';
const res = await fetch(url);
if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
let html = await res.text();

html = html.replace(
  /(<meta name="viewport"[^>]+>)/,
  '$1\n  <meta name="robots" content="noindex, nofollow">'
);
html = html.replace('relume-layout-v1', 'relume-layout-preview');
html = html.replace(
  /<title>[^<]+<\/title>/,
  '<title>Voltron Digital — Preview (hidden)</title>'
);
html = html
  .replaceAll('href="css/', 'href="../css/')
  .replaceAll('href="assets/', 'href="../assets/')
  .replaceAll('src="assets/', 'src="../assets/')
  .replaceAll('src="js/', 'src="../js/');

const outDir = join(root, 'preview');
await mkdir(outDir, { recursive: true });
const out = join(outDir, 'index.html');
await writeFile(out, html, 'utf8');
console.log(`Wrote ${out} (${html.length} chars)`);
