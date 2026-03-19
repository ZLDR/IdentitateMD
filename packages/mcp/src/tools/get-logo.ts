import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { readFileSync, existsSync } from "fs";
import { getById, resolveLogoPath } from "../data.js";
import type { LogoAssetGroup, AssetUrls } from "../types.js";

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
  server.tool(
    "get_logo",
    "Get a logo URL (and optionally the SVG content) for a specific institution, layout, and color variant.",
    {
      id: z.string().describe("Institution ID, e.g. 'md-age'"),
      layout: z
        .enum(["main", "horizontal", "vertical", "symbol"])
        .default("main")
        .describe("Logo layout (default: main)"),
      variant: z
        .enum(["color", "white", "black", "monochrome", "dark_mode"])
        .default("color")
        .describe("Color variant (default: color)"),
      fetch_svg: z
        .boolean()
        .default(false)
        .describe(
          "If true, include the raw SVG content in the response (read from bundled package — no network request)"
        ),
    },
    ({ id, layout, variant, fetch_svg }) => {
      const inst = getById(id);

      if (!inst) {
        return {
          content: [{ type: "text", text: JSON.stringify({ error: `Institution '${id}' not found.` }) }],
          isError: true,
        };
      }

      const group = inst.assets[layout] as LogoAssetGroup | undefined;
      if (!group) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                error: `Layout '${layout}' not available for '${id}'. Available layouts: ${Object.keys(inst.assets).join(", ")}`,
              }),
            },
          ],
          isError: true,
        };
      }

      const localPath = assetToLocal(group[variant as keyof LogoAssetGroup] as AssetUrls | undefined);
      if (!localPath) {
        const available = (["color", "white", "black", "monochrome", "dark_mode"] as const).filter(
          (v) => group[v] != null
        );
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                error: `Variant '${variant}' not available for '${id}' '${layout}'. Available variants: ${available.join(", ")}`,
              }),
            },
          ],
          isError: true,
        };
      }

      const url = toCdnUrl(localPath);

      let svg: string | undefined;
      if (fetch_svg) {
        const fsPath = resolveLogoPath(localPath);
        if (existsSync(fsPath)) {
          svg = readFileSync(fsPath, "utf-8");
        }
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                url,
                layout: group.type,
                variant,
                institution: inst.name,
                institutionId: inst.id,
                ...(svg !== undefined ? { svg } : {}),
              },
              null,
              2
            ),
          },
        ],
      };
    }
  );
}
