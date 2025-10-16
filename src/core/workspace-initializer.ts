import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { PathUtils } from './path-utils.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

export class WorkspaceInitializer {
  private projectPath: string;
  private version: string;
  private templateLang: 'en' | 'zh'; // 模板语言
  
  constructor(projectPath: string, version: string, templateLang: 'en' | 'zh' = 'en') {
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
  }
  
  private async initializeDirectories(): Promise<void> {
    const workflowRoot = PathUtils.getWorkflowRoot(this.projectPath);
    
    const directories = [
      'approvals',
      'archive', 
      'specs',
      'steering',
      'templates',
      'user-templates'
    ];
    
    for (const dir of directories) {
      const dirPath = join(workflowRoot, dir);
      await fs.mkdir(dirPath, { recursive: true }); // 创建目录recursive: true 递归创建目录
    }
  }
  
  private async initializeTemplates(): Promise<void> {
    const templatesDir = join(PathUtils.getWorkflowRoot(this.projectPath), 'templates');
    
    const templates = [
      'requirements-template',
      'design-template',
      'tasks-template',
      'product-template',
      'tech-template',
      'structure-template'
    ];
    
    for (const template of templates) {
      await this.copyTemplate(template, templatesDir);
    }
  }
  
  private async copyTemplate(templateName: string, targetDir: string): Promise<void> {
    // Use simple filename without version
    const targetFileName = `${templateName}.md`;
    const targetPath = join(targetDir, targetFileName);
    
    // 根据 templateLang 选择对应语言的模板文件
    const sourcePath = join(__dirname, '..', 'markdown', 'templates', this.templateLang, `${templateName}.md`);
    
    try {
      const content = await fs.readFile(sourcePath, 'utf-8');
      
      // Always overwrite to ensure latest template version is used
      await fs.writeFile(targetPath, content, 'utf-8');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`Failed to copy template ${templateName}: ${errorMessage}`);
    }
  }
  
  private async createConfigExample(): Promise<void> {
    const configPath = join(PathUtils.getWorkflowRoot(this.projectPath), 'config.example.toml');
    
    const configContent = this.templateLang === 'zh' ? this.getConfigContentZh() : this.getConfigContentEn();
    
    // Always overwrite to ensure language matches current templateLang setting
    // 始终覆盖以确保语言匹配当前的 templateLang 设置
    await fs.writeFile(configPath, configContent, 'utf-8');
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
    const readmePath = join(PathUtils.getWorkflowRoot(this.projectPath), 'user-templates', 'README.md');
    
    const readmeContent = this.templateLang === 'zh' ? this.getReadmeContentZh() : this.getReadmeContentEn();
    
    // Always overwrite to ensure language matches current templateLang setting
    // 始终覆盖以确保语言匹配当前的 templateLang 设置
    await fs.writeFile(readmePath, readmeContent, 'utf-8');
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
}