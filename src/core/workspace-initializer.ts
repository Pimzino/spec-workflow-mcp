import { promises as fs } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { PathUtils } from "./path-utils.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

export class WorkspaceInitializer {
  private projectPath: string;
  private version: string;
  private templateLang: "en" | "zh"; // 模板语言

  constructor(
    projectPath: string,
    version: string,
    templateLang: "en" | "zh" = "en"
  ) {
    this.projectPath = projectPath;
    this.version = version;
    this.templateLang = templateLang; // 默认为英文
  }

  async initializeWorkspace(): Promise<void> {
    // Create all necessary directories
    await this.initializeDirectories(); // 创建所有必要的目录

    // Copy template files
    await this.initializeTemplates(); // 复制模板文件

    // Create config example
    await this.createConfigExample(); // 创建配置示例

    // Create user templates README
    await this.createUserTemplatesReadme(); // 创建用户模板README

    // Create origin requirements README
    await this.createOriginRequirementsReadme(); // 创建原始需求文档说明
  }

  private async initializeDirectories(): Promise<void> {
    const workflowRoot = PathUtils.getWorkflowRoot(this.projectPath);

    const directories = [
      "origin-requirements",
      "approvals",
      "archive",
      "specs",
      "steering",
      "templates",
      "user-templates",
    ];

    for (const dir of directories) {
      const dirPath = join(workflowRoot, dir);
      await fs.mkdir(dirPath, { recursive: true }); // 创建目录recursive: true 递归创建目录
    }
  }

  private async initializeTemplates(): Promise<void> {
    const templatesDir = join(
      PathUtils.getWorkflowRoot(this.projectPath),
      "templates"
    );

    const templates = [
      "requirements-template",
      "design-template",
      "tasks-template",
      "product-template",
      "tech-template",
      "structure-template",
    ];

    for (const template of templates) {
      await this.copyTemplate(template, templatesDir);
    }
  }

  private async copyTemplate(
    templateName: string,
    targetDir: string
  ): Promise<void> {
    // Use simple filename without version
    const targetFileName = `${templateName}.md`;
    const targetPath = join(targetDir, targetFileName);

    // 根据 templateLang 选择对应语言的模板文件
    const sourcePath = join(
      __dirname,
      "..",
      "markdown",
      "templates",
      this.templateLang,
      `${templateName}.md`
    );

    try {
      const content = await fs.readFile(sourcePath, "utf-8");

      // Always overwrite to ensure latest template version is used
      await fs.writeFile(targetPath, content, "utf-8");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error(`Failed to copy template ${templateName}: ${errorMessage}`);
    }
  }

  private async createConfigExample(): Promise<void> {
    const configPath = join(
      PathUtils.getWorkflowRoot(this.projectPath),
      "config.example.toml"
    );

    const configContent =
      this.templateLang === "zh"
        ? this.getConfigContentZh()
        : this.getConfigContentEn();

    // Always overwrite to ensure language matches current templateLang setting
    // 始终覆盖以确保语言匹配当前的 templateLang 设置
    await fs.writeFile(configPath, configContent, "utf-8");
  }

  private getConfigContentEn(): string {
    return `# Spec Workflow MCP Server Configuration File
# ============================================
#
# This is an example configuration file for the Spec Workflow MCP Server.
# Copy this file to 'config.toml' in the same directory to use it.
#
# Configuration Precedence:
# 1. Command-line arguments (highest priority)
# 2. Config file settings
# 3. Built-in defaults (lowest priority)
#
# All settings are optional. Uncomment and modify as needed.
# Please note that not all MCP clients will support loading this config file due to the nature of where they are running from.

# Project directory path
# The root directory of your project where spec files are located.
# Note: You may have to use double slashes (\\\\) instead of single slashes (/) on Windows or for certain clients.
# Supports tilde (~) expansion for home directory.
# Default: current working directory
# projectDir = "."
# projectDir = "~/my-project"
# projectDir = "/absolute/path/to/project"

# Dashboard port
# The port number for the web dashboard.
# Must be between 1024 and 65535.
# Default: ephemeral port (automatically assigned)
# port = 3000

# Auto-start dashboard
# Automatically launch the dashboard when the MCP server starts.
# The dashboard will open in your default browser.
# Default: false
# autoStartDashboard = false

# Dashboard-only mode
# Run only the web dashboard without the MCP server.
# Useful for standalone dashboard usage.
# Default: false
# dashboardOnly = false

# Language
# Set the interface language for internationalization (i18n).
# Available languages depend on your installation.
# Common values: "en" (English), "ja" (Japanese), etc.
# Default: system language or "en"
# lang = "en"

# Example configurations:
# =====================

# Example 1: Development setup with auto-started dashboard
# ----------------------------------------------------------
# projectDir = "~/dev/my-project"
# autoStartDashboard = true
# port = 3456

# Example 2: Production MCP server without dashboard
# ---------------------------------------------------
# projectDir = "/var/projects/production"
# autoStartDashboard = false

# Example 3: Dashboard-only mode for viewing specs
# -------------------------------------------------
# projectDir = "."
# dashboardOnly = true
# port = 8080

# Example 4: Japanese language interface
# ---------------------------------------
# lang = "ja"
# autoStartDashboard = true

# Example 5: Chinese template language
# -------------------------------------
# templateLang = "zh"
# autoStartDashboard = true`;
  }

