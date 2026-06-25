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

  it("uses custom cwd option", async () => {
    vi.mocked(execFile).mockImplementation((_cmd: any, _args: any, _opts: any, cb: any) => {
      if (typeof cb === "function") {
        cb(null, { stdout: "ok", stderr: "" });
      }
      return {} as any;
    });

    await runTerraform(["plan"], { cwd: "/tmp/myproject" });
    expect(execFile).toHaveBeenCalledWith(
      "terraform",
      ["plan"],
      expect.objectContaining({ cwd: "/tmp/myproject" }),
      expect.any(Function)
    );
  });

  it("merges custom env with process.env", async () => {
    vi.mocked(execFile).mockImplementation((_cmd: any, _args: any, _opts: any, cb: any) => {
      if (typeof cb === "function") {
        cb(null, { stdout: "ok", stderr: "" });
      }
      return {} as any;
    });

    await runTerraform(["plan"], { env: { TF_LOG: "DEBUG" } });
    expect(execFile).toHaveBeenCalledWith(
      "terraform",
      ["plan"],
      expect.objectContaining({
        env: expect.objectContaining({ TF_LOG: "DEBUG" }),
      }),
      expect.any(Function)
    );
  });

  it("uses default timeout of 120s", async () => {
    vi.mocked(execFile).mockImplementation((_cmd: any, _args: any, _opts: any, cb: any) => {
      if (typeof cb === "function") {
        cb(null, { stdout: "ok", stderr: "" });
      }
      return {} as any;
    });

    await runTerraform(["plan"]);
    expect(execFile).toHaveBeenCalledWith(
      "terraform",
      ["plan"],
      expect.objectContaining({ timeout: 120000 }),
      expect.any(Function)
    );
  });

  it("uses custom timeout option", async () => {
    vi.mocked(execFile).mockImplementation((_cmd: any, _args: any, _opts: any, cb: any) => {
      if (typeof cb === "function") {
        cb(null, { stdout: "ok", stderr: "" });
      }
      return {} as any;
    });

    await runTerraform(["plan"], { timeout: 300000 });
    expect(execFile).toHaveBeenCalledWith(
      "terraform",
      ["plan"],
      expect.objectContaining({ timeout: 300000 }),
      expect.any(Function)
    );
  });

  it("handles error with no code property", async () => {
    vi.mocked(execFile).mockImplementation((_cmd: any, _args: any, _opts: any, cb: any) => {
      if (typeof cb === "function") {
        const err = new Error("command not found") as any;
        err.stdout = "";
        err.stderr = "terraform: command not found";
        // no err.code set
        cb(err);
      }
      return {} as any;
    });

    const result = await runTerraform(["plan"]);
    expect(result.exitCode).toBe(1); // defaults to 1
    expect(result.stderr).toBe("terraform: command not found");
  });

  it("handles error with no stdout or stderr", async () => {
    vi.mocked(execFile).mockImplementation((_cmd: any, _args: any, _opts: any, cb: any) => {
      if (typeof cb === "function") {
        const err = new Error("killed") as any;
        // no stdout, no stderr
        cb(err);
      }
      return {} as any;
    });

    const result = await runTerraform(["plan"]);
    expect(result.exitCode).toBe(1);
    expect(result.stdout).toBe("");
    expect(result.stderr).toBe("killed"); // falls back to error.message
  });

  it("returns combined stdout and stderr on success", async () => {
    vi.mocked(execFile).mockImplementation((_cmd: any, _args: any, _opts: any, cb: any) => {
      if (typeof cb === "function") {
        cb(null, { stdout: "Plan: 1 to add", stderr: "Warning: deprecated provider" });
      }
      return {} as any;
    });

    const result = await runTerraform(["plan"]);
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toBe("Plan: 1 to add");
    expect(result.stderr).toBe("Warning: deprecated provider");
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
