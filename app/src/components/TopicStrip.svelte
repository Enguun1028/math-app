<script>
  // Earlier and later topics as a game skin picker (owner, 2026-10-16). The open topic sits in the centre; its nearest
  // earlier topic to the left and nearest later topic to the right, and one more beyond each, so while sliding the next
  // one is already in view. Sliding is the phone's own scrolling (same feel and momentum as scrolling the card), one
  // topic per swipe. Side topics are grey and a little smaller; colour and size move with the slide. When a topic
  // settles in the centre the strip re-centres on it and, a moment later, the card switches.
  import TopicIcon from './TopicIcon.svelte';
  import { topics, topicUnlocks, whyOf } from '../lib/content.js';
  import { topicState } from '../lib/logic.js';
  import { ui } from '../lib/ui.svelte.js';

  let { id } = $props();
  // The strip keeps its own centre, so a slide can finish before the heavy card switch starts.
  let cur = $state(id);
  let busy = false;
  $effect(() => { if (id !== cur && !busy) cur = id; });

  // Nearest grade first.
  const grade = (x) => topics[x].grades[0] ?? 0;
  const before = (x) => [...topics[x].req].sort((a, b) => grade(b) - grade(a));
  const after = (x) => [...topicUnlocks[x]].sort((a, b) => grade(a) - grade(b));
  // A topic at the end of a chain (51 have no later topic, 12 no earlier one) still has neighbours: the empty side
  // falls back to the neighbouring topic of the same strand in grade order («ижил салаа»).
  const order = Object.values(topics).sort((a, b) => grade(a.id) - grade(b.id)).map((t) => t.id);
  const inStrand = (x, k) => { const row = order.filter((y) => topics[y].strand === topics[x].strand); return row[row.indexOf(x) + k] ?? null; };
  const leftOf = (x) => (x ? before(x)[0] ?? inStrand(x, -1) : null);
  const rightOf = (x) => (x ? after(x)[0] ?? inStrand(x, 1) : null);

  let left = $derived(before(cur));
  let right = $derived(after(cur));
  let l = $derived(leftOf(cur));
  let r = $derived(rightOf(cur));
  let lAlt = $derived(!left.length && !!l);
  let rAlt = $derived(!right.length && !!r);
  // The whole chain each way, not five slots (owner, 2026-10-16: a hard fling showed empty space past the fifth).
  // A topic shows only once; a chain stops where it would loop back.
  let row = $derived.by(() => {
    const seen = new Set([cur]), lefts = [], rights = [];
    for (let x = l; x && !seen.has(x) && lefts.length < 40; x = leftOf(x)) { seen.add(x); lefts.unshift(x); }
    for (let x = r; x && !seen.has(x) && rights.length < 40; x = rightOf(x)) { seen.add(x); rights.push(x); }
    return [...lefts, cur, ...rights];
  });
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

  let strip;
  const mid = (el) => el.offsetLeft + el.offsetWidth / 2;
  // Look by distance from the centre: only transform and opacity change (cheap). Written straight to the elements.
  function shade() {
    if (!strip) return;
    const c = strip.scrollLeft + strip.clientWidth / 2;
    for (const el of strip.children) {
      const p = Math.min(Math.abs(mid(el) - c) / el.offsetWidth, 2), n = Math.min(p, 1);
      el.style.transform = `scale(${1 - 0.14 * n})`;
      el.style.opacity = 1 - 0.55 * Math.max(0, p - 1);
      el.style.setProperty('--n', n);
    }
  }
  const centre = (el, behavior = 'instant') => strip.scrollTo({ left: mid(el) - strip.clientWidth / 2, behavior });
  // Each new row opens centred on its topic, before the screen paints.
  $effect(() => {
    row;
    const el = strip?.querySelector(`[data-id="${cur}"]`);
    if (el) { centre(el); shade(); }
  });

  // When the scroll has settled on another topic, re-centre on it, then switch the card two frames later.
  let raf, timer, touching = false;
  function switchTo(to) {
    busy = true;
    // Which way the new card slides in: from the right when moving to a later topic.
    ui.slide = row.indexOf(to) > row.indexOf(cur) ? 1 : -1;
    move = { from: cur, to }; cur = to;
    requestAnimationFrame(() => requestAnimationFrame(() => { ui.topic = to; busy = false; }));
  }
  function settle() {
    if (touching || !strip) return;
    const c = strip.scrollLeft + strip.clientWidth / 2;
    const el = [...strip.children].reduce((a, b) => (Math.abs(mid(b) - c) < Math.abs(mid(a) - c) ? b : a));
    // Whatever topic is nearest the centre once the scroll stops counts, also after a hard fling.
    if (el.dataset.id === cur) { if (Math.abs(mid(el) - c) > 2) centre(el, 'smooth'); return; }
    switchTo(el.dataset.id);
  }
  function onscroll() {
    cancelAnimationFrame(raf); raf = requestAnimationFrame(shade);
    clearTimeout(timer); timer = setTimeout(settle, 120);
  }
  const pick = (x) => { const el = strip.querySelector(`[data-id="${x}"]`); if (el) centre(el, 'smooth'); else switchTo(x); };
