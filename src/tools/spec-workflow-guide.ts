import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { ToolContext, ToolResponse } from '../types.js';

export const specWorkflowGuideTool: Tool = {
  name: 'spec-workflow-guide',
  description: `Load essential spec workflow instructions to guide feature development from idea to implementation.

# Instructions
Call this tool FIRST when users request spec creation, feature development, or mention specifications. This provides the complete workflow sequence (Requirements → Design → Tasks → Implementation) that must be followed. Always load before any other spec tools to ensure proper workflow understanding. Its important that you follow this workflow exactly to avoid errors.`,
  inputSchema: {
    type: 'object',
    properties: {},
    additionalProperties: false
  }
};

export async function specWorkflowGuideHandler(args: any, context: ToolContext): Promise<ToolResponse> {
  // Dashboard URL is populated from registry in server.ts
  const dashboardMessage = context.dashboardUrl ?
    `Monitor progress on dashboard: ${context.dashboardUrl}` :
    'Please start the dashboard with: spec-workflow-mcp --dashboard';

  return {
    success: true,
    message: 'Complete spec workflow guide loaded - follow this workflow exactly',
    data: {
      guide: getSpecWorkflowGuide(),
      dashboardUrl: context.dashboardUrl,
      dashboardAvailable: !!context.dashboardUrl
    },
    nextSteps: [
      'Follow sequence: Requirements → Design → Tasks → Implementation',
      'Load templates with get-template-context first',
      'Request approval after each document',
      'Use MCP tools only',
      dashboardMessage
    ]
  };
}

