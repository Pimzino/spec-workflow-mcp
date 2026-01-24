import * as vscode from 'vscode';
import * as path from 'path';
import * as nls from 'vscode-nls';
import { ApprovalData, ApprovalComment, HighlightColor } from '../types';

const localize = nls.loadMessageBundle();
import { SpecWorkflowService } from './SpecWorkflowService';
import { hexToColorObject, generateRandomColor } from '../utils/colorUtils';
import { CommentModalService } from './CommentModalService';

const APPROVAL_STATUS_COLORS = {
  pending: { bg: 'rgba(255, 193, 7, 0.1)', border: 'rgba(255, 193, 7, 0.3)' },
  approved: { bg: 'rgba(40, 167, 69, 0.1)', border: 'rgba(40, 167, 69, 0.3)' },
  rejected: { bg: 'rgba(220, 53, 69, 0.1)', border: 'rgba(220, 53, 69, 0.3)' },
  'needs-revision': { bg: 'rgba(255, 87, 34, 0.1)', border: 'rgba(255, 87, 34, 0.3)' },
  commented: { bg: 'rgba(0, 123, 255, 0.1)', border: 'rgba(0, 123, 255, 0.3)' },
} as const;

const DECORATION_BORDER_RADIUS = '2px';

export interface ApprovalEditorContext {
  approval: ApprovalData;
  document: vscode.TextDocument;
  editor: vscode.TextEditor;
  decorationType: vscode.TextEditorDecorationType;
}

export class ApprovalEditorService {
  private static instance: ApprovalEditorService;
  private activeApprovalEditors = new Map<string, ApprovalEditorContext>();
  private decorationTypes = new Map<string, vscode.TextEditorDecorationType>();
  // Dynamic decoration types for custom comment colors
  private commentDecorationTypes = new Map<string, vscode.TextEditorDecorationType>();
  private commentModalService: CommentModalService;
  private specWorkflowService: SpecWorkflowService;

  constructor(specWorkflowService: SpecWorkflowService, extensionUri: vscode.Uri) {
    this.specWorkflowService = specWorkflowService;
    this.commentModalService = CommentModalService.getInstance(extensionUri);
    this.initializeDecorationTypes();
    this.setupEventListeners();
  }

  static getInstance(specWorkflowService: SpecWorkflowService, extensionUri: vscode.Uri): ApprovalEditorService {
    if (!ApprovalEditorService.instance) {
      ApprovalEditorService.instance = new ApprovalEditorService(specWorkflowService, extensionUri);
    }
    return ApprovalEditorService.instance;
  }

  private initializeDecorationTypes() {
    // Decoration for pending approval sections
    this.decorationTypes.set('pending', vscode.window.createTextEditorDecorationType({
      backgroundColor: APPROVAL_STATUS_COLORS.pending.bg,
      border: `1px solid ${APPROVAL_STATUS_COLORS.pending.border}`,
      borderRadius: DECORATION_BORDER_RADIUS,
      isWholeLine: false
    }));

    // Decoration for approved sections
    this.decorationTypes.set('approved', vscode.window.createTextEditorDecorationType({
      backgroundColor: APPROVAL_STATUS_COLORS.approved.bg,
      border: `1px solid ${APPROVAL_STATUS_COLORS.approved.border}`,
      borderRadius: DECORATION_BORDER_RADIUS,
      isWholeLine: false
    }));

    // Decoration for rejected sections
    this.decorationTypes.set('rejected', vscode.window.createTextEditorDecorationType({
      backgroundColor: APPROVAL_STATUS_COLORS.rejected.bg,
      border: `1px solid ${APPROVAL_STATUS_COLORS.rejected.border}`,
      borderRadius: DECORATION_BORDER_RADIUS,
      isWholeLine: false
    }));

    // Decoration for sections needing revision
    this.decorationTypes.set('needs-revision', vscode.window.createTextEditorDecorationType({
      backgroundColor: APPROVAL_STATUS_COLORS['needs-revision'].bg,
      border: `1px solid ${APPROVAL_STATUS_COLORS['needs-revision'].border}`,
      borderRadius: DECORATION_BORDER_RADIUS,
      isWholeLine: false
    }));

    // Decoration for commented sections
    this.decorationTypes.set('commented', vscode.window.createTextEditorDecorationType({
      backgroundColor: APPROVAL_STATUS_COLORS.commented.bg,
      border: `1px solid ${APPROVAL_STATUS_COLORS.commented.border}`,
      borderRadius: DECORATION_BORDER_RADIUS,
      isWholeLine: false
    }));
  }


