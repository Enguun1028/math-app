<script>
  import RichText from './RichText.svelte';
  import HotTopics from './HotTopics.svelte';
  // The explorable neon map. It scrolls like a feed, using the phone's own scrolling (momentum and
  // rubber band come from the system, exactly as in Instagram). No zoom: tapping a sphere opens it.
  // Spheres drift slightly, like a slow DVD-logo bounce.
  // Since the 2026-10-13 rebuild each sphere is one school grade (5–12). Its dots are every concept taught that
  // year: a filled dot is new that year, a ring is a concept coming back to be studied deeper.
  import { onMount, tick } from 'svelte';
  import { fly } from 'svelte/transition';
  import { spheres, topics, sphereById, topicEntries, strands, isFresh } from '../lib/content.js';
  import { sphereLayout, dotLayout, world } from '../lib/layout.js';
  import { sphereState, nextTopic, levelChecked, checkLeft, entryState } from '../lib/logic.js';
  import { progress, save } from '../lib/progress.svelte.js';
  import { ui } from '../lib/ui.svelte.js';
  import { go } from '../lib/router.svelte.js';
  import { ms, ease, reduced } from '../lib/motion.js';

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

  // Screen position of a world point right now.
  function toScreen(wx, wy) {
    const r = svg.getBoundingClientRect();
    return { x: r.left + ox + wx * k, y: r.top + oy + wy * k };
  }
  const scrollToWorldY = (wy, at = 0.45, smooth = true) =>
    scroller.scrollTo({ top: svg.offsetTop + oy + wy * k - H * at, behavior: smooth && !reduced ? 'smooth' : 'auto' });

  // ---- opening a sphere: one continuous motion ----
  // The map swells around the sphere and fades while the sphere's topic circles fly straight out of it
  // to their places in the sub-map. Coming back runs the same motion in reverse.
  let opening = false;
  function openSphere(id) {
    if (opening) return;
    opening = true;
    const s = sphereLayout[id];
    const rects = {};
    for (const t of sphereById[id].topics) {
      const L = dotLayout[id + ':' + t];
      const p = toScreen(L.x, L.y);
      rects[t] = { ...p, r: DOT_R * k };
    }
    const c = toScreen(s.x, s.y);
    ui.morph = { sphere: id, rects };
    ui.back = { sphere: id, rects };
    ui.scrollY = scroller.scrollTop;
    if (!reduced) {
      mapEl.style.transformOrigin = `${c.x}px ${c.y}px`;
      mapEl.classList.add('leaving');
    }
    go('/s/' + id);
  }

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
      ui.back = null;
    } else if (ui.scrollY != null) {
      scroller.scrollTop = ui.scrollY;
      if (ui.back && !reduced) {
        // Back from a sphere: the map starts swollen around it and settles while the topics fly home.
        const c = toScreen(sphereLayout[ui.back.sphere].x, sphereLayout[ui.back.sphere].y);
        mapEl.style.transformOrigin = `${c.x}px ${c.y}px`;
        mapEl.classList.add('returning');
        mapEl.getBoundingClientRect();
        requestAnimationFrame(() => mapEl.classList.remove('returning'));
      }
      // Cleared once the page that is closing has read it for its own half of the motion.
      setTimeout(() => (ui.back = null), 600);
    } else {
      // First look: scrolled to the sphere with the next step (or the first one).
      const s = sphereLayout[next ? topics[next].sphere : spheres[0].id];
      scrollToWorldY(s.y, 0.45, false);
    }
  }

  // Sphere titles stay fully on screen even when the sphere sits at the edge.
  const titleX = (wx, text) => {
    const half = [...text].length * 5.6 + 8;
    return (Math.min(W - half, Math.max(half, wx * k + ox)) - ox) / k;
  };

  // ---- level, then the next step ----
  // No "next step" until we know the student's level. Before that, a small "Дутагдлаа олъё" button
  // opens the explanation and the check. After it, a card names the next topic with "Сурах цаг!".
  let known = $derived(levelChecked());
  let left = $derived(checkLeft().length);
  function learn() {
    const es = topicEntries[next];
    ui.scrollY = scroller.scrollTop;
    if (es.length) go('/e/' + (es.find((id) => entryState(id) !== 'known') ?? es[0]));
    else ui.topic = next;
  }
