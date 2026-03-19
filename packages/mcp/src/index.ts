#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { init } from "./data.js";
import { registerSearch } from "./tools/search.js";
import { registerGetInstitution } from "./tools/get-institution.js";
import { registerGetLogo } from "./tools/get-logo.js";
import { registerGetBrandColors } from "./tools/get-brand-colors.js";
import { registerListCategories } from "./tools/list-categories.js";
import { registerResources } from "./resources/index.js";

// Load data into memory once at startup
init();

const server = new McpServer({
  name: "identitate-md",
  version: "1.0.0",
});

// Register tools
registerSearch(server);
registerGetInstitution(server);
registerGetLogo(server);
registerGetBrandColors(server);
registerListCategories(server);

// Register resources
registerResources(server);

// Start stdio transport
const transport = new StdioServerTransport();
await server.connect(transport);
