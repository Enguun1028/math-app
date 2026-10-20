<script>
  // Graph calculator (Desmos-like): type lines, see them drawn. Letters other than x and y become sliders.
  // Drawing is JSXGraph (MIT/LGPL), loaded from vendor/ only when this tool opens, so the app's first load
  // stays small. Lines are read by lib/graphexpr.js (no eval).
  import { onMount, onDestroy } from 'svelte';
  import { ui } from '../../lib/ui.svelte.js';
  import { readLine, defaultParam } from '../../lib/graphexpr.js';

  const COLORS = ['#22d3ee', '#ffcc66', '#5eea9a', '#a78bfa', '#ff7a8a', '#7aa2ff'];
  const KEY = 'mm-graph';
  const START = ['y = x^2', 'y = a x + 1'];

  const saved = () => {
    try { const v = JSON.parse(localStorage.getItem(KEY)); return Array.isArray(v) && v.length ? v : null; } catch { return null; }
  };
  let lines = $state(ui.graphSeed ?? saved() ?? START);
  ui.graphSeed = null;
  $effect(() => { try { localStorage.setItem(KEY, JSON.stringify(lines)); } catch {} });

  let parsed = $derived(lines.map(readLine));
  // Sliders: "a = 2" lines set a value; any other letter a line uses gets a slider below the lines.
  let params = $state({});
  let defined = $derived(new Set(parsed.filter((p) => p.kind === 'slider').map((p) => p.name)));
  let auto = $derived([...new Set(parsed.flatMap((p) => (p.kind === 'slider' ? [] : [...p.params])))].filter((n) => !defined.has(n)).sort());
  $effect(() => {
    for (const p of parsed) if (p.kind === 'slider') params[p.name] = p.value;
    for (const n of auto) if (params[n] === undefined) params[n] = defaultParam(n);
  });

  // ---- the board ----
  let el, board, failed = $state(false), ready = $state(false);
  const env = { x: 0, y: 0 };
  let drawn = [];

  function loadJXG() {
    if (window.JXG) return Promise.resolve(window.JXG);
    window.__jxg ??= new Promise((ok, bad) => {
      const s = document.createElement('script');
      s.src = 'vendor/jsxgraphcore.js';
      s.onload = () => ok(window.JXG);
      s.onerror = bad;
      document.head.appendChild(s);
    });
    return window.__jxg;
  }

  const AX = { strokeColor: '#5b6578', highlight: false, ticks: { strokeColor: 'rgba(255,255,255,0.09)', majorHeight: -1, minorTicks: 0, label: { strokeColor: '#A3ACBA', fontSize: 12 } } };
  onMount(() => {
    loadJXG().then((JXG) => {
      if (!el) return;
      board = JXG.JSXGraph.initBoard(el, {
        boundingbox: [-6, 6, 6, -6], keepaspectratio: true, axis: true, showCopyright: false, showNavigation: false,
        pan: { enabled: true, needTwoFingers: false, needShift: false },
        zoom: { enabled: true, wheel: true, pinch: true, needShift: false, min: 0.05, max: 40 },
        defaultAxes: { x: AX, y: AX },
      });
      ready = true;
    }).catch(() => (failed = true));
  });
  onDestroy(() => { if (board) window.JXG.JSXGraph.freeBoard(board); });

  const at = (f) => (x, y) => { env.x = x; env.y = y; return f(env); };
  function redraw(list) {
    for (const e of drawn) board.removeObject(e);
    drawn = [];
    list.forEach((p, i) => {
      const c = COLORS[i % COLORS.length], look = { strokeColor: c, strokeWidth: 3, highlight: false, fixed: true };
      try {
        // A plain curve with our own x(t) and y(t): JSXGraph's functiongraph builds x from the text 'x' with its
        // script engine, which the app's Content Security Policy blocks, and then draws nothing.
        if (p.kind === 'fn') drawn.push(board.create('curve', [(t) => t, (t) => at(p.f)(t, 0), () => board.getBoundingBox()[0], () => board.getBoundingBox()[2]], look));
        else if (p.kind === 'implicit') drawn.push(board.create('implicitcurve', [at(p.f)], look));
        else if (p.kind === 'vline') {
          const v = () => p.f(env);
          drawn.push(board.create('line', [[v, 0], [v, 1]], { ...look, point1: { visible: false }, point2: { visible: false } }));
        } else if (p.kind === 'point') {
          drawn.push(board.create('point', [() => p.fx(env), () => p.fy(env)], { name: '', size: 5, fillColor: c, strokeColor: c, fixed: true, highlight: false, showInfobox: true }));
        }
      } catch { /* a line JSXGraph cannot draw is simply left out */ }
    });
    board.fullUpdate();
  }
  $effect(() => { if (ready) redraw(parsed); });

  $effect(() => {
    Object.assign(env, $state.snapshot(params));
    if (ready) board.update();
  });

  function home() { board?.setBoundingBox([-6, 6, 6, -6], true); }

  // ---- editing ----
  let active = $state(0);
  let inputs = [];
  function insert(text) {
    const inp = inputs[active];
    if (!inp) return;
    const a = inp.selectionStart ?? lines[active].length, b = inp.selectionEnd ?? a;
    lines[active] = lines[active].slice(0, a) + text + lines[active].slice(b);
    const at2 = a + text.length - (text.endsWith('()') ? 1 : 0);
    requestAnimationFrame(() => { inp.focus(); inp.setSelectionRange(at2, at2); });
  }
  function add() {
    lines.push('');
    active = lines.length - 1;
    requestAnimationFrame(() => inputs[active]?.focus());
  }
  function remove(i) {
    lines.splice(i, 1);
    if (!lines.length) lines.push('');
    active = Math.min(active, lines.length - 1);
  }
  const KEYS = [['x', 'x'], ['y', 'y'], ['x²', '^2'], ['^', '^'], ['√', '√()'], ['π', 'π'], ['(', '('], [')', ')'], ['=', ' = '], ['÷', '/']];
  const valueOf = (p) => { try { const v = p.f({ ...params, x: 0, y: 0 }); return Number.isFinite(v) ? +v.toFixed(6) : '—'; } catch { return '—'; } };
  const setSlider = (i, name, v) => (lines[i] = `${name} = ${v}`);
  const range = (v) => Math.max(10, Math.ceil(Math.abs(v)));
