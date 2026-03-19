import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getIndex, getById } from "../data.js";

export function registerResources(server: McpServer): void {
  // Full institutions index
  server.resource(
    "institutions-index",
    "identitate-md://institutions",
    {
      description: "Full IdentitateMD institutions index with all brand data",
      mimeType: "application/json",
    },
    async () => ({
      contents: [
        {
          uri: "identitate-md://institutions",
          text: JSON.stringify(getIndex(), null, 2),
          mimeType: "application/json",
        },
      ],
    })
  );

  // Per-institution resource
  server.resource(
    "institution",
    new ResourceTemplate("identitate-md://institutions/{id}", {
      list: () => ({
        resources: getIndex().institutions.map((i) => ({
          uri: `identitate-md://institutions/${i.id}`,
          name: i.name,
          description: `Brand data for ${i.name}`,
          mimeType: "application/json",
        })),
      }),
    }),
    {
      description: "Brand data for a single institution",
      mimeType: "application/json",
    },
    async (args) => {
      const id = (args as unknown as Record<string, string>).id;
      const inst = getById(id);

      if (!inst) {
        throw new Error(`Institution '${id}' not found`);
      }

      return {
        contents: [
          {
            uri: `identitate-md://institutions/${id}`,
            text: JSON.stringify(inst, null, 2),
            mimeType: "application/json",
          },
        ],
      };
    }
  );
}
