import { z } from "zod";
import { runTerraform, formatResult } from "../terraform.js";
export function registerImportTool(server) {
    server.tool("terraform_import", "Import an existing infrastructure resource into Terraform state. Maps a real-world resource to a Terraform resource address.", {
        directory: z.string().describe("Working directory containing Terraform files"),
        resource_address: z.string().describe("Terraform resource address (e.g., aws_instance.web)"),
        resource_id: z.string().describe("ID of the existing resource to import (e.g., i-1234567890abcdef0)"),
    }, async ({ directory, resource_address, resource_id }) => {
        const result = await runTerraform(["import", "-no-color", resource_address, resource_id], { cwd: directory });
        return {
            content: [{ type: "text", text: formatResult(result) }],
            isError: result.exitCode !== 0,
        };
    });
}
//# sourceMappingURL=import.js.map