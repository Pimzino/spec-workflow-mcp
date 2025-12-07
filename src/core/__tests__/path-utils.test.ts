import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { PathUtils } from '../path-utils.js';

describe('PathUtils.translatePath', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    // Reset cached config and clear env vars before each test
    PathUtils.resetPathConfig();
    delete process.env.SPEC_WORKFLOW_HOST_PATH_PREFIX;
    delete process.env.SPEC_WORKFLOW_CONTAINER_PATH_PREFIX;
  });

  afterEach(() => {
    // Restore original env
    process.env = { ...originalEnv };
    PathUtils.resetPathConfig();
  });

  describe('when env vars not set', () => {
    it('should return path unchanged', () => {
      const path = '/Users/dev/myproject';
      expect(PathUtils.translatePath(path)).toBe(path);
    });
  });

  describe('when env vars are empty or whitespace', () => {
    it('should return path unchanged when host prefix is empty', () => {
      process.env.SPEC_WORKFLOW_HOST_PATH_PREFIX = '';
      process.env.SPEC_WORKFLOW_CONTAINER_PATH_PREFIX = '/projects';

      const path = '/Users/dev/myproject';
      expect(PathUtils.translatePath(path)).toBe(path);
    });

    it('should return path unchanged when container prefix is empty', () => {
      process.env.SPEC_WORKFLOW_HOST_PATH_PREFIX = '/Users/dev';
      process.env.SPEC_WORKFLOW_CONTAINER_PATH_PREFIX = '';

      const path = '/Users/dev/myproject';
      expect(PathUtils.translatePath(path)).toBe(path);
    });

    it('should return path unchanged when host prefix is whitespace only', () => {
      process.env.SPEC_WORKFLOW_HOST_PATH_PREFIX = '   ';
      process.env.SPEC_WORKFLOW_CONTAINER_PATH_PREFIX = '/projects';

      const path = '/Users/dev/myproject';
      expect(PathUtils.translatePath(path)).toBe(path);
    });

    it('should return path unchanged when container prefix is whitespace only', () => {
      process.env.SPEC_WORKFLOW_HOST_PATH_PREFIX = '/Users/dev';
      process.env.SPEC_WORKFLOW_CONTAINER_PATH_PREFIX = '  \t  ';

      const path = '/Users/dev/myproject';
      expect(PathUtils.translatePath(path)).toBe(path);
    });
  });

  describe('basic translation', () => {
    beforeEach(() => {
      process.env.SPEC_WORKFLOW_HOST_PATH_PREFIX = '/Users/dev';
      process.env.SPEC_WORKFLOW_CONTAINER_PATH_PREFIX = '/projects';
    });

    it('should translate matching path', () => {
      expect(PathUtils.translatePath('/Users/dev/myproject'))
        .toBe('/projects/myproject');
    });

    it('should translate nested paths', () => {
      expect(PathUtils.translatePath('/Users/dev/code/app/src'))
        .toBe('/projects/code/app/src');
    });

    it('should not translate non-matching path', () => {
      const path = '/home/other/myproject';
      expect(PathUtils.translatePath(path)).toBe(path);
    });

    it('should handle exact prefix match (path equals prefix)', () => {
      expect(PathUtils.translatePath('/Users/dev')).toBe('/projects');
    });
  });

  describe('partial prefix matching prevention', () => {
    beforeEach(() => {
      process.env.SPEC_WORKFLOW_HOST_PATH_PREFIX = '/Users/dev';
      process.env.SPEC_WORKFLOW_CONTAINER_PATH_PREFIX = '/projects';
    });

    it('should NOT match /Users/developer (partial prefix)', () => {
      const path = '/Users/developer/myproject';
      expect(PathUtils.translatePath(path)).toBe(path);
    });

    it('should NOT match /Users/dev2 (partial prefix)', () => {
      const path = '/Users/dev2/myproject';
      expect(PathUtils.translatePath(path)).toBe(path);
    });

    it('should NOT match /Users/devops (partial prefix)', () => {
      const path = '/Users/devops/myproject';
      expect(PathUtils.translatePath(path)).toBe(path);
    });
  });

  describe('trailing slash normalization', () => {
    it('should handle trailing slash in host prefix', () => {
      process.env.SPEC_WORKFLOW_HOST_PATH_PREFIX = '/Users/dev/';
      process.env.SPEC_WORKFLOW_CONTAINER_PATH_PREFIX = '/projects';

      expect(PathUtils.translatePath('/Users/dev/myproject'))
        .toBe('/projects/myproject');
    });

    it('should handle trailing slash in container prefix', () => {
      process.env.SPEC_WORKFLOW_HOST_PATH_PREFIX = '/Users/dev';
      process.env.SPEC_WORKFLOW_CONTAINER_PATH_PREFIX = '/projects/';

      expect(PathUtils.translatePath('/Users/dev/myproject'))
        .toBe('/projects/myproject');
    });

    it('should handle trailing slashes in both prefixes', () => {
      process.env.SPEC_WORKFLOW_HOST_PATH_PREFIX = '/Users/dev/';
      process.env.SPEC_WORKFLOW_CONTAINER_PATH_PREFIX = '/projects/';

      expect(PathUtils.translatePath('/Users/dev/myproject'))
        .toBe('/projects/myproject');
    });

    it('should handle multiple trailing slashes', () => {
      process.env.SPEC_WORKFLOW_HOST_PATH_PREFIX = '/Users/dev///';
      process.env.SPEC_WORKFLOW_CONTAINER_PATH_PREFIX = '/projects';

      expect(PathUtils.translatePath('/Users/dev/myproject'))
        .toBe('/projects/myproject');
    });
  });

  describe('special characters (regex safety)', () => {
    it('should handle dots in path (not treated as regex wildcard)', () => {
      process.env.SPEC_WORKFLOW_HOST_PATH_PREFIX = '/Users/dev.user';
      process.env.SPEC_WORKFLOW_CONTAINER_PATH_PREFIX = '/projects';

      // Should NOT match /Users/devXuser (where X could be any char if . was regex)
      expect(PathUtils.translatePath('/Users/devXuser/app')).toBe('/Users/devXuser/app');

      // Should match exact path with dot
      expect(PathUtils.translatePath('/Users/dev.user/app')).toBe('/projects/app');
    });

    it('should handle parentheses in path', () => {
      process.env.SPEC_WORKFLOW_HOST_PATH_PREFIX = '/Users/dev(test)';
      process.env.SPEC_WORKFLOW_CONTAINER_PATH_PREFIX = '/projects';

      expect(PathUtils.translatePath('/Users/dev(test)/app')).toBe('/projects/app');
    });

    it('should handle brackets in path', () => {
      process.env.SPEC_WORKFLOW_HOST_PATH_PREFIX = '/Users/dev[1]';
      process.env.SPEC_WORKFLOW_CONTAINER_PATH_PREFIX = '/projects';

      expect(PathUtils.translatePath('/Users/dev[1]/app')).toBe('/projects/app');
    });

    it('should handle plus signs in path', () => {
      process.env.SPEC_WORKFLOW_HOST_PATH_PREFIX = '/Users/c++dev';
      process.env.SPEC_WORKFLOW_CONTAINER_PATH_PREFIX = '/projects';

      expect(PathUtils.translatePath('/Users/c++dev/app')).toBe('/projects/app');
    });

    it('should handle dollar signs in path', () => {
      process.env.SPEC_WORKFLOW_HOST_PATH_PREFIX = '/Users/$HOME';
      process.env.SPEC_WORKFLOW_CONTAINER_PATH_PREFIX = '/projects';

      expect(PathUtils.translatePath('/Users/$HOME/app')).toBe('/projects/app');
    });
  });
});

