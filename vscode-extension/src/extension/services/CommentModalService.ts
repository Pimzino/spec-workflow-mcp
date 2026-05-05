import * as vscode from 'vscode';
import * as path from 'path';
import { HighlightColor, ApprovalComment } from '../types.js';
import { hexToColorObject } from '../utils/colorUtils.js';

export interface CommentModalOptions {
  selectedText: string;
  editor: vscode.TextEditor;
  selection: vscode.Selection;
  existingComment?: ApprovalComment;
  onSave: (comment: string, color: HighlightColor) => Promise<void>;
}

export class CommentModalService {
  private static instance: CommentModalService;
  private currentPanel: vscode.WebviewPanel | undefined;
  private extensionUri: vscode.Uri;

  constructor(extensionUri: vscode.Uri) {
    this.extensionUri = extensionUri;
  }

  static getInstance(extensionUri: vscode.Uri): CommentModalService {
    if (!CommentModalService.instance) {
      CommentModalService.instance = new CommentModalService(extensionUri);
    }
    return CommentModalService.instance;
  }

  async showCommentModal(options: CommentModalOptions): Promise<void> {
    // Close existing panel if open
    if (this.currentPanel) {
      this.currentPanel.dispose();
    }

    // Create webview panel in split view to the right
    this.currentPanel = vscode.window.createWebviewPanel(
      'specWorkflowCommentModal',
      options.existingComment ? 'Edit Comment' : 'Add Comment',
      vscode.ViewColumn.Two,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [
          vscode.Uri.joinPath(this.extensionUri, 'webview-dist')
        ]
      }
    );

    // Set webview HTML content
    this.currentPanel.webview.html = await this.getWebviewContent(options.selectedText, options.existingComment);

    // Handle messages from webview
    this.currentPanel.webview.onDidReceiveMessage(
      async (message) => {
        switch (message.command) {
          case 'save':
            if (message.comment && message.color) {
              try {
                const color = hexToColorObject(message.color);
                await options.onSave(message.comment, color);
                this.currentPanel?.dispose();
                vscode.window.showInformationMessage('💬 Comment added successfully');
              } catch (error) {
                vscode.window.showErrorMessage(`Failed to add comment: ${error}`);
              }
            }
            break;
          case 'cancel':
            this.currentPanel?.dispose();
            break;
        }
      },
      undefined
    );

    // Clean up when panel is disposed
    this.currentPanel.onDidDispose(() => {
      this.currentPanel = undefined;
    });

    // Focus the webview
    this.currentPanel.reveal();
  }

  private async getWebviewContent(selectedText: string, existingComment?: ApprovalComment): Promise<string> {
    const webviewDistUri = this.currentPanel!.webview.asWebviewUri(
      vscode.Uri.joinPath(this.extensionUri, 'webview-dist')
    );

    // Read the built HTML file
    const htmlPath = vscode.Uri.joinPath(this.extensionUri, 'webview-dist', 'comment-modal.html');
    let htmlContent: string;
    
    try {
      const htmlBytes = await vscode.workspace.fs.readFile(htmlPath);
      htmlContent = new TextDecoder().decode(htmlBytes);
    } catch (error) {
      // Fallback to basic HTML if built file not found
      return this.getFallbackContent(selectedText, webviewDistUri, existingComment);
    }

    // Convert relative resource paths to webview URIs
    htmlContent = htmlContent
      .replace(/src="\/([^"]+)"/g, `src="${webviewDistUri}/$1"`)
      .replace(/href="\/([^"]+)"/g, `href="${webviewDistUri}/$1"`)
      .replace(/src="\.\/([^"]+)"/g, `src="${webviewDistUri}/$1"`)
      .replace(/href="\.\/([^"]+)"/g, `href="${webviewDistUri}/$1"`);

    // Inject initial state
    const stateScript = `
      <script>
        window.initialState = {
          selectedText: ${JSON.stringify(selectedText)},
          existingComment: ${existingComment ? JSON.stringify(existingComment) : 'null'}
        };
      </script>`;
    
    htmlContent = htmlContent.replace('</head>', `${stateScript}</head>`);

    return htmlContent;
  }

  private getFallbackContent(selectedText: string, webviewDistUri: vscode.Uri, existingComment?: ApprovalComment): string {
    return `<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Add Comment</title>
        <link rel="stylesheet" href="${webviewDistUri}/globals.css">
        <style>
          body {
            margin: 0;
            padding: 0;
            font-family: var(--vscode-font-family), -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            font-size: var(--vscode-font-size, 13px);
            line-height: 1.4;
            color: var(--vscode-foreground);
            background: var(--vscode-editor-background);
          }
          #root {
            width: 100%;
            height: 100vh;
          }
        </style>
      </head>
      <body>
        <div id="root"></div>
        <script>
          window.initialState = {
            selectedText: ${JSON.stringify(selectedText)},
            existingComment: ${existingComment ? JSON.stringify(existingComment) : 'null'}
          };
        </script>
        <script type="module" src="${webviewDistUri}/comment-modal.js"></script>
      </body>
      </html>`;
  }

}