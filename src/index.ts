#!/usr/bin/env node

import { SpecWorkflowMCPServer } from "./server.js";
import { DashboardServer } from "./dashboard/server.js";
import { DASHBOARD_TEST_MESSAGE } from "./dashboard/utils.js";
import { homedir } from "os";
import { loadConfigFile, mergeConfigs, SpecWorkflowConfig } from "./config.js";
import { WorkspaceInitializer } from "./core/workspace-initializer.js";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

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
  --templateLang <lang>   Template language: 'en' or 'zh' (default: 'en')
                         Controls the language of generated template files

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

  # Use Chinese templates
  spec-workflow-mcp --templateLang zh

  # Use Chinese templates with specific project
  spec-workflow-mcp ~/my-project --templateLang zh --AutoStartDashboard

PARAMETER FORMATS:
  --port 3456             Space-separated format
  --port=3456             Equals format
  --config path           Space-separated format
  --config=path           Equals format
  --templateLang en       Space-separated format
  --templateLang=zh       Equals format

For more information, visit: https://github.com/Pimzino/spec-workflow-mcp
`);
}

function expandTildePath(path: string): string {
  if (path.startsWith("~/") || path === "~") {
    return path.replace("~", homedir()); // 替换~为家目录
  }
  return path;
}

/**
 * 解析命令行参数
 * @param args - 命令行参数
 * @returns 解析后的参数
 */
function parseArguments(args: string[]): {
  projectPath: string;
  isDashboardMode: boolean;
  autoStartDashboard: boolean;
  port?: number;
  lang?: string;
  templateLang?: string;
  configPath?: string;
} {
  const isDashboardMode = args.includes("--dashboard"); // 是否为仪表盘模式
  const autoStartDashboard = args.includes("--AutoStartDashboard"); // 是否自动启动仪表盘
  let customPort: number | undefined; // 自定义端口
  let templateLang: string | undefined; // 模板语言
  let configPath: string | undefined; // 自定义配置路径

  // Check for invalid flags 检查无效的标志
  const validFlags = [
    "--dashboard",
    "--AutoStartDashboard",
    "--port",
    "--config",
    "--templateLang",
    "--help",
    "-h",
  ];
  for (const arg of args) {
    if (arg.startsWith("--") && !arg.includes("=")) {
      if (!validFlags.includes(arg)) {
        throw new Error(
          `Unknown option: ${arg}\nUse --help to see available options.`
        );
      }
    } else if (arg.startsWith("--") && arg.includes("=")) {
      const flagName = arg.split("=")[0];
      if (!validFlags.includes(flagName)) {
        throw new Error(
          `Unknown option: ${flagName}\nUse --help to see available options.`
        );
      }
    }
  }

  // Parse --port parameter (supports --port 3000 and --port=3000 formats)
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg.startsWith("--port=")) {
      // Handle --port=3000 format
      const portStr = arg.split("=")[1];
      if (portStr) {
        const parsed = parseInt(portStr, 10);
        if (isNaN(parsed)) {
          throw new Error(
            `Invalid port number: ${portStr}. Port must be a number.`
          ); // 无效的端口号
        }
        if (parsed < 1024 || parsed > 65535) {
          throw new Error(
            `Port ${parsed} is out of range. Port must be between 1024 and 65535.`
          ); // 端口号范围错误
        }
        customPort = parsed;
      } else {
        throw new Error(
          "--port parameter requires a value (e.g., --port=3000)"
        ); // --port参数需要一个值
      }
    } else if (arg === "--port" && i + 1 < args.length) {
      // Handle --port 3000 format 处理--port 3000格式
      const portStr = args[i + 1];
      const parsed = parseInt(portStr, 10);
      if (isNaN(parsed)) {
        throw new Error(
          `Invalid port number: ${portStr}. Port must be a number.`
        ); // 无效的端口号
      }
      if (parsed < 1024 || parsed > 65535) {
        throw new Error(
          `Port ${parsed} is out of range. Port must be between 1024 and 65535.`
        ); // 端口号范围错误
      }
      customPort = parsed;
      i++; // Skip the next argument as it's the port value
    } else if (arg === "--port") {
      throw new Error("--port parameter requires a value (e.g., --port 3000)"); // --port参数需要一个值
    }
  }

  // Parse --config parameter (supports --config path and --config=path formats)
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg.startsWith("--config=")) {
      // Handle --config=path format
      configPath = arg.split("=")[1];
      if (!configPath) {
        throw new Error(
          "--config parameter requires a value (e.g., --config=./config.toml)"
        ); // --config参数需要一个值
      }
    } else if (arg === "--config" && i + 1 < args.length) {
      // Handle --config path format
      configPath = args[i + 1];
      i++; // Skip the next argument as it's the config path
    } else if (arg === "--config") {
      throw new Error(
        "--config parameter requires a value (e.g., --config ./config.toml)"
      );
    }
  }

  // Parse --templateLang parameter (supports --templateLang en and --templateLang=en formats)
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg.startsWith("--templateLang=")) {
      // Handle --templateLang=en format
      const langValue = arg.split("=")[1];
      if (!langValue) {
        throw new Error(
          "--templateLang parameter requires a value (e.g., --templateLang=en)"
        ); // --templateLang参数需要一个值
      }
      if (!["en", "zh"].includes(langValue)) {
        throw new Error(
          `Invalid templateLang: ${langValue}. Must be 'en' or 'zh'.`
        ); // 无效的模板语言
      }
      templateLang = langValue;
    } else if (arg === "--templateLang" && i + 1 < args.length) {
      // Handle --templateLang en format
      const langValue = args[i + 1];
      if (!["en", "zh"].includes(langValue)) {
        throw new Error(
          `Invalid templateLang: ${langValue}. Must be 'en' or 'zh'.`
        ); // 无效的模板语言
      }
      templateLang = langValue;
      i++; // Skip the next argument as it's the templateLang value
    } else if (arg === "--templateLang") {
      throw new Error(
        "--templateLang parameter requires a value (e.g., --templateLang en)"
      ); // --templateLang参数需要一个值
    }
  }

  // Get project path (filter out flags and their values) 获取项目路径（过滤掉标志和它们的值）
  const filteredArgs = args.filter((arg, index) => {
    if (arg === "--dashboard") return false;
    if (arg === "--AutoStartDashboard") return false;
    if (arg.startsWith("--port=")) return false;
    if (arg === "--port") return false;
    if (arg.startsWith("--config=")) return false;
    if (arg === "--config") return false;
    if (arg.startsWith("--templateLang=")) return false;
    if (arg === "--templateLang") return false;
    // Check if this arg is a value following --port, --config, or --templateLang
    if (
      index > 0 &&
      (args[index - 1] === "--port" ||
        args[index - 1] === "--config" ||
        args[index - 1] === "--templateLang")
    )
      return false;
    return true;
  });

  const rawProjectPath = filteredArgs[0] || process.cwd(); // 原始项目路径
  const projectPath = expandTildePath(rawProjectPath);

  // Warn if no explicit path was provided and we're using cwd 警告如果没有显式路径并且我们使用cwd
  if (!filteredArgs[0] && !isDashboardMode) {
    console.warn(
      `Warning: No project path specified, using current directory: ${projectPath}`
    ); // 警告如果没有显式路径并且我们使用cwd
    console.warn("Consider specifying an explicit path for better clarity."); // 考虑指定一个显式路径以提高清晰度
  }

  return {
    projectPath,
    isDashboardMode,
    autoStartDashboard,
    port: customPort,
    lang: undefined,
    templateLang,
    configPath,
  };
}

async function main() {
  try {
    const args = process.argv.slice(2);
    console.error("args", args);

    // Check for help flag
    if (args.includes("--help") || args.includes("-h")) {
      showHelp();
      process.exit(0);
    }

    // Parse command-line arguments first to get initial project path 解析命令行参数以获取初始项目路径
    const cliArgs = parseArguments(args);
    let projectPath = cliArgs.projectPath;

    // Load config file (custom path or default location) 加载配置文件（自定义路径或默认位置）
    const configResult = loadConfigFile(projectPath, cliArgs.configPath);

    if (configResult.error) {
      // If custom config was specified but failed, this is fatal 如果自定义配置失败，则这是致命的
      if (cliArgs.configPath) {
        // 如果自定义配置路径失败，则这是致命的
        console.error(`Error: ${configResult.error}`);
        process.exit(1); // 退出程序
      }
      // For default config location, just warn and continue
      console.error(`Config file error: ${configResult.error}`); // 配置文件错误
      console.error("Continuing with command-line arguments only..."); // 继续使用命令行参数
    } else if (configResult.config && configResult.configPath) {
      console.error(`Loaded config from: ${configResult.configPath}`);
    }

    // Convert CLI args to config format 将命令行参数转换为配置格式
    const cliConfig: SpecWorkflowConfig = {
      projectDir:
        cliArgs.projectPath !== process.cwd() ? cliArgs.projectPath : undefined,
      dashboardOnly: cliArgs.isDashboardMode || undefined,
      autoStartDashboard: cliArgs.autoStartDashboard || undefined,
      port: cliArgs.port,
      lang: cliArgs.lang,
      templateLang: cliArgs.templateLang,
    };

    // Merge configs (CLI overrides file config) 合并配置（命令行参数覆盖配置文件）
    const finalConfig = mergeConfigs(configResult.config, cliConfig);

    // Apply final configuration
    if (finalConfig.projectDir) {
      projectPath = finalConfig.projectDir;
    }
    const isDashboardMode = finalConfig.dashboardOnly || false;
    const autoStartDashboard = finalConfig.autoStartDashboard || false;
    const port = finalConfig.port;
    const lang = finalConfig.lang;
    const templateLang = finalConfig.templateLang || "en"; // 默认为英文

    if (isDashboardMode) {
      // Dashboard only mode
      console.error(
        `Starting Spec Workflow Dashboard for project: ${projectPath}`
      );
      if (port) {
        console.error(`Using custom port: ${port}`);
      }

      // Initialize workspace directories and templates
      const __dirname = dirname(fileURLToPath(import.meta.url));
      const packageJsonPath = join(__dirname, "..", "package.json");
      const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));
      const workspaceInitializer = new WorkspaceInitializer(
        projectPath,
        packageJson.version,
        templateLang as "en" | "zh"
      ); // 初始化工作区目录和模板
      await workspaceInitializer.initializeWorkspace(); // 初始化工作区目录和模板

      const dashboardServer = new DashboardServer({
        projectPath,
        autoOpen: true,
        port,
      });

      try {
        const dashboardUrl = await dashboardServer.start();
        console.error(`Dashboard started at: ${dashboardUrl}`);
        console.error("Press Ctrl+C to stop the dashboard");
      } catch (error: any) {
        if (error.message.includes("already in use") && port) {
          // Check if it's an existing dashboard
          try {
            const response = await fetch(`http://localhost:${port}/api/test`, {
              method: "GET",
              signal: AbortSignal.timeout(1000),
            });

            if (response.ok) {
              const data = (await response.json()) as { message?: string };
              if (data.message === DASHBOARD_TEST_MESSAGE) {
                console.error(
                  `Dashboard already running at http://localhost:${port}`
                );
                console.error(
                  "Another dashboard instance is already serving this project."
                );
                console.error(
                  "Please close the existing instance or use a different port."
                );
                process.exit(0);
              }
            }
          } catch {
            // Not our dashboard
          }
          console.error(
            `Error: Port ${port} is already in use by another service.`
          );
          console.error(
            "Please choose a different port or stop the service using this port."
          );
        } else {
          console.error(`Failed to start dashboard: ${error.message}`);
        }
        process.exit(1);
      }

      // Handle graceful shutdown
      const shutdown = async () => {
        console.error("\nShutting down dashboard...");
        await dashboardServer.stop();
        process.exit(0);
      };

      process.on("SIGINT", shutdown);
      process.on("SIGTERM", shutdown);

      // Keep the process running
      process.stdin.resume();
    } else {
      // MCP server mode (with optional auto-start dashboard)
      console.error(
        `Starting Spec Workflow MCP Server for project: ${projectPath}`
      );
      console.error(`Working directory: ${process.cwd()}`);

      const server = new SpecWorkflowMCPServer();

      // Initialize with dashboard options
      const dashboardOptions = autoStartDashboard
        ? {
            autoStart: true,
            port: port,
          }
        : undefined;

      await server.initialize(
        projectPath,
        dashboardOptions,
        lang,
        templateLang
      );

      // Start monitoring for dashboard session
      server.startDashboardMonitoring();

      // Inform user about MCP server lifecycle
      if (autoStartDashboard) {
        console.error(
          "\nMCP server is running. The server and dashboard will shut down when the MCP client disconnects."
        );
      }

      // Handle graceful shutdown
      process.on("SIGINT", async () => {
        await server.stop();
        process.exit(0);
      });

      process.on("SIGTERM", async () => {
        await server.stop();
        process.exit(0);
      });
    }
  } catch (error: any) {
    console.error("Error:", error.message);

    // Provide additional context for common path-related issues
    if (
      error.message.includes("ENOENT") ||
      error.message.includes("path") ||
      error.message.includes("directory")
    ) {
      console.error("\nProject path troubleshooting:");
      console.error("- Verify the project path exists and is accessible");
      console.error(
        "- For Claude CLI users, ensure you used: claude mcp add spec-workflow npx -y @pimzino/spec-workflow-mcp@latest -- /path/to/your/project"
      );
      console.error(
        "- Check that the path doesn't contain special characters that need escaping"
      );
      console.error(`- Current working directory: ${process.cwd()}`);
    }

    process.exit(1);
  }
}

main().catch(() => process.exit(1));
