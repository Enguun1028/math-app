// Reads a line typed into the graph calculator, the way students write math: 2x, ax^2, sin x, √x, π, tg x,
// 0,5 with a decimal comma, |x|, log_2 x. No eval: lines are parsed into a small tree and evaluated by hand,
// so they work under the app's Content Security Policy and can never run code.

const FUNCS = {
  sin: Math.sin, cos: Math.cos, tan: Math.tan, tg: Math.tan, cot: (v) => 1 / Math.tan(v), ctg: (v) => 1 / Math.tan(v),
  sqrt: Math.sqrt, abs: Math.abs, ln: Math.log, lg: Math.log10, log: Math.log10, exp: Math.exp,
  arcsin: Math.asin, arccos: Math.acos, arctan: Math.atan, arctg: Math.atan,
};
const NAMES = Object.keys(FUNCS).sort((a, b) => b.length - a.length);
// Letters that are never sliders: the axes and e.
const FIXED = new Set(['x', 'y', 'e']);

function normalize(s) {
  return s
    .replace(/[·×∙]/g, '*').replace(/÷/g, '/').replace(/[−–]/g, '-')
    .replace(/²/g, '^2').replace(/³/g, '^3').replace(/π/g, 'pi').replace(/√/g, 'sqrt')
    .replace(/≤/g, '<=').replace(/≥/g, '>=')
    .replace(/(\d),(\d)/g, '$1.$2'); // decimal comma, as written in Mongolian textbooks
}

function tokenize(s) {
  const out = [];
  let i = 0;
  while (i < s.length) {
    const c = s[i];
    if (/\s/.test(c)) { i++; continue; }
    const num = /^(\d+\.?\d*|\.\d+)/.exec(s.slice(i));
    if (num) { out.push({ t: 'num', v: parseFloat(num[1]) }); i += num[1].length; continue; }
    const word = /^[a-zA-Z]+/.exec(s.slice(i));
    if (word) {
      // Split a run of letters into function names and single letters: "ax" -> a x, "sinx" -> sin x.
      let w = word[0];
      i += w.length;
      while (w) {
        const f = NAMES.find((n) => w.toLowerCase().startsWith(n));
        if (f) { out.push({ t: 'fn', v: f }); w = w.slice(f.length); }
        else if (w.toLowerCase().startsWith('pi')) { out.push({ t: 'num', v: Math.PI }); w = w.slice(2); }
        else { const l = w[0]; out.push(l === 'e' ? { t: 'num', v: Math.E } : { t: 'id', v: l }); w = w.slice(1); }
      }
      continue;
    }
    if ('+-*/^()|_'.includes(c)) { out.push({ t: c }); i++; continue; }
    throw new Error('bad char ' + c);
  }
  return out;
}

// Recursive descent. Each node is { k, ... }; params collects the slider letters it meets.
function parse(tokens, params) {
  let p = 0;
  const peek = () => tokens[p];
  const eat = (t) => { if (peek()?.t !== t) throw new Error('expected ' + t); return tokens[p++]; };
  const startsPrimary = (tk) => tk && (tk.t === 'num' || tk.t === 'id' || tk.t === 'fn' || tk.t === '(' );

  function expr() {
    let n = term();
    while (peek() && (peek().t === '+' || peek().t === '-')) { const op = tokens[p++].t; n = { k: op, a: n, b: term() }; }
    return n;
  }
  function term() {
    let n = unary();
    for (;;) {
      const tk = peek();
      if (tk && (tk.t === '*' || tk.t === '/')) { p++; n = { k: tk.t, a: n, b: unary() }; }
      else if (startsPrimary(tk)) n = { k: '*', a: n, b: power() }; // implicit: 2x, a(x+1), x sin x
      else return n;
    }
  }
  function unary() {
    if (peek()?.t === '-') { p++; return { k: 'neg', a: unary() }; }
    if (peek()?.t === '+') { p++; return unary(); }
    return power();
  }
  function power() {
    const base = primary();
    if (peek()?.t === '^') { p++; return { k: '^', a: base, b: unary() }; }
    return base;
  }
  function primary() {
    const tk = peek();
    if (!tk) throw new Error('end');
    if (tk.t === 'num') { p++; return { k: 'num', v: tk.v }; }
    if (tk.t === 'id') { p++; if (!FIXED.has(tk.v)) params.add(tk.v); return { k: 'var', v: tk.v }; }
    if (tk.t === '(') { p++; const n = expr(); eat(')'); return n; }
    if (tk.t === '|') { p++; const n = expr(); eat('|'); return { k: 'fn', f: 'abs', a: n }; }
    if (tk.t === 'fn') {
      p++;
      if (tk.v === 'log' && peek()?.t === '_') { // log_2 x
        p++;
        const base = primary();
        return { k: 'logb', base, a: peek()?.t === '(' ? primary() : unary() };
      }
      return { k: 'fn', f: tk.v, a: peek()?.t === '(' ? primary() : unary() };
    }
    throw new Error('unexpected ' + tk.t);
  }

  const n = expr();
  if (p < tokens.length) throw new Error('extra');
  return n;
}

