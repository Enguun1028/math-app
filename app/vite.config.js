import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { viteSingleFile } from 'vite-plugin-singlefile';

// Output is one self-contained dist/index.html, ready to drop onto Netlify.
export default defineConfig({
  plugins: [svelte(), viteSingleFile()],
  // Fixed port and LAN access so the phone bookmark stays valid between runs.
  // strictPort: fail loudly instead of drifting to 5174, 5175, ...
  server: { port: 5173, strictPort: true, host: true },
});
