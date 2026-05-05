import * as vscode from 'vscode';
import * as path from 'path';

export interface FileChangeEvent {
  type: 'created' | 'changed' | 'deleted';
  uri: vscode.Uri;
  relativePath: string;
}

export class FileWatcher {
  private _disposables: vscode.Disposable[] = [];
  private _onFileChanged = new vscode.EventEmitter<FileChangeEvent>();
  private _watcher: vscode.FileSystemWatcher | null = null;
  
  public readonly onFileChanged = this._onFileChanged.event;

  constructor() {
    // Listen for workspace folder changes to update watcher
    this._disposables.push(
      vscode.workspace.onDidChangeWorkspaceFolders(() => {
        this.updateWatcher();
      })
    );

    this.updateWatcher();
  }

  private updateWatcher() {
    // Dispose existing watcher
    if (this._watcher) {
      this._watcher.dispose();
      this._watcher = null;
    }

    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
      return;
    }

    const workspaceRoot = workspaceFolders[0].uri.fsPath;
    const specWorkflowPattern = new vscode.RelativePattern(
      workspaceRoot,
      '.spec-workflow/**/*'
    );

    // Create new watcher for .spec-workflow directory
    this._watcher = vscode.workspace.createFileSystemWatcher(specWorkflowPattern);

    // Listen for file events
    this._watcher.onDidCreate(uri => {
      this.emitFileChange('created', uri);
    });

    this._watcher.onDidChange(uri => {
      this.emitFileChange('changed', uri);
    });

    this._watcher.onDidDelete(uri => {
      this.emitFileChange('deleted', uri);
    });

    this._disposables.push(this._watcher);
  }

  private emitFileChange(type: 'created' | 'changed' | 'deleted', uri: vscode.Uri) {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
      return;
    }

    const workspaceRoot = workspaceFolders[0].uri.fsPath;
    const relativePath = path.relative(workspaceRoot, uri.fsPath);

    // Only emit for relevant files
    if (this.isRelevantFile(relativePath)) {
      this._onFileChanged.fire({
        type,
        uri,
        relativePath
      });
    }
  }

  private isRelevantFile(relativePath: string): boolean {
    // Only watch for changes in spec files, steering files, and approvals
    const normalizedPath = relativePath.replace(/\\/g, '/');
    
    return (
      // Spec documents
      normalizedPath.includes('.spec-workflow/specs/') && 
      (normalizedPath.endsWith('.md') || normalizedPath.endsWith('.json')) ||
      
      // Steering documents
      normalizedPath.includes('.spec-workflow/steering/') && 
      normalizedPath.endsWith('.md') ||
      
      // Approval files
      normalizedPath.includes('.spec-workflow/approvals/') && 
      normalizedPath.endsWith('.json')
    );
  }

  public getWatchedFileType(relativePath: string): 'spec' | 'steering' | 'approval' | null {
    const normalizedPath = relativePath.replace(/\\/g, '/');
    
    if (normalizedPath.includes('.spec-workflow/specs/')) {
      return 'spec';
    } else if (normalizedPath.includes('.spec-workflow/steering/')) {
      return 'steering';
    } else if (normalizedPath.includes('.spec-workflow/approvals/')) {
      return 'approval';
    }
    
    return null;
  }

  public extractSpecName(relativePath: string): string | null {
    const normalizedPath = relativePath.replace(/\\/g, '/');
    const match = normalizedPath.match(/\.spec-workflow\/specs\/([^\/]+)/);
    return match ? match[1] : null;
  }

  dispose() {
    this._disposables.forEach(d => d.dispose());
    this._onFileChanged.dispose();
  }
}