</script>

<div class="strip" bind:this={strip} {onscroll} onscrollend={settle}
  ontouchstart={() => (touching = true)} ontouchcancel={() => (touching = false)} ontouchend={() => { touching = false; clearTimeout(timer); timer = setTimeout(settle, 120); }}>
  {#each row as x (x)}
    <button class="it" data-id={x} tabindex={x === cur ? -1 : 0} onclick={() => x !== cur && pick(x)}>
      <span class="pair"><span class="col"><TopicIcon id={x} size={48} known={isKnown(x)} /></span><span class="gry"><TopicIcon id={x} size={48} known={isKnown(x)} grey /></span></span>
      <span class="nm">{topics[x].name}</span>
    </button>
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
    {#each list as x}<button class="ch" onclick={() => { all = false; pick(x); }}><b class:ok={isKnown(x)}></b>{topics[x].name}</button>{/each}
  </div>
{/if}
{#if reason}<p class="why small muted"><b>{reason.a}</b> → <b>{reason.b}</b>: {reason.w}</p>{/if}

<style>
  /* The phone's own sideways scroll, one topic per swipe. Only this row scrolls sideways, never the card. */
  .strip {
    position: relative; display: flex; overflow-x: auto; overflow-y: hidden; scroll-snap-type: x mandatory; scrollbar-width: none;
    overscroll-behavior-x: contain; -webkit-overflow-scrolling: touch; margin: 0 -16px; padding: 4px calc(50% - 44px) 2px; /* % is of the card width; the row is 32px wider, so centre = 50% + 16 − 60 */
  }
  .strip::-webkit-scrollbar { display: none; }
  .it {
    flex: none; width: 120px; scroll-snap-align: center; scroll-snap-stop: always; display: grid; justify-items: center; gap: 6px; padding: 4px 6px;
    border: 0; background: none; color: var(--ink); transform-origin: 50% 30%; will-change: transform, opacity;
  }
  .pair { display: grid; }
  .pair > span { grid-area: 1 / 1; }
  .col { opacity: calc(1 - var(--n, 1)); }
  .gry { opacity: var(--n, 1); }
  .nm { opacity: calc(1 - 0.45 * var(--n, 1)); font-size: 0.74rem; font-weight: 700; line-height: 1.2; text-align: center; display: -webkit-box; -webkit-line-clamp: 2; line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }

  /* One slim muted line: small grey text, no box, so the title stays the strongest thing. */
  .lists { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: -6px; }
  .side { display: flex; align-items: center; gap: 4px; min-width: 0; min-height: 28px; padding: 0; border: 0; background: none; color: var(--muted); font-size: 0.72rem; font-weight: 600; opacity: 0.75; white-space: nowrap; overflow: hidden; }
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
