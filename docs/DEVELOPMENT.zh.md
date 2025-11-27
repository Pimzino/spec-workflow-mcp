# 开发指南

本指南涵盖设置开发环境、构建项目、贡献代码以及理解 Spec Workflow MCP 的架构。

## 前置要求

### 必需软件

- **Node.js** 18.0 或更高版本
- **npm** 9.0 或更高版本
- **Git** 用于版本控制
- **TypeScript** 知识有帮助

### 推荐工具

- **VSCode** 带 TypeScript 扩展
- **Chrome/Edge DevTools** 用于仪表板调试
- **Postman/Insomnia** 用于 API 测试

## 设置开发环境

### 1. 克隆仓库

```bash
git clone https://github.com/Pimzino/spec-workflow-mcp.git
cd spec-workflow-mcp
```

### 2. 安装依赖

```bash
npm install
```

这将安装：
- MCP SDK
- TypeScript 和构建工具
- Express 用于仪表板服务器
- WebSocket 库
- 测试框架

### 3. 构建项目

```bash
npm run build
```

这将把 TypeScript 文件编译为 `dist/` 目录中的 JavaScript。

## 开发命令

### 核心命令

| 命令 | 描述 |
|---------|-------------|
| `npm run dev` | 以开发模式启动，支持自动重载 |
| `npm run build` | 构建生产包 |
| `npm start` | 运行生产服务器 |
| `npm test` | 运行测试套件 |
| `npm run clean` | 删除构建产物 |
| `npm run lint` | 运行代码检查器 |
| `npm run format` | 使用 Prettier 格式化代码 |

### 开发模式

```bash
npm run dev
```

功能：
- 文件更改时自动重新编译
- 仪表板热重载
- 详细错误消息
- 调试用的 Source maps

### 生产构建

```bash
npm run clean && npm run build
```

优化：
- 压缩的 JavaScript
- 优化的包大小
- 生产错误处理
- 性能改进

## 项目结构

```
spec-workflow-mcp/
├── src/                    # 源代码
│   ├── index.ts           # MCP 服务器入口点
│   ├── server.ts          # 仪表板服务器
│   ├── tools/             # MCP 工具实现
│   ├── prompts/           # 提示模板
│   ├── utils/             # 实用函数
│   └── types/             # TypeScript 类型定义
├── dist/                   # 编译的 JavaScript
├── dashboard/             # Web 仪表板文件
│   ├── index.html         # 仪表板 UI
│   ├── styles.css         # 仪表板样式
│   └── script.js          # 仪表板 JavaScript
├── vscode-extension/      # VSCode 扩展
│   ├── src/               # 扩展源代码
│   └── package.json       # 扩展清单
├── tests/                 # 测试文件
├── docs/                  # 文档
└── package.json           # 项目配置
```

## 架构概述

### MCP 服务器架构

```
客户端 (AI) ↔ MCP 协议 ↔ 服务器 ↔ 文件系统
                              ↓
                          仪表板
```

### 关键组件

#### 1. MCP 服务器（`src/index.ts`）
- 处理 MCP 协议通信
- 处理工具请求
- 管理项目状态
- 文件系统操作

#### 2. 仪表板服务器（`src/server.ts`）
- 提供 Web 仪表板服务
- WebSocket 连接
- 实时更新
- HTTP API 端点

#### 3. 工具（`src/tools/`）
每个工具都是一个独立模块：
- 输入验证
- 业务逻辑
- 文件操作
- 响应格式化

#### 4. 提示（`src/prompts/`）
用于以下的模板字符串：
- 文档生成
- 工作流程指导
- 错误消息
- 用户说明

## 实现新功能

### 添加新工具

1. **在 `src/tools/` 中创建工具文件**：

```typescript
// src/tools/my-new-tool.ts
import { Tool } from '@anthropic/mcp-sdk';

export const myNewTool: Tool = {
  name: 'my-new-tool',
  description: '工具功能描述',
  parameters: {
    type: 'object',
    properties: {
      param1: { type: 'string', description: '参数描述' },
      param2: { type: 'number', optional: true }
    },
    required: ['param1']
  },
  handler: async (params) => {
    // 工具实现
    const { param1, param2 = 0 } = params;

    // 业务逻辑在这里

    return {
      success: true,
      data: '工具响应'
    };
  }
};
```

2. **在索引中注册**（`src/tools/index.ts`）：

```typescript
export { myNewTool } from './my-new-tool';
```

3. **添加到服务器**（`src/index.ts`）：

```typescript
import { myNewTool } from './tools';

server.registerTool(myNewTool);
```

### 添加仪表板功能

1. **更新 HTML**（`dashboard/index.html`）：

```html
<div class="new-feature">
  <h3>新功能</h3>
  <button id="new-action">操作</button>
</div>
```

2. **添加 JavaScript**（`dashboard/script.js`）：

```javascript
document.getElementById('new-action').addEventListener('click', () => {
  // 功能逻辑
  ws.send(JSON.stringify({
    type: 'new-action',
    data: { /* ... */ }
  }));
});
```

3. **在服务器中处理**（`src/server.ts`）：

```typescript
ws.on('message', (message) => {
  const { type, data } = JSON.parse(message);
  if (type === 'new-action') {
    // 处理新操作
  }
});
```

## 测试

### 运行测试

```bash
# 运行所有测试
npm test

# 运行特定测试文件
npm test -- src/tools/my-tool.test.ts

# 运行覆盖率测试
npm run test:coverage

# 监视模式
npm run test:watch
```

### 编写测试

在源文件旁边创建测试文件：

