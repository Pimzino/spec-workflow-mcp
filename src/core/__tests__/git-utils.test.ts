import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { execSync } from 'child_process';
import { resolveGitRoot, isGitWorktree, SPEC_WORKFLOW_SHARED_ROOT_ENV } from '../git-utils.js';

// Mock child_process
vi.mock('child_process', () => ({
  execSync: vi.fn()
}));

const mockedExecSync = vi.mocked(execSync);

describe('resolveGitRoot', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env[SPEC_WORKFLOW_SHARED_ROOT_ENV];
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  describe('explicit env var override', () => {
    it('should use SPEC_WORKFLOW_SHARED_ROOT when set', () => {
      process.env[SPEC_WORKFLOW_SHARED_ROOT_ENV] = '/custom/root';

      const result = resolveGitRoot('/some/project');

      expect(result).toBe('/custom/root');
      expect(mockedExecSync).not.toHaveBeenCalled();
    });

    it('should trim whitespace from env var', () => {
      process.env[SPEC_WORKFLOW_SHARED_ROOT_ENV] = '  /custom/root  ';

      const result = resolveGitRoot('/some/project');

      expect(result).toBe('/custom/root');
    });

    it('should ignore empty env var', () => {
      process.env[SPEC_WORKFLOW_SHARED_ROOT_ENV] = '';
      mockedExecSync.mockReturnValue('.git');

      const result = resolveGitRoot('/some/project');

      expect(result).toBe('/some/project');
      expect(mockedExecSync).toHaveBeenCalled();
    });

    it('should ignore whitespace-only env var', () => {
      process.env[SPEC_WORKFLOW_SHARED_ROOT_ENV] = '   ';
      mockedExecSync.mockReturnValue('.git');

      const result = resolveGitRoot('/some/project');

      expect(result).toBe('/some/project');
      expect(mockedExecSync).toHaveBeenCalled();
    });
  });

  describe('main git repository', () => {
    it('should return original path when in main repo', () => {
      mockedExecSync.mockReturnValue('.git');

      const result = resolveGitRoot('/main/repo');

      expect(result).toBe('/main/repo');
    });

    it('should return original path when git returns ".git" with newline', () => {
      mockedExecSync.mockReturnValue('.git\n');

      const result = resolveGitRoot('/main/repo');

      expect(result).toBe('/main/repo');
    });
  });

  describe('git worktree', () => {
    it('should return main repo path when in worktree (Unix-style path)', () => {
      mockedExecSync.mockReturnValue('/home/user/main-repo/.git');

      const result = resolveGitRoot('/home/user/worktree');

      expect(result).toBe('/home/user/main-repo');
    });

    it('should return main repo path when git returns worktree subfolder', () => {
      mockedExecSync.mockReturnValue('/home/user/main-repo/.git/worktrees/feature-branch');

      const result = resolveGitRoot('/home/user/worktree');

      expect(result).toBe('/home/user/main-repo');
    });

    it('should handle Windows-style paths', () => {
      mockedExecSync.mockReturnValue('C:/Users/dev/main-repo/.git');

      const result = resolveGitRoot('C:/Users/dev/worktree');

      expect(result).toBe('C:/Users/dev/main-repo');
    });

    it('should resolve relative paths from git-common-dir', () => {
      mockedExecSync.mockReturnValue('../../.git');

      const result = resolveGitRoot('/home/user/repo/src/core');

      expect(result).toBe('/home/user/repo');
    });
  });

  describe('error handling', () => {
    it('should return original path when git command fails', () => {
      mockedExecSync.mockImplementation(() => {
        throw new Error('not a git repository');
      });

      const result = resolveGitRoot('/not/a/git/repo');

      expect(result).toBe('/not/a/git/repo');
    });

    it('should return original path when git is not installed', () => {
      mockedExecSync.mockImplementation(() => {
        throw new Error('git: command not found');
      });

      const result = resolveGitRoot('/some/path');

      expect(result).toBe('/some/path');
    });

    it('should return original path on timeout', () => {
      mockedExecSync.mockImplementation(() => {
        const error = new Error('timeout');
        (error as any).killed = true;
        throw error;
      });

      const result = resolveGitRoot('/some/path');

      expect(result).toBe('/some/path');
    });
  });

  describe('execSync configuration', () => {
    it('should call git with correct options', () => {
      mockedExecSync.mockReturnValue('.git');

      resolveGitRoot('/test/path');

      expect(mockedExecSync).toHaveBeenCalledWith(
        'git rev-parse --git-common-dir',
        expect.objectContaining({
          cwd: '/test/path',
          encoding: 'utf-8',
          stdio: ['pipe', 'pipe', 'pipe'],
          timeout: 5000
        })
      );
    });
  });
});

describe('isGitWorktree', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return false when in main repo', () => {
    mockedExecSync.mockReturnValue('.git');

    expect(isGitWorktree('/main/repo')).toBe(false);
  });

  it('should return true when in worktree', () => {
    mockedExecSync.mockReturnValue('/home/user/main-repo/.git');

    expect(isGitWorktree('/home/user/worktree')).toBe(true);
  });

  it('should return false when not a git repo', () => {
    mockedExecSync.mockImplementation(() => {
      throw new Error('not a git repository');
    });

    expect(isGitWorktree('/not/a/repo')).toBe(false);
  });

  it('should return false when git is not available', () => {
    mockedExecSync.mockImplementation(() => {
      throw new Error('git: command not found');
    });

    expect(isGitWorktree('/some/path')).toBe(false);
  });
});
