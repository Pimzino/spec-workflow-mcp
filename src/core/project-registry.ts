import { join } from 'path';
import { promises as fs } from 'fs';
import { basename, resolve } from 'path';
import { createHash } from 'crypto';
import { getGlobalDir, getPermissionErrorHelp } from './global-dir.js';

export interface ProjectInstance {
  pid: number;
  registeredAt: string;
}

export interface ProjectRegistryEntry {
  projectId: string;
  projectPath: string;
  projectName: string;
  instances: ProjectInstance[];
}

/**
 * Generate a stable projectId from an absolute path
 * Uses SHA-1 hash encoded as base64url
 */
export function generateProjectId(absolutePath: string): string {
  const hash = createHash('sha1').update(absolutePath).digest('base64url');
  // Take first 16 characters for readability
  return hash.substring(0, 16);
}

export class ProjectRegistry {
  private registryPath: string;
  private registryDir: string;
  private needsInitialization: boolean = false;

  constructor() {
    this.registryDir = getGlobalDir();
    this.registryPath = join(this.registryDir, 'activeProjects.json');
  }

  /**
   * Ensure the registry directory exists
   */
  private async ensureRegistryDir(): Promise<void> {
    try {
      await fs.mkdir(this.registryDir, { recursive: true });
    } catch (error: any) {
      // Directory might already exist, ignore EEXIST errors
      if (error.code === 'EEXIST') {
        return;
      }
      // For permission errors, provide helpful guidance
      if (error.code === 'EACCES' || error.code === 'EPERM') {
        console.error(getPermissionErrorHelp('create directory', this.registryDir));
        throw error;
      }
      // Re-throw other errors
      throw error;
    }
  }

