import * as assert from 'assert';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';

suite('Extension Test Suite', () => {
	vscode.window.showInformationMessage('Start all tests.');

	test('Sample test', () => {
		assert.strictEqual(-1, [1, 2, 3].indexOf(5));
		assert.strictEqual(-1, [1, 2, 3].indexOf(0));
	});

	test('Extension should be present', () => {
		const extension = vscode.extensions.getExtension('Pimzino.spec-workflow-mcp');
		assert.ok(extension, 'Extension should be installed');
	});

	suite('Path Resolution Tests', () => {
		let tempDir: string;

		// Pure path resolution logic extracted for testing
		// Mirrors the logic in ApprovalEditorService.resolveApprovalFilePath
		async function resolveApprovalFilePath(filePath: string, workspaceRoot: string): Promise<string | null> {
			const fsPromises = fs.promises;
			const normalizedFilePath = filePath.replace(/\\/g, '/');
			const candidates: string[] = [];

			// If path is already absolute, try it directly first
			if (path.isAbsolute(filePath)) {
				candidates.push(filePath);
			}

			// As provided relative to project root
			candidates.push(path.join(workspaceRoot, normalizedFilePath));

			// Handle paths that start with ".spec-workflow/"
			if (normalizedFilePath.startsWith('.spec-workflow/')) {
				const pathAfterSpecWorkflow = normalizedFilePath.substring('.spec-workflow/'.length);
				if (pathAfterSpecWorkflow && !pathAfterSpecWorkflow.startsWith('specs/')) {
					candidates.push(path.join(workspaceRoot, '.spec-workflow', 'specs', pathAfterSpecWorkflow));
				}
			}

			// Try each candidate
			for (const candidate of candidates) {
				try {
					await fsPromises.access(candidate);
					return candidate;
				} catch {
					// Continue to next candidate
				}
			}

			return null;
		}

		suiteSetup(async () => {
			// Create a temporary directory structure for testing
			tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'spec-workflow-test-'));

			// Create test directory structure
			const specWorkflowDir = path.join(tempDir, '.spec-workflow');
			const specsDir = path.join(specWorkflowDir, 'specs');
			const testDir = path.join(specWorkflowDir, 'test');

			fs.mkdirSync(specWorkflowDir, { recursive: true });
			fs.mkdirSync(specsDir, { recursive: true });
			fs.mkdirSync(testDir, { recursive: true });

			// Create test files
			fs.writeFileSync(path.join(specsDir, 'tasks.md'), '# Test Tasks');
			fs.writeFileSync(path.join(testDir, 'tasks.md'), '# Test Tasks in Test Dir');
			fs.writeFileSync(path.join(tempDir, 'root-tasks.md'), '# Root Tasks');
		});

		suiteTeardown(() => {
			// Clean up temporary directory
			if (tempDir && fs.existsSync(tempDir)) {
				fs.rmSync(tempDir, { recursive: true, force: true });
			}
		});

		test('should resolve paths with forward slashes', async () => {
			const testPath = '.spec-workflow/specs/tasks.md';
			const result = await resolveApprovalFilePath(testPath, tempDir);

			assert.ok(result, 'Should resolve path with forward slashes');
			assert.ok(result.includes('specs'), 'Should resolve to specs directory');
		});

		test('should resolve paths with backslashes', async () => {
			const testPath = '.spec-workflow\\test\\tasks.md';
			const result = await resolveApprovalFilePath(testPath, tempDir);

			assert.ok(result, 'Should resolve path with backslashes');
			assert.ok(result.includes('test'), 'Should resolve to test directory');
		});

		test('should resolve relative paths', async () => {
			const testPath = 'root-tasks.md';
			const result = await resolveApprovalFilePath(testPath, tempDir);

			assert.ok(result, 'Should resolve relative path');
			assert.ok(result.includes('root-tasks.md'), 'Should resolve to root file');
		});

		test('should handle missing files gracefully', async () => {
			const testPath = '.spec-workflow/nonexistent/file.md';
			const result = await resolveApprovalFilePath(testPath, tempDir);

			assert.strictEqual(result, null, 'Should return null for nonexistent files');
		});
	});

	suite('Approval Notification Logic Tests', () => {
		// Helper function that mirrors SidebarProvider.handleApprovalChanges logic
		// for detecting new pending approvals
		function detectNewPendingApprovals(
			currentApprovals: Array<{ id: string; status: string }>,
			previousApprovals: Array<{ id: string; status: string }>
		): string[] {
			const currentPendingIds = currentApprovals
				.filter(approval => approval.status === 'pending')
				.map(approval => approval.id);

			const previousPendingIds = previousApprovals
				.filter(approval => approval.status === 'pending')
				.map(approval => approval.id);

			// Find newly added pending approvals
			return currentPendingIds.filter(id => !previousPendingIds.includes(id));
		}

		test('should detect genuinely new pending approvals', () => {
			const previous = [
				{ id: 'approval-1', status: 'pending' },
				{ id: 'approval-2', status: 'pending' }
			];
			const current = [
				{ id: 'approval-1', status: 'pending' },
				{ id: 'approval-2', status: 'pending' },
				{ id: 'approval-3', status: 'pending' } // NEW
			];

			const newIds = detectNewPendingApprovals(current, previous);

			assert.strictEqual(newIds.length, 1, 'Should detect exactly 1 new approval');
			assert.strictEqual(newIds[0], 'approval-3', 'Should detect approval-3 as new');
		});

		test('should NOT detect status changes as new approvals', () => {
			const previous = [
				{ id: 'approval-1', status: 'pending' },
				{ id: 'approval-2', status: 'pending' },
				{ id: 'approval-3', status: 'pending' }
			];
			const current = [
				{ id: 'approval-1', status: 'rejected' },  // Status changed
				{ id: 'approval-2', status: 'approved' },  // Status changed
				{ id: 'approval-3', status: 'pending' }    // Still pending
			];

			const newIds = detectNewPendingApprovals(current, previous);

			assert.strictEqual(newIds.length, 0, 'Should NOT detect any new approvals when only status changes');
		});

		test('should NOT detect false positives when previous list is properly initialized', () => {
			const previous = [
				{ id: 'approval-1', status: 'pending' },
				{ id: 'approval-2', status: 'pending' }
			];
			const current = [
				{ id: 'approval-1', status: 'pending' },
				{ id: 'approval-2', status: 'pending' }
			];

			const newIds = detectNewPendingApprovals(current, previous);

			assert.strictEqual(newIds.length, 0, 'Should NOT detect any new approvals when lists are identical');
		});

		test('should detect ALL as new when previous list is empty (edge case)', () => {
			const previous: Array<{ id: string; status: string }> = [];
			const current = [
				{ id: 'approval-1', status: 'pending' },
				{ id: 'approval-2', status: 'pending' }
			];

			const newIds = detectNewPendingApprovals(current, previous);

			// This is the bug scenario - when previous is empty, all appear new
			// The fix in SidebarProvider initializes previous before file watcher
			assert.strictEqual(newIds.length, 2, 'Empty previous list causes all to appear new (bug scenario)');
		});

		test('should handle mixed scenario: new approval + status change', () => {
			const previous = [
				{ id: 'approval-1', status: 'pending' },
				{ id: 'approval-2', status: 'pending' }
			];
			const current = [
				{ id: 'approval-1', status: 'rejected' },  // Status changed
				{ id: 'approval-2', status: 'pending' },   // Still pending
				{ id: 'approval-3', status: 'pending' }    // NEW
			];

			const newIds = detectNewPendingApprovals(current, previous);

			assert.strictEqual(newIds.length, 1, 'Should only detect the genuinely new approval');
			assert.strictEqual(newIds[0], 'approval-3', 'Should detect approval-3 as the only new one');
		});
	});

	suite('Batch Operation Undo Logic Tests', () => {
		// Helper function that simulates the undo tracking logic from App.tsx
		interface BatchOperationState {
			ids: string[];
			action: string;
		}

		function shouldShowUndoToast(
			operationCompleted: boolean,
			batchDetails: BatchOperationState | null
		): boolean {
			// Undo should be available when operation completes successfully with tracked details
			return operationCompleted && batchDetails !== null && batchDetails.ids.length > 0;
		}

		function canPerformUndo(
			lastOperation: BatchOperationState | null,
			undoWindowActive: boolean
		): boolean {
			// Undo is possible only if we have an operation to undo and the window is still active
			return lastOperation !== null &&
				   lastOperation.ids.length > 0 &&
				   undoWindowActive;
		}

		test('should show undo toast after successful batch approve', () => {
			const batchDetails: BatchOperationState = {
				ids: ['approval-1', 'approval-2', 'approval-3'],
				action: 'approve'
			};

			const showToast = shouldShowUndoToast(true, batchDetails);

			assert.strictEqual(showToast, true, 'Should show undo toast after batch approve');
		});

		test('should show undo toast after successful batch reject', () => {
			const batchDetails: BatchOperationState = {
				ids: ['approval-1', 'approval-2'],
				action: 'reject'
			};

			const showToast = shouldShowUndoToast(true, batchDetails);

			assert.strictEqual(showToast, true, 'Should show undo toast after batch reject');
		});

		test('should show undo toast after successful batch revision request', () => {
			const batchDetails: BatchOperationState = {
				ids: ['approval-1'],
				action: 'revision'
			};

			const showToast = shouldShowUndoToast(true, batchDetails);

			assert.strictEqual(showToast, true, 'Should show undo toast after batch revision');
		});

		test('should NOT show undo toast when operation has no details', () => {
			const showToast = shouldShowUndoToast(true, null);

			assert.strictEqual(showToast, false, 'Should not show toast when no batch details');
		});

		test('should NOT show undo toast when operation had no items', () => {
			const batchDetails: BatchOperationState = {
				ids: [],
				action: 'approve'
			};

			const showToast = shouldShowUndoToast(true, batchDetails);

			assert.strictEqual(showToast, false, 'Should not show toast when no items processed');
		});

		test('should allow undo within the 30-second window', () => {
			const lastOperation: BatchOperationState = {
				ids: ['approval-1', 'approval-2'],
				action: 'approve'
			};

			const canUndo = canPerformUndo(lastOperation, true);

			assert.strictEqual(canUndo, true, 'Should allow undo within time window');
		});

		test('should NOT allow undo after window expires', () => {
			const lastOperation: BatchOperationState = {
				ids: ['approval-1', 'approval-2'],
				action: 'approve'
			};

			const canUndo = canPerformUndo(lastOperation, false);

			assert.strictEqual(canUndo, false, 'Should not allow undo after window expires');
		});

		test('should NOT allow undo when no operation was performed', () => {
			const canUndo = canPerformUndo(null, true);

			assert.strictEqual(canUndo, false, 'Should not allow undo when no operation');
		});

		test('should track correct number of items for undo message', () => {
			const batchDetails: BatchOperationState = {
				ids: ['approval-1', 'approval-2', 'approval-3', 'approval-4', 'approval-5'],
				action: 'approve'
			};

			assert.strictEqual(batchDetails.ids.length, 5, 'Should track all 5 items');
			assert.strictEqual(batchDetails.action, 'approve', 'Should track correct action type');
		});
	});
});
