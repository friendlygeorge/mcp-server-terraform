#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerPlanTool } from "./tools/plan.js";
import { registerApplyTool } from "./tools/apply.js";
import { registerDestroyTool } from "./tools/destroy.js";
import { registerInitTool } from "./tools/init.js";
import { registerValidateTool } from "./tools/validate.js";
import { registerStateListTool } from "./tools/state-list.js";
import { registerStateShowTool } from "./tools/state-show.js";
import { registerFmtTool } from "./tools/fmt.js";
import { registerOutputTool } from "./tools/output.js";
import { registerImportTool } from "./tools/import.js";
const server = new McpServer({
    name: "terraform-mcp-server",
    version: "0.1.0",
});
registerPlanTool(server);
registerApplyTool(server);
registerDestroyTool(server);
registerInitTool(server);
registerValidateTool(server);
registerStateListTool(server);
registerStateShowTool(server);
registerFmtTool(server);
registerOutputTool(server);
registerImportTool(server);
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Terraform MCP Server running on stdio");
}
main().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
});
//# sourceMappingURL=index.js.map