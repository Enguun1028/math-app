<script>
  // A topic opened up (owner, 2026-10-13): it fills the screen the way a grade sphere opens.
  // Redesign (owner, 2026-10-16): a skin-picker strip of earlier/later topics on top (the card follows a swipe),
  // the title in a bordered box with the topic icon, bordered quick-jump buttons, the definition as the one special box,
  // then sections that each have their own role, mark and colour. Spec: docs/superpowers/specs/2026-10-16-topic-card-redesign-design.md
  // Grade 1–4 basics are read-only: no lesson, no step; the student reads them when they feel a gap.
  import RichText from './RichText.svelte';
  import Visual from './Visual.svelte';
  import VideoSlot from './VideoSlot.svelte';
  import Quiz from './Quiz.svelte';
  import TopicIcon from './TopicIcon.svelte';
  import TopicStrip from './TopicStrip.svelte';
  import FormulaSection from './FormulaSection.svelte';
  import FractionOps from './tools/FractionOps.svelte';
  import NumberOps from './tools/NumberOps.svelte';
  import CoordTool from './tools/CoordTool.svelte';
  import { topics, topicEntries, entries, strands, links, stripLinks } from '../lib/content.js';
  import { ideas } from '../lib/ideas.js';
  import topicContent from '../../content/topic-content.json';
  import topicContentExtra from '../../content/topic-content-extra.json';
  // Mongolian problem bank pages for the topic (integral.mn, link out only). research/resources/README.md
  import problemLinks from '../../content/problem-links.json';
  import { topicState, entryState, markTopic } from '../lib/logic.js';
  import { ui } from '../lib/ui.svelte.js';
  import { fade } from 'svelte/transition';
  import { ms, ease, lockInput } from '../lib/motion.js';

  let isOpen = $derived(!!(ui.topic && topics[ui.topic]));
  // No scrolling while the card grows or shrinks.
  $effect(() => { lockInput(isOpen ? ms(300) : ms(190)); });
  let lastT;
  let t = $derived(isOpen ? (lastT = topics[ui.topic]) : lastT);
  let st = $derived(t && topicState(t.id));
  let known = $derived(st === 'known' || st === 'faded');
  let es = $derived(t ? topicEntries[t.id] : []);
  // A written answer page for this topic (definition, example, proof), from search.
  let idea = $derived(t && ideas[t.id] && (typeof ideas[t.id].example === 'string' || ideas[t.id].proof) ? ideas[t.id] : null);
  // Smaller ideas that grow out of this topic (they only had a search page before).
  let extras = $derived(t ? Object.values(ideas).filter((i) => !i.topic && i.from.includes(t.id)) : []);
  const REL = {
    special_case: ['нь онцгой тохиолдол', 'онцгой тохиолдол нь'],
    generalizes: ['ерөнхийлнө', 'ерөнхийлөл нь'],
    representation: ['өөр дүрслэл', 'өөр дүрслэл'],
    application: ['хэрэглэгдэнэ', 'хэрэглэдэг'],
    analogy: ['төстэй', 'төстэй'],
  };
  let related = $derived(t ? links.filter((e) => e.type !== 'prerequisite' && (e.from === t.id || e.to === t.id)) : []);
  // Formulas: the topic's own plus the ones its answer page lists (written a^2 in search, shown a²).
  const SUP = { 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', n: 'ⁿ', x: 'ˣ' };
  const pretty = (f) => f.replace(/\^(\w)/g, (_, c) => SUP[c] ?? '^' + c).replace(/\*/g, '·').replace(/=/g, ' = ').replace(/\+/g, ' + ');
  // Written content from the official textbooks: definition, formulas, rules, method, worked examples.
  // Grade 1–4 basics and the grade 12 elective topics come from the research fan-out (draft).
  let tc = $derived(t ? topicContent[t.id] ?? topicContentExtra[t.id] ?? null : null);
  // Research fan-out extras (draft, 2026-10-15): practice questions, common mistakes, real-life uses,
  // more videos, interactives and the ЭЕШ weight. One small file per topic, fetched when the topic opens.
  let extra = $state(null);
  let practice = $state('off'); // off | on | done
  let score = $state(0);
  let round = $state(0);
  $effect(() => {
    const id = t?.id;
    extra = null; practice = 'off';
    if (!id) return;
    let live = true;
    fetch(`extras/${id}.json`).then((r) => (r.ok ? r.json() : null)).then((d) => { if (live) extra = d; }).catch(() => {});
    return () => { live = false; };
  });
  const LEVEL = { 1: 'Хялбар', 2: 'Дунд', 3: 'Хүнд' };
  const KIND = { phet: 'PhET', geogebra: 'GeoGebra', 'geogebra-book': 'GeoGebra', task: 'Даалгавар' };
  let shown = $state({});
  $effect(() => { t?.id; shown = {}; });
  let formulas = $derived(t ? [...new Set([...(tc?.formulas ?? []), ...(tc ? [] : [t.formula]), ...(ideas[t.id]?.extraFormulas ?? []).map(pretty)].filter(Boolean))] : []);
  // An interactive tool for the topics that have one.
  const TOOLS = { frac: 'fraction', 'frac-add': 'fraction', 'frac-mul': 'fraction', 'frac-dec': 'fraction', int: 'number', 'int-ops': 'number', 'b-numline': 'number', 'b-neg': 'number', coord: 'coord', 'coord-geo': 'coord', 'b-grid': 'coord' };
  let tool = $derived(t ? TOOLS[t.id] : null);
  // Standard methods: each lesson's worked example as steps (or its column calculation when it has one).
  // They sit in «Томьёо ба аргачлал» → «Бодох арга», no longer a second time on the lesson.
  let methods = $derived(es.map((id) => {
    const e = entries[id], w = e.example?.worked || '';
    const body = w.replace(/^[^:]{1,24}:\s+/, '');
    const col = e.example?.column;
    return { title: e.title, column: col ? { a: col.a, b: col.b, op: col.op } : null, steps: col ? [] : body.split(/(?<=[.!?])\s+(?=\S)/).filter(Boolean) };
  }));
  let nFx = $derived(formulas.length + (tc?.rules?.length ?? 0) + (tc?.method?.length ? 1 : 0) + methods.length + (tc?.groups?.length ?? 0));
  let hasEx = $derived(!!(tc?.examples?.length || tool));
  let hasMats = $derived(!!(es.length || idea || extras.length));
  // Section identity: name, mark and colour. The quick-jump buttons carry the same mark and colour.
  const SEC = {
    fx: ['Томьёо ба аргачлал', 'ƒ', 'var(--c)'],
    ex: ['Жишээ', '✎', 'var(--sky)'],
    pr: ['Дасгал', '◎', 'var(--sun)'],
    rw: ['Хэрэглээ', '⌂', 'var(--grass)'],
    mis: ['Алдаа', '✗', 'var(--warn)'],
    more: ['Материал', '↗', 'var(--sky-deep)'],
    les: ['Хичээл', '▤', 'var(--dusk)'],
  };
  let probs = $derived(t ? problemLinks[t.id] ?? [] : []);
  let jumps = $derived(t ? Object.keys(SEC).filter((k) => ({
    fx: nFx, ex: hasEx, pr: extra?.q?.length && !t.base, rw: extra?.rw?.length, mis: extra?.mis?.length, more: extra?.v?.length || extra?.it?.length || probs.length, les: hasMats,
  })[k]) : []);
  let scroller;
  // After the scroll lands, the section glows once in its own colour, so it is clear where it landed (owner, 2026-10-16).
  const jump = (k, ev) => {
    const el = scroller?.querySelector('#sec-' + k);
    if (!el) return;
    el.scrollIntoView({ behavior: ms(1) ? 'smooth' : 'auto', block: 'start' });
    const c = getComputedStyle(ev.currentTarget).getPropertyValue('--k').trim() || 'var(--sky)';
    const glow = `0 0 0 2px ${c}, 0 0 26px color-mix(in srgb, ${c} 55%, transparent)`;
    setTimeout(() => el.animate(
      [{ boxShadow: '0 0 0 0 transparent', transform: 'scale(1)' }, { boxShadow: glow, transform: 'scale(1.015)', offset: 0.3 }, { boxShadow: '0 0 0 0 transparent', transform: 'scale(1)' }],
      { duration: ms(1) ? 1100 : 1, easing: 'ease-out' },
    ), ms(380));
  };
  // Easy to leave (owner, 2026-10-13): a big × that stays on screen, the phone's Back button, and a swipe down
  // from the top all close the topic. Opening pushes one history entry, so Back closes instead of leaving the page.
  let pushed = false;
  $effect(() => {
    if (isOpen && !pushed) { history.pushState({ topicView: true }, ''); pushed = true; }
  });
  $effect(() => {
    const pop = () => { if (pushed) { pushed = false; ui.topic = null; } };
    addEventListener('popstate', pop);
    return () => removeEventListener('popstate', pop);
  });
  const close = () => { if (pushed) history.back(); else ui.topic = null; };
  // Going to another page from the topic: that page takes the topic's history entry, so Back returns here.
  const open = (path) => { pushed = false; ui.topic = null; location.replace('#' + path); };
  // A new topic (from the strip or a chip) starts at the top.
  $effect(() => { t?.id; if (scroller) scroller.scrollTop = 0; });
  // Pull down on the top bar closes the topic. Only the bar (owner, 2026-10-16): scrolling back up through the card
  // and pulling further must never close it.
  let y0 = null;
  const tstart = (e) => { y0 = e.target.closest('.bar') ? e.touches[0].clientY : null; };
  const tmove = (e) => { if (y0 != null && e.touches[0].clientY - y0 > 110) { y0 = null; close(); } };
  const toTopic = (id) => (ui.topic = id);
  const short = (s, n = 130) => { const p = stripLinks(s || ''); return p.length > n ? p.slice(0, n - 1) + '…' : p; };
  // A new topic from the strip must be noticed (owner, 2026-10-16): the card slides in from the side it came from,
  // and the title box pops and glows once in the strand colour.
  const arrive = () => {
    const dir = ui.slide ?? 0; ui.slide = 0;
    return { duration: ms(dir ? 280 : 160), easing: ease, css: (k) => `opacity:${k}; transform: translateX(${(1 - k) * 32 * dir}px)` };
  };
  // Opening: the panel grows out of the middle and fades in, like a sphere opening on the map.
  // Closing runs the same motion back, faster. Only transform and opacity move, so it stays on the GPU.
  const grow = () => ({ duration: ms(300), easing: ease, css: (k) => `opacity:${k}; transform: scale(${0.95 + 0.05 * k})` });
  const shrink = () => ({ duration: ms(190), easing: ease, css: (k, u) => `opacity:${k}; transform: scale(${1 - 0.03 * u})` });
</script>

<svelte:window onkeydown={(ev) => ev.key === 'Escape' && close()} />

{#snippet head(k, extraText = '')}
  <h3 style:--k={SEC[k][2]}><i>{SEC[k][1]}</i>{SEC[k][0]}{#if extraText}<span class="draft">{extraText}</span>{/if}</h3>
{/snippet}

{#if isOpen}
  <div class="scrim" onclick={close} role="presentation" in:fade={{ duration: ms(240) }} out:fade={{ duration: ms(190) }}></div>
  <!-- Header (bar + topic strip) stays put; only the part below it scrolls (owner, 2026-10-16), so a vertical
       scroll never moves the strip or blocks its sideways swipe. -->
  <div class="topic" ontouchstart={tstart} ontouchmove={tmove} role="dialog" aria-label={t.name} style:--c={strands[t.strand].color} in:grow out:shrink>
    <div class="head"><div class="inner">
      <div class="bar">
        <!-- Same spot and look as "‹ Буцах" on the other pages (owner, 2026-10-16): leaving is always top left. -->
        <button class="btn ghost" aria-label="Буцах" onclick={close}>‹ Буцах</button>
        <span class="small muted">{t.grades.length ? t.grades[0] + '-р анги' : 'Суурь · 1–4-р анги'}</span>
      </div>

      <TopicStrip id={t.id} />
    </div></div>
    <div class="scroll" bind:this={scroller}><div class="inner">

      {#key t.id}
      <div class="body" in:arrive>
        <div class="title" class:pop={ms(1)}>
          <TopicIcon id={t.id} size={58} />
          <div class="tt">
            <h2>{t.name}{#if tc?.elective}<span class="badge">Сонгон судлах</span>{/if}</h2>
            <span class="small muted">{strands[t.strand].name}</span>
            {#if extra?.esh}<span class="esh small">ЭЕШ 2021–2025: {extra.esh.n} бодлого, нийт {extra.esh.pts} оноо</span>{/if}
          </div>
          <button class="know" class:on={known} aria-pressed={known} onclick={() => markTopic(t.id, !known)}><span class="box">{#if known}✓{/if}</span>Мэднэ</button>
        </div>

        {#if jumps.length > 1}
          <nav class="jump" aria-label="Хэсгүүд">
            {#each jumps as k}<button style:--k={SEC[k][2]} onclick={(ev) => jump(k, ev)}><i>{SEC[k][1]}</i>{SEC[k][0]}</button>{/each}
          </nav>
        {/if}

        <!-- The definition: the one special box, so it reads as the most important thing at first glance. -->
        {#if tc?.def || t.text}
          <div class="def">
            <span class="tag">★ Тодорхойлолт</span>
            <p><RichText text={tc?.def || t.text} /></p>
            {#if tc?.src}<span class="small muted">Эх сурвалж: {tc.src} (БСШУЯ, econtent.edu.mn)</span>{/if}
          </div>
        {/if}

        <VideoSlot key={'topic:' + t.id} title={t.name} />

        <FormulaSection {tc} {formulas} {methods} />

        {#if hasEx}
          <section id="sec-ex" class="sec">
            {@render head('ex')}
            {#each tc?.examples ?? [] as ex, k}
              <div class="ex">
                <p class="exq"><RichText text={ex.q} /></p>
                {#if shown[k]}
                  <ol class="steps">{#each ex.steps.slice(0, shown[k]) as s}<li><RichText text={s} /></li>{/each}</ol>
                {/if}
                {#if (shown[k] ?? 0) < ex.steps.length}
                  <button class="obtn" onclick={() => (shown = { ...shown, [k]: (shown[k] ?? 0) + 1 })}>{(shown[k] ?? 0) ? 'Дараагийн алхам →' : 'Бодож үзэх →'}</button>
                {:else}
                  <p class="exa">Хариу: <strong><RichText text={ex.a} /></strong></p>
                {/if}
              </div>
            {/each}
            {#if tool === 'fraction'}<div class="play"><FractionOps /></div>
            {:else if tool === 'number'}<div class="play"><NumberOps /></div>
            {:else if tool === 'coord'}<div class="play"><CoordTool /></div>{/if}
          </section>
        {/if}
        {#if !nFx && !hasEx}
          <p class="empty small muted">Энэ сэдвийн жишээ, томьёо удахгүй нэмэгдэнэ.</p>
        {/if}

        <!-- Research fan-out extras: all draft until the owner or a teacher checks them. -->
        {#if extra?.q?.length && !t.base}
          <section id="sec-pr" class="sec">
            {@render head('pr', 'ноорог')}
            <div class="pr">
              {#if practice === 'off'}
                <p><strong>{extra.q.length} бодлого</strong><span class="small muted"> · {[...new Set(extra.q.map((q) => LEVEL[q.level]))].join(', ').toLowerCase()}. Буруу сонголт бүр түгээмэл нэг алдааг илрүүлнэ.</span></p>
                <button class="fill" onclick={() => (practice = 'on')}>Эхлэх</button>
              {:else if practice === 'on'}
                {#key round}<Quiz questions={extra.q} ondone={(s) => { score = s; practice = 'done'; }} />{/key}
              {:else}
                <p>Та эхний оролдлогоор {Math.round(score * extra.q.length)} / {extra.q.length} бодлогыг зөв бодлоо.</p>
                <button class="fill" onclick={() => { round += 1; practice = 'on'; }}>Дахин ажиллах</button>
              {/if}
            </div>
          </section>
        {/if}
        {#if extra?.rw?.length}
          <section id="sec-rw" class="sec">
            {@render head('rw', 'ноорог')}
            <div class="rws">
              {#each extra.rw as u}
                <div class="rwc">
                  <strong>{u.title}</strong>
                  <p><RichText text={u.text} /></p>
                  {#if u.mini}<p class="small muted"><RichText text={u.mini} /></p>{/if}
                  {#if u.src}<a class="src small" href={u.src} target="_blank" rel="noopener noreferrer">Эх сурвалж ↗</a>{/if}
                </div>
              {/each}
            </div>
          </section>
        {/if}
        {#if extra?.mis?.length}
          <section id="sec-mis" class="sec">
            {@render head('mis', 'ноорог')}
            {#each extra.mis as m}
              <details class="mis">
                <summary><span class="mk bad">✗</span><s><RichText text={m.wrong} /></s></summary>
                {#if m.example}<p class="small muted"><RichText text={m.example} /></p>{/if}
                {#if m.why}<p><span class="lbl">Яагаад:</span> <RichText text={m.why} /></p>{/if}
                {#if m.fix}<p class="fix"><span class="mk good">✓</span><span><RichText text={m.fix} /></span></p>{/if}
                {#if m.src}<a class="src small" href={m.src} target="_blank" rel="noopener noreferrer">Эх сурвалж ↗</a>{/if}
              </details>
            {/each}
          </section>
        {/if}
        {#if extra?.v?.length || extra?.it?.length || probs.length}
          <section id="sec-more" class="sec">
            {@render head('more', 'ноорог')}
            {#each probs as [pid, pname]}
              <a class="link" href="https://www.integral.mn/problems/topics/{pid}" target="_blank" rel="noopener noreferrer"><span class="k">Бодлого</span>{pname}<span class="small muted">{' · integral.mn, бодолттой'}</span>{' ↗'}</a>
            {/each}
            {#each extra?.it ?? [] as x}
              <a class="link" href={x.url} target="_blank" rel="noopener noreferrer"><span class="k">{KIND[x.k] ?? x.k}</span>{x.n}{#if x.mn}<span class="small muted">{' · монгол хэлээр'}</span>{/if}{' ↗'}</a>
            {/each}
            {#each extra?.v ?? [] as v}
              <a class="link" href={v.url} target="_blank" rel="noopener noreferrer"><span class="k">Видео</span>{v.t}<span class="small muted">{` · ${v.ch}${v.min ? ` · ${Math.round(v.min)} мин` : ''}`}</span>{' ↗'}</a>
            {/each}
          </section>
        {/if}

        {#if hasMats}
          <section id="sec-les" class="sec">
            {@render head('les')}
            {#each es as id}
              {@const e = entries[id]}
              <button class="mat {entryState(id)}" onclick={() => open('/e/' + id)}>
                {#if e.visual}<span class="pic"><Visual v={e.visual} /></span>{/if}
                <span class="mt"><strong>{e.title}</strong>{#if entryState(id) === 'known'}<span class="ok">✓</span>{/if}</span>
                <span class="md"><RichText text={short(e.definition)} /></span>
                <span class="go">Хичээл унших →</span>
              </button>
            {/each}
            {#if idea}
              <a class="mat" href="#/c/{idea.id}" onclick={close}>
                <span class="mt"><strong>Тайлбар</strong></span>
                <span class="md"><RichText text={short(idea.def, 160)} /></span>
                {#if typeof idea.example === 'string'}<span class="md ex">Жишээ: <RichText text={short(idea.example, 110)} /></span>{/if}
                <span class="go">Бүтнээр унших{idea.proof ? ' · батлгаа' : ''} →</span>
              </a>
            {/if}
            {#each extras as x}
              <a class="mat small-mat" href="#/c/{x.id}" onclick={close}>
                <span class="mt"><strong>{x.name}</strong></span>
                <span class="md"><RichText text={short(x.def, 100)} /></span>
              </a>
            {/each}
          </section>
        {/if}

        <!-- Appendix: kept well apart from the main body. -->
        {#if related.length}
          <section class="rel">
            <h4>Холбоотой</h4>
            <div class="rchips">
              {#each related as e}
                {@const other = e.from === t.id ? e.to : e.from}
                <button class="rc" onclick={() => toTopic(other)}><em>{REL[e.type][e.from === t.id ? 0 : 1]}:</em> {topics[other].name}</button>
              {/each}
            </div>
          </section>
        {/if}
      </div>
      {/key}
    </div></div>
  </div>
{/if}

<style>
  .scrim { z-index: 40; }
  .topic {
    position: fixed; inset: 0; z-index: 41; display: flex; flex-direction: column; overflow: hidden;
    background: radial-gradient(90% 45% at 50% 12%, color-mix(in srgb, var(--c) 14%, var(--bg)), var(--bg) 70%);
  }
  .head { flex: none; position: relative; z-index: 4; padding: 0 16px 8px; border-bottom: 1px solid color-mix(in srgb, var(--line) 60%, transparent); }
  .head .inner { gap: 6px; }
  .scroll {
    flex: 1; min-height: 0; overflow-y: auto; overflow-x: hidden; overscroll-behavior: contain; -webkit-overflow-scrolling: touch;
    padding: 14px 16px calc(env(safe-area-inset-bottom, 0px) + 32px);
  }
  .inner { max-width: 560px; margin: 0 auto; display: grid; grid-template-columns: minmax(0, 1fr); gap: 14px; position: relative; }
  .body { display: grid; grid-template-columns: minmax(0, 1fr); gap: 18px; }

  /* Top bar stays on screen, so "‹ Буцах" is always one tap away, in the same spot as on every other page. */
  .bar {
    display: flex; justify-content: space-between; align-items: center;
    margin: 0 -16px; padding: calc(env(safe-area-inset-top, 0px) + 8px) 16px 6px 8px; background: color-mix(in srgb, var(--bg) 88%, transparent); backdrop-filter: blur(10px);
    /* Lines "‹ Буцах" up with the page top bar (a 560px column, 8px in) on any screen width. */
    padding-left: calc(max(0px, (100vw - 560px) / 2) + 8px - max(0px, (100vw - 592px) / 2));
  }
  .bar span { font-weight: 700; }

  /* Title box */
  .title { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; gap: 12px; align-items: center; padding: 12px; border-radius: 18px; border: 1.5px solid color-mix(in srgb, var(--c) 60%, var(--line)); background: color-mix(in srgb, var(--c) 8%, var(--surface-solid)); }
  .title.pop { animation: pop 0.6s cubic-bezier(0.23, 1, 0.32, 1); }
  @keyframes pop { 0% { transform: scale(0.96); box-shadow: 0 0 0 0 transparent; } 35% { transform: scale(1.02); box-shadow: 0 0 0 2px var(--c), 0 0 30px color-mix(in srgb, var(--c) 60%, transparent); } 100% { transform: scale(1); box-shadow: 0 0 0 0 transparent; } }
  .tt { min-width: 0; display: grid; gap: 2px; }
  h2 { font-size: 1.25rem; margin: 0; text-wrap: balance; overflow-wrap: anywhere; }
  .badge { display: inline-block; vertical-align: middle; margin-left: 8px; padding: 2px 8px; border-radius: 999px; border: 1px solid var(--sun); color: var(--sun); font-size: 0.7rem; font-weight: 700; }
  .esh { color: var(--sun); font-weight: 700; }
  .know { display: inline-flex; align-items: center; gap: 6px; min-height: 36px; padding: 0 12px 0 8px; border-radius: 999px; border: 1px solid var(--line); background: transparent; color: var(--muted); font-weight: 700; white-space: nowrap; }
  .know .box { width: 20px; height: 20px; border-radius: 6px; border: 2px solid currentColor; display: grid; place-items: center; font-size: 0.8rem; font-weight: 900; }
  .know.on { color: var(--grass); border-color: color-mix(in srgb, var(--grass) 55%, transparent); background: var(--grass-soft); }
  .know.on .box { background: var(--grass); border-color: var(--grass); color: #04140a; }

  /* Quick-jump row: sticks right under the header while scrolling. top = −(scroll padding-top), so no gap shows
     between the topic strip and this row (owner, 2026-10-16). */
  .jump {
    position: sticky; top: -14px; z-index: 3; display: flex; gap: 6px; overflow-x: auto; scrollbar-width: none;
    margin: -6px -16px 0; padding: 6px 16px; background: color-mix(in srgb, var(--bg) 97%, transparent); backdrop-filter: blur(10px);
  }
  .jump::-webkit-scrollbar { display: none; }
  .jump button { flex: none; min-height: 36px; border: 1px solid color-mix(in srgb, var(--k) 45%, var(--line)); background: var(--surface-solid); color: var(--ink); border-radius: 10px; padding: 0 11px; font-weight: 700; font-size: 0.8rem; }
  .jump i { font-style: normal; margin-right: 5px; color: var(--k); }

  /* Definition: glowing frame and a tag on its edge. */
  .def {
    position: relative; margin-top: 8px; padding: 20px 16px 14px; border-radius: 18px; display: grid; gap: 8px;
    border: 2px solid transparent; background: linear-gradient(var(--surface-solid), var(--surface-solid)) padding-box, linear-gradient(135deg, var(--sun), var(--c) 55%, color-mix(in srgb, var(--c) 30%, transparent)) border-box;
    box-shadow: 0 0 26px color-mix(in srgb, var(--sun) 16%, transparent);
  }
  .def p { margin: 0; font-size: 1.05rem; line-height: 1.6; font-weight: 600; color: var(--ink); }
  .def .tag { position: absolute; top: -12px; left: 14px; padding: 3px 10px; border-radius: 999px; background: var(--sun); color: #1a1300; font-size: 0.7rem; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; }

  /* Sections: same dark panel look as the rest of the app; each has its own mark and colour. */
  .body :global(.sec) { display: grid; gap: 10px; border-radius: 16px; scroll-margin-top: 56px; }
  .body :global(.sec > h3) { margin: 0; display: flex; align-items: center; gap: 8px; font-size: 0.8rem; letter-spacing: 0.1em; text-transform: uppercase; color: var(--k); }
  .body :global(.sec > h3 > i) { font-style: normal; width: 24px; height: 24px; border-radius: 8px; display: grid; place-items: center; letter-spacing: 0; background: color-mix(in srgb, var(--k) 16%, transparent); }
  .body :global(.sec > h3 > span) { color: var(--muted); }
  .draft { padding: 1px 7px; border-radius: 999px; border: 1px dashed var(--muted); color: var(--muted); font-size: 0.65rem; letter-spacing: 0.04em; text-transform: none; font-weight: 600; }

  /* Examples: steps on a thin line with glowing dots. */
  .ex { display: grid; gap: 8px; padding: 12px 14px; border-radius: 16px; background: var(--surface-solid); border: 1px solid var(--line); }
  .exq { margin: 0; font-weight: 800; font-size: 1.05rem; }
  .steps { list-style: none; margin: 0 0 0 6px; padding: 0 0 0 16px; border-left: 1.5px solid color-mix(in srgb, var(--sky) 40%, transparent); display: grid; gap: 6px; }
  .steps li { position: relative; }
  .steps li::before { content: ''; position: absolute; left: -21px; top: 0.45em; width: 8px; height: 8px; border-radius: 50%; background: var(--sky); box-shadow: 0 0 8px var(--sky); }
  .obtn { justify-self: start; min-height: 40px; padding: 0 14px; border-radius: 999px; border: 1px solid var(--sky); background: transparent; color: var(--sky); font-weight: 800; }
  .exa { margin: 0; color: var(--grass); }

  /* Practice: one filled gold button. */
  .pr { display: grid; gap: 10px; padding: 14px; border-radius: 16px; background: var(--surface-solid); border: 1px solid color-mix(in srgb, var(--sun) 30%, var(--line)); }
  .pr p { margin: 0; }
  .fill { justify-self: start; min-height: 42px; padding: 0 18px; border: 0; border-radius: 12px; background: var(--sun); color: #1a1300; font-weight: 800; }

  /* Real life: swipeable cards. */
  .rws { display: flex; gap: 10px; overflow-x: auto; scroll-snap-type: x mandatory; scrollbar-width: none; margin: 0 -16px; padding: 2px 16px 4px; }
  .rws::-webkit-scrollbar { display: none; }
  .rwc { flex: none; width: 78%; scroll-snap-align: start; display: grid; align-content: start; gap: 4px; padding: 12px 14px; border-radius: 16px; background: var(--surface-solid); border: 1px solid color-mix(in srgb, var(--grass) 30%, var(--line)); }
  .rwc strong { color: var(--grass); }
  .rwc p { margin: 0; }

  /* Mistakes: the wrong way crossed out, the fix in green. */
  .mis { padding: 12px; border-radius: 14px; background: var(--surface-solid); border: 1px solid color-mix(in srgb, var(--warn) 30%, var(--line)); }
  .mis summary { list-style: none; display: flex; gap: 8px; align-items: flex-start; font-weight: 700; cursor: pointer; }
  .mis summary::-webkit-details-marker { display: none; }
  .mis s { text-decoration-color: var(--warn); text-decoration-thickness: 2px; }
  .mis p { margin: 8px 0 0; }
  .mis .fix { display: flex; gap: 8px; color: var(--grass); }
  .mk { flex: none; width: 22px; height: 22px; border-radius: 50%; display: grid; place-items: center; font-weight: 900; font-size: 0.8rem; }
  .mk.bad { background: var(--warn); color: #2a0008; }
  .mk.good { background: var(--grass); color: #04140a; }
  .lbl { color: var(--muted); font-weight: 700; }
  .src { color: var(--sky); justify-self: start; }
  .link { display: block; padding: 10px 12px; border-radius: 12px; border: 1px solid var(--line); background: var(--surface-solid); color: var(--ink); text-decoration: none; font-size: 0.92rem; }
  .link .k { display: inline-block; margin-right: 8px; padding: 1px 7px; border-radius: 6px; background: var(--sky-soft); color: var(--sky-deep); font-size: 0.72rem; font-weight: 800; }

  /* Lessons */
  .mat { display: grid; gap: 6px; text-align: left; padding: 14px; border-radius: 16px; border: 1px solid color-mix(in srgb, var(--dusk) 30%, var(--line)); background: var(--surface-solid); color: var(--ink); text-decoration: none; }
  .mat.known { border-color: color-mix(in srgb, var(--grass) 45%, var(--line)); }
  .pic { display: block; max-height: 150px; overflow: hidden; border-radius: 10px; pointer-events: none; }
  .mt { display: flex; justify-content: space-between; gap: 8px; font-size: 1.05rem; }
  .md { color: var(--muted); font-size: 0.92rem; }
  .md.ex { color: var(--ink); }
  .go { color: var(--dusk); font-weight: 800; font-size: 0.9rem; }
  .ok { color: var(--grass); }
  .small-mat .mt { font-size: 0.95rem; }
  .empty { text-align: center; padding: 10px; border: 1px dashed var(--line); border-radius: 14px; }

  /* Appendix: clearly apart from the main body. */
  .rel { margin-top: 24px; padding-top: 18px; border-top: 1px dashed var(--line); }
  .rel h4 { font-size: 0.85rem; color: var(--muted); margin: 0 0 8px; }
  .rchips { display: flex; flex-wrap: wrap; gap: 6px; }
  .rc { border: 1px solid var(--line); background: transparent; color: var(--ink); border-radius: 999px; padding: 6px 12px; font-size: 0.85rem; font-weight: 600; }
  .rc em { font-style: normal; color: var(--muted); font-weight: 500; }
</style>
