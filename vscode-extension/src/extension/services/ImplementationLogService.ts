import * as vscode from 'vscode';
import * as fs from 'fs/promises';
import * as path from 'path';
import { Logger } from '../utils/logger';

// Type definitions
export interface LogStatistics {
  linesAdded: number;
  linesRemoved: number;
  filesChanged: number;
}

export interface ApiEndpoint {
  method: string;
  path: string;
  purpose: string;
  requestFormat?: string;
  responseFormat?: string;
  location: string;
}

export interface ComponentInfo {
  name: string;
  type: string;
  purpose: string;
  props?: string;
  exports?: string[];
  location: string;
}

export interface FunctionInfo {
  name: string;
  purpose: string;
  signature?: string;
  isExported: boolean;
  location: string;
}

export interface ClassInfo {
  name: string;
  purpose: string;
  methods?: string[];
  isExported: boolean;
  location: string;
}

export interface Integration {
  description: string;
  frontendComponent: string;
  backendEndpoint: string;
  dataFlow: string;
}

export interface LogArtifacts {
  apiEndpoints?: ApiEndpoint[];
  components?: ComponentInfo[];
  functions?: FunctionInfo[];
  classes?: ClassInfo[];
  integrations?: Integration[];
}

export interface ImplementationLogEntry {
  id: string;
  taskId: string;
  timestamp: string;
  summary: string;
  filesModified: string[];
  filesCreated: string[];
  statistics: LogStatistics;
  artifacts: LogArtifacts;
}

export interface ImplementationLog {
  entries: ImplementationLogEntry[];
  lastUpdated: string;
}

export class ImplementationLogService {
  private specWorkflowRoot: string | null = null;
  private logWatcher: vscode.FileSystemWatcher | null = null;
  private onLogsChangedCallback: ((specName: string) => void) | null = null;
  private logger: Logger;

  constructor(outputChannel: vscode.OutputChannel) {
    this.logger = new Logger(outputChannel);
    this.updateWorkspaceRoot();

    // Listen for workspace folder changes
    vscode.workspace.onDidChangeWorkspaceFolders(() => {
      this.updateWorkspaceRoot();
      this.setupLogWatcher();
    });

    this.setupLogWatcher();
  }

  /**
   * Update workspace root when workspace changes
   */
  private updateWorkspaceRoot() {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (workspaceFolders && workspaceFolders.length > 0) {
      this.specWorkflowRoot = path.join(workspaceFolders[0].uri.fsPath, '.spec-workflow');
    } else {
      this.specWorkflowRoot = null;
    }
  }

  /**
   * Set callback for when logs change
   */
  setOnLogsChanged(callback: (specName: string) => void) {
    this.onLogsChangedCallback = callback;
  }

  /**
   * Setup file watcher for implementation log files
   */
  private setupLogWatcher() {
    // Dispose existing watcher
    if (this.logWatcher) {
      this.logWatcher.dispose();
      this.logWatcher = null;
    }

    if (!this.specWorkflowRoot) {
      return;
    }

    const logPattern = new vscode.RelativePattern(
      path.join(this.specWorkflowRoot, 'specs'),
      '**/implementation-log.json'
    );

    this.logWatcher = vscode.workspace.createFileSystemWatcher(logPattern);

    const handleLogChange = (uri: vscode.Uri) => {
      // Extract spec name from file path
      const specName = this.extractSpecNameFromLogPath(uri.fsPath);
      if (specName && this.onLogsChangedCallback) {
        this.logger.log(`Implementation log changed for spec: ${specName}`);
        this.onLogsChangedCallback(specName);
      }
    };

    this.logWatcher.onDidCreate(handleLogChange);
    this.logWatcher.onDidChange(handleLogChange);
    this.logWatcher.onDidDelete(handleLogChange);
  }

  /**
   * Extract spec name from log file path
   * Path format: .spec-workflow/specs/{specName}/implementation-log.json
   */
  private extractSpecNameFromLogPath(filePath: string): string | null {
    if (!this.specWorkflowRoot) {
      return null;
    }

    const normalizedPath = filePath.replace(/\\/g, '/');
    const normalizedRoot = this.specWorkflowRoot.replace(/\\/g, '/');

    const specsDir = path.join(normalizedRoot, 'specs').replace(/\\/g, '/');

    if (normalizedPath.includes(specsDir) && normalizedPath.endsWith('/implementation-log.json')) {
      const relativePath = normalizedPath.substring(specsDir.length + 1);
      const pathParts = relativePath.split('/');

      if (pathParts.length >= 2 && pathParts[pathParts.length - 1] === 'implementation-log.json') {
        return pathParts[0]; // Return the spec name (first directory)
      }
    }

    return null;
  }

