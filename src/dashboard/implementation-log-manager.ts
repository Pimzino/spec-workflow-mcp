import { promises as fs } from 'fs';
import { join } from 'path';
import { ImplementationLog, ImplementationLogEntry } from '../types.js';
import { randomUUID } from 'crypto';

export class ImplementationLogManager {
  private specPath: string;
  private logPath: string;

  constructor(specPath: string) {
    this.specPath = specPath;
    this.logPath = join(specPath, 'implementation-log.json');
  }

  /**
   * Ensure the spec directory exists
   */
  private async ensureSpecDir(): Promise<void> {
    try {
      await fs.mkdir(this.specPath, { recursive: true });
    } catch (error) {
      // Directory might already exist, ignore
    }
  }

  /**
   * Load implementation log from file
   */
  async loadLog(): Promise<ImplementationLog> {
    await this.ensureSpecDir();

    try {
      const content = await fs.readFile(this.logPath, 'utf-8');
      return JSON.parse(content) as ImplementationLog;
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        // File doesn't exist yet, return default
        return {
          entries: [],
          lastUpdated: new Date().toISOString()
        };
      }
      throw error;
    }
  }

  /**
   * Save implementation log to file atomically
   */
  private async saveLog(log: ImplementationLog): Promise<void> {
    await this.ensureSpecDir();

    log.lastUpdated = new Date().toISOString();

    const content = JSON.stringify(log, null, 2);

    // Write to temporary file first, then rename for atomic operation
    const tempPath = `${this.logPath}.tmp`;
    await fs.writeFile(tempPath, content, 'utf-8');
    await fs.rename(tempPath, this.logPath);
  }

  /**
   * Add a new implementation log entry
   */
  async addLogEntry(entry: Omit<ImplementationLogEntry, 'id'>): Promise<ImplementationLogEntry> {
    const log = await this.loadLog();

    const newEntry: ImplementationLogEntry = {
      ...entry,
      id: randomUUID()
    };

    // Add new entry at the beginning (most recent first)
    log.entries.unshift(newEntry);

    await this.saveLog(log);

    return newEntry;
  }

  /**
   * Get all implementation logs
   */
  async getAllLogs(): Promise<ImplementationLogEntry[]> {
    const log = await this.loadLog();
    return log.entries;
  }

  /**
   * Get logs for a specific task
   */
  async getTaskLogs(taskId: string): Promise<ImplementationLogEntry[]> {
    const log = await this.loadLog();
    return log.entries.filter(e => e.taskId === taskId);
  }

  /**
   * Get logs within a date range
   */
  async getLogsByDateRange(startDate: Date, endDate: Date): Promise<ImplementationLogEntry[]> {
    const log = await this.loadLog();
    return log.entries.filter(e => {
      const entryDate = new Date(e.timestamp);
      return entryDate >= startDate && entryDate <= endDate;
    });
  }

  /**
   * Search logs by summary, task ID, files, and artifacts
   * Supports space-separated keywords with AND logic (all keywords must match)
   */
  async searchLogs(query: string): Promise<ImplementationLogEntry[]> {
    const log = await this.loadLog();

    // Split query into keywords (space-separated) and convert to lowercase
    const keywords = query.toLowerCase().split(/\s+/).filter(k => k.length > 0);

    return log.entries.filter(e => {
      // For each keyword, check if it appears anywhere in this entry
      // ALL keywords must match (AND logic)
      return keywords.every(keyword => {
        // Search in summary, taskId, and files
        if (
          e.summary.toLowerCase().includes(keyword) ||
          e.taskId.toLowerCase().includes(keyword) ||
          e.filesModified.some(f => f.toLowerCase().includes(keyword)) ||
          e.filesCreated.some(f => f.toLowerCase().includes(keyword))
        ) {
          return true;
        }

        // Search in artifacts
        if (e.artifacts) {
          // Search API endpoints
          if (e.artifacts.apiEndpoints?.some(api =>
            api.method.toLowerCase().includes(keyword) ||
            api.path.toLowerCase().includes(keyword) ||
            api.purpose.toLowerCase().includes(keyword) ||
            api.location.toLowerCase().includes(keyword) ||
            (api.requestFormat && api.requestFormat.toLowerCase().includes(keyword)) ||
            (api.responseFormat && api.responseFormat.toLowerCase().includes(keyword))
          )) {
            return true;
          }

          // Search components
          if (e.artifacts.components?.some(comp =>
            comp.name.toLowerCase().includes(keyword) ||
            comp.type.toLowerCase().includes(keyword) ||
            comp.purpose.toLowerCase().includes(keyword) ||
            comp.location.toLowerCase().includes(keyword) ||
            (comp.props && comp.props.toLowerCase().includes(keyword)) ||
            (comp.exports?.some(exp => exp.toLowerCase().includes(keyword)))
          )) {
            return true;
          }

          // Search functions
          if (e.artifacts.functions?.some(func =>
            func.name.toLowerCase().includes(keyword) ||
            func.purpose.toLowerCase().includes(keyword) ||
            func.location.toLowerCase().includes(keyword) ||
            (func.signature && func.signature.toLowerCase().includes(keyword))
          )) {
            return true;
          }

          // Search classes
          if (e.artifacts.classes?.some(cls =>
            cls.name.toLowerCase().includes(keyword) ||
            cls.purpose.toLowerCase().includes(keyword) ||
            cls.location.toLowerCase().includes(keyword) ||
            (cls.methods?.some(method => method.toLowerCase().includes(keyword)))
          )) {
            return true;
          }

          // Search integrations
          if (e.artifacts.integrations?.some(intg =>
            intg.description.toLowerCase().includes(keyword) ||
            intg.frontendComponent.toLowerCase().includes(keyword) ||
            intg.backendEndpoint.toLowerCase().includes(keyword) ||
            intg.dataFlow.toLowerCase().includes(keyword)
          )) {
            return true;
          }
        }

        return false;
      });
    });
  }

  /**
   * Get statistics for a task
   */
  async getTaskStats(taskId: string) {
    const taskLogs = await this.getTaskLogs(taskId);

    if (taskLogs.length === 0) {
      return {
        totalImplementations: 0,
        totalFilesModified: 0,
        totalFilesCreated: 0,
        totalLinesAdded: 0,
        totalLinesRemoved: 0,
        lastImplementation: null
      };
    }

    return {
      totalImplementations: taskLogs.length,
      totalFilesModified: taskLogs.reduce((sum, e) => sum + e.filesModified.length, 0),
      totalFilesCreated: taskLogs.reduce((sum, e) => sum + e.filesCreated.length, 0),
      totalLinesAdded: taskLogs.reduce((sum, e) => sum + e.statistics.linesAdded, 0),
      totalLinesRemoved: taskLogs.reduce((sum, e) => sum + e.statistics.linesRemoved, 0),
      lastImplementation: taskLogs[0] || null
    };
  }

  /**
   * Get all logs that contain a specific artifact type
   */
  async getLogsByArtifactType(artifactType: 'apiEndpoints' | 'components' | 'functions' | 'classes' | 'integrations'): Promise<ImplementationLogEntry[]> {
    const log = await this.loadLog();
    return log.entries.filter(entry =>
      entry.artifacts &&
      entry.artifacts[artifactType] &&
      (entry.artifacts[artifactType] as any).length > 0
    );
  }

  /**
   * Search for specific artifacts across all logs
   * Returns logs that contain artifacts matching the search term
   */
  async findArtifact(artifactType: string, searchTerm: string): Promise<Array<{ log: ImplementationLogEntry; artifact: any }>> {
    const log = await this.loadLog();
    const results: Array<{ log: ImplementationLogEntry; artifact: any }> = [];

    log.entries.forEach(entry => {
      if (entry.artifacts && entry.artifacts[artifactType as keyof typeof entry.artifacts]) {
        const artifacts = entry.artifacts[artifactType as keyof typeof entry.artifacts] as any;
        if (Array.isArray(artifacts)) {
          const matchingArtifacts = artifacts.filter((artifact: any) => {
            const searchable = JSON.stringify(artifact).toLowerCase();
            return searchable.includes(searchTerm.toLowerCase());
          });

          matchingArtifacts.forEach(artifact => {
            results.push({ log: entry, artifact });
          });
        }
      }
    });

    return results;
  }

  /**
   * Get the log file path
   */
  getLogPath(): string {
    return this.logPath;
  }
}
