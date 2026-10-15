<script>
  // Fraction: choose how many equal parts, then tap parts to fill or empty them one by one.
  // When every part of the last whole is filled, a new empty (ghost) whole appears below,
  // so the fraction can grow past 1 (e.g. 15 over 7).
  // A second sub-tab, "Бутархайн үйлдлүүд", adds, subtracts and multiplies two fractions with pictures.
  import FractionOps from './FractionOps.svelte';
  let mode = $state('one');
  let den = $state(4);
  const MAX_WHOLES = 5;
  let filled = $state([true, true, true, false]);
  let num = $derived(filled.filter(Boolean).length);
  let wholes = $derived(Array.from({ length: filled.length / den }, (_, w) => w));
  let whole = $derived(Math.floor(num / den));
  let rest = $derived(num % den);

  // Show wholes up to the last one with a filled part, plus one ghost whole when that one is full.
  function fit(arr, d) {
    let last = -1;
    for (let i = arr.length - 1; i >= 0; i--) if (arr[i]) { last = i; break; }
    let n = Math.max(1, Math.floor(last / d) + 1);
    const full = last >= 0 && arr.slice((n - 1) * d, n * d).every(Boolean);
    if (full && n < MAX_WHOLES) n++;
    return Array.from({ length: n * d }, (_, i) => !!arr[i]);
  }

  function setDen(d) {
    d = Math.max(1, Math.min(12, d));
    // Keep the same number of filled parts, packed from the left.
    const keep = Math.min(num, d * MAX_WHOLES);
    den = d;
    filled = fit(Array.from({ length: keep }, () => true), d);
  }
  function toggle(i) {
    const next = [...filled];
    next[i] = !next[i];
    filled = fit(next, den);
  }
</script>

<div class="seg" role="tablist">
  <button role="tab" class:on={mode === 'one'} aria-selected={mode === 'one'} onclick={() => (mode = 'one')}>Нэг бутархай</button>
  <button role="tab" class:on={mode === 'ops'} aria-selected={mode === 'ops'} onclick={() => (mode = 'ops')}>Бутархайн үйлдлүүд</button>
</div>

{#if mode === 'ops'}
  <FractionOps />
{:else}
<div class="parts">
  <span class="small muted">Хэдэн хэсэгт хуваах вэ?</span>
  <div class="stepper">
    <button class="st" aria-label="Хэсэг хасах" onclick={() => setDen(den - 1)} disabled={den <= 1}>−</button>
    <span class="v">{den}</span>
    <button class="st" aria-label="Хэсэг нэмэх" onclick={() => setDen(den + 1)} disabled={den >= 12}>+</button>
  </div>
</div>

<figure class="vis">
  {#each wholes as w (w)}
    {@const ghost = w > 0 && !filled.slice(w * den, (w + 1) * den).some(Boolean)}
    <div class="bar" class:ghost style:grid-template-columns="repeat({den}, 1fr)">
      {#each filled.slice(w * den, (w + 1) * den) as on, j}
        {@const i = w * den + j}
        <button class="slice" class:on aria-pressed={on} aria-label="{i + 1}-р хэсэг" onclick={() => toggle(i)}></button>
      {/each}
    </div>
  {/each}
  <figcaption class="small muted">Хэсэг дээр дарж будна, дахин дарж арилгана</figcaption>
</figure>

<p class="res">
  <span class="frac"><span>{num}</span><span>{den}</span></span>
  {#if num > den && rest}
    <span class="eq">=</span><span class="mixed"><span class="w">{whole}</span><span class="frac"><span>{rest}</span><span>{den}</span></span></span>
  {:else if num >= den && num}
    <span class="eq">=</span><span class="w">{whole}</span><span class="small muted">бүтэн</span>
  {:else if num}<span class="small muted">{den} хэсгийн {num} нь</span>{/if}
</p>
{/if}

<style>
  .seg { display: grid; grid-template-columns: 1fr 1fr; padding: 4px; border-radius: 14px; background: var(--surface-solid); border: 1px solid var(--line); margin-bottom: 4px; }
  .seg button { min-height: 40px; border: 0; border-radius: 10px; background: none; color: var(--muted); font-weight: 700; }
  .seg button.on { background: var(--sky-soft); color: var(--sky-deep); }
  .parts { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
  .stepper { display: flex; align-items: center; gap: 8px; }
  .v { min-width: 32px; text-align: center; font-size: 1.3rem; font-weight: 800; font-variant-numeric: tabular-nums; }
  .st { width: 44px; height: 40px; border-radius: 10px; border: 1px solid var(--line); background: var(--surface); color: var(--sky); font-size: 1.3rem; font-weight: 800; }
  .st:disabled { opacity: 0.35; }
  .vis { margin: 0; padding: 16px; border-radius: var(--radius); background: var(--sky-soft); display: grid; justify-items: center; gap: 8px; }
  .bar { display: grid; gap: 3px; width: 100%; max-width: 360px; height: 56px; }
  .bar.ghost { opacity: 0.45; }
  .bar.ghost .slice { border-style: dashed; }
  .slice { border-radius: 6px; background: transparent; border: 1.5px solid var(--sky); padding: 0; transition: background 0.15s; }
  .slice.on { background: var(--sky); box-shadow: 0 0 8px rgba(34, 211, 238, 0.5); }
  .res { display: flex; align-items: center; justify-content: center; gap: 12px; }
  .frac { display: inline-grid; justify-items: center; font-weight: 800; font-size: 1.4rem; color: var(--sky-deep); }
  .eq, .w { font-weight: 800; font-size: 1.4rem; color: var(--sky-deep); }
  .mixed { display: inline-flex; align-items: center; gap: 4px; }
  .frac span:first-child { border-bottom: 2px solid currentColor; padding: 0 6px; }
</style>
