<script>
  // One icon per topic (owner, 2026-10-16): a rounded tile in the strand colour with one short math symbol.
  // Grade 1–4 basics get a dashed border. Symbols live in content/topic-icons.json; fractions are stacked by RichText.
  import RichText from './RichText.svelte';
  import { topics, strands } from '../lib/content.js';
  import icons from '../../content/topic-icons.json';

  let { id, size = 52, known = false, grey = false } = $props();
  let t = $derived(topics[id]);
  let g = $derived(icons[id] ?? '•');
  let vec = $derived(g.startsWith('vec:') ? g.slice(4) : null);
  // Longer symbols get a smaller font so every icon fills its tile about the same.
  let k = $derived.by(() => {
    const n = g.includes('\\frac') ? Math.max(2, g.replace(/\\frac\{([^}]*)\}\{([^}]*)\}/g, (_, a, b) => (a.length > b.length ? a : b)).length) : (vec ?? g).length;
    return n <= 1 ? 0.56 : n <= 2 ? 0.44 : n <= 3 ? 0.36 : n <= 4 ? 0.3 : 0.25;
  });
</script>

<span class="ic" class:base={t?.base} class:grey style:--c={strands[t?.strand]?.color} style:--s="{size}px" aria-hidden="true">
  <span class="g" style:--k={k}>{#if vec}<span class="vec">{vec}</span>{:else}<RichText text={g} />{/if}</span>
  {#if known}<span class="ok">✓</span>{/if}
</span>

<style>
  .ic {
    width: var(--s); height: var(--s); flex: none; border-radius: calc(var(--s) * 0.28); display: grid; place-items: center; position: relative;
    border: 1.5px solid color-mix(in srgb, var(--c) 75%, transparent);
    background: radial-gradient(120% 90% at 30% 20%, color-mix(in srgb, var(--c) 26%, var(--surface-solid)), var(--surface-solid) 70%);
    box-shadow: inset 0 0 12px color-mix(in srgb, var(--c) 18%, transparent), 0 0 14px color-mix(in srgb, var(--c) 22%, transparent);
    color: color-mix(in srgb, var(--c) 55%, #fff); font-family: var(--math); font-weight: 700; line-height: 1;
    text-shadow: 0 0 10px color-mix(in srgb, var(--c) 60%, transparent);
  }
  /* Grey copy for the topic strip: it cross-fades with the coloured one, which is cheaper than a moving filter. */
  .ic.grey { border-color: var(--line); background: var(--surface-solid); box-shadow: none; color: var(--muted); text-shadow: none; }
  .ic.base { border-style: dashed; box-shadow: none; background: var(--surface-solid); }
  .g { white-space: nowrap; display: inline-flex; align-items: center; font-size: calc(var(--s) * var(--k)); }
  .g :global(.frac) { font-size: 0.8em; }
  .vec { position: relative; display: inline-block; }
  .vec::before { content: ''; position: absolute; left: 0; right: 0; top: -0.12em; height: 0.07em; background: currentColor; }
  .vec::after { content: ''; position: absolute; right: -0.08em; top: -0.22em; border: 0.13em solid transparent; border-left: 0.2em solid currentColor; border-right: 0; }
  .ok { position: absolute; right: -5px; top: -5px; width: 16px; height: 16px; border-radius: 50%; background: var(--grass); color: #04140a; font: 800 10px/16px var(--font); text-align: center; text-shadow: none; }
</style>
