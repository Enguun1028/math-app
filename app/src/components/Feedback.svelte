<script>
  // "Алдаа мэдэгдэх / Ойлгомжгүй байна": sent through Netlify Forms, no server of our own.
  let { entry } = $props();
  let kind = $state(null);
  let message = $state('');
  let status = $state('idle');

  async function send(ev) {
    ev.preventDefault();
    status = 'sending';
    try {
      const body = new URLSearchParams({ 'form-name': 'feedback', entry, kind, message });
      const res = await fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body });
      status = res.ok ? 'sent' : 'error';
    } catch {
      status = 'error';
    }
  }
</script>

<section class="fb">
  {#if status === 'sent'}
    <p><strong>Баярлалаа!</strong> Бид шалгаад засна.</p>
  {:else if kind}
    <form class="stack" onsubmit={send}>
      <label class="small muted" for="fb-msg">{kind === 'error' ? 'Ямар алдаа байна вэ?' : 'Аль хэсэг нь ойлгомжгүй байна вэ?'}</label>
      <textarea id="fb-msg" bind:value={message} rows="3" required></textarea>
      <div class="row">
        <button class="btn primary" disabled={status === 'sending'}>Илгээх</button>
        <button type="button" class="btn" onclick={() => (kind = null)}>Болих</button>
      </div>
      {#if status === 'error'}<p class="small muted">Илгээж чадсангүй. Интернэтээ шалгаад дахин оролдоорой.</p>{/if}
    </form>
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
</style>
