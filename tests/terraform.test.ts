import { describe, it, expect, vi, beforeEach } from "vitest";
import { runTerraform, formatResult } from "../src/terraform.js";

// Mock child_process
vi.mock("node:child_process", () => ({
  execFile: vi.fn(),
}));

import { execFile } from "node:child_process";

describe("runTerraform", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls terraform with correct args", async () => {
    vi.mocked(execFile).mockImplementation((_cmd: any, _args: any, _opts: any, cb: any) => {
      if (typeof cb === "function") {
        cb(null, { stdout: "ok", stderr: "" });
      }
      return {} as any;
    });

    const result = await runTerraform(["plan", "-no-color"]);
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toBe("ok");
  });

  it("returns exit code on error", async () => {
    vi.mocked(execFile).mockImplementation((_cmd: any, _args: any, _opts: any, cb: any) => {
      if (typeof cb === "function") {
        const err = new Error("terraform failed") as any;
        err.stdout = "Error: Invalid";
        err.stderr = "exit code 1";
        err.code = 1;
        cb(err);
      }
      return {} as any;
    });

    const result = await runTerraform(["plan"]);
    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain("exit code 1");
  });
});

describe("formatResult", () => {
  it("returns stdout when available", () => {
    const result = formatResult({ stdout: "Apply complete!", stderr: "", exitCode: 0 });
    expect(result).toBe("Apply complete!");
  });

  it("includes stderr when present", () => {
    const result = formatResult({ stdout: "", stderr: "Warning: deprecated", exitCode: 0 });
    expect(result).toContain("STDERR:");
    expect(result).toContain("Warning: deprecated");
  });

  it("includes exit code when non-zero", () => {
    const result = formatResult({ stdout: "", stderr: "", exitCode: 1 });
    expect(result).toContain("Exit code: 1");
  });

  it("returns 'No output.' for empty result", () => {
    const result = formatResult({ stdout: "", stderr: "", exitCode: 0 });
    expect(result).toBe("No output.");
  });
});
