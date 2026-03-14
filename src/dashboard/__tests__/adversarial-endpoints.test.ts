import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { promises as fs } from 'fs';
import net from 'net';
import { join } from 'path';
import { tmpdir } from 'os';
import { MultiProjectDashboardServer } from '../multi-server.js';
import { ProjectRegistry, generateProjectId } from '../../core/project-registry.js';
import { SPEC_WORKFLOW_HOME_ENV } from '../../core/global-dir.js';

async function getFreePort(): Promise<number> {
  return await new Promise((resolvePort, reject) => {
    const server = net.createServer();
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      if (!address || typeof address === 'string') {
        server.close();
        reject(new Error('Failed to get free port'));
        return;
      }
      const port = address.port;
      server.close(() => resolvePort(port));
    });
    server.on('error', reject);
  });
}

describe('Adversarial dashboard endpoints', () => {
  let tempDir: string;
  let workspacePath: string;
  let workflowRootPath: string;
  let server: MultiProjectDashboardServer | null = null;
  let projectId: string;
  let realFetch: typeof fetch;
  let port: number;

  const originalEnv = { ...process.env };

  beforeEach(async () => {
    tempDir = join(tmpdir(), `specwf-adv-endpoints-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`);
    workspacePath = join(tempDir, 'workspace');
    workflowRootPath = join(tempDir, 'project');
    await fs.mkdir(workspacePath, { recursive: true });
    await fs.mkdir(workflowRootPath, { recursive: true });

    process.env[SPEC_WORKFLOW_HOME_ENV] = join(tempDir, '.global-state');
    projectId = generateProjectId(workspacePath);
    realFetch = globalThis.fetch;

    const registry = new ProjectRegistry();
    await registry.registerProject(workspacePath, process.pid, { workflowRootPath });

    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: false,
        json: async () => ({})
      }))
    );

    port = await getFreePort();
    server = new MultiProjectDashboardServer({ autoOpen: false, port });
    await server.start();
  });

  afterEach(async () => {
    if (server) {
      await server.stop();
      server = null;
    }
    vi.unstubAllGlobals();
    process.env = { ...originalEnv };
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  function url(path: string): string {
    return `http://127.0.0.1:${port}/api/projects/${projectId}/adversarial/${path}`;
  }

  describe('GET /adversarial/settings', () => {
    it('returns defaults when no settings file exists', async () => {
      const res = await realFetch(url('settings'));
      expect(res.status).toBe(200);

      const body = await res.json() as any;
      expect(body.customPreamble).toBe('');
      expect(body.reviewMethodology).toBe('');
      expect(body.responseMethodology).toBe('');
      expect(body.requiredPhases).toEqual({ requirements: false, design: false, tasks: false });
      expect(body.defaultReviewMethodology).toContain('Adversarial Review Methodology');
      expect(body.defaultResponseMethodology).toContain('Responding to an Adversarial Review');
    });
  });

  describe('PUT then GET /adversarial/settings', () => {
    it('round-trips saved settings', async () => {
      const settings = {
        customPreamble: 'Focus on security',
        requiredPhases: { requirements: true, design: false, tasks: false },
        reviewMethodology: 'Custom review',
        responseMethodology: '',
      };

      const putRes = await realFetch(url('settings'), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      expect(putRes.status).toBe(200);

      const getRes = await realFetch(url('settings'));
      const body = await getRes.json() as any;

      expect(body.customPreamble).toBe('Focus on security');
      expect(body.requiredPhases.requirements).toBe(true);
      expect(body.requiredPhases.design).toBe(false);
      expect(body.reviewMethodology).toBe('Custom review');
      expect(body.responseMethodology).toBe('');
      // Default methodologies are always present
      expect(body.defaultReviewMethodology).toBeTruthy();
      expect(body.defaultResponseMethodology).toBeTruthy();
    });
  });

  describe('GET /adversarial/reviews', () => {
    it('returns empty specs array when no reviews exist', async () => {
      const res = await realFetch(url('reviews'));
      expect(res.status).toBe(200);

      const body = await res.json() as any;
      expect(body.specs).toEqual([]);
    });

    it('discovers review files across specs', async () => {
      // Create a spec with a review file
      const specDir = join(workflowRootPath, '.spec-workflow', 'specs', 'my-feature');
      const reviewsDir = join(specDir, 'reviews');
      await fs.mkdir(reviewsDir, { recursive: true });
      await fs.writeFile(join(specDir, 'requirements.md'), '# Requirements\n', 'utf-8');
      await fs.writeFile(join(reviewsDir, 'adversarial-analysis-requirements.md'), '# Analysis\n', 'utf-8');

      const res = await realFetch(url('reviews'));
      expect(res.status).toBe(200);

      const body = await res.json() as any;
      expect(body.specs.length).toBe(1);
      expect(body.specs[0].specName).toBe('my-feature');
      expect(body.specs[0].phases.length).toBe(1);
      expect(body.specs[0].phases[0].phase).toBe('requirements');
      expect(body.specs[0].phases[0].versions.length).toBe(1);
      expect(body.specs[0].phases[0].versions[0].version).toBe(1);
    });
  });

  describe('GET /adversarial/reviews/:specName/:phase/:version', () => {
    it('reads review content', async () => {
      const reviewsDir = join(workflowRootPath, '.spec-workflow', 'specs', 'my-feature', 'reviews');
      await fs.mkdir(reviewsDir, { recursive: true });
      await fs.writeFile(join(reviewsDir, 'adversarial-analysis-design.md'), '# Design Analysis\nSome findings.', 'utf-8');

      const res = await realFetch(url('reviews/my-feature/design/1'));
      expect(res.status).toBe(200);

      const body = await res.json() as any;
      expect(body.content).toBe('# Design Analysis\nSome findings.');
      expect(body.lastModified).toBeTruthy();
    });

    it('reads versioned review content', async () => {
      const reviewsDir = join(workflowRootPath, '.spec-workflow', 'specs', 'my-feature', 'reviews');
      await fs.mkdir(reviewsDir, { recursive: true });
      await fs.writeFile(join(reviewsDir, 'adversarial-analysis-requirements-r2.md'), 'v2 content', 'utf-8');

      const res = await realFetch(url('reviews/my-feature/requirements/2'));
      expect(res.status).toBe(200);

      const body = await res.json() as any;
      expect(body.content).toBe('v2 content');
    });

    it('returns 404 for missing review', async () => {
      const res = await realFetch(url('reviews/nonexistent/requirements/1'));
      expect(res.status).toBe(404);
    });

    it('returns 400 for invalid phase', async () => {
      const res = await realFetch(url('reviews/my-feature/invalid/1'));
      expect(res.status).toBe(400);
    });
  });
});
