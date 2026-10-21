<script>
  // Shows a component that lives in its own file (lib/lazy.js). `when` says when it is needed now; until then it
  // still appears as soon as the idle preload has loaded it. Other props pass through.
  // While it is needed but not loaded yet, the loading star shows (float: over the screen, for sheets).
  import Loader from './Loader.svelte';
  let { get, when = true, float = false, ...rest } = $props();
  let Page = $state(null);
  $effect(() => { if (when) get(); });
  $effect(() => {
    let live = true;
    get.done.then((m) => { if (live) Page = m.default; });
    return () => (live = false);
  });
</script>

{#if Page}<Page {...rest} />{:else if when}<Loader {float} />{/if}
