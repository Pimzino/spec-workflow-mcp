import { Prompt, PromptMessage, PromptArgument } from '@modelcontextprotocol/sdk/types.js';
import { ToolContext } from '../types.js';

export interface PromptHandler {
  (args: Record<string, any>, context: ToolContext): Promise<PromptMessage[]>;
}

export interface PromptDefinition {
  prompt: Prompt;
  handler: PromptHandler;
}

export interface PromptResponse {
  messages: PromptMessage[];
}