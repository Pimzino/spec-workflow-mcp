import { promises as fs } from 'fs';
import { join, dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { homedir } from 'os';
import { PathUtils } from './path-utils.js';
import { ImplementationLogMigrator } from './implementation-log-migrator.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

export class WorkspaceInitializer {
  private projectPath: string;
  private version: string;

  constructor(projectPath: string, version: string) {
    this.projectPath = projectPath;
    this.version = version;
  }

  async initializeWorkspace(): Promise<void> {
    // Create all necessary directories
    await this.initializeDirectories();

    // Copy template files
    await this.initializeTemplates();

    // Create user templates README
    await this.createUserTemplatesReadme();

    // Migrate implementation logs from JSON to Markdown format
    await this.migrateImplementationLogs();
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
      await fs.mkdir(dirPath, { recursive: true });
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
    
    const sourcePath = join(__dirname, '..', 'markdown', 'templates', `${templateName}.md`);
    
    try {
      const content = await fs.readFile(sourcePath, 'utf-8');
      
      // Always overwrite to ensure latest template version is used
      await fs.writeFile(targetPath, content, 'utf-8');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`Failed to copy template ${templateName}: ${errorMessage}`);
    }
  }
  
  private async createUserTemplatesReadme(): Promise<void> {
    const readmePath = join(PathUtils.getWorkflowRoot(this.projectPath), 'user-templates', 'README.md');

    const readmeContent = `# User Templates

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

    try {
      // Only create if it doesn't exist to avoid overwriting user's README
      await fs.access(readmePath);
    } catch {
      // File doesn't exist, create it
      await fs.writeFile(readmePath, readmeContent, 'utf-8');
    }
  }

  /**
   * Migrate implementation logs from JSON to Markdown format
   * Runs on server startup to handle automatic migration for existing specs
   */
  private async migrateImplementationLogs(): Promise<void> {
    try {
      const userDataDir = resolve(homedir(), '.spec-workflow-mcp');
      const specsDir = join(PathUtils.getWorkflowRoot(this.projectPath), 'specs');

      // Create user data directory if it doesn't exist
      await fs.mkdir(userDataDir, { recursive: true });

      const migrator = new ImplementationLogMigrator(userDataDir);
      await migrator.migrateAllSpecs(specsDir);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`Implementation log migration failed: ${errorMessage}`);
      // Don't throw - migration failure shouldn't break server startup
    }
  }
}