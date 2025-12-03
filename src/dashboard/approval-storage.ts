import { EventEmitter } from 'events';
import { promises as fs } from 'fs';
import { join, isAbsolute, resolve, basename } from 'path';
import chokidar from 'chokidar';
import { diffLines, Change } from 'diff';
import { PathUtils } from '../core/path-utils.js';

export interface ApprovalComment {
  type: 'selection' | 'general';
  selectedText?: string;
  comment: string;
  timestamp: string;
  lineNumber?: number;
  characterPosition?: number;
  highlightColor?: string; // Color for highlighting the selected text
}

export interface DocumentSnapshot {
  id: string;
  approvalId: string;
  approvalTitle: string;
  version: number;
  timestamp: string;
  trigger: 'initial' | 'revision_requested' | 'approved' | 'manual';
  status: 'pending' | 'approved' | 'rejected' | 'needs-revision';
  content: string;
  fileStats: {
    size: number;
    lines: number;
    lastModified: string;
  };
  comments?: ApprovalComment[];
  annotations?: string;
}

export interface SnapshotMetadata {
  approvalId: string;
  currentVersion: number;
  snapshots: {
    version: number;
    filename: string;
    timestamp: string;
    trigger: string;
  }[];
}

export interface FileSnapshotMetadata {
  filePath: string;
  currentVersion: number;
  snapshots: {
    version: number;
    filename: string;
    timestamp: string;
    trigger: string;
    approvalId: string;
    approvalTitle: string;
  }[];
}

export interface DiffResult {
  additions: number;
  deletions: number;
  changes: number;
  chunks: DiffChunk[];
}

export interface DiffChunk {
  oldStart: number;
  oldLines: number;
  newStart: number;
  newLines: number;
  lines: DiffLine[];
}

export interface DiffLine {
  type: 'add' | 'delete' | 'normal';
  oldLineNumber?: number;
  newLineNumber?: number;
  content: string;
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
  category: 'spec' | 'steering';
  categoryName: string; // spec or steering document name
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
    
    // Add error handler to prevent watcher crashes
    this.watcher.on('error', (error) => {
      console.error('Approval watcher error:', error);
      // Don't propagate error to prevent system crash
    });
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
    category: 'spec' | 'steering',
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

    // Capture initial snapshot
    try {
      await this.captureSnapshot(id, 'initial');
    } catch (error) {
      // Log error but don't fail the approval creation
      console.warn(`Failed to capture initial snapshot for approval ${id}:`, error);
    }

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

