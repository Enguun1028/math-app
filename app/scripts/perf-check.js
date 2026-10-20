// Smoothness check for the main screens (owner, 2026-10-21: "optimize everywhere ... poor phones"). Not part of the build.
// Paste into the console of the running app (or Claude runs it through Chrome). It drives the app itself and
// returns, per scenario: frames drawn, average and worst frame time, frames over 50 ms, and main-thread blocking
// from long animation frames. Compare runs before and after a change on the same computer.
// Add ?lite to the run by calling it with { lite: true } to measure the lite look.
(async ({ lite = false } = {}) => {
  const wait = (t) => new Promise((r) => setTimeout(r, t));
  const root = document.documentElement;
  if (lite) root.classList.add('lite');

  // Frames and long animation frames over `t` ms while `act` runs.
  async function measure(name, t, act = async () => {}) {
    const frames = [], loaf = [];
    const obs = 'PerformanceObserver' in window && PerformanceObserver.supportedEntryTypes?.includes('long-animation-frame')
      ? new PerformanceObserver((l) => l.getEntries().forEach((e) => loaf.push(e.blockingDuration))) : null;
    obs?.observe({ type: 'long-animation-frame' });
    let last = performance.now(), on = true;
    const tick = (now) => { frames.push(now - last); last = now; if (on) requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
    const start = performance.now();
    await act();
    await wait(Math.max(0, t - (performance.now() - start)));
    on = false;
    obs?.disconnect();
    const f = frames.slice(1).sort((a, b) => a - b);
    const avg = f.reduce((a, b) => a + b, 0) / (f.length || 1);
    return `${name}: ${f.length} frames/${t / 1000}s, avg ${avg.toFixed(1)} ms, p95 ${Math.round(f[Math.floor(f.length * 0.95)] ?? 0)} ms, worst ${Math.round(f.at(-1) ?? 0)} ms, over50 ${f.filter((x) => x > 50).length}, blocking ${Math.round(loaf.reduce((a, b) => a + b, 0))} ms`;
  }
  const go = async (hash) => { location.hash = hash; await wait(1500); };
  const out = [];

  await go('/'); await wait(1000);
  out.push(await measure('home map idle', 3000));
  out.push(await measure('home map scroll', 2000, async () => {
    const sc = document.querySelector('.map') ?? document.scrollingElement;
    for (let i = 0; i < 20; i++) { sc.scrollBy(0, 40); window.scrollBy(0, 40); await wait(50); }
  }));

  // A grade map opens the way a student opens it: a tap on its sphere (a bare address change from the map skips
  // the zoom that reveals it).
  document.querySelectorAll('.sphere')[3]?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  await wait(2500);
  if (!document.querySelector('.pan')) return 'grade map did not open: ' + location.hash;
  out.push(await measure('grade map idle', 3000));
  out.push(await measure('grade map pan', 2000, async () => {
    const pan = document.querySelector('.pan');
    const r = pan.getBoundingClientRect();
    const at = (type, x, y) => pan.dispatchEvent(new PointerEvent(type, { bubbles: true, pointerId: 1, pointerType: 'touch', isPrimary: true, clientX: x, clientY: y }));
    let x = r.left + r.width / 2, y = r.top + r.height / 2;
    at('pointerdown', x, y);
    for (let i = 0; i < 40; i++) { x -= 4; y -= 2; at('pointermove', x, y); await wait(16); }
    at('pointerup', x, y);
  }));
  out.push(await measure('open topic card', 1500, async () => {
    const node = document.querySelectorAll('.node')[Math.floor(document.querySelectorAll('.node').length / 2)];
    node?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  }));
  history.back(); await wait(1200);

  await go('/search');
  out.push(await measure('search typing', 2000, async () => {
    const input = document.querySelector('.search-page input');
    for (const s of ['т', 'тр', 'три', 'трия', 'триян']) { input.value = s; input.dispatchEvent(new Event('input', { bubbles: true })); await wait(120); }
  }));

  out.push(await measure('open graph tool', 2500, async () => { location.hash = '/t'; }));
  await go('/');
  if (lite) root.classList.remove('lite');
  return out.join('\n');
})();
