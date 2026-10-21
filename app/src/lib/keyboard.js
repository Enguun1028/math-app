// The phone keyboard must never hide the box being typed in (owner, 2026-10-21: "the bug type section is lower
// than the keyboard so it gets hidden ... its frustrating").
// iPhones draw the keyboard over the page without making the page shorter, so anything fixed to the bottom
// (sheets, the topic card) ends up behind it. This keeps two things on <html> up to date:
//   --kb      how much of the screen bottom the keyboard covers (0 on Android, where the page shrinks instead);
//   --vvh     the height that is still visible above the keyboard;
//   .typing   while a text box has focus, so the tab bar and the bug button step aside.
// Sheets sit on top of --kb (app.css), and the focused box is scrolled into view once the keyboard is up.
const root = document.documentElement;
const vv = window.visualViewport;
const isText = (el) => el?.matches?.('textarea, input:not([type=range]):not([type=checkbox]):not([type=radio]):not([type=button])');

function measure() {
  if (!vv) return;
  const kb = Math.max(0, Math.round(innerHeight - vv.height - vv.offsetTop));
  root.style.setProperty('--kb', kb + 'px');
  root.style.setProperty('--vvh', Math.round(vv.height) + 'px');
}

// The box and its send button (its whole form) are scrolled above the keyboard. scrollIntoView is not enough:
// on an iPhone the page does not get shorter, so the browser thinks a box behind the keyboard is in sight.
function scrollParent(el) {
  for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
    const o = getComputedStyle(p).overflowY;
    if ((o === 'auto' || o === 'scroll') && p.scrollHeight > p.clientHeight) return p;
  }
  return null;
}
function show(el) {
  const target = el.closest('form') ?? el;
  const r = target.getBoundingClientRect();
  const top = (vv?.offsetTop ?? 0) + 12;
  const bottom = (vv ? vv.offsetTop + vv.height : innerHeight) - 12;
  let dy = 0;
  if (r.bottom > bottom) dy = Math.min(r.bottom - bottom, r.top - top); // never push the box's top out of sight
  else if (r.top < top) dy = r.top - top;
  if (Math.abs(dy) < 2) return;
  const p = scrollParent(target);
  if (p) p.scrollBy({ top: dy, behavior: 'smooth' });
  else window.scrollBy({ top: dy, behavior: 'smooth' });
}
// Again while the keyboard slides in (about 0.3 s) and when an iPhone adds its suggestion bar.
function reveal(el) {
  for (const t of [80, 350, 700]) setTimeout(() => { if (document.activeElement === el) show(el); }, t);
}

if (vv) {
  vv.addEventListener('resize', () => { measure(); if (isText(document.activeElement)) show(document.activeElement); });
  vv.addEventListener('scroll', measure);
  measure();
}
document.addEventListener('focusin', (e) => {
  if (!isText(e.target)) return;
  root.classList.add('typing');
  reveal(e.target);
});
document.addEventListener('focusout', (e) => {
  if (!isText(e.target)) return;
  // Moving straight to another box keeps the keyboard up.
  setTimeout(() => { if (!isText(document.activeElement)) root.classList.remove('typing'); }, 50);
});
