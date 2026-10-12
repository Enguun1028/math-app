<script>
  // Number line: drag the start and end dots along the line, or use the sliders. The jump shows the sum.
  let a = $state(2);
  let b = $state(3);
  let end = $derived(a + b);

  const FROM = -10, TO = 10, W = 320;
  const nx = (n) => 20 + ((n - FROM) / (TO - FROM)) * (W - 40);
  const ticks = Array.from({ length: TO - FROM + 1 }, (_, i) => FROM + i);
  let jump = $derived.by(() => {
    const h = Math.min(46, 12 + Math.abs(b) * 6);
    return `M ${nx(a)} 56 Q ${(nx(a) + nx(end)) / 2} ${56 - h * 1.6} ${nx(end)} 56`;
  });

  let svg;
  let dragging = $state(null); // 'start' or 'end'
  function valueAt(e) {
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(svg.getScreenCTM().inverse());
    return Math.max(FROM, Math.min(TO, Math.round(FROM + ((p.x - 20) / (W - 40)) * (TO - FROM))));
  }
  function grab(which, e) {
    dragging = which;
    e.currentTarget.setPointerCapture(e.pointerId);
  }
  function drag(e) {
    if (!dragging) return;
    const v = valueAt(e);
    if (dragging === 'start') a = v;
    else b = v - a;
  }
</script>

<figure class="vis">
  <svg bind:this={svg} viewBox="0 0 {W} 100" role="img" aria-label="Тооны шулуун: {a} {b < 0 ? '−' : '+'} {Math.abs(b)} = {end}">
    <line x1="10" y1="56" x2={W - 10} y2="56" class="axis" />
    <path d="M {W - 16} 50 L {W - 8} 56 L {W - 16} 62" class="axis" />
    {#each ticks as t}
      <line x1={nx(t)} y1="50" x2={nx(t)} y2="62" class="axis" />
      {#if t % 2 === 0}<text x={nx(t)} y="82" class:zero={t === 0}>{t < 0 ? '−' + -t : t}</text>{/if}
    {/each}
    {#if b}<path d={jump} class="jump" marker-end="url(#nl-arr)" />{/if}
    <defs><marker id="nl-arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0 10 5 0 10z" fill="var(--sun)" /></marker></defs>
    <!-- Big invisible touch targets around each dot, so a finger can grab them. -->
    <g class="handle" class:on={dragging === 'end'} role="slider" tabindex="0" aria-label="Төгсгөл" aria-valuenow={end}
      onpointerdown={(e) => grab('end', e)} onpointermove={drag} onpointerup={() => (dragging = null)} onpointercancel={() => (dragging = null)}
      onkeydown={(e) => { if (e.key === 'ArrowRight' && end < TO) b++; if (e.key === 'ArrowLeft' && end > FROM) b--; }}>
      <circle cx={nx(end)} cy="56" r="18" class="hit" />
      <circle cx={nx(end)} cy="56" r="8" class="dot end" />
    </g>
    <g class="handle" class:on={dragging === 'start'} role="slider" tabindex="0" aria-label="Эхлэл" aria-valuenow={a}
      onpointerdown={(e) => grab('start', e)} onpointermove={drag} onpointerup={() => (dragging = null)} onpointercancel={() => (dragging = null)}
      onkeydown={(e) => { if (e.key === 'ArrowRight' && a < TO) a++; if (e.key === 'ArrowLeft' && a > FROM) a--; }}>
      <circle cx={nx(a)} cy="56" r="18" class="hit" />
      <circle cx={nx(a)} cy="56" r="8" class="dot" />
    </g>
  </svg>
  <figcaption class="small muted">Цэгүүдийг чирж болно</figcaption>
</figure>

<div class="ctl">
  <label>Эхлэл: <b>{a}</b><input type="range" min={FROM} max={TO} bind:value={a} oninput={() => (b = Math.max(FROM - a, Math.min(TO - a, b)))} /></label>
  <label>Алхам: <b>{b > 0 ? '+' : ''}{b}</b><input type="range" min={FROM - a} max={TO - a} bind:value={b} /></label>
  <p class="res">{a} {b < 0 ? '−' : '+'} {Math.abs(b)} = <b>{end}</b></p>
</div>

<style>
  .vis { margin: 0; padding: 12px; border-radius: var(--radius); background: var(--sky-soft); display: grid; justify-items: center; gap: 4px; }
  svg { width: 100%; max-width: 440px; height: auto; overflow: visible; touch-action: none; }
  .axis { stroke: var(--sky-deep); stroke-width: 2; fill: none; stroke-linecap: round; }
  text { font: 700 12px var(--font); fill: var(--sky-deep); text-anchor: middle; }
  text.zero { font-size: 14px; }
  .jump { fill: none; stroke: var(--sun); stroke-width: 3; stroke-linecap: round; }
  .handle { cursor: grab; outline: none; }
  .hit { fill: transparent; }
  .dot { fill: var(--sky); stroke: var(--bg); stroke-width: 2; transition: r 0.15s; }
  .dot.end { fill: var(--sun); }
  .handle.on .dot, .handle:focus-visible .dot { r: 11; }
  .ctl { display: grid; gap: 10px; }
  label { display: grid; gap: 2px; font-weight: 600; font-size: 0.9rem; }
  input[type='range'] { width: 100%; accent-color: var(--sky); }
  .res { font-size: 1.2rem; text-align: center; }
</style>
