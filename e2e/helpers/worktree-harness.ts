import { ChildProcess, spawn } from 'child_process';
import { mkdtemp, mkdir, realpath, rm, writeFile } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';

export interface RegisteredProject {
  projectId: string;
  projectName: string;
  projectPath: string;
  instances: Array<{ pid: number; registeredAt: string }>;
}

interface WorktreeHarnessOptions {
  serverRoot: string;
  dashboardApiBaseUrl: string;
  specWorkflowHome: string;
}

interface CommandResult {
  code: number;
  stdout: string;
  stderr: string;
}

const IS_WINDOWS = process.platform === 'win32';
const NPM_CMD = IS_WINDOWS ? 'npm.cmd' : 'npm';
const GIT_CMD = IS_WINDOWS ? 'git.exe' : 'git';

function buildApprovalPayload(params: {
  id: string;
  title: string;
  filePath: string;
  categoryName: string;
}) {
  return {
    id: params.id,
    title: params.title,
    filePath: params.filePath,
    type: 'document',
    status: 'pending',
    createdAt: new Date().toISOString(),
    category: 'spec',
    categoryName: params.categoryName
  };
}

async function runCommand(
  command: string,
  args: string[],
  cwd: string,
  env?: NodeJS.ProcessEnv
): Promise<CommandResult> {
  return await new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      env: env ?? process.env,
      stdio: ['ignore', 'pipe', 'pipe']
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) {
        resolve({ code: 0, stdout, stderr });
        return;
      }
      reject(new Error(`Command failed (${command} ${args.join(' ')}):\n${stderr || stdout}`));
    });
  });
}

async function killProcess(child: ChildProcess): Promise<void> {
  if (child.killed || child.exitCode !== null) {
    return;
  }

  child.kill('SIGTERM');
  await new Promise<void>((resolve) => {
    const timer = setTimeout(() => {
      if (child.exitCode === null) {
        child.kill('SIGKILL');
      }
      resolve();
    }, 5000);

    child.once('exit', () => {
      clearTimeout(timer);
      resolve();
    });
  });
}

export class WorktreeHarness {
  private readonly options: WorktreeHarnessOptions;
  private readonly mcpProcesses: ChildProcess[] = [];
  private readonly mcpLogs: string[] = [];
  private tempRoot = '';
  private repoRoot = '';
  private wtAPath = '';
  private wtBPath = '';

  constructor(options: WorktreeHarnessOptions) {
    this.options = options;
  }

  getWorktreePaths() {
    return {
      wtAPath: this.wtAPath,
      wtBPath: this.wtBPath
    };
  }

  getCapturedLogs() {
    return this.mcpLogs.join('\n');
  }

  async setup(): Promise<void> {
    this.tempRoot = await mkdtemp(join(tmpdir(), 'specwf-e2e-worktree-'));
    this.repoRoot = join(this.tempRoot, 'repo-main');
    this.wtAPath = join(this.tempRoot, 'wt-a');
    this.wtBPath = join(this.tempRoot, 'wt-b');

    await mkdir(this.repoRoot, { recursive: true });
    await runCommand(GIT_CMD, ['init'], this.repoRoot);
    await runCommand(GIT_CMD, ['config', 'user.email', 'e2e@example.com'], this.repoRoot);
    await runCommand(GIT_CMD, ['config', 'user.name', 'E2E'], this.repoRoot);

    await writeFile(join(this.repoRoot, 'README.md'), '# e2e worktree repo\n', 'utf-8');
    await runCommand(GIT_CMD, ['add', 'README.md'], this.repoRoot);
    await runCommand(GIT_CMD, ['commit', '-m', 'Initial commit'], this.repoRoot);

    await runCommand(GIT_CMD, ['worktree', 'add', '-b', 'wt-a-branch', this.wtAPath], this.repoRoot);
    await runCommand(GIT_CMD, ['worktree', 'add', '-b', 'wt-b-branch', this.wtBPath], this.repoRoot);

    this.repoRoot = await realpath(this.repoRoot);
    this.wtAPath = await realpath(this.wtAPath);
    this.wtBPath = await realpath(this.wtBPath);

    await this.seedWorktreeA();
    await this.seedWorktreeB();
  }

