# 故障排除与 FAQ

> **快速修复**: 90% 的问题可先查阅[常见问题](#-常见问题)解决。

## 🚨 常见问题

### MCP 服务器无法启动

**现象**: AI 客户端连接报错、服务器无响应

**最常见原因**：

1. **Node.js 版本不匹配**
   ```bash
   # 查看版本  
   node --version
   # 需要 >= 18.0.0
   
   # 处理：升级 Node.js（nvm 或官网安装）
   ```

2. **路径问题**
   ```json
   // ❌ 错误 - 相对路径
   {
     "command": "npx",
     "args": ["-y", "@pimzino/spec-workflow-mcp@latest", "./my-project"]
   }
   
   // ✅ 正确 - 绝对路径
   {
     "command": "npx",
     "args": ["-y", "@pimzino/spec-workflow-mcp@latest", "/full/path/to/project"]
   }
   ```

3. **NPX 缓存问题**
   ```bash
   # 清理 npx 缓存
   npm cache clean --force
   npx clear-npx-cache
   ```

**快速自检**：
```bash
# 手动测试服务器
cd /your/project/path
npx -y @pimzino/spec-workflow-mcp@latest --help

# 若可运行，则检查 AI 客户端配置
```

---

### 仪表板无法打开

**现象**: 仪表板 URL 404 或连接被拒绝

**解决步骤**：

1. **检查运行状态**
   ```bash
   # 仪表板是否运行
   netstat -tulpn | grep :3456
   # 或检查进程
   ps aux | grep spec-workflow
   ```

2. **手动启动仪表板**
   ```bash
   # 单独启动仪表板
   cd /your/project
   npx -y @pimzino/spec-workflow-mcp@latest --dashboard
   ```

3. **端口冲突**
   ```bash
   # 使用其他端口
   npx -y @pimzino/spec-workflow-mcp@latest --dashboard --port 8080
   ```

4. **会话文件问题**
   ```bash
   # 移除过期会话
   rm -f .spec-workflow/session.json
   ```

---

### 审批系统无响应

**现象**: 审批状态长期为 "pending"，按钮无效

**排查**：

1. **检查审批文件**
   ```bash
   ls -la .spec-workflow/approvals/
   # 应看到审批 JSON 文件
   ```

2. **浏览器控制台错误**
   - 打开 DevTools（F12）  
   - Console 查看 JS 错误
   - Network 查看失败请求

3. **WebSocket 连接**
   ```javascript
   // 浏览器控制台
   console.log('WebSocket state:', WebSocket.CONNECTING);
   // 应显示活跃连接
   ```

4. **清理浏览器缓存**
   - 强制刷新（Ctrl+Shift+R）
   - 清空对应域名的 localStorage/cookies

---

### 文件权限错误

**现象**: 出现 "EACCES"、"Permission denied"

**解决**：

1. **检查目录权限**
   ```bash
   ls -la /path/to/project
   
   # 修复权限  
   chmod -R 755 /path/to/project
   ```

2. **`.spec-workflow/` 目录**
   ```bash
   # 如需手动创建
   mkdir -p .spec-workflow/specs .spec-workflow/steering .spec-workflow/approvals
   
   # 修复权限
   chmod -R 755 .spec-workflow/
   ```

3. **Windows 特有问题**
   ```powershell
   # 以管理员运行
   # 或在文件夹属性 → 安全 中检查权限
   ```

---

### 工具返回空结果

**现象**: `spec-list` 无规范，加载上下文工具为空

**排查**：

1. **检查文件结构**
   ```bash
   tree .spec-workflow/
   # 应包含 specs/、steering/ 等
   ```

2. **校验文件内容**
   ```bash
   # 检查规范文件是否存在并非空
   find .spec-workflow/specs -name "*.md" -exec ls -la {} \;
   ```

3. **路径解析问题**
   ```bash
   # 使用绝对路径进行工具调用
   pwd
   ```

## 🔧 高级调试

### MCP 协议调试

**启用调试日志**：
```bash
# 设置调试环境变量
DEBUG=spec-workflow-mcp* npm run dev

# 生产环境
DEBUG=spec-workflow-mcp* node dist/index.js
```

**查看 MCP 消息**：
```json
// 在 AI 客户端日志中查找类似内容
{
  "jsonrpc": "2.0", 
  "method": "tools/call",
  "params": {
    "name": "spec-workflow-guide"
  }
}
```

### 仪表板后端调试

**服务器日志**：
```bash
# 启动并开启详细日志
npm run dev -- --verbose

# 检查 Fastify 日志
# 关注 WebSocket 连接信息
```

**API 测试**：
```bash
# 直接测试端点
curl http://localhost:3456/api/test
curl http://localhost:3456/api/specs
```

### 文件系统调试

**文件监听问题**：
```bash
# 检查 chokidar 是否正确监听
# 查看日志中的文件变更事件

# 手动触发文件修改
# 应触发文件监听
```

**跨平台路径问题**：
```javascript
// 路径解析调试
const path = require('path');
console.log('Resolved:', path.resolve('/your/project'));
console.log('Platform:', process.platform);
```

## 🐛 错误消息与解决

### `Tool execution failed: ENOENT`

**含义**: 找不到文件或目录

**处理**：
1. 确认 `.spec-workflow/` 存在
2. 校验规范名称拼写
3. 工具调用使用绝对路径

### `WORKFLOW VIOLATION: Cannot create design.md`

**含义**: 试图越序创建文档

**解决**: 遵循顺序：
1. 先创建 requirements.md
2. 完成审批
3. 再创建 design.md

### `Approval not found or still pending`

**含义**: 试图删除不存在或未批准的审批

**处理**：
1. 先查询审批状态
2. 在批准后再删除  
3. 清理成功前不要继续

### `Port X is already in use`

**含义**: 仪表板端口被占用

**处理**：
```bash
# 杀掉占用进程
lsof -ti:3456 | xargs kill -9

# 或更换端口
--port 8080
```

### `Session file corrupted`

**含义**: session.json 非法 JSON

**处理**：
```bash
# 移除后重建
rm .spec-workflow/session.json
# 重启 MCP 服务器
```

## ❓ 常见问答

### Q: MCP 配置可用相对路径吗？
**A**: 某些 MCP 客户端不保证解析相对路径，建议总是用绝对路径：
```json
{
  "args": ["-y", "@pimzino/spec-workflow-mcp@latest", "/full/path/to/project"]
}
```

### Q: 如何彻底重置？
**A**: 删除工作流目录：
```bash  
rm -rf .spec-workflow/
# 服务器会自动重建
```

### Q: 多个 AI 客户端可同时使用同一项目吗？
**A**: 可以，但每个项目仅建议一个仪表板实例。多个 MCP 客户端可连接，但共享同一审批工作流。

### Q: 为什么必须通过仪表板/VS Code 审批？
**A**: 防止 AI 失控，保持质量和可控性，系统要求人工审批。

### Q: 可以自定义模板吗？
**A**: 工具侧不直接支持。模板内置在服务器中，但可在文档生成后修改内容。

### Q: 如何备份规范？
**A**: 整个工作流位于 `.spec-workflow/`：
```bash
# 备份
# tar -czf spec-backup.tar.gz .spec-workflow/

# 恢复
# tar -xzf spec-backup.tar.gz
```

### Q: 直接修改文件会怎样？
**A**: 文件监听会自动更新仪表板。但手改可能破坏工作流状态，请谨慎。

### Q: 仪表板可单独运行吗？
**A**: 可以，使用仅仪表板模式：
```bash
npx -y @pimzino/spec-workflow-mcp@latest --dashboard
```

### Q: 如何升级到最新版？
**A**: NPX 使用 `@latest` 会自动取最新。若需强制：
```bash
npm cache clean --force
npx -y @pimzino/spec-workflow-mcp@latest --help
```

---

**最后更新**: 2024 年 12 月 | **下一步**: [贡献指南 →](contributing.md)
