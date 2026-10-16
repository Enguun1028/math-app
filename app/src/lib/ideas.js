// Ideas for search: every map topic, plus extra, smaller ideas from content/concepts.json.
// Each idea knows where it comes from (from), what it leads to (next), its formulas, and, when written,
// a definition, an example, a proof and uses. Formula search compares the *shape* of what was typed.
import concepts from '../../content/concepts.json';
// Named formulas, theorems and rules (Виетийн теорем, Хероны томьёо…): smaller ideas that grow out of a map topic.
// Research 2026-10-16, draft until the owner or a teacher checks it.
import named from '../../content/ideas-named.json';
// Per map topic: why it is true (proof or derivation steps) and where it comes from (history). Draft, 2026-10-16.
import topicWhy from '../../content/topic-why.json';
// Textbook content (definition, formulas, worked examples), the same data the topic card shows.
import topicContent from '../../content/topic-content.json';
import topicContentExtra from '../../content/topic-content-extra.json';
import { topics, topicUnlocks, topicEntries, sphereOf } from './content.js';

const extra = { ...named, ...concepts };
// \frac{a}{b} in textbook formulas becomes (a)/(b) so formula search can compare its shape.
const plainFrac = (f) => f.replace(/\\frac\{([^{}]*)\}\{([^{}]*)\}/g, '($1)/($2)');

export const ideas = {};
for (const t of Object.values(topics)) {
  const e = extra[t.id] ?? {};
  const tc = topicContent[t.id] ?? topicContentExtra[t.id];
  const w = topicWhy[t.id] ?? {};
  ideas[t.id] = {
    id: t.id, name: t.name, en: t.en, topic: t.id, sphere: t.sphere, formula: t.formula,
    formulas: [t.formula, ...(e.formulas ?? []), ...(tc?.formulas ?? []).map(plainFrac)], from: t.req, def: e.def ?? tc?.def ?? t.text, short: t.text,
    shown: tc?.formulas ?? [], extraFormulas: e.formulas ?? [], rules: tc?.rules ?? [], src: tc?.src,
    aliases: e.aliases ?? [], example: e.example ?? tc?.examples?.[0], proof: e.proof ?? w.proof, proofTitle: w.proofTitle,
    history: w.history, uses: e.uses ?? w.uses, lessons: topicEntries[t.id] ?? [],
  };
}
for (const [id, e] of Object.entries(extra)) {
  if (id.startsWith('_') || topics[id]) continue;
  ideas[id] = {
    id, name: e.name, en: e.en, topic: null, sphere: e.sphere ?? sphereOf(e.from?.[0])?.id, formula: e.formula, formulas: [e.formula, ...(e.formulas ?? [])],
    from: e.from ?? [], def: e.def, short: e.def, shown: e.shown ?? [], rules: e.rules ?? [], src: e.src, draft: !!e.draft,
    aliases: e.aliases ?? [], example: e.example, proof: e.proof, proofTitle: e.proofTitle, history: e.history, uses: e.uses, lessons: [],
  };
}
// What each idea leads to: map unlocks plus extra ideas that name it in "from".
for (const i of Object.values(ideas)) i.next = [...(topicUnlocks[i.id] ?? [])];
for (const i of Object.values(ideas)) for (const f of i.from) if (ideas[f] && !ideas[f].next.includes(i.id)) ideas[f].next.push(i.id);
for (const i of Object.values(ideas)) if (!i.sphere && i.topic) i.sphere = sphereOf(i.topic)?.id;

// "Хаанаас ирсэн": the chain of first prerequisites back to a starting idea.
export function rootPath(id) {
  const path = [];
  const seen = new Set();
  for (let cur = id; cur && ideas[cur] && !seen.has(cur); cur = ideas[cur].from[0]) {
    seen.add(cur);
    path.unshift(cur);
  }
  return path;
}

// ---- formula shapes ----
// a²+b²=c², x^2 + y^2 = z^2 and c^2 = a^2 + b^2 all become the same shape: v^2+v^2=v^2.
const FUNCS = ['sqrt', 'sin', 'cos', 'tan', 'log', 'lim', 'ln'];
const SUP = { '²': '^2', '³': '^3', 'ⁿ': '^n', '¹': '^1', '⁰': '^0' };
const SUB = /[₀-₉]/g;

