// Search that forgives Latin spelling, typos and whole questions.
import { entries, topics, stripLinks } from './content.js';
import { ideas } from './ideas.js';
// Extra search words per topic: Latin spellings, typos, English and Russian names (research fan-out, draft).
import extraAliases from '../../content/search-aliases.json';
import { operatorsIn, looksLikeMath } from './mathfmt.js';

const LATIN = [
  ['shch', 'щ'], ['kh', 'х'], ['sh', 'ш'], ['ch', 'ч'], ['ts', 'ц'], ['ya', 'я'], ['yo', 'ё'], ['yu', 'ю'], ['ye', 'е'],
  ['ö', 'ө'], ['ü', 'ү'], ['a', 'а'], ['b', 'б'], ['v', 'в'], ['w', 'в'], ['g', 'г'], ['d', 'д'], ['e', 'э'], ['j', 'ж'],
  ['z', 'з'], ['i', 'и'], ['y', 'ы'], ['k', 'к'], ['q', 'к'], ['l', 'л'], ['m', 'м'], ['n', 'н'], ['o', 'о'], ['p', 'п'],
  ['r', 'р'], ['s', 'с'], ['t', 'т'], ['u', 'у'], ['f', 'ф'], ['h', 'х'], ['x', 'х'], ['c', 'ц'],
];

// Question words carry no topic.
const STOP = new Set(['гэж', 'гэдэг', 'юу', 'вэ', 'бэ', 'бол', 'яаж', 'хэрхэн', 'нь', 'ямар', 'хэд', 'уу', 'үү', 'юм', 'гэсэн', 'үг', 'бодох', 'бодно', 'олох', 'олно', 'тооцох', 'хийх', 'тухай', 'ба', 'болон']);

// Fold letters people swap when typing fast or in Latin: ө/о, ү/у, э/е, ы/и.
const fold = (s) =>
  s.toLowerCase().replace(/[өo]/g, 'о').replace(/[үu]/g, 'у').replace(/э/g, 'е').replace(/[ыйі]/g, 'и').replace(/[ьъ]/g, '');

function translit(s) {
  let out = s.toLowerCase();
  for (const [l, c] of LATIN) out = out.split(l).join(c);
  return out;
}

function lev(a, b) {
  if (Math.abs(a.length - b.length) > 2) return 9;
  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = row[0];
    row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = row[j];
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = tmp;
    }
  }
  return row[b.length];
}

const words = (s) => fold(s).split(/[^\p{L}\p{N}%=+×÷−-]+/u).filter(Boolean);

const letters = (list) => list.filter((w) => /\p{L}/u.test(w));
// Map topics and dictionary entries are searched together. Keys: "t:<id>" and "e:<id>".
const index = [
  ...Object.values(topics).map((t) => ({ key: 't:' + t.id, title: words(t.name), aliases: [...(ideas[t.id]?.aliases ?? []), ...(extraAliases[t.id] ?? [])].flatMap(words), body: letters(words(t.text)) })),
  // Extra, smaller ideas from content/concepts.json.
  ...Object.values(ideas).filter((i) => !i.topic).map((i) => ({ key: 'i:' + i.id, title: words(i.name), aliases: i.aliases.flatMap(words), body: letters(words(i.def ?? '')) })),
  ...Object.values(entries).map((e) => ({
    key: 'e:' + e.id,
    symbol: e.symbol,
    title: words(e.title),
    aliases: e.aliases.flatMap(words),
    body: letters(words(stripLinks(e.definition))),
  })),
];

// Matches while the student is still typing: a word's start is enough, and so is a start with one typo.
function wordScore(q, list, weight, minPrefix = 2) {
  let best = 0;
  for (const w of list) {
    if (w === q) best = Math.max(best, weight * 1.5);
    else if (q.length >= minPrefix && w.startsWith(q)) best = Math.max(best, weight * (0.6 + 0.3 * Math.min(1, q.length / w.length)));
    else if (q.length >= 3 && lev(q, w.slice(0, q.length)) <= (q.length >= 7 ? 2 : 1)) best = Math.max(best, weight * 0.55);
    else if (q.length >= 4 && w.includes(q)) best = Math.max(best, weight * 0.45);
  }
  return best;
}

// Signs in a typed expression also point to the map topics that teach them.
const OP_TOPIC = { '^': 'pow', sqrt: 'root', var: 'expr', eq: 'lin-eq', '÷': 'frac', '%': 'pct', sorog: 'int' };
const OP_ENTRY = { '+': 'nemeh', '−': 'hasah', sorog: 'sorog-too', '×': 'urjih', '÷': 'huvaah', '=': 'tentsuu', '%': 'protsent', order: 'uildliin-daraalal' };

