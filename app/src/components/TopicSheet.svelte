<script>
  // A topic opened up (owner, 2026-10-13): it expands to fill the screen the way a grade sphere opens.
  // What it needs sits small in the top-left corner, what it opens in the top-right; the topic itself is in
  // the middle, and its study materials are already there underneath: no extra "Сурах цаг!" step.
  // Grade 1–4 basics are read-only: no lesson, no step; the student reads them when they feel a gap.
  import RichText from './RichText.svelte';
  import Visual from './Visual.svelte';
  import { topics, topicUnlocks, topicEntries, entries, strands, links, stripLinks } from '../lib/content.js';
  import { ideas } from '../lib/ideas.js';
  import { topicState, entryState, markTopic } from '../lib/logic.js';
  import { ui } from '../lib/ui.svelte.js';
  import { go, route } from '../lib/router.svelte.js';
  import { fly, fade } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';
  import { ms } from '../lib/motion.js';

  let isOpen = $derived(!!(ui.topic && topics[ui.topic]));
  let lastT;
  let t = $derived(isOpen ? (lastT = topics[ui.topic]) : lastT);
  let st = $derived(t && topicState(t.id));
  let known = $derived(st === 'known' || st === 'faded');
  let es = $derived(t ? topicEntries[t.id] : []);
  // A written answer page for this topic (definition, example, proof), from search.
  let idea = $derived(t && ideas[t.id] && (ideas[t.id].example || ideas[t.id].proof) ? ideas[t.id] : null);
  // Smaller ideas that grow out of this topic (they only had a search page before).
  let extras = $derived(t ? Object.values(ideas).filter((i) => !i.topic && i.from.includes(t.id)) : []);
  const REL = {
    special_case: ['нь онцгой тохиолдол', 'онцгой тохиолдол нь'],
    generalizes: ['ерөнхийлнө', 'ерөнхийлөл нь'],
    representation: ['өөр дүрслэл', 'өөр дүрслэл'],
    application: ['хэрэглэгдэнэ', 'хэрэглэдэг'],
    analogy: ['төстэй', 'төстэй'],
  };
  let related = $derived(t ? links.filter((e) => e.type !== 'prerequisite' && (e.from === t.id || e.to === t.id)) : []);
  let onSphere = $derived(route.parts[0] === 's' ? route.parts[1] : null);
  // Corners stay small: 3 names each, the rest behind "+N".
  let more = $state(false);
  $effect(() => { t?.id; more = false; });
  const cap = (list) => (more ? list : list.slice(0, 3));
  const close = () => (ui.topic = null);
  const open = (path) => { close(); go(path); };
  const toTopic = (id) => (ui.topic = id);
  const gradeOf = (x) => (x.base ? '1–4' : x.grades[0]);
  const short = (s, n = 130) => { const p = stripLinks(s || ''); return p.length > n ? p.slice(0, n - 1) + '…' : p; };
  // Opening: the panel grows out of the middle and fades in, like a sphere opening on the map.
  const grow = (node) => ({ duration: ms(320), easing: cubicOut, css: (k) => `opacity:${k}; transform: scale(${0.94 + 0.06 * k}); border-radius:${(1 - k) * 40 + 0}px` });
</script>

<svelte:window onkeydown={(ev) => ev.key === 'Escape' && close()} />

