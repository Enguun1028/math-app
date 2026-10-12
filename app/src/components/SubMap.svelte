<script>
  // A sphere opened up: a small map of its topics, laid out by what depends on what.
  import { sphereById, topics, topicUnlocks, strands } from '../lib/content.js';
  import SvgMath from './SvgMath.svelte';
  import { sphereLayout } from '../lib/layout.js';
  import { topicState, sphereState, readiness, sphereKnown } from '../lib/logic.js';
  import { ui } from '../lib/ui.svelte.js';
  import { twoLines } from '../lib/layout.js';
  import { onMount, onDestroy } from 'svelte';
  import { reduced } from '../lib/motion.js';
  import { route } from '../lib/router.svelte.js';
  import { cubicInOut } from 'svelte/easing';

  let { id } = $props();
  let s = $derived(sphereById[id]);
  let st = $derived(s && sphereState(s));

  const W = 360, ROW = 160, R = 44;
  // Depth inside this sphere: how many in-sphere prerequisites come before a topic.
  let layout = $derived.by(() => {
    if (!s) return { nodes: {}, rows: 0 };
    const inS = new Set(s.topics);
    const depth = {};
    const d = (t) => depth[t] ??= Math.max(0, ...topics[t].req.filter((r) => inS.has(r)).map((r) => d(r) + 1));
    s.topics.forEach(d);
    const rows = [];
    for (const t of s.topics) (rows[depth[t]] ??= []).push(t);
    const nodes = {};
    rows.forEach((row, ri) => row.forEach((t, i) => {
      const x = row.length === 1 ? W / 2 + (ri % 2 ? 40 : -40) : 56 + (i * (W - 112)) / (row.length - 1);
      nodes[t] = { x, y: 70 + ri * ROW };
    }));
    return { nodes, rows: rows.length };
  });
  let edges = $derived(
    s ? s.topics.flatMap((t) => topics[t].req.filter((r) => layout.nodes[r]).map((r) => ({ a: layout.nodes[r], b: layout.nodes[t], on: topicState(r) === 'known' }))) : [],
  );
  let from = $derived(s ? [...new Set(s.topics.flatMap((t) => topics[t].req.filter((r) => !s.topics.includes(r))))] : []);
  let onward = $derived(s ? [...new Set(s.topics.flatMap((t) => topicUnlocks[t].filter((u) => !s.topics.includes(u))))] : []);
  const edge = (a, b) => `M ${a.x} ${a.y + R} C ${a.x} ${(a.y + b.y) / 2}, ${b.x} ${(a.y + b.y) / 2}, ${b.x} ${b.y - R}`;
  const fs = (f) => Math.min(24, 88 / Math.max(3, [...f].length));

  // Opening animation: each topic circle starts exactly where it was inside the sphere on the map
  // and glides to its place here. Lines and text fade in once the circles have landed.
  let mini = $state();
  let morphing = $state(false);
  onMount(() => {
    const m = ui.morph;
    // Cleared after the page's own entrance has started, so that entrance knows to stay still.
    setTimeout(() => (ui.morph = null), 700);
    if (!m || m.sphere !== id || reduced || !mini) return;
    const ctm = mini.getScreenCTM();
    if (!ctm) return;
    morphing = true;
    const els = [...mini.querySelectorAll('[data-t]')];
    for (const el of els) {
      const r0 = m.rects[el.dataset.t], n = layout.nodes[el.dataset.t];
      if (!r0 || !n) continue;
      const sx = ctm.a * n.x + ctm.e, sy = ctm.d * n.y + ctm.f;
      el.style.transformOrigin = `${n.x}px ${n.y}px`;
      el.style.transform = `translate(${(r0.x - sx) / ctm.a}px, ${(r0.y - sy) / ctm.d}px) scale(${r0.r / (R * ctm.a)})`;
    }
    mini.getBoundingClientRect(); // apply the start positions before the glide begins
    requestAnimationFrame(() => {
      for (const el of els) {
        el.style.transition = 'transform 600ms cubic-bezier(0.22, 0.8, 0.24, 1)';
        el.style.transform = '';
      }
      setTimeout(() => (morphing = false), 380);
    });
  });

  // Left for another page (not the map): nothing will fly home, so forget the open sphere.
  onDestroy(() => route.parts.length && (ui.back = null));

  // Going back to the map: the same glide in reverse, each circle flying home into the sphere.
  function home(node) {
    const b = ui.back;
    if (!b || b.sphere !== id || reduced || route.parts.length) return { duration: 0 };
    const ctm = node.getScreenCTM();
    if (!ctm) return { duration: 0 };
    const moves = [];
    for (const el of node.querySelectorAll('[data-t]')) {
      const r0 = b.rects[el.dataset.t], n = layout.nodes[el.dataset.t];
      if (!r0 || !n) continue;
      const sx = ctm.a * n.x + ctm.e, sy = ctm.d * n.y + ctm.f;
      el.style.transformOrigin = `${n.x}px ${n.y}px`;
      el.style.transition = 'none';
      moves.push({ el, dx: (r0.x - sx) / ctm.a, dy: (r0.y - sy) / ctm.d, sc: r0.r / (R * ctm.a) });
    }
    return {
      duration: 460,
      easing: cubicInOut,
      tick: (t) => {
        const p = 1 - t;
        for (const m of moves) m.el.style.transform = `translate(${m.dx * p}px, ${m.dy * p}px) scale(${1 + (m.sc - 1) * p})`;
      },
    };
  }
