<script>
  // "Дасгал" tab: everything to do next in one place — the next step, lessons in progress,
  // a warm-up from what you know, and the level check.
  import { entries, topics, topicEntries } from '../lib/content.js';
  import { nextTopic, entryState, levelChecked, checkLeft } from '../lib/logic.js';
  import { progress } from '../lib/progress.svelte.js';
  import { ui } from '../lib/ui.svelte.js';
  import RichText from './RichText.svelte';

  let next = $derived(nextTopic());
  let nextLesson = $derived(next ? topicEntries[next].find((id) => entryState(id) !== 'known') ?? topicEntries[next][0] : null);
  // Opened but not yet known, most recent first.
  let going = $derived(Object.entries(progress.seen ?? {})
    .filter(([id]) => entries[id] && entryState(id) !== 'known')
    .sort((a, b) => b[1] - a[1]).slice(0, 4).map(([id]) => id));
  let known = $derived(Object.keys(progress.known ?? {}).filter((id) => entries[id]));
  let left = $derived(checkLeft().length);
</script>

<div class="practice">
  <h1>Дасгал</h1>

  {#if next}
    <a class="next" href={nextLesson ? '#/e/' + nextLesson : '#/c/' + next}>
      <span class="nf"><RichText text={topics[next].formula || '→'} /></span>
      <span class="nn"><span class="small">Дараагийн алхам</span><strong>{topics[next].name}</strong></span>
      <span class="btn sun">Сурах цаг!</span>
    </a>
  {:else if !levelChecked()}
    <button class="next" onclick={() => (ui.level = true)}>
      <span class="nf">?</span>
      <span class="nn"><span class="small">Эхлэхээсээ өмнө</span><strong>Хаанаас эхлэхээ олъё</strong></span>
      <span class="btn sun">Дутагдлаа олъё</span>
    </button>
  {/if}

  {#if going.length}
    <section>
      <h2>Үргэлжлүүлэх</h2>
      {#each going as id}
        <a class="row" href="#/e/{id}"><span class="sym"><RichText text={entries[id].symbol ?? '·'} /></span><span class="t"><strong>{entries[id].title}</strong><span class="small muted">Эхэлсэн</span></span><span class="go">›</span></a>
      {/each}
    </section>
  {/if}

  <section>
    <h2>Сэргээх</h2>
    {#if known.length}
      <a class="row" href="#/warmup"><span class="sym">↻</span><span class="t"><strong>3 асуултаар сэргээх</strong><span class="small muted">{known.slice(0, 3).map((k) => entries[k].title).join(' · ')}</span></span><span class="go">›</span></a>
    {:else}
      <p class="small muted">Нэг хичээлийг "Мэднэ" болгоход энд сэргээх асуултууд гарч ирнэ.</p>
    {/if}
  </section>

  <section>
    <h2>Дутагдлаа олъё</h2>
    <button class="row" onclick={() => (ui.level = true)}>
      <span class="sym">⌕</span>
      <span class="t"><strong>{levelChecked() ? (left ? 'Үргэлжлүүлэх' : 'Дахин шалгах') : 'Эхлэх'}</strong><span class="small muted">{left && levelChecked() ? left + ' хэсэг үлдсэн' : 'Хаанаас эхлэхээ олох богино шалгалт'}</span></span>
      <span class="go">›</span>
    </button>
  </section>
</div>

<style>
  .practice { display: grid; gap: 26px; padding-top: 16px; }
  section { display: grid; gap: 8px; }
  .next {
    display: grid; grid-template-columns: auto minmax(0, 1fr) auto; align-items: center; gap: 12px; padding: 14px; border-radius: 20px;
    background: rgba(12, 15, 21, 0.96); border: 1px solid rgba(255, 204, 102, 0.33); box-shadow: 0 0 28px rgba(255, 204, 102, 0.11);
    color: var(--ink); text-decoration: none; text-align: left; font: inherit;
  }
  .nf { min-width: 48px; height: 48px; padding: 0 6px; border-radius: 50%; border: 1.5px solid var(--sun); color: var(--sun); display: grid; place-items: center; font: 0.95rem var(--math); white-space: nowrap; }
  .nn { display: grid; min-width: 0; }
  .nn .small { color: var(--sun); font-weight: 700; }
  .row {
    display: grid; grid-template-columns: auto minmax(0, 1fr) auto; align-items: center; gap: 12px; width: 100%; min-height: 64px; padding: 10px 14px;
    border-radius: 16px; background: var(--surface); border: 1px solid var(--line); color: var(--ink); text-decoration: none; text-align: left; font: inherit;
  }
  .sym { width: 40px; height: 40px; border-radius: 12px; display: grid; place-items: center; background: var(--sky-soft); color: var(--sky); font: 1.1rem var(--math); }
  .t { display: grid; min-width: 0; }
  .go { color: var(--muted); font-size: 1.4rem; }
</style>
