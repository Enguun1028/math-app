<script>
  // Text with [[id|label]] links. Tapping a term opens a quick preview.
  import { entries, LINK_RE } from '../lib/content.js';
  import { ui } from '../lib/ui.svelte.js';

  let { text: raw } = $props();
  // Keep digit groups like 40 000 on one line.
  let text = $derived(raw.replace(/(\d) (?=\d{3}\b)/g, '$1\u00a0'));

  let parts = $derived.by(() => {
    const out = [];
    let last = 0;
    for (const m of text.matchAll(LINK_RE)) {
      out.push({ t: text.slice(last, m.index) });
      out.push({ id: m[1], t: m[2] || entries[m[1]]?.title || m[1] });
      last = m.index + m[0].length;
    }
    out.push({ t: text.slice(last) });
    return out;
  });
</script>

{#each parts as p}{#if p.id && entries[p.id]}<button class="term" onclick={() => (ui.preview = p.id)}>{p.t}</button>{:else}{p.t}{/if}{/each}
