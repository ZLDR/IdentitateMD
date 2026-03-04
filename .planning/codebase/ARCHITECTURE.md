# Architecture

**Analysis Date:** 2026-03-04

## Pattern Overview

**Overall:** Static site generator with client-side interactivity (Jamstack)

**Key Characteristics:**
- Astro-based static site generation with selective client-side JavaScript
- Content-driven design: institution data as JSON source of truth
- Multi-page application with dynamic routes and filtered views
- Client-side search/filter using Fuse.js for fast, responsive UX
- CDN-aware asset routing with fallback chains
- Type-safe TypeScript throughout with strict mode enabled

## Layers

**Data Layer:**
- Purpose: Define and validate institution schemas, manage all static data
- Location: `src/data/`, `src/types/institution.ts`
- Contains: JSON institution records (33 institutions), TypeScript interfaces, schema validation
- Depends on: Nothing (pure data)
- Used by: All pages, components, and helper functions

**Type System & Validation:**
- Purpose: Ensure data integrity and provide type safety across codebase
- Location: `src/types/institution.ts`
- Contains: `Institution` interface with nested types (Assets, LogoAssetGroup, Color, Typography, Resources, Meta, Location)
- Depends on: Nothing
- Used by: All components, pages, and lib utilities

**Library/Helper Layer:**
- Purpose: Reusable functions for data transformation, asset resolution, and display logic
- Location: `src/lib/`
- Contains:
  - `helpers.ts`: Asset extraction, logo path resolution, display name formatting, color/typography utilities
  - `cdn-helpers.ts`: CDN URL generation, fallback chain management, asset URL resolution
  - `labels.ts`: UI label mappings for categories, colors, layouts, quality levels
- Depends on: Type layer
- Used by: Pages and components

**Component Layer:**
- Purpose: Reusable UI building blocks for page composition
- Location: `src/components/`
- Contains: Astro components for LogoCard, ColorSwatch, LogoVariantCard, Header, Footer, Logo
- Depends on: Type and library layers
- Used by: Pages (index.astro, catalog.astro, institution detail pages)

**Page Layer (Rendering):**
- Purpose: Define routes, handle data aggregation, render complete pages
- Location: `src/pages/`
- Contains: Static pages (index.astro, catalog.astro, about, privacy, legal) and dynamic routes (institution/[id].astro)
- Depends on: All other layers (components, helpers, types, data)
- Used by: Astro routing system

**Layout Layer:**
- Purpose: Shared HTML structure and metadata management
- Location: `src/layouts/BaseLayout.astro`
- Contains: Document structure, SEO tags, Open Graph, structured data (JSON-LD), analytics injection
- Depends on: Components (Header, Footer), global styles
- Used by: All pages

**Styling:**
- Purpose: Visual design system using Tailwind CSS
- Location: `src/styles/global.css`, `tailwind.config.mjs`
- Contains: Base layer (fonts, body), component layer (buttons, cards, badges), utility layer, design tokens
- Depends on: Nothing
- Used by: All components and pages

## Data Flow

**Homepage (Search & Filter) Flow:**

1. Build time: `scripts/generate-index.js` reads all institution JSON files, validates schema v3.0 markers, sorts alphabetically, aggregates statistics
2. Build time: Index written to `src/data/institutions-index.json` with schemaVersion, categories, all institutions
3. Page render (`src/pages/index.astro`):
   - Reads institutions-index.json
   - Groups by category using CATEGORY_ORDER from `src/lib/labels.ts`
   - Renders category sections with LogoCard components
   - Injects institution data and category labels as window globals for JavaScript
4. Client-side (`index.astro` inline script):
   - Fuse.js initialized with weighted keys (name: 0.4, shortname: 0.3, keywords: 0.2, description: 0.1)
   - User input triggers search and filter operations
   - DOM state modified in-place (cards shown/hidden, category sections toggled)
   - URL state persisted via query params (categorie, q)
   - Results count updated dynamically

**Catalog Page (Three-pane Layout) Flow:**

1. Page render (`src/pages/catalog.astro`):
   - Reads institutions-index.json, groups by category
   - Renders left sidebar with category buttons
   - Renders center sidebar with institution search/list
   - Renders right pane with detail view (populated via JavaScript)
2. Client-side: Similar Fuse.js search with category selection
3. Server route: Dynamic CDN URL generation for logo previews

**Institution Detail Page Flow:**

1. Build time: Astro `getStaticPaths()` generates static routes for each institution (one per slug)
2. Page render (`src/pages/institution/[id].astro`):
   - Resolves institution from props
   - Extracts all downloadable assets using `getAllDownloadableAssets()`
   - Generates SEO metadata with custom titles/descriptions
   - Generates JSON-LD structured data (GovernmentOrganization, BreadcrumbList)
   - Renders logo variants, colors, typography, resources

