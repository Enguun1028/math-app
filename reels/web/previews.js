const C = { bg: '#05070d', ink: '#e8f0ff', mut: '#8a97b8', cy: '#3df2ff', pk: '#ff4fd8', ye: '#ffe14d', gr: '#5dff9d', line: '#1a2340' };
const W = 360, H = 640;
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const seg = (t, a, b) => clamp((t - a) / (b - a));
const ease = (x) => x * x * (3 - 2 * x);
const sp = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
const M = (w, s) => `${w} ${s}px Montserrat, "Segoe UI", system-ui, sans-serif`;
const MONO = (w, s) => `${w} ${s}px "JetBrains Mono", ui-monospace, monospace`;

function txt(g, s, x, y, { font = M(700, 16), color = C.ink, align = 'center', glow = 0, alpha = 1 } = {}) {
  g.save(); g.globalAlpha = alpha; g.font = font; g.fillStyle = color; g.textAlign = align; g.textBaseline = 'middle';
  if (glow) { g.shadowColor = color; g.shadowBlur = glow; }
  g.fillText(s, x, y); g.restore();
}
function wrapTxt(g, s, x, y, maxW, lh, opts) {
  g.save(); g.font = opts.font; const words = s.split(' '); const lines = []; let cur = '';
  for (const w of words) { const t = cur ? cur + ' ' + w : w; if (g.measureText(t).width > maxW && cur) { lines.push(cur); cur = w; } else cur = t; }
  lines.push(cur); g.restore();
  lines.forEach((l, i) => txt(g, l, x, y + i * lh, opts));
  return lines.length;
}
// Fractions are always stacked: numerator over denominator.
function frac(g, n, d, x, y, size, color) {
  const alpha = g.globalAlpha; // honours a fade set by the caller
  g.save(); g.font = M(800, size); const half = Math.max(g.measureText(n).width, g.measureText(d).width, size * 0.9) / 2; g.restore();
  txt(g, n, x, y - size * 0.62, { font: M(800, size), color, alpha });
  g.save(); g.globalAlpha = alpha; g.strokeStyle = color; g.lineWidth = 2; g.beginPath(); g.moveTo(x - half, y); g.lineTo(x + half, y); g.stroke(); g.restore();
  txt(g, d, x, y + size * 0.62, { font: M(800, size), color, alpha });
}
function rrect(g, x, y, w, h, r) { g.beginPath(); g.roundRect(x, y, w, h, r); }
function base(g, tag, caption, capAlpha = 1) {
  const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#070b18'); gr.addColorStop(1, C.bg);
  g.fillStyle = gr; g.fillRect(0, 0, W, H);
  g.save(); g.strokeStyle = 'rgba(61,242,255,0.05)'; g.lineWidth = 1;
  for (let x = 0; x <= W; x += 30) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke(); }
  for (let y = 0; y <= H; y += 30) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
  g.restore();
  // матемап logo pill, top centre, on every Reel
  g.save(); rrect(g, W / 2 - 52, 22, 104, 26, 13); g.fillStyle = 'rgba(61,242,255,0.10)'; g.fill(); g.strokeStyle = 'rgba(61,242,255,0.6)'; g.lineWidth = 1; g.stroke(); g.restore();
  txt(g, 'матемап', W / 2, 35.5, { font: M(800, 13), color: C.cy, glow: 8 });
  if (tag) txt(g, tag, W / 2, 70, { font: MONO(700, 11), color: C.mut });
  if (caption) txt(g, caption, W / 2, H - 120, { font: M(700, 15), color: C.ink, alpha: capAlpha });
}

/* ---------- previews ---------- */
const P = {};

// A simple stick figure; phase drives the running stride.
function stick(g, x, y, s, phase, color, { run = true, arms = null } = {}) {
  g.save(); g.strokeStyle = color; g.lineWidth = 2.4 * s; g.lineCap = 'round'; g.shadowColor = color; g.shadowBlur = 8;
  const sw = run ? Math.sin(phase) : 0, hip = [x, y - 22 * s], neck = [x + (run ? 4 * s : 0), y - 44 * s];
  g.beginPath(); g.arc(neck[0] + (run ? 2 * s : 0), neck[1] - 8 * s, 7 * s, 0, 7); g.stroke();
  g.beginPath(); g.moveTo(...hip); g.lineTo(...neck); g.stroke();
  const leg = (a) => { const kx = hip[0] + Math.sin(a) * 12 * s, ky = hip[1] + 11 * s; g.beginPath(); g.moveTo(...hip); g.lineTo(kx, ky); g.lineTo(kx + Math.sin(a - 0.9) * 10 * s, y); g.stroke(); };
  leg(sw * 0.9); leg(-sw * 0.9);
  const sh = [neck[0] - 1 * s, neck[1] + 5 * s];
  if (arms) { arms(sh); } else {
    const arm = (a) => { const ex = sh[0] + Math.sin(a) * 10 * s, ey = sh[1] + 9 * s; g.beginPath(); g.moveTo(...sh); g.lineTo(ex, ey); g.lineTo(ex + 8 * s * Math.cos(a), ey - 5 * s); g.stroke(); };
    arm(-sw); arm(sw);
  }
  g.restore();
}
function bracket(g, x0, y0, w, h, leaves, alpha) {
  g.save(); g.globalAlpha = alpha; g.strokeStyle = 'rgba(61,242,255,0.75)'; g.lineWidth = 1.2;
  let ys = Array.from({ length: leaves }, (_, i) => y0 + (i + 0.5) * h / leaves), x = x0, step = w / Math.log2(leaves);
  while (ys.length > 1) {
    const next = [];
    for (let i = 0; i < ys.length; i += 2) { const a = ys[i], b = ys[i + 1], m = (a + b) / 2; g.beginPath(); g.moveTo(x, a); g.lineTo(x + step, a); g.lineTo(x + step, b); g.lineTo(x, b); g.moveTo(x + step, m); g.lineTo(x + step + 6, m); g.stroke(); next.push(m); }
    ys = next; x += step;
  }
  g.restore();
  return [x, ys[0]];
}

