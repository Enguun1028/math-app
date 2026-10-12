<script>
  // Warm-up after time away: 3 questions from topics the student already knows.
  // Nothing is taken away for a miss; a missed one just points back to its lesson.
  import { entries } from '../lib/content.js';
  import { progress } from '../lib/progress.svelte.js';
  import { go } from '../lib/router.svelte.js';
  import Quiz from './Quiz.svelte';

  const known = Object.keys(progress.known).filter((id) => entries[id]?.test?.length);
  const pickN = (arr, n) => [...arr].sort(() => Math.random() - 0.5).slice(0, n);
  const questions = pickN(known, 3).map((id) => {
    const t = entries[id].test;
    return { ...t[Math.floor(Math.random() * t.length)], entry: id };
  });

  let score = $state(null);
  let missed = $state([]);
  function done(s, results) {
    score = s;
    missed = questions.filter((_, i) => !results[i]).map((q) => q.entry);
  }
</script>

<header class="head">
  <p class="small muted">Сэргээх · 3 асуулт</p>
  <h1>Тавтай морил</h1>
  <p class="muted">Мэддэг сэдвүүдээсээ 3 асуулт. Оноо, дүн байхгүй.</p>
</header>

{#if !questions.length}
  <section class="quizcard stack">
    <p>Сэргээх сэдэв одоохондоо алга. Эхлээд нэг хичээл үзээрэй.</p>
    <button class="btn primary" onclick={() => go('/')}>Газрын зураг руу</button>
  </section>
{:else}
  <section class="quizcard">
    {#if score === null}
      <Quiz {questions} help={(q) => ({ label: 'Хичээл: ' + entries[q.entry].title, href: '#/e/' + q.entry })} ondone={done} />
    {:else}
      <div class="stack">
        <h2>{missed.length ? 'Сэргээлээ.' : 'Бүгд санаанд байна.'}</h2>
        {#if missed.length}
          <p>Эдгээрийг нэг харчихвал бүрэн сэргэнэ:</p>
          <div class="chips">{#each [...new Set(missed)] as m}<a class="chip" href="#/e/{m}">{entries[m].title}</a>{/each}</div>
        {/if}
        <button class="btn primary" onclick={() => go('/')}>Газрын зураг руу</button>
      </div>
    {/if}
  </section>
{/if}

<style>
  .head { padding: 16px 0; display: grid; gap: 6px; }
  .chips a { text-decoration: none; color: var(--ink); }
</style>
