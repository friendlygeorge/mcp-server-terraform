export interface TerraformResult {
    stdout: string;
    stderr: string;
    exitCode: number | null;
}
export declare function runTerraform(args: string[], options?: {
    cwd?: string;
    env?: Record<string, string>;
    timeout?: number;
}): Promise<TerraformResult>;
export declare function formatResult(result: TerraformResult): string;
//# sourceMappingURL=terraform.d.ts.map