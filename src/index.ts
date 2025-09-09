#!/usr/bin/env node

import { SpecWorkflowMCPServer } from './server.js';
import { DashboardServer } from './dashboard/server.js';
import { homedir } from 'os';

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
  --AutoStartDashboard    Auto-start dashboard with MCP server
  --port <number>         Specify dashboard port (1024-65535)
                         Works with both --dashboard and --AutoStartDashboard
                         If not specified, uses an ephemeral port

MODES OF OPERATION:

1. MCP Server Only (default):
   spec-workflow-mcp
   spec-workflow-mcp ~/my-project
   
   Starts MCP server without dashboard. Dashboard can be started separately.

2. MCP Server with Auto-Started Dashboard:
   spec-workflow-mcp --AutoStartDashboard
   spec-workflow-mcp --AutoStartDashboard --port 3456
   spec-workflow-mcp ~/my-project --AutoStartDashboard
   
   Starts MCP server and automatically launches dashboard in browser.
   Note: Server and dashboard shut down when MCP client disconnects.

3. Dashboard Only Mode:
   spec-workflow-mcp --dashboard
   spec-workflow-mcp --dashboard --port 3456
   spec-workflow-mcp ~/my-project --dashboard
   
   Runs only the web dashboard without MCP server.

EXAMPLES:
  # Start MCP server in current directory (no dashboard)
  spec-workflow-mcp

  # Start MCP server with auto-started dashboard on ephemeral port
  spec-workflow-mcp --AutoStartDashboard

  # Start MCP server with dashboard on specific port
  spec-workflow-mcp --AutoStartDashboard --port 8080

  # Run dashboard only on port 3000
  spec-workflow-mcp --dashboard --port 3000

  # Start in a specific project directory
  spec-workflow-mcp ~/projects/my-app --AutoStartDashboard

PORT FORMATS:
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
  autoStartDashboard: boolean;
  port?: number;
} {
  const isDashboardMode = args.includes('--dashboard');
  const autoStartDashboard = args.includes('--AutoStartDashboard');
  let customPort: number | undefined;
  
  // Check for invalid flags
  const validFlags = ['--dashboard', '--AutoStartDashboard', '--port', '--help', '-h'];
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
    if (arg === '--AutoStartDashboard') return false;
    if (arg.startsWith('--port=')) return false;
    if (arg === '--port') return false;
    // Check if this arg is a port value following --port
    if (index > 0 && args[index - 1] === '--port') return false;
    return true;
  });
  
  const rawProjectPath = filteredArgs[0] || process.cwd();
  const projectPath = expandTildePath(rawProjectPath);
  
  // Warn if no explicit path was provided and we're using cwd
  if (!filteredArgs[0] && !isDashboardMode) {
    console.warn(`Warning: No project path specified, using current directory: ${projectPath}`);
    console.warn('Consider specifying an explicit path for better clarity.');
  }
  
  return { projectPath, isDashboardMode, autoStartDashboard, port: customPort };
}

async function main() {
  try {
    const args = process.argv.slice(2);
    
    // Check for help flag
    if (args.includes('--help') || args.includes('-h')) {
      showHelp();
      process.exit(0);
    }
    
    const { projectPath, isDashboardMode, autoStartDashboard, port } = parseArguments(args);
    
    if (isDashboardMode) {
      // Dashboard only mode
      console.error(`Starting Spec Workflow Dashboard for project: ${projectPath}`);
      if (port) {
        console.error(`Using custom port: ${port}`);
      }
      
      const dashboardServer = new DashboardServer({
        projectPath,
        autoOpen: true,
        port
      });
      
      const dashboardUrl = await dashboardServer.start();
      console.error(`Dashboard started at: ${dashboardUrl}`);
      console.error('Press Ctrl+C to stop the dashboard');
      
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
      // MCP server mode (with optional auto-start dashboard)
      console.error(`Starting Spec Workflow MCP Server for project: ${projectPath}`);
      console.error(`Working directory: ${process.cwd()}`);
      
      const server = new SpecWorkflowMCPServer();
      
      // Initialize with dashboard options
      const dashboardOptions = autoStartDashboard ? {
        autoStart: true,
        port: port
      } : undefined;
      
      await server.initialize(projectPath, dashboardOptions);
      
      // Start monitoring for dashboard session
      server.startDashboardMonitoring();
      
      // Inform user about MCP server lifecycle
      if (autoStartDashboard) {
        console.error('\nMCP server is running. The server and dashboard will shut down when the MCP client disconnects.');
      }
      
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