function getSpecWorkflowGuide(): string {
  const currentYear = new Date().getFullYear();
  return `# Spec Development Workflow

## Overview

You guide users through spec-driven development using MCP tools. Transform rough ideas into detailed specifications through Requirements → Design → Tasks → Implementation phases. Use web search when available for current best practices (current year: ${currentYear}). Its important that you follow this workflow exactly to avoid errors.
Feature names use kebab-case (e.g., user-authentication). Create ONE spec at a time.

## Workflow Diagram
\`\`\`mermaid
flowchart TD
    Start([Start: User requests feature]) --> CheckSteering{Steering docs exist?}
    CheckSteering -->|Yes| P1_Load[Read steering docs:<br/>.spec-workflow/steering/*.md]
    CheckSteering -->|No| P1_Template

    %% Phase 1: Requirements
    P1_Load --> P1_Template[Check user-templates first,<br/>then read template:<br/>requirements-template.md]
    P1_Template --> P1_Research[Web search if available]
    P1_Research --> P1_Create[Create file:<br/>.spec-workflow/specs/{name}/<br/>requirements.md]
    P1_Create --> P1_Approve[approvals<br/>action: request<br/>filePath only]
    P1_Approve --> P1_Status[approvals<br/>action: status<br/>poll status]
    P1_Status --> P1_Check{Status?}
    P1_Check -->|needs-revision| P1_Update[Update document using user comments as guidance]
    P1_Update --> P1_Create
    P1_Check -->|approved| P1_Clean[approvals<br/>action: delete]
    P1_Clean -->|failed| P1_Status

    %% Phase 2: Design
    P1_Clean -->|success| P2_Template[Check user-templates first,<br/>then read template:<br/>design-template.md]
    P2_Template --> P2_Analyze[Analyze codebase patterns]
    P2_Analyze --> P2_Create[Create file:<br/>.spec-workflow/specs/{name}/<br/>design.md]
    P2_Create --> P2_Approve[approvals<br/>action: request<br/>filePath only]
    P2_Approve --> P2_Status[approvals<br/>action: status<br/>poll status]
    P2_Status --> P2_Check{Status?}
    P2_Check -->|needs-revision| P2_Update[Update document using user comments as guidance]
    P2_Update --> P2_Create
    P2_Check -->|approved| P2_Clean[approvals<br/>action: delete]
    P2_Clean -->|failed| P2_Status

    %% Phase 3: Tasks
    P2_Clean -->|success| P3_Template[Check user-templates first,<br/>then read template:<br/>tasks-template.md]
    P3_Template --> P3_Break[Convert design to tasks]
    P3_Break --> P3_Create[Create file:<br/>.spec-workflow/specs/{name}/<br/>tasks.md]
    P3_Create --> P3_Approve[approvals<br/>action: request<br/>filePath only]
    P3_Approve --> P3_Status[approvals<br/>action: status<br/>poll status]
    P3_Status --> P3_Check{Status?}
    P3_Check -->|needs-revision| P3_Update[Update document using user comments as guidance]
    P3_Update --> P3_Create
    P3_Check -->|approved| P3_Clean[approvals<br/>action: delete]
    P3_Clean -->|failed| P3_Status

    %% Phase 4: Implementation
    P3_Clean -->|success| P4_Ready[Spec complete.<br/>Ready to implement?]
    P4_Ready -->|Yes| P4_Status[spec-status]
    P4_Status --> P4_Task[Edit tasks.md:<br/>Change [ ] to [-]<br/>for in-progress]
    P4_Task --> P4_Code[Implement code]
    P4_Code --> P4_Log[log-implementation<br/>Record implementation<br/>details]
    P4_Log --> P4_Complete[Edit tasks.md:<br/>Change [-] to [x]<br/>for completed]
    P4_Complete --> P4_More{More tasks?}
    P4_More -->|Yes| P4_Task
    P4_More -->|No| End([Implementation Complete])

    style Start fill:#e1f5e1
    style End fill:#e1f5e1
    style P1_Check fill:#ffe6e6
    style P2_Check fill:#ffe6e6
    style P3_Check fill:#ffe6e6
    style CheckSteering fill:#fff4e6
    style P4_More fill:#fff4e6
    style P4_Log fill:#e3f2fd
\`\`\`

## Spec Workflow

### Phase 1: Requirements
**Purpose**: Define what to build based on user needs.

**File Operations**:
- Read steering docs: \`.spec-workflow/steering/*.md\` (if they exist)
- Check for custom template: \`.spec-workflow/user-templates/requirements-template.md\`
- Read template: \`.spec-workflow/templates/requirements-template.md\` (if no custom template)
- Create document: \`.spec-workflow/specs/{spec-name}/requirements.md\`

**Tools**:
- approvals: Manage approval workflow (actions: request, status, delete)

**Process**:
1. Check if \`.spec-workflow/steering/\` exists (if yes, read product.md, tech.md, structure.md)
2. Check for custom template at \`.spec-workflow/user-templates/requirements-template.md\`
3. If no custom template, read from \`.spec-workflow/templates/requirements-template.md\`
4. Research market/user expectations (if web search available, current year: ${currentYear})
5. Generate requirements as user stories with EARS criteria6. Create \`requirements.md\` at \`.spec-workflow/specs/{spec-name}/requirements.md\`
7. Request approval using approvals tool with action:'request' (filePath only, never content)
8. Poll status using approvals with action:'status' until approved/needs-revision (NEVER accept verbal approval)
9. If needs-revision: update document using comments, create NEW approval, do NOT proceed
10. Once approved: use approvals with action:'delete' (must succeed) before proceeding
11. If delete fails: STOP - return to polling

### Phase 2: Design
**Purpose**: Create technical design addressing all requirements.

**File Operations**:
- Check for custom template: \`.spec-workflow/user-templates/design-template.md\`
- Read template: \`.spec-workflow/templates/design-template.md\` (if no custom template)
- Create document: \`.spec-workflow/specs/{spec-name}/design.md\`

**Tools**:
- approvals: Manage approval workflow (actions: request, status, delete)

**Process**:
1. Check for custom template at \`.spec-workflow/user-templates/design-template.md\`
2. If no custom template, read from \`.spec-workflow/templates/design-template.md\`
3. Analyze codebase for patterns to reuse
4. Research technology choices (if web search available, current year: ${currentYear})
5. Generate design with all template sections6. Create \`design.md\` at \`.spec-workflow/specs/{spec-name}/design.md\`
7. Request approval using approvals tool with action:'request'
8. Poll status using approvals with action:'status' until approved/needs-revision
9. If needs-revision: update document using comments, create NEW approval, do NOT proceed
10. Once approved: use approvals with action:'delete' (must succeed) before proceeding
11. If delete fails: STOP - return to polling

### Phase 3: Tasks
**Purpose**: Break design into atomic implementation tasks.

**File Operations**:
- Check for custom template: \`.spec-workflow/user-templates/tasks-template.md\`
- Read template: \`.spec-workflow/templates/tasks-template.md\` (if no custom template)
- Create document: \`.spec-workflow/specs/{spec-name}/tasks.md\`

**Tools**:
- approvals: Manage approval workflow (actions: request, status, delete)

**Process**:
1. Check for custom template at \`.spec-workflow/user-templates/tasks-template.md\`
2. If no custom template, read from \`.spec-workflow/templates/tasks-template.md\`
3. Convert design into atomic tasks (1-3 files each)
4. Include file paths and requirement references
5. **IMPORTANT**: Generate a _Prompt field for each task with:
   - Role: specialized developer role for the task
   - Task: clear description with context references
   - Restrictions: what not to do, constraints to follow
   - _Leverage: files/utilities to use
   - _Requirements: requirements that the task implements
   - Success: specific completion criteria
   - Instructions related to setting the task in progress in tasks.md, logging the implementation with log-implementation tool after completion, and then marking it as complete when the task is complete.
   - Start the prompt with "Implement the task for spec {spec-name}, first run spec-workflow-guide to get the workflow guide then implement the task:"
6. Create \`tasks.md\` at \`.spec-workflow/specs/{spec-name}/tasks.md\`
7. Request approval using approvals tool with action:'request'
8. Poll status using approvals with action:'status' until approved/needs-revision
9. If needs-revision: update document using comments, create NEW approval, do NOT proceed
10. Once approved: use approvals with action:'delete' (must succeed) before proceeding
11. If delete fails: STOP - return to polling
12. After successful cleanup: "Spec complete. Ready to implement?"

### Phase 4: Implementation
**Purpose**: Execute tasks systematically.

**File Operations**:
- Read specs: \`.spec-workflow/specs/{spec-name}/*.md\` (if returning to work)
- Edit tasks.md to update status:
  - \`- [ ]\` = Pending task
  - \`- [-]\` = In-progress task
  - \`- [x]\` = Completed task

**Tools**:
- spec-status: Check overall progress
- Bash (grep/ripgrep): CRITICAL - Search existing code before implementing (step 3)
- Read: Examine implementation log files directly
- implement-task prompt: Guide for implementing tasks
- log-implementation: Record implementation details with artifacts after task completion (step 5)
- Direct editing: Mark tasks as in-progress [-] or complete [x] in tasks.md

**Process**:
1. Check current status with spec-status
2. Read \`tasks.md\` to see all tasks
3. For each task:
   - Edit tasks.md: Change \`[ ]\` to \`[-]\` for the task you're starting
   - **CRITICAL: BEFORE implementing, search existing implementation logs**:
     - Implementation logs are in: \`.spec-workflow/specs/{spec-name}/Implementation Logs/\`
     - **Option 1: Use grep for fast searches**:
       - \`grep -r "api\|endpoint" .spec-workflow/specs/{spec-name}/Implementation Logs/\` - Find API endpoints
       - \`grep -r "component" .spec-workflow/specs/{spec-name}/Implementation Logs/\` - Find UI components
       - \`grep -r "function" .spec-workflow/specs/{spec-name}/Implementation Logs/\` - Find utility functions
       - \`grep -r "integration" .spec-workflow/specs/{spec-name}/Implementation Logs/\` - Find integration patterns
     - **Option 2: Read markdown files directly** - Use Read tool to examine specific log files
     - Best practice: Search 2-3 different terms to discover comprehensively
     - This prevents: duplicate endpoints, reimplemented components, broken integrations
     - Reuse existing code that already solves part of the task
   - **Read the _Prompt field** for guidance on role, approach, and success criteria
   - Follow _Leverage fields to use existing code/utilities
   - Implement the code according to the task description
   - Test your implementation
   - **Log implementation with detailed artifacts** using log-implementation tool (CRITICAL):
     - Provide taskId and clear summary of what was implemented (1-2 sentences)
     - Include files modified/created and code statistics (lines added/removed)
     - **REQUIRED: Include artifacts field with structured implementation data**:
       - apiEndpoints: All API routes created/modified (method, path, purpose, formats, location)
       - components: All UI components created (name, type, purpose, location, props)
       - functions: All utility functions created (name, signature, location)
       - classes: All classes created (name, methods, location)
       - integrations: Frontend-backend connections with data flow description
     - Example: "Created API GET /api/todos/:id endpoint and TodoDetail React component with WebSocket real-time updates"
     - This creates a searchable knowledge base for future AI agents to discover existing code
     - Prevents implementation details from being lost in chat history
   - Edit tasks.md: Change \`[-]\` to \`[x]\` when completed and logged
4. Continue until all tasks show \`[x]\`

## Workflow Rules

- Create documents directly at specified file paths
- Read templates from \`.spec-workflow/templates/\` directory
- Follow exact template structures
- Get explicit user approval between phases (using approvals tool with action:'request')
- Complete phases in sequence (no skipping)
- One spec at a time
- Use kebab-case for spec names
- Approval requests: provide filePath only, never content
- BLOCKING: Never proceed if approval delete fails
- CRITICAL: Must have approved status AND successful cleanup before next phase
- CRITICAL: Verbal approval is NEVER accepted - dashboard or VS Code extension only
- NEVER proceed on user saying "approved" - check system status only
- Steering docs are optional - only create when explicitly requested

## File Structure
\`\`\`
.spec-workflow/
├── templates/           # Auto-populated on server start
│   ├── requirements-template.md
│   ├── design-template.md
│   ├── tasks-template.md
│   ├── product-template.md
│   ├── tech-template.md
│   └── structure-template.md
├── specs/
│   └── {spec-name}/
│       ├── requirements.md
│       ├── design.md
│       ├── tasks.md
│       └── Implementation Logs/     # Created automatically
│           ├── task-1_timestamp_id.md
│           ├── task-2_timestamp_id.md
│           └── ...
└── steering/
    ├── product.md
    ├── tech.md
    └── structure.md
\`\`\``;
}