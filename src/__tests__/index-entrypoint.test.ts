import { describe, expect, it } from 'vitest';
import { mkdtempSync, realpathSync, symlinkSync, writeFileSync } from 'fs';
import { join, resolve } from 'path';
import { tmpdir } from 'os';
import { resolveEntrypoint } from '../index.js';

describe('resolveEntrypoint', () => {
  it('returns undefined for undefined input', () => {
    expect(resolveEntrypoint(undefined)).toBeUndefined();
  });

  it('falls back to path.resolve when path does not exist', () => {
    const missing = './definitely-missing-entrypoint.js';
    expect(resolveEntrypoint(missing)).toBe(resolve(missing));
  });

  it('resolves symlinks to their real path', () => {
    const dir = mkdtempSync(join(tmpdir(), 'specwf-entrypoint-'));
    const target = join(dir, 'target.js');
    const link = join(dir, 'link.js');
    writeFileSync(target, 'console.log("ok");', 'utf-8');
    symlinkSync(target, link);

    expect(resolveEntrypoint(link)).toBe(realpathSync(target));
  });
});
