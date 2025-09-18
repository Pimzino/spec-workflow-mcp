# Spec Workflow MCP

[![npm version](https://img.shields.io/npm/v/@pimzino/spec-workflow-mcp)](https://www.npmjs.com/package/@pimzino/spec-workflow-mcp)
[![VSCode Extension](https://badgen.net/vs-marketplace/v/Pimzino.spec-workflow-mcp)](https://marketplace.visualstudio.com/items?itemName=Pimzino.spec-workflow-mcp)

A Model Context Protocol (MCP) server for structured spec-driven development with real-time dashboard and VSCode extension.

## ☕ Support This Project

<a href="https://buymeacoffee.com/Pimzino" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style="height: 60px !important;width: 217px !important;" ></a>

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

## ✨ Key Features

- **Structured Development Workflow** - Sequential spec creation (Requirements → Design → Tasks)
- **Real-Time Web Dashboard** - Monitor specs, tasks, and progress with live updates
- **VSCode Extension** - Integrated sidebar dashboard for VSCode users
- **Approval Workflow** - Complete approval process with revisions
- **Task Progress Tracking** - Visual progress bars and detailed status
- **Multi-Language Support** - Available in 11 languages

## 🌍 Supported Languages

🇺🇸 English • 🇯🇵 日本語 • 🇨🇳 中文 • 🇪🇸 Español • 🇧🇷 Português • 🇩🇪 Deutsch • 🇫🇷 Français • 🇷🇺 Русский • 🇮🇹 Italiano • 🇰🇷 한국어 • 🇸🇦 العربية

## 🚀 Quick Start

### Step 1: Add to your AI tool

Add to your MCP configuration (see client-specific setup below):

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

With auto-started dashboard:
```json
{
  "mcpServers": {
    "spec-workflow": {
      "command": "npx",
      "args": ["-y", "@pimzino/spec-workflow-mcp@latest", "/path/to/your/project", "--AutoStartDashboard"]
    }
  }
}
```

### Step 2: Choose your interface

**Option A: Web Dashboard** (Required for CLI users)
```bash
npx -y @pimzino/spec-workflow-mcp@latest /path/to/your/project --dashboard
```

**Option B: VSCode Extension** (Recommended for VSCode users)

Install [Spec Workflow MCP Extension](https://marketplace.visualstudio.com/items?itemName=Pimzino.spec-workflow-mcp) from the VSCode marketplace.

## 📝 How to Use

Simply mention spec-workflow in your conversation:

- **"Create a spec for user authentication"** - Creates complete spec workflow
- **"List my specs"** - Shows all specs and their status
- **"Execute task 1.2 in spec user-auth"** - Runs a specific task

[See more examples →](docs/PROMPTING-GUIDE.md)

## 🔧 MCP Client Setup

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
claude mcp add spec-workflow npx @pimzino/spec-workflow-mcp@latest -- /path/to/your/project
```

**Important Notes:**
- The `-y` flag bypasses npm prompts for smoother installation
- The `--` separator ensures the path is passed to the spec-workflow script, not to npx
- Replace `/path/to/your/project` with your actual project directory path

**Alternative for Windows (if the above doesn't work):**
```bash
claude mcp add spec-workflow cmd.exe /c "npx @pimzino/spec-workflow-mcp@latest /path/to/your/project"
```
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

Or with auto-started dashboard:
```json
{
  "mcpServers": {
    "spec-workflow": {
      "command": "npx",
      "args": ["-y", "@pimzino/spec-workflow-mcp@latest", "/path/to/your/project", "--AutoStartDashboard"]
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
<summary><strong>OpenCode</strong></summary>

Add to your `opencode.json` configuration file:
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

<details>
<summary><strong>Codex</strong></summary>

Add to your `~/.codex/config.toml` configuration file:
```toml
[mcp_servers.spec-workflow]
command = "npx"
args = ["-y", "@pimzino/spec-workflow-mcp@latest", "/path/to/your/project"]
```
</details>

## 📚 Documentation

- [Configuration Guide](docs/CONFIGURATION.md) - Command-line options, config files
- [User Guide](docs/USER-GUIDE.md) - Comprehensive usage examples
- [Workflow Process](docs/WORKFLOW.md) - Development workflow and best practices
- [Interfaces Guide](docs/INTERFACES.md) - Dashboard and VSCode extension details
- [Prompting Guide](docs/PROMPTING-GUIDE.md) - Advanced prompting examples
- [Tools Reference](docs/TOOLS-REFERENCE.md) - Complete tools documentation
- [Development](docs/DEVELOPMENT.md) - Contributing and development setup
- [Troubleshooting](docs/TROUBLESHOOTING.md) - Common issues and solutions

## 📁 Project Structure

```
your-project/
  .spec-workflow/
    approvals/
    archive/
    specs/
    steering/
    templates/
    user-templates/
    config.example.toml
```

## 🛠️ Development

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Run in development mode
npm run dev
```

[See development guide →](docs/DEVELOPMENT.md)

## 📄 License

GPL-3.0

## ⭐ Star History

<a href="https://www.star-history.com/#Pimzino/spec-workflow-mcp&Date">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=Pimzino/spec-workflow-mcp&type=Date&theme=dark" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=Pimzino/spec-workflow-mcp&type=Date" />
   <img alt="Star History Chart" src="https://api.star-history.com/svg?repos=Pimzino/spec-workflow-mcp&type=Date" />
 </picture>
</a>
