# External Integrations

**Analysis Date:** 2026-03-04

## APIs & External Services

**Logo & Asset Distribution:**
- **jsDelivr CDN** (primary) - High-performance CDN for logo distribution
  - Base URL: `https://cdn.jsdelivr.net/npm/@identitate-ro/logos@1.3.4/`
  - Used for: Logo SVG delivery, identity-loader.js
  - References in: `website/astro.config.mjs` (rewrites), `website/vercel.json` (rewrites/headers)
  - Health: actively maintained, free tier

- **unpkg CDN** (fallback) - Alternative CDN for logo distribution
  - Base URL: `https://unpkg.com/@identitate-ro/logos/`
  - Used for: Fallback logo delivery if jsDelivr unavailable
  - References in: `website/src/types/institution.ts` (AssetUrls schema supports both)

**No Server APIs:**
- This is a static site with no backend API calls
- No database integrations
- All data is embedded in the build or fetched from public CDNs

## Data Storage

**Databases:**
- None (static site)

**File Storage:**
- **Local filesystem in repository** - Primary data source
  - Institution metadata: `website/src/data/institutions/*.json` (one file per institution)
  - Generated index: `website/src/data/institutions-index.json` (auto-generated build artifact)
  - Logo files: `packages/logos/logos/{institution-id}/{layout}/{variant}.svg`
  - Public preview logos: `website/public/logos/{institution-id}/` (copied from packages)

- **CDN (jsDelivr/unpkg)** - Published assets
  - Distribution of `@identitate-ro/logos` npm package
  - No authentication required
  - Publicly accessible

**Caching:**
- **Vercel Edge Cache** - HTTP caching via Cache-Control headers
  - Logo assets: `public, max-age=3600, s-maxage=3600` (1 hour)
  - identity-loader.js: `public, max-age=3600, s-maxage=3600` (1 hour)
  - Configuration in: `website/vercel.json` (headers section)

## Authentication & Identity

**Auth Provider:**
- None (no authentication layer)
- Static public website with no login or API key protection
- Logo distribution via CDN is unrestricted

**Access Control:**
- All logos and data publicly accessible
- Distributed via CDN with open CORS headers (`Access-Control-Allow-Origin: *`)

## Monitoring & Observability

**Error Tracking:**
- Not detected (no explicit error tracking service like Sentry)

**Logs:**
- **Vercel Web Analytics** - Web vitals and performance metrics
  - Enabled via: `website/astro.config.mjs` → `adapter: vercel({ webAnalytics: { enabled: true } })`
  - Package: `@vercel/analytics` 1.6.1
  - Tracks: Page views, Web Vitals (LCP, FID, CLS), user interactions
  - No custom logging framework detected

**Performance Monitoring:**
- Vercel's built-in analytics captures performance metrics
- Client-side timing available through browser DevTools

## CI/CD & Deployment

**Hosting:**
- **Vercel** - Fully managed deployment platform
  - Site URL: `https://identitate.eu`
  - Deployment type: Static site
  - Build output: `website/dist/`

**CI Pipeline:**
- **GitHub Actions** - Build automation (if configured)
  - No workflows detected in `.github/workflows/` directory
  - Potential future integration point

**Build Process (from vercel.json):**
```
Install: npm --prefix website install
Build: npm --prefix website run data:generate && npm --prefix website run build
Output: website/dist/
```

**Deployment Flow:**
1. `data:generate` - Build searchable institutions index from JSON files
2. `astro build` - Compile site to static HTML/CSS/JS
3. Vercel deploys to CDN with 1-hour cache headers
4. Logo assets served via jsDelivr CDN (via URL rewrites)

## Environment Configuration

**Required env vars:**
- None for basic operation (static site)
- No API keys or secrets required in code

**Secrets location:**
- No `.env` file committed
- No external secret management detected
- All configuration is code-based (vercel.json, astro.config.mjs)

## Webhooks & Callbacks

**Incoming:**
- None detected (static site, no server endpoints)

**Outgoing:**
- NPM publish workflow for `@identitate-ro/logos` package
  - Published to: `https://www.npmjs.com/package/@identitate-ro/logos`
  - Current version: 1.3.4
  - Access level: public
  - Manual publish (no auto-release detected)

## Package Distribution

**NPM Package:**
- **Package Name:** `@identitate-ro/logos`
- **Current Version:** 1.3.4
- **Registry:** npmjs.org (public)
- **Files Published:**
  - `logos/**/*` - All SVG logo files organized by institution
  - `index.json` - Searchable metadata index
  - `identity-loader.js` - Helper script for logo loading
  - `README.md`, `LICENSE` - Documentation

**Package Exports (in `packages/logos/package.json`):**
```javascript
{
  ".": "./index.json",           // Main entry - metadata index
  "./loader": "./identity-loader.js",  // Logo loading helper
  "./logos/*": "./logos/*"       // Direct logo file access
}
```

**Usage by Consumers:**
```bash
npm install @identitate-ro/logos
```

Then import:
```javascript
import logoPath from '@identitate-ro/logos/logos/anaf/horizontal/color.svg';
// or access metadata
import metadata from '@identitate-ro/logos';
```

## CDN Integration Details

**jsDelivr URL Rewrite (vercel.json):**
- Source: `/logos/:path*` → Destination: `https://cdn.jsdelivr.net/npm/@identitate-ro/logos@1.3.4/logos/:path*`
- Source: `/loader.js` → Destination: `https://cdn.jsdelivr.net/npm/@identitate-ro/logos@1.3.4/identity-loader.js`
- Purpose: Transparent proxy - website serves logos as if they're local, but actually from CDN
- Enables CORS headers to be set by Vercel (not by jsDelivr)

**Asset URL Resolution (website code):**
- File: `website/src/lib/cdn-helpers.ts` - Resolves AssetUrls to CDN or local paths
- File: `website/src/types/institution.ts` - AssetUrls schema with CDN fallback support
  - Supports: `cdn_primary` (jsDelivr), `cdn_fallback` (unpkg), `local` (always required)
- Helper: `resolveAssetPath()` in helpers - Chooses CDN or local based on availability

**Fallback Chain (per institution data):**
1. Try primary CDN URL if available (`cdn_primary`)
2. Fall back to fallback CDN URL if available (`cdn_fallback`)
3. Fall back to local path (`local`)
4. For website itself: uses Vercel rewrite to jsDelivr

## Data Schema & APIs

**Institution Data Format:**
- File location: `website/src/data/institutions/{slug}.json`
- Schema: v3.0.0 (defined in `website/src/types/institution.ts`)
- Fields:
  - `id` (required): Format `ro-{slug}`
  - `slug` (required): URL slug
  - `name` (required): Full official name
  - `shortname` (optional): Abbreviated name
  - `category`: Institution category (governo, minister, primarie, etc.)
  - `meta`: Version, last_updated (ISO 8601), keywords array
  - `assets`: Logo variants with CDN URLs
  - `colors`: Color palette with RGB/CMYK
  - `typography`: Font families and URLs
  - `resources`: External links (website, brand manual, social media, Wikidata)
  - `location`: Country code, county, city

**Search Index:**
- File: `website/src/data/institutions-index.json` (generated)
- Contains: Full institutions array + category metadata
- Schema version: 3.0.0
- Statistics tracked:
  - Total institution count
  - Count by category
  - Institutions with branding manual
  - Institutions with SVG assets
- Generated by: `website/scripts/generate-index.js`

---

*Integration audit: 2026-03-04*
