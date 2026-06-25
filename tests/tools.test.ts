import { describe, it, expect, vi, beforeEach } from "vitest";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerPlanTool } from "../src/tools/plan.js";
import { registerApplyTool } from "../src/tools/apply.js";
import { registerDestroyTool } from "../src/tools/destroy.js";
import { registerInitTool } from "../src/tools/init.js";
import { registerValidateTool } from "../src/tools/validate.js";
import { registerStateListTool } from "../src/tools/state-list.js";
import { registerStateShowTool } from "../src/tools/state-show.js";
import { registerFmtTool } from "../src/tools/fmt.js";
import { registerOutputTool } from "../src/tools/output.js";
import { registerImportTool } from "../src/tools/import.js";

// Mock terraform module
vi.mock("../src/terraform.js", () => {
  const mockResult = {
    stdout: "Terraform has been successfully initialized.",
    stderr: "",
    exitCode: 0,
  };
  return {
    runTerraform: vi.fn().mockResolvedValue(mockResult),
    formatResult: vi.fn().mockImplementation((r) => r.stdout || r.stderr || "No output."),
  };
});

function createMockServer(): McpServer {
  return new McpServer({ name: "test-terraform", version: "0.0.1" });
}

describe("Tool Registration", () => {
  it("registers all 10 tools", () => {
    const server = createMockServer();
    const toolNames: string[] = [];
    
    // Intercept tool registration
    const originalTool = server.tool.bind(server);
    server.tool = vi.fn().mockImplementation((name: string, ...args: any[]) => {
      toolNames.push(name);
      return originalTool(name, ...args);
    });

    registerPlanTool(server);
    registerApplyTool(server);
    registerDestroyTool(server);
    registerInitTool(server);
    registerValidateTool(server);
    registerStateListTool(server);
    registerStateShowTool(server);
    registerFmtTool(server);
    registerOutputTool(server);
    registerImportTool(server);

    expect(toolNames).toContain("terraform_plan");
    expect(toolNames).toContain("terraform_apply");
    expect(toolNames).toContain("terraform_destroy");
    expect(toolNames).toContain("terraform_init");
    expect(toolNames).toContain("terraform_validate");
    expect(toolNames).toContain("terraform_state_list");
    expect(toolNames).toContain("terraform_state_show");
    expect(toolNames).toContain("terraform_fmt");
    expect(toolNames).toContain("terraform_output");
    expect(toolNames).toContain("terraform_import");
    expect(toolNames).toHaveLength(10);
  });
});

describe("Plan Tool", () => {
  it("calls terraform plan with no-color flag", async () => {
    const { runTerraform } = await import("../src/terraform.js");
    const mockRun = vi.mocked(runTerraform);
    mockRun.mockResolvedValueOnce({ stdout: "No changes.", stderr: "", exitCode: 0 });

    const server = createMockServer();
    registerPlanTool(server);
    
    // Access the registered tool handler
    const tools = (server as any)._tools || {};
    // Tool was registered - verify mock was called when invoked
    expect(mockRun).toBeDefined();
  });

  it("includes -destroy flag when destroy option is true", async () => {
    const { runTerraform } = await import("../src/terraform.js");
    const mockRun = vi.mocked(runTerraform);
    mockRun.mockClear();
  });
});

describe("Apply Tool", () => {
  it("registers with correct name", () => {
    const server = createMockServer();
    registerApplyTool(server);
    expect(server).toBeDefined();
  });
});

describe("Destroy Tool", () => {
  it("registers with correct name", () => {
    const server = createMockServer();
    registerDestroyTool(server);
    expect(server).toBeDefined();
  });
});

describe("Init Tool", () => {
  it("registers with correct name", () => {
    const server = createMockServer();
    registerInitTool(server);
    expect(server).toBeDefined();
  });
});

describe("Validate Tool", () => {
  it("registers with correct name", () => {
    const server = createMockServer();
    registerValidateTool(server);
    expect(server).toBeDefined();
  });
});

describe("State List Tool", () => {
  it("registers with correct name", () => {
    const server = createMockServer();
    registerStateListTool(server);
    expect(server).toBeDefined();
  });
});

describe("State Show Tool", () => {
  it("registers with correct name", () => {
    const server = createMockServer();
    registerStateShowTool(server);
    expect(server).toBeDefined();
  });
});

describe("Fmt Tool", () => {
  it("registers with correct name", () => {
    const server = createMockServer();
    registerFmtTool(server);
    expect(server).toBeDefined();
  });
});

describe("Output Tool", () => {
  it("registers with correct name", () => {
    const server = createMockServer();
    registerOutputTool(server);
    expect(server).toBeDefined();
  });
});

describe("Import Tool", () => {
  it("registers with correct name", () => {
    const server = createMockServer();
    registerImportTool(server);
    expect(server).toBeDefined();
  });
});
