<script>
  // Animated explanation: adding and subtracting signed numbers on the number line.
  //   0 the starting point
  //   1 which way to walk (+ positive → right, − positive → left, + negative → left, − negative → right)
  //   2 the walk, one hop per unit, with a sound for each hop
  //   3 where it lands: the answer
  import PlayShell from './PlayShell.svelte';
  import { cue } from '../../lib/sound.js';

  let { a, b, op = '+' } = $props();
  // Frozen when "Эхлэх" is pressed.
  const A = a, Bv = b, plus = op === '+';
  const step = plus ? Bv : -Bv; // the actual move
  const end = A + step;
  const n = Math.abs(step);
  const dir = step > 0 ? 1 : -1;
  const sgn = (x) => (x < 0 ? '−' + -x : String(x));
  const bText = Bv < 0 ? `(${sgn(Bv)})` : String(Bv);

  // Line range: always include 0, the start and the end, with a little room.
  const FROM = Math.min(-6, A - 1, end - 1), TO = Math.max(6, A + 1, end + 1);
  const W = 320, Y = 70;
  const nx = (v) => 16 + ((v - FROM) / (TO - FROM)) * (W - 32);
  const ticks = Array.from({ length: TO - FROM + 1 }, (_, i) => FROM + i);
  const hopX = (k) => nx(A + dir * k);
  const HOP = 0.42;

  const why = plus
    ? Bv >= 0 ? `Эерэг тоо нэмэх → баруун тийш ${n} алхам.` : `Сөрөг тоо нэмэх → зүүн тийш ${n} алхам.`
    : Bv >= 0 ? `Эерэг тоо хасах → зүүн тийш ${n} алхам.` : `Сөрөг тоо хасах = эерэг тоо нэмэх → баруун тийш ${n} алхам.`;

  const stages = [
    { caption: `Эхлэх цэг: ${sgn(A)}`, hold: 1.6, cue: 'start' },
    { caption: why, hold: 2.6, cue: 'hmm' },
    { caption: `${sgn(A)} ${op} ${bText}: ${n} алхам`, hold: 0.8 + n * HOP, cue: () => { for (let k = 0; k < n; k++) cue.pop(k, k * HOP); } },
    { caption: `${sgn(A)} ${op} ${bText} = ${sgn(end)}`, hold: 0, cue: 'success' },
  ];

  // The walking dot: k hops done. It walks during stage 2 and holds still while paused.
  let phase = $state(0);
  let playing = $state(false);
  let k = $state(0);
  $effect(() => {
    if (phase < 2) { k = 0; return; }
    if (phase > 2) { k = n; return; }
    if (!playing) return;
    const tm = setInterval(() => { if (k < n) k++; else clearInterval(tm); }, HOP * 1000);
    return () => clearInterval(tm);
  });
</script>

<PlayShell {stages} bind:phase bind:playing>
  {#snippet children()}
    <svg viewBox="0 0 {W} 120" role="img" aria-label="{sgn(A)} {op} {bText} = {sgn(end)}">
      <line x1="6" y1={Y} x2={W - 6} y2={Y} class="axis" />
      <path d="M {W - 12} {Y - 6} L {W - 4} {Y} L {W - 12} {Y + 6}" class="axis" />
      {#each ticks as t}
        <line x1={nx(t)} x2={nx(t)} y1={Y - 6} y2={Y + 6} class="axis" class:zero={t === 0} />
        <text x={nx(t)} y={Y + 24} class:zero={t === 0} class:hit={phase >= 3 && t === end} class:from={t === A}>{sgn(t)}</text>
      {/each}

      <!-- direction arrow -->
      {#if phase >= 1}
        <g class="dir" class:faint={phase >= 2}>
          <line x1={nx(A)} x2={nx(A) + dir * 46} y1={Y - 46} y2={Y - 46} />
          <path d="M {nx(A) + dir * 46} {Y - 52} L {nx(A) + dir * 56} {Y - 46} L {nx(A) + dir * 46} {Y - 40} Z" />
        </g>
      {/if}

      <!-- hops, drawn as they happen -->
      {#each Array(n) as _, j}
        {@const x1 = hopX(j)}
        {@const x2 = hopX(j + 1)}
        <path class="hop" class:on={j < k} d="M {x1} {Y} Q {(x1 + x2) / 2} {Y - 30} {x2} {Y}" />
        {#if j < k}<text class="hn" x={(x1 + x2) / 2} y={Y - 20}>{j + 1}</text>{/if}
      {/each}

      <circle class="start" cx={nx(A)} cy={Y} r="7" />
      <circle class="walker" class:land={phase >= 3} cx="0" cy={Y} r="9" style:transform="translateX({hopX(k)}px)" />
    </svg>
  {/snippet}
</PlayShell>

<style>
  svg { display: block; width: 100%; height: auto; overflow: visible; }
  .axis { stroke: var(--sky-deep); stroke-width: 2; fill: none; stroke-linecap: round; }
  .axis.zero { stroke-width: 3; }
  text { font: 700 11px var(--font); fill: var(--muted); text-anchor: middle; }
  text.zero { fill: var(--ink); }
  text.from { fill: var(--sky); font-size: 13px; }
  text.hit { fill: var(--grass); font-size: 16px; font-weight: 800; }
  .dir line { stroke: var(--sun); stroke-width: 3; stroke-linecap: round; }
  .dir path { fill: var(--sun); }
  .dir { transition: opacity 0.4s; }
  .dir.faint { opacity: 0.35; }
  .hop { fill: none; stroke: var(--sun); stroke-width: 2.5; stroke-linecap: round; stroke-dasharray: 120; stroke-dashoffset: 120; transition: stroke-dashoffset 0.35s ease-out; }
  .hop.on { stroke-dashoffset: 0; }
  .hn { fill: var(--sun); font-size: 10px; }
  .start { fill: var(--sky); }
  .walker { fill: var(--sun); stroke: var(--bg); stroke-width: 2; transform-box: view-box; transition: transform 0.35s cubic-bezier(0.32, 0.72, 0, 1), fill 0.3s; }
  .walker.land { fill: var(--grass); filter: drop-shadow(0 0 8px var(--grass)); }
</style>
