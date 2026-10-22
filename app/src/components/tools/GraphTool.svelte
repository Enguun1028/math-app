<script>
  // Graph calculator (Desmos-like): type lines, see them drawn. Letters other than x and y become sliders.
  // Drawing is JSXGraph (MIT/LGPL), loaded from vendor/ only when this tool opens, so the app's first load
  // stays small. Lines are read by lib/graphexpr.js (no eval).
  import { onMount, onDestroy } from 'svelte';
  import { ui } from '../../lib/ui.svelte.js';
  import { readLine, defaultParam } from '../../lib/graphexpr.js';
  import { pointsOfInterest, fmtPoint } from '../../lib/graphpoi.js';
  import { track } from '../../lib/track.svelte.js';
  import Loader from '../Loader.svelte';

  const COLORS = ['#22d3ee', '#ffcc66', '#5eea9a', '#a78bfa', '#ff7a8a', '#7aa2ff'];
  const KEY = 'mm-graph';
  const START = ['y = x^2', 'y = a x + 1'];
  const BOX = [-6, 6, 6, -6];
  // Ready-made formulas to open and play with (owner, 2026-10-23: the heart graph Reel ends here, so viewers can
  // try it themselves). Each sets the lines and, where the shape is small, the view.
  const PRESETS = [
    { name: 'Зүрх ♥', lines: ['y = (x^2)^(1/3) + 0.9√(3.3 - x^2) sin(aπx)', 'a = 20'], box: [-2.6, 3.2, 2.6, -2] },
    { name: 'Шулуун', lines: ['y = a x + b', 'a = 2', 'b = 1'] },
    { name: 'Парабол', lines: ['y = a(x - h)^2 + k', 'a = 1', 'h = 0', 'k = 0'] },
    { name: 'Синус долгион', lines: ['y = a sin(b x)', 'a = 2', 'b = 1'] },
    { name: 'Тойрог', lines: ['x^2 + y^2 = r^2', 'r = 3'] },
  ];

  const saved = () => {
    try { const v = JSON.parse(localStorage.getItem(KEY)); return Array.isArray(v) && v.length ? v : null; } catch { return null; }
  };
  let lines = $state(ui.graphSeed ?? saved() ?? START);
  ui.graphSeed = null;
  $effect(() => { try { localStorage.setItem(KEY, JSON.stringify(lines)); } catch {} });

  // The view: a preset's own when its lines are still open (so the heart reopens full size), else the default.
  let box = PRESETS.find((p) => p.box && p.lines[0] === lines[0])?.box ?? BOX;

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
        boundingbox: box, keepaspectratio: true, axis: true, showCopyright: false, showNavigation: false,
        pan: { enabled: true, needTwoFingers: false, needShift: false },
        zoom: { enabled: true, wheel: true, pinch: true, needShift: false, min: 0.05, max: 40 },
        defaultAxes: { x: AX, y: AX },
      });
      // Panning or zooming brings new crossings into reach.
      board.on('boundingbox', findSoon);
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
    findSoon();
  }
  $effect(() => { if (ready) redraw(parsed); });

  $effect(() => {
    Object.assign(env, $state.snapshot(params));
    if (ready) { board.update(); findSoon(); }
  });

  // ---- points of interest, like Desmos (lib/graphpoi.js): grey dots where lines cross each other or the axes,
  // and at highest and lowest points. A tap on a dot shows its coordinates on the board and its name below it.
  const NAMES = { cross: 'Огтлолцох цэг', root: 'x тэнхлэгийг огтлох цэг', yint: 'y тэнхлэгийг огтлох цэг', max: 'Максимум цэг', min: 'Минимум цэг' };
  let pois = [], picked = $state(null), findTimer;
  function findSoon() {
    clearTimeout(findTimer);
    findTimer = setTimeout(findPois, 120);
  }
  function findPois() {
    if (!board) return;
    for (const e of pois) board.removeObject(e);
    pois = [];
    const was = picked;
    picked = null;
    const found = pointsOfInterest(parsed, $state.snapshot(params), board.getBoundingBox());
    // A fast wave (the heart, sin of a big number) has dozens of highs and lows: dots would hide the curve.
    for (const p of found.length > 30 ? [] : found) {
      const label = fmtPoint(p);
      const dot = board.create('point', [p.x, p.y], {
        name: label, withLabel: false, size: 3, fillColor: '#8a93a6', strokeColor: '#0a0d14', strokeWidth: 1.5,
        fixed: true, highlight: false, showInfobox: false, label: { strokeColor: '#EEF1F5', fontSize: 14, offset: [10, 12], highlight: false },
      });
      const pick = () => {
        for (const d of pois) d.setAttribute({ withLabel: false, size: 3, fillColor: '#8a93a6' });
        dot.setAttribute({ withLabel: true, size: 5, fillColor: '#EEF1F5' });
        picked = { label, kinds: p.kinds };
      };
      dot.on('down', pick);
      pois.push(dot);
      if (was && was.label === label) pick(); // a slider move keeps the same dot open while it stays put
    }
    board.update();
  }
  onDestroy(() => clearTimeout(findTimer));

  function home() { board?.setBoundingBox(box, true); }
  function usePreset(p) {
    lines = [...p.lines];
    active = 0;
    picked = null;
    box = p.box ?? BOX;
    home();
    track('graph_preset', { name: p.name });
  }

  // ---- editing ----
  let active = $state(0);
  let inputs = [];
  // The tour's "write your own" step starts from one empty line, ready to type in.
  $effect(() => {
    const clear = () => { lines = ['']; active = 0; requestAnimationFrame(() => inputs[0]?.focus()); };
    addEventListener('graph-clear', clear);
    return () => removeEventListener('graph-clear', clear);
  });
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
    {:else if !ready}<div class="state"><Loader label="График ачаалж байна…" /></div>{/if}
    <button class="home" onclick={home} aria-label="Анхны байрлал">⌂</button>
  </div>
  {#if picked}<p class="poi"><b>{picked.label}</b> {picked.kinds.map((k) => NAMES[k]).join(' · ')}</p>{/if}

  <div class="presets" aria-label="Бэлэн томьёо">
    <span class="plabel">Бэлэн томьёо</span>
    {#each PRESETS as p}<button class="preset" onclick={() => usePreset(p)}>{p.name}</button>{/each}
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

  <p class="hint small muted">Жишээ: y = x^2 · y = 2x + 1 · x^2 + y^2 = 9 · (2; 3) · y = sin x · a = 2.</p>
</div>

<style>
  .graph { display: grid; gap: 12px; }
  .poi { margin: -4px 0 0; color: var(--muted); font-size: 0.9rem; }
  .poi b { color: var(--ink); font-family: var(--math); margin-right: 6px; }
  .boardwrap { position: relative; }
  .board { width: 100%; aspect-ratio: 1 / 1; max-height: 58vh; border-radius: 18px; background: #0a0d14; border: 1px solid var(--line); overflow: hidden; touch-action: none; }
  .board :global(.JXGtext) { font-family: var(--font); }
  .state :global(.loader) { min-height: 0; }
  .state { position: absolute; inset: 0; display: grid; place-items: center; text-align: center; padding: 20px; color: var(--muted); }
  .home { position: absolute; right: 10px; top: 10px; width: 40px; height: 40px; border-radius: 12px; border: 1px solid var(--line); background: rgba(17, 20, 27, 0.9); color: var(--ink); font-size: 1.2rem; }
  .presets { display: flex; align-items: center; gap: 6px; overflow-x: auto; scrollbar-width: none; }
  .plabel { flex: none; color: var(--muted); font-size: 0.8rem; font-weight: 700; padding-right: 2px; }
  .preset { flex: none; min-height: 40px; padding: 0 14px; border-radius: 999px; border: 1px solid color-mix(in srgb, var(--sun) 45%, var(--line)); background: var(--sun-soft); color: var(--sun); font-weight: 700; white-space: nowrap; }
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
