<script>
  // Bottom bar, always there, like today's Instagram: five icons, no labels, search in the middle.
  // The open tab's icon fills in and glows; the others are plain white outlines.
  import { route } from '../lib/router.svelte.js';
  import { slot, toolById } from '../lib/tools.svelte.js';

  // The 2nd tab holds whichever tool the student pinned (graph calculator by default; owner, 2026-10-20).
  let TABS = $derived([
    { id: 'map', href: '#/', label: 'Газрын зураг' },
    { id: 'slot', href: '#/t', label: toolById[slot.id].name },
    { id: 'search', href: '#/search', label: 'Бүхнийг хай' },
    { id: 'tools', href: '#/tools', label: 'Хэрэгсэл' },
    { id: 'me', href: '#/me', label: 'Би' },
  ]);
  const OF = { t: 'slot', search: 'search', c: 'search', tools: 'tools', me: 'me' };
  let on = $derived(OF[route.parts[0]] ?? 'map');
</script>

<nav class="tabbar" aria-label="Үндсэн цэс">
  {#each TABS as t}
    <a class="tab" class:on={on === t.id} href={t.href} aria-label={t.label} aria-current={on === t.id ? 'page' : undefined}>
      {#if t.id === 'map'}
        <svg viewBox="0 0 24 24"><path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2Z" /><path class="cut" d="M9 4v14M15 6v14" /></svg>
      {:else if t.id === 'slot'}
        <!-- Line icons stay outlines when active; the glow and colour show the open tab. -->
        <svg viewBox="0 0 24 24" class="line">
          {#if slot.id === 'graph'}<path d="M3 3v18h18" /><path d="M6 17c2.5-8 5-9 7-4s4 4 7-7" />
          {:else if slot.id === 'numberline'}<path d="M2 12h20M5 9v6M12 9v6M19 9v6" />
          {:else if slot.id === 'scale'}<path d="M12 4v16M7 20h10M4 7h16M4 7l-2.5 6h5ZM20 7l-2.5 6h5Z" />
          {:else if slot.id === 'fraction'}<rect x="3" y="4" width="18" height="7" rx="2" /><rect x="3" y="13" width="9" height="7" rx="2" />
          {:else if slot.id === 'grid'}<rect x="3" y="3" width="18" height="18" rx="2" /><path d="M9 3v18M15 3v18M3 9h18M3 15h18" />
          {:else}<path d="M12 2v20M2 12h20" /><circle cx="17" cy="7" r="1.6" />{/if}
        </svg>
      {:else if t.id === 'search'}
        <!-- Search is the core feature (owner, 2026-10-13): a big glowing half circle rising out of the bar. -->
        <span class="fab"><svg viewBox="0 0 24 24" class="lens"><circle cx="11" cy="11" r="7" /><path d="m20.5 20.5-4.6-4.6" /></svg></span>
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
  .tab.on svg { fill: currentColor; filter: drop-shadow(0 0 5px rgba(34, 211, 238, 0.33)); }
  .tab.on svg .cut { fill: none; stroke: #05070d; }
  .tab.on svg.line { fill: none; stroke-width: 2.6; }
  .tab.on svg.lens { fill: none; stroke-width: 3; }
  .tab:has(.fab) { overflow: visible; position: relative; }
  .fab {
    position: absolute; left: 50%; top: -24px; width: 64px; height: 64px; margin-left: -32px; border-radius: 50%;
    display: grid; place-items: center; background: radial-gradient(circle at 35% 30%, #7ff3ff, var(--sky) 45%, #0e7fa0);
    box-shadow: 0 0 0 5px #05070d, 0 0 22px rgba(34, 211, 238, 0.39); animation: fabglow 2.8s ease-in-out infinite;
  }
  /* The rim of the bar bends around the button, so it reads as rising out of the bar. */
  .fab::before { content: ''; position: absolute; inset: -6px; border-radius: 50%; border-top: 0.5px solid rgba(120, 160, 220, 0.25); clip-path: inset(0 0 55% 0); }
  .fab svg.lens, .tab.on .fab svg.lens { width: 30px; height: 30px; fill: none; stroke: #03161c; stroke-width: 2.8; filter: none; }
  .tab.on .fab { box-shadow: 0 0 0 5px #05070d, 0 0 30px rgba(34, 211, 238, 0.57); }
  @keyframes fabglow { 50% { box-shadow: 0 0 0 5px #05070d, 0 0 34px rgba(34, 211, 238, 0.57); } }
  @media (prefers-reduced-motion: reduce) { .fab { animation: none; } }
  .me { width: 30px; height: 30px; border-radius: 50%; display: grid; place-items: center; background: linear-gradient(140deg, var(--sky), var(--dusk)); box-shadow: 0 0 0 2px #05070d, 0 0 0 3.5px var(--sun); }
  .me svg { width: 20px; height: 20px; stroke: #03161c; stroke-width: 2.4; }
  .tab.on .me { box-shadow: 0 0 0 2px #05070d, 0 0 0 4px var(--sky); }
  .tab.on .me svg { fill: none; filter: none; }
</style>
