# 故障排除指南

本指南帮助您解决 Spec Workflow MCP 的常见问题。

## 快速诊断

### 检查安装
```bash
# 验证 npm 包是否可访问
npx -y @pimzino/spec-workflow-mcp@latest --help

# 检查是否在正确的目录中运行
pwd  # 或在 Windows 上使用 'cd'

# 验证 .spec-workflow 目录是否存在
ls -la .spec-workflow  # 或在 Windows 上使用 'dir .spec-workflow'
```

### 检查服务
```bash
# 测试 MCP 服务器
npx -y @pimzino/spec-workflow-mcp@latest /path/to/project

# 测试仪表板
npx -y @pimzino/spec-workflow-mcp@latest /path/to/project --dashboard

# 检查端口可用性
netstat -an | grep 3000  # macOS/Linux
netstat -an | findstr :3000  # Windows
```

## 常见问题和解决方案

## 安装问题

### 找不到 NPM 包

**错误**：`npm ERR! 404 Not Found - @pimzino/spec-workflow-mcp@latest`

**解决方案**：
1. 检查互联网连接
2. 清除 npm 缓存：
   ```bash
   npm cache clean --force
   ```
3. 尝试不带版本标签：
   ```bash
   npx @pimzino/spec-workflow-mcp /path/to/project
   ```
4. 先全局安装：
   ```bash
   npm install -g @pimzino/spec-workflow-mcp
   spec-workflow-mcp /path/to/project
   ```

### 权限被拒绝

**错误**：`EACCES: permission denied`

**解决方案**：
1. **macOS/Linux**：使用正确的 npm 权限：
   ```bash
   npm config set prefix ~/.npm-global
   export PATH=~/.npm-global/bin:$PATH
   ```
2. **Windows**：以管理员身份运行或修复 npm 权限：
   ```bash
   npm config set prefix %APPDATA%\npm
   ```
3. 使用带 -y 标志的 npx：
   ```bash
   npx -y @pimzino/spec-workflow-mcp@latest
   ```

## MCP 服务器问题

### 服务器无法启动

**错误**：`Failed to start MCP server`

**解决方案**：
1. 检查 Node.js 版本：
   ```bash
   node --version  # 应为 18.0 或更高
   ```
2. 验证项目路径是否存在：
   ```bash
   ls -la /path/to/project
   ```
3. 检查冲突进程：
   ```bash
   ps aux | grep spec-workflow  # macOS/Linux
   tasklist | findstr spec-workflow  # Windows
   ```
4. 尝试使用绝对路径：
   ```bash
   npx -y @pimzino/spec-workflow-mcp@latest $(pwd)
   ```

### MCP 无法连接到 AI 工具

**错误**：`MCP server unreachable` 或 `Connection refused`

**解决方案**：

1. **Claude Desktop**：检查配置文件：
   ```json
   {
     "mcpServers": {
       "spec-workflow": {
         "command": "npx",
         "args": ["-y", "@pimzino/spec-workflow-mcp@latest", "/absolute/path/to/project"]
       }
     }
   }
   ```

2. **Claude Code CLI**：验证设置：
   ```bash
   claude mcp list  # 检查 spec-workflow 是否列出
   claude mcp remove spec-workflow  # 如果存在则删除
   claude mcp add spec-workflow npx @pimzino/spec-workflow-mcp@latest -- /path/to/project
   ```

3. **路径问题**：确保路径是绝对路径且存在：
   - ❌ `~/project` 或 `./project`
   - ✅ `/Users/name/project` 或 `C:\Users\name\project`

### 工具不可用

**错误**：`Tool 'spec-workflow' not found`

**解决方案**：
1. 完全重启您的 AI 工具
2. 检查 MCP 服务器是否正在运行（查找进程）
3. 验证配置是否正确保存
4. 尝试明确提及工具："使用 spec-workflow 创建规格"

## 仪表板问题

### 仪表板无法加载

**错误**：`Cannot connect to dashboard` 或空白页面

**解决方案**：
1. 验证仪表板是否已启动：
   ```bash
   npx -y @pimzino/spec-workflow-mcp@latest /path --dashboard
   ```
2. 在浏览器中检查 URL（注意端口）：
   ```
   http://localhost:3000  # 或显示的任何端口
   ```
3. 尝试不同的浏览器或隐身模式
4. 检查浏览器控制台中的错误（F12 → 控制台）
5. 暂时禁用浏览器扩展

### 端口已被使用

**错误**：`Error: listen EADDRINUSE: address already in use :::3000`

**解决方案**：
1. 使用不同的端口：
   ```bash
   npx -y @pimzino/spec-workflow-mcp@latest /path --dashboard --port 3456
   ```
