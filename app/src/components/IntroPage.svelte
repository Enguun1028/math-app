<script>
  // The tutorial level on the very first visit (owner, 2026-10-22: 24 of the first 50 visitors left within 30 s).
  // Hello, the grade, 3 easy questions from two grades below (learn mode: hints and second tries, so everyone
  // finishes), then the map with the student's own grade sphere glowing. "Алгасах" at any point goes to the
  // map as before. Either way it never comes back (progress.intro).
  import { fly } from 'svelte/transition';
  import { levelQuestions, LEVEL_MIN } from '../lib/logic.js';
  import { progress, save } from '../lib/progress.svelte.js';
  import { ui } from '../lib/ui.svelte.js';
  import { replace } from '../lib/router.svelte.js';
  import { ms, ease } from '../lib/motion.js';
  import { track } from '../lib/track.svelte.js';
  import Quiz from './Quiz.svelte';

  // "Төгссөн" (owner, 2026-10-22: so graduates and adults use it too) counts as grade 12.
  const GRADES = [5, 6, 7, 8, 9, 10, 11, 12];
  let step = $state('hi'); // hi | grade | quiz | done
  let right = $state(0);
  let qGrade = $derived(Math.min(10, Math.max(LEVEL_MIN, (progress.grade ?? 7) - 2)));
  let questions = $state([]);
  $effect(() => { track('intro_step', { step }); });

  function setGrade(g, graduated = false) {
    progress.grade = g;
    progress.graduated = graduated;
    save();
    track('grade_set', { picked: g, graduated, from: 'intro' });
    questions = levelQuestions(qGrade).slice(0, 3);
    step = 'quiz';
  }
  function done(_, results) {
    right = results.filter(Boolean).length;
    track('intro_finished', { right, of: questions.length, grade: progress.grade, graduated: progress.graduated });
    step = 'done';
  }
  function leave(skipped) {
    progress.intro = skipped ? 'skipped' : 'done';
    save();
    if (skipped) track('intro_skipped', { at: step });
    // The student's own grade sphere glows on the map until it is opened.
    else {
      ui.introSphere = 'g' + Math.min(12, Math.max(5, progress.grade ?? 7));
      ui.scrollY = null; // the map opens on that sphere (its first-look scroll), not where it was before the intro
    }
    replace('/');
  }
</script>

<div class="intro">
  {#if step !== 'done'}<button class="skip" onclick={() => leave(true)}>Алгасах</button>{/if}
  {#key step}
    <section class="step" in:fly={{ x: 24, duration: ms(280), easing: ease }}>
      {#if step === 'hi'}
        <div class="hello">
          <h1>Сайн уу?</h1>
          <p class="lead">Эхлээд хэдхэн асуулт, ганцхан минут.</p>
        </div>
        <button class="btn sun big" onclick={() => (step = 'grade')}>Эхлэх</button>
      {:else if step === 'grade'}
        <h2>Хэддүгээр ангид сурдаг вэ?</h2>
        <div class="grades">
          {#each GRADES as g}<button class="chip grade" onclick={() => setGrade(g)}>{g}</button>{/each}
          <button class="chip grade wide" onclick={() => setGrade(12, true)}>Төгссөн</button>
        </div>
      {:else if step === 'quiz'}
        <p class="small muted">Санаа зоволтгүй: буруу хариулбал яаж бодохыг нь харуулна.</p>
        <Quiz {questions} mode="intro" ondone={done} />
      {:else}
        <div class="hello">
          <h1>{right === questions.length ? 'Гайхалтай!' : 'Сайн байна!'}</h1>
          <p class="lead">{right}/{questions.length} асуултыг анхны оролдлогоор зөв бодлоо.</p>
          <p class="muted">Одоо газрын зураг дээр өөрийн ангийг нээж үзээрэй.</p>
        </div>
        <button class="btn sun big" onclick={() => leave(false)}>Газрын зураг руу</button>
      {/if}
    </section>
  {/key}
</div>

<style>
  .intro { position: relative; min-height: calc(100dvh - 40px); display: grid; align-content: center; padding: 56px 0 24px; }
  .skip { position: fixed; z-index: 20; top: 8px; right: 12px; min-height: 44px; padding: 0 12px; border: 0; background: none; color: var(--muted); font-size: 0.95rem; text-decoration: underline; text-underline-offset: 3px; }
  .step { display: grid; gap: 24px; max-width: 480px; width: 100%; margin: 0 auto; }
  .hello { display: grid; gap: 8px; text-align: center; }
  h1 { margin: 0; font-size: 2.4rem; }
  .lead { margin: 0; font-size: 1.2rem; }
  .big { min-height: 60px; font-size: 1.15rem; }
  .grades { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
  .chip.grade { min-height: 56px; justify-content: center; font-size: 1.15rem; font-weight: 800; }
  .chip.wide { grid-column: 1 / -1; }
</style>
