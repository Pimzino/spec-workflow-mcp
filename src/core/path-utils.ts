import { join, normalize, sep, resolve, posix } from 'path';
import { access, stat, mkdir } from 'fs/promises';
import { constants } from 'fs';

export class PathUtils {
  /** macOS and Windows are case-insensitive filesystems */
  private static readonly IS_CASE_INSENSITIVE =
    process.platform === 'darwin' || process.platform === 'win32';

  /** Cached path configuration (undefined = not checked, null = invalid/missing) */
  private static pathConfig: { hostPrefix: string; containerPrefix: string } | null | undefined;

  /**
   * Get cached path configuration from environment variables.
   * Caches result to prevent race conditions from env var changes mid-operation.
   */
  private static getPathConfig(): { hostPrefix: string; containerPrefix: string } | null {
    if (this.pathConfig !== undefined) {
      return this.pathConfig;
    }

    const hostPrefix = process.env.SPEC_WORKFLOW_HOST_PATH_PREFIX?.trim();
    const containerPrefix = process.env.SPEC_WORKFLOW_CONTAINER_PATH_PREFIX?.trim();

    if (!hostPrefix || !containerPrefix) {
      this.pathConfig = null;
      return null;
    }

    // Validate absolute paths
    if (!this.isAbsolutePath(hostPrefix) || !this.isAbsolutePath(containerPrefix)) {
      console.error('[PathUtils] Path prefixes must be absolute paths');
      this.pathConfig = null;
      return null;
    }

    // Security: Reject prefixes containing directory traversal
    if (hostPrefix.includes('..') || containerPrefix.includes('..')) {
      console.error('[PathUtils] Path prefixes must not contain directory traversal (..)');
      this.pathConfig = null;
      return null;
    }

    this.pathConfig = { hostPrefix, containerPrefix };
    return this.pathConfig;
  }

  /** Check if path is absolute (Unix or Windows style) */
  private static isAbsolutePath(path: string): boolean {
    return path.startsWith('/') || /^[A-Za-z]:[\\/]/.test(path);
  }

  /** Reset cached config (for testing) */
  static resetPathConfig(): void {
    this.pathConfig = undefined;
  }

  /**
   * Normalize path for cross-platform comparison using built-in path.posix.
   * Converts backslashes to forward slashes, removes trailing slashes.
   */
  private static normalizeForComparison(p: string): string {
    // Convert to Unix-style, then use built-in posix.normalize
    const unixStyle = p.replace(/\\/g, '/');
    // posix.normalize handles /./, /../, and // but keeps trailing slash
    const normalized = posix.normalize(unixStyle);
    // Remove trailing slash for consistent comparison (except for root "/")
    return normalized.endsWith('/') && normalized.length > 1
      ? normalized.slice(0, -1)
      : normalized;
  }

  /**
   * Check if a path matches a prefix with proper boundary checking.
   * - Prevents partial matches like "/Users/dev" matching "/Users/developer"
   * - Handles case-insensitivity on macOS/Windows
   * - Normalizes path separators for cross-platform support
   */
  private static pathMatchesPrefix(path: string, prefix: string): boolean {
    let normalizedPath = this.normalizeForComparison(path);
    let normalizedPrefix = this.normalizeForComparison(prefix);

    if (this.IS_CASE_INSENSITIVE) {
      normalizedPath = normalizedPath.toLowerCase();
      normalizedPrefix = normalizedPrefix.toLowerCase();
    }

    if (normalizedPath === normalizedPrefix) return true;

    // Special case: root prefix "/" matches any absolute path
    if (normalizedPrefix === '/') {
      return normalizedPath.startsWith('/');
    }

    return normalizedPath.startsWith(normalizedPrefix + '/');
  }

  /**
   * Translate a host path to container path if running in Docker with path mapping configured.
   *
   * Environment variables:
   * - SPEC_WORKFLOW_HOST_PATH_PREFIX: Path prefix on the host (e.g., /Users/username)
   * - SPEC_WORKFLOW_CONTAINER_PATH_PREFIX: Corresponding path in container (e.g., /projects)
   *
   * Example: If host prefix is "/Users/dev" and container prefix is "/projects",
   * then "/Users/dev/myapp" becomes "/projects/myapp"
   */
  static translatePath(hostPath: string): string {
    const config = this.getPathConfig();
    if (!config) return hostPath;

    if (this.pathMatchesPrefix(hostPath, config.hostPrefix)) {
      const normalizedHostPrefix = this.normalizeForComparison(config.hostPrefix);
      const normalizedPath = this.normalizeForComparison(hostPath);
      const normalizedContainerPrefix = this.normalizeForComparison(config.containerPrefix);

      // Get relative path preserving structure
      let relativePath = normalizedPath.substring(normalizedHostPrefix.length);
      // Ensure relative path starts with separator (needed for root prefix case)
      if (relativePath && !relativePath.startsWith('/')) {
        relativePath = '/' + relativePath;
      }
      const result = normalizedContainerPrefix + relativePath;

      // Security: Validate no directory traversal in result
      if (result.includes('/../') || result.endsWith('/..')) {
        throw new Error('Path translation resulted in directory traversal attempt');
      }

      return result;
    }
    return hostPath;
  }

  /**
   * Reverse translation: container path back to host path (for display/registry)
   */
  static reverseTranslatePath(containerPath: string): string {
    const config = this.getPathConfig();
    if (!config) return containerPath;

    if (this.pathMatchesPrefix(containerPath, config.containerPrefix)) {
      const normalizedContainerPrefix = this.normalizeForComparison(config.containerPrefix);
      const normalizedPath = this.normalizeForComparison(containerPath);
      const normalizedHostPrefix = this.normalizeForComparison(config.hostPrefix);

      // Get relative path preserving structure
      let relativePath = normalizedPath.substring(normalizedContainerPrefix.length);
      // Ensure relative path starts with separator (needed for root prefix case)
      if (relativePath && !relativePath.startsWith('/')) {
        relativePath = '/' + relativePath;
      }
      const result = normalizedHostPrefix + relativePath;

      // Security: Validate no directory traversal in result
      if (result.includes('/../') || result.endsWith('/..')) {
        throw new Error('Path translation resulted in directory traversal attempt');
      }

      return result;
    }
    return containerPath;
  }

  /**
   * Safely join paths ensuring no directory traversal
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