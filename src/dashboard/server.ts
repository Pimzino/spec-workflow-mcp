import fastify, { FastifyInstance } from 'fastify';
import fastifyStatic from '@fastify/static';
import fastifyWebsocket from '@fastify/websocket';
import { join, dirname, basename, resolve } from 'path';
import { readFile } from 'fs/promises';
import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import { SpecWatcher } from './watcher.js';
import { SpecParser } from './parser.js';
import open from 'open';
import { WebSocket } from 'ws';
import { findAvailablePort, validateAndCheckPort } from './utils.js';
import { ApprovalStorage } from './approval-storage.js';
import { parseTasksFromMarkdown } from '../core/task-parser.js';
import { SpecArchiveService } from '../core/archive-service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface WebSocketConnection {
  socket: WebSocket;
}

export interface DashboardOptions {
  projectPath: string;
  autoOpen?: boolean;
  port?: number;
}

export class DashboardServer {
  private app: FastifyInstance;
  private watcher: SpecWatcher;
  private parser: SpecParser;
  private approvalStorage: ApprovalStorage;
  private archiveService: SpecArchiveService;
  private options: DashboardOptions;
  private actualPort: number = 0;
  private clients: Set<WebSocket> = new Set();
  private packageVersion: string = 'unknown';

  constructor(options: DashboardOptions) {
    this.options = options;
    this.parser = new SpecParser(options.projectPath);
    this.watcher = new SpecWatcher(options.projectPath, this.parser);
    this.approvalStorage = new ApprovalStorage(options.projectPath);
    this.archiveService = new SpecArchiveService(options.projectPath);

    this.app = fastify({ logger: false });
  }

