<script>
  // Balance scale: four numbers, each with + above and − below. The beam tips toward the heavier side.
  import Visual from '../Visual.svelte';

  let n = $state([3, 4, 2, 5]); // left1, left2, right1, right2
  let left = $derived(n[0] + n[1]);
  let right = $derived(n[2] + n[3]);
  const step = (i, d) => (n[i] = Math.max(-20, Math.min(20, n[i] + d)));
  const show = (x) => (x < 0 ? '−' + -x : String(x));
</script>

<Visual v={{ kind: 'scale', left: `${n[0]} + ${n[1]}`, right: `${n[2]} + ${n[3]}` }} />

<div class="sides">
  {#each [['Зүүн', 0], ['Баруун', 2]] as [name, i0]}
    <div class="side">
      <span class="small muted">{name}</span>
      <div class="nums">
        {#each [i0, i0 + 1] as i, j}
          {#if j}<span class="op">+</span>{/if}
          <div class="num">
            <button class="st" aria-label="{name}: {i - i0 + 1}-р тоог нэмэх" onclick={() => step(i, 1)}>+</button>
            <span class="v">{show(n[i])}</span>
            <button class="st" aria-label="{name}: {i - i0 + 1}-р тоог хасах" onclick={() => step(i, -1)}>−</button>
          </div>
        {/each}
      </div>
    </div>
  {/each}
</div>
<p class="res">
  {show(left)} {left === right ? '=' : left > right ? '>' : '<'} {show(right)}
  <span class="small muted">{left === right ? 'Тэнцвэртэй: = үнэн' : 'Тэнцвэргүй: = худал'}</span>
</p>

<style>
  .sides { display: flex; justify-content: space-around; gap: 12px; flex-wrap: wrap; }
  .side { display: grid; justify-items: center; gap: 4px; }
  .nums { display: flex; align-items: center; gap: 6px; }
  .op { font-weight: 800; color: var(--muted); }
  .num { display: grid; justify-items: center; gap: 4px; }
  .v { min-width: 40px; text-align: center; font-size: 1.3rem; font-weight: 800; font-variant-numeric: tabular-nums; }
  .st { width: 40px; height: 34px; border-radius: 10px; border: 1px solid var(--line); background: var(--surface); color: var(--sky); font-size: 1.2rem; font-weight: 800; }
  .st:active { transform: scale(0.94); }
  .res { font-size: 1.2rem; font-weight: 700; text-align: center; display: grid; gap: 2px; }
</style>
