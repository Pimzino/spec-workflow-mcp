import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { ToolContext, ToolResponse } from '../types.js';
import { ApprovalStorage } from '../dashboard/approval-storage.js';
import { join } from 'path';
import { validateProjectPath } from '../core/path-utils.js';

export const approvalsTool: Tool = {
  name: 'approvals',
  description: `Manage approval requests through the dashboard interface.

# Instructions
Use this tool to request, check status, or delete approval requests. The action parameter determines the operation:
- 'request': Create a new approval request after creating each document
- 'status': Check the current status of an approval request
- 'delete': Clean up completed approval requests

CRITICAL: Only provide filePath parameter for requests - the dashboard reads files directly. Never include document content. Wait for user to review and approve before continuing.`,
  inputSchema: {
    type: 'object',
    properties: {
      action: {
        type: 'string',
        enum: ['request', 'status', 'delete'],
        description: 'The action to perform: request, status, or delete'
      },
      projectPath: {
        type: 'string',
        description: 'Absolute path to the project root (optional - uses server context path if not provided)'
      },
      approvalId: {
        type: 'string',
        description: 'The ID of the approval request (required for status and delete actions)'
      },
      title: {
        type: 'string',
        description: 'Brief title describing what needs approval (required for request action)'
      },
      filePath: {
        type: 'string',
        description: 'Path to the file that needs approval, relative to project root (required for request action)'
      },
      type: {
        type: 'string',
        enum: ['document', 'action'],
        description: 'Type of approval request - "document" for content approval, "action" for action approval (required for request)'
      },
      category: {
        type: 'string',
        enum: ['spec', 'steering'],
        description: 'Category of the approval request - "spec" for specifications, "steering" for steering documents (required for request)'
      },
      categoryName: {
        type: 'string',
        description: 'Name of the spec or "steering" for steering documents (required for request)'
      }
    },
    required: ['action']
  }
};

// Type definitions for discriminated unions
type RequestApprovalArgs = {
  action: 'request';
  projectPath?: string;
  title: string;
  filePath: string;
  type: 'document' | 'action';
  category: 'spec' | 'steering';
  categoryName: string;
};

type StatusApprovalArgs = {
  action: 'status';
  projectPath?: string;
  approvalId: string;
};

type DeleteApprovalArgs = {
  action: 'delete';
  projectPath?: string;
  approvalId: string;
};

type ApprovalArgs = RequestApprovalArgs | StatusApprovalArgs | DeleteApprovalArgs;

// Type guard functions
function isRequestApproval(args: ApprovalArgs): args is RequestApprovalArgs {
  return args.action === 'request';
}

function isStatusApproval(args: ApprovalArgs): args is StatusApprovalArgs {
  return args.action === 'status';
}

function isDeleteApproval(args: ApprovalArgs): args is DeleteApprovalArgs {
  return args.action === 'delete';
}

export async function approvalsHandler(
  args: {
    action: 'request' | 'status' | 'delete';
    projectPath?: string;
    approvalId?: string;
    title?: string;
    filePath?: string;
    type?: 'document' | 'action';
    category?: 'spec' | 'steering';
    categoryName?: string;
  },
  context: ToolContext
): Promise<ToolResponse> {
  // Cast to discriminated union type
  const typedArgs = args as ApprovalArgs;
  
  switch (typedArgs.action) {
    case 'request':
      if (isRequestApproval(typedArgs)) {
        // Validate required fields for request
        if (!args.title || !args.filePath || !args.type || !args.category || !args.categoryName) {
          return {
            success: false,
            message: 'Missing required fields for request action. Required: title, filePath, type, category, categoryName'
          };
        }
        return handleRequestApproval(typedArgs, context);
      }
      break;
    case 'status':
      if (isStatusApproval(typedArgs)) {
        // Validate required fields for status
        if (!args.approvalId) {
          return {
            success: false,
            message: 'Missing required field for status action. Required: approvalId'
          };
        }
        return handleGetApprovalStatus(typedArgs, context);
      }
      break;
    case 'delete':
      if (isDeleteApproval(typedArgs)) {
        // Validate required fields for delete
        if (!args.approvalId) {
          return {
            success: false,
            message: 'Missing required field for delete action. Required: approvalId'
          };
        }
        return handleDeleteApproval(typedArgs, context);
      }
      break;
    default:
      return {
        success: false,
        message: `Unknown action: ${(args as any).action}. Use 'request', 'status', or 'delete'.`
      };
  }
  
  // This should never be reached due to exhaustive type checking
  return {
    success: false,
    message: 'Invalid action configuration'
  };
}

