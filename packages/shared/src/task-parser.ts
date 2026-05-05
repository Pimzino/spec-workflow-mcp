/**
 * Unified Task Parser Module
 * Provides consistent task parsing across all components.
 * Pure TypeScript — no Node.js or browser APIs.
 */

import { PromptSection } from './types.js';

// ---- Structured Prompt Parsing ----

function parseStructuredPrompt(promptText: string): PromptSection[] | undefined {
  if (!promptText || typeof promptText !== 'string') return undefined;
  if (!promptText.includes('|')) return undefined;

  const sections: PromptSection[] = [];
  const parts = promptText.split('|').map(part => part.trim()).filter(part => part.length > 0);
  if (parts.length === 0) return undefined;

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];

    if (i === 0) {
      const knownKeys = ['Role', 'Task', 'Context', 'Instructions', 'Requirements', 'Leverage', 'Success', 'Restrictions'];
      let lastKeyIndex = -1;
      for (const key of knownKeys) {
        const keyPattern = new RegExp(`\\b${key}:`, 'i');
        const match = part.match(keyPattern);
        if (match && match.index !== undefined && match.index > lastKeyIndex) {
          lastKeyIndex = match.index;
        }
      }
      if (lastKeyIndex > -1 && lastKeyIndex < part.length) {
        const keyValuePart = part.substring(lastKeyIndex);
        const colonIndex = keyValuePart.indexOf(':');
        if (colonIndex > 0 && colonIndex < keyValuePart.length - 1) {
          const key = keyValuePart.substring(0, colonIndex).trim();
          const value = keyValuePart.substring(colonIndex + 1).trim();
          if (key && value) {
            const cleanKey = key.replace(/^_+|_+$/g, '');
            const cleanValue = value.replace(/^_+|_+$/g, '');
            if (cleanKey && cleanValue) sections.push({ key: cleanKey, value: cleanValue });
          }
        }
      }
      continue;
    }

    const colonIndex = part.indexOf(':');
    if (colonIndex > 0 && colonIndex < part.length - 1) {
      const key = part.substring(0, colonIndex).trim();
      const value = part.substring(colonIndex + 1).trim();
      if (key && value) {
        const cleanKey = key.replace(/^_+|_+$/g, '');
        const cleanValue = value.replace(/^_+|_+$/g, '');
        if (cleanKey && cleanValue) sections.push({ key: cleanKey, value: cleanValue });
      }
    } else if (colonIndex <= 0 || colonIndex >= part.length - 1) {
      if (sections.length > 0) {
        const cleanedPart = part.replace(/^_+|_+$/g, '').trim();
        if (cleanedPart) sections[sections.length - 1].value += ' | ' + cleanedPart;
      }
    }
  }

  return sections.length > 0 ? sections : undefined;
}

// ---- Parsed Task ----

export interface ParsedTask {
  id: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'blocked';
  lineNumber: number;
  indentLevel: number;
  isHeader: boolean;
  requirements?: string[];
  leverage?: string;
  files?: string[];
  purposes?: string[];
  implementationDetails?: string[];
  prompt?: string;
  promptStructured?: PromptSection[];
  blockedReason?: string;
  // Backward compatibility
  completed: boolean;
  inProgress: boolean;
  blocked: boolean;
}

export interface TaskParserResult {
  tasks: ParsedTask[];
  inProgressTask: string | null;
  summary: {
    total: number;
    completed: number;
    inProgress: number;
    pending: number;
    blocked: number;
    headers: number;
  };
}

// ---- Parse Tasks from Markdown ----

