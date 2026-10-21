<script>
  // "Алдаа мэдэгдэх / Ойлгомжгүй байна": sent to PostHog as a `problem_reported` event (owner, 2026-10-20),
  // since Netlify Forms stopped working after the move to Cloudflare. PostHog keeps it and retries offline.
  // question: the question text when reported from a quiz question; small: the one-link form under a question.
  // general: the "Би" page form, for a mistake anywhere in the app or an idea (kind 'idea').
  import { track } from '../lib/track.svelte.js';

  let { entry = null, question = null, small = false, general = false } = $props();
  let kind = $state(null);
  let message = $state('');
  let sent = $state(false);

  function send(ev) {
    ev.preventDefault();
    track('problem_reported', { entry, kind, message: message.trim(), question: question?.slice(0, 300) ?? null });
    sent = true;
  }
</script>

<section class="fb" class:small>
  {#if sent}
    <p><strong>Баярлалаа.</strong> Бид шалгаад засна.</p>
  {:else if kind}
    <form class="stack" onsubmit={send}>
      <label class="small muted" for="fb-msg">{kind === 'error' ? 'Ямар алдаа байна вэ?' : kind === 'idea' ? 'Юуг нэмэх, сайжруулах вэ?' : 'Аль хэсэг нь ойлгомжгүй байна вэ?'}</label>
      <!-- The box takes the cursor as soon as it opens, so the student can type straight away. -->
      <textarea id="fb-msg" bind:value={message} rows="3" required {@attach (el) => el.focus()}></textarea>
      <div class="row">
        <button class="btn primary">Илгээх</button>
        <button type="button" class="btn" onclick={() => (kind = null)}>Болих</button>
      </div>
    </form>
  {:else if general}
    <div class="row">
      <button class="btn" onclick={() => (kind = 'error')}>Алдаа мэдэгдэх</button>
      <button class="btn" onclick={() => (kind = 'idea')}>Санал хүсэлт</button>
    </div>
  {:else if small}
    <div class="row">
      <button class="link" onclick={() => (kind = 'error')}>Алдаа олсон уу?</button>
      <button class="link" onclick={() => (kind = 'unclear')}>Ойлгомжгүй байна</button>
    </div>
  {:else}
    <div class="row">
      <button class="btn" onclick={() => (kind = 'error')}>Алдаа мэдэгдэх</button>
      <button class="btn" onclick={() => (kind = 'unclear')}>Ойлгомжгүй байна</button>
    </div>
  {/if}
</section>

<style>
  .row { display: flex; gap: 8px; flex-wrap: wrap; }
  textarea { width: 100%; font: inherit; padding: 10px 12px; border-radius: 12px; border: 1.5px solid var(--line); resize: vertical; }
  textarea:focus { outline: none; border-color: var(--sky); }
  .small .row { gap: 16px; }
  .link { padding: 6px 0; background: none; border: 0; font: inherit; font-size: 0.82rem; color: var(--muted); text-decoration: underline; text-underline-offset: 3px; }
</style>
