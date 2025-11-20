# Tools Reference

Complete documentation for all MCP tools provided by Spec Workflow MCP.

## Overview

Spec Workflow MCP provides specialized tools for structured software development. These tools are accessible to AI assistants through the Model Context Protocol.

## Tool Categories

1. **Workflow Guides** - Documentation and guidance
2. **Spec Management** - Create and manage specifications
3. **Context Tools** - Retrieve project information
4. **Steering Tools** - Project-level guidance
5. **Approval Tools** - Document approval workflow

## Workflow Guide Tools

### spec-workflow-guide

**Purpose**: Provides comprehensive guidance for the spec-driven workflow process.

**Parameters**: None

**Returns**: Markdown guide explaining the complete workflow

**Usage Example**:
```
"Show me the spec workflow guide"
```

**Response Contains**:
- Workflow overview
- Step-by-step process
- Best practices
- Example prompts

### steering-guide

**Purpose**: Guide for creating project steering documents.

**Parameters**: None

**Returns**: Markdown guide for steering document creation

**Usage Example**:
```
"Show me how to create steering documents"
```

**Response Contains**:
- Steering document types
- Creation process
- Content guidelines
- Examples

## Spec Management Tools

### create-spec-doc

**Purpose**: Creates or updates specification documents (requirements, design, tasks).

**Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| specName | string | Yes | Name of the spec (kebab-case) |
| docType | string | Yes | Type: "requirements", "design", or "tasks" |
| content | string | Yes | Markdown content of the document |
| revision | boolean | No | Whether this is a revision (default: false) |

**Usage Example**:
```typescript
{
  specName: "user-authentication",
  docType: "requirements",
  content: "# User Authentication Requirements\n\n## Overview\n...",
  revision: false
}
```

**Returns**:
```typescript
{
  success: true,
  message: "Requirements document created successfully",
  path: ".spec-workflow/specs/user-authentication/requirements.md",
  requestedApproval: true
}
```

**Notes**:
- Creates spec directory if it doesn't exist
- Automatically requests approval for new documents
- Validates markdown format
- Preserves existing documents when creating new types

### spec-list

**Purpose**: Lists all specifications with their current status.

**Parameters**: None

**Returns**: Array of spec summaries

**Response Structure**:
```typescript
[
  {
    name: "user-authentication",
    status: "in-progress",
    progress: 45,
    documents: {
      requirements: "approved",
      design: "pending-approval",
      tasks: "not-created"
    },
    taskStats: {
      total: 15,
      completed: 7,
      inProgress: 1,
      pending: 7
    }
  }
]
```

**Usage Example**:
```
"List all my specs"
```

### spec-status

**Purpose**: Gets detailed status information for a specific spec.

**Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| specName | string | Yes | Name of the spec to check |

**Returns**: Detailed spec status

**Response Structure**:
```typescript
{
  exists: true,
  name: "user-authentication",
  documents: {
    requirements: {
      exists: true,
      approved: true,
      lastModified: "2024-01-15T10:30:00Z",
      size: 4523
    },
    design: {
      exists: true,
      approved: false,
      pendingApproval: true,
      lastModified: "2024-01-15T14:20:00Z",
      size: 6234
    },
    tasks: {
      exists: true,
      taskCount: 15,
      completedCount: 7,
      inProgressCount: 1,
      progress: 45
    }
  },
  overallProgress: 45,
  currentPhase: "implementation"
}
```

**Usage Example**:
```
"Show me the status of user-authentication spec"
```

### manage-tasks

**Purpose**: Comprehensive task management including updates, status changes, and progress tracking.

**Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| specName | string | Yes | Name of the spec |
| action | string | Yes | Action: "update", "complete", "list", "progress" |
| taskId | string | Sometimes | Task ID (required for update/complete) |
| status | string | No | New status: "pending", "in-progress", "completed" |
| notes | string | No | Additional notes for the task |

**Actions**:

1. **Update Task Status**:
```typescript
{
  specName: "user-auth",
  action: "update",
  taskId: "1.2.1",
  status: "in-progress",
  notes: "Started implementation"
}
```

2. **Complete Task**:
```typescript
{
  specName: "user-auth",
  action: "complete",
  taskId: "1.2.1"
}
```

3. **List Tasks**:
```typescript
{
  specName: "user-auth",
  action: "list"
}
```

4. **Get Progress**:
```typescript
{
  specName: "user-auth",
  action: "progress"
}
```

**Returns**: Task information or update confirmation

## Context Tools

### get-template-context

**Purpose**: Retrieves markdown templates for all document types.

**Parameters**: None

**Returns**: Object containing all templates

**Response Structure**:
```typescript
{
  requirements: "# Requirements Template\n\n## Overview\n...",
  design: "# Design Template\n\n## Architecture\n...",
  tasks: "# Tasks Template\n\n## Implementation Tasks\n...",
  product: "# Product Steering Template\n...",
  tech: "# Technical Steering Template\n...",
  structure: "# Structure Steering Template\n..."
}
```

**Usage Example**:
```
"Get all document templates"
```

### get-steering-context

**Purpose**: Retrieves project steering documents and guidance.

**Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| docType | string | No | Specific doc: "product", "tech", "structure", or "all" |

**Returns**: Steering document content

**Usage Example**:
```typescript
{
  docType: "tech"  // Returns only technical steering
}
```

**Response Structure**:
```typescript
{
  product: "# Product Steering\n\n## Vision\n...",
  tech: "# Technical Steering\n\n## Architecture\n...",
  structure: "# Structure Steering\n\n## Organization\n..."
}
```

### get-spec-context

