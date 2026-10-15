<script>
  // Earlier and later topics as a game skin picker (owner, 2026-10-16). Three slots: the nearest earlier topic on the left,
  // the open topic in the centre, the nearest later topic on the right. The row follows the finger 1:1, and colour and size
  // move with it: the centre greys as it leaves, the incoming topic lights up. On release it eases into place, then the
  // card switches. No native sideways scrolling, so the card never drifts sideways.
  // Under the slots, two quiet boxes list every earlier («Мэдвэл зохих») and later («Дараагийн») topic.
  import TopicIcon from './TopicIcon.svelte';
  import { topics, topicUnlocks, whyOf } from '../lib/content.js';
  import { topicState } from '../lib/logic.js';
  import { ui } from '../lib/ui.svelte.js';
  import { reduced, ms } from '../lib/motion.js';
  // A side topic that is new after a slide fades in instead of popping.
  const fadeIn = () => ({ duration: ms(180), css: (k) => `opacity:${k * 0.75}` });

  let { id } = $props();
  // The strip keeps its own centre, so a slide can finish before the heavy card switch starts (no stutter).
  let cur = $state(id);
  $effect(() => { if (id !== cur && !busy) cur = id; });
  let busy = false;
  // Nearest grade first.
  const grade = (x) => topics[x].grades[0] ?? 0;
  let left = $derived([...topics[cur].req].sort((a, b) => grade(b) - grade(a)));
  let right = $derived([...topicUnlocks[cur]].sort((a, b) => grade(a) - grade(b)));
  // A topic at the end of a chain (51 have no later topic, 12 no earlier one) still slides: the empty side falls back
  // to the neighbouring topic of the same strand in grade order, shown as «ижил салаа».
  const order = Object.values(topics).sort((a, b) => (a.grades[0] ?? 0) - (b.grades[0] ?? 0));
  let strandRow = $derived(order.filter((x) => x.strand === topics[cur].strand).map((x) => x.id));
  let at = $derived(strandRow.indexOf(cur));
  let l = $derived(left[0] ?? strandRow[at - 1] ?? null);
  let r = $derived(right[0] ?? strandRow[at + 1] ?? null);
  let lAlt = $derived(!left.length && !!l);
  let rAlt = $derived(!right.length && !!r);
  const isKnown = (x) => ['known', 'faded'].includes(topicState(x));
  // Which side's full list is open: 'l', 'r' or false.
  let all = $state(false);
  $effect(() => { cur; all = false; });

  // The link reason after a move, e.g. «ХИЕХ ба ХБЕХ → Бутархай нэмэх: …».
  let move = $state(null);
  let reason = $derived.by(() => {
    if (!move || move.to !== cur) return null;
    const [a, b] = whyOf(move.from, move.to) ? [move.from, move.to] : [move.to, move.from];
    const w = whyOf(a, b);
    return w ? { a: topics[a].name, b: topics[b].name, w } : null;
  });

  // d = how far the row is moved, in slots (−1 … 1). Each slot's look depends on its distance from the centre.
  let d = $state(0);
  let wrap;
  const slotW = () => 120; // one slot = one item width, so the row moves 1:1 with the finger
  // Only transform and opacity change while sliding (cheap on a phone): the coloured icon fades out, its grey copy in.
  const look = (i) => {
    const p = Math.min(Math.abs(i + d), 1.4), n = Math.min(p, 1);
    return `transform: translate3d(${(i + d) * 100}%, 0, 0) scale(${1 - 0.14 * n}); opacity: ${1 - 0.6 * Math.max(0, p - 1)}; --n: ${n}`;
  };
  // Ease d to a target over a short time, then run done().
  let anim;
  function ease(to, time, done) {
    cancelAnimationFrame(anim);
    const from = d, t0 = performance.now(), T = reduced ? 1 : time;
    const step = (now) => {
      const k = Math.min(1, (now - t0) / T), e = 1 - Math.pow(1 - k, 3);
      d = from + (to - from) * e;
      if (k < 1) anim = requestAnimationFrame(step); else done?.();
    };
    anim = requestAnimationFrame(step);
  }
  // dir 1 = the left topic comes to the centre, −1 = the right one.
  function go(to, dir) {
    if (!to) return ease(0, 220);
    busy = true;
    ease(dir, 260, () => {
      // Same frame: the strip re-centres on the new topic; the moving items keep their elements, so nothing jumps.
      move = { from: cur, to }; cur = to; d = 0;
      // Two frames later the card switches, after the strip has painted.
      requestAnimationFrame(() => requestAnimationFrame(() => { ui.topic = to; busy = false; }));
    });
  }
  // Swipe: follows the finger; only a clearly sideways move counts, vertical scrolling stays with the page.
  let pending = 0, queued = false;
  let x0 = null, y0 = 0, lock = null, lastX = 0, lastT = 0, vel = 0;
  const start = (e) => { cancelAnimationFrame(anim); x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; lock = null; lastX = x0; lastT = performance.now(); vel = 0; };
  const drag = (e) => {
    if (x0 == null) return;
    const mx = e.touches[0].clientX - x0, my = e.touches[0].clientY - y0;
    if (!lock && Math.abs(mx) + Math.abs(my) > 8) lock = Math.abs(mx) > Math.abs(my) ? 'x' : 'y';
    if (lock !== 'x') return;
    e.preventDefault();
    const now = performance.now(), cx = e.touches[0].clientX;
    vel = Math.abs(cx - lastX) / Math.max(1, now - lastT); lastX = cx; lastT = now;
    let v = mx / slotW();
    // Resist past an empty side.
    if ((v > 0 && !l) || (v < 0 && !r)) v *= 0.25;
    pending = Math.max(-1, Math.min(1, v));
    if (!queued) { queued = true; requestAnimationFrame(() => { queued = false; if (x0 != null) d = pending; }); }
  };
  const end = () => {
    if (x0 == null) return;
    if (lock === 'x') d = pending;
    // A fling: the finger was still moving fast (over 0.3 px per ms) in its last 100 ms.
    const fast = vel > 0.3 && performance.now() - lastT < 100;
    x0 = null;
    if (lock !== 'x') return;
    if ((d > 0.33 || (fast && d > 0.08)) && l) go(l, 1);
    else if ((d < -0.33 || (fast && d < -0.08)) && r) go(r, -1);
    else ease(0, 220);
  };
  // Touchmove must be non-passive to stop the page while sliding sideways.
  $effect(() => {
    if (!wrap) return;
    wrap.addEventListener('touchmove', drag, { passive: false });
    return () => wrap.removeEventListener('touchmove', drag);
  });