  private getConfigContentZh(): string {
    return `# Spec Workflow MCP 服务器配置文件
# ============================================
#
# 这是 Spec Workflow MCP 服务器的示例配置文件。
# 将此文件复制为同目录下的 'config.toml' 以使用它。
#
# 配置优先级：
# 1. 命令行参数（最高优先级）
# 2. 配置文件设置
# 3. 内置默认值（最低优先级）
#
# 所有设置都是可选的。根据需要取消注释并修改。
# 请注意，由于某些 MCP 客户端运行环境的原因，不是所有客户端都支持加载此配置文件。

# 项目目录路径
# 项目的根目录，规范文件所在位置。
# 注意：在 Windows 或某些客户端上，您可能需要使用双反斜杠(\\\\)而不是单斜杠(/)。
# 支持波浪号(~)展开为主目录。
# 默认：当前工作目录
# projectDir = "."
# projectDir = "~/my-project"
# projectDir = "/absolute/path/to/project"

# 仪表板端口
# Web 仪表板的端口号。
# 必须在 1024 到 65535 之间。
# 默认：临时端口（自动分配）
# port = 3000

# 自动启动仪表板
# 当 MCP 服务器启动时自动启动仪表板。
# 仪表板将在默认浏览器中打开。
# 默认：false
# autoStartDashboard = false

# 仅仪表板模式
# 仅运行 Web 仪表板，不启动 MCP 服务器。
# 适用于独立仪表板使用。
# 默认：false
# dashboardOnly = false

# 界面语言
# 设置国际化(i18n)的界面语言。
# 可用语言取决于您的安装。
# 常用值："en"（英语）、"ja"（日语）、"zh"（中文）等。
# 默认：系统语言或 "en"
# lang = "en"

# 模板语言
# 设置生成模板文件的语言。
# 可用值："en"（英语）、"zh"（中文）
# 默认："en"
# templateLang = "en"

# 配置示例：
# =====================

# 示例 1：开发环境设置，自动启动仪表板
# ----------------------------------------------------------
# projectDir = "~/dev/my-project"
# autoStartDashboard = true
# port = 3456

# 示例 2：生产环境 MCP 服务器，不启动仪表板
# ---------------------------------------------------
# projectDir = "/var/projects/production"
# autoStartDashboard = false

# 示例 3：仅仪表板模式，用于查看规范
# -------------------------------------------------
# projectDir = "."
# dashboardOnly = true
# port = 8080

# 示例 4：中文界面
# ---------------------------------------
# lang = "zh"
# autoStartDashboard = true

# 示例 5：使用中文模板
# -------------------------------------
# templateLang = "zh"
# autoStartDashboard = true`;
  }

  private async createUserTemplatesReadme(): Promise<void> {
    const readmePath = join(
      PathUtils.getWorkflowRoot(this.projectPath),
      "user-templates",
      "README.md"
    );

    const readmeContent =
      this.templateLang === "zh"
        ? this.getReadmeContentZh()
        : this.getReadmeContentEn();

    // Always overwrite to ensure language matches current templateLang setting
    // 始终覆盖以确保语言匹配当前的 templateLang 设置
    await fs.writeFile(readmePath, readmeContent, "utf-8");
  }

