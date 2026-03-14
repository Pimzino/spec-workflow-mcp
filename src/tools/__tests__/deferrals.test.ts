import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { deferralsHandler } from '../deferrals.js';
import { ToolContext } from '../../types.js';

describe('deferrals tool handler', () => {
  let tempDir: string;
  let context: ToolContext;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(join(tmpdir(), 'deferrals-tool-test-'));
    await fs.mkdir(join(tempDir, '.spec-workflow', 'deferrals'), { recursive: true });
    context = { projectPath: tempDir };
  });

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  const addArgs = {
    action: 'add',
    title: 'Test deferral',
    context: 'Test context',
    decision: 'Test decision',
    revisitTrigger: 'Later',
  };

  describe('add action', () => {
    it('should create a deferral', async () => {
      const result = await deferralsHandler(addArgs, context);
      expect(result.success).toBe(true);
      expect(result.data.id).toMatch(/^d-[0-9a-f]{8}$/);
    });

    it('should fail with missing required fields', async () => {
      const result = await deferralsHandler({ action: 'add', title: 'Only title' }, context);
      expect(result.success).toBe(false);
      expect(result.message).toContain('Missing required fields');
    });
  });

  describe('list action', () => {
    it('should list deferrals', async () => {
      await deferralsHandler(addArgs, context);
      await deferralsHandler({ ...addArgs, title: 'Second' }, context);

      const result = await deferralsHandler({ action: 'list' }, context);
      expect(result.success).toBe(true);
      expect(result.data.total).toBe(2);
    });

    it('should filter by status', async () => {
      const addResult = await deferralsHandler(addArgs, context);
      await deferralsHandler({
        action: 'resolve',
        id: addResult.data.id,
        resolution: 'Done',
      }, context);

      const result = await deferralsHandler({ action: 'list', status: 'deferred' }, context);
      expect(result.data.total).toBe(0);
    });
  });

  describe('get action', () => {
    it('should get deferral details', async () => {
      const addResult = await deferralsHandler(addArgs, context);
      const result = await deferralsHandler({ action: 'get', id: addResult.data.id }, context);
      expect(result.success).toBe(true);
      expect(result.data.title).toBe('Test deferral');
    });

    it('should fail for missing id', async () => {
      const result = await deferralsHandler({ action: 'get' }, context);
      expect(result.success).toBe(false);
    });

    it('should fail for non-existent id', async () => {
      const result = await deferralsHandler({ action: 'get', id: 'd-nonexist' }, context);
      expect(result.success).toBe(false);
    });
  });

  describe('resolve action', () => {
    it('should resolve a deferral', async () => {
      const addResult = await deferralsHandler(addArgs, context);
      const result = await deferralsHandler({
        action: 'resolve',
        id: addResult.data.id,
        resolution: 'Implemented',
        resolvedInSpec: 'mobile-app',
      }, context);
      expect(result.success).toBe(true);
    });

    it('should fail with missing fields', async () => {
      const result = await deferralsHandler({ action: 'resolve', id: 'd-123' }, context);
      expect(result.success).toBe(false);
      expect(result.message).toContain('Missing required fields');
    });
  });

  describe('update action', () => {
    it('should update a deferral', async () => {
      const addResult = await deferralsHandler(addArgs, context);
      const result = await deferralsHandler({
        action: 'update',
        id: addResult.data.id,
        title: 'Updated title',
        tags: ['new-tag'],
      }, context);
      expect(result.success).toBe(true);
      expect(result.data.updatedFields).toContain('title');
    });

    it('should fail with no fields to update', async () => {
      const addResult = await deferralsHandler(addArgs, context);
      const result = await deferralsHandler({
        action: 'update',
        id: addResult.data.id,
      }, context);
      expect(result.success).toBe(false);
      expect(result.message).toContain('No fields to update');
    });
  });

  describe('delete action', () => {
    it('should delete a deferral', async () => {
      const addResult = await deferralsHandler(addArgs, context);
      const result = await deferralsHandler({ action: 'delete', id: addResult.data.id }, context);
      expect(result.success).toBe(true);
    });

    it('should fail for missing id', async () => {
      const result = await deferralsHandler({ action: 'delete' }, context);
      expect(result.success).toBe(false);
    });
  });

  describe('supersede flow', () => {
    it('should supersede and block delete of referenced deferral', async () => {
      const addResult = await deferralsHandler(addArgs, context);
      const oldId = addResult.data.id;

      const newResult = await deferralsHandler({
        ...addArgs,
        title: 'Replacement',
        supersedes: oldId,
      }, context);
      expect(newResult.success).toBe(true);

      // Old one should be superseded
      const getOld = await deferralsHandler({ action: 'get', id: oldId }, context);
      expect(getOld.data.status).toBe('superseded');

      // Delete of old should fail (referenced by new)
      const deleteResult = await deferralsHandler({ action: 'delete', id: oldId }, context);
      expect(deleteResult.success).toBe(false);
    });
  });

  describe('error handling', () => {
    it('should fail with unknown action', async () => {
      const result = await deferralsHandler({ action: 'unknown' }, context);
      expect(result.success).toBe(false);
      expect(result.message).toContain('Unknown action');
    });

    it('should fail without project path', async () => {
      const result = await deferralsHandler({ action: 'list' }, { projectPath: '' });
      expect(result.success).toBe(false);
    });
  });
});
