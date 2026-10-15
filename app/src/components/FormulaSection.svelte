<script>
  // «Томьёо ба аргачлал» (owner, 2026-10-16): built to hold many formulas and still stay compact.
  // Groups stay closed until tapped; each formula is its own row, and a row with a definition or method opens under itself.
  // Topic content may give `groups: [{ title, items: [{ f, name?, def?, steps?: [] }] }]`. Until it does, groups are built
  // from what exists (formulas, rules, the topic method and each lesson's worked method), without adding content.
  import RichText from './RichText.svelte';
  import ColumnCalc from './ColumnCalc.svelte';

  let { tc = null, formulas = [], methods = [] } = $props();

  let groups = $derived.by(() => {
    if (tc?.groups?.length) return tc.groups;
    const g = [];
    if (formulas.length) g.push({ title: 'Томьёо', items: formulas.map((f) => ({ f })) });
    if (tc?.rules?.length) g.push({ title: 'Дүрэм', items: tc.rules.map((r) => ({ f: r, text: true })) });
    const how = [];
    if (tc?.method?.length) how.push({ f: 'Алхам алхмаар', text: true, steps: tc.method });
    for (const m of methods) how.push({ f: m.title, text: true, steps: m.steps, column: m.column });
    if (how.length) g.push({ title: 'Бодох арга', items: how });
    return g;
  });
  let total = $derived(groups.reduce((n, x) => n + x.items.length, 0));
  const opens = (x) => x.def || x.steps?.length || x.column;
</script>

{#if total}
  <section id="sec-fx" class="sec" style:--k="var(--c)">
    <h3><i>ƒ</i>Томьёо ба аргачлал <span>· {total}</span></h3>
    {#each groups as g, gi}
      <details class="grp" open={gi === 0}>
        <summary>{g.title}<span class="n">{g.items.length}</span></summary>
        <div class="items">
          {#each g.items as x}
            {#if opens(x)}
              <details class="fx">
                <summary class:text={x.text}>{#if x.name}<span class="nm">{x.name}</span>{/if}<RichText text={x.f} /></summary>
                <div class="more">
                  {#if x.def}<p><RichText text={x.def} /></p>{/if}
                  {#if x.column}<ColumnCalc {...x.column} />{/if}
                  {#if x.steps?.length}<ol>{#each x.steps as s}<li><RichText text={s} /></li>{/each}</ol>{/if}
                </div>
              </details>
            {:else}
              <div class="fx plain" class:text={x.text}>{#if x.name}<span class="nm">{x.name}</span>{/if}<RichText text={x.f} /></div>
            {/if}
          {/each}
        </div>
      </details>
    {/each}
  </section>
{/if}

<style>
  .grp { border: 1px solid var(--line); border-radius: 14px; background: var(--surface-solid); }
  .grp > summary { list-style: none; padding: 12px 14px; font-weight: 800; display: flex; align-items: center; gap: 10px; cursor: pointer; }
  .grp > summary::-webkit-details-marker, .fx > summary::-webkit-details-marker { display: none; }
  .grp > summary::after { content: '▸'; color: var(--c); transition: transform 0.2s; }
  .grp[open] > summary::after { transform: rotate(90deg); }
  .grp .n { margin-left: auto; color: var(--muted); font-weight: 600; font-size: 0.85rem; }
  .items { display: grid; gap: 6px; padding: 0 10px 10px; }
  .fx { border: 1px solid color-mix(in srgb, var(--c) 30%, var(--line)); border-radius: 10px; background: var(--bg); }
  .fx > summary, .fx.plain { list-style: none; padding: 10px 12px; font-family: var(--math); font-size: 1.1rem; overflow-x: auto; }
  .fx > summary { cursor: pointer; display: flex; gap: 8px; align-items: baseline; }
  .fx > summary::after { content: '+'; margin-left: auto; color: var(--c); font-family: var(--font); font-weight: 800; }
  .fx[open] > summary::after { content: '−'; }
  .text { font-family: var(--font) !important; font-size: 0.92rem !important; }
  .nm { font-family: var(--font); font-size: 0.8rem; color: var(--muted); font-weight: 700; }
  .more { padding: 0 12px 10px; display: grid; gap: 8px; font-size: 0.92rem; }
  .more p { margin: 0; }
  .more ol { margin: 0; padding-left: 20px; display: grid; gap: 4px; }
</style>