describe('PathUtils.reverseTranslatePath', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    PathUtils.resetPathConfig();
    delete process.env.SPEC_WORKFLOW_HOST_PATH_PREFIX;
    delete process.env.SPEC_WORKFLOW_CONTAINER_PATH_PREFIX;
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    PathUtils.resetPathConfig();
  });

  describe('when env vars not set', () => {
    it('should return path unchanged', () => {
      const path = '/projects/myproject';
      expect(PathUtils.reverseTranslatePath(path)).toBe(path);
    });
  });

  describe('basic reverse translation', () => {
    beforeEach(() => {
      process.env.SPEC_WORKFLOW_HOST_PATH_PREFIX = '/Users/dev';
      process.env.SPEC_WORKFLOW_CONTAINER_PATH_PREFIX = '/projects';
    });

    it('should reverse translate matching path', () => {
      expect(PathUtils.reverseTranslatePath('/projects/myproject'))
        .toBe('/Users/dev/myproject');
    });

    it('should not reverse translate non-matching path', () => {
      const path = '/other/myproject';
      expect(PathUtils.reverseTranslatePath(path)).toBe(path);
    });
  });

  describe('partial prefix matching prevention', () => {
    beforeEach(() => {
      process.env.SPEC_WORKFLOW_HOST_PATH_PREFIX = '/Users/dev';
      process.env.SPEC_WORKFLOW_CONTAINER_PATH_PREFIX = '/projects';
    });

    it('should NOT match /projects-backup (partial prefix)', () => {
      const path = '/projects-backup/myproject';
      expect(PathUtils.reverseTranslatePath(path)).toBe(path);
    });
  });

  describe('round-trip consistency', () => {
    beforeEach(() => {
      process.env.SPEC_WORKFLOW_HOST_PATH_PREFIX = '/Users/dev';
      process.env.SPEC_WORKFLOW_CONTAINER_PATH_PREFIX = '/projects';
    });

    it('should round-trip host -> container -> host', () => {
      const hostPath = '/Users/dev/myproject/src/index.ts';
      const containerPath = PathUtils.translatePath(hostPath);
      const backToHost = PathUtils.reverseTranslatePath(containerPath);

      expect(backToHost).toBe(hostPath);
    });

    it('should round-trip container -> host -> container', () => {
      const containerPath = '/projects/myproject/src/index.ts';
      const hostPath = PathUtils.reverseTranslatePath(containerPath);
      const backToContainer = PathUtils.translatePath(hostPath);

      expect(backToContainer).toBe(containerPath);
    });
  });
});

