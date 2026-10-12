<script>
  // Lesson page. Reads top to bottom like one short lesson:
  // big idea and picture first, then numbered steps (example, real life, watch out, check yourself),
  // then where this topic sits on the journey.
  import { tick } from 'svelte';
  import { entries, unlocks, sphereById, termsIn } from '../lib/content.js';
  import { entryState, ENTRY_PASS } from '../lib/logic.js';
  import { markKnown, touch } from '../lib/progress.svelte.js';
  import { route, go } from '../lib/router.svelte.js';
  import RichText from './RichText.svelte';
  import Visual from './Visual.svelte';
  import Quiz from './Quiz.svelte';
  import ColumnCalc from './ColumnCalc.svelte';
  import Feedback from './Feedback.svelte';

  const SHOW_MISTAKES = false;

  let { id } = $props();
  let e = $derived(entries[id]);
  let st = $derived(e && entryState(e.id));

  let quizKey = $state(0);
  let result = $state(null);
  let flash = $state(route.query.get('m'));

  $effect(() => { if (e) touch(e.id); });

  // Opened from a wrong answer: jump to and highlight that common mistake.
  async function showMistake(m) {
    flash = m;
    await tick();
    document.getElementById('m-' + m)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
  $effect(() => { if (flash) showMistake(flash); });

  function done(score) {
    result = score;
    if (score >= ENTRY_PASS) markKnown(e.id);
  }

  // First sentence of the definition is the big idea; the rest is detail.
  function splitIdea(text) {
    const m = text.match(/^(.+?[.!?])\s+(.+)$/s);
    return m ? [m[1], m[2]] : [text, ''];
  }

  // "52 − 17: step. step. Хариу 35." -> problem, steps, answer.
  function steps(text) {
    let problem = null, rest = text;
    const m = text.match(/^([^:]{1,24}):\s+(.+)$/s);
    if (m && /\d/.test(m[1])) [problem, rest] = [m[1], m[2]];
    const parts = rest.split(/(?<=[.!?])\s+(?=\S)/).filter(Boolean);
    let answer = null;
    if (parts.length > 1 && /^Хариу/.test(parts.at(-1))) answer = parts.pop();
    return { problem, parts, answer };
  }

  // A sentence that is only numbers and signs is shown as an equation.
  const isEq = (s) => /^[\d\s+−×÷=,.()/:%₮<>≠□-]+$/.test(s.replace(/\[\[[^\]]*\]\]/g, 'x'));

  let idea = $derived(e ? splitIdea(e.definition) : ['', '']);
  let worked = $derived(e ? steps(e.example.worked) : null);
  let missing = $derived(e ? e.prereq.filter((p) => entryState(p) !== 'known') : []);
  let need = $derived(e ? Math.ceil(ENTRY_PASS * e.test.length) : 0);
</script>