// A default profile icon: small circle head, half-circle body.
function person(g, x, y, s, color, alpha = 1) {
  g.save(); g.globalAlpha = alpha; g.fillStyle = color; g.shadowColor = color; g.shadowBlur = 6;
  g.beginPath(); g.arc(x, y - 17 * s, 7 * s, 0, 7); g.fill();
  g.beginPath(); g.arc(x, y + 6 * s, 13 * s, Math.PI, 0); g.closePath(); g.fill();
  g.restore();
}
// Hand shapes drawn as neon line icons (emoji fonts differ between phones). k: r rock, p paper, s scissors.
const MOVE_NAME = { r: 'чулуу', p: 'даавуу', s: 'хайч' };
function hand(g, k, x, y, size, alpha = 1, color = C.ink) {
  const u = size / 32;
  g.save(); g.globalAlpha = alpha; g.translate(x, y); g.scale(u, u);
  g.strokeStyle = color; g.fillStyle = color.startsWith('#') ? color + '26' : 'rgba(255,255,255,0.15)'; g.lineWidth = 2.6; g.lineJoin = 'round'; g.lineCap = 'round';
  g.shadowColor = color; g.shadowBlur = 8;
  const finger = (fx, fy, w, h, r = w / 2) => { rrect(g, fx, fy, w, h, r); g.fill(); g.stroke(); };
  if (k === 'r') { // a fist: round palm with folded fingers and a thumb
    rrect(g, -13, -11, 26, 24, 10); g.fill(); g.stroke();
    g.beginPath(); for (const fx of [-6.5, 0, 6.5]) { g.moveTo(fx, -11); g.lineTo(fx, -3); } g.stroke();
    g.beginPath(); g.moveTo(-13, 3); g.quadraticCurveTo(-2, 1, 4, 6); g.stroke();
  } else if (k === 'p') { // an open hand: palm and four straight fingers, thumb to the side
    for (const [fx, h] of [[-11, 15], [-5, 18], [1, 18], [7, 15]]) finger(fx, -3 - h, 5, h + 4);
    g.save(); g.translate(-12, 6); g.rotate(-0.9); finger(-2.5, -12, 5, 13); g.restore();
    rrect(g, -12, -4, 24, 18, 7); g.fill(); g.stroke();
  } else { // scissors: two fingers in a V on a small fist
    g.save(); g.translate(-3, -2); g.rotate(-0.38); finger(-2.6, -22, 5.2, 22); g.restore();
    g.save(); g.translate(3, -2); g.rotate(0.38); finger(-2.6, -22, 5.2, 22); g.restore();
    rrect(g, -11, -4, 22, 17, 7); g.fill(); g.stroke();
  }
  g.restore();
}

// Rounds of the 8-billion knockout: slow with a zoom for the first three, medium, then fast, slow again at the end.
const RPS_T0 = 11.0;
const RPS_DUR = Array.from({ length: 33 }, (_, i) => (i < 3 ? 2.2 : i < 6 ? 0.9 : i < 30 ? 0.2 : 1.0));
const RPS_START = RPS_DUR.reduce((a, d, i) => (a.push(i ? a[i - 1] + RPS_DUR[i - 1] : RPS_T0), a), []);
const RPS_END = RPS_START[32] + RPS_DUR[32];
const alive = (k) => (k === 0 ? 8e9 : Math.max(1, Math.ceil(8e9 / 2 ** k)));
P.rps = { L: Math.ceil(RPS_END + 14.5), draw(g, t) {
  let cap = 'Хэдэн удаа ялах ёстой вэ?';
  if (t > 2.6) cap = 'Хайч, чулуу, даавуу… бууд!';
  if (t > 4.7) cap = 'Баруун талынхан бүгд яллаа';
  if (t > 6.8) cap = 'Ялагдсан хүн хасагдана';
  if (t > 8.3) cap = '10 хүн → 5 хүн. Яг тал нь!';
  if (t > RPS_T0) cap = 'Тал нь хасагдлаа… үлдсэн рүүгээ ойртъё';
  if (t > RPS_START[6]) cap = 'Дахиад тал нь… дахиад тал нь…';
  if (t > RPS_END) cap = 'Сүүлийн тоглолт';
  base(g, 'ЛОГАРИФМ', t > RPS_END + 1.8 ? '' : cap);
  wrapTxt(g, 'Дэлхийн бүх хүн хайч, чулуу, даавуу тэмцээнд орвол?', W / 2, 104, 300, 24, { font: M(800, 18) });

  if (t < 2.6) { // the tournament picture
    const a = seg(t, 0.1, 0.8) * (1 - seg(t, 2.2, 2.6));
    const [ex, ey] = bracket(g, 40, 180, 250, 330, 32, a);
    txt(g, '?', ex + 14, ey, { font: M(800, 26), color: C.ye, glow: 12, alpha: a });
    return;
  }
  if (t < RPS_T0) { // 5 against 5: the left side throws all sorts, the right side wins every match
    const Lm = ['r', 'p', 's', 'r', 'p'], Rm = ['p', 's', 'r', 'p', 's'];
    const shoot = 4.6, red = seg(t, 6.8, 7.2), gone = seg(t, 7.6, 8.3), fade = 1 - seg(t, 10.4, RPS_T0);
    txt(g, '5 тоглолт', W / 2, 160, { font: MONO(700, 14), color: C.mut, alpha: fade });
    for (let i = 0; i < 5; i++) {
      const y = 200 + i * 62;
      const bob = t < shoot ? Math.abs(Math.sin((t - 3.1) * Math.PI * 2 / 0.5)) * 9 * seg(t, 3.1, 3.2) : 0;
      const lc = red > 0 ? `rgb(255,${Math.round(240 - 163 * red)},${Math.round(255 - 146 * red)})` : C.ink;
      person(g, 46, y + gone * 20, 1, lc, (1 - gone) * fade);
      person(g, 314, y, 1, C.cy, fade);
      if (t < shoot) { hand(g, 'r', 112, y - 4 - bob, 34, seg(t, 2.8, 3.1) * fade); hand(g, 'r', 248, y - 4 - bob, 34, seg(t, 2.8, 3.1) * fade, C.cy); }
      else {
        const pop = 1 + 0.3 * (1 - seg(t, shoot, shoot + 0.25)), la = (1 - gone) * fade;
        hand(g, Lm[i], 112, y - 6, 36 * pop, la, red > 0 ? '#ff4d6d' : C.ink);
        hand(g, Rm[i], 248, y - 6, 36 * pop, fade, C.cy);
        txt(g, MOVE_NAME[Lm[i]], 112, y + 22, { font: M(700, 10), color: C.mut, alpha: la * seg(t, 4.8, 5.1) });
        txt(g, MOVE_NAME[Rm[i]], 248, y + 22, { font: M(700, 10), color: C.mut, alpha: fade * seg(t, 4.8, 5.1) });
        const win = seg(t, 5.0 + i * 0.25, 5.25 + i * 0.25); // matches resolve one by one, top to bottom
        txt(g, '<', 180, y - 6, { font: M(800, 22), color: C.cy, glow: 8, alpha: win * la });
      }
    }
    return;
  }
  // 8 billion as a box of tiny rectangles. Each round half turns red and goes; the camera zooms into the half
  // that is left, and its rectangles split again. Cuts alternate: left half, then top half.
  let k = 0; while (k < 33 && t >= RPS_START[k]) k++;
  const r = k - 1, p = r >= 0 ? seg(t, RPS_START[r], RPS_START[r] + RPS_DUR[r]) : 0;
  const before = alive(r), after = alive(k);
  const bx = 50, by = 210, bw = 260, bh = 260;
  if (t < RPS_END) {
    txt(g, `Тоглолт: ${k}`, W / 2, 150, { font: MONO(700, 15), color: C.ye, glow: 6 });
    txt(g, `${sp(p < 0.45 ? before : after)} хүн`, W / 2, 178, { font: MONO(700, 20), color: C.ink });
    const many = before > 1024, vertical = r % 2 === 1; // odd rounds cut the top half
    const n = many ? 1024 : Math.ceil(before);
    const cols = many ? 32 : Math.ceil(Math.sqrt(n)), rows = many ? 32 : Math.ceil(n / cols);
    const cw = bw / cols, ch = bh / rows;
    const z = ease(seg(p, 0.55, 1)); // zoom into the survivors
    for (let i = 0; i < n; i++) {
      const c = i % cols, rr = Math.floor(i / cols);
      const dies = many ? (vertical ? rr < 16 : c < 16) : i >= Math.ceil(n / 2);
      let x = bx + c * cw, y = by + rr * ch, w = cw, h = ch, col = C.cy, al = 1;
      if (dies) { col = p > 0.12 ? '#ff4d6d' : C.cy; al = 1 - seg(p, 0.3, 0.55); }
      else if (many && !vertical) { x = bx + (c - 16) * cw * (1 + z) + 16 * cw * (1 - z); w = cw * (1 + z); }
      else if (many && vertical) { y = by + (rr - 16) * ch * (1 + z) + 16 * ch * (1 - z); h = ch * (1 + z); }
      if (al <= 0) continue;
      const gap = Math.min(1, w * 0.12, h * 0.12);
      g.save(); g.globalAlpha = al; g.fillStyle = col; g.fillRect(x, y, Math.max(w - gap, 0.6), Math.max(h - gap, 0.6)); g.restore();
    }
    if (r < 3 && p > 0.55) txt(g, 'томруулж харъя', W / 2, by + bh + 22, { font: M(700, 13), color: C.mut, alpha: seg(p, 0.55, 0.7) });
    if (!many && n <= 2) txt(g, '1 × 1', W / 2, by + bh + 26, { font: M(800, 18), color: C.ye });
    return;
  }
  const fin = t - RPS_END;
  if (fin < 1.8) { // the last stand
    person(g, 120, 400, 1.6, '#ff4d6d', 1 - seg(fin, 1.1, 1.6));
    person(g, 240, 400, 1.6, C.ye);
    hand(g, 's', 155, 340, 34); hand(g, 'r', 205, 340, 34);
    txt(g, 'ТА', 240, 450, { font: M(800, 20), color: C.ye, glow: 12, alpha: seg(fin, 0.8, 1.2) });
    return;
  }
  // The logarithm, one piece at a time, each with its own colour.
  const a1 = seg(fin, 2.0, 2.5), a2 = seg(fin, 4.0, 4.5), a3 = seg(fin, 6.0, 6.5), a4 = seg(fin, 8.4, 9.0);
  const top = a4 > 0 ? 196 : 290;
  txt(g, '(', 96, top, { font: M(500, 46), alpha: a1 }); g.save(); g.globalAlpha = a1; frac(g, '1', '2', 120, top, 20, C.cy); g.restore(); txt(g, ')', 144, top, { font: M(500, 46), alpha: a1 });
  txt(g, '33', 166, top - 28, { font: M(800, 20), color: C.ye, glow: 8, alpha: a2 });
  txt(g, '≈', 200, top, { font: M(800, 28), alpha: a3 });
  g.save(); g.globalAlpha = a3; frac(g, '1', '8 000 000 000', 282, top, 17, C.pk); g.restore();
  const lab = (s, color, alpha, y) => wrapTxt(g, s, W / 2, y, 300, 22, { font: M(700, 15), color, alpha });
  if (a4 === 0) {
    lab('Тоглолт бүрт хүмүүсийн тал нь үлдэнэ', C.cy, a1 * (1 - seg(fin, 3.8, 4.0)), 380);
    lab('33 тоглолт дараалан ялвал', C.ye, a2 * (1 - seg(fin, 5.8, 6.0)), 380);
    lab('8 тэрбумаас ганц та л үлдэнэ', C.pk, a3 * (1 - seg(fin, 8.2, 8.4)), 380);
  } else {
    g.save(); g.globalAlpha = a4;
    txt(g, 'log', 74, 340, { font: M(800, 28) });
    frac(g, '1', '2', 110, 360, 12, C.cy);
    frac(g, '1', '8 000 000 000', 196, 340, 15, C.pk);
    txt(g, '≈ 33', 300, 340, { font: M(800, 28), color: C.ye, glow: 10 });
    g.restore();
    lab('Логарифм нь «хэдэн удаа хагаславал хүрэх вэ?» гэдгийг тоолдог', C.ink, seg(fin, 9.6, 10.2), 440);
  }
}};

