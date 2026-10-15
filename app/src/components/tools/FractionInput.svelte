<script>
  // One fraction, edited by typing, by − / + or by tapping parts. The numerator may be larger than the
  // denominator: each whole is one bar, and when the last bar is full an empty (ghost) bar appears below it
  // to tap into. Colour comes from --col on a parent.
  import RichText from '../RichText.svelte';

  let { n = $bindable(), d = $bindable() } = $props();

  const MAXD = 12;
  const MAXW = 10; // at most 10 wholes, so the bars stay a sensible height
  const maxN = () => d * MAXW;

  let full = $derived(Math.ceil(n / d));
  let ghost = $derived(n > 0 && n % d === 0 && full < MAXW);
  let rows = $derived(Math.max(1, full) + (ghost ? 1 : 0));

  function setD(v) {
    d = Math.max(1, Math.min(MAXD, Math.round(+v) || 1));
    n = Math.min(n, maxN());
  }
  function setN(v) {
    n = Math.max(0, Math.min(maxN(), Math.round(+v) || 0));
  }
  // Tapping part i fills up to it; tapping the last filled part empties it.
  const tap = (i) => (n = n === i + 1 ? i : i + 1);
  const f = (a, b) => `${a}/${b}`;
  let mixed = $derived(n > d && n % d ? ` = ${Math.floor(n / d)} ${f(n % d, d)}` : n >= d && n ? ` = ${n / d}` : '');
</script>

<div class="bars">
  {#each Array(rows) as _, w}
    <div class="bar" class:ghost={ghost && w === rows - 1} style:grid-template-columns="repeat({d}, 1fr)">
      {#each Array(d) as _, j}
        {@const i = w * d + j}
        <button class="cell" class:on={i < n} aria-label="{i + 1}-р хэсэг" onclick={() => tap(i)}></button>
      {/each}
    </div>
  {/each}
</div>
<div class="nums">
  <label class="num"><span class="small muted">Хүртвэр</span>
    <span class="step"><button onclick={() => setN(n - 1)} aria-label="Хүртвэр хасах">−</button>
    <input type="number" inputmode="numeric" min="0" max={maxN()} value={n} oninput={(e) => setN(e.currentTarget.value)} />
    <button onclick={() => setN(n + 1)} aria-label="Хүртвэр нэмэх">+</button></span>
  </label>
  <label class="num"><span class="small muted">Хуваарь</span>
    <span class="step"><button onclick={() => setD(d - 1)} aria-label="Хуваарь хасах">−</button>
    <input type="number" inputmode="numeric" min="1" max={MAXD} value={d} oninput={(e) => setD(e.currentTarget.value)} />
    <button onclick={() => setD(d + 1)} aria-label="Хуваарь нэмэх">+</button></span>
  </label>
  <span class="big"><RichText text="{f(n, d)}{mixed}" /></span>
</div>

<style>
  .bars { display: grid; gap: 6px; }
  .bar { display: grid; gap: 3px; height: 46px; }
  .bar.ghost { opacity: 0.45; }
  .bar.ghost .cell { border-style: dashed; }
  .cell { border-radius: 6px; border: 1.5px solid var(--col); background: transparent; padding: 0; transition: background 0.25s ease, box-shadow 0.25s; }
  .cell.on { background: var(--col); box-shadow: 0 0 8px color-mix(in srgb, var(--col) 50%, transparent); }
  .nums { display: flex; flex-wrap: wrap; align-items: flex-end; gap: 12px; }
  .num { display: grid; gap: 2px; }
  .step { display: flex; align-items: center; gap: 4px; }
  .step button { width: 40px; height: 40px; border-radius: 10px; border: 1px solid var(--line); background: var(--surface-solid); color: var(--col); font-size: 1.2rem; font-weight: 800; }
  .step input { width: 52px; height: 40px; text-align: center; border-radius: 10px; border: 1px solid var(--line); font: 700 1.1rem var(--font); }
  .big { font-size: 1.5rem; font-weight: 800; margin-left: auto; color: var(--col, var(--ink)); }
</style>
