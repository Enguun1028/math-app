<script>
  // Every named formula of a topic at once, as a tree (owner, 2026-10-16: "see everything at once and then be able to
  // navigate", the same idea as the map). The topic sits on top; a line means the lower formula comes out of the upper one.
  // The open formula glows gold, and so do its lines. Lines are drawn from the tiles' real boxes, so any label height works.
  import RichText from './RichText.svelte';
  import { familyOf } from '../lib/ideas.js';
  import { topics, strands } from '../lib/content.js';

  let { topic, current = 'root', onpick = () => {} } = $props();
  let fam = $derived(familyOf(topic));
  const ROW = 84; // px between rows
  let box, paths = $state([]);

  function draw() {
    if (!box || !fam) return;
    const b = box.getBoundingClientRect();
    const at = (id) => box.querySelector(`[data-node="${id}"]`)?.getBoundingClientRect();
    paths = fam.edges.map(([p, c]) => {
      const r1 = at(p), r2 = at(c);
      if (!r1 || !r2) return null;
      const x1 = r1.left + r1.width / 2 - b.left, y1 = r1.bottom - b.top, x2 = r2.left + r2.width / 2 - b.left, y2 = r2.top - b.top, m = (y1 + y2) / 2;
      return { d: `M${x1},${y1} C${x1},${m} ${x2},${m} ${x2},${y2}`, hot: p === current || c === current };
    }).filter(Boolean);
  }
  $effect(() => {
    fam; current;
    requestAnimationFrame(draw);
    const ro = new ResizeObserver(draw);
    if (box) ro.observe(box);
    document.fonts?.ready.then(draw);
    return () => ro.disconnect();
  });
</script>

{#if fam}
  <div class="tree" bind:this={box} style:height="{(fam.rows - 1) * ROW + 72}px" style:--c={strands[topics[topic].strand].color}>
    <svg aria-hidden="true">{#each paths as p}<path class:hot={p.hot} d={p.d} />{/each}</svg>
    <button class="node root" class:on={current === 'root'} data-node="root" data-f={'tree:' + topic} style:left="50%" style:top="0px" onclick={() => onpick('root')}>{topics[topic].name}</button>
    {#each fam.nodes as n (n.id)}
      <button class="node" class:on={current === n.id} data-node={n.id} data-f={n.id} aria-current={current === n.id ? 'page' : undefined}
        style:left="{n.x * 100}%" style:top="{n.row * ROW - 14}px" onclick={() => onpick(n.id)}>
        <span class="nl">{n.label}</span>
        {#if n.formula}<span class="mf"><RichText text={n.formula} /></span>{/if}
      </button>
    {/each}
  </div>
{/if}

<style>
  .tree { position: relative; }
  svg { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; pointer-events: none; }
  path { fill: none; stroke: color-mix(in srgb, var(--c) 40%, transparent); stroke-width: 1.5; }
  path.hot { stroke: var(--sun); stroke-width: 2; }
  .node {
    position: absolute; transform: translateX(-50%); width: 31%; min-height: 56px; display: grid; align-content: center; gap: 2px; padding: 6px 7px;
    border-radius: 12px; border: 1px solid color-mix(in srgb, var(--c) 35%, var(--line)); background: var(--surface-solid); color: var(--ink);
    text-align: center; font: 700 0.68rem/1.2 var(--font); transition: box-shadow 0.2s, border-color 0.2s;
  }
  .nl { display: -webkit-box; -webkit-line-clamp: 2; line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; overflow-wrap: anywhere; }
  .mf { font: 0.74rem/1.3 var(--math); color: var(--muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .node.on { border-color: var(--sun); box-shadow: 0 0 0 1px var(--sun), 0 0 18px color-mix(in srgb, var(--sun) 35%, transparent); }
  .node.on .mf { color: var(--ink); }
  .node.root { width: 66%; min-height: 40px; border-radius: 999px; background: color-mix(in srgb, var(--c) 16%, var(--surface-solid)); border-color: var(--c); font-size: 0.76rem; }
  .node.root.on { border-color: var(--sun); }
</style>
