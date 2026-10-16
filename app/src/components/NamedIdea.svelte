<script>
  // A named formula or smaller idea opened in place on its topic card (owner, 2026-10-16): search for Виет lands on
  // «Квадрат тэгшитгэл» with this block open, so there is one place per topic instead of a separate answer page.
  // Same parts the answer page had: formula, definition, more formulas and rules, example, why it is true, practice.
  import RichText from './RichText.svelte';
  import Quiz from './Quiz.svelte';
  import practiceNamed from '../../content/practice-named.json';
  import { ideas } from '../lib/ideas.js';

  let { id } = $props();
  let i = $derived(ideas[id]);
  let shown = $derived(i.shown.filter((f) => f !== i.formula));
  let ex = $derived(i.example && typeof i.example === 'object' ? i.example : null);
  let qs = $derived(practiceNamed[id] ?? []);
  let steps = $state(0);
  let practice = $state('off'); // off | on | done
  let score = $state(0);
  let round = $state(0);
</script>

<div class="ni">
  {#if i.formula}<p class="eq"><RichText text={i.formula} /></p>{/if}
  {#if i.def}<p><RichText text={i.def} /></p>{/if}
  {#if i.src || i.draft}<span class="small muted">{#if i.src}Эх сурвалж: {i.src}{/if}{#if i.draft}<span class="draft">ноорог</span>{/if}</span>{/if}

  {#if shown.length || i.rules.length}
    <div class="part">
      <h4>Томьёо ба дүрэм</h4>
      {#each shown as f}<p class="fx"><RichText text={f} /></p>{/each}
      {#if i.rules.length}<ul>{#each i.rules.slice(0, 4) as r}<li><RichText text={r} /></li>{/each}</ul>{/if}
    </div>
  {/if}

  {#if ex}
    <div class="part">
      <h4>Жишээ</h4>
      <p class="q"><RichText text={ex.q} /></p>
      {#if steps}<ol>{#each ex.steps.slice(0, steps) as s}<li><RichText text={s} /></li>{/each}</ol>{/if}
      {#if steps < ex.steps.length}
        <button class="obtn" onclick={() => (steps += 1)}>{steps ? 'Дараагийн алхам →' : 'Бодож үзэх →'}</button>
      {:else}
        <p class="ans">Хариу: <strong><RichText text={ex.a} /></strong></p>
      {/if}
    </div>
  {:else if i.example}
    <div class="part"><h4>Жишээ</h4><p><RichText text={i.example} /></p></div>
  {/if}

  {#if i.proof?.length}
    <details class="part">
      <summary><h4>{i.proofTitle ?? 'Яагаад үнэн бэ'}</h4><span class="small muted">{i.proof.length} алхам · ноорог</span></summary>
      <ol>{#each i.proof as s}<li><RichText text={s} /></li>{/each}</ol>
    </details>
  {/if}

  {#if qs.length}
    <div class="part">
      <h4>Дасгал <span class="draft">ноорог</span></h4>
      {#if practice === 'off'}
        <p class="small muted">{qs.length} бодлого · хялбараас хүнд рүү.</p>
        <button class="obtn" onclick={() => (practice = 'on')}>Эхлэх →</button>
      {:else if practice === 'on'}
        {#key round}<Quiz questions={qs} ondone={(s) => { score = s; practice = 'done'; }} />{/key}
      {:else}
        <p>Та эхний оролдлогоор {Math.round(score * qs.length)} / {qs.length} бодлогыг зөв бодлоо.</p>
        <button class="obtn" onclick={() => { round += 1; practice = 'on'; }}>Дахин ажиллах</button>
      {/if}
    </div>
  {/if}
</div>

<style>
  .ni { display: grid; gap: 10px; padding-top: 4px; }
  .ni p { margin: 0; }
  .eq { font: 1.3rem var(--math); line-height: 1.4; color: var(--ink); overflow-x: auto; }
  .part { display: grid; gap: 8px; padding-top: 10px; border-top: 1px solid var(--line); }
  h4 { margin: 0; font-size: 0.78rem; letter-spacing: 0.08em; text-transform: uppercase; color: var(--muted); }
  details summary { list-style: none; display: flex; justify-content: space-between; align-items: center; gap: 8px; cursor: pointer; }
  details summary::-webkit-details-marker { display: none; }
  .fx { font: 1.1rem var(--math); line-height: 1.5; }
  ul, ol { margin: 0; padding-left: 20px; display: grid; gap: 6px; }
  .q { font-weight: 700; }
  .ans { color: var(--grass); }
  .obtn { justify-self: start; min-height: 40px; padding: 0 14px; border-radius: 999px; border: 1px solid var(--sky); background: transparent; color: var(--sky); font-weight: 800; }
  .draft { margin-left: 6px; padding: 1px 7px; border-radius: 999px; border: 1px dashed var(--muted); color: var(--muted); font-size: 0.65rem; text-transform: none; letter-spacing: 0.04em; }
</style>
