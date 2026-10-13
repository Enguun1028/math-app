<script>
  import RichText from './RichText.svelte';
  // Concept card: the grades that teach it, what it needs and opens (with the reason for each link),
  // its other links, and the dictionary entries inside it.
  // Grade 1–4 basics are read-only: no lesson, no step; the student reads them when they feel a gap, then goes back.
  import { topics, topicUnlocks, topicEntries, entries, strands, links, whyOf } from '../lib/content.js';
  import { topicState, entryState, markTopic } from '../lib/logic.js';
  import { ui } from '../lib/ui.svelte.js';
  import { go, route } from '../lib/router.svelte.js';
  import { fly, fade } from 'svelte/transition';
  import { sheetIn, sheetOut, scrimFade, ms } from '../lib/motion.js';

  // The last topic stays on the card while it slides away.
  let isOpen = $derived(!!(ui.topic && topics[ui.topic]));
  let lastT;
  let t = $derived(isOpen ? (lastT = topics[ui.topic]) : lastT);
  let st = $derived(t && topicState(t.id));
  let known = $derived(st === 'known' || st === 'faded');
  let es = $derived(t ? topicEntries[t.id] : []);
  let firstOpen = $derived(es.find((id) => entryState(id) !== 'known') ?? es[0]);
  // Other kinds of links, worded from this concept's side.
  const REL = {
    special_case: ['нь онцгой тохиолдол', 'онцгой тохиолдол нь'],
    generalizes: ['ерөнхийлнө', 'ерөнхийлөл нь'],
    representation: ['өөр дүрслэл', 'өөр дүрслэл'],
    application: ['хэрэглэгдэнэ', 'хэрэглэдэг'],
    analogy: ['төстэй', 'төстэй'],
  };
  let related = $derived(t ? links.filter((e) => e.type !== 'prerequisite' && (e.from === t.id || e.to === t.id)) : []);
  let onSphere = $derived(route.parts[0] === 's' ? route.parts[1] : null);
  const close = () => (ui.topic = null);
  const open = (path) => { close(); go(path); };
  const toTopic = (id) => (ui.topic = id);
  const gradeOf = (x) => (x.base ? '1–4' : x.grades[0]);
</script>

<svelte:window onkeydown={(ev) => ev.key === 'Escape' && close()} />

