import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://identitate.md',
  devToolbar: { enabled: false },
  integrations: [tailwind(), sitemap()],
  server: {
    port: process.env.PORT ? parseInt(process.env.PORT) : 4321,
    host: process.env.HOST || 'localhost',
  },
  output: 'static',
  build: {
    assets: '_assets',
  },
  vite: {
    build: {
      rollupOptions: {
        output: {
          assetFileNames: '_assets/[name].[hash][extname]',
        },
      },
    },
  },
});