// What if: a runner seen from behind, the world rushing past: city, forest, then space, then light lines.
const TT = (t) => 29 * seg(t, 1, 13);
const tAt = (tt) => 1 + tt / 29 * 12;
const VX = 180, VY = 300, F = 140;
const SIDE = Array.from({ length: 28 }, (_, i) => ({ side: i % 2 ? 1 : -1, z: 2 + i * 1.5, w: 1 + ((i * 37) % 10) / 10, h: 1.6 + ((i * 53) % 30) / 10, off: 1.6 + ((i * 29) % 12) / 10 }));
const STARS = Array.from({ length: 140 }, (_, i) => ({ x: Math.cos(i * 2.399) * (0.6 + (i * 17 % 40) / 4), y: Math.sin(i * 2.399) * (0.6 + (i * 31 % 40) / 4), z: 1 + (i * 7.3) % 42 }));
const proj = (X, Y, z) => [VX + X * F / z, VY + Y * F / z];
P.whatif = { L: 17, draw(g, t) {
  const tt = TT(t), v = 2 ** tt;
  const dist = 3 * t + 1.1 * Math.max(0, t - 1) ** 2.6;
  const scene = tt < 8.4 ? 'city' : tt < 13.5 ? 'forest' : tt < 28.2 ? 'space' : 'warp';
  const teaser = t > 14.6;
  base(g, 'ХЭРЭВ… · 1-Р ХЭСЭГ', teaser ? 'Цаг хугацаагаар аялах уу? 2-р хэсэгт' : '');
  if (scene === 'city' || scene === 'forest') {
    // road to the horizon
    g.save(); g.strokeStyle = 'rgba(232,240,255,0.45)'; g.lineWidth = 1.5;
    const [l0x, l0y] = proj(-1, 1, 40), [l1x, l1y] = proj(-1, 1, 0.9), [r0x] = proj(1, 1, 40), [r1x] = proj(1, 1, 0.9);
    g.beginPath(); g.moveTo(l0x, l0y); g.lineTo(l1x, l1y); g.moveTo(r0x, l0y); g.lineTo(r1x, l1y); g.stroke();
    g.strokeStyle = 'rgba(255,225,77,0.7)'; g.lineWidth = 2;
    for (let i = 0; i < 20; i++) { const z = 1 + ((i * 2 - dist * 2) % 40 + 40) % 40; const [ax, ay] = proj(0, 1, z), [bx2, by2] = proj(0, 1, z + 0.8); g.beginPath(); g.moveTo(ax, ay); g.lineTo(bx2, by2); g.stroke(); }
    g.restore();
    // side objects, far to near
    const objs = SIDE.map((o) => ({ ...o, zz: 1 + ((o.z - dist) % 42 + 42) % 42 })).sort((a, b) => b.zz - a.zz);
    for (const o of objs) {
      const X = o.side * (o.off + 0.3);
      if (scene === 'city') {
        const [x0, y0] = proj(X - (o.side < 0 ? o.w : 0), 1, o.zz), [x1] = proj(X + (o.side > 0 ? o.w : 0), 1, o.zz), [, yt] = proj(0, 1 - o.h, o.zz);
        g.save(); g.globalAlpha = clamp(1.2 - o.zz / 40); g.fillStyle = 'rgba(255,79,216,0.12)'; g.strokeStyle = C.pk; g.lineWidth = 1;
        g.fillRect(x0, yt, x1 - x0, y0 - yt); g.strokeRect(x0, yt, x1 - x0, y0 - yt);
        g.fillStyle = 'rgba(255,225,77,0.55)'; const ww = (x1 - x0) / 5; for (let wy = yt + 6; wy < y0 - 6; wy += Math.max(6, (y0 - yt) / 7)) { g.fillRect(x0 + ww, wy, ww, Math.max(1.5, ww * 0.6)); g.fillRect(x0 + ww * 3, wy, ww, Math.max(1.5, ww * 0.6)); }
        g.restore();
      } else {
        const [bxx, byy] = proj(X, 1, o.zz), [, ty] = proj(X, 1 - o.h * 0.8, o.zz), hw = 0.45 * F / o.zz;
        g.save(); g.globalAlpha = clamp(1.2 - o.zz / 40); g.fillStyle = 'rgba(93,255,157,0.14)'; g.strokeStyle = C.gr; g.lineWidth = 1;
        g.beginPath(); g.moveTo(bxx - hw, byy); g.lineTo(bxx, ty); g.lineTo(bxx + hw, byy); g.closePath(); g.fill(); g.stroke(); g.restore();
      }
    }
  } else {
    // space: stars rush toward the camera; at light speed they stretch into lines
    const warp = Math.max(seg(tt, 27, 29), seg(t, 13, 14.6));
    const sd = dist * 1.6;
    for (const s of STARS) {
      const z = 0.6 + ((s.z - sd) % 42 + 42) % 42;
      const [x, y] = proj(s.x, s.y, z), [x2, y2] = proj(s.x, s.y, z + 0.4 + warp * 12);
      g.save(); g.strokeStyle = (s.z | 0) % 3 ? C.ink : C.cy; g.globalAlpha = clamp(1.3 - z / 42); g.lineWidth = Math.min(3, 0.6 + 6 / z);
      g.beginPath(); g.moveTo(x2, y2); g.lineTo(x, y); g.stroke(); g.restore();
    }
    const e = 1 - seg(tt, 13.5, 16); // Earth dropping away below
    if (e > 0) { g.save(); g.fillStyle = `rgba(61,242,255,${0.2 * e})`; g.strokeStyle = `rgba(61,242,255,${0.6 * e})`; g.beginPath(); g.arc(VX, 900 + (1 - e) * 500, 520, 0, 7); g.fill(); g.stroke(); g.restore(); }
    if (t > 14.2 && t < 15) { g.save(); g.fillStyle = `rgba(255,255,255,${1 - Math.abs(t - 14.6) / 0.4})`; g.fillRect(0, 0, W, H); g.restore(); }
  }
  // sonic boom ring around the runner
  const boom = seg(t, tAt(8.4), tAt(8.4) + 0.6);
  if (boom > 0 && boom < 1) { g.save(); g.strokeStyle = C.ye; g.globalAlpha = 1 - boom; g.lineWidth = 3; g.beginPath(); g.ellipse(VX, 520, 30 + boom * 160, 20 + boom * 90, 0, 0, 7); g.stroke(); g.restore(); }
  // the runner, from behind
  if (!teaser) {
    const ph = t * (7 + Math.min(20, Math.log2(v + 1) * 1.5)), up = scene === 'space' || scene === 'warp' ? 20 * seg(tt, 13.5, 15) : 0;
    const x = VX, y = 560 - up, s1 = Math.sin(ph);
    g.save(); g.strokeStyle = C.ink; g.lineCap = 'round'; g.lineWidth = 5; g.shadowColor = C.cy; g.shadowBlur = 10;
    g.beginPath(); g.arc(x, y - 92, 13, 0, 7); g.stroke();                 // head
    g.beginPath(); g.moveTo(x, y - 78); g.lineTo(x, y - 40); g.stroke();   // back
    g.beginPath(); g.moveTo(x, y - 70); g.lineTo(x - 18, y - 52 + s1 * 10); g.moveTo(x, y - 70); g.lineTo(x + 18, y - 52 - s1 * 10); g.stroke(); // arms
    g.beginPath(); g.moveTo(x, y - 40); g.lineTo(x - 9, y - 4 - Math.max(0, s1) * 22); g.moveTo(x, y - 40); g.lineTo(x + 9, y - 4 - Math.max(0, -s1) * 22); g.stroke(); // legs, knees up in turn
    g.restore();
  }
  // readouts
  wrapTxt(g, 'Таны хурд секунд тутам 2 дахин өсвөл?', W / 2, 106, 300, 24, { font: M(800, 19) });
  const vs = v < 1000 ? `${v.toFixed(v < 10 ? 1 : 0)} м/с` : `${sp(Math.round(v / 1000))} км/с`;
  if (!teaser) {
    txt(g, `t = ${tt.toFixed(1).replace('.', ',')} с`, W / 2, 166, { font: MONO(700, 14), color: C.mut });
    txt(g, vs, W / 2, 196, { font: MONO(700, 26), color: C.ink, glow: 6 });
  }
  const ms = [[5, 'Машины хурд!'], [8.4, 'Дууны хурд!'], [13.5, 'Дэлхийн таталцлаас гарлаа!'], [28.2, 'Гэрлийн хурд!']];
  for (const [s, label] of ms) { const a = seg(t, tAt(s), tAt(s) + 0.2) * (1 - seg(t, tAt(s) + 1.1, tAt(s) + 1.4)); if (a > 0) txt(g, label, W / 2, 238, { font: M(800, 18), color: C.ye, glow: 12, alpha: a }); }
  if (teaser) wrapTxt(g, 'Гэрлээс хурдан гүйвэл цаг хугацаа юу болох вэ?', W / 2, 330, 280, 28, { font: M(800, 21), color: C.cy, glow: 10, alpha: seg(t, 14.7, 15.2) });
}};

