<script>
  // Earlier and later topics as a game skin picker (owner, 2026-10-16). Exactly three slots: the nearest earlier topic
  // on the left, the open topic in the centre, the nearest later topic on the right, sides grey and a little smaller.
  // A quick swipe or a tap on a side moves the card to that topic. Under the slots, every earlier and every later
  // topic stays listed, so nothing is hidden. No native sideways scrolling: the card must never drift sideways.
  import TopicIcon from './TopicIcon.svelte';
  import { topics, topicUnlocks, whyOf } from '../lib/content.js';
  import { topicState } from '../lib/logic.js';
  import { ui } from '../lib/ui.svelte.js';
  import { ms } from '../lib/motion.js';

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
  // Long lists stay compact: 3 per side, the rest behind «+N».
  let all = $state(false);
  $effect(() => { id; all = false; });
  const cut = (a) => (all ? a : a.slice(0, 3));
  const isKnown = (x) => ['known', 'faded'].includes(topicState(x));

  // The link reason after a move, e.g. «ХИЕХ ба ХБЕХ → Бутархай нэмэх: …».
  let move = $state(null);
  let reason = $derived.by(() => {
    if (!move || move.to !== id) return null;
    const [a, b] = whyOf(move.from, move.to) ? [move.from, move.to] : [move.to, move.from];
    const w = whyOf(a, b);
    return w ? { a: topics[a].name, b: topics[b].name, w } : null;
  });

  // A short slide toward the side, then the card switches. Fast: about 0.15 s.
  let shift = $state(0);
  function go(to, dir) {
    if (!to) return;
    shift = dir;
    setTimeout(() => { move = { from: id, to }; ui.topic = to; shift = 0; }, ms(140));
  }
  // Swipe: only a clear sideways move counts; vertical scrolling stays with the page.
  let x0 = null, y0 = 0, dx = $state(0);
  const start = (e) => { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; dx = 0; };
  const drag = (e) => {
    if (x0 == null) return;
    const mx = e.touches[0].clientX - x0, my = e.touches[0].clientY - y0;
    if (Math.abs(my) > Math.abs(mx) && Math.abs(dx) < 8) { x0 = null; dx = 0; return; }
    dx = Math.max(-90, Math.min(90, mx));
  };
  const end = () => {
    if (x0 == null) return;
    x0 = null;
    if (dx > 40 && l) go(l, 1);
    else if (dx < -40 && r) go(r, -1);
    dx = 0;
  };
</script>

<div class="picker" ontouchstart={start} ontouchmove={drag} ontouchend={end} ontouchcancel={end}>
  <div class="row" class:snap={x0 == null} style:transform="translateX({dx * 0.5 + shift * 96}px)">
    {#if l}
      <button class="it side" onclick={() => go(l, 1)} aria-label="Өмнөх: {topics[l].name}">
        <TopicIcon id={l} size={42} known={isKnown(l)} /><span class="nm">{topics[l].name}</span>
      </button>
    {:else}<span class="it ghost" aria-hidden="true"></span>{/if}
    <div class="it mid" aria-current="true">
      <TopicIcon id={id} size={50} known={isKnown(id)} /><span class="nm">{topics[id].name}</span>
    </div>
    {#if r}
      <button class="it side" onclick={() => go(r, -1)} aria-label="Дараагийн: {topics[r].name}">
        <TopicIcon id={r} size={42} known={isKnown(r)} /><span class="nm">{topics[r].name}</span>
      </button>
    {:else}<span class="it ghost" aria-hidden="true"></span>{/if}
  </div>
</div>

<!-- Every earlier and later topic, always listed. -->
<div class="lists">
  <div class="col">
    <span class="lbl">← Мэдвэл зохих</span>
    {#each cut(left) as x}<button class="ch" class:on={x === l} onclick={() => go(x, 1)}><i class:ok={isKnown(x)}></i>{topics[x].name}</button>{:else}{#if lAlt}<button class="ch on" onclick={() => go(l, 1)}><i class:ok={isKnown(l)}></i>{topics[l].name}</button><span class="alt">ижил салаа</span>{:else}<span class="none">—</span>{/if}{/each}
  </div>
  <div class="col right">
    <span class="lbl">Дараагийн →</span>
    {#each cut(right) as x}<button class="ch" class:on={x === r} onclick={() => go(x, -1)}>{topics[x].name}<i class:ok={isKnown(x)}></i></button>{:else}{#if rAlt}<button class="ch on" onclick={() => go(r, -1)}>{topics[r].name}<i class:ok={isKnown(r)}></i></button><span class="alt">ижил салаа</span>{:else}<span class="none">—</span>{/if}{/each}
  </div>
</div>
{#if !all && (left.length > 3 || right.length > 3)}
  <button class="more" onclick={() => (all = true)}>+{Math.max(0, left.length - 3) + Math.max(0, right.length - 3)} сэдэв</button>
{/if}
{#if reason}<p class="why small muted"><b>{reason.a}</b> → <b>{reason.b}</b>: {reason.w}</p>{/if}

<style>
  .picker { overflow: hidden; touch-action: pan-y; padding: 4px 0 0; }
  .row { display: grid; grid-template-columns: 1fr 1.15fr 1fr; align-items: start; will-change: transform; }
  .row.snap { transition: transform 0.14s ease-out; }
  .it { display: grid; justify-items: center; gap: 6px; padding: 4px 2px; border: 0; background: none; color: var(--ink); min-width: 0; }
  .side { filter: grayscale(1) brightness(0.75); opacity: 0.75; transform: scale(0.9); transform-origin: 50% 30%; }
  .nm { font-size: 0.72rem; font-weight: 700; line-height: 1.2; text-align: center; display: -webkit-box; -webkit-line-clamp: 2; line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  .mid .nm { font-size: 0.78rem; }
  .ghost { height: 1px; }
  .lists { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .col { display: grid; align-content: start; justify-items: start; gap: 2px; min-width: 0; }
  .col.right { justify-items: end; text-align: right; }
  .lbl { font-size: 0.66rem; letter-spacing: 0.06em; text-transform: uppercase; color: var(--muted); margin-bottom: 2px; }
  .ch { display: inline-flex; align-items: center; gap: 6px; max-width: 100%; min-height: 30px; border: 0; background: none; padding: 0; color: var(--muted); font-size: 0.8rem; font-weight: 600; text-align: inherit; }
  .ch.on { color: var(--ink); }
  .ch i { flex: none; width: 7px; height: 7px; border-radius: 50%; background: var(--line); }
  .ch i.ok { background: var(--grass); }
  .alt { font-size: 0.66rem; color: var(--muted); font-style: italic; }
  .more { justify-self: center; min-height: 30px; padding: 0 12px; border-radius: 999px; border: 1px solid var(--line); background: none; color: var(--muted); font-size: 0.75rem; font-weight: 700; margin-top: -6px; }
  .none { color: var(--muted); font-size: 0.8rem; }
  .why { margin: 0; text-align: center; }
  .why b { color: var(--ink); }
  @media (prefers-reduced-motion: reduce) { .row.snap { transition: none; } }
</style>
