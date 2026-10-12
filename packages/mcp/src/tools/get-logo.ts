import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { readFileSync, existsSync } from "fs";
import { getById, resolveLogoPath } from "../data.js";
import type { LogoAssetGroup, AssetUrls } from "../types.js";
import { readOnlyToolConfig, toolResponse } from "./tool-response.js";

function assetToLocal(asset: AssetUrls | undefined): string | null {
  if (!asset) return null;
  if (typeof asset === "string") return asset;
  return asset.local;
}

/** Given a local path like "/logos/md-age/symbol/color.svg", return the CDN URL */
function toCdnUrl(localPath: string): string {
  return localPath.startsWith("http")
    ? localPath
    : `https://identitate.md${localPath}`;
}

export function registerGetLogo(server: McpServer): void {
  server.registerTool(
    "get_logo",
    readOnlyToolConfig(
      "Get institution logo",
      "Get a stable logo URL for an institution, layout, and color variant. If the requested option is unavailable, the response lists available layouts and variants and suggests the closest available variant.",
      {
        id: z.string().describe("Institution ID from search_institutions, e.g. 'md-age'"),
        layout: z
          .enum(["main", "horizontal", "vertical", "symbol"])
          .default("main")
          .describe("Logo layout (default: main, the institution's primary logo)"),
        variant: z
          .enum(["color", "white", "black", "monochrome", "dark_mode"])
          .default("color")
          .describe("Color variant (default: color)"),
        fetch_svg: z
          .boolean()
          .default(false)
          .describe("Include bundled raw SVG content when available; no network request is made"),
      },
    ),
    ({ id, layout, variant, fetch_svg }) => {
      const inst = getById(id);

      if (!inst) {
        return toolResponse(
          { error: `Institution '${id}' not found.`, suggestion: "Search by institution name with search_institutions." },
          true,
        );
      }

      const group = inst.assets[layout] as LogoAssetGroup | undefined;
      if (!group) {
        const availableLayouts = ["main", "horizontal", "vertical", "symbol"].filter(
          (key) => typeof inst.assets[key] === "object" && inst.assets[key] !== null,
        );
        return toolResponse(
          {
            error: `Layout '${layout}' not available for '${id}'.`,
            requestedLayout: layout,
            availableLayouts,
            suggestion: availableLayouts.includes("main") ? "Use layout 'main'." : "Choose one of the available layouts.",
          },
          true,
        );
      }

      const localPath = assetToLocal(group[variant as keyof LogoAssetGroup] as AssetUrls | undefined);
      if (!localPath) {
        const available = (["color", "white", "black", "monochrome", "dark_mode"] as const).filter(
          (v) => group[v] != null
        );
        const suggestedVariant = available.includes("color") ? "color" : available[0];
        return toolResponse(
          {
            error: `Variant '${variant}' not available for '${id}' '${layout}'.`,
            requestedVariant: variant,
            availableVariants: available,
            ...(suggestedVariant ? { suggestedVariant } : {}),
          },
          true,
        );
      }

      const url = toCdnUrl(localPath);

      let svg: string | undefined;
      if (fetch_svg) {
        const fsPath = resolveLogoPath(localPath);
        if (existsSync(fsPath)) {
          svg = readFileSync(fsPath, "utf-8");
        }
      }

      return toolResponse({
        url,
        layout: group.type,
        variant,
        institution: inst.name,
        institutionId: inst.id,
        availableLayouts: ["main", "horizontal", "vertical", "symbol"].filter(
          (key) => typeof inst.assets[key] === "object" && inst.assets[key] !== null,
        ),
        availableVariants: (["color", "white", "black", "monochrome", "dark_mode"] as const).filter(
          (availableVariant) => group[availableVariant] != null,
        ),
        ...(svg !== undefined ? { svg } : {}),
        source: "https://identitate.md/api/institutions.json",
      });
    }
  );
}