2. 查找并终止使用该端口的进程：
   ```bash
   # macOS/Linux
   lsof -i :3000
   kill -9 [PID]

   # Windows
   netstat -ano | findstr :3000
   taskkill /PID [PID] /F
   ```
3. 使用临时端口（省略 --port 标志）：
   ```bash
   npx -y @pimzino/spec-workflow-mcp@latest /path --dashboard
   ```

### WebSocket 连接失败

**错误**：`WebSocket connection lost` 或实时更新不起作用

**解决方案**：
1. 刷新浏览器页面
2. 检查防火墙是否阻止 WebSocket
3. 验证仪表板和 MCP 服务器是否从同一项目运行
4. 检查浏览器控制台中的特定错误
5. 尝试不同的网络（如果在公司网络上）

### 仪表板未更新

**症状**：更改未实时反映

**解决方案**：
1. 硬刷新浏览器（Ctrl+Shift+R 或 Cmd+Shift+R）
2. 清除浏览器缓存
3. 检查 WebSocket 连接状态（应显示绿色）
4. 验证文件系统监视器是否正常工作：
   ```bash
   # 在项目中创建测试文件
   touch .spec-workflow/test.md
   # 应在仪表板中触发更新
   ```

## 审批系统问题

### 审批未显示

**错误**：仪表板中无审批通知

**解决方案**：
1. 确保仪表板与 MCP 服务器一起运行：
   ```bash
   # 使用自动启动
   npx -y @pimzino/spec-workflow-mcp@latest /path --AutoStartDashboard

   # 或分别运行两者
   # 终端 1：
   npx -y @pimzino/spec-workflow-mcp@latest /path
   # 终端 2：
   npx -y @pimzino/spec-workflow-mcp@latest /path --dashboard
   ```
2. 检查审批目录是否存在：
   ```bash
   ls -la .spec-workflow/approval/
   ```
3. 通过 AI 手动触发审批请求

### 无法批准文档

**错误**：审批按钮不起作用

**解决方案**：
1. 检查浏览器控制台中的 JavaScript 错误
2. 验证您是否在正确的规格页面上
3. 确保文档具有待审批状态
4. 尝试使用 VSCode 扩展（如果可用）

## 文件系统问题

### 规格文件未创建

**错误**：规格文档未出现在文件系统中

**解决方案**：
1. 检查写入权限：
   ```bash
   touch .spec-workflow/test.txt
   ```
2. 验证正确的工作目录：
   ```bash
   pwd  # 应为您的项目根目录
   ```
3. 查找隐藏文件：
   ```bash
   ls -la .spec-workflow/specs/
   ```
4. 检查防病毒软件是否阻止文件创建

### 文件权限被拒绝

**错误**：创建规格时出现 `EACCES` 或 `Permission denied`

**解决方案**：
1. 修复目录权限：
   ```bash
   chmod -R 755 .spec-workflow  # macOS/Linux
   ```
2. 检查文件所有权：
   ```bash
   ls -la .spec-workflow
   # 应由您的用户拥有
   ```
3. 从您拥有的目录运行（不是系统目录）

## VSCode 扩展问题

### 扩展无法加载

**错误**：Spec Workflow 图标未出现在活动栏中

**解决方案**：
1. 验证扩展是否已安装：
   - 打开扩展（Ctrl+Shift+X）
   - 搜索 "Spec Workflow MCP"
   - 检查是否已安装并启用
2. 重新加载 VSCode 窗口：
   - Ctrl+Shift+P → "Developer: Reload Window"
3. 检查扩展输出：
   - 视图 → 输出 → 从下拉菜单中选择 "Spec Workflow"
4. 确保项目有 `.spec-workflow` 目录

### 扩展命令不起作用

**错误**：命令失败或显示错误

**解决方案**：
1. 打开包含 `.spec-workflow` 的项目文件夹
2. 检查 VSCode 是否使用正确的工作区
3. 查看扩展日志以获取特定错误
4. 尝试重新安装扩展：
   ```bash
   code --uninstall-extension Pimzino.spec-workflow-mcp
   code --install-extension Pimzino.spec-workflow-mcp
   ```

## 配置问题

### 配置文件未加载

**错误**：config.toml 中的设置未被应用

**解决方案**：
1. 验证 TOML 语法：
   ```bash
   # 安装 TOML 验证器
   npm install -g @iarna/toml
   toml .spec-workflow/config.toml
   ```
2. 检查文件位置：
   - 默认：`.spec-workflow/config.toml`
   - 自定义：使用 `--config` 标志
3. 确保没有语法错误：
   ```toml
   # 正确
   port = 3000
   lang = "en"

   # 错误
   port: 3000  # 应使用 = 而不是 :
   lang = en   # 应有引号
   ```

### 命令行参数不起作用

**错误**：像 `--port` 这样的标志被忽略

