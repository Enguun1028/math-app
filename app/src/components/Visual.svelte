<script>
  // Main visual of an entry. Also reused by the tool bag.
  let { v } = $props();

  const W = 320;
  // Number line helpers
  let span = $derived(v.kind === 'numberline' ? v.to - v.from : 1);
  const nx = (n) => 20 + ((n - v.from) / span) * (W - 40);
  let ticks = $derived(v.kind === 'numberline' ? Array.from({ length: span + 1 }, (_, i) => v.from + i) : []);
  let jumpPath = $derived.by(() => {
    if (v.kind !== 'numberline' || !v.jump) return '';
    const [a, b] = v.jump;
    const h = Math.min(46, 12 + Math.abs(b - a) * 6);
    return `M ${nx(a)} 56 Q ${(nx(a) + nx(b)) / 2} ${56 - h * 1.6} ${nx(b)} 56`;
  });

  // Balance scale tilt: level when both sides are equal.
  const val = (s) => { try { return Function(`return (${String(s).replace(/[^\d+\-*/(). ]/g, '')})`)(); } catch { return 0; } };
  let tilt = $derived(v.kind === 'scale' ? Math.max(-12, Math.min(12, (val(v.right) - val(v.left)) * 3)) : 0);
</script>

<figure class="vis">
  {#if v.kind === 'numberline'}
    <svg viewBox="0 0 {W} 90" role="img" aria-label="Тооны шулуун {v.from}-с {v.to} хүртэл">
      <line x1="10" y1="56" x2={W - 10} y2="56" class="axis" />
      <path d="M {W - 16} 50 L {W - 8} 56 L {W - 16} 62" class="axis" />
      {#each ticks as t}
        <line x1={nx(t)} y1="50" x2={nx(t)} y2="62" class="axis" />
        {#if span <= 12 || t % 2 === 0}<text x={nx(t)} y="80" class:zero={t === 0}>{t < 0 ? '−' + -t : t}</text>{/if}
      {/each}
      {#if jumpPath}<path d={jumpPath} class="jump" marker-end="url(#arr)" />{/if}
      <defs><marker id="arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0 10 5 0 10z" fill="var(--sun)" /></marker></defs>
      {#each v.marks || [] as m}<circle cx={nx(m)} cy="56" r="6" class="dot" />{/each}
    </svg>
  {:else if v.kind === 'place'}
    {@const digits = String(v.number).split('')}
    {@const names = ['Нэгж', 'Аравт', 'Зуут', 'Мянгат']}
    <div class="place">
      {#each digits as d, i}
        <div class="col c{digits.length - 1 - i}">
          <span class="d">{d}</span>
          <span class="small">{names[digits.length - 1 - i]}</span>
          <span class="small muted">{d}{'0'.repeat(digits.length - 1 - i)}</span>
        </div>
      {/each}
    </div>
  {:else if v.kind === 'scale'}
    <svg viewBox="0 0 {W} 150" role="img" aria-label="Жин: {v.left} ба {v.right}">
      <path d="M 145 140 L 175 140 L 160 40 Z" class="stand" />
      <g transform="rotate({tilt} 160 40)">
        <line x1="50" y1="40" x2="270" y2="40" class="beam" />
        <line x1="50" y1="40" x2="50" y2="78" class="axis" /><line x1="270" y1="40" x2="270" y2="78" class="axis" />
        <rect x="10" y="78" width="80" height="34" rx="8" class="pan" /><text x="50" y="101" class="pt">{v.left}</text>
        <rect x="230" y="78" width="80" height="34" rx="8" class="pan" /><text x="270" y="101" class="pt">{v.right}</text>
      </g>
      <circle cx="160" cy="40" r="6" class="dot" />
    </svg>
  {:else if v.kind === 'grid'}
    {@const n = v.rows * v.cols}
    <div class="grid" style:grid-template-columns="repeat({v.cols}, 1fr)" style:max-width="{Math.min(v.cols > 6 ? 240 : 320, v.cols * 34)}px">
      {#each Array(n) as _, k}
        <span class="cell" class:on={v.fill == null || k < v.fill} class:split={v.split && k % v.cols === 0}></span>
      {/each}
    </div>
    {#if v.fill != null}<figcaption class="small muted">{v.fill} / {n}</figcaption>{:else}<figcaption class="small muted">{v.rows} × {v.cols} = {n}</figcaption>{/if}
  {:else if v.kind === 'blocks'}
    <!-- Addition with cubes: a cubes and b cubes put together. -->
    <div class="blocks" role="img" aria-label="{v.a} шоо ба {v.b} шоо нийлээд {v.a + v.b} шоо">
      <div class="sum">
        <div class="grp"><div class="cubes">{#each Array(v.a) as _}<span class="cube"></span>{/each}</div><span class="num">{v.a}</span></div>
        <span class="sign">+</span>
        <div class="grp"><div class="cubes">{#each Array(v.b) as _}<span class="cube b"></span>{/each}</div><span class="num b">{v.b}</span></div>
      </div>
      <span class="sign down">=</span>
      <div class="grp">
        <div class="cubes">{#each Array(v.a + v.b) as _, k}<span class="cube" class:b={k >= v.a} style:animation-delay="{0.25 + k * 0.06}s"></span>{/each}</div>
        <span class="num all">{v.a + v.b}</span>
      </div>
    </div>
  {:else if v.kind === 'fraction'}
    <div class="bar" style:grid-template-columns="repeat({v.den}, 1fr)">
      {#each Array(v.den) as _, k}<span class:on={k < v.num}></span>{/each}
    </div>
    <figcaption class="frac"><span>{v.num}</span><span>{v.den}</span></figcaption>
  {:else}
    <div class="symbol">{v.text}</div>
  {/if}
</figure>

<style>
  .vis { margin: 0; padding: 16px; border-radius: var(--radius); background: var(--sky-soft); display: grid; justify-items: center; gap: 8px; }
  svg { width: 100%; max-width: 420px; height: auto; overflow: visible; }
  .axis { stroke: var(--sky-deep); stroke-width: 2; fill: none; stroke-linecap: round; }
  text { font: 700 12px var(--font); fill: var(--sky-deep); text-anchor: middle; }
  text.zero { font-size: 14px; }
  .dot { fill: var(--sun); stroke: var(--bg); stroke-width: 2; filter: drop-shadow(0 0 4px var(--sun)); }
  .jump { fill: none; stroke: var(--sun); stroke-width: 3; stroke-linecap: round; }
  .stand { fill: rgba(34, 211, 238, 0.25); }
  .beam { stroke: var(--sky-deep); stroke-width: 6; stroke-linecap: round; }
  .pan { fill: var(--surface); stroke: var(--sky-deep); stroke-width: 2; }
  .pt { font-size: 15px; }
  g { transition: transform 300ms ease; }

  .place { display: flex; gap: 8px; }
  .col { display: grid; justify-items: center; padding: 10px 14px; border-radius: 12px; background: var(--surface); min-width: 72px; }
  .d { font-size: 2rem; font-weight: 800; color: var(--sky-deep); line-height: 1.1; }
  .c1 .d { color: var(--grass); }
  .c2 .d { color: var(--sun); }

  .grid { display: grid; gap: 3px; width: 100%; }
  .cell { aspect-ratio: 1; border-radius: 4px; background: var(--surface); border: 1px solid rgba(34, 211, 238, 0.3); }
  .cell.on { background: var(--sky); border-color: var(--sky); box-shadow: 0 0 6px rgba(34, 211, 238, 0.6); }
  .cell.split { box-shadow: -3px 0 0 var(--sun); }

  .bar { display: grid; gap: 3px; width: 100%; max-width: 320px; height: 44px; }
  .bar span { border-radius: 6px; background: transparent; border: 1.5px solid var(--sky); }
  .bar span.on { background: var(--sky); }
  .frac { display: inline-grid; justify-items: center; font-weight: 800; font-size: 1.3rem; color: var(--sky-deep); }
  .frac span:first-child { border-bottom: 2px solid currentColor; padding: 0 6px; }

  .blocks { display: grid; justify-items: center; gap: 10px; padding: 4px 0; }
  .sum { display: flex; align-items: flex-start; gap: 14px; flex-wrap: wrap; justify-content: center; }
  .grp { display: grid; justify-items: center; gap: 6px; }
  .cubes { display: flex; flex-wrap: wrap; gap: 5px; justify-content: center; max-width: 230px; }
  .cube {
    width: 24px; height: 24px; border-radius: 6px; background: var(--sky);
    box-shadow: inset 0 3px 0 rgba(255, 255, 255, 0.35), inset 0 -3px 0 rgba(0, 0, 0, 0.25), 0 0 8px rgba(34, 211, 238, 0.45);
  }
  .cube.b { background: var(--sun); box-shadow: inset 0 3px 0 rgba(255, 255, 255, 0.4), inset 0 -3px 0 rgba(0, 0, 0, 0.2), 0 0 8px rgba(255, 204, 102, 0.45); }
  .grp:last-child .cube { animation: pop 0.4s cubic-bezier(0.32, 0.72, 0, 1) both; }
  @keyframes pop { from { opacity: 0; transform: translateY(8px); } }
  .num { font: 800 1.4rem var(--font); color: var(--sky-deep); }
  .num.b { color: var(--sun); }
  .num.all { font-size: 1.8rem; color: var(--ink); }
  .sign { font: 800 1.6rem var(--font); color: var(--muted); line-height: 24px; }
  .sign.down { line-height: 1; }

  .symbol { font-size: 2.4rem; font-weight: 800; color: var(--sky-deep); text-align: center; padding: 12px 0; font-family: 'Cambria Math', Georgia, serif; }
</style>
