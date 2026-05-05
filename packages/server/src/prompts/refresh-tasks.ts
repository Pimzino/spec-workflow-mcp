import { Prompt, PromptMessage } from '@modelcontextprotocol/sdk/types.js';
import { PromptDefinition } from './types.js';
import { ToolContext } from '../types.js';
import { PathUtils } from '../core/path-utils.js';
import { readFile } from 'fs/promises';
import { join } from 'path';

const prompt: Prompt = {
  name: 'refresh-tasks',
  title: 'Refresh Tasks After Spec Changes',
  description: 'Comprehensive guide for updating tasks.md when requirements or design change during implementation. Preserves completed work while aligning pending tasks with current spec.',
  arguments: [
    {
      name: 'specName',
      description: 'Name of the specification to refresh tasks for',
      required: true
    },
    {
      name: 'changes',
      description: 'Description of what changed in requirements or design',
      required: false
    }
  ]
};

async function handler(args: Record<string, any>, context: ToolContext): Promise<PromptMessage[]> {
  const { specName, changes = 'Requirements or design have been updated' } = args;
  const projectPath = context.projectPath;

  // Try to load existing documents for context
  let contextInfo = '';
  try {
    const specDir = PathUtils.getSpecPath(projectPath, specName);

    // Check what documents exist
    let hasRequirements = false;
    let hasDesign = false;
    let hasTasks = false;

    try {
      await readFile(join(specDir, 'requirements.md'), 'utf-8');
      hasRequirements = true;
    } catch (error) {
      // File doesn't exist
    }

    try {
      await readFile(join(specDir, 'design.md'), 'utf-8');
      hasDesign = true;
    } catch (error) {
      // File doesn't exist
    }

    try {
      await readFile(join(specDir, 'tasks.md'), 'utf-8');
      hasTasks = true;
    } catch (error) {
      // File doesn't exist
    }

    contextInfo = `
## Current Spec Status for "${specName}"
- Requirements.md exists: ${hasRequirements ? 'Yes' : 'No'}
- Design.md exists: ${hasDesign ? 'Yes' : 'No'}
- Tasks.md exists: ${hasTasks ? 'Yes' : 'No'}

## Reported Changes
${changes}
`;
  } catch (error) {
    contextInfo = `
## Spec: "${specName}"
Unable to check existing documents. Ensure the spec exists at the correct path.

## Reported Changes
${changes}
`;
  }

  const content = `# Task Refresh Instructions

${contextInfo}

## Context
You are refreshing the task list for specification "${specName}" because requirements or design have changed during implementation. Your goal is to ensure the task list accurately reflects what needs to be done to bridge the gap between current implementation and the updated requirements/design.

## CRITICAL: Source of Truth
- Requirements come ONLY from requirements.md - not from existing tasks
- Design decisions come ONLY from design.md - not from existing tasks
- Tasks are implementation steps - they implement requirements, they don't define them
- If a feature exists in tasks but NOT in requirements.md/design.md, it has been REMOVED from the spec

## Three-Pass Validation Process

### PASS 1: Validate Existing Tasks Against Current Spec
For each existing task, verify if the feature it implements still exists in requirements.md or design.md.

Actions for PENDING tasks:
- KEEP if the feature is still in requirements/design
- REMOVE if the feature is NOT in requirements/design (feature was cut from spec)

Actions for COMPLETED/IN-PROGRESS tasks:
- ALWAYS PRESERVE completed [x] and in-progress [-] tasks exactly as written
- If the feature was removed, add a note: "_Note: Feature removed from spec but task preserved_"
- If architecture changed, add migration tasks immediately after the completed work

### PASS 2: Gap Analysis
For each requirement in requirements.md, verify corresponding task coverage exists.
For each design decision in design.md, verify tasks align with the architecture.

Actions:
- ADD new tasks for requirements/design elements without task coverage
- ADD migration tasks when architecture changes affect completed work
- UPDATE pending tasks that need alignment with updated requirements

### PASS 3: Create Updated Task List
After Pass 1 and Pass 2, determine if changes are needed:
- Are there pending tasks to remove?
- Are there new tasks to add?
- Are there migration tasks needed?
- Are there existing tasks to modify?

If NO changes needed: Report "Task list is already aligned with current requirements - no refresh needed" and STOP.

If changes ARE needed, build the new tasks.md with:
1. All completed [x] tasks preserved exactly as written
2. All in-progress [-] tasks preserved exactly as written
3. Migration tasks added where architecture changes affect completed work
4. Only pending [ ] tasks that have backing in current requirements/design
5. New tasks for any missing requirements/design elements
6. Proper sequencing and requirement references

## Handling Architecture Changes

When architecture changes affect already-implemented code, add migration tasks:

Example: MongoDB to PostgreSQL switch with completed MongoDB work:
- [x] 2.1 Create MongoDB connection logic
- [x] 2.2 Define MongoDB schemas
- [x] 2.3 Implement MongoDB queries
- [ ] 2.4 Migrate MongoDB schemas to PostgreSQL tables (NEW)
- [ ] 2.5 Replace MongoDB connection with PostgreSQL client (NEW)
- [ ] 2.6 Convert MongoDB queries to PostgreSQL syntax (NEW)
- [ ] 2.7 Migrate existing data from MongoDB to PostgreSQL (NEW)
- [ ] 2.8 Verify data integrity after migration (NEW)
- [ ] 2.9 Remove MongoDB dependencies after verification (NEW)
- [ ] 2.10 Implement remaining PostgreSQL features

Example: REST to GraphQL migration with completed REST endpoints:
- [x] 3.1 Implement user REST endpoints
- [x] 3.2 Implement product REST endpoints
- [ ] 3.3 Define GraphQL schema for users and products (NEW)
- [ ] 3.4 Create GraphQL resolvers wrapping REST logic (NEW)
- [ ] 3.5 Update client to use GraphQL queries (NEW)
- [ ] 3.6 Test GraphQL implementation thoroughly (NEW)
- [ ] 3.7 Remove REST endpoints after GraphQL verified (NEW)

## Task Format Requirements
Each task must follow this format:
- [ ] 1.1 Create user authentication interface
  - File: src/auth/UserAuth.ts
  - Implement login and registration forms
  - Add form validation and error handling
  - Purpose: Enable user account management
  - _Leverage: src/components/BaseForm.tsx, src/utils/validation.ts_
  - _Requirements: 1.1, 1.2_

Migration tasks should follow this format:
- [ ] 2.4 Migrate MongoDB schemas to PostgreSQL tables
  - File: src/database/migrations/mongo-to-postgres.ts
  - Convert document schemas to relational tables
  - Map embedded documents to foreign key relationships
  - Preserve all existing data relationships
  - Purpose: Transition database layer to new architecture
  - _Leverage: Completed MongoDB schemas in tasks 2.1-2.3_
  - _Requirements: Design section 3.2_

## Critical Rules
- ALWAYS preserve completed [x] tasks exactly as written
- ALWAYS preserve in-progress [-] tasks exactly as written
- ALWAYS add migration tasks when architecture changes affect completed work
- ALWAYS reference specific requirements (e.g., _Requirements: 1.1, 2.3_)
- ENSURE tasks build incrementally with proper dependencies
- MAKE tasks atomic, specific, and actionable
- PRESERVE the original tasks.md structure and format
- KEEP tasks.md clean - only include the task list itself

## Progressive Migration Strategy

For major architecture changes, create tasks that support progressive migration:
1. Implement new architecture alongside existing
2. Add compatibility layer tasks
3. Migrate functionality incrementally
4. Verify each migration step
5. Remove old implementation only after full verification

This ensures the application remains functional throughout the transition.

## Implementation Steps
1. Read requirements.md and design.md carefully - these define what should exist
2. Read current tasks.md and identify completed, in-progress, and pending tasks
3. Perform Pass 1: Validate existing tasks against current spec
4. Perform Pass 2: Identify gaps in task coverage
5. Determine if changes are needed
6. If changes needed, build updated task list with proper validation
7. Use create-spec-doc tool to save the updated tasks.md
8. Report what changes were made and why

## Example Analysis Output

When refreshing tasks, provide clear feedback:

"Task Refresh Analysis:
- Preserved: 5 completed tasks, 2 in-progress tasks
- Removed: 3 pending tasks for deleted reporting feature
- Added: 4 migration tasks for MongoDB to PostgreSQL transition
- Added: 6 new tasks for social login feature
- Updated: 2 pending tasks to align with new API design

The tasks.md has been updated to reflect current requirements while preserving all completed work."`;

  return [
    {
      role: 'user',
      content: { type: 'text', text: content }
    }
  ];}

export const refreshTasksPrompt: PromptDefinition = {
  prompt,
  handler
};