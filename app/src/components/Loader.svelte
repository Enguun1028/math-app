<script>
  // Loading star (owner, 2026-10-21: "do a loading star maybe for wherever load needed").
  // It fades in only after 0.25 s, so a quick load never flashes it. The spin is a transform animation, which the
  // phone runs off the main thread, so the star keeps turning even while the page that is loading freezes it.
  // float: centred over the whole screen (a sheet that is still loading), instead of in its place on the page.
  let { label = 'Ачаалж байна…', float = false } = $props();
</script>

<div class="loader" class:float role="status" aria-live="polite">
  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.5l2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 16.9 6.3 20l1.2-6.4-4.7-4.4 6.4-.8z" /></svg>
  {#if label}<span>{label}</span>{/if}
</div>

<style>
  .loader { display: grid; place-items: center; align-content: center; gap: 10px; min-height: 40vh; color: var(--muted); font-size: 0.9rem; opacity: 0; animation: show 0.2s 0.25s ease-out forwards; }
  .loader.float { position: fixed; inset: 0; z-index: 60; min-height: 0; pointer-events: none; }
  svg { width: 38px; height: 38px; fill: var(--sun); filter: drop-shadow(0 0 8px rgba(255, 204, 102, 0.45)); animation: spin 1.1s cubic-bezier(0.5, 0.15, 0.5, 0.85) infinite; }
  @keyframes show { to { opacity: 1; } }
  @keyframes spin { from { transform: rotate(0deg) scale(0.9); } 50% { transform: rotate(180deg) scale(1.08); } to { transform: rotate(360deg) scale(0.9); } }
  @media (prefers-reduced-motion: reduce) { svg { animation: pulse 1.4s ease-in-out infinite alternate; } }
  @keyframes pulse { from { opacity: 0.45; } to { opacity: 1; } }
</style>
