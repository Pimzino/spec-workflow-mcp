# 界面指南

本指南涵盖 Spec Workflow MCP 的两个主要界面：Web 仪表板和 VSCode 扩展。

## 概述

Spec Workflow MCP 提供两个界面：

1. **Web 仪表板** - 供 CLI 用户使用的基于浏览器的界面
2. **VSCode 扩展** - 供 VSCode 用户使用的集成 IDE 体验

两个界面都提供相同的核心功能，并针对各自平台进行了优化。

## Web 仪表板

### 概述

Web 仪表板是一个实时 Web 应用程序，提供对规格、任务和审批工作流程的可视化访问。

### 启动仪表板

#### 独立仪表板
```bash
# 使用临时端口
npx -y @pimzino/spec-workflow-mcp@latest /path/to/project --dashboard

# 自定义端口
npx -y @pimzino/spec-workflow-mcp@latest /path/to/project --dashboard --port 3000
```

#### 与 MCP 服务器一起
```bash
# 分别运行 MCP 服务器和仪表板（推荐）
# 终端 1: 启动仪表板
npx -y @pimzino/spec-workflow-mcp@latest --dashboard

# 终端 2: 启动 MCP 服务器
npx -y @pimzino/spec-workflow-mcp@latest /path/to/project
```

### 仪表板功能

#### 主视图

仪表板主页显示：

- **项目概览**
  - 活跃规格数量
  - 总任务数
  - 完成百分比
  - 最近活动

- **规格卡片**
  - 规格名称和状态
  - 进度条
  - 文档指示器
  - 快速操作

#### 规格详情视图

点击规格显示：

- **文档标签**
  - 需求
  - 设计
  - 任务

- **文档内容**
  - 渲染的 markdown
  - 语法高亮
  - 目录

- **审批操作**
  - 批准按钮
  - 请求更改
  - 拒绝选项
  - 评论字段

#### 任务管理

任务视图提供：

- **分层任务列表**
  - 编号任务（1.0, 1.1, 1.1.1）
  - 状态指示器
  - 进度跟踪

- **任务操作**
  - 复制提示按钮
  - 标记完成
  - 添加备注
  - 查看依赖关系

- **进度可视化**
  - 总体进度条
  - 章节进度
  - 时间估算

#### 指导文档

访问项目指导：

- **产品指导**
  - 愿景和目标
  - 用户角色
  - 成功指标

- **技术指导**
  - 架构决策
  - 技术选择
  - 性能目标

- **结构指导**
  - 文件组织
  - 命名约定
  - 模块边界

### 仪表板导航

#### 键盘快捷键

| 快捷键 | 操作 |
|----------|--------|
| `Alt + S` | 聚焦规格列表 |
| `Alt + T` | 查看任务 |
| `Alt + R` | 查看需求 |
| `Alt + D` | 查看设计 |
| `Alt + A` | 打开审批对话框 |
| `Esc` | 关闭对话框 |

#### URL 结构

直接链接到特定视图：
- `/` - 主页仪表板
- `/spec/{name}` - 特定规格
- `/spec/{name}/requirements` - 需求文档
- `/spec/{name}/design` - 设计文档
- `/spec/{name}/tasks` - 任务列表
- `/steering/{type}` - 指导文档

### 实时更新

仪表板使用 WebSockets 进行实时更新：

- **自动刷新**
  - 新规格立即出现
  - 任务状态更新
  - 进度更改
  - 审批通知

- **连接状态**
  - 绿色：已连接
  - 黄色：重新连接中
  - 红色：已断开

- **通知系统**
  - 审批请求
  - 任务完成
  - 错误警报
  - 成功消息

### 仪表板自定义

#### 主题设置

在亮色和暗色模式之间切换：
- 点击标题中的主题图标
- 跨会话保持
- 遵循系统偏好

#### 语言选择

更改界面语言：
1. 点击设置图标
2. 从下拉菜单中选择语言
3. 界面立即更新

支持的语言：
- English (en)
- Japanese (ja)
- Chinese (zh)
- Spanish (es)
- Portuguese (pt)
- German (de)
- French (fr)
- Russian (ru)
- Italian (it)
- Korean (ko)
- Arabic (ar)

