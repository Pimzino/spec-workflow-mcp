# 贡献指南

> 欢迎！本指南将帮助你高效地为 Spec Workflow MCP 项目做出贡献。

## 🚀 贡献者快速开始

### 1. 搭建开发环境
```bash
# 派生并克隆仓库
git clone https://github.com/your-username/spec-workflow-mcp.git
cd spec-workflow-mcp

# 安装依赖
npm install

# 安装 VS Code 扩展依赖（可选）
cd vscode-extension
npm install
cd ..

# 构建全部以验证环境
npm run build
```

### 2. 开发工作流
```bash
# 开发模式启动 MCP 服务器
npm run dev

# 在另一个终端启动仪表板
npm run dev:dashboard

# 编码修改
# 充分测试
# 创建 Pull Request
```

## 🎯 如何贡献

### 我们需要的帮助领域

**🔧 核心功能**
- 新的 MCP 工具与功能
- 性能优化
- 跨平台兼容性改进

**📱 仪表板与 UI**
- 新的仪表板特性
- UI/UX 改进
- 无障碍增强

**📚 文档**
- 代码示例与教程
- API 文档改进
- 多语言翻译

**🧪 测试**
- 单元测试覆盖率
- 集成测试场景  
- 在不同平台上的手动测试

**🐛 缺陷修复**
- GitHub 已报告问题
- 边界场景与错误处理
- 性能瓶颈

## 📋 贡献类型

### 1. 缺陷报告（Bug Reports）
**创建 Issue 之前**：
- 先搜索已有的 issues
- 尝试阅读 [troubleshooting 指南](troubleshooting.md)
- 使用最新版进行测试

**优质缺陷报告模板**：
```markdown
## 缺陷描述
对问题的简要描述

## 环境
- OS: [Windows 11 / macOS 14 / Ubuntu 22.04]
- Node.js: [版本]
- MCP 客户端: [Claude Desktop / Cursor / 等]

## 复现步骤
1. 第一步
2. 第二步
3. 第三步

## 期望行为
应该发生什么

## 实际行为  
实际发生了什么

## 其他上下文
- 错误信息
- 截图
- 日志
```

### 2. 功能请求（Feature Requests）
**优质功能请求模板**：
```markdown
## 功能描述
清晰描述所提议的功能

## 解决的问题
它解决了什么问题？

## 方案建议
应该如何工作？

## 备选方案
你考虑过的其他方案

## 实现思路
关于如何实现的想法
```

### 3. 代码贡献（Code Contributions）

#### Pull Request 流程
1. **Fork** 仓库
2. **创建** 功能分支：`git checkout -b feature/my-feature`
3. **实现** 修改并遵循代码规范
4. **测试** 你的改动
5. **编写文档** 涵盖新功能
6. **提交** 带有清晰描述的 Pull Request

#### Pull Request 模板
```markdown
## 描述
对更改的简要描述

## 变更类型
- [ ] 缺陷修复
- [ ] 新特性  
- [ ] 破坏性变更
- [ ] 文档更新

## 测试
- [ ] 单元测试通过
- [ ] 手动测试完成
- [ ] 跨平台测试（如适用）

## 文档
- [ ] 代码已添加注释
- [ ] 更新了 README（如需）
- [ ] 更新了 API 文档（如需）

## 清单
- [ ] 代码符合风格指南
- [ ] 自我审查已完成
- [ ] 无合并冲突
```

## 🎨 编码规范

### TypeScript 指南

**文件组织**：
```typescript
// 1. 外部库导入
import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { readFile } from 'fs/promises';

// 2. 内部导入
import { ToolContext, ToolResponse } from '../types.js';
import { PathUtils } from '../core/path-utils.js';

// 3. 类型定义
interface LocalInterface {
  // ...
}

// 4. 常量
const CONSTANTS = {
  // ...
};

// 5. 主要实现
export class MyClass {
  // ...
}
```

**函数结构**：
```typescript
/**
 * 函数的简要说明
 * @param param1 参数说明
 * @param param2 参数说明  
 * @returns 返回值说明
 */
export async function myFunction(
  param1: string,
  param2: number
): Promise<MyReturnType> {
  // 入参校验
  if (!param1) {
    throw new Error('param1 is required');
  }
  
  try {
    // 主要逻辑
    const result = await doSomething(param1, param2);
    return result;
  } catch (error: any) {
    // 错误处理
    throw new Error(`Operation failed: ${error.message}`);
  }
}
```

