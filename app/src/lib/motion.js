// Shared motion settings: one feel for every transition, and none for people who turned motion off.
// Curves follow Emil Kowalski's design-engineering rules (owner, 2026-10-16): strong custom ease-out for things
// entering or leaving, an iOS-like curve for things that travel across the screen, exits faster than entries.

export const reduced = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
export const ms = (n) => (reduced ? 0 : n);

// cubic-bezier(x1, y1, x2, y2) as an easing function, so Svelte transitions use exactly the CSS curves.
function bezier(x1, y1, x2, y2) {
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
export const ease = bezier(0.23, 1, 0.32, 1); // enter / leave
export const easeMove = bezier(0.32, 0.72, 0, 1); // travel on screen (dots flying in and out of a sphere)

// Bottom sheets slide up; the dark layer behind them fades.
export const sheetIn = { y: 60, duration: ms(280), easing: ease, opacity: 0 };
export const sheetOut = { y: 60, duration: ms(180), easing: ease, opacity: 0 };
export const scrimFade = { duration: ms(200) };
