import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { promises as fs } from 'fs';
import net from 'net';
import { join } from 'path';
import { tmpdir } from 'os';
import { MultiProjectDashboardServer } from '../multi-server.js';
import { ApprovalStorage } from '../approval-storage.js';
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

  describe('PUT then GET /adversarial/settings with cli/cliArgs', () => {
    it('round-trips cli and cliArgs fields', async () => {
      const settings = {
        customPreamble: '',
        requiredPhases: { requirements: false, design: false, tasks: false },
        reviewMethodology: '',
        responseMethodology: '',
        cli: 'custom-cli',
        cliArgs: ['--arg1', '--arg2'],
      };

      const putRes = await realFetch(url('settings'), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      expect(putRes.status).toBe(200);

      const getRes = await realFetch(url('settings'));
      const body = await getRes.json() as any;

      expect(body.cli).toBe('custom-cli');
      expect(body.cliArgs).toEqual(['--arg1', '--arg2']);
    });
  });

  describe('POST /approvals/:id/adversarial-review', () => {
    function approvalUrl(approvalId: string, action: string): string {
      return `http://127.0.0.1:${port}/api/projects/${projectId}/approvals/${approvalId}/${action}`;
    }

    it('returns 404 for non-existent approval', async () => {
      const res = await realFetch(approvalUrl('nonexistent-id', 'adversarial-review'), {
        method: 'POST',
      });
      expect(res.status).toBe(404);
    });

    it('returns 400 for non-spec category', async () => {
      const approvalStorage = new ApprovalStorage(workflowRootPath, {
        originalPath: workflowRootPath,
        fileResolutionPath: workspacePath,
      });
      const approvalId = await approvalStorage.createApproval(
        'Review steering',
        'product.md',
        'steering',
        'product',
      );

      const res = await realFetch(approvalUrl(approvalId, 'adversarial-review'), {
        method: 'POST',
      });
      expect(res.status).toBe(400);
      const body = await res.json() as any;
      expect(body.error).toContain('spec approvals');
    });

    it('succeeds and returns jobId for valid spec approval', async () => {
      // Create spec file under workspacePath (originalProjectPath) where adversarialReviewHandler looks
      const specDir = join(workspacePath, '.spec-workflow', 'specs', 'test-feat');
      await fs.mkdir(specDir, { recursive: true });
      await fs.writeFile(join(specDir, 'requirements.md'), '# Requirements\nContent here.', 'utf-8');

      const approvalStorage = new ApprovalStorage(workflowRootPath, {
        originalPath: workflowRootPath,
        fileResolutionPath: workspacePath,
      });
      const approvalId = await approvalStorage.createApproval(
        'Review requirements',
        'requirements.md',
        'spec',
        'test-feat',
      );

      const res = await realFetch(approvalUrl(approvalId, 'adversarial-review'), {
        method: 'POST',
      });
      expect(res.status).toBe(200);
      const body = await res.json() as any;
      expect(body.jobId).toBeTruthy();
      expect(body.success).toBe(true);
    });

    it('updates approval to needs-revision with annotations', async () => {
      const specDir = join(workspacePath, '.spec-workflow', 'specs', 'test-feat2');
      await fs.mkdir(specDir, { recursive: true });
      await fs.writeFile(join(specDir, 'design.md'), '# Design\nContent.', 'utf-8');

      const approvalStorage = new ApprovalStorage(workflowRootPath, {
        originalPath: workflowRootPath,
        fileResolutionPath: workspacePath,
      });
      const approvalId = await approvalStorage.createApproval(
        'Review design',
        'design.md',
        'spec',
        'test-feat2',
      );

      await realFetch(approvalUrl(approvalId, 'adversarial-review'), {
        method: 'POST',
      });

      // Verify approval was updated
      const approval = await approvalStorage.getApproval(approvalId);
      expect(approval!.status).toBe('needs-revision');
      expect(approval!.annotations).toBeTruthy();
      const ann = JSON.parse(approval!.annotations!);
      expect(ann.trigger).toBe('adversarial-review');
      expect(ann.specName).toBe('test-feat2');
      expect(ann.phase).toBe('design');
      expect(ann.jobId).toBeTruthy();
    });
  });

  describe('POST /approvals/:id/adversarial-retry', () => {
    function approvalUrl(approvalId: string, action: string): string {
      return `http://127.0.0.1:${port}/api/projects/${projectId}/approvals/${approvalId}/${action}`;
    }

    it('returns 400 for approval without adversarial annotations', async () => {
      const approvalStorage = new ApprovalStorage(workflowRootPath, {
        originalPath: workflowRootPath,
        fileResolutionPath: workspacePath,
      });
      const approvalId = await approvalStorage.createApproval(
        'Review reqs',
        'requirements.md',
        'spec',
        'plain-spec',
      );

      const res = await realFetch(approvalUrl(approvalId, 'adversarial-retry'), {
        method: 'POST',
      });
      expect(res.status).toBe(400);
      const body = await res.json() as any;
      expect(body.error).toContain('does not have an adversarial review');
    });

    it('succeeds for valid adversarial approval', async () => {
      // Create spec + initial adversarial review
      const specDir = join(workspacePath, '.spec-workflow', 'specs', 'retry-feat');
      await fs.mkdir(specDir, { recursive: true });
      await fs.writeFile(join(specDir, 'requirements.md'), '# Requirements\nContent.', 'utf-8');

      const approvalStorage = new ApprovalStorage(workflowRootPath, {
        originalPath: workflowRootPath,
        fileResolutionPath: workspacePath,
      });
      const approvalId = await approvalStorage.createApproval(
        'Review reqs',
        'requirements.md',
        'spec',
        'retry-feat',
      );

      // Trigger initial review to set up annotations
      const reviewRes = await realFetch(approvalUrl(approvalId, 'adversarial-review'), {
        method: 'POST',
      });
      expect(reviewRes.status).toBe(200);
      const reviewBody = await reviewRes.json() as any;

      // Wait for the background job to fail (no real CLI available in test env)
      // then cancel it to ensure no duplicate is running
      const cancelUrl = `http://127.0.0.1:${port}/api/projects/${projectId}/adversarial/jobs/${reviewBody.jobId}/cancel`;
      await realFetch(cancelUrl, { method: 'POST' });

      // Brief delay to let the job state settle
      await new Promise(resolve => setTimeout(resolve, 100));

      // Now retry
      const retryRes = await realFetch(approvalUrl(approvalId, 'adversarial-retry'), {
        method: 'POST',
      });
      expect(retryRes.status).toBe(200);
      const body = await retryRes.json() as any;
      expect(body.jobId).toBeTruthy();
    });
  });
});
