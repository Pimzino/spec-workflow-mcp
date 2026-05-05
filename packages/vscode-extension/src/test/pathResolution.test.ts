import * as assert from 'assert';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';

// Test the path resolution logic directly without VSCode context
suite('Path Resolution Logic Tests', () => {
	let tempDir: string;

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
		fs.writeFileSync(path.join(tempDir, '.spec-workflow', 'direct-tasks.md'), '# Direct Tasks');
	});

	suiteTeardown(() => {
		// Clean up temporary directory
		if (tempDir && fs.existsSync(tempDir)) {
			fs.rmSync(tempDir, { recursive: true, force: true });
		}
	});

	// Simulate the improved path resolution logic (matching the updated implementation)
	async function resolveApprovalFilePath(filePath: string, workspaceRoot: string): Promise<string | null> {
		// Normalize path separators for cross-platform compatibility
		const normalizedFilePath = filePath.replace(/\\/g, '/');
		const candidates: string[] = [];

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
			
			// Also try without the leading dot for legacy compatibility
			const withoutDot = normalizedFilePath.substring(1); // Remove leading "."
			candidates.push(path.join(workspaceRoot, withoutDot));
		} else if (normalizedFilePath.startsWith('spec-workflow/')) {
			// Handle case where path might not have leading dot
			candidates.push(path.join(workspaceRoot, '.' + normalizedFilePath));
			candidates.push(path.join(workspaceRoot, normalizedFilePath));
		} else if (!normalizedFilePath.includes('spec-workflow')) {
			// If path doesn't contain spec-workflow at all, try adding it
			candidates.push(path.join(workspaceRoot, '.spec-workflow', normalizedFilePath));
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

		// Test each candidate path
		for (const candidate of uniqueCandidates) {
			try {
				await fs.promises.access(candidate);
				return candidate;
			} catch {
				// File doesn't exist at this location, continue to next candidate
			}
		}

		return null;
	}

	test('should resolve paths with forward slashes', async () => {
		const testPath = '.spec-workflow/specs/tasks.md';
		const result = await resolveApprovalFilePath(testPath, tempDir);
		
		assert.ok(result, 'Should resolve path with forward slashes');
		assert.ok(result.includes('specs'), 'Should resolve to specs directory');
		assert.ok(result.includes('tasks.md'), 'Should resolve to tasks.md file');
	});

	test('should resolve paths with backslashes (Windows style)', async () => {
		const testPath = '.spec-workflow\\test\\tasks.md';
		const result = await resolveApprovalFilePath(testPath, tempDir);
		
		assert.ok(result, 'Should resolve path with backslashes');
		assert.ok(result.includes('test'), 'Should resolve to test directory');
		assert.ok(result.includes('tasks.md'), 'Should resolve to tasks.md file');
	});

	test('should resolve relative paths to project root', async () => {
		const testPath = 'root-tasks.md';
		const result = await resolveApprovalFilePath(testPath, tempDir);
		
		assert.ok(result, 'Should resolve relative path');
		assert.ok(result.includes('root-tasks.md'), 'Should resolve to root file');
	});

	test('should resolve paths without .spec-workflow prefix', async () => {
		const testPath = 'direct-tasks.md';
		const result = await resolveApprovalFilePath(testPath, tempDir);
		
		assert.ok(result, 'Should resolve path without .spec-workflow prefix');
		assert.ok(result.includes('.spec-workflow'), 'Should resolve under .spec-workflow directory');
		assert.ok(result.includes('direct-tasks.md'), 'Should resolve to direct-tasks.md file');
	});

	test('should handle filename-only resolution', async () => {
		const testPath = 'tasks.md';
		const result = await resolveApprovalFilePath(testPath, tempDir);
		
		assert.ok(result, 'Should resolve filename-only path');
		assert.ok(result.includes('tasks.md'), 'Should resolve to tasks.md file');
		// Should find one of the tasks.md files (either in specs or test directory)
		assert.ok(result.includes('specs') || result.includes('test'), 'Should resolve to either specs or test directory');
	});

	test('should handle missing files gracefully', async () => {
		const testPath = '.spec-workflow/nonexistent/file.md';
		const result = await resolveApprovalFilePath(testPath, tempDir);
		
		assert.strictEqual(result, null, 'Should return null for nonexistent files');
	});

	test('should handle mixed path separators', async () => {
		const testPath = '.spec-workflow/test\\tasks.md';
		const result = await resolveApprovalFilePath(testPath, tempDir);
		
		assert.ok(result, 'Should resolve path with mixed separators');
		assert.ok(result.includes('test'), 'Should resolve to test directory');
		assert.ok(result.includes('tasks.md'), 'Should resolve to tasks.md file');
	});

	test('should resolve the specific failing case: .spec-workflow/test/tasks.md', async () => {
		const testPath = '.spec-workflow/test/tasks.md';
		const result = await resolveApprovalFilePath(testPath, tempDir);
		
		assert.ok(result, 'Should resolve the specific failing case');
		assert.ok(result.includes('test'), 'Should resolve to test directory');
		assert.ok(result.includes('tasks.md'), 'Should resolve to tasks.md file');
		
		// Verify the resolved path actually points to the test directory file
		const expectedPath = path.join(tempDir, '.spec-workflow', 'test', 'tasks.md');
		assert.strictEqual(path.resolve(result), path.resolve(expectedPath), 'Should resolve to the exact expected path');
	});
});
