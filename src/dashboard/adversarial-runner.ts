import { EventEmitter } from 'events';
import { spawn, ChildProcess } from 'child_process';
import { promises as fs } from 'fs';
import { join } from 'path';
import { randomUUID } from 'crypto';

export interface AdversarialJob {
  id: string;
  projectId: string;
  specName: string;
  phase: string;
  status: 'pending' | 'generating-prompt' | 'running-review' | 'completed' | 'failed';
  startedAt: string;
  completedAt?: string;
  error?: string;
  analysisOutputPath: string;
  promptOutputPath: string;
  targetFile: string;
}

interface RunOptions {
  projectId: string;
  specName: string;
  phase: string;
  projectPath: string;
  targetFile: string;
  promptOutputPath: string;
  analysisOutputPath: string;
  methodology: string;
  steeringDocs: string[];
  priorPhaseDocs: string[];
  version: number;
  skipPromptGeneration?: boolean; // Skip step 1 if prompt file already exists
}

const JOB_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes per step
const MAX_CONCURRENT_PER_PROJECT = 2;

export class AdversarialRunner extends EventEmitter {
  private jobs: Map<string, AdversarialJob> = new Map();
  private processes: Map<string, ChildProcess> = new Map();
  private timeouts: Map<string, NodeJS.Timeout> = new Map();

  getJob(jobId: string): AdversarialJob | undefined {
    return this.jobs.get(jobId);
  }

  getJobsForProject(projectId: string): AdversarialJob[] {
    return Array.from(this.jobs.values()).filter(j => j.projectId === projectId);
  }

  getActiveJobsForProject(projectId: string): AdversarialJob[] {
    return this.getJobsForProject(projectId).filter(
      j => j.status === 'pending' || j.status === 'generating-prompt' || j.status === 'running-review'
    );
  }

  async run(opts: RunOptions): Promise<string> {
    // Check concurrency limit
    const activeJobs = this.getActiveJobsForProject(opts.projectId);
    if (activeJobs.length >= MAX_CONCURRENT_PER_PROJECT) {
      throw new Error(`Maximum ${MAX_CONCURRENT_PER_PROJECT} concurrent adversarial reviews per project. Wait for a running review to complete.`);
    }

    // Check for duplicate (same spec+phase already running)
    const duplicate = activeJobs.find(j => j.specName === opts.specName && j.phase === opts.phase);
    if (duplicate) {
      throw new Error(`An adversarial review is already running for ${opts.specName}/${opts.phase}`);
    }

    const jobId = randomUUID();
    const job: AdversarialJob = {
      id: jobId,
      projectId: opts.projectId,
      specName: opts.specName,
      phase: opts.phase,
      status: 'pending',
      startedAt: new Date().toISOString(),
      analysisOutputPath: opts.analysisOutputPath,
      promptOutputPath: opts.promptOutputPath,
      targetFile: opts.targetFile,
    };

    this.jobs.set(jobId, job);
    this.emit('job-update', job);

    // Run the two-step process in the background
    this.executeJob(jobId, opts).catch(err => {
      console.error(`[AdversarialRunner] Job ${jobId} failed:`, err);
    });

    return jobId;
  }

