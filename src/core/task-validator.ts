/**
 * Task Validator Module
 * Validates tasks.md format compliance before approval
 */

export interface ValidationError {
  line: number;
  taskId?: string;
  field: string;
  message: string;
  suggestion?: string;
  severity: 'error' | 'warning';
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  summary: {
    totalTasks: number;
    validTasks: number;
    invalidTasks: number;
  };
}

/**
 * Validate tasks.md content against required format
 * @param content The markdown content to validate
 * @returns ValidationResult with errors, warnings, and summary
 */
export function validateTasksMarkdown(content: string): ValidationResult {
  const lines = content.split('\n');
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];
  let taskCount = 0;
  let validTaskCount = 0;

  // Find all checkbox lines and their ranges (including malformed ones with asterisks)
  const checkboxIndices: number[] = [];
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].match(/^\s*[-*]\s*\[/)) {
      checkboxIndices.push(i);
    }
  }

  // Process each checkbox task
  for (let idx = 0; idx < checkboxIndices.length; idx++) {
    const lineIndex = checkboxIndices[idx];
    const endLine = idx < checkboxIndices.length - 1 ? checkboxIndices[idx + 1] : lines.length;
    const line = lines[lineIndex];
    const lineNum = lineIndex + 1; // 1-based for user-friendly messages

    taskCount++;
    let taskValid = true;
    let taskId: string | undefined;

    // 1. Validate checkbox format: must be "- [ ]", "- [-]", or "- [x]"
    const checkboxMatch = line.match(/^\s*-\s+\[([ x\-])\]\s+(.+)/);

    if (!checkboxMatch) {
      // Check for common malformed patterns
      const malformedPatterns = [
        { pattern: /^\s*-\s*\[\]\s/, message: 'Empty checkbox brackets', suggestion: 'Use "- [ ]" with a space inside brackets' },
        { pattern: /^\s*-\s*\[([^x \-])\]/, message: 'Invalid checkbox character', suggestion: 'Use space for pending, x for completed, - for in-progress' },
        { pattern: /^\s*-\[\s*[x \-]?\s*\]/, message: 'Missing space after hyphen', suggestion: 'Use "- [ ]" with space between - and [' },
        { pattern: /^\s*\*\s+\[/, message: 'Wrong bullet character', suggestion: 'Use hyphen (-) instead of asterisk (*)' },
      ];

      let foundMalformed = false;
      for (const { pattern, message, suggestion } of malformedPatterns) {
        if (line.match(pattern)) {
          errors.push({
            line: lineNum,
            field: 'checkbox',
            message,
            suggestion,
            severity: 'error'
          });
          foundMalformed = true;
          taskValid = false;
          break;
        }
      }

      if (!foundMalformed) {
        errors.push({
          line: lineNum,
          field: 'checkbox',
          message: 'Invalid checkbox format',
          suggestion: 'Expected format: "- [ ] 1. Task description"',
          severity: 'error'
        });
        taskValid = false;
      }
      continue;
    }

    const statusChar = checkboxMatch[1];
    const taskText = checkboxMatch[2];

    // 2. Validate task ID: must have numeric ID like "1.", "1.1", "2.3"
    const taskIdMatch = taskText.match(/^(\d+(?:\.\d+)*)\s*\.?\s+(.+)/);

    if (!taskIdMatch) {
      errors.push({
        line: lineNum,
        field: 'taskId',
        message: 'Missing task ID number',
        suggestion: 'Add numeric ID like "1." or "1.1" after checkbox',
        severity: 'error'
      });
      taskValid = false;
    } else {
      taskId = taskIdMatch[1];
    }

    // 3. Validate metadata in following lines
    let hasRequirements = false;
    let hasLeverage = false;
    let hasPrompt = false;
    let hasFiles = false;
    let promptHasClosingUnderscore = false;
    let promptSections: string[] = [];

    for (let lineIdx = lineIndex + 1; lineIdx < endLine; lineIdx++) {
      const contentLine = lines[lineIdx];
      const trimmedLine = contentLine.trim();

      if (!trimmedLine) continue;

      // Check for _Requirements:_ format
      if (trimmedLine.includes('Requirements:')) {
        hasRequirements = true;
        // Check for proper underscore delimiters
        if (!trimmedLine.match(/_Requirements:\s*[^_]+_/)) {
          if (trimmedLine.match(/Requirements:\s*\S/) && !trimmedLine.includes('_Requirements:')) {
            warnings.push({
              line: lineIdx + 1,
              taskId,
              field: 'requirements',
              message: 'Requirements field missing underscore delimiters',
              suggestion: 'Use "_Requirements: ..._" format for proper parsing',
              severity: 'warning'
            });
          }
        }
      }

      // Check for _Leverage:_ format
      if (trimmedLine.includes('Leverage:')) {
        hasLeverage = true;
        // Check for proper underscore delimiters
        if (!trimmedLine.match(/_Leverage:\s*[^_]+_/)) {
          if (trimmedLine.match(/Leverage:\s*\S/) && !trimmedLine.includes('_Leverage:')) {
            warnings.push({
              line: lineIdx + 1,
              taskId,
              field: 'leverage',
              message: 'Leverage field missing underscore delimiters',
              suggestion: 'Use "_Leverage: ..._" format for proper parsing',
              severity: 'warning'
            });
          }
        }
      }

      // Check for Files: field
      if (trimmedLine.match(/Files?:/i)) {
        hasFiles = true;
      }

      // Check for _Prompt:_ format
      if (trimmedLine.includes('_Prompt:')) {
        hasPrompt = true;

        // Check for closing underscore
        if (trimmedLine.match(/_Prompt:\s*.+_$/)) {
          promptHasClosingUnderscore = true;
        } else {
          // Check if prompt continues on multiple lines - look for closing underscore
          let foundClosing = false;
          for (let j = lineIdx; j < endLine; j++) {
            if (lines[j].trim().endsWith('_') && !lines[j].trim().match(/^_[A-Z]/)) {
              foundClosing = true;
              break;
            }
          }
          promptHasClosingUnderscore = foundClosing;
        }

        // Extract prompt content and check structure
        const promptContent = trimmedLine.replace(/_Prompt:\s*/, '').replace(/_$/, '');

        // Check for required prompt sections: Role, Task, Restrictions, Success
        const requiredSections = ['Role', 'Task', 'Restrictions', 'Success'];
        for (const section of requiredSections) {
          if (promptContent.toLowerCase().includes(section.toLowerCase() + ':')) {
            promptSections.push(section);
          }
        }
      }
    }

    // Validate prompt requirements
    if (hasPrompt) {
      if (!promptHasClosingUnderscore) {
        warnings.push({
          line: lineNum,
          taskId,
          field: 'prompt',
          message: 'Prompt field may be missing closing underscore',
          suggestion: 'Ensure _Prompt: ..._ ends with underscore',
          severity: 'warning'
        });
      }

      // Check for missing prompt sections
      const requiredSections = ['Role', 'Task', 'Restrictions', 'Success'];
      const missingSections = requiredSections.filter(s => !promptSections.includes(s));
      if (missingSections.length > 0) {
        warnings.push({
          line: lineNum,
          taskId,
          field: 'prompt_structure',
          message: `Prompt missing sections: ${missingSections.join(', ')}`,
          suggestion: 'Format: Role: ... | Task: ... | Restrictions: ... | Success: ...',
          severity: 'warning'
        });
      }
    }

    // Track if task is valid (only errors affect validity, not warnings)
    if (taskValid) {
      validTaskCount++;
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    summary: {
      totalTasks: taskCount,
      validTasks: validTaskCount,
      invalidTasks: taskCount - validTaskCount
    }
  };
}

/**
 * Format validation errors for display
 * @param result The validation result
 * @returns Formatted string array of errors and warnings
 */
export function formatValidationErrors(result: ValidationResult): string[] {
  const messages: string[] = [];

  if (result.errors.length > 0) {
    messages.push(`Found ${result.errors.length} error(s):`);
    for (const error of result.errors) {
      const taskInfo = error.taskId ? ` (Task ${error.taskId})` : '';
      messages.push(`  Line ${error.line}${taskInfo}: ${error.message}`);
      if (error.suggestion) {
        messages.push(`    Suggestion: ${error.suggestion}`);
      }
    }
  }

  if (result.warnings.length > 0) {
    messages.push(`Found ${result.warnings.length} warning(s):`);
    for (const warning of result.warnings) {
      const taskInfo = warning.taskId ? ` (Task ${warning.taskId})` : '';
      messages.push(`  Line ${warning.line}${taskInfo}: ${warning.message}`);
      if (warning.suggestion) {
        messages.push(`    Suggestion: ${warning.suggestion}`);
      }
    }
  }

  return messages;
}
