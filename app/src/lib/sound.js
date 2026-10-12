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

// ---- music: a slow, quiet pad of four chords (C, Am, F, G) ----
let musicNodes = null;
let musicTimer = null;
const CHORDS = [[261.63, 329.63, 392], [220, 261.63, 329.63], [174.61, 220, 261.63], [196, 246.94, 293.66]];

export function startMusic() {
  if (!ctx || !soundOn() || musicNodes) return;
  const bus = ctx.createGain();
  bus.gain.value = 0;
  const lp = ctx.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 900;
  bus.connect(lp).connect(master);
  bus.gain.linearRampToValueAtTime(0.07, ctx.currentTime + 1.5);
  const oscs = [0, 1, 2].map(() => {
    const o = ctx.createOscillator();
    o.type = 'triangle';
    o.connect(bus);
    o.start();
    return o;
  });
  let k = 0;
  const step = () => {
    const c = CHORDS[k++ % CHORDS.length];
    oscs.forEach((o, i) => o.frequency.setTargetAtTime(c[i], ctx.currentTime, 0.4));
  };
  step();
  musicTimer = setInterval(step, 2600);
  musicNodes = { bus, oscs };
}

export function stopMusic() {
  if (!musicNodes || !ctx) return;
  clearInterval(musicTimer);
  const { bus, oscs } = musicNodes;
  musicNodes = null;
  bus.gain.cancelScheduledValues(ctx.currentTime);
  bus.gain.setTargetAtTime(0, ctx.currentTime, 0.3);
  setTimeout(() => oscs.forEach((o) => { try { o.stop(); } catch {} }), 1500);
}
