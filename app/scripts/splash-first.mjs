// After the build: move the app's script and stylesheet links from <head> to the end of <body>.
// With them in <head>, a slow phone shows nothing until the stylesheet has arrived; at the end of <body>, the
// loading screen (inline in index.html) is drawn from the first few kilobytes of the page.
import { readFileSync, writeFileSync } from 'node:fs';

const file = new URL('../dist/index.html', import.meta.url);
let html = readFileSync(file, 'utf8');
// The app script may already be in <body> (index.html puts it there); it is moved too, so it ends up last.
const moved = html.match(/<script type="module"[^>]*><\/script>|<link rel="(?:stylesheet|modulepreload)"[^>]*>/g) ?? [];
for (const m of moved) html = html.replace(m, '');
// Stylesheet first: the app script then waits for it, so the app never appears unstyled.
const rank = (t) => (t.startsWith('<link rel="stylesheet"') ? 0 : t.startsWith('<link') ? 1 : 2);
moved.sort((a, b) => rank(a) - rank(b));
html = html.replace('</body>', moved.join('\n') + '\n</body>');
writeFileSync(file, html);
console.log(`splash-first: moved ${moved.length} tag(s) to the end of <body>`);