  private getReadmeContentEn(): string {
    return `# User Templates

This directory allows you to create custom templates that override the default Spec Workflow templates.

## How to Use Custom Templates

1. **Create your custom template file** in this directory with the exact same name as the default template you want to override:
   - \`requirements-template.md\` - Override requirements document template
   - \`design-template.md\` - Override design document template  
   - \`tasks-template.md\` - Override tasks document template
   - \`product-template.md\` - Override product steering template
   - \`tech-template.md\` - Override tech steering template
   - \`structure-template.md\` - Override structure steering template

2. **Template Loading Priority**:
   - The system first checks this \`user-templates/\` directory
   - If a matching template is found here, it will be used
   - Otherwise, the default template from \`templates/\` will be used

## Example Custom Template

To create a custom requirements template:

1. Create a file named \`requirements-template.md\` in this directory
2. Add your custom structure, for example:

\`\`\`markdown
# Requirements Document

## Executive Summary
[Your custom section]

## Business Requirements
[Your custom structure]

## Technical Requirements
[Your custom fields]

## Custom Sections
[Add any sections specific to your workflow]
\`\`\`

## Template Variables

Templates can include placeholders that will be replaced when documents are created:
- \`{{projectName}}\` - The name of your project
- \`{{featureName}}\` - The name of the feature being specified
- \`{{date}}\` - The current date
- \`{{author}}\` - The document author

## Best Practices

1. **Start from defaults**: Copy a default template from \`../templates/\` as a starting point
2. **Keep structure consistent**: Maintain similar section headers for tool compatibility
3. **Document changes**: Add comments explaining why sections were added/modified
4. **Version control**: Track your custom templates in version control
5. **Test thoroughly**: Ensure custom templates work with the spec workflow tools

## Notes

- Custom templates are project-specific and not included in the package distribution
- The \`templates/\` directory contains the default templates which are updated with each version
- Your custom templates in this directory are preserved during updates
- If a custom template has errors, the system will fall back to the default template
`;
  }

  private getReadmeContentZh(): string {
    return `# 用户自定义模板

此目录允许您创建自定义模板来覆盖默认的 Spec Workflow 模板。

## 如何使用自定义模板

1. **在此目录中创建自定义模板文件**，文件名必须与要覆盖的默认模板完全相同：
   - \`requirements-template.md\` - 覆盖需求文档模板
   - \`design-template.md\` - 覆盖设计文档模板
   - \`tasks-template.md\` - 覆盖任务文档模板
   - \`product-template.md\` - 覆盖产品指导模板
   - \`tech-template.md\` - 覆盖技术指导模板
   - \`structure-template.md\` - 覆盖结构指导模板

2. **模板加载优先级**：
   - 系统首先检查此 \`user-templates/\` 目录
   - 如果在此找到匹配的模板，将使用它
   - 否则，将使用 \`templates/\` 中的默认模板

## 自定义模板示例

创建自定义需求模板：

1. 在此目录中创建名为 \`requirements-template.md\` 的文件
2. 添加您的自定义结构，例如：

\`\`\`markdown
# 需求文档

## 执行摘要
[您的自定义章节]

## 业务需求
[您的自定义结构]

## 技术需求
[您的自定义字段]

## 自定义章节
[添加任何特定于您的工作流的章节]
\`\`\`

## 模板变量

模板可以包含在创建文档时将被替换的占位符：
- \`{{projectName}}\` - 您的项目名称
- \`{{featureName}}\` - 正在规范的功能名称
- \`{{date}}\` - 当前日期
- \`{{author}}\` - 文档作者

## 最佳实践

1. **从默认开始**：从 \`../templates/\` 复制默认模板作为起点
2. **保持结构一致**：维护相似的章节标题以保持工具兼容性
3. **记录更改**：添加注释说明为什么添加/修改了章节
4. **版本控制**：在版本控制中跟踪您的自定义模板
5. **充分测试**：确保自定义模板能与规范工作流工具正常工作

## 注意事项

- 自定义模板是项目特定的，不包含在包分发中
- \`templates/\` 目录包含随每个版本更新的默认模板
- 此目录中的自定义模板在更新期间会被保留
- 如果自定义模板有错误，系统将回退到默认模板
`;
  }

  private async createOriginRequirementsReadme(): Promise<void> {
    const readmePath = join(
      this.projectPath,
      "origin-requirements",
      "README.md"
    );

    const readmeContent =
      this.templateLang === "zh"
        ? this.getOriginRequirementsContentZh()
        : this.getOriginRequirementsContentEn();

    // Always overwrite to ensure language matches current templateLang setting
    await fs.writeFile(readmePath, readmeContent, "utf-8");
  }

