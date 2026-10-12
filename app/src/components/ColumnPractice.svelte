<script>
  // "Одоо чи бод": the student does a column sum themselves, one column at a time, right to left,
  // tapping digits on a keypad. A wrong digit gets a hint for that column; a second miss fills it in.
  // Afterwards "Өөр бодлого" makes a fresh one of the same kind (always with a carry or a borrow).
  let { a: a0, b: b0, op = '+' } = $props();

  const PLURAL = ['Нэгжүүд', 'Аравтууд', 'Зуутууд', 'Мянгатууд'];
  const FROM = ['нэгжээс', 'аравтаас', 'зуутаас', 'мянгатаас'];

  let a = $state(a0), b = $state(b0);

  // Expected digit per column (right to left), with the carry / borrow marks and a hint for each column.
  let plan = $derived.by(() => {
    const result = op === '+' ? a + b : a - b;
    const len = Math.max(String(a).length, String(b).length, String(result).length);
    const digits = (n) => String(n).padStart(len, ' ').split('').reverse().map((c) => (c === ' ' ? null : +c));
    const da = digits(a), db = digits(b), top = [...da];
    const cols = [];
    let carry = 0;
    for (let i = 0; i < len; i++) {
      const x = top[i] ?? 0, y = db[i] ?? 0;
      if (op === '+') {
        if (da[i] == null && db[i] == null && !carry) break;
        const s = x + y + carry;
        const parts = [da[i] != null && x, db[i] != null && y, carry || false].filter((v) => v !== false);
        const hint = parts.length === 1
          ? `Шилжсэн ${carry} доор нь бичигдэнэ.`
          : `${PLURAL[i]}: ${parts.join(' + ')} = ?` + (s >= 10 ? ' 10 буюу түүнээс их бол зөвхөн нэгжийн цифрийг доор бичээд, 1-ийг дараагийн багана руу шилжүүлнэ.' : '');
        cols.push({ want: s % 10, hint, mark: s >= 10 ? { at: i + 1, v: 1 } : null });
        carry = Math.floor(s / 10);
      } else {
        if (da[i] == null) break;
        const lent = i > 0 && cols[i - 1]?.borrow;
        let hint, want, borrow = false;
        if (x < y) {
          borrow = true;
          top[i + 1] -= 1;
          want = x + 10 - y;
          hint = `${PLURAL[i]}: ${x} < ${y} тул ${FROM[i + 1]} 1 зээлнэ. ${x + 10} − ${y} = ?`;
        } else {
          want = x - y;
          hint = lent ? `${PLURAL[i]}: 1 зээлүүлсэн тул ${x} үлдсэн. ${x} − ${y} = ?` : `${PLURAL[i]}: ${x} − ${y} = ?`;
        }
        cols.push({ want, hint, borrow, mark: borrow ? { at: i + 1, v: top[i + 1] } : null });
      }
    }
    // The leading column of a subtraction answer is not written when it is 0.
    if (op === '−' && cols.length > 1 && cols.at(-1).want === 0) cols.pop();
    return { len, da, db, cols, result };
  });

  let at = $state(0); // column being solved (0 = units)
  let got = $state([]); // digits written so far
  let misses = $state(0); // on this column
  let helped = $state(false);
  let msg = $state(null); // { kind: 'hint' | 'ok' | 'given', text }
  let doneAll = $derived(at >= plan.cols.length);

  function press(d) {
    if (doneAll) return;
    const c = plan.cols[at];
    if (d === c.want) {
      got[at] = d;
      msg = { kind: 'ok', text: 'Зөв.' };
      advance();
    } else if (++misses >= 2) {
      got[at] = c.want;
      helped = true;
      msg = { kind: 'given', text: `Энд ${c.want} бичигдэнэ. ${c.hint.replace(' = ?', ' = ' + (c.want + (c.mark && op === '+' ? 10 : 0)))}` };
      advance();
    } else {
      msg = { kind: 'hint', text: c.hint };
    }
  }
  function advance() {
    at += 1;
    misses = 0;
  }
  function fresh() {
    // Two-digit numbers that always need a carry (+) or a borrow (−).
    const r = (lo, hi) => lo + Math.floor(Math.random() * (hi - lo + 1));
    if (op === '+') {
      const u1 = r(3, 9), u2 = r(10 - u1, 9);
      a = r(1, 7) * 10 + u1;
      b = r(1, 8 - Math.floor(a / 10)) * 10 + u2;
    } else {
      const u1 = r(0, 7), u2 = r(u1 + 1, 9);
      a = r(4, 9) * 10 + u1;
      b = r(1, Math.floor(a / 10) - 1) * 10 + u2;
    }
    at = 0; got = []; misses = 0; helped = false; msg = null;
  }

  const shownMark = (i) => plan.cols.findIndex((c) => c.mark?.at === i) < at && plan.cols.some((c) => c.mark?.at === i);
  const markOf = (i) => plan.cols.find((c) => c.mark?.at === i)?.mark.v;
  let cols = $derived(Array.from({ length: plan.len }, (_, k) => plan.len - 1 - k));