  /**
   * Load implementation log from file
   */
  private async loadLog(specName: string): Promise<ImplementationLog> {
    if (!this.specWorkflowRoot) {
      return { entries: [], lastUpdated: new Date().toISOString() };
    }

    const logPath = path.join(
      this.specWorkflowRoot,
      'specs',
      specName,
      'implementation-log.json'
    );

    try {
      const content = await fs.readFile(logPath, 'utf-8');
      return JSON.parse(content) as ImplementationLog;
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        // File doesn't exist yet, return empty log
        return { entries: [], lastUpdated: new Date().toISOString() };
      }
      this.logger.log(`Error loading log for spec ${specName}: ${error.message}`);
      return { entries: [], lastUpdated: new Date().toISOString() };
    }
  }

  /**
   * Get all implementation logs for a spec
   */
  async getLogs(specName: string): Promise<ImplementationLogEntry[]> {
    const log = await this.loadLog(specName);
    return log.entries;
  }

  /**
   * Search logs by query string
   */
  async searchLogs(specName: string, query: string): Promise<ImplementationLogEntry[]> {
    const log = await this.loadLog(specName);
    const lowerQuery = query.toLowerCase();

    return log.entries.filter(e => {
      // Search in summary, taskId, and files
      if (
        e.summary.toLowerCase().includes(lowerQuery) ||
        e.taskId.toLowerCase().includes(lowerQuery) ||
        e.filesModified.some(f => f.toLowerCase().includes(lowerQuery)) ||
        e.filesCreated.some(f => f.toLowerCase().includes(lowerQuery))
      ) {
        return true;
      }

      // Search in artifacts
      if (e.artifacts) {
        // Search API endpoints
        if (e.artifacts.apiEndpoints?.some(api =>
          api.method.toLowerCase().includes(lowerQuery) ||
          api.path.toLowerCase().includes(lowerQuery) ||
          api.purpose.toLowerCase().includes(lowerQuery) ||
          api.location.toLowerCase().includes(lowerQuery) ||
          (api.requestFormat && api.requestFormat.toLowerCase().includes(lowerQuery)) ||
          (api.responseFormat && api.responseFormat.toLowerCase().includes(lowerQuery))
        )) {
          return true;
        }

        // Search components
        if (e.artifacts.components?.some(comp =>
          comp.name.toLowerCase().includes(lowerQuery) ||
          comp.type.toLowerCase().includes(lowerQuery) ||
          comp.purpose.toLowerCase().includes(lowerQuery) ||
          comp.location.toLowerCase().includes(lowerQuery) ||
          (comp.props && comp.props.toLowerCase().includes(lowerQuery)) ||
          (comp.exports?.some(exp => exp.toLowerCase().includes(lowerQuery)))
        )) {
          return true;
        }

        // Search functions
        if (e.artifacts.functions?.some(func =>
          func.name.toLowerCase().includes(lowerQuery) ||
          func.purpose.toLowerCase().includes(lowerQuery) ||
          func.location.toLowerCase().includes(lowerQuery) ||
          (func.signature && func.signature.toLowerCase().includes(lowerQuery))
        )) {
          return true;
        }

        // Search classes
        if (e.artifacts.classes?.some(cls =>
          cls.name.toLowerCase().includes(lowerQuery) ||
          cls.purpose.toLowerCase().includes(lowerQuery) ||
          cls.location.toLowerCase().includes(lowerQuery) ||
          (cls.methods?.some(method => method.toLowerCase().includes(lowerQuery)))
        )) {
          return true;
        }

        // Search integrations
        if (e.artifacts.integrations?.some(intg =>
          intg.description.toLowerCase().includes(lowerQuery) ||
          intg.frontendComponent.toLowerCase().includes(lowerQuery) ||
          intg.backendEndpoint.toLowerCase().includes(lowerQuery) ||
          intg.dataFlow.toLowerCase().includes(lowerQuery)
        )) {
          return true;
        }
      }

      return false;
    });
  }

  /**
   * Get logs for a specific task
   */
  async getTaskLogs(specName: string, taskId: string): Promise<ImplementationLogEntry[]> {
    const logs = await this.getLogs(specName);
    return logs.filter(e => e.taskId === taskId);
  }

  /**
   * Get statistics for all logs in a spec
   */
  async getLogsStats(specName: string) {
    const logs = await this.getLogs(specName);

    if (logs.length === 0) {
      return {
        totalEntries: 0,
        totalLinesAdded: 0,
        totalLinesRemoved: 0,
        totalFilesChanged: 0
      };
    }

    return {
      totalEntries: logs.length,
      totalLinesAdded: logs.reduce((sum, e) => sum + e.statistics.linesAdded, 0),
      totalLinesRemoved: logs.reduce((sum, e) => sum + e.statistics.linesRemoved, 0),
      totalFilesChanged: logs.reduce((sum, e) => sum + e.statistics.filesChanged, 0)
    };
  }

  /**
   * Get unique task IDs from logs
   */
  async getUniqueTasks(specName: string): Promise<string[]> {
    const logs = await this.getLogs(specName);
    const taskIds = new Set(logs.map(e => e.taskId));
    return Array.from(taskIds);
  }

  /**
   * Dispose of watchers and cleanup
   */
  dispose() {
    if (this.logWatcher) {
      this.logWatcher.dispose();
      this.logWatcher = null;
    }
  }
}
