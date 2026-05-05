import * as cron from 'node-cron';
import { SettingsManager } from './settings-manager.js';
import { ExecutionHistoryManager } from './execution-history-manager.js';
import { ProjectManager } from './project-manager.js';
import { AutomationJob } from '../types.js';
import { promises as fs } from 'fs';
import { join } from 'path';

export interface JobExecutionResult {
  jobId: string;
  jobName: string;
  success: boolean;
  startTime: string;
  endTime: string;
  duration: number; // in milliseconds
  itemsProcessed: number;
  itemsDeleted: number;
  error?: string;
}

export class JobScheduler {
  private settingsManager: SettingsManager;
  private historyManager: ExecutionHistoryManager;
  private projectManager: ProjectManager;
  private scheduledJobs: Map<string, cron.ScheduledTask> = new Map();

  constructor(projectManager: ProjectManager) {
    this.settingsManager = new SettingsManager();
    this.historyManager = new ExecutionHistoryManager();
    this.projectManager = projectManager;
  }

  /**
   * Initialize the scheduler
   * 1. Run catch-up for any missed jobs
   * 2. Schedule recurring jobs
   */
  async initialize(): Promise<void> {
    try {
      const settings = await this.settingsManager.loadSettings();

      // Run catch-up for all enabled jobs
      for (const job of settings.automationJobs) {
        if (job.enabled) {
          await this.runJobCatchUp(job);
        }
      }

      // Schedule recurring jobs
      for (const job of settings.automationJobs) {
        if (job.enabled) {
          this.scheduleJob(job);
        }
      }

      console.error('[JobScheduler] Initialized with ' + settings.automationJobs.length + ' jobs');
    } catch (error) {
      console.error('[JobScheduler] Failed to initialize:', error);
    }
  }

  /**
   * Run catch-up for a job - delete any records that should have been deleted
   */
  private async runJobCatchUp(job: AutomationJob): Promise<void> {
    const startTime = new Date();

    try {
      const result = await this.executeJob(job);

      if (result.itemsDeleted > 0) {
        console.error(
          `[JobScheduler] Catch-up for "${job.name}": ${result.itemsDeleted} items deleted in ${result.duration}ms`
        );
      }

      // Record execution history
      await this.historyManager.recordExecution({
        jobId: job.id,
        jobName: job.name,
        jobType: job.type,
        executedAt: result.startTime,
        success: result.success,
        duration: result.duration,
        itemsProcessed: result.itemsProcessed,
        itemsDeleted: result.itemsDeleted,
        error: result.error
      });

      // Update lastRun timestamp
      await this.settingsManager.updateJob(job.id, {
        lastRun: startTime.toISOString()
      });
    } catch (error) {
      console.error(`[JobScheduler] Catch-up failed for "${job.name}":`, error);
    }
  }

  /**
   * Schedule a recurring job with cron
   */
  private scheduleJob(job: AutomationJob): void {
    try {
      // Unschedule if already scheduled
      if (this.scheduledJobs.has(job.id)) {
        const scheduled = this.scheduledJobs.get(job.id);
        if (scheduled) {
          scheduled.stop();
        }
        this.scheduledJobs.delete(job.id);
      }

      // Schedule new cron job
      const task = cron.schedule(job.schedule, async () => {
        try {
          const startTime = new Date();
          const result = await this.executeJob(job);

          console.error(
            `[JobScheduler] Executed "${job.name}": ${result.itemsDeleted} items deleted in ${result.duration}ms`
          );

          // Record execution history
          await this.historyManager.recordExecution({
            jobId: job.id,
            jobName: job.name,
            jobType: job.type,
            executedAt: result.startTime,
            success: result.success,
            duration: result.duration,
            itemsProcessed: result.itemsProcessed,
            itemsDeleted: result.itemsDeleted,
            error: result.error
          });

          // Update lastRun timestamp
          await this.settingsManager.updateJob(job.id, {
            lastRun: startTime.toISOString()
          });
        } catch (error) {
          console.error(`[JobScheduler] Execution failed for "${job.name}":`, error);
        }
      });

      this.scheduledJobs.set(job.id, task);
      console.error(`[JobScheduler] Scheduled job "${job.name}" with cron: ${job.schedule}`);
    } catch (error) {
      console.error(`[JobScheduler] Failed to schedule job "${job.name}":`, error);
    }
  }

  /**
   * Execute a job against all projects
   */
  private async executeJob(job: AutomationJob): Promise<JobExecutionResult> {
    const startTime = new Date();
    let itemsProcessed = 0;
    let itemsDeleted = 0;
    let error: string | undefined;

    try {
      const projects = this.projectManager.getProjectsList();

      for (const project of projects) {
        const projectContext = this.projectManager.getProject(project.projectId);
        if (!projectContext) continue;

        if (job.type === 'cleanup-approvals') {
          const { processed, deleted } = await this.cleanupApprovals(
            projectContext.approvalStorage,
            job.config.daysOld
          );
          itemsProcessed += processed;
          itemsDeleted += deleted;
        } else if (job.type === 'cleanup-specs') {
          const { processed, deleted } = await this.cleanupSpecs(
            projectContext.parser,
            projectContext.projectPath,
            job.config.daysOld
          );
          itemsProcessed += processed;
          itemsDeleted += deleted;
        } else if (job.type === 'cleanup-archived-specs') {
          const { processed, deleted } = await this.cleanupArchivedSpecs(
            projectContext.parser,
            projectContext.projectPath,
            job.config.daysOld
          );
          itemsProcessed += processed;
          itemsDeleted += deleted;
        }
      }
    } catch (e) {
      error = e instanceof Error ? e.message : String(e);
    }

    const endTime = new Date();

    return {
      jobId: job.id,
      jobName: job.name,
      success: !error,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      duration: endTime.getTime() - startTime.getTime(),
      itemsProcessed,
      itemsDeleted,
      error
    };
  }

