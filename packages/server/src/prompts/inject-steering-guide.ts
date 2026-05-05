import { Prompt, PromptMessage } from '@modelcontextprotocol/sdk/types.js';
import { PromptDefinition } from './types.js';
import { ToolContext } from '../types.js';
import { steeringGuideHandler } from '../tools/steering-guide.js';

const prompt: Prompt = {
  name: 'inject-steering-guide',
  title: 'Inject Steering Guide into Context',
  description: 'Injects the complete steering document workflow guide into the conversation context. This provides instructions for creating project-level guidance documents (product.md, tech.md, structure.md) when explicitly requested by the user.'
};

async function handler(args: Record<string, any>, context: ToolContext): Promise<PromptMessage[]> {
  // Call the steering-guide tool to get the full guide
  const toolResponse = await steeringGuideHandler({}, context);
  
  // Extract the guide content from the tool response
  const guide = toolResponse.data?.guide || '';
  const dashboardUrl = toolResponse.data?.dashboardUrl;
  const nextSteps = toolResponse.nextSteps || [];

  const messages: PromptMessage[] = [
    {
      role: 'user',
      content: {
        type: 'text',
        text: `Please review and follow this steering document workflow guide:

${guide}

**Current Context:**
- Project: ${context.projectPath}
${dashboardUrl ? `- Dashboard: ${dashboardUrl}` : '- Dashboard: Please start the dashboard or use VS Code extension "Spec Workflow MCP"'}

**Next Steps:**
${nextSteps.map(step => `- ${step}`).join('\n')}

**Important Instructions:**
1. This guide has been injected into your context for creating steering documents
2. Only proceed if the user explicitly requested steering document creation
3. Follow the sequence exactly: product.md → tech.md → structure.md
4. Read templates from .spec-workflow/templates/ directory
5. Create documents in .spec-workflow/steering/ directory
6. Request approval after each document using the approvals tool
7. Never proceed to the next document without successful approval cleanup

**Note:** Steering documents are NOT part of the standard spec workflow. They are project-level guidance documents that should only be created when explicitly requested by the user. These documents establish vision, architecture, and conventions for established codebases.

Please acknowledge that you've reviewed this steering workflow guide and confirm whether the user wants to create steering documents.`
      }
    }
  ];

  return messages;
}

export const injectSteeringGuidePrompt: PromptDefinition = {
  prompt,
  handler
};