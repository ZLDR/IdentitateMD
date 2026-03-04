# IdentitateMD Roadmap

**Project:** Any developer can find and use the official logo of any Moldovan public institution in seconds.

**Current Date:** 2026-03-04
**Status:** Not started

---

## Phases

- [ ] **Phase 1: Branding & Typography** - Rebrand site identity from Romania to Moldova and replace typography system
- [ ] **Phase 2: Data Architecture** - Migrate institution data layer from `ro-` to `md-` prefix and prepare schema validation
- [ ] **Phase 3: Content Localization** - Adapt all user-facing content and pages for Moldova context

---

## Phase Details

### Phase 1: Branding & Typography
**Goal:** Site is visually and textually branded for Moldova; all references to Romania removed; modern typography (Onest) replaces Public Sans.

**Depends on:** Nothing (foundation phase)

**Requirements:** BRAND-01, BRAND-02, BRAND-03, BRAND-04, TYPO-01, TYPO-02, TYPO-03

**Success Criteria** (what must be TRUE when complete):
1. Site URL in browser is identitate.md; astro.config.mjs, vercel.json, and all meta tags reference identitate.md
2. Page titles, descriptions, and OG images reference "Republic of Moldova" (not Romania); all Romania-specific language removed
3. Package references across codebase (`@identitate-ro/logos` → `@identitate-md/logos`) updated in package.json, CDN configs, and comments
4. Onest font from Google Fonts loads on every page; Public Sans is removed; Tailwind config uses Onest as primary font family
5. No visual inconsistency: font preload/preconnect tags work; Onest renders consistently across all pages and components

**Plans:** 2 plans

Plans:
- [ ] 01-01-PLAN.md — Update config files and package references (astro.config, vercel.json, package.json, cdn-helpers.ts)
- [ ] 01-02-PLAN.md — Update layout meta tags, replace Public Sans with Onest, rebrand components (BaseLayout, Tailwind, global.css, Header, Footer, 404)

---

### Phase 2: Data Architecture
**Goal:** Institution data layer is restructured and validated for Moldova; schema expects `md-` prefix; build system enforces this validation.

**Depends on:** Phase 1

**Requirements:** DATA-01, DATA-02, DATA-03, DATA-04, DX-02

**Success Criteria** (what must be TRUE when complete):
1. All institution ID references in codebase (type guards, validation scripts, generate-index.js) validate and enforce `md-` prefix (not `ro-`)
2. Existing Romanian institution JSON files removed from data directory; logo directory structure uses `md-{slug}` pattern only
3. Institution build validation passes: generate-index.js checks that all institutions match `md-*` pattern; build fails if `ro-` prefix detected
4. institutions-index.json regenerated and exports valid empty or initial Moldovan institution records; file is ready for owner to add institutions
5. README updated with Moldova-specific setup instructions and build validation guidance

**Plans:** TBD

---

### Phase 3: Content Localization
**Goal:** All user-facing content (hero, pages, labels, footer) reflects Moldovan government context and terminology; site is ready for institution data population.

**Depends on:** Phase 2

**Requirements:** CONT-01, CONT-02, CONT-03, CONT-04, CONT-05, CONT-06, CONT-07, DX-01

**Success Criteria** (what must be TRUE when complete):
1. Homepage hero text and taglines reference Moldovan public institutions (not Romanian); context is locally accurate
2. Static pages (despre.astro, utilizare.astro, solicita.astro, legal, privacy) rewritten for Moldova: language, references, and links are Moldova-appropriate
3. Institution categories (labels.ts) reflect Moldovan government structure (ministries, agencies, etc.); categorization matches target institutions
4. Footer links and social references point to correct Moldova-specific URLs and contacts; no Romania branding remains
5. Site is fully functional and visually complete: developer can browse empty catalog, access all pages, and understand how to add institutions

**Plans:** TBD

---

## Progress Table

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Branding & Typography | 0/2 | Not started | — |
| 2. Data Architecture | 0/5 | Not started | — |
| 3. Content Localization | 0/8 | Not started | — |

**Total Work Items:** 15 (2 + 5 + 8)

---

## Coverage Summary

**v1 Requirements:** 17 total
**Mapped:** 17 (BRAND-01 to 04, TYPO-01 to 03, DATA-01 to 04, CONT-01 to 07, DX-01, DX-02)
**Unmapped:** 0 ✓

Every requirement is assigned to exactly one phase. No orphans.

---

*Roadmap created: 2026-03-04*
*Phase 1 planned: 2026-03-04*
