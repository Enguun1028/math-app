<script>
  // A topic opened up (owner, 2026-10-13): it expands to fill the screen the way a grade sphere opens.
  // Top: "Мэдвэл зохих" (with an info button) and "Дараагийн түвшин", lists that open only when pressed.
  // Then the topic with "Мэднэ" at the far right, examples/formulas/methods, the study materials,
  // and, set apart as an appendix, related topics and the link to the math map.
  // Grade 1–4 basics are read-only: no lesson, no step; the student reads them when they feel a gap.
  import RichText from './RichText.svelte';
  import Visual from './Visual.svelte';
  import VideoSlot from './VideoSlot.svelte';
  import Quiz from './Quiz.svelte';
  import ColumnCalc from './ColumnCalc.svelte';
  import FractionOps from './tools/FractionOps.svelte';
  import NumberOps from './tools/NumberOps.svelte';
  import CoordTool from './tools/CoordTool.svelte';
  import { topics, topicUnlocks, topicEntries, entries, strands, links, stripLinks } from '../lib/content.js';
  import { ideas } from '../lib/ideas.js';
  import topicContent from '../../content/topic-content.json';
  import topicContentExtra from '../../content/topic-content-extra.json';
  import { topicState, entryState, markTopic } from '../lib/logic.js';
  import { ui } from '../lib/ui.svelte.js';
  import { go, route } from '../lib/router.svelte.js';
  import { fly, fade } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';
  import { ms } from '../lib/motion.js';

  let isOpen = $derived(!!(ui.topic && topics[ui.topic]));
  let lastT;
  let t = $derived(isOpen ? (lastT = topics[ui.topic]) : lastT);
  let st = $derived(t && topicState(t.id));
  let known = $derived(st === 'known' || st === 'faded');
  let es = $derived(t ? topicEntries[t.id] : []);
  // A written answer page for this topic (definition, example, proof), from search.
  let idea = $derived(t && ideas[t.id] && (ideas[t.id].example || ideas[t.id].proof) ? ideas[t.id] : null);
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
  // "Мэдвэл зохих" / "Дараагийн түвшин" lists open only when pressed.
  let panel = $state(null);
  let showInfo = $state(false);
  $effect(() => { t?.id; panel = null; showInfo = false; });
  const toggle = (k) => (panel = panel === k ? null : k);
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
  let formulas = $derived(t ? [...new Set([...(tc?.formulas ?? []), ...(tc ? [] : [t.formula]), ...(ideas[t.id]?.formulas ?? []).slice(1).map(pretty)].filter(Boolean))] : []);
  // An interactive tool for the topics that have one.
  const TOOLS = { frac: 'fraction', 'frac-add': 'fraction', 'frac-mul': 'fraction', 'frac-dec': 'fraction', int: 'number', 'int-ops': 'number', 'b-numline': 'number', 'b-neg': 'number', coord: 'coord', 'coord-geo': 'coord', 'b-grid': 'coord' };
  let tool = $derived(t ? TOOLS[t.id] : null);
  // Standard methods: each lesson's worked example as steps (or its column calculation when it has one).
  let methods = $derived(es.map((id) => {
    const e = entries[id], w = e.example?.worked || '';
    const body = w.replace(/^[^:]{1,24}:\s+/, '');
    const col = e.example?.column;
    return { title: e.title, column: col ? { a: col.a, b: col.b, op: col.op } : null, steps: col ? [] : body.split(/(?<=[.!?])\s+(?=\S)/).filter(Boolean) };
  }));
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
  // Swipe down while at the top of the topic.
  let y0 = null;
  const tstart = (e) => { y0 = e.currentTarget.scrollTop <= 0 ? e.touches[0].clientY : null; };
  const tmove = (e) => { if (y0 != null && e.touches[0].clientY - y0 > 110) { y0 = null; close(); } };
  const toTopic = (id) => (ui.topic = id);
  const short = (s, n = 130) => { const p = stripLinks(s || ''); return p.length > n ? p.slice(0, n - 1) + '…' : p; };
  // Opening: the panel grows out of the middle and fades in, like a sphere opening on the map.
  const grow = (node) => ({ duration: ms(320), easing: cubicOut, css: (k) => `opacity:${k}; transform: scale(${0.94 + 0.06 * k}); border-radius:${(1 - k) * 40 + 0}px` });