export function parseTasksFromMarkdown(content: string): TaskParserResult {
  const lines = content.split('\n');
  const tasks: ParsedTask[] = [];
  let inProgressTask: string | null = null;

  const checkboxIndices: number[] = [];
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].match(/^\s*[-*]\s+\[([ x\-~])\]/)) checkboxIndices.push(i);
  }

  for (let idx = 0; idx < checkboxIndices.length; idx++) {
    const lineNumber = checkboxIndices[idx];
    const endLine = idx < checkboxIndices.length - 1 ? checkboxIndices[idx + 1] : lines.length;
    const line = lines[lineNumber];
    const checkboxMatch = line.match(/^(\s*)([-*])\s+\[([ x\-~])\]\s+(.+)/);
    if (!checkboxMatch) continue;

    const indent = checkboxMatch[1];
    const statusChar = checkboxMatch[3];
    const taskText = checkboxMatch[4];

    let status: 'pending' | 'in-progress' | 'completed' | 'blocked';
    if (statusChar === 'x') status = 'completed';
    else if (statusChar === '-') status = 'in-progress';
    else if (statusChar === '~') status = 'blocked';
    else status = 'pending';

    const taskMatch = taskText.match(/^(\d+(?:\.\d+)*)\s*\\?\.?\s+(.+)/);
    if (!taskMatch) continue;

    const taskId = taskMatch[1];
    const description = taskMatch[2];

    // Parse metadata
    const requirements: string[] = [];
    const leverage: string[] = [];
    const files: string[] = [];
    const purposes: string[] = [];
    const implementationDetails: string[] = [];
    let prompt: string | undefined;
    let blockedReason: string | undefined;

    for (let lineIdx = lineNumber + 1; lineIdx < endLine; lineIdx++) {
      const contentLine = lines[lineIdx].trim();
      if (!contentLine) continue;

      if (contentLine.includes('_Prompt:')) {
        const promptMatch = contentLine.match(/_Prompt:\s*(.+)_$/);
        if (promptMatch) {
          prompt = promptMatch[1].trim();
        } else {
          const afterPrompt = contentLine.match(/_Prompt:\s*(.+)$/);
          let promptText = afterPrompt ? afterPrompt[1] : '';
          promptText = promptText.replace(/_$/, '').trim();
          let j = lineIdx + 1;
          while (j < endLine) {
            const nextTrim = lines[j].trim();
            if (!nextTrim) break;
            if (/^[-*]\s/.test(nextTrim) || /^Files?:/i.test(nextTrim) || /^Purpose:/i.test(nextTrim)) break;
            promptText += ' ' + nextTrim.replace(/_$/, '').trim();
            j++;
          }
          prompt = promptText;
          lineIdx = j - 1;
        }
      } else if (contentLine.includes('_Requirements:') && !contentLine.includes('_Prompt:')) {
        const reqMatch = contentLine.match(/_Requirements:\s*([^_]+?)_/);
        if (reqMatch) {
          const reqText = reqMatch[1].trim();
          requirements.push(...reqText.split(',').map(r => r.trim()).filter(r => r && r !== 'NFR'));
        }
      } else if (contentLine.includes('_Leverage:') && !contentLine.includes('_Prompt:')) {
        const levMatch = contentLine.match(/_Leverage:\s*([^_]+?)_/);
        if (levMatch) {
          const levText = levMatch[1].trim();
          leverage.push(...levText.split(',').map(l => l.trim()).filter(l => l));
        }
      } else if (contentLine.includes('_Blocked:') && !contentLine.includes('_Prompt:')) {
        const blockedMatch = contentLine.match(/_Blocked:\s*([^_]+?)_/);
        if (blockedMatch) blockedReason = blockedMatch[1].trim();
      } else if (contentLine.match(/Files?:/)) {
        const fileMatch = contentLine.match(/Files?:\s*(.+)$/);
        if (fileMatch) {
          const filePaths = fileMatch[1].split(',').map(f => f.trim().replace(/\(.*?\)/, '').trim()).filter(f => f.length > 0);
          files.push(...filePaths);
        }
      } else if (contentLine.match(/^[-*]\s/) && !contentLine.match(/^[-*]\s+\[/)) {
        const bulletContent = contentLine.replace(/^[-*]\s+/, '').trim();
        if (bulletContent.startsWith('Purpose:')) {
          purposes.push(bulletContent.substring(8).trim());
        } else if (!bulletContent.match(/^Files?:/) && !bulletContent.match(/^Purpose:/)) {
          implementationDetails.push(bulletContent);
        }
      }
    }

    const hasDetails = requirements.length > 0 || leverage.length > 0 || files.length > 0 ||
      purposes.length > 0 || implementationDetails.length > 0 || !!prompt;

    let promptStructured: PromptSection[] | undefined;
    if (prompt) promptStructured = parseStructuredPrompt(prompt);

    const task: ParsedTask = {
      id: taskId,
      description,
      status,
      lineNumber,
      indentLevel: indent.length / 2,
      isHeader: !hasDetails,
      completed: status === 'completed',
      inProgress: status === 'in-progress',
      blocked: status === 'blocked',
      ...(requirements.length > 0 && { requirements }),
      ...(leverage.length > 0 && { leverage: leverage.join(', ') }),
      ...(files.length > 0 && { files }),
      ...(purposes.length > 0 && { purposes }),
      ...(implementationDetails.length > 0 && { implementationDetails }),
      ...(prompt && { prompt }),
      ...(promptStructured && { promptStructured }),
      ...(blockedReason && { blockedReason }),
    };
    tasks.push(task);

    if (status === 'in-progress' && !inProgressTask) inProgressTask = taskId;
  }

  // Calculate summary (exclude header tasks from counts)
  const nonHeaderTasks = tasks.filter(t => !t.isHeader);
  const summary = {
    total: nonHeaderTasks.length,
    completed: nonHeaderTasks.filter(t => t.status === 'completed').length,
    inProgress: nonHeaderTasks.filter(t => t.status === 'in-progress').length,
    pending: nonHeaderTasks.filter(t => t.status === 'pending').length,
    blocked: nonHeaderTasks.filter(t => t.status === 'blocked').length,
    headers: tasks.filter(t => t.isHeader).length,
  };

  return { tasks, inProgressTask, summary };
}

