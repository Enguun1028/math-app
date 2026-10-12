<script>
  // Coordinate plane: tap to put points and read their (x; y). Turn on a line y = kx + b and change k and b.
  const R = 6, S = 320, M = 16;
  const u = (S - 2 * M) / (2 * R); // pixels per unit
  const px = (x) => M + (x + R) * u;
  const py = (y) => M + (R - y) * u;
  const ticks = Array.from({ length: 2 * R + 1 }, (_, i) => i - R);

  let points = $state([[2, 3]]);
  let showLine = $state(false);
  let k = $state(1);
  let b = $state(0);
  let svg;

  function tap(e) {
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(svg.getScreenCTM().inverse());
    const x = Math.round((p.x - M) / u - R), y = Math.round(R - (p.y - M) / u);
    if (Math.abs(x) > R || Math.abs(y) > R) return;
    const at = points.findIndex(([a, c]) => a === x && c === y);
    if (at >= 0) points.splice(at, 1);
    else points = [...points.slice(-5), [x, y]];
  }
  const show = (n) => (n < 0 ? '−' + -n : String(n));
  let lineEq = $derived(`y = ${k === 1 ? '' : k === -1 ? '−' : show(k)}x${b ? (b > 0 ? ' + ' + b : ' − ' + -b) : ''}`);
</script>

<figure class="vis">
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <svg bind:this={svg} viewBox="0 0 {S} {S}" role="img" aria-label="Координатын хавтгай" onclick={tap}>
    {#each ticks as t}
      <line x1={px(t)} y1={M} x2={px(t)} y2={S - M} class="grid" class:axis={t === 0} />
      <line x1={M} y1={py(t)} x2={S - M} y2={py(t)} class="grid" class:axis={t === 0} />
      {#if t && t % 2 === 0}
        <text x={px(t)} y={py(0) + 14}>{show(t)}</text>
        <text x={px(0) - 8} y={py(t) + 4} class="yl">{show(t)}</text>
      {/if}
    {/each}
    <text x={S - M - 2} y={py(0) - 6} class="name">x</text>
    <text x={px(0) + 10} y={M + 10} class="name">y</text>
    {#if showLine}
      <line x1={px(-R)} y1={py(k * -R + b)} x2={px(R)} y2={py(k * R + b)} class="fline" />
    {/if}
    {#each points as [x, y]}
      <circle cx={px(x)} cy={py(y)} r="6" class="pt" />
      <text x={px(x) + (x > 3 ? -8 : 8)} y={py(y) - 9} class="pl" text-anchor={x > 3 ? 'end' : 'start'}>({show(x)}; {show(y)})</text>
    {/each}
  </svg>
  <figcaption class="small muted">Тор дээр дарж цэг тавина, дахин дарж арилгана</figcaption>
</figure>

<div class="ctl">
  <div class="row">
    <button class="chip" class:on={showLine} onclick={() => (showLine = !showLine)}>Шулуун: {lineEq}</button>
    {#if points.length}<button class="btn ghost" onclick={() => (points = [])}>Цэгүүдийг арилгах</button>{/if}
  </div>
  {#if showLine}
    <div class="row">
      <span class="lab">k</span>
      <button class="st" onclick={() => (k = Math.max(-5, k - 1))}>−</button><span class="v">{show(k)}</span><button class="st" onclick={() => (k = Math.min(5, k + 1))}>+</button>
      <span class="lab">b</span>
      <button class="st" onclick={() => (b = Math.max(-6, b - 1))}>−</button><span class="v">{show(b)}</span><button class="st" onclick={() => (b = Math.min(6, b + 1))}>+</button>
    </div>
  {/if}
</div>

<style>
  .vis { margin: 0; padding: 8px; border-radius: var(--radius); background: var(--sky-soft); display: grid; justify-items: center; gap: 4px; }
  svg { width: 100%; max-width: 360px; height: auto; touch-action: manipulation; cursor: crosshair; }
  .grid { stroke: rgba(139, 238, 255, 0.12); stroke-width: 1; }
  .grid.axis { stroke: var(--sky-deep); stroke-width: 2; }
  text { font: 700 10px var(--font); fill: var(--muted); text-anchor: middle; pointer-events: none; }
  .yl { text-anchor: end; }
  .name { font-size: 13px; fill: var(--sky-deep); font-style: italic; }
  .fline { stroke: var(--sun); stroke-width: 3; stroke-linecap: round; }
  .pt { fill: var(--sun); stroke: var(--bg); stroke-width: 2; }
  .pl { font-size: 12px; fill: var(--ink); paint-order: stroke; stroke: var(--bg); stroke-width: 3px; }
  .ctl { display: grid; gap: 10px; }
  .row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
  .chip.on { background: var(--sun); border-color: var(--sun); color: #2a1a00; }
  .lab { font-weight: 800; font-style: italic; color: var(--sky-deep); margin-left: 6px; }
  .v { min-width: 28px; text-align: center; font-weight: 800; font-variant-numeric: tabular-nums; }
  .st { width: 40px; height: 36px; border-radius: 10px; border: 1px solid var(--line); background: var(--surface); color: var(--sky); font-size: 1.2rem; font-weight: 800; }
</style>
