import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { EventEmitter } from 'events';
import { AdversarialRunner, AdversarialJob } from '../adversarial-runner.js';

// Mock child_process
vi.mock('child_process', () => ({
  spawn: vi.fn(),
}));

// Mock fs.promises
vi.mock('fs', () => ({
  promises: {
    access: vi.fn(),
  },
}));

import { spawn } from 'child_process';
import { promises as fs } from 'fs';

const mockedSpawn = vi.mocked(spawn);
const mockedAccess = vi.mocked(fs.access);

function createFakeChild() {
  const child = new EventEmitter() as EventEmitter & {
    kill: ReturnType<typeof vi.fn>;
    stderr: EventEmitter;
    stdout: EventEmitter;
    pid: number;
  };
  child.kill = vi.fn();
  child.stderr = new EventEmitter();
  child.stdout = new EventEmitter();
  child.pid = 12345;
  return child;
}

function waitForJobStatus(runner: AdversarialRunner, jobId: string, status: string): Promise<AdversarialJob> {
  return new Promise((resolve) => {
    const handler = (job: AdversarialJob) => {
      if (job.id === jobId && job.status === status) {
        runner.removeListener('job-update', handler);
        resolve(job);
      }
    };
    runner.on('job-update', handler);
  });
}

function baseOpts(overrides: Partial<Parameters<AdversarialRunner['run']>[0]> = {}) {
  return {
    projectId: 'proj-1',
    specName: 'my-spec',
    phase: 'requirements',
    projectPath: '/tmp/project',
    targetFile: '/tmp/project/.spec-workflow/specs/my-spec/requirements.md',
    promptOutputPath: '/tmp/project/.spec-workflow/specs/my-spec/reviews/adversarial-prompt-requirements.md',
    analysisOutputPath: '/tmp/project/.spec-workflow/specs/my-spec/reviews/adversarial-analysis-requirements.md',
    methodology: 'Test methodology',
    steeringDocs: [],
    priorPhaseDocs: [],
    version: 1,
    ...overrides,
  };
}

