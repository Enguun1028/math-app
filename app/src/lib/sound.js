// Small synthesized sounds (Web Audio, no files): cues for animations and a quiet music pad.
// Phones only allow sound after a tap, so call unlock() inside a tap handler before playing.
// The on/off choice is remembered on this device.
import { progress, save } from './progress.svelte.js';

let ctx = null;
let master = null;

export const soundOn = () => progress.sound !== false;
export function setSound(on) {
  progress.sound = on;
  save();
  if (!on) stopMusic();
}

export function unlock() {
  try {
    if (!ctx) {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      master = ctx.createGain();
      master.gain.value = 0.55;
      master.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume();
  } catch {
    ctx = null;
  }
}

// One note: a tone with a soft attack and a natural fade.
function note(freq, { at = 0, dur = 0.25, type = 'sine', vol = 0.18, glide = 0 } = {}) {
  if (!ctx || !soundOn()) return;
  const t = ctx.currentTime + at;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (glide) o.frequency.exponentialRampToValueAtTime(freq * glide, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(master);
  o.start(t);
  o.stop(t + dur + 0.05);
}

// Notes of a pentatonic scale, so any run of cues sounds pleasant together.
const SCALE = [523.25, 587.33, 659.25, 783.99, 880, 1046.5, 1174.66, 1318.51, 1567.98];

export const cue = {
  start: () => { note(392, { dur: 0.18, vol: 0.12 }); note(523.25, { at: 0.09, dur: 0.22, vol: 0.12 }); },
  tick: (i = 0, at = 0) => note(1800 + (i % 5) * 120, { at, dur: 0.05, type: 'triangle', vol: 0.05 }),
  // Lines do not match: a dull, low two-note "nope".
  nope: () => { note(220, { dur: 0.22, type: 'triangle', vol: 0.16 }); note(185, { at: 0.18, dur: 0.32, type: 'triangle', vol: 0.16 }); },
  // The "?" of the try-anyway stage: a rising, unresolved slide.
  hmm: () => note(330, { dur: 0.6, type: 'sine', vol: 0.14, glide: 1.5 }),
  pop: (i = 0, at = 0) => note(SCALE[i % SCALE.length], { at, dur: 0.16, type: 'triangle', vol: 0.09 }),
  chime: (at = 0) => { [1046.5, 1318.51, 1567.98].forEach((f, k) => note(f, { at: at + k * 0.06, dur: 0.7, vol: 0.08 })); },
  ok: () => { [523.25, 659.25, 783.99, 1046.5].forEach((f, k) => note(f, { at: k * 0.07, dur: 0.45, type: 'triangle', vol: 0.1 })); },
  whoosh: () => {
    if (!ctx || !soundOn()) return;
    const t = ctx.currentTime;
    const len = Math.floor(ctx.sampleRate * 0.9);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.Q.value = 1.2;
    bp.frequency.setValueAtTime(400, t);
    bp.frequency.exponentialRampToValueAtTime(2400, t + 0.8);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.12, t + 0.15);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.9);
    src.connect(bp).connect(g).connect(master);
    src.start(t);
  },
  success: () => { [523.25, 659.25, 783.99, 1046.5, 1318.51].forEach((f, k) => note(f, { at: k * 0.08, dur: 1.1, vol: 0.09 })); },
};

// ---- music: an original jazzy, wonky 8-bit loop (owner wanted something less generic) ----
// Extended chords (Fmaj9, Em7, Dm9, G13sus), swung 16ths, detuned square stabs, a lead that bends into its notes.
// 4 bars, 16 steps each, about 94 BPM. Original: not based on any existing song.
const BPM = 94;
const STEP = 60 / BPM / 4;
const SWING = 0.32; // late off-beats
const CHORDS = [[57, 60, 64, 67], [55, 59, 62, 64], [53, 57, 60, 64], [53, 57, 59, 64]];
const BASS = [41, 40, 38, 43];
const STABS = [0, 3, 6, 10, 13];
const BASS_STEPS = { 0: 0, 6: 0, 8: 12, 11: 7, 14: 0 };
const LEAD = [
  72, null, null, 76, null, 79, null, null, 77, null, 76, null, 74, null, null, null,
  null, null, 71, null, 74, null, 76, 79, null, null, 76, null, 74, null, 71, null,
  69, null, null, 72, null, 76, null, null, 79, null, 77, 76, null, 74, null, null,
  null, null, 74, null, 77, 79, null, 81, null, 79, null, 77, null, 76, 74, null,
];
const hz = (m) => 440 * 2 ** ((m - 69) / 12);

