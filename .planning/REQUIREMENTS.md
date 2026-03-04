# Requirements: IdentitateMD

**Defined:** 2026-03-04
**Core Value:** Any developer can find and use the official logo of any Moldovan public institution in seconds.

## v1 Requirements

### Branding & Identity

- [ ] **BRAND-01**: Site URL updated to identitate.md in all configs (astro.config.mjs, vercel.json, meta tags)
- [ ] **BRAND-02**: All page titles, descriptions, and OG tags reference Republic of Moldova (not Romania)
- [ ] **BRAND-03**: Package name updated from `@identitate-ro/logos` to `@identitate-md/logos` in all references
- [ ] **BRAND-04**: CDN version/package references updated to match new package name

### Typography

- [ ] **TYPO-01**: Public Sans font removed and replaced with Onest (Google Fonts)
- [ ] **TYPO-02**: Font preload/preconnect tags updated for Google Fonts (Onest)
- [ ] **TYPO-03**: Tailwind font config updated to use Onest as primary font

### Data & Schema

- [ ] **DATA-01**: Institution ID prefix changed from `ro-` to `md-` throughout codebase (validation scripts, type guards, generate-index.js)
- [ ] **DATA-02**: Existing Romanian institution JSON files removed
- [ ] **DATA-03**: Logo directory structure uses `md-{slug}` pattern (public/logos/md-*)
- [ ] **DATA-04**: institutions-index.json regenerated (empty or with initial MD institutions)

### Content & Pages

- [ ] **CONT-01**: Homepage hero text updated for Moldova context
- [ ] **CONT-02**: About page (despre.astro) rewritten for identitate.md
- [ ] **CONT-03**: Usage page (utilizare.astro) updated for Moldova
- [ ] **CONT-04**: Submission page (solicita.astro) updated for Moldova
- [ ] **CONT-05**: Legal and privacy pages updated for Moldova context
- [ ] **CONT-06**: Institution categories updated to reflect Moldovan government structure (labels.ts)
- [ ] **CONT-07**: Footer links and social references updated

### Developer Experience

- [ ] **DX-01**: README updated with Moldova-specific setup instructions
- [ ] **DX-02**: generate-index.js validates `md-` prefix (not `ro-`)

## v2 Requirements

### npm Package

- **PKG-01**: Publish `@identitate-md/logos` as npm package
- **PKG-02**: identity-loader.js adapted for Moldova institutions

### Features

- **FEAT-01**: Russian language support (bilingual site)

## Out of Scope

| Feature | Reason |
|---------|--------|
| npm package | Deferred to v2; focus on website first |
| Russian language | Romanian only for v1; adds complexity |
| Admin UI / CRUD | Existing empty stubs remain; owner adds data manually |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| BRAND-01 | Phase 1 | Pending |
| BRAND-02 | Phase 1 | Pending |
| BRAND-03 | Phase 1 | Pending |
| BRAND-04 | Phase 1 | Pending |
| TYPO-01 | Phase 1 | Pending |
| TYPO-02 | Phase 1 | Pending |
| TYPO-03 | Phase 1 | Pending |
| DATA-01 | Phase 2 | Pending |
| DATA-02 | Phase 2 | Pending |
| DATA-03 | Phase 2 | Pending |
| DATA-04 | Phase 2 | Pending |
| DX-02 | Phase 2 | Pending |
| CONT-01 | Phase 3 | Pending |
| CONT-02 | Phase 3 | Pending |
| CONT-03 | Phase 3 | Pending |
| CONT-04 | Phase 3 | Pending |
| CONT-05 | Phase 3 | Pending |
| CONT-06 | Phase 3 | Pending |
| CONT-07 | Phase 3 | Pending |
| DX-01 | Phase 3 | Pending |

**Coverage:**
- v1 requirements: 17 total
- Mapped to phases: 17
- Unmapped: 0 ✓

---

*Requirements defined: 2026-03-04*
*Last updated: 2026-03-04 after roadmap creation*
