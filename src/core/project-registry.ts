import { homedir } from 'os';
import { join } from 'path';
import { promises as fs } from 'fs';
import { basename, resolve } from 'path';
import { createHash } from 'crypto';

export interface ProjectRegistryEntry {
  projectId: string;
  projectPath: string;
  projectName: string;
  pid: number;
  registeredAt: string;
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
    this.registryDir = join(homedir(), '.spec-workflow-mcp');
    this.registryPath = join(this.registryDir, 'activeProjects.json');
  }

  /**
   * Ensure the registry directory exists
   */
  private async ensureRegistryDir(): Promise<void> {
    try {
      await fs.mkdir(this.registryDir, { recursive: true });
    } catch (error) {
      // Directory might already exist, ignore
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
   */
  private isProcessAlive(pid: number): boolean {
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
   */
  async registerProject(projectPath: string, pid: number): Promise<string> {
    const registry = await this.readRegistry();

    const absolutePath = resolve(projectPath);
    const projectId = generateProjectId(absolutePath);
    const projectName = basename(absolutePath);

    const entry: ProjectRegistryEntry = {
      projectId,
      projectPath: absolutePath,
      projectName,
      pid,
      registeredAt: new Date().toISOString()
    };

    registry.set(projectId, entry);
    await this.writeRegistry(registry);
    return projectId;
  }

  /**
   * Unregister a project from the global registry by path
   */
  async unregisterProject(projectPath: string): Promise<void> {
    const registry = await this.readRegistry();
    const absolutePath = resolve(projectPath);
    const projectId = generateProjectId(absolutePath);

    registry.delete(projectId);
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
   * Clean up stale projects (where the process is no longer running)
   */
  async cleanupStaleProjects(): Promise<number> {
    const registry = await this.readRegistry();
    let removedCount = 0;
    let needsWrite = this.needsInitialization; // Write if file needs initialization

    for (const [projectId, entry] of registry.entries()) {
      if (!this.isProcessAlive(entry.pid)) {
        registry.delete(projectId);
        removedCount++;
        needsWrite = true;
      }
    }

    if (needsWrite) {
      await this.writeRegistry(registry);
      this.needsInitialization = false; // Reset flag after successful write
    }

    return removedCount;
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
