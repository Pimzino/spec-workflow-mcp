import { describe, it, expect } from 'vitest';
import { parseTasksFromMarkdown, updateTaskStatus } from '../task-parser.js';

describe('task-parser', () => {
  describe('parseTasksFromMarkdown', () => {
    it('should parse blocked tasks with [~] checkbox', () => {
      const content = `- [~] 1. Blocked task
  - File: src/blocked.ts

- [ ] 2. Pending task
  - File: src/todo.ts
`;
      const result = parseTasksFromMarkdown(content);
      const blockedTask = result.tasks.find(t => t.id === '1');
      expect(blockedTask).toBeDefined();
      expect(blockedTask!.status).toBe('blocked');
      expect(blockedTask!.blocked).toBe(true);
      expect(blockedTask!.completed).toBe(false);
      expect(blockedTask!.inProgress).toBe(false);
    });

    it('should include blocked count in summary', () => {
      const content = `- [~] 1. Blocked task
- [~] 2. Another blocked task
- [ ] 3. Pending task
- [x] 4. Completed task
- [-] 5. In progress task
`;
      const result = parseTasksFromMarkdown(content);
      expect(result.summary.blocked).toBe(2);
      expect(result.summary.pending).toBe(1);
      expect(result.summary.completed).toBe(1);
      expect(result.summary.inProgress).toBe(1);
    });

    it('should parse _Blocked: reason_ into blockedReason field', () => {
      const content = `- [~] 1. Blocked task
  - _Blocked: Waiting on API team to finalize schema_
  - File: src/blocked.ts

- [ ] 2. Pending task
`;
      const result = parseTasksFromMarkdown(content);
      const blockedTask = result.tasks.find(t => t.id === '1');
      expect(blockedTask).toBeDefined();
      expect(blockedTask!.status).toBe('blocked');
      expect(blockedTask!.blockedReason).toBe('Waiting on API team to finalize schema');
    });

    it('should not set blockedReason when _Blocked:_ metadata is absent', () => {
      const content = `- [~] 1. Blocked task without reason
  - File: src/blocked.ts
`;
      const result = parseTasksFromMarkdown(content);
      const blockedTask = result.tasks.find(t => t.id === '1');
      expect(blockedTask).toBeDefined();
      expect(blockedTask!.status).toBe('blocked');
      expect(blockedTask!.blockedReason).toBeUndefined();
    });

    it('should parse all four status types correctly', () => {
      const content = `- [ ] 1. Pending task
- [-] 2. In progress task
- [x] 3. Completed task
- [~] 4. Blocked task
`;
      const result = parseTasksFromMarkdown(content);
      expect(result.tasks[0].status).toBe('pending');
      expect(result.tasks[1].status).toBe('in-progress');
      expect(result.tasks[2].status).toBe('completed');
      expect(result.tasks[3].status).toBe('blocked');
    });
  });

  describe('updateTaskStatus', () => {
    it('should update a task to blocked status with [~]', () => {
      const content = `- [ ] 1. Some task\n- [ ] 2. Another task`;
      const result = updateTaskStatus(content, '1', 'blocked');
      expect(result).toContain('- [~] 1. Some task');
    });

    it('should update a blocked task back to pending', () => {
      const content = `- [~] 1. Blocked task\n- [ ] 2. Another task`;
      const result = updateTaskStatus(content, '1', 'pending');
      expect(result).toContain('- [ ] 1. Blocked task');
    });

    it('should update a blocked task to completed', () => {
      const content = `- [~] 1. Blocked task`;
      const result = updateTaskStatus(content, '1', 'completed');
      expect(result).toContain('- [x] 1. Blocked task');
    });

    it('should roundtrip blocked status correctly', () => {
      const original = `- [ ] 1. Task to block`;
      const blocked = updateTaskStatus(original, '1', 'blocked');
      expect(blocked).toContain('[~]');

      const parsed = parseTasksFromMarkdown(blocked);
      expect(parsed.tasks[0].status).toBe('blocked');

      const unblocked = updateTaskStatus(blocked, '1', 'pending');
      expect(unblocked).toContain('[ ]');
    });

    it('should add _Blocked:_ line when reason is provided', () => {
      const content = `- [ ] 1. Some task\n- [ ] 2. Another task`;
      const result = updateTaskStatus(content, '1', 'blocked', 'Waiting on API team');
      expect(result).toContain('- [~] 1. Some task');
      expect(result).toContain('_Blocked: Waiting on API team_');
    });

    it('should remove _Blocked:_ line when changing away from blocked', () => {
      const content = `- [~] 1. Blocked task\n  - _Blocked: Waiting on API team_\n- [ ] 2. Another task`;
      const result = updateTaskStatus(content, '1', 'pending');
      expect(result).toContain('- [ ] 1. Blocked task');
      expect(result).not.toContain('_Blocked:');
    });

    it('should replace existing _Blocked:_ line with new reason', () => {
      const content = `- [~] 1. Blocked task\n  - _Blocked: Old reason_\n- [ ] 2. Another task`;
      const result = updateTaskStatus(content, '1', 'blocked', 'New reason');
      expect(result).toContain('_Blocked: New reason_');
      expect(result).not.toContain('Old reason');
    });

    it('should roundtrip: block with reason, parse, unblock, verify line removed', () => {
      const original = `- [ ] 1. Task to block\n  - File: src/test.ts\n- [ ] 2. Other task`;
      const blocked = updateTaskStatus(original, '1', 'blocked', 'Depends on task 2');
      expect(blocked).toContain('_Blocked: Depends on task 2_');

      const parsed = parseTasksFromMarkdown(blocked);
      expect(parsed.tasks[0].status).toBe('blocked');
      expect(parsed.tasks[0].blockedReason).toBe('Depends on task 2');

      const unblocked = updateTaskStatus(blocked, '1', 'pending');
      expect(unblocked).not.toContain('_Blocked:');
      expect(unblocked).toContain('- [ ] 1. Task to block');

      const parsedAgain = parseTasksFromMarkdown(unblocked);
      expect(parsedAgain.tasks[0].status).toBe('pending');
      expect(parsedAgain.tasks[0].blockedReason).toBeUndefined();
    });

    it('should block without reason when reason is not provided', () => {
      const content = `- [ ] 1. Some task`;
      const result = updateTaskStatus(content, '1', 'blocked');
      expect(result).toContain('- [~] 1. Some task');
      expect(result).not.toContain('_Blocked:');
    });
  });
});