    // Capture snapshot before status change for certain transitions
    if (status === 'needs-revision') {
      try {
        await this.captureSnapshot(id, 'revision_requested');
      } catch (error) {
        console.warn(`Failed to capture revision snapshot for approval ${id}:`, error);
      }
    } else if (status === 'approved') {
      try {
        await this.captureSnapshot(id, 'approved');
      } catch (error) {
        console.warn(`Failed to capture approval snapshot for approval ${id}:`, error);
      }
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

    // Read the current file content for revision history
    const filePath = isAbsolute(originalApproval.filePath) 
      ? originalApproval.filePath 
      : join(this.projectPath, originalApproval.filePath);
    
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

      // Delete the approval file
      await fs.unlink(approvalPath);

      // NOTE: We DO NOT delete snapshots since they are now shared across approvals for the same file
      // Snapshots are stored in .snapshots/{filename}/ and should persist across approval cycles

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

  // Snapshot Management Methods

  async captureSnapshot(approvalId: string, trigger: 'initial' | 'revision_requested' | 'approved' | 'manual'): Promise<void> {
    const approval = await this.getApproval(approvalId);
    if (!approval || !approval.filePath) {
      throw new Error(`Approval ${approvalId} not found or has no file path`);
    }

    // Read current file content
    const filePath = isAbsolute(approval.filePath)
      ? approval.filePath
      : join(this.projectPath, approval.filePath);

    let content: string;
    let stats: any;

    try {
      content = await fs.readFile(filePath, 'utf-8');
      stats = await fs.stat(filePath);
    } catch (error) {
      throw new Error(`Failed to read file for snapshot: ${error instanceof Error ? error.message : String(error)}`);
    }

    // Create file-based snapshots directory
    const categoryDir = join(this.approvalsDir, approval.categoryName || 'default');
    const snapshotsDir = join(categoryDir, '.snapshots', basename(approval.filePath));
    await fs.mkdir(snapshotsDir, { recursive: true });

    // Load or create metadata
    const metadataPath = join(snapshotsDir, 'metadata.json');
    let metadata: FileSnapshotMetadata;

    try {
      const metadataContent = await fs.readFile(metadataPath, 'utf-8');
      metadata = JSON.parse(metadataContent);
    } catch {
      metadata = {
        filePath: approval.filePath,
        currentVersion: 0,
        snapshots: []
      };
    }

    // Check for duplicate initial snapshots
    if (trigger === 'initial') {
      const existingInitial = metadata.snapshots.find(s => s.trigger === 'initial');
      if (existingInitial) {
        console.log(`Initial snapshot already exists for ${approval.filePath}, skipping creation`);
        return;
      }
    }

    // Create new snapshot
    const version = metadata.currentVersion + 1;
    const snapshotId = `snapshot-${version.toString().padStart(3, '0')}`;
    const timestamp = new Date().toISOString();

    const snapshot: DocumentSnapshot = {
      id: this.generateSnapshotId(),
      approvalId,
      approvalTitle: approval.title,
      version,
      timestamp,
      trigger,
      status: approval.status,
      content,
      fileStats: {
        size: stats.size,
        lines: content.split('\n').length,
        lastModified: stats.mtime.toISOString()
      },
      comments: approval.comments || [],
      annotations: approval.annotations || undefined
    };

    // Write snapshot to disk
    const snapshotPath = join(snapshotsDir, `${snapshotId}.json`);
    await fs.writeFile(snapshotPath, JSON.stringify(snapshot, null, 2), 'utf-8');

    // Update metadata
    metadata.currentVersion = version;
    metadata.snapshots.push({
      version,
      filename: `${snapshotId}.json`,
      timestamp,
      trigger,
      approvalId,
      approvalTitle: approval.title
    });

    await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2), 'utf-8');
  }

  async getSnapshots(approvalId: string): Promise<DocumentSnapshot[]> {
    const approval = await this.getApproval(approvalId);
    if (!approval || !approval.filePath) return [];

    // Get snapshots based on file path, not approval ID
    const categoryDir = join(this.approvalsDir, approval.categoryName || 'default');
    const snapshotsDir = join(categoryDir, '.snapshots', basename(approval.filePath));
    const metadataPath = join(snapshotsDir, 'metadata.json');

    try {
      const metadataContent = await fs.readFile(metadataPath, 'utf-8');
      const metadata: FileSnapshotMetadata = JSON.parse(metadataContent);
      const snapshots: DocumentSnapshot[] = [];

      for (const snapMeta of metadata.snapshots) {
        const snapPath = join(snapshotsDir, snapMeta.filename);
        const snapshotContent = await fs.readFile(snapPath, 'utf-8');
        const snapshot: DocumentSnapshot = JSON.parse(snapshotContent);
        snapshots.push(snapshot);
      }

      return snapshots.sort((a, b) => a.version - b.version);
    } catch {
      return [];
    }
  }

  async getSnapshot(approvalId: string, version: number): Promise<DocumentSnapshot | null> {
    const snapshots = await this.getSnapshots(approvalId);
    return snapshots.find(s => s.version === version) || null;
  }

  async getCurrentFileContent(approvalId: string): Promise<string | null> {
    const approval = await this.getApproval(approvalId);
    if (!approval || !approval.filePath) return null;

    const filePath = isAbsolute(approval.filePath)
      ? approval.filePath
      : join(this.projectPath, approval.filePath);

    try {
      return await fs.readFile(filePath, 'utf-8');
    } catch {
      return null;
    }
  }

  async compareSnapshots(approvalId: string, fromVersion: number, toVersion: number | 'current'): Promise<DiffResult> {
    let fromContent: string;
    let toContent: string;

    if (fromVersion === 0) {
      fromContent = '';
    } else {
      const fromSnapshot = await this.getSnapshot(approvalId, fromVersion);
      if (!fromSnapshot) {
        throw new Error(`Snapshot version ${fromVersion} not found`);
      }
      fromContent = fromSnapshot.content;
    }

    if (toVersion === 'current') {
      const currentContent = await this.getCurrentFileContent(approvalId);
      if (currentContent === null) {
        throw new Error(`Could not read current file content for approval ${approvalId}`);
      }
      toContent = currentContent;
    } else {
      const toSnapshot = await this.getSnapshot(approvalId, toVersion);
      if (!toSnapshot) {
        throw new Error(`Snapshot version ${toVersion} not found`);
      }
      toContent = toSnapshot.content;
    }

    const changes: Change[] = diffLines(fromContent, toContent);
    
    const resultLines: DiffLine[] = [];
    let additions = 0;
    let deletions = 0;
    let oldLineNum = 1;
    let newLineNum = 1;

    for (const change of changes) {
      // Split the change value into lines, handling the trailing newline properly
      const lines = change.value.split('\n');
      // Remove the last empty element if the value ended with a newline
      if (lines.length > 0 && lines[lines.length - 1] === '') {
        lines.pop();
      }

      for (const line of lines) {
        if (change.added) {
          additions++;
          resultLines.push({
            type: 'add',
            newLineNumber: newLineNum++,
            content: line
          });
        } else if (change.removed) {
          deletions++;
          resultLines.push({
            type: 'delete',
            oldLineNumber: oldLineNum++,
            content: line
          });
        } else {
          // Unchanged line
          resultLines.push({
            type: 'normal',
            oldLineNumber: oldLineNum++,
            newLineNumber: newLineNum++,
            content: line
          });
        }
      }
    }

    const fromLineCount = fromContent ? fromContent.split('\n').length : 0;
    const toLineCount = toContent ? toContent.split('\n').length : 0;

    return {
      additions,
      deletions,
      changes: additions + deletions,
      chunks: [{
        oldStart: 1,
        oldLines: fromLineCount,
        newStart: 1,
        newLines: toLineCount,
        lines: resultLines
      }]
    };
  }

  private generateSnapshotId(): string {
    return `snapshot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateId(): string {
    return `approval_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}