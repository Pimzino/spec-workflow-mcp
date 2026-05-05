import { EventEmitter } from 'events';
import chokidar from 'chokidar';
import { SpecParser } from './parser.js';
import { SpecWatcher } from './watcher.js';
import { ApprovalStorage } from './approval-storage.js';
import { SpecArchiveService } from '../core/archive-service.js';
import { ProjectRegistry, ProjectRegistryEntry, ProjectInstance } from '../core/project-registry.js';
import { PathUtils } from '../core/path-utils.js';
import { resolveGitRoot, resolveGitWorkspaceRoot } from '../core/git-utils.js';

export interface ProjectContext {
  projectId: string;
  projectPath: string;           // Translated workflow root path for specs/.spec-workflow access
  workspacePath: string;         // Translated workspace/worktree path for file artifact resolution
  originalProjectPath: string;   // Original workspace path for display/registry
  workflowRootPath: string;      // Original workflow root path for display/debugging
  projectName: string;
  instances: ProjectInstance[];  // Active MCP server instances for this project
  parser: SpecParser;
  watcher: SpecWatcher;
  approvalStorage: ApprovalStorage;
  archiveService: SpecArchiveService;
}

export class ProjectManager extends EventEmitter {
  private registry: ProjectRegistry;
  private projects: Map<string, ProjectContext> = new Map();
  private registryWatcher?: chokidar.FSWatcher;

  constructor() {
    super();
    this.registry = new ProjectRegistry();
  }

  /**
   * Initialize the project manager
   * Loads projects from registry and starts watching for changes
   * Note: MCP servers handle their own lifecycle cleanup via stop()
   */
  async initialize(): Promise<void> {
    // Clean up stale instances once at startup (self-healing for crashes)
    await this.registry.cleanupStaleProjects();

    // Load all projects from registry
    await this.loadProjectsFromRegistry();

    // Watch registry file for changes
    this.startRegistryWatcher();

    // Note: Removed periodic cleanup interval
    // MCP servers are responsible for cleaning up their own instances on stop()
    // The cleanup at startup handles any orphaned instances from crashes
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

    // Add error handler to prevent watcher crashes
    this.registryWatcher.on('error', (error) => {
      console.error('Registry watcher error:', error);
      // Don't propagate error to prevent system crash
    });
  }

  /**
   * Sync current projects with registry
   * Add new projects, remove deleted ones, update instances for existing projects
   */
  private async syncWithRegistry(): Promise<void> {
    try {
      const entries = await this.registry.getAllProjects();
      const registryIds = new Set(entries.map(e => e.projectId));
      const currentIds = new Set(this.projects.keys());

      // Add new projects or update instances for existing ones
      for (const entry of entries) {
        if (!currentIds.has(entry.projectId)) {
          await this.addProject(entry);
        } else {
          // Update instances for existing project
          const project = this.projects.get(entry.projectId);
          if (project) {
            project.projectName = entry.projectName;
            project.originalProjectPath = entry.projectPath;
            project.workflowRootPath = entry.workflowRootPath;
            project.projectPath = PathUtils.translatePath(entry.workflowRootPath);
            project.workspacePath = PathUtils.translatePath(entry.projectPath);
            project.instances = entry.instances || [];
          }
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
      // Translate paths once at entry point (components should not know about Docker)
      const translatedWorkspacePath = PathUtils.translatePath(entry.projectPath);
      const translatedWorkflowRootPath = PathUtils.translatePath(entry.workflowRootPath);

      const parser = new SpecParser(translatedWorkflowRootPath);
      const watcher = new SpecWatcher(translatedWorkflowRootPath, parser);
      const approvalStorage = new ApprovalStorage(translatedWorkflowRootPath, {
        originalPath: entry.workflowRootPath,
        fileResolutionPath: translatedWorkspacePath
      });
      const archiveService = new SpecArchiveService(translatedWorkflowRootPath);

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
        projectPath: translatedWorkflowRootPath,
        workspacePath: translatedWorkspacePath,
        originalProjectPath: entry.projectPath, // Keep workspace path for display/registry
        workflowRootPath: entry.workflowRootPath,
        projectName: entry.projectName,
        instances: entry.instances || [],       // Track MCP server instances
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
  getProjectsList(): Array<{
    projectId: string;
    projectName: string;
    projectPath: string;
    instances: ProjectInstance[];
  }> {
    return Array.from(this.projects.values()).map(p => ({
      projectId: p.projectId,
      projectName: p.projectName,
      projectPath: p.originalProjectPath,  // Return original path for display
      instances: p.instances
    }));
  }

  /**
   * Manually add a project by path
   */
  async addProjectByPath(projectPath: string): Promise<string> {
    const workspacePath = resolveGitWorkspaceRoot(projectPath);
    const workflowRootPath = resolveGitRoot(workspacePath);

    const entry = await this.registry.getProject(workspacePath);
    if (entry) {
      // Already registered
      if (!this.projects.has(entry.projectId)) {
        await this.addProject(entry);
      }
      return entry.projectId;
    }

    // Register new project (with dummy PID since it's manual)
    const projectId = await this.registry.registerProject(workspacePath, process.pid, {
      workflowRootPath
    });

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
