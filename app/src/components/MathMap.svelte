<script>
  // The pure math map (owner, 2026-10-13): more technical and rigid than the curriculum map, but still beautiful.
  // One column per branch of mathematics; each concept sits below everything it needs.
  // Grade 1–4 basics live here as dashed boxes. Tapping a concept lights up all its links, coloured by kind.
  // Wider than a phone: it pans both ways with the phone's own scrolling. No zoom (owner rule).
  import { topics, links, branches, strands } from '../lib/content.js';
  import { mathLayout, MATH } from '../lib/layout.js';
  import { topicState } from '../lib/logic.js';
  import { ui } from '../lib/ui.svelte.js';
  import { onMount } from 'svelte';

  const { pos, W, H } = mathLayout;
  const { COLW, NODEW, NODEH } = MATH;

  const KINDS = {
    prerequisite: ['Өмнө нь хэрэгтэй', '#5cc8ff'],
    special_case: ['Онцгой тохиолдол', '#4fe3b0'],
    generalizes: ['Ерөнхийлнө', '#a78bfa'],
    representation: ['Өөр дүрслэл', '#ffd166'],
    application: ['Хэрэглээ', '#ff7aa8'],
    analogy: ['Төстэй', '#9aa5bf'],
  };

  let sel = $derived(ui.topic && pos[ui.topic] ? ui.topic : null);
  let shown = $derived(sel ? links.filter((e) => e.from === sel || e.to === sel) : links.filter((e) => e.type === 'prerequisite'));
  let lit = $derived(sel ? new Set(shown.flatMap((e) => [e.from, e.to])) : null);

  const edge = (e) => {
    const a = pos[e.from], b = pos[e.to];
    const x1 = a.x + NODEW / 2, y1 = a.y + NODEH, x2 = b.x + NODEW / 2, y2 = b.y;
    const my = (y1 + y2) / 2;
    return `M ${x1} ${y1} C ${x1} ${my}, ${x2} ${my}, ${x2} ${y2}`;
  };
  function wrap2(t) {
    let a = '', b = '';
    for (const x of t.split(' ')) {
      if ((a + ' ' + x).trim().length <= 16 && !b) a = (a + ' ' + x).trim();
      else b = (b + ' ' + x).trim();
    }
    if (b.length > 18) b = b.slice(0, 17) + '…';
    return [a, b];
  }
  const branchName = (n) => wrap2(n);

  // Opens on the first column, or on the concept whose card is open.
  let pan;
  onMount(() => {
    const p = sel && pos[sel];
    if (p) pan.scrollTo({ left: p.x - 40, top: p.y - 120 });
  });
</script>

<div class="page">
  <!-- Room for the shared map toggle (App.svelte), which sits in the same spot on both maps. -->
  <div class="top" aria-hidden="true"></div>
  <p class="small muted intro">10 салбар. Сэдэв бүр өөрт хэрэгтэй сэдвүүдийнхээ доор. Товшвол холбоос нь тодорно.</p>

  <div class="pan" bind:this={pan}>
    <svg width={W} height={H} viewBox="0 0 {W} {H}" role="group" aria-label="Математикийн зураг">
      {#each branches as b, col}
        {@const x = 12 + col * COLW}
        {@const [l1, l2] = branchName(b.name)}
        <rect x={x - 6} y="8" width={COLW - 4} height={H - 16} rx="10" class="col" class:odd={col % 2} />
        <text x={x + NODEW / 2} y="26" class="bname">{l1}</text>
        <text x={x + NODEW / 2} y="39" class="bname">{l2}</text>
      {/each}
      {#each shown as e}
        <path d={edge(e)} class="e" class:sel={!!sel} class:dash={e.type !== 'prerequisite'} style:stroke={sel ? KINDS[e.type][1] : null} />
      {/each}
      {#each Object.values(topics) as t (t.id)}
        {@const p = pos[t.id]}
        {@const [a, b] = wrap2(t.name)}
        {@const ts = topicState(t.id)}
        <g
          class="node {ts}"
          class:base={t.base}
          class:on={sel === t.id}
          class:dim={lit && !lit.has(t.id)}
          style:--tc={strands[t.strand].color}
          role="button"
          tabindex="0"
          aria-label={t.name}
          onclick={() => (ui.topic = t.id)}
          onkeydown={(ev) => (ev.key === 'Enter' || ev.key === ' ') && (ui.topic = t.id)}
        >
          <rect x={p.x} y={p.y} width={NODEW} height={NODEH} rx="8" class="box" />
          <text x={p.x + 8} y={p.y + (b ? 17 : 24)} class="n">{a}</text>
          {#if b}<text x={p.x + 8} y={p.y + 31} class="n">{b}</text>{/if}
          <text x={p.x + NODEW - 5} y={p.y + NODEH - 4} class="g">{t.base ? '1–4' : t.grades[0]}</text>
          {#if ts === 'known' || ts === 'faded'}<text x={p.x + NODEW - 6} y={p.y + 12} class="ok">✓</text>{/if}
        </g>
      {/each}
    </svg>
  </div>

  <div class="legend small">
    {#each Object.values(KINDS) as [label, color]}<span><i style:background={color}></i>{label}</span>{/each}
    <span><i class="dashed"></i>1–4-р ангийн суурь</span>
  </div>
</div>

<style>
  .top { height: 58px; }
  .intro { margin: 0 0 10px; }
  .pan {
    margin: 0 -16px; height: min(66vh, 640px); overflow: auto; -webkit-overflow-scrolling: touch; overscroll-behavior: contain;
    border-block: 1px solid var(--line); scrollbar-width: none;
  }
  .pan::-webkit-scrollbar { display: none; }
  svg { display: block; user-select: none; -webkit-user-select: none; -webkit-tap-highlight-color: transparent; }
  .col { fill: #0a1022; }
  .col.odd { fill: #0b1328; }
  .bname { fill: #8d9abb; font-size: 10.5px; font-weight: 700; text-anchor: middle; }
  .e { fill: none; stroke: var(--sky); stroke-opacity: 0.13; stroke-width: 1; }
  .e.sel { stroke-opacity: 0.95; stroke-width: 2; }
  .e.dash { stroke-dasharray: 5 4; }
  .node { cursor: pointer; outline: none; transition: opacity 0.2s ease-out; }
  .node.dim { opacity: 0.25; }
  .box { fill: #121b33; stroke: var(--tc); stroke-opacity: 0.8; }
  .node.base .box { fill: #0a1022; stroke-opacity: 0.5; stroke-dasharray: 3 3; }
  .node.on .box { fill: #2a2410; stroke: var(--sun); stroke-opacity: 1; stroke-width: 2; }
  .node.known .box { fill: color-mix(in srgb, var(--tc) 22%, #121b33); }
  .node:focus-visible .box { stroke-width: 2.5; }
  .n { fill: var(--ink); font-size: 10.5px; font-weight: 600; pointer-events: none; }
  .node.base .n { fill: var(--muted); }
  .g { fill: var(--muted); font-size: 8.5px; text-anchor: end; font-family: var(--math); pointer-events: none; }
  .ok { fill: var(--grass); font-size: 10px; font-weight: 800; text-anchor: end; pointer-events: none; }
  .legend { display: flex; flex-wrap: wrap; gap: 6px 14px; margin-top: 12px; color: var(--muted); }
  .legend span { display: inline-flex; align-items: center; gap: 6px; }
  .legend i { width: 14px; height: 3px; border-radius: 2px; }
  .legend i.dashed { height: 10px; border: 1px dashed var(--muted); border-radius: 3px; }
</style>