P.story = { L: 15, draw(g, t) {
  base(g, 'ТА СОНГО · 1-Р АНГИ', t < 9 ? 'Ус 3 цагийн л хүрэлцэнэ' : 'Коммент дээр бичээрэй: А эсвэл Б?', t < 9 ? 1 : 0.6 + 0.4 * Math.sin(t * 5));
  wrapTxt(g, 'Та цөлд төөрлөө. Хот руу аль замаар явах вэ?', W / 2, 108, 300, 26, { font: M(800, 19) });
  const x0 = 60, x1 = 300, y0 = 210, y1 = 390;
  g.save(); g.fillStyle = 'rgba(255,225,77,0.10)';
  for (let i = 0; i < 160; i++) { const px = x0 + ((i * 73) % 240), py = y0 + ((i * 131) % 180); g.fillRect(px, py, 2, 2); }
  g.restore();
  txt(g, '8 км', (x0 + x1) / 2, y1 + 20, { font: MONO(700, 13), color: C.mut });
  txt(g, '6 км', x1 + 24, (y0 + y1) / 2, { font: MONO(700, 13), color: C.mut });
  // path B: road along the edges
  const b = ease(seg(t, 4, 7));
  g.save(); g.strokeStyle = C.cy; g.lineWidth = 4; g.shadowColor = C.cy; g.shadowBlur = 10; g.beginPath(); g.moveTo(x0, y1);
  const bl = b * 14; if (bl <= 8) g.lineTo(x0 + bl / 8 * (x1 - x0), y1); else { g.lineTo(x1, y1); g.lineTo(x1, y1 - (bl - 8) / 6 * (y1 - y0)); }
  g.stroke(); g.restore();
  // path A: straight through the sand
  const a = ease(seg(t, 1.5, 4));
  g.save(); g.strokeStyle = C.ye; g.lineWidth = 3; g.setLineDash([8, 7]); g.shadowColor = C.ye; g.shadowBlur = 10; g.beginPath(); g.moveTo(x0, y1); g.lineTo(x0 + a * (x1 - x0), y1 - a * (y1 - y0)); g.stroke(); g.restore();
  g.save(); g.fillStyle = C.pk; g.shadowColor = C.pk; g.shadowBlur = 14; g.beginPath(); g.arc(x0, y1, 7, 0, 7); g.fill(); g.restore();
  txt(g, 'Та', x0 - 4, y1 + 22, { font: M(800, 13), color: C.pk });
  txt(g, 'Хот', x1, y0 - 18, { font: M(800, 14), color: C.gr, glow: 8 });
  if (a > 0.9) txt(g, 'А: элсээр шууд · 3 км/ц', W / 2, 452, { font: M(700, 14), color: C.ye, alpha: seg(t, 3.6, 4.2) });
  if (b > 0.9) txt(g, 'Б: замаар тойрч · 5 км/ц', W / 2, 478, { font: M(700, 14), color: C.cy, alpha: seg(t, 6.6, 7.2) });
  if (t > 9) txt(g, 'А эсвэл Б?', W / 2, 520, { font: M(800, 26), color: C.ink, glow: 10, alpha: seg(t, 9, 9.6) });
}};

