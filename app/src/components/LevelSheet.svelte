<script>
  // "Дутагдлаа олъё": explains what the level check does, lets the student pick a goal
  // (and, for a coming test, their grade and the test's topic), then starts or resumes the check.
  import { fly, fade } from 'svelte/transition';
  import { track } from '../lib/track.svelte.js';
  import { topics, sphereById } from '../lib/content.js';
  import { GOALS } from '../lib/logic.js';
  import { progress, save } from '../lib/progress.svelte.js';
  import { ui } from '../lib/ui.svelte.js';
  import { go } from '../lib/router.svelte.js';
  import { search } from '../lib/search.js';
  import { sheetIn, sheetOut, scrimFade, noBleed } from '../lib/motion.js';

  const GRADES = [5, 6, 7, 8, 9, 10, 11, 12];
  let q = $state('');
  let matches = $derived(q.trim() ? search(q).filter((r) => r.kind === 'topic').slice(0, 4) : []);
  let started = $derived(progress.level != null);
  let step = $state(0);
  // Steps in order. The exam-topic question only makes sense for "Шалгалтаа давах": for ЭЕШ the exam is known
  // (owner, 2026-10-13), and "Түвшин ахих" has no exam.
  let order = $derived(progress.goal === 'test' ? [0, 1, 2, 3, 4] : [0, 1, 3, 4]);
  let at = $derived(Math.max(0, order.indexOf(step)));
  const next = () => (step = order[Math.min(order.length - 1, at + 1)]);
  const prev = () => (step = order[Math.max(0, at - 1)]);
  // Each time the sheet opens, start from the first step.
  $effect(() => { if (ui.level) step = 0; });

  const close = () => (ui.level = false);
  function setGoal(id) {
    track('goal_set', { picked: id });
    progress.goal = id;
    progress.goalPicked = true;
    save();
  }
  function setGrade(g, keep = false) {
    progress.grade = !keep && progress.grade === g ? null : g;
    save();
    track('grade_set', { picked: progress.grade });
  }
  function setTopic(id) {
    track('exam_topic_set', { topic: id });
    progress.examTopic = id;
    q = '';
    save();
  }
  function start() {
    if (!progress.goalPicked) setGoal(progress.goal ?? 'ahih');
    close();
    go('/start');
  }
</script>

<svelte:window onkeydown={(ev) => ev.key === 'Escape' && close()} />

