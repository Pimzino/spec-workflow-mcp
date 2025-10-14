# 工具参考

Spec Workflow MCP 提供的所有 MCP 工具的完整文档。

## 概述

Spec Workflow MCP 为结构化软件开发提供专用工具。这些工具通过模型上下文协议可供 AI 助手访问。

## 工具类别

1. **工作流指南** - 文档和指导
2. **规范管理** - 创建和管理规范
3. **上下文工具** - 检索项目信息
4. **指导工具** - 项目级指导
5. **审批工具** - 文档审批工作流

## 工作流指南工具

### spec-workflow-guide

**目的**：提供规范驱动工作流程的全面指导。

**参数**：无

**返回**：解释完整工作流的 Markdown 指南

**使用示例**：
```
"显示规范工作流指南"
```

**响应包含**：
- 工作流概述
- 分步流程
- 最佳实践
- 示例提示

### steering-guide

**目的**：创建项目指导文档的指南。

**参数**：无

**返回**：指导文档创建的 Markdown 指南

**使用示例**：
```
"显示如何创建指导文档"
```

**响应包含**：
- 指导文档类型
- 创建流程
- 内容指南
- 示例

## 规范管理工具

### create-spec-doc

**目的**：创建或更新规范文档（需求、设计、任务）。

**参数**：

| 参数 | 类型 | 必需 | 描述 |
|-----------|------|----------|-------------|
| specName | string | 是 | 规范名称（kebab-case） |
| docType | string | 是 | 类型："requirements"、"design" 或 "tasks" |
| content | string | 是 | 文档的 Markdown 内容 |
| revision | boolean | 否 | 是否为修订版（默认：false） |

**使用示例**：
```typescript
{
  specName: "user-authentication",
  docType: "requirements",
  content: "# 用户认证需求\n\n## 概述\n...",
  revision: false
}
```

**返回**：
```typescript
{
  success: true,
  message: "需求文档创建成功",
  path: ".spec-workflow/specs/user-authentication/requirements.md",
  requestedApproval: true
}
```

**注意事项**：
- 如果规范目录不存在则创建
- 自动为新文档请求批准
- 验证 Markdown 格式
- 创建新类型时保留现有文档

### spec-list

**目的**：列出所有规范及其当前状态。

**参数**：无

**返回**：规范摘要数组

**响应结构**：
```typescript
[
  {
    name: "user-authentication",
    status: "in-progress",
    progress: 45,
    documents: {
      requirements: "approved",
      design: "pending-approval",
      tasks: "not-created"
    },
    taskStats: {
      total: 15,
      completed: 7,
      inProgress: 1,
      pending: 7
    }
  }
]
```

**使用示例**：
```
"列出我所有的规范"
```

### spec-status

**目的**：获取特定规范的详细状态信息。

**参数**：

| 参数 | 类型 | 必需 | 描述 |
|-----------|------|----------|-------------|
| specName | string | 是 | 要检查的规范名称 |

**返回**：详细规范状态

**响应结构**：
```typescript
{
  exists: true,
  name: "user-authentication",
  documents: {
    requirements: {
      exists: true,
      approved: true,
      lastModified: "2024-01-15T10:30:00Z",
      size: 4523
    },
    design: {
      exists: true,
      approved: false,
      pendingApproval: true,
      lastModified: "2024-01-15T14:20:00Z",
      size: 6234
    },
    tasks: {
      exists: true,
      taskCount: 15,
      completedCount: 7,
      inProgressCount: 1,
      progress: 45
    }
  },
  overallProgress: 45,
  currentPhase: "implementation"
}
```

**使用示例**：
```
"显示 user-authentication 规范的状态"
```

### manage-tasks

**目的**：综合任务管理，包括更新、状态更改和进度跟踪。

**参数**：

| 参数 | 类型 | 必需 | 描述 |
|-----------|------|----------|-------------|
| specName | string | 是 | 规范名称 |
| action | string | 是 | 操作："update"、"complete"、"list"、"progress" |
| taskId | string | 有时 | 任务 ID（更新/完成时必需） |
| status | string | 否 | 新状态："pending"、"in-progress"、"completed" |
| notes | string | 否 | 任务的附加备注 |

