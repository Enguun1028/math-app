<script>
  import { fade, fly } from 'svelte/transition';
  import { route, back } from './lib/router.svelte.js';
  import { ui } from './lib/ui.svelte.js';
  import { ms, ease } from './lib/motion.js';
  import MapView from './components/MapView.svelte';
  import SubMap from './components/SubMap.svelte';
  import EntryPage from './components/EntryPage.svelte';
  import TestPage from './components/TestPage.svelte';
  import StartCheck from './components/StartCheck.svelte';
  import TermSheet from './components/TermSheet.svelte';
  import TopicSheet from './components/TopicSheet.svelte';
  import ToolBag from './components/ToolBag.svelte';
  import LevelSheet from './components/LevelSheet.svelte';

  let [page, id] = $derived(route.parts);
  // A sphere opened from the map animates its own circles, so the page itself only fades.
  let pageIn = $derived({ y: ui.morph ? 0 : 14, duration: ms(ui.morph ? 200 : 280), easing: ease });
  // Opening or closing a sphere is one long motion, so those layers stay a little longer.
  let mapOut = $derived({ duration: ms(ui.morph ? 480 : 220) });
  let pageOut = $derived({ duration: ms(!page && ui.back ? 460 : 160) });
</script>

{#if !page}
  <div class="layer" in:fade={{ duration: ms(ui.back ? 0 : 260) }} out:fade={mapOut}>
    <MapView />
  </div>
{:else}
  <div class="layer" in:fade={{ duration: ms(200) }} out:fade={pageOut}>
    <header class="bar">
      <button class="btn ghost" onclick={back} aria-label="Буцах">‹ Буцах</button>
      <a class="home" href="#/">Газрын зураг</a>
    </header>
    <main class="wrap">
      {#key route.parts.join('/')}
        <div in:fly={pageIn}>
          {#if page === 's'}
            <SubMap {id} />
          {:else if page === 'e'}
            <EntryPage {id} />
          {:else if page === 'test'}
            <TestPage {id} />
          {:else if page === 'start'}
            <StartCheck />
          {/if}
        </div>
      {/key}
    </main>
  </div>
{/if}

<ToolBag />
<TopicSheet />
<TermSheet />
<LevelSheet />

<style>
  .bar {
    position: sticky; top: 0; z-index: 10;
    display: flex; align-items: center; justify-content: space-between;
    max-width: 560px; margin: 0 auto; padding: 8px;
    background: color-mix(in srgb, var(--bg) 80%, transparent);
    backdrop-filter: blur(10px);
  }
  .home { font-weight: 800; font-size: 0.75rem; letter-spacing: 0.2em; text-transform: uppercase; color: var(--sky); text-decoration: none; padding: 0 8px; }
</style>