const SHAPES = [
  [/^\d+\s*%$/, 'pct'],
  [/^\d+\s*\/\s*\d+$/, 'frac'],
  [/^\d+\s+\d+\s*\/\s*\d+$/, 'frac'],
  [/^\d+[.,]\d+$/, 'dec'],
  [/^[-−]\d+$/, 'int'],
  [/^\d{2,}$/, 'b-place'],
  [/^\d+\s*:\s*\d+$/, 'ratio'],
  [/^[-−]?\d+(\s*[+−×·:*/-]\s*\(?[-−]?\d+\)?)+$/, 'b-add'],
  [/(^|[+−×·:*/(-]\s*\(?)[-−]\d/, 'int-ops'],
];
const SIGNS = [
  ['∠', 'angle'], ['△', 'tri'], ['∥', 'parallel'], ['⊥', 'angle'], ['∼', 'similar'], ['∫', 'integral'], ['′', 'deriv'],
  ["'(x)", 'deriv'], ['Σ', 'series'], ['∑', 'series'], ['σ', 'spread'], ['x̄', 'average'], ['P(', 'prob'], ['∩', 'sets'],
  ['∪', 'sets'], ['∈', 'sets'], ['∅', 'sets'], ['|x|', 'abs'], ['lim', 'deriv'], ['n!', 'perm-comb'], ['°', 'angle'],
];

// What kind of equation, inequality or function a typed expression is. Returns [topic id, score] pairs.
export function kindOf(raw) {
  const s = raw.toLowerCase().replace(/\s+/g, '').replace(/²/g, '^2').replace(/³/g, '^3').replace(/[−–]/g, '-');
  if (!/[a-z]/.test(s) || (!/[=<>≤≥]/.test(s) && !/sin|cos|tg|tan|log|ln|lg/.test(s))) return [];
  const fn = /^(y|f\(x\))=/.test(s);
  const body = fn ? s.replace(/^(y|f\(x\))=/, '') : s;
  const vars = new Set((body.replace(/sin|cos|tg|tan|log|ln|sqrt|lg/g, '').match(/[a-z]/g) ?? []));
  const out = [];
  const pick = (eq, f, ineq) => out.push([fn ? f : /[<>≤≥]/.test(s) ? ineq : eq, 40]);
  if (/sin|cos|tg|tan/.test(body)) pick('trig-fn', 'trig-fn', 'trig-fn');
  else if (/log|ln|lg/.test(body)) pick('log', 'log', 'log');
  else if (/\d\^\(?[a-z]/.test(body)) pick('exp-eq', 'exp-fn', 'exp-eq');
  else if (/\/\(?[^=]*[a-z]/.test(body)) pick('rat-eq', 'rat-fn', 'rat-eq');
  else if (/sqrt|√/.test(body)) pick('root', 'power-fn', 'root');
  else if (/\^3/.test(body)) pick('poly-div', 'power-fn', 'poly-div');
  else if (/\^2/.test(body)) pick('quad-eq', 'quad-fn', 'quad-ineq');
  else if (!fn && vars.size >= 2 && !/[<>≤≥]/.test(s)) out.push(['system', 30], ['linear', 20]);
  else pick('lin-eq', 'linear', 'ineq');
  return out;
}

export function search(raw) {
  const q = raw.trim();
  if (!q) return [];
  const scores = new Map();
  const add = (key, n) => scores.set(key, (scores.get(key) || 0) + n);

  // A typed expression: offer the entries for the signs it contains.
  if (looksLikeMath(q) || /^[-+*\/÷×=%−^]+$/.test(q)) {
    const ops = operatorsIn(q);
    for (const op of ops) {
      if (OP_ENTRY[op]) add('e:' + OP_ENTRY[op], op === 'order' ? 9 : 6);
      if (OP_TOPIC[op]) add('t:' + OP_TOPIC[op], op === '^' || op === 'sqrt' ? 12 : 5);
    }
    if (/[a-z]/i.test(q.replace(/sqrt/gi, ''))) add('t:' + (/=/.test(q) ? OP_TOPIC.eq : OP_TOPIC.var), 7);
  }
  for (const x of index) if (x.symbol && q === x.symbol) add(x.key, 20);
  // A whole alias typed as is (n!, b^2-4ac, 0.(3)) wins, even when it has no letters to match.
  const whole = q.toLowerCase().replace(/\s+/g, '');
  for (const i of Object.values(ideas)) if (i.aliases.some((a) => a.replace(/\s+/g, '') === whole)) add((i.topic ? 't:' : 'i:') + i.id, 25);
  // A bare number, fraction, decimal, percent or sign points to the topic that teaches it.
  for (const [re, id] of SHAPES) if (re.test(q.trim())) add('t:' + id, 30);
  for (const [sign, id] of SIGNS) if (q.includes(sign)) add('t:' + id, 30);
  // An equation or function typed in full points to the topic that teaches its kind (x² + 5x + 6 = 0 → квадрат тэгшитгэл).
  for (const [id, n] of kindOf(q)) add('t:' + id, n);

  const variants = new Set([q, translit(q)]);
  for (const v of variants) {
    // Bare numbers (the 1 and 2 of sin x = 1/2) say nothing about the topic once there are letters.
    const qs = words(v).filter((w) => !STOP.has(w) && !(/^\d+$/.test(w) && /\p{L}/u.test(v)));
    for (const x of index) {
      let s = 0;
      for (const w of qs) s += Math.max(wordScore(w, x.title, 10), wordScore(w, x.aliases, 8), wordScore(w, x.body, 2, 3));
      if (s) add(x.key, s);
    }
  }
  return [...scores.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([key]) => {
      const [kind, id] = key.split(':');
      return kind === 't' ? { kind: 'topic', id, item: topics[id] } : kind === 'i' ? { kind: 'idea', id, item: ideas[id] } : { kind: 'entry', id, item: entries[id] };
    });
}
