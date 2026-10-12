# @identitate-md/mcp

> MCP server for IdentitateMD — query Moldovan government institution logos and brand colors from AI coding assistants

[![npm version](https://img.shields.io/npm/v/@identitate-md/mcp.svg)](https://www.npmjs.com/package/@identitate-md/mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

The MCP server metadata for the [official MCP Registry](https://registry.modelcontextprotocol.io/) is in [`server.json`](./server.json).

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

Every tool is read-only. MCP clients receive both structured JSON and a text
fallback. The structured payload uses this envelope:

```json
{
  "result": {},
  "catalog": {
    "schemaVersion": "3.0.0",
    "generatedAt": "2026-10-10T00:00:00.000Z"
  }
}
```

Use `catalog.generatedAt` to tell how current the bundled catalog is. Errors
include an error at `result.error` and, where possible, valid alternatives.

### `search_institutions`

Search institutions by name, keyword, or category.

| Parameter | Type | Description |
|-----------|------|-------------|
| `query` | string (optional) | Name, keyword, or partial ID |
| `category` | string (optional) | Filter by category ID (see below) |
| `limit` | number (default: 10) | Max results (1–50) |

Use `list_categories` for the current category IDs and labels. Search results
include a match reason, relevance rank, catalog quality, last-updated date, and
the canonical logo URL when one is available.

---

### `get_institution`

Get full brand data for an institution by ID.

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Institution ID, e.g. `md-guvern` |

Returns the complete catalog record, resolved logo URLs, and the public JSON
source URL.

---

### `get_logo`

Get a logo URL (and optionally SVG content) for a specific institution, layout,
and variant. If the requested layout or variant is missing, the response lists
available options and suggests a usable fallback when one exists.

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

## Institution data

The catalog is updated independently of this package. Query
`list_categories` or `search_institutions` for current records, or fetch the
[machine-readable JSON index](https://identitate.md/api/institutions.json).
Each institution also has a focused JSON endpoint at
`https://identitate.md/api/institutions/{id}.json`.

## Links

- **Website**: [identitate.md](https://identitate.md)
- **Agent guide**: [identitate.md/llms.txt](https://identitate.md/llms.txt)
- **MCP manifest**: [identitate.md/api/manifest.json](https://identitate.md/api/manifest.json)
- **Logos package**: [@identitate-md/logos](https://www.npmjs.com/package/@identitate-md/logos)
- **GitHub**: [github.com/ZLDR/IdentitateMD](https://github.com/ZLDR/IdentitateMD)

## License

MIT
