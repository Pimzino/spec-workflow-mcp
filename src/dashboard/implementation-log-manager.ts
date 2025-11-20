import { promises as fs } from 'fs';
import { join } from 'path';
import { ImplementationLog, ImplementationLogEntry } from '../types.js';
import { randomUUID } from 'crypto';

/**
 * Manager for implementation logs using markdown file format
 * Each implementation log entry is stored as an individual markdown file
 * in the spec's "Implementation Logs" directory
 */
export class ImplementationLogManager {
  private specPath: string;
  private logsDir: string;

  constructor(specPath: string) {
    this.specPath = specPath;
    this.logsDir = join(specPath, 'Implementation Logs');
  }

  /**
   * Ensure the Implementation Logs directory exists
   */
  private async ensureLogsDir(): Promise<void> {
    try {
      await fs.mkdir(this.logsDir, { recursive: true });
    } catch (error) {
      // Directory might already exist, ignore
    }
  }

  /**
   * Parse markdown filename to extract taskId and entry ID
   * Expected format: task-{sanitized-taskId}_{timestamp}_{id-prefix}.md
   */
  private parseFileName(fileName: string): { taskId?: string; id?: string } | null {
    if (!fileName.endsWith('.md')) return null;

    const baseName = fileName.slice(0, -3); // Remove .md extension
    const parts = baseName.split('_');

    if (parts.length < 3 || !parts[0].startsWith('task-')) return null;

    // Reconstruct taskId from the first part (unsanitize)
    const taskIdPart = parts[0].slice(5); // Remove 'task-' prefix
    const taskId = taskIdPart.replace(/-/g, '.').replace(/\.{2,}/g, '.'); // Simple unsanitization

    return { taskId };
  }

  /**
   * Parse markdown content to extract metadata and artifacts
   */
  private parseMarkdownContent(content: string): ImplementationLogEntry | null {
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
        // Convert "Key Name" to camelCase
        const words = key.toLowerCase().trim().split(/\s+/);
        if (words.length === 0) return '';
        return words[0] + words.slice(1).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('');
      };

      // Helper function to map markdown property names to TypeScript interface property names
      const mapPropertyName = (normalizedKey: string): string => {
        const mapping: Record<string, string> = {
          'exported': 'isExported'  // Exported → isExported
        };
        return mapping[normalizedKey] || normalizedKey;
      };

      // Helper function to convert string values to appropriate types
      const convertValue = (key: string, value: string): any => {
        // Convert Yes/No to boolean
        if (value === 'Yes' || value === 'yes') return true;
        if (value === 'No' || value === 'no') return false;

        // Handle N/A as empty string
        if (value === 'N/A' || value === 'n/a') return '';

        return value;
      };

