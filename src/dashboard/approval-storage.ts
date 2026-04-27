import { EventEmitter } from 'events';
import { promises as fs } from 'fs';
import { join, isAbsolute, resolve } from 'path';
import chokidar from 'chokidar';
import { PathUtils, safeResolveUnder } from '../core/path-utils.js';

export interface ApprovalComment {
  type: 'selection' | 'general';
  selectedText?: string;
  comment: string;
  timestamp: string;
  lineNumber?: number;
  characterPosition?: number;
  highlightColor?: string; // Color for highlighting the selected text
}

export interface ApprovalRequest {
  id: string;
  title: string;
  filePath: string; // Path to the file to be reviewed
  type: 'document' | 'action';
  status: 'pending' | 'approved' | 'rejected' | 'needs-revision';
  createdAt: string;
  respondedAt?: string;
  response?: string;
  annotations?: string;
  comments?: ApprovalComment[];
  revisionHistory?: {
    version: number;
    content: string;
    timestamp: string;
    reason?: string;
  }[];
  metadata?: Record<string, any>;
  category: 'spec';
  categoryName: string; // spec name
}

export class ApprovalStorage extends EventEmitter {
  public projectPath: string; // Make public so dashboard server can access it
  private approvalsDir: string;
  private watcher?: chokidar.FSWatcher;

  constructor(projectPath: string) {
    super();
    
    // Validate project path
    if (!projectPath || projectPath.trim() === '') {
      throw new Error('Project path cannot be empty');
    }
    
    // Resolve to absolute path
    const resolvedPath = resolve(projectPath);
    
    // Prevent root directory usage which causes permission errors
    if (resolvedPath === '/' || resolvedPath === '\\' || resolvedPath.match(/^[A-Z]:\\?$/)) {
      throw new Error(`Invalid project path: ${resolvedPath}. Cannot use root directory for spec workflow.`);
    }
    
    this.projectPath = resolvedPath;
    this.approvalsDir = PathUtils.getApprovalsPath(resolvedPath);
  }

  async start(): Promise<void> {
    // Create the approvals directory (empty) so watcher can establish properly
    await fs.mkdir(this.approvalsDir, { recursive: true });
    
    // Set up file watcher for approval directory and all subdirectories
    // This will catch new directories and files created dynamically
    this.watcher = chokidar.watch(`${this.approvalsDir}/**/*.json`, {
      ignoreInitial: false,
      persistent: true,
      ignorePermissionErrors: true
    });

    this.watcher.on('add', () => this.emit('approval-change'));
    this.watcher.on('change', () => this.emit('approval-change'));
    this.watcher.on('unlink', () => this.emit('approval-change'));
  }

  async stop(): Promise<void> {
    if (this.watcher) {
      // Remove all listeners before closing to prevent memory leaks
      this.watcher.removeAllListeners();
      await this.watcher.close();
      this.watcher = undefined;
    }
    
    // Clean up EventEmitter listeners
    this.removeAllListeners();
  }

  async createApproval(
    title: string, 
    filePath: string, 
    category: 'spec',
    categoryName: string,
    type: 'document' | 'action' = 'document',
    metadata?: Record<string, any>
  ): Promise<string> {
    const id = this.generateId();
    const approval: ApprovalRequest = {
      id,
      title,
      filePath,
      type,
      status: 'pending',
      createdAt: new Date().toISOString(),
      metadata,
      category,
      categoryName
    };

    // Create category directory if it doesn't exist
    const categoryDir = join(this.approvalsDir, categoryName);
    await fs.mkdir(categoryDir, { recursive: true });

    const approvalFilePath = join(categoryDir, `${id}.json`);
    await fs.writeFile(approvalFilePath, JSON.stringify(approval, null, 2), 'utf-8');

    return id;
  }

  async getApproval(id: string): Promise<ApprovalRequest | null> {
    // Search across all categories and names
    try {
      const approvalPath = await this.findApprovalPath(id);
      if (!approvalPath) return null;
      
      const content = await fs.readFile(approvalPath, 'utf-8');
      return JSON.parse(content) as ApprovalRequest;
    } catch {
      return null;
    }
  }

  private async findApprovalPath(id: string): Promise<string | null> {
    // Search in approvals directory directly (no 'specs' subfolder)
    try {
      const categoryNames = await fs.readdir(this.approvalsDir, { withFileTypes: true });
      for (const categoryName of categoryNames) {
        if (categoryName.isDirectory()) {
          const approvalPath = join(this.approvalsDir, categoryName.name, `${id}.json`);
          try {
            await fs.access(approvalPath);
            return approvalPath;
          } catch {
            // File doesn't exist in this location, continue searching
          }
        }
      }
    } catch {
      // Approvals directory doesn't exist
    }
    
    return null;
  }

