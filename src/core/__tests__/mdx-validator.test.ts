import { describe, it, expect } from 'vitest';
import { validateMarkdownForMdx, formatMdxValidationIssues } from '../mdx-validator.js';

describe('mdx-validator', () => {
  it('returns invalid when mdx pre-render (compile) fails', async () => {
    const content = `# Metrics\n\n- Threshold: <5%\n`;

    const result = await validateMarkdownForMdx(content);

    expect(result.valid).toBe(false);
    expect(result.issues.length).toBeGreaterThan(0);
    expect(result.issues.some((issue) => issue.ruleId === 'mdx-compile-error')).toBe(true);
    expect(result.issues[0].message).toContain('Unexpected character');
  });

  it('ignores less-than inside inline code and fenced code blocks', async () => {
    const content = [
      '# Safe',
      '',
      '- Inline code: `<5%`',
      '',
      '```md',
      '- Code block: <5%',
      '```',
      ''
    ].join('\n');

    const result = await validateMarkdownForMdx(content);

    expect(result.valid).toBe(true);
    expect(result.issues).toHaveLength(0);
  });

  it('formats issues with line and column', () => {
    const formatted = formatMdxValidationIssues([
      {
        line: 12,
        column: 18,
        ruleId: 'mdx-compile-error',
        message: 'Unexpected character',
        severity: 'error'
      }
    ]);

    expect(formatted).toEqual([
      'Line 12:18 [mdx-compile-error] Unexpected character'
    ]);
  });
});
