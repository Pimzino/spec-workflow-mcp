# Spec Workflow MCP

[![npm version](https://img.shields.io/npm/v/@pimzino/spec-workflow-mcp)](https://www.npmjs.com/package/@pimzino/spec-workflow-mcp)
[![VSCode Extension](https://badgen.net/vs-marketplace/v/Pimzino.spec-workflow-mcp)](https://marketplace.visualstudio.com/items?itemName=Pimzino.spec-workflow-mcp)

[English](README.md) | **中文**

> 一个模型上下文协议（MCP）服务器，为AI辅助软件开发提供结构化的规范驱动开发工作流工具，配备实时Web仪表板和VSCode扩展，可直接在开发环境中监控和管理项目进度。

<a href="https://glama.ai/mcp/servers/@Pimzino/spec-workflow-mcp">
  <img width="380" height="200" src="https://glama.ai/mcp/servers/@Pimzino/spec-workflow-mcp/badge" alt="Spec Workflow MCP server" />
</a>

## 📺 产品展示

### 🔄 审批系统演示
<a href="https://www.youtube.com/watch?v=C-uEa3mfxd0" target="_blank">
  <img src="https://img.youtube.com/vi/C-uEa3mfxd0/maxresdefault.jpg" alt="审批系统演示" width="600">
</a>

*观看审批系统如何工作：创建文档、通过仪表板请求审批、提供反馈并跟踪修订。*

### 📊 仪表板和规范管理
<a href="https://www.youtube.com/watch?v=g9qfvjLUWf8" target="_blank">
  <img src="https://img.youtube.com/vi/g9qfvjLUWf8/maxresdefault.jpg" alt="仪表板演示" width="600">
</a>

*探索实时仪表板：查看规范、跟踪进度、导航文档并监控您的开发工作流。*

---

## ☕ 支持此项目

<a href="https://buymeacoffee.com/Pimzino" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="请我喝咖啡" style="height: 60px !important;width: 217px !important;" ></a>

---

## 🌟 主要功能

- **结构化开发工作流** - 顺序创建规范（需求 → 设计 → 任务）
- **实时Web仪表板** - 通过实时更新监控规范、任务和进度
- **VSCode扩展** - 为VSCode用户提供集成侧边栏仪表板
- **文档管理** - 从仪表板或扩展查看和管理所有规范文档
- **归档系统** - 组织已完成的规范以保持活动项目整洁
- **任务进度跟踪** - 可视化进度条和详细任务状态
- **审批工作流** - 包含批准、拒绝和修订请求的完整审批流程
- **指导文档** - 项目愿景、技术决策和结构指导
- **声音通知** - 可配置的审批和任务完成音频提醒
- **Bug工作流** - 完整的bug报告和解决跟踪
- **模板系统** - 所有文档类型的预构建模板
- **跨平台** - 支持Windows、macOS和Linux

## 🌍 支持的语言

整个界面（仪表板、VSCode扩展）支持以下语言：

- 🇺🇸 **英语** (en)
- 🇯🇵 **日语** (ja) - 日本語
- 🇨🇳 **中文** (zh) - 中文
- 🇪🇸 **西班牙语** (es) - Español
- 🇧🇷 **葡萄牙语** (pt) - Português
- 🇩🇪 **德语** (de) - Deutsch
- 🇫🇷 **法语** (fr) - Français
- 🇷🇺 **俄语** (ru) - Русский
- 🇮🇹 **意大利语** (it) - Italiano
- 🇰🇷 **韩语** (ko) - 한국어
- 🇸🇦 **阿拉伯语** (ar) - العربية

语言选择可在仪表板和VSCode扩展设置中使用。

## 🚀 快速开始

1. **添加到您的AI工具配置**（参见下面的MCP客户端设置）：
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

   **自动启动仪表板**（随MCP服务器自动打开仪表板）：
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

   **自定义端口**：
   ```json
   {
     "mcpServers": {
       "spec-workflow": {
         "command": "npx",
         "args": ["-y", "@pimzino/spec-workflow-mcp@latest", "/path/to/your/project", "--AutoStartDashboard", "--port", "3456"]
       }
     }
   }
   ```

   **注意**：可以不指定项目路径使用，但某些MCP客户端可能不会从当前目录启动服务器。

2. **选择您的界面**：

   ### 选项A：Web仪表板（**CLI用户必需**）
   ```bash
   # 仅仪表板模式（使用临时端口）
   npx -y @pimzino/spec-workflow-mcp@latest /path/to/your/project --dashboard

   # 仅仪表板模式，自定义端口
   npx -y @pimzino/spec-workflow-mcp@latest /path/to/your/project --dashboard --port 3000

   # 查看所有可用选项
   npx -y @pimzino/spec-workflow-mcp@latest --help
   ```

   **命令行选项：**
   - `--help` - 显示综合使用信息和示例
   - `--dashboard` - 运行仅仪表板模式（无MCP服务器）
   - `--AutoStartDashboard` - 随MCP服务器自动启动仪表板
   - `--port <number>` - 指定仪表板端口（1024-65535）。适用于`--dashboard`和`--AutoStartDashboard`
   - `--config <path>` - 使用自定义配置文件而非默认位置。支持相对和绝对路径

   **配置文件：**
   
   您可以使用TOML配置文件配置服务器。默认情况下，服务器查找`<project-dir>/.spec-workflow/config.toml`，但您可以使用`--config`标志指定自定义位置。

   示例配置：
   ```toml
   # 项目目录（默认为当前目录）
   projectDir = "/path/to/your/project"
   
   # 仪表板端口（1024-65535）
   port = 3456
   
   # 随MCP服务器自动启动仪表板
   autoStartDashboard = true
   
   # 运行仅仪表板模式
   dashboardOnly = false
   
   # 界面语言（en, ja, zh, es, pt, de, fr, ru, it, ko, ar）
   lang = "zh"
   ```

   **使用自定义配置文件：**
   ```bash
   # 使用自定义配置文件
   npx @pimzino/spec-workflow-mcp --config ~/my-configs/spec.toml
   
   # 自定义配置与仪表板
   npx @pimzino/spec-workflow-mcp --config ./dev-config.toml --dashboard
   
   # CLI参数仍覆盖自定义配置
   npx @pimzino/spec-workflow-mcp --config ./config.toml --port 4000
   ```

   **配置优先级：**
   1. 命令行参数（最高优先级）
   2. 自定义配置文件（如果指定了--config）
   3. 默认配置文件（.spec-workflow/config.toml）
   4. 内置默认值（最低优先级）

   完整的示例配置文件文档可在`.spec-workflow/config.example.toml`找到。

   ### 选项B：VSCode扩展（**推荐VSCode用户**）

   从VSCode市场安装**[Spec Workflow MCP扩展](https://marketplace.visualstudio.com/items?itemName=Pimzino.spec-workflow-mcp)**：

   1. 在包含`.spec-workflow/`的项目目录中打开VSCode
   2. 扩展自动在VSCode内提供仪表板功能
   3. 通过活动栏中的Spec Workflow图标访问
   4. **不需要单独的仪表板** - 一切都在您的IDE中运行

   **扩展功能：**
   - 带实时更新的集成侧边栏仪表板
   - 用于组织已完成规范的归档系统
   - 带VSCode原生对话框的完整审批工作流
   - 审批和完成的声音通知
   - 审批和评论的编辑器上下文菜单操作

   **重要：** 对于CLI用户，Web仪表板是必需的。对于VSCode用户，扩展取代了单独Web仪表板的需求，同时在您的IDE中直接提供相同的功能。

## 📖 如何使用

您可以简单地在对话中提到spec-workflow或您给MCP服务器起的任何名称。AI将自动处理完整的工作流，或者您可以使用下面的一些示例提示：

### 创建规范
- **"创建用户认证规范"** - 为该功能创建完整的规范工作流
- **"创建名为支付系统的规范"** - 构建完整的需求 → 设计 → 任务
- **"为@prd构建规范"** - 获取您现有的PRD并从中创建完整的规范工作流
- **"创建购物车规范 - 包括添加到购物车、数量更新和结账集成"** - 详细功能规范

### 获取信息
- **"列出我的规范"** - 显示所有规范及其当前状态
- **"显示用户认证进度"** - 显示详细的进度信息

### 实施
- **"执行用户认证规范中的任务1.2"** - 从您的规范运行特定任务
- **从仪表板复制提示** - 在仪表板的任务列表中使用"复制提示"按钮

代理自动处理审批工作流、任务管理，并引导您完成每个阶段。

## 🔧 MCP客户端设置

<details>
<summary><strong>Augment Code</strong></summary>

在您的Augment设置中配置：
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

添加到您的MCP配置：
```bash
claude mcp add spec-workflow npx @pimzino/spec-workflow-mcp@latest -- /path/to/your/project
```

**重要说明：**
- `-y`标志绕过npm提示以实现更流畅的安装
- `--`分隔符确保路径传递给spec-workflow脚本，而不是npx
- 将`/path/to/your/project`替换为您的实际项目目录路径

**Windows的替代方案（如果上述方案不起作用）：**
```bash
claude mcp add spec-workflow cmd.exe /c "npx @pimzino/spec-workflow-mcp@latest /path/to/your/project"
```
</details>

<details>
<summary><strong>Claude Desktop</strong></summary>

添加到`claude_desktop_config.json`：
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

或带自动启动仪表板：
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

添加到您的MCP服务器配置：
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
<summary><strong>Continue IDE扩展</strong></summary>

添加到您的Continue配置：
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

添加到您的Cursor设置（`settings.json`）：
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

添加到您的`opencode.json`配置文件（全局在`~/.config/opencode/opencode.json`或项目特定）：
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

> **注意：** 将`/path/to/your/project`替换为您希望规范工作流操作的实际项目目录路径。

## 🛠️ 可用工具

### 工作流指南
- `spec-workflow-guide` - 规范驱动工作流过程的完整指南
- `steering-guide` - 创建项目指导文档的指南

### 规范管理
- `create-spec-doc` - 创建/更新规范文档（需求、设计、任务）
- `spec-list` - 列出所有规范及状态信息
- `spec-status` - 获取特定规范的详细状态
- `manage-tasks` - 规范实施的综合任务管理

### 上下文和模板
- `get-template-context` - 获取所有文档类型的markdown模板
- `get-steering-context` - 获取项目指导上下文和指导
- `get-spec-context` - 获取特定规范的上下文

### 指导文档
- `create-steering-doc` - 创建项目指导文档（产品、技术、结构）

### 审批系统
- `request-approval` - 请求用户批准文档
- `get-approval-status` - 检查审批状态
- `delete-approval` - 清理已完成的审批

## 🖥️ 用户界面

### Web仪表板

Web仪表板是CLI用户的独立服务。每个项目都在临时端口上运行专用仪表板。仪表板提供：

- **实时项目概览** - 规范和进度的实时更新
- **文档查看器** - 阅读需求、设计和任务文档
- **任务进度跟踪** - 可视化进度条和任务状态
- **指导文档** - 快速访问项目指导
- **深色模式** - 自动启用以获得更好的可读性

#### 仪表板功能
- **规范卡片** - 每个规范的概览及状态指示器
- **文档导航** - 在需求、设计和任务之间切换
- **任务管理** - 查看任务进度和复制实施提示
- **实时更新** - WebSocket连接获取实时项目状态

### VSCode扩展

VSCode扩展直接在您的IDE中提供所有仪表板功能：

- **侧边栏集成** - 从活动栏访问所有内容
- **归档管理** - 在活动规范和已归档规范之间切换
- **原生对话框** - 所有操作都使用VSCode确认对话框
- **编辑器集成** - 审批和评论的上下文菜单操作
- **声音通知** - 可配置的音频提醒
- **无外部依赖** - 完全在VSCode内工作

#### VSCode用户的扩展优势
- **单一环境** - 无需在浏览器和IDE之间切换
- **原生体验** - 使用VSCode的原生UI组件
- **更好集成** - 上下文菜单操作和编辑器集成
- **简化设置** - 无需单独的仪表板服务

## 🔄 工作流过程

### 1. 项目设置（推荐）
```
steering-guide → create-steering-doc (产品、技术、结构)
```
创建基础文档以指导您的项目开发。

### 2. 功能开发
```
spec-workflow-guide → create-spec-doc → [审查] → 实施
```
顺序过程：需求 → 设计 → 任务 → 实施

### 3. 实施支持
- 使用`get-spec-context`获取详细的实施上下文
- 使用`manage-tasks`跟踪任务完成
- 通过Web仪表板监控进度

## 📁 文件结构

```
your-project/
  .spec-workflow/
    steering/
      product.md        # 产品愿景和目标
      tech.md          # 技术决策
      structure.md     # 项目结构指南
    specs/
      {spec-name}/
        requirements.md # 需要构建的内容
        design.md      # 如何构建
        tasks.md       # 实施分解
    approval/
      {spec-name}/
        {document-id}.json # 审批状态跟踪
```

## 💻 开发

```bash
# 安装依赖
npm install

# 构建项目
npm run build

# 开发模式运行（带自动重载）
npm run dev

# 启动生产服务器
npm start

# 清理构建产物
npm run clean
```

## 🔧 故障排除

### 常见问题

1. **Claude MCP配置无法使用项目路径工作**
   - 确保使用正确的语法：`claude mcp add spec-workflow npx -y @pimzino/spec-workflow-mcp@latest -- /path/to/your/project`
   - `--`分隔符对于将路径传递给脚本而不是npx至关重要
   - 验证路径存在且可访问
   - 对于包含空格的路径，确保在shell中正确引用
   - 检查生成的`claude.json`配置，确保路径出现在`args`数组中

2. **仪表板无法启动**
   - 确保启动仪表板服务时使用了`--dashboard`标志
   - 仪表板必须独立于MCP服务器启动
   - 检查控制台输出中的仪表板URL和任何错误消息
   - 如果使用`--port`，确保端口号有效（1024-65535）且未被其他应用程序使用

3. **审批无法工作**
   - 验证仪表板是否与MCP服务器一起运行
   - 文档审批和任务跟踪需要仪表板
   - 检查两个服务是否指向相同的项目目录

4. **MCP服务器无法连接**
   - 验证配置中的文件路径是否正确
   - 确保项目已使用`npm run build`构建
   - 检查Node.js是否在系统PATH中可用

5. **端口冲突**
   - 如果收到"端口已在使用"错误，尝试使用`--port <不同数字>`使用不同的端口
   - 使用`netstat -an | find ":3000"`（Windows）或`lsof -i :3000`（macOS/Linux）检查什么在使用端口
   - 省略`--port`参数以自动使用可用的临时端口

6. **仪表板不更新**
   - 仪表板使用WebSocket进行实时更新
   - 如果连接丢失，刷新浏览器
   - 检查控制台中的任何JavaScript错误

### 获取帮助

- 查看[Issues](../../issues)页面了解已知问题
- 使用提供的模板创建新问题
- 在工具中使用工作流指南获取分步说明

## 📄 许可证

GPL-3.0

## ⭐ Star历史

<a href="https://www.star-history.com/#Pimzino/spec-workflow-mcp&Date">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=Pimzino/spec-workflow-mcp&type=Date&theme=dark" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=Pimzino/spec-workflow-mcp&type=Date" />
   <img alt="Star历史图表" src="https://api.star-history.com/svg?repos=Pimzino/spec-workflow-mcp&type=Date" />
 </picture>
</a>