</script>

<div class="practice">
  <div class="paper" style:grid-template-columns="28px repeat({plan.len}, 44px)" aria-label="{a} {op} {b}">
    <span></span>
    {#each cols as i}<span class="mark" class:minus={op === '−'}>{shownMark(i) ? markOf(i) : ''}</span>{/each}
    <span></span>
    {#each cols as i}<span class="dig" class:crossed={op === '−' && shownMark(i)}>{plan.da[i] ?? ''}</span>{/each}
    <span class="op">{op}</span>
    {#each cols as i}<span class="dig">{plan.db[i] ?? ''}</span>{/each}
    <span class="rule" style:grid-column="1 / -1"></span>
    <span></span>
    {#each cols as i}
      <span class="dig res" class:on={i === at && !doneAll}>{got[i] ?? (i < plan.cols.length ? '' : '')}</span>
    {/each}
  </div>

  {#if msg && !doneAll}
    <p class="msg {msg.kind}" aria-live="polite">{msg.text}</p>
  {/if}

  {#if doneAll}
    <p class="msg ok big">{helped ? 'Боллоо. Дахиад нэгийг өөрөө бодоод үз.' : 'Сайн. Чи өөрөө бодлоо.'} {a} {op} {b} = {plan.result}</p>
    <button class="btn primary" onclick={fresh}>Өөр бодлого →</button>
  {:else}
    <p class="small muted">{['Нэгжээс', 'Аравтаас', 'Зуутаас', 'Мянгатаас'][at]} эхэлж бод. Доор бичих цифрийг дар.</p>
    <div class="keys" role="group" aria-label="Цифр">
      {#each [1, 2, 3, 4, 5, 6, 7, 8, 9, 0] as d}<button class="key" onclick={() => press(d)}>{d}</button>{/each}
    </div>
  {/if}
</div>

<style>
  .practice { display: grid; gap: 14px; justify-items: start; }
  .paper {
    display: grid; justify-self: center; align-items: center; justify-items: center; row-gap: 2px;
    padding: 12px 16px 14px; border-radius: 18px; background: var(--bg);
    font-family: var(--math); font-variant-numeric: tabular-nums;
  }
  .mark { height: 20px; font-size: 1rem; font-weight: 700; color: var(--sun); }
  .mark.minus { color: var(--sun); }
  .dig { width: 40px; height: 44px; display: grid; place-items: center; font-size: 1.9rem; line-height: 1; border-radius: 10px; }
  .dig.crossed { text-decoration: line-through; text-decoration-color: var(--sun); color: var(--muted); }
  .op { font-size: 1.9rem; color: var(--muted); }
  .rule { height: 2px; width: 100%; background: var(--ink); opacity: 0.6; margin: 4px 0; border-radius: 2px; }
  .res { color: var(--grass); font-weight: 700; }
  .res.on { outline: 2px dashed var(--sky); outline-offset: -2px; background: var(--sky-soft); }
  .msg { padding: 10px 14px; border-radius: 14px; width: 100%; }
  .msg.hint { background: var(--sun-soft); color: var(--ink); }
  .msg.given { background: var(--sky-soft); }
  .msg.ok { background: var(--grass-soft); color: var(--grass); font-weight: 700; }
  .msg.big { font-size: 1.05rem; }
  .keys { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; width: 100%; }
  .key {
    min-height: 52px; border-radius: 14px; border: 1px solid var(--line); background: var(--surface-solid);
    font: 700 1.4rem var(--math); color: var(--ink);
  }
  .key:hover { border-color: var(--sky); }
</style>
