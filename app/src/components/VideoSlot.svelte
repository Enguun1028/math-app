<script>
  // A place for a video explanation (owner, 2026-10-13). Until a video is linked it shows a "coming soon" block.
  // Videos are linked in content/videos.json by key ("topic:frac", "entry:nemeh", "idea:pyth"):
  //   { "type": "youtube", "src": "VIDEO_ID" }                      YouTube (privacy-enhanced embed)
  //   { "type": "facebook", "src": "https://www.facebook.com/…/videos/…" }
  //   { "type": "instagram", "src": "REEL_ID" }                     Instagram reel, shown upright (9:16)
  //   { "type": "file", "src": "videos/name.mp4" }                  our own video in app/public/videos/
  // Optional: "title", "vertical": true. The page loads the player only when the student taps play.
  import videos from '../../content/videos.json';

  let { key, title = '' } = $props();
  let v = $derived(videos[key] ?? null);
  let vertical = $derived(!!v && (v.vertical ?? v.type === 'instagram'));
  let playing = $state(false);
  $effect(() => { key; playing = false; });

  const src = (v) => {
    if (v.type === 'youtube') return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(v.src)}?autoplay=1&rel=0&playsinline=1`;
    if (v.type === 'facebook') return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(v.src)}&show_text=false&autoplay=true`;
    if (v.type === 'instagram') return `https://www.instagram.com/reel/${encodeURIComponent(v.src)}/embed`;
    return v.src;
  };
</script>

<div class="slot" class:vertical class:empty={!v}>
  {#if !v}
    <div class="soon">
      <span class="play" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M8 5.5v13l11-6.5z" /></svg></span>
      <div><strong>Видео тайлбар</strong><span class="small muted">{title ? title + ' · ' : ''}удахгүй нэмэгдэнэ</span></div>
    </div>
  {:else if !playing}
    <button class="cover" onclick={() => (playing = true)} aria-label="Видео тоглуулах">
      <span class="play" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M8 5.5v13l11-6.5z" /></svg></span>
      <strong>{v.title || title || 'Видео тайлбар'}</strong>
    </button>
  {:else if v.type === 'file'}
    <!-- svelte-ignore a11y_media_has_caption -->
    <video src={src(v)} controls autoplay playsinline></video>
  {:else}
    <iframe src={src(v)} title={v.title || title || 'Видео'} allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen loading="lazy"></iframe>
  {/if}
</div>

<style>
  .slot { position: relative; width: 100%; aspect-ratio: 16 / 9; border-radius: 16px; overflow: hidden; border: 1px solid var(--line); background: #070b16; }
  .slot.vertical { aspect-ratio: 9 / 16; max-width: 320px; margin: 0 auto; }
  .slot.empty { aspect-ratio: auto; border-style: dashed; }
  .soon { display: flex; align-items: center; gap: 12px; padding: 14px; }
  .soon div { display: grid; gap: 2px; }
  .play { flex: none; width: 46px; height: 46px; border-radius: 50%; display: grid; place-items: center; background: var(--sky-soft); }
  .play svg { width: 22px; height: 22px; fill: var(--sky); }
  .cover { position: absolute; inset: 0; border: 0; display: grid; place-content: center; justify-items: center; gap: 10px; background: radial-gradient(circle, #10213a, #070b16); color: var(--ink); }
  .cover .play { width: 64px; height: 64px; background: var(--sky); }
  .cover .play svg { fill: #03161c; width: 28px; height: 28px; }
  iframe, video { position: absolute; inset: 0; width: 100%; height: 100%; border: 0; background: #000; }
</style>
