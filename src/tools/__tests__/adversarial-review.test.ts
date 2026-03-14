import { describe, it, expect, afterEach } from 'vitest';
import { adversarialReviewHandler } from '../adversarial-review.js';
import { ToolContext } from '../../types.js';
import { join } from 'path';
import { tmpdir } from 'os';
import { promises as fs } from 'fs';

describe('adversarial-review tool', () => {
  const dirs: string[] = [];

  async function createTempProject(): Promise<string> {
    const dir = join(tmpdir(), `specwf-adv-review-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`);
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
    const result = await adversarialReviewHandler(
      { phase: 'requirements' },
      ctx('/tmp/fake')
    );
    expect(result.success).toBe(false);
    expect(result.message).toContain('specName is required');
  });

  it('rejects invalid phase', async () => {
    const result = await adversarialReviewHandler(
      { specName: 'test', phase: 'invalid' },
      ctx('/tmp/fake')
    );
    expect(result.success).toBe(false);
    expect(result.message).toContain('phase must be one of');
  });

  it('fails when target file does not exist', async () => {
    const project = await createTempProject();
    const specDir = join(project, '.spec-workflow', 'specs', 'test-spec');
    await fs.mkdir(specDir, { recursive: true });

    const result = await adversarialReviewHandler(
      { specName: 'test-spec', phase: 'requirements' },
      ctx(project)
    );
    expect(result.success).toBe(false);
    expect(result.message).toContain('Target file not found');
  });

  it('prepares review successfully for existing spec', async () => {
    const project = await createTempProject();
    const specDir = join(project, '.spec-workflow', 'specs', 'test-spec');
    await fs.mkdir(specDir, { recursive: true });
    await fs.writeFile(join(specDir, 'requirements.md'), '# Requirements\n', 'utf-8');

    const result = await adversarialReviewHandler(
      { specName: 'test-spec', phase: 'requirements' },
      ctx(project)
    );

    expect(result.success).toBe(true);
    expect(result.data.version).toBe(1);
    expect(result.data.phase).toBe('requirements');
    expect(result.data.methodology).toContain('Adversarial Review Methodology');
    expect(result.data.promptOutputPath).toContain('adversarial-prompt-requirements.md');
    expect(result.data.analysisOutputPath).toContain('adversarial-analysis-requirements.md');

    // reviews/ directory should have been created
    const stat = await fs.stat(join(specDir, 'reviews'));
    expect(stat.isDirectory()).toBe(true);
  });

  it('increments version when analysis already exists', async () => {
    const project = await createTempProject();
    const specDir = join(project, '.spec-workflow', 'specs', 'test-spec');
    const reviewsDir = join(specDir, 'reviews');
    await fs.mkdir(reviewsDir, { recursive: true });
    await fs.writeFile(join(specDir, 'requirements.md'), '# Requirements\n', 'utf-8');
    await fs.writeFile(join(reviewsDir, 'adversarial-analysis-requirements.md'), '# Analysis v1\n', 'utf-8');

    const result = await adversarialReviewHandler(
      { specName: 'test-spec', phase: 'requirements' },
      ctx(project)
    );

    expect(result.success).toBe(true);
    expect(result.data.version).toBe(2);
    expect(result.data.promptOutputPath).toContain('-r2.md');
    expect(result.data.analysisOutputPath).toContain('-r2.md');
  });

  it('uses methodology override from settings', async () => {
    const project = await createTempProject();
    const specDir = join(project, '.spec-workflow', 'specs', 'test-spec');
    await fs.mkdir(specDir, { recursive: true });
    await fs.writeFile(join(specDir, 'requirements.md'), '# Requirements\n', 'utf-8');
    await fs.writeFile(
      join(project, '.spec-workflow', 'adversarial-settings.json'),
      JSON.stringify({ reviewMethodology: 'Custom review instructions' }),
      'utf-8'
    );

    const result = await adversarialReviewHandler(
      { specName: 'test-spec', phase: 'requirements' },
      ctx(project)
    );

    expect(result.success).toBe(true);
    expect(result.data.methodology).toBe('Custom review instructions');
  });

  it('falls back to default methodology when settings empty', async () => {
    const project = await createTempProject();
    const specDir = join(project, '.spec-workflow', 'specs', 'test-spec');
    await fs.mkdir(specDir, { recursive: true });
    await fs.writeFile(join(specDir, 'requirements.md'), '# Requirements\n', 'utf-8');
    await fs.writeFile(
      join(project, '.spec-workflow', 'adversarial-settings.json'),
      JSON.stringify({ reviewMethodology: '' }),
      'utf-8'
    );

    const result = await adversarialReviewHandler(
      { specName: 'test-spec', phase: 'requirements' },
      ctx(project)
    );

    expect(result.success).toBe(true);
    expect(result.data.methodology).toContain('Adversarial Review Methodology');
  });

  it('discovers prior phase docs', async () => {
    const project = await createTempProject();
    const specDir = join(project, '.spec-workflow', 'specs', 'test-spec');
    await fs.mkdir(specDir, { recursive: true });
    await fs.writeFile(join(specDir, 'requirements.md'), '# Req\n', 'utf-8');
    await fs.writeFile(join(specDir, 'design.md'), '# Design\n', 'utf-8');
    await fs.writeFile(join(specDir, 'tasks.md'), '# Tasks\n', 'utf-8');

    const result = await adversarialReviewHandler(
      { specName: 'test-spec', phase: 'tasks' },
      ctx(project)
    );

    expect(result.success).toBe(true);
    expect(result.data.priorPhaseDocs).toHaveLength(2);
    expect(result.data.priorPhaseDocs[0]).toContain('requirements.md');
    expect(result.data.priorPhaseDocs[1]).toContain('design.md');
  });
});
