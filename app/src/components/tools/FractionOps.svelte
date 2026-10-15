<script>
  // "Бутархайн үйлдлүүд": two fractions in two colours and what happens when you add, subtract or multiply them.
  // + and −: the denominators are matched first (each original part is cut into equal slices; thick lines keep
  // the original parts visible), then the slices are put together or taken away, then the answer is simplified.
  // ×: area model. The first fraction cuts a rectangle into columns, the second into rows; the overlap is the answer.
  // Numerators may be larger than denominators: each whole is its own bar (or its own rectangle in the area model).
  import { fly } from 'svelte/transition';
  import RichText from '../RichText.svelte';
  import FractionPlay from './FractionPlay.svelte';
  import FractionInput from './FractionInput.svelte';
  import { unlock } from '../../lib/sound.js';
  import { ms, ease } from '../../lib/motion.js';

  let A = $state({ n: 1, d: 3 });
  let B = $state({ n: 1, d: 4 });
  let op = $state('+');
  // The animation starts on "Эхлэх" and is reset whenever a value or the operation changes.
  let started = $state(false);
  let playKey = $state(0);
  $effect(() => {
    A.n; A.d; B.n; B.d; op;
    started = false;
  });
  // The tap on "Эхлэх" is what lets the phone play sound.
  const start = () => { unlock(); started = true; playKey++; };

  const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));
  const lcm = (a, b) => (a / gcd(a, b)) * b;

  let L = $derived(lcm(A.d, B.d));
  let ka = $derived(L / A.d);
  let kb = $derived(L / B.d);
  let an = $derived(A.n * ka);
  let bn = $derived(B.n * kb);
  let rn = $derived(op === '+' ? an + bn : op === '−' ? an - bn : A.n * B.n);
  let rd = $derived(op === '×' ? A.d * B.d : L);
  let g = $derived(gcd(rn, rd) || 1);
  // Answer bars: one per whole the slices reach.
  let bars = $derived(Math.max(1, Math.ceil((op === '+' ? an + bn : Math.max(an, bn)) / L)));
  // ×: how many whole rectangles across (first fraction) and down (second fraction).
  let wa = $derived(Math.max(1, Math.ceil(A.n / A.d)));
  let wb = $derived(Math.max(1, Math.ceil(B.n / B.d)));
  let cols = $derived(A.d * wa);
  let rws = $derived(B.d * wb);
  const multiples = (d) => Array.from({ length: L / d }, (_, i) => (i + 1) * d);
  const f = (n, d) => (n < 0 ? '−' : '') + `${Math.abs(n)}/${d}`;

</script>

