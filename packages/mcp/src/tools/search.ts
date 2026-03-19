import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getAll } from "../data.js";
import type { Institution } from "../types.js";

/** Normalize diacritics: ș→s, ț→t, ă→a, î→i, â→a etc. */
function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

function score(inst: Institution, query: string): number {
  const q = normalize(query);
  const id = normalize(inst.id);
  const name = normalize(inst.name);
  const short = normalize(inst.shortname ?? "");
  const keywords = (inst.meta.keywords ?? []).map(normalize);

  if (id === q) return 100;
  if (short === q) return 80;
  if (id.includes(q)) return 70;
  if (short.includes(q)) return 65;
  if (name.includes(q)) return 50;
  if (keywords.some((k) => k.includes(q))) return 30;
  return 0;
}

export function registerSearch(server: McpServer): void {
  server.tool(
    "search_institutions",
    "Search Moldovan government institutions by name, keyword, or category. Returns ranked matches.",
    {
      query: z
        .string()
        .optional()
        .describe("Name, keyword, or partial ID to search for"),
      category: z
        .string()
        .optional()
        .describe(
          "Filter by category ID: guvern, minister, directie, agentie, primarie, institutie-cultura, consilii, servicii, parlament, altele"
        ),
      limit: z
        .number()
        .int()
        .min(1)
        .max(50)
        .default(10)
        .describe("Maximum number of results to return (default 10)"),
    },
    ({ query, category, limit }) => {
      let institutions = getAll();

      if (category) {
        institutions = institutions.filter((i) => i.category === category);
      }

      if (query) {
        const scored = institutions
          .map((i) => ({ inst: i, score: score(i, query) }))
          .filter((x) => x.score > 0)
          .sort((a, b) => b.score - a.score);

        institutions = scored.slice(0, limit).map((x) => x.inst);
      } else {
        institutions = institutions.slice(0, limit);
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              institutions.map((i) => ({
                id: i.id,
                name: i.name,
                shortname: i.shortname,
                category: i.category,
                description: i.description,
                mainLogoUrl: resolveMainLogoUrl(i),
              })),
              null,
              2
            ),
          },
        ],
      };
    }
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
  return `https://identitate.md${path}`;
}