{#if ui.level}
  <div class="scrim" onclick={close} role="presentation" transition:fade={scrimFade}></div>
  <div class="sheet" use:noBleed role="dialog" aria-label="Дутагдлаа олъё" in:fly={sheetIn} out:fly={sheetOut}>
    <div class="grab"></div>
    <button class="sheet-close" aria-label="Хаах" onclick={close}>×</button>
    <!-- One question per step (owner, 2026-10-13: "much cleaner and easy to follow"), with a progress row on top. -->
    <div class="steps" aria-label="Алхам {at + 1} / {order.length}">
      {#each order as k, i}<span class="dot" class:done={i < at} class:now={i === at}></span>{/each}
    </div>
    {#key step}
      <div class="step" in:fly={{ x: 20, duration: 220 }}>
        {#if step === 0}
          <h2>Зорилгоо сонго</h2>
          <div class="goals">
            {#each GOALS as g}
              <button class="goal" class:on={progress.goalPicked && progress.goal === g.id} onclick={() => { setGoal(g.id); next(); }}>
                <strong>{g.name}</strong><span>{g.hint}</span>
              </button>
            {/each}
          </div>
        {:else if step === 1}
          <h2>Хэддүгээр ангид сурдаг вэ?</h2>
          <div class="grades">
            {#each GRADES as g}<button class="chip grade" class:on={progress.grade === g} onclick={() => { setGrade(g, true); next(); }}>{g}</button>{/each}
          </div>
        {:else if step === 2}
          <h2>Барагцаагаар ямар сэдвүүдээр шалгалттай вэ?</h2>
          <p class="lead">Мэдэхгүй бол алгасаарай.</p>
          {#if progress.examTopic && topics[progress.examTopic]}
            <div class="chips"><button class="chip on" onclick={() => setTopic(null)}>{topics[progress.examTopic].name} ×</button></div>
          {:else}
            <input type="search" bind:value={q} placeholder="Жишээ нь: бутархай, процент, тэгшитгэл" autocomplete="off" />
            {#if matches.length}
              <div class="chips">{#each matches as r}<button class="chip" onclick={() => setTopic(r.id)}>{r.item.name}</button>{/each}</div>
            {/if}
          {/if}
          <button class="btn sun wide" onclick={next}>{progress.examTopic ? 'Үргэлжлүүлэх' : 'Алгасах'}</button>
        {:else if step === 3}
          <h2>Энэ шалгалт юунд хэрэгтэй вэ?</h2>
          <ol class="how">
            <li><span class="n">1</span>Таны сайн мэддэг сэдвүүд болон давтах хэрэгтэй сэдвүүдийг олж, газрын зураг дээр тэмдэглэнэ.</li>
            <li><span class="n">2</span>Анги бүрээс 4 асуулт байна. {progress.grade ?? 7}-р ангиас эхэлж, таны түвшинг олтол дээш, доош шилжинэ.</li>
            <li><span class="n">3</span>Энэ нь дүн биш, зөвхөн танд зориулсан зураглал юм.</li>
          </ol>
          <button class="btn sun wide" onclick={next}>Ойлголоо</button>
        {:else}
          <!-- A separate, friendly tip as the last step, right before the test starts (owner, 2026-10-13). -->
          <div class="tip">
            <svg class="bulb" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.6 10.8c.7.5 1.1 1.3 1.1 2.2h5c0-.9.4-1.7 1.1-2.2A6 6 0 0 0 12 3Z" /></svg>
            <h2>Нэг зөвлөгөө</h2>
            <p>Хариултыг нь мэдэхгүй асуулт таарвал <strong>«Мэдэхгүй байна»</strong> товчийг дарахад болно. Энэ нь огт буруу зүйл биш.</p>
            <p class="muted">Таамаглаж хариулбал таны давтах хэрэгтэй сэдэв нуугдаж магадгүй. Үнэнээр нь хариулбал танд хамгийн тохирох газраас эхлэхэд тусална.</p>
          </div>
          <button class="btn sun wide" onclick={start}>{started ? 'Дахин шалгах' : 'Эхлэх'}</button>
        {/if}
      </div>
    {/key}
    {#if at > 0}<button class="back" onclick={prev}>‹ Буцах</button>{/if}
  </div>
{/if}

<style>
  .sheet { border-color: rgba(255, 204, 102, 0.35); max-height: 90dvh; }
  .steps { display: flex; gap: 6px; justify-content: center; padding-right: 40px; padding-left: 40px; }
  .dot { flex: 1; max-width: 48px; height: 4px; border-radius: 4px; background: var(--line); transition: background 0.3s; }
  .dot.done { background: color-mix(in srgb, var(--sun) 55%, transparent); }
  .dot.now { background: var(--sun); }
  .step { display: grid; gap: 14px; }
  h2 { font-size: 1.35rem; color: var(--sun); text-wrap: balance; }
  .lead { margin-top: -6px; color: var(--muted); }
  .goals { display: grid; gap: 10px; }
  .goal { display: grid; gap: 2px; text-align: left; padding: 14px 16px; border-radius: 16px; border: 1px solid var(--line); background: transparent; color: var(--ink); }
  .goal strong { font-size: 1.05rem; }
  .goal span { color: var(--muted); font-size: 0.9rem; }
  .goal.on { border-color: var(--sun); background: var(--sun-soft); }
  .grades { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
  .chips { display: flex; flex-wrap: wrap; gap: 8px; }
  .chip { color: var(--ink); background: transparent; }
  .chip.grade { min-height: 56px; justify-content: center; font-size: 1.15rem; font-weight: 800; }
  .chip.on { background: var(--sun); border-color: var(--sun); color: #2a1a00; }
  input { width: 100%; min-height: 48px; padding: 0 12px; border-radius: 12px; border: 1px solid var(--line); font: inherit; }
  .how { list-style: none; padding: 0; margin: 0; display: grid; gap: 10px; }
  .how li { display: flex; gap: 10px; align-items: flex-start; }
  .n { flex: none; width: 24px; height: 24px; border-radius: 50%; display: grid; place-items: center; font-size: 0.8rem; font-weight: 800; background: var(--sun-soft); color: var(--sun); }
  .tip { display: grid; gap: 10px; justify-items: start; padding: 16px; border-radius: 18px; background: var(--sun-soft); border: 1px solid color-mix(in srgb, var(--sun) 35%, transparent); }
  .tip p { margin: 0; }
  .bulb { width: 40px; height: 40px; fill: none; stroke: var(--sun); stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; filter: drop-shadow(0 0 8px rgba(255, 204, 102, 0.33)); }
  .wide { width: 100%; min-height: 50px; font-size: 1.05rem; }
  .back { justify-self: start; min-height: 44px; border: 0; background: none; color: var(--sky); font-weight: 700; padding: 0 4px; }
</style>
