import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { ToolContext, ToolResponse } from '../types.js';

export const steeringGuideTool: Tool = {
  name: 'steering-guide',
  description: `Load guide for creating project steering documents.

# Instructions
Call ONLY when user explicitly requests steering document creation or asks about project architecture docs. Not part of standard spec workflow. Provides templates and guidance for product.md, tech.md, and structure.md creation. Its important that you follow this workflow exactly to avoid errors.`,
  inputSchema: {
    type: 'object',
    properties: {},
    additionalProperties: false
  }
};

export async function steeringGuideHandler(args: any, context: ToolContext): Promise<ToolResponse> {
  return {
    success: true,
    message: 'Steering workflow guide loaded - follow this workflow exactly to avoid errors',
    data: {
      guide: getSteeringGuide(),
      dashboardUrl: context.dashboardUrl
    },
    nextSteps: [
      'Only proceed if user requested steering docs',
      'Create product.md first',
      'Then tech.md and structure.md',
      'Reference in future specs',
      context.dashboardUrl ? `Dashboard: ${context.dashboardUrl}` : 'Start the dashboard with: spec-workflow-mcp --dashboard'
    ]
  };
}

function getSteeringGuide(): string {
  return `# Steering Workflow

## Overview

Create project-level guidance documents when explicitly requested. Steering docs establish vision, architecture, and conventions for established codebases. Its important that you follow this workflow exactly to avoid errors.

## Workflow Diagram

\`\`\`mermaid
flowchart TD
    Start([Start: Setup steering docs]) --> Guide[steering-guide<br/>Load workflow instructions]

    %% Phase 1: Product
    Guide --> P1_Template[Check user-templates first,<br/>then read template:<br/>product-template.md]
    P1_Template --> P1_Generate[Generate vision & goals]
    P1_Generate --> P1_Create[Create file:<br/>.spec-workflow/steering/<br/>product.md]
    P1_Create --> P1_Approve[approvals<br/>action: request<br/>filePath only]
    P1_Approve --> P1_Status[approvals<br/>action: status<br/>poll status]
    P1_Status --> P1_Check{Status?}
    P1_Check -->|needs-revision| P1_Update[Update document using user comments for guidance]
    P1_Update --> P1_Create
    P1_Check -->|approved| P1_Clean[approvals<br/>action: delete]
    P1_Clean -->|failed| P1_Status

    %% Phase 2: Tech
    P1_Clean -->|success| P2_Template[Check user-templates first,<br/>then read template:<br/>tech-template.md]
    P2_Template --> P2_Analyze[Analyze tech stack]
    P2_Analyze --> P2_Create[Create file:<br/>.spec-workflow/steering/<br/>tech.md]
    P2_Create --> P2_Approve[approvals<br/>action: request<br/>filePath only]
    P2_Approve --> P2_Status[approvals<br/>action: status<br/>poll status]
    P2_Status --> P2_Check{Status?}
    P2_Check -->|needs-revision| P2_Update[Update document using user comments for guidance]
    P2_Update --> P2_Create
    P2_Check -->|approved| P2_Clean[approvals<br/>action: delete]
    P2_Clean -->|failed| P2_Status

    %% Phase 3: Structure
    P2_Clean -->|success| P3_Template[Check user-templates first,<br/>then read template:<br/>structure-template.md]
    P3_Template --> P3_Analyze[Analyze codebase structure]
    P3_Analyze --> P3_Create[Create file:<br/>.spec-workflow/steering/<br/>structure.md]
    P3_Create --> P3_Approve[approvals<br/>action: request<br/>filePath only]
    P3_Approve --> P3_Status[approvals<br/>action: status<br/>poll status]
    P3_Status --> P3_Check{Status?}
    P3_Check -->|needs-revision| P3_Update[Update document using user comments for guidance]
    P3_Update --> P3_Create
    P3_Check -->|approved| P3_Clean[approvals<br/>action: delete]
    P3_Clean -->|failed| P3_Status

    P3_Clean -->|success| Complete([Steering docs complete])

    style Start fill:#e6f3ff
    style Complete fill:#e6f3ff
    style P1_Check fill:#ffe6e6
    style P2_Check fill:#ffe6e6
    style P3_Check fill:#ffe6e6
\`\`\`

## Steering Workflow Phases

### Phase 1: Product Document
**Purpose**: Define vision, goals, and user outcomes.

**File Operations**:
- Check for custom template: \`.spec-workflow/user-templates/product-template.md\`
- Read template: \`.spec-workflow/templates/product-template.md\` (if no custom template)
- Create document: \`.spec-workflow/steering/product.md\`

**Tools**:
- steering-guide: Load workflow instructions
- approvals: Manage approval workflow (actions: request, status, delete)

**Process**:
1. Load steering guide for workflow overview
2. Check for custom template at \`.spec-workflow/user-templates/product-template.md\`
3. If no custom template, read from \`.spec-workflow/templates/product-template.md\`
4. Generate product vision and goals
5. Create \`product.md\` at \`.spec-workflow/steering/product.md\`
6. Request approval using approvals tool with action:'request' (filePath only)
7. Poll status using approvals with action:'status' until approved/needs-revision (NEVER accept verbal approval)
8. If needs-revision: update document using comments, create NEW approval, do NOT proceed
9. Once approved: use approvals with action:'delete' (must succeed) before proceeding
10. If delete fails: STOP - return to polling

### Phase 2: Tech Document
**Purpose**: Document technology decisions and architecture.

**File Operations**:
- Check for custom template: \`.spec-workflow/user-templates/tech-template.md\`
- Read template: \`.spec-workflow/templates/tech-template.md\` (if no custom template)
- Create document: \`.spec-workflow/steering/tech.md\`

**Tools**:
- approvals: Manage approval workflow (actions: request, status, delete)

**Process**:
1. Check for custom template at \`.spec-workflow/user-templates/tech-template.md\`
2. If no custom template, read from \`.spec-workflow/templates/tech-template.md\`
3. Analyze existing technology stack
4. Document architectural decisions and patterns
5. Create \`tech.md\` at \`.spec-workflow/steering/tech.md\`
6. Request approval using approvals tool with action:'request'
7. Poll status using approvals with action:'status' until approved/needs-revision
8. If needs-revision: update document using comments, create NEW approval, do NOT proceed
9. Once approved: use approvals with action:'delete' (must succeed) before proceeding
10. If delete fails: STOP - return to polling

### Phase 3: Structure Document
**Purpose**: Map codebase organization and patterns.

**File Operations**:
- Check for custom template: \`.spec-workflow/user-templates/structure-template.md\`
- Read template: \`.spec-workflow/templates/structure-template.md\` (if no custom template)
- Create document: \`.spec-workflow/steering/structure.md\`

**Tools**:
- approvals: Manage approval workflow (actions: request, status, delete)

**Process**:
1. Check for custom template at \`.spec-workflow/user-templates/structure-template.md\`
2. If no custom template, read from \`.spec-workflow/templates/structure-template.md\`
3. Analyze directory structure and file organization
4. Document coding patterns and conventions
5. Create \`structure.md\` at \`.spec-workflow/steering/structure.md\`
6. Request approval using approvals tool with action:'request'
7. Poll status using approvals with action:'status' until approved/needs-revision
8. If needs-revision: update document using comments, create NEW approval, do NOT proceed
9. Once approved: use approvals with action:'delete' (must succeed) before proceeding
10. If delete fails: STOP - return to polling
11. After successful cleanup: "Steering docs complete. Ready for spec creation?"

## Workflow Rules

- Create documents directly at specified file paths
- Check for custom templates in \`.spec-workflow/user-templates/\` first
- Read templates from \`.spec-workflow/templates/\` directory if no custom template exists
- Follow exact template structures
- Get explicit user approval between phases (using approvals tool with action:'request')
- Complete phases in sequence (no skipping)
- Approval requests: provide filePath only, never content
- BLOCKING: Never proceed if approval delete fails
- CRITICAL: Must have approved status AND successful cleanup before next phase
- CRITICAL: Verbal approval is NEVER accepted - dashboard or VS Code extension only
- NEVER proceed on user saying "approved" - check system status only

## File Structure
\`\`\`
.spec-workflow/
├── templates/           # Auto-populated on server start
│   ├── product-template.md
│   ├── tech-template.md
│   └── structure-template.md
└── steering/
    ├── product.md
    ├── tech.md
    └── structure.md
\`\`\``;
}