</script>

<div class="map" bind:this={mapEl}>
  <div class="scroller" bind:this={scroller}>
    <!-- Stories sit at the top of the map and scroll away with it, like Instagram (owner: not persistent). -->
    <div class="stories"><HotTopics /></div>
    <svg bind:this={svg} width={W} height={contentH} role="group" aria-label="Математикийн газрын зураг">
      <defs>
        {#each spheres as s}
          <radialGradient id="g-{s.id}" cx="50%" cy="45%" r="55%">
            <stop offset="0%" stop-color={sphereLayout[s.id].color} stop-opacity="0.28" />
            <stop offset="70%" stop-color={sphereLayout[s.id].color} stop-opacity="0.08" />
            <stop offset="100%" stop-color={sphereLayout[s.id].color} stop-opacity="0.02" />
          </radialGradient>
        {/each}
      </defs>

      <g transform="translate({ox} {oy}) scale({k})" style:--a="{DRIFT_PX / k}px">
        {#each stars as st}<circle cx={st.x} cy={st.y} r={st.s} class="star" opacity={st.o} />{/each}

        <path d={journey} class="journey" style:stroke-width={2.5 / k} style:stroke-dasharray="{2 / k} {14 / k}" />

        {#each spheres as s, i (s.id)}
          {@const L = sphereLayout[s.id]}
          {@const st = sphereState(s)}
          {@const label = s.title}
          <g class="dx" style:animation-duration="{drift[i].dx}s" style:animation-delay="{drift[i].delay}s">
            <g class="dy" style:animation-duration="{drift[i].dy}s" style:animation-delay="{drift[i].delay * 1.3}s">
              <g
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
                {#if st === 'next'}
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
            </g>
          </g>
          {@const count = `${s.fresh.length} шинэ · ${s.topics.length - s.fresh.length} гүнзгийрүүлэх`}
          <text x={titleX(L.x, label)} y={L.y - L.R - 34 / k} class="stitle" class:next={st === 'next'} font-size={17 / k} style:stroke-width={6 / k}>{label}</text>
          <text x={titleX(L.x, count) } y={L.y - L.R - 14 / k} class="scount" font-size={12 / k} style:stroke-width={5 / k}>{count}</text>
        {/each}

        {#if thread}<path d={thread} class="thread" style:stroke-width={2.2 / k} style:stroke-dasharray="{6 / k} {5 / k}" />{/if}
      </g>
    </svg>
  </div>

  <header class="hud-top">
    <div class="toprow">
      <span class="toggle-room" aria-hidden="true"></span>
      <button class="icon" aria-label="Дутагдлаа олъё" onclick={() => (ui.level = true)}>
        <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5M11 8v6M8 11h6" /></svg>
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
    {#if !known}
      <button class="find" onclick={() => (ui.level = true)} transition:fly={{ y: 30, duration: ms(300), easing: ease }}>
        <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5M11 8v6M8 11h6" /></svg>
        Дутагдлаа олъё
      </button>
    {:else if next}
      <div class="nextcard" transition:fly={{ y: 40, duration: ms(320), easing: ease }}>
        <button class="nt" onclick={() => { scrollToWorldY(sphereLayout[topics[next].sphere].y); ui.topic = next; }}>
          <span class="nf" style:--sc={strands[topics[next].strand].color}>{#if topics[next].formula}<RichText text={topics[next].formula} />{:else}<i class="sdot"></i>{/if}</span>
          <span class="nn"><span class="small">Дараагийн алхам</span><strong>{topics[next].name}</strong></span>
        </button>
        <button class="btn sun" onclick={learn}>Сурах цаг!</button>
        {#if left}<button class="more" onclick={() => (ui.level = true)}>Шалгалт үргэлжлүүлэх · {left} хэсэг үлдсэн</button>{/if}
      </div>
    {/if}
  </div>
</div>

<style>
  .map { position: fixed; inset: 0; overflow: hidden; transition: opacity 0.45s ease-out; }
  /* Soft fades behind the top and bottom controls, so map labels slide under them instead of clashing. */
  .map::before, .map::after { content: ''; position: fixed; left: 0; right: 0; z-index: 4; pointer-events: none; }
  .map::before { top: 0; height: 90px; background: linear-gradient(var(--bg) 35%, transparent); }
  .map::after { bottom: 0; height: calc(var(--tabbar-h) + 150px); background: linear-gradient(transparent, var(--bg) 75%); }
  .map:global(.leaving) { opacity: 0; pointer-events: none; }
  .map:global(.returning) { opacity: 0; transition: none; }
  /* The phone's own scrolling: momentum and rubber band come from the system. */
  .scroller { position: absolute; inset: 0; overflow-x: hidden; overflow-y: auto; -webkit-overflow-scrolling: touch; overscroll-behavior-y: contain; }
  .stories { max-width: 560px; margin: 0 auto; padding: calc(env(safe-area-inset-top, 0px) + 62px) 16px 0; position: relative; z-index: 5; }
  .scroller svg { display: block; user-select: none; -webkit-user-select: none; -webkit-tap-highlight-color: transparent; }
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
  @keyframes lightup { from { stroke-opacity: 0.1; stroke-width: 0; } 60% { stroke-opacity: 1; filter: drop-shadow(0 0 14px var(--c)); } }
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
  .icon { width: 44px; height: 44px; margin-right: -8px; border: 0; background: none; display: grid; place-items: center; color: #fff; }
  .icon svg { width: 27px; height: 27px; fill: none; stroke: currentColor; stroke-width: 2.1; stroke-linecap: round; }
  .welcome {
    position: relative; margin-top: 10px; padding: 14px 52px 14px 16px; display: grid; gap: 10px; justify-items: start;
    border-radius: 18px; background: rgba(10, 14, 24, 0.94); border: 1px solid color-mix(in srgb, var(--grass) 45%, var(--line));
    backdrop-filter: blur(12px);
  }
  .welcome > div { display: grid; }
  .welcome a { text-decoration: none; }

  .hud-bottom {
    position: fixed; left: 0; right: 0; bottom: 0; z-index: 5; display: grid; gap: 10px;
    padding: 0 16px calc(var(--tabbar-h) + env(safe-area-inset-bottom) + 34px); max-width: 560px; margin: 0 auto; pointer-events: none;
  }
  .hud-bottom > * { pointer-events: auto; grid-area: 1 / 1; }
  .find {
    justify-self: start; display: inline-flex; align-items: center; gap: 8px; min-height: 48px; padding: 0 18px 0 14px;
    border-radius: 999px; font-weight: 800; color: var(--sun);
    background: rgba(10, 14, 24, 0.96); border: 1px solid rgba(255, 204, 102, 0.6);
    box-shadow: 0 0 24px rgba(255, 204, 102, 0.25); animation: glow 2.6s ease-in-out infinite;
  }
  .find svg { width: 20px; height: 20px; fill: none; stroke: var(--sun); stroke-width: 2; stroke-linecap: round; }
  @keyframes glow { 50% { box-shadow: 0 0 34px rgba(255, 204, 102, 0.45); } }
  .nextcard {
    display: grid; grid-template-columns: minmax(0, 1fr) auto; align-items: center; gap: 8px 10px; padding: 10px 10px 10px 12px;
    border-radius: 18px; background: rgba(10, 14, 24, 0.96);
    border: 1px solid rgba(255, 204, 102, 0.55); box-shadow: 0 0 28px rgba(255, 204, 102, 0.2);
  }
  .nt { display: flex; align-items: center; gap: 10px; min-width: 0; border: 0; background: none; padding: 0; text-align: left; }
  .nf { flex: none; min-width: 44px; height: 44px; padding: 0 6px; display: grid; place-items: center; border-radius: 50%; border: 1.5px solid var(--sun); color: var(--sun); font-family: var(--math); font-size: 0.9rem; white-space: nowrap; }
  .nn { display: grid; min-width: 0; }
  .nn .small { color: var(--sun); font-weight: 700; font-size: 0.75rem; white-space: nowrap; }
  .nn strong { line-height: 1.25; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  .nextcard .btn { min-height: 44px; padding: 0 16px; }
  .more { grid-column: 1 / -1; justify-self: start; border: 0; background: none; padding: 2px 0 0; color: var(--muted); font-size: 0.85rem; text-decoration: underline; text-underline-offset: 3px; }

  @media (prefers-reduced-motion: reduce) {
    .dx, .dy, .pulse, .find { animation: none; }
    .map { transition: none; }
  }
</style>
