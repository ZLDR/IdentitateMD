import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getAll, getCategories } from "../data.js";
import type { Institution } from "../types.js";
import { readOnlyToolConfig, toolResponse } from "./tool-response.js";

/** Normalize diacritics so Romanian names work with or without accents. */
function normalize(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

function score(inst: Institution, query: string): { score: number; match: string } {
  const q = normalize(query);
  const id = normalize(inst.id);
  const name = normalize(inst.name);
  const short = normalize(inst.shortname ?? "");
  const keywords = (inst.meta.keywords ?? []).map(normalize);

  if (id === q) return { score: 100, match: "exact_id" };
  if (short === q) return { score: 80, match: "exact_shortname" };
  if (id.includes(q)) return { score: 70, match: "id" };
  if (short.includes(q)) return { score: 65, match: "shortname" };
  if (name.includes(q)) return { score: 50, match: "name" };
  if (keywords.some((keyword) => keyword.includes(q))) {
    return { score: 30, match: "keyword" };
  }
  return { score: 0, match: "none" };
}

export function registerSearch(server: McpServer): void {
  server.registerTool(
    "search_institutions",
    readOnlyToolConfig(
      "Search institutions",
      "Find Moldovan public institutions by name, acronym, ID, keyword, or category. Romanian diacritics are optional. Returns ranked results with the reason each result matched. Use get_institution or get_logo with a returned ID for details.",
      {
        query: z
          .string()
          .optional()
          .describe("Name, acronym, keyword, or partial ID; diacritics are optional"),
        category: z
          .string()
          .optional()
          .describe("Category ID from list_categories; may be combined with query"),
        limit: z
          .number()
          .int()
          .min(1)
          .max(50)
          .default(10)
          .describe("Maximum result count (1–50, default 10)"),
      },
    ),
    ({ query, category, limit }) => {
      const categories = getCategories();
      if (category && !categories.some((entry) => entry.id === category)) {
        return toolResponse(
          {
            error: `Unknown category '${category}'.`,
            availableCategories: categories,
          },
          true,
        );
      }

      let institutions = getAll();
      if (category) {
        institutions = institutions.filter((institution) => institution.category === category);
      }

      const queryValue = query?.trim() ?? "";
      const ranked = queryValue
        ? institutions
            .map((institution) => ({ institution, ...score(institution, queryValue) }))
            .filter((match) => match.score > 0)
            .sort((a, b) => b.score - a.score || a.institution.name.localeCompare(b.institution.name, "ro"))
        : institutions.map((institution) => ({ institution, score: null, match: "browse" }));

      return toolResponse({
        query: queryValue || null,
        category: category ?? null,
        total: ranked.length,
        results: ranked.slice(0, limit).map(({ institution, score: relevance, match }) => ({
          id: institution.id,
          name: institution.name,
          shortname: institution.shortname,
          category: institution.category,
          description: institution.description,
          quality: institution.meta.quality ?? "unknown",
          lastUpdated: institution.meta.last_updated,
          match,
          relevance,
          catalogUrl: `https://identitate.md/catalog/${institution.slug}`,
          mainLogoUrl: resolveMainLogoUrl(institution),
        })),
      });
    },
  );
}

function resolveMainLogoUrl(inst: Institution): string | null {
  const main = inst.assets.main;
  const path =
    typeof main.color === "string"
      ? main.color
      : typeof main.color === "object"
        ? main.color.local
        : null;
  if (!path) return null;
  return path.startsWith("http") ? path : `https://identitate.md${path}`;
}
