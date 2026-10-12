<script>
  // "Үйлдэл үзүүлэх" on the number line: pick two whole numbers (−10…10) and + or −, then watch the walk.
  import NumberPlay from './NumberPlay.svelte';
  import { unlock } from '../../lib/sound.js';

  let a = $state(-3);
  let b = $state(5);
  let op = $state('+');
  let started = $state(false);
  let key = $state(0);
  $effect(() => { a; b; op; started = false; });
  const clamp = (v) => Math.max(-10, Math.min(10, Math.round(+v) || 0));
  const start = () => { unlock(); started = true; key++; };
  const sgn = (x) => (x < 0 ? '−' + -x : String(x));
</script>

{#snippet num(get, set, label)}
  <label class="num"><span class="small muted">{label}</span>
    <span class="step">
      <button aria-label="{label}: хасах" onclick={() => set(clamp(get() - 1))}>−</button>
      <input type="number" inputmode="numeric" min="-10" max="10" value={get()}
        oninput={(e) => { const v = e.currentTarget.value; if (v !== '' && v !== '-') set(clamp(v)); }} />
      <button aria-label="{label}: нэмэх" onclick={() => set(clamp(get() + 1))}>+</button>
      <button class="pm" aria-label="{label}: тэмдгийг солих" onclick={() => set(-get())}>±</button>
    </span>
  </label>
{/snippet}

<div class="ops">
  <div class="row">
    {@render num(() => a, (v) => (a = v), '1-р тоо')}
    <div class="opsel" role="group" aria-label="Үйлдэл">
      {#each ['+', '−'] as o}<button class="chip" class:on={op === o} onclick={() => (op = o)}>{o}</button>{/each}
    </div>
    {@render num(() => b, (v) => (b = v), '2-р тоо')}
  </div>
  <p class="expr">{sgn(a)} {op} {b < 0 ? `(${sgn(b)})` : b}</p>
  {#if !started}
    <button class="go" onclick={start}>▶ Эхлэх <span class="small">алхам алхмаар харуулна</span></button>
  {:else}
    {#key key}<NumberPlay {a} {b} {op} />{/key}
  {/if}
</div>

<style>
  .ops { display: grid; gap: 12px; }
  .row { display: grid; justify-items: center; gap: 10px; }
  .num { display: grid; gap: 2px; }
  .step { display: flex; align-items: center; gap: 4px; }
  .step button { width: 40px; height: 44px; border-radius: 10px; border: 1px solid var(--line); background: var(--surface-solid); color: var(--sky); font-size: 1.2rem; font-weight: 800; }
  .step .pm { color: var(--sun); }
  .step input { width: 52px; height: 44px; text-align: center; border-radius: 10px; border: 1px solid var(--line); font: 700 1.1rem var(--font); }
  .opsel { display: flex; gap: 6px; }
  .opsel .chip { min-width: 44px; justify-content: center; font-size: 1.2rem; font-weight: 800; color: var(--ink); background: transparent; }
  .opsel .chip.on { background: var(--sun); border-color: var(--sun); color: #2a1a00; }
  .expr { text-align: center; font: 800 1.6rem var(--math); }
  .go { display: grid; justify-items: center; gap: 2px; min-height: 64px; padding: 10px; border: 0; border-radius: 18px; background: var(--sky); color: var(--on-sky); font: 800 1.2rem var(--font); box-shadow: var(--glow); }
  .go .small { font-weight: 600; opacity: 0.8; }
</style>