  async start() {
    // Fetch package version once at startup
    try {
      const response = await fetch('https://registry.npmjs.org/@pimzino/spec-workflow-mcp/latest');
      if (response.ok) {
        const packageInfo = await response.json() as { version?: string };
        this.packageVersion = packageInfo.version || 'unknown';
      }
    } catch {
      // Fallback to local package.json version if npm request fails
      try {
        const packageJsonPath = join(__dirname, '..', '..', 'package.json');
        const packageJsonContent = await readFile(packageJsonPath, 'utf-8');
        const packageJson = JSON.parse(packageJsonContent) as { version?: string };
        this.packageVersion = packageJson.version || 'unknown';
      } catch {
        // Keep default 'unknown' if both npm and local package.json fail
      }
    }

    // Register plugins
    await this.app.register(fastifyStatic, {
      root: join(__dirname, 'public'),
      prefix: '/',
    });

    await this.app.register(fastifyWebsocket);

    // WebSocket endpoint for real-time updates
    const self = this;
    this.app.register(async function (fastify) {
      fastify.get('/ws', { websocket: true }, (connection: WebSocketConnection) => {
        const socket = connection.socket;
        // WebSocket client connected

        // Add client to set
        self.clients.add(socket);

        // Send initial state
        Promise.all([
          self.parser.getAllSpecs(),
          self.approvalStorage.getAllPendingApprovals()
        ])
          .then(([specs, approvals]) => {
            socket.send(
              JSON.stringify({
                type: 'initial',
                data: { specs, approvals },
              })
            );
          })
          .catch((error) => {
            // Error getting initial data
          });

        // Handle client disconnect - ensure all scenarios are covered
        const cleanup = () => {
          self.clients.delete(socket);
          // Remove all listeners to prevent memory leaks
          socket.removeAllListeners();
        };

        socket.on('close', cleanup);
        socket.on('error', cleanup);

        // Additional safety for abnormal terminations
        socket.on('disconnect', cleanup);
        socket.on('end', cleanup);
      });
    });

    // Serve Claude icon as favicon
    this.app.get('/favicon.ico', async (request, reply) => {
      return reply.sendFile('claude-icon.svg');
    });

    // API endpoints
    this.app.get('/api/test', async () => {
      return { message: 'MCP Workflow Dashboard Online!' };
    });

    this.app.get('/api/specs', async () => {
      const specs = await this.parser.getAllSpecs();
      return specs;
    });

    this.app.get('/api/specs/archived', async () => {
      const archivedSpecs = await this.parser.getAllArchivedSpecs();
      return archivedSpecs;
    });

    this.app.post('/api/specs/:name/archive', async (request, reply) => {
      const { name } = request.params as { name: string };
      
      try {
        await this.archiveService.archiveSpec(name);
        
        // Broadcast update to all connected clients
        this.broadcastSpecUpdate();
        
        return { success: true, message: `Spec '${name}' archived successfully` };
      } catch (error: any) {
        reply.code(400).send({ error: error.message });
      }
    });

    this.app.post('/api/specs/:name/unarchive', async (request, reply) => {
      const { name } = request.params as { name: string };
      
      try {
        await this.archiveService.unarchiveSpec(name);
        
        // Broadcast update to all connected clients
        this.broadcastSpecUpdate();
        
        return { success: true, message: `Spec '${name}' unarchived successfully` };
      } catch (error: any) {
        reply.code(400).send({ error: error.message });
      }
    });

    this.app.get('/api/approvals', async () => {
      const approvals = await this.approvalStorage.getAllPendingApprovals();
      return approvals;
    });

    // Get file content for an approval request
    this.app.get('/api/approvals/:id/content', async (request, reply) => {
      const { id } = request.params as { id: string };
      try {
        const approval = await this.approvalStorage.getApproval(id);
        if (!approval || !approval.filePath) {
          return reply.code(404).send({ error: 'Approval not found or no file path' });
        }

        // Try several resolution strategies for robustness across environments
        const candidates: string[] = [];
        const p = approval.filePath;
        // 1) As provided if absolute or relative to project root
        candidates.push(join(this.approvalStorage.projectPath, p));
        // 2) If path is already absolute, try it directly (join with absolute will normalize on some platforms)
        if (p.startsWith('/') || p.match(/^[A-Za-z]:[\\\/]/)) {
          candidates.push(p);
        }
        // 3) If not already under .spec-workflow, try under that root
        if (!p.includes('.spec-workflow')) {
          candidates.push(join(this.approvalStorage.projectPath, '.spec-workflow', p));
        }

        let content: string | null = null;
        let resolvedPath: string | null = null;
        for (const candidate of candidates) {
          try {
            const data = await fs.readFile(candidate, 'utf-8');
            content = data;
            resolvedPath = candidate;
            break;
          } catch {
            // try next candidate
          }
        }

        if (content == null) {
          return reply.code(500).send({ error: `Failed to read file at any known location for ${approval.filePath}` });
        }

        return { content, filePath: resolvedPath || approval.filePath };
      } catch (error: any) {
        reply.code(500).send({ error: `Failed to read file: ${error.message}` });
      }
    });

    this.app.get('/api/info', async () => {
      // Resolve the project path to get the actual directory name
      const resolvedPath = resolve(this.options.projectPath);
      const projectName = basename(resolvedPath) || 'Project';
      const steeringStatus = await this.parser.getProjectSteeringStatus();
      
      // Use cached version fetched at startup
      
      return {
        projectName,
        steering: steeringStatus,
        dashboardUrl: `http://localhost:${this.actualPort}`,
        version: this.packageVersion
      };
    });

    this.app.get('/api/specs/:name', async (request, reply) => {
      const { name } = request.params as { name: string };
      const spec = await this.parser.getSpec(name);
      if (!spec) {
        reply.code(404).send({ error: 'Spec not found' });
      }
      return spec;
    });


    // Get raw markdown content for specs
    this.app.get('/api/specs/:name/:document', async (request, reply) => {
      const { name, document } = request.params as { name: string; document: string };
      const allowedDocs = ['requirements', 'design', 'tasks'];

      if (!allowedDocs.includes(document)) {
        reply.code(400).send({ error: 'Invalid document type' });
        return;
      }

      const docPath = join(this.options.projectPath, '.spec-workflow', 'specs', name, `${document}.md`);

      try {
        const content = await readFile(docPath, 'utf-8');
        return { content };
      } catch {
        reply.code(404).send({ error: 'Document not found' });
      }
    });

    // Save/update spec document content (active specs)
    this.app.put('/api/specs/:name/:document', async (request, reply) => {
      const { name, document } = request.params as { name: string; document: string };
      const { content } = request.body as { content: string };
      const allowedDocs = ['requirements', 'design', 'tasks'];

      if (!allowedDocs.includes(document)) {
        reply.code(400).send({ error: 'Invalid document type' });
        return;
      }

      if (typeof content !== 'string') {
        reply.code(400).send({ error: 'Content must be a string' });
        return;
      }

      const docPath = join(this.options.projectPath, '.spec-workflow', 'specs', name, `${document}.md`);

      try {
        // Ensure the spec directory exists
        const specDir = join(this.options.projectPath, '.spec-workflow', 'specs', name);
        await fs.mkdir(specDir, { recursive: true });
        
        // Write the content to file
        await fs.writeFile(docPath, content, 'utf-8');
        
        return { success: true, message: 'Document saved successfully' };
      } catch (error: any) {
        reply.code(500).send({ error: `Failed to save document: ${error.message}` });
      }
    });

    // Save/update archived spec document content
    this.app.put('/api/specs/:name/:document/archived', async (request, reply) => {
      const { name, document } = request.params as { name: string; document: string };
      const { content } = request.body as { content: string };
      const allowedDocs = ['requirements', 'design', 'tasks'];

      if (!allowedDocs.includes(document)) {
        reply.code(400).send({ error: 'Invalid document type' });
        return;
      }

      if (typeof content !== 'string') {
        reply.code(400).send({ error: 'Content must be a string' });
        return;
      }

      const docPath = join(this.options.projectPath, '.spec-workflow', 'archive', 'specs', name, `${document}.md`);

      try {
        // Ensure the archived spec directory exists
        const specDir = join(this.options.projectPath, '.spec-workflow', 'archive', 'specs', name);
        await fs.mkdir(specDir, { recursive: true });
        
        // Write the content to file
        await fs.writeFile(docPath, content, 'utf-8');
        
        return { success: true, message: 'Archived document saved successfully' };
      } catch (error: any) {
        reply.code(500).send({ error: `Failed to save archived document: ${error.message}` });
      }
    });

    // Get all spec documents for real-time viewing
    this.app.get('/api/specs/:name/all', async (request, reply) => {
      const { name } = request.params as { name: string };
      const specDir = join(this.options.projectPath, '.spec-workflow', 'specs', name);
      const documents = ['requirements', 'design', 'tasks'];
      const result: Record<string, { content: string; lastModified: string } | null> = {};

      for (const doc of documents) {
        const docPath = join(specDir, `${doc}.md`);
        try {
          const content = await readFile(docPath, 'utf-8');
          const stats = await fs.stat(docPath);
          result[doc] = {
            content,
            lastModified: stats.mtime.toISOString()
          };
        } catch {
          result[doc] = null;
        }
      }

      return result;
    });

    // Get all archived spec documents for read-only viewing
    this.app.get('/api/specs/:name/all/archived', async (request, reply) => {
      const { name } = request.params as { name: string };
      const specDir = join(this.options.projectPath, '.spec-workflow', 'archive', 'specs', name);
      const documents = ['requirements', 'design', 'tasks'];
      const result: Record<string, { content: string; lastModified: string } | null> = {};

      for (const doc of documents) {
        const docPath = join(specDir, `${doc}.md`);
        try {
          const content = await readFile(docPath, 'utf-8');
          const stats = await fs.stat(docPath);
          result[doc] = {
            content,
            lastModified: stats.mtime.toISOString()
          };
        } catch {
          result[doc] = null;
        }
      }

      return result;
    });

    // Get steering document content
    this.app.get('/api/steering/:name', async (request, reply) => {
      const { name } = request.params as { name: string };
      const allowedDocs = ['product', 'tech', 'structure'];

      if (!allowedDocs.includes(name)) {
        reply.code(400).send({ error: 'Invalid steering document name' });
        return;
      }

      const docPath = join(this.options.projectPath, '.spec-workflow', 'steering', `${name}.md`);

      try {
        const content = await readFile(docPath, 'utf-8');
        const stats = await fs.stat(docPath);
        return { 
          content, 
          lastModified: stats.mtime.toISOString() 
        };
      } catch {
        // Return empty content for non-existent documents to allow creation
        return { 
          content: '', 
          lastModified: new Date().toISOString() 
        };
      }
    });

    // Save/update steering document content
    this.app.put('/api/steering/:name', async (request, reply) => {
      const { name } = request.params as { name: string };
      const { content } = request.body as { content: string };
      const allowedDocs = ['product', 'tech', 'structure'];

      if (!allowedDocs.includes(name)) {
        reply.code(400).send({ error: 'Invalid steering document name' });
        return;
      }

      if (typeof content !== 'string') {
        reply.code(400).send({ error: 'Content must be a string' });
        return;
      }

      const steeringDir = join(this.options.projectPath, '.spec-workflow', 'steering');
      const docPath = join(steeringDir, `${name}.md`);

      try {
        // Ensure the steering directory exists
        await fs.mkdir(steeringDir, { recursive: true });
        
        // Write the content to file
        await fs.writeFile(docPath, content, 'utf-8');
        
        // Broadcast steering update to all connected clients
        await this.broadcastSteeringUpdate();
        
        return { success: true, message: 'Steering document saved successfully' };
      } catch (error: any) {
        reply.code(500).send({ error: `Failed to save steering document: ${error.message}` });
      }
    });

    // Get task progress for a specific spec
    this.app.get('/api/specs/:name/tasks/progress', async (request, reply) => {
      const { name } = request.params as { name: string };

      try {
        const spec = await this.parser.getSpec(name);
        if (!spec || !spec.phases.tasks.exists) {
          return reply.code(404).send({ error: 'Spec or tasks not found' });
        }

        // Parse tasks.md file for detailed task information
        const tasksPath = join(this.options.projectPath, '.spec-workflow', 'specs', name, 'tasks.md');
        const tasksContent = await readFile(tasksPath, 'utf-8');
        const parseResult = parseTasksFromMarkdown(tasksContent);

        // Count tasks from our detailed parsing (includes all subtasks)
        const totalTasks = parseResult.summary.total;
        const completedTasks = parseResult.summary.completed;
        const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

        return {
          total: totalTasks,
          completed: completedTasks,
          inProgress: parseResult.inProgressTask,
          progress: progress,
          taskList: parseResult.tasks,
          lastModified: spec.phases.tasks.lastModified || spec.lastModified
        };
      } catch (error: any) {
        reply.code(500).send({ error: `Failed to get task progress: ${error.message}` });
      }
    });

    // Update task status
    this.app.put('/api/specs/:name/tasks/:taskId/status', async (request, reply) => {
      const { name, taskId } = request.params as { name: string; taskId: string };
      const { status } = request.body as { status: 'pending' | 'in-progress' | 'completed' };

      if (!status || !['pending', 'in-progress', 'completed'].includes(status)) {
        return reply.code(400).send({ error: 'Invalid status. Must be pending, in-progress, or completed' });
      }

      try {
        const tasksPath = join(this.options.projectPath, '.spec-workflow', 'specs', name, 'tasks.md');
        
        // Check if tasks file exists
        let tasksContent: string;
        try {
          tasksContent = await readFile(tasksPath, 'utf-8');
        } catch (error: any) {
          if (error.code === 'ENOENT') {
            return reply.code(404).send({ error: 'Tasks file not found' });
          }
          throw error;
        }

        // Parse tasks to verify taskId exists
        const parseResult = parseTasksFromMarkdown(tasksContent);
        const task = parseResult.tasks.find(t => t.id === taskId);
        
        if (!task) {
          return reply.code(404).send({ error: `Task ${taskId} not found` });
        }

        // Update task status in markdown
        const { updateTaskStatus } = await import('../core/task-parser.js');
        const updatedContent = updateTaskStatus(tasksContent, taskId, status);

        if (updatedContent === tasksContent) {
          return reply.code(400).send({ error: `Could not update task ${taskId} status` });
        }

        // Write updated content
        await fs.writeFile(tasksPath, updatedContent, 'utf-8');

        // Broadcast task update to all connected clients
        this.broadcastTaskUpdate(name);

        return { 
          success: true, 
          message: `Task ${taskId} status updated to ${status}`,
          task: { ...task, status }
        };
      } catch (error: any) {
        reply.code(500).send({ error: `Failed to update task status: ${error.message}` });
      }
    });


    // Approval endpoints
    this.app.post('/api/approvals/:id/approve', async (request, reply) => {
      const { id } = request.params as { id: string };
      const { response, annotations, comments } = request.body as {
        response: string;
        annotations?: string;
        comments?: any[];
      };

      try {
        await this.approvalStorage.updateApproval(id, 'approved', response, annotations, comments);
        this.broadcastApprovalUpdate();
        return { success: true };
      } catch (error: any) {
        reply.code(404).send({ error: error.message });
      }
    });

    this.app.post('/api/approvals/:id/reject', async (request, reply) => {
      const { id } = request.params as { id: string };
      const { response, annotations, comments } = request.body as {
        response: string;
        annotations?: string;
        comments?: any[];
      };

      try {
        await this.approvalStorage.updateApproval(id, 'rejected', response, annotations, comments);
        this.broadcastApprovalUpdate();
        return { success: true };
      } catch (error: any) {
        reply.code(404).send({ error: error.message });
      }
    });

    this.app.post('/api/approvals/:id/needs-revision', async (request, reply) => {
      const { id } = request.params as { id: string };
      const { response, annotations, comments } = request.body as {
        response: string;
        annotations?: string;
        comments?: any[];
      };

      try {
        await this.approvalStorage.updateApproval(id, 'needs-revision', response, annotations, comments);
        this.broadcastApprovalUpdate();
        return { success: true };
      } catch (error: any) {
        reply.code(404).send({ error: error.message });
      }
    });

    // Set up file watcher for specs
    this.watcher.on('change', (event) => {
      // Broadcast to all connected clients
      const message = JSON.stringify({
        type: 'update',
        data: event,
      });

      this.clients.forEach((client) => {
        if (client.readyState === 1) {
          // WebSocket.OPEN
          client.send(message);
        }
      });
    });

    // Set up task update watcher
    this.watcher.on('task-update', (event) => {
      // When task files change externally, broadcast proper task status update
      // This ensures the UI gets the same structured data as API updates
      this.broadcastTaskUpdate(event.specName);
    });


    // Set up steering change watcher
    this.watcher.on('steering-change', (event) => {
      // Broadcast steering updates to all connected clients
      const message = JSON.stringify({
        type: 'steering-update',
        data: event.steeringStatus,
      });

      this.clients.forEach((client) => {
        if (client.readyState === 1) {
          // WebSocket.OPEN
          client.send(message);
        }
      });
    });

    // Set up approval file watcher
    this.approvalStorage.on('approval-change', () => {
      this.broadcastApprovalUpdate();
    });

    // Start watcher
    await this.watcher.start();
    await this.approvalStorage.start();

    // Allocate port - use custom port if provided, otherwise use ephemeral port
    if (this.options.port) {
      // Validate and check custom port availability
      await validateAndCheckPort(this.options.port);
      this.actualPort = this.options.port;
      console.error(`Using custom port: ${this.actualPort}`);
    } else {
      // Find available ephemeral port
      this.actualPort = await findAvailablePort();
      console.error(`Using ephemeral port: ${this.actualPort}`);
    }

    // Start server
    await this.app.listen({ port: this.actualPort, host: '0.0.0.0' });

    // Open browser if requested
    if (this.options.autoOpen) {
      await open(`http://localhost:${this.actualPort}`);
    }

    return `http://localhost:${this.actualPort}`;
  }