  private async seedWorktreeA(): Promise<void> {
    await mkdir(join(this.wtAPath, 'src'), { recursive: true });
    await writeFile(join(this.wtAPath, 'src', 'service-a.ts'), 'export const source = "wt-a";\n', 'utf-8');

    const specDir = join(this.wtAPath, '.spec-workflow', 'specs', 'spec-a');
    const approvalsDir = join(this.wtAPath, '.spec-workflow', 'approvals', 'spec-a');
    await mkdir(specDir, { recursive: true });
    await mkdir(approvalsDir, { recursive: true });
    await writeFile(join(specDir, 'requirements.md'), '# Requirements A\n', 'utf-8');

    const approval = buildApprovalPayload({
      id: 'approval-wt-a',
      title: 'Requirements: Spec A',
      filePath: 'src/service-a.ts',
      categoryName: 'spec-a'
    });
    await writeFile(join(approvalsDir, 'approval-wt-a.json'), JSON.stringify(approval, null, 2), 'utf-8');
  }

  private async seedWorktreeB(): Promise<void> {
    await mkdir(join(this.wtBPath, 'src'), { recursive: true });
    await writeFile(join(this.wtBPath, 'src', 'service-b.ts'), 'export const source = "wt-b";\n', 'utf-8');

    const specDir = join(this.wtBPath, '.spec-workflow', 'specs', 'spec-b');
    const approvalsDir = join(this.wtBPath, '.spec-workflow', 'approvals', 'spec-b');
    await mkdir(specDir, { recursive: true });
    await mkdir(approvalsDir, { recursive: true });
    await writeFile(join(specDir, 'requirements.md'), '# Requirements B\n', 'utf-8');

    const approval = buildApprovalPayload({
      id: 'approval-wt-b',
      title: 'Requirements: Spec B',
      filePath: 'src/service-b.ts',
      categoryName: 'spec-b'
    });
    await writeFile(join(approvalsDir, 'approval-wt-b.json'), JSON.stringify(approval, null, 2), 'utf-8');
  }

  async startMcpServers(): Promise<void> {
    await this.startMcpForPath(this.wtAPath);
    await this.waitForProjects(1, 45000);
    await this.startMcpForPath(this.wtBPath);
  }

  private async startMcpForPath(projectPath: string): Promise<void> {
    const child = spawn(
      NPM_CMD,
      ['run', 'dev', '--', projectPath, '--no-shared-worktree-specs'],
      {
        cwd: this.options.serverRoot,
        env: {
          ...process.env,
          SPEC_WORKFLOW_HOME: this.options.specWorkflowHome
        },
        stdio: ['pipe', 'pipe', 'pipe']
      }
    );

    const appendLog = (chunk: Buffer, source: 'stdout' | 'stderr') => {
      this.mcpLogs.push(`[${source}] ${chunk.toString().trimEnd()}`);
      if (this.mcpLogs.length > 200) {
        this.mcpLogs.shift();
      }
    };

    child.stdout.on('data', (chunk) => appendLog(chunk, 'stdout'));
    child.stderr.on('data', (chunk) => appendLog(chunk, 'stderr'));
    child.on('error', (error) => {
      this.mcpLogs.push(`[error] Failed to spawn MCP for ${projectPath}: ${error.message}`);
    });

    this.mcpProcesses.push(child);
  }

  async waitForProjects(expectedCount = 2, timeoutMs = 60000): Promise<RegisteredProject[]> {
    const startedAt = Date.now();
    const url = `${this.options.dashboardApiBaseUrl}/api/projects/list`;
    let lastBody = '';

    while (Date.now() - startedAt < timeoutMs) {
      try {
        const response = await fetch(url);
        if (response.ok) {
          const body = await response.json() as RegisteredProject[];
          lastBody = JSON.stringify(body);
          const worktreeProjects = body.filter((project) => {
            return project.projectPath === this.wtAPath || project.projectPath === this.wtBPath;
          });

          if (worktreeProjects.length === expectedCount) {
            return worktreeProjects;
          }
        }
      } catch {
        // Dashboard may still be starting.
      }

      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    throw new Error(
      `Timed out waiting for ${expectedCount} MCP projects.\n` +
      `Last /api/projects/list payload: ${lastBody}\n` +
      `Recent MCP logs:\n${this.getCapturedLogs()}`
    );
  }

  async cleanup(): Promise<void> {
    for (const child of this.mcpProcesses) {
      await killProcess(child);
    }
    this.mcpProcesses.length = 0;

    if (this.tempRoot) {
      await rm(this.tempRoot, { recursive: true, force: true });
      this.tempRoot = '';
    }
  }
}