let music = null;

function blip(freq, t, dur, type, vol, dest) {
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  g.gain.setValueAtTime(vol, t);
  g.gain.setValueAtTime(vol, t + dur * 0.7);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(dest);
  o.start(t);
  o.stop(t + dur + 0.02);
}
function bend(freq, t, dur, dest) {
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = 'square';
  o.frequency.setValueAtTime(freq * 0.94, t);
  o.frequency.exponentialRampToValueAtTime(freq, t + 0.06);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.06, t + 0.015);
  g.gain.setValueAtTime(0.06, t + dur * 0.6);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(dest);
  o.start(t);
  o.stop(t + dur + 0.02);
}
function kick(t, dest) {
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.frequency.setValueAtTime(150, t);
  o.frequency.exponentialRampToValueAtTime(45, t + 0.12);
  g.gain.setValueAtTime(0.5, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.14);
  o.connect(g).connect(dest);
  o.start(t);
  o.stop(t + 0.16);
}
let noiseBuf = null;
function hat(t, dest, vol = 0.12, dur = 0.04) {
  if (!noiseBuf) {
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 0.2, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  const src = ctx.createBufferSource();
  src.buffer = noiseBuf;
  const hp = ctx.createBiquadFilter();
  hp.type = 'highpass';
  hp.frequency.value = 6000;
  const g = ctx.createGain();
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(hp).connect(g).connect(dest);
  src.start(t);
  src.stop(t + dur + 0.02);
}

export function startMusic() {
  if (!ctx || !soundOn() || music) return;
  const bus = ctx.createGain();
  bus.gain.value = 0;
  bus.connect(master);
  bus.gain.linearRampToValueAtTime(0.16, ctx.currentTime + 0.8);
  let step = 0;
  let next = ctx.currentTime + 0.1;
  // Schedule a little ahead of time so the beat stays steady even if the page is busy.
  const tick = () => {
    while (next < ctx.currentTime + 0.12) {
      const i = step % LEAD.length;
      const bar = Math.floor(i / 16), s16 = i % 16;
      const t = next + (s16 % 2 ? STEP * SWING : 0);
      if (STABS.includes(s16)) for (const m of CHORDS[bar]) {
        blip(hz(m) * 1.004, t, STEP * 1.4, 'square', 0.022, bus);
        blip(hz(m) * 0.996, t, STEP * 1.4, 'square', 0.022, bus);
      }
      if (LEAD[i]) bend(hz(LEAD[i]), t, STEP * 2.2, bus);
      if (s16 in BASS_STEPS) blip(hz(BASS[bar] + BASS_STEPS[s16]), t, STEP * 1.8, 'triangle', 0.24, bus);
      if (s16 === 0 || s16 === 7 || s16 === 10) kick(t, bus);
      if (s16 % 2 === 0) hat(t, bus, s16 % 4 === 2 ? 0.1 : 0.05);
      if (s16 === 4 || s16 === 12) hat(t, bus, 0.18, 0.11);
      step++;
      next += STEP;
    }
  };
  tick();
  music = { bus, timer: setInterval(tick, 25) };
}

export function stopMusic() {
  if (!music || !ctx) return;
  clearInterval(music.timer);
  const { bus } = music;
  music = null;
  bus.gain.cancelScheduledValues(ctx.currentTime);
  bus.gain.setTargetAtTime(0, ctx.currentTime, 0.15);
}
