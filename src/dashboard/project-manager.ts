import { EventEmitter } from 'events';
import chokidar from 'chokidar';
import { SpecParser } from './parser.js';
import { SpecWatcher } from './watcher.js';
import { ApprovalStorage } from './approval-storage.js';
import { SpecArchiveService } from '../core/archive-service.js';
import { ProjectRegistry, ProjectRegistryEntry, generateProjectId } from '../core/project-registry.js';

export interface ProjectContext {
  projectId: string;
  projectPath: string;
  projectName: string;
  parser: SpecParser;
  watcher: SpecWatcher;
  approvalStorage: ApprovalStorage;
  archiveService: SpecArchiveService;
}

export class ProjectManager extends EventEmitter {
  private registry: ProjectRegistry;
  private projects: Map<string, ProjectContext> = new Map();
  private registryWatcher?: chokidar.FSWatcher;
  private cleanupInterval?: NodeJS.Timeout;

  constructor() {
    super();
    this.registry = new ProjectRegistry();
  }

  /**
   * Initialize the project manager
   * Loads projects from registry and starts watching for changes
   */
  async initialize(): Promise<void> {
    // Clean up stale projects first
    await this.registry.cleanupStaleProjects();

    // Load all projects from registry
    await this.loadProjectsFromRegistry();

    // Watch registry file for changes
    this.startRegistryWatcher();

    // Periodic cleanup every 30 seconds
    this.cleanupInterval = setInterval(async () => {
      await this.cleanupStaleProjects();
    }, 30000);
  }

  /**
   * Load all projects from the registry
   */
  private async loadProjectsFromRegistry(): Promise<void> {
    const entries = await this.registry.getAllProjects();

    for (const entry of entries) {
      if (!this.projects.has(entry.projectId)) {
        await this.addProject(entry);
      }
    }
  }

  /**
   * Start watching the registry file for changes
   */
  private startRegistryWatcher(): void {
    const registryPath = this.registry.getRegistryPath();

    this.registryWatcher = chokidar.watch(registryPath, {
      ignoreInitial: true,
      persistent: true,
      ignorePermissionErrors: true
    });

    this.registryWatcher.on('change', async () => {
      await this.syncWithRegistry();
    });

    this.registryWatcher.on('add', async () => {
      await this.syncWithRegistry();
    });
  }

  /**
   * Sync current projects with registry
   * Add new projects, remove deleted ones
   */
  private async syncWithRegistry(): Promise<void> {
    try {
      const entries = await this.registry.getAllProjects();
      const registryIds = new Set(entries.map(e => e.projectId));
      const currentIds = new Set(this.projects.keys());

      // Add new projects
      for (const entry of entries) {
        if (!currentIds.has(entry.projectId)) {
          await this.addProject(entry);
        }
      }

      // Remove deleted projects
      for (const projectId of currentIds) {
        if (!registryIds.has(projectId)) {
          await this.removeProject(projectId);
        }
      }

      // Emit projects update event
      this.emit('projects-update', this.getProjectsList());
    } catch (error) {
      console.error('Error syncing with registry:', error);
    }
  }

  /**
   * Add a project context
   */
  private async addProject(entry: ProjectRegistryEntry): Promise<void> {
    try {
      const parser = new SpecParser(entry.projectPath);
      const watcher = new SpecWatcher(entry.projectPath, parser);
      const approvalStorage = new ApprovalStorage(entry.projectPath);
      const archiveService = new SpecArchiveService(entry.projectPath);

      // Start watchers
      await watcher.start();
      await approvalStorage.start();

      // Forward events with projectId
      watcher.on('change', (event) => {
        this.emit('spec-change', { projectId: entry.projectId, ...event });
      });

      watcher.on('task-update', (event) => {
        this.emit('task-update', { projectId: entry.projectId, ...event });
      });

      watcher.on('steering-change', (event) => {
        this.emit('steering-change', { projectId: entry.projectId, ...event });
      });

      approvalStorage.on('approval-change', () => {
        this.emit('approval-change', { projectId: entry.projectId });
      });

      const context: ProjectContext = {
        projectId: entry.projectId,
        projectPath: entry.projectPath,
        projectName: entry.projectName,
        parser,
        watcher,
        approvalStorage,
        archiveService
      };

      this.projects.set(entry.projectId, context);
      console.error(`Project added: ${entry.projectName} (${entry.projectId})`);

      // Emit project added event
      this.emit('project-added', entry.projectId);
    } catch (error) {
      console.error(`Failed to add project ${entry.projectName}:`, error);
    }
  }

  /**
   * Remove a project context
   */
  private async removeProject(projectId: string): Promise<void> {
    const context = this.projects.get(projectId);
    if (!context) return;

    try {
      // Stop watchers
      await context.watcher.stop();
      await context.approvalStorage.stop();

      // Remove all listeners
      context.watcher.removeAllListeners();
      context.approvalStorage.removeAllListeners();

      this.projects.delete(projectId);
      console.error(`Project removed: ${context.projectName} (${projectId})`);

      // Emit project removed event
      this.emit('project-removed', projectId);
    } catch (error) {
      console.error(`Failed to remove project ${projectId}:`, error);
    }
  }

  /**
   * Clean up stale projects (dead processes)
   */
  private async cleanupStaleProjects(): Promise<void> {
    const removedCount = await this.registry.cleanupStaleProjects();
    if (removedCount > 0) {
      // Registry changed, sync will be triggered by watcher
      console.error(`Cleaned up ${removedCount} stale project(s)`);
    }
  }

  /**
   * Get a project context by ID
   */
  getProject(projectId: string): ProjectContext | undefined {
    return this.projects.get(projectId);
  }

  /**
   * Get all project contexts
   */
  getAllProjects(): ProjectContext[] {
    return Array.from(this.projects.values());
  }

  /**
   * Get projects list for API
   */
  getProjectsList(): Array<{ projectId: string; projectName: string; projectPath: string }> {
    return Array.from(this.projects.values()).map(p => ({
      projectId: p.projectId,
      projectName: p.projectName,
      projectPath: p.projectPath
    }));
  }

  /**
   * Manually add a project by path
   */
  async addProjectByPath(projectPath: string): Promise<string> {
    const entry = await this.registry.getProject(projectPath);
    if (entry) {
      // Already registered
      if (!this.projects.has(entry.projectId)) {
        await this.addProject(entry);
      }
      return entry.projectId;
    }

    // Register new project (with dummy PID since it's manual)
    const projectId = await this.registry.registerProject(projectPath, process.pid);

    // Get the entry and add it
    const newEntry = await this.registry.getProjectById(projectId);
    if (newEntry) {
      await this.addProject(newEntry);
    }

    return projectId;
  }

  /**
   * Manually remove a project
   */
  async removeProjectById(projectId: string): Promise<void> {
    await this.removeProject(projectId);
    await this.registry.unregisterProjectById(projectId);
  }

  /**
   * Stop the project manager
   */
  async stop(): Promise<void> {
    // Stop cleanup interval
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = undefined;
    }

    // Stop registry watcher
    if (this.registryWatcher) {
      this.registryWatcher.removeAllListeners();
      await this.registryWatcher.close();
      this.registryWatcher = undefined;
    }

    // Stop all projects
    const projectIds = Array.from(this.projects.keys());
    for (const projectId of projectIds) {
      await this.removeProject(projectId);
    }

    // Remove all listeners
    this.removeAllListeners();
  }
}
