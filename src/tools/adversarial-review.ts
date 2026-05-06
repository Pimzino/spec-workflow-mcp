import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { ToolContext, ToolResponse } from '../types.js';
import { PathUtils } from '../core/path-utils.js';
import { promises as fs } from 'fs';
import { join } from 'path';

export const adversarialReviewTool: Tool = {
  name: 'adversarial-review',
  description: `Prepare an adversarial review of a spec phase document or steering document.

# Instructions
Use this tool to set up an adversarial analysis of a requirements, design, tasks, or steering
document. Returns the methodology, output paths, and context needed to generate a tailored
adversarial prompt and execute it via a fresh-context subagent. The agent writes the prompt,
then launches a subagent to execute it — context separation ensures genuinely critical output.`,
  inputSchema: {
    type: 'object',
    properties: {
      specName: {
        type: 'string',
        description: 'Name of the spec to review (kebab-case), or "steering" for steering documents'
      },
      phase: {
        type: 'string',
        description: 'Which document to target (e.g. requirements, design, tasks for specs; product, tech, structure for steering)'
      },
      filePath: {
        type: 'string',
        description: 'Relative path to the target file (optional — used for steering docs whose files live outside the steering directory)'
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
    title: 'Adversarial Review',
    readOnlyHint: false,
  }
};

export async function adversarialReviewHandler(args: any, context: ToolContext): Promise<ToolResponse> {
  const { specName, phase } = args;
  const projectPath = args.projectPath || context.projectPath;

  if (!specName || typeof specName !== 'string') {
    return { success: false, message: 'specName is required and must be a string' };
  }
  if (!phase || typeof phase !== 'string') {
    return { success: false, message: 'phase is required and must be a string' };
  }

  const workflowRoot = PathUtils.getWorkflowRoot(projectPath);

  // Determine paths based on whether this is a steering doc or a spec phase
  const isSteering = specName === 'steering';
  const docDir = isSteering
    ? join(workflowRoot, 'steering')
    : join(workflowRoot, 'specs', specName);
  // For steering docs, filePath may point outside the steering dir (e.g. research/sdd/foo.md)
  const targetFile = isSteering && args.filePath
    ? join(projectPath, args.filePath)
    : join(docDir, `${phase}.md`);
  const reviewsDir = join(docDir, 'reviews');

  // Validate target file exists
  try {
    await fs.access(targetFile);
  } catch {
    return {
      success: false,
      message: `Target file not found: ${targetFile}`
    };
  }

  // Create reviews directory if needed
  await fs.mkdir(reviewsDir, { recursive: true });

  // Determine version by scanning existing files
  const version = await getNextVersion(reviewsDir, phase);
  const versionSuffix = version === 1 ? '' : `-r${version}`;

  const promptOutputPath = join(reviewsDir, `adversarial-prompt-${phase}${versionSuffix}.md`);
  const analysisOutputPath = join(reviewsDir, `adversarial-analysis-${phase}${versionSuffix}.md`);

  // Find existing steering docs and prior phase docs as context
  const steeringDir = join(workflowRoot, 'steering');
  const steeringDocs = isSteering
    ? [] // Don't include the target steering doc as its own context
    : await findExistingFiles(steeringDir, ['product.md', 'tech.md', 'structure.md']);
  const priorPhaseDocs = isSteering
    ? [] // Steering docs don't have phase ordering
    : await findPriorPhaseDocs(docDir, phase);

  // Check for methodology override in settings
  const methodology = await getMethodologyOverride(workflowRoot, 'reviewMethodology') || getAdversarialReviewMethodology();

  return {
    success: true,
    message: `Adversarial review prepared for ${specName}/${phase}.md (version ${version})`,
    data: {
      targetFile,
      promptOutputPath,
      analysisOutputPath,
      version,
      phase,
      steeringDocs,
      priorPhaseDocs,
      methodology
    },
    nextSteps: [
      'Read the target document and understand its content',
      'Generate a tailored adversarial prompt following the methodology',
      `Write the prompt to: ${promptOutputPath}`,
      'Launch a fresh-context subagent with only: "Read and execute the instructions in <prompt-path>"',
      'The subagent will write its analysis to the analysis output path'
    ]
  };
}

async function getNextVersion(reviewsDir: string, phase: string): Promise<number> {
  try {
    const files = await fs.readdir(reviewsDir);
    const pattern = new RegExp(`^adversarial-analysis-${phase}(-r(\\d+))?\\.md$`);
    let maxVersion = 0;

    for (const file of files) {
      const match = file.match(pattern);
      if (match) {
        const ver = match[2] ? parseInt(match[2], 10) : 1;
        if (ver > maxVersion) maxVersion = ver;
      }
    }

    return maxVersion === 0 ? 1 : maxVersion + 1;
  } catch {
    return 1;
  }
}

async function findExistingFiles(dir: string, filenames: string[]): Promise<string[]> {
  const found: string[] = [];
  for (const filename of filenames) {
    const filePath = join(dir, filename);
    try {
      await fs.access(filePath);
      found.push(filePath);
    } catch {
      // File doesn't exist, skip
    }
  }
  return found;
}

async function findPriorPhaseDocs(specDir: string, currentPhase: string): Promise<string[]> {
  const phaseOrder = ['requirements', 'design', 'tasks'];
  const currentIndex = phaseOrder.indexOf(currentPhase);
  const priorPhases = phaseOrder.slice(0, currentIndex);

  return findExistingFiles(specDir, priorPhases.map(p => `${p}.md`));
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

export function getAdversarialReviewMethodology(): string {
  return `# Adversarial Review Methodology

## Technique

This follows the adversarial prompting technique where an AI critiques work in a fresh session
with no collaborative history, producing genuinely critical output rather than defending prior
contributions. The technique relies on **context separation** (fresh session) and **oppositional
framing** (the prompt directs the agent to attack, not validate).

Reference: https://www.fightingwithai.com/prompt-engineering/adversarial-prompting/

## How to Generate the Adversarial Prompt

Write a markdown file containing a prompt for a fresh agent session. The prompt must follow
this structure:

### Opening

- Assign the reviewing agent a **senior expert persona** relevant to the document's domain.
- State clearly that the agent's job is to find weaknesses, not to validate or support.
- Use oppositional framing: "tear apart", "stress-test", "find every gap", etc.

### Analysis Dimensions

Create **3-6 numbered sections**, each targeting a specific aspect of the document. These must
be **tailored to the document's actual content**, not generic. For each section:

- Name the specific topic or decision being targeted.
- Provide 3-5 bullet points with concrete attack angles: assumptions to challenge, failure
  modes to explore, missing considerations to surface, alternatives that were dismissed or ignored.
- Frame bullets as directives, not questions ("Challenge the claim that..." not "Do you think...").

**Phase-specific attack angles:**

| Phase | Primary attack surface | Example angles |
|---|---|---|
| **Requirements** | Completeness, ambiguity, scope | Missing user stories, unstated assumptions, scope creep risk, contradictions between stories, acceptance criteria that can't be tested |
| **Design** | Feasibility, consistency, edge cases | Conflicts with steering docs, unaddressed failure modes, scaling bottlenecks, missing error paths, alternatives not considered |
| **Tasks** | Atomicity, ordering, coverage | Tasks too large or too small, missing dependency edges, gaps between tasks and design, unclear completion criteria, tasks that don't map to any requirement |

If steering docs or prior phase docs exist, read them to ground the attack angles in the
project's actual constraints and decisions.

### Closing Deliverables

Ask the reviewing agent to conclude with:

- **Top N risks/gaps** (scaled to document size — 3 for a short doc, 5 for a long one)
- **Top 3 conclusions to challenge or reverse**, with specific reasoning
- **What's missing** — work that should be done before acting on the document

Include this directive: "Be specific and concrete. Cite failure scenarios, not abstract risks.
If something is actually fine, say so briefly and move on."

### Document Insertion Point

End the prompt by telling the reviewing agent where to write its analysis and providing
the target document path.

## What to Avoid

- **Don't make the prompt generic.** The analysis dimensions must reference specific topics,
  claims, and structures from the target document.
- **Don't include collaborative language.** No "please review" or "what do you think".
  Use directive framing throughout.
- **Don't leak context.** The prompt should not mention that it was generated by another AI
  or that there's a prior session. It should read as if a human architect wrote it.
- **Don't pad with praise directives.** No "highlight what's good". The entire point is
  oppositional analysis.

## Execution

After writing the prompt file, launch a fresh-context subagent. The subagent prompt must be
exactly: "Read and execute the instructions in <path-to-prompt-file>." Do not add any other
context, summary, or instructions.`;
}
