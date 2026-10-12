// World layout of the map: sphere centres wind down the page; topics sit on a ring inside each sphere.
import { spheres, topics, strands } from './content.js';

// Sphere size follows `volume` (1-5): how much school math the area holds, not how many topics we wrote.
// The 0.7 power keeps the difference readable but gentle (volume 5 is about 1.4x volume 3).
const R_MAX = 340;
const radius = (s) => R_MAX * Math.pow((s.volume ?? 3) / 5, 0.7);

// Sideways sway uses the golden angle (137.5°, as in sunflower seeds), so it never settles into a zigzag.
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));
const SWAY = 380;

// Gaps between sphere edges follow the Fibonacci word (long, short, long, long, short, ...):
// two lengths in the golden ratio, in a rhythm that never repeats exactly.
const PHI = (1 + Math.sqrt(5)) / 2;
const GAP_SHORT = 170;
const fibWord = (n) => Math.floor((n + 2) / PHI) - Math.floor((n + 1) / PHI); // 1 = long, 0 = short

export const sphereLayout = {};
export const topicLayout = {};

let prev = null;
for (const s of spheres) {
  const n = s.topics.length;
  const R = radius(s);
  const x = SWAY * Math.sin(s.index * GOLDEN_ANGLE);
  const y = prev ? prev.y + prev.R + R + GAP_SHORT * (fibWord(s.index) ? PHI : 1) : 0;
  prev = { y, R };
  // Most common strand colours the sphere.
  const count = {};
  for (const t of s.topics) count[topics[t].strand] = (count[topics[t].strand] || 0) + 1;
  const strand = Object.entries(count).sort((a, b) => b[1] - a[1])[0][0];
  sphereLayout[s.id] = { x, y, R, color: strands[strand].color };

  const centre = n >= 7 ? 1 : 0;
  const ring = n - centre;
  const ringR = R * (n <= 3 ? 0.46 : 0.56);
  const r = Math.min(R * 0.3, ringR * Math.sin(Math.PI / ring) * 0.9);
  s.topics.forEach((id, i) => {
    let tx = x, ty = y;
    if (i >= centre) {
      const a = -Math.PI / 2 + ((i - centre) / ring) * Math.PI * 2;
      tx = x + Math.cos(a) * ringR;
      ty = y + Math.sin(a) * ringR;
    }
    topicLayout[id] = { x: tx, y: ty, r, color: strands[topics[id].strand].color };
  });
}

// Bounding box of the whole world, for "fit" and limits.
export const world = (() => {
  const L = Object.values(sphereLayout);
  return {
    minX: Math.min(...L.map((s) => s.x - s.R)),
    maxX: Math.max(...L.map((s) => s.x + s.R)),
    minY: Math.min(...L.map((s) => s.y - s.R - 80)),
    maxY: Math.max(...L.map((s) => s.y + s.R)),
  };
})();

// Split a name into at most two lines of roughly equal length.
export function twoLines(name, max = 14) {
  if (name.length <= max) return [name];
  const words = name.split(' ');
  let best = [name], diff = Infinity;
  for (let i = 1; i < words.length; i++) {
    const a = words.slice(0, i).join(' '), b = words.slice(i).join(' ');
    const d = Math.abs(a.length - b.length);
    if (d < diff) [best, diff] = [[a, b], d];
  }
  return best;
}
