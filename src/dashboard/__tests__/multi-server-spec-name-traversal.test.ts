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

describe('MultiProjectDashboardServer spec name path traversal (CWE-22)', () => {
  let tempDir: string;
  let workspacePath: string;
  let server: MultiProjectDashboardServer | null = null;
  let projectId: string;
  let realFetch: typeof fetch;

  const originalEnv = { ...process.env };

  beforeEach(async () => {
    tempDir = join(tmpdir(), `specwf-traversal-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`);
    workspacePath = join(tempDir, 'workspace');
    await fs.mkdir(workspacePath, { recursive: true });

    process.env[SPEC_WORKFLOW_HOME_ENV] = join(tempDir, '.global-state');
    projectId = generateProjectId(workspacePath);
    realFetch = globalThis.fetch;

    const registry = new ProjectRegistry();
    await registry.registerProject(workspacePath, process.pid);

    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ ok: false, json: async () => ({}) }))
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

  it('rejects spec name containing path traversal in GET /specs/:name/all', async () => {
    // Plant a sensitive file outside the .spec-workflow/specs directory.
    const secretsDir = join(tempDir, 'secrets');
    await fs.mkdir(secretsDir, { recursive: true });
    await fs.writeFile(join(secretsDir, 'requirements.md'), 'TOP-SECRET', 'utf-8');

    const port = await getFreePort();
    server = new MultiProjectDashboardServer({ autoOpen: false, port });
    await server.start();

    // Path that, prior to the fix, would resolve to the secrets/ directory.
    const traversal = encodeURIComponent('../../../secrets');
    const response = await realFetch(
      `http://127.0.0.1:${port}/api/projects/${projectId}/specs/${traversal}/all`
    );

    expect(response.status).toBe(400);
    const body = await response.json() as { error?: string; requirements?: unknown };
    // Must NOT have leaked the planted secret.
    expect(JSON.stringify(body)).not.toContain('TOP-SECRET');
  });

  it('rejects spec name with backslash in PUT /specs/:name/:document', async () => {
    const port = await getFreePort();
    server = new MultiProjectDashboardServer({ autoOpen: false, port });
    await server.start();

    const evil = encodeURIComponent('..\\..\\evil');
    const response = await realFetch(
      `http://127.0.0.1:${port}/api/projects/${projectId}/specs/${evil}/requirements`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: 'pwned' })
      }
    );
    expect(response.status).toBe(400);
  });

  it('accepts a valid spec name', async () => {
    const port = await getFreePort();
    server = new MultiProjectDashboardServer({ autoOpen: false, port });
    await server.start();

    const response = await realFetch(
      `http://127.0.0.1:${port}/api/projects/${projectId}/specs/my-spec/all`
    );
    // No spec exists, but the validator should not reject the name itself;
    // route returns 200 with all-null documents, or 404 project-not-found.
    expect([200, 404]).toContain(response.status);
  });

  it('rejects regex injection in changelog version param', async () => {
    const port = await getFreePort();
    server = new MultiProjectDashboardServer({ autoOpen: false, port });
    await server.start();

    const evil = encodeURIComponent('.*');
    const response = await realFetch(
      `http://127.0.0.1:${port}/api/changelog/${evil}`
    );
    expect(response.status).toBe(400);
  });
});