async function handleRequestApproval(
  args: RequestApprovalArgs,
  context: ToolContext
): Promise<ToolResponse> {
  // Use context projectPath as default, allow override via args
  const projectPath = args.projectPath || context.projectPath;
  
  if (!projectPath) {
    return {
      success: false,
      message: 'Project path is required but not provided in context or arguments'
    };
  }

  try {
    // Validate and resolve project path
    const validatedProjectPath = await validateProjectPath(projectPath);

    const approvalStorage = new ApprovalStorage(validatedProjectPath);
    await approvalStorage.start();

    const approvalId = await approvalStorage.createApproval(
      args.title,
      args.filePath,
      args.category,
      args.categoryName,
      args.type
    );

    await approvalStorage.stop();

    return {
      success: true,
      message: `Approval request created successfully. Please review in dashboard: ${context.dashboardUrl || 'Start with: spec-workflow-mcp --dashboard'}`,
      data: {
        approvalId,
        title: args.title,
        filePath: args.filePath,
        type: args.type,
        status: 'pending',
        dashboardUrl: context.dashboardUrl
      },
      nextSteps: [
        'BLOCKING - Dashboard approval required',
        'VERBAL APPROVAL NOT ACCEPTED',
        'Do not proceed on verbal confirmation',
        context.dashboardUrl ? `Use dashboard: ${context.dashboardUrl}` : 'Start the dashboard with: spec-workflow-mcp --dashboard',
        `Poll status with: approvals action:"status" approvalId:"${approvalId}"`
      ],
      projectContext: {
        projectPath: validatedProjectPath,
        workflowRoot: join(validatedProjectPath, '.spec-workflow'),
        dashboardUrl: context.dashboardUrl
      }
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      message: `Failed to create approval request: ${errorMessage}`
    };
  }
}

async function handleGetApprovalStatus(
  args: StatusApprovalArgs,
  context: ToolContext
): Promise<ToolResponse> {
  // approvalId is guaranteed by type

  try {
    // Use provided projectPath or fall back to context
    const projectPath = args.projectPath || context.projectPath;
    if (!projectPath) {
      return {
        success: false,
        message: 'Project path is required. Please provide projectPath parameter.'
      };
    }

    // Validate and resolve project path
    const validatedProjectPath = await validateProjectPath(projectPath);

    const approvalStorage = new ApprovalStorage(validatedProjectPath);
    await approvalStorage.start();

    const approval = await approvalStorage.getApproval(args.approvalId);

    if (!approval) {
      await approvalStorage.stop();
      return {
        success: false,
        message: `Approval request not found: ${args.approvalId}`
      };
    }

    await approvalStorage.stop();

    const isCompleted = approval.status === 'approved' || approval.status === 'rejected';
    const canProceed = approval.status === 'approved';
    const mustWait = approval.status !== 'approved';
    const nextSteps: string[] = [];

    if (approval.status === 'pending') {
      nextSteps.push('BLOCKED - Do not proceed');
      nextSteps.push('VERBAL APPROVAL NOT ACCEPTED - Use dashboard or VS Code extension only');
      nextSteps.push('Approval must be done via dashboard or VS Code extension');
      nextSteps.push('Continue polling with approvals action:"status"');
    } else if (approval.status === 'approved') {
      nextSteps.push('APPROVED - Can proceed');
      nextSteps.push('Run approvals action:"delete" before continuing');
      if (approval.response) {
        nextSteps.push(`Response: ${approval.response}`);
      }
    } else if (approval.status === 'rejected') {
      nextSteps.push('BLOCKED - REJECTED');
      nextSteps.push('Do not proceed');
      nextSteps.push('Review feedback and revise');
      if (approval.response) {
        nextSteps.push(`Reason: ${approval.response}`);
      }
      if (approval.annotations) {
        nextSteps.push(`Notes: ${approval.annotations}`);
      }
    } else if (approval.status === 'needs-revision') {
      nextSteps.push('BLOCKED - Do not proceed');
      nextSteps.push('Update document with feedback');
      nextSteps.push('Create NEW approval request');
      if (approval.response) {
        nextSteps.push(`Feedback: ${approval.response}`);
      }
      if (approval.annotations) {
        nextSteps.push(`Notes: ${approval.annotations}`);
      }
      if (approval.comments && approval.comments.length > 0) {
        nextSteps.push(`${approval.comments.length} comments for targeted fixes:`);
        // Add each comment to nextSteps for visibility
        approval.comments.forEach((comment, index) => {
          if (comment.type === 'selection' && comment.selectedText) {
            nextSteps.push(`  Comment ${index + 1} on "${comment.selectedText.substring(0, 50)}...": ${comment.comment}`);
          } else {
            nextSteps.push(`  Comment ${index + 1} (general): ${comment.comment}`);
          }
        });
      }
    }

    return {
      success: true,
      message: approval.status === 'pending'
        ? `BLOCKED: Status is ${approval.status}. Verbal approval is NOT accepted. Use dashboard or VS Code extension only.`
        : `Approval status: ${approval.status}`,
      data: {
        approvalId: args.approvalId,
        title: approval.title,
        type: approval.type,
        status: approval.status,
        createdAt: approval.createdAt,
        respondedAt: approval.respondedAt,
        response: approval.response,
        annotations: approval.annotations,
        comments: approval.comments,
        isCompleted,
        canProceed,
        mustWait,
        blockNext: !canProceed,
        dashboardUrl: context.dashboardUrl
      },
      nextSteps,
      projectContext: {
        projectPath: validatedProjectPath,
        workflowRoot: join(validatedProjectPath, '.spec-workflow'),
        dashboardUrl: context.dashboardUrl
      }
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      message: `Failed to check approval status: ${errorMessage}`
    };
  }
}