{#if isOpen}
  <div class="scrim" onclick={close} role="presentation" transition:fade={scrimFade}></div>
  <div class="sheet" role="dialog" aria-label={t.name} style:--c={strands[t.strand].color} in:fly={sheetIn} out:fly={sheetOut}>
    <div class="grab"></div>
    {#key t.id}
    <div class="body" in:fade={{ duration: ms(220) }}>
    <div class="head">
      <span class="f" class:base={t.base}>{#if t.formula}<RichText text={t.formula} />{:else}<i class="sd"></i>{/if}</span>
      <div>
        <p class="small muted">{t.base ? '1–4-р ангийн суурь' : t.grades.join(', ') + '-р анги'} · {strands[t.strand].name}</p>
        <h2>{t.name}</h2>
        {#if st === 'next'}<span class="badge next">Дараагийн алхам</span>{/if}
      </div>
      <!-- Owner, 2026-10-12: every topic gets a "Мэднэ" check at the top right that can be ticked and unticked. -->
      <button class="know" class:on={known} aria-pressed={known} onclick={() => markTopic(t.id, !known)}>
        <span class="box">{#if known}✓{/if}</span>Мэднэ
      </button>
    </div>

    {#if t.base}
      <p class="ro small">Суурь ойлголт: уншаад буцаж болно. Хичээл, шалгалт байхгүй.</p>
    {/if}
    {#if t.text}<p>{t.text}</p>{/if}

    <div class="row">
      {#if es.length && !t.base}
        <button class="btn sun" onclick={() => open('/e/' + firstOpen)}>Сурах цаг!</button>
      {/if}
      {#if t.sphere && onSphere !== t.sphere}
        <button class="link" onclick={() => open('/s/' + t.sphere)}>{t.grades[0]}-р ангийн зураг →</button>
      {/if}
      {#if route.parts[0] !== 'm'}
        <button class="link" onclick={() => go('/m')}>Математикийн зураг дээр →</button>
      {/if}
    </div>

    {#if t.grades.length > 1}
      <div class="grp">
        <h3>Аль ангид үзэх вэ</h3>
        <div class="chips">
          {#each t.grades as g, i}<a class="chip" class:on={onSphere === 'g' + g} href="#/s/g{g}" onclick={close}>{g}-р анги{i ? ' ↑' : ''}</a>{/each}
        </div>
      </div>
    {/if}

    {#if t.req.length}
      <div class="grp">
        <h3>Өмнө нь хэрэгтэй</h3>
        <div class="links">
          {#each t.req as r}
            <button class="lk {topicState(r)}" class:base={topics[r].base} onclick={() => toTopic(r)}>
              <span class="dot"></span><span class="nm">{topics[r].name}</span><span class="g">{gradeOf(topics[r])}</span>
              {#if whyOf(r, t.id)}<span class="why">{whyOf(r, t.id)}</span>{/if}
            </button>
          {/each}
        </div>
      </div>
    {/if}
    {#if topicUnlocks[t.id].length}
      <div class="grp">
        <h3>Дараа нь нээгдэнэ</h3>
        <div class="links">
          {#each topicUnlocks[t.id] as u}
            <button class="lk {topicState(u)}" onclick={() => toTopic(u)}>
              <span class="dot"></span><span class="nm">{topics[u].name}</span><span class="g">{gradeOf(topics[u])}</span>
              {#if whyOf(t.id, u)}<span class="why">{whyOf(t.id, u)}</span>{/if}
            </button>
          {/each}
        </div>
      </div>
    {/if}
    {#if related.length}
      <div class="grp">
        <h3>Холбоотой</h3>
        <div class="links">
          {#each related as e}
            {@const other = e.from === t.id ? e.to : e.from}
            <button class="lk {topicState(other)}" onclick={() => toTopic(other)}>
              <span class="dot"></span><span class="nm"><em>{REL[e.type][e.from === t.id ? 0 : 1]}:</em> {topics[other].name}</span><span class="g">{gradeOf(topics[other])}</span>
              {#if e.why}<span class="why">{e.why}</span>{/if}
            </button>
          {/each}
        </div>
      </div>
    {/if}

    {#if es.length}
      <div class="grp">
        <h3>Толь бичиг</h3>
        <div class="entries">
          {#each es as id}
            <button class="entry {entryState(id)}" onclick={() => open('/e/' + id)}>
              <span class="sym">{entries[id].symbol ?? '·'}</span>{entries[id].title}
              {#if entryState(id) === 'known'}<span class="ok">✓</span>{/if}
            </button>
          {/each}
        </div>
      </div>
    {:else}
      <p class="small muted">{t.base ? 'Энгийн тайлбар, богино анимейшн удахгүй нэмэгдэнэ.' : 'Энэ сэдвийн бүрэн тайлбар, тест удахгүй нэмэгдэнэ.'}</p>
    {/if}

    </div>
    {/key}
  </div>
{/if}

<style>
  .sheet { box-shadow: 0 -12px 40px rgba(0, 0, 0, 0.6), 0 -1px 0 color-mix(in srgb, var(--c) 50%, transparent); }
  .body { display: grid; gap: 12px; }
  .body { min-width: 0; }
  /* Room on the right for the "Мэднэ" check, which sits in the sheet's top-right corner. */
  .head { display: flex; gap: 14px; align-items: center; padding-right: 104px; min-width: 0; }
  .head > div { display: grid; gap: 4px; justify-items: start; flex: 1; min-width: 0; }
  h3 { font-size: 0.95rem; font-weight: 700; color: var(--muted); margin-bottom: 8px; }
  .f {
    min-width: 64px; max-width: 45%; height: 64px; padding: 0 10px; flex: none; display: grid; place-items: center; border-radius: 32px;
    font-family: var(--math); font-size: 0.95rem; color: #fff; white-space: nowrap; overflow: hidden;
    background: radial-gradient(circle at 40% 35%, color-mix(in srgb, var(--c) 55%, transparent), color-mix(in srgb, var(--c) 10%, transparent));
    border: 1.5px solid var(--c); box-shadow: 0 0 20px color-mix(in srgb, var(--c) 45%, transparent);
  }
  .f.base { border-style: dashed; box-shadow: none; background: transparent; }
  .sd { width: 16px; height: 16px; border-radius: 50%; background: var(--c); box-shadow: 0 0 12px var(--c); }
  .know {
    position: absolute; top: 14px; right: 14px; display: inline-flex; align-items: center; gap: 6px; min-height: 44px; padding: 0 12px 0 8px;
    border-radius: 999px; border: 1px solid var(--line); background: transparent; color: var(--muted); font-weight: 700;
  }
  .know .box { width: 22px; height: 22px; border-radius: 7px; border: 2px solid currentColor; display: grid; place-items: center; font-size: 0.85rem; font-weight: 900; }
  .know.on { color: var(--grass); border-color: color-mix(in srgb, var(--grass) 55%, transparent); background: var(--grass-soft); }
  .know.on .box { background: var(--grass); border-color: var(--grass); color: #04140a; }
  .ro { padding: 8px 12px; border-radius: 12px; border: 1px dashed var(--line); color: var(--muted); }
  .links { display: grid; gap: 6px; }
  .lk {
    display: grid; grid-template-columns: auto 1fr auto; align-items: center; gap: 2px 8px; padding: 8px 10px;
    border-radius: 12px; border: 1px solid var(--line); background: transparent; color: var(--ink); text-align: left; font-weight: 600;
  }
  .lk.base { border-style: dashed; }
  .lk .dot { width: 8px; height: 8px; border-radius: 50%; background: var(--line); }
  .lk.known .dot { background: var(--grass); }
  .lk.next .dot { background: var(--sun); }
  .lk .g { font-size: 0.75rem; color: var(--muted); font-family: var(--math); }
  .lk .why { grid-column: 2 / -1; font-size: 0.8rem; font-weight: 400; color: var(--muted); }
  .lk em { font-style: normal; color: var(--muted); font-weight: 500; }
  .lk:hover { border-color: var(--sky); }
  .entries { display: grid; gap: 6px; }
  .entry { display: flex; align-items: center; gap: 10px; padding: 8px 10px; border-radius: 12px; border: 1px solid var(--line); background: transparent; text-align: left; font-weight: 600; }
  .entry:hover { border-color: var(--sky); }
  .sym { min-width: 30px; height: 30px; display: grid; place-items: center; border-radius: 8px; background: var(--sky-soft); color: var(--sky); font-family: var(--math); }
  .ok { margin-left: auto; color: var(--grass); }
  .row { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
  .row .btn { min-height: 48px; padding: 0 22px; }
  .link { min-height: 44px; border: 0; background: none; padding: 0 8px; color: var(--sky); font-weight: 700; }
  .chips .chip { color: var(--ink); background: transparent; }
  .chips .chip.on { background: var(--sky); color: var(--on-sky); }
  .grp { padding-top: 4px; }
</style>
