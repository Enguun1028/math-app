import { mount } from 'svelte';
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

// iOS Safari ignores user-scalable=no; cancel its pinch gesture directly.
for (const t of ['gesturestart', 'gesturechange']) document.addEventListener(t, (e) => e.preventDefault(), { passive: false });
