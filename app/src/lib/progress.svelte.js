// Progress lives only on this device (Phase 1: no accounts).
import { oldTopics } from '../../content/map.json';
const KEY = 'ayalal.progress.v1';

function load() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || {};
  } catch {
    return {};
  }
}

// known: entryId -> true, sphereTests: sphereId -> best score 0..1, seen: id -> timestamp
export const progress = $state({ known: {}, topics: {}, sphereTests: {}, seen: {}, goal: null, goalPicked: false, ...load() });

// Map v2 (2026-10-13): topics became concepts of the new map and spheres became grades.
// "Мэднэ" marks move to the matching concept; sphere test scores belonged to the old spheres, so they go.
if ((progress.map ?? 1) < 2) {
  progress.topics = Object.fromEntries(Object.keys(progress.topics ?? {}).filter((id) => oldTopics[id]).map((id) => [oldTopics[id], true]));
  progress.sphereTests = {};
  progress.checkDone = {};
  if (progress.examTopic) progress.examTopic = oldTopics[progress.examTopic] ?? null;
  progress.map = 2;
  save();
}

export function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(progress));
  } catch {
    // Private mode or blocked storage: the app still works for this visit.
  }
}

export function markKnown(id) {
  progress.known[id] = true;
  save();
}

export function touch(id) {
  progress.seen[id] = Date.now();
  save();
}

export function resetProgress() {
  progress.known = {};
  progress.topics = {};
  progress.sphereTests = {};
  progress.seen = {};
  progress.levelChecked = false;
  save();
}

// Days the app was opened (local dates, last 60 kept). Used for a kind weekly count, never a breakable streak.
const today = () => new Date().toLocaleDateString('sv'); // YYYY-MM-DD

// Records today's visit; returns how many days have passed since the previous visit (0 if none or same day).
export function recordVisit() {
  const days = progress.days ?? [];
  const t = today();
  const prev = days.filter((d) => d !== t).at(-1);
  if (days.at(-1) !== t) {
    progress.days = [...days, t].slice(-60);
    save();
  }
  return prev ? Math.round((new Date(t) - new Date(prev)) / 864e5) : 0;
}

// Days opened this week (Monday to today).
export function daysThisWeek() {
  const now = new Date();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  const from = monday.toLocaleDateString('sv');
  return (progress.days ?? []).filter((d) => d >= from).length;
}
