# Codebase Structure

**Analysis Date:** 2026-03-04

## Directory Layout

```
website/
├── src/                           # Source code (Astro project root)
│   ├── components/                # Reusable UI components
│   ├── data/                      # Static JSON data for institutions
│   ├── layouts/                   # Page layout templates
│   ├── lib/                       # Shared utility functions
│   ├── pages/                     # Route definitions (Astro pages)
│   ├── styles/                    # Global CSS and Tailwind config
│   ├── types/                     # TypeScript type definitions
│   └── env.d.ts                   # Astro environment types
├── public/                        # Static assets (fonts, images, SVGs)
│   └── logos/                     # Institution logo files (organized by ID)
├── scripts/                       # Build and data generation scripts
├── tools/                         # External tools and generators
├── astro.config.mjs               # Astro framework configuration
├── tailwind.config.mjs            # Tailwind CSS design system
├── tsconfig.json                  # TypeScript compiler options
├── package.json                   # Dependencies and build scripts
└── README.md                      # Project documentation
```

## Directory Purposes

**`src/components/`:**
- Purpose: Reusable Astro components for UI building blocks
- Contains: .astro files only (no JS frameworks)
- Key files:
  - `LogoCard.astro` (64 lines): Grid card for institution preview in search/browse context
  - `LogoVariantCard.astro` (73 lines): Card showing individual logo variant with swatches
  - `ColorSwatch.astro` (75 lines): Color display with hex/rgb/cmyk/pantone
  - `Header.astro` (118 lines): Navigation, logo, links
  - `Footer.astro` (63 lines): Footer content
  - `Logo.astro` (21 lines): Simple logo SVG embed

**`src/data/`:**
- Purpose: Central source of truth for all institution information
- Contains: JSON data files and generated index
- Key files:
  - `institutions/` (41 subdirectories): Individual institution JSON files (one per institution, e.g., `ro-anaf.json`)
  - `institutions-index.json`: Auto-generated index with all institutions and statistics (82KB)
- Files are read at build time and embedded into pages

**`src/layouts/`:**
- Purpose: Shared page structure and metadata
- Contains: Single BaseLayout.astro (95 lines)
- Key files:
  - `BaseLayout.astro`: HTML document structure, SEO tags, Open Graph, JSON-LD, analytics

**`src/lib/`:**
- Purpose: Pure utility functions for data transformation and asset resolution
- Contains: TypeScript utility modules
- Key files:
  - `helpers.ts` (258 lines): Asset extraction, logo path resolution, display formatting
  - `cdn-helpers.ts` (138 lines): CDN URL generation, fallback chain management
  - `labels.ts` (88 lines): UI label mappings (categories, colors, layouts)

**`src/pages/`:**
- Purpose: Route definitions and page rendering
- Contains: .astro files that become HTTP routes
- Key files:
  - `index.astro` (459 lines): Homepage with search, filters, logo grid
  - `catalog.astro` (600+ lines): Three-pane catalog view
  - `institution/[id].astro` (600+ lines): Dynamic detail page per institution
  - `sobre.astro`, `legal.astro`, `privacy.astro`, `solicita.astro`, `utilizare.astro`: Static pages
  - `404.astro` (65 lines): 404 error page
  - `admin.astro`: Empty stub for future admin interface
  - `api/admin/`: Empty endpoint stubs (delete.ts, institutions.ts, save.ts, schema.ts, upload-svg.ts)

**`src/styles/`:**
- Purpose: Global CSS and design tokens
- Contains: Tailwind CSS configuration and global CSS
- Key files:
  - `global.css` (124 lines): Base layer, component layer, utility layer definitions
  - `tailwind.config.mjs` (79 lines): Color system, fonts, shadows, animations

**`src/types/`:**
- Purpose: TypeScript type definitions and validation
- Contains: Type interfaces and guards
- Key files:
  - `institution.ts` (230 lines): Complete Institution schema with nested types, enums, type guards

**`public/logos/`:**
- Purpose: Organization of institution logo SVG files
- Contains: Directory structure matching institution IDs (e.g., `/public/logos/ro-anaf/horizontal/color.svg`)
- Pattern: `ro-{slug}/{layout}/{variant}.svg`
  - Layouts: horizontal, vertical, symbol
  - Variants: color, dark_mode, white, black, monochrome

**`scripts/`:**
- Purpose: Build-time automation
- Contains: Node.js scripts for data generation
- Key files:
  - `generate-index.js` (131 lines): Reads all institution JSON, validates schema, generates `institutions-index.json`
  - `migrate-to-cdn.js` (~155 lines): Utility for migrating asset paths to CDN URLs

**`tools/`:**
- Purpose: External generation and utility tools
- Contains: Tool-specific directories
- Key:
  - `generate-institutions/`: Script for bulk data generation from markdown

**`public/`:**
- Purpose: Static assets served as-is
- Contains: Favicon, OG images, logo SVGs
- Key files:
  - `favicon.svg`: Site favicon
  - `logos/`: Institution logo directory tree

