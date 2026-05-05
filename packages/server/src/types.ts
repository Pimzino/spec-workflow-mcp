// Server-specific types for the spec workflow MCP server.
// Shared types are re-exported from @spec-workflow/shared.

import { encode } from '@toon-format/toon';
import type { AutomationJob, ToolResponse, MCPToolResponse } from '@spec-workflow/shared';

// Re-export all shared types for backward compatibility
export type {
  AutomationJob,
  SpecData,
  PhaseStatus,
  SteeringStatus,
  PromptSection,
  TaskInfo,
  ImplementationLogEntry,
  ImplementationLog,
  ToolResponse,
  MCPToolResponse,
} from '@spec-workflow/shared';

// ---- Server-only types ----

export interface SecurityConfig {
  rateLimitEnabled: boolean;
  rateLimitPerMinute: number;
  auditLogEnabled: boolean;
  auditLogPath?: string;
  auditLogRetentionDays: number;
  corsEnabled: boolean;
  allowedOrigins: string[];
}

export interface GlobalSettings {
  automationJobs: AutomationJob[];
  security?: SecurityConfig;
  createdAt?: string;
  lastModified?: string;
}

export interface JobExecutionHistory {
  jobId: string;
  jobName: string;
  jobType: string;
  executedAt: string;
  success: boolean;
  duration: number;
  itemsProcessed: number;
  itemsDeleted: number;
  error?: string;
}

export interface JobExecutionLog {
  executions: JobExecutionHistory[];
  lastUpdated?: string;
}

export interface ToolContext {
  projectPath: string;
  dashboardUrl?: string;
  lang?: string;
}

// Helper function to convert ToolResponse to MCP format
export function toMCPResponse(response: ToolResponse, isError: boolean = false): MCPToolResponse {
  return {
    content: [{
      type: "text",
      text: encode(response)
    }],
    isError
  };
}