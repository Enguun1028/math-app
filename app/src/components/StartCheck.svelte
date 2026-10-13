<script>
  // "Дутагдлаа олъё": the level test across grades. 4 questions per grade, one try each, no reveal.
  // It starts at the student's grade and steps up after a pass, down after a miss, until it finds the edge.
  // At the end, known topics light up and the grade the student picked opens (owner, 2026-10-13).
  import { fly } from 'svelte/transition';
  import { levelQuestions, startGrade, nextLevelGrade, applyLevel, LEVEL_PASS, LEVEL_MIN } from '../lib/logic.js';
  import { topics } from '../lib/content.js';
  import { progress } from '../lib/progress.svelte.js';
  import { ui } from '../lib/ui.svelte.js';
  import { go, replace } from '../lib/router.svelte.js';
  import { ms, ease } from '../lib/motion.js';
  import Quiz from './Quiz.svelte';
  import { SvelteSet } from 'svelte/reactivity';

  let grade = $state(startGrade());
  let round = $state(0); // how many grades tested so far
  const passed = new SvelteSet();
  const missed = new SvelteSet();
  const missedConcepts = new Set();
  let level = $state(null); // set when the test is over
  let questions = $derived(levelQuestions(grade));

  function done(_, results) {
    results.forEach((ok, k) => !ok && missedConcepts.add(questions[k].concept));
    const ok = results.filter(Boolean).length >= LEVEL_PASS;
    (ok ? passed : missed).add(grade);
    const next = nextLevelGrade(grade, ok, passed, missed);
    round += 1;
    if (next == null) finish();
    // Not ЭЕШ: once the student has passed one grade above their own, that is usually enough for their goal.
    // Pause and ask instead of testing all the way to grade 12 (owner, 2026-10-13).
    else if (ok && !keepGoing && progress.goal !== 'eesh' && progress.grade && grade >= progress.grade + 1) asking = next;
    else grade = next;
  }
  let asking = $state(null); // the next grade, while the student decides
  let keepGoing = false;
  function finish() {
    asking = null;
    level = passed.size ? Math.max(...passed) : LEVEL_MIN - 1;
    applyLevel(level, missedConcepts);
  }
  function goOn() {
    keepGoing = true;
    grade = asking;
    asking = null;
  }

  const label = (g) => (g <= 4 ? '1–4-р ангийн суурь' : g + '-р анги');
  // Where to go after: the grade the student picked, else the first grade above their level.
  let target = $derived(level == null ? null : 'g' + Math.min(12, Math.max(5, progress.grade || level + 1)));
  let knownCount = $derived(level == null ? 0 : Object.keys(topics).filter((id) => progress.topics?.[id]).length);
  function open() {
    ui.reveal = true;
    replace('/s/' + target);
  }
</script>

<header class="head">
  <div class="top">
    <p class="small muted">Дутагдлаа олъё{level == null ? ` · ${label(grade)}` : ''}</p>
    {#if level == null}<button class="btn ghost stop" onclick={() => go('/')}>Зогсоох</button>{/if}
  </div>
  <!-- Grades tested so far: green = known, amber = not yet. -->
  <div class="steps" aria-label="Шалгасан ангиуд">
    {#each [4, 5, 6, 7, 8, 9, 10, 11, 12] as g}
      <span class="st" class:ok={passed.has(g)} class:miss={missed.has(g)} class:now={level == null && g === grade}>{g <= 4 ? '1–4' : g}</span>
    {/each}
  </div>
  {#if level == null}
    <p class="muted">Хариултыг нь мэдэхгүй бол «Мэдэхгүй байна»-г дарахад болно. Энэ нь дүн биш, эхлэх газраа олох арга юм.</p>
  {/if}
</header>

<section class="quizcard">
  {#if asking != null}
    <div class="stack" in:fly={{ y: 12, duration: ms(280), easing: ease }}>
      <h2>Та {grade}-р ангийн түвшинг давлаа.</h2>
      <p>Таны зорилгод энэ мэдлэг хангалттай байх магадлалтай. Цааш үргэлжлүүлж, дараагийн ангиудыг шалгах уу?</p>
      <div class="row">
        <button class="btn sun" onclick={finish}>Энд дуусгая</button>
        <button class="btn" onclick={goOn}>Үргэлжлүүлэх</button>
      </div>
    </div>
  {:else if level == null}
    {#key round}<div in:fly={{ x: 24, duration: ms(280), easing: ease }}><Quiz {questions} mode="check" ondone={done} /></div>{/key}
  {:else}
    <div class="stack" in:fly={{ y: 12, duration: ms(280), easing: ease }}>
      <h2>{level >= LEVEL_MIN ? `Та ${label(level)} хүртэлх ихэнх зүйлийг мэдэж байна.` : 'Суурь сэдвүүдээс эхэлье.'}</h2>
      <p>
        Таны мэддэг {knownCount} сэдэв газрын зураг дээр гэрэлтэнэ. Харанхуй үлдсэн нь таны дараагийн алхмууд.
        {#if missedConcepts.size}Алдсан асуултын сэдвүүдийг дахин үзэхэд тань зориулж үлдээлээ.{/if}
      </p>
      <div class="row">
        <button class="btn sun" onclick={open}>{target.slice(1)}-р ангийн зураг руу</button>
        <button class="btn" onclick={() => { ui.reveal = true; replace('/'); }}>Газрын зураг</button>
      </div>
    </div>
  {/if}
</section>

<style>
  .head { padding: 16px 0; display: grid; gap: 10px; }
  .top { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
  .steps { display: flex; gap: 4px; }
  .st {
    flex: 1; min-width: 0; height: 26px; display: grid; place-items: center; border-radius: 8px; font-size: 0.72rem; font-weight: 800;
    border: 1px solid var(--line); color: var(--muted); font-variant-numeric: tabular-nums;
  }
  .st.ok { background: var(--grass-soft); border-color: var(--grass); color: var(--grass); }
  .st.miss { background: var(--sun-soft); border-color: var(--sun); color: var(--sun); }
  .st.now { border-color: var(--sky); color: var(--ink); box-shadow: 0 0 10px rgba(34, 211, 238, 0.4); }
  .row { display: flex; gap: 8px; flex-wrap: wrap; }
</style>
