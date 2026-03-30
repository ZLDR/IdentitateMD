# @identitate-md/mcp

> MCP server for IdentitateMD — query Moldovan government institution logos and brand colors from AI coding assistants

[![npm version](https://img.shields.io/npm/v/@identitate-md/mcp.svg)](https://www.npmjs.com/package/@identitate-md/mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

Use Moldovan government brand assets directly from Claude, Cursor, Windsurf, and any other MCP-compatible AI assistant.

## Setup

### Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "identitate-md": {
      "command": "npx",
      "args": ["-y", "@identitate-md/mcp"]
    }
  }
}
```

### Claude Code (CLI)

```bash
claude mcp add identitate-md -- npx -y @identitate-md/mcp
```

### Cursor / Windsurf

Add to your MCP settings:

```json
{
  "mcpServers": {
    "identitate-md": {
      "command": "npx",
      "args": ["-y", "@identitate-md/mcp"]
    }
  }
}
```

## Tools

### `search_institutions`

Search institutions by name, keyword, or category.

| Parameter | Type | Description |
|-----------|------|-------------|
| `query` | string (optional) | Name, keyword, or partial ID |
| `category` | string (optional) | Filter by category ID (see below) |
| `limit` | number (default: 10) | Max results (1–50) |

**Category IDs:** `guvern`, `minister`, `directie`, `agentie`, `primarie`, `institutie-cultura`, `consilii`, `servicii`, `parlament`, `universitate`, `altele`

---

### `get_institution`

Get full brand data for an institution by ID.

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Institution ID, e.g. `md-guvern` |

Returns name, description, colors, logo URLs, typography, contact info, and social media.

---

### `get_logo`

Get a logo URL (and optionally SVG content) for a specific institution, layout, and variant.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `id` | string | — | Institution ID |
| `layout` | `main` \| `horizontal` \| `vertical` \| `symbol` | `main` | Logo layout |
| `variant` | `color` \| `white` \| `black` \| `monochrome` \| `dark_mode` | `color` | Color variant |
| `fetch_svg` | boolean | `false` | Include raw SVG content in response |

---

### `get_brand_colors`

Get brand colors for an institution, formatted as hex, RGB, or CSS custom properties.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `id` | string | — | Institution ID |
| `format` | `hex` \| `rgb` \| `css` | `hex` | Output format |
| `usage` | `primary` \| `secondary` \| `accent` \| `neutral` | — | Filter by color role |

---

### `list_categories`

List all institution categories with their labels and institution counts. No parameters.

## Example Prompts

```
What are the brand colors of the Ministerul Justiției?

Get me the logo URL for Guvernul Republicii Moldova — horizontal, color variant.

Search for all institutions in the "minister" category.

Show me the SVG content of the Parlamentul Republicii Moldova symbol logo.
```

## Institutions

30 Moldovan government institutions are available, including:

- `md-guvern` — Guvernul Republicii Moldova
- `md-parlament` — Parlamentul Republicii Moldova
- `md-bnm` — Banca Națională a Moldovei
- `md-mia` — MIA Plăți Instant
- `md-mj` — Ministerul Justiției
- `md-mec` — Ministerul Educației și Cercetării
- `md-mf` — Ministerul Finanțelor
- `md-ms` — Ministerul Sănătății
- `md-mae` — Ministerul Afacerilor Externe
- `md-age` — Agenția de Guvernare Electronică
- `md-bns` — Biroul Național de Statistică
- `md-primaria-chisinau` — Primăria Municipiului Chișinău
- `md-stema` — Stema Republicii Moldova
- `md-usm` — Universitatea de Stat din Moldova
- `md-ulim` — Universitatea de Limbi Internaționale din Moldova
- and more...

Full list: [identitate.md](https://identitate.md)

## Links

- **Website**: [identitate.md](https://identitate.md)
- **Logos package**: [@identitate-md/logos](https://www.npmjs.com/package/@identitate-md/logos)
- **GitHub**: [github.com/ZLDR/IdentitateMD](https://github.com/ZLDR/IdentitateMD)

## License

MIT
