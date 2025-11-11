import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { ToolContext, ToolResponse, ImplementationLogEntry } from '../types.js';
import { PathUtils } from '../core/path-utils.js';
import { ImplementationLogManager } from '../dashboard/implementation-log-manager.js';
import { parseTasksFromMarkdown } from '../core/task-parser.js';

export const logImplementationTool: Tool = {
  name: 'log-implementation',
  description: `Record comprehensive implementation details for a completed task.

⚠️ CRITICAL: Artifacts are REQUIRED. This creates a searchable knowledge base that future AI agents use to discover existing code and avoid duplication.

# WHY DETAILED LOGGING MATTERS

Future AI agents (and future you) will use grep/ripgrep to search implementation logs before implementing new tasks. Complete logs prevent:
- ❌ Creating duplicate API endpoints
- ❌ Reimplementing existing components
- ❌ Duplicating utility functions and business logic
- ❌ Breaking established integration patterns

Incomplete logs = Duplicated code = Technical debt

# REQUIRED FIELDS

## artifacts (REQUIRED - Object)

Contains structured data about what was implemented. Must include relevant artifact types:

### apiEndpoints (array of API endpoint objects)
When new API endpoints are created/modified, document:
- method: HTTP method (GET, POST, PUT, DELETE, PATCH)
- path: Route path (e.g., "/api/specs/:name/logs")
- purpose: What this endpoint does
- requestFormat: Request body/query params format (JSON schema or example)
- responseFormat: Response structure (JSON schema or example)
- location: File path and line number (e.g., "src/server.ts:245")

Example:
\`\`\`
{
  "method": "GET",
  "path": "/api/specs/:name/implementation-log",
  "purpose": "Retrieve implementation logs with optional filtering",
  "requestFormat": "Query params: taskId (string, optional), search (string, optional)",
  "responseFormat": "{ entries: ImplementationLogEntry[] }",
  "location": "src/dashboard/server.ts:245"
}
\`\`\`

### components (array of component objects)
When reusable UI components are created, document:
- name: Component name
- type: Framework type (React, Vue, Svelte, etc.)
- purpose: What the component does
- location: File path
- props: Props interface or type signature
- exports: What it exports (array of export names)

Example:
\`\`\`
{
  "name": "LogsPage",
  "type": "React",
  "purpose": "Main dashboard page for viewing implementation logs with search and filtering",
  "location": "src/modules/pages/LogsPage.tsx",
  "props": "{ specs: any[], selectedSpec: string, onSelect: (value: string) => void }",
  "exports": ["LogsPage (default)"]
}
\`\`\`

### functions (array of function objects)
When utility functions are created, document:
- name: Function name
- purpose: What it does
- location: File path and line
- signature: Function signature (params and return type)
- isExported: Whether it can be imported

Example:
\`\`\`
{
  "name": "searchLogs",
  "purpose": "Search implementation logs by keyword",
  "location": "src/dashboard/implementation-log-manager.ts:156",
  "signature": "(searchTerm: string) => Promise<ImplementationLogEntry[]>",
  "isExported": true
}
\`\`\`

### classes (array of class objects)
When classes are created, document:
- name: Class name
- purpose: What the class does
- location: File path
- methods: List of public methods
- isExported: Whether it can be imported

Example:
\`\`\`
{
  "name": "ImplementationLogManager",
  "purpose": "Manages CRUD operations for implementation logs",
  "location": "src/dashboard/implementation-log-manager.ts",
  "methods": ["loadLog", "addLogEntry", "getAllLogs", "searchLogs", "getTaskStats"],
  "isExported": true
}
\`\`\`

### integrations (array of integration objects)
Document how frontend connects to backend:
- description: How components connect to APIs
- frontendComponent: Which component initiates the connection
- backendEndpoint: Which API endpoint is called
- dataFlow: Describe the data flow (e.g., "User clicks → API call → State update → Re-render")

Example:
\`\`\`
{
  "description": "LogsPage fetches logs via REST API and subscribes to WebSocket for real-time updates",
  "frontendComponent": "LogsPage",
  "backendEndpoint": "GET /api/specs/:name/implementation-log",
  "dataFlow": "Component mount → API fetch → Display logs → WebSocket subscription → Real-time updates on new entries"
}
\`\`\`

# GOOD EXAMPLE (Include ALL relevant artifacts)

Task: "Implemented logs dashboard with real-time updates"

\`\`\`json
{
  "taskId": "2.3",
  "summary": "Implemented real-time implementation logs dashboard with filtering, search, and WebSocket updates",
  "artifacts": {
    "apiEndpoints": [
      {
        "method": "GET",
        "path": "/api/specs/:name/implementation-log",
        "purpose": "Retrieve implementation logs with optional filtering",
        "requestFormat": "Query params: taskId (string, optional), search (string, optional)",
        "responseFormat": "{ entries: ImplementationLogEntry[] }",
        "location": "src/dashboard/server.ts:245"
      }
    ],
    "components": [
      {
        "name": "LogsPage",
        "type": "React",
        "purpose": "Main dashboard page for viewing implementation logs with search and filtering",
        "location": "src/modules/pages/LogsPage.tsx",
        "props": "None (uses React Router params)",
        "exports": ["LogsPage (default)"]
      }
    ],
    "classes": [
      {
        "name": "ImplementationLogManager",
        "purpose": "Manages CRUD operations for implementation logs",
        "location": "src/dashboard/implementation-log-manager.ts",
        "methods": ["loadLog", "addLogEntry", "getAllLogs", "searchLogs", "getTaskStats"],
        "isExported": true
      }
    ],
    "integrations": [
      {
        "description": "LogsPage fetches logs via REST API and subscribes to WebSocket for real-time updates",
        "frontendComponent": "LogsPage",
        "backendEndpoint": "GET /api/specs/:name/implementation-log",
        "dataFlow": "Component mount → API fetch → Display logs → WebSocket subscription → Real-time updates on new entries"
      }
    ]
  },
  "filesModified": ["src/dashboard/server.ts"],
  "filesCreated": ["src/modules/pages/LogsPage.tsx"],
  "statistics": { "linesAdded": 650, "linesRemoved": 15, "filesChanged": 2 }
}
\`\`\`

# BAD EXAMPLE (Don't do this)

❌ Empty artifacts - Future agents learn nothing:
\`\`\`json
{
  "taskId": "2.3",
  "summary": "Added endpoint and page",
  "artifacts": {},
  "filesModified": ["server.ts"],
  "filesCreated": ["LogsPage.tsx"]
}
\`\`\`

❌ Vague summary with no structured data:
\`\`\`json
{
  "taskId": "2.3",
  "summary": "Implemented features",
  "artifacts": {},
  "filesModified": ["server.ts", "app.tsx"]
}
\`\`\`

# Instructions

1. After completing a task, review what you implemented
2. Identify all artifacts (APIs, components, functions, classes, integrations)
3. Document each with full details and locations
4. Include ALL the information - be thorough!
5. Future agents depend on this data quality`,
  inputSchema: {
    type: 'object',
    properties: {
      projectPath: {
        type: 'string',
        description: 'Absolute path to the project root (optional - uses server context path if not provided)'
      },
      specName: {
        type: 'string',
        description: 'Name of the specification'
      },
      taskId: {
        type: 'string',
        description: 'Task ID (e.g., "1", "1.2", "3.1.4")'
      },
      summary: {
        type: 'string',
        description: 'Brief summary of what was implemented'
      },
      filesModified: {
        type: 'array',
        items: { type: 'string' },
        description: 'List of files that were modified'
      },
      filesCreated: {
        type: 'array',
        items: { type: 'string' },
        description: 'List of files that were created'
      },
      statistics: {
        type: 'object',
        properties: {
          linesAdded: {
            type: 'number',
            description: 'Number of lines added'
          },
          linesRemoved: {
            type: 'number',
            description: 'Number of lines removed'
          }
        },
        required: ['linesAdded', 'linesRemoved'],
        description: 'Code statistics for the implementation'
      },
      artifacts: {
        type: 'object',
        description: 'REQUIRED: Structured data about implemented artifacts (APIs, components, functions, classes, integrations). See tool description for detailed format.',
        properties: {
          apiEndpoints: {
            type: 'array',
            description: 'API endpoints created or modified',
            items: { type: 'object' }
          },
          components: {
            type: 'array',
            description: 'Reusable UI components created',
            items: { type: 'object' }
          },
          functions: {
            type: 'array',
            description: 'Utility functions or methods created',
            items: { type: 'object' }
          },
          classes: {
            type: 'array',
            description: 'Classes created',
            items: { type: 'object' }
          },
          integrations: {
            type: 'array',
            description: 'Frontend-backend integration patterns',
            items: { type: 'object' }
          }
        }
      }
    },
    required: ['specName', 'taskId', 'summary', 'filesModified', 'filesCreated', 'statistics', 'artifacts']
  }
};

