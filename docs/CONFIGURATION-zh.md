# 配置指南

本指南涵盖 Spec Workflow MCP 的所有配置选项，包括命令行参数、配置文件和环境设置。

## 命令行选项

### 基本用法

```bash
npx -y @pimzino/spec-workflow-mcp@latest [项目路径] [选项]
```

### 可用选项

| 选项 | 描述 | 示例 |
|--------|-------------|---------|
| `--help` | 显示详细使用信息 | `npx -y @pimzino/spec-workflow-mcp@latest --help` |
| `--dashboard` | 运行纯仪表板模式（无 MCP 服务器） | `npx -y @pimzino/spec-workflow-mcp@latest --dashboard` |
| `--AutoStartDashboard` | 随 MCP 服务器自动启动仪表板 | `npx -y @pimzino/spec-workflow-mcp@latest --AutoStartDashboard` |
| `--port <数字>` | 指定仪表板端口（1024-65535） | `npx -y @pimzino/spec-workflow-mcp@latest --port 3456` |
| `--config <路径>` | 使用自定义配置文件 | `npx -y @pimzino/spec-workflow-mcp@latest --config ./my-config.toml` |

### 使用示例

#### 纯仪表板模式
```bash
# 使用临时端口
npx -y @pimzino/spec-workflow-mcp@latest /path/to/project --dashboard

# 使用自定义端口
npx -y @pimzino/spec-workflow-mcp@latest /path/to/project --dashboard --port 3000
```

#### MCP 服务器自动启动仪表板
```bash
# 默认端口
npx -y @pimzino/spec-workflow-mcp@latest /path/to/project --AutoStartDashboard

# 自定义端口
npx -y @pimzino/spec-workflow-mcp@latest /path/to/project --AutoStartDashboard --port 3456
```

#### 使用自定义配置
```bash
# 相对路径
npx -y @pimzino/spec-workflow-mcp@latest --config ./dev-config.toml

# 绝对路径
npx -y @pimzino/spec-workflow-mcp@latest --config ~/configs/spec-workflow.toml

# 带仪表板的自定义配置
npx -y @pimzino/spec-workflow-mcp@latest --config ./config.toml --dashboard

# CLI 参数覆盖配置值
npx -y @pimzino/spec-workflow-mcp@latest --config ./config.toml --port 4000
```

## 配置文件

### 默认位置

服务器在以下位置查找配置: `<项目目录>/.spec-workflow/config.toml`

### 文件格式

配置使用 TOML 格式。以下是完整示例:

```toml
# 项目目录（默认为当前目录）
projectDir = "/path/to/your/project"

# 仪表板端口（1024-65535）
port = 3456

# 随 MCP 服务器自动启动仪表板
autoStartDashboard = true

# 运行纯仪表板模式
dashboardOnly = false

# 界面语言
# 选项: en, ja, zh, es, pt, de, fr, ru, it, ko, ar
lang = "en"

# 声音通知（仅限 VSCode 扩展）
[notifications]
enabled = true
volume = 0.5

# 高级设置
[advanced]
# WebSocket 重连尝试次数
maxReconnectAttempts = 10

# 文件监控设置
[watcher]
enabled = true
debounceMs = 300
```

### 配置选项

#### 基本设置

| 选项 | 类型 | 默认值 | 描述 |
|--------|------|---------|-------------|
| `projectDir` | string | 当前目录 | 项目目录路径 |
| `port` | number | 临时端口 | 仪表板端口（1024-65535） |
| `autoStartDashboard` | boolean | false | 随 MCP 自动启动仪表板 |
| `dashboardOnly` | boolean | false | 运行纯仪表板（无 MCP 服务器） |
| `lang` | string | "en" | 界面语言 |

#### 语言选项

- `en` - 英语 (English)
- `ja` - 日语 (日本語)
- `zh` - 中文
- `es` - 西班牙语 (Español)
- `pt` - 葡萄牙语 (Português)
- `de` - 德语 (Deutsch)
- `fr` - 法语 (Français)
- `ru` - 俄语 (Русский)
- `it` - 意大利语 (Italiano)
- `ko` - 韩语 (한국어)
- `ar` - 阿拉伯语 (العربية)

### 创建自定义配置

1. 复制示例配置:
```bash
cp .spec-workflow/config.example.toml .spec-workflow/config.toml
```

2. 编辑配置:
```toml
# 我的项目配置
projectDir = "/Users/myname/projects/myapp"
port = 3000
autoStartDashboard = true
lang = "zh"
```

