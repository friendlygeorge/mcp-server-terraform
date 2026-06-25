import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { runTerraform, formatResult } from "../terraform.js";

export function registerApplyTool(server: McpServer) {
  server.tool(
    "terraform_apply",
    "Apply Terraform changes to create, update, or destroy infrastructure resources.",
    {
      directory: z.string().describe("Working directory containing Terraform files"),
      auto_approve: z.boolean().optional().describe("Skip interactive approval (default: false — requires confirmation)"),
      target: z.string().optional().describe("Target specific resource"),
      var_file: z.string().optional().describe("Path to variables file"),
      vars: z.record(z.string()).optional().describe("Variable values to pass"),
    },
    async ({ directory, auto_approve, target, var_file, vars }) => {
      const args = ["apply", "-no-color"];
      if (auto_approve) args.push("-auto-approve");
      if (target) args.push("-target", target);
      if (var_file) args.push("-var-file", var_file);
      if (vars) {
        for (const [key, value] of Object.entries(vars)) {
          args.push("-var", `${key}=${value}`);
        }
      }
      const result = await runTerraform(args, { cwd: directory });
      return {
        content: [{ type: "text", text: formatResult(result) }],
        isError: result.exitCode !== 0,
      };
    }
  );
}
