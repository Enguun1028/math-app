<script>
  // Switch between the two maps on the same data (owner, 2026-10-13): the curriculum map (home, school order)
  // and the pure math map (branches of mathematics and how ideas connect).
  import { route } from '../lib/router.svelte.js';
  let math = $derived(route.parts[0] === 'm');
</script>

<div class="toggle" role="group" aria-label="Газрын зураг сонгох">
  <a href="#/" class:on={!math} aria-current={!math ? 'page' : undefined}>Хөтөлбөр</a>
  <a href="#/m" class:on={math} aria-current={math ? 'page' : undefined}>Математик</a>
</div>

<style>
  .toggle {
    display: inline-flex; padding: 3px; gap: 2px; border-radius: 999px;
    background: rgba(10, 14, 24, 0.9); border: 1px solid var(--line); pointer-events: auto;
  }
  a {
    min-height: 36px; padding: 0 14px; display: grid; place-items: center; border-radius: 999px;
    font-weight: 700; font-size: 0.9rem; color: var(--muted); text-decoration: none; -webkit-tap-highlight-color: transparent;
  }
  a.on { color: #03161c; background: var(--sky); box-shadow: 0 0 14px rgba(34, 211, 238, 0.45); }
  a:focus-visible { outline: 2px solid var(--sky); outline-offset: 2px; }
</style>
