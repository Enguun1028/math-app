<script>
  // Text with [[id|label]] links. Tapping a term opens a quick preview.
  // Fractions written as 3/4 are shown stacked (numerator over denominator), never with a slash.
  import { entries, LINK_RE } from '../lib/content.js';
  import { ui } from '../lib/ui.svelte.js';

  let { text: raw } = $props();
  // Keep digit groups like 40 000 on one line.
  let text = $derived(raw.replace(/(\d) (?=\d{3}\b)/g, '$1 '));

  // A Mongolian suffix after a fraction (3/8-ийг) stays on the same line as it.
  // A comma next to a fraction is only a decimal comma when a digit is on its other side ("4/12, 3/12" is a list).
  const FRAC_RE = /(?<!\d)(?<!\d,)(\d+)\/(\d+)(?!\d)(?!,\d)(-[^\s.,:;!?)]+)?/g;

  // \frac{a + b}{c} from the topic content: any text on top and bottom, also stacked.
  const TEX_RE = /\\frac\{([^{}]*)\}\{([^{}]*)\}/g;
  function plain(t, out) {
    let at = 0;
    for (const m of t.matchAll(TEX_RE)) {
      digits(t.slice(at, m.index), out);
      out.push({ num: m[1], den: m[2], suf: '' });
      at = m.index + m[0].length;
    }
    digits(t.slice(at), out);
  }
  function digits(t, out) {
    let last = 0;
    for (const m of t.matchAll(FRAC_RE)) {
      out.push({ t: t.slice(last, m.index) });
      out.push({ num: m[1], den: m[2], suf: m[3] || '' });
      last = m.index + m[0].length;
    }
    out.push({ t: t.slice(last) });
  }

  let parts = $derived.by(() => {
    const out = [];
    let last = 0;
    for (const m of text.matchAll(LINK_RE)) {
      plain(text.slice(last, m.index), out);
      out.push({ id: m[1], t: m[2] || entries[m[1]]?.title || m[1] });
      last = m.index + m[0].length;
    }
    plain(text.slice(last), out);
    return out;
  });
</script>

{#each parts as p}{#if p.id && entries[p.id]}<button class="term" onclick={() => (ui.preview = p.id)}>{p.t}</button>{:else if p.num}<span class="nowrap"><span class="frac"><span class="vh">{p.num}/{p.den}</span><span class="n" aria-hidden="true">{p.num}</span><span class="d" aria-hidden="true">{p.den}</span></span>{p.suf}</span>{:else}{p.t}{/if}{/each}
