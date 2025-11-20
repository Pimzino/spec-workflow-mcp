import * as vscode from 'vscode';
import * as fs from 'fs/promises';
import * as path from 'path';
import { SpecData, TaskProgressData, TaskInfo, ApprovalData, SteeringStatus, PhaseStatus, LogsData, ImplementationLogEntry } from '../types';
import { ApprovalEditorService } from './ApprovalEditorService';
import { ArchiveService } from './ArchiveService';
import { ImplementationLogService } from './ImplementationLogService';
import { parseTasksFromMarkdown, updateTaskStatus } from '../utils/taskParser';
import { Logger } from '../utils/logger';

export class SpecWorkflowService {
  private workspaceRoot: string | null = null;
  private specWorkflowRoot: string | null = null;
  private approvalWatcher: vscode.FileSystemWatcher | null = null;
  private taskWatcher: vscode.FileSystemWatcher | null = null;
  private requirementsWatcher: vscode.FileSystemWatcher | null = null;
  private designWatcher: vscode.FileSystemWatcher | null = null;
  private tasksDocWatcher: vscode.FileSystemWatcher | null = null;
  private steeringDocumentsWatcher: vscode.FileSystemWatcher | null = null;
  private specsWatcher: vscode.FileSystemWatcher | null = null;
  private archiveWatcher: vscode.FileSystemWatcher | null = null;
  private onApprovalsChangedCallback: (() => void) | null = null;
  private onTasksChangedCallback: ((specName: string) => void) | null = null;
  private onSpecDocumentsChangedCallback: ((specName: string) => void) | null = null;
  private onSteeringDocumentsChangedCallback: (() => void) | null = null;
  private onSpecsChangedCallback: (() => void) | null = null;
  private onLogsChangedCallback: ((specName: string) => void) | null = null;
  private approvalEditorService: ApprovalEditorService | null = null;
  private archiveService: ArchiveService;
  private implementationLogService: ImplementationLogService;
  private logger: Logger;

  constructor(outputChannel: vscode.OutputChannel) {
    this.logger = new Logger(outputChannel);
    this.archiveService = new ArchiveService(this.logger);
    this.implementationLogService = new ImplementationLogService(outputChannel);
    this.updateWorkspaceRoot();

    // Note: ApprovalEditorService will be initialized in extension.ts to avoid circular dependency

    // Listen for workspace folder changes
    vscode.workspace.onDidChangeWorkspaceFolders(() => {
      this.updateWorkspaceRoot();
      this.setupApprovalWatcher();
      this.setupTaskWatcher();
      this.setupRequirementsWatcher();
      this.setupDesignWatcher();
      this.setupTasksDocWatcher();
      this.setupSteeringDocumentsWatcher();
      this.setupSpecsWatcher();
      this.setupArchiveWatcher();
    });

    this.setupApprovalWatcher();
    this.setupTaskWatcher();
    this.setupRequirementsWatcher();
    this.setupDesignWatcher();
    this.setupTasksDocWatcher();
    this.setupSteeringDocumentsWatcher();
    this.setupSpecsWatcher();
    this.setupArchiveWatcher();

    // Setup logs change callback
    this.implementationLogService.setOnLogsChanged((specName: string) => {
      if (this.onLogsChangedCallback) {
        this.onLogsChangedCallback(specName);
      }
    });
  }

  setOnApprovalsChanged(callback: () => void) {
    this.onApprovalsChangedCallback = callback;
  }

  setOnTasksChanged(callback: (specName: string) => void) {
    this.onTasksChangedCallback = callback;
  }

  setOnSpecDocumentsChanged(callback: (specName: string) => void) {
    this.onSpecDocumentsChangedCallback = callback;
  }

  setOnSteeringDocumentsChanged(callback: () => void) {
    this.onSteeringDocumentsChangedCallback = callback;
  }

  setOnSpecsChanged(callback: () => void) {
    this.onSpecsChangedCallback = callback;
  }

  setOnLogsChanged(callback: (specName: string) => void) {
    this.onLogsChangedCallback = callback;
  }

  setApprovalEditorService(approvalEditorService: ApprovalEditorService) {
    this.approvalEditorService = approvalEditorService;
  }

  private setupApprovalWatcher() {
    // Dispose existing watcher
    if (this.approvalWatcher) {
      this.approvalWatcher.dispose();
      this.approvalWatcher = null;
    }

    if (!this.specWorkflowRoot) {
      return;
    }

    const approvalsPattern = new vscode.RelativePattern(
      path.join(this.specWorkflowRoot, 'approvals'),
      '**/*.json'
    );

    this.approvalWatcher = vscode.workspace.createFileSystemWatcher(approvalsPattern);

    const handleApprovalChange = (uri: vscode.Uri) => {
      // Extract approval ID from file path
      const fileName = path.basename(uri.fsPath, '.json');

      // Notify approval editor service about the change
      if (this.approvalEditorService) {
        this.approvalEditorService.handleExternalApprovalChange(fileName);
      }

      // Notify sidebar about the change
      if (this.onApprovalsChangedCallback) {
        this.onApprovalsChangedCallback();
      }
    };

    this.approvalWatcher.onDidCreate(handleApprovalChange);
    this.approvalWatcher.onDidChange(handleApprovalChange);
    this.approvalWatcher.onDidDelete(handleApprovalChange);
  }

  private setupTaskWatcher() {
    // Dispose existing watcher
    if (this.taskWatcher) {
      this.taskWatcher.dispose();
      this.taskWatcher = null;
    }

    if (!this.specWorkflowRoot) {
      return;
    }

    const tasksPattern = new vscode.RelativePattern(
      path.join(this.specWorkflowRoot, 'specs'),
      '**/tasks.md'
    );

    this.taskWatcher = vscode.workspace.createFileSystemWatcher(tasksPattern);

    const handleTaskChange = (uri: vscode.Uri) => {
      // Extract spec name from file path
      const specName = this.extractSpecNameFromTaskPath(uri.fsPath);
      if (specName && this.onTasksChangedCallback) {
        this.logger.log(`Task file changed for spec: ${specName}`);
        this.onTasksChangedCallback(specName);
      }
    };

    this.taskWatcher.onDidCreate(handleTaskChange);
    this.taskWatcher.onDidChange(handleTaskChange);
    this.taskWatcher.onDidDelete(handleTaskChange);
  }