**错误处理模式**：
```typescript
// MCP 工具错误处理
export async function myToolHandler(args: any, context: ToolContext): Promise<ToolResponse> {
  try {
    // 校验
    const { requiredParam } = args;
    if (!requiredParam) {
      return {
        success: false,
        message: 'requiredParam is required',
        nextSteps: ['Provide the required parameter']
      };
    }
    
    // 实现
    const result = await doWork(requiredParam);
    
    return {
      success: true,
      message: 'Operation completed successfully',
      data: result,
      nextSteps: ['Next recommended action']
    };
  } catch (error: any) {
    return {
      success: false,
      message: `Operation failed: ${error.message}`,
      nextSteps: [
        'Check input parameters',
        'Verify file permissions',
        'Try again or contact support'
      ]
    };
  }
}
```

### React 组件指南

**组件结构**：
```typescript
// src/dashboard_frontend/src/components/MyComponent.tsx
import React, { useState, useEffect } from 'react';

interface MyComponentProps {
  data: DataType[];
  onAction: (item: DataType) => void;
  className?: string;
}

export default function MyComponent({ 
  data, 
  onAction, 
  className = '' 
}: MyComponentProps) {
  const [localState, setLocalState] = useState<StateType>({});
  
  useEffect(() => {
    // 副作用
  }, [data]);
  
  const handleClick = (item: DataType) => {
    // 事件处理
    onAction(item);
  };
  
  return (
    <div className={`base-styles ${className}`}>
      {data.map(item => (
        <div key={item.id} onClick={() => handleClick(item)}>
          {item.name}
        </div>
      ))}
    </div>
  );
}
```

**样式规范**：
```typescript
// 使用 Tailwind CSS 类
<div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
    Title
  </h2>
</div>

// 当 Tailwind 不足时才使用自定义 CSS
// 添加到 src/modules/theme/theme.css
```

### 文件与目录命名

```
// 文件
kebab-case.ts         ✅ 推荐
PascalCase.ts         ❌ 避免
snake_case.ts         ❌ 避免

// 目录  
kebab-case/           ✅ 推荐
PascalCase/          ❌ 避免（React 组件除外）
snake_case/          ❌ 避免

// React 组件
MyComponent.tsx       ✅ 推荐（组件使用 PascalCase）
my-component.tsx      ❌ 避免

// MCP 工具
my-tool.ts           ✅ 推荐
myTool.ts            ❌ 避免
```

## 🧪 测试指南

### 手动测试清单

**提交 PR 之前**：
- [ ] MCP 服务器无错误启动
- [ ] 仪表板可加载并显示数据
- [ ] WebSocket 连接正常
- [ ] 文件变更会触发更新
- [ ] 审批工作流可用
- [ ] 跨平台兼容性（如适用）

**测试场景**：
```bash
# 1. 基本 MCP 服务器功能
npm run dev
# 连接 AI 客户端并测试工具

# 2. 仪表板功能
npm run dev:dashboard
# 测试所有页面和功能

# 3. VS Code 扩展（如有修改）
cd vscode-extension
# 在 VS Code 按 F5 进行调试

# 4. 构建流程
npm run clean
npm run build
# 校验 dist/ 产物

# 5. CLI 接口
node dist/index.js --help
node dist/index.js --dashboard
```

### 未来测试框架

**单元测试**（规划中）：
```typescript
// 示例测试结构
describe('PathUtils', () => {
  describe('getSpecPath', () => {
    it('should create correct spec path', () => {
      const result = PathUtils.getSpecPath('/project', 'my-spec');
      expect(result).toBe('/project/.spec-workflow/specs/my-spec');
    });
    
    it('should handle special characters', () => {
      const result = PathUtils.getSpecPath('/project', 'user-auth');
      expect(result).toContain('user-auth');
    });
  });
});
```

## 📖 文档规范

### 代码文档

