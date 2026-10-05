// Empaqueta dist/ en un único archivo HTML autocontenido (jugar.html)
// para poder jugar abriéndolo directamente, sin servidor ni instalación.
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
let html = readFileSync(join(dist, 'index.html'), 'utf8');

// Con una función como reemplazo, los patrones especiales ($&, $1…) del
// código minificado no se interpretan.
html = html.replace(/<script type="module" crossorigin src="\.\/(assets\/[^"]+\.js)"><\/script>/, (_m, file) => {
  const js = readFileSync(join(dist, file), 'utf8').replace(/<\/script/gi, '<\\/script');
  return `<script type="module">${js}</script>`;
});
html = html.replace(/<link rel="stylesheet" crossorigin href="\.\/(assets\/[^"]+\.css)">/, (_m, file) => {
  const css = readFileSync(join(dist, file), 'utf8');
  return `<style>${css}</style>`;
});

if (/src="\.\/assets|href="\.\/assets/.test(html)) {
  console.error('No se pudieron incrustar todos los recursos.');
  process.exit(1);
}
writeFileSync(join(root, 'jugar.html'), html);
console.log(`jugar.html generado (${(html.length / 1024).toFixed(0)} KB)`);