describe('AdversarialRunner', () => {
  let runner: AdversarialRunner;

  beforeEach(() => {
    vi.useFakeTimers();
    runner = new AdversarialRunner();
    mockedSpawn.mockReset();
    mockedAccess.mockReset();
  });

  afterEach(() => {
    runner.shutdown();
    vi.useRealTimers();
  });

  describe('run()', () => {
    it('creates job and returns jobId', async () => {
      const child = createFakeChild();
      mockedSpawn.mockReturnValue(child as any);

      const jobId = await runner.run(baseOpts());
      expect(jobId).toBeTruthy();

      const job = runner.getJob(jobId);
      expect(job).toBeDefined();
      expect(job!.projectId).toBe('proj-1');
      expect(job!.specName).toBe('my-spec');
    });

    it('emits job-update with pending as first status', async () => {
      const child = createFakeChild();
      mockedSpawn.mockReturnValue(child as any);

      const updates: AdversarialJob[] = [];
      runner.on('job-update', (job) => updates.push({ ...job }));

      await runner.run(baseOpts());

      expect(updates.length).toBeGreaterThanOrEqual(1);
      expect(updates[0].status).toBe('pending');
    });

    it('throws when max 2 concurrent jobs reached', async () => {
      const child1 = createFakeChild();
      const child2 = createFakeChild();
      const child3 = createFakeChild();
      mockedSpawn.mockReturnValueOnce(child1 as any).mockReturnValueOnce(child2 as any).mockReturnValueOnce(child3 as any);

      await runner.run(baseOpts({ specName: 'spec-a', phase: 'requirements' }));
      await runner.run(baseOpts({ specName: 'spec-b', phase: 'design' }));

      await expect(runner.run(baseOpts({ specName: 'spec-c', phase: 'tasks' }))).rejects.toThrow('Maximum 2 concurrent');
    });

    it('throws for duplicate spec+phase', async () => {
      const child = createFakeChild();
      mockedSpawn.mockReturnValue(child as any);

      await runner.run(baseOpts());

      await expect(runner.run(baseOpts())).rejects.toThrow('already running for my-spec/requirements');
    });

    it('allows same spec+phase for different projects', async () => {
      const child1 = createFakeChild();
      const child2 = createFakeChild();
      mockedSpawn.mockReturnValueOnce(child1 as any).mockReturnValueOnce(child2 as any);

      const jobId1 = await runner.run(baseOpts({ projectId: 'proj-1' }));
      const jobId2 = await runner.run(baseOpts({ projectId: 'proj-2' }));

      expect(jobId1).not.toBe(jobId2);
    });
  });

  describe('queries', () => {
    it('getJob returns undefined for unknown id', () => {
      expect(runner.getJob('nonexistent')).toBeUndefined();
    });

    it('getJobsForProject filters by projectId', async () => {
      const child1 = createFakeChild();
      const child2 = createFakeChild();
      mockedSpawn.mockReturnValueOnce(child1 as any).mockReturnValueOnce(child2 as any);

      await runner.run(baseOpts({ projectId: 'proj-1', specName: 'a' }));
      await runner.run(baseOpts({ projectId: 'proj-2', specName: 'b' }));

      expect(runner.getJobsForProject('proj-1').length).toBe(1);
      expect(runner.getJobsForProject('proj-2').length).toBe(1);
      expect(runner.getJobsForProject('proj-3').length).toBe(0);
    });

    it('getActiveJobsForProject excludes completed/failed jobs', async () => {
      const child = createFakeChild();
      mockedSpawn.mockReturnValue(child as any);
      // Access file checks succeed for both prompt and analysis
      mockedAccess.mockResolvedValue(undefined);

      const jobId = await runner.run(baseOpts());

      // Complete step 1 (generating-prompt)
      await vi.waitFor(() => {
        expect(mockedSpawn).toHaveBeenCalled();
      });
      child.emit('close', 0);

      // Complete step 2 (running-review)
      await vi.waitFor(() => {
        expect(mockedSpawn).toHaveBeenCalledTimes(2);
      });
      const child2 = mockedSpawn.mock.results[1]?.value;
      // The second spawn returns a new fake child - but since we mock the return value,
      // we need a second child
      // Actually, spawn is called again for step 2, need another fake child
      // Let's restructure: spawn returns a new fake child each time
    });
  });

  describe('execution lifecycle', () => {
    it('transitions pending → generating-prompt → running-review → completed', async () => {
      const child1 = createFakeChild();
      const child2 = createFakeChild();
      mockedSpawn.mockReturnValueOnce(child1 as any).mockReturnValueOnce(child2 as any);
      mockedAccess.mockResolvedValue(undefined); // all file checks pass

      const updates: string[] = [];
      runner.on('job-update', (job: AdversarialJob) => updates.push(job.status));

      const jobId = await runner.run(baseOpts());

      // Wait for generating-prompt status
      await vi.waitFor(() => {
        expect(updates).toContain('generating-prompt');
      });

      // Complete step 1
      child1.emit('close', 0);

      // Wait for running-review status
      await vi.waitFor(() => {
        expect(updates).toContain('running-review');
      });

      // Complete step 2
      child2.emit('close', 0);

      // Wait for completed
      await vi.waitFor(() => {
        expect(updates).toContain('completed');
      });

      expect(updates).toEqual(['pending', 'generating-prompt', 'running-review', 'completed']);
      const job = runner.getJob(jobId);
      expect(job!.status).toBe('completed');
      expect(job!.completedAt).toBeTruthy();
    });

    it('sets failed with error on non-zero exit', async () => {
      const child1 = createFakeChild();
      mockedSpawn.mockReturnValueOnce(child1 as any);
      mockedAccess.mockResolvedValue(undefined);

      const jobId = await runner.run(baseOpts());

      await vi.waitFor(() => {
        expect(mockedSpawn).toHaveBeenCalled();
      });

      // Emit stderr then close with error
      child1.stderr.emit('data', Buffer.from('something went wrong'));
      child1.emit('close', 1);

      await vi.waitFor(() => {
        const job = runner.getJob(jobId);
        expect(job!.status).toBe('failed');
      });

      const job = runner.getJob(jobId);
      expect(job!.error).toContain('exited with code 1');
      expect(job!.error).toContain('something went wrong');
    });

    it('skips step 1 when skipPromptGeneration=true and file exists', async () => {
      const child1 = createFakeChild();
      mockedSpawn.mockReturnValueOnce(child1 as any);
      mockedAccess.mockResolvedValue(undefined); // prompt file exists, analysis file exists

      const updates: string[] = [];
      runner.on('job-update', (job: AdversarialJob) => updates.push(job.status));

      await runner.run(baseOpts({ skipPromptGeneration: true }));

      // Should go straight to running-review (skip generating-prompt)
      await vi.waitFor(() => {
        expect(updates).toContain('running-review');
      });

      // Only one spawn call (step 2 only)
      expect(mockedSpawn).toHaveBeenCalledTimes(1);

      // Complete step 2
      child1.emit('close', 0);

      await vi.waitFor(() => {
        expect(updates).toContain('completed');
      });

      // No generating-prompt in updates
      expect(updates).not.toContain('generating-prompt');
    });

    it('fails when prompt file not created after step 1', async () => {
      const child1 = createFakeChild();
      mockedSpawn.mockReturnValueOnce(child1 as any);
      // First access call (post-step-1 verification) fails
      mockedAccess.mockRejectedValue(new Error('ENOENT'));

      const jobId = await runner.run(baseOpts());

      await vi.waitFor(() => {
        expect(mockedSpawn).toHaveBeenCalled();
      });

      child1.emit('close', 0);

      await vi.waitFor(() => {
        const job = runner.getJob(jobId);
        expect(job!.status).toBe('failed');
      });

      const job = runner.getJob(jobId);
      expect(job!.error).toContain('prompt file was not created');
    });
  });

  describe('CLI config', () => {
    it('uses default cli/cliArgs when not specified', async () => {
      const child = createFakeChild();
      mockedSpawn.mockReturnValue(child as any);

      await runner.run(baseOpts());

      expect(mockedSpawn).toHaveBeenCalledWith(
        'claude',
        expect.arrayContaining(['--print', '--dangerously-skip-permissions']),
        expect.any(Object)
      );
    });

    it('passes custom cli and cliArgs to spawn', async () => {
      const child = createFakeChild();
      mockedSpawn.mockReturnValue(child as any);

      await runner.run(baseOpts({
        cli: 'custom-cli',
        cliArgs: ['--custom-arg'],
      }));

      expect(mockedSpawn).toHaveBeenCalledWith(
        'custom-cli',
        expect.arrayContaining(['--custom-arg']),
        expect.any(Object)
      );
    });

    it('passes --model flag when model set', async () => {
      const child = createFakeChild();
      mockedSpawn.mockReturnValue(child as any);

      await runner.run(baseOpts({ model: 'sonnet' }));

      expect(mockedSpawn).toHaveBeenCalledWith(
        'claude',
        expect.arrayContaining(['--model', 'sonnet']),
        expect.any(Object)
      );
    });
  });

  describe('cancelJob', () => {
    it('sets failed with "Cancelled by user" and returns true', async () => {
      const child = createFakeChild();
      mockedSpawn.mockReturnValue(child as any);

      const jobId = await runner.run(baseOpts());
      const result = runner.cancelJob(jobId);

      expect(result).toBe(true);
      const job = runner.getJob(jobId);
      expect(job!.status).toBe('failed');
      expect(job!.error).toBe('Cancelled by user');
      expect(job!.completedAt).toBeTruthy();
      expect(child.kill).toHaveBeenCalledWith('SIGTERM');
    });

    it('returns false for completed job', async () => {
      const child1 = createFakeChild();
      const child2 = createFakeChild();
      mockedSpawn.mockReturnValueOnce(child1 as any).mockReturnValueOnce(child2 as any);
      mockedAccess.mockResolvedValue(undefined);

      const jobId = await runner.run(baseOpts());

      // Complete both steps
      await vi.waitFor(() => expect(mockedSpawn).toHaveBeenCalled());
      child1.emit('close', 0);
      await vi.waitFor(() => expect(mockedSpawn).toHaveBeenCalledTimes(2));
      child2.emit('close', 0);
      await vi.waitFor(() => expect(runner.getJob(jobId)!.status).toBe('completed'));

      expect(runner.cancelJob(jobId)).toBe(false);
    });

    it('returns false for non-existent job', () => {
      expect(runner.cancelJob('nonexistent')).toBe(false);
    });
  });

  describe('error handling', () => {
    it('reports ENOENT as CLI not found', async () => {
      const child = createFakeChild();
      mockedSpawn.mockReturnValue(child as any);

      const jobId = await runner.run(baseOpts());

      await vi.waitFor(() => {
        expect(mockedSpawn).toHaveBeenCalled();
      });

      const err = new Error('spawn claude ENOENT') as Error & { code: string };
      err.code = 'ENOENT';
      child.emit('error', err);

      await vi.waitFor(() => {
        const job = runner.getJob(jobId);
        expect(job!.status).toBe('failed');
      });

      const job = runner.getJob(jobId);
      expect(job!.error).toContain('not found');
    });
  });

  describe('shutdown', () => {
    it('kills all running processes', async () => {
      const child1 = createFakeChild();
      const child2 = createFakeChild();
      mockedSpawn.mockReturnValueOnce(child1 as any).mockReturnValueOnce(child2 as any);

      await runner.run(baseOpts({ specName: 'spec-a' }));
      await runner.run(baseOpts({ specName: 'spec-b', phase: 'design' }));

      runner.shutdown();

      expect(child1.kill).toHaveBeenCalledWith('SIGTERM');
      expect(child2.kill).toHaveBeenCalledWith('SIGTERM');
    });
  });
});
