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
   * Setup file watcher for implementation log files (markdown format)
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

    // Watch for markdown files in Implementation Logs directories
    const logPattern = new vscode.RelativePattern(
      path.join(this.specWorkflowRoot, 'specs'),
      '**/Implementation Logs/*.md'
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
   * Path format: .spec-workflow/specs/{specName}/Implementation Logs/*.md
   */
  private extractSpecNameFromLogPath(filePath: string): string | null {
    if (!this.specWorkflowRoot) {
      return null;
    }

    const normalizedPath = filePath.replace(/\\/g, '/');
    const normalizedRoot = this.specWorkflowRoot.replace(/\\/g, '/');

    const specsDir = path.join(normalizedRoot, 'specs').replace(/\\/g, '/');

    if (normalizedPath.includes(specsDir) && normalizedPath.includes('/Implementation Logs/')) {
      const relativePath = normalizedPath.substring(specsDir.length + 1);
      const pathParts = relativePath.split('/');

      // Path structure: {specName}/Implementation Logs/{filename}.md
      if (pathParts.length >= 3 && pathParts[1] === 'Implementation Logs' && pathParts[2].endsWith('.md')) {
        return pathParts[0]; // Return the spec name (first directory)
      }
    }

    return null;
  }

  /**
   * Load implementation logs from markdown files in Implementation Logs directory
   */
  private async loadLog(specName: string): Promise<ImplementationLog> {
    if (!this.specWorkflowRoot) {
      return { entries: [], lastUpdated: new Date().toISOString() };
    }

    const logsDir = path.join(
      this.specWorkflowRoot,
      'specs',
      specName,
      'Implementation Logs'
    );

    try {
      const files = await fs.readdir(logsDir);
      const mdFiles = files.filter(f => f.endsWith('.md'));

      const entries: ImplementationLogEntry[] = [];

      for (const file of mdFiles) {
        try {
          const filePath = path.join(logsDir, file);
          const content = await fs.readFile(filePath, 'utf-8');
          // Parse markdown content - extract metadata
          const entry = this.parseMarkdownLog(content);
          if (entry) {
            entries.push(entry);
          }
        } catch (error) {
          this.logger.log(`Error reading log file ${file}: ${error}`);
        }
      }

      // Sort by timestamp (newest first)
      entries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      return {
        entries,
        lastUpdated: new Date().toISOString()
      };
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        // Directory doesn't exist yet, return empty log
        return { entries: [], lastUpdated: new Date().toISOString() };
      }
      this.logger.log(`Error loading logs for spec ${specName}: ${error.message}`);
      return { entries: [], lastUpdated: new Date().toISOString() };
    }
  }

  /**
   * Parse markdown log file to extract structured data including artifacts
   */
  private parseMarkdownLog(content: string): ImplementationLogEntry | null {
    try {
      const lines = content.split('\n');
      let idValue = '';
      let taskId = '';
      let summary = '';
      let timestamp = '';
      let linesAdded = 0;
      let linesRemoved = 0;
      let filesChanged = 0;
      const filesModified: string[] = [];
      const filesCreated: string[] = [];
      const artifacts: ImplementationLogEntry['artifacts'] = {};

      let currentSection = '';
      let currentArtifactType: keyof ImplementationLogEntry['artifacts'] | null = null;
      let currentItem: any = {};

      // Helper function to normalize markdown keys to camelCase
      const normalizeKey = (key: string): string => {
        const words = key.toLowerCase().trim().split(/\s+/);
        if (words.length === 0) return '';
        return words[0] + words.slice(1).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('');
      };

      // Helper function to map markdown property names to TypeScript interface property names
      const mapPropertyName = (normalizedKey: string): string => {
        const mapping: Record<string, string> = {
          'exported': 'isExported'
        };
        return mapping[normalizedKey] || normalizedKey;
      };

      // Helper function to convert string values to appropriate types
      const convertValue = (key: string, value: string): any => {
        if (value === 'Yes' || value === 'yes') return true;
        if (value === 'No' || value === 'no') return false;
        if (value === 'N/A' || value === 'n/a') return '';
        return value;
      };

      // Helper function to parse key-value lines "- **Key:** value"
      const parseKeyValue = (line: string): { key: string; value: string } | null => {
        const match = line.match(/^- \*\*([^:]+):\*\* (.*)$/);
        if (match) {
          return {
            key: normalizeKey(match[1]),
            value: match[2].trim()
          };
        }
        return null;
      };

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Parse metadata
        if (line.includes('**Log ID:**')) {
          idValue = line.split('**Log ID:**')[1]?.trim() || '';
        }
        if (line.startsWith('# Implementation Log: Task')) {
          taskId = line.split('Task ')[1] || '';
        }
        if (line.includes('**Summary:**')) {
          summary = line.split('**Summary:**')[1]?.trim() || '';
        }
        if (line.includes('**Timestamp:**')) {
          timestamp = line.split('**Timestamp:**')[1]?.trim() || new Date().toISOString();
        }
        if (line.includes('**Lines Added:**')) {
          const match = line.match(/\+(\d+)/);
          linesAdded = match ? parseInt(match[1]) : 0;
        }
        if (line.includes('**Lines Removed:**')) {
          const match = line.match(/-(\d+)/);
          linesRemoved = match ? parseInt(match[1]) : 0;
        }
        if (line.includes('**Files Changed:**')) {
          const match = line.match(/(\d+)/);
          filesChanged = match ? parseInt(match[1]) : 0;
        }

        // Parse sections (## headers)
        if (line.startsWith('## Files Modified')) {
          currentSection = 'filesModified';
          currentArtifactType = null;
        } else if (line.startsWith('## Files Created')) {
          currentSection = 'filesCreated';
          currentArtifactType = null;
        } else if (line.startsWith('## Artifacts')) {
          currentSection = 'artifacts';
          currentArtifactType = null;
        }
        // Parse artifact subsections (### headers)
        else if (line.startsWith('### ')) {
          if (Object.keys(currentItem).length > 0 && currentArtifactType) {
            if (!artifacts[currentArtifactType]) artifacts[currentArtifactType] = [];
            (artifacts[currentArtifactType] as any).push(currentItem);
            currentItem = {};
          }

          const sectionName = line.slice(4).toLowerCase();
          if (sectionName.includes('api endpoint')) {
            currentArtifactType = 'apiEndpoints';
          } else if (sectionName.includes('component')) {
            currentArtifactType = 'components';
          } else if (sectionName.includes('function')) {
            currentArtifactType = 'functions';
          } else if (sectionName.includes('class')) {
            currentArtifactType = 'classes';
          } else if (sectionName.includes('integration')) {
            currentArtifactType = 'integrations';
          }
        }
        // Parse artifact item headers (#### for individual items)
        else if (line.startsWith('#### ') && currentArtifactType) {
          if (Object.keys(currentItem).length > 0) {
            if (!artifacts[currentArtifactType]) artifacts[currentArtifactType] = [];
            (artifacts[currentArtifactType] as any).push(currentItem);
          }
          currentItem = {};

          const itemHeader = line.slice(5).trim();

          if (currentArtifactType === 'apiEndpoints') {
            const parts = itemHeader.split(' ');
            if (parts.length >= 2) {
              currentItem.method = parts[0];
              currentItem.path = parts.slice(1).join(' ');
            } else {
              currentItem.name = itemHeader;
            }
          } else {
            currentItem.name = itemHeader;
          }
        }
        // Parse file lists
        else if ((currentSection === 'filesModified' || currentSection === 'filesCreated') &&
                 line.startsWith('- ') && !line.includes('_No files')) {
          const fileName = line.slice(2).trim();
          if (currentSection === 'filesModified') {
            filesModified.push(fileName);
          } else {
            filesCreated.push(fileName);
          }
        }
        // Parse artifact key-value details
        else if (currentArtifactType && line.startsWith('- **')) {
          const kv = parseKeyValue(line);
          if (kv) {
            const mappedKey = mapPropertyName(kv.key);

            if (mappedKey === 'exports' || mappedKey === 'methods') {
              const items = kv.value.split(',').map(s => s.trim()).filter(s => s.length > 0);
              currentItem[mappedKey] = items;
            } else {
              const convertedValue = convertValue(mappedKey, kv.value);
              currentItem[mappedKey] = convertedValue;
            }
          }
        }
      }

      // Save last artifact item
      if (Object.keys(currentItem).length > 0 && currentArtifactType) {
        if (!artifacts[currentArtifactType]) artifacts[currentArtifactType] = [];
        (artifacts[currentArtifactType] as any).push(currentItem);
      }

      if (!taskId || !idValue) {
        return null;
      }

      return {
        id: idValue,
        taskId,
        timestamp,
        summary,
        filesModified,
        filesCreated,
        statistics: {
          linesAdded,
          linesRemoved,
          filesChanged
        },
        artifacts
      };
    } catch (error) {
      this.logger.log(`Error parsing markdown log: ${error}`);
      return null;
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
