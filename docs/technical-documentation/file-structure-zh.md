# 文件结构与组织

> **快速参考**: [目录布局](#-目录布局) | [文件命名](#-文件命名) | [路径工具](#-路径工具)

## 📁 目录布局

### 项目根结构
```
project-root/
├── .spec-workflow/                    # 所有 MCP 工作流数据
│   ├── specs/                         # 规范文档  
│   │   └── feature-name/              # 单个规范
│   │       ├── requirements.md        # 阶段 1：需求
│   │       ├── design.md             # 阶段 2：设计  
│   │       └── tasks.md              # 阶段 3：任务
│   ├── steering/                      # 项目指导文档
│   │   ├── product.md                # 产品愿景与策略
│   │   ├── tech.md                   # 技术标准
│   │   └── structure.md              # 代码组织
│   ├── approvals/                     # 审批工作流数据
│   │   └── spec-name/                # 按规范存放审批
│   │       └── approval-id.json      # 单个审批数据
│   ├── archive/                       # 已完成/归档规范  
│   │   └── specs/                    # 归档的规范文档
│   └── session.json                  # 活跃仪表板会话
├── [your existing project files]     # 你的实际项目
├── package.json                      # 项目依赖
└── README.md                         # 项目文档
```

### MCP 服务器源码结构

**核心实现文件**（基于代码库分析位置确认）：

| 文件路径 | 用途 | 关键特性 |
|-----------|---------|--------------|
| `src/server.ts:74-85` | MCP 服务器初始化 | 工具注册、仪表板集成 |
| `src/core/path-utils.ts:12-35` | 跨平台路径 | Windows/Unix 处理 |
| `src/core/session-manager.ts:15-40` | 仪表板会话跟踪 | URL 管理、连接状态 |
| `src/dashboard/approval-storage.ts:20-45` | 人工审批系统 | JSON 文件持久化 |
| `src/dashboard/server.ts:54` | 外部 HTTP 调用 | NPM 版本检查（唯一外部调用） |

**模板系统**（静态内容，无 AI 生成）：
```
src/
├── core/                             # 核心业务逻辑
│   ├── archive-service.ts            # 规范归档
│   ├── parser.ts                     # 规范解析与分析
│   ├── path-utils.ts                # 跨平台路径处理
│   ├── session-manager.ts           # 仪表板会话跟踪
│   └── task-parser.ts               # 任务管理与解析
├── tools/                           # MCP 工具实现
│   ├── index.ts                     # 工具注册与分发
│   ├── spec-workflow-guide.ts       # 工作流指导
│   ├── steering-guide.ts            # 指导文档说明
│   ├── create-spec-doc.ts           # 规范文档创建
│   ├── create-steering-doc.ts       # 指导文档创建
│   ├── get-spec-context.ts          # 加载规范上下文
│   ├── get-steering-context.ts      # 加载指导上下文
│   ├── get-template-context.ts      # 加载模板
│   ├── spec-list.ts                 # 列出所有规范
│   ├── spec-status.ts               # 获取规范状态
│   ├── manage-tasks.ts              # 任务管理
│   ├── request-approval.ts          # 创建审批请求
│   ├── get-approval-status.ts       # 查询审批状态
│   └── delete-approval.ts           # 清理审批
├── dashboard/                       # 仪表板后端
│   ├── server.ts                    # Fastify Web 服务器
│   ├── approval-storage.ts          # 审批持久化
│   ├── parser.ts                    # 仪表板侧解析  
│   ├── watcher.ts                   # 文件监听
│   ├── utils.ts                     # 工具方法
│   └── public/                      # 静态资源
│       ├── claude-icon.svg          # 浅色图标
│       └── claude-icon-dark.svg     # 深色图标
├── dashboard_frontend/              # React 仪表板前端
│   ├── src/
│   │   ├── modules/
│   │   │   ├── api/                 # API 通信层
│   │   │   ├── app/                 # 应用主组件
│   │   │   ├── approvals/           # 审批 UI
│   │   │   ├── editor/              # Markdown 编辑
│   │   │   ├── markdown/            # Markdown 渲染
│   │   │   ├── modals/              # 模态框
│   │   │   ├── notifications/       # 通知
│   │   │   ├── pages/               # 页面组件
│   │   │   ├── theme/               # 样式与主题
│   │   │   └── ws/                  # WebSocket 集成
│   │   ├── main.tsx                 # React 应用入口
│   │   └── App.tsx                  # 根组件
│   ├── index.html                   # HTML 模板
│   ├── vite.config.ts               # Vite 配置
│   └── tailwind.config.js           # Tailwind 配置
├── markdown/                        # 文档模板
│   └── templates/
│       ├── requirements-template.md  # 需求文档模板
│       ├── design-template.md       # 设计文档模板
│       ├── tasks-template.md        # 任务文档模板
│       ├── product-template.md      # 产品愿景模板
│       ├── tech-template.md         # 技术标准模板
│       └── structure-template.md    # 代码结构模板
├── server.ts                       # MCP 服务器主类
├── index.ts                        # CLI 入口与参数解析
└── types.ts                        # TypeScript 类型定义
```

### VS Code 扩展结构  
```
vscode-extension/
├── src/
│   ├── extension.ts                 # 扩展入口
│   ├── extension/
│   │   ├── providers/               # VS Code providers
│   │   │   └── SidebarProvider.ts   # 侧边栏 webview provider
│   │   ├── services/                # 业务服务
│   │   │   ├── ApprovalCommandService.ts      # 审批命令
│   │   │   ├── ApprovalEditorService.ts       # 审批编辑器集成
│   │   │   ├── ArchiveService.ts              # 归档
│   │   │   ├── CommentModalService.ts         # 评论弹窗
│   │   │   ├── FileWatcher.ts                 # 文件监听
│   │   │   └── SpecWorkflowService.ts         # 主工作流服务
│   │   ├── types.ts                 # 类型定义
│   │   └── utils/                   # 工具函数
│   │       ├── colorUtils.ts        # 颜色处理
│   │       ├── logger.ts            # 日志
│   │       └── taskParser.ts        # 扩展任务解析
│   └── webview/                     # Webview 组件（React）
│       ├── App.tsx                  # 主 webview 应用
│       ├── components/              # 可复用 UI
│       ├── hooks/                   # Hooks
│       ├── lib/                     # 工具库
│       └── main.tsx                 # Webview 入口
├── webview-assets/                  # Webview 静态资源
│   └── sounds/                      # 音频通知
│       ├── approval-pending.wav     # 审批请求声音
│       └── task-completed.wav       # 任务完成声音
├── icons/                          # 扩展图标
│   ├── activity-bar-icon.svg       # 活动栏图标
│   └── spec-workflow.svg           # 通用扩展图标
├── package.json                    # 扩展清单与依赖
└── README.md                       # 扩展文档
```

## 📋 文件命名约定

### 规范名称
- **格式**: `kebab-case`（小写短横线）
- **示例**: ✅ `user-authentication`, `payment-flow`, `admin-dashboard`
- **不合法**: ❌ `UserAuth`, `payment_flow`, `Admin Dashboard`

### 文档文件
- **需求**: `requirements.md`
- **设计**: `design.md` 
- **任务**: `tasks.md`
- **产品**: `product.md`
- **技术**: `tech.md`
- **结构**: `structure.md`

### 审批文件
- **格式**: `{spec-name}-{document}-{timestamp}.json`
- **示例**: `user-auth-requirements-20241215-143022.json`
- **自动生成**: 系统自动创建

### 会话文件
- **文件**: `session.json`（项目唯一）
- **位置**: `.spec-workflow/session.json`

## 🛠️ 路径工具

### 跨平台路径处理

系统使用 `PathUtils` 类以在 Windows、macOS、Linux 间保持一致：

```typescript
export class PathUtils {
  // 获取工作流根目录
  static getWorkflowRoot(projectPath: string): string {
    return normalize(join(projectPath, '.spec-workflow'));
  }

  // 获取规范目录
  static getSpecPath(projectPath: string, specName: string): string {
    return normalize(join(projectPath, '.spec-workflow', 'specs', specName));
  }

  // 获取指导文档路径
  static getSteeringPath(projectPath: string): string {
    return normalize(join(projectPath, '.spec-workflow', 'steering'));
  }

  // 转换为平台路径
  static toPlatformPath(path: string): string {
    return path.split('/').join(sep);
  }

  // 转换为 Unix 风格路径（用于 JSON/API）
  static toUnixPath(path: string): string {
    return path.split(sep).join('/');
  }
}
```

### 常见路径操作

```typescript
// PathUtils 使用示例

// 获取规范路径
const specPath = PathUtils.getSpecPath('/project', 'user-auth');
// 结果: /project/.spec-workflow/specs/user-auth

// 获取需求文件路径
const reqPath = join(specPath, 'requirements.md');
// 结果: /project/.spec-workflow/specs/user-auth/requirements.md

// 获取 API 响应用的相对路径  
const relativePath = PathUtils.toUnixPath(reqPath.replace(projectPath, ''));
// 结果: .spec-workflow/specs/user-auth/requirements.md
```

## 📂 目录创建与管理

### 自动创建的目录

系统按需自动创建如下目录：

```typescript
// 初始化时创建
const directories = [
  '.spec-workflow/',
  '.spec-workflow/specs/',
  '.spec-workflow/steering/',
  '.spec-workflow/archive/',
  '.spec-workflow/archive/specs/'
];

// 按需创建
const onDemandDirectories = [
  '.spec-workflow/approvals/',
  '.spec-workflow/approvals/{spec-name}/',
  '.spec-workflow/specs/{spec-name}/'
];
```

### 目录校验

```typescript
export async function validateProjectPath(projectPath: string): Promise<string> {
  // 解析为绝对路径
  const absolutePath = resolve(projectPath);
  
  // 路径存在性
  await access(absolutePath, constants.FOK);
  
  // 确保为目录
  const stats = await stat(absolutePath);
  if (!stats.isDirectory()) {
    throw new Error(`Project path is not a directory: ${absolutePath}`);
  }
  
  return absolutePath;
}
```

### 清理与维护

```typescript
// 归档已完成的规范
export class SpecArchiveService {
  async archiveSpec(specName: string): Promise<void> {
    const sourceDir = PathUtils.getSpecPath(this.projectPath, specName);
    const archiveDir = PathUtils.getArchiveSpecPath(this.projectPath, specName);
    
    // 移动规范到归档
    await fs.rename(sourceDir, archiveDir);
    
    // 清理审批
    const approvalsDir = PathUtils.getSpecApprovalPath(this.projectPath, specName);
    await fs.rm(approvalsDir, { recursive: true, force: true });
  }
}
```

## 🔒 文件权限与安全

### 所需权限

```bash
# 最低权限
.spec-workflow/           # 755 (rwxr-xr-x)
├── specs/               # 755 (rwxr-xr-x)  
├── steering/            # 755 (rwxr-xr-x)
├── approvals/           # 755 (rwxr-xr-x)
└── session.json         # 644 (rw-r--r--)
```

### 安全注意事项

**文件访问限制**：
- ✅ 读/写：仅限 `.spec-workflow/` 目录内
- ✅ 只读：项目文件（用于分析）
- ❌ 禁止：系统目录、越级目录遍历

**路径遍历防护**：
```typescript
// 所有路径均标准化并校验
const safePath = normalize(join(projectPath, '.spec-workflow', userInput));

// 确保路径在项目内
if (!safePath.startsWith(projectPath)) {
  throw new Error('Path traversal attempt detected');
}
```

## 📊 存储考量

### 文件大小限制

| 文件类型 | 典型大小 | 建议上限 |
|-----------|-------------|-----------------|
| Requirements | 5-20 KB | 100 KB |
| Design | 10-50 KB | 200 KB |
| Tasks | 5-30 KB | 150 KB |
| Steering Docs | 5-20 KB | 100 KB |
| Approval Data | < 1 KB | 5 KB |
| Session Data | < 1 KB | 2 KB |

### 磁盘占用估算

```typescript
// 典型项目磁盘占用
interface DiskUsage {
  singleSpec: '50-200 KB';      // 三个文档合计
  steeringDocs: '20-100 KB';    // 所有指导文档  
  approvalData: '1-10 KB';      // 每次审批
  sessionData: '< 1 KB';        // 会话
  totalTypical: '100-500 KB';   // 小中型项目
  totalLarge: '1-5 MB';         // 大型项目（多规范）
}
```

### 清理策略

```bash
# 手动清理命令

# 删除 30 天前的审批
find .spec-workflow/approvals -name "*.json" -mtime +30 -delete

# 归档老旧规范  
# （将所有任务完成的规范移动至 archive/）

# 清理会话数据
rm -f .spec-workflow/session.json

# 全量重置（危险操作）
rm -rf .spec-workflow/
```

---

**下一步**: [仪表板系统 →](dashboard.md)


