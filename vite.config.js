import { sveltekit } from '@sveltejs/kit/vite';
// import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vite';
/** @type {import('@sveltejs/kit').Config} */

export default defineConfig({
	plugins: [sveltekit()]
});
