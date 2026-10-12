<script>
  // One question at a time. A wrong answer is explained, never just marked.
  import RichText from './RichText.svelte';

  // questions: [{ q, choices, answer, why, mistake?, entry? }]
  let { questions, onmistake, ondone, bar = true } = $props();

  let i = $state(0);
  let picked = $state(null);
  let results = $state([]);
  let finished = $state(false);
  let score = $derived(results.filter(Boolean).length);
  let cur = $derived(questions[i]);

  const praise = ['Зөв. Сайн бодлоо.', 'Зөв. Аргаа зөв сонгосон байна.', 'Яг зөв.', 'Зөв. Алхам бүрээ сайн шалгажээ.'];

  function pick(k) {
    if (picked !== null) return;
    picked = k;
    results.push(k === cur.answer);
  }
  function next() {
    if (results.length === questions.length) {
      finished = true;
      ondone?.(score / questions.length, results);
    } else {
      i += 1;
      picked = null;
    }
  }
</script>

{#if !finished && cur}
    <div class="quiz">
      <div class="top">
        <span class="small muted">{i + 1} / {questions.length}</span>
        {#if bar}<span class="qbar" aria-hidden="true"><span style:transform="scaleX({results.length / questions.length})"></span></span>{/if}
      </div>
      <p class="q"><RichText text={cur.q} /></p>
      <div class="choices">
        {#each cur.choices as c, k}
          <button
            class="choice"
            class:right={picked !== null && k === cur.answer}
            class:wrong={picked === k && k !== cur.answer}
            disabled={picked !== null}
            onclick={() => pick(k)}><RichText text={c} /></button>
        {/each}
      </div>

      {#if picked !== null}
        <div class="fb" class:ok={picked === cur.answer} aria-live="polite">
          <strong>{picked === cur.answer ? praise[i % praise.length] : 'Бараг л болсон. Ингэж бодъё:'}</strong>
          <p><RichText text={cur.why} /></p>
          {#if picked !== cur.answer && cur.mistake && onmistake}
            <button class="btn ghost" onclick={() => onmistake(cur)}>Энэ нийтлэг алдааг харах →</button>
          {/if}
        </div>
        <button class="btn primary next" onclick={next}>{results.length === questions.length ? 'Дүнг харах' : 'Дараагийнх'}</button>
      {/if}
    </div>
{/if}

<style>
  .quiz { display: grid; gap: 12px; }
  .top { display: flex; align-items: center; gap: 12px; }
  .qbar { flex: 1; height: 4px; border-radius: 4px; background: var(--line); overflow: hidden; }
  .qbar span { display: block; height: 100%; background: var(--grass); transform-origin: left; transition: transform 0.4s cubic-bezier(0.32, 0.72, 0, 1); }
  .q { font-size: 1.25rem; font-weight: 700; line-height: 1.4; }
  .choices { display: grid; gap: 8px; }
  .choice {
    min-height: 48px; padding: 8px 16px; text-align: left; border-radius: 12px;
    border: 1.5px solid var(--line); background: var(--surface); font-weight: 600; font-size: 1.05rem;
  }
  .choice:not(:disabled):hover { border-color: var(--sky); }
  .choice.right { border-color: var(--grass); background: var(--grass-soft); }
  .choice.wrong { border-color: var(--warn); background: var(--warn-soft); }
  .choice:disabled { cursor: default; }
  .fb { padding: 12px 14px; border-radius: 12px; background: var(--sun-soft); display: grid; gap: 4px; }
  .fb.ok { background: var(--grass-soft); }
  .next { justify-self: start; }
</style>
