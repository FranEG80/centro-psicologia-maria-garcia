import { defineConfig } from 'astro/config';

const site = process.env.PUBLIC_SITE_URL || 'http://localhost:4321';

export default defineConfig({
  site,
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
