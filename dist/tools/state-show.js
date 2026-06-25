import { z } from "zod";
import { runTerraform, formatResult } from "../terraform.js";
export function registerStateShowTool(server) {
    server.tool("terraform_state_show", "Show detailed attributes of a specific resource in the Terraform state.", {
        directory: z.string().describe("Working directory containing Terraform files"),
        resource_id: z.string().describe("Resource ID in state (e.g., aws_instance.web)"),
    }, async ({ directory, resource_id }) => {
        const result = await runTerraform(["state", "show", "-no-color", resource_id], { cwd: directory });
        return {
            content: [{ type: "text", text: formatResult(result) }],
            isError: result.exitCode !== 0,
        };
    });
}
//# sourceMappingURL=state-show.js.map