<script>
  // "Халуун сэдвүүд" (owner, 2026-10-13): a row like Instagram stories at the top of the map. Each story is a
  // common knowledge gap, explained with an animation (each has pause, restart and step dots via PlayShell).
  // The list of gaps is a first pick (fractions and negative numbers, where the research shows students fall
  // behind most); the greyed ones are planned: geometry formulas, logarithms, powers, π, proofs.
  import RichText from './RichText.svelte';
  import FractionPlay from './tools/FractionPlay.svelte';
  import FractionOps from './tools/FractionOps.svelte';
  import NumberPlay from './tools/NumberPlay.svelte';
  import { ui } from '../lib/ui.svelte.js';
  import { progress, save } from '../lib/progress.svelte.js';
  import { fade } from 'svelte/transition';
  import { ms } from '../lib/motion.js';

  const STORIES = [
    { id: 'frac-add', label: '1/2 +', name: 'Бутархай нэмэх', topic: 'frac-add', c: '#5cc8ff', note: '1/2 + 1/3 нь 2/5 биш. Яагаад?' },
    { id: 'neg', label: '3 − 5', name: 'Сөрөг тоо', topic: 'int', c: '#ff7aa8', note: 'Их тооноос бага тоо хасвал юу болох вэ?' },
    { id: 'frac-ops', label: '×', name: 'Бутархайн үйлдэл', topic: 'frac-mul', c: '#a78bfa', note: 'Өөрийн тоонуудаар туршаад үзээрэй.' },
  ];
  const SOON = [
    { label: 'S', name: 'Геометрийн томьёо' },
    { label: 'log', name: 'Логарифм' },
    { label: 'aⁿ', name: 'Зэрэг' },
    { label: 'π', name: 'Пи гэж юу вэ' },
    { label: '∴', name: 'Томьёоны баталгаа' },
  ];

  let open = $state(null); // index of the story being watched
  let story = $derived(open == null ? null : STORIES[open]);
  const seen = (id) => !!progress.stories?.[id];
  function watch(k) {
    open = k;
    progress.stories ??= {};
    progress.stories[STORIES[k].id] = true;
    save();
  }
  const close = () => (open = null);
  // The viewer lives on <body>, so the map's top bar (its own layer) cannot cover it.
  const portal = (node) => { document.body.append(node); return { destroy: () => node.remove() }; };
  const next = () => (open < STORIES.length - 1 ? watch(open + 1) : close());
  const prev = () => open > 0 && watch(open - 1);
</script>

<svelte:window onkeydown={(e) => open != null && (e.key === 'Escape' ? close() : e.key === 'ArrowRight' ? next() : e.key === 'ArrowLeft' ? prev() : null)} />

<div class="row" role="list" aria-label="Халуун сэдвүүд">
  {#each STORIES as s, k}
    <button class="st" role="listitem" class:seen={seen(s.id)} style:--c={s.c} onclick={() => watch(k)} aria-label={s.name}>
      <span class="ring"><span class="face"><RichText text={s.label} /></span></span>
      <span class="nm">{s.name}</span>
    </button>
  {/each}
  {#each SOON as s}
    <span class="st soon" role="listitem" aria-label="{s.name}: удахгүй">
      <span class="ring"><span class="face">{s.label}</span></span>
      <span class="nm">{s.name}</span>
    </span>
  {/each}
</div>

{#if story}
  <div class="viewer" use:portal role="dialog" aria-label={story.name} style:--c={story.c} transition:fade={{ duration: ms(200) }}>
    <div class="bars" aria-hidden="true">{#each STORIES as _, k}<span class:on={k <= open}></span>{/each}</div>
    <header>
      <span class="ring small"><span class="face"><RichText text={story.label} /></span></span>
      <div><strong>{story.name}</strong><p class="small muted"><RichText text={story.note} /></p></div>
      <button class="x" aria-label="Хаах" onclick={close}>×</button>
    </header>
    {#key open}
      <div class="body">
        {#if story.id === 'frac-add'}<FractionPlay A={{ n: 1, d: 2 }} B={{ n: 1, d: 3 }} op="+" />
        {:else if story.id === 'neg'}<NumberPlay a={3} b={5} op="−" />
        {:else}<FractionOps />{/if}
      </div>
    {/key}
    <footer>
      <button class="btn" disabled={open === 0} onclick={prev}>‹ Өмнөх</button>
      <button class="btn ghost" onclick={() => { const t = story.topic; close(); ui.topic = t; }}>Сэдэв нээх</button>
      <button class="btn sun" onclick={next}>{open < STORIES.length - 1 ? 'Дараах ›' : 'Дуусгах'}</button>
    </footer>
  </div>
{/if}

<style>
  .row { display: flex; gap: 12px; overflow-x: auto; padding: 4px 2px 6px; scrollbar-width: none; pointer-events: auto; }
  .row::-webkit-scrollbar { display: none; }
  .st { flex: none; width: 66px; display: grid; justify-items: center; gap: 4px; border: 0; background: none; padding: 0; color: var(--ink); -webkit-tap-highlight-color: transparent; }
  .ring {
    width: 60px; height: 60px; border-radius: 50%; padding: 3px; display: grid;
    background: conic-gradient(from 200deg, var(--c), #ffcc66, var(--c));
    box-shadow: 0 0 14px color-mix(in srgb, var(--c) 45%, transparent);
  }
  .face {
    border-radius: 50%; display: grid; place-items: center; background: #070b16; border: 2px solid #05070d;
    font-family: var(--math); font-size: 0.78rem; color: #fff; white-space: nowrap; overflow: hidden;
  }
  .st.seen .ring { background: var(--line); box-shadow: none; }
  .st.soon { opacity: 0.45; --c: var(--muted); }
  .st.soon .ring { background: none; border: 1.5px dashed var(--muted); padding: 2px; box-shadow: none; }
  .nm { font-size: 0.68rem; font-weight: 700; line-height: 1.15; text-align: center; color: var(--muted); }
  .st:not(.soon) .nm { color: var(--ink); }
  .st:focus-visible .ring { outline: 2px solid var(--sky); outline-offset: 2px; }

  .viewer {
    position: fixed; inset: 0; z-index: 60; display: grid; grid-template-rows: auto auto 1fr auto; gap: 12px;
    padding: calc(env(safe-area-inset-top, 0px) + 10px) 16px calc(env(safe-area-inset-bottom, 0px) + 14px);
    background: radial-gradient(100% 60% at 50% 30%, color-mix(in srgb, var(--c) 14%, #05070d), #05070d 70%);
    max-width: 640px; margin: 0 auto;
  }
  .bars { display: flex; gap: 4px; }
  .bars span { flex: 1; height: 3px; border-radius: 3px; background: rgba(255, 255, 255, 0.2); }
  .bars span.on { background: #fff; }
  header { display: flex; align-items: center; gap: 10px; }
  header div { flex: 1; min-width: 0; }
  header p { margin: 0; }
  .ring.small { width: 40px; height: 40px; flex: none; }
  .ring.small .face { font-size: 0.7rem; }
  .x { width: 44px; height: 44px; border: 0; background: none; color: var(--muted); font-size: 1.6rem; }
  .body { overflow-y: auto; min-height: 0; }
  footer { display: flex; gap: 8px; justify-content: space-between; }
  footer .btn { min-height: 46px; padding: 0 12px; white-space: nowrap; font-size: 0.9rem; }
  footer .btn:disabled { opacity: 0.35; }
</style>
