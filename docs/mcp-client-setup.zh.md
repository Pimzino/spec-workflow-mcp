# MCP客户端设置指南

[English](mcp-client-setup.md) | **中文**

本指南详细介绍如何在各种MCP客户端中配置Spec Workflow MCP。

## 📋 目录

1. [通用配置原则](#通用配置原则)
2. [Claude Code CLI](#claude-code-cli)
3. [Claude Desktop](#claude-desktop)
4. [VSCode扩展](#vscode扩展)
5. [其他IDE和工具](#其他ide和工具)
6. [故障排除](#故障排除)
7. [高级配置](#高级配置)

## 通用配置原则

### 基本配置结构

所有MCP客户端的配置都遵循相似的模式：

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

### 关键参数说明

- `command`: 使用 `npx` 来运行包
- `args`: 参数数组
  - `-y`: 自动确认安装
  - `@pimzino/spec-workflow-mcp@latest`: 最新版本
  - `/path/to/your/project`: 您的项目路径

### 常用配置选项

```json
{
  "mcpServers": {
    "spec-workflow": {
      "command": "npx", 
      "args": [
        "-y", 
        "@pimzino/spec-workflow-mcp@latest",
        "/path/to/your/project",
        "--AutoStartDashboard",  // 自动启动仪表板
        "--port", "3456"         // 指定端口
      ]
    }
  }
}
```

## Claude Code CLI

### 安装和配置

1. **安装Claude Code CLI**
   ```bash
   npm install -g @anthropic-ai/claude-cli
   ```

2. **添加MCP服务器**
   ```bash
   claude mcp add spec-workflow npx @pimzino/spec-workflow-mcp@latest -- /path/to/your/project
   ```

3. **验证配置**
   ```bash
   claude mcp list
   ```

### 配置文件位置

配置存储在：
- **macOS**: `~/.config/claude/mcp.json`
- **Windows**: `%APPDATA%\claude\mcp.json`
- **Linux**: `~/.config/claude/mcp.json`

### 高级配置

```bash
# 带自动启动仪表板
claude mcp add spec-workflow npx @pimzino/spec-workflow-mcp@latest -- /path/to/your/project --AutoStartDashboard

# 带自定义端口
claude mcp add spec-workflow npx @pimzino/spec-workflow-mcp@latest -- /path/to/your/project --AutoStartDashboard --port 3456

# Windows用户（如果基本命令不起作用）
claude mcp add spec-workflow cmd.exe /c "npx @pimzino/spec-workflow-mcp@latest /path/to/your/project"
```

### 故障排除

**问题**: "命令未找到"
```
Error: claude: command not found
```

**解决方案**:
```bash
# 确保全局安装
npm install -g @anthropic-ai/claude-cli

# 检查PATH
echo $PATH
```

**问题**: "路径错误"
```
Error: Project path not found
```

**解决方案**:
- 使用绝对路径
- 确保路径存在
- Windows用户使用正斜杠或双反斜杠

## Claude Desktop

### 配置文件位置

找到Claude Desktop配置文件：
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

### 基本配置

1. **打开配置文件**
   ```bash
   # macOS
   open ~/Library/Application\ Support/Claude/claude_desktop_config.json
   
   # Windows
   notepad %APPDATA%\Claude\claude_desktop_config.json
   ```

2. **添加MCP服务器配置**
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

3. **保存并重启Claude Desktop**

### 高级配置示例

```json
{
  "mcpServers": {
    "spec-workflow": {
      "command": "npx",
      "args": [
        "-y", 
        "@pimzino/spec-workflow-mcp@latest", 
        "/Users/yourname/projects/my-app",
        "--AutoStartDashboard",
        "--port", 
        "3456"
      ]
    }
  }
}
```

### 多个项目配置

```json
{
  "mcpServers": {
    "spec-workflow-project1": {
      "command": "npx",
      "args": ["-y", "@pimzino/spec-workflow-mcp@latest", "/path/to/project1"]
    },
    "spec-workflow-project2": {
      "command": "npx", 
      "args": ["-y", "@pimzino/spec-workflow-mcp@latest", "/path/to/project2"]
    }
  }
}
```

## VSCode扩展

### 安装方法

1. **通过市场安装**
   - 打开VSCode
   - 点击扩展图标（Ctrl+Shift+X）
   - 搜索 "Spec Workflow MCP"
   - 点击安装

2. **通过VSIX安装**
   ```bash
   code --install-extension spec-workflow-mcp-0.0.33.vsix
   ```

### 配置方法

VSCode扩展通常不需要额外配置，但您可以：

1. **设置项目路径**
   - 打开设置（Ctrl+,）
   - 搜索 "Spec Workflow"
   - 设置项目路径

2. **配置语言**
   - 在设置中选择界面语言
   - 支持11种语言

### 扩展设置

在VSCode的 `settings.json` 中添加：

```json
{
  "specWorkflow.projectPath": "/path/to/your/project",
  "specWorkflow.language": "zh",
  "specWorkflow.autoStartDashboard": true,
  "specWorkflow.port": 3456
}
```

## 其他IDE和工具

### Cline/Claude Dev

配置方法与Claude Desktop类似：

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

### Continue IDE扩展

在Continue配置中添加：

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

### Augment Code

在Augment设置中配置：

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

### Cursor IDE

在Cursor的 `settings.json` 中添加：

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

### OpenCode

在 `opencode.json` 中添加：

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

## 故障排除

### 通用问题

**问题**: "npx: command not found"
```
Error: npx: command not found
```

**解决方案**:
```bash
# 确保Node.js和npm已安装
node --version
npm --version

# 安装或更新npm
npm install -g npm
```

**问题**: "Package not found"
```
Error: @pimzino/spec-workflow-mcp@latest not found
```

**解决方案**:
- 检查网络连接
- 验证包名拼写
- 尝试清除npm缓存
```bash
npm cache clean --force
```

**问题**: "Permission denied"
```
Error: EACCES: permission denied
```

**解决方案**:
```bash
# 修复npm权限
sudo chown -R $(whoami) ~/.npm

# 或使用npx（推荐）
npx @pimzino/spec-workflow-mcp@latest
```

### 路径相关问题

**Windows用户特别注意**:
```json
{
  "mcpServers": {
    "spec-workflow": {
      "command": "npx",
      "args": ["-y", "@pimzino/spec-workflow-mcp@latest", "C:/Users/Username/project"]
    }
  }
}
```

**路径包含空格**:
```json
{
  "mcpServers": {
    "spec-workflow": {
      "command": "npx",
      "args": ["-y", "@pimzino/spec-workflow-mcp@latest", "/path/with spaces/project"]
    }
  }
}
```

### 连接问题

**问题**: "Connection refused"
```
Error: Connection refused to MCP server
```

**解决方案**:
1. 检查端口是否被占用
2. 验证防火墙设置
3. 确保服务正在运行
4. 检查日志获取详细信息

## 高级配置

### 环境特定配置

为不同环境创建配置：

```bash
# 开发环境
export PROJECT_PATH="~/dev/my-project"
export DASHBOARD_PORT="3000"

# 生产环境  
export PROJECT_PATH="/var/www/production"
export DASHBOARD_PORT="8080"
```

### 脚本化配置

创建配置脚本：

```bash
#!/bin/bash
# setup-mcp.sh

PROJECT_PATH="$1"
PORT="${2:-3000}"

cat > mcp-config.json << EOF
{
  "mcpServers": {
    "spec-workflow": {
      "command": "npx",
      "args": ["-y", "@pimzino/spec-workflow-mcp@latest", "$PROJECT_PATH", "--AutoStartDashboard", "--port", "$PORT"]
    }
  }
}
EOF

echo "MCP配置已创建: mcp-config.json"
```

### 多实例配置

同时运行多个实例：

```json
{
  "mcpServers": {
    "spec-workflow-frontend": {
      "command": "npx",
      "args": ["-y", "@pimzino/spec-workflow-mcp@latest", "/path/to/frontend"]
    },
    "spec-workflow-backend": {
      "command": "npx",
      "args": ["-y", "@pimzino/spec-workflow-mcp@latest", "/path/to/backend"]
    },
    "spec-workflow-docs": {
      "command": "npx",
      "args": ["-y", "@pimzino/spec-workflow-mcp@latest", "/path/to/docs"]
    }
  }
}
```

## 🔍 验证配置

### 测试连接

在配置完成后，测试MCP服务器：

```bash
# 在AI工具中运行
列出我的规范
```

### 检查日志

查看MCP服务器日志：
- 检查控制台输出
- 查看日志文件（如果有）
- 监控网络连接

### 验证仪表板

如果启用了仪表板：
1. 检查仪表板URL
2. 验证页面加载
3. 测试功能

## 📚 相关文档

- [快速入门指南](quickstart.zh.md)
- [配置指南](configuration.zh.md)
- [故障排除指南](troubleshooting.zh.md)
- [工具官方文档](https://github.com/modelcontextprotocol)

## 📞 获取帮助

如果在配置MCP客户端时遇到问题：

1. 检查配置文件语法
2. 验证路径和权限
3. 查看客户端特定文档
4. 在GitHub上创建Issue
5. 提供详细的错误信息和配置

正确配置MCP客户端后，您就可以开始使用Spec Workflow MCP的全部功能了！🚀