  private getOrCreateCommentDecorationType(comment: ApprovalComment): vscode.TextEditorDecorationType {
    const decorationKey = `comment-${comment.id}`;
    
    if (this.commentDecorationTypes.has(decorationKey)) {
      return this.commentDecorationTypes.get(decorationKey)!;
    }

    const color = comment.highlightColor || generateRandomColor();
    
    const decorationType = vscode.window.createTextEditorDecorationType({
      backgroundColor: color.bg,
      border: `1px solid ${color.border}`,
      borderRadius: DECORATION_BORDER_RADIUS,
      isWholeLine: false
    });

    this.commentDecorationTypes.set(decorationKey, decorationType);
    return decorationType;
  }

  private setupEventListeners() {
    // Listen for editor changes
    vscode.window.onDidChangeActiveTextEditor((editor) => {
      if (editor) {
        this.updateEditorDecorations(editor);
      }
    });

    // Listen for document changes
    vscode.workspace.onDidChangeTextDocument((event) => {
      const editor = vscode.window.activeTextEditor;
      if (editor && editor.document === event.document) {
        this.updateEditorDecorations(editor);
      }
    });
  }

  async handleAddCommentToActiveSelection(args?: { range: vscode.Range; selectedText: string }): Promise<void> {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showErrorMessage(localize('error.noActiveEditor', 'No active editor found'));
      return;
    }

    // Get range and selected text from args or current selection
    let range: vscode.Range;
    let selectedText: string;
    
    if (args) {
      range = args.range;
      selectedText = args.selectedText;
    } else {
      // Fallback to current selection if no args provided
      const selection = editor.selection;
      if (selection.isEmpty) {
        vscode.window.showWarningMessage(localize('error.noTextSelection', 'No text selection found. Please select text and try again.'));
        return;
      }
      range = selection;
      selectedText = editor.document.getText(selection);
    }

    // Convert range to selection for modal compatibility
    const selection = new vscode.Selection(range.start, range.end);

