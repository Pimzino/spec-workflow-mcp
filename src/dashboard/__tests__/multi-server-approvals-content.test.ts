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

describe('MultiProjectDashboardServer approvals content resolution', () => {
  let tempDir: string;
  let workspacePath: string;
  let workflowRootPath: string;
  let server: MultiProjectDashboardServer | null = null;
  let projectId: string;
  let realFetch: typeof fetch;

  const originalEnv = { ...process.env };

  beforeEach(async () => {
    tempDir = join(tmpdir(), `specwf-multi-server-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`);
    workspacePath = join(tempDir, 'worktrees', 'wt-a');
    workflowRootPath = join(tempDir, 'repo-main');
    await fs.mkdir(workspacePath, { recursive: true });
    await fs.mkdir(workflowRootPath, { recursive: true });

    process.env[SPEC_WORKFLOW_HOME_ENV] = join(tempDir, '.global-state');
    projectId = generateProjectId(workspacePath);
    realFetch = globalThis.fetch;

    const registry = new ProjectRegistry();
    await registry.registerProject(workspacePath, process.pid, { workflowRootPath });

    // Prevent network dependency in package version lookup.
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: false,
        json: async () => ({})
      }))
    );
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

  it('prioritizes workspace path before workflow root for relative approval filePath', async () => {
    const relativePath = 'src/service.ts';
    await fs.mkdir(join(workspacePath, 'src'), { recursive: true });
    await fs.mkdir(join(workflowRootPath, 'src'), { recursive: true });
    await fs.writeFile(join(workspacePath, relativePath), 'workspace-content', 'utf-8');
    await fs.writeFile(join(workflowRootPath, relativePath), 'workflow-content', 'utf-8');

    const approvalStorage = new ApprovalStorage(workflowRootPath, {
      originalPath: workflowRootPath,
      fileResolutionPath: workspacePath
    });
    const approvalId = await approvalStorage.createApproval('Review service', relativePath, 'spec', 'test-spec');

    const port = await getFreePort();
    server = new MultiProjectDashboardServer({ autoOpen: false, port });
    await server.start();

    const response = await realFetch(`http://127.0.0.1:${port}/api/projects/${projectId}/approvals/${approvalId}/content`);
    const body = await response.json() as { content: string; filePath: string };

    expect(response.status).toBe(200);
    expect(body.content).toBe('workspace-content');
    expect(body.filePath).toContain(join('worktrees', 'wt-a', 'src', 'service.ts'));
  });

  it('falls back to workflow root when relative file only exists there', async () => {
    const relativePath = '.spec-workflow/specs/test-spec/requirements.md';
    await fs.mkdir(join(workflowRootPath, '.spec-workflow', 'specs', 'test-spec'), { recursive: true });
    await fs.writeFile(join(workflowRootPath, relativePath), '# Shared requirements', 'utf-8');

    const approvalStorage = new ApprovalStorage(workflowRootPath, {
      originalPath: workflowRootPath,
      fileResolutionPath: workspacePath
    });
    const approvalId = await approvalStorage.createApproval('Review requirements', relativePath, 'spec', 'test-spec');

    const port = await getFreePort();
    server = new MultiProjectDashboardServer({ autoOpen: false, port });
    await server.start();

    const response = await realFetch(`http://127.0.0.1:${port}/api/projects/${projectId}/approvals/${approvalId}/content`);
    const body = await response.json() as { content: string; filePath: string };

    expect(response.status).toBe(200);
    expect(body.content).toBe('# Shared requirements');
    expect(body.filePath).toContain(join('repo-main', '.spec-workflow', 'specs', 'test-spec', 'requirements.md'));
  });

  it('uses absolute approval filePath as-is', async () => {
    const absolutePath = join(tempDir, 'absolute-target.md');
    await fs.writeFile(absolutePath, 'absolute-file-content', 'utf-8');

    const approvalStorage = new ApprovalStorage(workflowRootPath, {
      originalPath: workflowRootPath,
      fileResolutionPath: workspacePath
    });
    const approvalId = await approvalStorage.createApproval('Review absolute path', absolutePath, 'spec', 'test-spec');

    const port = await getFreePort();
    server = new MultiProjectDashboardServer({ autoOpen: false, port });
    await server.start();

    const response = await realFetch(`http://127.0.0.1:${port}/api/projects/${projectId}/approvals/${approvalId}/content`);
    const body = await response.json() as { content: string; filePath: string };

    expect(response.status).toBe(200);
    expect(body.content).toBe('absolute-file-content');
    expect(body.filePath).toBe(absolutePath);
  });
});
