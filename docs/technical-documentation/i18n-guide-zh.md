# 国际化（i18n）指南

本项目在各组件中实现了全面的国际化支持：React 前端、VSCode 扩展以及后端 MCP 工具。

## 架构总览

### 前端（React 仪表板）
- **框架**: `react-i18next`，带浏览器语言检测
- **位置**: `src/dashboard_frontend/src/i18n.ts`
- **翻译文件**: `src/dashboard_frontend/src/locales/`

### VSCode 扩展  
- **框架**: Webview 使用 `react-i18next`，与 `vscode-nls` 兼容
- **位置**: `vscode-extension/src/webview/i18n.ts`
- **翻译文件**: `vscode-extension/src/webview/locales/`

### 后端（MCP 工具）
- **框架**: 轻量自定义方案（异步加载）
- **位置**: `src/core/i18n.ts`
- **翻译文件**: `src/locales/`

## 使用翻译系统

### 后端 MCP 工具

```typescript
import { translate } from '../core/i18n.js';
import { ToolContext } from '../types.js';

export async function toolHandler(args: any, context: ToolContext): Promise<ToolResponse> {
  const lang = context.lang || 'en';
  
  return {
    success: true,
    message: translate('tools.myTool.success', lang, { 
      name: args.name,
      count: args.items.length 
    }),
    nextSteps: [
      translate('tools.myTool.nextSteps.first', lang),
      translate('tools.myTool.nextSteps.second', lang)
    ]
  };
}
```

### React 前端

```typescript
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('nav.dashboard.title')}</h1>
      <p>{t('welcome.message', { name: 'User', count: 5 })}</p>
    </div>
  );
}
```

### VSCode 扩展 Webview

```typescript
import { useTranslation } from 'react-i18next';

function WebviewComponent() {
  const { t } = useTranslation();
  
  return (
    <button>{t('actions.approve')}</button>
  );
}
```

## 翻译文件结构

### JSON 格式
```json
{
  "nav": {
    "dashboard": {
      "title": "Dashboard",
      "stats": "Statistics"
    }
  },
  "tools": {
    "specStatus": {
      "description": "Get current status of a specification",
      "success": "Spec {{specName}} is currently {{status}}"
    }
  }
}
```

### 键名约定
- 使用点号层级：`nav.dashboard.title`
- 按功能区域分组：`tools.`、`nav.`、`errors.`
- 使用描述性名称：用 `specStatus` 而非 `ss`

## 字符串插值

### 后端
```typescript
translate('welcome.message', 'en', { 
  name: 'John',
  count: 42 
})
// 在翻译字符串中使用 {{name}} 与 {{count}}
```

### 前端
```typescript
t('welcome.message', { 
  name: 'John',
  count: 42 
})
// 在翻译字符串中使用 {{name}} 与 {{count}}
```

## 语言支持

### 当前支持
- **英语**（`en`）- 默认回退语言
- **日语**（`ja`）- 完整翻译

### 新增语言
1. **后端**: 在 `src/locales/` 中新增 JSON
2. **前端**: 在 `src/dashboard_frontend/src/locales/` 中新增 JSON
3. **VSCode 扩展**: 在 `vscode-extension/src/webview/locales/` 中新增 JSON
4. **更新校验脚本**: 在 `scripts/validate-i18n.js` 中添加语言代码

## 错误处理

### 缺失翻译
- 后端：回退为翻译键
- 前端：回退为翻译键  
- 优雅降级，应用可继续运行

### 文件加载错误
- 后端：首次使用异步加载，具备全面错误日志
- 前端：react-i18next 优雅处理缺失文件
- 构建校验可阻止带有损坏翻译文件的发布

## 性能考量

### 后端
- **异步加载**：首次使用按需加载翻译文件
- **缓存**：单次加载承诺避免重复读文件
- **内存友好**：首次后常驻内存缓存

### 前端
- **静态加载（默认）**：启动时加载全部翻译，保证即时切换
- **动态加载（可选）**：按需加载，降低初始包体积
- **浏览器缓存**：localStorage 持久化语言选择
- **包优化**：大量翻译时可代码分割

#### 动态导入能力

前端支持两种加载策略：

**1. 静态加载（默认）**
- 启动时打包并加载全部翻译
- 适用：小中型应用、需要即时切换
- 用法：在入口文件导入 `./i18n`

**2. 动态加载（可选）**
- 按需加载翻译
- 降低首次加载体积（仅加载检测到/选择的语言）
- 适用：语言较多、翻译较大的应用
- 取舍：首次切换该语言时会有小延迟

**启用动态加载：**
1. 在 `.env` 设置环境变量：
   ```env
   VITE_I18N_DYNAMIC=true
   ```
2. 在入口文件使用动态导入：
   ```typescript
   // main.tsx 或 index.tsx
   import './i18n-dynamic';  // 替代 './i18n'
   ```

**性能对比：**

| 指标 | 静态加载 | 动态加载 |
|--------|---------------|-----------------|
| 初始包体积 | 较大（含全部语言） | 较小（仅检测语言） |
| 切换速度 | 即时 | 首次切换略有延迟 |
| 网络请求 | 首次加载后无 | 首次使用某语言会发起一次 |
| 适用场景 | <5 种语言，单语言 <50KB | >5 种语言，单语言 >50KB |

