import { homedir } from 'os';
import { join } from 'path';
import { promises as fs } from 'fs';
import { JobExecutionHistory, JobExecutionLog } from '../types.js';

export class ExecutionHistoryManager {
  private historyPath: string;
  private historyDir: string;
  private maxHistoryEntries = 1000; // Keep last 1000 executions

  constructor() {
    this.historyDir = join(homedir(), '.spec-workflow-mcp');
    this.historyPath = join(this.historyDir, 'job-execution-history.json');
  }

  /**
   * Ensure the history directory exists
   */
  private async ensureHistoryDir(): Promise<void> {
    try {
      await fs.mkdir(this.historyDir, { recursive: true });
    } catch (error) {
      // Directory might already exist, ignore
    }
  }

  /**
   * Load execution history from file
   */
  async loadHistory(): Promise<JobExecutionLog> {
    await this.ensureHistoryDir();

    try {
      const content = await fs.readFile(this.historyPath, 'utf-8');
      // Handle empty or whitespace-only files
      const trimmedContent = content.trim();
      if (!trimmedContent) {
        console.error(`[ExecutionHistoryManager] Warning: ${this.historyPath} is empty, using default history`);
        const defaultHistory = {
          executions: [],
          lastUpdated: new Date().toISOString()
        };
        // Write default history to file
        await this.saveHistory(defaultHistory);
        return defaultHistory;
      }
      return JSON.parse(trimmedContent) as JobExecutionLog;
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        // File doesn't exist yet, create it with default history
        const defaultHistory = {
          executions: [],
          lastUpdated: new Date().toISOString()
        };
        await this.saveHistory(defaultHistory);
        return defaultHistory;
      }
      if (error instanceof SyntaxError) {
        // JSON parsing error - file is corrupted or invalid
        console.error(`[ExecutionHistoryManager] Error: Failed to parse ${this.historyPath}: ${error.message}`);
        console.error(`[ExecutionHistoryManager] The file may be corrupted. Using default history.`);
        // Back up the corrupted file
        try {
          const backupPath = `${this.historyPath}.corrupted.${Date.now()}`;
          await fs.copyFile(this.historyPath, backupPath);
          console.error(`[ExecutionHistoryManager] Corrupted file backed up to: ${backupPath}`);
        } catch (backupError) {
          // Ignore backup errors
        }
        const defaultHistory = {
          executions: [],
          lastUpdated: new Date().toISOString()
        };
        // Write default history to file
        await this.saveHistory(defaultHistory);
        return defaultHistory;
      }
      throw error;
    }
  }

  /**
   * Save execution history to file atomically
   */
  private async saveHistory(log: JobExecutionLog): Promise<void> {
    await this.ensureHistoryDir();

    log.lastUpdated = new Date().toISOString();

    const content = JSON.stringify(log, null, 2);

    // Write to temporary file first, then rename for atomic operation
    const tempPath = `${this.historyPath}.tmp`;
    await fs.writeFile(tempPath, content, 'utf-8');
    await fs.rename(tempPath, this.historyPath);
  }

  /**
   * Record a job execution
   */
  async recordExecution(execution: JobExecutionHistory): Promise<void> {
    const log = await this.loadHistory();

    // Add new execution at the beginning
    log.executions.unshift(execution);

    // Keep only the most recent entries
    if (log.executions.length > this.maxHistoryEntries) {
      log.executions = log.executions.slice(0, this.maxHistoryEntries);
    }

    await this.saveHistory(log);
  }

  /**
   * Get execution history for a specific job
   */
  async getJobHistory(jobId: string, limit: number = 50): Promise<JobExecutionHistory[]> {
    const log = await this.loadHistory();
    return log.executions.filter(e => e.jobId === jobId).slice(0, limit);
  }

  /**
   * Get recent executions across all jobs
   */
  async getRecentExecutions(limit: number = 100): Promise<JobExecutionHistory[]> {
    const log = await this.loadHistory();
    return log.executions.slice(0, limit);
  }

  /**
   * Get execution statistics for a job
   */
  async getJobStats(jobId: string) {
    const history = await this.getJobHistory(jobId, 100);

    const successful = history.filter(e => e.success);
    const failed = history.filter(e => !e.success);

    return {
      totalExecutions: history.length,
      successfulExecutions: successful.length,
      failedExecutions: failed.length,
      successRate: history.length > 0 ? (successful.length / history.length) * 100 : 0,
      totalItemsDeleted: successful.reduce((sum, e) => sum + e.itemsDeleted, 0),
      avgDuration: successful.length > 0 ? successful.reduce((sum, e) => sum + e.duration, 0) / successful.length : 0,
      lastExecution: history[0] || null
    };
  }

  /**
   * Clear old history (keep last N days)
   */
  async clearOldHistory(daysToKeep: number = 30): Promise<void> {
    const log = await this.loadHistory();
    const cutoffTime = new Date();
    cutoffTime.setDate(cutoffTime.getDate() - daysToKeep);

    log.executions = log.executions.filter(e => new Date(e.executedAt) > cutoffTime);

    await this.saveHistory(log);
  }

  /**
   * Get the history file path
   */
  getHistoryPath(): string {
    return this.historyPath;
  }
}
