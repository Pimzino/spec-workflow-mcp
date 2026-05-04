import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { ToolContext, ToolResponse } from '../types.js';
import { PathUtils } from '../core/path-utils.js';
import { promises as fs } from 'fs';
import { join } from 'path';

export const adversarialResponseTool: Tool = {
  name: 'adversarial-response',
  description: `Find the latest adversarial analysis for a spec phase or steering document and return response instructions.

# Instructions
Use this tool when responding to an adversarial review — typically triggered by a revision
comment on an approval request. Returns the path to the latest adversarial analysis and
structured instructions for evaluating findings.`,
  inputSchema: {
    type: 'object',
    properties: {
      specName: {
        type: 'string',
        description: 'Name of the spec being reviewed (kebab-case), or "steering" for steering documents'
      },
      phase: {
        type: 'string',
        description: 'Which document was reviewed (e.g. requirements, design, tasks for specs; product, tech, structure for steering)'
      },
      version: {
        type: 'number',
        description: 'Specific analysis version to respond to (e.g. 1, 2, 3). If omitted, uses the latest available version.'
      },
      projectPath: {
        type: 'string',
        description: 'Absolute path to the project root (optional - uses server context path if not provided)'
      }
    },
    required: ['specName', 'phase'],
    additionalProperties: false
  },
  annotations: {
    title: 'Adversarial Response',
    readOnlyHint: true,
  }
};

export async function adversarialResponseHandler(args: any, context: ToolContext): Promise<ToolResponse> {
  const { specName, phase } = args;
  const requestedVersion: number | undefined = args.version;
  const projectPath = args.projectPath || context.projectPath;

  if (!specName || typeof specName !== 'string') {
    return { success: false, message: 'specName is required and must be a string' };
  }
  if (!phase || typeof phase !== 'string') {
    return { success: false, message: 'phase is required and must be a string' };
  }

  const workflowRoot = PathUtils.getWorkflowRoot(projectPath);
  const isSteering = specName === 'steering';
  const docDir = isSteering
    ? join(workflowRoot, 'steering')
    : join(workflowRoot, 'specs', specName);
  const reviewsDir = join(docDir, 'reviews');
  const targetFile = isSteering && args.filePath
    ? join(projectPath, args.filePath)
    : join(docDir, `${phase}.md`);

  // If a specific version was requested, look for that exact file
  if (requestedVersion) {
    const versionSuffix = requestedVersion === 1 ? '' : `-r${requestedVersion}`;
    const expectedFile = join(reviewsDir, `adversarial-analysis-${phase}${versionSuffix}.md`);
    try {
      await fs.access(expectedFile);
    } catch {
      return {
        success: false,
        message: `Adversarial analysis v${requestedVersion} not found for ${specName}/${phase}. Expected file: ${expectedFile}. The background review may still be running, or it may have failed.`
      };
    }

    const methodology = await getMethodologyOverride(workflowRoot, 'responseMethodology') || getAdversarialResponseMethodology();
    return {
      success: true,
      message: `Found adversarial analysis v${requestedVersion} for ${specName}/${phase}`,
      data: {
        analysisFile: expectedFile,
        targetFile,
        version: requestedVersion,
        methodology
      },
      nextSteps: [
        `Read the adversarial analysis at: ${expectedFile}`,
        'Evaluate each finding using the structured format',
        'Present your assessment to the user for discussion',
        'After alignment, update the document and resubmit for approval'
      ]
    };
  }

  // No version specified — find the latest adversarial analysis
  let latestAnalysis: string | null = null;
  let latestVersion = 0;

  try {
    const files = await fs.readdir(reviewsDir);
    const pattern = new RegExp(`^adversarial-analysis-${phase}(-r(\\d+))?\\.md$`);

    for (const file of files) {
      const match = file.match(pattern);
      if (match) {
        const ver = match[2] ? parseInt(match[2], 10) : 1;
        if (ver > latestVersion) {
          latestVersion = ver;
          latestAnalysis = join(reviewsDir, file);
        }
      }
    }
  } catch {
    return {
      success: false,
      message: `No reviews directory found at ${reviewsDir}. Has an adversarial review been run for this spec phase?`
    };
  }

  if (!latestAnalysis) {
    return {
      success: false,
      message: `No adversarial analysis found for ${specName}/${phase}. Run adversarial-review first.`
    };
  }

  // Check for methodology override in settings
  const methodology = await getMethodologyOverride(workflowRoot, 'responseMethodology') || getAdversarialResponseMethodology();

  return {
    success: true,
    message: `Found adversarial analysis v${latestVersion} for ${specName}/${phase}`,
    data: {
      analysisFile: latestAnalysis,
      targetFile,
      version: latestVersion,
      methodology
    },
    nextSteps: [
      `Read the adversarial analysis at: ${latestAnalysis}`,
      'Evaluate each finding using the structured format',
      'Present your assessment to the user for discussion',
      'After alignment, update the document and resubmit for approval'
    ]
  };
}

async function getMethodologyOverride(workflowRoot: string, key: string): Promise<string | null> {
  try {
    const raw = await fs.readFile(join(workflowRoot, 'adversarial-settings.json'), 'utf-8');
    const settings = JSON.parse(raw);
    const value = settings[key];
    return typeof value === 'string' && value.trim() ? value : null;
  } catch {
    return null;
  }
}

export function getAdversarialResponseMethodology(): string {
  return `# Responding to an Adversarial Review

## Instructions

Read the adversarial analysis and assess each finding on its merits. Be confident in your
original proposal, but do not dismiss findings simply because they challenge your decisions.

### For each finding, present your assessment in this format:

- **Finding**: (one-line summary)
- **Assessment**: Agree / Partially Agree / Disagree
- **Reasoning**: (concrete justification — reference steering docs, requirements, or design constraints where relevant)
- **Proposed action**: (specific change to the document, or why no change is needed)

### Discussion

Present the full assessment to the user. Do not make changes to the document until the user
confirms which points to address.

### Update and resubmit

After alignment with the user, update the document to incorporate the agreed-upon changes
and resubmit for approval via the approvals tool.`;
}