**Purpose**: Retrieves complete context for a specific spec.

**Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| specName | string | Yes | Name of the spec |
| includeContent | boolean | No | Include document content (default: true) |

**Returns**: Complete spec context

**Response Structure**:
```typescript
{
  name: "user-authentication",
  exists: true,
  documents: {
    requirements: {
      exists: true,
      content: "# Requirements\n\n...",
      approved: true
    },
    design: {
      exists: true,
      content: "# Design\n\n...",
      approved: false
    },
    tasks: {
      exists: true,
      content: "# Tasks\n\n...",
      stats: {
        total: 15,
        completed: 7,
        progress: 45
      }
    }
  },
  relatedSpecs: ["user-profile", "session-management"],
  dependencies: ["database-setup", "auth-library"]
}
```

**Usage Example**:
```
"Get full context for user-authentication spec"
```

## Steering Document Tools

### create-steering-doc

**Purpose**: Creates project steering documents (product, tech, structure).

**Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| docType | string | Yes | Type: "product", "tech", or "structure" |
| content | string | Yes | Markdown content of the document |

**Usage Example**:
```typescript
{
  docType: "product",
  content: "# Product Steering\n\n## Vision\nBuild the best..."
}
```

**Returns**:
```typescript
{
  success: true,
  message: "Product steering document created",
  path: ".spec-workflow/steering/product.md"
}
```

**Notes**:
- Creates steering directory if needed
- Overwrites existing steering documents
- No approval required for steering docs
- Should be created before specs

## Approval System Tools

### request-approval

**Purpose**: Requests user approval for a document.

**Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| specName | string | Yes | Name of the spec |
| docType | string | Yes | Document type to approve |
| documentId | string | Yes | Unique ID for tracking |
| content | string | Yes | Document content for review |

**Usage Example**:
```typescript
{
  specName: "user-auth",
  docType: "requirements",
  documentId: "user-auth-req-v1",
  content: "# Requirements\n\n..."
}
```

**Returns**:
```typescript
{
  success: true,
  approvalId: "user-auth-req-v1",
  message: "Approval requested. Check dashboard to review."
}
```

### get-approval-status

**Purpose**: Checks the approval status of a document.

**Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| specName | string | Yes | Name of the spec |
| documentId | string | Yes | Document ID to check |

**Returns**:
```typescript
{
  exists: true,
  status: "pending" | "approved" | "rejected" | "changes-requested",
  feedback: "Please add more detail about error handling",
  timestamp: "2024-01-15T10:30:00Z",
  reviewer: "user"
}
```

**Usage Example**:
```
"Check approval status for user-auth requirements"
```

### delete-approval

**Purpose**: Removes completed, rejected, or needs-revision approval requests to clean up the approval queue. Cannot delete pending approvals.

**Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| specName | string | Yes | Name of the spec |
| documentId | string | Yes | Document ID to remove |

**Returns**:
```typescript
{
  success: true,
  message: "Approval record deleted"
}
```

**Usage Example**:
```
"Clean up completed approvals for user-auth"
```

## Tool Integration Patterns

### Sequential Workflow

Tools are designed to work in sequence:

1. `steering-guide` → Learn about steering
2. `create-steering-doc` → Create steering documents
3. `spec-workflow-guide` → Learn workflow
4. `create-spec-doc` → Create requirements
5. `request-approval` → Request review
6. `get-approval-status` → Check status
7. `create-spec-doc` → Create design (after approval)
8. `manage-tasks` → Track implementation

### Parallel Operations

Some tools can be used simultaneously:

- `spec-list` + `spec-status` → Get overview and details
- `get-spec-context` + `get-steering-context` → Full project context
- Multiple `create-spec-doc` → Create multiple specs

### Error Handling

All tools return consistent error structures:

```typescript
{
  success: false,
  error: "Spec not found",
  details: "No spec named 'invalid-spec' exists",
  suggestion: "Use spec-list to see available specs"
}
```

## Best Practices

### Tool Selection

1. **Information Gathering**:
   - Use `spec-list` for overview
   - Use `spec-status` for specific spec
   - Use `get-spec-context` for implementation

2. **Document Creation**:
   - Always create requirements first
   - Wait for approval before design
   - Create tasks after design approval

3. **Task Management**:
   - Update status when starting tasks
   - Mark complete immediately after finishing
   - Use notes for important context

### Performance Considerations

- **Batch Operations**: Request multiple specs in one conversation
- **Caching**: Tools cache file reads for performance
- **Selective Loading**: Use `includeContent: false` for faster status checks

### Security

- **Path Validation**: All paths are validated and sanitized
- **Project Isolation**: Tools only access project directory
- **Input Sanitization**: Markdown content is sanitized
- **No Execution**: Tools never execute code

## Extending Tools

### Custom Tool Development

To add new tools:

1. Create tool module in `src/tools/`
2. Define parameters schema
3. Implement handler function
4. Register with MCP server
5. Add to exports

Example structure:
```typescript
export const customTool = {
  name: 'custom-tool',
  description: 'Description',
  parameters: {
    // JSON Schema
  },
  handler: async (params) => {
    // Implementation
  }
};
```

## Tool Versioning

Tools maintain backward compatibility:

- Parameter additions are optional
- Response structures extend, not replace
- Deprecated features show warnings
- Migration guides provided

## Related Documentation

- [User Guide](USER-GUIDE.md) - Using tools effectively
- [Workflow Process](WORKFLOW.md) - Tool usage in workflow
- [Prompting Guide](PROMPTING-GUIDE.md) - Example tool usage
- [Development Guide](DEVELOPMENT.md) - Adding new tools