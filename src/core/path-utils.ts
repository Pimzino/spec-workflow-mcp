import { join, normalize, sep, resolve, isAbsolute } from 'path';
import { access, stat, mkdir } from 'fs/promises';
import { constants } from 'fs';
import { gitignoreManager } from './gitignore-manager.js';

export class InvalidSpecNameError extends Error {
  constructor(message = 'Invalid spec name') {
    super(message);
    this.name = 'InvalidSpecNameError';
  }
}

export function isSafeSpecName(name: unknown): name is string {
  if (typeof name !== 'string' || name.length === 0 || name.length > 255) return false;
  if (name.includes('/') || name.includes('\\') || name.includes('\0')) return false;
  if (name === '.' || name === '..') return false;
  if (name.startsWith('.')) return false;
  return true;
}

export function assertSafeSpecName(name: unknown): asserts name is string {
  if (!isSafeSpecName(name)) {
    throw new InvalidSpecNameError();
  }
}

function assertContained(baseDir: string, candidate: string): void {
  // nosemgrep: javascript.lang.security.audit.path-traversal.path-join-resolve-traversal.path-join-resolve-traversal
  const resolvedBase = resolve(baseDir);
  // nosemgrep: javascript.lang.security.audit.path-traversal.path-join-resolve-traversal.path-join-resolve-traversal
  const resolvedCandidate = resolve(candidate);
  if (resolvedCandidate !== resolvedBase && !resolvedCandidate.startsWith(resolvedBase + sep)) {
    throw new InvalidSpecNameError();
  }
}

export function safeResolveSpecPath(projectPath: string, name: string): string {
  assertSafeSpecName(name);
  const baseDir = PathUtils.getSpecPath(projectPath, '');
  const candidate = PathUtils.getSpecPath(projectPath, name);
  assertContained(baseDir, candidate);
  return candidate;
}

export function safeResolveArchiveSpecPath(projectPath: string, name: string): string {
  assertSafeSpecName(name);
  const baseDir = PathUtils.getArchiveSpecsPath(projectPath);
  const candidate = PathUtils.getArchiveSpecPath(projectPath, name);
  assertContained(baseDir, candidate);
  return candidate;
}

/**
 * Resolve `candidate` (absolute or relative-to-baseDir) and return the
 * absolute path only if it stays inside baseDir. Returns null on traversal,
 * non-string input, or any resolution error. Use this for filesystem paths
 * derived from stored data (e.g. approval JSON `filePath`) where the field
 * is expected to point inside the project but cannot be assumed safe.
 */
export function safeResolveUnder(baseDir: string, candidate: unknown): string | null {
  if (typeof candidate !== 'string' || candidate.length === 0) return null;
  if (candidate.includes('\0')) return null;
  try {
    // nosemgrep: javascript.lang.security.audit.path-traversal.path-join-resolve-traversal.path-join-resolve-traversal
    const resolvedBase = resolve(baseDir);
    const resolvedCandidate = isAbsolute(candidate)
      // nosemgrep: javascript.lang.security.audit.path-traversal.path-join-resolve-traversal.path-join-resolve-traversal
      ? resolve(candidate)
      // nosemgrep: javascript.lang.security.audit.path-traversal.path-join-resolve-traversal.path-join-resolve-traversal
      : resolve(baseDir, candidate);
    if (resolvedCandidate === resolvedBase || resolvedCandidate.startsWith(resolvedBase + sep)) {
      return resolvedCandidate;
    }
  } catch {
    // fall through
  }
  return null;
}

export class PathUtils {
  static getWorkflowRoot(projectPath: string): string {
    return normalize(join(projectPath, '.spec-workflow'));
  }

  static getSpecPath(projectPath: string, specName: string): string {
    return normalize(join(projectPath, '.spec-workflow', 'specs', specName));
  }

  static getArchiveSpecPath(projectPath: string, specName: string): string {
    return normalize(join(projectPath, '.spec-workflow', 'archive', 'specs', specName));
  }

  static getArchiveSpecsPath(projectPath: string): string {
    return normalize(join(projectPath, '.spec-workflow', 'archive', 'specs'));
  }

  static getSteeringPath(projectPath: string): string {
    return normalize(join(projectPath, '.spec-workflow', 'steering'));
  }


  static getTemplatesPath(projectPath: string): string {
    return normalize(join(projectPath, '.spec-workflow', 'templates'));
  }

  static getAgentsPath(projectPath: string): string {
    return normalize(join(projectPath, '.spec-workflow', 'agents'));
  }

  static getCommandsPath(projectPath: string): string {
    return normalize(join(projectPath, '.spec-workflow', 'commands'));
  }

  static getApprovalsPath(projectPath: string): string {
    return normalize(join(projectPath, '.spec-workflow', 'approvals'));
  }

  static getSpecApprovalPath(projectPath: string, specName: string): string {
    return normalize(join(projectPath, '.spec-workflow', 'approvals', specName));
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
    // Resolve to absolute path
    const absolutePath = resolve(projectPath);
    
    // Check if path exists
    await access(absolutePath, constants.F_OK);
    
    // Ensure it's a directory
    const stats = await stat(absolutePath);
    if (!stats.isDirectory()) {
      throw new Error(`Project path is not a directory: ${absolutePath}`);
    }
    
    return absolutePath;
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      throw new Error(`Project path does not exist: ${projectPath}`);
    }
    throw error;
  }
}

export async function ensureDirectoryExists(dirPath: string): Promise<void> {
  try {
    await access(dirPath, constants.F_OK);
  } catch {
    await mkdir(dirPath, { recursive: true });
  }
}

// Track which projects have had gitignore updated
const gitignoreEnsured = new WeakMap<object, Set<string>>();
const processKey = {}; // Unique key for this process

export async function ensureWorkflowDirectory(projectPath: string): Promise<string> {
  const workflowRoot = PathUtils.getWorkflowRoot(projectPath);
  
  // Get or create the Set for this process
  let ensuredPaths = gitignoreEnsured.get(processKey);
  if (!ensuredPaths) {
    ensuredPaths = new Set<string>();
    gitignoreEnsured.set(processKey, ensuredPaths);
  }
  
  // Ensure gitignore is updated (idempotent)
  if (!ensuredPaths.has(projectPath)) {
    ensuredPaths.add(projectPath);
    
    try {
      const result = await gitignoreManager.ensure(projectPath, {
        silent: false,
        createIfMissing: true,
        force: false
      });
      
      // Log only if action was taken
      if (result.action === 'created' || result.action === 'updated') {
        console.log(`[INFO] ${result.message}`);
      } else if (result.action === 'failed' && result.message) {
        console.warn(`[WARN] ${result.message}`);
      }
    } catch (error) {
      // Don't fail the whole operation if gitignore update fails
      console.warn(`[WARN] Could not update .gitignore: ${(error as Error).message}`);
    }
  }
  
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