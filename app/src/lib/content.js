// Loads the content files and derives the links between them.
import sphereList from '../../content/spheres.json';
import topicList from '../../content/topics.json';
import strandData from '../../content/strands.json';

export const strands = strandData;
export const topics = Object.fromEntries(topicList.map((t) => [t.id, t]));

// What each topic unlocks.
export const topicUnlocks = Object.fromEntries(topicList.map((t) => [t.id, []]));
for (const t of topicList) for (const r of t.req) topicUnlocks[r]?.push(t.id);

const files = import.meta.glob('../../content/entries/*.json', { eager: true, import: 'default' });

export const entries = {};
for (const e of Object.values(files)) entries[e.id] = e;

// [[id]] or [[id|label]] inside any text field links to another entry.
export const LINK_RE = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;

// What each entry unlocks = every entry that lists it as a prerequisite.
export const unlocks = {};
for (const id in entries) unlocks[id] = [];
for (const e of Object.values(entries)) {
  for (const p of e.prereq) if (unlocks[p]) unlocks[p].push(e.id);
}

// Depth in the prerequisite chain, used to order entries inside a sphere.
const depthCache = {};
function depth(id, seen = new Set()) {
  if (depthCache[id] != null) return depthCache[id];
  if (seen.has(id) || !entries[id]) return 0;
  seen.add(id);
  const d = Math.max(0, ...entries[id].prereq.map((p) => depth(p, seen) + 1));
  return (depthCache[id] = d);
}

export const spheres = sphereList.map((s, i) => ({
  ...s,
  index: i,
  entries: Object.values(entries)
    .filter((e) => e.sphere === s.id)
    .sort((a, b) => depth(a.id) - depth(b.id) || a.title.localeCompare(b.title, 'mn'))
    .map((e) => e.id),
}));

// Dictionary entries that belong to each topic, in learning order.
export const topicEntries = Object.fromEntries(topicList.map((t) => [t.id, []]));
for (const s of spheres) for (const id of s.entries) if (entries[id].topic) topicEntries[entries[id].topic]?.push(id);

export const sphereOf = (topicId) => spheres.find((s) => s.topics.includes(topicId));

export const sphereById = Object.fromEntries(spheres.map((s) => [s.id, s]));

// Every text field of an entry, for term extraction and search.
export function textsOf(e) {
  return [e.definition, e.example?.worked, e.example?.life, ...(e.mistakes || []).map((m) => m.text)].filter(Boolean);
}

// Terms used inside an entry's explanation (Section 2 decision).
export function termsIn(e) {
  const ids = new Set();
  for (const t of textsOf(e)) for (const m of t.matchAll(LINK_RE)) if (entries[m[1]] && m[1] !== e.id) ids.add(m[1]);
  for (const p of e.prereq) ids.add(p);
  return [...ids];
}

export function stripLinks(text) {
  return text.replace(LINK_RE, (_, id, label) => label || entries[id]?.title || id);
}
