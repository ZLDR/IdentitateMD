import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getById } from "../data.js";
import type { Color } from "../types.js";
import { readOnlyToolConfig, toolResponse } from "./tool-response.js";

function toRgbString(rgb: [number, number, number]): string {
  return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
}

function toCssVar(name: string): string {
  return "--color-" + name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

function formatColor(
  color: Color,
  format: "hex" | "rgb" | "css"
): Record<string, unknown> {
  const base: Record<string, unknown> = {
    name: color.name,
    usage: color.usage,
  };

  if (format === "hex") {
    base.hex = color.hex;
  } else if (format === "rgb") {
    base.rgb = color.rgb ? toRgbString(color.rgb) : null;
    base.hex = color.hex; // include hex too for reference
  } else {
    // css: emit as CSS custom property
    base.cssVar = `${toCssVar(color.name)}: ${color.hex}`;
    base.hex = color.hex;
  }

  return base;
}

export function registerGetBrandColors(server: McpServer): void {
  server.registerTool(
    "get_brand_colors",
    readOnlyToolConfig(
      "Get brand colors",
      "Get an institution's published color palette as HEX, RGB, or CSS custom properties. Results retain the source color name and usage role; an empty palette means no colors are currently documented.",
      {
        id: z.string().describe("Institution ID from search_institutions, e.g. 'md-age'"),
        format: z
          .enum(["hex", "rgb", "css"])
          .default("hex")
          .describe("Output format: hex (default), rgb, or css custom properties"),
        usage: z
          .enum(["primary", "secondary", "accent", "neutral"])
          .optional()
          .describe("Optional filter by usage role"),
      },
    ),
    ({ id, format, usage }) => {
      const inst = getById(id);

      if (!inst) {
        return toolResponse(
          { error: `Institution '${id}' not found.`, suggestion: "Search by institution name with search_institutions." },
          true,
        );
      }

      if (!inst.colors || inst.colors.length === 0) {
        return toolResponse({
          id: inst.id,
          name: inst.name,
          format,
          colors: [],
          note: "No brand colors are documented for this institution in the current catalog.",
        });
      }

      let colors = inst.colors;
      if (usage) {
        colors = colors.filter((c) => c.usage === usage);
      }

      const formatted = colors.map((c) => formatColor(c, format));

      const cssBlock =
        format === "css"
          ? `:root {\n${formatted.map((c) => `  ${c.cssVar}`).join(";\n")};\n}`
          : undefined;

      return toolResponse({
        id: inst.id,
        name: inst.name,
        format,
        usage: usage ?? null,
        colors: formatted,
        ...(cssBlock ? { cssBlock } : {}),
        source: "https://identitate.md/api/institutions.json",
      });
    }
  );
}
