import { describe, it, expect, vi, beforeEach } from "vitest";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { runTerraform, formatResult } from "../src/terraform.js";

vi.mock("../src/terraform.js", () => ({
  runTerraform: vi.fn().mockResolvedValue({
    stdout: "Terraform has been successfully initialized.",
    stderr: "",
    exitCode: 0,
  }),
  formatResult: vi.fn().mockImplementation((r: any) => r.stdout || r.stderr || "No output."),
}));

import { registerApplyTool } from "../src/tools/apply.js";
import { registerInitTool } from "../src/tools/init.js";
import { registerValidateTool } from "../src/tools/validate.js";
import { registerStateListTool } from "../src/tools/state-list.js";
import { registerStateShowTool } from "../src/tools/state-show.js";
import { registerFmtTool } from "../src/tools/fmt.js";
import { registerOutputTool } from "../src/tools/output.js";
import { registerImportTool } from "../src/tools/import.js";
import { registerDestroyTool } from "../src/tools/destroy.js";

function createMockServer(): McpServer {
  return new McpServer({ name: "test-terraform", version: "0.0.1" });
}

function getHandler(server: McpServer, name: string) {
  return (server as any)._registeredTools[name].handler;
}

describe("Tool Handlers (integration-style)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("terraform_apply", () => {
    it("calls terraform apply with basic args", async () => {
      const server = createMockServer();
      registerApplyTool(server);
      const handler = getHandler(server, "terraform_apply");

      const result = await handler({ directory: "/tmp/tf" });

      expect(vi.mocked(runTerraform)).toHaveBeenCalledWith(
        ["apply", "-no-color"],
        { cwd: "/tmp/tf" }
      );
      expect(result.content[0].text).toBe("Terraform has been successfully initialized.");
      expect(result.isError).toBe(false);
    });

    it("adds -auto-approve when auto_approve is true", async () => {
      const server = createMockServer();
      registerApplyTool(server);
      const handler = getHandler(server, "terraform_apply");

      await handler({ directory: "/tmp/tf", auto_approve: true });

      expect(vi.mocked(runTerraform)).toHaveBeenCalledWith(
        ["apply", "-no-color", "-auto-approve"],
        { cwd: "/tmp/tf" }
      );
    });

    it("adds -target when target is provided", async () => {
      const server = createMockServer();
      registerApplyTool(server);
      const handler = getHandler(server, "terraform_apply");

      await handler({ directory: "/tmp/tf", target: "aws_instance.web" });

      expect(vi.mocked(runTerraform)).toHaveBeenCalledWith(
        ["apply", "-no-color", "-target", "aws_instance.web"],
        { cwd: "/tmp/tf" }
      );
    });

    it("adds -var-file when var_file is provided", async () => {
      const server = createMockServer();
      registerApplyTool(server);
      const handler = getHandler(server, "terraform_apply");

      await handler({ directory: "/tmp/tf", var_file: "prod.tfvars" });

      expect(vi.mocked(runTerraform)).toHaveBeenCalledWith(
        ["apply", "-no-color", "-var-file", "prod.tfvars"],
        { cwd: "/tmp/tf" }
      );
    });

    it("adds -var flags for each entry in vars", async () => {
      const server = createMockServer();
      registerApplyTool(server);
      const handler = getHandler(server, "terraform_apply");

      await handler({ directory: "/tmp/tf", vars: { region: "us-east-1", env: "prod" } });

      const args = vi.mocked(runTerraform).mock.calls[0][0];
      expect(args).toContain("-var");
      expect(args).toContain("region=us-east-1");
      expect(args).toContain("env=prod");
    });

    it("combines all options together", async () => {
      const server = createMockServer();
      registerApplyTool(server);
      const handler = getHandler(server, "terraform_apply");

      await handler({
        directory: "/tmp/tf",
        auto_approve: true,
        target: "aws_s3_bucket.data",
        var_file: "vars.tfvars",
        vars: { prefix: "test" },
      });

      const args = vi.mocked(runTerraform).mock.calls[0][0];
      expect(args).toEqual([
        "apply", "-no-color", "-auto-approve",
        "-target", "aws_s3_bucket.data",
        "-var-file", "vars.tfvars",
        "-var", "prefix=test",
      ]);
    });

    it("returns isError true on non-zero exit", async () => {
      vi.mocked(runTerraform).mockResolvedValueOnce({
        stdout: "", stderr: "Error: apply failed", exitCode: 1,
      });
      const server = createMockServer();
      registerApplyTool(server);
      const handler = getHandler(server, "terraform_apply");

      const result = await handler({ directory: "/tmp/tf" });

      expect(result.isError).toBe(true);
    });
  });

  describe("terraform_init", () => {
    it("calls terraform init with basic args", async () => {
      const server = createMockServer();
      registerInitTool(server);
      const handler = getHandler(server, "terraform_init");

      await handler({ directory: "/tmp/tf" });

      expect(vi.mocked(runTerraform)).toHaveBeenCalledWith(
        ["init", "-no-color"],
        { cwd: "/tmp/tf" }
      );
    });

    it("adds -upgrade when upgrade is true", async () => {
      const server = createMockServer();
      registerInitTool(server);
      const handler = getHandler(server, "terraform_init");

      await handler({ directory: "/tmp/tf", upgrade: true });

      expect(vi.mocked(runTerraform)).toHaveBeenCalledWith(
        ["init", "-no-color", "-upgrade"],
        { cwd: "/tmp/tf" }
      );
    });

    it("adds -reconfigure when reconfigure is true", async () => {
      const server = createMockServer();
      registerInitTool(server);
      const handler = getHandler(server, "terraform_init");

      await handler({ directory: "/tmp/tf", reconfigure: true });

      expect(vi.mocked(runTerraform)).toHaveBeenCalledWith(
        ["init", "-no-color", "-reconfigure"],
        { cwd: "/tmp/tf" }
      );
    });

    it("adds -backend-config for each backend_config entry", async () => {
      const server = createMockServer();
      registerInitTool(server);
      const handler = getHandler(server, "terraform_init");

      await handler({ directory: "/tmp/tf", backend_config: { bucket: "my-tf-state", key: "prod/terraform.tfstate" } });

      const args = vi.mocked(runTerraform).mock.calls[0][0];
      expect(args).toContain("-backend-config");
      expect(args).toContain("bucket=my-tf-state");
      expect(args).toContain("key=prod/terraform.tfstate");
    });

    it("combines all init options", async () => {
      const server = createMockServer();
      registerInitTool(server);
      const handler = getHandler(server, "terraform_init");

      await handler({ directory: "/tmp/tf", upgrade: true, reconfigure: true, backend_config: { region: "us-west-2" } });

      const args = vi.mocked(runTerraform).mock.calls[0][0];
      expect(args).toEqual([
        "init", "-no-color", "-upgrade", "-reconfigure",
        "-backend-config", "region=us-west-2",
      ]);
    });
  });

  describe("terraform_validate", () => {
    it("calls terraform validate with correct args", async () => {
      const server = createMockServer();
      registerValidateTool(server);
      const handler = getHandler(server, "terraform_validate");

      await handler({ directory: "/tmp/tf" });

      expect(vi.mocked(runTerraform)).toHaveBeenCalledWith(
        ["validate", "-no-color"],
        { cwd: "/tmp/tf" }
      );
    });
  });

  describe("terraform_state_list", () => {
    it("calls terraform state list without pattern", async () => {
      const server = createMockServer();
      registerStateListTool(server);
      const handler = getHandler(server, "terraform_state_list");

      await handler({ directory: "/tmp/tf" });

      expect(vi.mocked(runTerraform)).toHaveBeenCalledWith(
        ["state", "list", "-no-color"],
        { cwd: "/tmp/tf" }
      );
    });

    it("adds id_pattern when provided", async () => {
      const server = createMockServer();
      registerStateListTool(server);
      const handler = getHandler(server, "terraform_state_list");

      await handler({ directory: "/tmp/tf", id_pattern: "aws_*" });

      expect(vi.mocked(runTerraform)).toHaveBeenCalledWith(
        ["state", "list", "-no-color", "aws_*"],
        { cwd: "/tmp/tf" }
      );
    });
  });

  describe("terraform_state_show", () => {
    it("calls terraform state show with resource_id", async () => {
      const server = createMockServer();
      registerStateShowTool(server);
      const handler = getHandler(server, "terraform_state_show");

      await handler({ directory: "/tmp/tf", resource_id: "aws_instance.web" });

      expect(vi.mocked(runTerraform)).toHaveBeenCalledWith(
        ["state", "show", "-no-color", "aws_instance.web"],
        { cwd: "/tmp/tf" }
      );
    });
  });

  describe("terraform_fmt", () => {
    it("calls terraform fmt with basic args", async () => {
      const server = createMockServer();
      registerFmtTool(server);
      const handler = getHandler(server, "terraform_fmt");

      await handler({ directory: "/tmp/tf" });

      expect(vi.mocked(runTerraform)).toHaveBeenCalledWith(
        ["fmt", "-no-color"],
        { cwd: "/tmp/tf" }
      );
    });

    it("adds -check when check is true", async () => {
      const server = createMockServer();
      registerFmtTool(server);
      const handler = getHandler(server, "terraform_fmt");

      await handler({ directory: "/tmp/tf", check: true });

      expect(vi.mocked(runTerraform)).toHaveBeenCalledWith(
        ["fmt", "-no-color", "-check"],
        { cwd: "/tmp/tf" }
      );
    });

    it("adds -recursive when recursive is true", async () => {
      const server = createMockServer();
      registerFmtTool(server);
      const handler = getHandler(server, "terraform_fmt");

      await handler({ directory: "/tmp/tf", recursive: true });

      expect(vi.mocked(runTerraform)).toHaveBeenCalledWith(
        ["fmt", "-no-color", "-recursive"],
        { cwd: "/tmp/tf" }
      );
    });

    it("combines check and recursive", async () => {
      const server = createMockServer();
      registerFmtTool(server);
      const handler = getHandler(server, "terraform_fmt");

      await handler({ directory: "/tmp/tf", check: true, recursive: true });

      expect(vi.mocked(runTerraform)).toHaveBeenCalledWith(
        ["fmt", "-no-color", "-check", "-recursive"],
        { cwd: "/tmp/tf" }
      );
    });
  });

  describe("terraform_output", () => {
    it("calls terraform output with basic args", async () => {
      const server = createMockServer();
      registerOutputTool(server);
      const handler = getHandler(server, "terraform_output");

      await handler({ directory: "/tmp/tf" });

      expect(vi.mocked(runTerraform)).toHaveBeenCalledWith(
        ["output", "-no-color"],
        { cwd: "/tmp/tf" }
      );
    });

    it("adds -json when json is true", async () => {
      const server = createMockServer();
      registerOutputTool(server);
      const handler = getHandler(server, "terraform_output");

      await handler({ directory: "/tmp/tf", json: true });

      expect(vi.mocked(runTerraform)).toHaveBeenCalledWith(
        ["output", "-no-color", "-json"],
        { cwd: "/tmp/tf" }
      );
    });

    it("adds output name when provided", async () => {
      const server = createMockServer();
      registerOutputTool(server);
      const handler = getHandler(server, "terraform_output");

      await handler({ directory: "/tmp/tf", name: "instance_ip" });

      expect(vi.mocked(runTerraform)).toHaveBeenCalledWith(
        ["output", "-no-color", "instance_ip"],
        { cwd: "/tmp/tf" }
      );
    });

    it("combines json and name", async () => {
      const server = createMockServer();
      registerOutputTool(server);
      const handler = getHandler(server, "terraform_output");

      await handler({ directory: "/tmp/tf", json: true, name: "all_outputs" });

      expect(vi.mocked(runTerraform)).toHaveBeenCalledWith(
        ["output", "-no-color", "-json", "all_outputs"],
        { cwd: "/tmp/tf" }
      );
    });
  });

  describe("terraform_import", () => {
    it("calls terraform import with resource address and id", async () => {
      const server = createMockServer();
      registerImportTool(server);
      const handler = getHandler(server, "terraform_import");

      await handler({ directory: "/tmp/tf", resource_address: "aws_instance.web", resource_id: "i-abc123" });

      expect(vi.mocked(runTerraform)).toHaveBeenCalledWith(
        ["import", "-no-color", "aws_instance.web", "i-abc123"],
        { cwd: "/tmp/tf" }
      );
    });
  });

  describe("terraform_destroy", () => {
    it("calls terraform destroy with basic args", async () => {
      const server = createMockServer();
      registerDestroyTool(server);
      const handler = getHandler(server, "terraform_destroy");

      await handler({ directory: "/tmp/tf" });

      expect(vi.mocked(runTerraform)).toHaveBeenCalledWith(
        ["destroy", "-no-color"],
        { cwd: "/tmp/tf" }
      );
    });

    it("adds -auto-approve when auto_approve is true", async () => {
      const server = createMockServer();
      registerDestroyTool(server);
      const handler = getHandler(server, "terraform_destroy");

      await handler({ directory: "/tmp/tf", auto_approve: true });

      expect(vi.mocked(runTerraform)).toHaveBeenCalledWith(
        ["destroy", "-no-color", "-auto-approve"],
        { cwd: "/tmp/tf" }
      );
    });

    it("adds -target when target is provided", async () => {
      const server = createMockServer();
      registerDestroyTool(server);
      const handler = getHandler(server, "terraform_destroy");

      await handler({ directory: "/tmp/tf", target: "aws_s3_bucket.logs" });

      expect(vi.mocked(runTerraform)).toHaveBeenCalledWith(
        ["destroy", "-no-color", "-target", "aws_s3_bucket.logs"],
        { cwd: "/tmp/tf" }
      );
    });

    it("returns isError true on non-zero exit", async () => {
      vi.mocked(runTerraform).mockResolvedValueOnce({
        stdout: "", stderr: "Error: resource not found", exitCode: 1,
      });
      const server = createMockServer();
      registerDestroyTool(server);
      const handler = getHandler(server, "terraform_destroy");

      const result = await handler({ directory: "/tmp/tf" });

      expect(result.isError).toBe(true);
    });
  });
});
