import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getById } from "../data.js";

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
  server.tool(
    "get_institution",
    "Get full brand data for a Moldovan government institution by its ID (e.g. 'md-age', 'md-mj').",
    {
      id: z.string().describe("Institution ID, e.g. 'md-age' or 'md-mj'"),
    },
    ({ id }) => {
      const inst = getById(id);

      if (!inst) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                { error: `Institution '${id}' not found.` },
                null,
                2
              ),
            },
          ],
          isError: true,
        };
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

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ ...inst, logoUrls }, null, 2),
          },
        ],
      };
    }
  );
}
