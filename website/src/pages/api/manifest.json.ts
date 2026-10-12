import type { APIRoute } from "astro";
import institutionsIndex from "../../data/institutions-index.json";

export const GET: APIRoute = () => {
  return new Response(
    JSON.stringify(
      {
        name: "identitate.md",
        description:
          "Open-source visual identity registry for public institutions in the Republic of Moldova.",
        schemaVersion: institutionsIndex.schemaVersion,
        generatedAt: institutionsIndex.generatedAt,
        institutionCount: institutionsIndex.total,
        discovery: {
          agentGuide: "https://identitate.md/llms.txt",
          fullTextCatalog: "https://identitate.md/llms-full.txt",
          jsonIndex: "https://identitate.md/api/institutions.json",
          institutionJsonTemplate:
            "https://identitate.md/api/institutions/{id}.json",
          mcp: "https://identitate.md/mcp/",
        },
        mcp: {
          package: "@identitate-md/mcp",
          install: "npx -y @identitate-md/mcp",
          tools: [
            "search_institutions",
            "get_institution",
            "get_logo",
            "get_brand_colors",
            "list_categories",
          ],
        },
        dataLicense: "MIT",
      },
      null,
      2,
    ),
    {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
        "Access-Control-Allow-Origin": "*",
      },
    },
  );
};
