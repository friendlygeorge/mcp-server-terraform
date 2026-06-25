import { z } from "zod";
import { runTerraform, formatResult } from "../terraform.js";
export function registerValidateTool(server) {
    server.tool("terraform_validate", "Validate Terraform configuration files for syntax and internal consistency without contacting any remote services.", {
        directory: z.string().describe("Working directory containing Terraform files"),
    }, async ({ directory }) => {
        const result = await runTerraform(["validate", "-no-color"], { cwd: directory });
        return {
            content: [{ type: "text", text: formatResult(result) }],
            isError: result.exitCode !== 0,
        };
    });
}
//# sourceMappingURL=validate.js.map