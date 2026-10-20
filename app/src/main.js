import { mount } from 'svelte';
import './lib/track.svelte.js';
import './lib/perf.js';
import './app.css';
import App from './App.svelte';

mount(App, { target: document.getElementById('app') });

// The loading screen stays at least a moment, so it reads as a greeting rather than a flicker, then fades away.
const splash = document.getElementById('splash');
if (splash) {
  // Counted from when the loading screen was first drawn, not from when the page was requested,
  // so a slow connection never skips it.
  const shownFor = performance.now() - (window.__splashAt ?? performance.now());
  const wait = Math.max(0, 1200 - shownFor);
  setTimeout(() => {
    splash.classList.add('out');
    setTimeout(() => splash.remove(), 500);
  }, wait);
}

// Keep the app on the phone for fast return visits and offline use (scripts/make-sw.mjs). Registered after the
// page has loaded, so it never competes with the first screen.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  addEventListener('load', () => setTimeout(() => navigator.serviceWorker.register('/sw.js').catch(() => {}), 3000));
}

// iOS Safari ignores user-scalable=no; cancel its pinch gesture directly.
for (const t of ['gesturestart', 'gesturechange']) document.addEventListener(t, (e) => e.preventDefault(), { passive: false });
