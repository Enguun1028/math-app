<script>
  import HotTopics from './HotTopics.svelte';
  // The explorable neon map. It scrolls like a feed, using the phone's own scrolling (momentum and
  // rubber band come from the system, exactly as in Instagram). No zoom: tapping a sphere opens it.
  // Spheres drift slightly, like a slow DVD-logo bounce.
  // Since the 2026-10-13 rebuild each sphere is one school grade (5–12). Its dots are every concept taught that
  // year: a filled dot is new that year, a ring is a concept coming back to be studied deeper.
  import { onMount, tick } from 'svelte';
  import { fly } from 'svelte/transition';
  import { spheres, topics, sphereById, isFresh } from '../lib/content.js';
  import { sphereLayout, dotLayout, world } from '../lib/layout.js';
  import { sphereState, nextTopic, levelChecked } from '../lib/logic.js';
  import { progress, save } from '../lib/progress.svelte.js';
  import { ui } from '../lib/ui.svelte.js';
  import { go, route } from '../lib/router.svelte.js';
  import { ms, ease, reduced } from '../lib/motion.js';
  import { zoomPlan, zoomLayer, mapOpacity } from '../lib/zoom.js';

  let W = $state(400);
  let H = $state(800);
  let mapEl, scroller, svg;

  let next = $derived(nextTopic());
  // ---- geometry ----
  // One fixed scale: the map fits the phone's width. On a wide screen (phone turned sideways, computer)
  // it stays a phone-width column in the middle instead of blowing up.
  const TOP_PAD = 40; // room above the first sphere title (the story row sits above the map)
  const BOTTOM_PAD = 230; // room above the next-step card and the tab bar
  const MAX_COL = 560;
  const worldW = world.maxX - world.minX;
  const worldH = world.maxY - world.minY;
  // Side room for the drift, the glow and the sphere names, so no sphere touches the screen edge.
  const SIDE_PAD = 34;
  let k = $derived((Math.min(W, MAX_COL) - 2 * SIDE_PAD) / worldW);
  let ox = $derived(W / 2 - ((world.minX + world.maxX) / 2) * k);
  let oy = $derived(TOP_PAD - world.minY * k);
  let contentH = $derived(worldH * k + TOP_PAD + BOTTOM_PAD);

  // Faint stars scattered through the world.
  const stars = Array.from({ length: 160 }, (_, i) => {
    const r = (n) => ((Math.sin(i * 127.1 + n * 311.7) * 43758.5453) % 1 + 1) % 1;
    return { x: world.minX - 400 + r(1) * (worldW + 800), y: world.minY - 200 + r(2) * (worldH + 400), s: 2 + r(3) * 6, o: 0.15 + r(4) * 0.5 };
  });

  // The journey line through the sphere centres.
  const journey = (() => {
    const c = spheres.map((s) => sphereLayout[s.id]);
    let d = `M ${c[0].x} ${c[0].y}`;
    for (let i = 1; i < c.length; i++) {
      const my = (c[i - 1].y + c[i].y) / 2;
      d += ` C ${c[i - 1].x} ${my}, ${c[i].x} ${my}, ${c[i].x} ${c[i].y}`;
    }
    return d;
  })();

  // Drift: each sphere moves in a straight line inside a small box and bounces off its edges.
  // Sideways and up-down run as separate back-and-forth motions with different speeds, which is exactly a DVD bounce.
  const DRIFT_PX = 10; // half the box size, in screen pixels (about 1.5 mm on a phone)
  const drift = spheres.map((s, i) => ({
    dx: 7 + ((i * 2.3) % 5),
    dy: 9.5 + ((i * 3.1) % 6),
    delay: -((i * 4.7) % 9),
  }));

  // Dot size inside a sphere, in world units (about 3.5 px on a phone).
  let DOT_R = $derived(3.6 / k);

  // The open topic card's thread: one line through every grade that teaches the concept (the curriculum's spiral).
  let thread = $derived.by(() => {
    const t = ui.topic && topics[ui.topic];
    if (!t || t.grades.length < 2) return null;
    const p = t.grades.map((g) => dotLayout['g' + g + ':' + t.id]);
    let d = `M ${p[0].x} ${p[0].y}`;
    for (let i = 1; i < p.length; i++) {
      const my = (p[i - 1].y + p[i].y) / 2;
      d += ` C ${p[i - 1].x} ${my}, ${p[i].x} ${my}, ${p[i].x} ${p[i].y}`;
    }
    return d;
  });

  // An <svg> has no offsetTop (it gave NaN, so no map scroll ever moved); its spot in the scroller is measured instead.
  const svgTop = () => svg.getBoundingClientRect().top - scroller.getBoundingClientRect().top + scroller.scrollTop;
  const scrollToWorldY = (wy, at = 0.45, smooth = true) =>
    scroller.scrollTo({ top: svgTop() + oy + wy * k - H * at, behavior: smooth && !reduced ? 'smooth' : 'auto' });

  // ---- opening a sphere: the camera zooms into it (lib/zoom.js) ----
  // The grade map page runs the zoom once it knows where its own centre sits; here we only note where the sphere is.
  let opening = false;
  function sphereGeo(id) {
    const rim = mapEl.querySelector(`[data-sphere="${id}"] .rim`);
    if (!rim) return null;
    const r = rim.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }
  function openSphere(id) {
    if (opening) return;
    opening = true;
    ui.introSphere = null;
    const geo = { sphere: id, c: sphereGeo(id), rs: sphereLayout[id].ks * k };
    ui.morph = { ...geo, mapEl };
    ui.back = geo;
    ui.scrollY = scroller.scrollTop;
    if (!reduced) mapEl.classList.add('zooming');
    go('/s/' + id);
  }
  // Back before the zoom finished: the same map comes back, so undo the zoom (else it stays invisible
  // and the spheres stop opening).
  $effect(() => {
    if (!route.parts.length && opening) {
      opening = false;
      mapEl.getAnimations().forEach((a) => a.cancel());
      mapEl.classList.remove('zooming');
    }
  });

  onMount(() => {
    const resize = () => {
      W = innerWidth;
      H = innerHeight;
    };
    resize();
    addEventListener('resize', resize);
    // Wait until the map has its real size before scrolling it.
    tick().then(restore);
    // After the level check, known spheres light up one by one, once.
    if (ui.reveal) setTimeout(() => (ui.reveal = false), 4500);
    return () => {
      removeEventListener('resize', resize);
      if (!opening) ui.scrollY = scroller.scrollTop;
    };
  });

  function restore() {
    if (ui.fly) {
      // Asked to show a sphere or topic on the map: scroll there.
      const s = sphereLayout[ui.fly.sphere ?? topics[ui.fly.topic]?.sphere] ?? sphereLayout[spheres[0].id];
      scroller.scrollTop = ui.scrollY ?? 0;
      requestAnimationFrame(() => scrollToWorldY(s.y));
      ui.fly = null;
      ui.back?.run?.(null);
      ui.back = null;
    } else if (ui.scrollY != null) {
      scroller.scrollTop = ui.scrollY;
      const b = ui.back;
      if (b) {
        // Back from a grade map: the camera zooms out of it, the grade map shrinking into its sphere.
        const plan = b.measure && zoomPlan(sphereGeo(b.sphere) ?? b.c, b.rs, b.measure());
        if (plan) {
          mapEl.classList.add('zooming');
          zoomLayer(mapEl, plan, { shift: 0, origin: plan.F, opacity: mapOpacity, dir: 'out' }).finished
            .then((a) => { a.cancel(); mapEl.classList.remove('zooming'); })
            .catch(() => {});
        } else if (!reduced) {
          mapEl.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 240, easing: 'ease-out' });
        }
        b.run?.(plan);
      }
      // Cleared once the page that is closing has used it for its own half of the motion.
      setTimeout(() => (ui.back = null), 700);
    } else {
      // First look: scrolled to the sphere the tutorial points at, else the one with the next step (or the first one).
      const s = sphereLayout[ui.introSphere ?? (next ? topics[next].sphere : spheres[0].id)];
      scrollToWorldY(s.y, 0.45, false);
    }
  }

  // Sphere titles stay fully on screen even when the sphere sits at the edge.
  const titleX = (wx, text) => {
    const half = [...text].length * 5.6 + 8;
    return (Math.min(W - half, Math.max(half, wx * k + ox)) - ox) / k;
  };

  // ---- level, then the next step ----
  // The "Дараагийн алхам" card is gone (owner, 2026-10-22: "its distraction"); the next sphere still glows.
  // No "next step" until we know the student's level. Before that, a small "Дутагдлаа олъё" button
  // opens the explanation and the check. After it, a card names the next topic with "Сурах цаг!".
  let known = $derived(levelChecked());
  // After the level check the next step is the only bright thing on the map until it is tapped (owner, 2026-10-20).
  let spot = $derived(ui.spotlight && !!next && !ui.reveal);
  $effect(() => { if (ui.spotlight && next && ui.topic === next) ui.spotlight = false; });
