import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { runTerraform, formatResult } from "../terraform.js";

export function registerOutputTool(server: McpServer) {
  server.tool(
    "terraform_output",
    "Show output values from the Terraform state. Outputs are defined in output blocks and often contain important resource attributes.",
    {
      directory: z.string().describe("Working directory containing Terraform files"),
      name: z.string().optional().describe("Show a specific output by name"),
      json: z.boolean().optional().describe("Output in JSON format"),
    },
    async ({ directory, name, json }) => {
      const args = ["output", "-no-color"];
      if (json) args.push("-json");
      if (name) args.push(name);
      const result = await runTerraform(args, { cwd: directory });
      return {
        content: [{ type: "text", text: formatResult(result) }],
        isError: result.exitCode !== 0,
      };
    }
  );
}