export async function logImplementationHandler(
  args: any,
  context: ToolContext
): Promise<ToolResponse> {
  const {
    specName,
    taskId,
    summary,
    filesModified = [],
    filesCreated = [],
    statistics,
    artifacts
  } = args;
  
  // Use context projectPath as default, allow override via args
  const projectPath = args.projectPath || context.projectPath;
  
  if (!projectPath) {
    return {
      success: false,
      message: 'Project path is required but not provided in context or arguments'
    };
  }

  try {
    // Validate artifacts is provided
    if (!artifacts) {
      return {
        success: false,
        message: 'Artifacts field is REQUIRED. See tool description for detailed artifact format and examples.',
        nextSteps: [
          'Review the log-implementation tool description for artifact structure',
          'Document all API endpoints, components, functions, classes, and integrations',
          'Provide structured artifact data before calling this tool',
          'Ensure artifacts contains at least one of: apiEndpoints, components, functions, classes, or integrations'
        ]
      };
    }

    // Validate task exists
    const specTasksPath = PathUtils.getSpecPath(projectPath, specName);
    const tasksFile = `${specTasksPath}/tasks.md`;

    try {
      const { promises: fs } = await import('fs');
      const tasksContent = await fs.readFile(tasksFile, 'utf-8');
      const parseResult = parseTasksFromMarkdown(tasksContent);
      const taskExists = parseResult.tasks.some(t => t.id === taskId);

      if (!taskExists) {
        return {
          success: false,
          message: `Task '${taskId}' not found in specification '${specName}'`,
          nextSteps: [
            `Check the task ID in .spec-workflow/specs/${specName}/tasks.md`,
            'Verify the spec name is correct',
            'Use spec-status to see available tasks'
          ]
        };
      }
    } catch (parseError) {
      return {
        success: false,
        message: `Failed to validate task: ${parseError instanceof Error ? parseError.message : String(parseError)}`,
        nextSteps: [
          `Check that .spec-workflow/specs/${specName}/tasks.md exists`,
          'Verify the tasks file is valid markdown',
          'Use spec-status to diagnose issues'
        ]
      };
    }

    // Create log entry
    const logManager = new ImplementationLogManager(specTasksPath);

    const logEntry: Omit<ImplementationLogEntry, 'id'> = {
      taskId,
      timestamp: new Date().toISOString(),
      summary,
      filesModified: filesModified || [],
      filesCreated: filesCreated || [],
      statistics: {
        linesAdded: statistics.linesAdded || 0,
        linesRemoved: statistics.linesRemoved || 0,
        filesChanged: (filesModified?.length || 0) + (filesCreated?.length || 0)
      },
      artifacts
    };

    const createdEntry = await logManager.addLogEntry(logEntry);

    // Get task stats
    const taskStats = await logManager.getTaskStats(taskId);

    return {
      success: true,
      message: `Implementation logged for task '${taskId}'`,
      data: {
        entryId: createdEntry.id,
        entry: createdEntry,
        taskStats,
        dashboardUrl: `${context.dashboardUrl}/logs?spec=${encodeURIComponent(specName)}&task=${taskId}`
      },
      nextSteps: [
        'Mark task as completed in tasks.md by changing [-] to [x]',
        'View implementation log in dashboard under Logs tab',
        'Continue with next pending task'
      ],
      projectContext: {
        projectPath,
        workflowRoot: PathUtils.getWorkflowRoot(projectPath),
        specName,
        dashboardUrl: context.dashboardUrl
      }
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      message: `Failed to log implementation: ${errorMessage}`,
      nextSteps: [
        'Verify all required parameters are provided',
        'Check that the spec and task exist',
        'View dashboard logs to see previous entries'
      ]
    };
  }
}