#### 显示选项

自定义视图首选项：
- 紧凑/展开的规格卡片
- 显示/隐藏已完成的任务
- 文档字体大小
- 代码语法主题

## VSCode 扩展

### 安装

从 VSCode 市场安装：

1. 打开 VSCode 扩展（Ctrl+Shift+X）
2. 搜索 "Spec Workflow MCP"
3. 点击安装
4. 重新加载 VSCode

或通过命令行：
```bash
code --install-extension Pimzino.spec-workflow-mcp
```

### 扩展功能

#### 侧边栏面板

通过活动栏图标访问：

- **规格浏览器**
  - 所有规格的树视图
  - 展开查看文档
  - 状态指示器
  - 上下文菜单操作

- **任务列表**
  - 可过滤的任务视图
  - 进度跟踪
  - 快速操作
  - 搜索功能

- **归档视图**
  - 已完成的规格
  - 历史数据
  - 还原选项
  - 批量操作

#### 文档查看器

在编辑器中打开文档：

- **语法高亮**
  - Markdown 渲染
  - 代码块
  - 任务复选框
  - 链接和引用

- **文档操作**
  - 就地编辑
  - 预览模式
  - 拆分视图
  - 导出选项

#### 集成审批

用于以下的原生 VSCode 对话框：

- **审批请求**
  - 弹出通知
  - 内联评论
  - 快速批准/拒绝
  - 详细反馈

- **修订工作流程**
  - 跟踪更改
  - 评论线程
  - 版本比较
  - 审批历史

#### 上下文菜单操作

编辑器中的右键操作：

- **在规格文件上**
  - 批准文档
  - 请求更改
  - 在仪表板中查看
  - 复制规格路径

- **在任务项目上**
  - 标记完成
  - 复制提示
  - 添加子任务
  - 查看详情

### 扩展设置

在 VSCode 设置中配置：

```json
{
  "specWorkflow.language": "en",
  "specWorkflow.notifications.enabled": true,
  "specWorkflow.notifications.sound": true,
  "specWorkflow.notifications.volume": 0.5,
  "specWorkflow.archive.showInExplorer": true,
  "specWorkflow.tasks.autoRefresh": true,
  "specWorkflow.tasks.refreshInterval": 5000,
  "specWorkflow.theme.followVSCode": true
}
```

#### 设置描述

| 设置 | 描述 | 默认值 |
|---------|-------------|---------|
| `language` | 界面语言 | "en" |
| `notifications.enabled` | 显示通知 | true |
| `notifications.sound` | 播放声音警报 | true |
| `notifications.volume` | 声音音量（0-1） | 0.5 |
| `archive.showInExplorer` | 显示已归档的规格 | true |
| `tasks.autoRefresh` | 自动刷新任务 | true |
| `tasks.refreshInterval` | 刷新间隔（毫秒） | 5000 |
| `theme.followVSCode` | 匹配 VSCode 主题 | true |

### 扩展命令

在命令面板中可用（Ctrl+Shift+P）：

| 命令 | 描述 |
|---------|-------------|
| `Spec Workflow: Create Spec` | 开始新规格 |
| `Spec Workflow: List Specs` | 显示所有规格 |
| `Spec Workflow: View Dashboard` | 打开 Web 仪表板 |
| `Spec Workflow: Archive Spec` | 移至归档 |
| `Spec Workflow: Restore Spec` | 从归档还原 |
| `Spec Workflow: Refresh` | 重新加载规格数据 |
| `Spec Workflow: Show Steering` | 查看指导文档 |
| `Spec Workflow: Export Spec` | 导出为 markdown |

### 声音通知

扩展包含以下音频警报：

- **审批请求** - 柔和的铃声
- **任务完成** - 成功声音
- **错误** - 警报音
- **更新** - 轻柔通知

在设置中配置：
```json
{
  "specWorkflow.notifications.sound": true,
  "specWorkflow.notifications.volume": 0.3
}
```

## 功能比较

