import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getById } from "../data.js";
import { readOnlyToolConfig, toolResponse } from "./tool-response.js";

/** Resolve an AssetUrls value to a local path string or null */
function assetToLocal(
  asset: string | { cdn_primary?: string; cdn_fallback?: string; local: string } | undefined
): string | null {
  if (!asset) return null;
  if (typeof asset === "string") return asset;
  return asset.local;
}

function toAbsoluteUrl(path: string | null): string | null {
  if (!path) return null;
  return path.startsWith("http") ? path : `https://identitate.md${path}`;
}

export function registerGetInstitution(server: McpServer): void {
  server.registerTool(
    "get_institution",
    readOnlyToolConfig(
      "Get institution details",
      "Get the complete structured brand record for one institution. Use an exact ID returned by search_institutions, such as md-age or md-mj.",
      {
        id: z.string().describe("Institution ID, e.g. 'md-age' or 'md-mj'"),
      },
    ),
    ({ id }) => {
      const inst = getById(id);

      if (!inst) {
        return toolResponse(
          { error: `Institution '${id}' not found.`, suggestion: "Search by institution name with search_institutions." },
          true,
        );
      }

      // Build enriched response with absolute logo URLs
      const logoUrls: Record<string, Record<string, string | null>> = {};
      for (const [groupKey, group] of Object.entries(inst.assets)) {
        if (typeof group !== "object" || !group || typeof group === "string") continue;
        const g = group as unknown as Record<string, unknown>;
        const variants: Record<string, string | null> = {};
        for (const variant of ["color", "white", "black", "monochrome", "dark_mode"]) {
          const v = g[variant];
          if (v !== undefined) {
            variants[variant] = toAbsoluteUrl(assetToLocal(v as string | { local: string }));
          }
        }
        if (Object.keys(variants).length > 0) {
          logoUrls[groupKey] = variants;
        }
      }

      return toolResponse({
        ...inst,
        logoUrls,
        source: "https://identitate.md/api/institutions.json",
      });
    }
  );
}
