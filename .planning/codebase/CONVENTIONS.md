# Coding Conventions

**Analysis Date:** 2026-03-04

## Naming Patterns

**Files:**
- PascalCase for Astro components: `Header.astro`, `LogoCard.astro`, `ColorSwatch.astro`
- camelCase for utility/helper modules: `helpers.ts`, `cdn-helpers.ts`, `labels.ts`
- kebab-case for page routes: `[id].astro`, `institution.astro`
- UPPERCASE for constant data files: `institutions-index.json`

**Functions:**
- camelCase for all function names: `getPrimaryLogoPath()`, `getAllDownloadableAssets()`, `getLogoVariants()`
- Descriptive, verb-first naming: `formatRgb()`, `hasSvg()`, `resolveAssetPath()`
- Prefixes for type guards: `isInstitution()`, `hasCurrentSchema()`
- Descriptive event handlers: `filterAndSearch()`, `readUrlState()`, `writeUrlState()`

**Variables:**
- camelCase for local variables and state: `activeCategory`, `searchQuery`, `logoPath`
- UPPERCASE with underscores for module-level constants: `CDN_VERSION`, `CDN_PATTERNS`, `CATEGORY_LABELS`
- Lowercase with underscores for JSON data fields: `dark_mode`, `cdn_primary`, `branding_manual`, `usage_notes`

**Types:**
- PascalCase for interfaces and types: `Institution`, `LogoColorVariant`, `DownloadableAsset`
- Record types for enums/lookups: `Record<string, string>` for label maps

## Code Style

**Formatting:**
- Line length: Pragmatic (varies, no strict enforcer visible)
- Indentation: 2 spaces (TypeScript, Astro)
- Quote style: Single quotes in JS/TS, double quotes in HTML attributes
- Trailing commas: Used in multi-line arrays/objects

**Linting:**
- No ESLint or Prettier config detected in package.json
- TypeScript strict mode enabled: `"strict": true` in `tsconfig.json`
- No linter integration found - conventions enforced through peer review

**Astro-specific:**
- Component props defined via `interface Props` at top of frontmatter
- Destructure props immediately: `const { slug, name, category } = Astro.props`
- Comments use `//` for single-line, `/** */` for JSDoc above exports
- HTML templates use Astro directives: `class:list={}`, `set:html={}`

## Import Organization

**Order:**
1. External libraries: `import { defineConfig } from 'astro/config'`
2. Internal types: `import type { Institution } from '../types/institution'`
3. Internal modules: `import { helpers } from '../lib/helpers'`
4. Astro components: `import Header from '../components/Header.astro'`
5. Data files: `import institutionIndex from '../data/institutions-index.json'`

**Path Aliases:**
- Configured in `tsconfig.json`:
  - `@/*`: `src/*`
  - `@data/*`: `src/data/*`
  - `@components/*`: `src/components/*`
  - `@layouts/*`: `src/layouts/*`
- Used consistently in imports: `import { helpers } from '@/lib/helpers'`

**Separation:**
- Type imports use `import type {}` to avoid circular dependencies
- Default imports for modules, named imports for utilities

## Error Handling

**Patterns:**
- Null-coalescing: `return asset || null` and `?? undefined`
- Fallback chains: `asset.cdn_primary || asset.cdn_fallback || asset.local`
- Try-catch for file operations (in scripts): `try { ... } catch (err) { console.error(...) }`
- Defensive filtering: `.filter(item => item !== null)` with type guards
- Optional chaining: `inst.resources?.website`, `group?.png?.width`

**Type Safety:**
- Union types for flexible APIs: `AssetUrls = string | { cdn_primary?: string; local: string }`
- Type guards as functions: `isInstitution(obj): obj is Institution { ... }`
- Type assertions when necessary: `const btn = e.currentTarget as HTMLButtonElement`

## Logging

**Framework:** console (no specialized logger)

