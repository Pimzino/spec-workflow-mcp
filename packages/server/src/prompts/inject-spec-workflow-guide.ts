import { Prompt, PromptMessage } from '@modelcontextprotocol/sdk/types.js';
import { PromptDefinition } from './types.js';
import { ToolContext } from '../types.js';
import { specWorkflowGuideHandler } from '../tools/spec-workflow-guide.js';

const prompt: Prompt = {
  name: 'inject-spec-workflow-guide',
  title: 'Inject Spec Workflow Guide into Context',
  description: 'Injects the complete spec-driven development workflow guide into the conversation context. This provides immediate access to all workflow phases, tools, and best practices without requiring separate tool calls.'
};

async function handler(args: Record<string, any>, context: ToolContext): Promise<PromptMessage[]> {
  // Call the spec-workflow-guide tool to get the full guide
  const toolResponse = await specWorkflowGuideHandler({}, context);
  
  // Extract the guide content from the tool response
  const guide = toolResponse.data?.guide || '';
  const dashboardUrl = toolResponse.data?.dashboardUrl;
  const nextSteps = toolResponse.nextSteps || [];

  const messages: PromptMessage[] = [
    {
      role: 'user',
      content: {
        type: 'text',
        text: `Please review and follow this comprehensive spec-driven development workflow guide:

${guide}

**Current Context:**
- Project: ${context.projectPath}
${dashboardUrl ? `- Dashboard: ${dashboardUrl}` : '- Dashboard: Please start the dashboard or use VS Code extension "Spec Workflow MCP"'}

**Next Steps:**
${nextSteps.map(step => `- ${step}`).join('\n')}

**Important Instructions:**
1. This guide has been injected into your context for immediate reference
2. Follow the workflow sequence exactly: Requirements → Design → Tasks → Implementation
3. Use the MCP tools mentioned in the guide to execute each phase
4. Always request approval between phases using the approvals tool
5. Never proceed to the next phase without successful approval cleanup

Please acknowledge that you've reviewed this workflow guide and are ready to help with spec-driven development.`
      }
    }
  ];

  return messages;
}

export const injectSpecWorkflowGuidePrompt: PromptDefinition = {
  prompt,
  handler
};