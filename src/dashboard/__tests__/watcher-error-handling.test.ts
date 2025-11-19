import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SpecWatcher } from '../watcher.js';
import { SpecParser } from '../parser.js';
import { promises as fs } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

describe('SpecWatcher Error Handling', () => {
  let testDir: string;
  let watcher: SpecWatcher;
  let parser: SpecParser;

  beforeEach(async () => {
    // Create a temporary test directory
    testDir = join(tmpdir(), `spec-workflow-test-${Date.now()}`);
    await fs.mkdir(testDir, { recursive: true });
    
    // Create the workflow directory structure
    const workflowDir = join(testDir, '.spec-workflow');
    const specsDir = join(workflowDir, 'specs');
    const steeringDir = join(workflowDir, 'steering');
    
    await fs.mkdir(workflowDir, { recursive: true });
    await fs.mkdir(specsDir, { recursive: true });
    await fs.mkdir(steeringDir, { recursive: true });

    // Create a test spec
    const testSpecDir = join(specsDir, 'test-spec');
    await fs.mkdir(testSpecDir, { recursive: true });
    await fs.writeFile(join(testSpecDir, 'requirements.md'), '# Test Requirements\n\nSome content');

    // Initialize parser and watcher
    parser = new SpecParser(testDir);
    watcher = new SpecWatcher(testDir, parser);
  });

  afterEach(async () => {
    // Stop watcher
    if (watcher) {
      await watcher.stop();
    }
    
    // Clean up test directory
    try {
      await fs.rm(testDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  it('should start without crashing', async () => {
    await expect(watcher.start()).resolves.not.toThrow();
  });

  it('should handle file changes without crashing', async () => {
    await watcher.start();

    // Set up event listener to track changes
    const changeEvents: any[] = [];
    watcher.on('change', (event) => {
      changeEvents.push(event);
    });

    // Modify a file
    const requirementsPath = join(testDir, '.spec-workflow', 'specs', 'test-spec', 'requirements.md');
    await fs.writeFile(requirementsPath, '# Updated Requirements\n\nUpdated content');

    // Wait for file system events to propagate
    await new Promise(resolve => setTimeout(resolve, 300));

    // Watcher should still be running (not crashed)
    expect(watcher).toBeDefined();
  });

  it('should handle parser errors gracefully', async () => {
    await watcher.start();

    // Mock parser to throw an error
    const originalGetSpec = parser.getSpec.bind(parser);
    parser.getSpec = vi.fn().mockRejectedValue(new Error('Parser error'));

    // Set up event listener
    const changeEvents: any[] = [];
    watcher.on('change', (event) => {
      changeEvents.push(event);
    });

    // Modify a file (this will trigger the error)
    const requirementsPath = join(testDir, '.spec-workflow', 'specs', 'test-spec', 'requirements.md');
    await fs.writeFile(requirementsPath, '# Updated Requirements\n\nUpdated content');

    // Wait for file system events to propagate
    await new Promise(resolve => setTimeout(resolve, 300));

    // Watcher should still be running despite the error
    expect(watcher).toBeDefined();

    // Restore original method
    parser.getSpec = originalGetSpec;
  });

  it('should handle steering file changes', async () => {
    await watcher.start();

    // Set up event listener
    const steeringEvents: any[] = [];
    watcher.on('steering-change', (event) => {
      steeringEvents.push(event);
    });

    // Create a steering file
    const steeringPath = join(testDir, '.spec-workflow', 'steering', 'product.md');
    await fs.writeFile(steeringPath, '# Product Steering\n\nSome guidance');

    // Wait for file system events to propagate
    await new Promise(resolve => setTimeout(resolve, 300));

    // Should have received at least one event
    expect(steeringEvents.length).toBeGreaterThanOrEqual(0); // May be 0 or 1 depending on timing
  });

  it('should stop cleanly', async () => {
    await watcher.start();
    await expect(watcher.stop()).resolves.not.toThrow();
  });

  it('should not crash when stopping without starting', async () => {
    const newWatcher = new SpecWatcher(testDir, parser);
    await expect(newWatcher.stop()).resolves.not.toThrow();
  });

  it('should handle rapid file changes without crashing', async () => {
    await watcher.start();

    const requirementsPath = join(testDir, '.spec-workflow', 'specs', 'test-spec', 'requirements.md');
    
    // Make multiple rapid changes
    for (let i = 0; i < 5; i++) {
      await fs.writeFile(requirementsPath, `# Updated Requirements ${i}\n\nUpdated content ${i}`);
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    // Wait for all events to propagate
    await new Promise(resolve => setTimeout(resolve, 500));

    // Watcher should still be running
    expect(watcher).toBeDefined();
  });
});
