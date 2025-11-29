import { promises as fs } from 'fs';
import { join } from 'path';
import { PathUtils } from './path-utils.js';

export class SpecArchiveService {
  private projectPath: string;

  constructor(projectPath: string) {
    // Path should already be translated by caller (ProjectManager)
    this.projectPath = projectPath;
  }

  async archiveSpec(specName: string): Promise<void> {
    const activeSpecPath = PathUtils.getSpecPath(this.projectPath, specName);
    const archiveSpecPath = PathUtils.getArchiveSpecPath(this.projectPath, specName);

    // Verify the active spec exists
    try {
      await fs.access(activeSpecPath);
    } catch {
      throw new Error(`Spec '${specName}' not found in active specs`);
    }

    // Verify the archive destination doesn't already exist
    try {
      await fs.access(archiveSpecPath);
      throw new Error(`Spec '${specName}' already exists in archive`);
    } catch (error) {
      if (error instanceof Error && (error as any).code !== 'ENOENT') {
        throw error;
      }
    }

    try {
      // Ensure archive directory structure exists
      await fs.mkdir(PathUtils.getArchiveSpecsPath(this.projectPath), { recursive: true });
      
      // Move the entire spec directory to archive
      await fs.rename(activeSpecPath, archiveSpecPath);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to archive spec '${specName}': ${errorMessage}`);
    }
  }

  async unarchiveSpec(specName: string): Promise<void> {
    const archiveSpecPath = PathUtils.getArchiveSpecPath(this.projectPath, specName);
    const activeSpecPath = PathUtils.getSpecPath(this.projectPath, specName);

    // Verify the archived spec exists
    try {
      await fs.access(archiveSpecPath);
    } catch {
      throw new Error(`Spec '${specName}' not found in archive`);
    }

    // Verify the active destination doesn't already exist
    try {
      await fs.access(activeSpecPath);
      throw new Error(`Spec '${specName}' already exists in active specs`);
    } catch (error) {
      if (error instanceof Error && (error as any).code !== 'ENOENT') {
        throw error;
      }
    }

    try {
      // Ensure active specs directory exists
      await fs.mkdir(PathUtils.getSpecPath(this.projectPath, ''), { recursive: true });
      
      // Move the entire spec directory back to active
      await fs.rename(archiveSpecPath, activeSpecPath);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to unarchive spec '${specName}': ${errorMessage}`);
    }
  }

  async isSpecActive(specName: string): Promise<boolean> {
    try {
      await fs.access(PathUtils.getSpecPath(this.projectPath, specName));
      return true;
    } catch {
      return false;
    }
  }

  async isSpecArchived(specName: string): Promise<boolean> {
    try {
      await fs.access(PathUtils.getArchiveSpecPath(this.projectPath, specName));
      return true;
    } catch {
      return false;
    }
  }

  async getSpecLocation(specName: string): Promise<'active' | 'archived' | 'not-found'> {
    const isActive = await this.isSpecActive(specName);
    if (isActive) return 'active';

    const isArchived = await this.isSpecArchived(specName);
    if (isArchived) return 'archived';

    return 'not-found';
  }
}