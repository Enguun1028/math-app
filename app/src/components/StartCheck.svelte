<script>
  // "Дутагдлаа олъё": short sections, simplest first. The plan comes from the goal (see LevelSheet).
  // Stop any time: finished sections are kept, and the check picks up at the first unfinished one.
  import { fly } from 'svelte/transition';
  import { checkLeft, checkSpheres, sphereQuestions, applySphereTest, PASS } from '../lib/logic.js';
  import { go } from '../lib/router.svelte.js';
  import { ms, ease } from '../lib/motion.js';
  import Quiz from './Quiz.svelte';

  // Taken once: finishing a section must not shift the list under the student.
  const sections = checkLeft();
  const total = checkSpheres().length;
  const doneBefore = total - sections.length;
  let at = $state(0);
  let score = $state(null);
  let s = $derived(sections[at]);
  // At most 5 questions per section, spread from the simplest entry to the hardest, so a section stays short.
  const spread = (qs, n = 5) => (qs.length <= n ? qs : Array.from({ length: n }, (_, i) => qs[Math.round((i * (qs.length - 1)) / (n - 1))]));
  let questions = $derived(s ? spread(sphereQuestions(s, 1)) : []);
  let last = $derived(at >= sections.length - 1);

  function done(_, results) {
    score = applySphereTest(s, questions, results);
  }
  function cont() {
    at += 1;
    score = null;
  }
</script>

{#if !s}
  <section class="card stack">
    <h2>Шалгах зүйл үлдсэнгүй.</h2>
    <p class="muted">Газрын зураг дээр эхлэх сэдэв тань гэрэлтэж байгаа.</p>
    <button class="btn primary" onclick={() => go('/')}>Газрын зургаа харах</button>
  </section>
{:else}
  <header class="head">
    <div class="top">
      <p class="small muted">Дутагдлаа олъё · {doneBefore + at + 1}-р хэсэг / {total}</p>
      <button class="btn ghost stop" onclick={() => go('/')}>Зогсоох</button>
    </div>
    <div class="bar" aria-hidden="true"><span style:transform="scaleX({(doneBefore + at + (score === null ? 0 : 1)) / total})"></span></div>
    <h1>{s.title}</h1>
    <p class="muted">Мэдэхгүй бол таамаглах хэрэггүй. Хүссэн үедээ зогсоож болно, дууссан хэсэг хадгалагдана.</p>
  </header>

  <section class="card">
    {#if score === null}
      {#key at}<div in:fly={{ x: 24, duration: ms(280), easing: ease }}><Quiz {questions} ondone={done} /></div>{/key}
    {:else}
      <div class="stack" in:fly={{ y: 12, duration: ms(280), easing: ease }}>
        <h2>{Math.round(score * questions.length)} / {questions.length} зөв</h2>
        <p>
          {#if score >= PASS}Энэ хэсгийг мэддэг байна. Газрын зурагт тэмдэглэлээ.{:else}Эндээс эхэлбэл хамгийн тохиромжтой. Газрын зураг дээр энэ хэсэг гэрэлтэнэ.{/if}
        </p>
        <div class="row">
          {#if !last}
            <button class="btn" class:sun={score >= PASS} onclick={cont}>Дараагийн хэсэг →</button>
          {/if}
          <button class="btn" class:primary={score < PASS || last} onclick={() => go('/')}>Газрын зургаа харах</button>
        </div>
      </div>
    {/if}
  </section>
{/if}

<style>
  .head { padding: 16px 0; display: grid; gap: 8px; }
  .top { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
  .stop { min-height: 32px; }
  .bar { height: 4px; border-radius: 4px; background: var(--line); overflow: hidden; }
  .bar span { display: block; height: 100%; background: var(--sun); transform-origin: left; transition: transform 0.4s ease-out; }
  h1 { font-size: 1.6rem; font-weight: 800; }
  .row { display: flex; gap: 8px; flex-wrap: wrap; }
</style>
