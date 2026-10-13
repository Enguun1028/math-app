// Learning logic (Section 3). Thresholds are first guesses, to be set in the spec.
import { entries, spheres, sphereById, topics, topicEntries } from './content.js';
import { progress, save } from './progress.svelte.js';
import levelTest from '../../content/level-test.json';

export const PASS = 0.65; // "Мэднэ" at roughly 60-70%
export const ENTRY_PASS = 2 / 3; // mini test: 2 of 3 correct
const FADE_DAYS = 30;

// Journey order: grade by grade, the concepts new that year (grade 1–4 basics are read-only, never a step).
const order = spheres.flatMap((s) => s.fresh).filter((id) => !topics[id].base);

export const isKnown = (id) => !!progress.known[id];

export function topicKnown(id) {
  if (progress.topics?.[id]) return true;
  if ((progress.sphereTests[topics[id].sphere] ?? 0) >= PASS) return true;
  const es = topicEntries[id];
  return es.length > 0 && es.every(isKnown);
}

// Grade 1–4 basics never block a step: they are read-only entries the student opens when they feel a gap.
export const topicReady = (id) => topics[id].req.every((r) => topics[r].base || topicKnown(r));

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
    if (progress.examTopic && topics[progress.examTopic]?.sphere) list = leadsTo([topics[progress.examTopic].sphere]);
    else if (progress.grade) list = leadsTo(spheres.filter((s) => s.grade <= Math.max(5, progress.grade)).map((s) => s.id));
  }
  return list.filter((s) => s.entries.length);
}
// The level test is short and runs in one go, so there is nothing left to resume.
export const checkLeft = () => [];

// ---- level test across grades (owner, 2026-10-13: "locates the student's level up to 12 classes") ----
// 4 questions per grade (grade 4 = the grade 1–4 basics). It starts at the student's grade and moves one grade
// up after a pass (3 of 4) or one grade down after a miss, until it finds the edge: the highest grade passed
// with the next one missed. Questions are drafts (content/level-test.json).
export const LEVEL_MIN = 4;
export const LEVEL_MAX = 12;
export const LEVEL_PASS = 3;
export const levelQuestions = (g) => levelTest.grades[g].map((q) => ({ ...q }));
export const startGrade = () => Math.min(LEVEL_MAX, Math.max(5, progress.grade || 7));

// Next grade to test, or null when the level is found. passed/missed: Sets of grades.
export function nextLevelGrade(g, ok, passed, missed) {
  if (ok) return g >= LEVEL_MAX || missed.has(g + 1) ? null : g + 1;
  return g <= LEVEL_MIN || passed.has(g - 1) ? null : g - 1;
}

// Save the level: every concept first taught up to that grade is marked known (grade 1–4 basics from level 4),
// except concepts whose question was missed. Known topics light up; the rest stay dark as likely gaps.
export function applyLevel(level, missedConcepts) {
  progress.level = level;
  progress.levelChecked = true;
  progress.topics ??= {};
  for (const t of Object.values(topics)) {
    if (missedConcepts.has(t.id)) continue;
    const first = t.base ? 4 : t.grades[0];
    if (first <= level) progress.topics[t.id] = true;
  }
  save();
}

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
  if (s.fresh.includes(nextTopic())) return 'next';
  return s.needs.every((n) => sphereKnown(sphereById[n])) ? 'ready' : 'later';
}

export function entryState(id) {
  if (isKnown(id)) return 'known';
  return entries[id].prereq.every(isKnown) ? 'next' : 'later';
}

// Share of prerequisite topics from other spheres the student already knows.
export function readiness(s) {
  const outside = new Set();
  for (const id of s.fresh) for (const r of topics[id].req) if (!topics[r].base && !s.topics.includes(r)) outside.add(r);
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
