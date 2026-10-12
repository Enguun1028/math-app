<script>
  // Tool bag: tools always one tap away.
  import { ui } from '../lib/ui.svelte.js';
  import Visual from './Visual.svelte';
  import NumberLineTool from './tools/NumberLineTool.svelte';
  import ScaleTool from './tools/ScaleTool.svelte';
  import FractionTool from './tools/FractionTool.svelte';
  import CoordTool from './tools/CoordTool.svelte';
  import { fly, fade } from 'svelte/transition';
  import { sheetIn, sheetOut, scrimFade, ms, ease } from '../lib/motion.js';

  const tools = [
    { id: 'numberline', name: 'Тооны шулуун' },
    { id: 'scale', name: 'Жин' },
    { id: 'fraction', name: 'Бутархай' },
    { id: 'grid', name: 'Талбайн тор' },
    { id: 'coord', name: 'Координатын хавтгай' },
  ];

  let rows = $state(3), cols = $state(4);

  // Switching tools: the new one glides in from the side of the tab you tapped; the highlight slides along.
  let dir = $state(1);
  const pickTool = (id) => {
    dir = tools.findIndex((t) => t.id === id) >= tools.findIndex((t) => t.id === ui.tool) ? 1 : -1;
    ui.tool = id;
  };
  let tabEls = $state({});
  let pill = $derived.by(() => {
    const el = tabEls[ui.tool];
    return el ? { x: el.offsetLeft, w: el.offsetWidth } : null;
  });

  // On pages that scroll, the button steps aside while reading down (so it never covers answers)
  // and comes back on any scroll up or near the bottom. The map scrolls inside itself, so it stays there.
  let hidden = $state(false);
  let lastY = 0;
  function onScroll() {
    const y = scrollY;
    const nearEnd = innerHeight + y > document.documentElement.scrollHeight - 80;
    if (Math.abs(y - lastY) < 6) return;
    hidden = y > lastY && y > 80 && !nearEnd;
    lastY = y;
  }


</script>

<svelte:window onscroll={onScroll} />

<button class="fab" class:away={hidden && !ui.tools} onclick={() => (ui.tools = !ui.tools)} aria-expanded={ui.tools} aria-label="Хэрэгслийн цүнх">
  <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="7" width="18" height="13" rx="3" /><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 12h18" /></svg>
</button>

{#if ui.tools}
  <div class="scrim" onclick={() => (ui.tools = false)} role="presentation" transition:fade={scrimFade}></div>
  <div class="sheet" role="dialog" aria-label="Хэрэгслийн цүнх" in:fly={sheetIn} out:fly={sheetOut}>
    <div class="top">
      <h2>Хэрэгслийн цүнх</h2>
      <button class="btn ghost" onclick={() => (ui.tools = false)}>Хаах</button>
    </div>
    <div class="tabs">
      {#if pill}<span class="pill" style:transform="translateX({pill.x}px)" style:width="{pill.w}px"></span>{/if}
      {#each tools as t}
        <button class="chip" class:on={ui.tool === t.id} bind:this={tabEls[t.id]} onclick={() => pickTool(t.id)}>{t.name}</button>
      {/each}
    </div>

    {#key ui.tool}
    <div class="tool" in:fly={{ x: 28 * dir, duration: ms(280), easing: ease }}>
    {#if ui.tool === 'numberline'}
      <NumberLineTool />
    {:else if ui.tool === 'scale'}
      <ScaleTool />
    {:else if ui.tool === 'fraction'}
      <FractionTool />
    {:else if ui.tool === 'coord'}
      <CoordTool />
    {:else}
      <Visual v={{ kind: 'grid', rows, cols }} />
      <div class="ctl">
        <label>Мөр: <b>{rows}</b><input type="range" min="1" max="10" bind:value={rows} /></label>
        <label>Багана: <b>{cols}</b><input type="range" min="1" max="10" bind:value={cols} /></label>
      </div>
    {/if}
    </div>
    {/key}
  </div>
{/if}

<style>
  .fab {
    position: fixed; right: max(16px, calc(50vw - 264px)); bottom: calc(20px + env(safe-area-inset-bottom)); z-index: 30;
    width: 56px; height: 56px; border-radius: 18px; border: 0; background: var(--surface-solid); color: var(--sky); border: 1px solid rgba(34, 211, 238, 0.5);
    display: grid; place-items: center; box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
  }
  .fab { transition: transform 0.3s cubic-bezier(0.32, 0.72, 0, 1), opacity 0.3s; }
  .fab.away { transform: translateY(120%); opacity: 0; pointer-events: none; }
  .fab svg { width: 26px; height: 26px; fill: none; stroke: currentColor; stroke-width: 2; stroke-linejoin: round; }
  .fab:focus-visible { outline: 3px solid var(--sky); outline-offset: 3px; }
  .top { display: flex; justify-content: space-between; align-items: center; }
  .tabs { position: relative; display: flex; gap: 8px; overflow-x: auto; scrollbar-width: none; }
  .tabs .chip { flex: none; position: relative; z-index: 1; transition: color 0.25s, border-color 0.25s; }
  .tabs .chip.on { background: transparent; border-color: transparent; }
  .pill {
    position: absolute; left: 0; top: 0; height: 44px; border-radius: 999px; background: var(--sky);
    box-shadow: var(--glow); transition: transform 0.32s cubic-bezier(0.22, 0.8, 0.24, 1), width 0.32s cubic-bezier(0.22, 0.8, 0.24, 1);
  }
  .tool { display: grid; gap: 12px; }
  .ctl { display: grid; gap: 10px; }
  label { display: grid; gap: 2px; font-weight: 600; font-size: 0.9rem; }
  input[type='range'] { width: 100%; accent-color: var(--sky); }
  .pair { display: flex; align-items: center; gap: 6px; font-weight: 600; }
  .pair span { width: 64px; }
  .pair input { width: 64px; min-height: 40px; font: inherit; text-align: center; border: 1.5px solid var(--line); border-radius: 10px; }
  .res { font-size: 1.2rem; text-align: center; }
</style>
