# Project State: IdentitateMD

**Last Updated:** 2026-03-04
**Current Phase:** None (roadmap complete, awaiting planning)

---

## Project Reference

**Core Value:** Any developer can find and use the official logo of any Moldovan public institution in seconds.

**Stakeholders:**
- Product Owner: User (defines institutions, approves branding)
- Builder: Claude
- Context: Fork of identitate.eu (Romania) → identitate.md (Moldova)

**Stack:** Astro 5 + Tailwind CSS + Fuse.js + Vercel

---

## Current Position

**Roadmap Status:** Complete (3 phases identified, success criteria derived)

**Phases:**
1. Branding & Typography — Rebrand site + update typography (Onest font)
2. Data Architecture — Migrate institution IDs from `ro-` to `md-` prefix
3. Content Localization — Adapt all pages for Moldova context

**Next Step:** `/gsd:plan-phase 1`

---

## Decisions Made

| Decision | Rationale | Status |
|----------|-----------|--------|
| Keep Astro (no rewrite) | Codebase well-structured; adaptation not rewrite | Confirmed |
| Onest font via Google Fonts | Owner preference; modern, readable | Confirmed |
| Romanian only (v1) | Moldova's official language; simplifies scope | Confirmed |
| No npm package (v1) | Focus on website; can add v2 | Confirmed |
| Linear phase structure | Branding → Data → Content (natural dependency) | Confirmed |

---

## Key Facts

- **Requirements:** 17 v1 (mapped to 3 phases), 2 v2 (deferred)
- **Current Institutions:** 33 Romanian (ro-*) — all to be replaced
- **Institution IDs:** Changing from `ro-{slug}` to `md-{slug}` throughout
- **Font:** Replacing Public Sans (local) with Onest (Google Fonts)
- **Domain:** identitate.md (Vercel hosted)
- **Language:** Romanian only
- **Data Entry:** Owner adds institution JSON + SVG files manually; platform just needs correct branding and validation

---

## Risks & Constraints

| Risk | Mitigation | Owner |
|------|-----------|-------|
| Font loading performance | Preload Onest via preconnect; test Lighthouse | Claude |
| ID prefix enforcement | Build validation catches `ro-` prefix; build fails if detected | Claude |
| Content accuracy for Moldova | Owner reviews all page rewrites; ensure government terminology correct | User |
| Missing institutions | Owner gradually adds institution files; platform ready for this | User |

---

## Accumulated Context

### Phase 1 Notes
- BRAND-01: Check astro.config.mjs, vercel.json, meta tags in base layout
- BRAND-02: Homepage, detail pages, error pages — all must reference Moldova
- BRAND-03: Search codebase for `@identitate-ro` references (package.json, imports, CDN config)
- BRAND-04: CDN version injection (check how CDN_VERSION is loaded from package.json)
- TYPO-01: Remove Public Sans from public/ directory; update font loading
- TYPO-02: Update tailwind.config.js font stack
- TYPO-03: Add preconnect/preload link tags for Google Fonts

### Phase 2 Notes
- DATA-01: grep for `ro-` in validation scripts, type guards, generate-index.js
- DATA-02: Find and remove src/data/institutions/* files (Romania data)
- DATA-03: Ensure logo directory public/logos/md-* follows pattern
- DATA-04: generate-index.js rebuilds institutions-index.json
- DX-02: Update README section on institution format and ID rules

### Phase 3 Notes
- CONT-01: Homepage hero.astro — update value prop and tagline
- CONT-02: src/pages/despre.astro — rewrite about section
- CONT-03: src/pages/utilizare.astro — update usage guidelines
- CONT-04: src/pages/solicita.astro — update submission process
- CONT-05: src/pages/legal.astro, privacy.astro — Moldova compliance
- CONT-06: src/lib/labels.ts — update institution category taxonomy
- CONT-07: Footer component — update links and social references
- DX-01: README setup instructions and contribution guidelines

---

## Performance Metrics

- **Lighthouse Score Target:** 90+ (Core Web Vitals)
- **Font Load Time Target:** <100ms (preload optimization)
- **Build Validation:** 0 failures (all institutions must match md-* pattern)
- **Requirement Coverage:** 17/17 (100%)

---

## Blockers

None currently. Roadmap complete; ready for planning.

---

*State initialized: 2026-03-04*