{#if !e}
  <p class="card">Ийм сэдэв олдсонгүй.</p>
{:else}
  <article class="lesson">
    <header class="hero">
      <a class="crumb" href="#/s/{e.sphere}">{sphereById[e.sphere]?.title}</a>
      <h1>
        {#if e.symbol}<span class="sym">{e.symbol}</span>{/if}
        <span>{e.title}</span>
      </h1>
      {#if st === 'known'}<span class="badge known">✓ Мэднэ</span>{/if}
      <p class="idea"><RichText text={idea[0]} /></p>
      {#if idea[1]}<p class="detail"><RichText text={idea[1]} /></p>{/if}
    </header>

    {#if missing.length}
      <aside class="first">
        <span>Эхлээд үзвэл амар:</span>
        {#each missing as p}<a class="chip {entryState(p)}" href="#/e/{p}"><span class="dot"></span>{entries[p]?.title}</a>{/each}
      </aside>
    {/if}

    {#if e.visual}<div class="picture"><Visual v={e.visual} /></div>{/if}

    <ol class="rail">
      <li class="step">
        <h2>Жишээ бодолт</h2>
        {#if e.example.column}
          <div class="worked"><ColumnCalc {...e.example.column} /></div>
        {:else}
        <div class="worked">
          {#if worked.problem}<p class="problem"><RichText text={worked.problem} /></p>{/if}
          {#if worked.parts.length > 1}
            <ol class="lines">
              {#each worked.parts as s}<li class:eq={isEq(s)}><RichText text={s} /></li>{/each}
            </ol>
          {:else}
            <p class="line" class:eq={isEq(worked.parts[0] ?? '')}><RichText text={worked.parts[0] ?? ''} /></p>
          {/if}
          {#if worked.answer}<p class="answer"><RichText text={worked.answer} /></p>{/if}
        </div>
        {/if}
      </li>

      <li class="step">
        <h2>Амьдрал дээр</h2>
        <p class="life"><RichText text={e.example.life} /></p>
      </li>

      <!-- "Анхаар" (common mistakes) is hidden for now: owner, 2026-10-12, until the content is checked. -->
      {#if SHOW_MISTAKES && e.mistakes?.length}
        <li class="step warn">
          <h2>Анхаар</h2>
          {#each e.mistakes as m}
            <div class="mistake" id="m-{m.id}" class:flash={flash === m.id}>
              <strong>{m.title}</strong>
              <p><RichText text={m.text} /></p>
            </div>
          {/each}
        </li>
      {/if}

      {#if e.video}
        <li class="step">
          <h2>Видео</h2>
          <div class="video">
            <div class="play" aria-hidden="true">▶</div>
            <div><strong>{e.video.title}</strong><p class="muted">Видео удахгүй нэмэгдэнэ.</p></div>
          </div>
        </li>
      {/if}

      <li class="step check">
        <h2>Шалгаад үзье</h2>
        <p class="muted sub">{e.test.length} асуулт · {need} зөв бол «Мэднэ» болно</p>
        <div class="quizcard">
          {#if result === null}
            {#key quizKey}
              <Quiz questions={e.test} onmistake={SHOW_MISTAKES ? (q) => showMistake(q.mistake) : null} ondone={done} />
            {/key}
          {:else}
            <p class="result">
              {#if result >= ENTRY_PASS}
                <strong>Мэднэ боллоо.</strong> {Math.round(result * e.test.length)} / {e.test.length} зөв. Сайн ажилласан.
              {:else}
                {Math.round(result * e.test.length)} / {e.test.length} зөв. Дээрх жишээг дахин харчихаад дахиад оролдоорой.
              {/if}
            </p>
            <div class="row">
              <button class="btn" onclick={() => { result = null; quizKey++; }}>Дахин</button>
              {#if result >= ENTRY_PASS && unlocks[e.id][0]}
                <button class="btn primary" onclick={() => go('/e/' + unlocks[e.id][0])}>Дараагийнх: {entries[unlocks[e.id][0]].title} →</button>
              {/if}
            </div>
          {/if}
        </div>
      </li>
    </ol>

    {#if e.prereq.length || unlocks[e.id].length}
      <section class="journey" aria-label="Аялал дээрх байршил">
        <h2>Аялал дээр</h2>
        <div class="flow">
          {#if e.prereq.length}
            <span class="lbl">Өмнө нь</span>
            <div class="chips">
              {#each e.prereq as p}<a class="chip {entryState(p)}" href="#/e/{p}"><span class="dot"></span>{entries[p]?.title}</a>{/each}
            </div>
            <span class="arrow" aria-hidden="true">↓</span>
          {/if}
          <span class="here">{e.title}</span>
          {#if unlocks[e.id].length}
            <span class="arrow" aria-hidden="true">↓</span>
            <span class="lbl">Дараа нь</span>
            <div class="chips">
              {#each unlocks[e.id] as u}<a class="chip {entryState(u)}" href="#/e/{u}"><span class="dot"></span>{entries[u].title}</a>{/each}
            </div>
          {/if}
        </div>
      </section>
    {/if}

    {#if termsIn(e).length}
      <section class="terms">
        <h2>Энд орсон нэр томьёо</h2>
        <div class="chips">
          {#each termsIn(e) as t}<a class="chip" href="#/e/{t}">{entries[t].title}</a>{/each}
        </div>
      </section>
    {/if}

    <Feedback entry={e.id} />
  </article>
{/if}

<style>
  .lesson { font-size: 17px; line-height: 1.6; display: grid; gap: 32px; padding-top: 8px; }
  .lesson > * { animation: rise 0.5s cubic-bezier(0.32, 0.72, 0, 1) both; }
  .lesson > :nth-child(2) { animation-delay: 0.05s; }
  .lesson > :nth-child(3) { animation-delay: 0.1s; }
  .lesson > :nth-child(n + 4) { animation-delay: 0.15s; }
  @keyframes rise { from { opacity: 0; transform: translateY(12px); } }

  /* Hero: one big idea, read in two seconds. */
  .hero { display: grid; gap: 10px; justify-items: start; }
  .crumb { color: var(--muted); font-size: 0.85rem; font-weight: 600; text-decoration: none; }
  .crumb::after { content: ' ›'; }
  h1 { font-size: 2.1rem; font-weight: 800; line-height: 1.1; letter-spacing: -0.025em; display: flex; align-items: center; gap: 12px; text-wrap: balance; }
  .sym {
    display: inline-grid; place-items: center; flex: none; min-width: 52px; height: 52px; padding: 0 8px;
    border-radius: 16px; background: var(--sky); color: var(--on-sky); box-shadow: var(--glow); font-family: var(--math); font-size: 1.7rem;
  }
  .idea { font-size: 1.3rem; line-height: 1.45; font-weight: 600; letter-spacing: -0.01em; text-wrap: pretty; }
  .detail { color: var(--muted); text-wrap: pretty; }
  .detail :global(.term), .idea :global(.term) { font-weight: 700; }

  .first { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin-top: -16px; font-size: 0.9rem; color: var(--sun); }
  .first a { text-decoration: none; color: var(--ink); }

  .picture { border-radius: 24px; padding: 6px; background: linear-gradient(180deg, var(--sky-soft), transparent); }

  /* The lesson as a numbered path: a thin line joins the steps. */
  .rail { list-style: none; margin: 0; padding: 0; counter-reset: step; display: grid; gap: 36px; }
  .step { position: relative; padding-left: 44px; counter-increment: step; display: grid; gap: 12px; }
  .step::before {
    content: counter(step); position: absolute; left: 0; top: -2px; width: 30px; height: 30px; border-radius: 50%;
    display: grid; place-items: center; font-size: 0.85rem; font-weight: 800;
    background: var(--surface-solid); color: var(--sky-deep); border: 1.5px solid var(--sky); box-shadow: var(--glow);
  }
  .step:not(:last-child)::after {
    content: ''; position: absolute; left: 15px; top: 34px; bottom: -34px; width: 2px;
    background: linear-gradient(var(--sky), transparent); opacity: 0.35;
  }
  .step.warn::before { border-color: var(--warn); color: var(--warn); box-shadow: 0 0 14px rgba(255, 122, 138, 0.35); content: '!'; }
  .step.check::before { border-color: var(--grass); color: var(--grass); box-shadow: 0 0 14px rgba(94, 234, 154, 0.35); content: '✓'; }
  h2 { font-size: 1.25rem; font-weight: 800; letter-spacing: -0.015em; }

  .worked { display: grid; gap: 12px; padding: 18px; border-radius: 20px; background: var(--surface); border: 1px solid var(--line); }
  .problem { font-family: var(--math); font-size: 1.7rem; line-height: 1.2; color: var(--sky-deep); }
  .lines { margin: 0; padding: 0; list-style: none; counter-reset: line; display: grid; gap: 10px; }
  .lines li { counter-increment: line; display: grid; grid-template-columns: 24px 1fr; gap: 8px; align-items: baseline; }
  .lines li::before { content: counter(line) '.'; color: var(--muted); font-size: 0.85rem; font-weight: 700; }
  .eq { font-family: var(--math); font-size: 1.2rem; }
  .answer {
    justify-self: start; padding: 6px 14px; border-radius: 999px; font-weight: 800;
    background: var(--grass-soft); color: var(--grass);
  }
  .life { padding: 14px 16px; border-radius: 16px; background: var(--grass-soft); }

  .mistake { display: grid; gap: 4px; padding: 14px 16px; border-radius: 16px; background: var(--warn-soft); scroll-margin: 80px; }
  .mistake strong { color: var(--warn); }
  .mistake.flash { box-shadow: 0 0 0 3px var(--warn); animation: pulse 1.2s ease 2; }
  @keyframes pulse { 50% { box-shadow: 0 0 0 7px color-mix(in srgb, var(--warn) 30%, transparent); } }

  .video { display: flex; gap: 14px; align-items: center; }
  .play { width: 56px; height: 56px; border-radius: 16px; background: var(--sky-soft); color: var(--sky); border: 1px solid var(--sky); display: grid; place-items: center; flex: none; }

  .sub { font-size: 0.9rem; margin-top: -6px; }
  .quizcard {
    padding: 18px; border-radius: 24px; background: var(--surface-solid);
    border: 1px solid color-mix(in srgb, var(--grass) 35%, var(--line)); box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
  }
  .result { margin-bottom: 12px; }
  .row { display: flex; gap: 8px; flex-wrap: wrap; }

  /* Where this topic sits on the journey: before -> here -> after. */
  .journey { display: grid; gap: 14px; }
  .flow { display: grid; justify-items: center; gap: 8px; text-align: center; }
  .flow .chips { justify-content: center; }
  .flow a { text-decoration: none; }
  .lbl { font-size: 0.8rem; font-weight: 700; color: var(--muted); }
  .arrow { color: var(--sky); opacity: 0.6; line-height: 1; }
  .here {
    padding: 10px 20px; border-radius: 999px; font-weight: 800;
    background: var(--sky); color: var(--on-sky); box-shadow: var(--glow);
  }

  .terms { display: grid; gap: 12px; }
  .terms a { text-decoration: none; }
</style>
