/**
 * Task Parser — re-exports from @spec-workflow/shared.
 * All task parsing logic is now centralized in the shared package.
 */

export {
  parseTasksFromMarkdown,
  updateTaskStatus,
  findNextPendingTask,
  getTaskById,
  parseTaskProgress,
} from '@spec-workflow/shared';

export type { ParsedTask, TaskParserResult } from '@spec-workflow/shared';