  private getOriginRequirementsContentEn(): string {
    return `# Origin Requirements

This directory is for storing original requirement documents that will be converted into the Spec Workflow format.

## Purpose

The \`origin-requirements/\` directory serves as the entry point for importing existing requirement documents from various formats (Word, Markdown, etc.) into the spec-workflow system.

## Supported Formats

- **Word Documents**: \`.docx\`, \`.doc\`
- **Markdown Files**: \`.md\`

## How to Use

### 1. Place Your Document

Copy your original requirement document into this directory:

\`\`\`
origin-requirements/
├── user-authentication.docx
├── payment-system.md
└── api-specification.doc
\`\`\`

### 2. Convert to Spec Format

Use the \`convert-origin-requirement\` MCP tool to convert your document:

\`\`\`javascript
{
  "projectPath": "/path/to/project",
  "filename": "user-authentication.docx"
}
\`\`\`

Or with a specific spec name:

\`\`\`javascript
{
  "projectPath": "/path/to/project",
  "filename": "user-authentication.docx",
  "specName": "auth-system"
}
\`\`\`

### 3. Result

The tool will:
1. Detect the file format
2. Convert Word documents to Markdown (if needed)
3. Transform the content to spec-workflow format
4. Save to \`.spec-workflow/specs/{spec-name}/requirements.md\`

## Conversion Process

### For Word Documents

1. **Automatic Conversion**: The system uses Pandoc to convert Word to Markdown
2. **Media Extraction**: Images and media files are automatically extracted
3. **Format Preservation**: Tables, lists, and formatting are preserved as much as possible

### For Markdown Files

1. **Direct Processing**: Markdown files are processed directly
2. **Format Enhancement**: Content is wrapped with spec-workflow metadata
3. **Structure Validation**: Basic structure checks are performed

## File Naming

- Use descriptive names: \`user-authentication-requirements.docx\`
- Avoid special characters: Use letters, numbers, and hyphens
- The filename will be used to auto-generate the spec name if not specified

## Filename Prefix

You can use the \`#\` prefix when referencing files in the conversion tool:

\`\`\`javascript
{
  "filename": "#user-authentication.docx"
}
\`\`\`

This is useful for distinguishing files that are ready for conversion.

## Best Practices

### Document Preparation

1. **Use Standard Styles**: In Word, use Heading 1-6 for hierarchical structure
2. **Keep It Simple**: Avoid complex layouts that may not convert well
3. **Include Images Properly**: Embed images in the document (not linked externally)
4. **Use Tables Wisely**: Simple tables convert better than complex ones

### After Conversion

1. **Review the Output**: Check \`.spec-workflow/specs/{name}/requirements.md\`
2. **Edit as Needed**: Refine the converted content to match spec-workflow standards
3. **Archive Original**: Keep the original document for reference
4. **Version Control**: Commit both original and converted files

## Troubleshooting

### Conversion Fails

- **Check File Format**: Ensure the file has a supported extension
- **Verify File Size**: Large files (>10MB) may fail
- **Install Pandoc**: For local conversion, install Pandoc on your system
- **Check Permissions**: Ensure the file is readable

### Poor Conversion Quality

- **Simplify Formatting**: Remove complex styles and layouts
- **Split Large Documents**: Break into smaller, focused documents
- **Use Markdown Instead**: For new documents, consider writing directly in Markdown

### Missing Images

- **Embed Images**: In Word, ensure images are embedded, not linked
- **Check Media Directory**: Look in \`.temp/{document-name}/media/\`
- **Use Relative Paths**: In Markdown, use relative paths for images

## Configuration

You can configure the conversion process in \`.spec-workflow/config.toml\`:

\`\`\`toml
# Pandoc executable path (optional)
pandocPath = "/usr/local/bin/pandoc"

# Converter API URL (optional, for fallback)
converterApiUrl = "https://your-converter-api.com"

# API timeout in milliseconds
apiTimeout = 30000
\`\`\`

## Related Tools

- **convert-origin-requirement**: Import and convert requirement documents
- **md2word**: Export Markdown documents back to Word format

## Directory Structure

\`\`\`
project-root/
├── origin-requirements/          # This directory
│   ├── README.md                 # This file
│   ├── feature-1.docx           # Original documents
│   └── feature-2.md
├── .spec-workflow/
│   └── specs/
│       ├── feature-1/            # Converted specs
│       │   └── requirements.md
│       └── feature-2/
│           └── requirements.md
└── .temp/                        # Temporary conversion files
    └── origin-conversions/
\`\`\`

## Notes

- **Keep Originals**: Don't delete original documents after conversion
- **One Document Per Feature**: Each document should describe a single feature or component
- **Iterative Process**: You can reconvert documents if the original changes
- **Not Version Controlled by Default**: Add this directory to \`.gitignore\` if originals contain sensitive data

## Getting Started

1. Install Pandoc (recommended):
   \`\`\`bash
   # macOS
   brew install pandoc
   
   # Linux
   sudo apt-get install pandoc
   
   # Windows
   choco install pandoc
   \`\`\`

2. Place your requirement document in this directory

3. Use the MCP tool to convert:
   - Open your AI assistant with MCP support
   - Call the \`convert-origin-requirement\` tool
   - Provide the project path and filename

4. Review and refine the converted specification

For more information, see the [Converter Documentation](../.spec-workflow/docs/converter.md) (if available).
`;
  }

