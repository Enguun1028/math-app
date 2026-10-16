<script>
  // Answer page for one idea (Wolfram-style): how your input was read, what it is, where it comes from,
  // how to prove it, where it is used, what comes next, and other readings of the same formula.
  import VideoSlot from './VideoSlot.svelte';
  import { ideas, rootPath } from '../lib/ideas.js';
  import { entries, sphereById } from '../lib/content.js';
  import { sphereLayout } from '../lib/layout.js';
  import { entryState, topicState } from '../lib/logic.js';
  import { formatMath } from '../lib/mathfmt.js';
  import { ui } from '../lib/ui.svelte.js';
  import { go } from '../lib/router.svelte.js';
  import RichText from './RichText.svelte';

  let { id } = $props();
  let i = $derived(ideas[id]);
  let path = $derived(i ? rootPath(id) : []);
  let others = $derived(i ? i.from.filter((f) => f !== path.at(-2) && ideas[f]) : []);
  let color = $derived(i?.sphere ? sphereLayout[i.sphere]?.color : 'var(--sky)');
  let alts = $derived((ui.alts ?? []).filter((a) => a !== id && ideas[a]));
  let st = $derived(i?.topic ? topicState(i.topic) : null);

  // Real-life uses from the research fan-out (draft), the same small file the topic card fetches.
  let rw = $state([]);
  $effect(() => {
    const tid = i?.topic ?? i?.from?.[0];
    rw = [];
    if (!tid || i?.uses?.length) return;
    let live = true;
    fetch(`extras/${tid}.json`).then((r) => (r.ok ? r.json() : null)).then((d) => { if (live && i?.topic) rw = d?.rw ?? []; }).catch(() => {});
    return () => { live = false; };
  });
  let steps = $state(0);
  $effect(() => { id; steps = 0; });
  let ex = $derived(i?.example && typeof i.example === 'object' ? i.example : null);
  let shown = $derived(i ? i.shown.filter((f) => f !== i.formula) : []);

  function showOnMap() {
    ui.fly = i.topic ? { topic: i.topic } : { sphere: i.sphere };
    ui.topic = i.topic;
    go('/');
  }
</script>

