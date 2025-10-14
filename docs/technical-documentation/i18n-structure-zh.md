# 国际化 (i18n) 结构

## 概述

spec-workflow-mcp 项目在三个不同的组件中实现国际化，每个组件都有自己的翻译文件结构以满足特定的 UI 和功能要求。

## 支持的语言

项目支持 11 种语言：
- 英语 (en) 🇺🇸
- 日语 (ja) 🇯🇵
- 中文 (zh) 🇨🇳
- 西班牙语 (es) 🇪🇸
- 葡萄牙语 (pt) 🇧🇷
- 德语 (de) 🇩🇪
- 法语 (fr) 🇫🇷
- 俄语 (ru) 🇷🇺
- 意大利语 (it) 🇮🇹
- 韩语 (ko) 🇰🇷
- 阿拉伯语 (ar) 🇸🇦

## 翻译文件位置

### 1. 后端 MCP 服务器 (`src/locales/`)
- **目的**: MCP 工具响应和服务器消息的翻译
- **结构**: 以 `tools`、`specStatus`、`errors` 等键开始
- **用途**: MCP 服务器响应工具调用时使用
- **示例键**:
  ```json
  {
    "tools": {
      "steeringGuide": { ... },
      "specStatus": { ... }
    }
  }
  ```

### 2. VSCode 扩展 Webview (`vscode-extension/src/webview/locales/`)
- **目的**: VSCode 扩展 webview UI 的翻译
- **结构**: 以 `header`、`tabs`、`overview` 等键开始
- **用途**: 在 VSCode 扩展的基于 React 的 webview 中使用
- **示例键**:
  ```json
  {
    "header": { "title": "...", "support": "..." },
    "tabs": { "overview": "...", "steering": "..." },
    "overview": { ... }
  }
  ```

### 3. Dashboard 前端 (`src/dashboard_frontend/src/locales/`)
- **目的**: Web 仪表板 UI 的翻译
- **结构**: 与 VSCode 类似，但具有仪表板特定的部分
- **用途**: 在独立的 Web 仪表板中使用
- **示例键**:
  ```json
  {
    "nav": { ... },
    "dashboard": { ... },
    "settings": { ... }
  }
  ```

## 为什么结构不同？

每个组件有不同的目的和独特的翻译需求：

1. **后端 MCP 服务器**: 专注于工具描述、错误消息和工作流指导
2. **VSCode 扩展**: 在 VSCode 中提供简化的项目管理界面
3. **Dashboard 前端**: 提供全面的基于 Web 的项目仪表板

不同的结构是**有意为之且正确的** - 它们不是不一致，而是为每个组件的特定需求量身定制的翻译集。

## 验证

所有翻译文件在构建过程中都会被验证：

```bash
npm run validate:i18n
```

此脚本检查：
- JSON 语法有效性
- 跨语言的 Mustache 模板变量一致性
- 所有支持语言的文件存在性

## 添加新语言

要添加新语言：

1. 将语言代码添加到以下文件中的 `SUPPORTED_LANGUAGES`：
   - `src/core/i18n.ts`
   - `scripts/validate-i18n.js`

2. 在所有三个位置创建翻译文件：
   - `src/locales/{lang}.json`
   - `vscode-extension/src/webview/locales/{lang}.json`
   - `src/dashboard_frontend/src/locales/{lang}.json`

3. 更新语言选择器：
   - VSCode: `vscode-extension/src/webview/App.tsx`
   - Dashboard: `src/dashboard_frontend/src/components/LanguageSelector.tsx`

4. 在 i18n 配置中导入和注册翻译：
   - `vscode-extension/src/webview/i18n.ts`
   - `src/dashboard_frontend/src/i18n.ts`

## 打包大小考虑

对于 11 种语言，应监控打包大小的影响。对于拥有大量用户群的生产部署，考虑：

- 实现语言包的延迟加载
- 为动态导入设置 `REACT_APP_I18N_DYNAMIC=true`
- 最初仅加载用户选择的语言

当前实现使用预加载以在语言切换期间提供更好的用户体验。

## 最近的问题和修复

### 版本 0.0.30 - 关键翻译修复

解决了一个关键问题，多个组件在没有正确声明 `useTranslation` 钩子的情况下使用翻译函数（`t()`），导致 "ReferenceError: t is not defined" 错误。这影响了：

- 任务管理下拉功能
- 评论模态界面
- 音量控制
- 警报对话框

**解决方案**: 所有受影响的组件现在都正确导入和声明 `useTranslation` 钩子，并且在所有 11 种语言中添加了缺失的翻译键。

**预防**: 增强的文档包括组件模板和验证检查表，以防止类似问题。

有关详细的故障排除信息，请参阅 [i18n 指南](./i18n-guide.md#critical-issue-referenceerror-t-is-not-defined)。

