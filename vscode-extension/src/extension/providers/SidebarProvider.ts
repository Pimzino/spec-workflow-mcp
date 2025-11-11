import * as vscode from 'vscode';
import * as path from 'path';
import { SpecWorkflowService } from '../services/SpecWorkflowService';
import { Logger } from '../utils/logger';

export class SidebarProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'spec-workflow.sidebar';
  private _view?: vscode.WebviewView;
  private _currentSelectedSpec: string | null = null;
  private logger: Logger;
  private _previousApprovals: any[] = [];
  private _messageQueue: Array<{ type: string; data: any }> = [];

  constructor(
    private readonly _extensionUri: vscode.Uri,
    private readonly _specWorkflowService: SpecWorkflowService,
    private readonly _context: vscode.ExtensionContext,
    outputChannel: vscode.OutputChannel
  ) {
    this.logger = new Logger(outputChannel);
    // Set up automatic approval updates when files change
    this._specWorkflowService.setOnApprovalsChanged(() => {
      this.handleApprovalChanges();
    });

    // Set up automatic task updates when files change
    this._specWorkflowService.setOnTasksChanged((specName: string) => {
      this.sendTasksForSpec(specName);
    });

    // Set up automatic spec documents updates when files change
    this._specWorkflowService.setOnSpecDocumentsChanged((specName: string) => {
      this.sendSpecDocumentsForSpec(specName);
      // Also refresh specs list to update the overall spec lastModified time in Overview tab
      this.sendSpecs();
    });

    // Set up automatic steering documents updates when files change
    this._specWorkflowService.setOnSteeringDocumentsChanged(() => {
      this.sendSteeringDocuments();
    });

    // Set up automatic specs list updates when directory changes
    this._specWorkflowService.setOnSpecsChanged(() => {
      this.sendSpecs();
    });

    // Set up automatic logs updates when files change
    this._specWorkflowService.setOnLogsChanged((specName: string) => {
      this.sendLogsForSpec(specName);
    });
  }

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken,
  ) {
    this._view = webviewView;

    webviewView.webview.options = {
      // Allow scripts in the webview
      enableScripts: true,
      localResourceRoots: [
        this._extensionUri,
        vscode.Uri.joinPath(this._extensionUri, 'webview-dist')
      ]
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    // Handle messages from the webview
    webviewView.webview.onDidReceiveMessage(async (message) => {
      switch (message.type) {
        case 'refresh-all':
          await this.refreshAllData();
          break;
        case 'get-specs':
          await this.sendSpecs();
          break;
        case 'get-tasks':
          await this.sendTasks(message.specName);
          break;
        case 'get-approvals':
          await this.sendApprovals();
          break;
        case 'get-approval-categories':
          await this.sendApprovalCategories();
          break;
        case 'get-steering':
          await this.sendSteering();
          break;
        case 'update-task-status':
          await this.updateTaskStatus(message.specName, message.taskId, message.status);
          break;
        case 'save-document':
          await this.saveDocument(message.specName, message.docType, message.content);
          break;
        case 'approve-request':
          await this.approveRequest(message.id, message.response);
          break;
        case 'reject-request':
          await this.rejectRequest(message.id, message.response);
          break;
        case 'request-revision-request':
          await this.requestRevisionRequest(message.id, message.response, message.annotations, message.comments);
          break;
        case 'get-approval-content':
          await this.sendApprovalContent(message.id);
          break;
        case 'get-spec-documents':
          await this.sendSpecDocuments(message.specName);
          break;
        case 'get-steering-documents':
          await this.sendSteeringDocuments();
          break;
        case 'open-document':
          await this.openDocument(message.specName, message.docType);
          break;
        case 'open-steering-document':
          await this.openSteeringDocument(message.docType);
          break;
        case 'refresh-all':
          await this.refreshAllData();
          break;
        case 'get-selected-spec':
          await this.sendSelectedSpec();
          break;
        case 'set-selected-spec':
          await this.setSelectedSpec(message.specName);
          break;
        case 'get-config':
          await this.sendConfig();
          break;
        case 'get-archived-specs':
          await this.sendArchivedSpecs();
          break;
        case 'archive-spec':
          await this.archiveSpec(message.specName);
          break;
        case 'unarchive-spec':
          await this.unarchiveSpec(message.specName);
          break;
        case 'open-external-url':
          await this.openExternalUrl(message.url);
          break;
        case 'get-language-preference':
          await this.sendLanguagePreference();
          break;
        case 'set-language-preference':
          await this.setLanguagePreference(message.language);
          break;
        case 'get-logs':
          await this.sendLogs(message.specName);
          break;
        case 'search-logs':
          await this.searchLogs(message.specName, message.query);
          break;
      }
    });

    // Initialize data
    this.refreshAllData();
    
    // Process any queued messages now that view is ready
    this.processMessageQueue();
  }

  private postMessageToWebview(message: { type: string; data: any }) {
    if (this._view) {
      console.log(`SidebarProvider: Sending message ${message.type} to webview`);
      this._view.webview.postMessage(message);
    } else {
      console.log(`SidebarProvider: Queueing message ${message.type} - view not available`);
      this._messageQueue.push(message);
    }
  }

  private processMessageQueue() {
    if (this._messageQueue.length > 0 && this._view) {
      console.log(`SidebarProvider: Processing ${this._messageQueue.length} queued messages`);
      const messages = [...this._messageQueue];
      this._messageQueue = [];
      messages.forEach(message => {
        console.log(`SidebarProvider: Sending queued message ${message.type}`);
        this._view!.webview.postMessage(message);
      });
    }
  }

  private async refreshAllData() {
    console.log('SidebarProvider: Refreshing all data');
    await this._specWorkflowService.refreshData();
    await this.sendSpecs();
    await this.sendApprovals();
    await this.sendSteering();
    await this.sendSteeringDocuments();
    await this.sendSelectedSpec();
    await this.sendSoundUris();
  }

  private async sendSpecs() {
    if (!this._view) {return;}
    
    try {
      console.log('SidebarProvider: Loading specs...');
      const specs = await this._specWorkflowService.getAllSpecs();
      console.log(`SidebarProvider: Sending ${specs.length} specs to webview`);
      this._view.webview.postMessage({
        type: 'specs-updated',
        data: specs
      });
    } catch (error) {
      console.error('SidebarProvider: Failed to load specs:', error);
      this.sendError('Failed to load specs: ' + (error as Error).message);
    }
  }

  private async sendTasks(specName: string) {
    if (!this._view) {return;}

    try {
      this.logger.log(`SidebarProvider: Getting tasks for spec: ${specName}`);
      const taskData = await this._specWorkflowService.getTaskProgress(specName);
      this.logger.log('SidebarProvider: Task data received from service:', {
        specName: taskData?.specName,
        total: taskData?.total,
        taskListCount: taskData?.taskList?.length,
        sampleTask2_2: taskData?.taskList?.find(t => t.id === '2.2'),
        allTasksWithMetadata: taskData?.taskList?.filter(t => 
          t.requirements?.length || t.implementationDetails?.length || t.files?.length || t.purposes?.length || t.leverage
        ).map(t => ({ id: t.id, requirements: t.requirements, implementationDetails: t.implementationDetails }))
      });
      
      this._view.webview.postMessage({
        type: 'tasks-updated',
        data: taskData
      });
      this.logger.log('SidebarProvider: Sent tasks-updated message to webview');
    } catch (error) {
      console.error('SidebarProvider: Failed to load tasks:', error);
      this.sendError('Failed to load tasks: ' + (error as Error).message);
    }
  }

  private async sendTasksForSpec(specName: string) {
    // Send tasks update for a specific spec in real-time
    // Only send if this spec is currently selected to avoid unnecessary updates
    console.log(`sendTasksForSpec: Called for spec ${specName}, currentSelected: ${this._currentSelectedSpec}`);
    if (!this._view || this._currentSelectedSpec !== specName) {
      console.log(`sendTasksForSpec: Skipping - no view or spec not selected`);
      return;
    }

    try {
      const taskData = await this._specWorkflowService.getTaskProgress(specName);
      console.log('sendTasksForSpec: Task data received from service:', JSON.stringify({
        specName: taskData?.specName,
        total: taskData?.total,
        taskListCount: taskData?.taskList?.length,
        sampleTask2_2: taskData?.taskList?.find(t => t.id === '2.2')
      }, null, 2));
      
      this._view.webview.postMessage({
        type: 'tasks-updated',
        data: taskData
      });
      console.log(`sendTasksForSpec: Sent real-time task update for spec: ${specName}`);
    } catch (error) {
      console.error(`Failed to send real-time task update for spec ${specName}:`, error);
      // Don't show error notification for real-time updates to avoid spam
    }
  }

  private async sendSpecDocumentsForSpec(specName: string) {
    // Send spec documents update for a specific spec in real-time
    // Only send if this spec is currently selected to avoid unnecessary updates
    console.log(`sendSpecDocumentsForSpec: Called for spec ${specName}, currentSelected: ${this._currentSelectedSpec}`);
    if (!this._view || this._currentSelectedSpec !== specName) {
      console.log(`sendSpecDocumentsForSpec: Skipping - no view or spec not selected`);
      return;
    }

    try {
      const documents = await this._specWorkflowService.getSpecDocuments(specName);
      console.log(`sendSpecDocumentsForSpec: Found ${documents.length} documents for ${specName}`);
      
      this._view.webview.postMessage({
        type: 'spec-documents-updated',
        data: documents
      });
      console.log(`sendSpecDocumentsForSpec: Sent real-time spec documents update for spec: ${specName}`);
    } catch (error) {
      console.error(`Failed to send real-time spec documents update for spec ${specName}:`, error);
      // Don't show error notification for real-time updates to avoid spam
    }
  }

  private async handleApprovalChanges() {
    try {
      console.log('=== handleApprovalChanges called ===');
      const currentApprovals = await this._specWorkflowService.getApprovals();
      const pendingCount = currentApprovals.filter((a: any) => a.status === 'pending').length;
      console.log(`handleApprovalChanges: Found ${currentApprovals.length} approvals (${pendingCount} pending)`);
      console.log('handleApprovalChanges: View available:', !!this._view);
      
      // Check for new pending approvals
      const currentPendingIds = currentApprovals
        .filter((approval: any) => approval.status === 'pending')
        .map((approval: any) => approval.id);
      
      const previousPendingIds = this._previousApprovals
        .filter((approval: any) => approval.status === 'pending')
        .map((approval: any) => approval.id);

      // Find newly added pending approvals
      const newPendingIds = currentPendingIds.filter(id => !previousPendingIds.includes(id));
      
      if (newPendingIds.length > 0) {
        // Show native VS Code notification for each new approval
        for (const approvalId of newPendingIds) {
          const approval = currentApprovals.find((a: any) => a.id === approvalId);
          if (approval) {
            const result = await vscode.window.showInformationMessage(
              `New approval request: "${approval.title}"`,
              'View Approval',
              'Dismiss'
            );
            
            if (result === 'View Approval') {
              // First, ensure the sidebar is visible
              await vscode.commands.executeCommand('workbench.view.extension.spec-workflow');
              
              // Small delay to ensure the webview is initialized
              setTimeout(async () => {
                // Navigate to approvals tab and select the spec
                this._currentSelectedSpec = approval.categoryName;
                await this.sendSelectedSpec();
                await this.sendApprovals();
                
                // Send message to webview to switch to approvals tab
                if (this._view) {
                  this._view.webview.postMessage({
                    type: 'navigate-to-approvals',
                    data: { specName: approval.categoryName, approvalId: approval.id }
                  });
                }
              }, 300);
            }
          }
        }
      }

      // Update previous approvals for next comparison
      this._previousApprovals = [...currentApprovals];
      
      // Send approvals to webview as usual
      console.log('handleApprovalChanges: Sending updated approvals to webview');
      await this.sendApprovals();
      
    } catch (error) {
      console.error('Failed to handle approval changes:', error);
      console.log('handleApprovalChanges: Fallback - sending approvals despite error');
      await this.sendApprovals(); // Fallback to just sending approvals
    }
  }

  private async sendApprovals() {
    try {
      const approvals = await this._specWorkflowService.getApprovals();
      const pendingCount = approvals.filter((a: any) => a.status === 'pending').length;
      console.log(`sendApprovals: Loaded ${approvals.length} approvals (${pendingCount} pending), view available: ${!!this._view}`);
      
      this.postMessageToWebview({
        type: 'approvals-updated',
        data: approvals
      });
    } catch (error) {
      console.error('sendApprovals: Error loading approvals:', error);
      this.sendError('Failed to load approvals: ' + (error as Error).message);
    }
  }

  private async sendApprovalCategories() {
    try {
      const categories = await this._specWorkflowService.getApprovalCategories();
      console.log(`sendApprovalCategories: Loaded ${categories.length} categories`);
      
      this.postMessageToWebview({
        type: 'approval-categories-updated',
        data: categories
      });
    } catch (error) {
      console.error('sendApprovalCategories: Error loading categories:', error);
      this.sendError('Failed to load approval categories: ' + (error as Error).message);
    }
  }

  private async sendSteering() {
    if (!this._view) {return;}

    try {
      const steering = await this._specWorkflowService.getSteeringStatus();
      this._view.webview.postMessage({
        type: 'steering-updated',
        data: steering
      });
    } catch (error) {
      this.sendError('Failed to load steering: ' + (error as Error).message);
    }
  }

  private async updateTaskStatus(specName: string, taskId: string, status: string) {
    try {
      console.log(`updateTaskStatus: Updating task ${taskId} to ${status} in spec ${specName}`);
      await this._specWorkflowService.updateTaskStatus(specName, taskId, status);
      console.log(`updateTaskStatus: Successfully updated task ${taskId}. File watcher will trigger automatic refresh.`);
      // File watcher will automatically trigger sendTasksForSpec() - no need to manually refresh
      this.sendNotification('Task status updated', 'success');
    } catch (error) {
      console.error(`updateTaskStatus: Failed to update task ${taskId}:`, error);
      this.sendError('Failed to update task status: ' + (error as Error).message);
    }
  }

  private async saveDocument(specName: string, docType: string, content: string) {
    try {
      await this._specWorkflowService.saveDocument(specName, docType, content);
      this.sendNotification('Document saved successfully', 'success');
    } catch (error) {
      this.sendError('Failed to save document: ' + (error as Error).message);
    }
  }

  private async approveRequest(id: string, response: string) {
    try {
      await this._specWorkflowService.approveRequest(id, response);
      await this.sendApprovals();
      this.sendNotification('Request approved', 'success');
    } catch (error) {
      this.sendError('Failed to approve request: ' + (error as Error).message);
    }
  }

  private async rejectRequest(id: string, response: string) {
    try {
      await this._specWorkflowService.rejectRequest(id, response);
      await this.sendApprovals();
      this.sendNotification('Request rejected', 'success');
    } catch (error) {
      this.sendError('Failed to reject request: ' + (error as Error).message);
    }
  }

  private async requestRevisionRequest(id: string, response: string, annotations?: string, comments?: any[]) {
    try {
      await this._specWorkflowService.requestRevisionRequest(id, response, annotations, comments);
      await this.sendApprovals();
      this.sendNotification('Revision requested', 'success');
    } catch (error) {
      this.sendError('Failed to request revision: ' + (error as Error).message);
    }
  }

  private async sendApprovalContent(id: string) {
    try {
      // Open approval in editor instead of sending content to webview
      const success = await this._specWorkflowService.openApprovalInEditor(id);
      if (success) {
        this.sendNotification('Approval opened in editor', 'success');
      } else {
        this.sendError('Failed to open approval in editor');
      }
    } catch (error) {
      this.sendError('Failed to open approval content: ' + (error as Error).message);
    }
  }

  private sendError(message: string) {
    if (this._view) {
      this._view.webview.postMessage({
        type: 'error',
        message
      });
    }
  }

  private sendNotification(message: string, level: 'info' | 'warning' | 'error' | 'success') {
    if (this._view) {
      this._view.webview.postMessage({
        type: 'notification',
        message,
        level
      });
    }
  }

  private async sendSpecDocuments(specName: string) {
    if (!this._view) {return;}

    try {
      console.log(`SidebarProvider: Loading documents for spec ${specName}`);
      const documents = await this._specWorkflowService.getSpecDocuments(specName);
      console.log(`SidebarProvider: Found ${documents.length} documents for ${specName}:`, documents.map(d => `${d.name} (${d.exists ? 'exists' : 'missing'})`));
      this._view.webview.postMessage({
        type: 'spec-documents-updated',
        data: documents
      });
    } catch (error) {
      console.error('SidebarProvider: Failed to load spec documents:', error);
      this.sendError('Failed to load spec documents: ' + (error as Error).message);
    }
  }

  private async sendSteeringDocuments() {
    if (!this._view) {return;}

    try {
      const documents = await this._specWorkflowService.getSteeringDocuments();
      this._view.webview.postMessage({
        type: 'steering-documents-updated',
        data: documents
      });
    } catch (error) {
      this.sendError('Failed to load steering documents: ' + (error as Error).message);
    }
  }

  private async sendLogs(specName: string) {
    if (!this._view) {return;}

    try {
      this.logger.log(`SidebarProvider: Getting logs for spec: ${specName}`);
      const logsData = await this._specWorkflowService.getImplementationLogs(specName);
      this.logger.log('SidebarProvider: Logs data received from service:', {
        specName: logsData?.specName,
        entriesCount: logsData?.entries?.length,
        stats: logsData?.stats
      });

      this._view.webview.postMessage({
        type: 'logs-updated',
        data: logsData
      });
      this.logger.log('SidebarProvider: Sent logs-updated message to webview');
    } catch (error) {
      console.error('SidebarProvider: Failed to load logs:', error);
      this.sendError('Failed to load logs: ' + (error as Error).message);
    }
  }

  private async sendLogsForSpec(specName: string) {
    // Send logs update for a specific spec in real-time
    // Only send if this spec is currently selected to avoid unnecessary updates
    console.log(`sendLogsForSpec: Called for spec ${specName}, currentSelected: ${this._currentSelectedSpec}`);
    if (!this._view || this._currentSelectedSpec !== specName) {
      console.log(`sendLogsForSpec: Skipping - no view or spec not selected`);
      return;
    }

    try {
      const logsData = await this._specWorkflowService.getImplementationLogs(specName);
      console.log(`sendLogsForSpec: Logs data received from service:`, {
        specName: logsData?.specName,
        entriesCount: logsData?.entries?.length,
        stats: logsData?.stats
      });

      this._view.webview.postMessage({
        type: 'logs-updated',
        data: logsData
      });
      console.log(`sendLogsForSpec: Sent real-time log update for spec: ${specName}`);
    } catch (error) {
      console.error(`Failed to send real-time log update for spec ${specName}:`, error);
      // Don't show error notification for real-time updates to avoid spam
    }
  }

  private async searchLogs(specName: string, query: string) {
    if (!this._view) {return;}

    try {
      this.logger.log(`SidebarProvider: Searching logs for spec: ${specName} with query: ${query}`);
      const entries = await this._specWorkflowService.searchImplementationLogs(specName, query);
      this.logger.log(`SidebarProvider: Search returned ${entries.length} results`);

      this._view.webview.postMessage({
        type: 'logs-search-results',
        data: {
          specName,
          entries,
          query
        }
      });
    } catch (error) {
      console.error('SidebarProvider: Failed to search logs:', error);
      this.sendError('Failed to search logs: ' + (error as Error).message);
    }
  }

  private async openDocument(specName: string, docType: string) {
    try {
      console.log(`SidebarProvider: Opening document ${docType} for spec ${specName}`);
      const docPath = await this._specWorkflowService.getDocumentPath(specName, docType);
      if (!docPath) {
        this.sendError('Document not found or invalid document type');
        return;
      }

      const uri = vscode.Uri.file(docPath);
      await vscode.window.showTextDocument(uri);
      console.log(`SidebarProvider: Successfully opened ${docPath}`);
    } catch (error) {
      console.error('SidebarProvider: Failed to open document:', error);
      this.sendError('Failed to open document: ' + (error as Error).message);
    }
  }

  private async openSteeringDocument(docType: string) {
    try {
      const docPath = this._specWorkflowService.getSteeringDocumentPath(docType);
      if (!docPath) {
        this.sendError('Invalid steering document type');
        return;
      }

      const uri = vscode.Uri.file(docPath);
      await vscode.window.showTextDocument(uri);
    } catch (error) {
      this.sendError('Failed to open steering document: ' + (error as Error).message);
    }
  }

  private async sendSelectedSpec() {
    if (!this._view) {return;}

    try {
      const selectedSpec = this._context.globalState.get<string>('selectedSpec', '');
      
      // Track the currently selected spec for real-time updates
      this._currentSelectedSpec = selectedSpec || null;
      
      console.log('SidebarProvider: Sending selected spec:', selectedSpec);
      this._view.webview.postMessage({
        type: 'selected-spec-updated',
        data: selectedSpec
      });
    } catch (error) {
      console.error('SidebarProvider: Failed to send selected spec:', error);
    }
  }

  private async setSelectedSpec(specName: string) {
    try {
      this.logger.log('SidebarProvider: Setting selected spec to:', specName);
      
      // Track the currently selected spec for real-time updates
      this._currentSelectedSpec = specName;
      
      await this._context.globalState.update('selectedSpec', specName);
      
      // Send confirmation back to webview
      await this.sendSelectedSpec();
      
      // Auto-load data for the selected spec
      if (specName) {
        await this.sendTasks(specName);
        await this.sendSpecDocuments(specName);
      }
    } catch (error) {
      console.error('SidebarProvider: Failed to set selected spec:', error);
      this.sendError('Failed to save selected specification: ' + (error as Error).message);
    }
  }

  private async sendConfig() {
    if (!this._view) { return; }

    try {
      const config = vscode.workspace.getConfiguration('specWorkflow.notifications.sounds');
      const soundConfig = {
        enabled: config.get<boolean>('enabled', true),
        volume: config.get<number>('volume', 0.3),
        approvalSound: config.get<boolean>('approvalSound', true),
        taskCompletionSound: config.get<boolean>('taskCompletionSound', true)
      };

      this._view.webview.postMessage({
        type: 'config-updated',
        data: soundConfig
      });
    } catch (error) {
      console.error('SidebarProvider: Failed to get config:', error);
      this.sendError('Failed to load configuration: ' + (error as Error).message);
    }
  }

  private async sendSoundUris() {
    if (!this._view) { return; }

    try {
      // Get paths to sound files
      const approvalSoundPath = vscode.Uri.joinPath(this._extensionUri, 'webview-dist', 'sounds', 'approval-pending.wav');
      const taskCompletedSoundPath = vscode.Uri.joinPath(this._extensionUri, 'webview-dist', 'sounds', 'task-completed.wav');

      // Convert to webview URIs
      const approvalSoundUri = this._view.webview.asWebviewUri(approvalSoundPath);
      const taskCompletedSoundUri = this._view.webview.asWebviewUri(taskCompletedSoundPath);

      const soundUris = {
        'approval-pending': approvalSoundUri.toString(),
        'task-completed': taskCompletedSoundUri.toString()
      };

      console.log('SidebarProvider: Sending sound URIs:', soundUris);

      this._view.webview.postMessage({
        type: 'sound-uris-updated',
        data: soundUris
      });
    } catch (error) {
      console.error('SidebarProvider: Failed to send sound URIs:', error);
      this.sendError('Failed to load sound URIs: ' + (error as Error).message);
    }
  }

  // ========== ARCHIVE METHODS ==========

  private async sendArchivedSpecs() {
    try {
      const archivedSpecs = await this._specWorkflowService.getAllArchivedSpecs();
      console.log(`sendArchivedSpecs: Loaded ${archivedSpecs.length} archived specs, view available: ${!!this._view}`);
      
      this.postMessageToWebview({
        type: 'archived-specs-updated',
        data: archivedSpecs
      });
    } catch (error) {
      console.error('sendArchivedSpecs: Error loading archived specs:', error);
      this.sendError('Failed to load archived specs: ' + (error as Error).message);
    }
  }

  private async archiveSpec(specName: string) {
    try {
      console.log(`SidebarProvider: Archiving spec '${specName}'`);
      
      // Show VSCode native confirmation dialog
      const choice = await vscode.window.showWarningMessage(
        `Are you sure you want to archive the specification "${specName}"?`,
        {
          detail: 'This will:\n• Remove it from all dropdowns and active views\n• Move all spec files to the archive\n• Block archiving if pending approvals exist\n\nYou can unarchive it later from the Documents tab.',
          modal: true
        },
        'Archive',
        'Cancel'
      );

      if (choice !== 'Archive') {
        console.log(`SidebarProvider: User cancelled archiving spec '${specName}'`);
        return;
      }
      
      await this._specWorkflowService.archiveSpec(specName);
      
      // Refresh active specs list and archived specs list
      await this.sendSpecs();
      await this.sendArchivedSpecs();
      
      this.sendNotification(`Spec '${specName}' archived successfully`, 'success');
      
      // If the archived spec was selected, clear the selection
      if (this._currentSelectedSpec === specName) {
        this._currentSelectedSpec = null;
        await this.sendSelectedSpec();
      }
    } catch (error) {
      console.error(`SidebarProvider: Failed to archive spec '${specName}':`, error);
      this.sendError('Failed to archive spec: ' + (error as Error).message);
    }
  }

  private async unarchiveSpec(specName: string) {
    try {
      console.log(`SidebarProvider: Unarchiving spec '${specName}'`);
      
      // Show VSCode native confirmation dialog
      const choice = await vscode.window.showWarningMessage(
        `Are you sure you want to unarchive the specification "${specName}"?`,
        {
          detail: 'This will:\n• Move it back to active specifications\n• Make it available in all dropdowns and views\n• Restore all functionality',
          modal: true
        },
        'Unarchive',
        'Cancel'
      );

      if (choice !== 'Unarchive') {
        console.log(`SidebarProvider: User cancelled unarchiving spec '${specName}'`);
        return;
      }
      
      await this._specWorkflowService.unarchiveSpec(specName);
      
      // Refresh active specs list and archived specs list
      await this.sendSpecs();
      await this.sendArchivedSpecs();
      
      this.sendNotification(`Spec '${specName}' unarchived successfully`, 'success');
    } catch (error) {
      console.error(`SidebarProvider: Failed to unarchive spec '${specName}':`, error);
      this.sendError('Failed to unarchive spec: ' + (error as Error).message);
    }
  }

  private async openExternalUrl(url: string) {
    try {
      console.log(`SidebarProvider: Opening external URL: ${url}`);
      const uri = vscode.Uri.parse(url);
      await vscode.env.openExternal(uri);
    } catch (error) {
      console.error(`SidebarProvider: Failed to open external URL '${url}':`, error);
      this.sendError('Failed to open external URL: ' + (error as Error).message);
    }
  }

  private async sendLanguagePreference() {
    try {
      const config = vscode.workspace.getConfiguration('specWorkflow');
      const language = config.get<string>('language', 'auto');
      this.postMessageToWebview({
        type: 'language-preference-updated',
        data: language
      });
    } catch (error) {
      console.error('SidebarProvider: Failed to get language preference:', error);
      this.sendError('Failed to get language preference: ' + (error as Error).message);
    }
  }

  private async setLanguagePreference(language: string) {
    try {
      const config = vscode.workspace.getConfiguration('specWorkflow');
      await config.update('language', language, vscode.ConfigurationTarget.Global);
      this.postMessageToWebview({
        type: 'language-preference-updated',
        data: language
      });
      console.log(`SidebarProvider: Language preference set to: ${language}`);
    } catch (error) {
      console.error('SidebarProvider: Failed to set language preference:', error);
      this.sendError('Failed to set language preference: ' + (error as Error).message);
    }
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    // Get the local path to main script run in the webview
    const scriptPathOnDisk = vscode.Uri.joinPath(this._extensionUri, 'webview-dist', 'main.js');
    const stylePathOnDisk = vscode.Uri.joinPath(this._extensionUri, 'webview-dist', 'globals.css');

    // Get paths to sound files
    const approvalSoundPath = vscode.Uri.joinPath(this._extensionUri, 'webview-dist', 'sounds', 'approval-pending.wav');
    const taskCompletedSoundPath = vscode.Uri.joinPath(this._extensionUri, 'webview-dist', 'sounds', 'task-completed.wav');

    // And get the uri we use to load this script in the webview
    const scriptUri = webview.asWebviewUri(scriptPathOnDisk);
    const styleUri = webview.asWebviewUri(stylePathOnDisk);
    
    // Convert sound paths to webview URIs
    const approvalSoundUri = webview.asWebviewUri(approvalSoundPath);
    const taskCompletedSoundUri = webview.asWebviewUri(taskCompletedSoundPath);

    // Use a nonce to whitelist which scripts can be run
    const nonce = getNonce();

    return `<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <!--
          Use a content security policy to only allow loading images from https or from our extension directory,
          and only allow scripts that have a specific nonce.
        -->
        <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}' 'unsafe-eval'; media-src ${webview.cspSource};">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link href="${styleUri}" rel="stylesheet">
        <title>Spec Workflow Dashboard</title>
        <style>
          /* Prevent FOUC */
          body {
            visibility: hidden;
          }
          body.loaded {
            visibility: visible;
          }
        </style>
      </head>
      <body>
        <div id="root" 
             data-approval-sound-uri="${approvalSoundUri}" 
             data-task-completed-sound-uri="${taskCompletedSoundUri}">
        </div>
        <script nonce="${nonce}">
          // Make sound URIs available to the webview BEFORE module script loads
          window.soundURIs = {
            'approval-pending': '${approvalSoundUri}',
            'task-completed': '${taskCompletedSoundUri}'
          };
          
          // Also store as data attributes for backup
          window.soundURIsReady = true;
          
          // Debug logging
          console.log('Sound URIs injected BEFORE module load:', window.soundURIs);
          console.log('URIs ready flag set:', window.soundURIsReady);
        </script>
        <script nonce="${nonce}" type="module" src="${scriptUri}"></script>
      </body>
      </html>`;
  }
}

function getNonce() {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}