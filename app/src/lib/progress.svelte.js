// Progress lives only on this device (Phase 1: no accounts).
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