  private extractSpecNameFromTaskPath(filePath: string): string | null {
    if (!this.specWorkflowRoot) {
      return null;
    }

    // Normalize path separators
    const normalizedPath = filePath.replace(/\\/g, '/');
    const normalizedRoot = this.specWorkflowRoot.replace(/\\/g, '/');
    
    // Look for pattern: .spec-workflow/specs/{specName}/tasks.md
    const specsDir = path.join(normalizedRoot, 'specs').replace(/\\/g, '/');
    
    if (normalizedPath.includes(specsDir) && normalizedPath.endsWith('/tasks.md')) {
      // Extract spec name from path like: /path/.spec-workflow/specs/my-spec/tasks.md
      const relativePath = normalizedPath.substring(specsDir.length + 1); // +1 for the trailing slash
      const pathParts = relativePath.split('/');
      
      if (pathParts.length >= 2 && pathParts[pathParts.length - 1] === 'tasks.md') {
        return pathParts[0]; // Return the spec name (first directory)
      }
    }

    return null;
  }

  private setupRequirementsWatcher() {
    // Dispose existing watcher
    if (this.requirementsWatcher) {
      this.requirementsWatcher.dispose();
      this.requirementsWatcher = null;
    }

    if (!this.specWorkflowRoot) {
      return;
    }

    this.logger.log('Setting up requirements watcher...');
    const requirementsPattern = new vscode.RelativePattern(
      path.join(this.specWorkflowRoot, 'specs'),
      '**/requirements.md'
    );

    this.requirementsWatcher = vscode.workspace.createFileSystemWatcher(requirementsPattern);

    const handleRequirementsChange = (uri: vscode.Uri) => {
      this.logger.log('Requirements file changed:', uri.fsPath);
      const specName = this.extractSpecNameFromDocumentPath(uri.fsPath);
      if (specName && this.onSpecDocumentsChangedCallback) {
        this.logger.log(`Requirements changed for spec: ${specName}`);
        this.onSpecDocumentsChangedCallback(specName);
      }
    };

    this.requirementsWatcher.onDidCreate(handleRequirementsChange);
    this.requirementsWatcher.onDidChange(handleRequirementsChange);
    this.requirementsWatcher.onDidDelete(handleRequirementsChange);
  }

  private setupDesignWatcher() {
    // Dispose existing watcher
    if (this.designWatcher) {
      this.designWatcher.dispose();
      this.designWatcher = null;
    }

    if (!this.specWorkflowRoot) {
      return;
    }

    this.logger.log('Setting up design watcher...');
    const designPattern = new vscode.RelativePattern(
      path.join(this.specWorkflowRoot, 'specs'),
      '**/design.md'
    );

    this.designWatcher = vscode.workspace.createFileSystemWatcher(designPattern);

    const handleDesignChange = (uri: vscode.Uri) => {
      this.logger.log('Design file changed:', uri.fsPath);
      const specName = this.extractSpecNameFromDocumentPath(uri.fsPath);
      if (specName && this.onSpecDocumentsChangedCallback) {
        this.logger.log(`Design changed for spec: ${specName}`);
        this.onSpecDocumentsChangedCallback(specName);
      }
    };

    this.designWatcher.onDidCreate(handleDesignChange);
    this.designWatcher.onDidChange(handleDesignChange);
    this.designWatcher.onDidDelete(handleDesignChange);
  }

  private setupTasksDocWatcher() {
    // Dispose existing watcher  
    if (this.tasksDocWatcher) {
      this.tasksDocWatcher.dispose();
      this.tasksDocWatcher = null;
    }

    if (!this.specWorkflowRoot) {
      return;
    }

    this.logger.log('Setting up tasks doc watcher...');
    const tasksDocPattern = new vscode.RelativePattern(
      path.join(this.specWorkflowRoot, 'specs'),
      '**/tasks.md'
    );

    this.tasksDocWatcher = vscode.workspace.createFileSystemWatcher(tasksDocPattern);

    const handleTasksDocChange = (uri: vscode.Uri) => {
      this.logger.log('Tasks document file changed:', uri.fsPath);
      const specName = this.extractSpecNameFromDocumentPath(uri.fsPath);
      if (specName && this.onSpecDocumentsChangedCallback) {
        this.logger.log(`Tasks document changed for spec: ${specName}`);
        this.onSpecDocumentsChangedCallback(specName);
      }
    };

    this.tasksDocWatcher.onDidCreate(handleTasksDocChange);
    this.tasksDocWatcher.onDidChange(handleTasksDocChange);
    this.tasksDocWatcher.onDidDelete(handleTasksDocChange);
  }

  private setupSteeringDocumentsWatcher() {
    // Dispose existing watcher
    if (this.steeringDocumentsWatcher) {
      this.steeringDocumentsWatcher.dispose();
      this.steeringDocumentsWatcher = null;
    }

    if (!this.specWorkflowRoot) {
      return;
    }

    this.logger.log('Setting up steering documents watcher...');
    const steeringDocsPattern = new vscode.RelativePattern(
      path.join(this.specWorkflowRoot, 'steering'),
      '*.md'
    );

    this.steeringDocumentsWatcher = vscode.workspace.createFileSystemWatcher(steeringDocsPattern);

    const handleSteeringDocumentChange = (uri: vscode.Uri) => {
      this.logger.log('Steering document changed:', uri.fsPath);
      if (this.onSteeringDocumentsChangedCallback) {
        this.logger.log('Calling steering documents callback');
        this.onSteeringDocumentsChangedCallback();
      }
    };

    this.steeringDocumentsWatcher.onDidCreate(handleSteeringDocumentChange);
    this.steeringDocumentsWatcher.onDidChange(handleSteeringDocumentChange);
    this.steeringDocumentsWatcher.onDidDelete(handleSteeringDocumentChange);
  }