**操作**：

1. **更新任务状态**：
```typescript
{
  specName: "user-auth",
  action: "update",
  taskId: "1.2.1",
  status: "in-progress",
  notes: "开始实现"
}
```

2. **完成任务**：
```typescript
{
  specName: "user-auth",
  action: "complete",
  taskId: "1.2.1"
}
```

3. **列出任务**：
```typescript
{
  specName: "user-auth",
  action: "list"
}
```

4. **获取进度**：
```typescript
{
  specName: "user-auth",
  action: "progress"
}
```

**返回**：任务信息或更新确认

## 上下文工具

### get-template-context

**目的**：检索所有文档类型的 Markdown 模板。

**参数**：无

**返回**：包含所有模板的对象

**响应结构**：
```typescript
{
  requirements: "# 需求模板\n\n## 概述\n...",
  design: "# 设计模板\n\n## 架构\n...",
  tasks: "# 任务模板\n\n## 实现任务\n...",
  product: "# 产品指导模板\n...",
  tech: "# 技术指导模板\n...",
  structure: "# 结构指导模板\n..."
}
```

**使用示例**：
```
"获取所有文档模板"
```

### get-steering-context

**目的**：检索项目指导文档和指南。

**参数**：

| 参数 | 类型 | 必需 | 描述 |
|-----------|------|----------|-------------|
| docType | string | 否 | 特定文档："product"、"tech"、"structure" 或 "all" |

**返回**：指导文档内容

**使用示例**：
```typescript
{
  docType: "tech"  // 仅返回技术指导
}
```

**响应结构**：
```typescript
{
  product: "# 产品指导\n\n## 愿景\n...",
  tech: "# 技术指导\n\n## 架构\n...",
  structure: "# 结构指导\n\n## 组织\n..."
}
```

### get-spec-context

**目的**：检索特定规范的完整上下文。

**参数**：

| 参数 | 类型 | 必需 | 描述 |
|-----------|------|----------|-------------|
| specName | string | 是 | 规范名称 |
| includeContent | boolean | 否 | 包含文档内容（默认：true） |

**返回**：完整规范上下文

**响应结构**：
```typescript
{
  name: "user-authentication",
  exists: true,
  documents: {
    requirements: {
      exists: true,
      content: "# 需求\n\n...",
      approved: true
    },
    design: {
      exists: true,
      content: "# 设计\n\n...",
      approved: false
    },
    tasks: {
      exists: true,
      content: "# 任务\n\n...",
      stats: {
        total: 15,
        completed: 7,
        progress: 45
      }
    }
  },
  relatedSpecs: ["user-profile", "session-management"],
  dependencies: ["database-setup", "auth-library"]
}
```

**使用示例**：
```
"获取 user-authentication 规范的完整上下文"
```

## 指导文档工具

### create-steering-doc

**目的**：创建项目指导文档（产品、技术、结构）。

**参数**：

| 参数 | 类型 | 必需 | 描述 |
|-----------|------|----------|-------------|
| docType | string | 是 | 类型："product"、"tech" 或 "structure" |
| content | string | 是 | 文档的 Markdown 内容 |

**使用示例**：
```typescript
{
  docType: "product",
  content: "# 产品指导\n\n## 愿景\n构建最好的..."
}
```

**返回**：
```typescript
{
  success: true,
  message: "产品指导文档已创建",
  path: ".spec-workflow/steering/product.md"
}
```

**注意事项**：
- 如需要则创建指导目录
- 覆盖现有指导文档
- 指导文档无需批准
- 应在规范之前创建

## 审批系统工具

### request-approval

**目的**：请求用户批准文档。

**参数**：

| 参数 | 类型 | 必需 | 描述 |
|-----------|------|----------|-------------|
| specName | string | 是 | 规范名称 |
| docType | string | 是 | 要批准的文档类型 |
| documentId | string | 是 | 用于跟踪的唯一 ID |
| content | string | 是 | 供审查的文档内容 |

