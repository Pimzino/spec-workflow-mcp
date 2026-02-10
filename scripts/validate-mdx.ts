#!/usr/bin/env tsx

import { readdir, readFile, stat } from 'fs/promises';
import { join, relative, resolve } from 'path';
import { validateMarkdownForMdx } from '../src/core/mdx-validator.js';

interface CliOptions {
  projectPath: string;
  specName?: string;
  filePath?: string;
  json: boolean;
}

interface FileIssue {
  filePath: string;
  line: number;
  column: number;
  ruleId: string;
  message: string;
}

function parseArgs(argv: string[]): CliOptions {
  const options: CliOptions = {
    projectPath: process.cwd(),
    json: false,
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];

    if (arg === '--project-path' || arg === '--projectPath') {
      options.projectPath = argv[++i] ?? options.projectPath;
    } else if (arg === '--spec') {
      options.specName = argv[++i];
    } else if (arg === '--file') {
      options.filePath = argv[++i];
    } else if (arg === '--json') {
      options.json = true;
    } else if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    }
  }

  return options;
}

function printHelp(): void {
  console.log(`Usage: npm run validate:mdx -- [options]

Options:
  --project-path <path>  Project root path (default: current directory)
  --spec <name>          Validate markdown files only in a specific spec
  --file <path>          Validate a single markdown file (relative to project root)
  --json                 Output as JSON
  --help, -h             Show this help

Examples:
  npm run validate:mdx
  npm run validate:mdx -- --spec create-listener-feature
  npm run validate:mdx -- --file .spec-workflow/specs/my-spec/requirements.md
`);
}

async function exists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

async function collectMarkdownFiles(dirPath: string): Promise<string[]> {
  if (!(await exists(dirPath))) {
    return [];
  }

  const entries = await readdir(dirPath, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = join(dirPath, entry.name);
    if (entry.isDirectory()) {
      files.push(...await collectMarkdownFiles(fullPath));
      continue;
    }

    if (entry.isFile() && entry.name.toLowerCase().endsWith('.md')) {
      files.push(fullPath);
    }
  }

  return files;
}

async function getFilesToValidate(options: CliOptions): Promise<string[]> {
  const projectPath = resolve(options.projectPath);

  if (options.filePath) {
    const singlePath = resolve(projectPath, options.filePath);
    if (!singlePath.toLowerCase().endsWith('.md')) {
      throw new Error(`--file must point to a .md file: ${options.filePath}`);
    }

    if (!(await exists(singlePath))) {
      throw new Error(`File not found: ${singlePath}`);
    }

    return [singlePath];
  }

  if (options.specName) {
    const specDir = join(projectPath, '.spec-workflow', 'specs', options.specName);
    return collectMarkdownFiles(specDir);
  }

  const specsDir = join(projectPath, '.spec-workflow', 'specs');
  const steeringDir = join(projectPath, '.spec-workflow', 'steering');

  const [specFiles, steeringFiles] = await Promise.all([
    collectMarkdownFiles(specsDir),
    collectMarkdownFiles(steeringDir),
  ]);

  return [...specFiles, ...steeringFiles];
}

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));
  const projectPath = resolve(options.projectPath);

  try {
    const files = await getFilesToValidate(options);
    const issues: FileIssue[] = [];

    for (const filePath of files) {
      const content = await readFile(filePath, 'utf-8');
      const result = await validateMarkdownForMdx(content);

      for (const issue of result.issues) {
        issues.push({
          filePath: relative(projectPath, filePath) || filePath,
          line: issue.line,
          column: issue.column,
          ruleId: issue.ruleId,
          message: issue.message,
        });
      }
    }

    if (options.json) {
      console.log(JSON.stringify({
        valid: issues.length === 0,
        filesChecked: files.length,
        errorCount: issues.length,
        issues,
      }, null, 2));
    } else {
      if (issues.length === 0) {
        console.log(`OK: ${files.length} markdown file(s) checked, no MDX compatibility errors found.`);
      } else {
        for (const issue of issues) {
          console.log(`${issue.filePath}:${issue.line}:${issue.column} [${issue.ruleId}] ${issue.message}`);
        }
        console.log(`\nFound ${issues.length} MDX compatibility error(s) across ${files.length} markdown file(s).`);
      }
    }

    process.exit(issues.length === 0 ? 0 : 1);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (options.json) {
      console.log(JSON.stringify({ valid: false, error: message }, null, 2));
    } else {
      console.error(`Error: ${message}`);
    }
    process.exit(2);
  }
}

main();
