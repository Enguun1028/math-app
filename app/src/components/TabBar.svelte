<script>
  // Bottom bar, always there, like today's Instagram: five icons, no labels, search in the middle.
  // The open tab's icon fills in and glows; the others are plain white outlines.
  import { route } from '../lib/router.svelte.js';

  const TABS = [
    { id: 'map', href: '#/', label: 'Газрын зураг' },
    { id: 'practice', href: '#/practice', label: 'Дасгал' },
    { id: 'search', href: '#/search', label: 'Бүхнийг хай' },
    { id: 'tools', href: '#/tools', label: 'Хэрэгсэл' },
    { id: 'me', href: '#/me', label: 'Би' },
  ];
  const OF = { practice: 'practice', warmup: 'practice', start: 'practice', search: 'search', c: 'search', tools: 'tools', me: 'me' };
  let on = $derived(OF[route.parts[0]] ?? 'map');
</script>

<nav class="tabbar" aria-label="Үндсэн цэс">
  {#each TABS as t}
    <a class="tab" class:on={on === t.id} href={t.href} aria-label={t.label} aria-current={on === t.id ? 'page' : undefined}>
      {#if t.id === 'map'}
        <svg viewBox="0 0 24 24"><path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2Z" /><path class="cut" d="M9 4v14M15 6v14" /></svg>
      {:else if t.id === 'practice'}
        <svg viewBox="0 0 24 24"><path d="M12 3c1 3 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3.5 2-4.5 0 2 1 3 2 3 0-3 0-6 1-8.5Z" /></svg>
      {:else if t.id === 'search'}
        <svg viewBox="0 0 24 24" class="lens"><circle cx="11" cy="11" r="7.5" /><path d="m21 21-4.5-4.5" /></svg>
      {:else if t.id === 'tools'}
        <svg viewBox="0 0 24 24"><rect x="3" y="7" width="18" height="13" rx="3" /><path class="cut" d="M3 12h18" /><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" /></svg>
      {:else}
        <span class="me"><svg viewBox="0 0 24 24"><circle cx="12" cy="9" r="3.6" /><path d="M5.5 19.5a6.5 6.5 0 0 1 13 0" /></svg></span>
      {/if}
    </a>
  {/each}
</nav>

<style>
  .tabbar {
    position: fixed; left: 0; right: 0; bottom: 0; z-index: 35;
    display: grid; grid-template-columns: repeat(5, 1fr); align-items: center;
    height: calc(var(--tabbar-h) + env(safe-area-inset-bottom)); padding: 0 8px env(safe-area-inset-bottom);
    background: #05070d; border-top: 0.5px solid rgba(120, 160, 220, 0.14);
  }
  .tab { display: grid; place-items: center; height: 100%; color: #ffffff; -webkit-tap-highlight-color: transparent; }
  .tab:active svg { transform: scale(0.9); }
  .tab:focus-visible { outline: 2px solid var(--sky); outline-offset: -6px; border-radius: 12px; }
  svg { width: 28px; height: 28px; fill: none; stroke: currentColor; stroke-width: 2.25; stroke-linecap: round; stroke-linejoin: round; transition: transform 0.15s ease-out; }
  .tab.on { color: var(--sky); }
  .tab.on svg { fill: currentColor; filter: drop-shadow(0 0 5px rgba(34, 211, 238, 0.55)); }
  .tab.on svg .cut { fill: none; stroke: #05070d; }
  .tab.on svg.lens { fill: none; stroke-width: 3; }
  .me { width: 30px; height: 30px; border-radius: 50%; display: grid; place-items: center; background: linear-gradient(140deg, var(--sky), var(--dusk)); box-shadow: 0 0 0 2px #05070d, 0 0 0 3.5px var(--sun); }
  .me svg { width: 20px; height: 20px; stroke: #03161c; stroke-width: 2.4; }
  .tab.on .me { box-shadow: 0 0 0 2px #05070d, 0 0 0 4px var(--sky); }
  .tab.on .me svg { fill: none; filter: none; }
</style>
