import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { ApprovalStorage } from '../approval-storage.js';

describe('ApprovalStorage path resolution', () => {
  let tempDir: string;
  let workflowRootPath: string;
  let workspacePath: string;
  let storage: ApprovalStorage;

  beforeEach(async () => {
    tempDir = join(tmpdir(), `spec-workflow-approvals-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`);
    workflowRootPath = join(tempDir, 'repo-main');
    workspacePath = join(tempDir, 'repo-feature-worktree');

    await fs.mkdir(workflowRootPath, { recursive: true });
    await fs.mkdir(workspacePath, { recursive: true });

    storage = new ApprovalStorage(workflowRootPath, {
      originalPath: workflowRootPath,
      fileResolutionPath: workspacePath
    });
  });

  afterEach(async () => {
    await storage.stop();
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  it('prefers workspace file for snapshots when both workspace and workflow files exist', async () => {
    const relativePath = 'src/feature.ts';
    const workspaceFile = join(workspacePath, relativePath);
    const workflowFile = join(workflowRootPath, relativePath);

    await fs.mkdir(join(workspacePath, 'src'), { recursive: true });
    await fs.mkdir(join(workflowRootPath, 'src'), { recursive: true });
    await fs.writeFile(workspaceFile, 'workspace-version', 'utf-8');
    await fs.writeFile(workflowFile, 'workflow-version', 'utf-8');

    const approvalId = await storage.createApproval(
      'Review feature',
      relativePath,
      'spec',
      'test-spec'
    );

    const snapshots = await storage.getSnapshots(approvalId);
    expect(snapshots).toHaveLength(1);
    expect(snapshots[0].content).toBe('workspace-version');
  });

  it('falls back to workflow root when file only exists there', async () => {
    const relativePath = '.spec-workflow/specs/test-spec/requirements.md';
    const workflowFile = join(workflowRootPath, relativePath);

    await fs.mkdir(join(workflowRootPath, '.spec-workflow', 'specs', 'test-spec'), { recursive: true });
    await fs.writeFile(workflowFile, '# Requirements from shared root', 'utf-8');

    const approvalId = await storage.createApproval(
      'Review requirements',
      relativePath,
      'spec',
      'test-spec'
    );

    const content = await storage.getCurrentFileContent(approvalId);
    expect(content).toBe('# Requirements from shared root');
  });

  it('writes revisions to workspace file when it exists there', async () => {
    const relativePath = 'src/revision-target.ts';
    const workspaceFile = join(workspacePath, relativePath);
    const workflowFile = join(workflowRootPath, relativePath);

    await fs.mkdir(join(workspacePath, 'src'), { recursive: true });
    await fs.mkdir(join(workflowRootPath, 'src'), { recursive: true });
    await fs.writeFile(workspaceFile, 'workspace-original', 'utf-8');
    await fs.writeFile(workflowFile, 'workflow-original', 'utf-8');

    const approvalId = await storage.createApproval(
      'Review revision target',
      relativePath,
      'spec',
      'test-spec'
    );

    await storage.createRevision(approvalId, 'workspace-updated', 'needs update');

    const workspaceContent = await fs.readFile(workspaceFile, 'utf-8');
    const workflowContent = await fs.readFile(workflowFile, 'utf-8');
    expect(workspaceContent).toBe('workspace-updated');
    expect(workflowContent).toBe('workflow-original');
  });
});
