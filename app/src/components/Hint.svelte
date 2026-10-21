<script>
  // A one-time tip (owner, 2026-10-22: a tutorial level, then small hints the first time a page opens).
  // Each id shows once per device; × or "Ойлголоо" hides it for good. float: pinned above the tab bar
  // instead of sitting in the page (for the pannable grade map).
  import { fly } from 'svelte/transition';
  import { progress, save } from '../lib/progress.svelte.js';
  import { track } from '../lib/track.svelte.js';
  import { ms, ease } from '../lib/motion.js';

  let { id, text, float = false } = $props();
  let shown = $derived(!progress.hints?.[id]);
  $effect(() => { if (shown) track('hint_shown', { hint: id }); });
  function close() {
    progress.hints = { ...progress.hints, [id]: true };
    save();
  }
</script>

{#if shown}
  <div class="hint" class:float role="note" transition:fly={{ y: 12, duration: ms(260), easing: ease }}>
    <span class="i" aria-hidden="true">💡</span>
    <p>{text}</p>
    <button class="ok" onclick={close}>Ойлголоо</button>
  </div>
{/if}

<style>
  .hint {
    display: grid; grid-template-columns: auto minmax(0, 1fr) auto; align-items: center; gap: 10px; margin: 0 0 14px;
    padding: 10px 10px 10px 12px; border-radius: 16px; background: rgba(12, 15, 21, 0.97);
    border: 1px solid color-mix(in srgb, var(--sky) 45%, var(--line)); box-shadow: 0 0 24px rgba(34, 211, 238, 0.12);
  }
  .hint.float {
    position: fixed; z-index: 30; left: 16px; right: 16px; margin: 0 auto; max-width: 528px;
    bottom: calc(var(--tabbar-h) + env(safe-area-inset-bottom) + 34px);
  }
  .i { font-size: 1.2rem; }
  p { margin: 0; line-height: 1.35; }
  .ok { min-height: 40px; padding: 0 12px; border: 0; border-radius: 12px; background: var(--sky-soft); color: var(--sky); font-weight: 800; }
</style>
