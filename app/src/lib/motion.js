// Shared motion settings: one feel for every transition, and none for people who turned motion off.
// Curves follow Emil Kowalski's design-engineering rules (owner, 2026-10-16): strong custom ease-out for things
// entering or leaving, an iOS-like curve for things that travel across the screen, exits faster than entries.

export const reduced = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
export const ms = (n) => (reduced ? 0 : n);

// cubic-bezier(x1, y1, x2, y2) as an easing function, so Svelte transitions use exactly the CSS curves.
export function cubicBezier(x1, y1, x2, y2) {
  const A = (a, b) => 1 - 3 * b + 3 * a, B = (a, b) => 3 * b - 6 * a, C = (a) => 3 * a;
  const at = (t, a, b) => ((A(a, b) * t + B(a, b)) * t + C(a)) * t;
  const slope = (t, a, b) => 3 * A(a, b) * t * t + 2 * B(a, b) * t + C(a);
  return (x) => {
    if (x <= 0 || x >= 1) return x;
    let t = x;
    for (let i = 0; i < 8; i++) {
      const s = slope(t, x1, x2);
      if (Math.abs(s) < 1e-6) break;
      t -= (at(t, x1, x2) - x) / s;
    }
    return at(Math.min(1, Math.max(0, t)), y1, y2);
  };
}

export const CURVE_OUT = 'cubic-bezier(0.23, 1, 0.32, 1)';
export const CURVE_MOVE = 'cubic-bezier(0.32, 0.72, 0, 1)';
export const ease = cubicBezier(0.23, 1, 0.32, 1); // enter / leave
export const easeMove = cubicBezier(0.32, 0.72, 0, 1); // travel on screen (dots flying in and out of a sphere)

// Bottom sheets slide up; the dark layer behind them fades.
export const sheetIn = { y: 60, duration: ms(280), easing: ease, opacity: 0 };
export const sheetOut = { y: 60, duration: ms(180), easing: ease, opacity: 0 };
export const scrimFade = { duration: ms(200) };

// Scrolling while a page, zoom or card animation runs made layers lag and overlap (owner, 2026-10-16).
// lockInput(n) ignores wheel and touch scrolling for n ms and stops running scroll momentum (html.moving);
// taps still work. Calls that overlap extend the lock.
let lockUntil = 0;
let lockTimer = 0;
// The blocking listeners exist only while a lock runs: a non-passive listener on the window makes every scroll on
// the page wait for JavaScript first, which felt sticky on slow phones.
const stop = (ev) => { if (performance.now() < lockUntil) ev.preventDefault(); };
const listen = (on) => {
  for (const t of ['wheel', 'touchmove']) (on ? addEventListener : removeEventListener)(t, stop, { passive: false });
};
export function lockInput(n) {
  if (!n || reduced) return;
  if (performance.now() >= lockUntil) listen(true);
  lockUntil = Math.max(lockUntil, performance.now() + n);
  document.documentElement.classList.add('moving');
  clearTimeout(lockTimer);
  lockTimer = setTimeout(() => {
    document.documentElement.classList.remove('moving');
    listen(false);
  }, lockUntil - performance.now());
}

// A sheet too short to scroll swallows drags, so they never move the page behind it (owner, 2026-10-12).
// The listener sits on the sheet only, so scrolling anywhere else is not held up.
export function noBleed(node) {
  const f = (ev) => { if (node.scrollHeight <= node.clientHeight + 1) ev.preventDefault(); };
  node.addEventListener('touchmove', f, { passive: false });
  return { destroy: () => node.removeEventListener('touchmove', f) };
}
