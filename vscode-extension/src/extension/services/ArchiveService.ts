import * as fs from 'fs/promises';
import * as path from 'path';
import { Logger } from '../utils/logger.js';

/**
 * Service for archiving and unarchiving specifications
 * Ports the core functionality from the web dashboard's SpecArchiveService
 */
export class ArchiveService {
  private workspaceRoot: string | null = null;
  private logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  setWorkspaceRoot(workspaceRoot: string) {
    this.workspaceRoot = workspaceRoot;
  }

  private getSpecPath(specName: string): string {
    if (!this.workspaceRoot) {
      throw new Error('Workspace root not set');
    }
    return path.join(this.workspaceRoot, '.spec-workflow', 'specs', specName);
  }

  private getArchiveSpecPath(specName: string): string {
    if (!this.workspaceRoot) {
      throw new Error('Workspace root not set');
    }
    return path.join(this.workspaceRoot, '.spec-workflow', 'archive', 'specs', specName);
  }

  private getArchiveSpecsPath(): string {
    if (!this.workspaceRoot) {
      throw new Error('Workspace root not set');
    }
    return path.join(this.workspaceRoot, '.spec-workflow', 'archive', 'specs');
  }

  /**
   * Archive a specification by moving it from active to archive directory
   */
  async archiveSpec(specName: string): Promise<void> {
    const activeSpecPath = this.getSpecPath(specName);
    const archiveSpecPath = this.getArchiveSpecPath(specName);

    this.logger.log(`ArchiveService: Archiving spec '${specName}'`);

    // Verify the active spec exists
    try {
      await fs.access(activeSpecPath);
      this.logger.log(`ArchiveService: Found active spec at ${activeSpecPath}`);
    } catch {
      throw new Error(`Spec '${specName}' not found in active specs`);
    }

    // Verify the archive destination doesn't already exist
    try {
      await fs.access(archiveSpecPath);
      throw new Error(`Spec '${specName}' already exists in archive`);
    } catch (error: any) {
      if (error.code !== 'ENOENT') {
        throw error;
      }
    }

    try {
      // Ensure archive directory structure exists
      await fs.mkdir(this.getArchiveSpecsPath(), { recursive: true });
      this.logger.log(`ArchiveService: Created archive directory structure`);
      
      // Move the entire spec directory to archive
      await fs.rename(activeSpecPath, archiveSpecPath);
      this.logger.log(`ArchiveService: Successfully moved spec from ${activeSpecPath} to ${archiveSpecPath}`);
    } catch (error: any) {
      this.logger.error(`ArchiveService: Failed to archive spec '${specName}':`, error);
      throw new Error(`Failed to archive spec '${specName}': ${error.message}`);
    }
  }

  /**
   * Unarchive a specification by moving it from archive back to active directory
   */
  async unarchiveSpec(specName: string): Promise<void> {
    const archiveSpecPath = this.getArchiveSpecPath(specName);
    const activeSpecPath = this.getSpecPath(specName);

    this.logger.log(`ArchiveService: Unarchiving spec '${specName}'`);

    // Verify the archived spec exists
    try {
      await fs.access(archiveSpecPath);
      this.logger.log(`ArchiveService: Found archived spec at ${archiveSpecPath}`);
    } catch {
      throw new Error(`Spec '${specName}' not found in archive`);
    }

    // Verify the active destination doesn't already exist
    try {
      await fs.access(activeSpecPath);
      throw new Error(`Spec '${specName}' already exists in active specs`);
    } catch (error: any) {
      if (error.code !== 'ENOENT') {
        throw error;
      }
    }

    try {
      // Ensure active specs directory exists
      const activeSpecsDir = path.dirname(activeSpecPath);
      await fs.mkdir(activeSpecsDir, { recursive: true });
      this.logger.log(`ArchiveService: Created active specs directory structure`);
      
      // Move the entire spec directory back to active
      await fs.rename(archiveSpecPath, activeSpecPath);
      this.logger.log(`ArchiveService: Successfully moved spec from ${archiveSpecPath} to ${activeSpecPath}`);
    } catch (error: any) {
      this.logger.error(`ArchiveService: Failed to unarchive spec '${specName}':`, error);
      throw new Error(`Failed to unarchive spec '${specName}': ${error.message}`);
    }
  }

  /**
   * Check if a spec is in the active directory
   */
  async isSpecActive(specName: string): Promise<boolean> {
    try {
      await fs.access(this.getSpecPath(specName));
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if a spec is in the archive directory
   */
  async isSpecArchived(specName: string): Promise<boolean> {
    try {
      await fs.access(this.getArchiveSpecPath(specName));
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get the current location of a spec
   */
  async getSpecLocation(specName: string): Promise<'active' | 'archived' | 'not-found'> {
    const isActive = await this.isSpecActive(specName);
    if (isActive) {
      return 'active';
    }

    const isArchived = await this.isSpecArchived(specName);
    if (isArchived) {
      return 'archived';
    }

    return 'not-found';
  }

  /**
   * Get all spec names in the archive directory
   */
  async getArchivedSpecNames(): Promise<string[]> {
    try {
      const archiveSpecsPath = this.getArchiveSpecsPath();
      await fs.access(archiveSpecsPath);
      const entries = await fs.readdir(archiveSpecsPath, { withFileTypes: true });
      return entries
        .filter(entry => entry.isDirectory())
        .map(entry => entry.name);
    } catch {
      // Archive directory doesn't exist yet
      return [];
    }
  }
}