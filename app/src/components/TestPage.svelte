<script>
  // Whole-sphere test.
  import { sphereById, entries, topics } from '../lib/content.js';
  import { sphereQuestions, applySphereTest, PASS, nextTopic } from '../lib/logic.js';
  import { go } from '../lib/router.svelte.js';
  import Quiz from './Quiz.svelte';

  let { id } = $props();
  let s = $derived(sphereById[id]);
  let questions = $derived(s ? sphereQuestions(s, 2) : []);
  let score = $state(null);
  let missed = $state([]);
  let nextS = $derived(score !== null && nextTopic() ? sphereById[topics[nextTopic()].sphere] : null);

  function done(_, results) {
    score = applySphereTest(s, questions, results);
    missed = [...new Set(questions.filter((_, i) => !results[i]).map((q) => q.entry))];
  }
</script>

{#if !s}
  <p class="card">Ийм анги олдсонгүй.</p>
{:else}
  <header class="head">
    <p class="small muted">Ангийн шалгалт</p>
    <h1>{s.title}</h1>
  </header>
  <section class="quizcard">
    {#if score === null}
      <Quiz {questions} help={(q) => ({ label: 'Хичээл: ' + entries[q.entry].title, href: '#/e/' + q.entry })} ondone={done} />
    {:else}
      <div class="stack">
        {#if score >= PASS}
          <h2>Мэднэ боллоо.</h2>
          <p>{Math.round(score * questions.length)} / {questions.length} зөв. Энэ ангийг давлаа.</p>
        {:else}
          <h2>Үзэх сэдвүүдээ оллоо.</h2>
          <p>Доорх сэдвүүдийг нэг нэгээр нь үзчихвэл энэ анги бүрэн таных болно. Эхнийхээс нь эхэл.</p>
        {/if}
        {#if missed.length}
          <div class="chips">{#each missed as m}<a class="chip" href="#/e/{m}">{entries[m].title}</a>{/each}</div>
        {/if}
        <div class="row">
          {#if score >= PASS && nextS}
            <button class="btn sun" onclick={() => go('/s/' + nextS.id)}>Дараагийн алхам: {nextS.title}</button>
          {/if}
          <button class="btn" onclick={() => go('/')}>Газрын зураг руу</button>
        </div>
      </div>
    {/if}
  </section>
{/if}

<style>
  .head { padding: 16px 0; display: grid; gap: 4px; }
  .chips a { text-decoration: none; }
  .row { display: flex; gap: 8px; flex-wrap: wrap; }
</style>
