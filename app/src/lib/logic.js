// Learning logic (Section 3). Thresholds are first guesses, to be set in the spec.
import { entries, spheres, sphereById, topics, topicEntries } from './content.js';
import { progress, save } from './progress.svelte.js';

export const PASS = 0.65; // "Мэднэ" at roughly 60-70%
export const ENTRY_PASS = 2 / 3; // mini test: 2 of 3 correct
const FADE_DAYS = 30;

const order = spheres.flatMap((s) => s.topics);

export const isKnown = (id) => !!progress.known[id];

export function topicKnown(id) {
  if (progress.topics?.[id]) return true;
  if ((progress.sphereTests[topics[id].sphere] ?? 0) >= PASS) return true;
  const es = topicEntries[id];
  return es.length > 0 && es.every(isKnown);
}

export const topicReady = (id) => topics[id].req.every(topicKnown);

// What the student wants. Picked first; then a short check finds their level.
export const GOALS = [
  { id: 'test', name: 'Шалгалтаа давах', hint: 'Удахгүй болох шалгалтдаа бэлдэнэ' },
  { id: 'ahih', name: 'Ахих', hint: 'Хоцорсноо нөхөж, сууриа бэхжүүлнэ' },
  { id: 'eesh', name: 'ЭЕШ-д бэлдэх', hint: 'Бүх сэдвийг ЭЕШ-ийн түвшинд давтана' },
];

// A sphere and every sphere it needs, in journey order.
export function leadsTo(ids) {
  const need = new Set();
  const add = (id) => { if (need.has(id)) return; need.add(id); sphereById[id].needs.forEach(add); };
  ids.forEach(add);
  return spheres.filter((s) => need.has(s.id));
}

// Which spheres the level check covers. For a coming test: the test's topic if the student knows it,
// otherwise everything taught up to their grade. No AI needed: the topic is matched by search, the grade by a table.
export function checkSpheres() {
  let list = spheres;
  if (progress.goal === 'test') {
    if (progress.examTopic && topics[progress.examTopic]) list = leadsTo([topics[progress.examTopic].sphere]);
    else if (progress.grade) list = leadsTo(spheres.filter((s) => s.grades[0] <= progress.grade).map((s) => s.id));
  }
  return list.filter((s) => s.entries.length);
}
// Sections of the check not finished yet: the check picks up where the student stopped.
export const checkLeft = () => checkSpheres().filter((s) => !progress.checkDone?.[s.id]);

// The level is known once any check or test has been done, or the student has marked something as known.
export const levelChecked = () =>
  !!progress.levelChecked || Object.keys(progress.checkDone ?? {}).length > 0 || Object.keys(progress.sphereTests).length > 0 || Object.keys(progress.known).length > 0 || Object.keys(progress.topics ?? {}).length > 0;

// The one clear next step: the first topic in journey order that is ready but not yet known.
// No next step before the level is known: guessing where a student should start helps nobody.
export function nextTopic() {
  if (!levelChecked()) return null;
  return order.find((id) => !topicKnown(id) && topicReady(id)) || null;
}

const faded = (id) => {
  const seen = progress.seen[id];
  return seen && Date.now() - seen > FADE_DAYS * 864e5;
};

export function topicState(id) {
  if (topicKnown(id)) return faded(id) ? 'faded' : 'known';
  if (nextTopic() === id) return 'next';
  return topicReady(id) ? 'ready' : 'later';
}

export function sphereKnown(s) {
  return s.topics.every(topicKnown) || (progress.sphereTests[s.id] ?? 0) >= PASS;
}

export function sphereState(s) {
  if (sphereKnown(s)) return faded(s.id) ? 'faded' : 'known';
  if (s.topics.includes(nextTopic())) return 'next';
  return s.needs.every((n) => sphereKnown(sphereById[n])) ? 'ready' : 'later';
}

export function entryState(id) {
  if (isKnown(id)) return 'known';
  return entries[id].prereq.every(isKnown) ? 'next' : 'later';
}

// Share of prerequisite topics from other spheres the student already knows.
export function readiness(s) {
  const outside = new Set();
  for (const id of s.topics) for (const r of topics[id].req) if (topics[r].sphere !== s.id) outside.add(r);
  if (!outside.size) return 1;
  return [...outside].filter(topicKnown).length / outside.size;
}

export function markTopic(id, on = true) {
  progress.topics ??= {};
  if (on) progress.topics[id] = true;
  else delete progress.topics[id];
  save();
}

// Questions for a whole-sphere test: `per` questions from each entry, tagged with their entry.
export function sphereQuestions(s, per = 1) {
  return s.entries.flatMap((id) => entries[id].test.slice(0, per).map((q) => ({ ...q, entry: id })));
}

// Save a sphere test: best score kept, entries answered fully right become known.
export function applySphereTest(s, questions, results) {
  const score = results.filter(Boolean).length / results.length;
  progress.sphereTests[s.id] = Math.max(progress.sphereTests[s.id] ?? 0, score);
  progress.levelChecked = true;
  progress.checkDone ??= {};
  progress.checkDone[s.id] = true;
  const byEntry = {};
  questions.forEach((q, i) => (byEntry[q.entry] = (byEntry[q.entry] ?? true) && results[i]));
  for (const [id, ok] of Object.entries(byEntry)) if (ok) progress.known[id] = true;
  save();
  return score;
}