  private async executeJob(jobId: string, opts: RunOptions): Promise<void> {
    const job = this.jobs.get(jobId);
    if (!job) return;

    try {
      // Step 1: Generate the tailored adversarial prompt (skip if prompt already exists)
      let promptExists = false;
      if (opts.skipPromptGeneration) {
        try {
          await fs.access(opts.promptOutputPath);
          promptExists = true;
        } catch {
          // Prompt doesn't exist despite skipPromptGeneration — fall through to generate it
        }
      }

      if (!promptExists) {
        job.status = 'generating-prompt';
        this.emit('job-update', { ...job });

        const promptGenerationInstructions = this.buildPromptGenerationInstructions(opts);
        await this.runClaude(jobId, opts.projectPath, promptGenerationInstructions);

        // Verify the prompt file was written
        try {
          await fs.access(opts.promptOutputPath);
        } catch {
          throw new Error(`Prompt generation completed but prompt file was not created at ${opts.promptOutputPath}`);
        }
      }

      // Step 2: Execute the adversarial review with fresh context
      job.status = 'running-review';
      this.emit('job-update', { ...job });

      const reviewInstructions = `Read and execute the instructions in ${opts.promptOutputPath}`;
      await this.runClaude(jobId, opts.projectPath, reviewInstructions);

      // Verify the analysis file was written
      try {
        await fs.access(opts.analysisOutputPath);
      } catch {
        throw new Error(`Review completed but analysis file was not created at ${opts.analysisOutputPath}`);
      }

      job.status = 'completed';
      job.completedAt = new Date().toISOString();
      this.emit('job-update', { ...job });
    } catch (err: any) {
      job.status = 'failed';
      job.error = err.message || 'Unknown error';
      job.completedAt = new Date().toISOString();
      this.emit('job-update', { ...job });
    } finally {
      this.cleanupProcess(jobId);
    }
  }

  private buildPromptGenerationInstructions(opts: RunOptions): string {
    const filesToRead = [opts.targetFile, ...opts.steeringDocs, ...opts.priorPhaseDocs];
    const readInstructions = filesToRead
      .map(f => `- ${f}`)
      .join('\n');

    return [
      `You are generating an adversarial review prompt. Follow the methodology below exactly.`,
      ``,
      `## Files to Read`,
      readInstructions,
      ``,
      `## Methodology`,
      opts.methodology,
      ``,
      `## Task`,
      `1. Read all the files listed above.`,
      `2. Following the methodology, generate a tailored adversarial prompt targeting the ${opts.phase} phase document.`,
      `3. Write the completed prompt to: ${opts.promptOutputPath}`,
      `4. The prompt MUST tell the reviewing agent to write its analysis to: ${opts.analysisOutputPath}`,
      ``,
      `Do not perform the review yourself. Only generate the prompt file.`,
    ].join('\n');
  }

  private runClaude(jobId: string, cwd: string, prompt: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const child = spawn('claude', [
        '--print',
        '--dangerously-skip-permissions',
        prompt,
      ], {
        cwd,
        stdio: ['ignore', 'pipe', 'pipe'],
        env: { ...process.env },
      });

      this.processes.set(jobId, child);

      // Set timeout
      const timeout = setTimeout(() => {
        child.kill('SIGTERM');
        reject(new Error('Claude process timed out after 10 minutes'));
      }, JOB_TIMEOUT_MS);
      this.timeouts.set(jobId, timeout);

      let stderr = '';
      child.stderr?.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('close', (code) => {
        clearTimeout(timeout);
        this.timeouts.delete(jobId);
        this.processes.delete(jobId);

        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Claude process exited with code ${code}${stderr ? `: ${stderr.slice(0, 500)}` : ''}`));
        }
      });

      child.on('error', (err) => {
        clearTimeout(timeout);
        this.timeouts.delete(jobId);
        this.processes.delete(jobId);

        if ((err as any).code === 'ENOENT') {
          reject(new Error('Claude CLI not found. Ensure "claude" is installed and available in PATH.'));
        } else {
          reject(err);
        }
      });
    });
  }

  cancelJob(jobId: string): boolean {
    const job = this.jobs.get(jobId);
    if (!job || job.status === 'completed' || job.status === 'failed') {
      return false;
    }

    this.cleanupProcess(jobId);
    job.status = 'failed';
    job.error = 'Cancelled by user';
    job.completedAt = new Date().toISOString();
    this.emit('job-update', { ...job });
    return true;
  }

  private cleanupProcess(jobId: string) {
    const child = this.processes.get(jobId);
    if (child) {
      child.kill('SIGTERM');
      this.processes.delete(jobId);
    }

    const timeout = this.timeouts.get(jobId);
    if (timeout) {
      clearTimeout(timeout);
      this.timeouts.delete(jobId);
    }
  }

  shutdown() {
    for (const [jobId] of this.processes) {
      this.cleanupProcess(jobId);
    }
  }
}
