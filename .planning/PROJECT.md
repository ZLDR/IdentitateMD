# IdentitateMD

## What This Is

A public open-source platform for easy access to logos of Moldovan public institutions, hosted at identitate.md. Adapted from the Romanian identitate.eu platform, it gives developers and designers a single place to find official SVG logos for government bodies in the Republic of Moldova.

## Core Value

Any developer can find and use the official logo of any Moldovan public institution in seconds.

## Requirements

### Validated

- ✓ Fuzzy search across institution names and keywords (Fuse.js, weighted keys) — existing
- ✓ Filter institutions by category — existing
- ✓ Institution detail pages with all logo variants, colors, and typography — existing
- ✓ CDN logo delivery via jsDelivr with unpkg fallback — existing
- ✓ SEO metadata + JSON-LD structured data per institution — existing
- ✓ Static pages: about, legal, privacy, usage guidelines, submission form — existing
- ✓ Build-time data generation from institution JSON files — existing
- ✓ Three-pane catalog view — existing

### Active

- [ ] Rebrand to identitate.md (domain, site URL, meta tags, OG images, package names)
- [ ] Change institution ID prefix from `ro-` to `md-`
- [ ] Replace Public Sans font with Onest (Google Fonts)
- [ ] Adapt all page content and static pages for Republic of Moldova context
- [ ] Update institution categories to reflect Moldovan government structure
- [ ] Update build validation (schema v3.0 prefix check: `ro-` → `md-`)
- [ ] Update CDN package references (`@identitate-md/logos` → `@identitate-md/logos`)
- [ ] Update vercel.json with new domain and build config
- [ ] Clean up/remove Romania-specific institution data; prepare for Moldova institutions

### Out of Scope

- npm package (@identitate-md/logos) — deferred, focus on website first
- Russian language support — Romanian only for v1
- Admin UI / CRUD interface — existing stubs remain empty

## Context

Forked from identitate.eu (identitate-ro), a mature Astro 5 + Tailwind + Fuse.js static site. The codebase is well-structured with a clear data layer (JSON institution files), library layer (helpers, cdn-helpers, labels), and page layer (Astro routes). All institution logos will be added manually by the project owner — the platform just needs to be correctly branded and wired for Moldova.

Current codebase has 33 Romanian institutions that need to be replaced. All IDs follow the `ro-{slug}` pattern which must be updated to `md-{slug}`. Font is currently Public Sans loaded from a local public/ directory; Onest should be loaded from Google Fonts instead.

## Constraints

- **Stack**: Astro 5 + Tailwind CSS + Fuse.js — keep existing stack, no framework changes
- **Hosting**: Vercel (keep existing deployment setup)
- **Language**: Romanian only — no i18n complexity
- **Logos**: Owner adds institution JSON + SVG files manually — platform must make this easy

## Key Decisions

| Decision                    | Rationale                                           | Outcome   |
| --------------------------- | --------------------------------------------------- | --------- |
| Keep Astro (no rewrite)     | Codebase is well-structured; adaptation not rewrite | — Pending |
| Onest font via Google Fonts | Owner preference; modern, readable typeface         | — Pending |
| Romanian only               | Moldova's official language; simplifies v1          | — Pending |
| No npm package in v1        | Focus on website; can add later                     | — Pending |

---

_Last updated: 2026-03-04 after initialization_
