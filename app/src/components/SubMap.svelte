<script>
  // A grade sphere opened up: a map that sprouts from the centre (owner, 2026-10-13).
  // The grade number sits in the middle and each strand owns a slice. Concepts coming back from earlier grades
  // (↑, dashed) sit on the inner ring; new concepts grow outward from the ones they need.
  // The map is wider than a phone, so it pans with the phone's own scrolling. It is the one place that zooms
  // (owner, 2026-10-13: "made as a circle ... so zoom is appropriate here and only here"): pinch, +/−, or ctrl+wheel.
  import { sphereById, topics, strands, isFresh } from '../lib/content.js';
  import { sphereLayout, gradeRadial, RAD, twoLines } from '../lib/layout.js';
  import { topicState, sphereState, readiness, sphereKnown } from '../lib/logic.js';
  import { ui } from '../lib/ui.svelte.js';
  import { onMount, onDestroy } from 'svelte';
  import { reduced } from '../lib/motion.js';
  import { route } from '../lib/router.svelte.js';
  import { cubicInOut } from 'svelte/easing';

  let { id } = $props();
  let s = $derived(sphereById[id]);
  let st = $derived(s && sphereState(s));
  let rad = $derived(s && gradeRadial(s.id));

  const PAD = 120;
  let S = $derived(rad ? Math.ceil(rad.rMax + PAD) : 0);
  let nodes = $derived(rad ? Object.fromEntries(Object.entries(rad.nodes).map(([t, n]) => [t, { ...n, x: n.x + S, y: n.y + S }])) : {});

  // Sprouts: from the centre to the first concepts of a slice, then parent to child.
  let sprouts = $derived.by(() => {
    if (!s) return [];
    const out = [];
    for (const t of s.topics) {
      const n = nodes[t];
      const parents = rad.req(t);
      if (!parents.length) {
        const a = n.ang;
        out.push({ t, d: `M ${S + 42 * Math.cos(a)} ${S + 42 * Math.sin(a)} L ${n.x - RAD.NODE * Math.cos(a)} ${n.y - RAD.NODE * Math.sin(a)}`, root: true });
      }
      for (const r of parents) {
        const p = nodes[r];
        const cx = S + ((p.x + n.x) / 2 - S) * 1.08, cy = S + ((p.y + n.y) / 2 - S) * 1.08;
        out.push({ t, d: `M ${p.x} ${p.y} Q ${cx} ${cy} ${n.x} ${n.y}`, on: topicState(r) === 'known' });
      }
    }
    return out;
  });

  // What the year's new concepts need from earlier grades (grade 1–4 basics included), and what this year opens later.
  let from = $derived.by(() => {
    if (!s) return [];
    const m = new Set();
    for (const t of s.fresh) for (const r of topics[t].req) if (!s.topics.includes(r)) m.add(r);
    return [...m].sort((a, b) => (topics[a].base ? 0 : topics[a].grade) - (topics[b].base ? 0 : topics[b].grade));
  });
  let onward = $derived.by(() => {
    if (!s) return [];
    const m = new Set();
    for (const t of s.topics) for (const u of Object.values(topics)) if (u.req.includes(t) && !s.topics.includes(u.id) && u.grades[0] > s.grade) m.add(u.id);
    return [...m].sort((a, b) => topics[a].grades[0] - topics[b].grades[0]);
  });
  let fresh = $derived(s ? s.fresh.length : 0);

  // Open the map centred on the grade number.
  let pan = $state();
  let mini = $state();
  let morphing = $state(false);
  onMount(() => {
    if (pan) {
      pan.scrollLeft = (pan.scrollWidth - pan.clientWidth) / 2;
      pan.scrollTop = (pan.scrollHeight - pan.clientHeight) / 2;
    }
    // Opening animation: each dot starts exactly where it was inside the sphere on the map and glides to its place here.
    const m = ui.morph;
    setTimeout(() => (ui.morph = null), 700);
    if (!m || m.sphere !== id || reduced || !mini) return;
    const ctm = mini.getScreenCTM();
    if (!ctm) return;
    morphing = true;
    const els = [...mini.querySelectorAll('[data-t]')];
    for (const el of els) {
      const r0 = m.rects[el.dataset.t], n = nodes[el.dataset.t];
      if (!r0 || !n) continue;
      const sx = ctm.a * n.x + ctm.e, sy = ctm.d * n.y + ctm.f;
      el.style.transformOrigin = `${n.x}px ${n.y}px`;
      el.style.transform = `translate(${(r0.x - sx) / ctm.a}px, ${(r0.y - sy) / ctm.d}px) scale(${r0.r / (RAD.NODE * ctm.a)})`;
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

  // Going back to the map: the same glide in reverse, each dot flying home into the sphere.
  function home(node) {
    const b = ui.back;
    if (!b || b.sphere !== id || reduced || route.parts.length) return { duration: 0 };
    const ctm = node.getScreenCTM();
    if (!ctm) return { duration: 0 };
    const moves = [];
    for (const el of node.querySelectorAll('[data-t]')) {
      const r0 = b.rects[el.dataset.t], n = nodes[el.dataset.t];
      if (!r0 || !n) continue;
      const sx = ctm.a * n.x + ctm.e, sy = ctm.d * n.y + ctm.f;
      el.style.transformOrigin = `${n.x}px ${n.y}px`;
      el.style.transition = 'none';
      moves.push({ el, dx: (r0.x - sx) / ctm.a, dy: (r0.y - sy) / ctm.d, sc: r0.r / (RAD.NODE * ctm.a) });
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

  // ---- zoom: the svg is drawn z times its size and the pan box scrolls over it ----
  const Z_MAX = 2.6;
  let z = $state(1);
  // Zoomed all the way out, the whole circle fits the box.
  let zMin = $derived(pan ? Math.min(0.6, pan.clientWidth / (S * 2), pan.clientHeight / (S * 2)) : 0.45);
  const clampZ = (v) => Math.min(Z_MAX, Math.max(zMin, v));
  // Zoom to nz keeping the map point under (px, py) (screen position inside the pan box) where it is.
  function zoomAt(nz, px, py) {
    nz = clampZ(nz);
    if (!pan || nz === z) return;
    const cx = (pan.scrollLeft + px) / z, cy = (pan.scrollTop + py) / z;
    z = nz;
    requestAnimationFrame(() => {
      pan.scrollLeft = cx * nz - px;
      pan.scrollTop = cy * nz - py;
    });
  }
  const zoomBtn = (f) => zoomAt(z * f, pan.clientWidth / 2, pan.clientHeight / 2);
  // Pinch with two fingers; one finger still pans with normal scrolling.
  function pinch(node) {
    let d0 = 0, z0 = 1;
    const dist = (t) => Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);
    const mid = (t) => { const r = node.getBoundingClientRect(); return [(t[0].clientX + t[1].clientX) / 2 - r.left, (t[0].clientY + t[1].clientY) / 2 - r.top]; };
    const start = (e) => { if (e.touches.length === 2) { d0 = dist(e.touches); z0 = z; } };
    const move = (e) => {
      if (e.touches.length !== 2 || !d0) return;
      e.preventDefault();
      const [px, py] = mid(e.touches);
      zoomAt(z0 * (dist(e.touches) / d0), px, py);
    };
    const end = (e) => { if (e.touches.length < 2) d0 = 0; };
    const wheel = (e) => {
      if (!e.ctrlKey) return;
      e.preventDefault();
      const r = node.getBoundingClientRect();
      zoomAt(z * Math.exp(-e.deltaY / 300), e.clientX - r.left, e.clientY - r.top);
    };
    node.addEventListener('touchstart', start, { passive: true });
    node.addEventListener('touchmove', move, { passive: false });
    node.addEventListener('touchend', end, { passive: true });
    node.addEventListener('wheel', wheel, { passive: false });
    return { destroy() { node.removeEventListener('touchstart', start); node.removeEventListener('touchmove', move); node.removeEventListener('touchend', end); node.removeEventListener('wheel', wheel); } };
  }

  const strandLabel = (sc) => {
    const mid = (sc.a0 + sc.a1) / 2, lr = rad.rMax + 40;
    return { x: S + lr * Math.cos(mid), y: S + lr * Math.sin(mid) + 4, anchor: Math.cos(mid) > 0.3 ? 'start' : Math.cos(mid) < -0.3 ? 'end' : 'middle' };
  };
</script>

{#if !s}
  <p class="card">Ийм анги олдсонгүй.</p>
{:else}
  <div class="page" class:morphing style:--c={sphereLayout[s.id].color}>
    <header class="head">
      <h1>{s.title}</h1>
      <p class="key small">
        <span class="k new"></span> шинэ · <span class="k old">↑</span> өмнө үзсэнээ гүнзгийрүүлэх
        <span class="muted">· {fresh} шинэ, {s.topics.length - fresh} гүнзгийрүүлэх</span>
      </p>
      {#if st === 'known' || st === 'faded'}<span class="badge known">Мэднэ</span>{:else if st === 'next'}<span class="badge next">Дараагийн алхам энд байна</span>{/if}
    </header>

    <div class="panwrap">
    <div class="pan" bind:this={pan} use:pinch>
      <svg bind:this={mini} width={S * 2 * z} height={S * 2 * z} viewBox="0 0 {S * 2} {S * 2}" class="mini" out:home|global role="group" aria-label="{s.title}: сэдвүүд">
        <defs>
          <radialGradient id="ig-{s.id}" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color={s.color} stop-opacity="0.16" />
            <stop offset="100%" stop-color={s.color} stop-opacity="0" />
          </radialGradient>
        </defs>
        <circle cx={S} cy={S} r={rad.rMax + 40} fill="url(#ig-{s.id})" />
        {#each { length: Math.floor((rad.rMax + 1 - RAD.R0) / RAD.STEP) + 1 } as _, k}
          <circle cx={S} cy={S} r={RAD.R0 + k * RAD.STEP} class="ring" />
        {/each}
        {#each rad.sectors as sc}
          {@const L = strandLabel(sc)}
          <line x1={S + 44 * Math.cos(sc.a0)} y1={S + 44 * Math.sin(sc.a0)} x2={S + (rad.rMax + 34) * Math.cos(sc.a0)} y2={S + (rad.rMax + 34) * Math.sin(sc.a0)} class="border" />
          <text x={L.x} y={L.y} text-anchor={L.anchor} class="strand" style:fill={strands[sc.strand].color}>{strands[sc.strand].name}</text>
        {/each}
        {#each sprouts as e}<path d={e.d} class="e" class:root={e.root} class:on={e.on} style:stroke={strands[topics[e.t].strand].color} />{/each}
        <circle cx={S} cy={S} r="40" class="core" />
        <text x={S} y={S + 15} class="grade">{s.grade}</text>
        {#each s.topics as t (t)}
          {@const n = nodes[t]}
          {@const ts = topicState(t)}
          {@const nw = isFresh(t, s.id)}
          <g
            data-t={t}
            class="node {ts}"
            style:--tc={strands[topics[t].strand].color}
            role="button"
            tabindex="0"
            aria-label="{topics[t].name}, {nw ? 'шинэ' : 'гүнзгийрүүлэх'}"
            onclick={() => (ui.topic = t)}
            onkeydown={(ev) => (ev.key === 'Enter' || ev.key === ' ') && (ui.topic = t)}
          >
            <g class="bob" style:animation-delay="{-((n.x * 7 + n.y * 3) % 900) / 100}s" style:animation-duration="{7 + ((n.x + n.y) % 400) / 100}s">
            <circle cx={n.x} cy={n.y} r={RAD.NODE + 10} class="hit" />
            {#if ts === 'next'}<circle cx={n.x} cy={n.y} r={RAD.NODE + 6} class="halo" />{/if}
            {#if ui.topic === t}<circle cx={n.x} cy={n.y} r={RAD.NODE + 6} class="sel" />{/if}
            {#if nw}
              <circle cx={n.x} cy={n.y} r={RAD.NODE} class="c new" />
              <circle cx={n.x} cy={n.y} r="5" class="pip" />
            {:else}
              <circle cx={n.x} cy={n.y} r={RAD.NODE} class="c old" />
              <text x={n.x} y={n.y + 5} class="up">↑</text>
            {/if}
            {#each twoLines(topics[t].name, 16) as line, j}
              <text x={n.x} y={n.y + RAD.NODE + 13 + j * 12} class="n">{line}</text>
            {/each}
            {#if ts === 'known' || ts === 'faded'}<text x={n.x + RAD.NODE * 0.8} y={n.y - RAD.NODE * 0.7} class="ok">✓</text>{/if}
            </g>
          </g>
        {/each}
      </svg>
    </div>
    <div class="zoom" role="group" aria-label="Томруулах">
      <button onclick={() => zoomBtn(1.35)} aria-label="Томруулах" disabled={z >= Z_MAX}>+</button>
      <button onclick={() => zoomBtn(1 / 1.35)} aria-label="Жижигрүүлэх" disabled={z <= zMin + 0.001}>−</button>
    </div>
    </div>

    {#if from.length}
      <section class="journey">
        <h2>Өмнөх ангиудаас хэрэгтэй</h2>
        <p class="small muted">Энэ жилийн шинэ сэдвүүдэд эдгээр хэрэгтэй. Тасархай = 1–4-р ангийн суурь, нэг товшоод уншина.</p>
        <div class="chips">
          {#each from as f}<button class="chip {topicState(f)}" class:base={topics[f].base} onclick={() => (ui.topic = f)}><span class="dot"></span>{topics[f].name}<span class="g">{topics[f].base ? '1–4' : topics[f].grades[0]}</span></button>{/each}
        </div>
        {#if readiness(s) < 1 && !sphereKnown(s)}
          <p class="note small">
            {#if readiness(s) > 0}Өмнөх ангийн хэрэгтэй сэдвүүдийн {Math.round(readiness(s) * 100)}% нь танд бий.{/if}
            Эхлээд эдгээрийг үзвэл илүү амархан. Гэхдээ хүссэнээ үзэж болно.
          </p>
        {/if}
      </section>
    {/if}
    {#if onward.length}
      <section class="journey">
        <h2>Дараагийн ангиудад нээгдэнэ</h2>
        <div class="chips">
          {#each onward as o}<button class="chip {topicState(o)}" onclick={() => (ui.topic = o)}><span class="dot"></span>{topics[o].name}<span class="g">{topics[o].grades[0]}</span></button>{/each}
        </div>
      </section>
    {/if}

    <div class="actions">
      {#if s.entries.length}
        <a class="btn primary" href="#/test/{s.id}">Энэ ангийн шалгалт</a>
      {/if}
      <button class="link" onclick={() => { ui.fly = { sphere: s.id }; location.hash = '/'; }}>Газрын зураг дээр харах</button>
    </div>
  </div>
{/if}

<style>
  /* While dots glide in, everything else waits, then fades in. */
  .page > :not(.pan), .e, .n, .ok, .halo, .strand, .border, .ring { transition: opacity 0.35s ease-out, transform 0.35s ease-out; }
  .page.morphing > :not(.pan) { opacity: 0; transform: translateY(8px); }
  .page.morphing :is(.e, .n, .ok, .halo, .strand, .border, .ring) { opacity: 0; }
  .head { padding: 12px 0 8px; display: grid; gap: 6px; justify-items: start; }
  h1 { color: var(--c); text-shadow: 0 0 18px color-mix(in srgb, var(--c) 50%, transparent); }
  .key { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; }
  .k { display: inline-grid; place-items: center; width: 16px; height: 16px; border-radius: 50%; font-size: 10px; font-weight: 800; }
  .k.new { background: color-mix(in srgb, var(--c) 30%, transparent); border: 2px solid var(--c); }
  .k.old { border: 1.5px dashed var(--muted); color: var(--muted); }
  /* Pans both ways with the phone's own scrolling; bleeds to the screen edges. */
  .pan {
    margin: 0 -16px; height: min(68vh, 620px); overflow: auto; -webkit-overflow-scrolling: touch; overscroll-behavior: contain;
    border-block: 1px solid var(--line); scrollbar-width: none;
  }
  .pan::-webkit-scrollbar { display: none; }
  .panwrap { position: relative; }
  .zoom { position: absolute; right: 0; bottom: 10px; display: grid; gap: 6px; }
  .zoom button {
    width: 44px; height: 44px; border-radius: 50%; border: 1px solid var(--line); background: rgba(10, 14, 24, 0.9);
    color: var(--ink); font-size: 1.4rem; font-weight: 700; display: grid; place-items: center; backdrop-filter: blur(8px);
  }
  .zoom button:disabled { opacity: 0.35; }
  /* Life: each circle drifts a few pixels, slowly, like the spheres on the main map. */
  .bob { animation: bob 8s ease-in-out infinite alternate; }
  @keyframes bob { 0% { transform: translate(-2.5px, 1.5px); } 50% { transform: translate(2px, -2px); } 100% { transform: translate(-1px, 2.5px); } }
  /* Zoomed out smaller than the box: auto margins centre the map without cutting off any side when it is bigger. */
  .pan { display: grid; }
  .mini { display: block; margin: auto; overflow: visible; user-select: none; -webkit-user-select: none; -webkit-tap-highlight-color: transparent; }
  .ring { fill: none; stroke: var(--c); stroke-opacity: 0.1; }
  .border { stroke: #24304f; stroke-dasharray: 2 6; }
  .strand { font-size: 12px; font-weight: 800; }
  .e { fill: none; stroke-opacity: 0.6; stroke-width: 1.7; }
  .e.root { stroke-opacity: 0.22; stroke-width: 1.4; }
  .e.on { stroke-opacity: 1; stroke-width: 2.4; }
  .core { fill: #0b1226; stroke: var(--c); stroke-width: 2; }
  .grade { fill: var(--c); font-size: 42px; font-weight: 800; text-anchor: middle; }
  .node { cursor: pointer; outline: none; }
  .hit { fill: transparent; }
  .c.new { fill: color-mix(in srgb, var(--tc) 25%, var(--bg)); stroke: var(--tc); stroke-width: 2; }
  .c.old { fill: #0b1226; stroke: var(--tc); stroke-width: 1.8; stroke-dasharray: 4 3; }
  .pip { fill: var(--tc); }
  .up { fill: var(--tc); font-size: 13px; font-weight: 800; text-anchor: middle; pointer-events: none; }
  .node:focus-visible .c { stroke-width: 3.5; }
  .node.known .c { fill: color-mix(in srgb, var(--tc) 40%, var(--bg)); stroke-width: 3; filter: drop-shadow(0 0 6px var(--tc)); }
  .node.faded .c { stroke: var(--dusk); }
  .node.later { opacity: 0.6; }
  .halo { fill: none; stroke: var(--sun); stroke-width: 3; animation: pulse 2.2s ease-in-out infinite; }
  .sel { fill: none; stroke: var(--sun); stroke-width: 3; }
  @keyframes pulse { 50% { stroke-opacity: 0.25; } }
  .n { fill: var(--ink); font-size: 10px; font-weight: 600; text-anchor: middle; pointer-events: none; paint-order: stroke; stroke: var(--bg); stroke-width: 3px; }
  .ok { fill: var(--grass); font-size: 13px; font-weight: 800; pointer-events: none; }
  .journey { display: grid; gap: 6px; margin-top: 22px; }
  .journey h2 { margin-bottom: 2px; }
  .journey .chip { background: transparent; color: var(--ink); }
  .journey .chip.base { border-style: dashed; }
  .chip .g { margin-left: 6px; font-size: 0.75rem; color: var(--muted); font-family: var(--math); }
  .link { min-height: 44px; border: 0; background: none; padding: 0 8px; color: var(--sky); font-weight: 700; }
  .note { padding: 10px 12px; border-radius: 12px; background: var(--sun-soft); color: var(--sun); margin: 6px 0; }
  .actions { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin-top: 28px; }
  .actions a { text-decoration: none; }
  @media (prefers-reduced-motion: reduce) { .halo, .bob { animation: none; } }
</style>
