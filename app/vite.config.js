import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

// Output: dist/index.html plus hashed files in dist/assets/ (cached for a year, see public/_headers); pages that
// are not on the first screen are separate files (lib/lazy.js). It was one 1.15 MB page until 2026-10-21.
export default defineConfig({
  plugins: [svelte()],
  // Fixed port and LAN access so the phone bookmark stays valid between runs.
  // strictPort: fail loudly instead of drifting to 5174, 5175, ...
  server: { port: 5173, strictPort: true, host: true },
});
