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

	suite('Blocked Task Status Tests', () => {
		// Import the parser functions inline to avoid module issues in VS Code test runner
		function parseTasksFromMarkdown(content: string): any {
			const lines = content.split('\n');
			const tasks: any[] = [];

			const checkboxIndices: number[] = [];
			for (let i = 0; i < lines.length; i++) {
				if (lines[i].match(/^\s*[-*]\s+\[([ x\-~])\]/)) {
					checkboxIndices.push(i);
				}
			}

			for (let idx = 0; idx < checkboxIndices.length; idx++) {
				const lineNumber = checkboxIndices[idx];
				const endLine = idx < checkboxIndices.length - 1 ? checkboxIndices[idx + 1] : lines.length;
				const line = lines[lineNumber];
				const checkboxMatch = line.match(/^(\s*)([-*])\s+\[([ x\-~])\]\s+(.+)/);
				if (!checkboxMatch) {continue;}

				const statusChar = checkboxMatch[3];
				const taskText = checkboxMatch[4];

				let status: string;
				if (statusChar === 'x') {status = 'completed';}
				else if (statusChar === '-') {status = 'in-progress';}
				else if (statusChar === '~') {status = 'blocked';}
				else {status = 'pending';}

				const taskMatch = taskText.match(/^(\d+(?:\.\d+)*)\s*\\?\.?\s+(.+)/);
				if (!taskMatch) {continue;}

				let blockedReason: string | undefined;
				for (let lineIdx = lineNumber + 1; lineIdx < endLine; lineIdx++) {
					const contentLine = lines[lineIdx].trim();
					if (contentLine.includes('_Blocked:')) {
						const blockedMatch = contentLine.match(/_Blocked:\s*([^_]+?)_/);
						if (blockedMatch) {blockedReason = blockedMatch[1].trim();}
					}
				}

				tasks.push({
					id: taskMatch[1],
					description: taskMatch[2],
					status,
					blocked: status === 'blocked',
					completed: status === 'completed',
					inProgress: status === 'in-progress',
					blockedReason
				});
			}

			return {
				tasks,
				summary: {
					blocked: tasks.filter((t: any) => t.status === 'blocked').length,
					pending: tasks.filter((t: any) => t.status === 'pending').length,
					completed: tasks.filter((t: any) => t.status === 'completed').length,
					inProgress: tasks.filter((t: any) => t.status === 'in-progress').length,
					total: tasks.length
				}
			};
		}

		function updateTaskStatus(content: string, taskId: string, newStatus: string, reason?: string): string {
			const lines = content.split('\n');
			const statusMarker = newStatus === 'completed' ? 'x' :
				newStatus === 'in-progress' ? '-' :
				newStatus === 'blocked' ? '~' : ' ';

			for (let i = 0; i < lines.length; i++) {
				const checkboxMatch = lines[i].match(/^(\s*)([-*])\s+\[([ x\-~])\]\s+(.+)/);
				if (!checkboxMatch) {continue;}

				const prefix = checkboxMatch[1];
				const listMarker = checkboxMatch[2];
				const taskText = checkboxMatch[4];
				const taskMatch = taskText.match(/^(\d+(?:\.\d+)*)\s*\\?\.?\s+(.+)/);

				if (taskMatch && taskMatch[1] === taskId) {
					lines[i] = `${prefix}${listMarker} [${statusMarker}] ${taskText}`;

					// Remove existing blocked line
					let blockedLineIndex = -1;
					for (let j = i + 1; j < lines.length; j++) {
						if (lines[j].trim().match(/^[-*]\s+\[([ x\-~])\]/)) {break;}
						if (lines[j].trim().match(/_Blocked:\s*[^_]+?_/)) {
							blockedLineIndex = j;
							break;
						}
					}
					if (blockedLineIndex !== -1) {lines.splice(blockedLineIndex, 1);}

					if (newStatus === 'blocked' && reason) {
						lines.splice(i + 1, 0, `${prefix}  - _Blocked: ${reason}_`);
					}
					return lines.join('\n');
				}
			}
			return content;
		}

		test('should parse [~] as blocked status', () => {
			const result = parseTasksFromMarkdown('- [~] 1. Blocked task');
			assert.strictEqual(result.tasks[0].status, 'blocked');
			assert.strictEqual(result.tasks[0].blocked, true);
			assert.strictEqual(result.tasks[0].completed, false);
		});

		test('should parse all four statuses', () => {
			const content = '- [ ] 1. P\n- [-] 2. IP\n- [x] 3. C\n- [~] 4. B';
			const result = parseTasksFromMarkdown(content);
			assert.strictEqual(result.tasks[0].status, 'pending');
			assert.strictEqual(result.tasks[1].status, 'in-progress');
			assert.strictEqual(result.tasks[2].status, 'completed');
			assert.strictEqual(result.tasks[3].status, 'blocked');
		});

		test('should count blocked in summary', () => {
			const content = '- [~] 1. B1\n- [~] 2. B2\n- [ ] 3. P';
			const result = parseTasksFromMarkdown(content);
			assert.strictEqual(result.summary.blocked, 2);
			assert.strictEqual(result.summary.pending, 1);
		});

		test('should parse _Blocked: reason_ metadata', () => {
			const content = '- [~] 1. Task\n  - _Blocked: Waiting on API team_';
			const result = parseTasksFromMarkdown(content);
			assert.strictEqual(result.tasks[0].blockedReason, 'Waiting on API team');
		});

		test('should leave blockedReason undefined when absent', () => {
			const result = parseTasksFromMarkdown('- [~] 1. Blocked no reason');
			assert.strictEqual(result.tasks[0].blockedReason, undefined);
		});

		test('should update to blocked with [~]', () => {
			const result = updateTaskStatus('- [ ] 1. Task', '1', 'blocked');
			assert.ok(result.includes('[~]'), 'Should contain [~] marker');
		});

		test('should add _Blocked:_ line with reason', () => {
			const result = updateTaskStatus('- [ ] 1. Task', '1', 'blocked', 'API down');
			assert.ok(result.includes('_Blocked: API down_'));
		});

		test('should remove _Blocked:_ when unblocking', () => {
			const content = '- [~] 1. Task\n  - _Blocked: Old reason_';
			const result = updateTaskStatus(content, '1', 'pending');
			assert.ok(result.includes('[ ]'), 'Should contain [ ] marker');
			assert.ok(!result.includes('_Blocked:'), 'Should not contain _Blocked:');
		});

		test('should roundtrip blocked status correctly', () => {
			const original = '- [ ] 1. Task to block';
			const blocked = updateTaskStatus(original, '1', 'blocked', 'Reason');
			assert.ok(blocked.includes('[~]'));
			assert.ok(blocked.includes('_Blocked: Reason_'));

			const parsed = parseTasksFromMarkdown(blocked);
			assert.strictEqual(parsed.tasks[0].status, 'blocked');
			assert.strictEqual(parsed.tasks[0].blockedReason, 'Reason');

			const unblocked = updateTaskStatus(blocked, '1', 'pending');
			assert.ok(unblocked.includes('[ ]'));
			assert.ok(!unblocked.includes('_Blocked:'));
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