    // Show the comment modal
    await this.commentModalService.showCommentModal({
      selectedText,
      editor,
      selection,
      onSave: async (comment: string, color: HighlightColor) => {
        await this.addCommentToSelection(editor, comment, color);
      }
    });
  }

  async openApprovalInEditor(approval: ApprovalData): Promise<vscode.TextEditor | null> {
    try {
      // Resolve the file path using the same strategy as MCP server
      const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
      if (!workspaceRoot) {
        vscode.window.showErrorMessage(localize('error.noWorkspaceFolder', 'No workspace folder found'));
        return null;
      }

      const resolvedFilePath = await this.resolveApprovalFilePath(approval.filePath, workspaceRoot);
      if (!resolvedFilePath) {
        const errorMsg = localize('error.fileNotFoundForApproval', 'Could not find file for approval "{0}". Original path: {1}. Check the Developer Console (Help -> Toggle Developer Tools) for detailed path resolution attempts.', approval.title, approval.filePath);
        
        const openDevConsole = localize('action.openDevConsole', 'Open Dev Console');
        const cancel = localize('action.cancel', 'Cancel');

        vscode.window.showErrorMessage(errorMsg, openDevConsole, cancel)
          .then(selection => {
            if (selection === openDevConsole) {
              vscode.commands.executeCommand('workbench.action.toggleDevTools');
            }
          });
        
        return null;
      }

      // Open the document
      const document = await vscode.workspace.openTextDocument(resolvedFilePath);
      const editor = await vscode.window.showTextDocument(document, {
        preview: false,
        preserveFocus: false
      });

      // Store the approval context
      const context: ApprovalEditorContext = {
        approval,
        document,
        editor,
        decorationType: this.decorationTypes.get(approval.status) || this.decorationTypes.get('pending')!
      };

      this.activeApprovalEditors.set(approval.id, context);

      // Apply decorations
      this.updateEditorDecorations(editor);

      // Show approval info
      this.showApprovalInfo(approval);

      return editor;
    } catch (error) {
      vscode.window.showErrorMessage(localize('error.failedToOpenApprovalFile', 'Failed to open approval file: {0}', String(error)));
      return null;
    }
  }

  private async resolveApprovalFilePath(filePath: string, workspaceRoot: string): Promise<string | null> {
    const fs = require('fs').promises;

    // Normalize path separators for cross-platform compatibility
    const normalizedFilePath = filePath.replace(/\\/g, '/');
    const candidates: string[] = [];

    console.log(`Resolving approval file path: "${filePath}" in workspace: ${workspaceRoot}`);

    // 1) If path is already absolute, try it directly first
    if (path.isAbsolute(filePath)) {
      candidates.push(filePath);
    }

    // 2) As provided relative to project root (most common case for paths like ".spec-workflow/test/tasks.md")
    candidates.push(path.join(workspaceRoot, normalizedFilePath));

    // 3) Handle paths that start with ".spec-workflow/" - these are already correctly rooted
    if (normalizedFilePath.startsWith('.spec-workflow/')) {
      // Path is already relative to project root, don't double-add .spec-workflow
      candidates.push(path.join(workspaceRoot, normalizedFilePath));
      
      // CRITICAL FIX: Handle the specs directory structure
      // If path is like ".spec-workflow/test/tasks.md", also try ".spec-workflow/specs/test/tasks.md"
      const pathAfterSpecWorkflow = normalizedFilePath.substring('.spec-workflow/'.length);
      if (pathAfterSpecWorkflow && !pathAfterSpecWorkflow.startsWith('specs/')) {
        candidates.push(path.join(workspaceRoot, '.spec-workflow', 'specs', pathAfterSpecWorkflow));
      }
      
      // Also try without the leading dot for legacy compatibility
      const withoutDot = normalizedFilePath.substring(1); // Remove leading "."
      candidates.push(path.join(workspaceRoot, withoutDot));
      
      // And try the specs variant without the leading dot
      if (pathAfterSpecWorkflow && !pathAfterSpecWorkflow.startsWith('specs/')) {
        candidates.push(path.join(workspaceRoot, 'spec-workflow', 'specs', pathAfterSpecWorkflow));
      }
    } else if (normalizedFilePath.startsWith('spec-workflow/')) {
      // Handle case where path might not have leading dot
      candidates.push(path.join(workspaceRoot, '.' + normalizedFilePath));
      candidates.push(path.join(workspaceRoot, normalizedFilePath));
      
      // Also handle specs directory structure for this format
      const pathAfterSpecWorkflow = normalizedFilePath.substring('spec-workflow/'.length);
      if (pathAfterSpecWorkflow && !pathAfterSpecWorkflow.startsWith('specs/')) {
        candidates.push(path.join(workspaceRoot, '.spec-workflow', 'specs', pathAfterSpecWorkflow));
        candidates.push(path.join(workspaceRoot, 'spec-workflow', 'specs', pathAfterSpecWorkflow));
      }
    } else if (!normalizedFilePath.includes('spec-workflow')) {
      // If path doesn't contain spec-workflow at all, try adding it
      candidates.push(path.join(workspaceRoot, '.spec-workflow', normalizedFilePath));
      
      // Also try under specs directory
      candidates.push(path.join(workspaceRoot, '.spec-workflow', 'specs', normalizedFilePath));
    }

    // 4) Handle Windows-style paths with backslashes
    if (filePath.includes('\\') && filePath !== normalizedFilePath) {
      candidates.push(path.join(workspaceRoot, filePath));
    }

    // 5) Try common spec document locations as fallback
    const fileName = path.basename(normalizedFilePath);
    const specWorkflowRoot = path.join(workspaceRoot, '.spec-workflow');

    // Try in various common subdirectories
    const commonDirs = ['specs', 'test', 'tasks', 'requirements', 'design'];
    for (const dir of commonDirs) {
      candidates.push(path.join(specWorkflowRoot, dir, fileName));
    }

    // Try with spec document structure if filePath looks like a spec document
    if (fileName.match(/\.(md|txt)$/)) {
      const baseName = path.basename(fileName, path.extname(fileName));
      for (const dir of commonDirs) {
        candidates.push(path.join(specWorkflowRoot, dir, baseName, fileName));
      }
    }

    // Remove duplicates while preserving order
    const uniqueCandidates = [...new Set(candidates)];

    console.log(`Trying ${uniqueCandidates.length} candidate paths:`, uniqueCandidates);

    // Test each candidate path
    for (const candidate of uniqueCandidates) {
      try {
        await fs.access(candidate);
        console.log(`✅ Successfully resolved approval file path: "${filePath}" -> "${candidate}"`);
        return candidate;
      } catch {
        // File doesn't exist at this location, continue to next candidate
        console.log(`❌ File not found at: ${candidate}`);
      }
    }

    // Log detailed failure information
    console.error(`❌ Failed to resolve approval file path: "${filePath}"`);
    console.error(`Workspace root: ${workspaceRoot}`);
    console.error(`All attempted paths (${uniqueCandidates.length}):`, uniqueCandidates);
    
    return null;
  }

  updateEditorDecorations(editor: vscode.TextEditor) {
    // Find approval context for this editor
    const approvalContext = Array.from(this.activeApprovalEditors.values())
      .find(context => context.document === editor.document);

    if (!approvalContext) {
      return;
    }

    const { approval } = approvalContext;

    // Clear existing decorations first
    this.clearEditorDecorations(editor);

    // Apply status-based decorations
    this.applyStatusDecorations(editor, approval);

    // Apply comment decorations
    this.applyCommentDecorations(editor, approval);

    // Apply annotation decorations
    this.applyAnnotationDecorations(editor, approval);
  }

  private clearEditorDecorations(editor: vscode.TextEditor) {
    // Clear status decorations
    this.decorationTypes.forEach(decorationType => {
      editor.setDecorations(decorationType, []);
    });
    
    // Clear comment decorations
    this.commentDecorationTypes.forEach(decorationType => {
      editor.setDecorations(decorationType, []);
    });
  }

  private applyStatusDecorations(editor: vscode.TextEditor, approval: ApprovalData) {
    const decorationType = this.decorationTypes.get(approval.status) || this.decorationTypes.get('pending')!;

    // Create a simple approval mode indicator
    const headerDecoration: vscode.DecorationOptions = {
      range: new vscode.Range(0, 0, 0, 0),
      hoverMessage: this.createApprovalHoverMessage(approval),
      renderOptions: {
        before: {
          contentText: 'Approval Mode',
          color: 'rgba(40, 167, 69, 0.8)',
          fontStyle: 'italic',
          margin: '0',
          textDecoration: 'none; display: block; text-align: right; font-size: 12px; padding: 2px 5px; background: rgba(40, 167, 69, 0.1); border-radius: 3px;'
        }
      }
    };

    editor.setDecorations(decorationType, [headerDecoration]);
  }

  private applyCommentDecorations(editor: vscode.TextEditor, approval: ApprovalData) {
    if (!approval.comments || approval.comments.length === 0) {
      return;
    }

    approval.comments.forEach(comment => {
      const decorationType = this.getOrCreateCommentDecorationType(comment);
      const decorations: vscode.DecorationOptions[] = [];

      // Support multi-line selections
      if (comment.startLine !== undefined && comment.endLine !== undefined) {
        const startLine = Math.max(0, Math.min(comment.startLine - 1, editor.document.lineCount - 1));
        const endLine = Math.max(0, Math.min(comment.endLine - 1, editor.document.lineCount - 1));
        
        // Create decorations for each line in the range
        for (let lineNum = startLine; lineNum <= endLine; lineNum++) {
          const line = editor.document.lineAt(lineNum);
          let range: vscode.Range;
          
          if (startLine === endLine) {
            // Single line - use the full line range
            range = line.range;
          } else if (lineNum === startLine) {
            // First line - from start to end of line
            range = new vscode.Range(lineNum, 0, lineNum, line.text.length);
          } else if (lineNum === endLine) {
            // Last line - from start of line to end
            range = new vscode.Range(lineNum, 0, lineNum, line.text.length);
          } else {
            // Middle lines - full line
            range = line.range;
          }

          decorations.push({
            range,
            hoverMessage: this.createCommentHoverMessage(comment)
          });
        }
      } 
      // Backward compatibility - single line number (deprecated)
      else if (comment.lineNumber !== undefined && comment.lineNumber > 0) {
        const line = Math.max(0, Math.min(comment.lineNumber - 1, editor.document.lineCount - 1));
        const lineRange = editor.document.lineAt(line).range;

        decorations.push({
          range: lineRange,
          hoverMessage: this.createCommentHoverMessage(comment)
        });
      }

      if (decorations.length > 0) {
        editor.setDecorations(decorationType, decorations);
      }
    });
  }

  private applyAnnotationDecorations(editor: vscode.TextEditor, approval: ApprovalData) {
    if (!approval.annotations) {
      return;
    }

    // Create a decoration for annotations at the top of the file
    const annotationDecorationType = vscode.window.createTextEditorDecorationType({
      backgroundColor: 'rgba(255, 235, 59, 0.1)',
      border: '1px solid rgba(255, 235, 59, 0.3)',
      borderRadius: '2px',
      isWholeLine: false
    });

    const annotationDecoration: vscode.DecorationOptions = {
      range: new vscode.Range(0, 0, 0, 0),
      hoverMessage: `📝 **Annotations**: ${approval.annotations}`,
      renderOptions: {
        before: {
          contentText: `📝 Annotations: ${approval.annotations.substring(0, 50)}${approval.annotations.length > 50 ? '...' : ''}`,
          color: 'rgba(255, 193, 7, 0.8)',
          fontStyle: 'italic',
          margin: '0 0 5px 0',
          textDecoration: 'none; display: block;'
        }
      }
    };

    editor.setDecorations(annotationDecorationType, [annotationDecoration]);
  }

  private getStatusColor(status: string): string {
    switch (status) {
      case 'approved': return 'rgba(40, 167, 69, 0.8)';
      case 'rejected': return 'rgba(220, 53, 69, 0.8)';
      case 'needs-revision': return 'rgba(255, 87, 34, 0.8)';
      default: return 'rgba(255, 193, 7, 0.8)';
    }
  }

  private createCommentHoverMessage(comment: ApprovalComment): vscode.MarkdownString {
    const message = new vscode.MarkdownString();
    message.isTrusted = true;

    message.appendMarkdown(`### ${localize('commentHover.title', 'Comment')}\n\n`);
    message.appendMarkdown(`${comment.text}\n\n`);
    message.appendMarkdown(`**${localize('commentHover.created', 'Created')}**: ${new Date(comment.timestamp).toLocaleString()}\n\n`);

    // Add action buttons
    const editComment = localize('commentHover.edit', 'Edit Comment');
    const deleteComment = localize('commentHover.delete', 'Delete Comment');
    message.appendMarkdown(`---\n\n`);
    message.appendMarkdown(`[${editComment}](command:spec-workflow.editComment?${encodeURIComponent(JSON.stringify({commentId: comment.id}))}) | `);
    message.appendMarkdown(`[${deleteComment}](command:spec-workflow.deleteComment?${encodeURIComponent(JSON.stringify({commentId: comment.id}))})`);

    return message;
  }

  private createApprovalHoverMessage(approval: ApprovalData): vscode.MarkdownString {
    const message = new vscode.MarkdownString();
    message.isTrusted = true;

    message.appendMarkdown(`## 📋 ${localize('approvalHover.title', 'Approval')}: ${approval.title}\n\n`);
    message.appendMarkdown(`**${localize('approvalHover.status', 'Status')}**: ${approval.status.toUpperCase()}\n\n`);
    message.appendMarkdown(`**${localize('approvalHover.created', 'Created')}**: ${new Date(approval.createdAt).toLocaleString()}\n\n`);

    if (approval.response) {
      message.appendMarkdown(`**${localize('approvalHover.response', 'Response')}**: ${approval.response}\n\n`);
    }

    if (approval.annotations) {
      message.appendMarkdown(`**${localize('approvalHover.annotations', 'Annotations')}**: ${approval.annotations}\n\n`);
    }

    if (approval.comments && approval.comments.length > 0) {
      message.appendMarkdown(`**${localize('approvalHover.comments', 'Comments')}**: ${localize('approvalHover.commentsCount', '{0} comment(s)', approval.comments.length)}\n\n`);
    }

    // Add action buttons
    const approve = localize('approvalHover.approve', 'Approve');
    const reject = localize('approvalHover.reject', 'Reject');
    const requestRevision = localize('approvalHover.requestRevision', 'Request Revision');
    message.appendMarkdown(`---\n\n`);
    message.appendMarkdown(`[${approve}](command:spec-workflow.approveFromEditor?${encodeURIComponent(JSON.stringify({id: approval.id}))}) | `);
    message.appendMarkdown(`[${reject}](command:spec-workflow.rejectFromEditor?${encodeURIComponent(JSON.stringify({id: approval.id}))}) | `);
    message.appendMarkdown(`[${requestRevision}](command:spec-workflow.requestRevisionFromEditor?${encodeURIComponent(JSON.stringify({id: approval.id}))})`);

    return message;
  }

  private showApprovalInfo(approval: ApprovalData) {
    const message = localize('approvalInfo.message', '📋 Approval: {0} ({1})', approval.title, approval.status);
    const viewDetails = localize('approvalInfo.viewDetails', 'View Details');
    const close = localize('approvalInfo.close', 'Close');
    vscode.window.showInformationMessage(message, viewDetails, close)
      .then(selection => {
        if (selection === viewDetails) {
          // Could open a detailed view or sidebar
        }
      });
  }

  async addCommentToSelection(editor: vscode.TextEditor, commentText: string, highlightColor?: HighlightColor): Promise<boolean> {
    const approval = this.getActiveApprovalForEditor(editor);
    if (!approval) {
      return false;
    }

    const selection = editor.selection;
    if (selection.isEmpty) {
      vscode.window.showWarningMessage(localize('error.noTextSelectionForComment', 'Please select text to add a comment'));
      return false;
    }

    // Capture full selection range for multi-line support
    const startLine = selection.start.line + 1; // Convert to 1-based
    const endLine = selection.end.line + 1; // Convert to 1-based
    const selectedText = editor.document.getText(selection);

    const newComment: ApprovalComment = {
      id: this.generateCommentId(),
      text: commentText,
      // Use new multi-line range format
      startLine: startLine,
      endLine: endLine,
      selectedText: selectedText,
      highlightColor: highlightColor || generateRandomColor(),
      // Keep lineNumber for backward compatibility
      lineNumber: startLine,
      timestamp: new Date().toISOString(),
      resolved: false
    };

    // Add comment to approval data
    if (!approval.comments) {
      approval.comments = [];
    }
    approval.comments.push(newComment);

    // Save updated approval
    await this.saveApprovalData(approval);

    // Update decorations
    this.updateEditorDecorations(editor);

    return true;
  }

  async resolveComment(approval: ApprovalData, commentId: string): Promise<boolean> {
    if (!approval.comments) {
      return false;
    }

    const comment = approval.comments.find(c => c.id === commentId);
    if (!comment) {
      return false;
    }

    comment.resolved = true;

    // Save updated approval
    await this.saveApprovalData(approval);

    // Update decorations for all editors showing this approval
    this.activeApprovalEditors.forEach(context => {
      if (context.approval.id === approval.id) {
        this.updateEditorDecorations(context.editor);
      }
    });

    return true;
  }

  private generateCommentId(): string {
    return 'comment-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  }

  async saveApprovalData(approval: ApprovalData): Promise<void> {
    try {
      await this.specWorkflowService.saveApprovalData(approval);

      // Notify other editors about the change
      this.notifyApprovalDataChanged(approval);
    } catch (error) {
      console.error('Failed to save approval data:', error);
      throw error;
    }
  }

  private notifyApprovalDataChanged(approval: ApprovalData) {
    // Update all editors showing this approval
    this.activeApprovalEditors.forEach(context => {
      if (context.approval.id === approval.id) {
        // Update the context with new data
        context.approval = approval;
        // Refresh decorations
        this.updateEditorDecorations(context.editor);
      }
    });
  }

  // Method to handle external approval data changes (from file system watcher)
  async handleExternalApprovalChange(approvalId: string): Promise<void> {
    const context = this.activeApprovalEditors.get(approvalId);
    if (!context) {
      return; // No active editor for this approval
    }

    try {
      // Reload approval data from file
      const approvalPath = await this.specWorkflowService.findApprovalPath(approvalId);
      if (!approvalPath) {
        // Approval was deleted, close the editor
        this.closeApprovalEditor(approvalId);
        vscode.window.showInformationMessage(localize('info.approvalDeleted', 'Approval "{0}" was deleted', context.approval.title));
        return;
      }

      const fs = require('fs').promises;
      const content = await fs.readFile(approvalPath, 'utf-8');
      const updatedApproval = JSON.parse(content) as ApprovalData;

      // Verify the file still exists at the expected location
      const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
      if (workspaceRoot && updatedApproval.filePath) {
        const resolvedPath = await this.resolveApprovalFilePath(updatedApproval.filePath, workspaceRoot);
        if (!resolvedPath) {
          vscode.window.showWarningMessage(
            localize('warning.fileForApprovalNotFound', 'File for approval "{0}" could not be found: {1}', updatedApproval.title, updatedApproval.filePath)
          );
        }
      }

      // Update the context
      context.approval = updatedApproval;

      // Refresh decorations
      this.updateEditorDecorations(context.editor);

      // Show notification about external changes
      const refresh = localize('action.refresh', 'Refresh');
      vscode.window.showInformationMessage(
        localize('info.approvalUpdatedExternally', 'Approval "{0}" was updated externally', updatedApproval.title),
        refresh
      ).then(selection => {
        if (selection === refresh) {
          this.updateEditorDecorations(context.editor);
        }
      });

    } catch (error) {
      console.error(`Failed to handle external approval change for ${approvalId}:`, error);
      vscode.window.showErrorMessage(localize('error.externalChangeFailed', 'Failed to handle external approval change: {0}', String(error)));
    }
  }

  getActiveApprovalForEditor(editor: vscode.TextEditor): ApprovalData | null {
    const context = Array.from(this.activeApprovalEditors.values())
      .find(ctx => ctx.editor === editor);
    return context?.approval || null;
  }

  closeApprovalEditor(approvalId: string) {
    const context = this.activeApprovalEditors.get(approvalId);
    if (context) {
      // Clear status decorations
      Object.values(this.decorationTypes).forEach(decorationType => {
        context.editor.setDecorations(decorationType, []);
      });
      
      // Clear comment decorations
      this.commentDecorationTypes.forEach(decorationType => {
        context.editor.setDecorations(decorationType, []);
      });
      
      this.activeApprovalEditors.delete(approvalId);
    }
  }

  dispose() {
    // Clear all decorations and contexts
    this.activeApprovalEditors.clear();
    this.decorationTypes.forEach(decorationType => decorationType.dispose());
    this.decorationTypes.clear();
    this.commentDecorationTypes.forEach(decorationType => decorationType.dispose());
    this.commentDecorationTypes.clear();
  }
}
