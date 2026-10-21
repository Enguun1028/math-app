<script>
  import { fade, fly } from 'svelte/transition';
  import { route, back, leaving } from './lib/router.svelte.js';
  import { ui } from './lib/ui.svelte.js';
  import { ms, ease, reduced, lockInput } from './lib/motion.js';
  import { ZOOM_IN_MS, ZOOM_OUT_MS } from './lib/zoom.js';
  import MapView from './components/MapView.svelte';
  import SubMap from './components/SubMap.svelte';
  import MathMap from './components/MathMap.svelte';
  import MapToggle from './components/MapToggle.svelte';
  import { progress, recordVisit } from './lib/progress.svelte.js';
  import { track } from './lib/track.svelte.js';

  // Back after a few days with something learned: say hello and offer a short warm-up (no streak guilt).
  const away = recordVisit();
  track('app_opened', { days_since_last: away, days_opened: progress.days?.length ?? 0 });
  if (away >= 3 && Object.keys(progress.known).length) ui.welcome = true;
  import TermSheet from './components/TermSheet.svelte';
  import TabBar from './components/TabBar.svelte';
  import Lazy from './components/Lazy.svelte';
  import { lazy, preloadWhenIdle } from './lib/lazy.js';

  // Everything except the maps, tab bar and term preview is its own file (lib/lazy.js).
  const L = {
    entry: lazy(() => import('./components/EntryPage.svelte')),
    test: lazy(() => import('./components/TestPage.svelte')),
    start: lazy(() => import('./components/StartCheck.svelte')),
    warmup: lazy(() => import('./components/WarmUp.svelte')),
    topic: lazy(() => import('./components/TopicSheet.svelte')),
    search: lazy(() => import('./components/SearchPage.svelte')),
    idea: lazy(() => import('./components/IdeaPage.svelte')),
    slot: lazy(() => import('./components/ToolSlotPage.svelte')),
    tools: lazy(() => import('./components/ToolsPage.svelte')),
    me: lazy(() => import('./components/MePage.svelte')),
    level: lazy(() => import('./components/LevelSheet.svelte')),
  };
  // Most used first: the topic card and search, then the level check and the rest.
  preloadWhenIdle([L.topic, L.search, L.level, L.start, L.me, L.entry, L.idea, L.slot, L.tools, L.test, L.warmup]);

  // Owner, 2026-10-12: dragging on a short sheet moved the map behind it. While a sheet is open, a drag on the
  // dimmed background or on a sheet too short to scroll does nothing; a tall sheet scrolls itself and stops at its ends.
  // Done per sheet (motion.js noBleed) and in CSS (app.css), so scrolling elsewhere never waits for JavaScript.

  let [page, id] = $derived(route.parts);
  // Tab pages stand on their own; the other pages get a top bar with "‹ Буцах".
  const TAB_PAGES = ['m', 't', 'search', 'tools', 'me'];
  let tabPage = $derived(TAB_PAGES.includes(page));
  // Opening or closing a grade sphere is one camera zoom (lib/zoom.js) that the map and the grade map run
  // themselves, so for those the layers neither fade nor slide; they only stay until the zoom is done.
  let zoomIn = $derived(!!ui.morph && !reduced);
  let pageIn = $derived({ y: zoomIn ? 0 : 10, duration: ms(zoomIn ? 0 : 260), easing: ease });
  let mapOut = $derived(zoomIn ? { hold: ZOOM_IN_MS + 120 } : { duration: ms(180), easing: ease });
  let pageOut = $derived(!page && ui.back && !reduced ? { hold: ZOOM_OUT_MS + 80 } : { duration: ms(180), easing: ease });
  // Fade, or with { hold } just keep the layer on screen for that long. The leaving layer is pinned where it was
  // (fixed, at its old scroll spot) and ignores touches, so it never pushes the new page down or scrolls with it.
  const leave = (node, p) => {
    // The layer is never fixed itself, so no style lookup is needed (it forced a style pass on every page change).
    Object.assign(node.style, { position: 'fixed', left: '0', right: '0', top: -leaving.y + 'px' });
    node.style.pointerEvents = 'none';
    return p.hold ? { duration: p.hold } : fade(node, p);
  };
  // No scrolling while a page change or a zoom runs.
  $effect(() => {
    route.parts.join('/');
    lockInput(zoomIn ? ZOOM_IN_MS + 120 : !page && ui.back ? ZOOM_OUT_MS + 80 : ms(260));
  });
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
            <Lazy get={L.entry} {id} />
          {:else if page === 'test'}
            <Lazy get={L.test} {id} />
          {:else if page === 'start'}
            <Lazy get={L.start} />
          {:else if page === 'warmup'}
            <Lazy get={L.warmup} />
          {:else if page === 'search'}
            <Lazy get={L.search} />
          {:else if page === 'c'}
            <Lazy get={L.idea} {id} />
          {:else if page === 't'}
            <Lazy get={L.slot} />
          {:else if page === 'tools'}
            <Lazy get={L.tools} />
          {:else if page === 'me'}
            <Lazy get={L.me} />
          {/if}
        </div>
      {/key}
    </main>
  </div>
{/if}

{#if !page || page === 'm'}<MapToggle />{/if}
<TabBar />
<Lazy get={L.topic} when={!!ui.topic} float />
<TermSheet />
<Lazy get={L.level} when={ui.level} float />

<style>
  .bar {
    position: sticky; top: 0; z-index: 10;
    display: flex; align-items: center; justify-content: space-between;
    max-width: 560px; margin: 0 auto; padding: 8px;
    background: color-mix(in srgb, var(--bg) 96%, transparent);
  }
</style>
