<script>
  import RichText from './RichText.svelte';
  // Topic card: its formula, what it needs, what it opens, and the dictionary entries inside it.
  import { topics, topicUnlocks, topicEntries, entries, sphereById, strands } from '../lib/content.js';
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
  let es = $derived(t ? topicEntries[t.id] : []);
  let firstOpen = $derived(es.find((id) => entryState(id) !== 'known') ?? es[0]);
  const close = () => (ui.topic = null);
  const open = (path) => { close(); go(path); };
  // Tapping a linked topic: on the map, the map flies there; elsewhere just switch the card.
  const toTopic = (id) => (ui.topic = id);
</script>

<svelte:window onkeydown={(ev) => ev.key === 'Escape' && close()} />

{#if isOpen}
  <div class="scrim" onclick={close} role="presentation" transition:fade={scrimFade}></div>
  <div class="sheet" role="dialog" aria-label={t.name} style:--c={strands[t.strand].color} in:fly={sheetIn} out:fly={sheetOut}>
    <div class="grab"></div>
    {#key t.id}
    <div class="body" in:fade={{ duration: ms(220) }}>
    <div class="head">
      <span class="f"><RichText text={t.formula} /></span>
      <div>
        <p class="small muted">{sphereById[t.sphere].title} · {strands[t.strand].name}</p>
        <h2>{t.name}</h2>
        {#if st === 'known' || st === 'faded'}<span class="badge known">Мэднэ</span>{:else if st === 'next'}<span class="badge next">Дараагийн алхам</span>{/if}
      </div>
    </div>
    <p>{t.text}</p>
    <div class="row">
      {#if es.length}
        <button class="btn sun" onclick={() => open('/e/' + firstOpen)}>Сурах цаг!</button>
      {:else}
        <button class="btn" class:primary={st !== 'known'} onclick={() => markTopic(t.id, st !== 'known' && st !== 'faded')}>
          {st === 'known' || st === 'faded' ? 'Тэмдэглэгээг болиулах' : 'Би үүнийг мэднэ'}
        </button>
      {/if}
      {#if route.parts[0] !== 's'}
        <button class="link" onclick={() => open('/s/' + t.sphere)}>Бөмбөлгийн зураг →</button>
      {/if}
    </div>
    {#if t.with}
      <p class="with small">
        <strong>Хамт үзнэ:</strong>
        {#each t.with as w}<button class="term" onclick={() => toTopic(w)}>{topics[w].name}</button>{/each}. {t.withWhy}
      </p>
    {/if}

    {#if t.req.length}
      <div class="grp">
        <h3>Суурь</h3>
        <div class="chips">{#each t.req as r}<button class="chip {topicState(r)}" onclick={() => toTopic(r)}><span class="dot"></span>{topics[r].name}</button>{/each}</div>
      </div>
    {/if}
    {#if topicUnlocks[t.id].length}
      <div class="grp">
        <h3>Нээгдэх</h3>
        <div class="chips">{#each topicUnlocks[t.id] as u}<button class="chip {topicState(u)}" onclick={() => toTopic(u)}><span class="dot"></span>{topics[u].name}</button>{/each}</div>
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
      <p class="small muted">Энэ сэдвийн бүрэн тайлбар, тест удахгүй нэмэгдэнэ.</p>
    {/if}

    </div>
    {/key}
  </div>
{/if}

<style>
  .sheet { box-shadow: 0 -12px 40px rgba(0, 0, 0, 0.6), 0 -1px 0 color-mix(in srgb, var(--c) 50%, transparent); }
  .body { display: grid; gap: 12px; }
  .head { display: flex; gap: 14px; align-items: center; }
  .head > div { display: grid; gap: 4px; justify-items: start; }
  h3 { font-size: 0.95rem; font-weight: 700; color: var(--muted); margin-bottom: 8px; }
  .f {
    min-width: 72px; height: 72px; padding: 0 10px; flex: none; display: grid; place-items: center; border-radius: 50%;
    font-family: var(--math); font-size: 1.1rem; color: #fff; white-space: nowrap;
    background: radial-gradient(circle at 40% 35%, color-mix(in srgb, var(--c) 55%, transparent), color-mix(in srgb, var(--c) 10%, transparent));
    border: 1.5px solid var(--c); box-shadow: 0 0 20px color-mix(in srgb, var(--c) 45%, transparent);
  }
  .with { padding: 10px 12px; border-radius: 12px; background: var(--sky-soft); }
  .with .term { margin: 0 4px; }
  .chips .chip { color: var(--ink); background: transparent; }
  .entries { display: grid; gap: 6px; }
  .entry { display: flex; align-items: center; gap: 10px; padding: 8px 10px; border-radius: 12px; border: 1px solid var(--line); background: transparent; text-align: left; font-weight: 600; }
  .entry:hover { border-color: var(--sky); }
  .sym { min-width: 30px; height: 30px; display: grid; place-items: center; border-radius: 8px; background: var(--sky-soft); color: var(--sky); font-family: var(--math); }
  .ok { margin-left: auto; color: var(--grass); }
  .row { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
  .row .btn { min-height: 48px; padding: 0 22px; }
  .link { min-height: 44px; border: 0; background: none; padding: 0 8px; color: var(--sky); font-weight: 700; }
  .grp { padding-top: 4px; }
</style>
