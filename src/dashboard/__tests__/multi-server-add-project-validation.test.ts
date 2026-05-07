import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { promises as fs } from 'fs';
import net from 'net';
import { join } from 'path';
import { tmpdir } from 'os';
import { MultiProjectDashboardServer } from '../multi-server.js';
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

/**
 * Regression coverage for CWE-22 in POST /api/projects/add.
 *
 * Before the fix, the endpoint accepted any string path and registered it as a
 * dashboard project, which then exposed every file under that directory through
 * the spec/steering read endpoints. The fix requires the path to point to an
 * existing directory that already contains a .spec-workflow folder.
 */
describe('POST /api/projects/add path traversal protection', () => {
  let tempDir: string;
  let server: MultiProjectDashboardServer | null = null;
  let port: number;
  let realFetch: typeof fetch;
  const originalEnv = { ...process.env };

  beforeEach(async () => {
    tempDir = join(tmpdir(), `specwf-add-project-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`);
    await fs.mkdir(tempDir, { recursive: true });

    process.env[SPEC_WORKFLOW_HOME_ENV] = join(tempDir, '.global-state');
    realFetch = globalThis.fetch;

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

  async function postAdd(projectPath: unknown): Promise<{ status: number; body: any }> {
    const response = await realFetch(`http://127.0.0.1:${port}/api/projects/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectPath })
    });
    const body = await response.json().catch(() => ({}));
    return { status: response.status, body };
  }

  it('rejects a directory that is not a spec-workflow project (e.g. /etc, $HOME)', async () => {
    const arbitraryDir = join(tempDir, 'not-a-spec-workflow-project');
    await fs.mkdir(arbitraryDir, { recursive: true });
    await fs.writeFile(join(arbitraryDir, 'secret.txt'), 'sensitive', 'utf-8');

    const { status, body } = await postAdd(arbitraryDir);

    expect(status).toBe(400);
    expect(String(body.error || '')).toMatch(/\.spec-workflow/);
  });

  it('rejects path traversal sequences in projectPath', async () => {
    const { status } = await postAdd('../../etc');
    expect(status).toBe(400);
  });

  it('rejects non-existent paths', async () => {
    const { status } = await postAdd(join(tempDir, 'does-not-exist'));
    expect(status).toBe(400);
  });

  it('accepts a directory that contains a .spec-workflow folder', async () => {
    const validProject = join(tempDir, 'valid-project');
    await fs.mkdir(join(validProject, '.spec-workflow'), { recursive: true });

    const { status, body } = await postAdd(validProject);

    expect(status).toBe(200);
    expect(body.success).toBe(true);
    expect(typeof body.projectId).toBe('string');
  });
});
