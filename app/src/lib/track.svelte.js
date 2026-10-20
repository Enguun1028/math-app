// Visitor tracking with PostHog (owner, 2026-10-20: "track the visitors and their actions as much as possible").
// Every visitor is anonymous: a random id kept on the phone, no names or accounts.
// Recorded: every page (the hash router has no page loads), every tap (autocapture), session replays with
// typed text masked, errors, and the learning events below, named so they read well in PostHog.
// Only the production build sends anything; in `npm run dev` events are printed to the console instead.
import { route } from './router.svelte.js';
import { ui } from './ui.svelte.js';
import { progress } from './progress.svelte.js';

const KEY = import.meta.env.VITE_POSTHOG_KEY;
const live = import.meta.env.PROD && !!KEY;

// PostHog's own loader, the readable form of its HTML snippet: nothing is bundled into the app.
// Until array.js arrives (after the first paint), calls wait in a queue that it replays on load;
// it then replaces window.posthog with the real client. Scripts and events go through /rx on the app's own
// address (functions/rx), so ad blockers do not stop them and the CSP needs no outside host.
if (live) {
  const q = (window.posthog = []);
  q.__SV = 1;
  q._i = [[KEY, {
    api_host: location.origin + '/rx',
    ui_host: 'https://eu.posthog.com',
    person_profiles: 'always', // anonymous visitors get profiles too, so returning visitors and retention show up
    capture_pageview: false, // sent on every hash change below
    capture_pageleave: true,
    autocapture: true,
    capture_exceptions: true,
    session_recording: { maskAllInputs: true },
  }]];
  for (const m of ['capture', 'setPersonProperties', 'register']) q[m] = (...args) => q.push([m, ...args]);
  const s = document.createElement('script');
  s.async = true;
  s.crossOrigin = 'anonymous';
  s.src = '/rx/static/array.js';
  document.head.append(s);
}

// Facts about the student sent with every event, so any chart can be split by grade, goal or level.
function context() {
  return {
    grade: progress.grade ?? null,
    goal: progress.goalPicked ? progress.goal : null,
    level_checked: !!progress.levelChecked,
    known_topics: Object.keys(progress.topics ?? {}).length,
    installed: matchMedia('(display-mode: standalone)').matches,
    // Device class, so tap speed can be compared between weak and strong phones (lite: see perf.js).
    lite: document.documentElement.classList.contains('lite'),
    cores: navigator.hardwareConcurrency ?? null,
    memory: navigator.deviceMemory ?? null,
  };
}

export function track(event, props = {}) {
  const all = { ...context(), ...props };
  if (live) window.posthog.capture(event, all);
  else if (import.meta.env.DEV) console.debug('[track]', event, all);
}

// Stored on the visitor's profile (latest value wins), e.g. the level the check found.
export function setVisitor(props) {
  if (live) window.posthog.setPersonProperties(props);
  else if (import.meta.env.DEV) console.debug('[track] visitor', props);
}

// Pages: one $pageview per route, e.g. /e/<entry>, /s/g7, /search.
function pageview() {
  const [page = 'map', id = null] = route.parts;
  track('$pageview', { $current_url: location.href, page, page_id: id });
}
pageview();
addEventListener('hashchange', pageview);

// Sheets and tools open without a route change, so they are watched here.
$effect.root(() => {
  $effect(() => { if (ui.topic) track('topic_opened', { topic: ui.topic }); });
  $effect(() => { if (ui.level) track('level_sheet_opened'); });
  $effect(() => { if (route.parts[0] === 't' || route.parts[0] === 'tools') track('tool_opened', { tool: ui.tool }); });
});
