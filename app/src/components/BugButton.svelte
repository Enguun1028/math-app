<script>
  // Red bug button at the bottom right of every screen (owner, 2026-10-21: "an icon on the right bottom for the
  // aldaa button. its red and its suggestive. a bug icon"). A tap opens "Алдаа олсон уу?" with the report box
  // ready to type in; the report says which screen it came from.
  import { fade, fly } from 'svelte/transition';
  import { sheetIn, sheetOut, scrimFade, noBleed } from '../lib/motion.js';
  import { ui } from '../lib/ui.svelte.js';
  import Feedback from './Feedback.svelte';

  // raised: on a grade map, where the zoom buttons sit at the bottom right.
  let { raised = false } = $props();

  let open = $state(false);
  let from = $state('');
  const show = () => { from = 'screen:' + (location.hash || '#/') + (ui.topic ? ' topic:' + ui.topic : ''); open = true; };
  const close = () => (open = false);
</script>

<svelte:window onkeydown={(ev) => open && ev.key === 'Escape' && close()} />

<button class="bug" class:raised onclick={show} aria-label="Алдаа мэдэгдэх">
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M9 7.5V6a3 3 0 0 1 6 0v1.5" />
    <rect x="7" y="7.5" width="10" height="12" rx="5" />
    <path d="M12 11v8.5M7 11.5H4M20 11.5h-3M7 15.5H3.5M20.5 15.5H17M7.6 18.5 5 20.5M16.4 18.5l2.6 2M8.5 7.8 6.5 5.5M15.5 7.8l2-2.3" />
  </svg>
</button>

{#if open}
  <div class="scrim" onclick={close} role="presentation" transition:fade={scrimFade}></div>
  <div class="sheet" use:noBleed role="dialog" aria-label="Алдаа олсон уу?" in:fly={sheetIn} out:fly={sheetOut}>
    <div class="grab"></div>
    <button class="sheet-close" aria-label="Хаах" onclick={close}>×</button>
    <h2>Алдаа олсон уу?</h2>
    <p class="small muted">Юу буруу байгааг товч бичээрэй. Бид шалгаад засна.</p>
    <Feedback entry={from} start="error" oncancel={close} />
  </div>
{/if}

<style>
  /* Above the tab bar and clear of the home map's big bottom button. */
  .bug {
    position: fixed; right: 14px; bottom: calc(var(--tabbar-h) + env(safe-area-inset-bottom) + 108px); z-index: 36;
    width: 46px; height: 46px; border-radius: 50%; display: grid; place-items: center; padding: 0;
    background: #e5484d; border: 2px solid #ff8a8e; color: #fff; box-shadow: 0 4px 14px rgba(229, 72, 77, 0.45);
    -webkit-tap-highlight-color: transparent;
  }
  .bug.raised { bottom: calc(var(--tabbar-h) + env(safe-area-inset-bottom) + 200px); }
  .bug:active { transform: scale(0.92); }
  .bug svg { width: 26px; height: 26px; fill: none; stroke: currentColor; stroke-width: 1.9; stroke-linecap: round; stroke-linejoin: round; }
  h2 { margin: 4px 0 4px; }
  p { margin: 0 0 12px; }
</style>
