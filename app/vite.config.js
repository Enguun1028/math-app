import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { viteSingleFile } from 'vite-plugin-singlefile';

// Output is one self-contained dist/index.html, ready to drop onto Netlify.
export default defineConfig({
  plugins: [svelte(), viteSingleFile()],
});
