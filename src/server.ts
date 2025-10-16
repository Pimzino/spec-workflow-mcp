import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
  McpError,
  ErrorCode,
} from "@modelcontextprotocol/sdk/types.js";
import { registerTools, handleToolCall } from "./tools/index.js";
import {
  registerPrompts,
  handlePromptList,
  handlePromptGet,
} from "./prompts/index.js";
import { validateProjectPath } from "./core/path-utils.js";
import { DashboardServer } from "./dashboard/server.js";
import { DASHBOARD_TEST_MESSAGE } from "./dashboard/utils.js";
import { SessionManager } from "./core/session-manager.js";
import { WorkspaceInitializer } from "./core/workspace-initializer.js";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

export interface DashboardStartOptions {
  autoStart: boolean;
  port?: number;
}

export class SpecWorkflowMCPServer {
  private server: Server;
  private projectPath!: string;
  private dashboardServer?: DashboardServer;
  private dashboardUrl?: string;
  private sessionManager?: SessionManager;
  private lang?: string;
  private templateLang?: string;
  private dashboardMonitoringInterval?: NodeJS.Timeout;

  constructor() {
    // Get version from package.json
    const __dirname = dirname(fileURLToPath(import.meta.url));
    const packageJsonPath = join(__dirname, "..", "package.json");
    const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));

    // Get all registered tools and prompts
    const tools = registerTools();
    const prompts = registerPrompts();

    // Create tools capability object with each tool name
    const toolsCapability = tools.reduce((acc, tool) => {
      acc[tool.name] = {};
      return acc;
    }, {} as Record<string, {}>);

    this.server = new Server(
      {
        name: "spec-workflow-mcp",
        version: packageJson.version,
      },
      {
        capabilities: {
          tools: toolsCapability,
          prompts: {
            listChanged: true,
          },
        },
      }
    );
  }

  async initialize(
    projectPath: string,
    templateLang: string,
    dashboardOptions?: DashboardStartOptions,
    lang?: string
  ) {
    this.projectPath = projectPath;
    this.lang = lang;
    this.templateLang = templateLang;
    try {
      // Validate project path
      await validateProjectPath(this.projectPath);

      // Initialize workspace
      const __dirname = dirname(fileURLToPath(import.meta.url));
      const packageJsonPath = join(__dirname, "..", "package.json");
      const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));
      const workspaceInitializer = new WorkspaceInitializer(
        this.projectPath,
        packageJson.version,
        this.templateLang
      );
      await workspaceInitializer.initializeWorkspace();

      // Initialize session manager
      this.sessionManager = new SessionManager(this.projectPath);

      // Start dashboard if requested
      if (dashboardOptions?.autoStart) {
        try {
          this.dashboardServer = new DashboardServer({
            projectPath: this.projectPath,
            autoOpen: true, // Auto-open browser when dashboard is auto-started
            port: dashboardOptions.port,
          });
          this.dashboardUrl = await this.dashboardServer.start();

          // Create session tracking (overwrites any existing session.json)
          await this.sessionManager.createSession(this.dashboardUrl);

          // Log dashboard startup info
          console.error(`Dashboard auto-started at: ${this.dashboardUrl}`);
        } catch (dashboardError: any) {
          // Check if it's a port conflict error
          if (
            dashboardError.message.includes("already in use") &&
            dashboardOptions.port
          ) {
            // Try to check if an existing dashboard is running
            console.error(
              `Port ${dashboardOptions.port} is already in use, checking for existing dashboard...`
            );

            try {
              const response = await fetch(
                `http://localhost:${dashboardOptions.port}/api/test`,
                {
                  method: "GET",
                  signal: AbortSignal.timeout(1000),
                }
              );

              if (response.ok) {
                const data = (await response.json()) as { message?: string };
                if (data.message === DASHBOARD_TEST_MESSAGE) {
                  // Existing dashboard found, use it
                  this.dashboardUrl = `http://localhost:${dashboardOptions.port}`;
                  console.error(
                    `Found existing dashboard at ${this.dashboardUrl} - connecting to it`
                  );

                  // Update session with existing dashboard URL
                  await this.sessionManager.createSession(this.dashboardUrl);
                } else {
                  console.error(
                    `Port ${dashboardOptions.port} is in use by another service (not our dashboard)`
                  );
                  console.error(
                    "MCP server will continue without dashboard functionality"
                  );
                }
              } else {
                console.error(
                  `Port ${dashboardOptions.port} is in use but service is not responding`
                );
                console.error(
                  "MCP server will continue without dashboard functionality"
                );
              }
            } catch {
              console.error(
                `Port ${dashboardOptions.port} is in use by another service`
              );
              console.error(
                "MCP server will continue without dashboard functionality"
              );
            }
          } else {
            // Some other dashboard error
            console.error(
              `Failed to start dashboard: ${dashboardError.message}`
            );
            console.error(
              "MCP server will continue without dashboard functionality"
            );
          }

          // Clear dashboard server reference since we didn't successfully create one
          this.dashboardServer = undefined;
        }
      }

      // Create context for tools
      const context = {
        projectPath: this.projectPath,
        dashboardUrl: this.dashboardUrl,
        sessionManager: this.sessionManager,
        lang: this.lang,
      };

      // Register handlers
      this.setupHandlers(context);

      // Connect to stdio transport
      const transport = new StdioServerTransport();

      // Handle client disconnection - exit gracefully when transport closes
      transport.onclose = async () => {
        await this.stop();
        process.exit(0);
      };

      await this.server.connect(transport);

      // Monitor stdin for client disconnection (additional safety net)
      process.stdin.on("end", async () => {
        await this.stop();
        process.exit(0);
      });

      // Handle stdin errors
      process.stdin.on("error", async (error) => {
        console.error("stdin error:", error);
        await this.stop();
        process.exit(1);
      });

      // MCP server initialized successfully
    } catch (error) {
      throw error;
    }
  }

  private setupHandlers(context: any) {
    // Tool handlers
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: registerTools(),
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        // Create dynamic context with current dashboard URL
        const dynamicContext = {
          ...context,
          dashboardUrl: this.dashboardUrl,
        };
        return await handleToolCall(
          request.params.name,
          request.params.arguments || {},
          dynamicContext
        );
      } catch (error: any) {
        throw new McpError(ErrorCode.InternalError, error.message);
      }
    });

    // Prompt handlers
    this.server.setRequestHandler(ListPromptsRequestSchema, async () => {
      try {
        return await handlePromptList();
      } catch (error: any) {
        throw new McpError(ErrorCode.InternalError, error.message);
      }
    });

    this.server.setRequestHandler(GetPromptRequestSchema, async (request) => {
      try {
        // Create dynamic context with current dashboard URL
        const dynamicContext = {
          ...context,
          dashboardUrl: this.dashboardUrl,
        };
        return await handlePromptGet(
          request.params.name,
          request.params.arguments || {},
          dynamicContext
        );
      } catch (error: any) {
        throw new McpError(ErrorCode.InternalError, error.message);
      }
    });
  }

  startDashboardMonitoring() {
    // Check immediately
    this.checkForDashboardSession();

    // Then check every 2 seconds
    this.dashboardMonitoringInterval = setInterval(() => {
      this.checkForDashboardSession();
    }, 2000);
  }

  private async checkForDashboardSession() {
    if (!this.sessionManager) {
      return; // No session manager
    }

    try {
      const dashboardUrl = await this.sessionManager.getDashboardUrl();
      if (dashboardUrl && dashboardUrl !== this.dashboardUrl) {
        // Test if the dashboard is actually reachable
        const isReachable = await this.testDashboardConnection(dashboardUrl);
        if (isReachable) {
          this.dashboardUrl = dashboardUrl;
          // Update context for tools that might need dashboard URL
          // Note: Dashboard URL is now available to MCP tools
        }
      } else if (this.dashboardUrl) {
        // We have a dashboard URL, but let's verify it's still reachable
        const isReachable = await this.testDashboardConnection(
          this.dashboardUrl
        );
        if (!isReachable) {
          // Dashboard is no longer reachable, clear it so we can discover a new one
          this.dashboardUrl = undefined;
        }
      }
    } catch (error) {
      // Session file doesn't exist yet, continue monitoring
      if (this.dashboardUrl) {
        // Clear stale dashboard URL if session file is gone
        this.dashboardUrl = undefined;
      }
    }
  }

  private async testDashboardConnection(url: string): Promise<boolean> {
    try {
      // Try to fetch the dashboard's test endpoint with a short timeout
      const response = await fetch(`${url}/api/test`, {
        method: "GET",
        signal: AbortSignal.timeout(1000), // 1 second timeout
      });
      return response.ok;
    } catch (error) {
      // Connection failed
      return false;
    }
  }

  async stop() {
    try {
      // Stop dashboard monitoring
      if (this.dashboardMonitoringInterval) {
        clearInterval(this.dashboardMonitoringInterval);
        this.dashboardMonitoringInterval = undefined;
      }

      // Stop dashboard
      if (this.dashboardServer) {
        await this.dashboardServer.stop();
        this.dashboardServer = undefined;
      }

      // Stop MCP server
      await this.server.close();
    } catch (error) {
      console.error("Error during shutdown:", error);
      // Continue with shutdown even if there are errors
    }
  }

  getDashboardUrl(): string | undefined {
    return this.dashboardUrl;
  }
}
