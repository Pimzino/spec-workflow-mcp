[![MSeeP.ai Security Assessment Badge](https://mseep.net/pr/pimzino-spec-workflow-mcp-badge.png)](https://mseep.ai/app/pimzino-spec-workflow-mcp)

# Spec Workflow MCP

[![npm version](https://img.shields.io/npm/v/@pimzino/spec-workflow-mcp)](https://www.npmjs.com/package/@pimzino/spec-workflow-mcp)

A Model Context Protocol (MCP) server that provides structured spec-driven development workflow tools for AI-assisted software development, featuring a real-time web dashboard for monitoring and managing your project's progress.

<a href="https://glama.ai/mcp/servers/@Pimzino/spec-workflow-mcp">
  <img width="380" height="200" src="https://glama.ai/mcp/servers/@Pimzino/spec-workflow-mcp/badge" alt="Spec Workflow MCP server" />
</a>

## 📺 Showcase

### 🔄 Approval System in Action
<a href="https://www.youtube.com/watch?v=C-uEa3mfxd0" target="_blank">
  <img src="https://img.youtube.com/vi/C-uEa3mfxd0/maxresdefault.jpg" alt="Approval System Demo" width="600">
</a>

*See how the approval system works: create documents, request approval through the dashboard, provide feedback, and track revisions.*

### 📊 Dashboard & Spec Management
<a href="https://www.youtube.com/watch?v=g9qfvjLUWf8" target="_blank">
  <img src="https://img.youtube.com/vi/g9qfvjLUWf8/maxresdefault.jpg" alt="Dashboard Demo" width="600">
</a>

*Explore the real-time dashboard: view specs, track progress, navigate documents, and monitor your development workflow.*

---

## ☕ Support This Project

<a href="https://buymeacoffee.com/Pimzino" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style="height: 60px !important;width: 217px !important;" ></a>

---

## Features

- **Structured Development Workflow** - Sequential spec creation (Requirements → Design → Tasks)
- **Real-Time Web Dashboard** - Monitor specs, tasks, and progress with live updates
- **Document Management** - View and manage all spec documents from the dashboard
- **Task Progress Tracking** - Visual progress bars and detailed task status
- **Steering Documents** - Project vision, technical decisions, and structure guidance
- **Bug Workflow** - Complete bug reporting and resolution tracking
- **Template System** - Pre-built templates for all document types
- **Cross-Platform** - Works on Windows, macOS, and Linux

## Quick Start

1. **Add to your AI tool configuration** (see MCP Client Setup below):
   ```json
   {
     "mcpServers": {
       "spec-workflow": {
         "command": "npx",
         "args": ["-y", "@pimzino/spec-workflow-mcp@latest", "/path/to/your/project"]
       }
     }
   }
   ```
   **Note:** Can be used without path to your project, but some MCP clients may not start the server from the current directory.

2. **Start the web dashboard** (**REQUIRED**):
   ```bash
   # Default (uses ephemeral port)
   npx -y @pimzino/spec-workflow-mcp@latest /path/to/your/project --dashboard
   
   # Custom port
   npx -y @pimzino/spec-workflow-mcp@latest /path/to/your/project --dashboard --port 3000
   
   # Alternative syntax
   npx -y @pimzino/spec-workflow-mcp@latest /path/to/your/project --dashboard --port=8080
   ```
   
   **Options:**
   - `--dashboard` - Start the web dashboard (required)
   - `--port <number>` - Optional custom port (1024-65535). If not specified, an ephemeral port will be used
   
   **IMPORTANT:** The dashboard is mandatory for the workflow to function. Without it:
   - Document approvals won't work
   - Task progress tracking will be disabled
   - Spec status updates won't be available
   - The approval system will be non-functional

**Note:** The MCP server and dashboard are now separate services. You must run both: the MCP server for AI tool integration AND the dashboard for workflow management, approvals, and progress tracking.

## How to Use

You can simply mention spec-workflow or whatever name you gave the MCP server in your conversation. The AI will handle the complete workflow automatically or you can use some of the example prompts below:

### Creating Specs
- **"Create a spec for user authentication"** - Creates complete spec workflow for that feature
- **"Create a spec called payment-system"** - Builds full requirements → design → tasks
- **"Build a spec for @prd"** - Takes your existing PRD and creates the complete spec workflow from it
- **"Create a spec for shopping-cart - include add to cart, quantity updates, and checkout integration"** - Detailed feature spec

### Getting Information
- **"List my specs"** - Shows all specs and their current status
- **"Show me the user-auth progress"** - Displays detailed progress information

### Implementation
- **"Execute task 1.2 in spec user-auth"** - Runs a specific task from your spec
- **Copy prompts from dashboard** - Use the "Copy Prompt" button in the task list on your dashboard

The agent automatically handles approval workflows, task management, and guides you through each phase.

## MCP Client Setup

<details>
<summary><strong>Augment Code</strong></summary>

Configure in your Augment settings:
```json
{
  "mcpServers": {
    "spec-workflow": {
      "command": "npx",
      "args": ["-y", "@pimzino/spec-workflow-mcp@latest", "/path/to/your/project"]
    }
  }
}
```
</details>

<details>
<summary><strong>Claude Code CLI</strong></summary>

Add to your MCP configuration:
```bash
claude mcp add spec-workflow npx @pimzino/spec-workflow-mcp@latest /path/to/your/project
```
<strong> Note: </strong> You may need to wrap the command in cmd.exe /c "npx -y @pimzino/spec-workflow-mcp@latest /path/to/your/project" for Windows.
</details>

<details>
<summary><strong>Claude Desktop</strong></summary>

Add to `claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "spec-workflow": {
      "command": "npx",
      "args": ["-y", "@pimzino/spec-workflow-mcp@latest", "/path/to/your/project"]
    }
  }
}
```
</details>

<details>
<summary><strong>Cline/Claude Dev</strong></summary>

Add to your MCP server configuration:
```json
{
  "mcpServers": {
    "spec-workflow": {
      "command": "npx",
      "args": ["-y", "@pimzino/spec-workflow-mcp@latest", "/path/to/your/project"]
    }
  }
}
```
</details>

<details>
<summary><strong>Continue IDE Extension</strong></summary>

Add to your Continue configuration:
```json
{
  "mcpServers": {
    "spec-workflow": {
      "command": "npx",
      "args": ["-y", "@pimzino/spec-workflow-mcp@latest", "/path/to/your/project"]
    }
  }
}
```
</details>

<details>
<summary><strong>Cursor IDE</strong></summary>

Add to your Cursor settings (`settings.json`):
```json
{
  "mcp.servers": {
    "spec-workflow": {
      "command": "npx",
      "args": ["-y", "@pimzino/spec-workflow-mcp@latest", "/path/to/your/project"]
    }
  }
}
```
</details>

<details>
<summary><strong>OpenCode</strong></summary>

Add to your `opencode.json` configuration file (either global at `~/.config/opencode/opencode.json` or project-specific):
```json
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "spec-workflow": {
      "type": "local",
      "command": ["npx", "-y", "@pimzino/spec-workflow-mcp@latest", "/path/to/your/project"],
      "enabled": true
    }
  }
}
```
</details>

> **Note:** Replace `/path/to/your/project` with the actual path to your project directory where you want the spec workflow to operate.

## Available Tools

### Workflow Guides
- `spec-workflow-guide` - Complete guide for the spec-driven workflow process
- `steering-guide` - Guide for creating project steering documents

### Spec Management
- `create-spec-doc` - Create/update spec documents (requirements, design, tasks)
- `spec-list` - List all specs with status information
- `spec-status` - Get detailed status of a specific spec
- `manage-tasks` - Comprehensive task management for spec implementation

### Context & Templates
- `get-template-context` - Get markdown templates for all document types
- `get-steering-context` - Get project steering context and guidance
- `get-spec-context` - Get context for a specific spec

### Steering Documents
- `create-steering-doc` - Create project steering documents (product, tech, structure)

### Approval System
- `request-approval` - Request user approval for documents
- `get-approval-status` - Check approval status
- `delete-approval` - Clean up completed approvals

## Web Dashboard

The dashboard is a separate service that must be started manually alongside the MCP server. Each project gets its own dedicated dashboard running on an ephemeral port. The dashboard provides:

- **Live Project Overview** - Real-time updates of specs and progress
- **Document Viewer** - Read requirements, design, and tasks documents
- **Task Progress Tracking** - Visual progress bars and task status
- **Steering Documents** - Quick access to project guidance
- **Dark Mode** - Automatically enabled for better readability

### Dashboard Features
- **Spec Cards** - Overview of each spec with status indicators
- **Document Navigation** - Switch between requirements, design, and tasks
- **Task Management** - View task progress and copy implementation prompts
- **Real-Time Updates** - WebSocket connection for live project status

## Workflow Process

### 1. Project Setup (Recommended)
```
steering-guide → create-steering-doc (product, tech, structure)
```
Creates foundational documents to guide your project development.

### 2. Feature Development
```
spec-workflow-guide → create-spec-doc → [review] → implementation
```
Sequential process: Requirements → Design → Tasks → Implementation

### 3. Implementation Support
- Use `get-spec-context` for detailed implementation context
- Use `manage-tasks` to track task completion
- Monitor progress via the web dashboard

## File Structure

```
your-project/
  .spec-workflow/
    steering/
      product.md        # Product vision and goals
      tech.md          # Technical decisions
      structure.md     # Project structure guide
    specs/
      {spec-name}/
        requirements.md # What needs to be built
        design.md      # How it will be built
        tasks.md       # Implementation breakdown
    approval/
      {spec-name}/
        {document-id}.json # Approval status tracking
```

## Development

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Run in development mode (with auto-reload)
npm run dev

# Start the production server
npm start

# Clean build artifacts
npm run clean
```

## Troubleshooting

### Common Issues

1. **Dashboard not starting**
   - Ensure you're using the `--dashboard` flag when starting the dashboard service
   - The dashboard must be started separately from the MCP server
   - Check console output for the dashboard URL and any error messages
   - If using `--port`, ensure the port number is valid (1024-65535) and not in use by another application

2. **Approvals not working**
   - Verify the dashboard is running alongside the MCP server
   - The dashboard is required for document approvals and task tracking
   - Check that both services are pointing to the same project directory

3. **MCP server not connecting**
   - Verify the file paths in your configuration are correct
   - Ensure the project has been built with `npm run build`
   - Check that Node.js is available in your system PATH

4. **Port conflicts**
   - If you get a "port already in use" error, try a different port with `--port <different-number>`
   - Use `netstat -an | find ":3000"` (Windows) or `lsof -i :3000` (macOS/Linux) to check what's using a port
   - Omit the `--port` parameter to automatically use an available ephemeral port

5. **Dashboard not updating**
   - The dashboard uses WebSockets for real-time updates
   - Refresh the browser if connection is lost
   - Check console for any JavaScript errors

### Getting Help

- Check the [Issues](../../issues) page for known problems
- Create a new issue using the provided templates
- Use the workflow guides within the tools for step-by-step instructions

## License

GPL-3.0

## Star History

<a href="https://www.star-history.com/#Pimzino/spec-workflow-mcp&Timeline">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=Pimzino/spec-workflow-mcp&type=Timeline&theme=dark" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=Pimzino/spec-workflow-mcp&type=Timeline" />
   <img alt="Star History Chart" src="https://api.star-history.com/svg?repos=Pimzino/spec-workflow-mcp&type=Timeline" />
 </picture>
</a>