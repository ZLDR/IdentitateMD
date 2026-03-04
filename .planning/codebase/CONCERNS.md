# Codebase Concerns

**Analysis Date:** 2026-03-04

## Large, Complex Components

**Catalog Page (820 lines):**
- Issue: `website/src/pages/catalog.astro` contains both Astro frontend code (markup, styles) and 600+ lines of inline JavaScript in a single `<script>` block
- Files: `website/src/pages/catalog.astro` (lines 161-816)
- Impact: Difficult to test, maintain, and reason about. Mixed concerns (state management, DOM querying, event handling, HTML building) in one file. Increases cognitive load and risk of bugs during refactoring.
- Fix approach: Extract JavaScript logic into separate modules (`website/src/lib/catalog-logic.ts`, `website/src/lib/catalog-ui.ts`). Test helper functions independently. Keep Astro component focused on template rendering.

**Institution Detail Page (721 lines):**
- Issue: `website/src/pages/institution/[id].astro` combines HTML templating with 600+ lines of JavaScript for detail rendering, copy-to-clipboard, ZIP downloads, and tab switching
- Files: `website/src/pages/institution/[id].astro` (similar structure to catalog)
- Impact: Same risks as catalog page — high maintenance burden, implicit dependencies between inline script sections
- Fix approach: Extract shared functions like `escHtml()`, `buildDetail()`, `resolveUrl()` into `website/src/lib/detail-helpers.ts`. Move event wiring to separate module.

## Type Safety Issues

**Unsafe Type Casts:**
- Issue: Explicit `as unknown as Institution` casts used to bypass type checking
- Files:
  - `website/src/pages/catalog.astro:20` — `const allInstitutions = institutionIndex.institutions as unknown as Institution[];`
  - `website/src/pages/index.astro:9` — Same pattern
  - `website/src/pages/institution/[id].astro:21` — `props: { institution: inst as unknown as Institution }`
  - `website/src/pages/utilizare.astro:5` — Uses `as any[]` (weaker than `as unknown`)
- Impact: Runtime errors possible if data structure doesn't match Institution type. No compile-time guarantee that loaded JSON matches schema.
- Fix approach: Use Zod/AJV schema validation at data load time in `website/src/data/` layer. Create validated loader function that returns `Institution[]` with type safety. See `website/src/types/institution.ts:196-218` — validation functions exist but aren't being used at data load points.

**@ts-ignore Comment:**
- Issue: `website/src/pages/institution/[id].astro:663` uses `@ts-ignore` for CDN dynamic import
- Files: `website/src/pages/institution/[id].astro:663`
- Impact: Suppresses type checking for a critical feature (ZIP download via JSZip). Future changes to import may break without warning.
- Fix approach: Type the dynamic import properly with `import()` return type hints or declare JSZip module types.

## Missing Test Coverage

**No Tests Detected:**
- Issue: Zero test files found in codebase (searched for `*.test.*` and `*.spec.*`)
- Files: None exist
- Impact:
  - No safety net for refactoring large components (catalog.astro, institution/[id].astro)
  - Data transformation logic in `website/src/lib/helpers.ts` untested
  - Asset URL resolution untested (`website/src/lib/cdn-helpers.ts` — critical fallback logic)
  - Type validation functions untested (`website/src/types/institution.ts`)
- Priority: **HIGH** — These are core, frequently-modified files
- Fix approach:
  - Add Vitest + @testing-library/astro
  - Test helpers: `getPrimaryLogoPath()`, `getAllDownloadableAssets()`, `resolveAssetPath()` in `website/src/lib/`
  - Test validation: `isInstitution()`, `hasCurrentSchema()` in `website/src/types/institution.ts`
  - Test CDN fallback chains in `website/src/lib/cdn-helpers.ts`

## Missing Code Quality Tools

**No Linting or Formatting Configured:**
- Issue: No `.eslintrc`, `.prettierrc`, or similar found. TypeScript strict mode enabled, but no ESLint rules
- Files: Missing configuration files
- Impact:
  - Inconsistent code style (example: `utilizare.astro:5` uses `as any[]` while other files use `as unknown as`)
  - No unused variable detection
  - No consistent import ordering
  - No automatic formatting
- Fix approach: Add ESLint with Astro plugin + Prettier. Create `.eslintrc.json` and `.prettierrc.json` with strict rules.

## Error Handling Gaps

