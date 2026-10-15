<script>
  // Picture above a quiz question, so geometry questions show exactly what they talk about (owner, 2026-10-13).
  // A question picks one with "fig": "<name>".
  let { kind } = $props();
</script>

{#if kind === 'right-triangle'}
  <!-- Right angle at C, angle α at A. Sides named from α's point of view. -->
  <svg class="fig" viewBox="0 0 300 180" role="img" aria-label="Тэгш өнцөгт гурвалжин: α өнцөг, гипотенуз, эсрэг катет, налсан катет">
    <polygon points="20,150 225,150 225,30" fill="color-mix(in srgb, var(--sky) 10%, transparent)" stroke="var(--sky)" stroke-width="3" stroke-linejoin="round" />
    <path d="M211 150 V136 H225" fill="none" stroke="var(--ink)" stroke-width="2" />
    <path d="M58 150 A38 38 0 0 0 52.8 130.8" fill="none" stroke="var(--sun)" stroke-width="2.5" />
    <text x="66" y="143" class="a">α</text>
    <text x="112" y="76" class="l" transform="rotate(-30.3 112 76)" text-anchor="middle">гипотенуз</text>
    <text x="122" y="172" class="l" text-anchor="middle">налсан катет</text>
    <text x="234" y="86" class="l"><tspan x="234">эсрэг</tspan><tspan x="234" dy="18">катет</tspan></text>
  </svg>
{/if}

<style>
  .fig { display: block; width: 100%; max-width: 320px; margin: 0 auto; height: auto; }
  .l { font-size: 15px; font-weight: 700; fill: currentColor; }
  .a { font-size: 20px; font-weight: 800; fill: var(--sun); font-style: italic; }
</style>