</script>

<div class="map" class:spot bind:this={mapEl}>
  <div class="scroller" bind:this={scroller}>
    <!-- Stories sit at the top of the map and scroll away with it, like Instagram (owner: not persistent). -->
    <div class="stories"><HotTopics /></div>
    <!-- Each sphere is its own small picture in an HTML box that drifts (2026-10-31, lag fix): moving a box is done by
         the graphics chip alone, while drifting groups inside one big SVG made the phone repaint the whole map,
         all stars and dots, on every frame. Stars and the journey line sit below; titles and the thread above. -->
    <div class="world" style:height="{contentH}px">
    <svg bind:this={svg} width={W} height={contentH} aria-hidden="true">
      <g transform="translate({ox} {oy}) scale({k})">
        {#each stars as st}<circle cx={st.x} cy={st.y} r={st.s} class="star" opacity={st.o} />{/each}
        <path d={journey} class="journey" style:stroke-width={2.5 / k} style:stroke-dasharray="{2 / k} {14 / k}" />
      </g>
    </svg>
    <div class="spheres" style:--a="{DRIFT_PX}px" role="group" aria-label="Математикийн газрын зураг">
        {#each spheres as s, i (s.id)}
          {@const L = sphereLayout[s.id]}
          {@const st = sphereState(s)}
          {@const P = L.R * 1.45 + 30 / k}
          <div class="dx" style:left="{ox + (L.x - P) * k}px" style:top="{oy + (L.y - P) * k}px" style:width="{2 * P * k}px" style:height="{2 * P * k}px" style:animation-duration="{drift[i].dx}s" style:animation-delay="{drift[i].delay}s">
            <div class="dy" style:animation-duration="{drift[i].dy}s" style:animation-delay="{drift[i].delay * 1.3}s">
              <svg viewBox="{L.x - P} {L.y - P} {2 * P} {2 * P}" width={2 * P * k} height={2 * P * k}>
              <defs>
                <radialGradient id="g-{s.id}" cx="50%" cy="45%" r="55%">
                  <stop offset="0%" stop-color={L.color} stop-opacity="0.28" />
                  <stop offset="70%" stop-color={L.color} stop-opacity="0.08" />
                  <stop offset="100%" stop-color={L.color} stop-opacity="0.02" />
                </radialGradient>
              </defs>
              <g
                data-sphere={s.id}
                class="sphere {st}"
                class:reveal={ui.reveal && (st === 'known' || st === 'faded')}
                style:--d="{0.3 + i * 0.28}s"
                style:--c={L.color}
                role="button"
                tabindex="0"
                aria-label="{s.title}, {s.topics.length} сэдэв"
                onclick={() => openSphere(s.id)}
                onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && openSphere(s.id)}
              >
                <circle cx={L.x} cy={L.y} r={L.R} fill="url(#g-{s.id})" class="body" />
                <circle cx={L.x} cy={L.y} r={L.R} class="rim" style:stroke-width={2 / k} />
                {#if ui.introSphere === s.id}<circle cx={L.x} cy={L.y} r={L.R + 18 / k} class="beacon" style:stroke-width={10 / k} />{/if}
                {#if st === 'next'}
                  {#if spot}<circle cx={L.x} cy={L.y} r={L.R + 18 / k} class="beacon" style:stroke-width={10 / k} />{/if}
                  <circle cx={L.x} cy={L.y} r={L.R + 10 / k} class="halo" />
                  <circle cx={L.x} cy={L.y} r={L.R + 14 / k} class="pulse" style:stroke-width={4 / k} />
                {/if}
                <text x={L.x} y={L.y + L.R * 0.1} class="sgrade" font-size={L.R * 0.3}>{s.grade}</text>
                {#each s.topics as t (t)}
                  {@const D = dotLayout[s.id + ':' + t]}
                  {#if ui.topic === t}
                    <circle cx={D.x} cy={D.y} r={DOT_R * 1.8} class="dot on" />
                  {:else if isFresh(t, s.id)}
                    <circle cx={D.x} cy={D.y} r={DOT_R} class="dot" style:fill={D.color} />
                  {:else}
                    <circle cx={D.x} cy={D.y} r={DOT_R * 0.85} class="dot ring" style:stroke={D.color} style:stroke-width={1.3 / k} />
                  {/if}
                {/each}
              </g>
              </svg>
            </div>
          </div>
        {/each}
    </div>
    <svg class="over" width={W} height={contentH} aria-hidden="true">
      <g transform="translate({ox} {oy}) scale({k})">
        {#each spheres as s (s.id)}
          {@const L = sphereLayout[s.id]}
          {@const st = sphereState(s)}
          {@const label = s.title}
          {@const count = `${s.fresh.length} шинэ · ${s.topics.length - s.fresh.length} гүнзгийрүүлэх`}
          <text x={titleX(L.x, label)} y={L.y - L.R - 34 / k} class="stitle" class:next={st === 'next'} font-size={17 / k} style:stroke-width={6 / k}>{label}</text>
          <text x={titleX(L.x, count) } y={L.y - L.R - 14 / k} class="scount" font-size={12 / k} style:stroke-width={5 / k}>{count}</text>
        {/each}
        {#if thread}<path d={thread} class="thread" style:stroke-width={2.2 / k} style:stroke-dasharray="{6 / k} {5 / k}" />{/if}
      </g>
    </svg>
    </div>
  </div>

  <header class="hud-top">
    <div class="toprow">
      <span class="toggle-room" aria-hidden="true"></span>
      <button class="lvl" onclick={() => (ui.level = true)}>
        <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5M11 8v6M8 11h6" /></svg>
        <span>Түвшин<br />тодорхойлох</span>
      </button>
    </div>
    {#if ui.welcome}
      <div class="welcome" transition:fly={{ y: -8, duration: ms(260), easing: ease }}>
        <div>
          <strong>Тавтай морил.</strong>
          <span class="small muted">Газрын зураг чинь хэвээрээ.</span>
        </div>
        <a class="btn primary" href="#/warmup" onclick={() => (ui.welcome = false)}>3 асуултаар сэргээх</a>
        <button class="sheet-close" aria-label="Хаах" onclick={() => (ui.welcome = false)}>×</button>
      </div>
    {/if}
  </header>

  <div class="hud-bottom">
    {#if ui.introSphere && !ui.tour}
      <!-- End of the tutorial level: the student's own grade glows; tapping it is the last step. -->
      <div class="introtip" transition:fly={{ y: 30, duration: ms(300), easing: ease }}>
        <strong>Энэ гэрэлтэж буй бөмбөлөг бол таны {sphereById[ui.introSphere].grade}-р анги.</strong>
        <span class="small muted">Дарж нээгээд, дотор нь сэдвүүдээ үзээрэй.</span>
      </div>
    {:else if !known}
      <button class="find" onclick={() => (ui.level = true)} transition:fly={{ y: 30, duration: ms(300), easing: ease }}>
        <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5M11 8v6M8 11h6" /></svg>
        Түвшин тодорхойлох
      </button>
    {/if}
  </div>
</div>

<style>
  .map { position: fixed; inset: 0; overflow: hidden; }
  /* Soft fades behind the top and bottom controls, so map labels slide under them instead of clashing. */
  .map::before, .map::after { content: ''; position: fixed; left: 0; right: 0; z-index: 4; pointer-events: none; }
  .map::before { top: 0; height: 90px; background: linear-gradient(var(--bg) 35%, transparent); }
  .map::after { bottom: 0; height: calc(var(--tabbar-h) + 150px); background: linear-gradient(transparent, var(--bg) 75%); }
  /* While the camera zooms, the buttons and edge fades step aside so only the map moves. */
  .map::before, .map::after, .stories, .hud-top, .hud-bottom { transition: opacity 0.2s ease-out; }
  .map:global(.zooming) { pointer-events: none; }
  .map:global(.zooming)::before, .map:global(.zooming)::after, .map:global(.zooming) :is(.stories, .hud-top, .hud-bottom) { opacity: 0; transition-duration: 0.12s; }
  /* The phone's own scrolling: momentum and rubber band come from the system. */
  .scroller { position: absolute; inset: 0; overflow-x: hidden; overflow-y: auto; -webkit-overflow-scrolling: touch; overscroll-behavior-y: contain; }
  .stories { max-width: 560px; margin: 0 auto; padding: calc(env(safe-area-inset-top, 0px) + 62px) 16px 0; position: relative; z-index: 5; }
  .scroller svg { display: block; overflow: visible; user-select: none; -webkit-user-select: none; -webkit-tap-highlight-color: transparent; }
  .world { position: relative; }
  .spheres { position: absolute; inset: 0; pointer-events: none; }
  .spheres .dx { position: absolute; }
  .spheres .dy { width: 100%; height: 100%; }
  .spheres .sphere { pointer-events: auto; }
  .over { position: absolute; left: 0; top: 0; pointer-events: none; }
  .star { fill: #cfe8ff; }
  .journey { fill: none; stroke: var(--sky); stroke-opacity: 0.35; stroke-linecap: round; }

  /* Drift: linear back-and-forth on each axis with different periods = a slow DVD-logo bounce. */
  .dx { animation: dx 9s linear infinite alternate; }
  .dy { animation: dy 11s linear infinite alternate; }
  /* Drift never pauses, also while scrolling (owner, 2026-10-12): a pause felt like the map froze. */
  .dx, .dy { will-change: transform; }
  @keyframes dx { from { transform: translateX(calc(-1 * var(--a))); } to { transform: translateX(var(--a)); } }
  @keyframes dy { from { transform: translateY(calc(-1 * var(--a))); } to { transform: translateY(var(--a)); } }

  .sphere { cursor: pointer; outline: none; }
  .rim { fill: none; stroke: var(--c); stroke-opacity: 0.45; }
  .sphere:focus-visible .rim { stroke-opacity: 1; }
  .sphere.known .rim { stroke-opacity: 0.9; }
  .sphere.faded .rim { stroke: var(--dusk); }
  .sphere.later .body { opacity: 0.6; }
  .sphere.reveal .rim { animation: lightup 1.1s var(--d) cubic-bezier(0.32, 0.72, 0, 1) both; }
  .sphere.reveal .body { animation: fillup 1.1s var(--d) ease-out both; }
  @keyframes lightup { from { stroke-opacity: 0.1; } 60% { stroke-opacity: 1; } }
  @keyframes fillup { from { opacity: 0.2; } }
  .halo { fill: var(--sun); fill-opacity: 0.1; }
  .pulse { fill: none; stroke: var(--sun); animation: pulse 2.6s ease-in-out infinite; }
  @keyframes pulse { 50% { stroke-opacity: 0.2; } }
  .stitle { fill: var(--ink); font-weight: 800; text-anchor: middle; letter-spacing: 0.01em; paint-order: stroke; stroke: var(--bg); pointer-events: none; }
  .stitle.next { fill: var(--sun); }
  .sgrade { fill: var(--c); fill-opacity: 0.9; text-anchor: middle; dominant-baseline: middle; font-weight: 800; pointer-events: none; }
  .scount { fill: var(--muted); text-anchor: middle; font-weight: 600; pointer-events: none; paint-order: stroke; stroke: var(--bg); }
  .dot { pointer-events: none; }
  .dot.ring { fill: none; }
  .dot.on { fill: var(--sun); }
  .thread { fill: none; stroke: var(--sun); stroke-opacity: 0.9; pointer-events: none; }
  .sdot { width: 14px; height: 14px; border-radius: 50%; background: var(--sc); box-shadow: 0 0 10px var(--sc); }

  .hud-top { position: fixed; top: 0; left: 0; right: 0; padding: 14px 16px 0; max-width: 560px; margin: 0 auto; z-index: 5; pointer-events: none; }
  .hud-top > * { pointer-events: auto; }
  .toprow { display: flex; align-items: center; justify-content: space-between; gap: 8px; min-height: 30px; margin-bottom: 8px; pointer-events: none; }
  .toprow > button { pointer-events: auto; }
  /* Level check: a labelled gold button, easy to spot (owner, 2026-10-20: the plain icon was missed). */
  .lvl { display: inline-flex; align-items: center; gap: 7px; min-height: 46px; padding: 5px 12px 5px 9px; border-radius: 14px;
    color: var(--sun); background: rgba(12, 15, 21, 0.92); border: 1.5px solid rgba(255, 204, 102, 0.75);
    box-shadow: 0 0 18px rgba(255, 204, 102, 0.28); font-size: 0.78rem; font-weight: 800; line-height: 1.1; text-align: left; }
  .lvl svg { flex: none; width: 24px; height: 24px; fill: none; stroke: currentColor; stroke-width: 2.2; stroke-linecap: round; }
  .welcome {
    position: relative; margin-top: 10px; padding: 14px 52px 14px 16px; display: grid; gap: 10px; justify-items: start;
    border-radius: 18px; background: rgba(12, 15, 21, 0.97); border: 1px solid color-mix(in srgb, var(--grass) 45%, var(--line));
  }
  .welcome > div { display: grid; }
  .welcome a { text-decoration: none; }

  .hud-bottom {
    position: fixed; left: 0; right: 0; bottom: 0; z-index: 5; display: grid; gap: 10px;
    padding: 0 16px calc(var(--tabbar-h) + env(safe-area-inset-bottom) + 34px); max-width: 560px; margin: 0 auto; pointer-events: none;
  }
  .hud-bottom > * { pointer-events: auto; grid-area: 1 / 1; }
  .introtip {
    display: grid; gap: 4px; padding: 12px 14px; border-radius: 18px; background: rgba(12, 15, 21, 0.97);
    border: 2px solid var(--sun); box-shadow: 0 0 28px rgba(255, 204, 102, 0.25);
  }
  .find {
    justify-self: stretch; display: flex; align-items: center; justify-content: center; gap: 10px; min-height: 60px; padding: 0 22px;
    border-radius: 999px; font-size: 1.15rem; font-weight: 800; color: #2a1a00;
    background: var(--sun); border: 0;
    box-shadow: 0 0 28px rgba(255, 204, 102, 0.45); position: relative;
  }
  /* Breathing glow as a still shadow fading in and out (opacity only, no repaint). */
  .find::after { content: ''; position: absolute; inset: 0; border-radius: inherit; box-shadow: 0 0 48px rgba(255, 204, 102, 0.7); opacity: 0; pointer-events: none; animation: glow 2.2s ease-in-out infinite; }
  .find svg { width: 24px; height: 24px; fill: none; stroke: currentColor; stroke-width: 2.4; stroke-linecap: round; }
  @keyframes glow { 50% { opacity: 1; } }
  /* Spotlight after the level check: everything dims, the next step beams. */
  .map.spot .sphere:not(.next), .map.spot .stitle:not(.next), .map.spot .scount, .map.spot .thread, .map.spot .journey { opacity: 0.15; transition: opacity 0.6s ease-out; }
  .map.spot .hud-top, .map.spot .stories { opacity: 0.3; }
  .beacon { fill: none; stroke: var(--sun); transform-box: fill-box; transform-origin: center; animation: beacon 1.6s ease-out infinite; pointer-events: none; }
  @keyframes beacon { from { transform: scale(0.92); opacity: 1; } to { transform: scale(1.35); opacity: 0; } }
  .map.spot .halo { fill-opacity: 0.32; }
  .map.spot .pulse { stroke-opacity: 1; animation-duration: 1.2s; }

  @media (prefers-reduced-motion: reduce) {
    .dx, .dy, .pulse, .find::after, .beacon { animation: none; }
  }
</style>
