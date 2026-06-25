import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { runTerraform, formatResult } from "../terraform.js";

export function registerFmtTool(server: McpServer) {
  server.tool(
    "terraform_fmt",
    "Reformat Terraform configuration files to canonical style (consistent indentation and alignment).",
    {
      directory: z.string().describe("Working directory containing Terraform files"),
      check: z.boolean().optional().describe("Check if files are formatted (don't modify, just report)"),
      recursive: z.boolean().optional().describe("Process files in subdirectories"),
    },
    async ({ directory, check, recursive }) => {
      const args = ["fmt", "-no-color"];
      if (check) args.push("-check");
      if (recursive) args.push("-recursive");
      const result = await runTerraform(args, { cwd: directory });
      return {
        content: [{ type: "text", text: formatResult(result) }],
        isError: result.exitCode !== 0,
      };
    }
  );
}
