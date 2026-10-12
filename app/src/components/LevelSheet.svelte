<script>
  // "Дутагдлаа олъё": explains what the level check does, lets the student pick a goal
  // (and, for a coming test, their grade and the test's topic), then starts or resumes the check.
  import { fly, fade } from 'svelte/transition';
  import { topics, sphereById } from '../lib/content.js';
  import { GOALS, checkSpheres, checkLeft } from '../lib/logic.js';
  import { progress, save } from '../lib/progress.svelte.js';
  import { ui } from '../lib/ui.svelte.js';
  import { go } from '../lib/router.svelte.js';
  import { search } from '../lib/search.js';
  import { sheetIn, sheetOut, scrimFade } from '../lib/motion.js';

  const GRADES = [5, 6, 7, 8, 9, 10, 11, 12];
  let q = $state('');
  let matches = $derived(q.trim() ? search(q).filter((r) => r.kind === 'topic').slice(0, 4) : []);
  let plan = $derived(ui.level ? checkSpheres() : []);
  let left = $derived(ui.level ? checkLeft() : []);
  let started = $derived(plan.length > left.length);

  const close = () => (ui.level = false);
  function setGoal(id) {
    progress.goal = id;
    progress.goalPicked = true;
    save();
  }
  function setGrade(g) {
    progress.grade = progress.grade === g ? null : g;
    save();
  }
  function setTopic(id) {
    progress.examTopic = id;
    q = '';
    save();
  }
  function start() {
    if (!progress.goalPicked) setGoal(progress.goal ?? 'ahih');
    if (!left.length) {
      // Everything in this plan is done: run it again from the start.
      for (const s of plan) delete progress.checkDone[s.id];
      save();
    }
    close();
    go('/start');
  }
</script>

<svelte:window onkeydown={(ev) => ev.key === 'Escape' && close()} />

{#if ui.level}
  <div class="scrim" onclick={close} role="presentation" transition:fade={scrimFade}></div>
  <div class="sheet" role="dialog" aria-label="Дутагдлаа олъё" in:fly={sheetIn} out:fly={sheetOut}>
    <div class="grab"></div>
    <button class="close" aria-label="Хаах" onclick={close}>×</button>
    <h2>Дутагдлаа олъё</h2>
    <p class="lead">Богино шалгалтаар аль сэдвээ мэддэг, аль нь дутуу байгааг олно. Тэгээд газрын зураг хаанаас эхлэхийг заана.</p>

    <ol class="how">
      <li><span class="n">1</span>Хамгийн энгийнээс эхэлнэ: тоо, тэмдэг, үйлдэл.</li>
      <li><span class="n">2</span>Хэсэг бүр 2–5 асуулттай. Мэдэхгүй бол таамаглах хэрэггүй.</li>
      <li><span class="n">3</span>Дууссаны дараа эхлэх сэдэв тань газрын зураг дээр гэрэлтэнэ.</li>
      <li><span class="n">4</span>Хүссэн үедээ зогсоож болно. Дууссан хэсэг хадгалагдаж, дараа нь үргэлжилнэ.</li>
    </ol>
    <p class="small muted">Энэ бол дүн биш. Зөвхөн эхлэх газраа олох арга.</p>

    <div class="grp">
      <h3>Зорилго</h3>
      <div class="chips">
        {#each GOALS as g}
          <button class="chip" class:on={progress.goalPicked && progress.goal === g.id} onclick={() => setGoal(g.id)}>{g.name}</button>
        {/each}
      </div>
    </div>

    {#if progress.goalPicked && progress.goal === 'test'}
      <div class="grp" transition:fly={{ y: 8, duration: 200 }}>
        <h3>Хэддүгээр ангид сурдаг вэ?</h3>
        <div class="chips">
          {#each GRADES as g}<button class="chip grade" class:on={progress.grade === g} onclick={() => setGrade(g)}>{g}</button>{/each}
        </div>
      </div>
      <div class="grp">
        <h3>Шалгалт юуны тухай вэ? <span class="muted">(мэдэж байвал)</span></h3>
        {#if progress.examTopic && topics[progress.examTopic]}
          <div class="chips">
            <button class="chip on" onclick={() => setTopic(null)}>{topics[progress.examTopic].name} ×</button>
          </div>
        {:else}
          <input type="search" bind:value={q} placeholder="Жишээ нь: бутархай, процент, тэгшитгэл" autocomplete="off" />
          {#if matches.length}
            <div class="chips">
              {#each matches as r}<button class="chip" onclick={() => setTopic(r.id)}>{r.item.name}</button>{/each}
            </div>
          {/if}
        {/if}
      </div>
    {/if}

    <div class="foot">
      <p class="small muted">
        {#if plan.length}
          {plan.length} хэсэг{#if started}, {left.length} нь үлдсэн{/if} · {plan.map((s) => sphereById[s.id].title).join(', ')}
        {:else}
          Энэ сэдвийн асуултууд удахгүй нэмэгдэнэ.
        {/if}
      </p>
      <button class="btn sun" disabled={!plan.length} onclick={start}>
        {started && left.length ? 'Үргэлжлүүлэх' : started ? 'Дахин шалгах' : 'Эхэлье!'}
      </button>
    </div>
  </div>
{/if}

<style>
  .scrim { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.5); z-index: 40; }
  .sheet {
    position: fixed; left: 0; right: 0; bottom: 0; z-index: 41; max-height: 88vh; overflow-y: auto;
    max-width: 560px; margin: 0 auto; padding: 12px 20px calc(20px + env(safe-area-inset-bottom));
    background: var(--surface-solid); border: 1px solid rgba(255, 204, 102, 0.35); border-bottom: 0; border-radius: 22px 22px 0 0;
    box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.6); display: grid; gap: 14px;
  }
  .grab { width: 40px; height: 4px; border-radius: 4px; background: var(--line); margin: 0 auto; }
  .close { position: absolute; top: 10px; right: 10px; width: 36px; height: 36px; border: 0; background: none; color: var(--muted); font-size: 1.4rem; }
  h2 { font-size: 1.4rem; color: var(--sun); }
  .lead { margin-top: -6px; }
  .how { list-style: none; padding: 0; margin: 0; display: grid; gap: 8px; }
  .how li { display: flex; gap: 10px; align-items: flex-start; }
  .n { flex: none; width: 24px; height: 24px; border-radius: 50%; display: grid; place-items: center; font-size: 0.8rem; font-weight: 800; background: var(--sun-soft); color: var(--sun); }
  h3 { font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--muted); margin-bottom: 8px; }
  h3 .muted { text-transform: none; letter-spacing: 0; }
  .grp { display: grid; gap: 0; }
  .chips { display: flex; flex-wrap: wrap; gap: 8px; }
  .chip { color: var(--ink); background: transparent; }
  .chip.grade { min-width: 44px; justify-content: center; }
  .chip.on { background: var(--sun); border-color: var(--sun); color: #2a1a00; }
  input { width: 100%; min-height: 44px; padding: 0 12px; border-radius: 12px; border: 1px solid var(--line); font: inherit; margin-bottom: 8px; }
  .foot { display: grid; gap: 10px; padding-top: 4px; }
  .foot .btn { justify-self: stretch; min-height: 48px; font-size: 1.05rem; }
  .foot .btn:disabled { opacity: 0.4; }
</style>
