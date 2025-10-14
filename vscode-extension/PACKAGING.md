# VS Code 扩展打包指南

## 📦 打包成 .vsix 文件

### 前置要求

确保已安装 `@vscode/vsce` 工具：

```bash
npm install
```

### 打包命令

#### 1. 完整打包（推荐）

执行完整的检查、编译和打包流程：

```bash
npm run package
```

这个命令会：
1. ✅ 类型检查 (`check-types`)
2. ✅ 代码检查 (`lint`)
3. ✅ 编译 Webview 前端 (`build:webview`)
4. ✅ 编译扩展代码 (`esbuild`)
5. ✅ 打包成 `.vsix` 文件 (`vsce package`)

#### 2. 快速打包

如果代码已经编译好，只想快速生成 `.vsix`：

```bash
npm run package:vsix
```

### 输出结果

打包成功后，会在当前目录生成：

```
spec-workflow-mcp-1.0.0.vsix
```

文件名格式：`{name}-{version}.vsix`

### 安装 .vsix 文件

有三种方式安装：

#### 方式 1：VS Code 命令行

```bash
code --install-extension spec-workflow-mcp-1.0.0.vsix
```

#### 方式 2：VS Code 图形界面

1. 打开 VS Code
2. 打开扩展面板（Ctrl/Cmd + Shift + X）
3. 点击右上角 `...` 菜单
4. 选择 "从 VSIX 安装..."
5. 选择生成的 `.vsix` 文件

#### 方式 3：拖拽安装

直接将 `.vsix` 文件拖拽到 VS Code 窗口中。

## 📤 发布到市场

### 发布前准备

1. **创建 Azure DevOps 账号**
   访问：https://dev.azure.com

2. **获取 Personal Access Token (PAT)**
   - 在 Azure DevOps 中创建 PAT
   - 权限选择：Marketplace > Manage

3. **登录 vsce**
   ```bash
   npx vsce login <publisher-name>
   ```

### 发布命令

```bash
npm run publish
```

或指定版本号：

```bash
npx vsce publish patch  # 1.0.0 → 1.0.1
npx vsce publish minor  # 1.0.0 → 1.1.0
npx vsce publish major  # 1.0.0 → 2.0.0
```

## 🔍 打包内容检查

查看 `.vsix` 包中包含哪些文件：

```bash
npx vsce ls
```

## ⚙️ 配置说明

### package.json 关键字段

```json
{
  "name": "spec-workflow-mcp",        // 扩展 ID
  "displayName": "Spec Workflow MCP", // 显示名称
  "version": "1.0.0",                 // 版本号
  "publisher": "Pimzino",             // 发布者 ID
  "engines": {
    "vscode": "^1.99.0"               // 最低 VS Code 版本
  }
}
```

### .vscodeignore

控制哪些文件**不**打包进 `.vsix`：

- ✅ **包含**: `dist/`, `webview-dist/`, `icon.png`, `README.md`
- ❌ **排除**: `src/`, `node_modules/`, 测试文件, 配置文件

## 📊 打包大小优化

当前配置已优化：

1. **源码排除**: TypeScript 源文件不打包，只打包编译后的 `dist/`
2. **依赖优化**: 通过 esbuild 打包，减少文件数量
3. **Webview 优化**: Vite 构建，代码压缩和 Tree-shaking

## 🐛 常见问题

### 问题 1：打包失败 - "Cannot find module"

**解决方案**：
```bash
npm install
npm run package
```

### 问题 2：打包后体积过大

**检查步骤**：
```bash
# 查看包含的文件
npx vsce ls

# 检查 .vscodeignore 配置
```

### 问题 3：安装后扩展无法激活

**检查**：
- `package.json` 中的 `main` 字段是否正确指向 `./dist/extension.js`
- `activationEvents` 是否配置正确
- 查看 VS Code 开发者工具控制台错误信息

## 📝 版本管理

建议使用语义化版本：

- **MAJOR**（主版本号）：不兼容的 API 修改
- **MINOR**（次版本号）：向下兼容的功能性新增
- **PATCH**（修订号）：向下兼容的问题修正

```bash
# 更新版本号
npm version patch  # 1.0.0 → 1.0.1
npm version minor  # 1.0.0 → 1.1.0
npm version major  # 1.0.0 → 2.0.0
```

## 🔗 相关链接

- [VS Code 扩展发布文档](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)
- [vsce 工具文档](https://github.com/microsoft/vscode-vsce)
- [VS Code 扩展市场](https://marketplace.visualstudio.com/vscode)

