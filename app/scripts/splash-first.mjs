// After the build: move the app's inlined script and styles from <head> to the end of <body>.
// The page is one ~180 KB file; with the code in <head>, the phone shows nothing until all of it
// has arrived. With the code at the end, the loading screen is drawn from the first few kilobytes.
import { readFileSync, writeFileSync } from 'node:fs';

const file = new URL('../dist/index.html', import.meta.url);
let html = readFileSync(file, 'utf8');
const head = html.slice(0, html.indexOf('</head>'));
const moved = [];
// The app's script and its big stylesheet are the only blocks this large; the small splash styles stay.
for (const re of [/<script type="module"[^>]*>[\s\S]*?<\/script>/, /<style[^>]*>[\s\S]*?<\/style>/g]) {
  for (const m of head.match(re) ?? []) {
    if (m.length < 20000) continue;
    html = html.replace(m, '');
    moved.push(m);
  }
}
html = html.replace('</body>', moved.reverse().join('\n') + '\n</body>');
writeFileSync(file, html);
console.log(`splash-first: moved ${moved.length} block(s) to the end of <body>`);
