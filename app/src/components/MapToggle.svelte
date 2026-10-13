<script>
  // Switch between the two maps on the same data (owner, 2026-10-13): the curriculum map (home, school order)
  // and the pure math map (branches of mathematics and how ideas connect).
  // One toggle for both maps, mounted once in App.svelte, so it stays in the same spot and the highlight
  // slides between the two options instead of jumping (owner: "continuity error ... not smooth").
  import { route } from '../lib/router.svelte.js';
  let math = $derived(route.parts[0] === 'm');
</script>

<div class="dock">
  <div class="toggle" class:math role="group" aria-label="Газрын зураг сонгох">
    <span class="pill" aria-hidden="true"></span>
    <a href="#/" class:on={!math} aria-current={!math ? 'page' : undefined}>Хөтөлбөр</a>
    <a href="#/m" class:on={math} aria-current={math ? 'page' : undefined}>Математик</a>
  </div>
</div>

<style>
  .dock {
    position: fixed; top: calc(env(safe-area-inset-top, 0px) + 14px); left: 0; right: 0; z-index: 30;
    max-width: 560px; margin: 0 auto; padding: 0 16px; pointer-events: none;
  }
  .toggle {
    position: relative; display: inline-grid; grid-template-columns: 1fr 1fr; padding: 3px; border-radius: 999px;
    background: rgba(10, 14, 24, 0.92); border: 1px solid var(--line); pointer-events: auto; backdrop-filter: blur(10px);
  }
  .pill {
    position: absolute; top: 3px; bottom: 3px; left: 3px; width: calc(50% - 3px); border-radius: 999px;
    background: var(--sky); box-shadow: 0 0 14px rgba(34, 211, 238, 0.45);
    transition: transform 0.32s cubic-bezier(0.32, 0.72, 0, 1);
  }
  .toggle.math .pill { transform: translateX(100%); }
  a {
    position: relative; min-height: 36px; padding: 0 14px; display: grid; place-items: center; border-radius: 999px;
    font-weight: 700; font-size: 0.9rem; color: var(--muted); text-decoration: none; -webkit-tap-highlight-color: transparent;
    transition: color 0.25s ease-out;
  }
  a.on { color: #03161c; }
  a:focus-visible { outline: 2px solid var(--sky); outline-offset: 2px; }
  @media (prefers-reduced-motion: reduce) { .pill, a { transition: none; } }
</style>
