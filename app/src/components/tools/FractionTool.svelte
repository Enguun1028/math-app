<script>
  // Fraction: type or step the numerator and denominator, or tap parts to fill them. The numerator can go
  // past the denominator (e.g. 15 over 7): a new ghost whole appears whenever the last one is full.
  // A second sub-tab, "Бутархайн үйлдлүүд", adds, subtracts and multiplies two fractions with pictures.
  import FractionOps from './FractionOps.svelte';
  import FractionInput from './FractionInput.svelte';
  let mode = $state('one');
  let F = $state({ n: 3, d: 4 });
</script>

<div class="seg" role="tablist">
  <button role="tab" class:on={mode === 'one'} aria-selected={mode === 'one'} onclick={() => (mode = 'one')}>Нэг бутархай</button>
  <button role="tab" class:on={mode === 'ops'} aria-selected={mode === 'ops'} onclick={() => (mode = 'ops')}>Бутархайн үйлдлүүд</button>
</div>

{#if mode === 'ops'}
  <FractionOps />
{:else}
<figure class="vis">
  <FractionInput bind:n={F.n} bind:d={F.d} />
  <figcaption class="small muted">Хэсэг дээр дарж будна. Сүүлийн бүтэн дүүрэхэд шинэ бүтэн гарч ирнэ.</figcaption>
</figure>
{/if}

<style>
  .seg { display: grid; grid-template-columns: 1fr 1fr; padding: 4px; border-radius: 14px; background: var(--surface-solid); border: 1px solid var(--line); margin-bottom: 4px; }
  .seg button { min-height: 40px; border: 0; border-radius: 10px; background: none; color: var(--muted); font-weight: 700; }
  .seg button.on { background: var(--sky-soft); color: var(--sky-deep); }
  .vis { --col: var(--sky); margin: 0; padding: 16px; border-radius: var(--radius); background: var(--sky-soft); display: grid; gap: 12px; }
</style>
