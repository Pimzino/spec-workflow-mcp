# 开发者工作流指南

> **快速开始**: 克隆 → `npm install` → `npm run dev` → 开始构建！

## 🚀 开发环境搭建

### 先决条件
```bash
# 必需
node >= 18.0.0
npm >= 9.0.0

# 可选（VS Code 扩展）
VS Code >= 1.74.0
```

### 初始设置
```bash
# 克隆仓库
git clone <repository-url>
cd spec-workflow-mcp

# 安装依赖
npm install

# 安装 VS Code 扩展依赖（可选）
cd vscode-extension
npm install
cd ..

# 构建全部
npm run build
```

### 开发命令
```bash
# 开发模式启动 MCP 服务器
npm run dev

# 开发模式启动仪表板  
npm run dev:dashboard

# 生产构建
npm run build

# 清理构建产物
npm run clean

# 运行测试（可用时）
npm test
```

## 🛠️ 开发工作流

### 新增一个 MCP 工具

#### 1. 创建工具定义
```bash
# 新建工具文件
touch src/tools/my-new-tool.ts
```

```typescript
// src/tools/my-new-tool.ts
import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { ToolContext, ToolResponse } from '../types.js';

export const myNewToolTool: Tool = {
  name: 'my-new-tool',
  description: `对该工具作用的简要说明。

# 使用说明
清晰说明何时以及如何使用该工具。`,
  inputSchema: {
    type: 'object',
    properties: {
      projectPath: { 
        type: 'string',
        description: '项目根目录的绝对路径'
      },
      // 其他参数
      param1: {
        type: 'string',
        description: '参数说明'
      }
    },
    required: ['projectPath']
  }
};

export async function myNewToolHandler(
  args: any, 
  context: ToolContext
): Promise<ToolResponse> {
  const { projectPath, param1 } = args;

  try {
    // 实现逻辑
    
    return {
      success: true,
      message: '工具执行成功',
      data: {
        // 响应数据
      },
      nextSteps: [
        '用户接下来应执行的操作',
        '补充指导'
      ]
    };
  } catch (error: any) {
    return {
      success: false,
      message: `工具执行失败: ${error.message}`,
      nextSteps: [
        '检查入参',
        '核对文件权限'
      ]
    };
  }
}
```

#### 2. 注册工具
```typescript
// src/tools/index.ts
import { myNewToolTool, myNewToolHandler } from './my-new-tool.js';

export function registerTools(): Tool[] {
  return [
    // ... 已有工具
    myNewToolTool
  ];
}

export async function handleToolCall(name: string, args: any, context: ToolContext): Promise<MCPToolResponse> {
  switch (name) {
    // ... 已有分支
    case 'my-new-tool':
      response = await myNewToolHandler(args, context);
      break;
  }
}
```

#### 3. 测试工具
```bash
# 启动开发服务器
npm run dev

# 在 AI 客户端或仪表板中测试
```

#### 4. 补充文档
```typescript
// 在 api-reference.md 中更新工具文档
```

### 修改仪表板

#### 前端开发
```bash
# 启动仪表板开发服务器
npm run dev:dashboard

# 打开 http://localhost:5173
# 启用热更新便于快速开发
```

#### 新增页面
```typescript
// src/dashboard_frontend/src/modules/pages/MyNewPage.tsx
import React from 'react';

export default function MyNewPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">My New Page</h1>
      {/* 页面内容 */}
    </div>
  );
}
```

```typescript
// src/dashboard_frontend/src/modules/app/App.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MyNewPage from '../pages/MyNewPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/my-page" element={<MyNewPage />} />
        {/* 其他路由 */}
      </Routes>
    </Router>
  );
}
```

