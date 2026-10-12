import type { APIRoute } from "astro";
import institutionsIndex from "../data/institutions-index.json";
import { buildCatalogPathMap } from "../lib/catalog-paths.js";
import type { Institution } from "../types/institution";

const institutions = institutionsIndex.institutions as unknown as Institution[];
const catalogPaths = buildCatalogPathMap(institutions);

export const GET: APIRoute = () => {
  const lines = [
    "# identitate.md",
    "",
    "> Registrul open-source al identităților vizuale pentru instituțiile publice din Republica Moldova.",
    "> Open-source registry of visual identities for public institutions in the Republic of Moldova.",
    "",
    `Catalog: ${institutions.length} instituții · date generate ${institutionsIndex.generatedAt}`,
    "",
    "## Surse pentru agenți / Agent data sources",
    "",
    "- API index: https://identitate.md/api/institutions.json",
    "- Per-institution JSON: https://identitate.md/api/institutions/{id}.json (use an exact ID from the index)",
    "- Full text catalog: https://identitate.md/llms-full.txt",
    "- Discovery manifest: https://identitate.md/api/manifest.json",
    "- MCP setup and tools: https://identitate.md/mcp/",
    "",
    "## MCP server",
    "",
    "Install the official package with:",
    "",
    "```sh",
    "claude mcp add identitate-md -- npx -y @identitate-md/mcp",
    "```",
    "",
    "Tools: search_institutions, get_institution, get_logo, get_brand_colors, list_categories.",
    "Tool outputs include structured data and catalog version metadata. Search is diacritic-insensitive.",
    "",
    "## Recommended workflow for logo tasks",
    "",
    "1. Search by the institution's official name or acronym; use the returned exact ID rather than guessing a slug.",
    "2. Check the record's quality and available layouts/variants. Prefer verified records; identify community or draft data when using it.",
    "3. Call get_logo with the exact ID and requested layout/variant, then use the returned URL. Do not invent asset paths.",
    "4. For a project dependency, install with `npm install @identitate-md/logos` and import the exact file path documented in the package README. For a direct web embed, use the URL returned by get_logo.",
    "5. When provenance matters, include the institution's official website and the IdentitateMD record URL in your answer.",
    "",
    "Logos represent their respective institutions. Check the record's quality and usage notes before presenting an asset as officially verified.",
    "",
    "## Catalog",
    "",
  ];

  for (const category of institutionsIndex.categories) {
    const members = institutions.filter((institution) => institution.category === category.id);
    if (members.length === 0) continue;

    lines.push(`### ${category.label} (${members.length})`, "");
    for (const institution of members) {
      const slug = catalogPaths[institution.slug] ?? institution.slug;
      const label = institution.shortname
        ? `${institution.name} (${institution.shortname})`
        : institution.name;
      lines.push(`- ${label} — ID: \`${institution.id}\` — https://identitate.md/catalog/${slug}`);
    }
    lines.push("");
  }

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
};
