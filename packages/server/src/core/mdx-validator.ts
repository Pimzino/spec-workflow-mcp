import { compile } from '@mdx-js/mdx';

export interface MdxValidationIssue {
  line: number;
  column: number;
  ruleId: 'mdx-compile-error';
  message: string;
  severity: 'error';
}

export interface MdxValidationResult {
  valid: boolean;
  issues: MdxValidationIssue[];
}

function getIssueLocation(error: any): { line: number; column: number } {
  const line = error?.line ?? error?.position?.start?.line ?? 1;
  const column = error?.column ?? error?.position?.start?.column ?? 1;
  return { line, column };
}

function getIssueMessage(error: any): string {
  return error?.reason ?? error?.message ?? 'Unknown MDX compile error';
}

export async function validateMarkdownForMdx(content: string): Promise<MdxValidationResult> {
  try {
    await compile(content, { format: 'mdx' });
    return { valid: true, issues: [] };
  } catch (error) {
    const { line, column } = getIssueLocation(error);
    return {
      valid: false,
      issues: [
        {
          line,
          column,
          ruleId: 'mdx-compile-error',
          message: getIssueMessage(error),
          severity: 'error',
        },
      ],
    };
  }
}

export function formatMdxValidationIssues(issues: MdxValidationIssue[]): string[] {
  return issues.map((issue) => `Line ${issue.line}:${issue.column} [${issue.ruleId}] ${issue.message}`);
}