#### 新增后端 API 端点
```typescript
// src/dashboard/server.ts
export class DashboardServer {
  private async setupRoutes() {
    // 新增端点
    this.app.get('/api/my-endpoint', async (request, reply) => {
      try {
        const data = await this.getMyData();
        reply.send({ success: true, data });
      } catch (error) {
        reply.status(500).send({ success: false, error: (error as Error).message });
      }
    });
  }

  private async getMyData() {
    // 实现
  }
}
```

### VS Code 扩展开发

#### 开发环境
```bash
cd vscode-extension
npm install

# 在 VS Code 中打开
code .

# 按 F5 启动 Extension Development Host
```

#### 扩展结构
```
vscode-extension/
├── src/
│   ├── extension.ts           # 扩展入口
│   ├── extension/
│   │   ├── providers/         # 视图提供者
│   │   ├── services/          # 业务逻辑  
│   │   └── utils/            # 工具函数
│   └── webview/              # Webview 组件
├── package.json              # 扩展清单
└── README.md                # 扩展文档
```

#### 新增命令
```typescript
// src/extension.ts
export function activate(context: vscode.ExtensionContext) {
  const myCommand = vscode.commands.registerCommand(
    'spec-workflow.myCommand',
    async () => {
      // 命令实现
      vscode.window.showInformationMessage('My command executed!');
    }
  );

  context.subscriptions.push(myCommand);
}
```

```json
// package.json
{
  "contributes": {
    "commands": [
      {
        "command": "spec-workflow.myCommand",
        "title": "My Command",
        "category": "Spec Workflow"
      }
    ]
  }
}
```

## 🧪 测试策略

### 单元测试（未来）
```bash
# 测试结构（待实现）
src/
├── __tests__/
│   ├── tools/
│   ├── core/
│   └── dashboard/
```

### 集成测试
```bash
# 手动测试流程
1. 启动 MCP 服务器: npm run dev
2. 连接 AI 客户端
3. 测试工具工作流
4. 验证仪表板更新
```

### 仪表板测试
```bash
# 开发模式启动仪表板
npm run dev:dashboard

# 场景
1. 创建规范
2. 审批工作流
3. 实时更新
4. 文件监听
```

## 📁 项目结构

### 核心 MCP 服务器
```
src/
├── core/                     # 核心业务逻辑
│   ├── archive-service.ts    # 规范归档
│   ├── parser.ts            # 规范解析
│   ├── path-utils.ts        # 跨平台路径
│   ├── session-manager.ts   # 会话跟踪
│   └── task-parser.ts       # 任务管理
├── tools/                   # MCP 工具实现
│   ├── index.ts            # 工具注册
│   ├── spec-*.ts           # 规范管理工具
│   ├── create-*.ts         # 文档创建
│   ├── get-*.ts            # 上下文加载
│   ├── manage-*.ts         # 状态管理
│   └── *-approval.ts       # 审批工作流
├── dashboard/              # 仪表板后端
│   ├── server.ts          # Fastify 服务器
│   ├── approval-storage.ts # 审批持久化
│   ├── parser.ts          # 仪表板侧解析
│   ├── watcher.ts         # 文件监听
│   └── utils.ts           # 仪表板工具
├── markdown/              # 模板系统
│   └── templates/         # 文档模板
├── server.ts             # MCP 服务器入口
├── index.ts              # CLI 入口
└── types.ts              # 类型定义
```

### 仪表板前端
```
src/dashboard_frontend/src/
├── modules/
│   ├── api/              # API 通信
│   ├── app/              # 主应用组件
│   ├── approvals/        # 审批 UI 组件
│   ├── editor/           # Markdown 编辑
│   ├── markdown/         # Markdown 渲染
│   ├── modals/           # 模态框
│   ├── notifications/    # 通知
│   ├── pages/            # 页面组件
│   ├── theme/            # 样式与主题
│   └── ws/               # WebSocket 集成
├── main.tsx              # React 入口
└── App.tsx               # 根组件
```

## 🔧 开发最佳实践

### 工具开发指南