  private getOriginRequirementsContentZh(): string {
    return `# 原始需求文档

此目录用于存放将被转换为 Spec Workflow 格式的原始需求文档。

## 目的

\`origin-requirements/\` 目录作为将各种格式（Word、Markdown 等）的现有需求文档导入 spec-workflow 系统的入口点。

## 支持的格式

- **Word 文档**：\`.docx\`、\`.doc\`
- **Markdown 文件**：\`.md\`

## 使用方法

### 1. 放置文档

将原始需求文档复制到此目录：

\`\`\`
origin-requirements/
├── user-authentication.docx
├── payment-system.md
└── api-specification.doc
\`\`\`

### 2. 转换为规范格式

使用 \`convert-origin-requirement\` MCP 工具转换文档：

\`\`\`javascript
{
  "projectPath": "/path/to/project",
  "filename": "user-authentication.docx"
}
\`\`\`

或指定规范名称：

\`\`\`javascript
{
  "projectPath": "/path/to/project",
  "filename": "user-authentication.docx",
  "specName": "auth-system"
}
\`\`\`

### 3. 结果

该工具会：
1. 检测文件格式
2. 转换 Word 文档为 Markdown（如需要）
3. 将内容转换为 spec-workflow 格式
4. 保存到 \`.spec-workflow/specs/{spec-name}/requirements.md\`

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

- 使用描述性名称：\`user-authentication-requirements.docx\`
- 避免特殊字符：使用字母、数字和连字符
- 如果未指定，文件名将用于自动生成规范名称

## 文件名前缀

在转换工具中引用文件时可以使用 \`#\` 前缀：

\`\`\`javascript
{
  "filename": "#user-authentication.docx"
}
\`\`\`

这对区分准备好转换的文件很有用。

## 最佳实践

### 文档准备

1. **使用标准样式**：在 Word 中使用标题 1-6 来构建层次结构
2. **保持简单**：避免可能无法很好转换的复杂布局
3. **正确包含图片**：在文档中嵌入图片（不要外部链接）
4. **明智使用表格**：简单表格比复杂表格转换效果更好

### 转换后

1. **审查输出**：检查 \`.spec-workflow/specs/{name}/requirements.md\`
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
- **检查媒体目录**：查看 \`.temp/{document-name}/media/\`
- **使用相对路径**：在 Markdown 中，使用图片的相对路径

## 配置

可以在 \`.spec-workflow/config.toml\` 中配置转换过程：

\`\`\`toml
# Pandoc 可执行文件路径（可选）
pandocPath = "/usr/local/bin/pandoc"

# 转换器 API URL（可选，用于降级）
converterApiUrl = "https://your-converter-api.com"

# API 超时时间（毫秒）
apiTimeout = 30000
\`\`\`

## 相关工具

- **convert-origin-requirement**：导入和转换需求文档
- **md2word**：将 Markdown 文档导出回 Word 格式

## 目录结构

\`\`\`
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
\`\`\`

## 注意事项

- **保留原始文档**：转换后不要删除原始文档
- **每个功能一个文档**：每个文档应描述单个功能或组件
- **迭代过程**：如果原始文档更改，可以重新转换
- **默认不受版本控制**：如果原始文档包含敏感数据，将此目录添加到 \`.gitignore\`

## 入门指南

1. 安装 Pandoc（推荐）：
   \`\`\`bash
   # macOS
   brew install pandoc
   
   # Linux
   sudo apt-get install pandoc
   
   # Windows
   choco install pandoc
   \`\`\`

2. 将需求文档放入此目录

3. 使用 MCP 工具转换：
   - 打开支持 MCP 的 AI 助手
   - 调用 \`convert-origin-requirement\` 工具
   - 提供项目路径和文件名

4. 审查和完善转换后的规范

更多信息，请参阅[转换器文档](../.spec-workflow/docs/converter.md)（如果可用）。
`;
  }
}
