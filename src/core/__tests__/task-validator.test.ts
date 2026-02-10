import { describe, it, expect } from 'vitest';
import { validateTasksMarkdown, formatValidationErrors } from '../task-validator.js';

describe('task-validator', () => {
  describe('validateTasksMarkdown', () => {
    describe('valid tasks', () => {
      it('should pass validation for properly formatted tasks', () => {
        const content = `# Tasks Document

- [ ] 1. Create core interfaces
  - File: src/types/feature.ts
  - _Requirements: 1.1_
  - _Leverage: src/types/base.ts_
  - _Prompt: Role: Developer | Task: Create interfaces | Restrictions: None | Success: Compiles_

- [ ] 2. Create model class
  - File: src/models/Model.ts
  - _Requirements: 2.1_
`;
        const result = validateTasksMarkdown(content);
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
        expect(result.summary.totalTasks).toBe(2);
        expect(result.summary.validTasks).toBe(2);
      });

      it('should accept completed and in-progress tasks', () => {
        const content = `- [x] 1. Completed task
  - File: src/done.ts

- [-] 2. In progress task
  - File: src/wip.ts

- [ ] 3. Pending task
  - File: src/todo.ts
`;
        const result = validateTasksMarkdown(content);
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
        expect(result.summary.totalTasks).toBe(3);
      });

      it('should accept blocked tasks with [~] checkbox', () => {
        const content = `- [~] 1. Blocked task
  - File: src/blocked.ts

- [ ] 2. Pending task
  - File: src/todo.ts
`;
        const result = validateTasksMarkdown(content);
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
        expect(result.summary.totalTasks).toBe(2);
      });

      it('should accept nested task IDs', () => {
        const content = `- [ ] 1.1 First subtask
  - File: src/a.ts

- [ ] 1.2 Second subtask
  - File: src/b.ts

- [ ] 2.1.1 Deeply nested task
  - File: src/c.ts
`;
        const result = validateTasksMarkdown(content);
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });
    });

    describe('checkbox format errors', () => {
      it('should error on empty checkbox brackets', () => {
        const content = `- [] 1. Task without space in brackets
  - File: src/test.ts
`;
        const result = validateTasksMarkdown(content);
        expect(result.valid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
        expect(result.errors[0].field).toBe('checkbox');
        expect(result.errors[0].message).toContain('Empty checkbox brackets');
      });

      it('should error on missing space after hyphen', () => {
        const content = `-[ ] 1. Task without space after hyphen
  - File: src/test.ts
`;
        const result = validateTasksMarkdown(content);
        expect(result.valid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
        expect(result.errors[0].field).toBe('checkbox');
      });

      it('should error on asterisk bullet', () => {
        const content = `* [ ] 1. Task with asterisk
  - File: src/test.ts
`;
        const result = validateTasksMarkdown(content);
        expect(result.valid).toBe(false);
        expect(result.errors[0].field).toBe('checkbox');
        expect(result.errors[0].message).toContain('Wrong bullet character');
      });

      it('should error on invalid checkbox character', () => {
        const content = `- [X] 1. Task with uppercase X
  - File: src/test.ts
`;
        const result = validateTasksMarkdown(content);
        expect(result.valid).toBe(false);
        expect(result.errors[0].field).toBe('checkbox');
      });
    });

    describe('task ID errors', () => {
      it('should error on missing task ID', () => {
        const content = `- [ ] Create interface without number
  - File: src/test.ts
`;
        const result = validateTasksMarkdown(content);
        expect(result.valid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
        expect(result.errors[0].field).toBe('taskId');
        expect(result.errors[0].message).toContain('Missing task ID number');
      });

      it('should error on task starting with text instead of number', () => {
        const content = `- [ ] Task A. Without numeric ID
  - File: src/test.ts
`;
        const result = validateTasksMarkdown(content);
        expect(result.valid).toBe(false);
        expect(result.errors[0].field).toBe('taskId');
      });
    });

    describe('metadata format warnings', () => {
      it('should warn on Requirements without underscore delimiters', () => {
        const content = `- [ ] 1. Task with bad requirements format
  - File: src/test.ts
  - Requirements: 1.1, 1.2
`;
        const result = validateTasksMarkdown(content);
        expect(result.valid).toBe(true); // Warnings don't fail validation
        expect(result.warnings.length).toBeGreaterThan(0);
        expect(result.warnings[0].field).toBe('requirements');
        expect(result.warnings[0].message).toContain('missing underscore delimiters');
      });

      it('should warn on Leverage without underscore delimiters', () => {
        const content = `- [ ] 1. Task with bad leverage format
  - File: src/test.ts
  - Leverage: src/utils.ts
`;
        const result = validateTasksMarkdown(content);
        expect(result.valid).toBe(true);
        expect(result.warnings.length).toBeGreaterThan(0);
        expect(result.warnings[0].field).toBe('leverage');
      });

      it('should warn on incomplete prompt structure', () => {
        const content = `- [ ] 1. Task with incomplete prompt
  - File: src/test.ts
  - _Prompt: Role: Developer | Task: Build feature_
`;
        const result = validateTasksMarkdown(content);
        expect(result.valid).toBe(true);
        expect(result.warnings.some(w => w.field === 'prompt_structure')).toBe(true);
        const promptWarning = result.warnings.find(w => w.field === 'prompt_structure');
        expect(promptWarning?.message).toContain('missing sections');
      });
    });

    describe('mixed valid and invalid tasks', () => {
      it('should report errors only for invalid tasks', () => {
        const content = `- [ ] 1. Valid task
  - File: src/valid.ts
  - _Requirements: 1.1_

- [ ] Missing ID task
  - File: src/invalid.ts

- [ ] 2. Another valid task
  - File: src/valid2.ts
`;
        const result = validateTasksMarkdown(content);
        expect(result.valid).toBe(false);
        expect(result.errors).toHaveLength(1);
        expect(result.summary.totalTasks).toBe(3);
        expect(result.summary.validTasks).toBe(2);
        expect(result.summary.invalidTasks).toBe(1);
      });
    });

    describe('edge cases', () => {
      it('should handle empty content', () => {
        const result = validateTasksMarkdown('');
        expect(result.valid).toBe(true);
        expect(result.summary.totalTasks).toBe(0);
      });

      it('should handle content with no tasks', () => {
        const content = `# Tasks Document

This document has no actual tasks.

Just some text.
`;
        const result = validateTasksMarkdown(content);
        expect(result.valid).toBe(true);
        expect(result.summary.totalTasks).toBe(0);
      });

      it('should handle multi-line prompts', () => {
        const content = `- [ ] 1. Task with multi-line prompt
  - File: src/test.ts
  - _Prompt: Role: Developer specializing in TypeScript |
    Task: Create comprehensive interfaces |
    Restrictions: Do not modify existing code |
    Success: All tests pass_
`;
        const result = validateTasksMarkdown(content);
        expect(result.valid).toBe(true);
      });
    });
  });

  describe('formatValidationErrors', () => {
    it('should format errors correctly', () => {
      const result = {
        valid: false,
        errors: [
          { line: 5, field: 'taskId', message: 'Missing task ID', suggestion: 'Add numeric ID', severity: 'error' as const }
        ],
        warnings: [],
        summary: { totalTasks: 1, validTasks: 0, invalidTasks: 1 }
      };

      const formatted = formatValidationErrors(result);
      expect(formatted.length).toBeGreaterThan(0);
      expect(formatted.some(m => m.includes('Line 5'))).toBe(true);
      expect(formatted.some(m => m.includes('Missing task ID'))).toBe(true);
    });

    it('should format warnings correctly', () => {
      const result = {
        valid: true,
        errors: [],
        warnings: [
          { line: 10, taskId: '1', field: 'requirements', message: 'Missing underscores', suggestion: 'Use _Requirements:_', severity: 'warning' as const }
        ],
        summary: { totalTasks: 1, validTasks: 1, invalidTasks: 0 }
      };

      const formatted = formatValidationErrors(result);
      expect(formatted.some(m => m.includes('warning'))).toBe(true);
      expect(formatted.some(m => m.includes('Line 10'))).toBe(true);
    });

    it('should return empty array for valid result with no warnings', () => {
      const result = {
        valid: true,
        errors: [],
        warnings: [],
        summary: { totalTasks: 2, validTasks: 2, invalidTasks: 0 }
      };

      const formatted = formatValidationErrors(result);
      expect(formatted).toHaveLength(0);
    });
  });
});
