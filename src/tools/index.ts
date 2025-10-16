import { Tool } from "@modelcontextprotocol/sdk/types.js";
import {
  specWorkflowGuideTool,
  specWorkflowGuideHandler,
} from "./spec-workflow-guide.js";
import { specStatusTool, specStatusHandler } from "./spec-status.js";
import { steeringGuideTool, steeringGuideHandler } from "./steering-guide.js";
import { approvalsTool, approvalsHandler } from "./approvals.js";
import {
  convertOriginRequirementTool,
  convertOriginRequirementHandler,
} from "./convert-origin-requirement.js";
import { md2wordTool, md2wordHandler } from "./md2word.js";
import {
  ToolContext,
  ToolResponse,
  MCPToolResponse,
  toMCPResponse,
} from "../types.js";

export function registerTools(): Tool[] {
  return [
    specWorkflowGuideTool,
    steeringGuideTool,
    specStatusTool,
    approvalsTool,
    convertOriginRequirementTool,
    md2wordTool,
  ];
}

export async function handleToolCall(
  name: string,
  args: any,
  context: ToolContext
): Promise<MCPToolResponse> {
  let response: ToolResponse;
  let isError = false;

  try {
    switch (name) {
      case "spec-workflow-guide":
        response = await specWorkflowGuideHandler(args, context);
        break;
      case "steering-guide":
        response = await steeringGuideHandler(args, context);
        break;
      case "spec-status":
        response = await specStatusHandler(args, context);
        break;
      case "approvals":
        response = await approvalsHandler(args, context);
        break;
      case "convert-origin-requirement":
        response = await convertOriginRequirementHandler(args, context);
        break;
      case "md2word":
        response = await md2wordHandler(args, context);
        break;
      default:
        throw new Error(`Unknown tool: ${name}`);
    }

    // Check if the response indicates an error
    isError = !response.success;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    response = {
      success: false,
      message: `Tool execution failed: ${errorMessage}`,
    };
    isError = true;
  }

  return toMCPResponse(response, isError);
}
