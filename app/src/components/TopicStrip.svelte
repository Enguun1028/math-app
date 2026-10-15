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
  import { reduced } from '../lib/motion.js';

  let { id } = $props();
  // Nearest grade first.
  const grade = (x) => topics[x].grades[0] ?? 0;
  let left = $derived([...topics[id].req].sort((a, b) => grade(b) - grade(a)));
  let right = $derived([...topicUnlocks[id]].sort((a, b) => grade(a) - grade(b)));
  // A topic at the end of a chain (51 have no later topic, 12 no earlier one) still slides: the empty side falls back
  // to the neighbouring topic of the same strand in grade order, shown as «ижил салаа».
  const order = Object.values(topics).sort((a, b) => (a.grades[0] ?? 0) - (b.grades[0] ?? 0));
  let strandRow = $derived(order.filter((x) => x.strand === topics[id].strand).map((x) => x.id));
  let at = $derived(strandRow.indexOf(id));
  let l = $derived(left[0] ?? strandRow[at - 1] ?? null);
  let r = $derived(right[0] ?? strandRow[at + 1] ?? null);
  let lAlt = $derived(!left.length && !!l);
  let rAlt = $derived(!right.length && !!r);
  const isKnown = (x) => ['known', 'faded'].includes(topicState(x));
  // Long lists stay compact: 3 per box, the rest behind «+N».
  let all = $state(false);
  $effect(() => { id; all = false; });
  const cut = (a) => (all ? a : a.slice(0, 3));

  // The link reason after a move, e.g. «ХИЕХ ба ХБЕХ → Бутархай нэмэх: …».
  let move = $state(null);
  let reason = $derived.by(() => {
    if (!move || move.to !== id) return null;
    const [a, b] = whyOf(move.from, move.to) ? [move.from, move.to] : [move.to, move.from];
    const w = whyOf(a, b);
    return w ? { a: topics[a].name, b: topics[b].name, w } : null;
  });

  // d = how far the row is moved, in slots (−1 … 1). Each slot's look depends on its distance from the centre.
  let d = $state(0);
  let wrap;
  const slotW = () => 120; // one slot = one item width, so the row moves 1:1 with the finger
  const look = (i) => {
    const p = Math.min(Math.abs(i + d), 1.4), n = Math.min(p, 1);
    return `transform: translateX(${(i + d) * 100}%) scale(${1 - 0.14 * n}); filter: grayscale(${n}) brightness(${1 - 0.3 * n}); opacity: ${1 - 0.25 * n - 0.6 * Math.max(0, p - 1)}`;
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
    ease(dir, 260, () => { move = { from: id, to }; ui.topic = to; d = 0; });
  }
  // Swipe: follows the finger; only a clearly sideways move counts, vertical scrolling stays with the page.
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
    d = Math.max(-1, Math.min(1, v));
  };
  const end = () => {
    if (x0 == null) return;
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
  {#each [[-1, l], [0, id], [1, r]] as [i, x] (i + ':' + x)}
    {#if x}
      <button class="it" style={look(i)} tabindex={i ? 0 : -1} aria-label={i ? (i < 0 ? 'Өмнөх: ' : 'Дараагийн: ') + topics[x].name : undefined} onclick={() => i && go(x, -i)}>
        <TopicIcon id={x} size={48} known={isKnown(x)} /><span class="nm">{topics[x].name}</span>
      </button>
    {/if}
  {/each}
</div>

<div class="lists">
  <div class="box need">
    <span class="lbl"><i>←</i>Мэдвэл зохих{#if left.length}<em>{left.length}</em>{/if}</span>
    {#each cut(left) as x}<button class="ch" onclick={() => go(x, 1)}><b class:ok={isKnown(x)}></b>{topics[x].name}</button>
    {:else}{#if lAlt}<button class="ch" onclick={() => go(l, 1)}><b class:ok={isKnown(l)}></b>{topics[l].name}</button><span class="alt">ижил салаа</span>{:else}<span class="alt">Эхний сэдэв</span>{/if}{/each}
  </div>
  <div class="box next">
    <span class="lbl">Дараагийн{#if right.length}<em>{right.length}</em>{/if}<i>→</i></span>
    {#each cut(right) as x}<button class="ch" onclick={() => go(x, -1)}><b class:ok={isKnown(x)}></b>{topics[x].name}</button>
    {:else}{#if rAlt}<button class="ch" onclick={() => go(r, -1)}><b class:ok={isKnown(r)}></b>{topics[r].name}</button><span class="alt">ижил салаа</span>{:else}<span class="alt">Сүүлийн сэдэв</span>{/if}{/each}
    {#if !all && right.length > 3}<button class="more" onclick={() => (all = true)}>+{right.length - 3}</button>{/if}
  </div>
</div>
{#if reason}<p class="why small muted"><b>{reason.a}</b> → <b>{reason.b}</b>: {reason.w}</p>{/if}

<style>
  .picker { position: relative; height: 104px; overflow: hidden; touch-action: pan-y; margin: 0 -16px; }
  .it {
    position: absolute; top: 4px; left: calc(50% - 60px); width: 120px; display: grid; justify-items: center; gap: 6px; padding: 4px 6px;
    border: 0; background: none; color: var(--ink); transform-origin: 50% 30%; will-change: transform, filter;
  }
  .nm { font-size: 0.74rem; font-weight: 700; line-height: 1.2; text-align: center; display: -webkit-box; -webkit-line-clamp: 2; line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }

  /* Two quiet boxes: muted text, small type, each with its own tint and arrow so they are easy to tell apart. */
  .lists { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
  .box { --t: var(--sky); display: grid; align-content: start; gap: 1px; min-width: 0; padding: 8px 10px; border-radius: 12px; border: 1px solid color-mix(in srgb, var(--t) 22%, transparent); background: color-mix(in srgb, var(--t) 5%, transparent); }
  .box.next { --t: var(--dusk); justify-items: end; text-align: right; }
  .lbl { display: flex; align-items: center; gap: 5px; font-size: 0.66rem; font-weight: 800; letter-spacing: 0.06em; text-transform: uppercase; color: color-mix(in srgb, var(--t) 70%, var(--muted)); margin-bottom: 3px; }
  .lbl i { font-style: normal; }
  .lbl em { font-style: normal; min-width: 17px; height: 17px; padding: 0 4px; border-radius: 999px; display: grid; place-items: center; background: color-mix(in srgb, var(--t) 18%, transparent); letter-spacing: 0; }
  .ch { display: inline-flex; align-items: center; gap: 6px; max-width: 100%; min-height: 28px; border: 0; background: none; padding: 0; color: var(--muted); font-size: 0.78rem; font-weight: 600; text-align: inherit; }
  .next .ch { flex-direction: row-reverse; }
  .ch b { flex: none; width: 6px; height: 6px; border-radius: 50%; background: color-mix(in srgb, var(--t) 40%, transparent); }
  .ch b.ok { background: var(--grass); }
  .alt { font-size: 0.68rem; color: var(--muted); font-style: italic; opacity: 0.8; }
  .more { min-height: 26px; padding: 0 9px; border-radius: 999px; border: 1px solid color-mix(in srgb, var(--t) 30%, transparent); background: none; color: var(--muted); font-size: 0.72rem; font-weight: 700; margin-top: 2px; }
  .why { margin: 0; text-align: center; }
  .why b { color: var(--ink); }
</style>
