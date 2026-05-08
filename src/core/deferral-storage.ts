import { promises as fs } from 'fs';
import { join } from 'path';
import { randomUUID } from 'crypto';
import { Deferral } from '../types.js';
import { PathUtils } from './path-utils.js';

/**
 * Storage for deferred decisions using markdown files with YAML frontmatter.
 * Each deferral is stored as a single file in .spec-workflow/deferrals/
 */
export class DeferralStorage {
  private deferralsDir: string;

  constructor(projectPath: string) {
    this.deferralsDir = join(PathUtils.getWorkflowRoot(projectPath), 'deferrals');
  }

  private async ensureDir(): Promise<void> {
    await fs.mkdir(this.deferralsDir, { recursive: true });
  }

  private generateId(): string {
    return 'd-' + randomUUID().replace(/-/g, '').slice(0, 8);
  }

  private toMarkdown(deferral: Deferral): string {
    const frontmatter = [
      '---',
      `id: "${deferral.id}"`,
      `status: "${deferral.status}"`,
      `title: "${deferral.title.replace(/"/g, '\\"')}"`,
      `createdAt: "${deferral.createdAt}"`,
      `updatedAt: "${deferral.updatedAt}"`,
      `resolvedAt: ${deferral.resolvedAt ? `"${deferral.resolvedAt}"` : 'null'}`,
      `originSpec: ${deferral.originSpec ? `"${deferral.originSpec}"` : 'null'}`,
      `originPhase: ${deferral.originPhase ? `"${deferral.originPhase}"` : 'null'}`,
      `revisitTrigger: "${deferral.revisitTrigger.replace(/"/g, '\\"')}"`,
      `tags: [${deferral.tags.map(t => `"${t}"`).join(', ')}]`,
      `resolution: ${deferral.resolution ? `"${deferral.resolution.replace(/"/g, '\\"')}"` : 'null'}`,
      `resolvedInSpec: ${deferral.resolvedInSpec ? `"${deferral.resolvedInSpec}"` : 'null'}`,
      `supersededBy: ${deferral.supersededBy ? `"${deferral.supersededBy}"` : 'null'}`,
      `supersedes: ${deferral.supersedes ? `"${deferral.supersedes}"` : 'null'}`,
      '---',
    ].join('\n');

    return `${frontmatter}

## Context
${deferral.body.context}

## Decision Deferred
${deferral.body.decision}

## Revisit Criteria
${deferral.body.revisitCriteria}
`;
  }

  private parseMarkdown(content: string): Deferral | null {
    const fmMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    if (!fmMatch) return null;

    const fm = fmMatch[1];
    const body = fmMatch[2];

    const getString = (key: string): string | null => {
      const match = fm.match(new RegExp(`^${key}:\\s*(?:"((?:[^"\\\\]|\\\\.)*)"|null)\\s*$`, 'm'));
      if (!match) return null;
      return match[1] !== undefined ? match[1].replace(/\\"/g, '"') : null;
    };

    const getArray = (key: string): string[] => {
      const match = fm.match(new RegExp(`^${key}:\\s*\\[(.*)\\]\\s*$`, 'm'));
      if (!match || !match[1].trim()) return [];
      return match[1].split(',').map(s => s.trim().replace(/^"|"$/g, ''));
    };

    const getSection = (heading: string): string => {
      const regex = new RegExp(`## ${heading}\\n([\\s\\S]*?)(?=\\n## |$)`);
      const match = body.match(regex);
      return match ? match[1].trim() : '';
    };

    const id = getString('id');
    const status = getString('status') as Deferral['status'];
    const title = getString('title');
    if (!id || !status || !title) return null;

    return {
      id,
      status,
      title,
      createdAt: getString('createdAt') || '',
      updatedAt: getString('updatedAt') || '',
      resolvedAt: getString('resolvedAt'),
      originSpec: getString('originSpec'),
      originPhase: getString('originPhase') as Deferral['originPhase'],
      revisitTrigger: getString('revisitTrigger') || '',
      tags: getArray('tags'),
      resolution: getString('resolution'),
      resolvedInSpec: getString('resolvedInSpec'),
      supersededBy: getString('supersededBy'),
      supersedes: getString('supersedes'),
      body: {
        context: getSection('Context'),
        decision: getSection('Decision Deferred'),
        revisitCriteria: getSection('Revisit Criteria'),
      },
    };
  }

  async create(
    deferral: Omit<Deferral, 'id' | 'status' | 'createdAt' | 'updatedAt' | 'resolvedAt' | 'resolution' | 'resolvedInSpec' | 'supersededBy'>,
    supersedes?: string
  ): Promise<string> {
    await this.ensureDir();

    // Generate unique ID with collision check
    let id: string;
    let attempts = 0;
    do {
      id = this.generateId();
      attempts++;
      if (attempts > 10) throw new Error('Failed to generate unique deferral ID after 10 attempts');
    } while (await this.exists(id));

    const now = new Date().toISOString();
    const newDeferral: Deferral = {
      ...deferral,
      id,
      status: 'deferred',
      createdAt: now,
      updatedAt: now,
      resolvedAt: null,
      resolution: null,
      resolvedInSpec: null,
      supersededBy: null,
      supersedes: supersedes || null,
    };

    // If superseding, mark old deferral
    if (supersedes) {
      const old = await this.get(supersedes);
      if (!old) throw new Error(`Cannot supersede: deferral ${supersedes} not found`);
      if (old.status !== 'deferred') throw new Error(`Cannot supersede: deferral ${supersedes} is already ${old.status}`);
      old.status = 'superseded';
      old.supersededBy = id;
      old.updatedAt = now;
      await fs.writeFile(join(this.deferralsDir, `${supersedes}.md`), this.toMarkdown(old), 'utf-8');
    }

    await fs.writeFile(join(this.deferralsDir, `${id}.md`), this.toMarkdown(newDeferral), 'utf-8');
    return id;
  }

  async get(id: string): Promise<Deferral | null> {
    try {
      const content = await fs.readFile(join(this.deferralsDir, `${id}.md`), 'utf-8');
      return this.parseMarkdown(content);
    } catch {
      return null;
    }
  }

  async list(filters?: { status?: string; originSpec?: string; tag?: string }): Promise<Deferral[]> {
    try {
      const files = await fs.readdir(this.deferralsDir);
      const deferrals: Deferral[] = [];

      for (const file of files) {
        if (!file.endsWith('.md')) continue;
        const content = await fs.readFile(join(this.deferralsDir, file), 'utf-8');
        const deferral = this.parseMarkdown(content);
        if (!deferral) continue;

        if (filters?.status && deferral.status !== filters.status) continue;
        if (filters?.originSpec && deferral.originSpec !== filters.originSpec) continue;
        if (filters?.tag && !deferral.tags.includes(filters.tag)) continue;

        deferrals.push(deferral);
      }

      return deferrals.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    } catch {
      return [];
    }
  }

  async resolve(id: string, resolution: string, resolvedInSpec?: string): Promise<void> {
    const deferral = await this.get(id);
    if (!deferral) throw new Error(`Deferral ${id} not found`);
    if (deferral.status !== 'deferred') throw new Error(`Cannot resolve: deferral ${id} is already ${deferral.status}`);

    const now = new Date().toISOString();
    deferral.status = 'resolved';
    deferral.resolution = resolution;
    deferral.resolvedAt = now;
    deferral.updatedAt = now;
    deferral.resolvedInSpec = resolvedInSpec || null;

    await fs.writeFile(join(this.deferralsDir, `${id}.md`), this.toMarkdown(deferral), 'utf-8');
  }

  async update(id: string, updates: {
    title?: string;
    revisitTrigger?: string;
    tags?: string[];
    context?: string;
    decision?: string;
    revisitCriteria?: string;
  }): Promise<void> {
    const deferral = await this.get(id);
    if (!deferral) throw new Error(`Deferral ${id} not found`);

    if (updates.title !== undefined) deferral.title = updates.title;
    if (updates.revisitTrigger !== undefined) deferral.revisitTrigger = updates.revisitTrigger;
    if (updates.tags !== undefined) deferral.tags = updates.tags;
    if (updates.context !== undefined) deferral.body.context = updates.context;
    if (updates.decision !== undefined) deferral.body.decision = updates.decision;
    if (updates.revisitCriteria !== undefined) deferral.body.revisitCriteria = updates.revisitCriteria;
    deferral.updatedAt = new Date().toISOString();

    await fs.writeFile(join(this.deferralsDir, `${id}.md`), this.toMarkdown(deferral), 'utf-8');
  }

  async delete(id: string): Promise<void> {
    const deferral = await this.get(id);
    if (!deferral) throw new Error(`Deferral ${id} not found`);

    // Check if any other deferral references this one
    const all = await this.list();
    for (const d of all) {
      if (d.id === id) continue;
      if (d.supersededBy === id || d.supersedes === id) {
        throw new Error(`Cannot delete: deferral ${d.id} references ${id}`);
      }
    }

    await fs.unlink(join(this.deferralsDir, `${id}.md`));
  }

  private async exists(id: string): Promise<boolean> {
    try {
      await fs.access(join(this.deferralsDir, `${id}.md`));
      return true;
    } catch {
      return false;
    }
  }
}