</script>

{#if !s}
  <p class="card">Ийм бөмбөлөг олдсонгүй.</p>
{:else}
  <div class="page" class:morphing style:--c={sphereLayout[s.id].color}>
    <header class="head">
      <p class="small muted">{s.index + 1}-р бөмбөлөг</p>
      <h1>{s.title}</h1>
      <p class="muted">{s.why}</p>
      {#if st === 'known' || st === 'faded'}<span class="badge known">Мэднэ</span>{:else if st === 'next'}<span class="badge next">Дараагийн алхам энд байна</span>{/if}
    </header>

     <svg bind:this={mini} viewBox="0 0 {W} {layout.rows * ROW}" class="mini" out:home|global role="group" aria-label="{s.title}: сэдвүүд">
      {#each edges as e}<path d={edge(e.a, e.b)} class="e" class:on={e.on} />{/each}
      {#each s.topics as t (t)}
        {@const n = layout.nodes[t]}
        {@const ts = topicState(t)}
        <g
          data-t={t}
          class="node {ts}"
          style:--tc={strands[topics[t].strand].color}
          role="button"
          tabindex="0"
          aria-label={topics[t].name}
          onclick={() => (ui.topic = t)}
          onkeydown={(ev) => (ev.key === 'Enter' || ev.key === ' ') && (ui.topic = t)}
        >
          {#if ts === 'next'}<circle cx={n.x} cy={n.y} r={R + 8} class="halo" />{/if}
          <circle cx={n.x} cy={n.y} r={R} class="c" />
          <SvgMath x={n.x} y={n.y + 1} size={fs(topics[t].formula)} text={topics[t].formula} cls="tf" color="#fff" />
          {#each twoLines(topics[t].name, 12) as line, j}
            <text x={n.x} y={n.y + R + 21 + j * 17} class="n">{line}</text>
          {/each}
          {#if ts === 'known' || ts === 'faded'}<text x={n.x + R * 0.75} y={n.y - R * 0.7} class="ok">✓</text>{/if}
        </g>
      {/each}
    </svg>

    {#if from.length || onward.length}
      <section class="journey">
        <h2>Аялал дээр</h2>
        {#if from.length}
          <p class="label">Өмнө нь</p>
          <div class="chips">
            {#each from as f}<button class="chip {topicState(f)}" onclick={() => (ui.topic = f)}><span class="dot"></span>{topics[f].name}</button>{/each}
          </div>
          {#if readiness(s) < 1 && !sphereKnown(s)}
            <p class="note small">
              {#if readiness(s) > 0}Суурь сэдвүүдийн {Math.round(readiness(s) * 100)}% нь танд бий.{/if}
              Эхлээд эдгээр суурийг үзвэл илүү амархан. Гэхдээ хүссэнээ үзэж болно.
            </p>
          {/if}
        {/if}
        {#if onward.length}
          <p class="label">Дараа нь нээгдэнэ</p>
          <div class="chips">
            {#each onward as o}<button class="chip {topicState(o)}" onclick={() => (ui.topic = o)}><span class="dot"></span>{topics[o].name}</button>{/each}
          </div>
        {/if}
      </section>
    {/if}

    <div class="actions">
      {#if s.entries.length}
        <a class="btn primary" href="#/test/{s.id}">Бүх бөмбөлгийн шалгалт</a>
      {/if}
      <button class="link" onclick={() => { ui.fly = { sphere: s.id }; location.hash = '/'; }}>Газрын зураг дээр харах</button>
    </div>
  </div>
{/if}

<style>
  /* While circles glide in, everything else waits, then fades in. */
  .page > :not(.mini), .e, .n, .ok, .halo { transition: opacity 0.35s ease-out, transform 0.35s ease-out; }
  .page.morphing > :not(.mini) { opacity: 0; transform: translateY(8px); }
  .page.morphing .e, .page.morphing .n, .page.morphing .ok, .page.morphing .halo { opacity: 0; }
  .head { padding: 12px 0 16px; display: grid; gap: 6px; justify-items: start; }
  h1 { color: var(--c); text-shadow: 0 0 18px color-mix(in srgb, var(--c) 50%, transparent); }
  .journey { display: grid; gap: 4px; margin-top: 24px; }
  .journey h2 { margin-bottom: 8px; }
  .journey .label { margin: 8px 0 4px; }
  .journey .chip { background: transparent; color: var(--ink); }
  .link { min-height: 44px; border: 0; background: none; padding: 0 8px; color: var(--sky); font-weight: 700; }
  .note { padding: 10px 12px; border-radius: 12px; background: var(--sun-soft); color: var(--sun); margin: 6px 0; }
  .mini { width: 100%; height: auto; margin: 8px 0; overflow: visible; }
  .e { fill: none; stroke: var(--line); stroke-width: 2; }
  .e.on { stroke: var(--sky); stroke-opacity: 0.8; filter: drop-shadow(0 0 4px var(--sky)); }
  .node { cursor: pointer; outline: none; }
  .c { fill: color-mix(in srgb, var(--tc) 22%, var(--bg)); stroke: var(--tc); stroke-width: 1.5; stroke-opacity: 0.75; filter: drop-shadow(0 0 6px color-mix(in srgb, var(--tc) 40%, transparent)); }
  .node:hover .c, .node:focus-visible .c { stroke-width: 3; stroke-opacity: 1; }
  .node.known .c { fill: color-mix(in srgb, var(--tc) 35%, var(--bg)); stroke-opacity: 1; stroke-width: 3; filter: drop-shadow(0 0 8px var(--tc)); }
  .node.faded .c { stroke: var(--dusk); }
  .node.later { opacity: 0.55; }
  .halo { fill: none; stroke: var(--sun); stroke-width: 3; animation: pulse 2.2s ease-in-out infinite; }
  @keyframes pulse { 50% { stroke-opacity: 0.25; } }
  :global(.tf) { fill: #fff; text-anchor: middle; dominant-baseline: middle; font-family: var(--math); filter: drop-shadow(0 0 5px var(--tc)); pointer-events: none; }
  .n { fill: var(--ink); font-size: 14px; font-weight: 600; text-anchor: middle; pointer-events: none; }
  .ok { fill: var(--grass); font-size: 16px; font-weight: 800; pointer-events: none; }
  .actions { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin-top: 28px; }
  .actions a { text-decoration: none; }
  @media (prefers-reduced-motion: reduce) { .halo { animation: none; } }
</style>