  private setupSpecsWatcher() {
    // Dispose existing watcher
    if (this.specsWatcher) {
      this.specsWatcher.dispose();
      this.specsWatcher = null;
    }

    if (!this.specWorkflowRoot) {
      return;
    }

    const specsPattern = new vscode.RelativePattern(
      path.join(this.specWorkflowRoot, 'specs'),
      '*'
    );

    this.specsWatcher = vscode.workspace.createFileSystemWatcher(specsPattern);

    const handleSpecsChange = () => {
      if (this.onSpecsChangedCallback) {
        this.logger.log('Specs directory changed');
        this.onSpecsChangedCallback();
      }
    };

    this.specsWatcher.onDidCreate(handleSpecsChange);
    this.specsWatcher.onDidDelete(handleSpecsChange);
  }

  private setupArchiveWatcher() {
    // Dispose existing watcher
    if (this.archiveWatcher) {
      this.archiveWatcher.dispose();
      this.archiveWatcher = null;
    }

    if (!this.specWorkflowRoot) {
      return;
    }

    const archivePattern = new vscode.RelativePattern(
      path.join(this.specWorkflowRoot, 'archive', 'specs'),
      '*'
    );

    this.archiveWatcher = vscode.workspace.createFileSystemWatcher(archivePattern);

    const handleArchiveChange = () => {
      // Archive changes should trigger specs list refresh to hide/show archived specs
      if (this.onSpecsChangedCallback) {
        this.logger.log('Archive directory changed');
        this.onSpecsChangedCallback();
      }
    };

    this.archiveWatcher.onDidCreate(handleArchiveChange);
    this.archiveWatcher.onDidDelete(handleArchiveChange);
  }

  private extractSpecNameFromDocumentPath(filePath: string): string | null {
    if (!this.specWorkflowRoot) {
      return null;
    }

    // Normalize path separators
    const normalizedPath = filePath.replace(/\\/g, '/');
    const normalizedRoot = this.specWorkflowRoot.replace(/\\/g, '/');
    
    // Look for pattern: .spec-workflow/specs/{specName}/{document}.md
    const specsDir = path.join(normalizedRoot, 'specs').replace(/\\/g, '/');
    
    if (normalizedPath.includes(specsDir) && 
        (normalizedPath.endsWith('/requirements.md') || 
         normalizedPath.endsWith('/design.md') || 
         normalizedPath.endsWith('/tasks.md'))) {
      // Extract spec name from path like: /path/.spec-workflow/specs/my-spec/requirements.md
      const relativePath = normalizedPath.substring(specsDir.length + 1); // +1 for the trailing slash
      const pathParts = relativePath.split('/');
      
      if (pathParts.length >= 2) {
        return pathParts[0]; // Return the spec name (first directory)
      }
    }

    return null;
  }

  dispose() {
    if (this.approvalWatcher) {
      this.approvalWatcher.dispose();
    }
    if (this.taskWatcher) {
      this.taskWatcher.dispose();
    }
    if (this.requirementsWatcher) {
      this.requirementsWatcher.dispose();
    }
    if (this.designWatcher) {
      this.designWatcher.dispose();
    }
    if (this.tasksDocWatcher) {
      this.tasksDocWatcher.dispose();
    }
    if (this.steeringDocumentsWatcher) {
      this.steeringDocumentsWatcher.dispose();
    }
    if (this.specsWatcher) {
      this.specsWatcher.dispose();
    }
    if (this.archiveWatcher) {
      this.archiveWatcher.dispose();
    }
    if (this.implementationLogService) {
      this.implementationLogService.dispose();
    }
  }

  private updateWorkspaceRoot() {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (workspaceFolders && workspaceFolders.length > 0) {
      this.workspaceRoot = workspaceFolders[0].uri.fsPath;
      this.specWorkflowRoot = path.join(this.workspaceRoot, '.spec-workflow');
      // Update archive service with new workspace root
      this.archiveService.setWorkspaceRoot(this.workspaceRoot);
    } else {
      this.workspaceRoot = null;
      this.specWorkflowRoot = null;
    }
  }

  private async ensureSpecWorkflowExists(): Promise<boolean> {
    if (!this.specWorkflowRoot) {
      throw new Error('No workspace folder found');
    }

    try {
      await fs.access(this.specWorkflowRoot);
      return true;
    } catch {
      return false;
    }
  }

  async refreshData() {
    // This method can be used to clear any caches if needed
    // For now, it just ensures the directory exists
    return this.ensureSpecWorkflowExists();
  }

  /**
   * Get all specifications - maintains backward compatibility
   * @deprecated Use getAllActiveSpecs() for clarity
   */
  async getAllSpecs(): Promise<SpecData[]> {
    return this.getAllActiveSpecs();
  }

