// Smooth on weak phones (owner, 2026-10-21: "optimize everywhere in the app to run it smooth on poor phones").
// Lite mode (html.lite, styled in app.css) drops the map's drifting, floating, glows and blur; the content is the same.
// It turns on at start for a phone that looks weak, or later when the lag guard sees the phone struggling.
// Lag guard (owner's idea): when frames get slow, switch to lite and stop the session recording, so the phone
// gets smooth again; the visit is still tracked as events. A phone that lagged starts in lite for the next 14 days.
// Testing: ?lite=1 or ?lite=0 in the address forces it either way.
import { reduced } from './motion.js';
import { track } from './track.svelte.js';

const KEY = 'mm-lite';
const root = document.documentElement;
const nav = navigator;
const forced = new URLSearchParams(location.search).get('lite');
let remembered = false;
try { remembered = Date.now() - Number(localStorage.getItem(KEY) || 0) < 14 * 864e5; } catch {}

// Cheap Android phones report 2 GB or less of memory, or 4 or fewer cores; Safari reports neither, so iPhones
// are left to the lag guard.
const weak = reduced || remembered || (nav.deviceMemory ?? 8) <= 2 || (nav.hardwareConcurrency ?? 8) <= 4 || !!nav.connection?.saveData;
export const lite = { on: forced ? forced === '1' : weak, why: forced ? 'forced' : weak ? (remembered ? 'remembered' : 'device') : null };
root.classList.toggle('lite', lite.on);

function goLite(why, stats) {
  if (lite.on) return;
  lite.on = true;
  lite.why = why;
  root.classList.add('lite');
  try { localStorage.setItem(KEY, String(Date.now())); } catch {}
  window.posthog?.stopSessionRecording?.();
  track('lag_detected', stats);
}

// Watch frame times in 5 s windows, from 3 s after start (loading is expected to be busy), only while visible.
// Lag: 3 or more frames over 100 ms, or an average frame over 40 ms, in one window.
if (!lite.on && forced !== '0') {
  const loaf = typeof PerformanceObserver !== 'undefined' && PerformanceObserver.supportedEntryTypes?.includes('long-animation-frame');
  let slow = 0, worst = 0, sum = 0, n = 0, last = 0, windowStart = 0;
  const check = (now) => {
    if (now - windowStart < 5000) return;
    const avg = n ? sum / n : 0;
    if (slow >= 3 || (n > 30 && avg > 40)) goLite('lag', { worst_frame: Math.round(worst), avg_frame: Math.round(avg), slow_frames: slow, page: location.hash || '#/' });
    slow = worst = sum = n = 0;
    windowStart = now;
  };
  const frame = (dur, now) => {
    if (document.hidden || lite.on) return;
    if (dur > 100) slow++;
    worst = Math.max(worst, dur);
    sum += dur; n++;
    check(now);
  };
  setTimeout(() => {
    windowStart = performance.now();
    if (loaf) {
      // Chrome: the browser reports each long frame itself, so nothing runs per frame.
      const obs = new PerformanceObserver((l) => {
        for (const e of l.getEntries()) frame(e.duration, e.startTime + e.duration);
        if (lite.on) obs.disconnect();
      });
      obs.observe({ type: 'long-animation-frame' });
      // Long frames alone never fill the average, so the window also closes on a timer.
      const tm = setInterval(() => { check(performance.now()); if (lite.on) clearInterval(tm); }, 5000);
    } else {
      // Safari: time the gaps between frames; a gap after the tab was hidden does not count.
      const tick = (now) => {
        if (last && !document.hidden) frame(now - last, now);
        last = document.hidden ? 0 : now;
        if (!lite.on) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }
  }, 3000);
}