## 构建流程

### 校验
```bash
npm run validate:i18n
```
校验所有翻译文件存在且为有效 JSON。

### 测试
```bash
npm test          # 运行包含 i18n 的全部测试
npm run test:watch # 开发时监听模式
npm run test:coverage # 生成覆盖率报告
```

## 开发工作流

### 新增翻译键
1. **先加到英语**（默认回退）
2. **再同步到其他语言** 
3. **运行校验**：`npm run validate:i18n`
4. **必要时更新测试**
5. **在各环境中验证**

### 翻译测试
```typescript
// 单元测试示例
describe('translate function', () => {
  it('should handle interpolation', () => {
    const result = translate('welcome', 'en', { name: 'Test' });
    expect(result).toBe('Welcome, Test!');
  });
});
```

## 最佳实践

### 键名
- ✅ 描述性：`tools.specStatus.success`
- ❌ 避免模糊：`msg1`、`text`
- ✅ 逻辑分组：`errors.notFound`、`errors.permission`
- ✅ 各语言结构一致

### 插值  
- ✅ 语义化参数：`{{userName}}` 而非 `{{p1}}`
- ✅ 正确处理复数
- ✅ 保持插值简单

### 错误处理
- ✅ 总是提供回退
- ✅ 开发环境记录缺失翻译
- ✅ 不让翻译问题导致应用崩溃

### 性能
- ✅ 尽量按需加载
- ✅ 缓存已加载翻译
- ✅ 构建阶段校验
- ✅ 关注包体积影响

## 故障排除

### 常见问题

**后端工具未加载翻译**
- 检查 `src/locales/` 是否存在
- 校验 JSON 语法
- 查看控制台加载错误

**前端语言检测不生效**
- 检查浏览器语言设置
- 检查 localStorage 中的语言偏好
- 确认语言选择器工作正常

**VSCode 扩展翻译缺失**
- 确认翻译文件已包含在扩展打包中
- 验证 `package.json` 的 contributes 配置
- 在扩展开发宿主中测试

### 关键问题："ReferenceError: t is not defined"

当组件未正确导入/声明翻译函数时会出现。该问题在 0.0.30 版本影响多个组件，已修复。

#### 根因
组件直接使用 `t('...')`，但未在组件内调用 `useTranslation` 钩子，导致运行时错误。

#### 现象
- 控制台报错 `ReferenceError: t is not defined`
- 组件渲染失败或不可交互
- 下拉、按钮、表单异常
- 生产构建（压缩后）更易出现

#### 修复组件（v0.0.30+）

**VSCode 扩展：**
- `CommentModal.tsx` - 评论编辑界面
- `comment-modal.tsx` - 模态封装组件  

**仪表板前端：**
- `VolumeControl.tsx` - 通知音量
- `AlertModal.tsx` - 警告弹窗
- `SearchableSpecDropdown.tsx` - 任务管理下拉

#### 解决步骤

**对于 React 组件：**
1. 导入钩子：
   ```typescript
   import { useTranslation } from 'react-i18next';
   ```
2. 在组件中声明：
   ```typescript
   function MyComponent() {
     const { t } = useTranslation();
     // ...
   }
   ```
3. 用翻译键替换硬编码：
   ```typescript
   // Before
   <button>Edit Comment</button>
   // After
   <button>{t('commentModal.title.edit')}</button>
   ```

**对于独立模态组件（如 comment-modal.tsx）：**
1. 使用 I18nextProvider 包裹：
   ```typescript
   import { I18nextProvider } from 'react-i18next';
   import i18n from './i18n';
   
   return (
     <I18nextProvider i18n={i18n}>
       <YourComponent />
     </I18nextProvider>
   );
   ```
2. 使用 i18n.t() 作为回退：
   ```typescript
   const fallbackText = window.initialState?.selectedText || i18n.t('commentModal.noTextSelected');
   ```

#### 新增所需翻译键

以 commentModal 为例：
```json
{
  "commentModal": {
    "title": {
      "edit": "Edit Comment",
      "add": "Add Comment"
    },
    "selectedText": "Selected Text",
    "cancel": "Cancel",
    "noTextSelected": "No text selected"
  }
}
```

#### 预防

**代码评审清单：**
- [ ] 使用 `t()` 的组件均已声明 `useTranslation()`
- [ ] 所有翻译键存在于各语言文件
- [ ] 必要时使用 i18n Provider 包裹
- [ ] 构建无控制台错误

**开发工具：**
- 提交前运行 `npm run validate:i18n`
- 在不同语言下测试组件
- 关注控制台运行时错误
- 使用 TypeScript 增强检测

**构建校验：**
构建流程包含 i18n 校验，会在发布前捕获缺失翻译键和损坏 JSON。

#### 组件模板

```typescript
import React from 'react';
import { useTranslation } from 'react-i18next';

function NewComponent() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('newComponent.title')}</h1>
      <button>{t('newComponent.action')}</button>
    </div>
  );
}

export default NewComponent;
```

### 调试命令

```bash
# 校验全部翻译文件
npm run validate:i18n

# 仅运行 i18n 相关测试  
npm test -- --grep="i18n"

# 构建并开启详细日志
npm run build -- --verbose

# 检查 t() 使用情况
grep -r "t(" src/ --include="*.tsx" --include="*.ts"
```


