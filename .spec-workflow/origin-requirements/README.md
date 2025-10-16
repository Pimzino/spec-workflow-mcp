# 原始需求文档

此目录用于存放将被转换为 Spec Workflow 格式的原始需求文档。

## 目的

`origin-requirements/` 目录作为将各种格式（Word、Markdown 等）的现有需求文档导入 spec-workflow 系统的入口点。

## 支持的格式

- **Word 文档**：`.docx`、`.doc`
- **Markdown 文件**：`.md`

## 使用方法

### 1. 放置文档

将原始需求文档复制到此目录：

```
origin-requirements/
├── user-authentication.docx
├── payment-system.md
└── api-specification.doc
```

### 2. 转换为规范格式

使用 `convert-origin-requirement` MCP 工具转换文档：

```javascript
{
  "projectPath": "/path/to/project",
  "filename": "user-authentication.docx"
}
```

或指定规范名称：

```javascript
{
  "projectPath": "/path/to/project",
  "filename": "user-authentication.docx",
  "specName": "auth-system"
}
```

### 3. 结果

该工具会：
1. 检测文件格式
2. 转换 Word 文档为 Markdown（如需要）
3. 将内容转换为 spec-workflow 格式
4. 保存到 `.spec-workflow/specs/{spec-name}/requirements.md`

## 转换过程

### Word 文档

1. **自动转换**：系统使用 Pandoc 将 Word 转换为 Markdown
2. **媒体提取**：自动提取图片和媒体文件
3. **格式保留**：尽可能保留表格、列表和格式

### Markdown 文件

1. **直接处理**：Markdown 文件直接处理
2. **格式增强**：内容用 spec-workflow 元数据包装
3. **结构验证**：执行基本的结构检查

## 文件命名

- 使用描述性名称：`user-authentication-requirements.docx`
- 避免特殊字符：使用字母、数字和连字符
- 如果未指定，文件名将用于自动生成规范名称

## 文件名前缀

在转换工具中引用文件时可以使用 `#` 前缀：

```javascript
{
  "filename": "#user-authentication.docx"
}
```

这对区分准备好转换的文件很有用。

## 最佳实践

### 文档准备

1. **使用标准样式**：在 Word 中使用标题 1-6 来构建层次结构
2. **保持简单**：避免可能无法很好转换的复杂布局
3. **正确包含图片**：在文档中嵌入图片（不要外部链接）
4. **明智使用表格**：简单表格比复杂表格转换效果更好

### 转换后

1. **审查输出**：检查 `.spec-workflow/specs/{name}/requirements.md`
2. **按需编辑**：完善转换后的内容以符合 spec-workflow 标准
3. **归档原始文档**：保留原始文档以供参考
4. **版本控制**：提交原始和转换后的文件

## 故障排查

### 转换失败

- **检查文件格式**：确保文件有支持的扩展名
- **验证文件大小**：大文件（>10MB）可能失败
- **安装 Pandoc**：对于本地转换，在系统上安装 Pandoc
- **检查权限**：确保文件可读

### 转换质量差

- **简化格式**：删除复杂的样式和布局
- **拆分大文档**：分解为更小、更集中的文档
- **改用 Markdown**：对于新文档，考虑直接用 Markdown 编写

### 图片丢失

- **嵌入图片**：在 Word 中，确保图片是嵌入的，而不是链接的
- **检查媒体目录**：查看 `.temp/{document-name}/media/`
- **使用相对路径**：在 Markdown 中，使用图片的相对路径

## 配置

可以在 `.spec-workflow/config.toml` 中配置转换过程：

```toml
# Pandoc 可执行文件路径（可选）
pandocPath = "/usr/local/bin/pandoc"

# 转换器 API URL（可选，用于降级）
converterApiUrl = "https://your-converter-api.com"

# API 超时时间（毫秒）
apiTimeout = 30000
```

## 相关工具

- **convert-origin-requirement**：导入和转换需求文档
- **md2word**：将 Markdown 文档导出回 Word 格式

## 目录结构

```
project-root/
├── origin-requirements/          # 此目录
│   ├── README.md                 # 本文件
│   ├── feature-1.docx           # 原始文档
│   └── feature-2.md
├── .spec-workflow/
│   └── specs/
│       ├── feature-1/            # 转换后的规范
│       │   └── requirements.md
│       └── feature-2/
│           └── requirements.md
└── .temp/                        # 临时转换文件
    └── origin-conversions/
```

## 注意事项

- **保留原始文档**：转换后不要删除原始文档
- **每个功能一个文档**：每个文档应描述单个功能或组件
- **迭代过程**：如果原始文档更改，可以重新转换
- **默认不受版本控制**：如果原始文档包含敏感数据，将此目录添加到 `.gitignore`

## 入门指南

1. 安装 Pandoc（推荐）：
   ```bash
   # macOS
   brew install pandoc
   
   # Linux
   sudo apt-get install pandoc
   
   # Windows
   choco install pandoc
   ```

2. 将需求文档放入此目录

3. 使用 MCP 工具转换：
   - 打开支持 MCP 的 AI 助手
   - 调用 `convert-origin-requirement` 工具
   - 提供项目路径和文件名

4. 审查和完善转换后的规范

更多信息，请参阅[转换器文档](../.spec-workflow/docs/converter.md)（如果可用）。
