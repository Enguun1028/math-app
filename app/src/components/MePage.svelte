<script>
  // "Би" tab, like an Instagram profile: three numbers on top, your map below, goal and settings at the bottom.
  import { spheres, topics } from '../lib/content.js';
  import { sphereLayout } from '../lib/layout.js';
  import { topicKnown, sphereKnown, GOALS } from '../lib/logic.js';
  import { progress, daysThisWeek, resetProgress } from '../lib/progress.svelte.js';
  import { ui } from '../lib/ui.svelte.js';

  let knownTopics = $derived(Object.keys(topics).filter(topicKnown).length);
  let knownSpheres = $derived(spheres.filter(sphereKnown).length);
  const week = daysThisWeek();
  let goal = $derived(GOALS.find((g) => g.id === progress.goal)?.name);
  let confirm = $state(false);
</script>

<div class="me">
  <header class="top">
    <span class="avatar" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="12" cy="9" r="3.6" /><path d="M5.5 19.5a6.5 6.5 0 0 1 13 0" /></svg></span>
    <div class="who">
      <h1>Би</h1>
      <span class="small muted">{progress.goalPicked && goal ? 'Зорилго: ' + goal : 'Зорилго сонгоогүй'}</span>
    </div>
  </header>

  <div class="stats">
    <div><strong>{knownTopics}</strong><span>мэдэх сэдэв</span></div>
    <div><strong>{week}</strong><span>өдөр энэ долоо хоногт</span></div>
    <div><strong>{knownSpheres}</strong><span>анги</span></div>
  </div>

  <section>
    <h2>Миний газрын зураг</h2>
    <div class="strip">
      {#each spheres as s}
        {@const on = sphereKnown(s)}
        <a class="sph" class:on href="#/s/{s.id}" style:--c={sphereLayout[s.id].color} aria-label={s.title}>
          <svg viewBox="0 0 64 64"><text x="32" y="34" class="sf" font-size="22" font-weight="800" text-anchor="middle" dominant-baseline="middle">{s.grade}</text></svg>
        </a>
      {/each}
    </div>
  </section>

  <section class="list">
    <button class="row" onclick={() => (ui.level = true)}><span><strong>Зорилго ба анги</strong><span class="small muted">Дутагдлаа олъё шалгалт ч эндээс</span></span><span class="go">›</span></button>
    <div class="row col">
      <span><strong>Тохиргоо</strong><span class="small muted">Ахиц зөвхөн энэ утсанд хадгалагдана.</span></span>
      {#if !confirm}
        <button class="btn" onclick={() => (confirm = true)}>Ахицыг эхнээс нь эхлүүлэх</button>
      {:else}
        <p class="small">Мэдсэн бүх сэдэв, шалгалтын дүн устана. Итгэлтэй байна уу?</p>
        <div class="btns">
          <button class="btn danger" onclick={() => { resetProgress(); confirm = false; }}>Тийм, устгах</button>
          <button class="btn" onclick={() => (confirm = false)}>Болих</button>
        </div>
      {/if}
    </div>
    <!-- Most users are children: say plainly what is collected and why (owner, 2026-10-20). -->
    <div class="row col">
      <span><strong>Нууцлал</strong><span class="small muted">Бид нэр, утас, имэйл зэрэг хувийн мэдээлэл цуглуулдаггүй. Аппыг сайжруулахын тулд нэргүй хэрэглээний мэдээлэл (ямар хуудас нээсэн, асуултад хэрхэн хариулсан, алдаа гарсан эсэх) цуглуулдаг. Энэ мэдээллийг хэнд ч зарахгүй, зар сурталчилгаанд ашиглахгүй.</span></span>
    </div>
  </section>
</div>

<style>
  .me { display: grid; gap: 26px; padding-top: 16px; }
  .top { display: flex; align-items: center; gap: 16px; }
  .avatar { width: 76px; height: 76px; border-radius: 50%; display: grid; place-items: center; background: linear-gradient(140deg, var(--sky), var(--dusk)); box-shadow: 0 0 0 3px var(--bg), 0 0 0 5.5px var(--sun); flex: none; }
  .avatar svg { width: 46px; height: 46px; fill: none; stroke: #03161c; stroke-width: 2; stroke-linecap: round; }
  .who { display: grid; gap: 2px; }
  .stats { display: grid; grid-template-columns: repeat(3, 1fr); text-align: center; gap: 8px; }
  .stats div { display: grid; }
  .stats strong { font-size: 1.6rem; font-variant-numeric: tabular-nums; }
  .stats span { font-size: 0.8rem; color: var(--muted); line-height: 1.25; }
  section { display: grid; gap: 10px; }
  .strip { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
  .sph { aspect-ratio: 1; border-radius: 50%; border: 1.5px solid var(--line); display: grid; place-items: center; opacity: 0.55; }
  .sph.on { border-color: var(--c); opacity: 1; background: radial-gradient(circle at 40% 35%, color-mix(in srgb, var(--c) 30%, transparent), transparent 70%); box-shadow: 0 0 14px color-mix(in srgb, var(--c) 40%, transparent); }
  .sph svg { width: 100%; height: 100%; overflow: visible; }
  .sph :global(.sf) { fill: var(--c); font-family: var(--math); }
  .list { gap: 10px; }
  .row { display: flex; align-items: center; justify-content: space-between; gap: 12px; width: 100%; min-height: 64px; padding: 12px 16px; border-radius: 16px; background: var(--surface); border: 1px solid var(--line); color: var(--ink); text-align: left; font: inherit; }
  .row > span:first-child { display: grid; }
  .row.col { flex-direction: column; align-items: stretch; }
  .btns { display: flex; gap: 8px; flex-wrap: wrap; }
  .btn.danger { border-color: var(--warn); color: var(--warn); }
  .go { color: var(--muted); font-size: 1.4rem; }
</style>
