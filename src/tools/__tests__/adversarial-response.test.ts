import { describe, it, expect, afterEach } from 'vitest';
import { adversarialResponseHandler } from '../adversarial-response.js';
import { ToolContext } from '../../types.js';
import { join } from 'path';
import { tmpdir } from 'os';
import { promises as fs } from 'fs';

describe('adversarial-response tool', () => {
  const dirs: string[] = [];

  async function createTempProject(): Promise<string> {
    const dir = join(tmpdir(), `specwf-adv-response-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`);
    await fs.mkdir(dir, { recursive: true });
    dirs.push(dir);
    return dir;
  }

  function ctx(projectPath: string): ToolContext {
    return { projectPath };
  }

  afterEach(async () => {
    for (const dir of dirs) {
      await fs.rm(dir, { recursive: true, force: true });
    }
    dirs.length = 0;
  });

  it('rejects missing specName', async () => {
    const result = await adversarialResponseHandler(
      { phase: 'requirements' },
      ctx('/tmp/fake')
    );
    expect(result.success).toBe(false);
    expect(result.message).toContain('specName is required');
  });

  it('rejects invalid phase', async () => {
    const result = await adversarialResponseHandler(
      { specName: 'test', phase: 'invalid' },
      ctx('/tmp/fake')
    );
    expect(result.success).toBe(false);
    expect(result.message).toContain('phase must be one of');
  });

  it('fails when reviews directory does not exist', async () => {
    const project = await createTempProject();
    const specDir = join(project, '.spec-workflow', 'specs', 'test-spec');
    await fs.mkdir(specDir, { recursive: true });

    const result = await adversarialResponseHandler(
      { specName: 'test-spec', phase: 'requirements' },
      ctx(project)
    );
    expect(result.success).toBe(false);
    expect(result.message).toContain('No reviews directory found');
  });

  it('fails when reviews dir exists but has no analysis files', async () => {
    const project = await createTempProject();
    const reviewsDir = join(project, '.spec-workflow', 'specs', 'test-spec', 'reviews');
    await fs.mkdir(reviewsDir, { recursive: true });
    // Write a prompt file (not an analysis file)
    await fs.writeFile(join(reviewsDir, 'adversarial-prompt-requirements.md'), '# Prompt\n', 'utf-8');

    const result = await adversarialResponseHandler(
      { specName: 'test-spec', phase: 'requirements' },
      ctx(project)
    );
    expect(result.success).toBe(false);
    expect(result.message).toContain('No adversarial analysis found');
  });

  it('finds latest analysis successfully', async () => {
    const project = await createTempProject();
    const specDir = join(project, '.spec-workflow', 'specs', 'test-spec');
    const reviewsDir = join(specDir, 'reviews');
    await fs.mkdir(reviewsDir, { recursive: true });
    await fs.writeFile(join(specDir, 'requirements.md'), '# Req\n', 'utf-8');
    await fs.writeFile(join(reviewsDir, 'adversarial-analysis-requirements.md'), '# Analysis\n', 'utf-8');

    const result = await adversarialResponseHandler(
      { specName: 'test-spec', phase: 'requirements' },
      ctx(project)
    );

    expect(result.success).toBe(true);
    expect(result.data.version).toBe(1);
    expect(result.data.analysisFile).toContain('adversarial-analysis-requirements.md');
    expect(result.data.methodology).toContain('Responding to an Adversarial Review');
  });

  it('picks highest version across multiple analyses', async () => {
    const project = await createTempProject();
    const reviewsDir = join(project, '.spec-workflow', 'specs', 'test-spec', 'reviews');
    await fs.mkdir(reviewsDir, { recursive: true });
    await fs.writeFile(join(reviewsDir, 'adversarial-analysis-requirements.md'), 'v1\n', 'utf-8');
    await fs.writeFile(join(reviewsDir, 'adversarial-analysis-requirements-r3.md'), 'v3\n', 'utf-8');

    const result = await adversarialResponseHandler(
      { specName: 'test-spec', phase: 'requirements' },
      ctx(project)
    );

    expect(result.success).toBe(true);
    expect(result.data.version).toBe(3);
    expect(result.data.analysisFile).toContain('-r3.md');
  });

  it('uses methodology override from settings', async () => {
    const project = await createTempProject();
    const reviewsDir = join(project, '.spec-workflow', 'specs', 'test-spec', 'reviews');
    await fs.mkdir(reviewsDir, { recursive: true });
    await fs.writeFile(join(reviewsDir, 'adversarial-analysis-design.md'), '# Analysis\n', 'utf-8');
    await fs.writeFile(
      join(project, '.spec-workflow', 'adversarial-settings.json'),
      JSON.stringify({ responseMethodology: 'Custom response instructions' }),
      'utf-8'
    );

    const result = await adversarialResponseHandler(
      { specName: 'test-spec', phase: 'design' },
      ctx(project)
    );

    expect(result.success).toBe(true);
    expect(result.data.methodology).toBe('Custom response instructions');
  });

  it('ignores analysis files for other phases', async () => {
    const project = await createTempProject();
    const reviewsDir = join(project, '.spec-workflow', 'specs', 'test-spec', 'reviews');
    await fs.mkdir(reviewsDir, { recursive: true });
    // Only a design analysis, not requirements
    await fs.writeFile(join(reviewsDir, 'adversarial-analysis-design.md'), '# Design\n', 'utf-8');

    const result = await adversarialResponseHandler(
      { specName: 'test-spec', phase: 'requirements' },
      ctx(project)
    );

    expect(result.success).toBe(false);
    expect(result.message).toContain('No adversarial analysis found');
  });
});
