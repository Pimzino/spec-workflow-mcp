import { EventEmitter } from 'events';
import chokidar from 'chokidar';
import { stat } from 'fs/promises';
import { PathUtils } from '../core/path-utils.js';
import { SpecParser, ParsedSpec } from './parser.js';

export interface SpecChangeEvent {
  type: 'spec' | 'steering';
  action: 'created' | 'updated' | 'deleted';
  name: string;
  data?: ParsedSpec | any;
}

export class SpecWatcher extends EventEmitter {
  private projectPath: string;
  private parser: SpecParser;
  private watcher?: chokidar.FSWatcher;
  private pendingChanges: Map<string, { action: 'created' | 'updated' | 'deleted'; timer: NodeJS.Timeout }> = new Map();
  private readonly DEBOUNCE_MS = 500;

  constructor(projectPath: string, parser: SpecParser) {
    super();
    // Path should already be translated by caller (ProjectManager)
    this.projectPath = projectPath;
    this.parser = parser;
  }

  async start(): Promise<void> {
    const workflowRoot = PathUtils.getWorkflowRoot(this.projectPath);
    const specsPath = PathUtils.getSpecPath(this.projectPath, '');
    const steeringPath = PathUtils.getSteeringPath(this.projectPath);

    // Watch for changes in specs and steering directories
    this.watcher = chokidar.watch([
      `${specsPath}/**/*.md`,
      `${steeringPath}/*.md`
    ], {
      ignoreInitial: true,
      persistent: true,
      ignorePermissionErrors: true
    });

    this.watcher.on('add', (filePath) => this.scheduleFileChange('created', filePath));
    this.watcher.on('change', (filePath) => this.scheduleFileChange('updated', filePath));
    this.watcher.on('unlink', (filePath) => this.scheduleFileChange('deleted', filePath));
    
    // Add error handler to prevent watcher crashes
    this.watcher.on('error', (error) => {
      console.error('File watcher error:', error);
      // Don't propagate error to prevent system crash
    });

    // File watcher started for workflow directories
  }

  async stop(): Promise<void> {
    // Clear all pending debounced changes
    for (const { timer } of this.pendingChanges.values()) {
      clearTimeout(timer);
    }
    this.pendingChanges.clear();

    if (this.watcher) {
      // Remove all listeners before closing to prevent memory leaks
      this.watcher.removeAllListeners();
      await this.watcher.close();
      this.watcher = undefined;
      // File watcher stopped
    }

    // Clean up EventEmitter listeners
    this.removeAllListeners();
  }

  /**
   * Schedule a debounced file change event
   * Coalesces rapid changes to the same file
   */
  private scheduleFileChange(action: 'created' | 'updated' | 'deleted', filePath: string): void {
    const existing = this.pendingChanges.get(filePath);
    if (existing) {
      clearTimeout(existing.timer);
    }

    // Use latest action, but preserve 'created' if that was the first action
    const finalAction = action === 'deleted' ? 'deleted' : (existing?.action === 'created' ? 'created' : action);

    const timer = setTimeout(() => {
      this.pendingChanges.delete(filePath);
      this.handleFileChange(finalAction, filePath);
    }, this.DEBOUNCE_MS);

    this.pendingChanges.set(filePath, { action: finalAction, timer });
  }

  /**
   * Wait for file size to stabilize before processing
   * Returns true if file is stable, false if file doesn't exist or timeout reached
   */
  private async waitForFileStability(filePath: string, maxWaitMs: number = 2000): Promise<boolean> {
    const checkInterval = 100;
    let lastSize = -1;
    let stableCount = 0;
    const requiredStableChecks = 3; // File must be stable for 300ms

    for (let waited = 0; waited < maxWaitMs; waited += checkInterval) {
      try {
        const stats = await stat(filePath);
        if (stats.size === lastSize) {
          stableCount++;
          if (stableCount >= requiredStableChecks) {
            return true;
          }
        } else {
          stableCount = 0;
          lastSize = stats.size;
        }
      } catch {
        // File might be deleted or in transition
        return false;
      }
      await new Promise(resolve => setTimeout(resolve, checkInterval));
    }

    // Return true if we had at least one stable check (file exists and has content)
    return stableCount >= 1;
  }

  private async handleFileChange(action: 'created' | 'updated' | 'deleted', filePath: string): Promise<void> {
    try {
      const normalizedPath = filePath.replace(/\\/g, '/');

      // Wait for file stability for creation/updates to ensure file is fully written
      if (action === 'created' || action === 'updated') {
        const isStable = await this.waitForFileStability(filePath);
        if (!isStable) {
          // File may have been deleted or is still being written, skip this update
          console.error(`File not stable, skipping: ${filePath}`);
          return;
        }
      }

      // Determine if this is a spec or steering change
      if (normalizedPath.includes('/specs/')) {
        await this.handleSpecChange(action, normalizedPath);
      } else if (normalizedPath.includes('/steering/')) {
        await this.handleSteeringChange(action, normalizedPath);
      }
    } catch (error) {
      console.error(`Error handling file change for ${filePath}:`, error);
      // Don't propagate error to prevent watcher crash
    }
  }

  private async handleSpecChange(action: 'created' | 'updated' | 'deleted', filePath: string): Promise<void> {
    // Extract spec name from path like: /path/to/.spec-workflow/specs/user-auth/requirements.md
    const pathParts = filePath.split('/');
    const specsIndex = pathParts.findIndex(part => part === 'specs');
    
    if (specsIndex === -1 || specsIndex + 1 >= pathParts.length) return;
    
    const specName = pathParts[specsIndex + 1];
    const document = pathParts[specsIndex + 2]?.replace('.md', '');

    let specData: ParsedSpec | null = null;
    if (action !== 'deleted') {
      specData = await this.parser.getSpec(specName);
    }

    const event: SpecChangeEvent = {
      type: 'spec',
      action,
      name: specName,
      data: specData
    };

    // Spec change detected
    this.emit('change', event);
    
    // Emit specific task update event if this was a tasks.md file
    if (document === 'tasks') {
      this.emit('task-update', {
        specName,
        action
      });
    }
  }


  private async handleSteeringChange(action: 'created' | 'updated' | 'deleted', filePath: string): Promise<void> {
    // Extract document name from path like: /path/to/.spec-workflow/steering/tech.md
    const pathParts = filePath.split('/');
    const document = pathParts[pathParts.length - 1]?.replace('.md', '');

    const steeringStatus = await this.parser.getProjectSteeringStatus();

    const event = {
      type: 'steering' as const,
      action,
      name: document,
      steeringStatus
    };

    // Steering change detected
    this.emit('steering-change', event);
  }
}