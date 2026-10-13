// Loads the content files and derives the links between them.
// The knowledge map (concepts, links, strands) comes from content/map.json, which is generated from
// research/concept-map/draft-v1.js. A "topic" in the code is one concept of that map.
import map from '../../content/map.json';

export const strands = map.strands;
export const branches = map.branches;
export const oldTopicIds = map.oldTopics;

// Grades taught in the app (owner, 2026-10-13: users are grade 5–6 and up; grade 1–4 basics are read-only entries).
export const GRADES = [5, 6, 7, 8, 9, 10, 11, 12];
export const gradeColor = (g) => map.gradeColors[g - 5];
const sphereId = (g) => 'g' + g;

// Grades 5–12 in which a concept is taught: one of its curriculum codes starts with that grade.
const gradesOf = (c) => [...new Set(c.codes.map((k) => +k.split('.')[0]))].filter((g) => g >= 5).sort((a, b) => a - b);

export const topics = {};
for (const c of map.concepts) {
  const grades = c.mode === 'core' ? gradesOf(c) : [];
  topics[c.id] = {
    ...c,
    grades,
    base: c.mode === 'base',
    // Home sphere: the first grade 5–12 that teaches the concept (base concepts have none).
    sphere: grades.length ? sphereId(grades[0]) : null,
    req: [],
    with: [],
    text: c.text ?? '',
    formula: c.formula ?? '',
  };
}

// Every link with its reason. "req" = prerequisites; "with" = the other kinds of links.
export const links = map.edges;
export const topicUnlocks = Object.fromEntries(Object.keys(topics).map((id) => [id, []]));
for (const e of map.edges) {
  if (e.type === 'prerequisite') {
    topics[e.to].req.push(e.from);
    topicUnlocks[e.from].push(e.to);
  } else {
    topics[e.from].with.push(e.to);
    topics[e.to].with.push(e.from);
  }
}
export const whyOf = (from, to) => map.edges.find((e) => e.from === from && e.to === to)?.why ?? '';

const files = import.meta.glob('../../content/entries/*.json', { eager: true, import: 'default' });

export const entries = {};
for (const e of Object.values(files)) entries[e.id] = { ...e, sphere: topics[e.topic]?.sphere ?? sphereId(5) };

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

// One sphere per grade on the journey path (owner, 2026-10-13: path points are grades, not topics).
// A sphere holds every concept taught that year: new ones and ones coming back at a deeper level.
export const spheres = GRADES.map((g, i) => {
  const list = Object.values(topics).filter((t) => t.grades.includes(g));
  return {
    id: sphereId(g),
    grade: g,
    index: i,
    title: `${g}-р анги`,
    color: gradeColor(g),
    needs: i ? [sphereId(g - 1)] : [],
    topics: list.map((t) => t.id),
    fresh: list.filter((t) => t.grades[0] === g).map((t) => t.id),
    entries: Object.values(entries)
      .filter((e) => e.sphere === sphereId(g))
      .sort((a, b) => depth(a.id) - depth(b.id) || a.title.localeCompare(b.title, 'mn'))
      .map((e) => e.id),
  };
});

export const sphereById = Object.fromEntries(spheres.map((s) => [s.id, s]));

// Is the concept new in this grade, or coming back to be studied deeper?
export const isFresh = (topicId, sphere) => sphereById[sphere]?.fresh.includes(topicId);

// Dictionary entries that belong to each topic, in learning order.
export const topicEntries = Object.fromEntries(Object.keys(topics).map((id) => [id, []]));
for (const e of Object.values(entries).sort((a, b) => depth(a.id) - depth(b.id))) topicEntries[e.topic]?.push(e.id);

export const sphereOf = (topicId) => sphereById[topics[topicId]?.sphere];

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