// Heart: the Reel is the app itself. A tap on «Зүрх ♥» in the graph tool's ready-made formulas, then the a slider.
P.heart = { L: 14, draw(g, t) {
  base(g, '', t < 10.5 ? (t < 1.6 ? 'Хайртай хүндээ илгээх график' : 'a-г өсгөхөд юу болох вэ?') : 'Та өөрөө a-г өөрчилж үзээрэй');
  const S = { board: '#0a0d14', surf: '#11141b', line: '#232a3a', ink: '#eef1f5', mut: '#a3acba', sun: '#ffcc66', sky: '#22d3ee', heart: C.pk };
  txt(g, 'Хэрэгсэл', 24, 72, { font: M(800, 20), align: 'left' });
  // tool tabs
  [['График', 24, 64, true], ['Тооны шулуун', 94, 92], ['Жин', 192, 40], ['Бутархай', 238, 70]].forEach(([s, x, w, on]) => {
    g.save(); rrect(g, x, 88, w, 22, 11); g.fillStyle = on ? S.sky : S.surf; g.fill(); g.restore();
    txt(g, s, x + w / 2, 99.5, { font: M(700, 10), color: on ? '#05070d' : S.ink });
  });
  // the board
  const bx = 24, by = 120, bw = 312, bh = 300, tapped = t > 1.2;
  g.save(); rrect(g, bx, by, bw, bh, 14); g.fillStyle = S.board; g.fill(); g.strokeStyle = S.line; g.stroke(); g.clip();
  const box = tapped ? [-2.6, 3.2, 2.6, -2] : [-6, 6, 6, -6];
  const X = (x) => bx + (x - box[0]) / (box[2] - box[0]) * bw, Y = (y) => by + (box[1] - y) / (box[1] - box[3]) * bh;
  g.strokeStyle = '#5b6578'; g.lineWidth = 1; g.beginPath(); g.moveTo(bx, Y(0)); g.lineTo(bx + bw, Y(0)); g.moveTo(X(0), by); g.lineTo(X(0), by + bh); g.stroke();
  const curve = (f, col, x0, x1, n) => { g.strokeStyle = col; g.lineWidth = 2.2; g.beginPath(); let on = false; for (let i = 0; i <= n; i++) { const x = x0 + (x1 - x0) * i / n, y = f(x); if (!Number.isFinite(y)) { on = false; continue; } on ? g.lineTo(X(x), Y(y)) : g.moveTo(X(x), Y(y)); on = true; } g.stroke(); };
  const a = tapped ? 0.3 + 19.7 * ease(seg(t, 2.2, 9.5)) : 0;
  if (!tapped) { curve((x) => x * x, S.sky, -6, 6, 200); curve((x) => x + 1, S.sun, -6, 6, 2); }
  else curve((x) => Math.cbrt(x * x) + 0.9 * Math.sqrt(3.3 - x * x) * Math.sin(a * Math.PI * x), S.heart, -1.8166, 1.8166, 1600);
  g.restore();
  // ready-made formulas row
  txt(g, 'Бэлэн томьёо', 24, 442, { font: M(700, 10), color: S.mut, align: 'left' });
  [['Зүрх ♥', 96, 62], ['Шулуун', 164, 58], ['Парабол', 228, 62], ['Синус', 296, 50]].forEach(([s, x, w], i) => {
    g.save(); rrect(g, x, 430, w, 24, 12); g.fillStyle = 'rgba(255,204,102,0.13)'; g.fill(); g.strokeStyle = i === 0 && tapped ? S.heart : 'rgba(255,204,102,0.5)'; g.lineWidth = i === 0 && tapped ? 2 : 1; if (i === 0 && tapped) { g.shadowColor = S.heart; g.shadowBlur = 10; } g.stroke(); g.restore();
    txt(g, s, x + w / 2, 442.5, { font: M(700, 10.5), color: S.sun });
  });
  // the formula line and the a slider
  g.save(); rrect(g, 24, 466, 312, 36, 12); g.fillStyle = S.surf; g.fill(); g.strokeStyle = S.line; g.stroke(); g.restore();
  g.save(); g.fillStyle = tapped ? S.heart : S.sky; g.beginPath(); g.arc(40, 484, 6, 0, 7); g.fill(); g.restore();
  txt(g, tapped ? 'y = (x^2)^(1/3) + 0.9√(3.3 - x^2) sin(aπx)' : 'y = x^2', 54, 484.5, { font: MONO(500, 10.5), color: S.ink, align: 'left' });
  g.save(); rrect(g, 24, 508, 312, 44, 12); g.fillStyle = S.surf; g.fill(); g.strokeStyle = S.line; g.stroke(); g.restore();
  txt(g, tapped ? `a = ${a.toFixed(1)}` : 'y = a x + 1', 40, 521, { font: MONO(700, 11), color: S.ink, align: 'left' });
  if (tapped) {
    const kx = 40 + (a + 20) / 40 * 280;
    g.save(); g.strokeStyle = 'rgba(255,204,102,0.35)'; g.lineWidth = 4; g.lineCap = 'round'; g.beginPath(); g.moveTo(40, 539); g.lineTo(320, 539); g.stroke();
    g.strokeStyle = S.sun; g.beginPath(); g.moveTo(40, 539); g.lineTo(kx, 539); g.stroke(); g.fillStyle = S.sun; g.beginPath(); g.arc(kx, 539, 7, 0, 7); g.fill(); g.restore();
    if (t > 2 && t < 9.8) { g.save(); g.fillStyle = 'rgba(255,255,255,0.35)'; g.beginPath(); g.arc(kx, 545, 14, 0, 7); g.fill(); g.restore(); } // finger on the knob
  }
  // the tap on «Зүрх ♥»
  const tap = seg(t, 0.8, 1.5);
  if (tap > 0 && tap < 1) { g.save(); g.strokeStyle = 'rgba(255,255,255,0.8)'; g.globalAlpha = 1 - tap; g.lineWidth = 2; g.beginPath(); g.arc(127, 442, 10 + tap * 24, 0, 7); g.stroke(); g.fillStyle = 'rgba(255,255,255,0.4)'; g.beginPath(); g.arc(127, 442, 12, 0, 7); g.fill(); g.restore(); }
  if (t > 10.5) wrapTxt(g, 'матемап → Хэрэгсэл → График → Зүрх ♥', W / 2, 600, 320, 18, { font: M(700, 12), color: C.cy, alpha: seg(t, 10.5, 11) });
}};

