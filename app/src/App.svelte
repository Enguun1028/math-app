<script>
  import { fade, fly } from 'svelte/transition';
  import { route, back } from './lib/router.svelte.js';
  import { ui } from './lib/ui.svelte.js';
  import { ms, ease, reduced } from './lib/motion.js';
  import { ZOOM_IN_MS, ZOOM_OUT_MS } from './lib/zoom.js';
  import MapView from './components/MapView.svelte';
  import SubMap from './components/SubMap.svelte';
  import MathMap from './components/MathMap.svelte';
  import MapToggle from './components/MapToggle.svelte';
  import EntryPage from './components/EntryPage.svelte';
  import TestPage from './components/TestPage.svelte';
  import StartCheck from './components/StartCheck.svelte';
  import WarmUp from './components/WarmUp.svelte';
  import { progress, recordVisit } from './lib/progress.svelte.js';

  // Back after a few days with something learned: say hello and offer a short warm-up (no streak guilt).
  if (recordVisit() >= 3 && Object.keys(progress.known).length) ui.welcome = true;
  import TermSheet from './components/TermSheet.svelte';
  import TopicSheet from './components/TopicSheet.svelte';
  import TabBar from './components/TabBar.svelte';
  import SearchPage from './components/SearchPage.svelte';
  import IdeaPage from './components/IdeaPage.svelte';
  import PracticePage from './components/PracticePage.svelte';
  import ToolsPage from './components/ToolsPage.svelte';
  import MePage from './components/MePage.svelte';
  import LevelSheet from './components/LevelSheet.svelte';

  // Owner, 2026-10-12: dragging on a short sheet moved the map behind it. While a sheet is open, a drag on the
  // dimmed background or on a sheet too short to scroll does nothing; a tall sheet scrolls itself and stops at its ends.
  addEventListener('touchmove', (ev) => {
    const t = ev.target instanceof Element ? ev.target : null;
    if (!t) return;
    if (t.closest('.scrim')) return ev.preventDefault();
    const sheet = t.closest('.sheet');
    if (sheet && sheet.scrollHeight <= sheet.clientHeight + 1) ev.preventDefault();
  }, { passive: false });

  let [page, id] = $derived(route.parts);
  // Tab pages stand on their own; the other pages get a top bar with "‹ Буцах".
  const TAB_PAGES = ['m', 'practice', 'search', 'tools', 'me'];
  let tabPage = $derived(TAB_PAGES.includes(page));
  // Opening or closing a grade sphere is one camera zoom (lib/zoom.js) that the map and the grade map run
  // themselves, so for those the layers neither fade nor slide; they only stay until the zoom is done.
  let zoomIn = $derived(!!ui.morph && !reduced);
  let pageIn = $derived({ y: zoomIn ? 0 : 10, duration: ms(zoomIn ? 0 : 260), easing: ease });
  let mapOut = $derived(zoomIn ? { hold: ZOOM_IN_MS + 120 } : { duration: ms(180), easing: ease });
  let pageOut = $derived(!page && ui.back && !reduced ? { hold: ZOOM_OUT_MS + 80 } : { duration: ms(180), easing: ease });
  // Fade, or with { hold } just keep the layer on screen for that long.
  const leave = (node, p) => (p.hold ? { duration: p.hold } : fade(node, p));
</script>

{#if !page}
  <div class="layer" in:fade={{ duration: ms(ui.back ? 0 : 240), easing: ease }} out:leave={mapOut}>
    <MapView />
  </div>
{:else}
  <div class="layer" in:fade={{ duration: ms(zoomIn ? 0 : 220), easing: ease }} out:leave={pageOut}>
    {#if !tabPage}
      <header class="bar">
        <button class="btn ghost" onclick={back} aria-label="Буцах">‹ Буцах</button>
      </header>
    {/if}
    <main class="wrap">
      {#key route.parts.join('/')}
        <div in:fly={pageIn}>
          {#if page === 's'}
            <SubMap {id} />
          {:else if page === 'm'}
            <MathMap />
          {:else if page === 'e'}
            <EntryPage {id} />
          {:else if page === 'test'}
            <TestPage {id} />
          {:else if page === 'start'}
            <StartCheck />
          {:else if page === 'warmup'}
            <WarmUp />
          {:else if page === 'search'}
            <SearchPage />
          {:else if page === 'c'}
            <IdeaPage {id} />
          {:else if page === 'practice'}
            <PracticePage />
          {:else if page === 'tools'}
            <ToolsPage />
          {:else if page === 'me'}
            <MePage />
          {/if}
        </div>
      {/key}
    </main>
  </div>
{/if}

{#if !page || page === 'm'}<MapToggle />{/if}
<TabBar />
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
</style>