describe('PathUtils case sensitivity', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    PathUtils.resetPathConfig();
    delete process.env.SPEC_WORKFLOW_HOST_PATH_PREFIX;
    delete process.env.SPEC_WORKFLOW_CONTAINER_PATH_PREFIX;
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    PathUtils.resetPathConfig();
  });

  // Note: These tests verify case-insensitive behavior on macOS/Windows
  // On Linux (case-sensitive), these would behave differently
  if (process.platform === 'darwin' || process.platform === 'win32') {
    it('should match paths with different case on case-insensitive filesystems', () => {
      process.env.SPEC_WORKFLOW_HOST_PATH_PREFIX = '/Users/Dev';
      process.env.SPEC_WORKFLOW_CONTAINER_PATH_PREFIX = '/projects';

      // Lowercase 'dev' should match uppercase 'Dev' prefix
      expect(PathUtils.translatePath('/Users/dev/myproject'))
        .toBe('/projects/myproject');
    });

    it('should match mixed case paths', () => {
      process.env.SPEC_WORKFLOW_HOST_PATH_PREFIX = '/users/DEV';
      process.env.SPEC_WORKFLOW_CONTAINER_PATH_PREFIX = '/PROJECTS';

      expect(PathUtils.translatePath('/Users/Dev/App'))
        .toBe('/PROJECTS/App');
    });
  }
});

describe('PathUtils Windows backslash handling', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    PathUtils.resetPathConfig();
    delete process.env.SPEC_WORKFLOW_HOST_PATH_PREFIX;
    delete process.env.SPEC_WORKFLOW_CONTAINER_PATH_PREFIX;
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    PathUtils.resetPathConfig();
  });

  it('should handle Windows-style backslash paths', () => {
    process.env.SPEC_WORKFLOW_HOST_PATH_PREFIX = 'C:\\Users\\dev';
    process.env.SPEC_WORKFLOW_CONTAINER_PATH_PREFIX = '/projects';

    expect(PathUtils.translatePath('C:\\Users\\dev\\myproject'))
      .toBe('/projects/myproject');
  });

  it('should handle mixed separators', () => {
    process.env.SPEC_WORKFLOW_HOST_PATH_PREFIX = 'C:\\Users\\dev';
    process.env.SPEC_WORKFLOW_CONTAINER_PATH_PREFIX = '/projects';

    // Mixed forward and back slashes
    expect(PathUtils.translatePath('C:\\Users\\dev/myproject/src'))
      .toBe('/projects/myproject/src');
  });

  it('should normalize double slashes', () => {
    process.env.SPEC_WORKFLOW_HOST_PATH_PREFIX = '/Users/dev';
    process.env.SPEC_WORKFLOW_CONTAINER_PATH_PREFIX = '/projects';

    expect(PathUtils.translatePath('/Users/dev//myproject///src'))
      .toBe('/projects/myproject/src');
  });
});

