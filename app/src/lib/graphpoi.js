// Points of interest on the graph calculator, like Desmos (owner, 2026-10-22: "intersections are important"):
// where two lines cross, where a line crosses the axes, and a curve's highest and lowest points.
// Found numerically from the parsed lines (lib/graphexpr.js): sampled for sign changes, then bisection.
// Handles y = f(x) lines, x = c lines, and implicit curves (x^2 + y^2 = 9) against y = f(x) lines and the axes.

const N = 800; // samples across the search window

// Zeros of g on [a, b]: sign changes made exact by bisection. A jump across an asymptote (1/x) is no zero.
function zeros(g, a, b) {
  const out = [], h = (b - a) / N;
  let x0 = a, y0 = g(a);
  for (let i = 1; i <= N; i++) {
    const x1 = a + i * h, y1 = g(x1);
    if (Number.isFinite(y0) && Number.isFinite(y1)) {
      if (y0 === 0) out.push(x0);
      else if (y0 * y1 < 0) {
        let lo = x0, hi = x1, glo = y0;
        for (let k = 0; k < 60; k++) {
          const m = (lo + hi) / 2, gm = g(m);
          if (!Number.isFinite(gm)) break;
          if (glo * gm <= 0) hi = m;
          else { lo = m; glo = gm; }
        }
        const x = (lo + hi) / 2;
        if (Math.abs(g(x)) < 1e-6 * (1 + Math.abs(y0) + Math.abs(y1))) out.push(x);
      }
    }
    x0 = x1;
    y0 = y1;
  }
  return out;
}

// Highest and lowest points of f: where the slope changes sign.
function turns(f, a, b) {
  const e = ((b - a) / N) * 1e-3;
  const d = (x) => (f(x + e) - f(x - e)) / (2 * e);
  return zeros(d, a, b).map((x) => {
    const y = f(x), l = f(x - (b - a) / N), r = f(x + (b - a) / N);
    return Number.isFinite(y) && Number.isFinite(l) && Number.isFinite(r) && (y >= l) === (y >= r) ? { x, y, kind: y >= l ? 'max' : 'min' } : null;
  }).filter(Boolean);
}

// parsed: readLine results; params: slider values; box: [xMin, yMax, xMax, yMin] of the view.
// Returns [{ x, y, kinds }], kinds from cross | root | yint | max | min, searched over 3 times the view.
export function pointsOfInterest(parsed, params, box) {
  const [x1, y2, x2, y1] = box, w = x2 - x1, hgt = y2 - y1;
  const a = x1 - w, b = x2 + w;
  const env = { ...params, x: 0, y: 0 };
  const safe = (fn) => (...v) => { try { const r = fn(...v); return typeof r === 'number' ? r : NaN; } catch { return NaN; } };
  const fns = parsed.filter((p) => p.kind === 'fn').map((p) => safe((x) => { env.x = x; env.y = 0; return p.f(env); }));
  const imps = parsed.filter((p) => p.kind === 'implicit').map((p) => safe((x, y) => { env.x = x; env.y = y; return p.f(env); }));
  const vlines = parsed.filter((p) => p.kind === 'vline').map((p) => safe(() => p.f(env))());

  const out = [];
  const add = (x, y, kind) => { if (Number.isFinite(x) && Number.isFinite(y)) out.push({ x, y, kind }); };
  fns.forEach((f, i) => {
    for (const x of zeros(f, a, b)) add(x, 0, 'root');
    for (const t of turns(f, a, b)) {
      add(t.x, t.y, t.kind);
      if (Math.abs(t.y) < 1e-9 * (1 + hgt)) add(t.x, 0, 'root'); // y = x^2 touches the axis without crossing it
    }
    if (0 >= a && 0 <= b) add(0, f(0), 'yint');
    for (let j = i + 1; j < fns.length; j++) { const g = fns[j]; for (const x of zeros((x) => f(x) - g(x), a, b)) add(x, f(x), 'cross'); }
    for (const F of imps) for (const x of zeros((x) => F(x, f(x)), a, b)) add(x, f(x), 'cross');
    for (const c of vlines) add(c, f(c), 'cross');
  });
  for (const F of imps) {
    for (const x of zeros((x) => F(x, 0), a, b)) add(x, 0, 'root');
    for (const y of zeros((y) => F(0, y), y1 - hgt, y2 + hgt)) add(0, y, 'yint');
  }

  // One dot per spot, with every name it has (the lowest point of y = x^2 - 4 is also on the y axis), only near
  // the view, at most 80.
  const tol = Math.max(w, hgt) * 1e-4, kept = [];
  const rank = { cross: 0, root: 1, yint: 2, max: 3, min: 3 };
  for (const p of out.sort((p, q) => rank[p.kind] - rank[q.kind])) {
    if (p.y < y1 - hgt || p.y > y2 + hgt) continue;
    const same = kept.find((q) => Math.abs(q.x - p.x) < tol && Math.abs(q.y - p.y) < tol);
    if (same) { if (!same.kinds.includes(p.kind)) same.kinds.push(p.kind); }
    else if (kept.length < 80) kept.push({ x: p.x, y: p.y, kinds: [p.kind] });
  }
  return kept;
}

// Coordinates the school way: (x; y), whole numbers plain, else up to 3 decimals.
export const fmtNum = (v) => {
  const r = Math.round(v);
  const n = Math.abs(v - r) < 1e-7 ? r : +v.toFixed(3);
  return String(Object.is(n, -0) ? 0 : n);
};
export const fmtPoint = (p) => `(${fmtNum(p.x)}; ${fmtNum(p.y)})`;