  private async broadcastApprovalUpdate() {
    try {
      const approvals = await this.approvalStorage.getAllPendingApprovals();
      const message = JSON.stringify({
        type: 'approval-update',
        data: approvals,
      });

      this.clients.forEach((client) => {
        if (client.readyState === 1) {
          // WebSocket.OPEN
          client.send(message);
        }
      });
    } catch (error) {
      // Error broadcasting approval update
    }
  }

  private async broadcastSpecUpdate() {
    try {
      const [specs, archivedSpecs] = await Promise.all([
        this.parser.getAllSpecs(),
        this.parser.getAllArchivedSpecs()
      ]);
      
      const message = JSON.stringify({
        type: 'spec-update',
        data: { specs, archivedSpecs },
      });

      this.clients.forEach((client) => {
        if (client.readyState === 1) {
          // WebSocket.OPEN
          client.send(message);
        }
      });
    } catch (error) {
      // Error broadcasting spec update
    }
  }

  private async broadcastSteeringUpdate() {
    try {
      const steeringStatus = await this.parser.getProjectSteeringStatus();
      
      const message = JSON.stringify({
        type: 'steering-update',
        data: steeringStatus,
      });

      this.clients.forEach((client) => {
        if (client.readyState === 1) {
          // WebSocket.OPEN
          client.send(message);
        }
      });
    } catch (error) {
      // Error broadcasting steering update
    }
  }