</script>

<div class="graph">
  <div class="boardwrap">
    <div class="board jxgbox" bind:this={el}></div>
    {#if failed}<p class="state">График ачаалж чадсангүй. Интернэтээ шалгаад дахин нээгээрэй.</p>
    {:else if !ready}<p class="state">График ачаалж байна…</p>{/if}
    <button class="home" onclick={home} aria-label="Анхны байрлал">⌂</button>
  </div>

  <div class="keys" aria-label="Тэмдэг оруулах">
    {#each KEYS as [label, text]}<button class="key" onpointerdown={(e) => e.preventDefault()} onclick={() => insert(text)}>{label}</button>{/each}
  </div>

  <div class="rows">
    {#each lines as line, i (i)}
      {@const p = parsed[i]}
      <div class="row" class:on={active === i}>
        <i class="dot" style:background={p.kind === 'slider' || p.kind === 'value' ? 'transparent' : COLORS[i % COLORS.length]}></i>
        <input bind:this={inputs[i]} value={line} oninput={(e) => (lines[i] = e.currentTarget.value)} onfocus={() => (active = i)}
          placeholder="y = 2x + 1" autocomplete="off" autocapitalize="off" spellcheck="false" inputmode="text" aria-label="{i + 1}-р мөр" />
        <button class="x" onclick={() => remove(i)} aria-label="Устгах">×</button>
        {#if p.kind === 'error'}<p class="msg">{p.msg}</p>
        {:else if p.kind === 'value'}<p class="val">= {valueOf(p)}</p>
        {:else if p.kind === 'slider'}
          <input class="range" type="range" min={-range(p.value)} max={range(p.value)} step="0.1" value={p.value}
            oninput={(e) => setSlider(i, p.name, +e.currentTarget.value)} aria-label="{p.name} гулсуур" />
        {/if}
      </div>
    {/each}
    <button class="add" onclick={add}>＋ Шинэ мөр</button>
  </div>

  {#if auto.length}
    <div class="sliders">
      {#each auto as n}
        <label class="sl"><b>{n} = {params[n]}</b>
          <input class="range" type="range" min="-10" max="10" step="0.1" value={params[n]} oninput={(e) => (params[n] = +e.currentTarget.value)} />
        </label>
      {/each}
    </div>
  {/if}

  <p class="hint small muted">Жишээ: y = x^2 · y = 2x + 1 · x^2 + y^2 = 9 · (2; 3) · y = sin x · a = 2. Хоёр хуруугаараа томруулна.</p>
</div>

<style>
  .graph { display: grid; gap: 12px; }
  .boardwrap { position: relative; }
  .board { width: 100%; aspect-ratio: 1 / 1; max-height: 58vh; border-radius: 18px; background: #0a0d14; border: 1px solid var(--line); overflow: hidden; touch-action: none; }
  .board :global(.JXGtext) { font-family: var(--font); }
  .state { position: absolute; inset: 0; display: grid; place-items: center; text-align: center; padding: 20px; color: var(--muted); }
  .home { position: absolute; right: 10px; top: 10px; width: 40px; height: 40px; border-radius: 12px; border: 1px solid var(--line); background: rgba(17, 20, 27, 0.9); color: var(--ink); font-size: 1.2rem; }
  .keys { display: flex; gap: 6px; overflow-x: auto; scrollbar-width: none; }
  .key { flex: none; min-width: 44px; height: 40px; border-radius: 10px; border: 1px solid var(--line); background: var(--surface); color: var(--sky); font-family: var(--math); font-size: 1.05rem; }
  .rows { display: grid; gap: 8px; }
  .row { display: grid; grid-template-columns: 14px minmax(0, 1fr) 40px; align-items: center; gap: 8px; padding: 6px 6px 6px 12px; border-radius: 14px; background: var(--surface); border: 1px solid var(--line); }
  .row.on { border-color: color-mix(in srgb, var(--sky) 55%, var(--line)); }
  .dot { width: 14px; height: 14px; border-radius: 50%; }
  .row input:not(.range) { min-width: 0; min-height: 40px; border: 0; outline: 0; background: none; color: var(--ink); font-family: var(--math); font-size: 1.15rem; }
  .x { width: 40px; height: 40px; border: 0; background: none; color: var(--muted); font-size: 1.4rem; }
  .msg, .val, .row .range { grid-column: 2 / 4; }
  .msg { color: var(--warn); font-size: 0.85rem; }
  .val { color: var(--grass); font-family: var(--math); font-size: 1.1rem; }
  .range { width: 100%; accent-color: var(--sun); }
  .add { justify-self: start; min-height: 44px; padding: 0 14px; border-radius: 999px; border: 1px dashed var(--line); background: none; color: var(--sky); font-weight: 700; }
  .sliders { display: grid; gap: 10px; padding: 12px; border-radius: 14px; background: var(--sun-soft); }
  .sl { display: grid; gap: 4px; }
  .sl b { color: var(--sun); font-family: var(--math); font-weight: 400; font-size: 1.1rem; }
</style>
