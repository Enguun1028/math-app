// Renders a preview from ../web/reel.html to a 1080x1920, 30 fps mp4 with its synthesised music.
// Usage: node render.mjs <id> [seconds]   (id: rps, heart, ...; seconds limits the length for a test)
import puppeteer from 'puppeteer-core';
import { spawn } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const id = process.argv[2], limit = Number(process.argv[3]) || Infinity, FPS = 30;
const here = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1'));
const out = path.join(here, '..', 'out'); mkdirSync(out, { recursive: true });
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe', headless: true, args: ['--autoplay-policy=no-user-gesture-required'] });
const page = await browser.newPage();
await page.setViewport({ width: 1080, height: 1920 });
await page.goto(pathToFileURL(path.join(here, '..', 'web', 'reel.html')).href + '?id=' + id, { waitUntil: 'networkidle0' });
await page.evaluate(() => Promise.all(['500 16px Montserrat', '700 16px Montserrat', '800 16px Montserrat', '700 16px "JetBrains Mono"'].map((f) => document.fonts.load(f, 'Тоглолт 123'))));
const L = Math.min(limit, await page.evaluate(() => window.reelLength));

const wav = path.join(out, `${id}_music.wav`);
writeFileSync(wav, Buffer.from(await page.evaluate(() => window.audioWav()), 'base64'));
const mp4 = path.join(out, `${id}.mp4`);
const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-i', '-', '-i', wav, '-t', String(L),
  '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '17', '-preset', 'medium', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', mp4], { stdio: ['pipe', 'inherit', 'inherit'] });
const n = Math.round(L * FPS);
for (let f = 0; f < n; f++) {
  const b64 = await page.evaluate((t) => { drawAt(t); return document.getElementById('c').toDataURL('image/jpeg', 0.95).slice(23); }, f / FPS);
  if (!ff.stdin.write(Buffer.from(b64, 'base64'))) await new Promise((r) => ff.stdin.once('drain', r));
  if (f % 150 === 0) console.log(`frame ${f}/${n}`);
}
ff.stdin.end();
await new Promise((r) => ff.on('close', r));
await browser.close();
console.log('wrote', mp4);
