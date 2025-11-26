import { homedir } from 'os';
import { join, isAbsolute } from 'path';

/**
 * Environment variable name for overriding the global directory location.
 * When set, all global state files will be stored in this location instead of ~/.spec-workflow-mcp
 *
 * This is useful for sandboxed environments (e.g., Codex CLI with sandbox_mode=workspace-write)
 * where $HOME is read-only.
 *
 * @example
 * // Set to an absolute path
 * SPEC_WORKFLOW_HOME=/workspace/.spec-workflow-mcp npx spec-workflow-mcp /workspace
 *
 * // Set to a relative path (resolved against current working directory)
 * SPEC_WORKFLOW_HOME=./.spec-workflow-mcp npx spec-workflow-mcp /workspace
 */
export const SPEC_WORKFLOW_HOME_ENV = 'SPEC_WORKFLOW_HOME';

const DEFAULT_DIR_NAME = '.spec-workflow-mcp';

/**
 * Get the global directory path for storing spec-workflow-mcp state files.
 *
 * Resolution order:
 * 1. SPEC_WORKFLOW_HOME environment variable (if set)
 *    - Absolute paths are used as-is
 *    - Relative paths are resolved against process.cwd()
 * 2. Default: ~/.spec-workflow-mcp
 *
 * Files stored in this directory:
 * - activeProjects.json - Project registry
 * - activeSession.json - Dashboard session info
 * - settings.json - Global settings
 * - job-execution-history.json - Job execution history
 * - migration.log - Implementation log migration tracking
 *
 * @returns The absolute path to the global directory
 */
export function getGlobalDir(): string {
  const envPath = process.env[SPEC_WORKFLOW_HOME_ENV];

  if (envPath) {
    // If an environment variable is set, use it
    // Handle both absolute and relative paths
    return isAbsolute(envPath) ? envPath : join(process.cwd(), envPath);
  }

  // Default to ~/.spec-workflow-mcp
  return join(homedir(), DEFAULT_DIR_NAME);
}

/**
 * Get a helpful error message for permission errors when accessing the global directory.
 * Suggests using SPEC_WORKFLOW_HOME environment variable.
 *
 * @param operation - The operation that failed (e.g., "create directory", "write file")
 * @param path - The path that couldn't be accessed
 * @returns A formatted error message with suggestions
 */
export function getPermissionErrorHelp(operation: string, path: string): string {
  return `
Failed to ${operation}: ${path}

This error typically occurs in sandboxed environments where $HOME is read-only.

To fix this, set the SPEC_WORKFLOW_HOME environment variable to a writable location:

  SPEC_WORKFLOW_HOME=/path/to/writable/dir npx spec-workflow-mcp [project-path]

For example, to store state files in your workspace:

  SPEC_WORKFLOW_HOME=/workspace/.spec-workflow-mcp npx spec-workflow-mcp /workspace

Or use a relative path:

  SPEC_WORKFLOW_HOME=./.spec-workflow-mcp npx spec-workflow-mcp .
`.trim();
}