```typescript
// src/tools/my-tool.test.ts
import { describe, it, expect } from 'vitest';
import { myTool } from './my-tool';

describe('myTool', () => {
  it('应正确处理输入', async () => {
    const result = await myTool.handler({
      param1: 'test'
    });

    expect(result.success).toBe(true);
    expect(result.data).toContain('expected');
  });

  it('应处理错误', async () => {
    const result = await myTool.handler({
      param1: null
    });

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});
```

### 集成测试

测试完整的工作流程：

```typescript
// tests/integration/workflow.test.ts
describe('完整工作流程', () => {
  it('应从头到尾创建规格', async () => {
    // 创建需求
    // 批准需求
    // 创建设计
    // 批准设计
    // 创建任务
    // 验证结构
  });
});
```

## 调试

### 调试 MCP 服务器

1. **添加调试输出**：

```typescript
console.error('[DEBUG]', '工具被调用:', toolName, params);
```

2. **使用 VSCode 调试器**：

```json
// .vscode/launch.json
{
  "type": "node",
  "request": "launch",
  "name": "调试 MCP 服务器",
  "program": "${workspaceFolder}/dist/index.js",
  "args": ["/path/to/test/project"],
  "console": "integratedTerminal"
}
```

### 调试仪表板

1. **浏览器 DevTools**：
   - 在浏览器中打开仪表板
   - 按 F12 打开 DevTools
   - 检查控制台中的错误
   - 监控网络标签中的 WebSocket

2. **添加日志**：

```javascript
console.log('WebSocket 消息:', message);
console.log('状态更新:', newState);
```

## 代码风格和标准

### TypeScript 指南

- 使用严格模式
- 为数据结构定义接口
- 避免使用 `any` 类型
- 使用 async/await 而不是回调

### 文件组织

- 每个文件一个组件
- 分组相关功能
- 清晰的命名约定
- 全面的注释

### 命名约定

- **文件**：kebab-case（`my-tool.ts`）
- **类**：PascalCase（`SpecManager`）
- **函数**：camelCase（`createSpec`）
- **常量**：UPPER_SNAKE（`MAX_RETRIES`）

## 贡献

### 贡献流程

1. **Fork 仓库**
2. **创建功能分支**：
   ```bash
   git checkout -b feature/my-feature
   ```
3. **进行更改**
4. **编写测试**
5. **运行测试和代码检查**：
   ```bash
   npm test
   npm run lint
   ```
6. **提交更改**：
   ```bash
   git commit -m "feat: add new feature"
   ```
7. **推送分支**：
   ```bash
   git push origin feature/my-feature
   ```
8. **创建 Pull Request**

### 提交消息格式

遵循约定式提交：

- `feat:` 新功能
- `fix:` 错误修复
- `docs:` 文档
- `style:` 格式化
- `refactor:` 代码重构
- `test:` 测试
- `chore:` 维护

示例：
```
feat: add approval revision workflow
fix: resolve dashboard WebSocket reconnection issue
docs: update configuration guide
```

### Pull Request 指南

- 清晰的描述
- 引用相关问题
- 包含 UI 更改的截图
- 确保所有测试通过
- 更新文档

## 发布

### NPM 包

1. **更新版本**：
   ```bash
   npm version patch|minor|major
   ```

2. **构建包**：
   ```bash
   npm run build
   ```

3. **发布**：
   ```bash
   npm publish
   ```

### VSCode 扩展

1. **更新扩展版本**，在 `vscode-extension/package.json` 中

2. **构建扩展**：
   ```bash
   cd vscode-extension
   npm run package
   ```

3. **发布到市场**：
   ```bash
   vsce publish
   ```

## 性能优化

### 服务器性能

- 对文件读取使用缓存
- 为文件监视器实现防抖
- 优化 WebSocket 消息批处理
- 延迟加载大型文档

### 仪表板性能

- 最小化 DOM 更新
- 对长列表使用虚拟滚动
- 实现渐进式渲染
- 优化 WebSocket 重连

## 安全考虑

### 输入验证

始终验证工具输入：

```typescript
if (!params.specName || typeof params.specName !== 'string') {
  throw new Error('无效的规格名称');
}

// 清理文件路径
const safePath = path.normalize(params.path);
if (safePath.includes('..')) {
  throw new Error('无效的路径');
}
```

### 文件系统安全

- 将操作限制在项目目录内
- 验证所有文件路径
- 使用安全的文件操作
- 实现权限检查

## 开发问题故障排除

### 常见构建错误

| 错误 | 解决方案 |
|-------|----------|
| TypeScript 错误 | 运行 `npm run build` 查看详细错误 |
| 找不到模块 | 检查导入并运行 `npm install` |
| 端口已被使用 | 更改端口或终止现有进程 |
| WebSocket 连接失败 | 检查服务器是否运行且端口正确 |

### 开发技巧

1. **使用 TypeScript 严格模式**以获得更好的类型安全
2. **启用 source maps**以便更容易调试
3. **使用 nodemon**在开发期间自动重启
4. **在隔离目录中测试**文件操作
5. **使用 Chrome DevTools 监控**性能

## 资源

- [MCP SDK 文档](https://github.com/anthropics/mcp-sdk)
- [TypeScript 手册](https://www.typescriptlang.org/docs/)
- [Node.js 最佳实践](https://github.com/goldbergyoni/nodebestpractices)
- [VSCode 扩展 API](https://code.visualstudio.com/api)

## 相关文档

- [配置指南](CONFIGURATION.zh.md) - 服务器配置
- [用户指南](USER-GUIDE.zh.md) - 使用服务器
- [工具参考](TOOLS-REFERENCE.zh.md) - 工具文档
- [故障排除](TROUBLESHOOTING.zh.md) - 常见问题