      // Helper function to parse key-value lines "- **Key:** value"
      const parseKeyValue = (line: string): { key: string; value: string } | null => {
        // Match pattern: "- **Key:** value" (asterisks close AFTER colon)
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
          // Save previous item before switching artifact type
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
          // Save previous item
          if (Object.keys(currentItem).length > 0) {
            if (!artifacts[currentArtifactType]) artifacts[currentArtifactType] = [];
            (artifacts[currentArtifactType] as any).push(currentItem);
          }
          currentItem = {};

          const itemHeader = line.slice(5).trim();

          // For API endpoints, extract method and path from header like "GET /api/users"
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
            // Map property name to match TypeScript interface
            const mappedKey = mapPropertyName(kv.key);

            // Handle arrays (exports, methods)
            if (mappedKey === 'exports' || mappedKey === 'methods') {
              const items = kv.value.split(',').map(s => s.trim()).filter(s => s.length > 0);
              currentItem[mappedKey] = items;
            } else {
              // Convert value to appropriate type (Yes/No → boolean, N/A → empty string, etc.)
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

      const entry: ImplementationLogEntry = {
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

      return entry;
    } catch (error) {
      console.error('Error parsing markdown implementation log:', error);
      return null;
    }
  }

  /**
   * Load all implementation logs from markdown files (new format)
   * Also checks for legacy JSON file and returns empty if found (migration handled separately)
   */
  async loadLog(): Promise<ImplementationLog> {
    await this.ensureLogsDir();

    try {
      const files = await fs.readdir(this.logsDir);
      const mdFiles = files.filter(f => f.endsWith('.md'));

      const entries: ImplementationLogEntry[] = [];

      for (const file of mdFiles) {
        try {
          const filePath = join(this.logsDir, file);
          const content = await fs.readFile(filePath, 'utf-8');
          const entry = this.parseMarkdownContent(content);
          if (entry) {
            entries.push(entry);
          }
        } catch (error) {
          console.error(`Error reading log file ${file}:`, error);
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
        // Directory doesn't exist yet
        return {
          entries: [],
          lastUpdated: new Date().toISOString()
        };
      }
      throw error;
    }
  }

  /**
   * Generate markdown filename for a log entry
   */
  private generateFileName(taskId: string, id: string): string {
    const sanitizedTaskId = taskId.replace(/[/.]/g, '-');
    const timestamp = new Date().toISOString().replace(/[:.Z]/g, '').slice(0, 15); // YYYYMMDDHHmmss
    const idPrefix = id.substring(0, 8);
    return `task-${sanitizedTaskId}_${timestamp}_${idPrefix}.md`;
  }

  /**
   * Convert an implementation log entry to markdown format
   */
  private entryToMarkdown(entry: ImplementationLogEntry): string {
    let markdown = `# Implementation Log: Task ${entry.taskId}\n\n`;
    markdown += `**Summary:** ${entry.summary}\n\n`;
    markdown += `**Timestamp:** ${entry.timestamp}\n`;
    markdown += `**Log ID:** ${entry.id}\n\n`;
    markdown += `---\n\n`;

    // Statistics
    markdown += `## Statistics\n\n`;
    markdown += `- **Lines Added:** +${entry.statistics.linesAdded}\n`;
    markdown += `- **Lines Removed:** -${entry.statistics.linesRemoved}\n`;
    markdown += `- **Files Changed:** ${entry.statistics.filesChanged}\n`;
    markdown += `- **Net Change:** ${entry.statistics.linesAdded - entry.statistics.linesRemoved}\n\n`;

    // Files
    markdown += `## Files Modified\n`;
    if (entry.filesModified.length > 0) {
      entry.filesModified.forEach(file => {
        markdown += `- ${file}\n`;
      });
    } else {
      markdown += `_No files modified_\n`;
    }
    markdown += `\n`;

    markdown += `## Files Created\n`;
    if (entry.filesCreated.length > 0) {
      entry.filesCreated.forEach(file => {
        markdown += `- ${file}\n`;
      });
    } else {
      markdown += `_No files created_\n`;
    }
    markdown += `\n`;

    // Artifacts
    markdown += `---\n\n## Artifacts\n\n`;

    if (!entry.artifacts || Object.keys(entry.artifacts).every(key => !entry.artifacts[key as keyof typeof entry.artifacts]?.length)) {
      markdown += `_No artifacts recorded_\n`;
      return markdown;
    }

    // API Endpoints
    if (entry.artifacts.apiEndpoints && entry.artifacts.apiEndpoints.length > 0) {
      markdown += `### API Endpoints\n\n`;
      entry.artifacts.apiEndpoints.forEach(api => {
        markdown += `#### ${api.method} ${api.path}\n`;
        markdown += `- **Purpose:** ${api.purpose}\n`;
        markdown += `- **Location:** ${api.location}\n`;
        if (api.requestFormat) markdown += `- **Request Format:** ${api.requestFormat}\n`;
        if (api.responseFormat) markdown += `- **Response Format:** ${api.responseFormat}\n`;
        markdown += `\n`;
      });
    }

    // Components
    if (entry.artifacts.components && entry.artifacts.components.length > 0) {
      markdown += `### Components\n\n`;
      entry.artifacts.components.forEach(comp => {
        markdown += `#### ${comp.name}\n`;
        markdown += `- **Type:** ${comp.type}\n`;
        markdown += `- **Purpose:** ${comp.purpose}\n`;
        markdown += `- **Location:** ${comp.location}\n`;
        if (comp.props) markdown += `- **Props:** ${comp.props}\n`;
        if (comp.exports && comp.exports.length > 0) markdown += `- **Exports:** ${comp.exports.join(', ')}\n`;
        markdown += `\n`;
      });
    }

    // Functions
    if (entry.artifacts.functions && entry.artifacts.functions.length > 0) {
      markdown += `### Functions\n\n`;
      entry.artifacts.functions.forEach(func => {
        markdown += `#### ${func.name}\n`;
        markdown += `- **Purpose:** ${func.purpose}\n`;
        markdown += `- **Location:** ${func.location}\n`;
        if (func.signature) markdown += `- **Signature:** ${func.signature}\n`;
        markdown += `- **Exported:** ${func.isExported ? 'Yes' : 'No'}\n`;
        markdown += `\n`;
      });
    }

    // Classes
    if (entry.artifacts.classes && entry.artifacts.classes.length > 0) {
      markdown += `### Classes\n\n`;
      entry.artifacts.classes.forEach(cls => {
        markdown += `#### ${cls.name}\n`;
        markdown += `- **Purpose:** ${cls.purpose}\n`;
        markdown += `- **Location:** ${cls.location}\n`;
        if (cls.methods && cls.methods.length > 0) markdown += `- **Methods:** ${cls.methods.join(', ')}\n`;
        markdown += `- **Exported:** ${cls.isExported ? 'Yes' : 'No'}\n`;
        markdown += `\n`;
      });
    }

    // Integrations
    if (entry.artifacts.integrations && entry.artifacts.integrations.length > 0) {
      markdown += `### Integrations\n\n`;
      entry.artifacts.integrations.forEach(intg => {
        markdown += `#### Integration\n`;
        markdown += `- **Description:** ${intg.description}\n`;
        markdown += `- **Frontend Component:** ${intg.frontendComponent}\n`;
        markdown += `- **Backend Endpoint:** ${intg.backendEndpoint}\n`;
        markdown += `- **Data Flow:** ${intg.dataFlow}\n`;
        markdown += `\n`;
      });
    }

    return markdown;
  }

  /**
   * Add a new implementation log entry
   */
  async addLogEntry(entry: Omit<ImplementationLogEntry, 'id'>): Promise<ImplementationLogEntry> {
    await this.ensureLogsDir();

    const newEntry: ImplementationLogEntry = {
      ...entry,
      id: randomUUID()
    };

    const fileName = this.generateFileName(newEntry.taskId, newEntry.id);
    const filePath = join(this.logsDir, fileName);
    const markdown = this.entryToMarkdown(newEntry);

    await fs.writeFile(filePath, markdown, 'utf-8');

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
            api.method?.toLowerCase().includes(keyword) ||
            api.path?.toLowerCase().includes(keyword) ||
            api.purpose?.toLowerCase().includes(keyword) ||
            api.location?.toLowerCase().includes(keyword) ||
            (api.requestFormat && api.requestFormat.toLowerCase().includes(keyword)) ||
            (api.responseFormat && api.responseFormat.toLowerCase().includes(keyword))
          )) {
            return true;
          }

          // Search components
          if (e.artifacts.components?.some(comp =>
            comp.name?.toLowerCase().includes(keyword) ||
            comp.type?.toLowerCase().includes(keyword) ||
            comp.purpose?.toLowerCase().includes(keyword) ||
            comp.location?.toLowerCase().includes(keyword) ||
            (comp.props && comp.props.toLowerCase().includes(keyword)) ||
            (comp.exports?.some(exp => exp.toLowerCase().includes(keyword)))
          )) {
            return true;
          }

          // Search functions
          if (e.artifacts.functions?.some(func =>
            func.name?.toLowerCase().includes(keyword) ||
            func.purpose?.toLowerCase().includes(keyword) ||
            func.location?.toLowerCase().includes(keyword) ||
            (func.signature && func.signature.toLowerCase().includes(keyword))
          )) {
            return true;
          }

          // Search classes
          if (e.artifacts.classes?.some(cls =>
            cls.name?.toLowerCase().includes(keyword) ||
            cls.purpose?.toLowerCase().includes(keyword) ||
            cls.location?.toLowerCase().includes(keyword) ||
            (cls.methods?.some(method => method.toLowerCase().includes(keyword)))
          )) {
            return true;
          }

          // Search integrations
          if (e.artifacts.integrations?.some(intg =>
            intg.description?.toLowerCase().includes(keyword) ||
            intg.frontendComponent?.toLowerCase().includes(keyword) ||
            intg.backendEndpoint?.toLowerCase().includes(keyword) ||
            intg.dataFlow?.toLowerCase().includes(keyword)
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
   * Get the logs directory path
   */
  getLogsDir(): string {
    return this.logsDir;
  }

  /**
   * Get the log file path (for backwards compatibility, now returns the logs directory)
   */
  getLogPath(): string {
    return this.logsDir;
  }
}
