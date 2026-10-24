// Records the heart Reel from the live app: Хэрэгсэл → График, a tap on «Зүрх ♥», then a slides from 0 to 10 (the slider's own range).
// Captions and the finger are drawn on top of the page. Music comes from ../web/reel.html (id heart).
// Usage: node heart.mjs [stills]   (stills: only save a few test frames)
import puppeteer from 'puppeteer-core';
import { spawn } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const stills = process.argv[2] === 'stills', FPS = 30, L = 14;
const here = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1'));
const out = path.join(here, '..', 'out'); mkdirSync(out, { recursive: true });
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe', headless: true });
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const music = await browser.newPage();
await music.goto(pathToFileURL(path.join(here, '..', 'web', 'reel.html')).href + '?id=heart');
const wav = path.join(out, 'heart_music.wav');
writeFileSync(wav, Buffer.from(await music.evaluate(() => window.audioWav()), 'base64'));
await music.close();

const page = await browser.newPage();
await page.setViewport({ width: 360, height: 640, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
await page.goto('https://matematikiin-ayalal.pages.dev/', { waitUntil: 'networkidle0' });
await wait(2000);
await page.evaluate(() => {
  const css = document.createElement('style');
  css.textContent = '.boardwrap { margin: 0 auto; width: 236px; } .board { max-height: none !important; }';
  document.head.append(css);
  location.hash = '#/tools';
});
await wait(3000);
await page.evaluate(() => {
  [...document.querySelectorAll('button')].find((b) => b.textContent.trim() === 'Ойлголоо')?.click();
  const css = document.createElement('style');
  // The bottom bar, bug-report button and symbol keys are hidden so the graph, formulas and slider fit one phone screen.
  css.textContent = `.keys, .hint, .tabbar, .pinned { display: none !important; }
    #band { position: fixed; left: 0; right: 0; top: 0; height: 88px; z-index: 9998; background: linear-gradient(#05070d 82%, rgba(5,7,13,0)); }
    #cap { position: fixed; left: 16px; right: 16px; top: 12px; z-index: 9999; text-align: center; font: 800 21px/1.25 Montserrat, system-ui, sans-serif; color: #eef1f5; text-shadow: 0 0 12px rgba(255,79,216,.55); transition: none; }
    #cap small { display: block; margin-top: 6px; font: 700 14px/1.3 system-ui, sans-serif; color: #22d3ee; text-shadow: none; }
    #finger { position: fixed; z-index: 9999; width: 34px; height: 34px; margin: -17px 0 0 -17px; border-radius: 50%; background: rgba(255,255,255,.38); border: 2px solid rgba(255,255,255,.75); pointer-events: none; display: none; }`;
  document.head.append(css);
  for (const el of document.querySelectorAll('button')) if (getComputedStyle(el).position === 'fixed' && /bug|алдаа/i.test(el.getAttribute('aria-label') || el.className)) el.style.display = 'none';
  document.body.insertAdjacentHTML('beforeend', '<div id="band"></div><div id="cap"></div><div id="finger"></div>');
});
await wait(500);
// Scroll so the graph sits just under the caption.
await page.evaluate(() => { const b = document.querySelector('.boardwrap').getBoundingClientRect(); window.scrollBy(0, b.top - 90); });
await wait(600);
await page.evaluate(() => { const b = document.querySelector('.boardwrap').getBoundingClientRect(); window.scrollBy(0, b.top - 90); });
await wait(300);
const heartBtn = await page.evaluate(() => { const r = [...document.querySelectorAll('.preset')].find((b) => b.textContent.includes('Зүрх')).getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; });

const ease = (x) => x * x * (3 - 2 * x), seg = (t, a, b) => Math.max(0, Math.min(1, (t - a) / (b - a)));
const caption = (t) => t < 1.6 ? 'Хайртай хүндээ илгээх график' : t < 10.5 ? 'a-г өсгөхөд юу болох вэ?' : 'Та өөрөө a-г өөрчилж үзээрэй<small>матемап → Хэрэгсэл → График → Зүрх ♥</small>';
let tapped = false, lastA = null;
async function frame(t) {
  if (!tapped && t >= 1.1) { // tap «Зүрх ♥», then start a near zero
    await page.evaluate(() => [...document.querySelectorAll('.preset')].find((b) => b.textContent.includes('Зүрх')).click());
    await wait(700); tapped = true;
  }
  const a = tapped ? Math.round((0.3 + 9.7 * ease(seg(t, 2.2, 9.5))) * 10) / 10 : null;
  return page.evaluate(async ({ t, a, aChanged, heartBtn, cap }) => {
    document.getElementById('cap').innerHTML = cap;
    const f = document.getElementById('finger'), r = document.querySelector('.rows .range');
    if (a !== null && r && aChanged) { r.value = a; r.dispatchEvent(new Event('input', { bubbles: true })); }
    if (t > 0.7 && t < 1.5) { f.style.display = 'block'; f.style.left = heartBtn[0] + 'px'; f.style.top = heartBtn[1] + 'px'; f.style.transform = `scale(${1 - 0.25 * Math.sin(Math.min(1, (t - 0.7) / 0.6) * Math.PI)})`; }
    else if (r && t > 1.9 && t < 9.9) { const b = r.getBoundingClientRect(), k = (r.value - r.min) / (r.max - r.min); f.style.display = 'block'; f.style.transform = 'none'; f.style.left = b.x + 8 + k * (b.width - 16) + 'px'; f.style.top = b.y + b.height / 2 + 'px'; }
    else f.style.display = 'none';
    await new Promise((res) => requestAnimationFrame(() => requestAnimationFrame(res)));
  }, { t, a, aChanged: a !== lastA, heartBtn, cap: caption(t) }).then(() => { lastA = a; });
}

if (stills) {
  for (const t of [0.3, 1.0, 2.5, 5, 8, 11]) { await frame(t); await wait(300); await page.screenshot({ path: path.join(out, `heart_still_${t}.png`) }); }
} else {
  const mp4 = path.join(out, 'heart.mp4');
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-i', '-', '-i', wav, '-t', String(L),
    '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '17', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', mp4], { stdio: ['pipe', 'inherit', 'inherit'] });
  for (let f = 0; f < L * FPS; f++) {
    await frame(f / FPS);
    const img = await page.screenshot({ type: 'jpeg', quality: 92 });
    if (!ff.stdin.write(img)) await new Promise((r) => ff.stdin.once('drain', r));
  }
  ff.stdin.end(); await new Promise((r) => ff.on('close', r));
  console.log('wrote', mp4);
}
await browser.close();
