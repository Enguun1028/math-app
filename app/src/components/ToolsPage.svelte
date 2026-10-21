<script>
  // "Хэрэгсэл" tab: every tool on one page (graph calculator first). Any tool can be pinned to the bottom bar.
  import { ui } from '../lib/ui.svelte.js';
  import ToolView from './ToolView.svelte';
  import { TOOLS as tools, slot, pinTool } from '../lib/tools.svelte.js';
  import { fly } from 'svelte/transition';
  import { ms, ease } from '../lib/motion.js';
  import Hint from './Hint.svelte';

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
  <Hint id="tools" text="Граф, бутархай, тоон шулуун... Дарж туршаад үз. Дуртайгаа доод цэсэнд зүүж болно." />
    <h1>Хэрэгсэл</h1>
    <div class="tabs">
      {#if pill}<span class="pill" style:transform="translateX({pill.x}px)" style:width="{pill.w}px"></span>{/if}
      {#each tools as t}
        <button class="chip" class:on={ui.tool === t.id} bind:this={tabEls[t.id]} onclick={() => pickTool(t.id)}>{t.name}</button>
      {/each}
    </div>

    <!-- Pin this tool to the bottom bar (the 2nd tab). -->
    {#if slot.id === ui.tool}
      <p class="pinned small">📌 Доод цэсэнд байгаа</p>
    {:else}
      <button class="pin" onclick={() => pinTool(ui.tool)}>📌 Доод цэсэнд байрлуулах</button>
    {/if}

    {#key ui.tool}
    <div class="tool" in:fly={{ x: 28 * dir, duration: ms(280), easing: ease }}>
    <ToolView id={ui.tool} />
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
  .pin { justify-self: start; min-height: 40px; padding: 0 14px; border-radius: 999px; border: 1px solid rgba(255, 204, 102, 0.6); background: var(--sun-soft); color: var(--sun); font-weight: 700; }
  .pinned { color: var(--muted); }
  .pair { display: flex; align-items: center; gap: 6px; font-weight: 600; }
  .pair span { width: 64px; }
  .pair input { width: 64px; min-height: 40px; font: inherit; text-align: center; border: 1.5px solid var(--line); border-radius: 10px; }
  .res { font-size: 1.2rem; text-align: center; }
</style>
