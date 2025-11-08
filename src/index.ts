#!/usr/bin/env node

import { SpecWorkflowMCPServer } from './server.js';
import { MultiProjectDashboardServer } from './dashboard/multi-server.js';
import { DashboardSessionManager } from './core/dashboard-session.js';
import { homedir } from 'os';
import { WorkspaceInitializer } from './core/workspace-initializer.js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Default dashboard port
const DEFAULT_DASHBOARD_PORT = 5000;

function showHelp() {
  console.error(`
Spec Workflow MCP Server - A Model Context Protocol server for spec-driven development

USAGE:
  spec-workflow-mcp [path] [options]

ARGUMENTS:
  path                    Project path (defaults to current directory)
                         Supports ~ for home directory

OPTIONS:
  --help                  Show this help message
  --dashboard             Run dashboard-only mode (no MCP server)
  --port <number>         Specify dashboard port (1024-65535)
                         Default: 5000
                         Only use if port 5000 is unavailable

IMPORTANT:
  Only ONE dashboard instance runs at a time. All MCP servers connect to the
  same dashboard. The dashboard runs on port 5000 by default.

MODES OF OPERATION:

1. MCP Server Only (default):
   spec-workflow-mcp
   spec-workflow-mcp ~/my-project

   Starts MCP server without dashboard. Dashboard can be started separately.

2. Dashboard Only Mode:
   spec-workflow-mcp --dashboard
   spec-workflow-mcp --dashboard --port 8080

   Runs only the web dashboard without MCP server (default port: 5000).
   Projects will automatically appear in the dashboard as MCP servers register.
   Only one dashboard instance is needed for all your projects.

EXAMPLES:
  # Start MCP server in current directory (no dashboard)
  spec-workflow-mcp

  # Start MCP server in a specific project directory
  spec-workflow-mcp ~/projects/my-app

  # Run dashboard (default port 5000) - START THIS FIRST
  spec-workflow-mcp --dashboard

  # Run dashboard on custom port (if 5000 is unavailable)
  spec-workflow-mcp --dashboard --port 8080

TYPICAL WORKFLOW:
  1. Start the dashboard once:
     spec-workflow-mcp --dashboard

  2. Start MCP servers for your projects (in separate terminals):
     spec-workflow-mcp ~/project1
     spec-workflow-mcp ~/project2
     spec-workflow-mcp ~/project3

  All projects will appear in the same dashboard at http://localhost:5000

PARAMETER FORMATS:
  --port 3456             Space-separated format
  --port=3456             Equals format

For more information, visit: https://github.com/Pimzino/spec-workflow-mcp
`);
}

function expandTildePath(path: string): string {
  if (path.startsWith('~/') || path === '~') {
    return path.replace('~', homedir());
  }
  return path;
}

function parseArguments(args: string[]): {
  projectPath: string;
  isDashboardMode: boolean;
  port?: number;
  lang?: string;
} {
  const isDashboardMode = args.includes('--dashboard');
  let customPort: number | undefined;

  // Check for invalid flags
  const validFlags = ['--dashboard', '--port', '--help', '-h'];
  for (const arg of args) {
    if (arg.startsWith('--') && !arg.includes('=')) {
      if (!validFlags.includes(arg)) {
        throw new Error(`Unknown option: ${arg}\nUse --help to see available options.`);
      }
    } else if (arg.startsWith('--') && arg.includes('=')) {
      const flagName = arg.split('=')[0];
      if (!validFlags.includes(flagName)) {
        throw new Error(`Unknown option: ${flagName}\nUse --help to see available options.`);
      }
    }
  }

  // Parse --port parameter (supports --port 3000 and --port=3000 formats)
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg.startsWith('--port=')) {
      // Handle --port=3000 format
      const portStr = arg.split('=')[1];
      if (portStr) {
        const parsed = parseInt(portStr, 10);
        if (isNaN(parsed)) {
          throw new Error(`Invalid port number: ${portStr}. Port must be a number.`);
        }
        if (parsed < 1024 || parsed > 65535) {
          throw new Error(`Port ${parsed} is out of range. Port must be between 1024 and 65535.`);
        }
        customPort = parsed;
      } else {
        throw new Error('--port parameter requires a value (e.g., --port=3000)');
      }
    } else if (arg === '--port' && i + 1 < args.length) {
      // Handle --port 3000 format
      const portStr = args[i + 1];
      const parsed = parseInt(portStr, 10);
      if (isNaN(parsed)) {
        throw new Error(`Invalid port number: ${portStr}. Port must be a number.`);
      }
      if (parsed < 1024 || parsed > 65535) {
        throw new Error(`Port ${parsed} is out of range. Port must be between 1024 and 65535.`);
      }
      customPort = parsed;
      i++; // Skip the next argument as it's the port value
    } else if (arg === '--port') {
      throw new Error('--port parameter requires a value (e.g., --port 3000)');
    }
  }

  // Get project path (filter out flags and their values)
  const filteredArgs = args.filter((arg, index) => {
    if (arg === '--dashboard') return false;
    if (arg.startsWith('--port=')) return false;
    if (arg === '--port') return false;
    // Check if this arg is a value following --port
    if (index > 0 && args[index - 1] === '--port') return false;
    return true;
  });

  // For dashboard-only mode, use cwd as default (dashboard doesn't need it)
  const rawProjectPath = filteredArgs[0] || process.cwd();
  const projectPath = expandTildePath(rawProjectPath);

  // Warn if no explicit path was provided and we're using cwd (but only for MCP server mode)
  if (!filteredArgs[0] && !isDashboardMode) {
    console.warn(`Warning: No project path specified, using current directory: ${projectPath}`);
    console.warn('Consider specifying an explicit path for better clarity.');
  }

  return { projectPath, isDashboardMode, port: customPort, lang: undefined };
}

