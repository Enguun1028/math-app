<script>
  // A formula inside an SVG, centred on (x, y). A fraction like 3/4 is drawn stacked
  // (numerator over a bar over denominator), never with a slash. Owner rule.
  let { x, y, size, text, cls = '', color = 'currentColor' } = $props();

  // Rough glyph widths of the math font, as a share of the font size.
  const w = (s) => [...s].reduce((sum, c) => sum + (c === ' ' ? 0.28 : /[\d]/.test(c) ? 0.52 : 0.6), 0) * size;

  let m = $derived(text.match(/^(.*?)(\d+)\/(\d+)(.*)$/));
  let lay = $derived.by(() => {
    if (!m) return null;
    const [, before, num, den, after] = m;
    const fs = size * 0.72;
    const fracW = Math.max(w(num), w(den)) * 0.72 + size * 0.16;
    const total = w(before) + fracW + w(after);
    const x0 = x - total / 2;
    const fx = x0 + w(before) + fracW / 2;
    return { before, num, den, after, fs, fracW, x0, fx };
  });
</script>

{#if !lay}
  <text {x} {y} class={cls} font-size={size} text-anchor="middle" dominant-baseline="middle">{text}</text>
{:else}
  <g class={cls}>
    {#if lay.before}<text x={lay.x0} {y} font-size={size} text-anchor="start" dominant-baseline="middle" xml:space="preserve">{lay.before}</text>{/if}
    <text x={lay.fx} y={y - size * 0.36} font-size={lay.fs} text-anchor="middle" dominant-baseline="middle">{lay.num}</text>
    <line x1={lay.fx - lay.fracW / 2} x2={lay.fx + lay.fracW / 2} y1={y + size * 0.02} y2={y + size * 0.02} stroke={color} stroke-width={size * 0.06} stroke-linecap="round" />
    <text x={lay.fx} y={y + size * 0.42} font-size={lay.fs} text-anchor="middle" dominant-baseline="middle">{lay.den}</text>
    {#if lay.after}<text x={lay.fx + lay.fracW / 2} {y} font-size={size} text-anchor="start" dominant-baseline="middle" xml:space="preserve">{lay.after}</text>{/if}
  </g>
{/if}
