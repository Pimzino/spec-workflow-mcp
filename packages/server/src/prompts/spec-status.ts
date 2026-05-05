import { Prompt, PromptMessage } from '@modelcontextprotocol/sdk/types.js';
import { PromptDefinition } from './types.js';
import { ToolContext } from '../types.js';

const prompt: Prompt = {
  name: 'spec-status',
  title: 'Specification Status Overview',
  description: 'Get comprehensive status overview of specification documents, tasks, and approval workflows. Useful for project tracking and progress reporting.',
  arguments: [
    {
      name: 'specName',
      description: 'Feature name in kebab-case to get status for (optional - if not provided, shows all specs)',
      required: false
    },
    {
      name: 'detailed',
      description: 'Show detailed status including task breakdown and approval history',
      required: false
    }
  ]
};

async function handler(args: Record<string, any>, context: ToolContext): Promise<PromptMessage[]> {
  const { specName, detailed } = args;

  const scope = specName ? `the "${specName}" feature` : 'all specifications in the project';
  const detailLevel = detailed ? 'detailed' : 'summary';

  const messages: PromptMessage[] = [
    {
      role: 'user',
      content: {
        type: 'text',
        text: `Get ${detailLevel} status overview for ${scope}.

**Context:**
- Project: ${context.projectPath}
${specName ? `- Feature: ${specName}` : '- Scope: All specifications'}
- Detail level: ${detailLevel}
${context.dashboardUrl ? `- Dashboard: ${context.dashboardUrl}` : ''}

**Instructions:**
${specName ? 
  `1. Use the spec-status tool with specName "${specName}" to get status information
2. If you need detailed task information, read the tasks.md file directly at .spec-workflow/specs/${specName}/tasks.md
3. Check for any pending approvals using approvals tool with action:'status'` :
  `1. List directory .spec-workflow/specs/ to see all specifications
2. Use the spec-status tool to get status for each specification
3. Provide a consolidated overview of project progress`}

**Status Information Includes:**
- **Document Status**: Which documents exist (requirements, design, tasks)
- **Task Progress**: Completion status and remaining work
- **Approval Status**: Pending, approved, or rejected approvals
- **File Information**: Last modified dates and file sizes
- **Workflow Stage**: Current phase in the spec-driven development process

**Workflow Stages:**
1. **Planning**: Requirements document created and approved
2. **Design**: Design document created and approved  
3. **Implementation**: Tasks defined and implementation in progress
4. **Review**: Implementation complete, awaiting final approval
5. **Complete**: All tasks complete and approved

${detailed ? `**Detailed Information Includes:**
- Individual task breakdown with completion status
- Approval request history and reviewer comments
- File modification timestamps
- Steering document references
- Dependency tracking between specs` : ''}

Please provide a comprehensive status report that helps understand the current state and next steps.`
      }
    }
  ];

  return messages;
}

export const specStatusPrompt: PromptDefinition = {
  prompt,
  handler
};