  /**
   * Clean up old approval records
   */
  private async cleanupApprovals(
    approvalStorage: any,
    daysOld: number
  ): Promise<{ processed: number; deleted: number }> {
    const approvals = await approvalStorage.getAllApprovals();
    const now = new Date();
    const cutoffTime = now.getTime() - daysOld * 24 * 60 * 60 * 1000;

    let deleted = 0;

    for (const approval of approvals) {
      const createdTime = new Date(approval.createdAt).getTime();
      if (createdTime < cutoffTime) {
        try {
          await approvalStorage.deleteApproval(approval.id);
          deleted++;
        } catch (e) {
          console.error(`Failed to delete approval ${approval.id}:`, e);
        }
      }
    }

    return { processed: approvals.length, deleted };
  }

  /**
   * Clean up old active specs
   */
  private async cleanupSpecs(
    parser: any,
    projectPath: string,
    daysOld: number
  ): Promise<{ processed: number; deleted: number }> {
    const specs = await parser.getAllSpecs();
    const now = new Date();
    const cutoffTime = now.getTime() - daysOld * 24 * 60 * 60 * 1000;

    let deleted = 0;

    for (const spec of specs) {
      const createdTime = new Date(spec.createdAt).getTime();
      if (createdTime < cutoffTime) {
        try {
          // Delete spec directory
          const specPath = join(projectPath, '.spec-workflow', 'specs', spec.name);
          await fs.rm(specPath, { recursive: true, force: true });
          deleted++;
        } catch (e) {
          console.error(`Failed to delete spec ${spec.name}:`, e);
        }
      }
    }

    return { processed: specs.length, deleted };
  }

  /**
   * Clean up old archived specs
   */
  private async cleanupArchivedSpecs(
    parser: any,
    projectPath: string,
    daysOld: number
  ): Promise<{ processed: number; deleted: number }> {
    const archivedSpecs = await parser.getAllArchivedSpecs();
    const now = new Date();
    const cutoffTime = now.getTime() - daysOld * 24 * 60 * 60 * 1000;

    let deleted = 0;

    for (const spec of archivedSpecs) {
      const createdTime = new Date(spec.createdAt).getTime();
      if (createdTime < cutoffTime) {
        try {
          // Delete archived spec directory
          const archivedPath = join(projectPath, '.spec-workflow', 'archive', 'specs', spec.name);
          await fs.rm(archivedPath, { recursive: true, force: true });
          deleted++;
        } catch (e) {
          console.error(`Failed to delete archived spec ${spec.name}:`, e);
        }
      }
    }

    return { processed: archivedSpecs.length, deleted };
  }

  /**
   * Manually trigger a job execution
   */
  async runJobManually(jobId: string): Promise<JobExecutionResult> {
    const job = await this.settingsManager.getJob(jobId);
    if (!job) {
      throw new Error(`Job with ID ${jobId} not found`);
    }

    return await this.executeJob(job);
  }

  /**
   * Update a job configuration and reschedule if needed
   */
  async updateJob(jobId: string, updates: any): Promise<void> {
    // Update in settings
    await this.settingsManager.updateJob(jobId, updates);

    // Reschedule if enabled status or schedule changed
    const job = await this.settingsManager.getJob(jobId);
    if (job) {
      if (job.enabled) {
        this.scheduleJob(job);
      } else {
        // Stop scheduled job
        const scheduled = this.scheduledJobs.get(job.id);
        if (scheduled) {
          scheduled.stop();
          this.scheduledJobs.delete(job.id);
        }
      }
    }
  }

  /**
   * Delete a job
   */
  async deleteJob(jobId: string): Promise<void> {
    // Stop scheduled job
    const scheduled = this.scheduledJobs.get(jobId);
    if (scheduled) {
      scheduled.stop();
      this.scheduledJobs.delete(jobId);
    }

    // Delete from settings
    await this.settingsManager.deleteJob(jobId);
  }

  /**
   * Add a new job
   */
  async addJob(job: AutomationJob): Promise<void> {
    await this.settingsManager.addJob(job);

    // Schedule if enabled
    if (job.enabled) {
      this.scheduleJob(job);
    }
  }

  /**
   * Get all jobs
   */
  async getAllJobs(): Promise<AutomationJob[]> {
    return await this.settingsManager.getAllJobs();
  }

  /**
   * Get execution history for a job
   */
  async getJobExecutionHistory(jobId: string, limit: number = 50) {
    return await this.historyManager.getJobHistory(jobId, limit);
  }

  /**
   * Get execution statistics for a job
   */
  async getJobStats(jobId: string) {
    return await this.historyManager.getJobStats(jobId);
  }

  /**
   * Shutdown the scheduler
   */
  async shutdown(): Promise<void> {
    for (const task of this.scheduledJobs.values()) {
      task.stop();
    }
    this.scheduledJobs.clear();
    console.error('[JobScheduler] Shutdown complete');
  }
}
