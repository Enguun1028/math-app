<script>
  // Guided tour after the tutorial level (owner, 2026-10-22: "everything dims except one and an arrow appears";
  // the map first, then the tools, starting with the graph, "showcase its powers").
  // One spot at a time stays lit and tappable; the rest is dimmed and ignores taps. The tour moves on by itself
  // when the student does the step (opens the sphere, a topic, goes back, the tools tab, drags a slider).
  // "Алгасах" ends it. ui.tour = { step, sphere, topic } is set by IntroPage; null when there is no tour.
  import { fade } from 'svelte/transition';
  import { onMount } from 'svelte';
  import { ui } from '../lib/ui.svelte.js';
  import { route } from '../lib/router.svelte.js';
  import { sphereById } from '../lib/content.js';
  import { track } from '../lib/track.svelte.js';
  import { ms } from '../lib/motion.js';

  // What the graph opens with: a parabola with a slider, a wave and a circle, so one screen shows what it can do.
  const SHOWCASE = ['y = a x^2', 'y = sin x', 'x^2 + y^2 = 9'];

  let t = $derived(ui.tour);
  let page = $derived(route.parts[0]);
  const STEPS = {
    sphere: {
      sel: () => `[data-sphere="${t.sphere}"] .rim`, round: true, show: () => !page,
      text: () => `Энэ бол таны ${sphereById[t.sphere].grade}-р анги. Дарж нээгээрэй.`,
    },
    topic: {
      sel: () => `[data-t="${t.topic}"] .c`, round: true, show: () => page === 's' && !ui.topic && !ui.morph,
      text: () => 'Бөмбөлөг бүр нэг сэдэв. Нэгийг нь дарж үзээрэй.',
    },
    card: {
      // free: nothing dims, so the card can be read and scrolled first; only the arrow points at «‹ Буцах».
      sel: () => '.topic .bar .btn', show: () => !!ui.topic, free: true,
      text: () => 'Энд сэдвийн тайлбар, жишээ, дасгал бий. Гүйлгэж үзээрэй. Дараа нь «‹ Буцах» дарна уу.',
    },
    tools: {
      sel: () => '.tabbar a[href="#/tools"]', show: () => page === 's' && !ui.topic,
      text: () => 'Одоо хэрэгслүүдтэй танилцъя.',
    },
    graph: {
      sel: () => '.graph .sliders', show: () => page === 'tools', free: true, // the curve must stay visible while dragging
      text: () => 'Граф тооны машин: тэгшитгэл бичихэд шууд зурна. Гулсуурыг чирж a-г өөрчлөөд үзээрэй.',
    },
    play: {
      sel: () => '.graph .boardwrap', show: () => page === 'tools', done: 'Дуусгах',
      text: () => 'Гайхалтай! Парабол, синус, тойрог: бүгдийг өөрөө бичиж болно. Хоёр хуруугаараа томруулна.',
    },
  };
  let s = $derived(t ? STEPS[t.step] : null);
  let visible = $derived(!!s && s.show());

  function to(step) {
    track('tour_step', { step });
    ui.tour = { ...ui.tour, step };
  }
  function end(skipped) {
    track(skipped ? 'tour_skipped' : 'tour_finished', { at: t?.step });
    ui.tour = null;
  }

  // The tour moves on when the student does the step.
  $effect(() => {
    if (!t) return;
    if (t.step === 'sphere' && page === 's') {
      const sp = sphereById[route.parts[1]];
      ui.tour = { ...t, step: 'topic', topic: sp.fresh[0] ?? sp.topics[0] };
      track('tour_step', { step: 'topic' });
    } else if (t.step === 'topic' && ui.topic) to('card');
    else if (t.step === 'card' && !ui.topic) {
      // The graph waits on the tools page with the showcase lines; the tour's own tips replace the one-time hints.
      ui.tool = 'graph';
      ui.graphSeed = SHOWCASE;
      to('tools');
    } else if (t.step === 'tools' && page === 'tools') to('graph');
  });
  // Dragging a graph slider is the last step before the end.
  // Moves on a moment after the first drag, so the student sees the curve change first.
  let wait = null;
  const onInput = (ev) => {
    if (t?.step !== 'graph' || wait || !ev.target.closest?.('.graph .sliders')) return;
    wait = setTimeout(() => { wait = null; if (ui.tour?.step === 'graph') to('play'); }, 1500);
  };

  // The lit spot follows its element (spheres drift, the map scrolls), read once per frame.
  // A spot below the fold (the graph sliders) is scrolled into view once, since the dim panels stop scrolling.
  let r = $state(null), vh = $state(innerHeight), shown = null;
  onMount(() => {
    let raf;
    const loop = () => {
      const el = visible ? document.querySelector(s.sel()) : null;
      if (el && shown !== t.step) {
        shown = t.step;
        const b0 = el.getBoundingClientRect();
        if (b0.top < 60 || b0.bottom > innerHeight - 180) el.scrollIntoView({ block: 'center' });
      }
      const b = el?.getBoundingClientRect();
      r = b && b.width ? { x: b.left, y: b.top, w: b.width, h: b.height } : null;
      vh = innerHeight;
      raf = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(raf);
  });

  const PAD = 8;
  let hole = $derived(r && { x: r.x - PAD, y: r.y - PAD, w: r.w + PAD * 2, h: r.h + PAD * 2 });
  // A tall spot (the graph board) gets its tip over the bottom of the screen and no arrow.
  let tall = $derived(hole && hole.h > vh * 0.4);
  let below = $derived(hole && hole.y + hole.h / 2 < vh / 2); // the tip sits below a spot in the top half
</script>

<svelte:document oninput={onInput} />

{#if visible && hole}
  <div class="tour" transition:fade={{ duration: ms(200) }}>
    <!-- Four dim panels around the lit spot: they catch every tap except the one on the spot itself. -->
    {#if !s.free}
      <div class="dim" style:left="0" style:top="0" style:right="0" style:height="{Math.max(0, hole.y)}px"></div>
      <div class="dim" style:left="0" style:top="{hole.y + hole.h}px" style:right="0" style:bottom="0"></div>
      <div class="dim" style:left="0" style:top="{hole.y}px" style:width="{Math.max(0, hole.x)}px" style:height="{hole.h}px"></div>
      <div class="dim" style:left="{hole.x + hole.w}px" style:top="{hole.y}px" style:right="0" style:height="{hole.h}px"></div>
    {/if}
    <div class="ring" class:round={s.round} class:free={s.free} style:left="{hole.x}px" style:top="{hole.y}px" style:width="{hole.w}px" style:height="{hole.h}px"></div>
    {#if !tall}
      <div class="arrow" class:up={below} style:left="{hole.x + hole.w / 2}px"
        style:top={below ? hole.y + hole.h + 4 + 'px' : null} style:bottom={below ? null : vh - hole.y + 4 + 'px'}>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v16M5 12l7 7 7-7" /></svg>
      </div>
    {/if}
    <div class="tip" style:top={tall || !below ? null : hole.y + hole.h + 52 + 'px'}
      style:bottom={tall ? 'calc(env(safe-area-inset-bottom) + 16px)' : below ? null : vh - hole.y + 52 + 'px'}>
      <p>{s.text()}</p>
      <div class="acts">
        <button class="skip" onclick={() => end(true)}>Алгасах</button>
        {#if s.done}<button class="btn sun" onclick={() => end(false)}>{s.done}</button>{/if}
      </div>
    </div>
  </div>
{/if}

<style>
  .tour { position: fixed; inset: 0; z-index: 60; pointer-events: none; }
  /* The panels only catch taps; the dimming is the ring's own huge shadow, so a round spot gets a round hole. */
  .dim { position: absolute; pointer-events: auto; }
  .ring {
    position: absolute; border-radius: 16px; border: 2px solid var(--sun);
    box-shadow: 0 0 0 200vmax rgba(2, 3, 6, 0.78), 0 0 24px rgba(255, 204, 102, 0.55); animation: glow 1.6s ease-in-out infinite;
  }
  .ring.round { border-radius: 50%; }
  .ring.free { box-shadow: 0 0 24px rgba(255, 204, 102, 0.55); animation-name: glowfree; }
  @keyframes glowfree { 50% { box-shadow: 0 0 44px rgba(255, 204, 102, 0.9); } }
  @keyframes glow { 50% { box-shadow: 0 0 0 200vmax rgba(2, 3, 6, 0.78), 0 0 44px rgba(255, 204, 102, 0.9); } }
  .arrow { position: absolute; width: 40px; height: 40px; margin-left: -20px; color: var(--sun); animation: bob 1s ease-in-out infinite; }
  .arrow svg { width: 100%; height: 100%; fill: none; stroke: currentColor; stroke-width: 2.6; stroke-linecap: round; stroke-linejoin: round; filter: drop-shadow(0 0 6px rgba(255, 204, 102, 0.7)); }
  .arrow.up svg { transform: rotate(180deg); }
  @keyframes bob { 50% { transform: translateY(6px); } }
  .arrow.up { animation-name: bobup; }
  @keyframes bobup { 50% { transform: translateY(-6px); } }
  .tip {
    position: absolute; left: 16px; right: 16px; max-width: 480px; margin: 0 auto; pointer-events: auto;
    display: grid; gap: 8px; padding: 14px 16px; border-radius: 18px; background: rgba(12, 15, 21, 0.98);
    border: 2px solid var(--sun); box-shadow: 0 0 28px rgba(255, 204, 102, 0.25);
  }
  .tip p { margin: 0; font-weight: 700; line-height: 1.4; }
  .acts { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
  .skip { min-height: 40px; padding: 0; border: 0; background: none; color: var(--muted); text-decoration: underline; text-underline-offset: 3px; }
  @media (prefers-reduced-motion: reduce) { .ring, .arrow { animation: none; } }
</style>
