<script>
  import { entries, sphereById } from '../lib/content.js';
  import { ui } from '../lib/ui.svelte.js';
  import { go } from '../lib/router.svelte.js';
  import { entryState } from '../lib/logic.js';
  import RichText from './RichText.svelte';
  import { fly, fade } from 'svelte/transition';
  import { sheetIn, sheetOut, scrimFade, ms } from '../lib/motion.js';

  // The last entry stays on the card while it slides away.
  let isOpen = $derived(!!(ui.preview && entries[ui.preview]));
  let lastE;
  let e = $derived(isOpen ? (lastE = entries[ui.preview]) : lastE);
  const close = () => (ui.preview = null);
</script>

<svelte:window onkeydown={(ev) => ev.key === 'Escape' && close()} />

{#if isOpen}
  <div class="scrim" onclick={close} role="presentation" transition:fade={scrimFade}></div>
  <div class="sheet" role="dialog" aria-label={e.title} in:fly={sheetIn} out:fly={sheetOut}>
    <div class="grab"></div>
    <p class="small muted">{sphereById[e.sphere]?.title} · {e.type}</p>
    <h2 class="t">{#if e.symbol}<span class="sym">{e.symbol}</span>{/if}{e.title}</h2>
    <p><RichText text={e.definition} /></p>
    <div class="row">
      <button class="btn primary" onclick={() => { const id = e.id; close(); go('/e/' + id); }}>Бүтнээр нь үзэх</button>
      <button class="btn" onclick={close}>Хаах</button>
      {#if entryState(e.id) === 'known'}<span class="badge known">Мэднэ</span>{/if}
    </div>
  </div>
{/if}

<style>
  .scrim { position: fixed; inset: 0; background: rgba(21, 32, 51, 0.3); z-index: 40; }
  .sheet {
    position: fixed; left: 0; right: 0; bottom: 0; z-index: 41;
    max-width: 560px; margin: 0 auto; padding: 12px 20px calc(20px + env(safe-area-inset-bottom));
    background: var(--surface-solid); border-radius: 22px 22px 0 0; box-shadow: 0 -8px 32px rgba(21, 32, 51, 0.18);
    display: grid; gap: 10px;
  }
  .grab { width: 40px; height: 4px; border-radius: 4px; background: var(--line); margin: 0 auto 4px; }
  .t { font-size: 1.3rem; font-weight: 800; }
  .sym { display: inline-grid; place-items: center; min-width: 36px; height: 36px; margin-right: 10px; border-radius: 10px; background: var(--sky-soft); color: var(--sky-deep); }
  .row { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
</style>