describe('PathUtils env var caching', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    PathUtils.resetPathConfig();
    delete process.env.SPEC_WORKFLOW_HOST_PATH_PREFIX;
    delete process.env.SPEC_WORKFLOW_CONTAINER_PATH_PREFIX;
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    PathUtils.resetPathConfig();
  });

  it('should cache config and not re-read env vars', () => {
    process.env.SPEC_WORKFLOW_HOST_PATH_PREFIX = '/Users/dev';
    process.env.SPEC_WORKFLOW_CONTAINER_PATH_PREFIX = '/projects';

    // First call caches the config
    expect(PathUtils.translatePath('/Users/dev/app')).toBe('/projects/app');

    // Change env vars (simulating race condition)
    process.env.SPEC_WORKFLOW_CONTAINER_PATH_PREFIX = '/different';

    // Should still use cached value
    expect(PathUtils.translatePath('/Users/dev/app')).toBe('/projects/app');
  });

  it('should allow reset of cached config', () => {
    process.env.SPEC_WORKFLOW_HOST_PATH_PREFIX = '/Users/dev';
    process.env.SPEC_WORKFLOW_CONTAINER_PATH_PREFIX = '/projects';

    expect(PathUtils.translatePath('/Users/dev/app')).toBe('/projects/app');

    // Reset and change config
    PathUtils.resetPathConfig();
    process.env.SPEC_WORKFLOW_CONTAINER_PATH_PREFIX = '/different';

    // Now should use new value
    expect(PathUtils.translatePath('/Users/dev/app')).toBe('/different/app');
  });
});

describe('PathUtils path traversal security', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    PathUtils.resetPathConfig();
    delete process.env.SPEC_WORKFLOW_HOST_PATH_PREFIX;
    delete process.env.SPEC_WORKFLOW_CONTAINER_PATH_PREFIX;
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    PathUtils.resetPathConfig();
  });

  it('should reject container prefix containing directory traversal', () => {
    process.env.SPEC_WORKFLOW_HOST_PATH_PREFIX = '/Users/dev';
    process.env.SPEC_WORKFLOW_CONTAINER_PATH_PREFIX = '/projects/../etc';

    // Config is rejected, so path is returned unchanged
    expect(PathUtils.translatePath('/Users/dev/passwd')).toBe('/Users/dev/passwd');
  });

  it('should reject host prefix containing directory traversal', () => {
    process.env.SPEC_WORKFLOW_HOST_PATH_PREFIX = '/Users/../etc';
    process.env.SPEC_WORKFLOW_CONTAINER_PATH_PREFIX = '/projects';

    // Config is rejected, so path is returned unchanged
    expect(PathUtils.translatePath('/Users/../etc/passwd')).toBe('/Users/../etc/passwd');
  });

  it('should reject relative path prefixes', () => {
    process.env.SPEC_WORKFLOW_HOST_PATH_PREFIX = 'relative/path';
    process.env.SPEC_WORKFLOW_CONTAINER_PATH_PREFIX = '/projects';

    // Should return unchanged because prefix is not absolute
    const path = 'relative/path/myproject';
    expect(PathUtils.translatePath(path)).toBe(path);
  });
});

describe('PathUtils root prefix edge case', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    PathUtils.resetPathConfig();
    delete process.env.SPEC_WORKFLOW_HOST_PATH_PREFIX;
    delete process.env.SPEC_WORKFLOW_CONTAINER_PATH_PREFIX;
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    PathUtils.resetPathConfig();
  });

  it('should handle root prefix correctly', () => {
    process.env.SPEC_WORKFLOW_HOST_PATH_PREFIX = '/';
    process.env.SPEC_WORKFLOW_CONTAINER_PATH_PREFIX = '/projects';

    expect(PathUtils.translatePath('/app/src')).toBe('/projects/app/src');
  });
});