export function shape(raw) {
  let s = String(raw).toLowerCase()
    .replace(/[²³ⁿ¹⁰]/g, (c) => SUP[c]).replace(SUB, '')
    .replace(/[−–]/g, '-').replace(/[×·]/g, '*').replace(/÷/g, '/').replace(/√/g, 'sqrt').replace(/π/g, 'pi')
    .replace(/[°;,]/g, (c) => (c === ';' || c === ',' ? ';' : '')).replace(/\s+/g, '');
  FUNCS.forEach((f, i) => (s = s.split(f).join(`#${i}#`)));
  s = s.split('pi').join('#P#');
  s = s.replace(/[a-zα-ω]/g, 'v').replace(/\*/g, '');
  s = s.replace(/#(\d)#/g, (_, i) => FUNCS[i]).replace(/#P#/g, 'pi');
  // (s)/(t) from a textbook fraction and s/t typed by hand are the same shape.
  s = s.replace(/\(([v0-9]+)\)/g, '$1');
  return s.split('=').map((side) => terms(side).sort().join('+')).sort().join('=');
}

// Top-level terms of one side (a minus stays with its term).
function terms(side) {
  const out = [];
  let depth = 0, cur = '';
  for (const ch of side) {
    if (ch === '(') depth++;
    if (ch === ')') depth--;
    if ((ch === '+' || ch === '-') && depth === 0) {
      if (cur) out.push(cur);
      cur = ch === '-' ? '-' : '';
      continue;
    }
    cur += ch;
  }
  if (cur) out.push(cur);
  return out;
}

const lit = (f) => String(f).toLowerCase().replace(/\s+/g, '').replace(/²/g, '^2').replace(/³/g, '^3').replace(/[−–]/g, '-').replace(/[·×]/g, '*').replace(/\(([a-z0-9]+)\)/g, '$1');
const shapes = Object.values(ideas).map((i) => ({ id: i.id, list: i.formulas.filter(Boolean).map(shape) }));

// Ideas whose formula has the same shape as the typed one, best first.
// Exact shape = 100. A typed side that equals one side of a formula = 80 (a²+b²+c² → 3D distance).
// Otherwise, sharing most terms = up to 50, offered as "did you mean".
export function formulaMatches(raw) {
  if (!/[\^²³=√]|sqrt|[a-z]\s*[+*/-]|\d\s*[a-z]/i.test(raw)) return [];
  const q = shape(raw);
  if (q.length < 3) return [];
  const qSides = q.split('=');
  const qTerms = qSides.flatMap((x) => x.split('+'));
  const found = [];
  for (const { id, list } of shapes) {
    let best = 0;
    for (const f of list) {
      if (f === q) best = Math.max(best, 100);
      const fSides = f.split('=');
      if (qSides.length === 1 && fSides.includes(q)) best = Math.max(best, 80);
      if (qSides.length > 1 && qSides.every((x) => fSides.includes(x))) best = Math.max(best, 90);
      const fTerms = fSides.flatMap((x) => x.split('+'));
      const pool = [...fTerms];
      let common = 0;
      for (const t of qTerms) { const k = pool.indexOf(t); if (k >= 0) { common++; pool.splice(k, 1); } }
      const j = common / Math.max(qTerms.length, fTerms.length);
      if (j >= 0.6) best = Math.max(best, Math.round(50 * j));
    }
    // Same shape, same letters too (y = kx + b over ax + b = c): a small bonus breaks the tie.
    if (best && ideas[id].formulas.some((f) => f && lit(f) === lit(raw))) best += 5;
    // A named formula (Нийлбэрийн квадрат) beats the topic that only lists it.
    if (best && !ideas[id].topic) best += 1;
    if (best) found.push({ id, score: best });
  }
  return found.sort((a, b) => b.score - a.score).slice(0, 4);
}

// Where an idea sits in the curriculum (owner, 2026-10-16: tell the student plainly which grade it is).
// A map topic is its own place; a named formula sits in the first map topic it grows out of.
// grade: first grade 5–12 that teaches it, or 'base' for the grade 1–4 basics.
export function placeOf(id) {
  let tid = ideas[id]?.topic;
  for (let cur = id, seen = new Set(); !tid && cur && ideas[cur] && !seen.has(cur); cur = ideas[cur].from[0]) { seen.add(cur); tid = ideas[cur].topic; }
  const t = topics[tid];
  if (!t) return null;
  return { topic: t.id, own: t.id === id, grades: t.grades, grade: t.grades[0] ?? 'base', strand: t.strand };
}
export const gradeLabel = (p) => (!p ? '' : p.grade === 'base' ? 'Суурь, 1–4-р анги' : p.grade + '-р анги');