</script>

<svelte:window onkeydown={(ev) => ev.key === 'Escape' && close()} />

{#if isOpen}
  <div class="scrim" onclick={close} role="presentation" transition:fade={{ duration: ms(200) }}></div>
  <div class="topic" ontouchstart={tstart} ontouchmove={tmove} role="dialog" aria-label={t.name} style:--c={strands[t.strand].color} in:grow out:fade={{ duration: ms(160) }}>
    {#key t.id}
    <div class="inner" in:fade={{ duration: ms(200) }}>
      <!-- Top row (owner, 2026-10-13): two buttons that open a short list only when pressed. -->
      <div class="toprow">
        {#if t.req.length}
          <div class="pill">
            <button class="pbtn" class:on={panel === 'need'} aria-expanded={panel === 'need'} onclick={() => toggle('need')}>Мэдвэл зохих <span class="n">{t.req.length}</span></button>
            <button class="info" class:on={showInfo} aria-label="Энэ юу вэ?" onclick={() => (showInfo = !showInfo)}>i</button>
          </div>
        {:else}<span></span>{/if}
        {#if topicUnlocks[t.id].length}
          <button class="pbtn" class:on={panel === 'next'} aria-expanded={panel === 'next'} onclick={() => toggle('next')}>Дараагийн түвшин <span class="n">{topicUnlocks[t.id].length}</span></button>
        {:else}<span></span>{/if}
        <button class="x" aria-label="Хаах" onclick={close}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg></button>
      </div>
      {#if showInfo}<p class="infotext small" transition:fade={{ duration: ms(150) }}>«Мэдвэл зохих»: энэ сэдвийг ойлгоход шаардлагатай өмнөх сэдвүүд. «Дараагийн түвшин»: энэ сэдвийг мэдсэний дараа үзэх боломжтой сэдвүүд.</p>{/if}
      {#if panel}
        <div class="plist" class:right={panel === 'next'} transition:fade={{ duration: ms(150) }}>
          {#each panel === 'need' ? t.req : topicUnlocks[t.id] as r}
            <button class="cl {topicState(r)}" class:base={topics[r].base} onclick={() => toTopic(r)}><i></i>{topics[r].name}</button>
          {/each}
        </div>
      {/if}

      <div class="hero">
        <span class="orb" class:base={t.base}>{#if t.formula}<RichText text={t.formula} />{:else}<i class="sd"></i>{/if}</span>
        <div class="titlerow">
          <h2>{t.name}{#if tc?.elective}<span class="badge">Сонгон судлах</span>{/if}</h2>
          <button class="know" class:on={known} aria-pressed={known} onclick={() => markTopic(t.id, !known)}><span class="box">{#if known}✓{/if}</span>Мэднэ</button>
        </div>
        {#if extra?.esh}<p class="esh small">ЭЕШ 2021–2025: {extra.esh.n} бодлого, нийт {extra.esh.pts} оноо</p>{/if}
        {#if tc?.def}<p class="lead def"><RichText text={tc.def} /></p>{:else if t.text}<p class="lead">{t.text}</p>{/if}
      </div>

      <VideoSlot key={'topic:' + t.id} title={t.name} />

      <!-- Examples you can play with, key formulas and the standard method (owner, 2026-10-13). -->
      <section class="core">
        <h3>Жишээ, томьёо, арга</h3>
        {#if formulas.length}
          <div class="formulas">{#each formulas as f}<span class="fx"><RichText text={f} /></span>{/each}</div>
        {/if}
        {#if tc?.rules?.length}
          <ul class="rules">{#each tc.rules as r}<li><RichText text={r} /></li>{/each}</ul>
        {/if}
        {#if tc?.method?.length}
          <div class="method"><span class="mlabel">Арга</span><ol>{#each tc.method as st}<li><RichText text={st} /></li>{/each}</ol></div>
        {/if}
        {#each tc?.examples ?? [] as ex, k}
          <div class="ex">
            <span class="mlabel">Жишээ {k + 1}</span>
            <p class="exq"><RichText text={ex.q} /></p>
            {#each ex.steps.slice(0, shown[k] ?? 0) as st, j}<p class="exs"><span>{j + 1}</span><RichText text={st} /></p>{/each}
            {#if (shown[k] ?? 0) < ex.steps.length}
              <button class="exbtn" onclick={() => (shown = { ...shown, [k]: (shown[k] ?? 0) + 1 })}>{(shown[k] ?? 0) ? 'Дараагийн алхам →' : 'Бодож үзэх →'}</button>
            {:else}
              <p class="exa">Хариу: <strong><RichText text={ex.a} /></strong></p>
            {/if}
          </div>
        {/each}
        {#if tc?.src}<p class="srcnote small muted">Эх сурвалж: {tc.src} (БСШУЯ, econtent.edu.mn)</p>{/if}
        {#if tool === 'fraction'}<div class="play"><FractionOps /></div>
        {:else if tool === 'number'}<div class="play"><NumberOps /></div>
        {:else if tool === 'coord'}<div class="play"><CoordTool /></div>{/if}
        {#each methods as m}
          <div class="method">
            <span class="mlabel">Арга · {m.title}</span>
            {#if m.column}<ColumnCalc {...m.column} />{/if}
            {#if m.steps.length}<ol>{#each m.steps as st}<li><RichText text={st} /></li>{/each}</ol>{/if}
          </div>
        {/each}
        {#if !formulas.length && !tool && !methods.length && !tc}
          <p class="empty small muted">Энэ сэдвийн жишээ, томьёо удахгүй нэмэгдэнэ.</p>
        {/if}
      </section>

      <!-- Research fan-out extras: all draft until the owner or a teacher checks them. -->
      {#if extra?.q?.length && !t.base}
        <section class="box">
          <h3>Дасгал <span class="draft">ноорог</span></h3>
          {#if practice === 'off'}
            <p class="small muted">{extra.q.length} бодлого: {[...new Set(extra.q.map((q) => LEVEL[q.level]))].join(', ').toLowerCase()}. Буруу сонголт бүр түгээмэл нэг алдааг илрүүлнэ.</p>
            <button class="exbtn" onclick={() => (practice = 'on')}>Дасгал ажиллах →</button>
          {:else if practice === 'on'}
            {#key round}<Quiz questions={extra.q} ondone={(s) => { score = s; practice = 'done'; }} />{/key}
          {:else}
            <p>Та эхний оролдлогоор {Math.round(score * extra.q.length)} / {extra.q.length} бодлогыг зөв бодлоо.</p>
            <button class="exbtn" onclick={() => { round += 1; practice = 'on'; }}>Дахин ажиллах →</button>
          {/if}
        </section>
      {/if}
      {#if extra?.mis?.length}
        <section class="box">
          <h3>Түгээмэл алдаа <span class="draft">ноорог</span></h3>
          {#each extra.mis as m}
            <details class="mis">
              <summary><RichText text={m.wrong} /></summary>
              {#if m.example}<p><span class="mlabel">Жишээ:</span> <RichText text={m.example} /></p>{/if}
              {#if m.why}<p><span class="mlabel">Яагаад:</span> <RichText text={m.why} /></p>{/if}
              {#if m.fix}<p><span class="mlabel">Засах арга:</span> <RichText text={m.fix} /></p>{/if}
              {#if m.src}<a class="src small" href={m.src} target="_blank" rel="noopener noreferrer">Эх сурвалж ↗</a>{/if}
            </details>
          {/each}
        </section>
      {/if}
      {#if extra?.rw?.length}
        <section class="box">
          <h3>Энэ юунд хэрэгтэй вэ? <span class="draft">ноорог</span></h3>
          {#each extra.rw as u}
            <div class="rw">
              <strong>{u.title}</strong>
              <p><RichText text={u.text} /></p>
              {#if u.mini}<p class="small muted"><RichText text={u.mini} /></p>{/if}
              {#if u.src}<a class="src small" href={u.src} target="_blank" rel="noopener noreferrer">Эх сурвалж ↗</a>{/if}
            </div>
          {/each}
        </section>
      {/if}
      {#if extra?.v?.length || extra?.it?.length}
        <section class="box">
          <h3>Бусад материал <span class="draft">ноорог</span></h3>
          {#each extra.it ?? [] as x}
            <a class="link" href={x.url} target="_blank" rel="noopener noreferrer"><span class="k">{KIND[x.k] ?? x.k}</span>{x.n}{#if x.mn}<span class="small muted">{' · монгол хэлээр'}</span>{/if}{' ↗'}</a>
          {/each}
          {#each extra.v ?? [] as v}
            <a class="link" href={v.url} target="_blank" rel="noopener noreferrer"><span class="k">Видео</span>{v.t}<span class="small muted">{` · ${v.ch}${v.min ? ` · ${Math.round(v.min)} мин` : ''}`}</span>{' ↗'}</a>
          {/each}
        </section>
      {/if}

      <!-- study materials -->
      <section class="mats">
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
            {#if idea.example}<span class="md ex">Жишээ: <RichText text={short(idea.example, 110)} /></span>{/if}
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

      <!-- Appendix: kept well apart from the main body. -->
      {#if related.length}
        <section class="rel">
          <h3>Холбоотой</h3>
          <div class="rchips">
            {#each related as e}
              {@const other = e.from === t.id ? e.to : e.from}
              <button class="rc" onclick={() => toTopic(other)}><em>{REL[e.type][e.from === t.id ? 0 : 1]}:</em> {topics[other].name}</button>
            {/each}
          </div>
        </section>
      {/if}
      {#if route.parts[0] !== 'm'}<button class="maplink" onclick={() => open('/m')}>Математикийн газрын зураг дээрээс харах →</button>{/if}
    </div>
    {/key}
  </div>
{/if}

<style>
  .scrim { z-index: 40; }
  .topic {
    position: fixed; inset: 0; z-index: 41; overflow-y: auto; overscroll-behavior: contain;
    background: radial-gradient(90% 55% at 50% 22%, color-mix(in srgb, var(--c) 16%, var(--bg)), var(--bg) 70%);
    padding: calc(env(safe-area-inset-top, 0px) + 12px) 16px calc(env(safe-area-inset-bottom, 0px) + 32px);
  }
  .inner { max-width: 560px; margin: 0 auto; display: grid; grid-template-columns: minmax(0, 1fr); gap: 18px; position: relative; }
  /* Narrow phones: drop the count badges so both buttons and × fit on one line. */
  /* Narrow phones: × gets the top-right spot, the two buttons share the row below, left and right. */
  @media (max-width: 460px) {
    .toprow { grid-template-columns: auto 1fr; grid-template-areas: '. x' 'need next'; row-gap: 6px; }
    .toprow > :nth-child(1) { grid-area: need; }
    .toprow > :nth-child(2) { grid-area: next; }
    .toprow > .x { grid-area: x; justify-self: end; }
  }
  /* The top row stays on screen while scrolling, so × is always one tap away. */
  .toprow {
    position: sticky; top: calc(-1 * (env(safe-area-inset-top, 0px) + 12px)); z-index: 3; display: grid; grid-template-columns: auto 1fr auto; gap: 4px; align-items: center;
    margin: 0 -16px; padding: calc(env(safe-area-inset-top, 0px) + 10px) 18px 10px 16px; background: color-mix(in srgb, var(--bg) 88%, transparent); backdrop-filter: blur(10px);
  }
  .toprow > :nth-child(2) { justify-self: end; }
  .pill { display: inline-flex; align-items: center; gap: 4px; }
  .pbtn { white-space: nowrap; min-height: 38px; padding: 0 10px; border-radius: 999px; border: 1px solid var(--line); background: rgba(13, 19, 32, 0.85); color: var(--ink); font-weight: 700; font-size: 0.8rem; display: inline-flex; align-items: center; gap: 5px; }
  .pbtn .n { min-width: 20px; height: 20px; padding: 0 5px; border-radius: 999px; background: var(--line); font-size: 0.72rem; display: grid; place-items: center; }
  .pbtn.on { border-color: var(--c); color: var(--c); }
  .info { width: 28px; height: 28px; flex: none; border-radius: 50%; border: 1px solid var(--line); background: transparent; color: var(--muted); font-family: var(--math); font-style: italic; font-weight: 700; }
  .info.on { border-color: var(--sky); color: var(--sky); }
  .infotext { padding: 10px 12px; border-radius: 12px; background: var(--sky-soft); }
  .plist { display: grid; gap: 2px; justify-items: start; padding: 8px 12px; border-radius: 14px; border: 1px solid var(--line); background: rgba(13, 19, 32, 0.9); }
  .plist.right { justify-items: end; }
  .cl { display: inline-flex; align-items: center; gap: 8px; min-height: 36px; border: 0; background: none; padding: 0; font-size: 0.9rem; font-weight: 600; color: var(--ink); text-align: left; }
  .cl i { flex: none; width: 8px; height: 8px; border-radius: 50%; background: var(--line); }
  .cl.known i { background: var(--grass); } .cl.next i { background: var(--sun); }
  .cl.base { font-style: italic; }
  .x { width: 46px; height: 46px; flex: none; border: 1px solid var(--line); border-radius: 50%; background: rgba(13, 19, 32, 0.95); color: var(--ink); display: grid; place-items: center; }
  .x svg { width: 22px; height: 22px; fill: none; stroke: currentColor; stroke-width: 2.6; stroke-linecap: round; }
  .titlerow { width: 100%; display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 10px; align-items: center; }
  .titlerow h2 { min-width: 0; overflow-wrap: anywhere; }
  .titlerow .know { justify-self: end; }
  .core { display: grid; gap: 12px; padding: 14px; border-radius: 18px; border: 1px solid color-mix(in srgb, var(--c) 40%, var(--line)); background: rgba(13, 19, 32, 0.7); }
  .core h3 { font-size: 0.8rem; letter-spacing: 0.1em; text-transform: uppercase; color: var(--c); margin: 0; }
  .formulas { display: flex; flex-wrap: wrap; gap: 8px; }
  .fx { padding: 8px 14px; border-radius: 12px; background: color-mix(in srgb, var(--c) 14%, transparent); font-family: var(--math); font-size: 1.15rem; }
  .method { display: grid; gap: 8px; }
  .def { color: var(--ink); text-align: left; max-width: none; }
  .rules { margin: 0; padding-left: 18px; display: grid; gap: 6px; }
  .ex { display: grid; gap: 6px; padding: 12px; border-radius: 14px; background: rgba(5, 7, 13, 0.6); border: 1px solid var(--line); }
  .exq { font-weight: 700; margin: 0; }
  .exs { display: flex; gap: 8px; margin: 0; }
  .exs span { flex: none; width: 22px; height: 22px; border-radius: 50%; display: grid; place-items: center; font-size: 0.75rem; font-weight: 800; background: color-mix(in srgb, var(--c) 25%, transparent); }
  .exbtn { justify-self: start; min-height: 40px; padding: 0 14px; border-radius: 999px; border: 1px solid var(--c); background: transparent; color: var(--c); font-weight: 800; }
  .exa { margin: 0; color: var(--grass); }
  .srcnote { margin: 0; }
  .mlabel { font-size: 0.8rem; font-weight: 700; color: var(--muted); }
  .method ol { margin: 0; padding-left: 20px; display: grid; gap: 4px; }
  .hero { display: grid; justify-items: center; text-align: center; gap: 8px; }
  .orb {
    min-width: 112px; height: 112px; padding: 0 16px; display: grid; place-items: center; border-radius: 56px;
    font-family: var(--math); font-size: 1.25rem; color: #fff; white-space: nowrap;
    background: radial-gradient(circle at 40% 35%, color-mix(in srgb, var(--c) 60%, transparent), color-mix(in srgb, var(--c) 10%, transparent));
    border: 2px solid var(--c); box-shadow: 0 0 34px color-mix(in srgb, var(--c) 50%, transparent);
  }
  .orb.base { border-style: dashed; box-shadow: none; background: transparent; }
  .sd { width: 22px; height: 22px; border-radius: 50%; background: var(--c); box-shadow: 0 0 16px var(--c); }
  h2 { font-size: 1.5rem; text-wrap: balance; }
  .know { display: inline-flex; align-items: center; gap: 6px; min-height: 36px; padding: 0 12px 0 8px; border-radius: 999px; border: 1px solid var(--line); background: transparent; color: var(--muted); font-weight: 700; }
  .know .box { width: 20px; height: 20px; border-radius: 6px; border: 2px solid currentColor; display: grid; place-items: center; font-size: 0.8rem; font-weight: 900; }
  .know.on { color: var(--grass); border-color: color-mix(in srgb, var(--grass) 55%, transparent); background: var(--grass-soft); }
  .know.on .box { background: var(--grass); border-color: var(--grass); color: #04140a; }
  .lead { color: var(--muted); max-width: 40ch; }
  .mats { display: grid; gap: 10px; }
  .mat {
    display: grid; gap: 6px; text-align: left; padding: 14px; border-radius: 16px; border: 1px solid var(--line);
    background: rgba(13, 19, 32, 0.85); color: var(--ink); text-decoration: none;
  }
  .mat.known { border-color: color-mix(in srgb, var(--grass) 45%, var(--line)); }
  .pic { display: block; max-height: 150px; overflow: hidden; border-radius: 10px; pointer-events: none; }
  .mt { display: flex; justify-content: space-between; gap: 8px; font-size: 1.05rem; }
  .md { color: var(--muted); font-size: 0.92rem; }
  .md.ex { color: var(--ink); }
  .go { color: var(--c); font-weight: 800; font-size: 0.9rem; }
  .ok { color: var(--grass); }
  .small-mat .mt { font-size: 0.95rem; }
  .empty { text-align: center; padding: 10px; border: 1px dashed var(--line); border-radius: 14px; }
  /* Appendix: clearly apart from the main body. */
  .rel { margin-top: 36px; padding-top: 20px; border-top: 1px dashed var(--line); }
  .rel h3 { font-size: 0.85rem; color: var(--muted); margin-bottom: 8px; }
  .rchips { display: flex; flex-wrap: wrap; gap: 6px; }
  .rc { border: 1px solid var(--line); background: transparent; color: var(--ink); border-radius: 999px; padding: 6px 12px; font-size: 0.85rem; font-weight: 600; }
  .rc em { font-style: normal; color: var(--muted); font-weight: 500; }
  .rc .g { margin-left: 6px; color: var(--muted); font-size: 0.75rem; }
  .badge { display: inline-block; vertical-align: middle; margin-left: 8px; padding: 2px 8px; border-radius: 999px; border: 1px solid var(--sun); color: var(--sun); font-size: 0.7rem; font-weight: 700; letter-spacing: 0; }
  .esh { margin: 0; color: var(--sun); font-weight: 700; }
  .box { display: grid; gap: 10px; padding: 14px; border-radius: 18px; border: 1px solid var(--line); background: rgba(13, 19, 32, 0.7); }
  .box h3 { font-size: 0.8rem; letter-spacing: 0.1em; text-transform: uppercase; color: var(--c); margin: 0; display: flex; align-items: center; gap: 8px; }
  .draft { padding: 1px 7px; border-radius: 999px; border: 1px dashed var(--muted); color: var(--muted); font-size: 0.65rem; letter-spacing: 0.04em; text-transform: none; font-weight: 600; }
  .mis { padding: 10px 12px; border-radius: 12px; background: rgba(5, 7, 13, 0.6); border: 1px solid var(--line); }
  .mis summary { font-weight: 700; cursor: pointer; }
  .mis p { margin: 8px 0 0; }
  .rw { display: grid; gap: 4px; padding: 10px 12px; border-radius: 12px; background: rgba(5, 7, 13, 0.6); border: 1px solid var(--line); }
  .rw p { margin: 0; }
  .src { color: var(--sky); justify-self: start; }
  .link { display: block; padding: 10px 12px; border-radius: 12px; border: 1px solid var(--line); color: var(--ink); text-decoration: none; font-size: 0.92rem; }
  .link .k { display: inline-block; margin-right: 8px; padding: 1px 7px; border-radius: 6px; background: color-mix(in srgb, var(--c) 18%, transparent); color: var(--c); font-size: 0.72rem; font-weight: 800; }
  .maplink { justify-self: center; min-height: 44px; border: 0; background: none; color: var(--sky); font-weight: 700; }
</style>
