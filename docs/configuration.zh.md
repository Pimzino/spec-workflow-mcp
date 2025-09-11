# 配置指南

[English](configuration.md) | **中文**

本指南详细介绍 Spec Workflow MCP 的配置选项和使用方法。

## 📋 目录

1. [配置方法](#配置方法)
2. [配置文件格式](#配置文件格式)
3. [配置选项详解](#配置选项详解)
4. [命令行参数](#命令行参数)
5. [配置示例](#配置示例)
6. [高级配置](#高级配置)
7. [故障排除](#故障排除)

## 配置方法

Spec Workflow MCP 支持三种配置方式，按优先级排序：

### 1. 命令行参数（最高优先级）
```bash
spec-workflow-mcp /path/to/project --port 3000 --AutoStartDashboard
```

### 2. 配置文件
创建 `.spec-workflow/config.toml` 文件：
```toml
port = 3000
autoStartDashboard = true
```

### 3. 内置默认值（最低优先级）
当没有提供配置时使用的默认值。

## 配置文件格式

配置文件使用 [TOML](https://toml.io/) 格式，一种易读的配置文件格式。

### 基本结构
```toml
# 这是注释
key = "value"
number = 123
boolean = true

[nested_section]
key = "value"
```

### 配置文件位置
- **默认位置**: `项目目录/.spec-workflow/config.toml`
- **自定义位置**: 使用 `--config` 参数指定

## 配置选项详解

### `projectDir` - 项目目录
指定要管理的项目路径。

```toml
projectDir = "/path/to/your/project"
# 或使用相对路径
projectDir = "./my-project"
# 或使用家目录
projectDir = "~/projects/my-app"
```

**默认值**: 当前工作目录
**注意**: Windows用户可能需要使用双反斜杠 `\`

### `port` - 仪表板端口
设置Web仪表板的端口号。

```toml
port = 3000
# 或任何1024-65535之间的有效端口
port = 8080
port = 3456
```

**要求**: 必须是1024-65535之间的整数
**默认值**: 自动分配临时端口

### `autoStartDashboard` - 自动启动仪表板
控制是否在MCP服务器启动时自动打开仪表板。

```toml
autoStartDashboard = true   # 启用自动启动
autoStartDashboard = false  # 禁用自动启动
```

**默认值**: `false`

### `dashboardOnly` - 仅仪表板模式
仅运行Web仪表板，不启动MCP服务器。

```toml
dashboardOnly = true   # 仅仪表板模式
dashboardOnly = false  # 完整模式（MCP + 仪表板）
```

**默认值**: `false`

### `lang` - 界面语言
设置仪表板和扩展的界面语言。

```toml
lang = "zh"  # 中文
lang = "en"  # 英文
lang = "ja"  # 日文
```

**支持的语言**: 
- `en` - English
- `zh` - 中文
- `ja` - 日本語
- `es` - Español
- `pt` - Português
- `de` - Deutsch
- `fr` - Français
- `ru` - Русский
- `it` - Italiano
- `ko` - 한국어
- `ar` - العربية

**默认值**: 系统语言或 `en`

## 命令行参数

### 基本参数
```bash
# 帮助信息
spec-workflow-mcp --help

# 项目路径
spec-workflow-mcp /path/to/project

# 自定义配置文件
spec-workflow-mcp --config /path/to/config.toml
```

### 模式参数
```bash
# 仅仪表板模式
spec-workflow-mcp --dashboard

# 自动启动仪表板
spec-workflow-mcp --AutoStartDashboard

# 指定端口
spec-workflow-mcp --port 3000
```

### 参数格式
支持两种格式：
```bash
# 空格分隔格式
--port 3000
--config ./config.toml

# 等号格式
--port=3000
--config=./config.toml
```

## 配置示例

### 示例1：开发环境
```toml
# 开发配置
projectDir = "~/dev/my-project"
port = 3000
autoStartDashboard = true
lang = "zh"
```

### 示例2：生产环境
```toml
# 生产配置
projectDir = "/var/www/production"
port = 8080
autoStartDashboard = false
lang = "en"
```

### 示例3：仅仪表板
```toml
# 仅仪表板配置
projectDir = "."
dashboardOnly = true
port = 3456
lang = "zh"
```

### 示例4：多语言项目
```toml
# 国际化配置
projectDir = "~/projects/global-app"
port = 3000
autoStartDashboard = true
lang = "zh"  # 中文界面
```

## 高级配置

### 环境变量
虽然主要使用配置文件，但某些设置可以通过环境变量覆盖：

```bash
# 设置默认端口
export SPEC_WORKFLOW_PORT=3000

# 设置语言
export SPEC_WORKFLOW_LANG=zh

# 然后运行
spec-workflow-mcp /path/to/project
```

### 多环境配置
为不同环境创建多个配置文件：

```
project/
├── .spec-workflow/
│   ├── config.development.toml
│   ├── config.staging.toml
│   └── config.production.toml
```

使用方式：
```bash
# 开发环境
spec-workflow-mcp --config .spec-workflow/config.development.toml

# 生产环境
spec-workflow-mcp --config .spec-workflow/config.production.toml
```

### 配置验证
系统会在启动时验证配置：

1. **端口验证**: 检查是否在有效范围内
2. **路径验证**: 确保项目目录存在
3. **语言验证**: 确认支持所选语言
4. **格式验证**: 验证TOML语法

## 故障排除

### 配置加载失败

**问题**: 配置文件无法加载
```
Error: Failed to load config file: Config file not found
```

**解决方案**:
1. 检查文件路径是否正确
2. 确保文件有读取权限
3. 验证TOML语法

### 端口冲突

**问题**: 端口已被占用
```
Error: Port 3000 is already in use
```

**解决方案**:
1. 使用不同的端口
2. 找出占用端口的进程
3. 使用临时端口（不指定端口）

### 无效配置值

**问题**: 配置值超出范围
```
Error: Port 99999 is out of range. Port must be between 1024 and 65535.
```

**解决方案**:
1. 检查配置值的范围
2. 参考文档中的有效值
3. 使用默认值

### 路径问题

**问题**: 项目路径无效
```
Error: Project directory does not exist: /invalid/path
```

**解决方案**:
1. 检查路径是否存在
2. 使用绝对路径
3. 验证路径权限

## 💡 最佳实践

### 1. 使用版本控制
将配置文件纳入版本控制：
```bash
git add .spec-workflow/config.toml
git commit -m "Add spec workflow configuration"
```

### 2. 环境分离
为不同环境使用不同配置：
- 开发环境：启用自动启动，使用调试端口
- 生产环境：禁用自动启动，使用标准端口

### 3. 文档化配置
在配置文件中添加注释：
```toml
# 生产环境配置
# 最后更新: 2024-01-01
projectDir = "/var/www/my-app"
port = 8080  # 使用标准HTTP端口
```

### 4. 备份配置
定期备份配置文件：
```bash
cp .spec-workflow/config.toml .spec-workflow/config.toml.backup
```

## 📚 相关文档

- [快速入门指南](quickstart.zh.md)
- [MCP客户端设置](mcp-client-setup.zh.md)
- [故障排除指南](troubleshooting.zh.md)
- [架构概览](technical-documentation/architecture.zh.md)

## 📞 获取帮助

如果配置问题无法解决：

1. 检查配置文件语法
2. 验证所有路径和权限
3. 查看错误日志获取详细信息
4. 在GitHub上创建Issue
5. 提供配置文件内容（移除敏感信息）

配置系统的设计旨在提供最大的灵活性，同时保持简单易用。通过正确配置，您可以优化Spec Workflow MCP以适应您的特定需求和工作流程。