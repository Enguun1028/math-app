// The zoom between the main map and a grade map (owner, 2026-10-16: "zoom into the map until it's identical to the
// grade map ... going out is the same"). The dots inside a sphere are the grade map shrunk (layout.js), so one
// camera move links them: both layers scale about the same fixed point F, the map from 1 up to Z and the grade map
// from 1/Z up to 1. At every frame the sphere's dots sit exactly where the grade map's icons sit, and the two only
// cross-fade where they overlap. Scale runs on a log curve (Z^e), so the zoom speed feels even, like a real camera.
import { reduced } from './motion.js';

export const ZOOM_IN_MS = 600; // was 820; owner, 2026-11-01: "the zoom in animation can be a little faster"
export const ZOOM_OUT_MS = 680;
// Moves at once, then a long soft landing. A stronger ease-in-out packed most of the zoom into a short burst
// in the middle, which read as a jump.
export const ZOOM_EASE = 'cubic-bezier(0.3, 0.1, 0.18, 1)';

// c: sphere centre on screen; rs: screen px per grade-map unit inside the sphere;
// m: { x, y, scale } the grade map's centre on screen and its px per unit.
export function zoomPlan(c, rs, m) {
  if (reduced || !c || !m) return null;
  const Z = m.scale / rs;
  if (!isFinite(Z) || Z < 1.2) return null;
  return { Z, F: { x: (Z * c.x - m.x) / (Z - 1), y: (Z * c.y - m.y) / (Z - 1) } };
}

const smooth = (a, b, e) => {
  const x = Math.min(1, Math.max(0, (e - a) / (b - a)));
  return x * x * (3 - 2 * x);
};
// Opacity along the zoom (e = 0 at the main map, 1 at the grade map). They overlap in the middle.
export const mapOpacity = (e) => 1 - smooth(0.42, 0.88, e);
export const gradeOpacity = (e) => smooth(0.28, 0.72, e);

// Animate one layer along the zoom. shift: 0 for the map (scale Z^e), -1 for the grade map (scale Z^(e-1)).
// origin: F in the element's own coordinates. dir 'in' runs e 0 → 1, 'out' runs 1 → 0.
export function zoomLayer(el, plan, { shift, origin, opacity, dir }) {
  const N = 16;
  const frames = [];
  for (let i = 0; i <= N; i++) {
    const p = i / N;
    const e = dir === 'in' ? p : 1 - p;
    const f = { offset: p, transform: `scale(${plan.Z ** (e + shift)})` };
    if (opacity) f.opacity = opacity(e);
    frames.push(f);
  }
  el.style.transformOrigin = `${origin.x}px ${origin.y}px`;
  return el.animate(frames, { duration: dir === 'in' ? ZOOM_IN_MS : ZOOM_OUT_MS, easing: ZOOM_EASE, fill: 'both' });
}

// Plain opacity along the same timing, for parts that only fade (the top bar, the map's buttons).
export function fadeAlong(el, dir, opacity) {
  const N = 8;
  const frames = Array.from({ length: N + 1 }, (_, i) => {
    const p = i / N;
    return { offset: p, opacity: opacity(dir === 'in' ? p : 1 - p) };
  });
  return el.animate(frames, { duration: dir === 'in' ? ZOOM_IN_MS : ZOOM_OUT_MS, easing: ZOOM_EASE, fill: 'both' });
}
