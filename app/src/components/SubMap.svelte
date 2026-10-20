<script>
  // A grade sphere opened up: a map that sprouts from the centre (owner, 2026-10-13).
  // The grade number sits in the middle and each strand owns a slice. Concepts coming back from earlier grades
  // (↑, dashed) sit on the inner ring; new concepts grow outward from the ones they need.
  // The map is wider than a phone, so it pans with the phone's own scrolling. It is the one place that zooms
  // (owner, 2026-10-13: "made as a circle ... so zoom is appropriate here and only here"): pinch, +/−, or ctrl+wheel.
  import { sphereById, topics, strands, isFresh } from '../lib/content.js';
  import { sphereLayout, gradeRadial, RAD, twoLines } from '../lib/layout.js';
  import { topicState, sphereState, readiness, sphereKnown, nextTopic } from '../lib/logic.js';
  import { ui } from '../lib/ui.svelte.js';
  import { onMount, onDestroy } from 'svelte';
  import { reduced } from '../lib/motion.js';
  import { zoomPlan, zoomLayer, fadeAlong, gradeOpacity, mapOpacity } from '../lib/zoom.js';
  import TopicIcon from './TopicIcon.svelte';
  import { route } from '../lib/router.svelte.js';

  let { id } = $props();
  let s = $derived(sphereById[id]);
  // Spotlight after the level check: the next topic beams, the rest dims, until it is tapped.
  let spot = $derived(ui.spotlight && s.topics.includes(nextTopic()));
  $effect(() => { if (ui.spotlight && ui.topic && ui.topic === nextTopic()) ui.spotlight = false; });
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
  let camEl = $state();
  let pageEl = $state();
  // Opened from the main map: start hidden, then the camera zoom (lib/zoom.js) brings the grade map in.
  let morphing = $state(!!(ui.morph && ui.morph.sphere === id && !reduced));

  // Where the grade number sits on screen and how many px one grade-map unit is, right now.
  function measure() {
    const r = pan.getBoundingClientRect();
    return { x: r.left + cam.x + S * cam.z, y: r.top + cam.y + S * cam.z, scale: cam.z };
  }
  const topBar = () => pageEl?.closest('.layer')?.querySelector(':scope > header.bar');
  // One zoom step for this page: the camera layer scales about F, the top bar only fades.
  function zoomHere(plan, dir) {
    const r = pan.getBoundingClientRect();
    const bar = topBar();
    if (bar) fadeAlong(bar, dir, (e) => gradeOpacity(e) ** 2).finished.then((a) => a.cancel()).catch(() => {});
    return zoomLayer(camEl, plan, { shift: -1, origin: { x: plan.F.x - r.left, y: plan.F.y - r.top }, opacity: gradeOpacity, dir });
  }

  onMount(() => {
    const m = ui.morph;
    // Cleared a frame later: the page's own entry transition still reads it to know it should not fade.
    requestAnimationFrame(() => (ui.morph = null));
    if (ui.back && ui.back.sphere === id) {
      // Going back to the main map runs the same zoom in reverse; the map asks for these when it comes back.
      ui.back.measure = measure;
      ui.back.run = (plan) => {
        morphing = true;
        if (plan) zoomHere(plan, 'out');
        else pageEl?.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, easing: 'ease-out', fill: 'forwards' });
      };
    }
    if (!morphing) return;
    // Wait one frame so the camera has its real size, then zoom in.
    requestAnimationFrame(() => {
      const plan = zoomPlan(m.c, m.rs, measure());
      if (!plan) {
        m.mapEl.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, easing: 'ease-out', fill: 'forwards' });
        morphing = false;
        return;
      }
      zoomLayer(m.mapEl, plan, { shift: 0, origin: plan.F, opacity: mapOpacity, dir: 'in' });
      zoomHere(plan, 'in').finished.then((a) => { a.cancel(); morphing = false; }).catch(() => {});
    });
  });

  // Left for another page (not the map): nothing will zoom back, so forget the open sphere.
  onDestroy(() => route.parts.length && (ui.back = null));

  // ---- camera, like a game map (owner: "normal like clash of clans") ----
  // The map is moved and scaled with one CSS transform, so it stays smooth: drag to move (with momentum),
  // pinch or +/− to zoom around the fingers, ctrl+wheel or trackpad pinch on a computer. It cannot fly away.
  const Z_MAX = 2.6;
  const STRAND_PX = 14; // on-screen size of the slice names
  let cam = $state({ x: 0, y: 0, z: 1 });
  let box = $state({ w: 360, h: 500 });
  let zMin = $derived(Math.min(0.6, box.w / (S * 2), box.h / (S * 2)));
  const clampZ = (v) => Math.min(Z_MAX, Math.max(zMin, v));
  // Keep the map on screen: a smaller map is centred, a bigger one cannot leave a gap at any edge.
  function fit(c) {
    const C = S * 2 * c.z;
    const ax = (len, pos) => (C <= len ? (len - C) / 2 : Math.min(0, Math.max(len - C, pos)));
    return { x: ax(box.w, c.x), y: ax(box.h, c.y), z: c.z };
  }
  // Zoom to nz keeping the map point under (px, py) in place.
  function zoomTo(nz, px, py, base = cam) {
    nz = clampZ(nz);
    const k = nz / base.z;
    cam = fit({ x: px - (px - base.x) * k, y: py - (py - base.y) * k, z: nz });
  }
  // Buttons glide to the new zoom instead of jumping.
  let anim = 0;
  function zoomBtn(f) {
    cancelAnimationFrame(anim);
    const from = cam.z, to = clampZ(cam.z * f), t0 = performance.now();
    const step = (now) => {
      const p = Math.min(1, (now - t0) / 220), e = 1 - (1 - p) ** 3;
      zoomTo(from + (to - from) * e, box.w / 2, box.h / 2);
      if (p < 1) anim = requestAnimationFrame(step);
    };
    anim = requestAnimationFrame(step);
  }
  function camera(node) {
    const pts = new Map();
    let last = null, moved = 0, vx = 0, vy = 0, lt = 0, glide = 0;
    const measure = () => { box = { w: node.clientWidth, h: node.clientHeight }; cam = fit(cam); };
    const local = (e) => { const r = node.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
    const pair = () => { const [a, b] = [...pts.values()]; return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, d: Math.hypot(a.x - b.x, a.y - b.y) }; };
    const down = (e) => {
      cancelAnimationFrame(glide); cancelAnimationFrame(anim);
      pts.set(e.pointerId, local(e));
      if (pts.size === 1) moved = 0;
      last = pts.size === 2 ? pair() : { ...local(e) };
      vx = vy = 0; lt = performance.now();
    };
    const move = (e) => {
      if (!pts.has(e.pointerId)) return;
      pts.set(e.pointerId, local(e));
      const now = performance.now(), dt = Math.max(1, now - lt);
      if (pts.size === 1) {
        const p = local(e), dx = p.x - last.x, dy = p.y - last.y;
        moved += Math.abs(dx) + Math.abs(dy);
        cam = fit({ ...cam, x: cam.x + dx, y: cam.y + dy });
        vx = dx / dt; vy = dy / dt; last = p;
      } else if (pts.size === 2) {
        const p = pair();
        moved += 10;
        const shifted = { ...cam, x: cam.x + p.x - last.x, y: cam.y + p.y - last.y };
        zoomTo(cam.z * (p.d / (last.d || p.d)), p.x, p.y, shifted);
        last = p;
      }
      lt = now;
    };
    const up = (e) => {
      if (!pts.delete(e.pointerId)) return;
      if (pts.size === 1) { last = { ...[...pts.values()][0] }; return; }
      if (pts.size) return;
      // Momentum: the map keeps sliding and slows down, like flicking a game map.
      let t = performance.now();
      const slide = (now) => {
        const dt = now - t; t = now;
        vx *= 0.92; vy *= 0.92;
        if (Math.hypot(vx, vy) < 0.02) return;
        cam = fit({ ...cam, x: cam.x + vx * dt, y: cam.y + vy * dt });
        glide = requestAnimationFrame(slide);
      };
      if (performance.now() - lt < 80) glide = requestAnimationFrame(slide);
    };
    // A drag is not a tap: swallow the click that ends a drag so a topic does not open by accident.
    const click = (e) => { if (moved > 8) { e.stopPropagation(); e.preventDefault(); } };
    const wheel = (e) => {
      if (!e.ctrlKey) return;
      e.preventDefault();
      const p = local(e);
      zoomTo(cam.z * Math.exp(-e.deltaY / 200), p.x, p.y);
    };
    measure();
    cam = fit({ x: (box.w - S * 2) / 2, y: (box.h - S * 2) / 2, z: 1 });
    const ro = new ResizeObserver(measure);
    ro.observe(node);
    node.addEventListener('pointerdown', down);
    addEventListener('pointermove', move);
    addEventListener('pointerup', up);
    addEventListener('pointercancel', up);
    node.addEventListener('click', click, true);
    node.addEventListener('wheel', wheel, { passive: false });
    return {
      destroy() {
        ro.disconnect(); cancelAnimationFrame(glide); cancelAnimationFrame(anim);
        node.removeEventListener('pointerdown', down);
        removeEventListener('pointermove', move); removeEventListener('pointerup', up); removeEventListener('pointercancel', up);
        node.removeEventListener('click', click, true); node.removeEventListener('wheel', wheel);
      },
    };
  }

  const EDGE = 6;
  // A name shows only while its own spot is on screen; then it is nudged in so the text is not cut off.
  let slabels = $derived(rad ? rad.sectors.flatMap((sc) => {
    const L = strandLabel(sc), name = strands[sc.strand].name;
    const w = name.length * STRAND_PX * 0.56 + 6, sx = cam.x + L.x * cam.z, sy = cam.y + L.y * cam.z;
    const left0 = L.anchor === 'start' ? sx : L.anchor === 'end' ? sx - w : sx - w / 2;
    if (sx < 0 || sx > box.w || sy < 0 || sy > box.h) return [];
    const top = Math.min(box.h - STRAND_PX - 8 - EDGE, Math.max(EDGE, sy - STRAND_PX));
    // Keep clear of the +/− buttons in the bottom-right corner.
    const right = top > box.h - 120 ? 64 : EDGE;
    return [{ strand: sc.strand, w, top, left: Math.min(box.w - w - right, Math.max(EDGE, left0)) }];
  }) : []);
  // Two names pushed to the same edge must not cover each other: move the later one down (or up at the bottom).
  let slabelsPlaced = $derived.by(() => {
    const out = [];
    for (const l of [...slabels].sort((a, b) => a.top - b.top)) {
      let top = l.top;
      for (let i = 0; i < 8; i++) {
        const hit = out.find((o) => Math.abs(o.top - top) < 22 && o.left < l.left + l.w && l.left < o.left + o.w);
        if (!hit) break;
        top = hit.top + 24 > box.h - 28 ? hit.top - 24 : hit.top + 24;
      }
      out.push({ ...l, top });
    }
    return out;
  });
  const strandLabel = (sc) => {
    const mid = (sc.a0 + sc.a1) / 2, lr = rad.rMax + 40;
    return { x: S + lr * Math.cos(mid), y: S + lr * Math.sin(mid) + 4, anchor: Math.cos(mid) > 0.3 ? 'start' : Math.cos(mid) < -0.3 ? 'end' : 'middle' };
  };