**Silent Failures in Async Operations:**
- Issue: Try-catch blocks in `website/src/pages/catalog.astro` and `website/src/pages/institution/[id].astro` don't log errors, just flash UI feedback
- Files:
  - `website/src/pages/catalog.astro:643-646` — Copy SVG asset fetch error caught but only `flashX()` called
  - `website/src/pages/catalog.astro:698-700` — ZIP download error caught but no logging
  - `website/src/pages/institution/[id].astro` similar patterns
- Impact: Production errors are invisible to developers. Users see "X" icon but no indication of why copy failed
- Fix approach: Log errors to console.error() with context. Consider integrating error tracking (Sentry). Add user-facing error messages with details when appropriate.

**Hardcoded CDN Fallback:**
- Issue: CDN_VERSION read from filesystem at build time via `website/src/lib/cdn-helpers.ts:15-24`. If packages/logos/package.json not found (CI environments), silently falls back to 'latest'
- Files: `website/src/lib/cdn-helpers.ts:20-22`
- Impact: 'latest' is unpredictable in production. Could serve wrong version of logos if mismatch occurs between build time and runtime.
- Fix approach: Fail build if version cannot be read. Or pin version explicitly in `website/src/env.ts` instead of reading from filesystem.

## Security Considerations

**XSS Prevention via escHtml():**
- Issue: HTML escaping function exists and is used (example: `website/src/pages/catalog.astro:202-207`), which is good. However, inconsistently applied across dynamically-built HTML strings.
- Files: `website/src/pages/catalog.astro:290-330` — buildVariantCard() properly escapes, but pattern reused throughout
- Impact: Risk is low given the data source (internal JSON), but inconsistency increases risk
- Fix approach: Audit all `innerHTML` assignments. Create HTML builder helper that enforces escaping by default.

