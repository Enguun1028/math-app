// Pages that are not on the first screen live in their own files (2026-10-21: the app was one 1.15 MB page, so a
// phone parsed every page and all content before showing the map). Each loads the first time it is needed, and all
// of them load quietly once the phone is idle after start, so a tap later still opens at once.
const idle = globalThis.requestIdleCallback ?? ((f) => setTimeout(f, 1500));

// lazy(() => import('./X.svelte')) -> a function that loads it once and returns the same promise every time.
// After a new version is deployed, a page that was already open asks for its old file names, which no longer
// exist. Reload once (at most every 10 s) to pick up the new version instead of showing nothing.
function stale() {
  try {
    const last = Number(sessionStorage.getItem('mm-reload') || 0);
    if (Date.now() - last < 10000) return;
    sessionStorage.setItem('mm-reload', String(Date.now()));
  } catch {}
  location.reload();
}

// get.done resolves when it has loaded, whoever asked for it (a page, a tap, or the idle preload).
export function lazy(loader) {
  let p = null, resolve;
  const done = new Promise((r) => (resolve = r));
  const get = () => (p ??= loader().then((m) => (resolve(m), m), (e) => { p = null; stale(); throw e; }));
  get.done = done;
  return get;
}

// Loads each in turn when the phone has nothing else to do, so it never competes with the first screen.
export function preloadWhenIdle(list) {
  const next = () => {
    const get = list.shift();
    if (get) idle(() => get().then(next, next), { timeout: 4000 });
  };
  setTimeout(next, 1200);
}
