#!/usr/bin/env node

import { SpecWorkflowMCPServer } from './server.js';
import { DashboardServer } from './dashboard/server.js';
import { DASHBOARD_TEST_MESSAGE } from './dashboard/utils.js';
import { homedir } from 'os';
import { loadConfigFile, mergeConfigs, SpecWorkflowConfig } from './config.js';
import { WorkspaceInitializer } from './core/workspace-initializer.js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

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
  --config <path>         Use custom config file instead of default location
                         Supports both relative and absolute paths
  --language <code>       Set language for internationalization (e.g., zh, en, ja)
                         Supported languages: en, zh, ja, es, fr, de, it, ko, ar

CONFIGURATION:
  Default config: <project-dir>/.spec-workflow/config.toml
  Custom config: Use --config to specify alternative location
  Command-line arguments override all config file settings

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

  # Use custom config file
  spec-workflow-mcp --config ~/my-configs/spec.toml

  # Custom config with dashboard
  spec-workflow-mcp --config ./dev-config.toml --dashboard --port 3000

  # Set language to Chinese
  spec-workflow-mcp --language zh

  # Chinese language with dashboard
  spec-workflow-mcp --language zh --AutoStartDashboard

PARAMETER FORMATS:
  --port 3456             Space-separated format
  --port=3456             Equals format
  --config path           Space-separated format
  --config=path           Equals format
  --language zh           Space-separated format
  --language=zh           Equals format

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
  lang?: string;
  configPath?: string;
} {
  const isDashboardMode = args.includes('--dashboard');
  const autoStartDashboard = args.includes('--AutoStartDashboard');
  let customPort: number | undefined;
  let configPath: string | undefined;
  let customLang: string | undefined;
  
  // Check for invalid flags
  const validFlags = ['--dashboard', '--AutoStartDashboard', '--port', '--config', '--language', '--help', '-h'];
  for (const arg of args) {
    if (arg.startsWith('--') && !arg.includes('=')) {
      if (!validFlags.includes(arg)) {
        throw new Error(`Unknown option: ${arg}
Use --help to see available options.`);
      }
    } else if (arg.startsWith('--') && arg.includes('=')) {
      const flagName = arg.split('=')[0];
      if (!validFlags.includes(flagName)) {
        throw new Error(`Unknown option: ${flagName}
Use --help to see available options.`);
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
  
  // Parse --config parameter (supports --config path and --config=path formats)
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg.startsWith('--config=')) {
      // Handle --config=path format
      configPath = arg.split('=')[1];
      if (!configPath) {
        throw new Error('--config parameter requires a value (e.g., --config=./config.toml)');
      }
    } else if (arg === '--config' && i + 1 < args.length) {
      // Handle --config path format
      configPath = args[i + 1];
      i++; // Skip the next argument as it's the config path
    } else if (arg === '--config') {
      throw new Error('--config parameter requires a value (e.g., --config ./config.toml)');
    }
  }
  
  // Parse --language parameter (supports --language zh and --language=zh formats)
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg.startsWith('--language=')) {
      // Handle --language=zh format
      customLang = arg.split('=')[1];
      if (!customLang) {
        throw new Error('--language parameter requires a value (e.g., --language=zh)');
      }
    } else if (arg === '--language' && i + 1 < args.length) {
      // Handle --language zh format
      customLang = args[i + 1];
      i++; // Skip the next argument as it's the language code
    } else if (arg === '--language') {
      throw new Error('--language parameter requires a value (e.g., --language zh)');
    }
  }
  
  // Get project path (filter out flags and their values)
  const filteredArgs = args.filter((arg, index) => {
    if (arg === '--dashboard') return false;
    if (arg === '--AutoStartDashboard') return false;
    if (arg.startsWith('--port=')) return false;
    if (arg === '--port') return false;
    if (arg.startsWith('--config=')) return false;
    if (arg === '--config') return false;
    if (arg.startsWith('--language=')) return false;
    if (arg === '--language') return false;
    // Check if this arg is a value following --port, --config, or --language
    if (index > 0 && (args[index - 1] === '--port' || args[index - 1] === '--config' || args[index - 1] === '--language')) return false;
    return true;
  });
  
  const rawProjectPath = filteredArgs[0] || process.cwd();
  const projectPath = expandTildePath(rawProjectPath);
  
  // Warn if no explicit path was provided and we're using cwd
  if (!filteredArgs[0] && !isDashboardMode) {
    console.warn(`Warning: No project path specified, using current directory: ${projectPath}`);
    console.warn('Consider specifying an explicit path for better clarity.');
  }
  
  return { projectPath, isDashboardMode, autoStartDashboard, port: customPort, lang: customLang, configPath };
}

