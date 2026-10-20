<script>
  // The 2nd tab: the tool the student pinned (the graph calculator until they pick another).
  import ToolView from './ToolView.svelte';
  import { TOOLS, toolById, slot, pinTool } from '../lib/tools.svelte.js';

  let picking = $state(false);
</script>

<div class="slot-page">
  <div class="head">
    <h1>{toolById[slot.id].name}</h1>
    <button class="swap" onclick={() => (picking = !picking)} aria-expanded={picking}>⇄ Солих</button>
  </div>
  {#if picking}
    <div class="pick" role="group" aria-label="Энэ цэсэнд ямар хэрэгсэл байх вэ">
      {#each TOOLS as t}
        <button class="chip" class:on={slot.id === t.id} onclick={() => { pinTool(t.id); picking = false; }}>{t.name}</button>
      {/each}
    </div>
  {/if}
  {#key slot.id}<div class="tool"><ToolView id={slot.id} /></div>{/key}
</div>

<style>
  .slot-page { display: grid; gap: 14px; padding-top: 16px; }
  .head { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
  .swap { min-height: 40px; padding: 0 14px; border-radius: 999px; border: 1px solid var(--line); background: var(--surface); color: var(--sky); font-weight: 700; }
  .pick { display: flex; flex-wrap: wrap; gap: 8px; }
  .pick .chip.on { background: var(--sky); color: var(--on-sky); border-color: var(--sky); }
  .tool { display: grid; gap: 12px; }
</style>