| 功能 | Web 仪表板 | VSCode 扩展 |
|---------|--------------|------------------|
| 查看规格 | ✅ | ✅ |
| 管理任务 | ✅ | ✅ |
| 审批 | ✅ | ✅ |
| 实时更新 | ✅ | ✅ |
| 归档系统 | ❌ | ✅ |
| 声音通知 | ❌ | ✅ |
| 编辑器集成 | ❌ | ✅ |
| 上下文菜单 | ❌ | ✅ |
| 键盘快捷键 | 有限 | 完整 |
| 多项目 | 手动 | 自动 |
| 离线访问 | ❌ | ✅ |
| 导出选项 | 基本 | 高级 |

## 选择合适的界面

### 在以下情况下使用 Web 仪表板：

- 使用基于 CLI 的 AI 工具
- 跨多个 IDE 工作
- 需要基于浏览器的访问
- 与团队成员共享
- 需要快速项目概览

### 在以下情况下使用 VSCode 扩展：

- 主要 IDE 是 VSCode
- 想要集成体验
- 需要编辑器功能
- 偏好原生对话框
- 想要声音通知

## 界面同步

两个界面共享相同的数据：

- **实时同步**
  - 一个界面中的更改反映在另一个中
  - 共享审批状态
  - 一致的任务状态
  - 统一的进度跟踪

- **数据存储**
  - 单一事实来源
  - 基于文件的存储
  - 无需同步
  - 即时更新

## 移动和平板电脑访问

### 移动设备上的 Web 仪表板

仪表板是响应式的：

- **手机视图**
  - 堆叠的规格卡片
  - 可折叠导航
  - 触摸优化按钮
  - 滑动手势

- **平板视图**
  - 并排布局
  - 触摸交互
  - 优化的间距
  - 横向支持

### 移动设备上的限制

- 无 VSCode 扩展
- 有限的键盘快捷键
- 减少的多任务处理
- 简化的交互

## 辅助功能

### Web 仪表板

- **键盘导航**
  - Tab 键浏览元素
  - Enter 键激活
  - Escape 键取消
  - 箭头键用于列表

- **屏幕阅读器支持**
  - ARIA 标签
  - 角色属性
  - 状态公告
  - 焦点管理

- **视觉辅助功能**
  - 高对比度模式
  - 可调字体大小
  - 色盲友好
  - 焦点指示器

### VSCode 扩展

继承 VSCode 辅助功能：
- 屏幕阅读器支持
- 键盘导航
- 高对比度主题
- 缩放功能

## 性能优化

### 仪表板性能

- **延迟加载**
  - 按需加载文档
  - 长列表分页
  - 渐进式渲染
  - 图像优化

- **缓存策略**
  - 浏览器缓存
  - Service worker
  - 离线支持（有限）
  - 快速导航

### 扩展性能

- **资源管理**
  - 最小内存使用
  - 高效的文件监视
  - 防抖更新
  - 后台处理

## 界面问题故障排除

### 仪表板问题

| 问题 | 解决方案 |
|-------|----------|
| 无法加载 | 检查服务器是否运行，验证 URL |
| 无更新 | 检查 WebSocket 连接，刷新页面 |
| 审批不起作用 | 确保仪表板和 MCP 已连接 |
| 样式损坏 | 清除浏览器缓存，检查控制台 |

### 扩展问题

| 问题 | 解决方案 |
|-------|----------|
| 不显示规格 | 检查项目是否有 .spec-workflow 目录 |
| 命令不起作用 | 重新加载 VSCode 窗口 |
| 无通知 | 检查扩展设置 |
| 归档不可见 | 在设置中启用 |

## 高级用法

### 自定义仪表板 URL

在多个终端中配置：
```bash
# 终端 1：MCP 服务器
npx -y @pimzino/spec-workflow-mcp@latest /project

# 终端 2：仪表板
npx -y @pimzino/spec-workflow-mcp@latest /project --dashboard --port 3000
```

### 扩展多根工作区

扩展支持 VSCode 多根工作区：

1. 添加多个项目文件夹
2. 每个显示单独的规格
3. 在项目之间切换
4. 独立配置

## 相关文档

- [配置指南](CONFIGURATION.zh.md) - 设置和配置
- [用户指南](USER-GUIDE.zh.md) - 使用界面
- [工作流程](WORKFLOW.zh.md) - 开发工作流程
- [故障排除](TROUBLESHOOTING.zh.md) - 常见问题