**解决方案**：
1. 检查参数顺序：
   ```bash
   # 正确
   npx -y @pimzino/spec-workflow-mcp@latest /path --dashboard --port 3000

   # 错误
   npx -y @pimzino/spec-workflow-mcp@latest --dashboard /path --port 3000
   ```
2. 确保标志值有效：
   - 端口：1024-65535
   - 语言：en, ja, zh, es, pt, de, fr, ru, it, ko, ar
3. 使用 `--help` 查看所有选项

## 性能问题

### 响应时间慢

**症状**：仪表板或工具响应缓慢

**解决方案**：
1. 检查系统资源：
   ```bash
   # CPU 和内存使用情况
   top  # macOS/Linux
   taskmgr  # Windows
   ```
2. 在大型项目中减少文件监视器：
   ```toml
   # config.toml
   [watcher]
   enabled = false
   ```
3. 清除旧的审批记录：
   ```bash
   rm -rf .spec-workflow/approval/completed/*
   ```
4. 使用特定规格名称而不是列出所有

### 高内存使用

**解决方案**：
1. 定期重启服务
2. 限制仪表板刷新率：
   ```json
   // VSCode 设置
   "specWorkflow.tasks.refreshInterval": 10000
   ```
3. 归档已完成的规格
4. 清除仪表板的浏览器缓存

## 网络问题

### 公司代理后面

**解决方案**：
1. 配置 npm 代理：
   ```bash
   npm config set proxy http://proxy.company.com:8080
   npm config set https-proxy http://proxy.company.com:8080
   ```
2. 使用本地安装：
   ```bash
   npm install @pimzino/spec-workflow-mcp
   node node_modules/@pimzino/spec-workflow-mcp/dist/index.js /path
   ```

### 防火墙阻止连接

**解决方案**：
1. 允许 Node.js 通过防火墙
2. 使用 localhost 而不是 0.0.0.0
3. 配置特定端口规则
4. 尝试不同的端口范围

## 特定平台问题

### Windows

#### 路径格式问题
**错误**：`Invalid path` 或找不到路径

**解决方案**：
```bash
# 使用正斜杠
npx -y @pimzino/spec-workflow-mcp@latest C:/Users/name/project

# 或转义的反斜杠
npx -y @pimzino/spec-workflow-mcp@latest "C:\\Users\\name\\project"
```

#### PowerShell 执行策略
**错误**：`cannot be loaded because running scripts is disabled`

**解决方案**：
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### macOS

#### Gatekeeper 阻止
**错误**：`cannot be opened because the developer cannot be verified`

**解决方案**：
1. 系统偏好设置 → 安全性与隐私 → 允许
2. 或删除隔离：
   ```bash
   xattr -d com.apple.quarantine /path/to/node_modules
   ```

### Linux

#### 缺少依赖项
**错误**：`shared library not found`

**解决方案**：
```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install build-essential

# RHEL/CentOS
sudo yum groupinstall "Development Tools"
```

## 获取帮助

### 诊断信息

报告问题时，请包括：

1. **系统信息**：
   ```bash
   node --version
   npm --version
   uname -a  # 或在 Windows 上使用 'ver'
   ```

2. **错误消息**：
   - 完整的错误文本
   - 可视问题的截图
   - 浏览器控制台日志

3. **配置**：
   - MCP 客户端配置
   - config.toml 内容
   - 使用的命令行

4. **重现步骤**：
   - 运行的确切命令
   - 预期行为
   - 实际行为

### 支持渠道

1. **GitHub Issues**：[创建问题](https://github.com/Pimzino/spec-workflow-mcp/issues)
2. **文档**：检查 `/docs` 中的其他指南
3. **社区**：讨论和问答

### 调试模式

启用详细日志记录：

```bash
# 设置环境变量
export DEBUG=spec-workflow:*  # macOS/Linux
set DEBUG=spec-workflow:*  # Windows

# 使用调试输出运行
npx -y @pimzino/spec-workflow-mcp@latest /path --debug
```

## 预防提示

### 最佳实践

1. **始终在配置中使用绝对路径**
2. **保持 Node.js 更新**（需要 v18+）
3. **从项目根目录运行**
4. **使用 --help 验证**选项
5. **出现问题时在干净环境中测试**
6. **在假设失败前检查日志**
7. **定期备份 .spec-workflow** 目录

### 定期维护

1. 每月清除旧审批
2. 归档已完成的规格
3. 定期更新 npm 包
4. 监控日志的磁盘空间
5. 更新后重启服务

## 相关文档

- [配置指南](CONFIGURATION.zh.md) - 详细的配置选项
- [用户指南](USER-GUIDE.zh.md) - 一般使用说明
- [开发指南](DEVELOPMENT.zh.md) - 用于贡献修复
- [界面指南](INTERFACES.zh.md) - 仪表板和扩展详情
