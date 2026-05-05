import { execSync, ExecSyncOptionsWithStringEncoding } from 'child_process';
import { resolve } from 'path';

export const SPEC_WORKFLOW_SHARED_ROOT_ENV = 'SPEC_WORKFLOW_SHARED_ROOT';
const GIT_EXEC_OPTIONS: ExecSyncOptionsWithStringEncoding = {
  encoding: 'utf-8',
  stdio: ['pipe', 'pipe', 'pipe'],
  timeout: 5000
};

/**
 * Resolves the git workspace root directory.
 * For repositories and worktrees, this returns the top-level checked-out directory.
 *
 * @param projectPath - Any path inside the workspace
 * @returns Workspace root path, or original path when git is unavailable
 */
export function resolveGitWorkspaceRoot(projectPath: string): string {
  try {
    const workspaceRoot = execSync('git rev-parse --show-toplevel', {
      cwd: projectPath,
      ...GIT_EXEC_OPTIONS
    }).trim();

    return workspaceRoot || projectPath;
  } catch {
    return projectPath;
  }
}

/**
 * Resolves the git root directory for storing shared specs.
 * In worktrees, this returns the main repository path so all worktrees share specs.
 *
 * @param projectPath - The current project/worktree path
 * @returns The resolved path (main repo for worktrees, or original path)
 */
export function resolveGitRoot(projectPath: string): string {
  // Check for explicit override first
  const explicitRoot = process.env[SPEC_WORKFLOW_SHARED_ROOT_ENV]?.trim();
  if (explicitRoot) {
    return explicitRoot;
  }

  try {
    // Get the git common directory (main repo's .git folder)
    const gitCommonDir = execSync('git rev-parse --git-common-dir', {
      cwd: projectPath,
      ...GIT_EXEC_OPTIONS
    }).trim();

    // In main repo, returns ".git" - no change needed
    if (gitCommonDir === '.git') {
      return projectPath;
    }

    // In worktree or subdirectory, returns path like "/main/.git", "/main/.git/worktrees/name",
    // or relative path like "../../.git" when run from a subdirectory.
    // Extract the main repo path (parent of .git) and resolve to absolute path.
    const gitIndex = gitCommonDir.lastIndexOf('.git');
    if (gitIndex > 0) {
      const mainRepoPath = gitCommonDir.substring(0, gitIndex - 1);
      // If path is already absolute (Unix or Windows style), return as-is
      // Otherwise, resolve relative to projectPath
      const isAbsolute = mainRepoPath.startsWith('/') || /^[A-Za-z]:[\\/]/.test(mainRepoPath);
      return isAbsolute ? mainRepoPath : resolve(projectPath, mainRepoPath);
    }

    return projectPath;
  } catch {
    // Not a git repo or git unavailable - use original path
    return projectPath;
  }
}

/**
 * Checks if the current directory is a git worktree (not the main repo).
 *
 * @param projectPath - The path to check
 * @returns true if in a worktree, false if main repo or not a git repo
 */
export function isGitWorktree(projectPath: string): boolean {
  try {
    const gitCommonDir = execSync('git rev-parse --git-common-dir', {
      cwd: projectPath,
      ...GIT_EXEC_OPTIONS
    }).trim();
    return gitCommonDir !== '.git';
  } catch {
    return false;
  }
}
