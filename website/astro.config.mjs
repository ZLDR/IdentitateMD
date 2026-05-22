import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const { institutions } = JSON.parse(
  readFileSync(join(__dirname, 'src/data/institutions-index.json'), 'utf-8')
);

export default defineConfig({
  site: 'https://identitate.md',
  devToolbar: { enabled: false },
  integrations: [tailwind(), sitemap({ filter: (page) => !page.includes('/privacy') })],
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