P.circle = { L: 15, draw(g, t) {
  let cap = 'r = радиус';
  if (t > 3) cap = 'Нимгэн цагиргуудад хуваая';
  if (t > 6) cap = 'Цагиргуудаа задлаад давхарлая';
  if (t > 10) cap = 'Ижил хэсгүүд → ижил талбай';
  base(g, '#001', cap);
  txt(g, 'Тойргийн талбай яагаад', W / 2, 106, { font: M(800, 19) });
  const done = t > 12.6;
  txt(g, 'πr²', W / 2 - 14, 146, { font: M(800, 34), color: C.ink, glow: 6 });
  txt(g, done ? '!' : '?', W / 2 + 40, 146, { font: M(800, 34), color: done ? C.gr : C.ye, glow: 12 });
  txt(g, 'вэ', W / 2 + 70, 150, { font: M(800, 19), alpha: done ? 0 : 1 });
  const cx = W / 2, cy = 290, R = 52, n = 10, baseY = 420;
  const p = ease(seg(t, 6, 9.6));
  const ringsOn = seg(t, 3, 5.5);
  if (t < 3) {
    g.save(); g.fillStyle = 'rgba(122,92,255,0.35)'; g.strokeStyle = C.pk; g.lineWidth = 2; g.shadowColor = C.pk; g.shadowBlur = 12; g.beginPath(); g.arc(cx, cy, R, 0, 7); g.fill(); g.stroke(); g.restore();
    const ang = t * 2.2 - Math.PI / 2;
    g.save(); g.strokeStyle = C.ye; g.lineWidth = 2.5; g.shadowColor = C.ye; g.shadowBlur = 10; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + R * Math.cos(ang), cy + R * Math.sin(ang)); g.stroke(); g.restore();
  } else {
    for (let i = 0; i < n; i++) {
      if ((i + 1) / n > ringsOn * 1.0001 + 0.001 && p === 0) continue;
      const r = R * (i + 0.5) / n, yl = baseY - (R - r);
      const mix = i / (n - 1), col = `rgb(${Math.round(61 + (255 - 61) * mix)},${Math.round(242 + (79 - 242) * mix)},${Math.round(255 + (216 - 255) * mix)})`;
      g.save(); g.strokeStyle = col; g.lineWidth = R / n - 0.6; g.beginPath();
      for (let k = 0; k <= 80; k++) {
        const s = k / 80, phi = -Math.PI / 2 + 2 * Math.PI * s;
        const ax = cx + r * Math.cos(phi + Math.PI), ay = cy + r * Math.sin(phi + Math.PI) * -1;
        const lx = cx - Math.PI * r + 2 * Math.PI * r * s, ly = yl;
        const x = ax + (lx - ax) * p, y = ay + (ly - ay) * p;
        k ? g.lineTo(x, y) : g.moveTo(x, y);
      }
      g.stroke(); g.restore();
    }
  }
  const f = seg(t, 10, 11);
  if (f > 0) {
    g.save(); g.globalAlpha = f; g.strokeStyle = C.ye; g.lineWidth = 1.5; g.setLineDash([5, 5]);
    g.beginPath(); g.moveTo(cx - Math.PI * R, baseY + 3); g.lineTo(cx, baseY - R); g.lineTo(cx + Math.PI * R, baseY + 3); g.stroke(); g.restore();
    txt(g, '2πr', cx, baseY + 22, { font: MONO(700, 14), color: C.pk, alpha: f });
    txt(g, 'r', cx + 10, baseY - R / 2, { font: MONO(700, 14), color: C.cy, alpha: f });
  }
  const f2 = seg(t, 11.2, 12);
  if (f2 > 0) {
    g.save(); g.globalAlpha = f2;
    txt(g, 'A =', 98, 500, { font: M(800, 24) });
    frac(g, '1', '2', 140, 500, 17, C.ink);
    txt(g, '· 2πr · r = πr²', 236, 500, { font: M(800, 24), color: C.ink, glow: 6 });
    g.restore();
  }
}};

P.challenge = { L: 13, draw(g, t) {
  base(g, 'ДУТАГДЛАА ОЛЦГООЁ', t < 6.3 ? 'Цээжээр бодоорой' : t < 9.5 ? '2 · 2 · 2 · 2 · 2 = 32' : 'Био дахь линкээр өөрийгөө шалгаарай');
  txt(g, '2ˣ = 32 бол x = ?', W / 2, 140, { font: M(800, 30), glow: 6 });
  const ch = ['16', '4', '5', '6'], reveal = t > 6.3;
  ch.forEach((c, i) => {
    const x = 60 + (i % 2) * 130, y = 200 + Math.floor(i / 2) * 76, ok = c === '5';
    g.save(); rrect(g, x, y, 110, 58, 12);
    g.fillStyle = reveal && ok ? 'rgba(93,255,157,0.16)' : 'rgba(232,240,255,0.04)'; g.fill();
    g.strokeStyle = reveal ? (ok ? C.gr : 'rgba(138,151,184,0.3)') : 'rgba(232,240,255,0.35)'; g.lineWidth = reveal && ok ? 2.5 : 1.2;
    if (reveal && ok) { g.shadowColor = C.gr; g.shadowBlur = 14; } g.stroke(); g.restore();
    txt(g, c, x + 55, y + 29, { font: M(800, 24), color: reveal && !ok ? 'rgba(138,151,184,0.5)' : C.ink });
  });
  if (t > 1 && t < 6.3) {
    const left = 5 - (t - 1), n = Math.ceil(left);
    g.save(); g.strokeStyle = C.ye; g.lineWidth = 5; g.shadowColor = C.ye; g.shadowBlur = 12; g.beginPath(); g.arc(W / 2, 420, 34, -Math.PI / 2, -Math.PI / 2 + 2 * Math.PI * (left / 5)); g.stroke(); g.restore();
    txt(g, String(Math.max(n, 0)), W / 2, 421, { font: M(800, 30), color: C.ye });
  }
  if (t > 9.5) wrapTxt(g, 'Манай шалгалтад эхний оролдлогоор 5 хүнээс 0 нь зөв хариулсан', W / 2, 410, 290, 22, { font: M(700, 15), color: C.mut, alpha: seg(t, 9.5, 10.2) });
}};