function compile(n) {
  switch (n.k) {
    case 'num': return () => n.v;
    case 'var': return (env) => env[n.v] ?? NaN;
    case 'neg': { const a = compile(n.a); return (env) => -a(env); }
    case 'fn': { const a = compile(n.a), f = FUNCS[n.f]; return (env) => f(a(env)); }
    case 'logb': { const a = compile(n.a), b = compile(n.base); return (env) => Math.log(a(env)) / Math.log(b(env)); }
    default: {
      const a = compile(n.a), b = compile(n.b);
      if (n.k === '+') return (env) => a(env) + b(env);
      if (n.k === '-') return (env) => a(env) - b(env);
      if (n.k === '*') return (env) => a(env) * b(env);
      if (n.k === '/') return (env) => a(env) / b(env);
      return (env) => Math.pow(a(env), b(env));
    }
  }
}

function uses(n, v) {
  if (!n) return false;
  if (n.k === 'var') return n.v === v;
  return uses(n.a, v) || uses(n.b, v) || uses(n.base, v);
}

function side(s, params) {
  const node = parse(tokenize(s), params);
  return { node, fn: compile(node) };
}

// One typed line -> what to draw.
//   { kind: 'fn', f }         y = f(x), or just an expression in x
//   { kind: 'vline', f }      x = c
//   { kind: 'implicit', f }   any equation in x and y, drawn where f(x, y) = 0
//   { kind: 'point', fx, fy } (2, 3)
//   { kind: 'slider', name, value }  a = 2
//   { kind: 'value', f }      an expression without x or y: its number is shown
//   { kind: 'empty' } | { kind: 'error', msg }
// params: the slider letters the line uses.
export function readLine(raw) {
  const params = new Set();
  const s = normalize(raw.trim());
  if (!s) return { kind: 'empty', params };
  try {
    if (/[<>]/.test(s)) return { kind: 'error', msg: 'Тэнцэтгэл бишийг удахгүй зурна', params };
    const pt = /^\(([^,;]+)[,;]([^,;]+)\)$/.exec(raw.trim().replace(/(\d),(\d)/g, '$1.$2'));
    if (pt) {
      const a = side(normalize(pt[1]), params), b = side(normalize(pt[2]), params);
      return { kind: 'point', fx: a.fn, fy: b.fn, params };
    }
    const sl = /^([a-df-wzA-Z])\s*=\s*(-?\d+\.?\d*)$/.exec(s);
    if (sl && !FIXED.has(sl[1])) return { kind: 'slider', name: sl[1], value: parseFloat(sl[2]), params };
    const parts = s.split('=');
    if (parts.length > 2) return { kind: 'error', msg: 'Нэг л «=» бичээрэй', params };
    if (parts.length === 1) {
      const r = side(parts[0], params);
      if (uses(r.node, 'y')) return { kind: 'implicit', f: (env) => r.fn(env), params };
      return uses(r.node, 'x') ? { kind: 'fn', f: r.fn, params } : { kind: 'value', f: r.fn, params };
    }
    let [l, r] = parts.map((x) => x.trim());
    if (!l || !r) return { kind: 'error', msg: 'Тэнцүүгийн хоёр талыг бичээрэй', params };
    if (/^[a-z]\(x\)$/.test(l)) l = 'y';
    if (r === 'y' && l !== 'y') [l, r] = [r, l];
    const L = side(l, params), R = side(r, params);
    if (l === 'y' && !uses(R.node, 'y')) return { kind: 'fn', f: R.fn, params };
    if (l === 'x' && !uses(R.node, 'x') && !uses(R.node, 'y')) return { kind: 'vline', f: R.fn, params };
    if (!uses(L.node, 'x') && !uses(L.node, 'y') && !uses(R.node, 'x') && !uses(R.node, 'y'))
      return { kind: 'error', msg: 'x эсвэл y хэрэгтэй', params };
    return { kind: 'implicit', f: (env) => L.fn(env) - R.fn(env), params };
  } catch {
    return { kind: 'error', msg: 'Ойлгосонгүй. Жишээ: y = 2x + 1', params };
  }
}

// Starting value for a slider nobody has set yet.
export const defaultParam = (name) => ({ b: 0, c: 0, d: 0, h: 0, n: 2, r: 3 })[name] ?? 1;
