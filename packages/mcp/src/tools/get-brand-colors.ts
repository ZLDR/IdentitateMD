import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getById } from "../data.js";
import type { Color } from "../types.js";

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
  server.tool(
    "get_brand_colors",
    "Get brand colors for a Moldovan government institution. Returns palette optionally formatted as hex, rgb, or CSS custom properties.",
    {
      id: z.string().describe("Institution ID, e.g. 'md-age'"),
      format: z
        .enum(["hex", "rgb", "css"])
        .default("hex")
        .describe("Output format: hex (default), rgb, or css (CSS custom properties)"),
      usage: z
        .enum(["primary", "secondary", "accent", "neutral"])
        .optional()
        .describe("Filter colors by usage type"),
    },
    ({ id, format, usage }) => {
      const inst = getById(id);

      if (!inst) {
        return {
          content: [{ type: "text", text: JSON.stringify({ error: `Institution '${id}' not found.` }) }],
          isError: true,
        };
      }

      if (!inst.colors || inst.colors.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                id: inst.id,
                name: inst.name,
                colors: [],
                note: "No brand colors defined for this institution.",
              }),
            },
          ],
        };
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

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                id: inst.id,
                name: inst.name,
                colors: formatted,
                ...(cssBlock ? { cssBlock } : {}),
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
