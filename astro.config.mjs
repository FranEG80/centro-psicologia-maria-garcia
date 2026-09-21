import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://centropsicologiamariagarcia.es',
  build: { inlineStylesheets: 'auto' },
  vite: {
    build: {

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