**External CDN Trust:**
- Issue: Site relies on jsDelivr and unpkg CDNs for logo assets. Vercel also configured to rewrite /logos/* to jsDelivr.
- Files: `website/vercel.json:5-13`, `website/src/lib/cdn-helpers.ts:31-36`
- Impact: If CDN is compromised, malicious logos served. No integrity checking (no SRI hashes).
- Current mitigation: CDNs are trusted third parties, but no fallback if both CDNs fail
- Recommendations: Consider adding SRI hashes to img src attributes. Add monitoring for CDN health.

## Performance Bottlenecks

**Inline JavaScript in Astro Pages:**
- Issue: Large scripts in `website/src/pages/catalog.astro` (lines 161-816) and similar pages load in global scope on every page view
- Files: `website/src/pages/catalog.astro`, `website/src/pages/institution/[id].astro`
- Cause: Bundle size increases with every line of inline script. Event listeners registered even if page doesn't need them.
- Impact: Initial page load for catalog is heavier than necessary
- Improvement path: Extract scripts to separate modules and lazy-load them. Use Astro's client directives (e.g., `client:only="js"` for client-side heavy components).

**Full Institution Index Loaded in Memory:**
- Issue: `website/src/data/institutions-index.json` fully loaded and parsed in browser on catalog and index pages
- Files: Multiple Astro pages import `institutionIndex` and parse full array
- Impact: Larger JSON = slower initial parse and search, memory overhead
- Improvement path: Paginate institutions or load via API endpoint. Pre-compute search indices at build time.

**ZIP Download via Fetch + JSZip:**
- Issue: `website/src/pages/catalog.astro:685-695` fetches all assets and creates ZIP client-side
- Files: `website/src/pages/catalog.astro:677-703`
- Impact: Bandwidth-heavy for users with many logos. JSZip dynamically imported from CDN
- Improvement path: Server-side ZIP creation or pre-built archives. Cache zips at CDN level.

## Fragile Areas

**Asset URL Resolution:**
- Files: `website/src/lib/cdn-helpers.ts`, `website/src/lib/helpers.ts`
- Why fragile: Multiple fallback paths (string path vs object with cdn_primary/cdn_fallback/local). Easy to miss edge cases when adding new asset types.
- Safe modification: Add comprehensive unit tests for `resolveAssetPath()` and `getAssetFallbackUrls()`. Document all path formats in JSDoc.
- Test coverage: Needs unit tests for:
  - String paths starting with `/logos/`
  - String paths as relative URLs
  - AssetUrls object with all combinations of cdn_primary/cdn_fallback/local
  - Undefined/null handling

**Institution Schema Versioning:**
- Files: `website/src/types/institution.ts:1-220`, `website/src/data/institutions-index.json`
- Why fragile: Schema defined in TypeScript but validation only happens at type-cast time. No explicit version field in data to detect schema mismatches.
- Safe modification: Add `schemaVersion` field to Institution type. Use validation function at all data-load points (`website/src/lib/data-loader.ts` — doesn't exist yet).

**Category Ordering and Labels:**
- Files: `website/src/lib/labels.ts`, `website/src/pages/catalog.astro:15-18`, `website/src/pages/index.astro`
- Why fragile: CATEGORY_ORDER and CATEGORY_LABELS defined in separate places. If a new category is added to data but not to CATEGORY_ORDER, it's silently dropped from UI.
- Safe modification: Import single source of truth (combine into one object with both order and labels). Test that all categories in institutions data appear in UI.

## Scaling Limits

**Static Generation Scale:**
- Current capacity: 820-line Astro page with 600+ lines inline JS can theoretically handle hundreds of institutions
- Limit: Beyond ~1000 institutions, page becomes heavy (JS bundle size, JSON parsing time)
- Scaling path:
  1. Move to dynamic routes (currently using static `getStaticPaths()`)
  2. Split institution detail into API endpoint + client-side rendering
  3. Implement pagination on catalog

**CDN Version Hardcoding:**
- Issue: CDN_VERSION is computed at build time and baked into HTML/JS
- Limit: Upgrading logos package requires full site rebuild and redeploy
- Scaling path: Move CDN version to a config endpoint or feature flag system that doesn't require site rebuild

## Dependencies at Risk

**Astro 5.2.0:**
- Risk: Major version, may have breaking changes in minor updates
- Impact: Relies on Astro SSG and Vercel adapter
- Current mitigation: Using caret (`^5.2.0`), allows minor updates
- Migration plan: Pin to 5.x for stability. Monitor Astro changelog.

**Fuse.js 7.0.0:**
- Risk: Search library — if performance degrades or API changes, search feature breaks
- Impact: Used for client-side institution search on index page
- Current mitigation: None visible in code
- Migration plan: Implement fallback to simple string includes() if Fuse fails to load. Monitor Fuse updates.

## Missing Critical Features

**No Data Integrity Validation on Load:**
- Problem: Data loaded without schema validation. Invalid JSON structure could break pages silently.
- Blocks: Confident refactoring of data format. Automated data quality checks in CI.
- Recommendation: Implement AJV-based validation at build time. Reject builds if institutions data doesn't match schema.

**No Error Reporting/Monitoring:**
- Problem: Production errors are invisible (no Sentry, no error logging endpoint)
- Blocks: Diagnosing user issues. Knowing when CDN is down or slow.
- Recommendation: Add error tracking (Sentry) or simple error logging API endpoint.

**No Update Notification System:**
- Problem: When institution data is updated, users don't know
- Blocks: Building trust in data freshness
- Recommendation: Add "last updated" timestamps and consider caching strategies

## Test Coverage Gaps

**Helper Functions Untested:**
- What's not tested:
  - `getPrimaryLogoPath()` — varies based on asset availability
  - `getAllDownloadableAssets()` — complex nested loops
  - `getLogoVariants()` — referenced in code but behavior unclear without tests
  - `getCdnLogoUrl()` — CDN URL generation
  - `resolveAssetPath()` — critical fallback logic
- Files: `website/src/lib/helpers.ts`, `website/src/lib/cdn-helpers.ts`
- Risk: Asset resolution bugs go undetected. Logos might fail silently on production.
- Priority: **HIGH**

**Type Guard Functions Untested:**
- What's not tested: `isInstitution()`, `hasCurrentSchema()` in `website/src/types/institution.ts`
- Files: `website/src/types/institution.ts:196-218`
- Risk: Invalid institution data passes type checks at runtime
- Priority: **HIGH**

**Catalog Search & Filter Untested:**
- What's not tested: Client-side search, category filtering, sorting in `website/src/pages/catalog.astro`
- Files: `website/src/pages/catalog.astro:717-748` (applySortAndFilter function)
- Risk: Search UI may silently fail; filters may show wrong results
- Priority: **MEDIUM**

**ZIP Download Flow Untested:**
- What's not tested: Fetch + JSZip operations in detail pages
- Files: `website/src/pages/catalog.astro:677-703`, institution/[id].astro similar
- Risk: Users can't download logos when feature breaks (e.g., JSZip CDN fails)
- Priority: **MEDIUM**

---

*Concerns audit: 2026-03-04*