async function main() {
  try {
    const args = process.argv.slice(2);

    // Check for help flag
    if (args.includes('--help') || args.includes('-h')) {
      showHelp();
      process.exit(0);
    }

    // Parse command-line arguments
    const cliArgs = parseArguments(args);
    let projectPath = cliArgs.projectPath;

    // Apply configuration from CLI args
    const isDashboardMode = cliArgs.isDashboardMode || false;
    const port = cliArgs.port;
    const lang = cliArgs.lang;

    if (isDashboardMode) {
      // Check if a dashboard is already running (always check, regardless of port)
      const sessionManager = new DashboardSessionManager();
      const existingSession = await sessionManager.getDashboardSession();

      if (existingSession) {
        console.error(`Dashboard is already running at: ${existingSession.url}`);
        console.error('');
        console.error('You can:');
        console.error(`  1. Use the existing dashboard at: ${existingSession.url}`);
        console.error(`  2. Stop it first (Ctrl+C or kill ${existingSession.pid}), then start a new one`);
        console.error('');
        console.error('Note: Only one dashboard instance is needed for all your projects.');
        process.exit(1);
      }

      // Use specified port or default
      const dashboardPort = port || DEFAULT_DASHBOARD_PORT;

      // Dashboard only mode - use new multi-project dashboard
      console.error(`Starting Unified Multi-Project Dashboard`);
      if (port) {
        console.error(`Using custom port: ${port}`);
      } else {
        console.error(`Using default port: ${DEFAULT_DASHBOARD_PORT}`);
      }

      const dashboardServer = new MultiProjectDashboardServer({
        autoOpen: true,
        port: dashboardPort
      });

      try {
        const dashboardUrl = await dashboardServer.start();
        console.error(`Dashboard started at: ${dashboardUrl}`);
        console.error('Projects will automatically appear as MCP servers register.');
        console.error('Press Ctrl+C to stop the dashboard');
      } catch (error: any) {
        console.error(`Failed to start dashboard: ${error.message}`);
        process.exit(1);
      }

      // Handle graceful shutdown
      const shutdown = async () => {
        console.error('\nShutting down dashboard...');
        await dashboardServer.stop();
        process.exit(0);
      };

      process.on('SIGINT', shutdown);
      process.on('SIGTERM', shutdown);

      // Keep the process running
      process.stdin.resume();

    } else {
      // MCP server mode
      console.error(`Starting Spec Workflow MCP Server for project: ${projectPath}`);
      console.error(`Working directory: ${process.cwd()}`);

      const server = new SpecWorkflowMCPServer();

      await server.initialize(projectPath, lang);

      // Handle graceful shutdown
      process.on('SIGINT', async () => {
        await server.stop();
        process.exit(0);
      });

      process.on('SIGTERM', async () => {
        await server.stop();
        process.exit(0);
      });
    }

  } catch (error: any) {
    console.error('Error:', error.message);

    // Provide additional context for common path-related issues
    if (error.message.includes('ENOENT') || error.message.includes('path') || error.message.includes('directory')) {
      console.error('\nProject path troubleshooting:');
      console.error('- Verify the project path exists and is accessible');
      console.error('- For Claude CLI users, ensure you used: claude mcp add spec-workflow npx -y @pimzino/spec-workflow-mcp@latest -- /path/to/your/project');
      console.error('- Check that the path doesn\'t contain special characters that need escaping');
      console.error(`- Current working directory: ${process.cwd()}`);
    }

    process.exit(1);
  }
}

main().catch(() => process.exit(1));