{#if !i}
  <p class="card">Ийм ойлголт олдсонгүй.</p>
{:else}
  <article class="idea" style:--c={color}>
    {#if ui.typed}<p class="interp small muted">Таны бичсэн: <span class="m">{@html formatMath(ui.typed)}</span></p>{/if}

    <header class="hero">
      <span class="eyebrow">{ui.typed ? 'Энэ бол' : (i.sphere ? sphereById[i.sphere]?.title : 'Ойлголт')}</span>
      <h1>{i.name}</h1>
      {#if i.formula}<p class="eq"><RichText text={i.formula} /></p>{/if}
      {#if i.en}<span class="en small muted">{i.en}</span>{/if}
      <p class="def"><RichText text={i.def ?? ''} /></p>
      {#if i.src}<span class="small muted">Эх сурвалж: {i.src}{i.topic ? ' (БСШУЯ, econtent.edu.mn)' : ''}</span>{/if}
      {#if i.draft}<span class="draft">ноорог</span>{/if}
      {#if st === 'known' || st === 'faded'}<span class="badge known">✓ Мэднэ</span>{/if}
    </header>
    <VideoSlot key={i.topic ? 'topic:' + i.topic : 'idea:' + i.id} title={i.name} />

    {#if shown.length || i.rules.length}
      <section class="blk">
        <h2>Томьёо ба дүрэм</h2>
        {#each shown as f}<p class="fx"><RichText text={f} /></p>{/each}
        {#if i.rules.length}<ul class="uses">{#each i.rules.slice(0, 4) as r}<li><RichText text={r} /></li>{/each}</ul>{/if}
      </section>
    {/if}

    {#if ex}
      <section class="blk ex">
        <h2>Жишээ</h2>
        <p><RichText text={ex.q} /></p>
        {#if steps}<ol class="proof">{#each ex.steps.slice(0, steps) as s}<li><RichText text={s} /></li>{/each}</ol>{/if}
        {#if steps < ex.steps.length}
          <button class="obtn" onclick={() => (steps += 1)}>{steps ? 'Дараагийн алхам →' : 'Бодож үзэх →'}</button>
        {:else}
          <p>Хариу: <strong><RichText text={ex.a} /></strong></p>
        {/if}
      </section>
    {:else if i.example}
      <section class="blk ex"><h2>Жишээ</h2><p><RichText text={i.example} /></p></section>
    {/if}

    {#if path.length > 1}
      <section>
        <h2>Хаанаас ирсэн</h2>
        <div class="path">
          {#each path as p, k}
            {#if k}<span class="arrow" aria-hidden="true">→</span>{/if}
            {#if p === id}<span class="here">{ideas[p].name}</span>{:else}<a class="step" href="#/c/{p}">{ideas[p].name}</a>{/if}
          {/each}
        </div>
        {#if others.length}
          <p class="small muted also">Бас хэрэгтэй:
            {#each others as o, k}{k ? ', ' : ' '}<a href="#/c/{o}">{ideas[o].name}</a>{/each}
          </p>
        {/if}
      </section>
    {/if}

    {#if i.proof?.length}
      <details class="blk">
        <summary><h2>{i.proofTitle ?? 'Яагаад үнэн бэ'}</h2><span class="small muted">{i.proof.length} алхам · ноорог</span></summary>
        <ol class="proof">{#each i.proof as s}<li><RichText text={s} /></li>{/each}</ol>
      </details>
    {/if}

    {#if i.history}
      <section class="blk hist">
        <h2>Хаанаас гаралтай вэ <span class="draft">ноорог</span></h2>
        <p><RichText text={i.history.text} /></p>
        {#if i.history.src}<a class="src small" href={i.history.src} target="_blank" rel="noopener noreferrer">Эх сурвалж ↗</a>{/if}
      </section>
    {/if}

    {#if i.uses?.length || rw.length}
      <section class="blk">
        <h2>Хаана хэрэглэх вэ <span class="draft">ноорог</span></h2>
        {#if i.uses?.length}<ul class="uses">{#each i.uses as u}<li><RichText text={u} /></li>{/each}</ul>{/if}
        {#each rw as u}<div class="rwc"><strong>{u.title}</strong><p><RichText text={u.text} /></p></div>{/each}
      </section>
    {/if}

    {#if i.lessons.length}
      <section>
        <h2>Хичээлүүд</h2>
        <div class="chips">
          {#each i.lessons as l}<a class="chip {entryState(l)}" href="#/e/{l}"><span class="dot"></span>{entries[l].title}</a>{/each}
        </div>
      </section>
    {/if}

    {#if i.next.length}
      <section>
        <h2>Дараагийн алхам</h2>
        <div class="chips">{#each i.next as n}<a class="chip" href="#/c/{n}">{ideas[n].name} →</a>{/each}</div>
      </section>
    {/if}

    {#if alts.length}
      <section class="alt">
        {#each alts as a}<a href="#/c/{a}">Эсвэл: <strong>{ideas[a].name}</strong> <span class="m"><RichText text={ideas[a].formula ?? ''} /></span></a>{/each}
      </section>
    {/if}

    <div class="row">
      {#if i.lessons.length}<a class="btn sun" href="#/e/{i.lessons.find((l) => entryState(l) !== 'known') ?? i.lessons[0]}">Сурах цаг!</a>{/if}
      {#if i.topic}<button class="btn sun" onclick={() => (ui.topic = i.topic)}>Сэдвийг бүтэн нээх</button>
      {:else if i.from[0] && ideas[i.from[0]]?.topic}<button class="btn ghost" onclick={() => (ui.topic = i.from[0])}>{ideas[i.from[0]].name} сэдэв</button>{/if}
      <button class="link" onclick={showOnMap}>Газрын зураг дээр харах →</button>
    </div>
  </article>
{/if}

<style>
  .idea { display: grid; gap: 26px; padding-top: 12px; }
  .interp { margin-bottom: -14px; }
  .m { font-family: var(--math); font-size: 1.1em; color: var(--ink); }
  .hero {
    display: grid; gap: 8px; justify-items: start; padding: 18px; border-radius: 22px;
    background: linear-gradient(160deg, color-mix(in srgb, var(--c) 22%, transparent), rgba(10, 14, 24, 0.6));
    border: 1px solid color-mix(in srgb, var(--c) 50%, transparent);
  }
  .eyebrow { font-size: 0.85rem; font-weight: 800; color: var(--c); }
  .eq { font: 1.8rem var(--math); line-height: 1.3; }
  .def { color: var(--ink); text-wrap: pretty; }
  section, .blk { display: grid; gap: 10px; }
  .blk { padding: 16px; border-radius: 18px; background: var(--surface); border: 1px solid var(--line); }
  .ex { background: var(--grass-soft); border-color: transparent; }
  .path { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; }
  .step, .here { display: inline-flex; align-items: center; min-height: 40px; padding: 0 14px; border-radius: 999px; font-weight: 700; font-size: 0.92rem; text-decoration: none; }
  .step { color: var(--ink); border: 1px solid var(--line); }
  .here { background: var(--c); color: #0a0d16; }
  .arrow { color: var(--muted); }
  .also a { color: var(--sky-deep); font-weight: 700; }
  details summary { display: flex; align-items: baseline; justify-content: space-between; cursor: pointer; list-style: none; min-height: 32px; }
  details summary::-webkit-details-marker { display: none; }
  details summary h2::after { content: ' ›'; color: var(--sky); }
  details[open] summary h2::after { content: ' ⌄'; }
  .proof { margin: 6px 0 0; padding-left: 22px; display: grid; gap: 10px; }
  .en { margin-top: -6px; }
  .fx { font: 1.15rem var(--math); line-height: 1.5; }
  .obtn { justify-self: start; min-height: 40px; padding: 0 14px; border-radius: 12px; border: 1px solid var(--line); background: none; color: var(--sky); font-weight: 700; }
  .draft { font-size: 0.7rem; font-weight: 700; padding: 2px 8px; border-radius: 999px; border: 1px dashed var(--muted); color: var(--muted); vertical-align: middle; }
  .src { color: var(--sky); justify-self: start; }
  .rwc { display: grid; gap: 4px; padding-top: 6px; border-top: 1px solid var(--line); }
  .rwc p { margin: 0; }
  .uses { margin: 0; padding-left: 20px; display: grid; gap: 6px; }
  .chips a { text-decoration: none; color: var(--ink); }
  .alt { gap: 8px; }
  .alt a { padding: 12px 14px; border-radius: 16px; border: 1px dashed color-mix(in srgb, var(--sun) 60%, transparent); color: var(--ink); text-decoration: none; }
  .alt strong { color: var(--sun); }
  .row { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; }
  .row a { text-decoration: none; }
  .link { min-height: 44px; border: 0; background: none; padding: 0 8px; color: var(--sky); font-weight: 700; }
</style>