## Key File Locations

**Entry Points:**
- `src/pages/index.astro`: Homepage with search + grid + category filters
- `src/pages/catalog.astro`: Three-pane catalog interface
- `src/pages/institution/[id].astro`: Institution detail page template

**Configuration:**
- `astro.config.mjs`: Astro framework setup (integrations, adapters, build config)
- `tailwind.config.mjs`: Tailwind design tokens (colors, fonts, shadows)
- `tsconfig.json`: TypeScript strict mode, path aliases (@/* → src/*)
- `package.json`: Dependencies (astro, tailwind, fuse.js, vercel adapter)

**Core Logic:**
- `src/types/institution.ts`: Data model with 10+ nested types and validation guards
- `src/lib/helpers.ts`: Asset extraction and display logic
- `src/lib/cdn-helpers.ts`: CDN URL resolution with fallback chains
- `src/lib/labels.ts`: UI label mappings

**Testing:**
- No test files detected

**Data:**
- `src/data/institutions-index.json`: Generated index of all 33+ institutions
- `src/data/institutions/*.json`: Individual institution records

## Naming Conventions

**Files:**
- Astro components: PascalCase (e.g., `LogoCard.astro`, `ColorSwatch.astro`)
- TypeScript utilities: camelCase (e.g., `helpers.ts`, `cdn-helpers.ts`)
- Pages: kebab-case or [brackets] for routes (e.g., `institution/[id].astro`)
- Data: kebab-case slugs (e.g., `ro-anaf.json`)

**Directories:**
- Feature/layer directories: kebab-case or lowercase (e.g., `src/components/`, `src/pages/`, `api/admin/`)
- Institution logos: `ro-{slug}` pattern (e.g., `ro-anaf/`, `ro-camera-deputatilor/`)

**Variables & Functions:**
- camelCase for functions and variables: `getPrimaryLogoPath()`, `filterAndSearch()`, `activeCategory`
- UPPERCASE for constants: `CATEGORY_LABELS`, `CATEGORY_ORDER`, `CDN_VERSION`
- Interfaces: PascalCase: `Institution`, `Assets`, `LogoAssetGroup`, `Color`
- Type names: PascalCase: `InstitutionCategory`, `LogoColorVariant`, `LogoLayout`

**CSS Classes:**
- kebab-case with BEM-like structure: `.category-chip`, `.category-chip--active`, `.logo-card`, `.btn-primary`
- Tailwind utilities: Use @apply for reusable patterns

## Where to Add New Code

**New Institution:**
1. Create JSON file: `src/data/institutions/{slug}.json` following Institution schema
2. Add logo SVG files: `public/logos/ro-{slug}/{layout}/{variant}.svg`
3. Run: `npm run data:generate` to regenerate institutions-index.json
4. Institution automatically appears on homepage and catalog

**New Feature Page:**
1. Create page: `src/pages/{slug}.astro`
2. Import `BaseLayout` from `src/layouts/BaseLayout.astro`
3. Use existing components from `src/components/`
4. Route becomes `/{slug}` automatically

**New Component:**
1. Create file: `src/components/{Name}.astro`
2. Define props interface in frontmatter
3. Import only from `src/lib/` and `src/types/` as needed
4. Destructure props from `Astro.props`
5. Place in `src/components/` only (not in `src/pages/`)

**New Utility Function:**
1. Add to `src/lib/` (helpers.ts, cdn-helpers.ts, or labels.ts depending on purpose)
2. Export named function
3. Add TypeScript types for parameters and return
4. Document with JSDoc comment above function

**New Style:**
1. Add component or utility class in `src/styles/global.css`
2. Use @layer components for reusable patterns
3. Use @apply to compose Tailwind utilities
4. Update `tailwind.config.mjs` for custom colors/animations if needed

## Special Directories

**`src/data/institutions/`:**
- Purpose: Holds institution definition files
- Generated: No (manual JSON files)
- Committed: Yes (source data)
- Pattern: `ro-{slug}.json` files, one per institution

**`src/data/institutions-index.json`:**
- Purpose: Aggregated index of all institutions
- Generated: Yes (by `scripts/generate-index.js`)
- Committed: Yes (check in generated index for reproducibility)
- When to regenerate: After adding/removing/modifying any institution JSON

**`public/logos/`:**
- Purpose: SVG asset storage
- Generated: No (manually added or from external tool)
- Committed: Yes (contains all logo assets)
- Pattern: `ro-{id}/{layout}/{variant}.svg`

**`src/styles/`:**
- Purpose: Global design system
- Generated: No
- Committed: Yes
- Notes: Uses @layer directive; order matters (base → components → utilities)

**`.planning/codebase/`:**
- Purpose: External planning and documentation
- Generated: External (by orchestrator)
- Committed: Yes
- Contains: ARCHITECTURE.md, STRUCTURE.md, CONVENTIONS.md, TESTING.md, CONCERNS.md, STACK.md, INTEGRATIONS.md

---

*Structure analysis: 2026-03-04*
