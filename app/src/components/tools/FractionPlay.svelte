<script>
  // Animated walkthrough of adding (or subtracting) two fractions, mostly pictures, few words:
  //   0 the two bars as they are
  //   1 their white lines do not meet (red ✗): the parts are different sizes, so no adding yet
  //   2 the first number both denominators divide into (ХБЕХ) lights up
  //   3 every part is cut into equal slices (thin lines appear one by one)
  //   4 now every line meets (green): the slices are all the same size
  //   5 the slices slide into one answer bar: cyan first, yellow after (for −, yellow cancels cyan)
  //   6 the answer
  import { onDestroy } from 'svelte';
  import RichText from '../RichText.svelte';
  import { reduced } from '../../lib/motion.js';

  let { A, B, op = '+' } = $props();

  const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));
  const lcm = (a, b) => (a / gcd(a, b)) * b;
  const f = (n, d) => (n < 0 ? '−' : '') + `${Math.abs(n)}/${d}`;

  // Frozen when "Эхлэх" is pressed, so editing above does not jump the animation.
  const a = { ...A }, b = { ...B };
  const L = lcm(a.d, b.d), ka = L / a.d, kb = L / b.d;
  const an = a.n * ka, bn = b.n * kb;
  const plus = op === '+';
  const rn = plus ? an + bn : an - bn;
  const g = gcd(rn, L) || 1;
  const same = a.d === b.d;
  const rows = plus ? Math.max(1, Math.ceil((an + bn) / L)) : 1;

  // Picture geometry (SVG units).
  const X0 = 8, W = 304, BH = 34;
  const yA = 34, yB = 112, yR = 214;
  const H = yR + rows * (BH + 22) + 8;
  const w = W / L;
  const xAt = (i) => X0 + i * w;

  const multiples = (d) => Array.from({ length: L / d }, (_, i) => (i + 1) * d);
  // A white line of the first bar lands on a line of the second only when k·b.d is a multiple of a.d.
  const guidesA = Array.from({ length: a.d - 1 }, (_, k) => ({ x: X0 + ((k + 1) * W) / a.d, ok: ((k + 1) * b.d) % a.d === 0 }));

  const CAPTIONS = [
    `Хоёр бутархай: ${f(a.n, a.d)} ${op} ${f(b.n, b.d)}`,
    same ? 'Хэсгүүд ижил хэмжээтэй. Шууд нэмж болно.' : 'Цагаан зураасууд таарахгүй байна: хэсгүүд өөр хэмжээтэй. Тиймээс шууд нэмж болохгүй.',
    `${a.d}-т ч, ${b.d}-т ч хуваагддаг хамгийн бага тоо: ${L}`,
    `Хэсэг бүрийг жижиглэнэ: ${f(a.n, a.d)} → ${ka} хувааж, ${f(b.n, b.d)} → ${kb} хувааж`,
    `Одоо бүх зураас таарч байна: ${L} ижил хэсэг`,
    plus ? `Ижил хэсгүүдийг нийлүүлнэ: ${an} + ${bn}` : `Шар хэсгүүд цэнхрийг хасна: ${an} − ${bn}`,
    `Хариу: ${f(an, L)} ${op} ${f(bn, L)} = ${f(rn, L)}`,
  ];
  // Seconds each stage stays on screen before the next one starts.
  const HOLD = [1.6, 2.6, 2.6, 2.4, 2.2, 2.8, 0];
  const steps = same ? [0, 4, 5, 6] : [0, 1, 2, 3, 4, 5, 6];

  let phase = $state(reduced ? 6 : 0);
  let playing = $state(!reduced);
  let timer;
  function run(from) {
    clearTimeout(timer);
    phase = from;
    playing = true;
    const k = steps.indexOf(from);
    const next = steps[k + 1];
    if (next === undefined) return (playing = false);
    timer = setTimeout(() => run(next), HOLD[from] * 1000);
  }
  if (!reduced) setTimeout(() => run(0), 50);
  onDestroy(() => clearTimeout(timer));
  const jump = (p) => { clearTimeout(timer); playing = false; phase = p; };
  // Pause holds the current stage; play carries on from it (from the start once it has finished).
  let done = $derived(!playing && phase === steps.at(-1));
  function toggle() {
    if (playing) { clearTimeout(timer); playing = false; }
    else run(done ? steps[0] : phase);
  }

  // Where each slice ends up in the answer bar.
  const target = (t) => ({ x: xAt(t % L), y: yR + Math.floor(t / L) * (BH + 22) });
  const bTarget = (j) => target(plus ? an + j : Math.max(0, an - bn) + j);
  let moved = $derived(phase >= 5);
  let cut = $derived(phase >= 3 || same);
</script>

