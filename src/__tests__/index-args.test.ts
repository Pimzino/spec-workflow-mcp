import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../core/git-utils.js', () => ({
  resolveGitWorkspaceRoot: vi.fn((path: string) => `/workspace${path}`),
  resolveGitRoot: vi.fn((path: string) => `/shared${path}`)
}));

import { parseArguments } from '../index.js';
import { resolveGitRoot, resolveGitWorkspaceRoot } from '../core/git-utils.js';

const mockedResolveGitWorkspaceRoot = vi.mocked(resolveGitWorkspaceRoot);
const mockedResolveGitRoot = vi.mocked(resolveGitRoot);

describe('index argument parsing (worktree/shared root)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('uses workspace path as workflow root when --no-shared-worktree-specs is enabled', () => {
    mockedResolveGitWorkspaceRoot.mockReturnValue('/tmp/specwf-wt-a');
    mockedResolveGitRoot.mockReturnValue('/repo/main');

    const parsed = parseArguments(['/tmp/specwf-wt-a', '--no-shared-worktree-specs']);

    expect(parsed.workspacePath).toBe('/tmp/specwf-wt-a');
    expect(parsed.workflowRootPath).toBe('/tmp/specwf-wt-a');
    expect(parsed.noSharedWorktreeSpecs).toBe(true);
    expect(mockedResolveGitWorkspaceRoot).toHaveBeenCalledWith('/tmp/specwf-wt-a');
    expect(mockedResolveGitRoot).not.toHaveBeenCalled();
  });

  it('uses shared git root by default when no flag is provided', () => {
    mockedResolveGitWorkspaceRoot.mockReturnValue('/tmp/specwf-wt-b');
    mockedResolveGitRoot.mockReturnValue('/Users/lucas/dev/projects/spec-workflow-mcp');

    const parsed = parseArguments(['/tmp/specwf-wt-b']);

    expect(parsed.workspacePath).toBe('/tmp/specwf-wt-b');
    expect(parsed.workflowRootPath).toBe('/Users/lucas/dev/projects/spec-workflow-mcp');
    expect(parsed.noSharedWorktreeSpecs).toBe(false);
    expect(mockedResolveGitRoot).toHaveBeenCalledWith('/tmp/specwf-wt-b');
  });

  it('accepts --no-shared-worktree-specs in dashboard mode without treating it as project path', () => {
    mockedResolveGitWorkspaceRoot.mockReturnValue('/tmp/specwf-wt-dashboard');

    const parsed = parseArguments(['--dashboard', '--port', '6001', '--no-shared-worktree-specs']);

    expect(parsed.isDashboardMode).toBe(true);
    expect(parsed.port).toBe(6001);
    expect(parsed.noSharedWorktreeSpecs).toBe(true);
    expect(parsed.workspacePath).toBe('/tmp/specwf-wt-dashboard');
    expect(parsed.workflowRootPath).toBe('/tmp/specwf-wt-dashboard');
  });
});
