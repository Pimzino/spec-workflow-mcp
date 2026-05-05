# Development Guide

This guide covers setting up a development environment, building the project, contributing code, and understanding the architecture of Spec Workflow MCP.

## Prerequisites

### Required Software

- **Node.js** 18.0 or higher
- **npm** 9.0 or higher
- **Git** for version control
- **TypeScript** knowledge helpful

### Recommended Tools

- **VSCode** with TypeScript extensions
- **Chrome/Edge DevTools** for dashboard debugging
- **Postman/Insomnia** for API testing

## Setting Up Development Environment

### 1. Clone the Repository

```bash
git clone https://github.com/Pimzino/spec-workflow-mcp.git
cd spec-workflow-mcp
```

### 2. Install Dependencies

```bash
npm install
```

This is an **npm workspaces monorepo**. Running `npm install` from the root installs dependencies for all packages:
- `packages/shared` — Shared types and utilities
- `packages/server` — MCP server + dashboard backend
- `packages/dashboard` — React frontend
- `packages/vscode-extension` — VS Code extension

### 3. Build the Project

```bash
npm run build
```

This builds all packages in dependency order: shared → server → dashboard.

## Development Commands

### Core Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start MCP server in development mode |
| `npm run build` | Build all packages (shared → server → dashboard) |
| `npm run build:shared` | Build shared package only |
| `npm run build:server` | Build server package only |
| `npm run build:dashboard` | Build dashboard frontend only |
| `npm run build:extension` | Build VS Code extension |
| `npm start` | Run production server |
| `npm run test` | Run server unit tests |
| `npm run test:extension` | Run extension unit tests |
| `npm run clean` | Remove all build artifacts |
| `npm run dev:dashboard` | Start dashboard dev server with hot reload |
| `npm run package:extension` | Package VS Code extension for distribution |

### Development Mode

```bash
npm run dev
```

Features:
- Auto-recompilation on file changes
- Hot reload for dashboard
- Detailed error messages
- Source maps for debugging

### Building for Production

```bash
npm run clean && npm run build
```

Optimizations:
- Minified JavaScript
- Optimized bundle size
- Production error handling
- Performance improvements

## Project Structure

```
spec-workflow-mcp/
├── package.json              # npm workspaces root (no runtime deps)
├── packages/
│   ├── shared/               # @spec-workflow/shared
│   │   └── src/
│   │       ├── types.ts      # Shared TypeScript interfaces
│   │       ├── task-parser.ts # Task parsing logic
│   │       ├── task-validator.ts # Task validation
│   │       ├── date-utils.ts  # Date formatting utilities
│   │       └── index.ts       # Barrel export
│   ├── server/               # @spec-workflow/server
│   │   └── src/
│   │       ├── index.ts      # MCP server entry point
│   │       ├── server.ts     # MCP server implementation
│   │       ├── config.ts     # Configuration loading
│   │       ├── core/         # Core business logic
│   │       ├── dashboard/    # Dashboard backend (Fastify)
│   │       ├── tools/        # MCP tool implementations
│   │       ├── prompts/      # Prompt templates
│   │       └── markdown/     # Document templates
│   ├── dashboard/            # @spec-workflow/dashboard
│   │   └── src/              # React frontend (Vite + Tailwind)
│   └── vscode-extension/     # VS Code extension
│       └── src/
│           ├── extension/    # Extension backend
│           └── webview/      # Webview UI components
├── scripts/                  # Build and validation scripts
├── docs/                     # Documentation
└── e2e/                      # End-to-end tests
```

### Package Dependency Flow

```
@spec-workflow/shared  ←  @spec-workflow/server
       ↑                        ↑
@spec-workflow/dashboard    packages/vscode-extension
```

The `shared` package contains pure TypeScript code (no Node.js or browser APIs) that all other packages can import. This eliminates duplicated types, task parsing logic, and date utilities across the codebase.

### Key Components

#### 1. MCP Server (`src/index.ts`)
- Handles MCP protocol communication
- Processes tool requests
- Manages project state
- File system operations

#### 2. Dashboard Server (`src/server.ts`)
- Serves web dashboard
- WebSocket connections
- Real-time updates
- HTTP API endpoints

#### 3. Tools (`src/tools/`)
Each tool is a separate module:
- Input validation
- Business logic
- File operations
- Response formatting

#### 4. Prompts (`src/prompts/`)
Template strings for:
- Document generation
- Workflow guidance
- Error messages
- User instructions

## Implementing New Features

### Adding a New Tool

1. **Create tool file** in `src/tools/`:

```typescript
// src/tools/my-new-tool.ts
import { Tool } from '@anthropic/mcp-sdk';

export const myNewTool: Tool = {
  name: 'my-new-tool',
  description: 'Description of what the tool does',
  parameters: {
    type: 'object',
    properties: {
      param1: { type: 'string', description: 'Parameter description' },
      param2: { type: 'number', optional: true }
    },
    required: ['param1']
  },
  handler: async (params) => {
    // Tool implementation
    const { param1, param2 = 0 } = params;

    // Business logic here

    return {
      success: true,
      data: 'Tool response'
    };
  }
};
```

2. **Register in index** (`src/tools/index.ts`):

```typescript
export { myNewTool } from './my-new-tool';
```

3. **Add to server** (`src/index.ts`):

```typescript
import { myNewTool } from './tools';

server.registerTool(myNewTool);
```

### Adding Dashboard Features

1. **Update HTML** (`dashboard/index.html`):

```html
<div class="new-feature">
  <h3>New Feature</h3>
  <button id="new-action">Action</button>
</div>
```

2. **Add JavaScript** (`dashboard/script.js`):

