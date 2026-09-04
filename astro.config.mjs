import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://centropsicologiamariagarcia.es',
  build: { inlineStylesheets: 'auto' },
  vite: {
    build: {
      // three.js is the single heavy chunk; keep it isolated so the rest of the
      // page (and the LCP poster) is never blocked behind it.
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules/three')) return 'three';
            if (id.includes('node_modules/gsap')) return 'gsap';
          },
        },
      },
    },
  },
});