  private async broadcastTaskUpdate(specName: string) {
    try {
      // Get updated task progress for the specific spec
      const tasksPath = join(this.options.projectPath, '.spec-workflow', 'specs', specName, 'tasks.md');
      const tasksContent = await readFile(tasksPath, 'utf-8');
      const parseResult = parseTasksFromMarkdown(tasksContent);
      
      const message = JSON.stringify({
        type: 'task-status-update',
        data: {
          specName,
          taskList: parseResult.tasks,
          summary: parseResult.summary,
          inProgress: parseResult.inProgressTask
        },
      });

      this.clients.forEach((client) => {
        if (client.readyState === 1) {
          // WebSocket.OPEN
          client.send(message);
        }
      });
    } catch (error) {
      // Error broadcasting task update
    }
  }

  async stop() {
    // Close all WebSocket connections with proper cleanup
    this.clients.forEach((client) => {
      try {
        client.removeAllListeners();
        if (client.readyState === 1) {
          // WebSocket.OPEN
          client.close();
        }
      } catch (error) {
        // Ignore cleanup errors
      }
    });
    this.clients.clear();

    // Remove all event listeners from watchers to prevent memory leaks
    this.watcher.removeAllListeners();
    this.approvalStorage.removeAllListeners();

    // Stop the watchers
    await this.watcher.stop();
    await this.approvalStorage.stop();

    // Close the Fastify server
    await this.app.close();
  }

  getUrl(): string {
    return `http://localhost:${this.actualPort}`;
  }

}