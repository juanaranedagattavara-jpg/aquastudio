// Junta index.html + CSS + JS en un solo archivo (dist/desconecta2.html) para publicarlo como Artifact.
// Uso: node desconecta2/build.mjs
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
let html = readFileSync(join(root, 'index.html'), 'utf8');
html = html.replace(/<link rel="stylesheet" href="(css\/[^"]+)">/g, (_, p) => `<style>\n${readFileSync(join(root, p), 'utf8')}</style>`);
html = html.replace(/<script src="(js\/[^"]+)"><\/script>/g, (_, p) => `<script>\n${readFileSync(join(root, p), 'utf8')}</script>`);
mkdirSync(join(root, 'dist'), { recursive: true });
writeFileSync(join(root, 'dist', 'desconecta2.html'), html);
console.log('dist/desconecta2.html', (html.length / 1024).toFixed(1) + ' KB');
