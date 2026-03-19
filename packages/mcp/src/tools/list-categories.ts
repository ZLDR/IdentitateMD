import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getCategories } from "../data.js";

export function registerListCategories(server: McpServer): void {
  server.tool(
    "list_categories",
    "List all institution categories with their labels and institution counts.",
    {},
    () => {
      const categories = getCategories();
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(categories, null, 2),
          },
        ],
      };
    }
  );
}
