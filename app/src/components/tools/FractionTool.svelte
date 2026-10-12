<script>
  // Fraction: choose how many equal parts, then tap parts to fill or empty them one by one.
  let den = $state(4);
  let filled = $state([true, true, true, false]);
  let num = $derived(filled.filter(Boolean).length);

  function setDen(d) {
    d = Math.max(1, Math.min(12, d));
    // Keep as many filled parts as still fit, from the left.
    const keep = Math.min(num, d);
    filled = Array.from({ length: d }, (_, i) => i < keep);
    den = d;
  }
  const toggle = (i) => (filled[i] = !filled[i]);
</script>

<div class="parts">
  <span class="small muted">Хэдэн хэсэгт хуваах вэ?</span>
  <div class="stepper">
    <button class="st" aria-label="Хэсэг хасах" onclick={() => setDen(den - 1)} disabled={den <= 1}>−</button>
    <span class="v">{den}</span>
    <button class="st" aria-label="Хэсэг нэмэх" onclick={() => setDen(den + 1)} disabled={den >= 12}>+</button>
  </div>
</div>

<figure class="vis">
  <div class="bar" style:grid-template-columns="repeat({den}, 1fr)">
    {#each filled as on, i}
      <button class="slice" class:on aria-pressed={on} aria-label="{i + 1}-р хэсэг" onclick={() => toggle(i)}></button>
    {/each}
  </div>
  <figcaption class="small muted">Хэсэг дээр дарж будна, дахин дарж арилгана</figcaption>
</figure>

<p class="res">
  <span class="frac"><span>{num}</span><span>{den}</span></span>
  {#if num && num !== den}<span class="small muted">{den} хэсгийн {num} нь</span>{:else if num === den}<span class="small muted">= 1, бүтэн</span>{/if}
</p>

<style>
  .parts { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
  .stepper { display: flex; align-items: center; gap: 8px; }
  .v { min-width: 32px; text-align: center; font-size: 1.3rem; font-weight: 800; font-variant-numeric: tabular-nums; }
  .st { width: 44px; height: 40px; border-radius: 10px; border: 1px solid var(--line); background: var(--surface); color: var(--sky); font-size: 1.3rem; font-weight: 800; }
  .st:disabled { opacity: 0.35; }
  .vis { margin: 0; padding: 16px; border-radius: var(--radius); background: var(--sky-soft); display: grid; justify-items: center; gap: 8px; }
  .bar { display: grid; gap: 3px; width: 100%; max-width: 360px; height: 56px; }
  .slice { border-radius: 6px; background: transparent; border: 1.5px solid var(--sky); padding: 0; transition: background 0.15s; }
  .slice.on { background: var(--sky); box-shadow: 0 0 8px rgba(34, 211, 238, 0.5); }
  .res { display: flex; align-items: center; justify-content: center; gap: 12px; }
  .frac { display: inline-grid; justify-items: center; font-weight: 800; font-size: 1.4rem; color: var(--sky-deep); }
  .frac span:first-child { border-bottom: 2px solid currentColor; padding: 0 6px; }
</style>