<div class="play">
  <p class="cap" aria-live="polite"><RichText text={CAPTIONS[phase]} /></p>


  <div class="stage">
    <svg viewBox="0 0 320 {H}" role="img" aria-label={CAPTIONS[6]}>
      <!-- frames -->
      <rect x={X0} y={yA} width={W} height={BH} rx="6" class="frame" />
      <rect x={X0} y={yB} width={W} height={BH} rx="6" class="frame" />
      {#each Array(rows) as _, r}
        <rect x={X0} y={yR + r * (BH + 22)} width={W} height={BH} rx="6" class="frame res" class:show={phase >= 5} />
      {/each}

      <!-- cyan slices (first fraction) -->
      {#each Array(an) as _, i}
        <rect class="piece a" class:gone={!plus && phase >= 6 && i >= an - bn} x={xAt(i)} y={yA} width={w + 0.4} height={BH}
          style:transform="translate(0px, {moved ? yR - yA : 0}px)" style:transition-delay="{moved ? i * 0.03 : 0}s" />
      {/each}
      <!-- yellow slices (second fraction) -->
      {#each Array(bn) as _, j}
        {@const t = bTarget(j)}
        <rect class="piece b" class:gone={!plus && phase >= 6} x={xAt(j)} y={yB} width={w + 0.4} height={BH}
          style:transform="translate({moved ? t.x - xAt(j) : 0}px, {moved ? t.y - yB : 0}px)" style:transition-delay="{moved ? 0.6 + j * 0.03 : 0}s" />
      {/each}

      <!-- thin slice lines, appearing one by one when the parts are cut -->
      {#each [yA, yB] as y, row}
        {#each Array(L - 1) as _, i}
          {@const k = row === 0 ? ka : kb}
          {#if (i + 1) % k !== 0}
            <line class="thin" class:on={cut} x1={xAt(i + 1)} x2={xAt(i + 1)} y1={y + 2} y2={y + BH - 2} style:transition-delay="{cut && !same ? i * 0.04 : 0}s" />
          {/if}
        {/each}
      {/each}
      <!-- thick white lines: the original parts -->
      {#each Array(a.d - 1) as _, k}<line class="thick" x1={X0 + ((k + 1) * W) / a.d} x2={X0 + ((k + 1) * W) / a.d} y1={yA} y2={yA + BH} />{/each}
      {#each Array(b.d - 1) as _, k}<line class="thick" x1={X0 + ((k + 1) * W) / b.d} x2={X0 + ((k + 1) * W) / b.d} y1={yB} y2={yB + BH} />{/each}
      <!-- answer bar slice lines -->
      {#each Array(rows) as _, r}
        {#each Array(L - 1) as _, i}<line class="thin res" class:on={phase >= 5} x1={xAt(i + 1)} x2={xAt(i + 1)} y1={yR + r * (BH + 22) + 2} y2={yR + r * (BH + 22) + BH - 2} />{/each}
      {/each}

      <!-- stage 1: the first bar's lines dropped onto the second -->
      {#each guidesA as gd}
        <line class="guide" class:show={phase === 1} class:ok={gd.ok} x1={gd.x} x2={gd.x} y1={yA + BH} y2={yB + BH + 6} />
        {#if !gd.ok}<text class="x" class:show={phase === 1} x={gd.x} y={yB + BH + 20}>✗</text>{/if}
      {/each}
      <!-- stage 4: every slice line goes straight through both bars -->
      {#each Array(L - 1) as _, i}
        <line class="match" class:show={phase === 4} x1={xAt(i + 1)} x2={xAt(i + 1)} y1={yA - 4} y2={yB + BH + 4} style:transition-delay="{phase === 4 ? i * 0.02 : 0}s" />
      {/each}
      {#if phase === 4}<text class="ok" x={X0 + W - 4} y={yB + BH + 22}>✓</text>{/if}
    </svg>

  {#if phase === 2}
      <div class="mults" style:top="{(yR / H) * 100}%">
        <div class="mrow a"><span class="who">{a.d}</span>{#each multiples(a.d) as m, i}<span class="m" class:hit={m === L} style:animation-delay="{i * 0.12}s">{m}</span>{/each}</div>
        <div class="mrow b"><span class="who">{b.d}</span>{#each multiples(b.d) as m, i}<span class="m" class:hit={m === L} style:animation-delay="{i * 0.12}s">{m}</span>{/each}</div>
      </div>
    {/if}

    <!-- labels over the picture (HTML, so fractions can be stacked) -->
    <span class="lab a" style:top="{((yA - 22) / H) * 100}%"><RichText text={cut ? `${f(a.n, a.d)} = ${f(an, L)}` : f(a.n, a.d)} /></span>
    <span class="lab b" style:top="{((yB - 22) / H) * 100}%"><RichText text={cut ? `${f(b.n, b.d)} = ${f(bn, L)}` : f(b.n, b.d)} /></span>
    {#if phase >= 5}
      <span class="lab r" style:top="{((yR - 22) / H) * 100}%">
        <RichText text={phase >= 6 ? `= ${f(rn, L)}${g > 1 && rn ? ` = ${f(rn / g, L / g)}` : ''}` : `${an} ${op} ${bn}`} />
      </span>
    {/if}
  </div>

  <div class="ctl">
    <div class="dots" role="group" aria-label="Алхам">
      {#each steps as s}<button class="dot" class:on={phase === s} aria-label="{s + 1}-р алхам" onclick={() => jump(s)}></button>{/each}
    </div>
    <div class="btns">
      <button class="btn icon" aria-label="Эхнээс нь" onclick={() => run(steps[0])}>↻</button>
      <button class="btn primary" aria-label={playing ? 'Түр зогсоох' : 'Тоглуулах'} onclick={toggle}>
        {#if playing}<span class="pz" aria-hidden="true"></span> Зогсоох{:else if done}↻ Дахин{:else}▶ Үргэлжлүүлэх{/if}
      </button>
    </div>
  </div>
  {#if phase >= 6 && rn > L && plus}<p class="small muted">1-ээс их: бүтэн {Math.floor(rn / L)} ба {rn % L} хэсэг.</p>{/if}
  {#if phase >= 6 && rn < 0}<p class="small muted">Хасах хэсэг ({bn}) байгаагаасаа ({an}) их тул хариу сөрөг.</p>{/if}
</div>

<style>
  .play { display: grid; gap: 10px; padding: 14px; border-radius: 20px; background: var(--surface-solid); border: 1px solid var(--line); }
  .cap { min-height: 3em; font-weight: 700; font-size: 1.02rem; line-height: 1.4; text-wrap: pretty; }
  .stage { position: relative; }
  svg { display: block; width: 100%; height: auto; overflow: visible; }
  .frame { fill: rgba(10, 14, 24, 0.6); stroke: var(--line); stroke-width: 1.2; }
  .frame.res { opacity: 0; transition: opacity 0.5s; }
  .frame.res.show { opacity: 1; stroke: color-mix(in srgb, var(--grass) 60%, transparent); }
  .piece { transform-box: view-box; transition: transform 0.9s cubic-bezier(0.32, 0.72, 0, 1), opacity 0.6s; }
  .piece.a { fill: var(--sky); }
  .piece.b { fill: var(--sun); }
  .piece.gone { opacity: 0; }
  .thin { stroke: #ffffff; stroke-width: 1.2; opacity: 0; transition: opacity 0.25s; }
  .thin.on { opacity: 0.75; }
  .thin.res { stroke: rgba(255, 255, 255, 0.8); }
  .thick { stroke: #ffffff; stroke-width: 3.2; }
  .guide { stroke: var(--warn); stroke-width: 2; stroke-dasharray: 4 4; opacity: 0; transition: opacity 0.4s; }
  .guide.ok { stroke: var(--grass); }
  .guide.show { opacity: 1; }
  .x { fill: var(--warn); font: 800 15px var(--font); text-anchor: middle; opacity: 0; transition: opacity 0.4s 0.3s; }
  .x.show { opacity: 1; }
  .match { stroke: var(--grass); stroke-width: 1.6; opacity: 0; transition: opacity 0.3s; }
  .match.show { opacity: 0.95; }
  .ok { fill: var(--grass); font: 800 18px var(--font); text-anchor: end; }
  .lab { position: absolute; left: 4px; transform: translateY(-50%); font-weight: 800; font-size: 0.95rem; white-space: nowrap; }
  .lab.a { color: var(--sky); } .lab.b { color: var(--sun); } .lab.r { color: var(--grass); font-size: 1.15rem; }
  .mults { position: absolute; left: 0; right: 0; display: grid; gap: 6px; }
  .mrow { display: flex; flex-wrap: wrap; align-items: center; gap: 5px; }
  .who { width: 26px; font-weight: 800; color: var(--col); }
  .mrow.a { --col: var(--sky); } .mrow.b { --col: var(--sun); }
  .m { min-width: 32px; padding: 3px 6px; text-align: center; border-radius: 8px; border: 1px solid var(--line); color: var(--muted); font-variant-numeric: tabular-nums; animation: pop 0.35s both; }
  .m.hit { background: var(--grass); border-color: var(--grass); color: #052012; font-weight: 800; box-shadow: 0 0 10px rgba(94, 234, 154, 0.55); }
  @keyframes pop { from { opacity: 0; transform: translateY(6px) scale(0.9); } }
  .ctl { display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap; }
  .btns { display: flex; gap: 8px; }
  .btn.icon { width: 44px; padding: 0; font-size: 1.2rem; }
  .pz { display: inline-block; width: 10px; height: 12px; border-left: 3.5px solid currentColor; border-right: 3.5px solid currentColor; }
  .dots { display: flex; gap: 6px; }
  .dot { width: 34px; height: 34px; border-radius: 50%; border: 0; background: none; display: grid; place-items: center; padding: 0; }
  .dot::before { content: ''; width: 9px; height: 9px; border-radius: 50%; background: var(--line); transition: background 0.2s, transform 0.2s; }
  .dot.on::before { background: var(--sky); transform: scale(1.3); }
  @media (prefers-reduced-motion: reduce) { .piece, .thin, .match, .guide { transition: none; } }
</style>
