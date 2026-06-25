import { z } from "zod";
import { runTerraform, formatResult } from "../terraform.js";
export function registerStateListTool(server) {
    server.tool("terraform_state_list", "List all resources tracked in the Terraform state file.", {
        directory: z.string().describe("Working directory containing Terraform files"),
        id_pattern: z.string().optional().describe("Filter resources by ID pattern (supports glob)"),
    }, async ({ directory, id_pattern }) => {
        const args = ["state", "list", "-no-color"];
        if (id_pattern)
            args.push(id_pattern);
        const result = await runTerraform(args, { cwd: directory });
        return {
            content: [{ type: "text", text: formatResult(result) }],
            isError: result.exitCode !== 0,
        };
    });
}
//# sourceMappingURL=state-list.js.map