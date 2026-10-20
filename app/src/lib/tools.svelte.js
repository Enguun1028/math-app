// The tools, and which one sits in the bottom bar (the 2nd tab). The student pins any tool there with the
// 📌 button on the tools page; the choice is kept on the phone. The graph calculator is the default
// (owner, 2026-10-20: the practice tab was replaced by this slot).
import { ui } from './ui.svelte.js';
import { go } from './router.svelte.js';

export const TOOLS = [
  { id: 'graph', name: 'График' },
  { id: 'numberline', name: 'Тооны шулуун' },
  { id: 'scale', name: 'Жин' },
  { id: 'fraction', name: 'Бутархай' },
  { id: 'grid', name: 'Талбайн тор' },
  { id: 'coord', name: 'Координатын хавтгай' },
];
export const toolById = Object.fromEntries(TOOLS.map((t) => [t.id, t]));

const KEY = 'mm-slot';
const load = () => {
  try {
    const v = localStorage.getItem(KEY);
    return toolById[v] ? v : 'graph';
  } catch {
    return 'graph';
  }
};
export const slot = $state({ id: load() });

export function pinTool(id) {
  slot.id = id;
  try { localStorage.setItem(KEY, id); } catch {}
}

// Open the graph calculator with these lines (from search or a topic card).
export function openGraph(lines) {
  ui.graphSeed = lines;
  ui.tool = 'graph';
  ui.topic = null;
  go(slot.id === 'graph' ? '/t' : '/tools');
}
