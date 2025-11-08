# Developer Workflow Guide

> **Quick Start**: Clone → `npm install` → `npm run dev` → Start building!

## 🚀 Development Setup

### Prerequisites
```bash
# Required
node >= 18.0.0
npm >= 9.0.0

# Optional (for VS Code extension)
VS Code >= 1.74.0
```

### Initial Setup
```bash
# Clone the repository
git clone <repository-url>
cd spec-workflow-mcp

# Install dependencies
npm install

# Install VS Code extension dependencies (optional)
cd vscode-extension
npm install
cd ..

# Build everything
npm run build
```

### Development Commands
```bash
# Start MCP server in development mode
npm run dev

# Start dashboard in development mode  
npm run dev:dashboard

# Build for production
npm run build

# Clean build artifacts
npm run clean

# Run tests (when available)
npm test
```

## 🛠️ Development Workflows

### Adding a New MCP Tool

#### 1. Create Tool Definition
```bash
# Create new tool file
touch src/tools/my-new-tool.ts
```

```typescript
// src/tools/my-new-tool.ts
import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { ToolContext, ToolResponse } from '../types.js';

export const myNewToolTool: Tool = {
  name: 'my-new-tool',
  description: `Brief description of what this tool does.

# Instructions
Clear instructions on when and how to use this tool.`,
  inputSchema: {
    type: 'object',
    properties: {
      projectPath: { 
        type: 'string',
        description: 'Absolute path to the project root'
      },
      // Add other parameters
      param1: {
        type: 'string',
        description: 'Description of parameter'
      }
    },
    required: ['projectPath']
  }
};

export async function myNewToolHandler(
  args: any, 
  context: ToolContext
): Promise<ToolResponse> {
  const { projectPath, param1 } = args;

  try {
    // Implementation here
    
    return {
      success: true,
      message: 'Tool executed successfully',
      data: {
        // Response data
      },
      nextSteps: [
        'What user should do next',
        'Additional guidance'
      ]
    };
  } catch (error: any) {
    return {
      success: false,
      message: `Tool failed: ${error.message}`,
      nextSteps: [
        'Check input parameters',
        'Verify file permissions'
      ]
    };
  }
}
```

#### 2. Register Tool
```typescript
// src/tools/index.ts
import { myNewToolTool, myNewToolHandler } from './my-new-tool.js';

export function registerTools(): Tool[] {
  return [
    // ... existing tools
    myNewToolTool
  ];
}

export async function handleToolCall(name: string, args: any, context: ToolContext): Promise<MCPToolResponse> {
  switch (name) {
    // ... existing cases
    case 'my-new-tool':
      response = await myNewToolHandler(args, context);
      break;
  }
}
```

#### 3. Test the Tool
```bash
# Start development server
npm run dev

# Test in AI client or dashboard
```

#### 4. Add Documentation
```typescript
// Update api-reference.md with tool documentation
```

### Modifying the Dashboard

#### Frontend Development
```bash
# Start dashboard development server
npm run dev:dashboard

# Opens at http://localhost:5173
# Hot reload enabled for rapid development
```

#### Adding a New Page
```typescript
// src/dashboard_frontend/src/modules/pages/MyNewPage.tsx
import React from 'react';

export default function MyNewPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">My New Page</h1>
      {/* Page content */}
    </div>
  );
}
```

```typescript
// src/dashboard_frontend/src/modules/app/App.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MyNewPage from '../pages/MyNewPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/my-page" element={<MyNewPage />} />
        {/* Other routes */}
      </Routes>
    </Router>
  );
}
```

#### Adding Backend API Endpoint
```typescript
// src/dashboard/multi-server.ts
export class MultiProjectDashboardServer {
  private async setupRoutes() {
    // Add new project-scoped endpoint
    this.app.get('/api/projects/:projectId/my-endpoint', async (request, reply) => {
      try {
        const { projectId } = request.params as { projectId: string };
        const project = this.projectManager.getProject(projectId);
        if (!project) {
          return reply.code(404).send({ error: 'Project not found' });
        }
        const data = await this.getMyData(project);
        reply.send({ success: true, data });
      } catch (error) {
        reply.status(500).send({ success: false, error: error.message });
      }
    });
  }

  private async getMyData(project: Project) {
    // Implementation
  }
}
```

### Working with VS Code Extension

#### Development Setup
```bash
cd vscode-extension
npm install

# Open in VS Code
code .

# Press F5 to launch Extension Development Host
```

#### Extension Structure
```
vscode-extension/
├── src/
│   ├── extension.ts           # Main extension entry
│   ├── extension/
│   │   ├── providers/         # View providers
│   │   ├── services/          # Business logic  
│   │   └── utils/            # Helper functions
│   └── webview/              # Webview components
├── package.json              # Extension manifest
└── README.md                # Extension documentation
```

#### Adding New Command
```typescript
// src/extension.ts
export function activate(context: vscode.ExtensionContext) {
  const myCommand = vscode.commands.registerCommand(
    'spec-workflow.myCommand',
    async () => {
      // Command implementation
      vscode.window.showInformationMessage('My command executed!');
    }
  );

  context.subscriptions.push(myCommand);
}
```

```json
// package.json
{
  "contributes": {
    "commands": [
      {
        "command": "spec-workflow.myCommand",
        "title": "My Command",
        "category": "Spec Workflow"
      }
    ]
  }
}
```

## 🧪 Testing Strategy

### Unit Testing (Future)
```bash
# Test structure (to be implemented)
src/
├── __tests__/
│   ├── tools/
│   ├── core/
│   └── dashboard/
```

### Integration Testing
```bash
# Manual testing workflow
1. Start MCP server: npm run dev
2. Connect AI client
3. Test tool workflows
4. Verify dashboard updates
```

