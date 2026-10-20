<script>
  // One tool, by id: used by the tools page and by the tool tab in the bottom bar.
  import Visual from './Visual.svelte';
  import GraphTool from './tools/GraphTool.svelte';
  import NumberLineTool from './tools/NumberLineTool.svelte';
  import ScaleTool from './tools/ScaleTool.svelte';
  import FractionTool from './tools/FractionTool.svelte';
  import CoordTool from './tools/CoordTool.svelte';

  let { id } = $props();
  let rows = $state(3), cols = $state(4);
</script>

{#if id === 'graph'}
  <GraphTool />
{:else if id === 'numberline'}
  <NumberLineTool />
{:else if id === 'scale'}
  <ScaleTool />
{:else if id === 'fraction'}
  <FractionTool />
{:else if id === 'coord'}
  <CoordTool />
{:else}
  <Visual v={{ kind: 'grid', rows, cols }} />
  <div class="ctl">
    <label>Мөр: <b>{rows}</b><input type="range" min="1" max="10" bind:value={rows} /></label>
    <label>Багана: <b>{cols}</b><input type="range" min="1" max="10" bind:value={cols} /></label>
  </div>
{/if}

<style>
  .ctl { display: grid; gap: 10px; }
  label { display: grid; gap: 2px; font-weight: 600; font-size: 0.9rem; }
  input[type='range'] { width: 100%; accent-color: var(--sky); }
</style>
