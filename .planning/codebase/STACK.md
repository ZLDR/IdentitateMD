# Technology Stack

**Analysis Date:** 2026-03-04

## Languages

**Primary:**
- **TypeScript** 5.7.0 - Type-safe JavaScript across entire codebase
- **JavaScript (ESM)** - Build scripts and utilities in modern modules

**Secondary:**
- **HTML/Astro** - Template markup in `.astro` files

## Runtime

**Environment:**
- Node.js (version specified by `.nvmrc` if present, not detected)

**Package Manager:**
- **npm** (npm 8+)
- Lockfile: `package-lock.json` present in `website/` directory

## Frameworks

**Core:**
- **Astro** 5.2.0 - Static site generator for rendering pages and components
  - Location: `website/` is the main Astro project
  - Config: `website/astro.config.mjs`
  - Purpose: Builds static HTML site with client-side interactivity

**Styling:**
- **Tailwind CSS** 3.4.0 - Utility-first CSS framework
  - Config: `website/tailwind.config.mjs`
  - Integrated via `@astrojs/tailwind` 6.0.0

**Integrations:**
- **@astrojs/sitemap** 3.7.0 - Generates XML sitemaps for SEO
- **@astrojs/vercel** 9.0.4 - Vercel deployment adapter for static sites
- **@astrojs/tailwind** 6.0.0 - Tailwind CSS integration for Astro

## Key Dependencies

**Critical:**
- **fuse.js** 7.0.0 - Lightweight fuzzy search library
  - Used in: `website/src/pages/index.astro`
  - Purpose: Client-side full-text search across institution data with weighted keyword matching
  - Search keys: institution name (0.4), shortname (0.3), keywords (0.2), description (0.1)

**Infrastructure:**
- **@vercel/analytics** 1.6.1 - Analytics integration for Vercel deployments
  - Enabled in `website/astro.config.mjs` via vercel adapter
  - Tracks web vitals and user analytics

**Development:**
- **@types/node** 22.0.0 - TypeScript definitions for Node.js APIs
- **ajv** 8.17.1 - JSON schema validator (used in data generation scripts)
- **typescript** 5.7.0 - TypeScript compiler for strict type checking

## Configuration

**Environment:**
- No `.env` file required for basic operation
- Static site with no server-side environment variables
- Build configuration versioned in code (no secrets needed)

**Build:**
- `website/astro.config.mjs` - Main Astro configuration
  - Output: `static` (pure static site generation)
  - Site URL: `https://identitate.eu`
  - Build asset path: `_assets/` with hashed filenames
  - Vite rollup config for asset naming: `_assets/[name].[hash][extname]`

**TypeScript:**
- `website/tsconfig.json` - Strict TypeScript configuration
  - Target: ESNext
  - Module resolution: bundler
  - Path aliases: `@/*`, `@data/*`, `@components/*`, `@layouts/*`

**Deployment:**
- `vercel.json` - Vercel-specific deployment config
  - Build command: `npm --prefix website run data:generate && npm --prefix website run build`
  - Output directory: `website/dist`
  - URL rewrites for CDN: jsDelivr CDN for logos and identity-loader.js
  - Cache headers: 1 hour (`max-age=3600, s-maxage=3600`)
  - CORS headers enabled for logo assets (`Access-Control-Allow-Origin: *`)

## Scripts

**Website (location: `website/`):**
```bash
npm run dev              # Development server (Astro dev mode)
npm run build            # Production build (full pipeline)
npm run preview          # Local preview of production build
npm run check            # TypeScript type checking with Astro
npm run astro            # Direct astro CLI access
npm run data:generate    # Generate institutions-index.json from JSON files
npm run data:generate:from-md  # Convert markdown definitions to JSON
```

**Data Generation:**
- `website/scripts/generate-index.js` - Builds searchable index from institution JSON files
  - Reads: `website/src/data/institutions/*.json`
  - Outputs: `website/src/data/institutions-index.json`
  - Validates v3.0 schema markers: `id` starts with `ro-`, `meta.keywords` array, `assets.main` present
  - Generates category statistics and asset availability tracking
  - Schema version: 3.0.0

**Logo Package (location: `packages/logos/`):**
- `@identitate-ro/logos` version 1.3.4
- Config: `packages/logos/package.json`
- Scripts: `npm run generate` to build index.json from logo files

## Platform Requirements

**Development:**
- Node.js (modern version with ESM support)
- npm or compatible package manager
- Astro 5.2+
- TypeScript 5.7+

**Production:**
- **Hosting:** Vercel (primary deployment platform)
  - Static site generation
  - Web analytics enabled
  - CDN rewrites for jsDelivr logo delivery
- **CDN:** jsDelivr (primary) + unpkg (fallback)
  - Logo distribution: `@identitate-ro/logos@1.3.4` package
  - Identity loader: `identity-loader.js`
  - Cache policy: 1 hour

**Browser Support:**
- Modern browsers with ES2020+ support (Astro default)
- Client-side search with fuse.js requires dynamic JavaScript

---

*Stack analysis: 2026-03-04*
