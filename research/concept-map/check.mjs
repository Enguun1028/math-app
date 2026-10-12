// Sanity checks for the concept map draft: ids, curriculum codes, prerequisite cycles, coverage.
// Run: node research/concept-map/check.mjs
import { readFileSync } from 'node:fs';
import { CONCEPTS, EDGES, BRANCHES, STRANDS } from './draft-v1.js';

const tsv = readFileSync(new URL('../curriculum/mn-2019-objectives.tsv', import.meta.url), 'utf8').trim().split(/\r?\n/).slice(1).map((l) => l.split('\t'));
const codes = new Set(tsv.map((r) => r[1]));
const ids = new Set(CONCEPTS.map((c) => c[0]));
const branchIds = new Set(BRANCHES.map((b) => b[0]));
const strandIds = new Set(STRANDS.map((s) => s[0]));
const problems = [];

if (ids.size !== CONCEPTS.length) problems.push('duplicate concept id');
for (const [id, , , br, st, , cs] of CONCEPTS) {
  for (const b of br) if (!branchIds.has(b)) problems.push(`${id}: unknown branch ${b}`);
  if (!strandIds.has(st)) problems.push(`${id}: unknown strand ${st}`);
  for (const c of cs) if (!codes.has(c)) problems.push(`${id}: unknown code ${c}`);
}
const types = new Set(['prerequisite', 'special_case', 'generalizes', 'representation', 'application', 'analogy']);
for (const [a, b, t] of EDGES) {
  if (!ids.has(a)) problems.push(`edge: unknown ${a}`);
  if (!ids.has(b)) problems.push(`edge: unknown ${b}`);
  if (!types.has(t)) problems.push(`edge ${a}→${b}: bad type ${t}`);
}
// prerequisite cycles
const out = new Map([...ids].map((i) => [i, []]));
for (const [a, b, t] of EDGES) if (t === 'prerequisite') out.get(a).push(b);
const state = new Map();
const visit = (n, path) => {
  if (state.get(n) === 1) { problems.push('cycle: ' + [...path, n].join(' → ')); return; }
  if (state.get(n) === 2) return;
  state.set(n, 1); for (const m of out.get(n)) visit(m, [...path, n]); state.set(n, 2);
};
for (const i of ids) visit(i, []);
// a prerequisite should not be taught later than what needs it
const grade = new Map(CONCEPTS.map((c) => [c[0], c[5]]));
for (const [a, b, t] of EDGES) if (t === 'prerequisite' && grade.get(a) > grade.get(b)) problems.push(`grade order: ${a} (${grade.get(a)}) before ${b} (${grade.get(b)})`);
// curriculum coverage
const used = new Set(CONCEPTS.flatMap((c) => c[6]));
const missing = tsv.filter((r) => !used.has(r[1])).map((r) => r[1]);
const lonely = [...ids].filter((i) => !EDGES.some(([a, b]) => a === i || b === i));

console.log(`${CONCEPTS.length} concepts (${CONCEPTS.filter((c) => c[7] === 'base').length} base), ${EDGES.length} edges`);
console.log(`curriculum codes covered: ${used.size}/${codes.size}`);
if (missing.length) console.log('not covered:', missing.join(' '));
if (lonely.length) console.log('no links:', lonely.join(' '));
console.log(problems.length ? 'PROBLEMS:\n' + problems.join('\n') : 'no problems');

// every grade 5–12 concept in exactly one curriculum lane
import { CURRICULUM_LANES } from './draft-v1.js';
const laneOf = new Map();
for (const [lid, , , list] of CURRICULUM_LANES) for (const id of list) {
  if (!ids.has(id)) console.log('lane: unknown', id);
  if (laneOf.has(id)) console.log('lane: twice', id);
  laneOf.set(id, lid);
}
const core = CONCEPTS.filter((c) => c[7] === 'core').map((c) => c[0]);
const noLane = core.filter((id) => !laneOf.has(id));
console.log(`lanes: ${CURRICULUM_LANES.length}, placed ${laneOf.size}/${core.length}${noLane.length ? ', missing ' + noLane.join(' ') : ''}`);