3. 使用配置:
```bash
# 自动使用 .spec-workflow/config.toml
npx -y @pimzino/spec-workflow-mcp@latest

# 或显式指定
npx -y @pimzino/spec-workflow-mcp@latest --config .spec-workflow/config.toml
```

## 配置优先级

配置值按以下顺序应用（优先级从高到低）:

1. **命令行参数** - 始终优先
2. **自定义配置文件** - 通过 `--config` 指定
3. **默认配置文件** - `.spec-workflow/config.toml`
4. **内置默认值** - 回退值

### 优先级示例

```toml
# config.toml
port = 3000
autoStartDashboard = true
```

```bash
# 命令行参数覆盖配置文件
npx -y @pimzino/spec-workflow-mcp@latest --config config.toml --port 4000
# 结果: port = 4000 (CLI 优先)
```

## 环境特定配置

### 开发环境配置

```toml
# dev-config.toml
projectDir = "./src"
port = 3000
autoStartDashboard = true
lang = "zh"

[advanced]
debugMode = true
verboseLogging = true
```

用法:
```bash
npx -y @pimzino/spec-workflow-mcp@latest --config dev-config.toml
```

### 生产环境配置

```toml
# prod-config.toml
projectDir = "/var/app"
port = 8080
autoStartDashboard = false
lang = "en"

[advanced]
debugMode = false
verboseLogging = false
```

用法:
```bash
npx -y @pimzino/spec-workflow-mcp@latest --config prod-config.toml
```

## 端口配置

### 有效端口范围

端口必须在 1024 到 65535 之间。

### 临时端口

未指定端口时，系统会自动选择可用的临时端口。推荐用于:
- 开发环境
- 同时运行多个项目
- 避免端口冲突

### 固定端口

在以下情况使用固定端口:
- 需要一致的 URL 以便收藏
- 与其他工具集成
- 团队协作使用共享配置

### 端口冲突解决

如果端口已被占用:

1. **检查是什么占用了端口:**
   - Windows: `netstat -an | findstr :3000`
   - macOS/Linux: `lsof -i :3000`

2. **解决方案:**
   - 使用不同端口: `--port 3001`
   - 终止占用端口的进程
   - 省略 `--port` 以使用临时端口

## 多项目设置

### 独立配置

创建项目特定的配置:

```bash
# 项目 A
project-a/
  .spec-workflow/
    config.toml  # port = 3000

# 项目 B
project-b/
  .spec-workflow/
    config.toml  # port = 3001
```

### 共享配置

使用带覆盖的共享配置:

```bash
# 共享基础配置
~/configs/spec-workflow-base.toml

# 项目特定覆盖
npx -y @pimzino/spec-workflow-mcp@latest \
  --config ~/configs/spec-workflow-base.toml \
  --port 3000 \
  /path/to/project-a
```

## VSCode 扩展配置

VSCode 扩展有自己的设置:

1. 打开 VSCode 设置 (Cmd/Ctrl + ,)
2. 搜索 "Spec Workflow"
3. 配置:
   - 语言偏好
   - 声音通知
   - 归档可见性
   - 自动刷新间隔

## 配置故障排除

### 配置未加载

1. **检查文件位置:**
   ```bash
   ls -la .spec-workflow/config.toml
   ```

2. **验证 TOML 语法:**
   ```bash
   # 安装 toml CLI 工具
   npm install -g @iarna/toml

   # 验证
   toml .spec-workflow/config.toml
   ```

3. **检查权限:**
   ```bash
   # 确保文件可读
   chmod 644 .spec-workflow/config.toml
   ```

### 常见问题

| 问题 | 解决方案 |
|-------|----------|
| 端口已被占用 | 使用不同端口或省略以使用临时端口 |
| 找不到配置文件 | 检查路径，必要时使用绝对路径 |
| 无效的 TOML 语法 | 使用 TOML 检查器验证 |
| 设置未生效 | 检查配置优先级 |

## 最佳实践

1. **使用版本控制** 管理配置文件
2. **在项目 README 中记录** 自定义设置
3. **在开发中使用临时端口**
4. **将敏感数据** 排除在配置文件之外
5. **创建环境特定的** 配置
6. **在部署前测试** 配置更改

## 相关文档

- [用户指南](USER-GUIDE.md) - 使用已配置的服务器
- [界面指南](INTERFACES.md) - 仪表板和扩展设置
- [故障排除](TROUBLESHOOTING.md) - 常见配置问题

