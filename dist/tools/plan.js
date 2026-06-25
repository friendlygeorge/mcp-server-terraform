import { z } from "zod";
import { runTerraform, formatResult } from "../terraform.js";
export function registerPlanTool(server) {
    server.tool("terraform_plan", "Preview changes Terraform will make to infrastructure without applying them. Shows added, changed, and destroyed resources.", {
        directory: z.string().describe("Working directory containing Terraform files"),
        destroy: z.boolean().optional().describe("If true, show destroy plan instead of normal plan"),
        target: z.string().optional().describe("Target specific resource (e.g., aws_instance.web)"),
        var_file: z.string().optional().describe("Path to variables file"),
        vars: z.record(z.string()).optional().describe("Variable values to pass (e.g., region=us-east-1)"),
    }, async ({ directory, destroy, target, var_file, vars }) => {
        const args = ["plan", "-no-color"];
        if (destroy)
            args.push("-destroy");
        if (target)
            args.push("-target", target);
        if (var_file)
            args.push("-var-file", var_file);
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
    });
}
//# sourceMappingURL=plan.js.map