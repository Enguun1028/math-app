<script>
  // "Бүхнийг хай": the middle tab. Results change with every letter; a typed formula is shown the way
  // a textbook prints it and recognised by its shape (a²+b²=c² → Пифагорын теорем).
  // Never a dead end: with nothing typed or nothing found, it offers places to start.
  import { onMount } from 'svelte';
  import { search, kindOf } from '../lib/search.js';
  import { ideas, formulaMatches, rootPath, placeOf, gradeLabel } from '../lib/ideas.js';
  import { looksLikeMath, formatMath } from '../lib/mathfmt.js';
  import { progress, save } from '../lib/progress.svelte.js';
  import { ui } from '../lib/ui.svelte.js';
  import { go } from '../lib/router.svelte.js';
  import RichText from './RichText.svelte';
  import { readLine } from '../lib/graphexpr.js';
  import { openGraph } from '../lib/tools.svelte.js';
  import { track } from '../lib/track.svelte.js';

  let q = $state(ui.lastQuery ?? '');
  let input;
  // Results follow the typing 120 ms after the last letter, so fast typing on a slow phone is not held up by a full
  // search on every key (owner, 2026-10-21). The box itself always shows each letter at once.
  let sq = $state(q);
  $effect(() => {
    const v = q;
    if (!v.trim()) { sq = v; return; }
    const tm = setTimeout(() => (sq = v), 120);
    return () => clearTimeout(tm);
  });
  // A weak "did you mean" shape guess is dropped when the expression's kind is clear (x + y = 7 → систем).
  let found = $derived(formulaMatches(sq).filter((f) => f.score >= 80 || !kindOf(sq).length));
  let words = $derived(search(sq).filter((r) => !found.some((f) => f.id === r.id)));
  let mathy = $derived(looksLikeMath(q) || /\^|²|√|=/.test(q));
  // Something the graph calculator can draw (y = …, x² + y² = 9, (2; 3)): offer to open it there.
  let drawable = $derived(mathy && ['fn', 'implicit', 'vline', 'point'].includes(readLine(q).kind));

  const STARTERS = [
    { label: 'a² + b² = c²', q: 'a^2+b^2=c^2', math: true },
    { label: 'Бутархай', q: 'бутархай' },
    { label: 'Процент', q: 'процент' },
    { label: 'x² гэж юу вэ?', q: 'x^2', math: true },
    { label: 'Тойрог', q: 'тойрог' },
    { label: '−3 + 5', q: '-3 + 5', math: true },
    { label: 'Тригонометр', q: 'тригонометр' },
  ];
  // Math keys sit above the phone keyboard; each one types at the cursor.
  const KEYS = [['x²', '^2'], ['√', '√('], ['π', 'π'], ['÷', '÷'], ['( )', '()'], ['=', '='], ['−', '−']];

  // Focus the box by itself only with a mouse (2026-10-31). On a phone a focus that does not come from a tap opens no
  // keyboard, and iPhone then treats the box as already focused, so tapping it did nothing ("I can't click the search").
  onMount(() => { if (matchMedia('(hover: hover) and (pointer: fine)').matches) setTimeout(() => input?.focus(), 250); });

  // What students look for, including searches that find nothing: sent once typing pauses for 1.5 s.
  $effect(() => {
    const t = q.trim();
    if (!t) return;
    const n = found.length + words.length;
    const timer = setTimeout(() => track('searched', { query: t, results: n, math: mathy }), 1500);
    return () => clearTimeout(timer);
  });

  function type(t) {
    const a = input.selectionStart ?? q.length, b = input.selectionEnd ?? q.length;
    q = q.slice(0, a) + t + q.slice(b);
    const at = a + (t === '()' || t === '√(' ? t.length - (t === '()' ? 1 : 0) : t.length);
    requestAnimationFrame(() => { input.focus(); input.setSelectionRange(at, at); });
  }
  function remember() {
    const t = q.trim();
    if (!t) return;
    progress.recent = [t, ...(progress.recent ?? []).filter((r) => r !== t)].slice(0, 6);
    save();
  }
  function openIdea(id, alts = []) {
    remember();
    track('search_result_opened', { query: q.trim(), result: id, kind: 'idea' });
    ui.lastQuery = q;
    ui.typed = mathy ? q : null;
    ui.alts = alts;
    // One place per topic (owner, 2026-10-16): a topic opens its topic card, the same one as from the map.
    // A named formula has its own page (owner, 2026-10-16). Closing the card comes back here.
    const p = placeOf(id);
    if (!p?.own) return go('/c/' + id);
    input?.blur();
    ui.topic = p.topic;
  }
  function openWord(r) {
    remember();
    if (r.kind === 'entry') track('search_result_opened', { query: q.trim(), result: r.id, kind: 'entry' });
    ui.lastQuery = q;
    if (r.kind === 'entry') go('/e/' + r.id);
    else openIdea(r.id);
  }
  // Grade of a result, shown on every row (owner, 2026-10-16).
  const gradeOf = (r) => gradeLabel(placeOf(r.kind === 'entry' ? r.item.topic : r.id));
  const pathText = (id) => rootPath(id).slice(0, -1).slice(-2).map((p) => ideas[p].name).join(' → ');
