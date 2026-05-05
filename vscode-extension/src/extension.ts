import * as vscode from 'vscode';
import * as nls from 'vscode-nls';

const localize = nls.loadMessageBundle();

import { SidebarProvider } from './extension/providers/SidebarProvider.js';
import { SpecWorkflowService } from './extension/services/SpecWorkflowService.js';
import { FileWatcher } from './extension/services/FileWatcher.js';
import { ApprovalEditorService } from './extension/services/ApprovalEditorService.js';
import { ApprovalCommandService } from './extension/services/ApprovalCommandService.js';

export function activate(context: vscode.ExtensionContext) {
	console.log(localize('extension.active', 'Spec Workflow MCP extension is now active!'));

	// Create output channel for debugging
	const outputChannel = vscode.window.createOutputChannel('Spec Workflow');
	context.subscriptions.push(outputChannel);
	outputChannel.appendLine(localize('logging.enabled', 'Spec Workflow MCP extension activated - logging enabled'));

	// Initialize services
	const specWorkflowService = new SpecWorkflowService(outputChannel);
	const fileWatcher = new FileWatcher();
	const approvalEditorService = ApprovalEditorService.getInstance(specWorkflowService, context.extensionUri);
	const approvalCommandService = ApprovalCommandService.getInstance(approvalEditorService, specWorkflowService, context.extensionUri);
	
	// Set up circular dependency
	specWorkflowService.setApprovalEditorService(approvalEditorService);

	// Create the sidebar provider
	const sidebarProvider = new SidebarProvider(context.extensionUri, specWorkflowService, context, outputChannel);

	// Register the webview provider
	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(
			SidebarProvider.viewType,
			sidebarProvider,
			{
				webviewOptions: {
					retainContextWhenHidden: true
				}
			}
		)
	);

	// Register approval commands
	approvalCommandService.registerCommands(context);

	// Register commands
	context.subscriptions.push(
		vscode.commands.registerCommand('spec-workflow.openDashboard', () => {
			vscode.commands.executeCommand('workbench.view.extension.spec-workflow');
		})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('spec-workflow.refreshData', async () => {
			// Trigger refresh through the sidebar provider
			await specWorkflowService.refreshData();
		})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('spec-workflow.openSpec', async () => {
			// Show quick pick for specs
			try {
				const specs = await specWorkflowService.getAllSpecs();
				if (specs.length === 0) {
					vscode.window.showInformationMessage(localize('openSpec.noSpecs', 'No specifications found'));
					return;
				}

				const items = specs.map(spec => ({
					label: spec.displayName,
					description: spec.name,
					detail: localize('openSpec.lastModified', 'Last modified: {0}', new Date(spec.lastModified).toLocaleDateString())
				}));

				const selected = await vscode.window.showQuickPick(items, {
					placeHolder: localize('openSpec.placeholder', 'Select a specification to open')
				});

				if (selected) {
					// Open the spec directory or a specific document
					const specPath = vscode.Uri.file(
						context.workspaceState.get<string>('workspaceRoot') + 
						`/.spec-workflow/specs/${selected.description}`
					);
					vscode.commands.executeCommand('vscode.openFolder', specPath, true);
				}
			} catch (error) {
				vscode.window.showErrorMessage(localize('openSpec.loadFailed', 'Failed to load specifications: {0}', (error as Error).message));
			}
		})
	);

	// Listen for file changes and refresh data accordingly
	context.subscriptions.push(
		fileWatcher.onFileChanged(async (event) => {
			console.log(`File ${event.type}: ${event.relativePath}`);
			
			const fileType = fileWatcher.getWatchedFileType(event.relativePath);
			
			// Auto-refresh sidebar when relevant files change
			if (fileType) {
				// Small delay to ensure file is fully written
				setTimeout(() => {
					vscode.commands.executeCommand('spec-workflow.refreshData');
				}, 500);
			}
		})
	);

	// Register disposables
	context.subscriptions.push(fileWatcher);
	context.subscriptions.push(specWorkflowService);

	// Store workspace root for quick access
	const workspaceFolders = vscode.workspace.workspaceFolders;
	if (workspaceFolders && workspaceFolders.length > 0) {
		context.workspaceState.update('workspaceRoot', workspaceFolders[0].uri.fsPath);
	}

	// Listen for workspace folder changes
	context.subscriptions.push(
		vscode.workspace.onDidChangeWorkspaceFolders(() => {
			const folders = vscode.workspace.workspaceFolders;
			if (folders && folders.length > 0) {
				context.workspaceState.update('workspaceRoot', folders[0].uri.fsPath);
			}
		})
	);

	// Show welcome message for first-time users
	const hasShownWelcome = context.globalState.get<boolean>('hasShownWelcome', false);
	if (!hasShownWelcome) {
		const openSidebar = localize('welcome.openSidebar', 'Open Sidebar');
		vscode.window.showInformationMessage(
			localize('welcome.message', 'Spec Workflow MCP is now active! Open the sidebar to get started.'),
			openSidebar
		).then(selection => {
			if (selection === openSidebar) {
				vscode.commands.executeCommand('workbench.view.extension.spec-workflow');
			}
		});
		context.globalState.update('hasShownWelcome', true);
	}
}

export function deactivate() {
	console.log(localize('extension.deactivated', 'Spec Workflow MCP extension deactivated'));
}