async function main() {
  try {
    const args = process.argv.slice(2);
    
    // Check for help flag
    if (args.includes('--help') || args.includes('-h')) {
      showHelp();
      process.exit(0);
    }
    
    // Parse command-line arguments first to get initial project path
    const cliArgs = parseArguments(args);
    let projectPath = cliArgs.projectPath;
    
    // Load config file (custom path or default location)
    const configResult = loadConfigFile(projectPath, cliArgs.configPath);
    
    if (configResult.error) {
      // If custom config was specified but failed, this is fatal
      if (cliArgs.configPath) {
        console.error(`Error: ${configResult.error}`);
        process.exit(1);
      }
      // For default config location, just warn and continue
      console.error(`Config file error: ${configResult.error}`);
      console.error('Continuing with command-line arguments only...');
    } else if (configResult.config && configResult.configPath) {
      console.error(`Loaded config from: ${configResult.configPath}`);
    }
    
    // Convert CLI args to config format
    const cliConfig: SpecWorkflowConfig = {
      projectDir: cliArgs.projectPath !== process.cwd() ? cliArgs.projectPath : undefined,
      dashboardOnly: cliArgs.isDashboardMode || undefined,
      autoStartDashboard: cliArgs.autoStartDashboard || undefined,
      port: cliArgs.port,
      lang: cliArgs.lang
    };
    
    // Merge configs (CLI overrides file config)
    const finalConfig = mergeConfigs(configResult.config, cliConfig);
    
    // Apply final configuration
    if (finalConfig.projectDir) {
      projectPath = finalConfig.projectDir;
    }
    const isDashboardMode = finalConfig.dashboardOnly || false;
    const autoStartDashboard = finalConfig.autoStartDashboard || false;
    const port = finalConfig.port;
    const lang = finalConfig.lang;
    
    if (isDashboardMode) {
      // Dashboard only mode
      console.error(`Starting Spec Workflow Dashboard for project: ${projectPath}`);
      if (port) {
        console.error(`Using custom port: ${port}`);
      }
      
      // Initialize workspace directories and templates
      const __dirname = dirname(fileURLToPath(import.meta.url));
      const packageJsonPath = join(__dirname, '..', 'package.json');
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
      const workspaceInitializer = new WorkspaceInitializer(projectPath, packageJson.version);
      await workspaceInitializer.initializeWorkspace();
      
      const dashboardServer = new DashboardServer({
        projectPath,
        autoOpen: true,
        port
      });
      
      try {
        const dashboardUrl = await dashboardServer.start();
        console.error(`Dashboard started at: ${dashboardUrl}`);
        console.error('Press Ctrl+C to stop the dashboard');
      } catch (error: any) {
        if (error.message.includes('already in use') && port) {
          // Check if it's an existing dashboard
          try {
            const response = await fetch(`http://localhost:${port}/api/test`, {
              method: 'GET',
              signal: AbortSignal.timeout(1000)
            });
            
            if (response.ok) {
              const data = await response.json() as { message?: string };
              if (data.message === DASHBOARD_TEST_MESSAGE) {
                console.error(`Dashboard already running at http://localhost:${port}`);
                console.error('Another dashboard instance is already serving this project.');
                console.error('Please close the existing instance or use a different port.');
                process.exit(0);
              }
            }
          } catch {
            // Not our dashboard
          }
          console.error(`Error: Port ${port} is already in use by another service.`);
          console.error('Please choose a different port or stop the service using this port.');
        } else {
          console.error(`Failed to start dashboard: ${error.message}`);
        }
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
      // MCP server mode (with optional auto-start dashboard)
      console.error(`Starting Spec Workflow MCP Server for project: ${projectPath}`);
      console.error(`Working directory: ${process.cwd()}`);
      
      const server = new SpecWorkflowMCPServer();
      
      // Initialize with dashboard options
      const dashboardOptions = autoStartDashboard ? {
        autoStart: true,
        port: port
      } : undefined;
      
      await server.initialize(projectPath, dashboardOptions, lang);
      
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