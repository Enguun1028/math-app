<script>
  // "Хэрэгсэл" tab: the tool bag as its own page (number line, scale, fraction bar, area grid, coordinate plane).
  import { ui } from '../lib/ui.svelte.js';
  import Visual from './Visual.svelte';
  import NumberLineTool from './tools/NumberLineTool.svelte';
  import ScaleTool from './tools/ScaleTool.svelte';
  import FractionTool from './tools/FractionTool.svelte';
  import CoordTool from './tools/CoordTool.svelte';
  import { fly } from 'svelte/transition';
  import { ms, ease } from '../lib/motion.js';

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

</script>

<div class="tools-page">
    <h1>Хэрэгсэл</h1>
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

<style>
  .tools-page { display: grid; gap: 16px; padding-top: 16px; }
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
