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
const STOP = new Set(['гэж', 'гэдэг', 'юу', 'вэ', 'бэ', 'бол', 'яаж', 'хэрхэн', 'нь', 'ямар', 'хэд', 'уу', 'үү', 'юм', 'гэсэн', 'үг']);

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

  const variants = new Set([q, translit(q)]);
  for (const v of variants) {
    const qs = words(v).filter((w) => !STOP.has(w));
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
