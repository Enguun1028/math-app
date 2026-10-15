<script>
  // Earlier and later topics as a game skin picker (owner, 2026-10-16). The open topic sits in the centre in colour;
  // prerequisites to the left, unlocked topics to the right, grey and a little smaller. Swiping is native scroll with snap.
  // When another topic settles in the centre, the card follows: that topic becomes the open topic.
  import TopicIcon from './TopicIcon.svelte';
  import { topics, topicUnlocks, whyOf } from '../lib/content.js';
  import { topicState } from '../lib/logic.js';
  import { ui } from '../lib/ui.svelte.js';
  import { tick } from 'svelte';

  let { id } = $props();
  // Nearest grade next to the centre on both sides.
  const grade = (x) => topics[x].grades[0] ?? 0;
  let left = $derived([...topics[id].req].sort((a, b) => grade(a) - grade(b)));
  let right = $derived([...topicUnlocks[id]].sort((a, b) => grade(a) - grade(b)));
  let row = $derived([...left, id, ...right]);

  // The link reason after a move along the strip, e.g. «ХИЕХ ба ХБЕХ → Бутархай нэмэх: …».
  let move = $state(null);
  let reason = $derived.by(() => {
    if (!move || move.to !== id) return null;
    const [a, b] = whyOf(move.from, move.to) ? [move.from, move.to] : [move.to, move.from];
    const w = whyOf(a, b);
    return w ? { a: topics[a].name, b: topics[b].name, w } : null;
  });

  let strip;
  const mid = (el) => el.offsetLeft + el.offsetWidth / 2;
  // Side items: grey and smaller by distance from the centre. Small range only, never a big zoom.
  function shade() {
    if (!strip) return;
    const c = strip.scrollLeft + strip.clientWidth / 2;
    for (const el of strip.children) {
      const d = Math.min(Math.abs(mid(el) - c) / el.offsetWidth, 2.5), n = Math.min(d, 1), far = Math.max(0, d - 1);
      el.style.transform = `scale(${1 - 0.18 * n})`;
      el.style.filter = `grayscale(${n}) brightness(${1 - 0.25 * n - 0.1 * far})`;
      el.style.opacity = 1 - 0.2 * n - 0.15 * far;
    }
  }
  const centre = (el, behavior = 'instant') => strip.scrollTo({ left: mid(el) - strip.clientWidth / 2, behavior });
  // Each new row opens centred on the open topic.
  $effect(() => {
    row;
    tick().then(() => { const el = strip?.querySelector(`[data-id="${id}"]`); if (el) { centre(el); shade(); } });
  });
  let raf, timer;
  function onscroll() {
    cancelAnimationFrame(raf); raf = requestAnimationFrame(shade);
    clearTimeout(timer);
    timer = setTimeout(() => {
      const c = strip.scrollLeft + strip.clientWidth / 2;
      const el = [...strip.children].reduce((a, b) => (Math.abs(mid(b) - c) < Math.abs(mid(a) - c) ? b : a));
      if (el.dataset.id !== id) { move = { from: id, to: el.dataset.id }; ui.topic = el.dataset.id; }
    }, 160);
  }
</script>

<div class="strip" bind:this={strip} {onscroll}>
  {#each row as r (r)}
    <button class="it" data-id={r} aria-current={r === id ? 'true' : undefined} onclick={(e) => centre(e.currentTarget, 'smooth')}>
      <TopicIcon id={r} size={44} known={topicState(r) === 'known' || topicState(r) === 'faded'} />
      <span class="nm">{topics[r].name}</span>
    </button>
  {/each}
</div>
<div class="side small muted"><span>{left.length ? '← Мэдвэл зохих' : ''}</span><span>{right.length ? 'Дараагийн →' : ''}</span></div>
<p class="why small muted">{#if reason}<b>{reason.a}</b> → <b>{reason.b}</b>: {reason.w}{/if}</p>

<style>
  .strip {
    position: relative; display: flex; overflow-x: auto; scroll-snap-type: x mandatory; scrollbar-width: none;
    margin: 0 -16px; padding: 6px calc(50% - 44px) 2px; -webkit-overflow-scrolling: touch;
  }
  .strip::-webkit-scrollbar { display: none; }
  .it {
    flex: none; width: 88px; scroll-snap-align: center; display: grid; justify-items: center; gap: 6px; padding: 4px 2px;
    border: 0; background: none; color: var(--ink); transform-origin: 50% 40%; will-change: transform, filter;
  }
  .nm { font-size: 0.72rem; font-weight: 700; line-height: 1.2; text-align: center; display: -webkit-box; -webkit-line-clamp: 2; line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  .side { display: flex; justify-content: space-between; font-size: 0.68rem; letter-spacing: 0.06em; text-transform: uppercase; margin: -10px 0 0; padding: 0 4px; }
  .why { margin: -8px 0 0; text-align: center; min-height: 1.2em; }
  .why b { color: var(--ink); }
  @media (prefers-reduced-motion: reduce) { .it { will-change: auto; } }
</style>
