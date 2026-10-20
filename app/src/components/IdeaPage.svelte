<script>
  // Answer page for one idea (Wolfram-style): how your input was read, what it is, where it comes from,
  // how to prove it, where it is used, what comes next, and other readings of the same formula.
  import VideoSlot from './VideoSlot.svelte';
  import FormulaTree from './FormulaTree.svelte';
  import videos from '../../content/videos.json';
  // Practice for named formulas (draft, 2026-10-16); topics have theirs on the topic card.
  import practiceNamed from '../../content/practice-named.json';
  import Quiz from './Quiz.svelte';
  import { ideas, placeOf, gradeLabel, familyOf } from '../lib/ideas.js';
  import { entries, strands, topics } from '../lib/content.js';
  import { sphereLayout } from '../lib/layout.js';
  import { entryState, topicState } from '../lib/logic.js';
  import { formatMath } from '../lib/mathfmt.js';
  import { ui } from '../lib/ui.svelte.js';
  import { go, replace } from '../lib/router.svelte.js';
  import RichText from './RichText.svelte';

  let { id } = $props();
  let i = $derived(ideas[id]);
  let color = $derived(i?.sphere ? sphereLayout[i.sphere]?.color : 'var(--sky)');
  let alts = $derived((ui.alts ?? []).filter((a) => a !== id && ideas[a]));
  let st = $derived(i?.topic ? topicState(i.topic) : null);
  // Which grade and strand this is, so the student sees the level of the idea at once (owner, 2026-10-16).
  let place = $derived(i ? placeOf(id) : null);
  let fam = $derived(place && familyOf(place.topic));
  // A tap in the tree opens that formula in place of this one, then the page lands on its details.
  // The page remounts on every route, so the "land on details" wish rides on ui.
  let details;
  function pick(x) { ui.land = x; replace('/c/' + x); }
  $effect(() => {
    // Only the page of the tapped formula takes it (the leaving page is still mounted for a moment).
    if (ui.land !== id || !details) return;
    ui.land = null;
    // Waits for the page change motion to end (html.moving locks scrolling), then glides to the details.
    let n = 0, tm;
    const go = () => {
      if (document.documentElement.classList.contains('moving') && n++ < 30) { tm = setTimeout(go, 60); return; }
      scrollTo({ top: details.getBoundingClientRect().top + scrollY - 70, behavior: 'smooth' });
    };
    // No cleanup: clearing ui.land re-runs this effect, which must not cancel the glide.
    tm = setTimeout(go, 60);
  });
  // A named formula without its own video shows the video of the topic it grows out of (not a grade 1–4 basics video,
  // which would be too far off, e.g. place value for binary numbers).
  let vkey = $derived(!i ? '' : i.topic ? 'topic:' + i.topic : videos['idea:' + i.id] ? 'idea:' + i.id : i.from[0] && !i.from[0].startsWith('b-') ? 'topic:' + i.from[0] : 'idea:' + i.id);

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
  let qs = $derived(i && !i.topic ? practiceNamed[i.id] ?? [] : []);
  let practice = $state('off'); // off | on | done
  let score = $state(0);
  let round = $state(0);
  $effect(() => { id; steps = 0; practice = 'off'; });
  let ex = $derived(i?.example && typeof i.example === 'object' ? i.example : null);
  let shown = $derived(i ? i.shown.filter((f) => f !== i.formula) : []);

  function showOnMap() {
    // A named formula is not on the map itself: fly to the topic it grows out of.
    const tid = i.topic ?? place?.topic;
    ui.fly = tid ? { topic: tid } : { sphere: i.sphere };
    ui.topic = tid ?? null;
    ui.focus = i.topic ? null : i.id;
    go('/');
  }
</script>

