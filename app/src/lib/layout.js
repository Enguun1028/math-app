// World layout of both maps.
// Curriculum map (home): one sphere per grade, winding down the journey path. The dots inside a sphere are
// the grade's sprouting map (gradeRadial) shrunk to fit, so opening a sphere shows the map it already promised.
// Math map: one column per branch of mathematics, each concept below everything it needs.
import { spheres, topics, strands, branches, isFresh } from './content.js';

// ---- curriculum map: grade spheres ----
// Sphere size follows how many concepts the grade holds; the square root keeps big years from swallowing the page.
const R_MIN = 190;
const R_PER = 30;
const radius = (s) => R_MIN + R_PER * Math.sqrt(s.topics.length);

// Sideways sway uses the golden angle (137.5°, as in sunflower seeds), so it never settles into a zigzag.
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));
const SWAY = 380;

// Gaps between sphere edges follow the Fibonacci word (long, short, long, long, short, ...):
// two lengths in the golden ratio, in a rhythm that never repeats exactly.
const PHI = (1 + Math.sqrt(5)) / 2;
const GAP_SHORT = 230;
const fibWord = (n) => Math.floor((n + 2) / PHI) - Math.floor((n + 1) / PHI); // 1 = long, 0 = short

// ---- inside a grade: a map that sprouts from the centre (owner's favourite, 2026-10-13) ----
// The grade number sits in the middle and each strand owns a slice. Topics grow outward ring by ring:
// returning topics (met in earlier grades) sit closest to the centre, new topics grow out from the ones they need.
export const RAD = { R0: 100, STEP: 80, SPACE: 86, NODE: 15 };
const STRAND_ORDER = Object.keys(strands);
const radialCache = {};

export function gradeRadial(sid) {
  if (radialCache[sid]) return radialCache[sid];
  const s = spheres.find((x) => x.id === sid);
  const ids = new Set(s.topics);
  const list = s.topics.map((id) => topics[id]);
  // Links drawn inside the map: prerequisites within the same year and the same strand.
  const req = (id) => topics[id].req.filter((r) => ids.has(r) && topics[r].strand === topics[id].strand);
  const groups = STRAND_ORDER.map((st) => list.filter((t) => t.strand === st)).filter((x) => x.length);
  const nodes = {};
  const sectors = [];
  // Slice widths follow topic counts, with a floor so small strands still have room.
  const weight = groups.map((gr) => Math.max(gr.length, 3));
  const total = weight.reduce((a, b) => a + b, 0);
  let a0 = -Math.PI / 2;
  groups.forEach((gr, gi) => {
    const span = (weight[gi] / total) * Math.PI * 2;
    const a1 = a0 + span;
    sectors.push({ strand: gr[0].strand, a0, a1 });
    // Level: returning topics 0; a new topic one ring beyond the deepest same-strand topic it needs.
    const level = {};
    const lv = (id, seen = new Set()) => {
      if (level[id] != null) return level[id];
      if (seen.has(id)) return 0;
      seen.add(id);
      return (level[id] = isFresh(id, sid) ? Math.max(1, ...req(id).map((r) => lv(r, seen) + 1)) : 0);
    };
    gr.forEach((t) => lv(t.id));
    const ring = {};
    const used = [];
    const cap = (k) => Math.max(1, Math.floor((span * (RAD.R0 + k * RAD.STEP)) / RAD.SPACE));
    [...gr].sort((a, b) => level[a.id] - level[b.id]).forEach((t) => {
      let k = Math.max(level[t.id], ...req(t.id).map((r) => (ring[r] != null ? ring[r] + 1 : 0)));
      while ((used[k] || []).length >= cap(k)) k++;
      (used[k] ||= []).push(t.id);
      ring[t.id] = k;
    });
    used.forEach((row, k) => {
      if (!row) return;
      // Keep a child near its parent's angle: order the ring by parent angle.
      const angOf = (id) => {
        const ps = req(id).map((r) => nodes[r]).filter(Boolean);
        return ps.length ? ps.reduce((a, p) => a + p.ang, 0) / ps.length : (a0 + a1) / 2;
      };
      row.sort((x, y) => angOf(x) - angOf(y));
      const r = RAD.R0 + k * RAD.STEP;
      row.forEach((id, i) => {
        const ang = a0 + span * ((i + 0.5) / row.length);
        nodes[id] = { x: r * Math.cos(ang), y: r * Math.sin(ang), ang, k };
      });
    });
    a0 = a1;
  });
  const rMax = Math.max(RAD.R0, ...Object.values(nodes).map((n) => Math.hypot(n.x, n.y)));
  return (radialCache[sid] = { nodes, sectors, rMax, req });
}

export const sphereLayout = {};
// Dot positions keyed "sphere:topic", because a concept sits in every grade that teaches it.
export const dotLayout = {};

let prev = null;
for (const s of spheres) {
  const R = radius(s);
  const x = SWAY * Math.sin(s.index * GOLDEN_ANGLE);
  const y = prev ? prev.y + prev.R + R + GAP_SHORT * (fibWord(s.index) ? PHI : 1) : 0;
  prev = { y, R };
  sphereLayout[s.id] = { x, y, R, color: s.color };
  const rad = gradeRadial(s.id);
  const k = (R * 0.86) / (rad.rMax + RAD.NODE);
  for (const id of s.topics) {
    const n = rad.nodes[id];
    dotLayout[s.id + ':' + id] = { x: x + n.x * k, y: y + n.y * k, color: strands[topics[id].strand].color };
  }
}

// Bounding box of the whole world, for "fit" and limits.
export const world = (() => {
  const L = Object.values(sphereLayout);
  return {
    minX: Math.min(...L.map((s) => s.x - s.R)),
    maxX: Math.max(...L.map((s) => s.x + s.R)),
    minY: Math.min(...L.map((s) => s.y - s.R - 80)),
    maxY: Math.max(...L.map((s) => s.y + s.R + 60)),
  };
})();

// ---- math map: branch columns × depth rows ----
export const MATH = { COLW: 132, NODEW: 116, NODEH: 40, GAP: 10, TOP: 56, ROW: 30 };
export const mathLayout = (() => {
  const { COLW, NODEH, GAP, TOP, ROW } = MATH;
  const depth = {};
  const d = (id, seen = new Set()) => {
    if (depth[id] != null) return depth[id];
    if (seen.has(id)) return 0;
    seen.add(id);
    return (depth[id] = Math.max(0, ...topics[id].req.map((r) => d(r, seen) + 1)));
  };
  Object.keys(topics).forEach((id) => d(id));
  const pos = {};
  let H = 0;
  branches.forEach((b, col) => {
    const list = Object.values(topics)
      .filter((t) => t.branches[0] === b.id)
      .sort((a, c) => depth[a.id] - depth[c.id] || a.grade - c.grade);
    let y = TOP;
    for (const t of list) {
      y = Math.max(y, TOP + depth[t.id] * ROW);
      pos[t.id] = { x: 12 + col * COLW, y };
      y += NODEH + GAP;
      H = Math.max(H, y);
    }
  });
  return { pos, W: 12 + branches.length * COLW, H: H + 20 };
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
