import { promises as fs } from 'fs';
import { join } from 'path';
import { ImplementationLog, ImplementationLogEntry } from '../types.js';
import { appendFileSync, existsSync } from 'fs';

/**
 * Migrates implementation logs from JSON format to individual markdown files
 * This utility class handles the automatic migration when the MCP server starts
 */
export class ImplementationLogMigrator {
  private migrationLogPath: string;

  constructor(userDataDir: string) {
    this.migrationLogPath = join(userDataDir, 'migration.log');
  }

  /**
   * Log migration events
   */
  private log(message: string): void {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}\n`;
    appendFileSync(this.migrationLogPath, logMessage, 'utf-8');
  }

  /**
   * Sanitize taskId for use in filenames (e.g., "1.2" → "1-2")
   */
  private sanitizeTaskId(taskId: string): string {
    return taskId.replace(/[/.]/g, '-');
  }

  /**
   * Generate markdown filename for a log entry
   */
  private generateFileName(entry: ImplementationLogEntry): string {
    const sanitizedTaskId = this.sanitizeTaskId(entry.taskId);
    const dateObj = new Date(entry.timestamp);
    const timestamp = dateObj.toISOString().replace(/[:.]/g, '').split('T')[0] +
                      dateObj.toISOString().split('T')[1].replace(/[:.Z]/g, '').substring(0, 6);
    const idPrefix = entry.id.substring(0, 8);
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
   * Migrate a single JSON file to markdown files
   */
  private async migrateJsonFile(jsonPath: string, outputDir: string): Promise<{ success: boolean; count: number; error?: string }> {
    try {
      // Read the JSON file
      const content = await fs.readFile(jsonPath, 'utf-8');
      const log: ImplementationLog = JSON.parse(content);

      // Ensure output directory exists
      await fs.mkdir(outputDir, { recursive: true });

      // Convert each entry to a markdown file
      let count = 0;
      for (const entry of log.entries) {
        const fileName = this.generateFileName(entry);
        const filePath = join(outputDir, fileName);
        const markdown = this.entryToMarkdown(entry);

        await fs.writeFile(filePath, markdown, 'utf-8');
        count++;
      }

      this.log(`✓ Migrated ${count} entries from ${jsonPath} to ${outputDir}`);
      return { success: true, count };
    } catch (error: any) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      this.log(`✗ Failed to migrate ${jsonPath}: ${errorMsg}`);
      return { success: false, count: 0, error: errorMsg };
    }
  }

  /**
   * Scan all specs and migrate their implementation logs
   */
  async migrateAllSpecs(specsDir: string): Promise<{
    totalSpecs: number;
    migratedSpecs: number;
    totalEntries: number;
    errors: Array<{ spec: string; error: string }>;
  }> {
    this.log('='.repeat(80));
    this.log('Starting implementation logs migration from JSON to Markdown format');
    this.log(`Specs directory: ${specsDir}`);
    this.log('='.repeat(80));

    const result = {
      totalSpecs: 0,
      migratedSpecs: 0,
      totalEntries: 0,
      errors: [] as Array<{ spec: string; error: string }>
    };

    try {
      // Check if specs directory exists
      if (!existsSync(specsDir)) {
        this.log('Specs directory does not exist. Skipping migration.');
        return result;
      }

      // List all spec directories
      const entries = await fs.readdir(specsDir, { withFileTypes: true });
      const specDirs = entries.filter(e => e.isDirectory());

      result.totalSpecs = specDirs.length;

      // Process each spec
      for (const specDir of specDirs) {
        const specPath = join(specsDir, specDir.name);
        const jsonPath = join(specPath, 'implementation-log.json');
        const outputDir = join(specPath, 'Implementation Logs');

        // Check if JSON file exists
        if (!existsSync(jsonPath)) {
          this.log(`⊘ Spec "${specDir.name}": No implementation-log.json found. Skipping.`);
          continue;
        }

        // Migrate this spec's JSON file
        const migrationResult = await this.migrateJsonFile(jsonPath, outputDir);

        if (migrationResult.success) {
          result.migratedSpecs++;
          result.totalEntries += migrationResult.count;

          // Delete the JSON file after successful migration
          try {
            await fs.unlink(jsonPath);
            this.log(`→ Deleted original JSON file: ${jsonPath}`);
          } catch (error: any) {
            this.log(`⚠ Warning: Could not delete ${jsonPath}: ${error.message}`);
          }
        } else {
          result.errors.push({
            spec: specDir.name,
            error: migrationResult.error || 'Unknown error'
          });
        }
      }

      // Summary
      this.log('='.repeat(80));
      this.log(`Migration Summary:`);
      this.log(`  Total specs found: ${result.totalSpecs}`);
      this.log(`  Successfully migrated: ${result.migratedSpecs}`);
      this.log(`  Total entries migrated: ${result.totalEntries}`);
      this.log(`  Errors: ${result.errors.length}`);

      if (result.errors.length > 0) {
        this.log('Errors encountered:');
        result.errors.forEach(err => {
          this.log(`  - ${err.spec}: ${err.error}`);
        });
      }

      this.log('='.repeat(80));
    } catch (error: any) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      this.log(`Fatal error during migration: ${errorMsg}`);
      result.errors.push({
        spec: 'migration-process',
        error: errorMsg
      });
    }

    return result;
  }
}