**JSDoc 注释**：
```typescript
/**
 * 按工作流顺序创建新的规范文档
 * 
 * @param projectPath - 项目根目录的绝对路径
 * @param specName - 功能名（kebab-case，如 'user-authentication'）  
 * @param document - 要创建的文档：'requirements' | 'design' | 'tasks'
 * @param content - 文档完整的 markdown 内容
 * @returns Promise，包含文件路径和下一步信息
 * 
 * @example
 * ```typescript
 * const response = await createSpecDoc({
 *   projectPath: '/my/project',
 *   specName: 'user-auth', 
 *   document: 'requirements',
 *   content: '# Requirements\n\n...'
 * });
 * ```
 * 
 * @throws {Error} 当违反工作流顺序时（如先创建 design 再创建 requirements）
 */
export async function createSpecDoc(...): Promise<ToolResponse> {
  // 实现
}
```

**README 更新**：
- 用户可见的变更更新主 README.md
- 开发者相关变更更新技术文档
- 为新功能补充代码示例

### API 文档

**MCP 工具文档**：
```typescript
export const myNewToolTool: Tool = {
  name: 'my-new-tool',
  description: `该工具的简要说明。

# 使用说明  
何时使用该工具，以及其在工作流中的位置。

# 参数
- param1: 描述与格式
- param2: 描述与约束

# 示例
该工具的具体使用示例。`,
  inputSchema: {
    // JSON Schema
  }
};
```

## 🔄 开发工作流

### 分支策略
```bash
# 主分支
main                    # 稳定发布代码
develop                 # 功能集成分支

# 特性分支  
feature/add-new-tool   # 新特性
bugfix/fix-approval    # 缺陷修复
docs/update-api        # 文档更新
chore/update-deps      # 维护任务
```

### 提交信息格式
```bash
# 格式: type(scope): description

feat(tools): add new spec validation tool
fix(dashboard): resolve WebSocket connection issues  
docs(api): update MCP tool documentation
chore(deps): update TypeScript to 5.3.0
refactor(parser): simplify task parsing logic

# 类型: feat, fix, docs, style, refactor, test, chore
# 范围: tools, dashboard, core, docs, extension
```

### 发布流程

**版本提升**：
```bash
# 补丁版本（缺陷修复）
npm version patch

# 次版本（新特性）  
npm version minor

# 主版本（破坏性变更）
npm version major
```

**预发布检查清单**：
- [ ] 所有测试通过
- [ ] 文档已更新
- [ ] 更新 CHANGELOG.md  
- [ ] 已提升版本
- [ ] 构建成功
- [ ] 手动测试完成

## 🤝 社区准则

### 行为准则（Code of Conduct）

**我们的标准**：
- **相互尊重** - 以尊重与友善对待每个人
- **包容性** - 欢迎来自各背景的贡献者
- **建设性** - 提供有帮助的反馈与建议
- **耐心** - 记住每个人都在学习

**不可接受的行为**：
- 骚扰或歧视
- 钓鱼或挑衅性评论
- 人身攻击
- 发布私人信息

### 获取帮助

**贡献者**：
1. **阅读本指南** 及链接文档
2. **搜索现有 issues** 与讨论
3. **在 GitHub Discussions 提问**（一般性问题）
4. **创建 issue**（具体问题）
5. **加入社区渠道**（如有）

**维护者**：
- 及时回复 issues 与 PR
- 提供建设性反馈
- 帮助新手上手
- 维护友好环境

## 🏆 致谢与认可

### 贡献者

贡献者将被展示于：
- GitHub 贡献者列表
- 重要贡献收录于 CHANGELOG.md
- README.md 的致谢部分

### 贡献类型

**所有贡献都值得被认可**：
- 💻 **代码** - 新特性、缺陷修复、改进
- 📖 **文档** - 指南、示例、翻译  
- 🐛 **测试** - 缺陷报告、用例、质量保障
- 💡 **创意** - 功能提议、设计反馈
- 🎨 **设计** - UI/UX 改进、图标、图形
- 📢 **社区** - 帮助其他用户、传播项目

---

**感谢你为 Spec Workflow MCP 做出的贡献！** 🎉

每一份贡献，无论大小，都会让这个项目变得更好。

---

**下一步**: [测试指南 →](testing.md)