</script>

{#if !s}
  <p class="card">Ийм анги олдсонгүй.</p>
{:else}
  <div class="page" class:morphing class:spot bind:this={pageEl} style:--c={sphereLayout[s.id].color}>
    <header class="head">
      <h1>{s.title}</h1>
      <p class="key small">
        <span class="k new"></span> шинэ · <span class="k old"></span> өмнө үзсэнээ гүнзгийрүүлэх
        <span class="muted">· {fresh} шинэ, {s.topics.length - fresh} гүнзгийрүүлэх</span>
      </p>
      {#if st === 'known' || st === 'faded'}<span class="badge known">Мэднэ</span>{:else if st === 'next'}<span class="badge next">Дараагийн алхам энд байна</span>{/if}
    </header>

    <div class="panwrap">
    <div class="pan" bind:this={pan} use:camera>
      <!-- The camera layer: the zoom from the main map scales this, the pan and pinch move what is inside. -->
      <div class="cam" bind:this={camEl}>
      <svg bind:this={mini} width={S * 2} height={S * 2} style:transform="translate({cam.x}px, {cam.y}px) scale({cam.z})" viewBox="0 0 {S * 2} {S * 2}" class="mini" role="group" aria-label="{s.title}: сэдвүүд">
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
            {#if ts === 'next'}{#if spot}<circle cx={n.x} cy={n.y} r={RAD.NODE + 14} class="beacon" />{/if}<circle cx={n.x} cy={n.y} r={RAD.NODE + 6} class="halo" />{/if}
            {#if ui.topic === t}<circle cx={n.x} cy={n.y} r={RAD.NODE + 6} class="sel" />{/if}
            <!-- The topic's icon sits on top of this spot (HTML layer below); a returning topic gets a dashed ring. -->
            <circle cx={n.x} cy={n.y} r={RAD.NODE + 1} class="c" />
            {#if !nw}<circle cx={n.x} cy={n.y} r={RAD.NODE + 5} class="old" />{/if}
            {#each twoLines(topics[t].name, 16) as line, j}
              <text x={n.x} y={n.y + RAD.NODE + 16 + j * 12} class="n">{line}</text>
            {/each}
            </g>
          </g>
        {/each}
      </svg>
      <!-- Topic icons (the same icon bank as the topic card), moved by the same camera as the map under them. -->
      <div class="icons" style:width="{S * 2}px" style:height="{S * 2}px" style:transform="translate({cam.x}px, {cam.y}px) scale({cam.z})" aria-hidden="true">
        {#each s.topics as t (t)}
          {@const n = nodes[t]}
          {@const ts = topicState(t)}
          <div class="bob ib" data-i={t} class:later={ts === 'later'} class:nx={ts === 'next'} style:left="{n.x - RAD.NODE - 1}px" style:top="{n.y - RAD.NODE - 1}px" style:animation-delay="{-((n.x * 7 + n.y * 3) % 900) / 100}s" style:animation-duration="{7 + ((n.x + n.y) % 400) / 100}s">
            <TopicIcon id={t} size={RAD.NODE * 2 + 2} known={ts === 'known' || ts === 'faded'} />
          </div>
        {/each}
      </div>
      </div>
      <!-- Slice names: one readable size at every zoom. A name shows while its own spot is on screen and is nudged
           inward when its fixed-size text would stick out past the edge (owner, 2026-10-13). -->
      {#each slabelsPlaced as l (l.strand)}
        <span class="strand" style:left="{l.left}px" style:top="{l.top}px" style:color={strands[l.strand].color}>{strands[l.strand].name}</span>
      {/each}
    </div>
    <div class="zoom" role="group" aria-label="Томруулах">
      <button onclick={() => zoomBtn(1.35)} aria-label="Томруулах" disabled={cam.z >= Z_MAX - 0.001}>+</button>
      <button onclick={() => zoomBtn(1 / 1.35)} aria-label="Жижигрүүлэх" disabled={cam.z <= zMin + 0.001}>−</button>
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
  /* While the camera zooms, only the grade map itself shows; the rest fades in after it lands. */
  .page > :not(.panwrap), .head, .strand, .zoom, .pan { transition: opacity 0.3s cubic-bezier(0.23, 1, 0.32, 1), transform 0.3s cubic-bezier(0.23, 1, 0.32, 1), border-color 0.3s; }
  .page.morphing > :not(.panwrap), .page.morphing :is(.head, .strand, .zoom) { opacity: 0; transform: translateY(6px); transition-duration: 0.14s; }
  .page.morphing .pan { border-color: transparent; }
  .cam { position: absolute; inset: 0; }
  .icons { position: absolute; left: 0; top: 0; transform-origin: 0 0; pointer-events: none; }
  .ib { position: absolute; }
  .ib.later { opacity: 0.6; }
  .page.spot .node:not(.next), .page.spot .ib:not(.nx), .page.spot .e, .page.spot .border, .page.spot .strand { opacity: 0.15; transition: opacity 0.6s ease-out; }
  .page.spot .node.next .halo { stroke-width: 5; animation-duration: 1.2s; }
  .beacon { fill: none; stroke: var(--sun); stroke-width: 6; transform-box: fill-box; transform-origin: center; animation: beacon 1.6s ease-out infinite; filter: drop-shadow(0 0 12px var(--sun)); pointer-events: none; }
  @keyframes beacon { from { transform: scale(0.9); stroke-opacity: 1; } to { transform: scale(1.5); stroke-opacity: 0; } }
  .head { padding: 12px 0 8px; display: grid; gap: 6px; justify-items: start; }
  h1 { color: var(--c); text-shadow: 0 0 18px color-mix(in srgb, var(--c) 50%, transparent); }
  .key { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; }
  .k { display: inline-grid; place-items: center; width: 16px; height: 16px; border-radius: 50%; font-size: 10px; font-weight: 800; }
  .k.new { border-radius: 5px; background: color-mix(in srgb, var(--c) 30%, transparent); border: 1.5px solid var(--c); }
  .k.old { border: 1.5px dashed var(--muted); }
  /* Pans both ways with the phone's own scrolling; bleeds to the screen edges. */
  .pan {
    margin: 0 -16px; height: min(68vh, 620px); overflow: hidden; position: relative; touch-action: none; cursor: grab;
    contain: strict; /* fixed size: the map's many nodes never trigger layout outside it */
    border-block: 1px solid var(--line); scrollbar-width: none;
  }
  .pan::-webkit-scrollbar { display: none; }
  .panwrap { position: relative; }
  .zoom { position: absolute; right: 0; bottom: 10px; display: grid; gap: 6px; }
  .zoom button {
    width: 44px; height: 44px; border-radius: 50%; border: 1px solid var(--line); background: rgba(12, 15, 21, 0.9);
    color: var(--ink); font-size: 1.4rem; font-weight: 700; display: grid; place-items: center; backdrop-filter: blur(8px);
  }
  .zoom button:disabled { opacity: 0.35; }
  /* Life: each circle drifts a few pixels, slowly, like the spheres on the main map. */
  .bob { animation: bob 8s ease-in-out infinite alternate; }
  @keyframes bob { 0% { transform: translate(-2.5px, 1.5px); } 50% { transform: translate(2px, -2px); } 100% { transform: translate(-1px, 2.5px); } }
  .pan:active { cursor: grabbing; }
  .mini { position: absolute; left: 0; top: 0; transform-origin: 0 0; will-change: transform; display: block; overflow: visible; user-select: none; -webkit-user-select: none; -webkit-tap-highlight-color: transparent; }
  .ring { fill: none; stroke: var(--c); stroke-opacity: 0.1; }
  .border { stroke: #262C38; stroke-dasharray: 2 6; }
  /* Slice names keep one readable size on screen at every zoom; they stay in place on the map. */
  .strand {
    position: absolute; z-index: 1; pointer-events: none; white-space: nowrap; font-size: 14px; font-weight: 800; line-height: 1.2;
    padding: 0 3px; border-radius: 6px; background: color-mix(in srgb, var(--bg) 70%, transparent);
  }
  .e { fill: none; stroke-opacity: 0.6; stroke-width: 1.7; }
  .e.root { stroke-opacity: 0.22; stroke-width: 1.4; }
  .e.on { stroke-opacity: 1; stroke-width: 2.4; }
  .core { fill: #12161E; stroke: var(--c); stroke-width: 2; }
  .grade { fill: var(--c); font-size: 42px; font-weight: 800; text-anchor: middle; }
  .node { cursor: pointer; outline: none; }
  .hit { fill: transparent; }
  .c { fill: var(--bg); stroke: none; }
  .old { fill: none; stroke: var(--tc); stroke-width: 1.6; stroke-dasharray: 4 3; stroke-opacity: 0.8; }
  .node:focus-visible .old, .node:focus-visible .c { stroke: var(--sky); stroke-width: 3; }
  .node.faded .old { stroke: var(--dusk); }
  .node.later { opacity: 0.6; }
  .halo { fill: none; stroke: var(--sun); stroke-width: 3; animation: pulse 2.2s ease-in-out infinite; }
  .sel { fill: none; stroke: var(--sun); stroke-width: 3; }
  @keyframes pulse { 50% { stroke-opacity: 0.25; } }
  .n { fill: var(--ink); font-size: 10px; font-weight: 600; text-anchor: middle; pointer-events: none; paint-order: stroke; stroke: var(--bg); stroke-width: 3px; }
  .journey { display: grid; gap: 6px; margin-top: 22px; }
  .journey h2 { margin-bottom: 2px; }
  .journey .chip { background: transparent; color: var(--ink); }
  .journey .chip.base { border-style: dashed; }
  .chip .g { margin-left: 6px; font-size: 0.75rem; color: var(--muted); font-family: var(--math); }
  .link { min-height: 44px; border: 0; background: none; padding: 0 8px; color: var(--sky); font-weight: 700; }
  .note { padding: 10px 12px; border-radius: 12px; background: var(--sun-soft); color: var(--sun); margin: 6px 0; }
  .actions { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin-top: 28px; }
  .actions a { text-decoration: none; }
  @media (prefers-reduced-motion: reduce) { .halo, .bob, .beacon { animation: none; } }
</style>
