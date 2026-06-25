import { execFile, ExecFileOptions } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export interface TerraformResult {
  stdout: string;
  stderr: string;
  exitCode: number | null;
}

export async function runTerraform(
  args: string[],
  options: {
    cwd?: string;
    env?: Record<string, string>;
    timeout?: number;
  } = {}
): Promise<TerraformResult> {
  const { cwd = process.cwd(), env, timeout = 120000 } = options;

  try {
    const result = await execFileAsync("terraform", args, {
      cwd,
      timeout,
      maxBuffer: 10 * 1024 * 1024, // 10MB
      env: env ? { ...process.env, ...env } : undefined,
    });
    return {
      stdout: result.stdout,
      stderr: result.stderr,
      exitCode: 0,
    };
  } catch (error: any) {
    return {
      stdout: error.stdout || "",
      stderr: error.stderr || error.message,
      exitCode: error.code ?? 1,
    };
  }
}

export function formatResult(result: TerraformResult): string {
  const parts: string[] = [];
  if (result.stdout.trim()) parts.push(result.stdout.trim());
  if (result.stderr.trim()) parts.push(`STDERR:\n${result.stderr.trim()}`);
  if (result.exitCode !== 0) parts.push(`Exit code: ${result.exitCode}`);
  return parts.join("\n\n") || "No output.";
}