</script>

<div class="picker" bind:this={wrap} ontouchstart={start} ontouchend={end} ontouchcancel={end}>
  {#each [[-1, l], [0, cur], [1, r]] as [i, x] (x ?? 'none' + i)}
    {#if x}
      <button class="it" in:fadeIn style={look(i)} tabindex={i ? 0 : -1} aria-label={i ? (i < 0 ? 'Өмнөх: ' : 'Дараагийн: ') + topics[x].name : undefined} onclick={() => i && go(x, -i)}>
        <span class="pair"><span class="col"><TopicIcon id={x} size={48} known={isKnown(x)} /></span><span class="gry"><TopicIcon id={x} size={48} known={isKnown(x)} grey /></span></span>
        <span class="nm">{topics[x].name}</span>
      </button>
    {/if}
  {/each}
</div>

<!-- Every earlier and later topic, as one slim muted line under the slots (owner, 2026-10-16: the title must stay the
     strongest thing). Each side is cut to one line; tapping a side opens its full list. -->
<div class="lists">
  <button class="side need" class:open={all === 'l'} onclick={() => (all = all === 'l' ? false : 'l')}>
    <i>←</i><span class="tx">{#if left.length}{left.map((x) => topics[x].name).join(', ')}{:else if lAlt}{topics[l].name} · ижил салаа{:else}—{/if}</span>
  </button>
  <button class="side next" class:open={all === 'r'} onclick={() => (all = all === 'r' ? false : 'r')}>
    <span class="tx">{#if right.length}{right.map((x) => topics[x].name).join(', ')}{:else if rAlt}{topics[r].name} · ижил салаа{:else}—{/if}</span><i>→</i>
  </button>
</div>
{#if all}
  {@const list = all === 'l' ? (left.length ? left : lAlt ? [l] : []) : right.length ? right : rAlt ? [r] : []}
  <div class="full" class:right={all === 'r'}>
    <span class="lbl">{all === 'l' ? 'Мэдвэл зохих' : 'Дараагийн'}</span>
    {#each list as x}<button class="ch" onclick={() => { const dir = all === 'l' ? 1 : -1; all = false; go(x, dir); }}><b class:ok={isKnown(x)}></b>{topics[x].name}</button>{/each}
  </div>
{/if}
{#if reason}<p class="why small muted"><b>{reason.a}</b> → <b>{reason.b}</b>: {reason.w}</p>{/if}

<style>
  .picker { position: relative; height: 104px; overflow: hidden; touch-action: pan-y; margin: 0 -16px; }
  .it {
    position: absolute; top: 4px; left: calc(50% - 60px); width: 120px; display: grid; justify-items: center; gap: 6px; padding: 4px 6px;
    border: 0; background: none; color: var(--ink); transform-origin: 50% 30%; will-change: transform, opacity;
  }
  .pair { display: grid; }
  .pair > span { grid-area: 1 / 1; will-change: opacity; }
  .col { opacity: calc(1 - var(--n, 0)); }
  .gry { opacity: var(--n, 0); }
  .nm { opacity: calc(1 - 0.45 * var(--n, 0));
    font-size: 0.74rem; font-weight: 700; line-height: 1.2; text-align: center; display: -webkit-box; -webkit-line-clamp: 2; line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }

  /* One slim muted line: small grey text, no box, so the title stays the strongest thing. */
  .lists { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: -6px; }
  .side { display: flex; align-items: center; gap: 4px; min-width: 0; min-height: 28px; padding: 0; border: 0; background: none; color: var(--muted); font-size: 0.72rem; font-weight: 600; opacity: 0.75; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .side.next { justify-content: flex-end; }
  .side i { font-style: normal; flex: none; }
  .tx { min-width: 0; overflow: hidden; text-overflow: ellipsis; }
  .side.open { opacity: 1; color: var(--ink); }
  .full { display: grid; justify-items: start; gap: 0; padding: 6px 10px; border-radius: 12px; border: 1px solid var(--line); }
  .full.right { justify-items: end; }
  .lbl { font-size: 0.64rem; letter-spacing: 0.06em; text-transform: uppercase; color: var(--muted); }
  .ch { display: inline-flex; align-items: center; gap: 6px; min-height: 30px; border: 0; background: none; padding: 0; color: var(--ink); font-size: 0.8rem; font-weight: 600; }
  .ch b { flex: none; width: 6px; height: 6px; border-radius: 50%; background: var(--line); }
  .ch b.ok { background: var(--grass); }
  .why { margin: 0; text-align: center; }
  .why b { color: var(--ink); }
</style>
