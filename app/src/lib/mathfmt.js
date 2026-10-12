// Shows math typed as plain text the way a textbook prints it: 3x+7^2 -> 3x + 7²

const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

export function looksLikeMath(q) {
  return /\d\s*[-+*/^=:<>]\s*[\d(a-z]|[a-z]\s*\^|\d[a-z]|sqrt|√/i.test(q);
}

// Returns safe HTML (input is escaped first).
export function formatMath(q) {
  let s = esc(q.trim());
  // Spacing first, on plain text, so HTML added later is never touched.
  s = s.replace(/\s*\*\s*/g, ' · ');
  s = s.replace(/\s*(&lt;=|&gt;=)\s*/g, (_, o) => (o === '&lt;=' ? ' ≤ ' : ' ≥ '));
  s = s.replace(/\s*(=|\+|&lt;|&gt;|:)\s*/g, ' $1 ');
  // Binary minus gets spaces; a leading minus or one after an operator stays attached.
  s = s.replace(/(\S)\s*-\s*/g, (m, a) => (/[(^]/.test(a) ? `${a}−` : /[=+·:;]/.test(a) ? `${a} −` : `${a} − `));
  s = s.replace(/^-/, '−').replace(/\^ −/g, '^−');
  s = s.replace(/\s*\/\s*/g, '/');
  // Single letters are variables: italic.
  s = s.replace(/(^|[^a-z&])([a-z])(?![a-z])/gi, '$1<i>$2</i>');
  s = s.replace(/sqrt\s*\(([^)]*)\)/gi, '√<span class="ovl">$1</span>');
  s = s.replace(/\^\s*\(([^)]*)\)/g, '<sup>$1</sup>');
  s = s.replace(/\^\s*(−?(?:<i>\w<\/i>|[\w.])+)/g, '<sup>$1</sup>');
  // Fractions stacked, never with a slash (owner rule).
  s = s.replace(/(\d+|<i>\w<\/i>)\/(\d+|<i>\w<\/i>)/g, '<span class="frac"><span class="n">$1</span><span class="d">$2</span></span>');
  return s.replace(/\s+/g, ' ').trim();
}

// Operators present in an expression, for matching sign entries.
export function operatorsIn(q) {
  const ops = new Set();
  if (/\+/.test(q)) ops.add('+');
  if (/\d\s*-\s*[\d(]|[a-z)]\s*-/.test(q)) ops.add('−');
  if (/(^|[-+*\/=(×÷:]\s*)-\s*\d/.test(q)) ops.add('sorog');
  if (/[*×·]|\d[a-z(]/i.test(q)) ops.add('×');
  if (/[\/÷:]/.test(q)) ops.add('÷');
  if (/=/.test(q)) ops.add('=');
  if (/%/.test(q)) ops.add('%');
  if (/\^|[²³ⁿ]/.test(q)) ops.add('^');
  if (/sqrt|√/i.test(q)) ops.add('sqrt');
  if (/\(/.test(q) || (/\d\s*[-+]\s*\d/.test(q) && /[*×·\/÷:]|\d[a-z]/i.test(q))) ops.add('order');
  return ops;
}
