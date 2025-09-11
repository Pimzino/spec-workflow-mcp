# 快速入门指南

[English](quickstart.md) | **中文**

本指南将帮助您快速开始使用 Spec Workflow MCP。

## 📋 目录

1. [系统要求](#系统要求)
2. [安装方法](#安装方法)
3. [基本配置](#基本配置)
4. [首次使用](#首次使用)
5. [验证安装](#验证安装)
6. [下一步](#下一步)

## 系统要求

- **Node.js**: 16.0.0 或更高版本
- **npm**: 7.0.0 或更高版本
- **操作系统**: Windows, macOS, 或 Linux
- **内存**: 至少 2GB RAM
- **存储**: 至少 100MB 可用空间

## 安装方法

### 方法1：使用 npx（推荐）

这是最简单的方法，无需全局安装：

```bash
# 测试安装
npx @pimzino/spec-workflow-mcp --help

# 在项目目录中使用
cd /path/to/your/project
npx @pimzino/spec-workflow-mcp .
```

### 方法2：全局安装

```bash
# 全局安装
npm install -g @pimzino/spec-workflow-mcp

# 验证安装
spec-workflow-mcp --help

# 使用
spec-workflow-mcp /path/to/your/project
```

### 方法3：本地项目安装

```bash
# 在项目目录中
npm install @pimzino/spec-workflow-mcp

# 添加到 package.json scripts
# "spec-workflow": "spec-workflow-mcp ."

npm run spec-workflow
```

## 基本配置

### 1. 创建项目目录结构

在您项目的根目录下创建 `.spec-workflow` 目录：

```bash
mkdir -p /path/to/your/project/.spec-workflow
```

### 2. 创建配置文件（可选）

创建 `.spec-workflow/config.toml` 文件：

```toml
# 项目目录
projectDir = "."

# 仪表板端口
port = 3456

# 自动启动仪表板
autoStartDashboard = true

# 界面语言
lang = "zh"
```

### 3. 验证配置

运行以下命令检查配置是否正确：

```bash
spec-workflow-mcp /path/to/your/project --help
```

## 首次使用

### 场景1：CLI用户（推荐仪表板）

```bash
# 启动带仪表板的MCP服务器
spec-workflow-mcp /path/to/your/project --AutoStartDashboard

# 或使用自定义端口
spec-workflow-mcp /path/to/your/project --AutoStartDashboard --port 3000
```

仪表板将自动在浏览器中打开。您将看到：
- 项目概览
- 规范列表（初始为空）
- 任务进度跟踪
- 系统状态

### 场景2：VSCode用户

1. 安装 VSCode 扩展：
   - 打开 VSCode
   - 进入扩展市场
   - 搜索 "Spec Workflow MCP"
   - 点击安装

2. 在 VSCode 中打开您的项目
3. 点击活动栏中的 Spec Workflow 图标
4. 开始使用集成仪表板

### 场景3：仅仪表板模式

```bash
# 仅运行仪表板（无MCP服务器）
spec-workflow-mcp /path/to/your/project --dashboard
```

## 验证安装

### 1. 检查服务器状态

在您的AI工具中运行：

```
列出我的规范
```

应该返回：
```
没有找到规范。使用 "创建规范" 来开始。
```

### 2. 创建测试规范

运行：

```
创建一个名为 "hello-world" 的规范
```

这将创建：
- 需求文档
- 设计文档  
- 任务文档

### 3. 检查仪表板

- 刷新仪表板页面
- 应该能看到新创建的规范
- 点击规范查看详细信息

## 下一步

现在您已经成功安装和验证了 Spec Workflow MCP，可以：

### 📚 学习更多
- 阅读 [配置指南](configuration.zh.md)
- 查看 [MCP客户端设置](mcp-client-setup.zh.md)
- 了解 [工作流指南](technical-documentation/workflow-guide.zh.md)

### 🛠️ 开始使用
- 创建您的第一个项目规范
- 设置审批工作流
- 探索仪表板功能

### 🔧 故障排除
如果遇到问题，请查看：
- [故障排除指南](troubleshooting.zh.md)
- GitHub Issues 页面
- 项目文档

## 💡 提示

1. **从简单开始**：先创建一个小规范来熟悉系统
2. **使用模板**：利用内置模板快速开始
3. **定期保存**：虽然系统自动保存，但定期备份是好习惯
4. **探索功能**：尝试不同的命令和选项来发现所有功能

## 📞 获取帮助

如果您在快速入门过程中遇到问题：

1. 检查 [故障排除指南](troubleshooting.zh.md)
2. 在GitHub上搜索类似问题
3. 创建新的Issue描述您的问题
4. 提供详细的错误信息和环境信息

祝您使用愉快！🎉