**Patterns:**
- Build scripts use emoji-prefixed logs for clarity: `console.log('📊 ...')`, `console.error('❌ ...')`
- Client-side errors logged only on failure: `console.error('Failed to copy:', err)`
- No debug logs in production code
- Console output used for build-time reporting in `scripts/generate-index.js`

## Comments

**When to Comment:**
- File headers with purpose: `// IdentitateRO — Navbar-ul aplicației`
- Section dividers using ASCII: `// ─── Section Name ───────────────────`
- Explanations for non-obvious logic: "Priority: color → dark_mode → black..."
- Comments in Russian for internationalization context

**JSDoc/TSDoc:**
- Used for exported functions: `/** Returnează calea către logo-ul principal */`
- Parameter and return type documentation:
  ```typescript
  /**
   * @param localPath - Path-ul local (ex: "/logos/anaf/anaf.svg")
   * @returns Obiect AssetUrls cu CDN URLs
   */
  ```
- Interface/type documentation above definitions
- In Romanian for user-facing descriptions, English for implementation details

**Romanian Comments:**
- Predominant language in comments reflecting project origin
- Mix of Romanian and English for technical terms
- No strict translation rules - pragmatic mixing

## Function Design

**Size:**
- Most helper functions: 5-20 lines
- Larger functions: ~50-70 lines when necessary (e.g., `filterAndSearch()` in pages)
- Inline logic preferred when under 5 lines

**Parameters:**
- Single parameter or destructured object: `{ layout, variant, asset }`
- Type annotations required: `inst: Institution`
- Optional parameters with defaults: `preferCdn: boolean = false`
- Avoid more than 3 positional parameters

**Return Values:**
- Explicit types: `string | null`, `Array<[string, string]>`
- Early returns for validation: `if (!asset) return null;`
- Type narrowing with filters: `.filter((item): item is Type => item !== null)`

## Module Design

**Exports:**
- Named exports for utilities: `export function getPrimaryLogoPath(...)`
- Default export for components: `export default Header`
- Type exports for interfaces: `export type Institution = ...`
- Constants as named exports: `export const CATEGORY_LABELS = ...`

**Barrel Files:**
- Not used - imports go directly to source files
- Modules kept focused on single responsibility: `helpers.ts` for path logic, `cdn-helpers.ts` for CDN URLs

**File Structure per Module:**
- Type definitions first (interfaces, types, enums)
- Constants second (CATEGORY_LABELS, etc.)
- Utility functions last
- Internal helpers not prefixed with underscore

## Component Conventions

**Astro Components:**
- Props interface at top: `interface Props { slug: string; ... }`
- Destructure immediately after interface definition
- Separate frontmatter and template with `---`
- Use `class:list={}` for conditional classes (never string concatenation)
- Fragment for multiple root elements: `<> ... </>`

**Class Management:**
- Tailwind only (no custom CSS in components)
- Responsive prefixes: `md:hidden`, `sm:text-base`, `lg:grid-cols-5`
- State classes: `category-chip--active`, `category-chip--inactive`

## Accessibility

**Patterns:**
- ARIA attributes when needed: `aria-label={}`, `aria-expanded={}`, `aria-current="page"`
- Semantic HTML: `<nav>`, `<article>`, `<header>`, `<section>`
- Alt text on images: `alt={`Logo ${name}`}`
- Keyboard shortcuts documented: `title="Copiază (Ctrl+C)"`
- Focus management: searchInput.focus() on keyboard shortcut

## Astro-specific Practices

**Static Generation:**
- `getStaticPaths()` for dynamic routes: returns array of params and props
- Pre-computed values in frontmatter: `const grouped = new Map()`
- Data passed to client via `define:vars={}` for hydration

**Hydration:**
- Island architecture: `<script is:inline>` for non-hydrated scripts
- No framework dependencies (vanilla JS only)
- Module scripts for reusable logic

**Data Flow:**
- JSON data loaded at build time: `import institutions from '../data/institutions-index.json'`
- No async/await in templates (computed at build)
- Client state managed with vanilla JS (no Svelte/React components)

---

*Convention analysis: 2026-03-04*