**State Management:**

- URL query params: `?categorie=minister&q=educatie` persisted via browser history API
- Window globals: `window.__IDENTITATE_DATA__` and `window.__CATEGORY_LABELS__` injected at page render
- DOM-based: No state manager; filters shown/hidden by toggling classes on existing elements
- Local storage: Not used

**Asset Routing:**

1. Build time: Institution JSON contains asset paths (`/logos/{id}/{layout}/{variant}.svg`)
2. Page render: `resolveAssetPath()` converts path to URL based on preference
3. CDN preference: If preferCdn=true and path starts with `/logos/`, uses jsdelivr CDN URL
4. Fallback: jsdelivr → unpkg → local path
5. Version: Automatically read from `packages/logos/package.json` via `CDN_VERSION`

## Key Abstractions

**Institution Type:**
- Purpose: Represents complete data model for a government entity
- Examples: `src/types/institution.ts` (230 lines), individual institution JSON files in `src/data/institutions/`
- Pattern: TypeScript interface with strict validation; includes id, slug, category, assets, colors, typography, resources, metadata

**Assets Structure:**
- Purpose: Flexible logo asset grouping with multiple layouts and color variants
- Examples: `src/types/institution.ts` (LogoAssetGroup, Assets interfaces)
- Pattern: Main logo as shortcut for DX; optional horizontal/vertical/symbol layouts; each with color, dark_mode, white, black, monochrome variants; PNG as optional fallback

**LogoCard & LogoVariantCard:**
- Purpose: Presentation components for logos in different contexts
- Examples: `src/components/LogoCard.astro` (64 lines), `src/components/LogoVariantCard.astro` (73 lines)
- Pattern: Accept props from parent, minimal internal logic, fallback to "image unavailable" on load error

**Helper Functions:**
- Purpose: Pure utility functions for data transformation
- Examples: `getPrimaryLogoPath()`, `hasSvg()`, `getAllDownloadableAssets()`, `getLogoVariants()`
- Pattern: Accept institution object, return formatted/extracted data, no side effects

## Entry Points

**Homepage (`/`):**
- Location: `src/pages/index.astro`
- Triggers: Direct URL navigation or browser back/forward
- Responsibilities: Render hero section with search, category filter pills, institution grid, handle client-side search/filter with Fuse.js

**Catalog (`/catalog`):**
- Location: `src/pages/catalog.astro`
- Triggers: User clicks "View catalog" link
- Responsibilities: Render three-pane layout (categories sidebar, institution list, detail pane), manage category and search state

**Institution Detail (`/institution/:slug`):**
- Location: `src/pages/institution/[id].astro`
- Triggers: User clicks on LogoCard or direct URL navigation
- Responsibilities: Render institution-specific page with all assets, colors, typography, links, generate SEO and structured data

**Static Pages:**
- Location: `src/pages/` (despre.astro, legal.astro, privacy.astro, solicita.astro, utilizare.astro)
- Triggers: Navigation menu
- Responsibilities: Content display for about, legal, privacy, submission form, usage guidelines

**Admin Routes (Placeholder):**
- Location: `src/pages/api/admin/` (all files are currently empty stubs)
- Triggers: Not yet implemented
- Responsibilities: Future endpoints for CRUD operations

## Error Handling

**Strategy:** Graceful degradation with fallbacks

**Patterns:**

- **Asset Loading:** LogoCard includes onerror handler that hides broken image and shows placeholder icon with "Logo indisponibil"
- **Asset Resolution:** `resolveAssetPath()` returns null if asset undefined; calling code must check for null before use
- **CDN Fallback:** `getAssetFallbackUrls()` returns array of URLs in priority order (jsdelivr → unpkg → local)
- **Schema Validation:** Build-time validation in `generate-index.js` skips invalid institutions with console warnings
- **Type Safety:** TypeScript strict mode prevents null/undefined access at compile time

## Cross-Cutting Concerns

**Logging:** Console methods used for informational logging (no logger framework)

**Validation:**
- Build time: `generate-index.js` validates schema v3.0 markers (ro- prefix, keywords array, assets.main object)
- Runtime: TypeScript type guards (isInstitution, hasCurrentSchema) in `src/types/institution.ts`

**Authentication:** None (static site; no admin auth)

**SEO:**
- Canonical URLs: Absolute URLs generated in BaseLayout
- Meta tags: Title, description, og:* tags rendered per-page
- Structured data: JSON-LD for GovernmentOrganization and BreadcrumbList on detail pages
- Sitemap: Generated via @astrojs/sitemap integration

**Performance:**
- Image lazy-loading: LogoCard uses loading="lazy" attribute
- Font optimization: Public Sans preconnect + preload with print media fallback
- CSS: Tailwind purging enabled; @layer organization for component reuse

---

*Architecture analysis: 2026-03-04*
