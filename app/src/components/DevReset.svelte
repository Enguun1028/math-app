<script>
  // Test links only (preview branches, localhost), never the real site: one tap starts over as a first-time
  // visitor (owner, 2026-10-22: "a reset button so i can reset after every change"). It also drops the offline
  // copy, so the newest deploy loads instead of the cached one.
  const test = location.hostname !== 'matematikiin-ayalal.pages.dev';
  async function reset() {
    try { localStorage.clear(); } catch {}
    try {
      for (const r of (await navigator.serviceWorker?.getRegistrations()) ?? []) await r.unregister();
      for (const k of (await caches?.keys()) ?? []) await caches.delete(k);
    } catch {}
    location.replace(location.pathname);
  }
</script>

{#if test}
  <button class="reset" onclick={reset} aria-label="Тест: шинээр эхлэх">↺ Шинээр</button>
{/if}

<style>
  .reset {
    position: fixed; left: 12px; bottom: calc(var(--tabbar-h) + env(safe-area-inset-bottom) + 108px); z-index: 70;
    min-height: 40px; padding: 0 12px; border-radius: 999px; border: 1px dashed var(--muted);
    background: rgba(12, 15, 21, 0.9); color: var(--muted); font-size: 0.85rem; font-weight: 700;
  }
</style>
