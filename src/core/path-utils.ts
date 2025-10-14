import { join, normalize, sep, resolve } from 'path';
import { access, stat, mkdir } from 'fs/promises';
import { constants } from 'fs';

export class PathUtils {
  /**
   * Safely join paths ensuring no directory traversal 安全地连接路径，确保没有目录遍历
   */
  private static safeJoin(basePath: string, ...paths: string[]): string {
    // Validate base path
    if (!basePath || typeof basePath !== 'string') {
      throw new Error('Invalid base path');
    }
    
    // Check each path segment for traversal attempts
    for (const pathSegment of paths) {
      if (pathSegment && (pathSegment.includes('..') || pathSegment.startsWith('/'))) {
        throw new Error(`Invalid path segment: ${pathSegment}`);
      }
    }
    
    const joined = normalize(join(basePath, ...paths));
    const resolvedBase = resolve(basePath);
    const resolvedJoined = resolve(joined);
    
    // Ensure the joined path is within the base path
    if (!resolvedJoined.startsWith(resolvedBase)) {
      throw new Error('Path traversal detected in join operation');
    }
    
    return joined;
  }
  
  static getWorkflowRoot(projectPath: string): string {
    return this.safeJoin(projectPath, '.spec-workflow');
  }

  static getSpecPath(projectPath: string, specName: string): string {
    return this.safeJoin(projectPath, '.spec-workflow', 'specs', specName);
  }

  static getArchiveSpecPath(projectPath: string, specName: string): string {
    return this.safeJoin(projectPath, '.spec-workflow', 'archive', 'specs', specName);
  }

  static getArchiveSpecsPath(projectPath: string): string {
    return this.safeJoin(projectPath, '.spec-workflow', 'archive', 'specs');
  }

  static getSteeringPath(projectPath: string): string {
    return this.safeJoin(projectPath, '.spec-workflow', 'steering');
  }


  static getTemplatesPath(projectPath: string): string {
    return this.safeJoin(projectPath, '.spec-workflow', 'templates');
  }

  static getAgentsPath(projectPath: string): string {
    return this.safeJoin(projectPath, '.spec-workflow', 'agents');
  }

  static getCommandsPath(projectPath: string): string {
    return this.safeJoin(projectPath, '.spec-workflow', 'commands');
  }

  static getApprovalsPath(projectPath: string): string {
    return this.safeJoin(projectPath, '.spec-workflow', 'approvals');
  }

  static getSpecApprovalPath(projectPath: string, specName: string): string {
    return this.safeJoin(projectPath, '.spec-workflow', 'approvals', specName);
  }


  // Ensure paths work across Windows, macOS, Linux
  static toPlatformPath(path: string): string {
    return path.split('/').join(sep);
  }

  static toUnixPath(path: string): string {
    return path.split(sep).join('/');
  }

  // Get relative path from project root
  static getRelativePath(projectPath: string, fullPath: string): string {
    const normalizedProject = normalize(projectPath);
    const normalizedFull = normalize(fullPath);
    
    if (normalizedFull.startsWith(normalizedProject)) {
      return normalizedFull.slice(normalizedProject.length + 1);
    }
    
    return normalizedFull;
  }
}

export async function validateProjectPath(projectPath: string): Promise<string> {
  try {
    // Validate input
    if (!projectPath || typeof projectPath !== 'string') {
      throw new Error('Invalid project path: path must be a non-empty string');
    }
    
    // Check for dangerous path patterns before resolving
    if (projectPath.includes('..') || projectPath.includes('~')) {
      // Normalize the path first to check if it's actually traversing
      const normalized = normalize(projectPath);
      const resolved = resolve(normalized);
      
      // Get the current working directory for comparison
      const cwd = process.cwd();
      
      // Additional check: ensure the resolved path doesn't contain parent directory references
      if (normalized.includes('..') && !resolved.startsWith(cwd)) {
        throw new Error(`Path traversal detected: ${projectPath}`);
      }
    }
    
    // Resolve to absolute path
    const absolutePath = resolve(projectPath);
    
    // Security check: Ensure the path doesn't escape to system directories
    const systemPaths = ['/etc', '/usr', '/bin', '/sbin', '/var', '/sys', '/proc'];
    const windowsSystemPaths = ['C:\\Windows', 'C:\\Program Files', 'C:\\Program Files (x86)'];
    const allSystemPaths = process.platform === 'win32' ? windowsSystemPaths : systemPaths;
    
    for (const sysPath of allSystemPaths) {
      if (absolutePath.toLowerCase().startsWith(sysPath.toLowerCase())) {
        throw new Error(`Access to system directory not allowed: ${absolutePath}`);
      }
    }
    
    // Check if path exists
    await access(absolutePath, constants.F_OK);
    
    // Ensure it's a directory
    const stats = await stat(absolutePath);
    if (!stats.isDirectory()) {
      throw new Error(`Project path is not a directory: ${absolutePath}`);
    }
    
    // Final security check: ensure we can actually access this directory
    await access(absolutePath, constants.R_OK | constants.W_OK);
    
    return absolutePath;
  } catch (error) {
    if (error instanceof Error) {
      if ((error as any).code === 'ENOENT') {
        throw new Error(`Project path does not exist: ${projectPath}`);
      } else if ((error as any).code === 'EACCES') {
        throw new Error(`Permission denied accessing project path: ${projectPath}`);
      }
      throw error;
    }
    throw new Error(`Unknown error validating project path: ${String(error)}`);
  }
}

export async function ensureDirectoryExists(dirPath: string): Promise<void> {
  try {
    await access(dirPath, constants.F_OK);
  } catch {
    await mkdir(dirPath, { recursive: true });
  }
}

export async function ensureWorkflowDirectory(projectPath: string): Promise<string> {
  const workflowRoot = PathUtils.getWorkflowRoot(projectPath);
  
  // Create all necessary subdirectories (approvals created on-demand)
  const directories = [
    workflowRoot,
    PathUtils.getSpecPath(projectPath, ''),
    PathUtils.getArchiveSpecsPath(projectPath),
    PathUtils.getSteeringPath(projectPath),
    PathUtils.getTemplatesPath(projectPath),
    PathUtils.getAgentsPath(projectPath),
    PathUtils.getCommandsPath(projectPath)
  ];
  
  for (const dir of directories) {
    await ensureDirectoryExists(dir);
  }
  
  return workflowRoot;
}