import { describe, it, expect } from 'vitest';
import { parseTasksFromMarkdown, updateTaskStatus, findNextPendingTask, getTaskById, parseTaskProgress } from './taskParser';

describe('extension taskParser', () => {
  describe('parseTasksFromMarkdown', () => {
    it('should parse all four status types', () => {
      const content = `- [ ] 1. Pending task
- [-] 2. In progress task
- [x] 3. Completed task
- [~] 4. Blocked task
`;
      const result = parseTasksFromMarkdown(content);
      expect(result.tasks).toHaveLength(4);
      expect(result.tasks[0].status).toBe('pending');
      expect(result.tasks[1].status).toBe('in-progress');
      expect(result.tasks[2].status).toBe('completed');
      expect(result.tasks[3].status).toBe('blocked');
    });

    it('should set boolean flags correctly for blocked tasks', () => {
      const content = `- [~] 1. Blocked task\n`;
      const result = parseTasksFromMarkdown(content);
      const task = result.tasks[0];
      expect(task.status).toBe('blocked');
      expect(task.blocked).toBe(true);
      expect(task.completed).toBe(false);
      expect(task.inProgress).toBe(false);
    });

    it('should include blocked in summary counts', () => {
      const content = `- [~] 1. Blocked
  - File: src/a.ts
- [~] 2. Blocked too
  - File: src/b.ts
- [ ] 3. Pending
  - File: src/c.ts
- [x] 4. Done
  - File: src/d.ts
- [-] 5. WIP
  - File: src/e.ts
`;
      const result = parseTasksFromMarkdown(content);
      expect(result.summary.blocked).toBe(2);
      expect(result.summary.pending).toBe(1);
      expect(result.summary.completed).toBe(1);
      expect(result.summary.inProgress).toBe(1);
      expect(result.summary.total).toBe(5);
    });

    it('should parse _Blocked: reason_ metadata', () => {
      const content = `- [~] 1. Blocked task
  - _Blocked: Waiting on API team to finalize schema_
  - File: src/blocked.ts
`;
      const result = parseTasksFromMarkdown(content);
      const task = result.tasks[0];
      expect(task.status).toBe('blocked');
      expect(task.blockedReason).toBe('Waiting on API team to finalize schema');
    });

    it('should leave blockedReason undefined when no _Blocked:_ metadata', () => {
      const content = `- [~] 1. Blocked without reason\n`;
      const result = parseTasksFromMarkdown(content);
      expect(result.tasks[0].status).toBe('blocked');
      expect(result.tasks[0].blockedReason).toBeUndefined();
    });

    it('should parse nested/subtasks with mixed statuses', () => {
      const content = `- [-] 1. Parent task
  - File: src/parent.ts

  - [x] 1.1. Subtask done
    - File: src/sub1.ts

  - [~] 1.2. Subtask blocked
    - _Blocked: Depends on external API_
    - File: src/sub2.ts

  - [ ] 1.3. Subtask pending
`;
      const result = parseTasksFromMarkdown(content);
      expect(result.tasks).toHaveLength(4);
      expect(result.tasks[0].id).toBe('1');
      expect(result.tasks[0].status).toBe('in-progress');
      expect(result.tasks[1].id).toBe('1.1');
      expect(result.tasks[1].status).toBe('completed');
      expect(result.tasks[2].id).toBe('1.2');
      expect(result.tasks[2].status).toBe('blocked');
      expect(result.tasks[2].blockedReason).toBe('Depends on external API');
      expect(result.tasks[3].id).toBe('1.3');
      expect(result.tasks[3].status).toBe('pending');
    });

    it('should track first in-progress task', () => {
      const content = `- [ ] 1. Pending
- [-] 2. In progress
- [-] 3. Also in progress
`;
      const result = parseTasksFromMarkdown(content);
      expect(result.inProgressTask).toBe('2');
    });

    it('should not track blocked as in-progress', () => {
      const content = `- [~] 1. Blocked
- [-] 2. In progress
`;
      const result = parseTasksFromMarkdown(content);
      expect(result.inProgressTask).toBe('2');
    });

    it('should parse files metadata', () => {
      const content = `- [ ] 1. Task with files
  - File: src/foo.ts, src/bar.ts
`;
      const result = parseTasksFromMarkdown(content);
      expect(result.tasks[0].files).toEqual(['src/foo.ts', 'src/bar.ts']);
    });

    it('should parse requirements metadata', () => {
      const content = `- [ ] 1. Task with reqs
  - _Requirements: 1.1, 1.2, 2.3_
`;
      const result = parseTasksFromMarkdown(content);
      expect(result.tasks[0].requirements).toEqual(['1.1', '1.2', '2.3']);
    });

    it('should parse leverage metadata', () => {
      const content = `- [ ] 1. Task with leverage
  - _Leverage: src/utils/crypto.ts_
`;
      const result = parseTasksFromMarkdown(content);
      expect(result.tasks[0].leverage).toBe('src/utils/crypto.ts');
    });

    it('should parse prompt metadata', () => {
      const content = `- [ ] 1. Task with prompt
  - _Prompt: Role: Dev | Task: Build it | Success: It works_
`;
      const result = parseTasksFromMarkdown(content);
      expect(result.tasks[0].prompt).toBe('Role: Dev | Task: Build it | Success: It works');
    });

    it('should parse implementation details as bullet points', () => {
      const content = `- [ ] 1. Task with details
  - Implement bcrypt hashing
  - Add validation layer
`;
      const result = parseTasksFromMarkdown(content);
      expect(result.tasks[0].implementationDetails).toEqual([
        'Implement bcrypt hashing',
        'Add validation layer'
      ]);
    });

    it('should mark tasks without details as headers', () => {
      const content = `- [-] 1. Header task

  - [x] 1.1. Subtask with file
    - File: src/sub.ts
`;
      const result = parseTasksFromMarkdown(content);
      expect(result.tasks[0].isHeader).toBe(true);
      expect(result.tasks[1].isHeader).toBe(false);
    });

    it('should exclude headers from summary total', () => {
      const content = `- [-] 1. Header task

  - [x] 1.1. Subtask
    - File: src/sub.ts

  - [ ] 1.2. Another subtask
    - File: src/sub2.ts
`;
      const result = parseTasksFromMarkdown(content);
      expect(result.summary.headers).toBe(1);
      expect(result.summary.total).toBe(2); // excludes header
    });

    it('should handle * list markers', () => {
      const content = `* [~] 1. Blocked with asterisk
  * _Blocked: Using star markers_
`;
      const result = parseTasksFromMarkdown(content);
      expect(result.tasks[0].status).toBe('blocked');
      expect(result.tasks[0].blockedReason).toBe('Using star markers');
    });

    it('should handle escaped periods from MDXEditor', () => {
      const content = `- [ ] 1\\. Task with escaped period\n`;
      const result = parseTasksFromMarkdown(content);
      expect(result.tasks[0].id).toBe('1');
      expect(result.tasks[0].description).toBe('Task with escaped period');
    });
  });

  describe('updateTaskStatus', () => {
    it('should update to blocked with [~]', () => {
      const content = `- [ ] 1. Some task\n- [ ] 2. Another task`;
      const result = updateTaskStatus(content, '1', 'blocked');
      expect(result).toContain('- [~] 1. Some task');
    });

    it('should update blocked back to pending', () => {
      const content = `- [~] 1. Blocked task\n- [ ] 2. Other`;
      const result = updateTaskStatus(content, '1', 'pending');
      expect(result).toContain('- [ ] 1. Blocked task');
    });

    it('should update blocked to completed', () => {
      const content = `- [~] 1. Blocked task`;
      const result = updateTaskStatus(content, '1', 'completed');
      expect(result).toContain('- [x] 1. Blocked task');
    });

    it('should update blocked to in-progress', () => {
      const content = `- [~] 1. Blocked task`;
      const result = updateTaskStatus(content, '1', 'in-progress');
      expect(result).toContain('- [-] 1. Blocked task');
    });

    it('should add _Blocked: reason_ line when reason provided', () => {
      const content = `- [ ] 1. Some task\n- [ ] 2. Another task`;
      const result = updateTaskStatus(content, '1', 'blocked', 'Waiting on API team');
      expect(result).toContain('- [~] 1. Some task');
      expect(result).toContain('_Blocked: Waiting on API team_');
    });

    it('should not add _Blocked:_ line when no reason', () => {
      const content = `- [ ] 1. Some task`;
      const result = updateTaskStatus(content, '1', 'blocked');
      expect(result).toContain('- [~] 1. Some task');
      expect(result).not.toContain('_Blocked:');
    });

    it('should remove _Blocked:_ line when changing away from blocked', () => {
      const content = `- [~] 1. Blocked task\n  - _Blocked: Old reason_\n- [ ] 2. Other`;
      const result = updateTaskStatus(content, '1', 'pending');
      expect(result).toContain('- [ ] 1. Blocked task');
      expect(result).not.toContain('_Blocked:');
    });

    it('should replace existing _Blocked:_ line with new reason', () => {
      const content = `- [~] 1. Blocked task\n  - _Blocked: Old reason_\n- [ ] 2. Other`;
      const result = updateTaskStatus(content, '1', 'blocked', 'New reason');
      expect(result).toContain('_Blocked: New reason_');
      expect(result).not.toContain('Old reason');
    });

    it('should roundtrip: pending -> blocked with reason -> pending', () => {
      const original = `- [ ] 1. Task to block\n  - File: src/test.ts\n- [ ] 2. Other task`;

      const blocked = updateTaskStatus(original, '1', 'blocked', 'Depends on task 2');
      expect(blocked).toContain('[~]');
      expect(blocked).toContain('_Blocked: Depends on task 2_');

      const parsed = parseTasksFromMarkdown(blocked);
      expect(parsed.tasks[0].status).toBe('blocked');
      expect(parsed.tasks[0].blockedReason).toBe('Depends on task 2');

      const unblocked = updateTaskStatus(blocked, '1', 'pending');
      expect(unblocked).toContain('- [ ] 1. Task to block');
      expect(unblocked).not.toContain('_Blocked:');

      const parsedAgain = parseTasksFromMarkdown(unblocked);
      expect(parsedAgain.tasks[0].status).toBe('pending');
      expect(parsedAgain.tasks[0].blockedReason).toBeUndefined();
    });

    it('should preserve original list marker (* vs -)', () => {
      const content = `* [ ] 1. Star task`;
      const result = updateTaskStatus(content, '1', 'blocked');
      expect(result).toContain('* [~] 1. Star task');
    });

    it('should preserve indentation for nested tasks', () => {
      const content = `- [-] 1. Parent\n  - [ ] 1.1. Child task`;
      const result = updateTaskStatus(content, '1.1', 'blocked', 'Waiting');
      expect(result).toContain('  - [~] 1.1. Child task');
      expect(result).toContain('_Blocked: Waiting_');
    });

    it('should return content unchanged if task not found', () => {
      const content = `- [ ] 1. Only task`;
      const result = updateTaskStatus(content, '99', 'blocked');
      expect(result).toBe(content);
    });
  });

  describe('findNextPendingTask', () => {
    it('should find first pending non-header task', () => {
      const content = `- [-] 1. Header (in progress)

  - [x] 1.1. Done
    - File: src/done.ts

  - [ ] 1.2. Pending subtask
    - File: src/pending.ts
`;
      const result = parseTasksFromMarkdown(content);
      const next = findNextPendingTask(result.tasks);
      expect(next).not.toBeNull();
      expect(next!.id).toBe('1.2');
    });

    it('should skip blocked tasks', () => {
      const content = `- [~] 1. Blocked
  - File: src/a.ts
- [ ] 2. Pending
  - File: src/b.ts
`;
      const result = parseTasksFromMarkdown(content);
      const next = findNextPendingTask(result.tasks);
      expect(next).not.toBeNull();
      expect(next!.id).toBe('2');
    });

    it('should return null when no pending tasks', () => {
      const content = `- [x] 1. Done\n- [~] 2. Blocked\n`;
      const result = parseTasksFromMarkdown(content);
      const next = findNextPendingTask(result.tasks);
      expect(next).toBeNull();
    });
  });

  describe('getTaskById', () => {
    it('should find task by ID', () => {
      const content = `- [ ] 1. First\n- [~] 2. Second\n`;
      const result = parseTasksFromMarkdown(content);
      const task = getTaskById(result.tasks, '2');
      expect(task).toBeDefined();
      expect(task!.status).toBe('blocked');
    });

    it('should return undefined for missing ID', () => {
      const content = `- [ ] 1. Only\n`;
      const result = parseTasksFromMarkdown(content);
      expect(getTaskById(result.tasks, '99')).toBeUndefined();
    });
  });

  describe('parseTaskProgress (backward compat)', () => {
    it('should return total, completed, pending counts', () => {
      const content = `- [x] 1. Done\n  - File: a.ts\n- [ ] 2. Pending\n  - File: b.ts\n- [~] 3. Blocked\n  - File: c.ts\n`;
      const progress = parseTaskProgress(content);
      expect(progress.total).toBe(3);
      expect(progress.completed).toBe(1);
      expect(progress.pending).toBe(1);
    });
  });

  describe('real-world: auth-flow tasks.md fixture', () => {
    const authFlowContent = `# Tasks: Auth Flow

- [x] 1. Set up authentication module structure
  - File: src/auth/index.ts
  - Create the auth module barrel export and directory structure
  - _Requirements: 1, 2, 3_
  - _Prompt: Role: Backend Developer | Task: Create auth module directory structure with barrel exports | Restrictions: Follow existing module patterns | Success: Module imports resolve correctly_

- [-] 2. Implement email/password authentication
  - File: src/auth/auth-service.ts, src/auth/auth-controller.ts
  - _Requirements: 1.1, 1.2, 1.3_
  - _Leverage: src/utils/crypto.ts_

  - [x] 2.1. Create password hashing utility
    - File: src/auth/password.ts
    - Implement bcrypt hashing with cost factor 12
    - _Requirements: NFR Security_
    - _Leverage: src/utils/crypto.ts_

  - [-] 2.2. Build login endpoint
    - File: src/auth/auth-controller.ts
    - POST /api/auth/login with email/password validation
    - _Requirements: 1.1, 1.2_

  - [ ] 2.3. Add account lockout logic
    - File: src/auth/auth-service.ts
    - Track failed attempts, lock after 5 failures for 15 minutes
    - _Requirements: 1.3, NFR Security_

- [~] 3. Implement OAuth provider support
  - File: src/auth/oauth-service.ts, src/auth/oauth-controller.ts
  - _Requirements: 2.1, 2.2, 2.3_
  - _Blocked: Waiting on Google OAuth app credentials from DevOps team_

  - [~] 3.1. Google OAuth integration
    - File: src/auth/providers/google.ts
    - Implement Google OAuth consent flow and callback handler
    - _Requirements: 2.1_
    - _Blocked: Need Google Cloud project credentials_

  - [ ] 3.2. GitHub OAuth integration
    - File: src/auth/providers/github.ts
    - Implement GitHub OAuth flow and callback handler
    - _Requirements: 2.1_

  - [ ] 3.3. Account linking logic
    - File: src/auth/oauth-service.ts
    - Link OAuth provider to existing account when emails match
    - _Requirements: 2.3_

- [ ] 4. Implement session management
  - File: src/auth/token-manager.ts
  - _Requirements: 3.1, 3.2_

  - [ ] 4.1. JWT token generation and validation
    - File: src/auth/token-manager.ts
    - RS256 signing with configurable expiry
    - _Requirements: 3.1_
    - _Leverage: src/config/keys.ts_

  - [ ] 4.2. Refresh token rotation
    - File: src/auth/token-manager.ts
    - Implement secure refresh token rotation with family detection
    - _Requirements: 3.2_

- [ ] 5. Add rate limiting middleware
  - File: src/middleware/rate-limit.ts
  - Sliding window rate limiter for auth endpoints
  - _Requirements: NFR Security_
  - _Prompt: Role: Security Engineer | Task: Implement sliding window rate limiter using Redis | Restrictions: Must support distributed deployment | Success: Rate limits enforced across instances_
`;

    it('should parse all tasks from realistic fixture', () => {
      const result = parseTasksFromMarkdown(authFlowContent);
      expect(result.tasks.length).toBeGreaterThanOrEqual(12);
    });

    it('should correctly identify blocked tasks with reasons', () => {
      const result = parseTasksFromMarkdown(authFlowContent);
      const task3 = getTaskById(result.tasks, '3');
      expect(task3).toBeDefined();
      expect(task3!.status).toBe('blocked');
      expect(task3!.blockedReason).toBe('Waiting on Google OAuth app credentials from DevOps team');

      const task31 = getTaskById(result.tasks, '3.1');
      expect(task31).toBeDefined();
      expect(task31!.status).toBe('blocked');
      expect(task31!.blockedReason).toBe('Need Google Cloud project credentials');
    });

    it('should track correct summary counts', () => {
      const result = parseTasksFromMarkdown(authFlowContent);
      expect(result.summary.completed).toBeGreaterThanOrEqual(2);
      expect(result.summary.blocked).toBeGreaterThanOrEqual(2);
      expect(result.summary.inProgress).toBeGreaterThanOrEqual(1);
    });

    it('should track in-progress task', () => {
      const result = parseTasksFromMarkdown(authFlowContent);
      expect(result.inProgressTask).toBe('2');
    });

    it('should parse prompts without consuming nested metadata', () => {
      const result = parseTasksFromMarkdown(authFlowContent);
      const task1 = getTaskById(result.tasks, '1');
      expect(task1!.prompt).toContain('Role: Backend Developer');
      expect(task1!.requirements).toEqual(['1', '2', '3']);
    });
  });
});