async function handleDeleteApproval(
  args: DeleteApprovalArgs,
  context: ToolContext
): Promise<ToolResponse> {
  // approvalId is guaranteed by type

  try {
    // Use provided projectPath or fall back to context
    const projectPath = args.projectPath || context.projectPath;
    if (!projectPath) {
      return {
        success: false,
        message: 'Project path is required. Please provide projectPath parameter.'
      };
    }

    // Validate and resolve project path
    const validatedProjectPath = await validateProjectPath(projectPath);

    const approvalStorage = new ApprovalStorage(validatedProjectPath);
    await approvalStorage.start();

    // Check if approval exists and its status
    const approval = await approvalStorage.getApproval(args.approvalId);
    if (!approval) {
      return {
        success: false,
        message: `Approval request "${args.approvalId}" not found`,
        nextSteps: [
          'Verify approval ID',
          'Check status with approvals action:"status"'
        ]
      };
    }

    // Only allow deletion of approved requests
    if (approval.status !== 'approved') {
      return {
        success: false,
        message: `BLOCKED: Cannot proceed - status is "${approval.status}". VERBAL APPROVAL NOT ACCEPTED. Use dashboard or VS Code extension.`,
        data: {
          approvalId: args.approvalId,
          currentStatus: approval.status,
          title: approval.title,
          blockProgress: true,
          canProceed: false
        },
        nextSteps: [
          'STOP - Do not proceed to next phase',
          'Wait for approval',
          'Poll with approvals action:"status"'
        ]
      };
    }

    // Delete the approval
    const deleted = await approvalStorage.deleteApproval(args.approvalId);
    await approvalStorage.stop();

    if (deleted) {
      return {
        success: true,
        message: `Approval request "${args.approvalId}" deleted successfully`,
        data: {
          deletedApprovalId: args.approvalId,
          title: approval.title,
          category: approval.category,
          categoryName: approval.categoryName
        },
        nextSteps: [
          'Cleanup complete',
          'Continue to next phase'
        ],
        projectContext: {
          projectPath: validatedProjectPath,
          workflowRoot: join(validatedProjectPath, '.spec-workflow'),
          dashboardUrl: context.dashboardUrl
        }
      };
    } else {
      return {
        success: false,
        message: `Failed to delete approval request "${args.approvalId}"`,
        nextSteps: [
          'Check file permissions',
          'Verify approval exists',
          'Retry'
        ]
      };
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      message: `Failed to delete approval: ${errorMessage}`,
      nextSteps: [
        'Check project path',
        'Verify permissions',
        'Check approval system'
      ]
    };
  }
}