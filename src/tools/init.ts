import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { runTerraform, formatResult } from "../terraform.js";

export function registerInitTool(server: McpServer) {
  server.tool(
    "terraform_init",
    "Initialize a Terraform working directory. Downloads providers, modules, and configures the backend.",
    {
      directory: z.string().describe("Working directory containing Terraform files"),
      upgrade: z.boolean().optional().describe("Upgrade providers and modules to latest compatible versions"),
      reconfigure: z.boolean().optional().describe("Reconfigure the backend (discard previous state)"),
      backend_config: z.record(z.string()).optional().describe("Backend configuration values"),
    },
    async ({ directory, upgrade, reconfigure, backend_config }) => {
      const args = ["init", "-no-color"];
      if (upgrade) args.push("-upgrade");
      if (reconfigure) args.push("-reconfigure");
      if (backend_config) {
        for (const [key, value] of Object.entries(backend_config)) {
          args.push("-backend-config", `${key}=${value}`);
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
