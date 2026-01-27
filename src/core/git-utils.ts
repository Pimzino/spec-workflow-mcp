import { execSync } from 'child_process';
import { resolve, isAbsolute } from 'path';

export const SPEC_WORKFLOW_SHARED_ROOT_ENV = 'SPEC_WORKFLOW_SHARED_ROOT';

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
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: 5000
    }).trim();

    // In main repo, returns ".git" - no change needed
    if (gitCommonDir === '.git') {
      return projectPath;
    }

    // In worktree, returns path like "/main/.git", "../../.git", or "C:/main/.git"
    // Extract the main repo path (parent of .git) and resolve to absolute path
    const gitIndex = gitCommonDir.lastIndexOf('.git');
    if (gitIndex > 0) {
      const mainRepoPath = gitCommonDir.substring(0, gitIndex - 1);
      // If already absolute (Unix or Windows), return as-is; otherwise resolve relative to projectPath
      if (isAbsolute(mainRepoPath) || /^[A-Za-z]:/.test(mainRepoPath)) {
        return mainRepoPath;
      }
      return resolve(projectPath, mainRepoPath);
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
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: 5000
    }).trim();
    return gitCommonDir !== '.git';
  } catch {
    return false;
  }
}
