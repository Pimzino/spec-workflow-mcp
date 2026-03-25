import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, mkdir, rm } from 'fs/promises';
import { join } from 'path';
import { homedir } from 'os';

/**
 * Tests for path traversal prevention in POST /api/projects/add endpoint (CWE-22).
 *
 * The endpoint accepts a user-controlled `projectPath` from the request body.
 * Without validation, an attacker could register arbitrary filesystem paths
 * (e.g., `/`, `/etc`, or any sensitive directory) as projects, then use
 * spec read/write APIs to access arbitrary files within that directory tree.
 *
 * The fix adds two layers of defence:
 * 1. validateProjectPath() — rejects system directories, traversal, non-directories
 * 2. .spec-workflow directory existence check — ensures the path is a real project
 */

import { validateProjectPath } from '../../core/path-utils.js';
import { access } from 'fs/promises';
import { constants } from 'fs';

/**
 * Checks that a path contains a .spec-workflow directory,
 * mirroring the validation added in multi-server.ts.
 */
async function hasSpecWorkflowDir(projectPath: string): Promise<boolean> {
  try {
    await access(join(projectPath, '.spec-workflow'), constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

describe('POST /api/projects/add — path validation (CWE-22)', () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await mkdtemp(join(homedir(), '.specwf-test-add-project-'));
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true });
  });

  describe('validateProjectPath rejects dangerous paths', () => {
    it('should reject system directories like /etc', async () => {
      await expect(validateProjectPath('/etc')).rejects.toThrow('system directory');
    });

    it('should reject system directories like /usr', async () => {
      await expect(validateProjectPath('/usr')).rejects.toThrow('system directory');
    });

    it('should reject empty string', async () => {
      await expect(validateProjectPath('')).rejects.toThrow();
    });

    it('should reject path traversal with ..', async () => {
      const nested = join(tempDir, 'a', 'b');
      await mkdir(nested, { recursive: true });
      const traversalPath = join(nested, '..', '..', '..', '..', 'etc');
      await expect(validateProjectPath(traversalPath)).rejects.toThrow();
    });
  });

  describe('.spec-workflow directory check', () => {
    it('should return false for a directory without .spec-workflow', async () => {
      const result = await hasSpecWorkflowDir(tempDir);
      expect(result).toBe(false);
    });

    it('should return true for a directory with .spec-workflow', async () => {
      await mkdir(join(tempDir, '.spec-workflow'), { recursive: true });
      const result = await hasSpecWorkflowDir(tempDir);
      expect(result).toBe(true);
    });

    it('should return false for root directory /', async () => {
      const result = await hasSpecWorkflowDir('/');
      expect(result).toBe(false);
    });
  });

  describe('combined validation prevents arbitrary path registration', () => {
    it('should reject registering / as a project (system dirs blocked or no .spec-workflow)', async () => {
      const hasWorkflow = await hasSpecWorkflowDir('/');
      expect(hasWorkflow).toBe(false);
    });

    it('should accept a valid project path with .spec-workflow', async () => {
      await mkdir(join(tempDir, '.spec-workflow'), { recursive: true });
      const validated = await validateProjectPath(tempDir);
      expect(validated).toBeTruthy();
      const hasWorkflow = await hasSpecWorkflowDir(validated);
      expect(hasWorkflow).toBe(true);
    });

    it('should reject a path that passes validateProjectPath but lacks .spec-workflow', async () => {
      // tempDir is a valid, accessible directory but has no .spec-workflow
      const validated = await validateProjectPath(tempDir);
      const hasWorkflow = await hasSpecWorkflowDir(validated);
      expect(hasWorkflow).toBe(false);
    });
  });
});