**使用示例**：
```typescript
{
  specName: "user-auth",
  docType: "requirements",
  documentId: "user-auth-req-v1",
  content: "# 需求\n\n..."
}
```

**返回**：
```typescript
{
  success: true,
  approvalId: "user-auth-req-v1",
  message: "已请求批准。检查仪表板进行审查。"
}
```

### get-approval-status

**目的**：检查文档的批准状态。

**参数**：

| 参数 | 类型 | 必需 | 描述 |
|-----------|------|----------|-------------|
| specName | string | 是 | 规范名称 |
| documentId | string | 是 | 要检查的文档 ID |

**返回**：
```typescript
{
  exists: true,
  status: "pending" | "approved" | "rejected" | "changes-requested",
  feedback: "请添加更多关于错误处理的细节",
  timestamp: "2024-01-15T10:30:00Z",
  reviewer: "user"
}
```

**使用示例**：
```
"检查 user-auth 需求的批准状态"
```

### delete-approval

**目的**：删除已完成的批准请求以清理批准队列。

**参数**：

| 参数 | 类型 | 必需 | 描述 |
|-----------|------|----------|-------------|
| specName | string | 是 | 规范名称 |
| documentId | string | 是 | 要删除的文档 ID |

**返回**：
```typescript
{
  success: true,
  message: "批准记录已删除"
}
```

**使用示例**：
```
"清理 user-auth 的已完成批准"
```

## 工具集成模式

### 顺序工作流

工具设计为按顺序工作：

1. `steering-guide` → 了解指导
2. `create-steering-doc` → 创建指导文档
3. `spec-workflow-guide` → 了解工作流
4. `create-spec-doc` → 创建需求
5. `request-approval` → 请求审查
6. `get-approval-status` → 检查状态
7. `create-spec-doc` → 创建设计（批准后）
8. `manage-tasks` → 跟踪实现

### 并行操作

某些工具可以同时使用：

- `spec-list` + `spec-status` → 获取概述和详情
- `get-spec-context` + `get-steering-context` → 完整项目上下文
- 多个 `create-spec-doc` → 创建多个规范

### 错误处理

所有工具返回一致的错误结构：

```typescript
{
  success: false,
  error: "未找到规范",
  details: "不存在名为 'invalid-spec' 的规范",
  suggestion: "使用 spec-list 查看可用规范"
}
```

## 最佳实践

### 工具选择

1. **信息收集**：
   - 使用 `spec-list` 获取概述
   - 使用 `spec-status` 获取特定规范
   - 使用 `get-spec-context` 进行实现

2. **文档创建**：
   - 始终首先创建需求
   - 在设计前等待批准
   - 设计批准后创建任务

3. **任务管理**：
   - 开始任务时更新状态
   - 完成后立即标记为完成
   - 为重要上下文使用备注

### 性能考虑

- **批量操作**：在一次对话中请求多个规范
- **缓存**：工具缓存文件读取以提高性能
- **选择性加载**：使用 `includeContent: false` 进行更快的状态检查

### 安全性

- **路径验证**：所有路径都经过验证和清理
- **项目隔离**：工具仅访问项目目录
- **输入清理**：Markdown 内容经过清理
- **无执行**：工具从不执行代码

## 扩展工具

### 自定义工具开发

添加新工具：

1. 在 `src/tools/` 中创建工具模块
2. 定义参数架构
3. 实现处理器函数
4. 向 MCP 服务器注册
5. 添加到导出

示例结构：
```typescript
export const customTool = {
  name: 'custom-tool',
  description: '描述',
  parameters: {
    // JSON Schema
  },
  handler: async (params) => {
    // 实现
  }
};
```

## 工具版本控制

工具保持向后兼容性：

- 参数添加是可选的
- 响应结构扩展而不是替换
- 已弃用的功能显示警告
- 提供迁移指南

## 相关文档

- [用户指南](USER-GUIDE.md) - 有效使用工具
- [工作流程](WORKFLOW.md) - 工作流中的工具使用
- [提示指南](PROMPTING-GUIDE.md) - 示例工具使用
- [开发指南](DEVELOPMENT.md) - 添加新工具