P.numbers = { L: 13, draw(g, t) {
  const names = ['Натурал тоо', 'Бүхэл тоо', 'Рационал тоо', 'Бодит тоо'];
  const step = Math.min(3, Math.floor(seg(t, 1, 9) * 4));
  base(g, 'ТООНЫ ТӨРЛҮҮД', t < 9.6 ? (t < 1 ? '' : names[step]) : 'Бүгд нэг газрын зураг дээр →');
  txt(g, 'Тоо хэдэн төрөл байдаг вэ?', W / 2, 110, { font: M(800, 21) });
  const boxes = [[124, 76, 'ℕ', C.cy], [196, 144, 'ℤ', C.gr], [262, 212, 'ℚ', C.ye], [324, 280, 'ℝ', C.pk]];
  const cx = W / 2, cy = 352;
  for (let i = 3; i >= 0; i--) {
    const on = seg(t, 1 + i * 2, 1.6 + i * 2); if (!on) continue;
    const [w, h, sym, col] = boxes[i];
    g.save(); g.globalAlpha = on; rrect(g, cx - w / 2, cy - h / 2 + (3 - i) * 8 - 12, w, h, 18); g.strokeStyle = col; g.lineWidth = 2; g.shadowColor = col; g.shadowBlur = 12; g.stroke(); g.restore();
    txt(g, sym, cx - w / 2 + 16, cy - h / 2 + (3 - i) * 8 + 4, { font: M(800, 16), color: col, alpha: on });
  }
  const ex = (i, a) => seg(t, 1.3 + i * 2, 1.9 + i * 2) * a;
  txt(g, '1   2   3', cx, 344, { font: MONO(700, 16), alpha: ex(0, 1) });
  txt(g, '−2', cx - 74, 386, { font: MONO(700, 15), alpha: ex(1, 1) });
  txt(g, '0', cx + 74, 386, { font: MONO(700, 15), alpha: ex(1, 1) });
  if (ex(2, 1) > 0) { g.save(); g.globalAlpha = ex(2, 1); frac(g, '3', '4', cx - 110, 300, 13, C.ink); g.restore(); }
  txt(g, '0,5', cx + 108, 420, { font: MONO(700, 15), alpha: ex(2, 1) });
  txt(g, '√2', cx - 134, 450, { font: MONO(700, 15), alpha: ex(3, 1) });
  txt(g, 'π', cx + 136, 262, { font: MONO(700, 17), alpha: ex(3, 1) });
}};

