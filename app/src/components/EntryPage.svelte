<script>
  import { tick } from 'svelte';
  import { entries, unlocks, sphereById, termsIn } from '../lib/content.js';
  import { entryState, ENTRY_PASS } from '../lib/logic.js';
  import { markKnown, touch } from '../lib/progress.svelte.js';
  import { route, go } from '../lib/router.svelte.js';
  import RichText from './RichText.svelte';
  import Visual from './Visual.svelte';
  import Quiz from './Quiz.svelte';
  import Feedback from './Feedback.svelte';

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
</script>

{#if !e}
  <p class="card">Ийм сэдэв олдсонгүй.</p>
{:else}
  <article class="stack">
    <header class="head">
      <p class="small muted">
        <a href="#/s/{e.sphere}">{sphereById[e.sphere]?.title}</a> · {e.type}
      </p>
      <h1>{#if e.symbol}<span class="sym">{e.symbol}</span>{/if}{e.title}</h1>
      {#if st === 'known'}<span class="badge known">Мэднэ</span>{/if}
      <p class="def"><RichText text={e.definition} /></p>
    </header>

    {#if e.visual}<Visual v={e.visual} />{/if}

    {#if e.prereq.length || unlocks[e.id].length}
      <section class="card links">
        {#if e.prereq.length}
          <h2>Суурь</h2>
          <div class="chips">
            {#each e.prereq as p}<a class="chip {entryState(p)}" href="#/e/{p}"><span class="dot"></span>{entries[p]?.title}</a>{/each}
          </div>
        {/if}
        {#if unlocks[e.id].length}
          <h2>Нээгдэх</h2>
          <div class="chips">
            {#each unlocks[e.id] as u}<a class="chip {entryState(u)}" href="#/e/{u}"><span class="dot"></span>{entries[u].title}</a>{/each}
          </div>
        {/if}
      </section>
    {/if}

    <section class="card stack">
      <h2>Жишээ</h2>
      <div class="ex"><span class="tag">Бодолт</span><p><RichText text={e.example.worked} /></p></div>
      <div class="ex life"><span class="tag">Бодит жишээ</span><p><RichText text={e.example.life} /></p></div>
    </section>

    {#if e.mistakes?.length}
      <section class="card stack">
        <h2>Нийтлэг алдаа</h2>
        {#each e.mistakes as m}
          <div class="mistake" id="m-{m.id}" class:flash={flash === m.id}>
            <strong>{m.title}</strong>
            <p><RichText text={m.text} /></p>
          </div>
        {/each}
      </section>
    {/if}

    {#if e.video}
      <section class="card video">
        <div class="play" aria-hidden="true">▶</div>
        <div><strong>{e.video.title}</strong><p class="small muted">Видео удахгүй нэмэгдэнэ.</p></div>
      </section>
    {/if}

    <section class="card stack">
      <h2>Шалгаад үзье</h2>
      {#if result === null}
        {#key quizKey}
          <Quiz questions={e.test} onmistake={(q) => showMistake(q.mistake)} ondone={done} />
        {/key}
      {:else}
        <p>
          {#if result >= ENTRY_PASS}
            <strong>Мэднэ боллоо!</strong> {Math.round(result * e.test.length)} / {e.test.length} зөв. Сайн ажилласан.
          {:else}
            {Math.round(result * e.test.length)} / {e.test.length} зөв. Дээрх жишээ, нийтлэг алдааг дахин харчихаад дахиад оролдоорой.
          {/if}
        </p>
        <div class="row">
          <button class="btn" onclick={() => { result = null; quizKey++; }}>Дахин</button>
          {#if result >= ENTRY_PASS && unlocks[e.id][0]}
            <button class="btn primary" onclick={() => go('/e/' + unlocks[e.id][0])}>Дараагийнх: {entries[unlocks[e.id][0]].title}</button>
          {/if}
        </div>
      {/if}
    </section>

    {#if termsIn(e).length}
      <section class="card stack">
        <h2>Энд орсон нэр томьёо</h2>
        <ul class="terms">
          {#each termsIn(e) as t}
            <li><a href="#/e/{t}">{entries[t].title}</a> <span class="small muted">· {sphereById[entries[t].sphere]?.title}</span></li>
          {/each}
        </ul>
      </section>
    {/if}

    <Feedback entry={e.id} />
  </article>
{/if}

<style>
  .head { display: grid; gap: 8px; justify-items: start; padding-top: 8px; }
  .head a { color: inherit; }
  h1 { font-size: 1.8rem; font-weight: 800; letter-spacing: -0.02em; display: flex; align-items: center; }
  .sym {
    display: inline-grid; place-items: center; min-width: 48px; height: 48px; margin-right: 12px; padding: 0 8px;
    border-radius: 14px; background: var(--sky); color: var(--on-sky); box-shadow: var(--glow); font-family: var(--math); font-size: 1.6rem;
  }
  .def { font-size: 1.1rem; }
  .links { display: grid; gap: 10px; }
  .links a { text-decoration: none; }
  .ex { display: grid; gap: 4px; padding: 12px 14px; border-radius: 12px; background: var(--sky-soft); }
  .ex.life { background: var(--grass-soft); }
  .tag { font-size: 0.75rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.04em; color: var(--muted); }
  .mistake { padding: 12px 14px; border-radius: 12px; background: var(--warn-soft); display: grid; gap: 4px; scroll-margin: 80px; }
  .mistake.flash { box-shadow: 0 0 0 3px var(--warn); animation: pulse 1.2s ease 2; }
  .video { display: flex; gap: 14px; align-items: center; }
  .play { width: 56px; height: 56px; border-radius: 14px; background: var(--sky-soft); color: var(--sky); border: 1px solid var(--sky); display: grid; place-items: center; flex: none; }
  .row { display: flex; gap: 8px; flex-wrap: wrap; }
  .terms { margin: 0; padding-left: 18px; display: grid; gap: 4px; }
  .terms a { color: var(--sky-deep); font-weight: 700; }
  @keyframes pulse { 50% { box-shadow: 0 0 0 7px color-mix(in srgb, var(--warn) 30%, transparent); } }
</style>