// ---- Update Task Status ----

export function updateTaskStatus(
  content: string,
  taskId: string,
  newStatus: 'pending' | 'in-progress' | 'completed' | 'blocked',
  reason?: string,
): string {
  const lines = content.split('\n');
  const statusMarker = newStatus === 'completed' ? 'x' :
    newStatus === 'in-progress' ? '-' :
    newStatus === 'blocked' ? '~' : ' ';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const checkboxMatch = line.match(/^(\s*)([-*])\s+\[([ x\-~])\]\s+(.+)/);
    if (!checkboxMatch) continue;

    const prefix = checkboxMatch[1];
    const listMarker = checkboxMatch[2];
    const taskText = checkboxMatch[4];
    const taskMatch = taskText.match(/^(\d+(?:\.\d+)*)\s*\\?\.?\s+(.+)/);

    if (taskMatch && taskMatch[1] === taskId) {
      lines[i] = prefix + `${listMarker} [${statusMarker}] ` + taskText;

      // Remove existing _Blocked:_ line
      let blockedLineIndex = -1;
      for (let j = i + 1; j < lines.length; j++) {
        const nextLine = lines[j].trim();
        if (nextLine.match(/^[-*]\s+\[([ x\-~])\]/)) break;
        if (nextLine.match(/_Blocked:\s*[^_]+?_/)) { blockedLineIndex = j; break; }
      }
      if (blockedLineIndex !== -1) lines.splice(blockedLineIndex, 1);

      // Insert new _Blocked:_ line if blocking with reason
      if (newStatus === 'blocked' && reason) {
        const blockedLine = `${prefix}  - _Blocked: ${reason}_`;
        lines.splice(i + 1, 0, blockedLine);
      }

      return lines.join('\n');
    }
  }

  return content;
}

// ---- Helpers ----

export function findNextPendingTask(tasks: ParsedTask[]): ParsedTask | null {
  return tasks.find(t => t.status === 'pending' && !t.isHeader) || null;
}

export function getTaskById(tasks: ParsedTask[], taskId: string): ParsedTask | undefined {
  return tasks.find(t => t.id === taskId);
}

export function parseTaskProgress(content: string): { total: number; completed: number; pending: number } {
  const result = parseTasksFromMarkdown(content);
  return { total: result.summary.total, completed: result.summary.completed, pending: result.summary.pending };
}
