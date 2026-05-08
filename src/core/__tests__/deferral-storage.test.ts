import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { DeferralStorage } from '../deferral-storage.js';

describe('DeferralStorage', () => {
  let tempDir: string;
  let storage: DeferralStorage;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(join(tmpdir(), 'deferral-test-'));
    // DeferralStorage expects projectPath and builds .spec-workflow/deferrals/ from it
    await fs.mkdir(join(tempDir, '.spec-workflow', 'deferrals'), { recursive: true });
    storage = new DeferralStorage(tempDir);
  });

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  const baseDeferral = {
    title: 'OAuth2 PKCE flow',
    originSpec: 'user-auth',
    originPhase: 'design' as const,
    revisitTrigger: 'when mobile app spec begins',
    tags: ['auth', 'mobile'],
    supersedes: null,
    body: {
      context: 'Mobile clients need PKCE but scope is too large for this spec.',
      decision: 'Defer PKCE implementation to mobile spec.',
      revisitCriteria: 'When mobile app spec begins',
    },
  };

  describe('create', () => {
    it('should create a deferral and return an ID', async () => {
      const id = await storage.create(baseDeferral);
      expect(id).toMatch(/^d-[0-9a-f]{8}$/);
    });

    it('should persist deferral to disk', async () => {
      const id = await storage.create(baseDeferral);
      const deferral = await storage.get(id);
      expect(deferral).not.toBeNull();
      expect(deferral!.title).toBe('OAuth2 PKCE flow');
      expect(deferral!.status).toBe('deferred');
      expect(deferral!.originSpec).toBe('user-auth');
      expect(deferral!.tags).toEqual(['auth', 'mobile']);
      expect(deferral!.body.context).toBe('Mobile clients need PKCE but scope is too large for this spec.');
    });

    it('should handle supersedes', async () => {
      const oldId = await storage.create(baseDeferral);
      const newId = await storage.create({
        ...baseDeferral,
        title: 'Updated PKCE approach',
      }, oldId);

      const oldDeferral = await storage.get(oldId);
      expect(oldDeferral!.status).toBe('superseded');
      expect(oldDeferral!.supersededBy).toBe(newId);

      const newDeferral = await storage.get(newId);
      expect(newDeferral!.supersedes).toBe(oldId);
      expect(newDeferral!.status).toBe('deferred');
    });

    it('should reject superseding a non-deferred deferral', async () => {
      const id = await storage.create(baseDeferral);
      await storage.resolve(id, 'done');

      await expect(storage.create({
        ...baseDeferral,
        title: 'New approach',
      }, id)).rejects.toThrow('already resolved');
    });
  });

  describe('get', () => {
    it('should return null for non-existent ID', async () => {
      const result = await storage.get('d-nonexist');
      expect(result).toBeNull();
    });
  });

  describe('list', () => {
    it('should return empty array when no deferrals exist', async () => {
      const result = await storage.list();
      expect(result).toEqual([]);
    });

    it('should return all deferrals', async () => {
      await storage.create(baseDeferral);
      await storage.create({ ...baseDeferral, title: 'Second' });
      const result = await storage.list();
      expect(result).toHaveLength(2);
    });

    it('should filter by status', async () => {
      const id = await storage.create(baseDeferral);
      await storage.create({ ...baseDeferral, title: 'Second' });
      await storage.resolve(id, 'done');

      const deferred = await storage.list({ status: 'deferred' });
      expect(deferred).toHaveLength(1);
      expect(deferred[0].title).toBe('Second');

      const resolved = await storage.list({ status: 'resolved' });
      expect(resolved).toHaveLength(1);
      expect(resolved[0].title).toBe('OAuth2 PKCE flow');
    });

    it('should filter by originSpec', async () => {
      await storage.create(baseDeferral);
      await storage.create({ ...baseDeferral, title: 'Other', originSpec: 'other-spec' });

      const result = await storage.list({ originSpec: 'user-auth' });
      expect(result).toHaveLength(1);
      expect(result[0].originSpec).toBe('user-auth');
    });

    it('should filter by tag', async () => {
      await storage.create(baseDeferral);
      await storage.create({ ...baseDeferral, title: 'No tags', tags: [] });

      const result = await storage.list({ tag: 'auth' });
      expect(result).toHaveLength(1);
      expect(result[0].tags).toContain('auth');
    });
  });

  describe('resolve', () => {
    it('should mark deferral as resolved', async () => {
      const id = await storage.create(baseDeferral);
      await storage.resolve(id, 'Implemented in mobile spec', 'mobile-app');

      const deferral = await storage.get(id);
      expect(deferral!.status).toBe('resolved');
      expect(deferral!.resolution).toBe('Implemented in mobile spec');
      expect(deferral!.resolvedInSpec).toBe('mobile-app');
      expect(deferral!.resolvedAt).toBeTruthy();
    });

    it('should reject resolving non-deferred deferral', async () => {
      const id = await storage.create(baseDeferral);
      await storage.resolve(id, 'done');
      await expect(storage.resolve(id, 'again')).rejects.toThrow('already resolved');
    });

    it('should reject resolving non-existent deferral', async () => {
      await expect(storage.resolve('d-nonexist', 'done')).rejects.toThrow('not found');
    });
  });

  describe('update', () => {
    it('should update mutable fields', async () => {
      const id = await storage.create(baseDeferral);
      await storage.update(id, {
        title: 'Updated title',
        tags: ['new-tag'],
        context: 'Updated context',
      });

      const deferral = await storage.get(id);
      expect(deferral!.title).toBe('Updated title');
      expect(deferral!.tags).toEqual(['new-tag']);
      expect(deferral!.body.context).toBe('Updated context');
      expect(deferral!.status).toBe('deferred'); // status unchanged
    });

    it('should reject updating non-existent deferral', async () => {
      await expect(storage.update('d-nonexist', { title: 'x' })).rejects.toThrow('not found');
    });
  });

  describe('delete', () => {
    it('should delete a deferral', async () => {
      const id = await storage.create(baseDeferral);
      await storage.delete(id);
      const result = await storage.get(id);
      expect(result).toBeNull();
    });

    it('should reject deleting non-existent deferral', async () => {
      await expect(storage.delete('d-nonexist')).rejects.toThrow('not found');
    });

    it('should reject deleting a deferral referenced by another', async () => {
      const oldId = await storage.create(baseDeferral);
      await storage.create({ ...baseDeferral, title: 'New' }, oldId);

      await expect(storage.delete(oldId)).rejects.toThrow('references');
    });
  });

  describe('roundtrip with special characters', () => {
    it('should handle quotes in title and body', async () => {
      const id = await storage.create({
        ...baseDeferral,
        title: 'Decision about "important" thing',
        body: {
          context: 'Contains "quotes" and special chars',
          decision: 'We decided to defer "this"',
          revisitCriteria: 'When "ready"',
        },
      });

      const deferral = await storage.get(id);
      expect(deferral!.title).toBe('Decision about "important" thing');
      expect(deferral!.body.context).toBe('Contains "quotes" and special chars');
    });
  });
});