{#if !i}
  <p class="card">Ийм ойлголт олдсонгүй.</p>
{:else}
  <article class="idea" style:--c={color}>
    {#if ui.typed}<p class="interp small muted">Таны бичсэн: <span class="m">{@html formatMath(ui.typed)}</span></p>{/if}

    <header class="hero">
      {#if ui.typed}<span class="eyebrow">Энэ бол</span>{/if}
      <h1>{i.name}</h1>
      {#if i.formula}<p class="eq"><RichText text={i.formula} /></p>{/if}
      {#if i.en}<span class="en small muted">{i.en}</span>{/if}
      <p class="def"><RichText text={i.def ?? ''} /></p>
      {#if i.src}<span class="small muted">Эх сурвалж: {i.src}{i.topic ? ' (БСШУЯ, econtent.edu.mn)' : ''}</span>{/if}
      {#if i.draft}<span class="draft">ноорог</span>{/if}
      {#if st === 'known' || st === 'faded'}<span class="badge known">✓ Мэднэ</span>{/if}
    </header>
    <!-- Where it lives (owner, 2026-10-16): grade › strand › topic in one bar. Grade opens that grade's map, the strand
         flies the map to the topic, the topic opens its card on this formula. Replaces the grade box, «Хаанаас ирсэн»
         and the bottom buttons. -->
    {#if place}
      <nav class="place" aria-label="Хөтөлбөрт байрлал">
        <button class="crumb g" onclick={() => (topics[place.topic].sphere ? go('/s/' + topics[place.topic].sphere) : showOnMap())}>{gradeLabel(place)}</button><span class="sep">›</span>
        <button class="crumb s" style:color={strands[place.strand].color} onclick={showOnMap}>{strands[place.strand].name}</button><span class="sep">›</span>
        <button class="crumb t" onclick={() => { ui.focus = place.own ? null : id; ui.topic = place.topic; }}>{topics[place.topic].name}</button>
      </nav>
      {#if place.grades.length > 1}<p class="again small muted">{place.grades.slice(1).join(', ')}-р ангид дахин, гүнзгий үзнэ.</p>{/if}
    {/if}

    <!-- The topic's whole formula family at once; a tap opens that formula here (Back skips the formulas in between). -->
    {#if fam}
      <section class="blk fam">
        <h2>Энэ сэдвийн бүх томьёо <span class="draft">ноорог</span></h2>
        <FormulaTree topic={place.topic} current={place.own ? 'root' : id} onpick={(x) => (x === 'root' ? (ui.topic = place.topic) : x !== id && pick(x))} />
        <p class="small muted">Шугам: доод томьёо нь дээд томьёоноос гарна.</p>
      </section>
    {/if}
    <div class="details" bind:this={details}></div>

    <VideoSlot key={vkey} title={i.name} />

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

    {#if i.proof?.length}
      <details class="blk">
        <summary><h2>{i.proofTitle ?? 'Яагаад үнэн бэ'}</h2><span class="small muted">{i.proof.length} алхам · ноорог</span></summary>
        <ol class="proof">{#each i.proof as s}<li><RichText text={s} /></li>{/each}</ol>
      </details>
    {/if}

    {#if qs.length}
      <section class="blk">
        <h2>Дасгал <span class="draft">ноорог</span></h2>
        {#if practice === 'off'}
          <p class="small muted">{qs.length} бодлого · хялбараас хүнд рүү.</p>
          <button class="obtn" onclick={() => (practice = 'on')}>Эхлэх →</button>
        {:else if practice === 'on'}
          {#key round}<Quiz questions={qs} ondone={(s) => { score = s; practice = 'done'; }} />{/key}
        {:else}
          <p>Та эхний оролдлогоор {Math.round(score * qs.length)} / {qs.length} бодлогыг зөв бодлоо.</p>
          <button class="obtn" onclick={() => { round += 1; practice = 'on'; }}>Дахин ажиллах</button>
        {/if}
      </section>
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

  </article>
{/if}

<style>
  .idea { display: grid; gap: 26px; padding-top: 12px; }
  .interp { margin-bottom: -14px; }
  .m { font-family: var(--math); font-size: 1.1em; color: var(--ink); }
  .hero {
    display: grid; gap: 8px; justify-items: start; padding: 18px; border-radius: 22px;
    background: linear-gradient(160deg, color-mix(in srgb, var(--c) 22%, transparent), rgba(12, 15, 21, 0.6));
    border: 1px solid color-mix(in srgb, var(--c) 50%, transparent);
  }
  /* Place bar: grade › strand › topic. */
  .place { display: flex; flex-wrap: wrap; align-items: center; gap: 4px; margin-top: -14px; }
  .crumb { min-height: 36px; padding: 0 12px; border-radius: 999px; border: 1px solid var(--line); background: var(--surface-solid); color: var(--ink); font: inherit; font-size: 0.85rem; font-weight: 700; }
  .crumb.g { background: var(--sun); border-color: var(--sun); color: #1a1300; }
  .crumb.t { color: var(--sky); }
  .sep { color: var(--muted); font-weight: 700; }
  .again { margin: -20px 0 0; }
  .fam { gap: 12px; }
  .details { height: 0; margin-top: -26px; }
  .eyebrow { font-size: 0.85rem; font-weight: 800; color: var(--c); }
  /* Curriculum place: grade badge, strand, parent topic. */
  .eq { font: 1.8rem var(--math); line-height: 1.3; }
  .def { color: var(--ink); text-wrap: pretty; }
  section, .blk { display: grid; gap: 10px; }
  .blk { padding: 16px; border-radius: 18px; background: var(--surface); border: 1px solid var(--line); }
  .ex { background: var(--grass-soft); border-color: transparent; }
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
  .link { min-height: 44px; border: 0; background: none; padding: 0 8px; color: var(--sky); font-weight: 700; }
</style>
