import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getCategories } from "../data.js";
import { readOnlyToolConfig, toolResponse } from "./tool-response.js";

export function registerListCategories(server: McpServer): void {
  server.registerTool(
    "list_categories",
    readOnlyToolConfig(
      "List institution categories",
      "List the current category IDs, Romanian labels, and institution counts. Use an ID as the category filter in search_institutions.",
      {},
    ),
    () => {
      return toolResponse(getCategories());
    }
  );
}