  /**
   * Read the registry file with atomic operations
   * Returns a map keyed by projectId
   */
  private async readRegistry(): Promise<Map<string, ProjectRegistryEntry>> {
    await this.ensureRegistryDir();

    let fileWasEmpty = false;
    try {
      const content = await fs.readFile(this.registryPath, 'utf-8');
      // Handle empty or whitespace-only files
      const trimmedContent = content.trim();
      if (!trimmedContent) {
        console.error(`[ProjectRegistry] Warning: ${this.registryPath} is empty, initializing with empty registry`);
        fileWasEmpty = true;
        // Mark that we need to write the file
        this.needsInitialization = true;
        return new Map();
      }
      const data = JSON.parse(trimmedContent) as Record<string, ProjectRegistryEntry>;
      // Ensure backward compatibility: add default empty instances array if missing (older format)
      for (const entry of Object.values(data)) {
        if (!Array.isArray(entry.instances)) {
          entry.instances = [];
        }
      }
      return new Map(Object.entries(data));
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        // File doesn't exist yet, return empty map
        this.needsInitialization = true;
        return new Map();
      }
      if (error instanceof SyntaxError) {
        // JSON parsing error - file is corrupted or invalid
        console.error(`[ProjectRegistry] Error: Failed to parse ${this.registryPath}: ${error.message}`);
        console.error(`[ProjectRegistry] The file may be corrupted. Initializing with empty registry.`);
        // Back up the corrupted file
        try {
          const backupPath = `${this.registryPath}.corrupted.${Date.now()}`;
          await fs.copyFile(this.registryPath, backupPath);
          console.error(`[ProjectRegistry] Corrupted file backed up to: ${backupPath}`);
        } catch (backupError) {
          // Ignore backup errors
        }
        this.needsInitialization = true;
        return new Map();
      }
      throw error;
    }
  }

  /**
   * Write the registry file atomically
   */
  private async writeRegistry(registry: Map<string, ProjectRegistryEntry>): Promise<void> {
    await this.ensureRegistryDir();

    const data = Object.fromEntries(registry);
    const content = JSON.stringify(data, null, 2);

    // Write to temporary file first, then rename for atomic operation
    const tempPath = `${this.registryPath}.tmp`;
    await fs.writeFile(tempPath, content, 'utf-8');
    await fs.rename(tempPath, this.registryPath);
  }

  /**
   * Check if a process is still running
   * Note: When running in Docker with path translation, we can't check host PIDs,
   * so we assume processes are alive if path translation is enabled.
   */
  private isProcessAlive(pid: number): boolean {
    // If path translation is enabled, we're in Docker and can't check host PIDs
    const hostPrefix = process.env.SPEC_WORKFLOW_HOST_PATH_PREFIX;
    const containerPrefix = process.env.SPEC_WORKFLOW_CONTAINER_PATH_PREFIX;
    if (hostPrefix && containerPrefix) {
      // Can't verify host PIDs from inside Docker, assume alive
      return true;
    }

    try {
      // Sending signal 0 checks if process exists without actually sending a signal
      process.kill(pid, 0);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Register a project in the global registry
   * Self-healing: If a project exists with dead PIDs, cleans them up and adds new PID
   * Multi-instance: Allows unlimited MCP server instances per project
   */
  async registerProject(projectPath: string, pid: number): Promise<string> {
    const registry = await this.readRegistry();

    const absolutePath = resolve(projectPath);
    const projectId = generateProjectId(absolutePath);
    const projectName = basename(absolutePath);

    const existing = registry.get(projectId);

    if (existing) {
      // Self-healing: Filter out dead PIDs
      const liveInstances = existing.instances.filter(i => this.isProcessAlive(i.pid));

      // Check if this PID is already registered (avoid duplicates)
      if (!liveInstances.some(i => i.pid === pid)) {
        liveInstances.push({ pid, registeredAt: new Date().toISOString() });
      }

      // Update with live instances (no limit on number of instances)
      existing.instances = liveInstances;
      registry.set(projectId, existing);
    } else {
      // New project
      const entry: ProjectRegistryEntry = {
        projectId,
        projectPath: absolutePath,
        projectName,
        instances: [{ pid, registeredAt: new Date().toISOString() }]
      };
      registry.set(projectId, entry);
    }

    await this.writeRegistry(registry);
    return projectId;
  }

  /**
   * Unregister a project from the global registry by path
   * If pid is provided, only removes that specific instance
   * If no pid provided, removes the entire project (backwards compat)
   */
  async unregisterProject(projectPath: string, pid?: number): Promise<void> {
    const registry = await this.readRegistry();
    const absolutePath = resolve(projectPath);
    const projectId = generateProjectId(absolutePath);

    const entry = registry.get(projectId);
    if (!entry) return;

    if (pid !== undefined) {
      // Remove only this PID's instance
      entry.instances = entry.instances.filter(i => i.pid !== pid);
      if (entry.instances.length === 0) {
        registry.delete(projectId);
      } else {
        registry.set(projectId, entry);
      }
    } else {
      // Remove entire project (backwards compat)
      registry.delete(projectId);
    }

    await this.writeRegistry(registry);
  }

  /**
   * Unregister a project by projectId
   */
  async unregisterProjectById(projectId: string): Promise<void> {
    const registry = await this.readRegistry();
    registry.delete(projectId);
    await this.writeRegistry(registry);
  }

  /**
   * Get all active projects from the registry
   */
  async getAllProjects(): Promise<ProjectRegistryEntry[]> {
    const registry = await this.readRegistry();
    return Array.from(registry.values());
  }

  /**
   * Get a specific project by path
   */
  async getProject(projectPath: string): Promise<ProjectRegistryEntry | null> {
    const registry = await this.readRegistry();
    const absolutePath = resolve(projectPath);
    const projectId = generateProjectId(absolutePath);
    return registry.get(projectId) || null;
  }

  /**
   * Get a specific project by projectId
   */
  async getProjectById(projectId: string): Promise<ProjectRegistryEntry | null> {
    const registry = await this.readRegistry();
    return registry.get(projectId) || null;
  }

  /**
   * Clean up stale instances (where the process is no longer running)
   * Projects with no live instances are removed entirely
   * Returns the count of removed instances
   */
  async cleanupStaleProjects(): Promise<number> {
    const registry = await this.readRegistry();
    let removedInstanceCount = 0;
    let needsWrite = this.needsInitialization; // Write if file needs initialization

    for (const [projectId, entry] of registry.entries()) {
      const liveInstances = entry.instances.filter(i => this.isProcessAlive(i.pid));
      const deadCount = entry.instances.length - liveInstances.length;

      if (deadCount > 0) {
        removedInstanceCount += deadCount;
        needsWrite = true;

        if (liveInstances.length === 0) {
          // No live instances, remove entire project
          registry.delete(projectId);
        } else {
          // Keep project with only live instances
          entry.instances = liveInstances;
          registry.set(projectId, entry);
        }
      }
    }

    if (needsWrite) {
      await this.writeRegistry(registry);
      this.needsInitialization = false; // Reset flag after successful write
    }

    return removedInstanceCount;
  }

  /**
   * Check if a project is registered by path
   */
  async isProjectRegistered(projectPath: string): Promise<boolean> {
    const registry = await this.readRegistry();
    const absolutePath = resolve(projectPath);
    const projectId = generateProjectId(absolutePath);
    return registry.has(projectId);
  }

  /**
   * Get the registry file path for watching
   */
  getRegistryPath(): string {
    return this.registryPath;
  }
}