  async updateApproval(
    id: string, 
    status: 'approved' | 'rejected' | 'needs-revision', 
    response: string, 
    annotations?: string,
    comments?: ApprovalComment[]
  ): Promise<void> {
    const approval = await this.getApproval(id);
    if (!approval) {
      throw new Error(`Approval ${id} not found`);
    }

    approval.status = status;
    approval.response = response;
    approval.annotations = annotations;
    approval.respondedAt = new Date().toISOString();
    
    if (comments) {
      approval.comments = comments;
    }

    const filePath = await this.findApprovalPath(id);
    if (!filePath) {
      throw new Error(`Approval ${id} file not found`);
    }
    await fs.writeFile(filePath, JSON.stringify(approval, null, 2), 'utf-8');
  }

  async createRevision(
    originalId: string, 
    newContent: string, 
    reason?: string
  ): Promise<string> {
    const originalApproval = await this.getApproval(originalId);
    if (!originalApproval) {
      throw new Error(`Original approval ${originalId} not found`);
    }

    if (!originalApproval.filePath) {
      throw new Error(`Approval ${originalId} has no file path for revision`);
    }

    // Resolve the stored filePath, but only accept the result if it stays
    // inside the project root. The approval JSON could have been corrupted
    // or written by a non-trusted local process — defense in depth on read.
    const filePath = safeResolveUnder(this.projectPath, originalApproval.filePath);
    if (!filePath) {
      throw new Error(
        `Approval ${originalId} has a filePath outside the project root`
      );
    }

    let currentContent = '';
    try {
      currentContent = await fs.readFile(filePath, 'utf-8');
    } catch (error) {
      // Could not read file for revision history
    }

    // Add to revision history
    if (!originalApproval.revisionHistory) {
      originalApproval.revisionHistory = [];
    }

    const version = (originalApproval.revisionHistory.length || 0) + 1;
    originalApproval.revisionHistory.push({
      version: version - 1,
      content: currentContent,
      timestamp: originalApproval.respondedAt || originalApproval.createdAt,
      reason: reason
    });

    // Write the new content to the file
    await fs.writeFile(filePath, newContent, 'utf-8');

    // Reset approval status for re-review
    originalApproval.status = 'pending';
    originalApproval.response = undefined;
    originalApproval.annotations = undefined;
    originalApproval.comments = undefined;
    originalApproval.respondedAt = undefined;
    
    const approvalFilePath = await this.findApprovalPath(originalId);
    if (!approvalFilePath) {
      throw new Error(`Approval ${originalId} file not found`);
    }
    await fs.writeFile(approvalFilePath, JSON.stringify(originalApproval, null, 2), 'utf-8');

    return originalId;
  }

  async getAllPendingApprovals(): Promise<ApprovalRequest[]> {
    const allApprovals = await this.getAllApprovals();
    return allApprovals.filter(approval => 
      approval.status === 'pending'
    );
  }

  async getAllApprovals(): Promise<ApprovalRequest[]> {
    try {
      const approvals: ApprovalRequest[] = [];
      
      try {
        const categoryNames = await fs.readdir(this.approvalsDir, { withFileTypes: true });
        for (const categoryName of categoryNames) {
          if (categoryName.isDirectory()) {
            const categoryPath = join(this.approvalsDir, categoryName.name);
            try {
              const approvalFiles = await fs.readdir(categoryPath);
              for (const file of approvalFiles) {
                if (file.endsWith('.json')) {
                  try {
                    const content = await fs.readFile(join(categoryPath, file), 'utf-8');
                    const approval = JSON.parse(content) as ApprovalRequest;
                    approvals.push(approval);
                  } catch (error) {
                    // Error reading approval file
                  }
                }
              }
            } catch (error) {
              // Error reading category directory
            }
          }
        }
      } catch {
        // Approvals directory doesn't exist
      }

      // Sort by creation date (newest first)
      return approvals.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch {
      return [];
    }
  }

  async deleteApproval(id: string): Promise<boolean> {
    try {
      const approvalPath = await this.findApprovalPath(id);
      if (!approvalPath) return false;
      
      await fs.unlink(approvalPath);
      return true;
    } catch {
      return false;
    }
  }

  async cleanupOldApprovals(maxAgeDays: number = 7): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - maxAgeDays);

    try {
      const files = await fs.readdir(this.approvalsDir);
      
      for (const file of files) {
        if (file.endsWith('.json')) {
          try {
            const content = await fs.readFile(join(this.approvalsDir, file), 'utf-8');
            const approval = JSON.parse(content) as ApprovalRequest;
            
            const createdAt = new Date(approval.createdAt);
            if (createdAt < cutoffDate && approval.status !== 'pending') {
              await fs.unlink(join(this.approvalsDir, file));
            }
          } catch (error) {
            // Error processing approval file
          }
        }
      }
    } catch (error) {
      // Error cleaning up old approvals
    }
  }

  private generateId(): string {
    return `approval_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}