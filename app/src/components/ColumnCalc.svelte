<script>
  // Column addition or subtraction, shown one step at a time, the way it is written in a notebook.
  // Each tap on "Дараагийн алхам" does one column, right to left, with carrying or borrowing.
  let { a, b, op = '+' } = $props();

  const NAMES = ['Нэгж', 'Аравт', 'Зуут', 'Мянгат'];
  const PLURAL = ['Нэгжүүд', 'Аравтууд', 'Зуутууд', 'Мянгатууд'];
  const FROM = ['нэгжээс', 'аравтаас', 'зуутаас', 'мянгатаас'];
  const TO = ['нэгж рүү', 'аравт руу', 'зуут руу', 'мянгат руу'];

  // Digits right to left (index 0 = units).
  const digitsOf = (n, len) => String(n).padStart(len, ' ').split('').reverse().map((c) => (c === ' ' ? null : +c));

  let plan = $derived.by(() => {
    const result = op === '+' ? a + b : a - b;
    const len = Math.max(String(a).length, String(b).length, String(result).length);
    const da = digitsOf(a, len), db = digitsOf(b, len);
    const top = [...da]; // after borrowing
    const marks = []; // small digits written above a column: carry (+) or what is left after lending (−)
    const res = Array(len).fill(null);
    const steps = [];
    let carry = 0;
    for (let i = 0; i < len; i++) {
      const x = top[i] ?? 0, y = db[i] ?? 0;
      if (da[i] == null && db[i] == null && !carry) break;
      if (op === '+') {
        const s = x + y + carry;
        const parts = [];
        if (da[i] != null) parts.push(x);
        if (db[i] != null) parts.push(y);
        if (carry) parts.push(carry);
        res[i] = s % 10;
        let text;
        if (parts.length === 1 && carry) text = `${PLURAL[i]}: шилжсэн ${carry} доор нь бичигдэнэ.`;
        else if (s >= 10) {
          marks[i + 1] = Math.floor(s / 10);
          text = `${PLURAL[i]}: ${parts.join(' + ')} = ${s}. Доор нь ${s % 10} гэж бичээд, ${Math.floor(s / 10)} нь ${TO[i + 1]} шилжинэ.`;
        } else text = `${PLURAL[i]}: ${parts.join(' + ')} = ${s}. Доор нь ${s} гэж бичнэ.`;
        carry = Math.floor(s / 10);
        steps.push({ col: i, text });
      } else {
        let text;
        if (x < y) {
          top[i + 1] -= 1;
          marks[i + 1] = top[i + 1];
          res[i] = x + 10 - y;
          text = `${PLURAL[i]}: ${x} < ${y} тул шууд хасах боломжгүй. Тиймээс ${FROM[i + 1]} 1 зээлнэ: ${x + 10} − ${y} = ${x + 10 - y}.`;
        } else {
          res[i] = x - y;
          text = `${PLURAL[i]}: ${x} − ${y} = ${x - y}.`;
          if (i > 0 && marks[i] != null) text = `${PLURAL[i]}: 1 зээлүүлсэн тул ${x} үлдсэн. ${x} − ${y} = ${x - y}.`;
        }
        steps.push({ col: i, text });
      }
    }
    // A leading zero in the answer is not written.
    for (let i = len - 1; i > 0 && res[i] === 0; i--) res[i] = null;
    return { len, da, db, marks, res, steps, result };
  });

  let step = $state(0); // how many steps are shown
  let doneAll = $derived(step >= plan.steps.length);
  let active = $derived(doneAll ? -1 : plan.steps[step].col);

  // A column's mark and result appear once its step (or, for marks, the step before) is shown.
  const shownRes = (i) => plan.steps.findIndex((s) => s.col === i) < step;
  const shownMark = (i) => plan.steps.findIndex((s) => s.col === i - 1) < step;

  // Columns left to right on screen.
  let cols = $derived(Array.from({ length: plan.len }, (_, k) => plan.len - 1 - k));
</script>

<div class="calc">
  <div class="paper" style:grid-template-columns="28px repeat({plan.len}, 44px)" role="img" aria-label="{a} {op === '+' ? 'нэмэх' : 'хасах'} {b} = {plan.result}">
    <span></span>
    {#each cols as i}<span class="name" class:on={i === active}>{NAMES[i]}</span>{/each}

    <span></span>
    {#each cols as i}<span class="mark" class:minus={op === '−'}>{plan.marks[i] != null && shownMark(i) ? plan.marks[i] : ''}</span>{/each}

    <span></span>
    {#each cols as i}
      <span class="dig" class:on={i === active} class:crossed={op === '−' && plan.marks[i] != null && shownMark(i)}>{plan.da[i] ?? ''}</span>
    {/each}

    <span class="op">{op}</span>
    {#each cols as i}<span class="dig" class:on={i === active}>{plan.db[i] ?? ''}</span>{/each}

    <span class="rule" style:grid-column="1 / -1"></span>

    <span></span>
    {#each cols as i}<span class="dig res" class:on={i === active}>{plan.res[i] != null && shownRes(i) ? plan.res[i] : ''}</span>{/each}
  </div>

  <ol class="steps" aria-live="polite">
    {#each plan.steps.slice(0, step) as s, k}<li class:last={k === step - 1}>{s.text}</li>{/each}
  </ol>

  {#if doneAll}
    <p class="answer">Хариу: {a} {op} {b} = {plan.result}</p>
    <button class="btn" onclick={() => (step = 0)}>Дахин үзэх</button>
  {:else}
    <button class="btn primary" onclick={() => step++}>{step === 0 ? 'Бодож эхлэх' : 'Дараагийн алхам'} →</button>
  {/if}
</div>

<style>
  .calc { display: grid; gap: 16px; justify-items: start; }
  .paper {
    display: grid; justify-self: center; align-items: center; justify-items: center; row-gap: 2px;
    padding: 12px 16px 14px; border-radius: 18px; background: var(--bg);
    font-family: var(--math); font-variant-numeric: tabular-nums;
  }
  .name { font: 700 0.68rem var(--font); color: var(--muted); padding: 2px 4px; border-radius: 6px; transition: color 0.25s, background 0.25s; }
  .name.on { color: var(--on-sky); background: var(--sky); }
  .mark { height: 20px; font-size: 1rem; font-weight: 700; color: var(--sun); }
  .mark.minus { color: var(--warn); }
  .dig {
    width: 40px; height: 44px; display: grid; place-items: center; font-size: 1.9rem; line-height: 1;
    border-radius: 10px; transition: background 0.25s, color 0.25s;
  }
  .dig.on { background: var(--sky-soft); color: var(--sky-deep); }
  .dig.crossed { text-decoration: line-through; text-decoration-color: var(--warn); color: var(--muted); }
  .op { font-size: 1.9rem; color: var(--muted); }
  .rule { height: 2px; width: 100%; background: var(--ink); opacity: 0.6; margin: 4px 0; border-radius: 2px; }
  .res { color: var(--grass); font-weight: 700; }
  .res:empty::after { content: ''; }

  .steps { margin: 0; padding: 0 0 0 20px; display: grid; gap: 8px; width: 100%; }
  .steps li { color: var(--muted); }
  .steps li.last { color: var(--ink); animation: in 0.35s cubic-bezier(0.32, 0.72, 0, 1); }
  @keyframes in { from { opacity: 0; transform: translateY(6px); } }
  .answer { padding: 6px 14px; border-radius: 999px; font-weight: 800; background: var(--grass-soft); color: var(--grass); }
</style>
