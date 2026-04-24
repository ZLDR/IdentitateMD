# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into identitate.md — a static Astro site serving official SVG logos for Moldovan public institutions. PostHog is initialized globally via `posthog-js` in `BaseLayout.astro` (present on every page), with `capture_pageview: true` for automatic page-level tracking and `person_profiles: 'identified_only'` for privacy-friendly defaults. Custom events are captured at all key user interaction points across the catalog, request form, and MCP feature pages.

## Events instrumented

| Event | Description | File |
|-------|-------------|------|
| `logo_svg_copied` | User copies an institution's SVG logo code to clipboard from the catalog grid. Includes `institution_slug` and `logo_path` properties. | `website/src/pages/index.astro` |
| `catalog_searched` | User performs a debounced search in the institution catalog (fires 600ms after the user stops typing). Includes `query` property. | `website/src/pages/index.astro` |
| `category_filtered` | User filters the catalog by institution category (sidebar or mobile chip). Includes `category` (ID) and `category_label` (display name). | `website/src/pages/index.astro` |
| `institution_request_submitted` | User successfully submits the "Solicită o Instituție" form. Includes `institution_name`. | `website/src/pages/solicita.astro` |
| `institution_request_failed` | The institution request form submission fails (network error or API rejection). Includes `institution_name`. | `website/src/pages/solicita.astro` |
| `mcp_demo_run` | User clicks "Rulează cu MCP" to trigger the interactive MCP demo animation. | `website/src/pages/mcp.astro` |
| `mcp_install_copied` | User copies the npm install command or the `.mcp.json` config snippet. Includes `type` (`npm_command` or `mcp_json`). | `website/src/pages/mcp.astro` |

## Files modified

- `website/src/layouts/BaseLayout.astro` — PostHog init script added
- `website/src/pages/index.astro` — `logo_svg_copied`, `catalog_searched`, `category_filtered` events
- `website/src/pages/solicita.astro` — `institution_request_submitted`, `institution_request_failed` events
- `website/src/pages/mcp.astro` — `mcp_demo_run`, `mcp_install_copied` events
- `website/.env` — `PUBLIC_POSTHOG_KEY` and `PUBLIC_POSTHOG_HOST` added

## Installation required

Since the sandbox restricts npm registry access, install `posthog-js` manually before building:

```bash
cd website
pnpm add posthog-js
```

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- **Dashboard — Analytics basics**: https://eu.posthog.com/project/32392/dashboard/642469
- **Logo SVG Copies Over Time** (line chart, daily): https://eu.posthog.com/project/32392/insights/c5krkI5r
- **Institution Request Funnel** (pageview → submission): https://eu.posthog.com/project/32392/insights/poLKaRPg
- **Top Categories Filtered** (bar chart, breakdown by label): https://eu.posthog.com/project/32392/insights/yvrixdsb
- **MCP Feature Adoption** (demo runs + install copies): https://eu.posthog.com/project/32392/insights/MqmyAe6G
- **Catalog Search Activity** (daily unique users): https://eu.posthog.com/project/32392/insights/BnZemuMV

### Agent skill

We've left an agent skill folder in your project at `.claude/skills/integration-javascript_node/`. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.
