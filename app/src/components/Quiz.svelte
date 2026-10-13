<script>
  // One question at a time.
  // Learn mode (lessons, sphere tests), following the feedback research:
  //   1st wrong: a hint, try again. 2nd wrong: the worked step and the right answer.
  //   "Мэдэхгүй байна": the worked step straight away, plus a link to the lesson underneath.
  //   Only a first-try right answer counts toward "Мэднэ"; wrong answers are amber, never red.
  // Check mode (finding the starting point): one try, no reveal, and "Мэдэхгүй байна" instead of guessing.
  import RichText from './RichText.svelte';

  // questions: [{ q, choices, answer, why, hint?, entry? }]
  // help(q) -> { label, href } | null: where to go when a question shows a gap.
  let { questions, ondone, bar = true, mode = 'learn', help = null } = $props();

  let i = $state(0);
  let tried = $state([]); // wrong choices tapped on this question
  let state = $state('ask'); // ask | hint | right | shown
  let results = $state([]);
  let finished = $state(false);
  let cur = $derived(questions[i]);
  let gap = $derived(state === 'shown' && help ? help(cur) : null);

  const praise = ['Зөв. Сайн бодлоо.', 'Зөв. Аргаа зөв сонгосон байна.', 'Яг зөв.', 'Зөв. Алхам бүрээ сайн шалгажээ.'];

  function pick(k) {
    if (state === 'right' || state === 'shown' || tried.includes(k)) return;
    if (mode === 'check') {
      results.push(k === cur.answer);
      return next();
    }
    const firstTry = tried.length === 0;
    if (k === cur.answer) {
      if (firstTry) results.push(true);
      state = 'right';
    } else {
      tried.push(k);
      if (firstTry) results.push(false);
      state = firstTry && cur.hint ? 'hint' : 'shown';
    }
  }

  function dontKnow() {
    if (tried.length === 0) results.push(false);
    if (mode === 'check') return next();
    state = 'shown';
  }

  function next() {
    if (i === questions.length - 1) {
      finished = true;
      ondone?.(results.filter(Boolean).length / questions.length, results);
    } else {
      i += 1;
      tried = [];
      state = 'ask';
    }
  }

  let done = $derived(state === 'right' || state === 'shown');
</script>

{#if !finished && cur}
  <div class="quiz">
    <div class="top">
      <span class="small muted">{i + 1} / {questions.length}</span>
      {#if bar}<span class="qbar" aria-hidden="true"><span style:transform="scaleX({results.length / questions.length})"></span></span>{/if}
    </div>
    {#key i}
      <div class="body">
        <p class="q"><RichText text={cur.q} /></p>
        <div class="choices">
          {#each cur.choices as c, k}
            <button
              class="choice"
              class:right={done && k === cur.answer}
              class:wrong={tried.includes(k)}
              disabled={done || tried.includes(k)}
              onclick={() => pick(k)}><RichText text={c} /></button>
          {/each}
          {#if !done}
            <button class="choice idk" onclick={dontKnow}>Мэдэхгүй байна</button>
          {/if}
        </div>

        {#if state === 'hint'}
          <div class="fb hint" aria-live="polite">
            <strong>Бараг. Нэг санаа:</strong>
            <p><RichText text={cur.hint} /></p>
            <p class="small muted">Дахин нэг сонгоод үз.</p>
          </div>
        {:else if state === 'right'}
          <div class="fb ok" aria-live="polite">
            <strong>{tried.length ? 'Зөв. Санаагаа ашиглаад оллоо.' : praise[i % praise.length]}</strong>
            <p><RichText text={cur.why} /></p>
          </div>
        {:else if state === 'shown'}
          <div class="fb shown" aria-live="polite">
            <strong>Ингэж бодно:</strong>
            <p><RichText text={cur.why} /></p>
            {#if gap}<a class="gap" href={gap.href}>{gap.label} →</a>{/if}
          </div>
        {/if}

        {#if done}
          <button class="btn primary next" onclick={next}>{results.length === questions.length ? 'Дүнг харах' : 'Дараагийнх'}</button>
        {/if}
      </div>
    {/key}
  </div>
{/if}

<style>
  .quiz { display: grid; gap: 12px; }
  .body { display: grid; gap: 12px; animation: in 0.3s cubic-bezier(0.32, 0.72, 0, 1); }
  @keyframes in { from { opacity: 0; transform: translateX(12px); } }
  .top { display: flex; align-items: center; gap: 12px; }
  .qbar { flex: 1; height: 4px; border-radius: 4px; background: var(--line); overflow: hidden; }
  .qbar span { display: block; height: 100%; background: var(--grass); transform-origin: left; transition: transform 0.4s cubic-bezier(0.32, 0.72, 0, 1); }
  .q { font-size: 1.25rem; font-weight: 700; line-height: 1.4; }
  .choices { display: grid; gap: 8px; }
  .choice {
    min-height: 52px; padding: 8px 16px; text-align: left; border-radius: 14px;
    border: 1.5px solid var(--line); background: var(--surface); font-weight: 600; font-size: 1.05rem;
  }
  /* Hover only with a real mouse: on a phone the tapped spot stays "hovered", which lit up the same spot on the next question. */
  @media (hover: hover) { .choice:not(:disabled):hover { border-color: var(--sky); } }
  .choice.right { border-color: var(--grass); background: var(--grass-soft); }
  /* Wrong is calm amber and simply set aside, not a red alarm. */
  .choice.wrong { border-color: color-mix(in srgb, var(--sun) 55%, transparent); background: transparent; color: var(--muted); text-decoration: line-through; text-decoration-color: color-mix(in srgb, var(--sun) 60%, transparent); }
  .choice:disabled { cursor: default; }
  .choice.idk { border-style: dashed; color: var(--muted); font-weight: 600; font-size: 0.95rem; min-height: 46px; }
  .fb { padding: 14px 16px; border-radius: 14px; display: grid; gap: 4px; animation: in 0.25s ease-out; }
  .fb.hint { background: var(--sun-soft); }
  .fb.hint strong { color: var(--sun); }
  .fb.ok { background: var(--grass-soft); }
  .fb.ok strong { color: var(--grass); }
  .fb.shown { background: var(--sky-soft); }
  .gap { justify-self: start; margin-top: 6px; min-height: 44px; display: inline-flex; align-items: center; color: var(--sky-deep); font-weight: 700; }
  .next { justify-self: start; }
</style>