{#if isOpen}
  <div class="scrim" onclick={close} role="presentation" transition:fade={{ duration: ms(200) }}></div>
  <div class="topic" role="dialog" aria-label={t.name} style:--c={strands[t.strand].color} in:grow out:fade={{ duration: ms(160) }}>
    {#key t.id}
    <div class="inner" in:fade={{ duration: ms(200) }}>
      <!-- corners: what this needs (left) and what it opens (right) -->
      <div class="corners">
        <div class="corner">
          {#if t.req.length}
            <span class="clabel">← Өмнө нь</span>
            {#each cap(t.req) as r}<button class="cl {topicState(r)}" class:base={topics[r].base} onclick={() => toTopic(r)}><i></i>{topics[r].name}</button>{/each}
            {#if !more && t.req.length > 3}<button class="cl more" onclick={() => (more = true)}>+{t.req.length - 3}</button>{/if}
          {/if}
        </div>
        <div class="corner right">
          {#if topicUnlocks[t.id].length}
            <span class="clabel">Дараа нь →</span>
            {#each cap(topicUnlocks[t.id]) as u}<button class="cl {topicState(u)}" onclick={() => toTopic(u)}>{topics[u].name}<i></i></button>{/each}
            {#if !more && topicUnlocks[t.id].length > 3}<button class="cl more" onclick={() => (more = true)}>+{topicUnlocks[t.id].length - 3}</button>{/if}
          {/if}
        </div>
      </div>

      <button class="x" aria-label="Хаах" onclick={close}>×</button>

      <div class="hero">
        <span class="orb" class:base={t.base}>{#if t.formula}<RichText text={t.formula} />{:else}<i class="sd"></i>{/if}</span>
        <h2>{t.name}</h2>
        <p class="small muted">{t.base ? '1–4-р ангийн суурь · зөвхөн унших' : t.grades.map((g) => g + '-р анги').join(' · ')} · {strands[t.strand].name}</p>
        <div class="hrow">
          {#if t.grades.length}
            {#each t.grades as g, i}<a class="gchip" class:on={onSphere === 'g' + g} href="#/s/g{g}" onclick={close}>{g}{i ? ' ↑' : ''}</a>{/each}
          {/if}
          <button class="know" class:on={known} aria-pressed={known} onclick={() => markTopic(t.id, !known)}><span class="box">{#if known}✓{/if}</span>Мэднэ</button>
        </div>
        {#if t.text}<p class="lead">{t.text}</p>{/if}
      </div>

      <!-- study materials, already open -->
      <section class="mats">
        {#each es as id}
          {@const e = entries[id]}
          <button class="mat {entryState(id)}" onclick={() => open('/e/' + id)}>
            {#if e.visual}<span class="pic"><Visual v={e.visual} /></span>{/if}
            <span class="mt"><strong>{e.title}</strong>{#if entryState(id) === 'known'}<span class="ok">✓</span>{/if}</span>
            <span class="md">{short(e.definition)}</span>
            <span class="go">Хичээл унших →</span>
          </button>
        {/each}
        {#if idea}
          <a class="mat" href="#/c/{idea.id}" onclick={close}>
            <span class="mt"><strong>Тайлбар</strong></span>
            <span class="md">{short(idea.def, 160)}</span>
            {#if idea.example}<span class="md ex">Жишээ: {short(idea.example, 110)}</span>{/if}
            <span class="go">Бүтнээр унших{idea.proof ? ' · батлгаа' : ''} →</span>
          </a>
        {/if}
        {#each extras as x}
          <a class="mat small-mat" href="#/c/{x.id}" onclick={close}>
            <span class="mt"><strong>{x.name}</strong></span>
            <span class="md">{short(x.def, 100)}</span>
          </a>
        {/each}
        {#if !es.length && !idea && !extras.length}
          <p class="empty small muted">{t.base ? 'Энгийн тайлбар, богино анимейшн удахгүй нэмэгдэнэ.' : 'Энэ сэдвийн хичээл, тайлбар удахгүй нэмэгдэнэ.'}</p>
        {/if}
      </section>

      {#if related.length}
        <section class="rel">
          <h3>Холбоотой</h3>
          <div class="rchips">
            {#each related as e}
              {@const other = e.from === t.id ? e.to : e.from}
              <button class="rc" onclick={() => toTopic(other)}><em>{REL[e.type][e.from === t.id ? 0 : 1]}:</em> {topics[other].name}<span class="g">{gradeOf(topics[other])}</span></button>
            {/each}
          </div>
        </section>
      {/if}
      {#if route.parts[0] !== 'm'}<button class="maplink" onclick={() => open('/m')}>Математикийн зураг дээр харах →</button>{/if}
    </div>
    {/key}
  </div>
{/if}

<style>
  .scrim { z-index: 40; }
  .topic {
    position: fixed; inset: 0; z-index: 41; overflow-y: auto; overscroll-behavior: contain;
    background: radial-gradient(90% 55% at 50% 22%, color-mix(in srgb, var(--c) 16%, var(--bg)), var(--bg) 70%);
    padding: calc(env(safe-area-inset-top, 0px) + 12px) 16px calc(env(safe-area-inset-bottom, 0px) + 32px);
  }
  .inner { max-width: 560px; margin: 0 auto; display: grid; gap: 18px; position: relative; }
  .x { position: absolute; top: -4px; right: -6px; width: 44px; height: 44px; border: 0; border-radius: 50%; background: none; color: var(--muted); font-size: 1.6rem; }
  .corners { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; padding-right: 34px; min-height: 20px; }
  .corner { display: grid; gap: 3px; align-content: start; justify-items: start; min-width: 0; }
  .corner.right { justify-items: end; text-align: right; }
  .clabel { font-size: 0.7rem; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; color: var(--muted); }
  .cl { display: inline-flex; align-items: center; gap: 6px; max-width: 100%; border: 0; background: none; padding: 3px 0; font-size: 0.82rem; font-weight: 600; color: var(--ink); opacity: 0.8; text-align: inherit; }
  .cl i { flex: none; width: 7px; height: 7px; border-radius: 50%; background: var(--line); }
  .cl.known i { background: var(--grass); } .cl.next i { background: var(--sun); }
  .cl.base { font-style: italic; }
  .cl.more { color: var(--c); font-weight: 800; opacity: 1; }
  .hero { display: grid; justify-items: center; text-align: center; gap: 8px; }
  .orb {
    min-width: 112px; height: 112px; padding: 0 16px; display: grid; place-items: center; border-radius: 56px;
    font-family: var(--math); font-size: 1.25rem; color: #fff; white-space: nowrap;
    background: radial-gradient(circle at 40% 35%, color-mix(in srgb, var(--c) 60%, transparent), color-mix(in srgb, var(--c) 10%, transparent));
    border: 2px solid var(--c); box-shadow: 0 0 34px color-mix(in srgb, var(--c) 50%, transparent);
  }
  .orb.base { border-style: dashed; box-shadow: none; background: transparent; }
  .sd { width: 22px; height: 22px; border-radius: 50%; background: var(--c); box-shadow: 0 0 16px var(--c); }
  h2 { font-size: 1.5rem; text-wrap: balance; }
  .hrow { display: flex; flex-wrap: wrap; justify-content: center; gap: 6px; }
  .gchip { min-height: 36px; min-width: 40px; padding: 0 10px; display: grid; place-items: center; border-radius: 999px; border: 1px solid var(--line); color: var(--ink); text-decoration: none; font-weight: 700; font-size: 0.85rem; }
  .gchip.on { border-color: var(--c); color: var(--c); }
  .know { display: inline-flex; align-items: center; gap: 6px; min-height: 36px; padding: 0 12px 0 8px; border-radius: 999px; border: 1px solid var(--line); background: transparent; color: var(--muted); font-weight: 700; }
  .know .box { width: 20px; height: 20px; border-radius: 6px; border: 2px solid currentColor; display: grid; place-items: center; font-size: 0.8rem; font-weight: 900; }
  .know.on { color: var(--grass); border-color: color-mix(in srgb, var(--grass) 55%, transparent); background: var(--grass-soft); }
  .know.on .box { background: var(--grass); border-color: var(--grass); color: #04140a; }
  .lead { color: var(--muted); max-width: 40ch; }
  .mats { display: grid; gap: 10px; }
  .mat {
    display: grid; gap: 6px; text-align: left; padding: 14px; border-radius: 16px; border: 1px solid var(--line);
    background: rgba(13, 19, 32, 0.85); color: var(--ink); text-decoration: none;
  }
  .mat.known { border-color: color-mix(in srgb, var(--grass) 45%, var(--line)); }
  .pic { display: block; max-height: 150px; overflow: hidden; border-radius: 10px; pointer-events: none; }
  .mt { display: flex; justify-content: space-between; gap: 8px; font-size: 1.05rem; }
  .md { color: var(--muted); font-size: 0.92rem; }
  .md.ex { color: var(--ink); }
  .go { color: var(--c); font-weight: 800; font-size: 0.9rem; }
  .ok { color: var(--grass); }
  .small-mat .mt { font-size: 0.95rem; }
  .empty { text-align: center; padding: 10px; border: 1px dashed var(--line); border-radius: 14px; }
  .rel h3 { font-size: 0.85rem; color: var(--muted); margin-bottom: 8px; }
  .rchips { display: flex; flex-wrap: wrap; gap: 6px; }
  .rc { border: 1px solid var(--line); background: transparent; color: var(--ink); border-radius: 999px; padding: 6px 12px; font-size: 0.85rem; font-weight: 600; }
  .rc em { font-style: normal; color: var(--muted); font-weight: 500; }
  .rc .g { margin-left: 6px; color: var(--muted); font-size: 0.75rem; }
  .maplink { justify-self: center; min-height: 44px; border: 0; background: none; color: var(--sky); font-weight: 700; }
</style>
