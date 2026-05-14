import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

function getPreferredCatalogKey(inst) {
  const raw = String(inst.shortname || '').trim().toLowerCase();
  const normalized = raw
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return normalized || inst.slug;
}

function buildCatalogPathMap(institutions) {
  const map = {};
  const used = new Set();
  for (const inst of institutions) {
    const preferred = getPreferredCatalogKey(inst);
    const slugFallback = inst.slug;
    let key = preferred;
    if (used.has(key) && !used.has(slugFallback)) key = slugFallback;
    if (used.has(key)) {
      const base = key;
      let index = 2;
      while (used.has(`${base}-${index}`)) index += 1;
      key = `${base}-${index}`;
    }
    used.add(key);
    map[inst.slug] = key;
  }
  return map;
}

const { institutions } = JSON.parse(
  readFileSync(join(__dirname, 'src/data/institutions-index.json'), 'utf-8')
);
const catalogPathBySlug = buildCatalogPathMap(institutions);
const institutionRedirects = Object.fromEntries(
  institutions.map((inst) => [
    `/institution/${inst.slug}`,
    `/catalog/${catalogPathBySlug[inst.slug] || inst.slug}`,
  ])
);

export default defineConfig({
  site: 'https://identitate.md',
  devToolbar: { enabled: false },
  integrations: [tailwind(), sitemap()],
  server: {
    port: process.env.PORT ? parseInt(process.env.PORT) : 4321,
    host: process.env.HOST || 'localhost',
  },
  output: 'static',
  redirects: institutionRedirects,
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