#### 1. 入参校验
```typescript
// 始终校验入参
export async function myToolHandler(args: any, context: ToolContext): Promise<ToolResponse> {
  const { projectPath, requiredParam } = args;
  
  if (!projectPath) {
    return {
      success: false,
      message: 'projectPath is required',
      nextSteps: ['Provide absolute path to project root']
    };
  }
  
  if (!requiredParam) {
    return {
      success: false,
      message: 'requiredParam is required',
      nextSteps: ['Provide required parameter']
    };
  }
  
  // 继续实现
}
```

#### 2. 错误处理
```typescript
try {
  // 工具实现
} catch (error: any) {
  return {
    success: false,
    message: `Operation failed: ${error.message}`,
    nextSteps: [
      'Check input parameters',
      'Verify file permissions',
      'Contact support if issue persists'
    ]
  };
}
```

#### 3. 统一响应格式
```typescript
interface ToolResponse {
  success: boolean;
  message: string;           // 人类可读状态
  data?: any;               // 响应数据（可选）
  nextSteps?: string[];     // 下一步（可选）
  projectContext?: {        // 项目上下文（可选）
    projectPath: string;
    workflowRoot: string;
    dashboardUrl?: string;
  };
}
```

#### 4. 路径处理
```typescript
import { PathUtils } from '../core/path-utils.js';

// 始终使用 PathUtils 保证跨平台
const specPath = PathUtils.getSpecPath(projectPath, specName);
const relativePath = PathUtils.toUnixPath(filePath);
```

### 仪表板开发

#### 1. 状态管理
```typescript
// 使用 React hooks 管理本地状态
const [specs, setSpecs] = useState<SpecData[]>([]);

// 使用 WebSocket 进行实时更新
useEffect(() => {
  if (wsMessage?.type === 'specs-updated') {
    setSpecs(wsMessage.data);
  }
}, [wsMessage]);
```

#### 2. API 集成
```typescript
// src/dashboard_frontend/src/modules/api/api.tsx
export const api = {
  async getSpecs(): Promise<SpecData[]> {
    const response = await fetch('/api/specs');
    return response.json();
  },
  
  async updateSpec(specName: string, data: Partial<SpecData>): Promise<void> {
    await fetch(`/api/specs/${specName}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  }
};
```

#### 3. 组件结构
```typescript
// TypeScript 函数组件
interface MyComponentProps {
  specs: SpecData[];
  onSpecUpdate: (spec: SpecData) => void;
}

export default function MyComponent({ specs, onSpecUpdate }: MyComponentProps) {
  return (
    <div className="p-4">
      {specs.map(spec => (
        <div key={spec.name} className="mb-2">
          {spec.name}
        </div>
      ))}
    </div>
  );
}
```

## 🐛 调试

### MCP 服务器调试
```bash
# 启用调试日志
DEBUG=spec-workflow-mcp npm run dev

# 检查 MCP 协议消息
# 使用 MCP 客户端调试模式
```

### 仪表板调试  
```bash
# 浏览器 DevTools
# Network 面板查看 API 调用
# Console 面板查看 JS 错误
# Network 面板检查 WebSocket 连接
```

### 文件系统问题
```bash
# 检查文件权限
ls -la .spec-workflow/

# 检查目录结构
tree .spec-workflow/

# 监控文件更改
# 使用文件监听调试日志
```

## 📦 构建与发布

### 生产构建
```bash
# 清理旧构建
npm run clean

# 构建全部
npm run build

# 验证构建输出
ls -la dist/
```

### 发布到 NPM
```bash
# 更新 package.json 中的版本
npm version patch|minor|major

# 构建并发布
npm run build
npm publish
```

### 发布 VS Code 扩展
```bash
cd vscode-extension

# 安装 VSCE
npm install -g @vscode/vsce

# 打包扩展
vsce package

# 发布到市场
vsce publish
```

---

**下一步**: [上下文管理 →](context-management.md)


