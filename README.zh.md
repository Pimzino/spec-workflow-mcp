# Spec Workflow MCP

[![npm version](https://img.shields.io/npm/v/@pimzino/spec-workflow-mcp)](https://www.npmjs.com/package/@pimzino/spec-workflow-mcp)
[![VSCode Extension](https://vsmarketplacebadges.dev/version-short/Pimzino.spec-workflow-mcp.svg)](https://marketplace.visualstudio.com/items?itemName=Pimzino.spec-workflow-mcp)

一个 Model Context Protocol (MCP) 服务器，用于结构化的规格驱动开发，配备实时仪表板和 VSCode 扩展。

## ☕ 支持本项目

<a href="https://buymeacoffee.com/Pimzino" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style="height: 60px !important;width: 217px !important;" ></a>

## 📺 功能展示

### 🔄 审批系统演示
<a href="https://www.youtube.com/watch?v=C-uEa3mfxd0" target="_blank">
  <img src="https://img.youtube.com/vi/C-uEa3mfxd0/maxresdefault.jpg" alt="Approval System Demo" width="600">
</a>

*了解审批系统的工作方式：创建文档、通过仪表板请求审批、提供反馈并跟踪修订。*

### 📊 仪表板与规格管理
<a href="https://www.youtube.com/watch?v=g9qfvjLUWf8" target="_blank">
  <img src="https://img.youtube.com/vi/g9qfvjLUWf8/maxresdefault.jpg" alt="Dashboard Demo" width="600">
</a>

*探索实时仪表板：查看规格、跟踪进度、浏览文档并监控开发工作流程。*

## ✨ 核心特性

- **结构化开发工作流** - 顺序规格创建（需求 → 设计 → 任务）
- **实时 Web 仪表板** - 通过实时更新监控规格、任务和进度
- **VSCode 扩展** - 为 VSCode 用户提供集成侧边栏仪表板
- **审批工作流** - 完整的审批流程，支持修订
- **任务进度跟踪** - 可视化进度条和详细状态
- **实现日志** - 所有任务实现的可搜索日志，包含代码统计
- **多语言支持** - 支持 11 种语言

## 🌍 支持的语言

🇺🇸 English • 🇯🇵 日本語 • 🇨🇳 中文 • 🇪🇸 Español • 🇧🇷 Português • 🇩🇪 Deutsch • 🇫🇷 Français • 🇷🇺 Русский • 🇮🇹 Italiano • 🇰🇷 한국어 • 🇸🇦 العربية

## 🚀 快速开始

### 步骤 1：添加到您的 AI 工具

添加到您的 MCP 配置（请参阅下方特定客户端设置）：

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

### 步骤 2：选择您的界面

**选项 A：Web 仪表板**（CLI 用户必需）
启动仪表板（默认运行在端口 5000）：
```bash
npx -y @pimzino/spec-workflow-mcp@latest --dashboard
```

仪表板将可通过以下地址访问：http://localhost:5000

> **注意：** 只需要一个仪表板实例。所有项目都将连接到同一个仪表板。

**选项 B：VSCode 扩展**（推荐给 VSCode 用户）

从 VSCode 市场安装 [Spec Workflow MCP Extension](https://marketplace.visualstudio.com/items?itemName=Pimzino.spec-workflow-mcp)。

## 📝 使用方法

在对话中简单提及 spec-workflow：

- **"创建一个用户认证的规格"** - 创建完整的规格工作流
- **"列出我的所有规格"** - 显示所有规格及其状态
- **"执行规格 user-auth 中的任务 1.2"** - 运行特定任务

[查看更多示例 →](docs/PROMPTING-GUIDE.zh.md)

## 🔧 MCP 客户端设置

<details>
<summary><strong>Augment Code</strong></summary>

在您的 Augment 设置中配置：
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

添加到您的 MCP 配置：
```bash
claude mcp add spec-workflow npx @pimzino/spec-workflow-mcp@latest -- /path/to/your/project
```

**重要说明：**
- `-y` 标志绕过 npm 提示，使安装更流畅
- `--` 分隔符确保路径传递给 spec-workflow 脚本，而不是 npx
- 将 `/path/to/your/project` 替换为您的实际项目目录路径

**Windows 替代方案（如果上述方法不起作用）：**
```bash
claude mcp add spec-workflow cmd.exe /c "npx @pimzino/spec-workflow-mcp@latest /path/to/your/project"
```
</details>

<details>
<summary><strong>Claude Desktop</strong></summary>

添加到 `claude_desktop_config.json`：
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

> **重要：** 在启动 MCP 服务器之前，使用 `--dashboard` 单独运行仪表板。

</details>

<details>
<summary><strong>Cline/Claude Dev</strong></summary>

添加到您的 MCP 服务器配置：
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

添加到您的 Continue 配置：
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

添加到您的 Cursor 设置（`settings.json`）：
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

添加到您的 `opencode.json` 配置文件：
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
<summary><strong>Windsurf</strong></summary>

添加到您的 `~/.codeium/windsurf/mcp_config.json` 配置文件：
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
<summary><strong>Codex</strong></summary>

添加到您的 `~/.codex/config.toml` 配置文件：
```toml
[mcp_servers.spec-workflow]
command = "npx"
args = ["-y", "@pimzino/spec-workflow-mcp@latest", "/path/to/your/project"]
```
</details>

## 🐳 Docker 部署

在 Docker 容器中运行仪表板以实现隔离部署：

```bash
# 使用 Docker Compose（推荐）
cd containers
docker-compose up --build

# 或使用 Docker CLI
docker build -f containers/Dockerfile -t spec-workflow-mcp .
docker run -p 5000:5000 -v "./workspace/.spec-workflow:/workspace/.spec-workflow:rw" spec-workflow-mcp
```

仪表板将可通过以下地址访问：http://localhost:5000

[查看 Docker 设置指南 →](containers/README.md)

## 🔒 沙盒环境

对于沙盒环境（例如，使用 `sandbox_mode=workspace-write` 的 Codex CLI），其中 `$HOME` 为只读，使用 `SPEC_WORKFLOW_HOME` 环境变量将全局状态文件重定向到可写位置：

```bash
SPEC_WORKFLOW_HOME=/workspace/.spec-workflow-mcp npx -y @pimzino/spec-workflow-mcp@latest /workspace
```

[查看配置指南 →](docs/CONFIGURATION.zh.md#environment-variables)

## 📚 文档

- [配置指南](docs/CONFIGURATION.zh.md) - 命令行选项、配置文件
- [用户指南](docs/USER-GUIDE.zh.md) - 全面的使用示例
- [工作流程](docs/WORKFLOW.zh.md) - 开发工作流程和最佳实践
- [界面指南](docs/INTERFACES.zh.md) - 仪表板和 VSCode 扩展详情
- [提示指南](docs/PROMPTING-GUIDE.zh.md) - 高级提示示例
- [工具参考](docs/TOOLS-REFERENCE.zh.md) - 完整的工具文档
- [开发指南](docs/DEVELOPMENT.zh.md) - 贡献和开发设置
- [故障排除](docs/TROUBLESHOOTING.zh.md) - 常见问题和解决方案

## 📁 项目结构

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

## 🛠️ 开发

```bash
# 安装依赖
npm install

# 构建项目
npm run build

# 以开发模式运行
npm run dev
```

[查看开发指南 →](docs/DEVELOPMENT.zh.md)

## 📄 许可证

GPL-3.0

## ⭐ Star 历史

<a href="https://www.star-history.com/#Pimzino/spec-workflow-mcp&Date">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=Pimzino/spec-workflow-mcp&type=Date&theme=dark" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=Pimzino/spec-workflow-mcp&type=Date" />
   <img alt="Star History Chart" src="https://api.star-history.com/svg?repos=Pimzino/spec-workflow-mcp&type=Date" />
 </picture>
</a>