/* ---------- music: original stand-in loops, synthesised here (no copyrighted songs) ---------- */
const mid = (n) => 440 * 2 ** ((n - 69) / 12);
const chordTones = (root, q) => ({ M: [0, 4, 7], m: [0, 3, 7], M7: [0, 4, 7, 11], m7: [0, 3, 7, 10], s6: [0, 4, 7, 9] })[q].map((x) => root + x);
function padAndArp(L, bpm, prog, { arpType = 'triangle', arpVol = 0.1, padVol = 0.035, bass = true, oct = 12, pattern = [0, 1, 2, 1, 2, 3, 2, 1] } = {}) {
  const ev = [], beat = 60 / bpm, bar = beat * 4; let t = 0, i = 0;
  while (t < L) {
    const [root, q] = prog[i % prog.length], tones = chordTones(root, q);
    tones.forEach((n) => ev.push({ t, f: mid(n), d: bar * 1.05, type: 'sine', v: padVol, a: 0.4 }));
    if (bass) ev.push({ t, f: mid(root - 12), d: bar * 0.9, type: 'sine', v: 0.09, a: 0.02 });
    pattern.forEach((pi, k) => { const n = tones[pi % tones.length] + oct + (pi >= tones.length ? 12 : 0); ev.push({ t: t + k * beat / 2, f: mid(n), d: beat * 1.6, type: arpType, v: arpVol, a: 0.005 }); });
    t += bar; i++;
  }
  return ev;
}
const MUSIC = {
  heart: () => padAndArp(13, 72, [[60, 'M'], [55, 'M'], [57, 'm'], [53, 'M']], { oct: 24, arpVol: 0.07, pattern: [0, 2, 1, 2, 0, 2, 1, 2] }),
  circle: () => padAndArp(15, 76, [[57, 'm'], [53, 'M'], [48, 'M'], [55, 'M']], { oct: 12, arpVol: 0.09, pattern: [0, 1, 2, 3, 2, 1, 2, 1] }),
  numbers: () => {
    const ev = padAndArp(13, 74, [[48, 'M7'], [45, 'm7'], [53, 'M7'], [55, 's6']], { arpVol: 0.0, padVol: 0.04 });
    const penta = [72, 74, 76, 79, 81, 84, 86, 88];
    for (let t = 0.2, k = 0; t < 13; t += 0.41, k++) ev.push({ t, f: mid(penta[(k * 5) % 8]), d: 1.2, type: 'sine', v: 0.05, a: 0.01 });
    [1, 3, 5, 7].forEach((t, k) => ev.push({ t, f: mid(84 + k * 2), d: 1.8, type: 'triangle', v: 0.12, a: 0.005 }));
    return ev;
  },
  challenge: () => {
    const ev = [];
    [72, 76, 79].forEach((n, k) => ev.push({ t: 0.1 + k * 0.12, f: mid(n), d: 0.3, type: 'square', v: 0.05 }));
    for (let t = 1, k = 0; t < 6.3; t += 0.5, k++) { ev.push({ t, noise: true, d: 0.05, v: 0.25, ff: 5000 }); ev.push({ t, f: k % 2 ? 1200 : 900, d: 0.06, type: 'square', v: 0.03 }); }
    [72, 76, 79, 84].forEach((n, k) => ev.push({ t: 6.3 + k * 0.09, f: mid(n), d: 0.8, type: 'triangle', v: 0.14 }));
    const mel = [76, 79, 81, 79, 76, 74, 72, 74, 76, 76, 79, 84, 81, 79, 76, 72];
    mel.forEach((n, k) => ev.push({ t: 7.3 + k * 0.34, f: mid(n), d: 0.25, type: 'square', v: 0.04 }));
    for (let t = 7.3; t < 13; t += 0.68) ev.push({ t, f: mid(48 + ((t * 10) | 0) % 2 * 7), d: 0.3, type: 'triangle', v: 0.1 });
    return ev;
  },
  rps: () => {
    const ev = [];
    ev.push({ t: 0.1, f: 90, f2: 40, d: 0.6, type: 'sine', v: 0.5 });
    [[50, 'm'], [46, 'M']].forEach(([r, q], k) => chordTones(r, q).forEach((n) => ev.push({ t: 0.1 + k * 1.2, f: mid(n), d: 1.4, type: 'sine', v: 0.04, a: 0.2 })));
    // "rock, paper, scissors, shoot": three knocks and a hit
    [3.1, 3.6, 4.1].forEach((t) => ev.push({ t, f: 160, f2: 60, d: 0.15, type: 'sine', v: 0.45 }));
    ev.push({ t: 4.6, noise: true, d: 0.25, v: 0.3, ff: 1500 }); ev.push({ t: 4.6, f: mid(74), d: 0.4, type: 'triangle', v: 0.12 });
    [6.8, 6.95, 7.1].forEach((t, k) => ev.push({ t, f: 420 - k * 90, f2: 150, d: 0.35, type: 'sine', v: 0.12 }));
    // driving section: same beat as before, now with a tune on top (D minor)
    const bassline = [38, 38, 46, 46, 48, 48, 45, 45];
    const tune = [74, 77, 81, 79, 77, 76, 74, 72, 74, 77, 81, 84, 82, 81, 79, 77];
    const step = 60 / 140 / 2;
    for (let t = RPS_T0, b = 0; t < RPS_END; t += step, b++) {
      if (b % 2 === 0) ev.push({ t, f: 150, f2: 45, d: 0.18, type: 'sine', v: 0.45 });
      else ev.push({ t, noise: true, d: 0.04, v: 0.14, ff: 7000 });
      ev.push({ t, f: mid(bassline[(b >> 1) % 8] + (t > RPS_START[12] ? 12 : 0)), d: 0.16, type: 'square', v: 0.03 });
      if (b % 2 === 0) ev.push({ t, f: mid(tune[(b >> 1) % 16]), d: step * 1.8, type: 'triangle', v: 0.09 });
    }
    RPS_START.forEach((t, k) => ev.push({ t, f: mid(84 + Math.min(12, k / 3)), d: 0.06, type: 'sine', v: 0.06 }));
    for (let t = RPS_END; t < RPS_END + 1.3; t += 0.05) ev.push({ t, noise: true, d: 0.04, v: 0.06 + (t - RPS_END) * 0.12, ff: 2500 });
    [50, 54, 57, 62].forEach((n) => ev.push({ t: RPS_END + 1.4, f: mid(n), d: 2.2, type: 'triangle', v: 0.06, a: 0.02 }));
    ev.push({ t: RPS_END + 1.4, f: 120, f2: 40, d: 0.5, type: 'sine', v: 0.5 });
    // calm explanation: one soft chord per piece, and the same notes as the tune
    [[2.0, 50, 'm', 74], [4.0, 46, 'M', 77], [6.0, 48, 'M', 81], [8.4, 45, 'M', 76], [10.4, 50, 'm', 74]].forEach(([dt, r, q, n]) => {
      chordTones(r, q).forEach((x) => ev.push({ t: RPS_END + dt, f: mid(x), d: 2.2, type: 'sine', v: 0.04, a: 0.3 }));
      ev.push({ t: RPS_END + dt, f: mid(n), d: 1.4, type: 'triangle', v: 0.1 });
    });
    return ev;
  },
  whatif: () => {
    const ev = [];
    for (let t = 0.3; t < tAt(13.5); ) { const tt = TT(t); ev.push({ t, f: mid(36 + Math.min(14, tt)), d: 0.12, type: 'square', v: 0.05 }); ev.push({ t, f: 140, f2: 50, d: 0.1, type: 'sine', v: 0.25 }); t += Math.max(0.08, 0.42 / (1 + tt / 3)); }
    ev.push({ t: tAt(8.4), noise: true, d: 0.9, v: 0.5, ft: 'lowpass', ff: 400 });
    ev.push({ t: tAt(13.5), noise: true, d: 1.4, v: 0.25, ft: 'bandpass', ff: 1200 });
    [[45, 'm7'], [41, 'M7'], [48, 'M7'], [43, 's6']].forEach(([r, q], k) => chordTones(r, q).forEach((n) => ev.push({ t: tAt(13.5) + k * 1.4, f: mid(n + 12), d: 1.6, type: 'sine', v: 0.035, a: 0.3 })));
    for (let t = tAt(13.5), k = 0; t < tAt(28.2); t += 0.35, k++) ev.push({ t, f: mid([84, 88, 91, 86][k % 4]), d: 0.5, type: 'sine', v: 0.04 });
    ev.push({ t: tAt(28.2) - 0.6, f: 200, f2: 2400, d: 2.0, type: 'sawtooth', v: 0.04, a: 1.2 });
    ev.push({ t: 14.2, f: mid(60), d: 3, type: 'sine', v: 0.08, a: 0.05 }); ev.push({ t: 14.2, f: mid(67), d: 3, type: 'sine', v: 0.06, a: 0.05 }); ev.push({ t: 14.2, f: mid(74), d: 3, type: 'triangle', v: 0.05, a: 0.05 });
    return ev;
  },
  story: () => {
    const ev = [{ t: 0, f: mid(33), d: 15, type: 'sine', v: 0.07, a: 1 }, { t: 0, f: mid(40), d: 15, type: 'sine', v: 0.03, a: 2 }];
    for (let t = 0.3; t < 15; t += 0.95) { ev.push({ t, f: 70, f2: 38, d: 0.16, type: 'sine', v: 0.5 }); ev.push({ t: t + 0.22, f: 60, f2: 35, d: 0.14, type: 'sine', v: 0.35 }); }
    [[1.5, 76], [4, 77], [7, 79]].forEach(([t, n]) => { for (let k = 0; k < 10; k++) ev.push({ t: t + k * 0.08, f: mid(n), d: 0.07, type: 'triangle', v: 0.05 }); });
    for (let t = 9; t < 15; t += 0.5) ev.push({ t, noise: true, d: 0.04, v: 0.2, ff: 5000 });
    return ev;
  },
};
let AC = null, master = null, noiseBuf = null, soundCard = null;
function ensureAudio() {
  if (!AC) {
    const Ctx = window.AudioContext || window.webkitAudioContext; if (!Ctx) return false;
    AC = new Ctx(); master = AC.createGain(); master.gain.value = 0.55; master.connect(AC.destination);
    noiseBuf = AC.createBuffer(1, AC.sampleRate, AC.sampleRate); const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  if (AC.state === 'suspended') AC.resume();
  return true;
}
function voice(e, when) {
  const gn = AC.createGain(); gn.connect(master);
  if (e.noise) {
    const s = AC.createBufferSource(); s.buffer = noiseBuf; const f = AC.createBiquadFilter(); f.type = e.ft || 'highpass'; f.frequency.value = e.ff || 3000;
    gn.gain.setValueAtTime(e.v, when); gn.gain.exponentialRampToValueAtTime(0.0001, when + e.d); s.connect(f).connect(gn); s.start(when); s.stop(when + e.d + 0.05); return;
  }
  const o = AC.createOscillator(); o.type = e.type || 'sine'; o.frequency.setValueAtTime(e.f, when); if (e.f2) o.frequency.exponentialRampToValueAtTime(e.f2, when + e.d);
  const a = e.a ?? 0.01; gn.gain.setValueAtTime(0.0001, when); gn.gain.linearRampToValueAtTime(e.v, when + a); gn.gain.exponentialRampToValueAtTime(0.0001, when + Math.max(e.d, a + 0.02));
  o.connect(gn); o.start(when); o.stop(when + Math.max(e.d, a + 0.02) + 0.05);
}
// Schedules the card's notes a little ahead of its running clock (abs = seconds played, looping every L).
function scheduleMusic(p) {
  const L = p.def.L, to = p.abs + 0.15, now = AC.currentTime;
  for (let n = Math.floor(p.sched / L); n <= Math.floor(to / L); n++) for (const e of p.music) { const T = e.t + n * L; if (T >= p.sched && T < to && e.t < L) voice(e, now + Math.max(0, T - p.abs)); }
  p.sched = to;
}