{#snippet editor(F, name, cls)}
  <div class="ed {cls}">
    <span class="name">{name}</span>
    <FractionInput bind:n={F.n} bind:d={F.d} />
  </div>
{/snippet}

<!-- Bars cut into d·k slices (one bar per whole); thick lines every k slices show the original parts. -->
{#snippet sliced(d, k, filled, cls)}
  <div class="wholes">
    {#each Array(Math.max(1, Math.ceil(filled / (d * k)))) as _, w}
      <div class="bar fine" style:grid-template-columns="repeat({d * k}, 1fr)">
        {#each Array(d * k) as _, j}<span class="cell {cls}" class:on={w * d * k + j < filled} class:edge={j > 0 && j % k === 0}></span>{/each}
      </div>
    {/each}
  </div>
{/snippet}

<div class="ops">
  <div class="opsel" role="group" aria-label="Үйлдэл">
    {#each [['+', 'Нэмэх'], ['−', 'Хасах'], ['×', 'Үржих']] as [o, label]}
      <button class="chip" class:on={op === o} onclick={() => (op = o)}><b>{o}</b> {label}</button>
    {/each}
  </div>

  {@render editor(A, '1-р бутархай', 'a')}
  <div class="sign">{op}</div>
  {@render editor(B, '2-р бутархай', 'b')}

  {#key op}
  <div class="steps" in:fly={{ y: 10, duration: ms(260), easing: ease }}>
    {#if op !== '×'}
      {#if !started}
        <button class="go" onclick={start}>▶ Эхлэх <span class="small">харуулж тайлбарлана</span></button>
      {:else}
        {#key playKey}<FractionPlay {A} {B} {op} />{/key}
      {/if}
      <details class="more">
      <summary>Алхмуудыг бичгээр харах</summary>
      <section class="stp">
        <h3>1. Ерөнхий хуваарь олно</h3>
        {#if A.d === B.d}
          <p>Хуваарь аль хэдийн ижил: <b>{A.d}</b>. Шууд {op === '+' ? 'нэмнэ' : 'хасна'}.</p>
        {:else}
          <p>{A.d}-т ч, {B.d}-т ч хуваагддаг хамгийн бага тоог хайна:</p>
          <div class="mults">
            <div class="mrow a"><span class="who">{A.d}</span>{#each multiples(A.d) as m}<span class="m" class:hit={m === L}>{m}</span>{/each}</div>
            <div class="mrow b"><span class="who">{B.d}</span>{#each multiples(B.d) as m}<span class="m" class:hit={m === L}>{m}</span>{/each}</div>
          </div>
          <p><b class="hitword">{L}</b> хоёр мөрөнд хоёуланд нь байгаа хамгийн бага тоо.{#if L === A.d * B.d}&nbsp;Энд {A.d} × {B.d} = {L}.{/if}</p>
          <a class="topic two" href="#/c/n4"><span>Үүнийг <b>ХБЕХ</b> гэдэг →</span><span class="small muted">Сэдэв: Хуваагдах чанар, ХИЕХ, ХБЕХ</span></a>
        {/if}
      </section>

      <section class="stp">
        <h3>2. {A.d === B.d ? '' : `${L} жижиг хэсэгт хуваагаад `}{op === '+' ? 'нэмнэ' : 'хасна'}</h3>
        {#if A.d !== B.d}
          <p class="small muted">Цэнхрийн хэсэг бүрийг {ka}, шарын хэсэг бүрийг {kb} жижиг хэсэгт хуваана. Зузаан цагаан шугам = анхны хэсэг.</p>
        {/if}
        <div class="stack">
          <span class="lab a"><RichText text="{f(A.n, A.d)} = {f(an, L)}" /></span>
          {@render sliced(A.d, ka, an, 'a')}
          <span class="lab sym">{op}</span><span></span>
          <span class="lab b"><RichText text="{f(B.n, B.d)} = {f(bn, L)}" /></span>
          {@render sliced(B.d, kb, bn, 'b')}
          <span class="rule"></span>
          {#each Array(bars) as _, w}
            <span class="lab res">{#if w === 0}<RichText text="= {f(rn, rd)}" />{/if}</span>
            <div class="bar fine" style:grid-template-columns="repeat({L}, 1fr)">
              {#each Array(L) as _, j}
                {@const i = w * L + j}
                {#if op === '+'}
                  <span class="cell" class:a={i < an} class:b={i >= an && i < an + bn} class:on={i < an + bn}></span>
                {:else}
                  <span class="cell a" class:on={i < an} class:gone={i >= an - bn && i < an} class:short={i >= an && i < bn}></span>
                {/if}
              {/each}
            </div>
          {/each}
        </div>
        <p class="eq big"><RichText text="{f(an, L)} {op} {f(bn, L)} = {f(rn, rd)}" /></p>
        <p class="small muted">
          {#if op === '+'}Жижиг хэсгүүд ижил хэмжээтэй болсон тул зүгээр л тоолно: {an} + {bn} = {an + bn}.{#if rn > rd} 1-ээс их: бүтэн {Math.floor(rn / rd)} ба {rn % rd} хэсэг.{/if}
          {:else if rn < 0}Хасах хэсэг ({bn}) байгаагаасаа ({an}) их тул хариу сөрөг.
          {:else}Цэнхэр {an} хэсгээс зураастай {bn}-ийг авч хаяхад {rn} үлдэнэ.{/if}
        </p>
      </section>
      </details>
    {:else}
      <section class="stp">
        <h3>1. Эхний бутархай: тэгш өнцөгтийг {A.d} баганад хуваагаад {A.n}-ийг нь будна</h3>
        {#if wa > 1}<p class="small muted">Нэг тэгш өнцөгт = 1 бүтэн. {A.n} багана багтахгүй тул {wa} тэгш өнцөгтийг хажуу хажууд нь тавина.</p>{/if}
        <div class="area" style:grid-template-columns="repeat({cols}, 1fr)" style:grid-template-rows="1fr" style:aspect-ratio="{4 * wa} / 3" style:max-width={wa > 1 ? "100%" : "300px"}>
          {#each Array(cols) as _, c}<span class="cell solo" class:ina={c < A.n} class:ec={c > 0 && c % A.d === 0}></span>{/each}
        </div>
        <p class="cap"><RichText text="Цэнхэр = {f(A.n, A.d)}" /></p>
      </section>
      <section class="stp">
        <h3>2. Хоёр дахь: тэр тэгш өнцөгтийг {B.d} мөрөнд хуваагаад {B.n}-ийг нь будна</h3>
        {#if wb > 1}<p class="small muted">{B.n} мөр багтахгүй тул {wb} тэгш өнцөгтийг доор доор нь тавина.</p>{/if}
        <div class="area" style:grid-template-columns="repeat({cols}, 1fr)" style:grid-template-rows="repeat({rws}, 1fr)" style:aspect-ratio="{4 * wa} / {3 * wb}" style:max-width={wa > 1 ? "100%" : "300px"}>
          {#each Array(cols * rws) as _, i}
            {@const c = i % cols}
            {@const r = Math.floor(i / cols)}
            <span class="cell solo" class:inb={r < B.n} class:ec={c > 0 && c % A.d === 0} class:er={r > 0 && r % B.d === 0}></span>
          {/each}
        </div>
        <p class="cap"><RichText text="Шар = {f(B.n, B.d)}" /></p>
      </section>
      <section class="stp">
        <h3>3. Давхарлана: хоёулаа будагдсан нүд = хариу</h3>
        <div class="area" style:grid-template-columns="repeat({cols}, 1fr)" style:grid-template-rows="repeat({rws}, 1fr)" style:aspect-ratio="{4 * wa} / {3 * wb}" style:max-width={wa > 1 ? "100%" : "300px"}>
          {#each Array(cols * rws) as _, i}
            {@const c = i % cols}
            {@const r = Math.floor(i / cols)}
            <span class="cell" class:ina={c < A.n} class:inb={r < B.n} class:both={c < A.n && r < B.n} class:ec={c > 0 && c % A.d === 0} class:er={r > 0 && r % B.d === 0}></span>
          {/each}
        </div>
        <p>Ногоон нүд нь цэнхэр ч, шар ч. Тэр нь <b><RichText text="{f(A.n, A.d)}-ийн {f(B.n, B.d)}" /></b> хэсэг: үржих = «-ийн».</p>
        <div class="count">
          <span><b class="g">{rn}</b> ногоон нүд <span class="small muted">({A.n} багана × {B.n} мөр)</span></span>
          <span><b>{rd}</b> {wa * wb > 1 ? 'нүд нэг тэгш өнцөгтөд (1 бүтэн)' : 'бүх нүд'} <span class="small muted">({A.d} × {B.d})</span></span>
        </div>
        <p class="eq big"><RichText text="{f(A.n, A.d)} × {f(B.n, B.d)} = {f(rn, rd)}" /></p>
      </section>
    {/if}

    {#if g > 1 && rn !== 0}
      <section class="stp">
        <h3>{op === '×' ? '4' : '3'}. Хураана</h3>
        <p class="eq big"><RichText text="{f(rn, rd)} = {f(rn / g, rd / g)}" /></p>
        <p class="small muted">Хүртвэр, хуваарь хоёуланг нь {g}-д хуваана.</p>
      </section>
    {/if}

    <a class="topic" href="#/c/n5">Сэдэв: Энгийн бутархай →</a>
  </div>
  {/key}
</div>

<style>
  .ops { display: grid; gap: 14px; }
  .go {
    display: grid; justify-items: center; gap: 2px; min-height: 64px; padding: 10px; border: 0; border-radius: 18px;
    background: var(--sky); color: var(--on-sky); font: 800 1.2rem var(--font); box-shadow: var(--glow);
  }
  .go .small { font-weight: 600; opacity: 0.8; }
  .more { display: grid; gap: 12px; }
  .more summary { min-height: 44px; display: flex; align-items: center; color: var(--sky); font-weight: 700; cursor: pointer; list-style: none; }
  .more summary::-webkit-details-marker { display: none; }
  .more summary::after { content: ' ›'; margin-left: 6px; }
  .more[open] { gap: 12px; }
  .opsel { display: flex; gap: 8px; flex-wrap: wrap; }
  .opsel .chip { color: var(--ink); background: transparent; }
  .opsel .chip.on { background: var(--sky); border-color: var(--sky); color: var(--on-sky); }
  .ed { display: grid; gap: 10px; padding: 14px; border-radius: 18px; background: var(--surface); border: 1px solid var(--line); }
  .ed.a { --col: var(--sky); --soft: var(--sky-soft); }
  .ed.b { --col: var(--sun); --soft: var(--sun-soft); }
  .name { font-weight: 800; color: var(--col); }
  .bar { display: grid; gap: 3px; height: 46px; }
  .bar .cell { padding: 0; transition: background 0.25s ease; }
  .wholes { display: grid; gap: 6px; }
  .sign { justify-self: center; font: 800 1.6rem var(--font); color: var(--muted); margin: -6px 0; }

  .steps { display: grid; gap: 12px; }
  .stp { display: grid; gap: 10px; padding: 14px; border-radius: 18px; background: var(--surface); border: 1px solid var(--line); }
  h3 { font-size: 1rem; margin: 0; }
  .row { display: grid; grid-template-columns: auto minmax(0, 1fr); align-items: center; gap: 8px 10px; }
  .row .eq { grid-column: 2; font-size: 1.1rem; }
  .tag { font: 800 0.85rem var(--font); padding: 4px 8px; border-radius: 8px; }
  .tag.a { color: var(--sky); background: var(--sky-soft); }
  .tag.b { color: var(--sun); background: var(--sun-soft); }
  /* Sliced bars: thin lines between slices, thick ones where the original parts were. */
  .bar.fine { gap: 0; height: 40px; border-radius: 8px; overflow: hidden; border: 1.5px solid var(--line); }
  .bar.fine .cell { border-radius: 0; border: 0; border-left: 1.5px solid rgba(230, 240, 255, 0.55); }
  .bar.fine .cell:first-child { border-left: 0; }
  .bar.fine .cell.edge { border-left: 3.5px solid #ffffff; }
  .bar.fine .cell.a.on { background: var(--sky); box-shadow: none; }
  .bar.fine .cell.b.on { background: var(--sun); box-shadow: none; }
  .bar.fine .cell.gone { background: repeating-linear-gradient(135deg, var(--sun-soft) 0 4px, transparent 4px 8px); outline: 2px solid var(--sun); outline-offset: -2px; }
  .bar.fine .cell.short { background: repeating-linear-gradient(135deg, rgba(255, 122, 138, 0.35) 0 4px, transparent 4px 8px); }
  .eq { font-weight: 700; }
  .mults { display: grid; gap: 6px; }
  .mrow { display: flex; flex-wrap: wrap; align-items: center; gap: 5px; }
  .who { width: 28px; font-weight: 800; color: var(--col); }
  .mrow.a { --col: var(--sky); } .mrow.b { --col: var(--sun); }
  .m { min-width: 34px; padding: 4px 6px; text-align: center; border-radius: 8px; border: 1px solid var(--line); font-variant-numeric: tabular-nums; color: var(--muted); }
  .m.hit { background: var(--grass); border-color: var(--grass); color: #052012; font-weight: 800; box-shadow: 0 0 10px rgba(94, 234, 154, 0.5); }
  .hitword { color: var(--grass); }
  .topic { justify-self: start; display: inline-flex; align-items: center; gap: 6px; min-height: 44px; padding: 0 14px; border-radius: 999px; border: 1px solid var(--line); color: var(--sky-deep); font-weight: 700; text-decoration: none; }
  /* + and −: the two fractions and the answer in one aligned stack, same width, same slices. */
  .stack { display: grid; grid-template-columns: 96px minmax(0, 1fr); align-items: center; gap: 8px 10px; }
  .lab { font-weight: 800; font-size: 1.05rem; }
  .lab.a { color: var(--sky); } .lab.b { color: var(--sun); } .lab.res { color: var(--ink); }
  .lab.sym { font-size: 1.4rem; color: var(--muted); text-align: center; }
  .rule { grid-column: 1 / -1; height: 2px; background: var(--ink); opacity: 0.5; border-radius: 2px; }
  .cap { font-weight: 700; text-align: center; }
  .count { display: grid; gap: 4px; }
  .g { color: var(--grass); }
  .eq.big { font-size: 1.35rem; text-align: center; }
  .area { display: grid; gap: 3px; aspect-ratio: 4 / 3; width: 100%; max-width: 300px; justify-self: center; }
  .area .cell { border-radius: 3px; background: var(--surface-solid); border: 1px solid var(--line); transition: background 0.25s; }
  .area .cell.ina { background: color-mix(in srgb, var(--sky) 35%, var(--surface-solid)); }
  .area .cell.inb { background: color-mix(in srgb, var(--sun) 35%, var(--surface-solid)); }
  .area .cell.solo.ina { background: var(--sky); box-shadow: 0 0 8px rgba(34, 211, 238, 0.45); }
  .area .cell.solo.inb { background: var(--sun); box-shadow: 0 0 8px rgba(255, 204, 102, 0.45); }
  .topic.two { display: grid; gap: 0; padding: 8px 14px; border-radius: 16px; }
  .area .cell.both { background: var(--grass); box-shadow: 0 0 6px rgba(94, 234, 154, 0.5); }
  /* A wider gap where one whole rectangle meets the next. */
  .area .cell.ec { margin-left: 6px; }
  .area .cell.er { margin-top: 6px; }
</style>