### Dashboard Testing
```bash
# Start dashboard in development
npm run dev:dashboard

# Test scenarios
1. Create specifications
2. Approval workflow
3. Real-time updates
4. File watching
```

## 📁 Project Structure

### Core MCP Server
```
src/
├── core/                     # Core business logic
│   ├── archive-service.ts    # Spec archiving
│   ├── parser.ts            # Spec parsing
│   ├── path-utils.ts        # Cross-platform paths
│   ├── session-manager.ts   # Session tracking
│   └── task-parser.ts       # Task management
├── tools/                   # MCP tool implementations
│   ├── index.ts            # Tool registry
│   ├── spec-*.ts           # Spec management tools
│   ├── create-*.ts         # Document creation
│   ├── get-*.ts            # Context loading
│   ├── manage-*.ts         # Status management
│   └── *-approval.ts       # Approval workflow
├── dashboard/              # Dashboard backend
│   ├── server.ts          # Fastify server
│   ├── approval-storage.ts # Approval persistence
│   ├── parser.ts          # Dashboard-specific parsing
│   ├── watcher.ts         # File system watching
│   └── utils.ts           # Dashboard utilities
├── markdown/              # Template system
│   └── templates/         # Document templates
├── server.ts             # Main MCP server
├── index.ts              # CLI entry point
└── types.ts              # TypeScript definitions
```

### Dashboard Frontend
```
src/dashboard_frontend/src/
├── modules/
│   ├── api/              # API communication
│   ├── app/              # Main app component
│   ├── approvals/        # Approval UI components
│   ├── editor/           # Markdown editing
│   ├── markdown/         # Markdown rendering
│   ├── modals/           # Modal dialogs
│   ├── notifications/    # Toast notifications
│   ├── pages/            # Main page components
│   ├── theme/            # Styling and themes
│   └── ws/               # WebSocket integration
├── main.tsx              # React entry point
└── App.tsx               # Root component
```

## 🔧 Development Best Practices

### Tool Development Guidelines

#### 1. Input Validation
```typescript
// Always validate inputs
export async function myToolHandler(args: any, context: ToolContext): Promise<ToolResponse> {
  const { projectPath, requiredParam } = args;
  
  if (!projectPath) {
    return {
      success: false,
      message: 'projectPath is required',
      nextSteps: ['Provide absolute path to project root']
    };
  }
  
  if (!requiredParam) {
    return {
      success: false,
      message: 'requiredParam is required',
      nextSteps: ['Provide required parameter']
    };
  }
  
  // Continue with implementation
}
```

#### 2. Error Handling
```typescript
try {
  // Tool implementation
} catch (error: any) {
  return {
    success: false,
    message: `Operation failed: ${error.message}`,
    nextSteps: [
      'Check input parameters',
      'Verify file permissions',
      'Contact support if issue persists'
    ]
  };
}
```

#### 3. Consistent Response Format
```typescript
interface ToolResponse {
  success: boolean;
  message: string;           // Human-readable status
  data?: any;               // Response data (optional)
  nextSteps?: string[];     // What to do next (optional)
  projectContext?: {        // Project context (optional)
    projectPath: string;
    workflowRoot: string;
    dashboardUrl?: string;
  };
}
```

#### 4. Path Handling
```typescript
import { PathUtils } from '../core/path-utils.js';

// Always use PathUtils for cross-platform compatibility
const specPath = PathUtils.getSpecPath(projectPath, specName);
const relativePath = PathUtils.toUnixPath(filePath);
```

### Dashboard Development

#### 1. State Management
```typescript
// Use React hooks for local state
const [specs, setSpecs] = useState<SpecData[]>([]);

// Use WebSocket for real-time updates
useEffect(() => {
  if (wsMessage?.type === 'specs-updated') {
    setSpecs(wsMessage.data);
  }
}, [wsMessage]);
```

#### 2. API Integration
```typescript
// src/dashboard_frontend/src/modules/api/api.tsx
export const api = {
  async getSpecs(): Promise<SpecData[]> {
    const response = await fetch('/api/specs');
    return response.json();
  },
  
  async updateSpec(specName: string, data: Partial<SpecData>): Promise<void> {
    await fetch(`/api/specs/${specName}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  }
};
```

#### 3. Component Structure
```typescript
// Functional components with TypeScript
interface MyComponentProps {
  specs: SpecData[];
  onSpecUpdate: (spec: SpecData) => void;
}

export default function MyComponent({ specs, onSpecUpdate }: MyComponentProps) {
  return (
    <div className="p-4">
      {specs.map(spec => (
        <div key={spec.name} className="mb-2">
          {spec.name}
        </div>
      ))}
    </div>
  );
}
```

## 🐛 Debugging

### MCP Server Debugging
```bash
# Enable debug logging
DEBUG=spec-workflow-mcp npm run dev

# Check MCP protocol messages
# Use MCP client debug modes
```

### Dashboard Debugging  
```bash
# Browser DevTools
# Check Network tab for API calls
# Check Console for JavaScript errors
# Check WebSocket connection in Network tab
```

### File System Issues
```bash
# Check file permissions
ls -la .spec-workflow/

# Check directory structure
tree .spec-workflow/

# Monitor file changes
# Use file watcher debug logs
```

## 📦 Build and Deployment

### Building for Production
```bash
# Clean previous builds
npm run clean

# Build everything
npm run build

# Verify build output
ls -la dist/
```

### Publishing to NPM
```bash
# Update version in package.json
npm version patch|minor|major

# Build and publish
npm run build
npm publish
```

### VS Code Extension Publishing
```bash
cd vscode-extension

# Install VSCE
npm install -g @vscode/vsce

# Package extension
vsce package

# Publish to marketplace
vsce publish
```

---

**Next**: [Context Management →](context-management.md)