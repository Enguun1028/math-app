<script>
  // Reusable frame for animated explanations: caption, stage dots, ⏸/▶, ↻, 🔊, music and one sound cue per stage.
  // An animation only says what to draw at each stage:
  //   <PlayShell {stages}>{#snippet children(phase, playing)} …picture… {/snippet}</PlayShell>
  // stages: [{ caption, hold (seconds on screen), cue? (name in lib/sound.js cue, or a function) }]
  import { onDestroy } from 'svelte';
  import RichText from '../RichText.svelte';
  import { reduced } from '../../lib/motion.js';
  import { cue, unlock, startMusic, stopMusic, soundOn, setSound } from '../../lib/sound.js';

  // phase and playing can be bound, so the animation can react to them (e.g. start a walk).
  let { stages, children, phase = $bindable(0), playing = $bindable(false) } = $props();

  const last = stages.length - 1;
  phase = reduced ? last : 0;
  playing = !reduced;
  let timer;

  function run(from) {
    clearTimeout(timer);
    phase = from;
    playing = true;
    if (from >= last) return (playing = false);
    timer = setTimeout(() => run(from + 1), stages[from].hold * 1000);
  }
  if (!reduced) setTimeout(() => run(0), 50);
  onDestroy(() => { clearTimeout(timer); stopMusic(); });

  const jump = (p) => { clearTimeout(timer); playing = false; phase = p; };
  let done = $derived(!playing && phase === last);
  function toggle() {
    if (playing) { clearTimeout(timer); playing = false; }
    else run(done ? 0 : phase);
  }

  let sound = $state(soundOn());
  function toggleSound() {
    unlock();
    sound = !sound;
    setSound(sound);
    if (sound && playing) startMusic();
  }
  $effect(() => { if (playing) startMusic(); else stopMusic(); });
  $effect(() => {
    const st = stages[phase];
    if (!playing || !st?.cue) return;
    if (typeof st.cue === 'function') st.cue();
    else cue[st.cue]?.();
  });
</script>

<div class="play">
  <p class="cap" aria-live="polite"><RichText text={stages[phase].caption} /></p>
  {@render children(phase, playing)}
  <div class="ctl">
    <div class="dots" role="group" aria-label="Алхам">
      {#each stages as _, s}<button class="dot" class:on={phase === s} aria-label="{s + 1}-р алхам" onclick={() => { unlock(); jump(s); }}></button>{/each}
    </div>
    <div class="btns">
      <button class="btn icon" aria-label={sound ? 'Дуу хаах' : 'Дуу нээх'} aria-pressed={sound} onclick={toggleSound}>{sound ? '🔊' : '🔇'}</button>
      <button class="btn icon" aria-label="Эхнээс нь" onclick={() => { unlock(); run(0); }}>↻</button>
      <button class="btn primary" aria-label={playing ? 'Түр зогсоох' : 'Тоглуулах'} onclick={() => { unlock(); toggle(); }}>
        {#if playing}<span class="pz" aria-hidden="true"></span> Зогсоох{:else if done}↻ Дахин{:else}▶ Үргэлжлүүлэх{/if}
      </button>
    </div>
  </div>
</div>

<style>
  .play { display: grid; gap: 10px; padding: 14px; border-radius: 20px; background: var(--surface-solid); border: 1px solid var(--line); }
  .cap { min-height: 3.2em; font-weight: 700; font-size: 1.02rem; line-height: 1.4; text-wrap: pretty; }
  .ctl { display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap; }
  .dots { display: flex; gap: 4px; }
  .dot { width: 34px; height: 34px; border-radius: 50%; border: 0; background: none; display: grid; place-items: center; padding: 0; }
  .dot::before { content: ''; width: 9px; height: 9px; border-radius: 50%; background: var(--line); transition: background 0.2s, transform 0.2s; }
  .dot.on::before { background: var(--sky); transform: scale(1.3); }
  .btns { display: flex; gap: 8px; }
  .btn.icon { width: 44px; padding: 0; font-size: 1.2rem; }
  .pz { display: inline-block; width: 10px; height: 12px; border-left: 3.5px solid currentColor; border-right: 3.5px solid currentColor; }
</style>