  async getAllActiveSpecs(): Promise<SpecData[]> {
    if (!await this.ensureSpecWorkflowExists()) {
      this.logger.log('SpecWorkflow: No .spec-workflow directory found');
      return [];
    }

    const specs: SpecData[] = [];
    
    try {
      // First, try the standard structure: .spec-workflow/specs/
      const specsDir = path.join(this.specWorkflowRoot!, 'specs');
      this.logger.log('SpecWorkflow: Checking specs directory:', specsDir);
      
      try {
        await fs.access(specsDir);
        const entries = await fs.readdir(specsDir, { withFileTypes: true });
        const specDirs = entries.filter(entry => entry.isDirectory());
        this.logger.log('SpecWorkflow: Found spec directories in specs/:', specDirs.map(d => d.name));
        
        for (const specDir of specDirs) {
          try {
            const specData = await this.parseSpecDirectory(path.join(specsDir, specDir.name), specDir.name);
            if (specData) {
              specs.push(specData);
            }
          } catch (error) {
            this.logger.warn(`Failed to parse spec ${specDir.name}:`, error);
          }
        }
      } catch {
        this.logger.log('SpecWorkflow: No specs/ subdirectory found');
      }

      // If no specs found, try looking directly in .spec-workflow for spec directories
      if (specs.length === 0) {
        this.logger.log('SpecWorkflow: Checking root .spec-workflow directory for specs');
        const entries = await fs.readdir(this.specWorkflowRoot!, { withFileTypes: true });
        const excludeDirs = new Set(['specs', 'steering', 'approvals', '.git', 'node_modules']);
        const potentialSpecs = entries.filter(entry => 
          entry.isDirectory() && !excludeDirs.has(entry.name) && !entry.name.startsWith('.')
        );
        
        this.logger.log('SpecWorkflow: Found potential spec directories in root:', potentialSpecs.map(d => d.name));
        
        for (const specDir of potentialSpecs) {
          try {
            const specPath = path.join(this.specWorkflowRoot!, specDir.name);
            const specData = await this.parseSpecDirectory(specPath, specDir.name);
            if (specData) {
              specs.push(specData);
            }
          } catch (error) {
            this.logger.warn(`Failed to parse spec ${specDir.name}:`, error);
          }
        }
      }

      this.logger.log(`SpecWorkflow: Found ${specs.length} total specs`);
      return specs.sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime());
    } catch (error) {
      this.logger.error('Error reading specs:', error);
      return [];
    }
  }

  private async parseSpecDirectory(specPath: string, specName: string): Promise<SpecData | null> {
    const phases = {
      requirements: await this.parsePhaseFile(path.join(specPath, 'requirements.md')),
      design: await this.parsePhaseFile(path.join(specPath, 'design.md')),
      tasks: await this.parsePhaseFile(path.join(specPath, 'tasks.md')),
      implementation: { exists: false } // Implementation is not a file but a phase status
    };

    // Get the most recent modification time
    const timestamps = [phases.requirements, phases.design, phases.tasks]
      .filter(phase => phase.exists && phase.lastModified)
      .map(phase => new Date(phase.lastModified!).getTime());
    
    if (timestamps.length === 0) {
      return null;
    }

    const lastModified = new Date(Math.max(...timestamps)).toISOString();
    const createdAt = new Date(Math.min(...timestamps)).toISOString();

    // Parse task progress if tasks file exists
    let taskProgress;
    if (phases.tasks.exists && phases.tasks.content) {
      try {
        const taskInfo = this.parseTasksContent(phases.tasks.content);
        taskProgress = {
          total: taskInfo.summary.total,
          completed: taskInfo.summary.completed,
          pending: taskInfo.summary.total - taskInfo.summary.completed
        };
      } catch (error) {
        this.logger.warn(`Failed to parse tasks for ${specName}:`, error);
      }
    }

    return {
      name: specName,
      displayName: this.formatDisplayName(specName),
      createdAt,
      lastModified,
      phases,
      taskProgress
    };
  }

  private async parsePhaseFile(filePath: string): Promise<PhaseStatus> {
    try {
      const stat = await fs.stat(filePath);
      const content = await fs.readFile(filePath, 'utf-8');
      
      return {
        exists: true,
        lastModified: stat.mtime.toISOString(),
        content
      };
    } catch {
      return { exists: false };
    }
  }

  private formatDisplayName(specName: string): string {
    return specName
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  async getTaskProgress(specName: string): Promise<TaskProgressData | null> {
    if (!await this.ensureSpecWorkflowExists()) {
      return null;
    }

    try {
      const tasksPath = path.join(this.specWorkflowRoot!, 'specs', specName, 'tasks.md');
      const content = await fs.readFile(tasksPath, 'utf-8');
      
      const taskInfo = this.parseTasksContent(content);
      
      const taskProgressData = {
        specName,
        total: taskInfo.summary.total,
        completed: taskInfo.summary.completed,
        progress: taskInfo.summary.total > 0 ? (taskInfo.summary.completed / taskInfo.summary.total) * 100 : 0,
        taskList: taskInfo.tasks,
        inProgress: taskInfo.inProgressTask
      };
      
      this.logger.separator('SpecWorkflowService.getTaskProgress');
      this.logger.log('Spec:', specName);
      this.logger.log('TaskProgressData taskList count:', taskProgressData.taskList.length);
      this.logger.log('Sample task (2.2):', taskProgressData.taskList.find(t => t.id === '2.2'));
      this.logger.log('All tasks with metadata:', taskProgressData.taskList.filter(t => 
        t.requirements?.length || t.implementationDetails?.length || t.files?.length || t.purposes?.length || t.leverage || t.prompt
      ).map(t => ({ id: t.id, hasPrompt: !!t.prompt, promptLength: t.prompt?.length, requirements: t.requirements, implementationDetails: t.implementationDetails })));      
      return taskProgressData;
    } catch (error) {
      this.logger.error(`Failed to get task progress for ${specName}:`, error);
      return null;
    }
  }

  private parseTasksContent(content: string): { 
    tasks: TaskInfo[]; 
    summary: { total: number; completed: number; }; 
    inProgressTask?: string;
  } {
    this.logger.separator('SpecWorkflowService.parseTasksContent');
    this.logger.log('Content length:', content.length);
    
    const result = parseTasksFromMarkdown(content);
    
    this.logger.log('Parser result summary:', result.summary);
    this.logger.log('Raw parsed tasks count:', result.tasks.length);
    
    // Convert ParsedTask to TaskInfo for backward compatibility
    const tasks: TaskInfo[] = result.tasks.map(task => ({
      id: task.id,
      description: task.description,
      status: task.status,
      completed: task.completed,
      isHeader: task.isHeader,
      lineNumber: task.lineNumber,
      indentLevel: task.indentLevel,
      files: task.files,
      implementationDetails: task.implementationDetails,
      requirements: task.requirements,
      leverage: task.leverage,
      purposes: task.purposes,
      // Preserve parsed AI prompt for UI and copy functionality
      prompt: task.prompt,
      inProgress: task.inProgress    }));
    
    this.logger.log('Tasks with prompts:', tasks.filter(t => t.prompt).map(t => ({
      id: t.id,
      promptLength: t.prompt?.length,
      promptPreview: t.prompt?.substring(0, 50)
    })));
    this.logger.log('Converted tasks:', tasks.map(t => ({
      id: t.id,
      description: t.description,
      hasRequirements: !!t.requirements?.length,
      hasImplementationDetails: !!t.implementationDetails?.length,
      hasFiles: !!t.files?.length,
      hasPurposes: !!t.purposes?.length,
      hasLeverage: !!t.leverage,
      requirements: t.requirements,
      implementationDetails: t.implementationDetails
    })));

    return {
      tasks,
      summary: {
        total: result.summary.total,
        completed: result.summary.completed
      },
      inProgressTask: result.inProgressTask || undefined
    };
  }

  async updateTaskStatus(specName: string, taskId: string, status: string): Promise<void> {
    if (!await this.ensureSpecWorkflowExists()) {
      throw new Error('Spec workflow directory not found');
    }

    const tasksPath = path.join(this.specWorkflowRoot!, 'specs', specName, 'tasks.md');

    try {
      const content = await fs.readFile(tasksPath, 'utf-8');

      // Use unified parser's update function
      const updatedContent = updateTaskStatus(content, taskId, status as 'pending' | 'in-progress' | 'completed');

      // Check if content actually changed
      if (updatedContent === content) {
        this.logger.log(`Task ${taskId} status already ${status} or task not found in spec ${specName}`);
        return; // No-op if status is already correct or task doesn't exist
      }

      await fs.writeFile(tasksPath, updatedContent, 'utf-8');
      this.logger.log(`Successfully updated task ${taskId} to ${status} in spec ${specName}`);
    } catch (error) {
      throw new Error(`Failed to update task status: ${error}`);
    }
  }

  async saveDocument(specName: string, docType: string, content: string): Promise<void> {
    if (!await this.ensureSpecWorkflowExists()) {
      throw new Error('Spec workflow directory not found');
    }

    const allowedDocTypes = ['requirements', 'design', 'tasks'];
    if (!allowedDocTypes.includes(docType)) {
      throw new Error(`Invalid document type: ${docType}`);
    }

    const docPath = path.join(this.specWorkflowRoot!, 'specs', specName, `${docType}.md`);
    
    try {
      // Ensure the spec directory exists
      const specDir = path.dirname(docPath);
      await fs.mkdir(specDir, { recursive: true });
      
      await fs.writeFile(docPath, content, 'utf-8');
    } catch (error) {
      throw new Error(`Failed to save document: ${error}`);
    }
  }

  async getApprovals(): Promise<ApprovalData[]> {
    if (!await this.ensureSpecWorkflowExists()) {
      return [];
    }

    try {
      const approvalsDir = path.join(this.specWorkflowRoot!, 'approvals');

      try {
        await fs.access(approvalsDir);
      } catch {
        return [];
      }

      const approvals: ApprovalData[] = [];

      // Read category directories (hierarchical structure like MCP server)
      try {
        const categoryEntries = await fs.readdir(approvalsDir, { withFileTypes: true });
        for (const categoryEntry of categoryEntries) {
          if (categoryEntry.isDirectory()) {
            const categoryPath = path.join(approvalsDir, categoryEntry.name);
            try {
              const approvalFiles = await fs.readdir(categoryPath);
              for (const file of approvalFiles) {
                if (file.endsWith('.json')) {
                  try {
                    const approvalPath = path.join(categoryPath, file);
                    const content = await fs.readFile(approvalPath, 'utf-8');
                    const approval = JSON.parse(content);
                    approvals.push(approval);
                  } catch (error) {
                    this.logger.warn(`Failed to parse approval ${file} in category ${categoryEntry.name}:`, error);
                  }
                }
              }
            } catch (error) {
              this.logger.warn(`Failed to read category directory ${categoryEntry.name}:`, error);
            }
          }
        }
      } catch (error) {
        this.logger.warn('Failed to read approvals directory structure:', error);
      }

      // Also check for legacy flat structure files for backward compatibility
      try {
        const entries = await fs.readdir(approvalsDir);
        for (const entry of entries) {
          if (entry.endsWith('.json')) {
            try {
              const approvalPath = path.join(approvalsDir, entry);
              const content = await fs.readFile(approvalPath, 'utf-8');
              const approval = JSON.parse(content);
              approvals.push(approval);
            } catch (error) {
              this.logger.warn(`Failed to parse legacy approval ${entry}:`, error);
            }
          }
        }
      } catch (error) {
        this.logger.warn('Failed to read legacy approval files:', error);
      }

      return approvals.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (error) {
      this.logger.error('Error reading approvals:', error);
      return [];
    }
  }

  async getApprovalCategories(): Promise<{ value: string; label: string; count: number }[]> {
    const approvals = await this.getApprovals();
    const categoryCounts = new Map<string, number>();
    
    // Count approvals by categoryName
    for (const approval of approvals) {
      if (approval.status === 'pending' && approval.categoryName) {
        const count = categoryCounts.get(approval.categoryName) || 0;
        categoryCounts.set(approval.categoryName, count + 1);
      }
    }
    
    const categories: { value: string; label: string; count: number }[] = [
      { value: 'all', label: 'All', count: approvals.filter(a => a.status === 'pending').length }
    ];
    
    // Add spec categories
    const specs = await this.getAllSpecs();
    for (const spec of specs) {
      const count = categoryCounts.get(spec.name) || 0;
      if (count > 0) {
        categories.push({ 
          value: spec.name, 
          label: spec.displayName, 
          count 
        });
      }
    }
    
    // Add steering category if it has approvals
    const steeringCount = categoryCounts.get('steering') || 0;
    if (steeringCount > 0) {
      categories.push({ 
        value: 'steering', 
        label: 'Steering Documents', 
        count: steeringCount 
      });
    }
    
    return categories;
  }

  async approveRequest(id: string, response: string): Promise<void> {
    await this.updateApprovalStatus(id, 'approved', response);
  }

  async rejectRequest(id: string, response: string): Promise<void> {
    await this.updateApprovalStatus(id, 'rejected', response);
  }

  async requestRevisionRequest(id: string, response: string, annotations?: string, comments?: any[]): Promise<void> {
    await this.updateApprovalStatus(id, 'needs-revision', response, annotations, comments);
  }

  async getApprovalContent(id: string): Promise<string | null> {
    if (!await this.ensureSpecWorkflowExists()) {
      return null;
    }

    const approvalPath = await this.findApprovalPath(id);
    if (!approvalPath) {
      return null;
    }

    try {
      const content = await fs.readFile(approvalPath, 'utf-8');
      const approval = JSON.parse(content);

      if (!approval.filePath) {
        return null;
      }

      // Use the same robust file path resolution as ApprovalEditorService
      const resolvedFilePath = await this.resolveApprovalFilePath(approval.filePath);
      if (!resolvedFilePath) {
        this.logger.warn(`Could not resolve file path for approval ${id}: ${approval.filePath}`);
        return null;
      }

      try {
        const fileContent = await fs.readFile(resolvedFilePath, 'utf-8');
        return fileContent;
      } catch (error) {
        this.logger.warn(`Failed to read approval file content at ${resolvedFilePath}:`, error);
        return null;
      }
    } catch (error) {
      this.logger.error(`Failed to get approval content for ${id}:`, error);
      return null;
    }
  }

  private async resolveApprovalFilePath(filePath: string): Promise<string | null> {
    if (!this.workspaceRoot) {
      return null;
    }

    // Use the same robust resolution strategy as the working dashboard server
    const candidates: string[] = [];
    const p = filePath;

    // 1) As provided relative to project root (most common case)
    candidates.push(path.join(this.workspaceRoot, p));

    // 2) If path is already absolute, try it directly
    if (path.isAbsolute(p) || p.startsWith('/') || p.match(/^[A-Za-z]:[\\\/]/)) {
      candidates.push(p);
    }

    // 3) If not already under .spec-workflow, try under that root
    if (!p.includes('.spec-workflow')) {
      candidates.push(path.join(this.workspaceRoot, '.spec-workflow', p));
    }

    // 4) Handle legacy path formats - try with path separator normalization
    const normalizedPath = p.replace(/\\/g, '/');
    if (normalizedPath !== p) {
      // Try the normalized version relative to project root
      candidates.push(path.join(this.workspaceRoot, normalizedPath));

      // Try the normalized version under .spec-workflow if not already there
      if (!normalizedPath.includes('.spec-workflow')) {
        candidates.push(path.join(this.workspaceRoot, '.spec-workflow', normalizedPath));
      }
    }

    // 5) Try common spec document locations as fallback
    const fileName = path.basename(p);
    const specWorkflowRoot = path.join(this.workspaceRoot, '.spec-workflow');

    // Try in specs directory structure
    candidates.push(path.join(specWorkflowRoot, 'specs', fileName));

    // Try in test directory structure (for cases like the failing example)
    candidates.push(path.join(specWorkflowRoot, 'test', fileName));

    // Try with common spec names if filePath looks like a spec document
    if (fileName.match(/\.(md|txt)$/)) {
      const baseName = path.basename(fileName, path.extname(fileName));
      candidates.push(path.join(specWorkflowRoot, 'specs', baseName, fileName));
      candidates.push(path.join(specWorkflowRoot, 'test', baseName, fileName));
    }

    // Test each candidate path
    for (const candidate of candidates) {
      try {
        await fs.access(candidate);
        this.logger.log(`Successfully resolved approval file path: ${p} -> ${candidate}`);
        return candidate;
      } catch {
        // File doesn't exist at this location, try next candidate
      }
    }

    // Log all attempted paths for debugging
    this.logger.warn(`Failed to resolve approval file path: ${p}. Tried paths:`, candidates);
    return null;
  }

  async openApprovalInEditor(id: string): Promise<boolean> {
    if (!this.approvalEditorService) {
      return false;
    }

    const approvalPath = await this.findApprovalPath(id);
    if (!approvalPath) {
      return false;
    }

    try {
      const content = await fs.readFile(approvalPath, 'utf-8');
      const approval = JSON.parse(content) as ApprovalData;

      const editor = await this.approvalEditorService.openApprovalInEditor(approval);
      return editor !== null;
    } catch (error) {
      this.logger.error(`Failed to open approval in editor for ${id}:`, error);
      return false;
    }
  }

  async saveApprovalData(approval: ApprovalData): Promise<void> {
    const approvalPath = await this.findApprovalPath(approval.id);
    if (!approvalPath) {
      throw new Error(`Approval ${approval.id} not found`);
    }

    try {
      await fs.writeFile(approvalPath, JSON.stringify(approval, null, 2), 'utf-8');
    } catch (error) {
      throw new Error(`Failed to save approval data: ${error}`);
    }
  }

  async findApprovalPath(id: string): Promise<string | null> {
    if (!this.specWorkflowRoot) {
      return null;
    }

    const approvalsDir = path.join(this.specWorkflowRoot, 'approvals');

    // Search in hierarchical structure (category directories)
    try {
      const categoryEntries = await fs.readdir(approvalsDir, { withFileTypes: true });
      for (const categoryEntry of categoryEntries) {
        if (categoryEntry.isDirectory()) {
          const approvalPath = path.join(approvalsDir, categoryEntry.name, `${id}.json`);
          try {
            await fs.access(approvalPath);
            return approvalPath;
          } catch {
            // File doesn't exist in this location, continue searching
          }
        }
      }
    } catch {
      // Approvals directory doesn't exist or can't be read
    }

    // Also check legacy flat structure for backward compatibility
    try {
      const legacyPath = path.join(approvalsDir, `${id}.json`);
      await fs.access(legacyPath);
      return legacyPath;
    } catch {
      // Legacy file doesn't exist
    }

    return null;
  }

  private async updateApprovalStatus(
    id: string,
    status: 'approved' | 'rejected' | 'needs-revision',
    response: string,
    annotations?: string,
    comments?: any[]
  ): Promise<void> {
    if (!await this.ensureSpecWorkflowExists()) {
      throw new Error('Spec workflow directory not found');
    }

    const approvalPath = await this.findApprovalPath(id);

    if (!approvalPath) {
      throw new Error(`Approval ${id} not found`);
    }

    try {
      const content = await fs.readFile(approvalPath, 'utf-8');
      const approval = JSON.parse(content);

      approval.status = status;
      approval.response = response;
      approval.respondedAt = new Date().toISOString();

      if (annotations) {
        approval.annotations = annotations;
      }

      if (comments) {
        approval.comments = comments;
      }

      await fs.writeFile(approvalPath, JSON.stringify(approval, null, 2), 'utf-8');
    } catch (error) {
      throw new Error(`Failed to update approval status: ${error}`);
    }
  }



  async getSteeringStatus(): Promise<SteeringStatus | null> {
    if (!await this.ensureSpecWorkflowExists()) {
      return null;
    }

    try {
      const steeringDir = path.join(this.specWorkflowRoot!, 'steering');
      
      const documents = {
        product: false,
        tech: false,
        structure: false
      };

      let exists = false;
      let lastModified: string | undefined;

      for (const docName of Object.keys(documents) as (keyof typeof documents)[]) {
        const docPath = path.join(steeringDir, `${docName}.md`);
        try {
          const stat = await fs.stat(docPath);
          documents[docName] = true;
          exists = true;
          
          if (!lastModified || stat.mtime.getTime() > new Date(lastModified).getTime()) {
            lastModified = stat.mtime.toISOString();
          }
        } catch {
          // File doesn't exist, keep false
        }
      }

      return {
        exists,
        documents,
        lastModified
      };
    } catch (error) {
      this.logger.error('Error reading steering status:', error);
      return null;
    }
  }

  async getSpecDocuments(specName: string): Promise<{ name: string; exists: boolean; path: string; lastModified?: string }[]> {
    if (!await this.ensureSpecWorkflowExists()) {
      return [];
    }

    const documents = ['requirements', 'design', 'tasks'];
    const result = [];

    // Check if the spec is archived
    const isArchived = await this.archiveService.isSpecArchived(specName);
    this.logger.log(`SpecWorkflow: Checking documents for spec '${specName}' (archived: ${isArchived})`);

    for (const docType of documents) {
      let docPath: string;
      let found = false;
      
      if (isArchived) {
        // For archived specs, look in the archive directory first
        docPath = path.join(this.specWorkflowRoot!, 'archive', 'specs', specName, `${docType}.md`);
        
        try {
          const stat = await fs.stat(docPath);
          result.push({
            name: docType,
            exists: true,
            path: docPath,
            lastModified: stat.mtime.toISOString()
          });
          found = true;
        } catch {
          // If not found in archive, mark as missing
          result.push({
            name: docType,
            exists: false,
            path: docPath
          });
        }
      } else {
        // For active specs, try specs/ subdirectory first
        docPath = path.join(this.specWorkflowRoot!, 'specs', specName, `${docType}.md`);
        
        try {
          const stat = await fs.stat(docPath);
          result.push({
            name: docType,
            exists: true,
            path: docPath,
            lastModified: stat.mtime.toISOString()
          });
          found = true;
        } catch {
          // Try root directory structure as fallback
          docPath = path.join(this.specWorkflowRoot!, specName, `${docType}.md`);
          try {
            const stat = await fs.stat(docPath);
            result.push({
              name: docType,
              exists: true,
              path: docPath,
              lastModified: stat.mtime.toISOString()
            });
            found = true;
          } catch {
            result.push({
              name: docType,
              exists: false,
              path: docPath
            });
          }
        }
      }
      
      this.logger.log(`SpecWorkflow: Document ${docType}.md for ${specName}: ${found ? 'found' : 'not found'} at ${docPath}`);
    }

    return result;
  }

  async getSteeringDocuments(): Promise<{ name: string; exists: boolean; path: string; lastModified?: string }[]> {
    if (!await this.ensureSpecWorkflowExists()) {
      return [];
    }

    const documents = ['product', 'tech', 'structure'];
    const result = [];

    for (const docType of documents) {
      const docPath = path.join(this.specWorkflowRoot!, 'steering', `${docType}.md`);
      try {
        const stat = await fs.stat(docPath);
        result.push({
          name: docType,
          exists: true,
          path: docPath,
          lastModified: stat.mtime.toISOString()
        });
      } catch {
        result.push({
          name: docType,
          exists: false,
          path: docPath
        });
      }
    }

    return result;
  }

  async getDocumentPath(specName: string, docType: string): Promise<string | null> {
    if (!this.specWorkflowRoot) {return null;}
    const allowedDocTypes = ['requirements', 'design', 'tasks'];
    if (!allowedDocTypes.includes(docType)) {return null;}
    
    // Check if the spec is archived
    const isArchived = await this.archiveService.isSpecArchived(specName);
    this.logger.log(`SpecWorkflow: Getting document path for '${specName}/${docType}' (archived: ${isArchived})`);
    
    let docPath: string;
    
    if (isArchived) {
      // For archived specs, look in the archive directory
      docPath = path.join(this.specWorkflowRoot, 'archive', 'specs', specName, `${docType}.md`);
      try {
        await fs.access(docPath);
        this.logger.log(`SpecWorkflow: Found archived document at ${docPath}`);
        return docPath;
      } catch {
        this.logger.log(`SpecWorkflow: Archived document not found at ${docPath}`);
        return null;
      }
    } else {
      // For active specs, try specs/ subdirectory first
      docPath = path.join(this.specWorkflowRoot, 'specs', specName, `${docType}.md`);
      try {
        await fs.access(docPath);
        this.logger.log(`SpecWorkflow: Found active document at ${docPath}`);
        return docPath;
      } catch {
        // Try root directory structure as fallback
        docPath = path.join(this.specWorkflowRoot, specName, `${docType}.md`);
        try {
          await fs.access(docPath);
          this.logger.log(`SpecWorkflow: Found active document at fallback path ${docPath}`);
          return docPath;
        } catch {
          this.logger.log(`SpecWorkflow: Active document not found for '${specName}/${docType}'`);
          return null;
        }
      }
    }
  }

  getSteeringDocumentPath(docType: string): string | null {
    if (!this.specWorkflowRoot) {return null;}
    const allowedDocTypes = ['product', 'tech', 'structure'];
    if (!allowedDocTypes.includes(docType)) {return null;}
    return path.join(this.specWorkflowRoot, 'steering', `${docType}.md`);
  }

  // ========== ARCHIVE METHODS ==========

  /**
   * Get all archived specifications
   */
  async getAllArchivedSpecs(): Promise<SpecData[]> {
    if (!await this.ensureSpecWorkflowExists()) {
      this.logger.log('SpecWorkflow: No .spec-workflow directory found');
      return [];
    }

    const specs: SpecData[] = [];
    
    try {
      const archiveSpecsDir = path.join(this.specWorkflowRoot!, 'archive', 'specs');
      this.logger.log('SpecWorkflow: Checking archived specs directory:', archiveSpecsDir);
      
      try {
        await fs.access(archiveSpecsDir);
        const entries = await fs.readdir(archiveSpecsDir, { withFileTypes: true });
        const specDirs = entries.filter(entry => entry.isDirectory());
        this.logger.log('SpecWorkflow: Found archived spec directories:', specDirs.map(d => d.name));
        
        for (const specDir of specDirs) {
          try {
            const specData = await this.parseSpecDirectory(path.join(archiveSpecsDir, specDir.name), specDir.name);
            if (specData) {
              // Mark as archived
              specData.isArchived = true;
              specs.push(specData);
            }
          } catch (error) {
            this.logger.warn(`Failed to parse archived spec ${specDir.name}:`, error);
          }
        }
      } catch {
        this.logger.log('SpecWorkflow: No archived specs directory found');
      }

      this.logger.log(`SpecWorkflow: Found ${specs.length} archived specs`);
      return specs.sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime());
    } catch (error) {
      this.logger.error('Error reading archived specs:', error);
      return [];
    }
  }

  /**
   * Archive a specification - blocks if pending approvals exist
   */
  async archiveSpec(specName: string): Promise<void> {
    this.logger.log(`SpecWorkflowService: Archiving spec '${specName}'`);

    // Check for pending approvals first (Option A)
    try {
      const approvals = await this.getApprovals();
      const pendingApprovals = approvals.filter(approval => 
        approval.status === 'pending' && approval.categoryName === specName
      );

      if (pendingApprovals.length > 0) {
        throw new Error(`Cannot archive spec '${specName}': ${pendingApprovals.length} pending approval(s) exist. Complete or reject approvals first.`);
      }
    } catch (error: any) {
      if (error.message.includes('Cannot archive spec')) {
        throw error;
      }
      // If there's an error getting approvals (e.g., no approvals directory), we can continue
      this.logger.warn('Could not check approvals before archiving:', error.message);
    }

    // Archive the spec using the archive service
    await this.archiveService.archiveSpec(specName);
    this.logger.log(`SpecWorkflowService: Successfully archived spec '${specName}'`);

    // Trigger UI updates
    if (this.onSpecsChangedCallback) {
      this.onSpecsChangedCallback();
    }
  }

  /**
   * Unarchive a specification
   */
  async unarchiveSpec(specName: string): Promise<void> {
    this.logger.log(`SpecWorkflowService: Unarchiving spec '${specName}'`);

    await this.archiveService.unarchiveSpec(specName);
    this.logger.log(`SpecWorkflowService: Successfully unarchived spec '${specName}'`);

    // Trigger UI updates
    if (this.onSpecsChangedCallback) {
      this.onSpecsChangedCallback();
    }
  }

  /**
   * Check if a spec is archived
   */
  async isSpecArchived(specName: string): Promise<boolean> {
    return this.archiveService.isSpecArchived(specName);
  }

  /**
   * Check if a spec is active (not archived)
   */
  async isSpecActive(specName: string): Promise<boolean> {
    return this.archiveService.isSpecActive(specName);
  }

  /**
   * Get the current location of a spec
   */
  async getSpecLocation(specName: string): Promise<'active' | 'archived' | 'not-found'> {
    return this.archiveService.getSpecLocation(specName);
  }

  /**
   * Get implementation logs for a spec
   */
  async getImplementationLogs(specName: string): Promise<LogsData | null> {
    try {
      const entries = await this.implementationLogService.getLogs(specName);
      const stats = await this.implementationLogService.getLogsStats(specName);

      return {
        specName,
        entries,
        stats
      };
    } catch (error) {
      this.logger.error(`Error loading logs for spec ${specName}:`, error);
      return null;
    }
  }

  /**
   * Search implementation logs for a spec
   */
  async searchImplementationLogs(specName: string, query: string): Promise<ImplementationLogEntry[]> {
    try {
      return await this.implementationLogService.searchLogs(specName, query);
    } catch (error) {
      this.logger.error(`Error searching logs for spec ${specName}:`, error);
      return [];
    }
  }

}