</script>

<div class="search-page">
  <div class="bar">
    <label class="box">
      <span class="vh">Бүхнийг хай</span>
      <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
      <input bind:this={input} type="search" bind:value={q} placeholder="Бүхнийг хай: үг, томьёо, асуулт" autocomplete="off" autocapitalize="off" spellcheck="false" enterkeyhint="search"
        onkeydown={(e) => e.key === 'Enter' && (found[0] ? openIdea(found[0].id, found.slice(1).map((f) => f.id)) : words[0] && openWord(words[0]))} />
      {#if q}<button class="clear" aria-label="Цэвэрлэх" onclick={() => { q = ''; input.focus(); }}>×</button>{/if}
    </label>
    <div class="keys" role="group" aria-label="Математик тэмдэг">
      {#each KEYS as [label, t]}<button onmousedown={(e) => e.preventDefault()} onclick={() => type(t)}>{label}</button>{/each}
    </div>
  </div>

  {#if !q.trim()}
    <section class="start">
      {#if progress.recent?.length}
        <p class="label">Сүүлд хайсан</p>
        <div class="chips">{#each progress.recent as r}<button class="chip" onclick={() => (q = r)}>{r}</button>{/each}</div>
      {/if}
      <p class="label">Эндээс эхэлж үз</p>
      <div class="chips">{#each STARTERS as s}<button class="chip" class:m={s.math} onclick={() => (q = s.q)}>{s.label}</button>{/each}</div>
      <p class="tip small muted">Үг, томьёо эсвэл асуулт бич. Жишээ нь <span class="m">a² + b² = c²</span> гэж бичвэл энэ юу болохыг, хаанаас ирснийг, дараа нь юу үзэхийг харуулна.</p>
    </section>
  {:else}
    {#if mathy}<p class="preview">{@html formatMath(q)}</p>{/if}
    {#if drawable}<button class="graphit" onclick={() => openGraph([q])}>📈 Графикаар нээх</button>{/if}

    {#if found.length}
      {@const top = ideas[found[0].id]}
      <button class="top" onclick={() => openIdea(top.id, found.slice(1).map((f) => f.id))}>
        <span class="small">{found[0].score >= 80 ? 'Энэ бол' : 'Та үүнийг хайж байна уу?'}</span>
        <strong>{top.name}</strong>
        <span class="f"><RichText text={top.formula ?? ''} /></span>
        <span class="small g">{gradeOf({ id: top.id })}</span>
        {#if pathText(top.id)}<span class="small muted">{pathText(top.id)} → {top.name}</span>{/if}
      </button>
      {#each found.slice(1) as f}
        <button class="res" onclick={() => openIdea(f.id)}>
          <span class="rf"><RichText text={ideas[f.id].formula ?? '·'} /></span>
          <span class="rt"><strong>Эсвэл: {ideas[f.id].name}</strong><span class="small muted">{ideas[ideas[f.id].from[0]]?.name ?? ''}</span></span>
        </button>
      {/each}
    {/if}

    {#each words as r (r.kind + r.id)}
      <button class="res" onclick={() => openWord(r)}>
        <span class="rf"><RichText text={r.kind === 'entry' ? r.item.symbol ?? '·' : ideas[r.id]?.formula ?? '·'} /></span>
        <span class="rt">
          <strong>{r.kind === 'entry' ? r.item.title : ideas[r.id]?.name}</strong>
          <span class="small muted">{#if gradeOf(r)}<span class="g">{gradeOf(r)}</span>{' · '}{/if}{r.kind === 'entry' ? 'Хичээл · ' + r.item.type : (ideas[ideas[r.id]?.from[0]]?.name ?? 'Суурь') + ' → ' + ideas[r.id]?.name}</span>
        </span>
      </button>
    {/each}

    {#if !found.length && !words.length}
      <section class="start">
        <p class="small muted">Одоохондоо олдсонгүй. Өөр үгээр бичээд үз, эсвэл эдгээрээс эхэл:</p>
        <div class="chips">{#each STARTERS as s}<button class="chip" class:m={s.math} onclick={() => (q = s.q)}>{s.label}</button>{/each}</div>
      </section>
    {/if}
  {/if}
</div>

<style>
  .search-page { display: grid; gap: 14px; padding-top: 6px; }
  .bar { position: sticky; top: env(safe-area-inset-top); z-index: 5; display: grid; gap: 8px; padding: 8px 0 10px; background: linear-gradient(var(--bg) 85%, transparent); }
  .box {
    display: flex; align-items: center; gap: 10px; min-height: 52px; padding: 0 8px 0 16px; border-radius: 16px;
    background: rgba(12, 15, 21, 0.92); border: 1.5px solid color-mix(in srgb, var(--sky) 55%, transparent); box-shadow: 0 0 24px rgba(34, 211, 238, 0.11);
  }
  .box:focus-within { border-color: var(--sky); box-shadow: 0 0 28px rgba(34, 211, 238, 0.19); }
  .box svg { width: 20px; height: 20px; flex: none; fill: none; stroke: var(--sky); stroke-width: 2.2; stroke-linecap: round; }
  .box input { flex: 1; min-width: 0; border: 0; outline: 0; background: none; font: inherit; font-size: 17px; }
  .box input::-webkit-search-cancel-button, .box input::-webkit-search-decoration { -webkit-appearance: none; appearance: none; display: none; }
  .clear { width: 44px; height: 44px; border: 0; background: none; color: var(--muted); font-size: 1.4rem; }
  .keys { display: flex; gap: 6px; }
  .keys button { flex: 1; min-height: 44px; border-radius: 12px; border: 1px solid var(--line); background: var(--surface-solid); font: 1.05rem var(--math); color: var(--sky-deep); }
  .start { display: grid; gap: 10px; }
  .label { margin: 4px 0 -2px; }
  .chip { color: var(--ink); background: transparent; }
  .chip.m, .m { font-family: var(--math); }
  .chip.m { color: var(--sky-deep); font-size: 1.02rem; }
  .tip { margin-top: 6px; }
  .graphit { justify-self: start; min-height: 44px; padding: 0 16px; border-radius: 999px; border: 1px solid rgba(255, 204, 102, 0.6); background: var(--sun-soft); color: var(--sun); font-weight: 800; }
  .preview { font: 1.6rem var(--math); color: var(--sky-deep); padding: 10px 14px; border-radius: 14px; background: var(--sky-soft); }
  .top {
    display: grid; gap: 4px; justify-items: start; text-align: left; padding: 16px; border-radius: 20px;
    background: linear-gradient(160deg, rgba(34, 211, 238, 0.16), rgba(12, 15, 21, 0.7)); border: 1.5px solid color-mix(in srgb, var(--sky) 55%, transparent);
    box-shadow: 0 0 26px rgba(34, 211, 238, 0.1);
  }
  .top .small:first-child { color: var(--sky-deep); font-weight: 800; }
  .top strong { font-size: 1.35rem; letter-spacing: -0.015em; }
  .top .f { font: 1.3rem var(--math); }
  .res { display: flex; gap: 12px; align-items: center; width: 100%; padding: 10px 8px; border: 0; background: none; text-align: left; border-radius: 14px; }
  .res:hover, .res:focus-visible { background: var(--sky-soft); outline: none; }
  .rf { flex: none; min-width: 52px; max-width: 34%; height: 44px; padding: 0 8px; display: grid; place-items: center; overflow: hidden; border-radius: 12px; background: var(--sky-soft); color: var(--sky); font: 0.9rem var(--math); white-space: nowrap; }
  .rt { display: grid; min-width: 0; }
  .g { color: var(--sun); font-weight: 700; }
</style>