```javascript
document.getElementById('new-action').addEventListener('click', () => {
  // Feature logic
  ws.send(JSON.stringify({
    type: 'new-action',
    data: { /* ... */ }
  }));
});
```

3. **Handle in server** (`src/server.ts`):

```typescript
ws.on('message', (message) => {
  const { type, data } = JSON.parse(message);
  if (type === 'new-action') {
    // Handle new action
  }
});
```

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- src/tools/my-tool.test.ts

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

### Writing Tests

Create test files next to source files:

```typescript
// src/tools/my-tool.test.ts
import { describe, it, expect } from 'vitest';
import { myTool } from './my-tool';

describe('myTool', () => {
  it('should process input correctly', async () => {
    const result = await myTool.handler({
      param1: 'test'
    });

    expect(result.success).toBe(true);
    expect(result.data).toContain('expected');
  });

  it('should handle errors', async () => {
    const result = await myTool.handler({
      param1: null
    });

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});
```

### Integration Testing

Test complete workflows:

```typescript
// tests/integration/workflow.test.ts
describe('Complete Workflow', () => {
  it('should create spec from start to finish', async () => {
    // Create requirements
    // Approve requirements
    // Create design
    // Approve design
    // Create tasks
    // Verify structure
  });
});
```

## Debugging

### Debug MCP Server

1. **Add debug output**:

```typescript
console.error('[DEBUG]', 'Tool called:', toolName, params);
```

2. **Use VSCode debugger**:

```json
// .vscode/launch.json
{
  "type": "node",
  "request": "launch",
  "name": "Debug MCP Server",
  "program": "${workspaceFolder}/dist/index.js",
  "args": ["/path/to/test/project"],
  "console": "integratedTerminal"
}
```

### Debug Dashboard

1. **Browser DevTools**:
   - Open dashboard in browser
   - Press F12 for DevTools
   - Check Console for errors
   - Monitor Network tab for WebSocket

2. **Add logging**:

```javascript
console.log('WebSocket message:', message);
console.log('State update:', newState);
```

## Code Style and Standards

### TypeScript Guidelines

- Use strict mode
- Define interfaces for data structures
- Avoid `any` type
- Use async/await over callbacks

### File Organization

- One component per file
- Group related functionality
- Clear naming conventions
- Comprehensive comments

### Naming Conventions

- **Files**: kebab-case (`my-tool.ts`)
- **Classes**: PascalCase (`SpecManager`)
- **Functions**: camelCase (`createSpec`)
- **Constants**: UPPER_SNAKE (`MAX_RETRIES`)

## Contributing

### Contribution Process

1. **Fork repository**
2. **Create feature branch**:
   ```bash
   git checkout -b feature/my-feature
   ```
3. **Make changes**
4. **Write tests**
5. **Run tests and lint**:
   ```bash
   npm test
   npm run lint
   ```
6. **Commit changes**:
   ```bash
   git commit -m "feat: add new feature"
   ```
7. **Push branch**:
   ```bash
   git push origin feature/my-feature
   ```
8. **Create Pull Request**

### Commit Message Format

Follow conventional commits:

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `style:` Formatting
- `refactor:` Code restructuring
- `test:` Testing
- `chore:` Maintenance

Examples:
```
feat: add approval revision workflow
fix: resolve dashboard WebSocket reconnection issue
docs: update configuration guide
```

### Pull Request Guidelines

- Clear description
- Reference related issues
- Include screenshots for UI changes
- Ensure all tests pass
- Update documentation

## Publishing

### NPM Package

1. **Update version**:
   ```bash
   npm version patch|minor|major
   ```

2. **Build package**:
   ```bash
   npm run build
   ```

3. **Publish**:
   ```bash
   npm publish
   ```

### VSCode Extension

1. **Update extension version** in `vscode-extension/package.json`

2. **Build extension**:
   ```bash
   cd vscode-extension
   npm run package
   ```

3. **Publish to marketplace**:
   ```bash
   vsce publish
   ```

## Performance Optimization

### Server Performance

- Use caching for file reads
- Implement debouncing for file watchers
- Optimize WebSocket message batching
- Lazy load large documents

### Dashboard Performance

- Minimize DOM updates
- Use virtual scrolling for long lists
- Implement progressive rendering
- Optimize WebSocket reconnection

## Security Considerations

### Input Validation

Always validate tool inputs:

```typescript
if (!params.specName || typeof params.specName !== 'string') {
  throw new Error('Invalid spec name');
}

// Sanitize file paths
const safePath = path.normalize(params.path);
if (safePath.includes('..')) {
  throw new Error('Invalid path');
}
```

### File System Security

- Restrict operations to project directory
- Validate all file paths
- Use safe file operations
- Implement permission checks

## Troubleshooting Development Issues

### Common Build Errors

| Error | Solution |
|-------|----------|
| TypeScript errors | Run `npm run build` to see detailed errors |
| Module not found | Check imports and run `npm install` |
| Port already in use | Change port or kill existing process |
| WebSocket connection failed | Check server is running and port is correct |

### Development Tips

1. **Use TypeScript strict mode** for better type safety
2. **Enable source maps** for easier debugging
3. **Use nodemon** for auto-restart during development
4. **Test file operations** in isolated directory
5. **Monitor performance** with Chrome DevTools

## Resources

- [MCP SDK Documentation](https://github.com/anthropics/mcp-sdk)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [VSCode Extension API](https://code.visualstudio.com/api)

## Related Documentation

- [Configuration Guide](CONFIGURATION.md) - Server configuration
- [User Guide](USER-GUIDE.md) - Using the server
- [Tools Reference](TOOLS-REFERENCE.md) - Tool documentation
- [Troubleshooting](TROUBLESHOOTING.md) - Common issues