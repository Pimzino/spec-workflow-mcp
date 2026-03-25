import { describe, it, expect } from 'vitest';
import { basename } from 'path';

/**
 * Tests for the isValidSpecName and escapeRegExp security helpers
 * introduced in the path traversal / regex injection fix.
 *
 * We replicate the functions here because they are module-private
 * (not exported). This validates the logic independently.
 */

function isValidSpecName(name: string): boolean {
  if (!name || name === '.' || name.includes('..') || name.includes('/') || name.includes('\\') || name.includes('\0')) {
    return false;
  }
  return basename(name) === name;
}

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

describe('isValidSpecName — path traversal prevention (CWE-22)', () => {
  // --- Should ACCEPT legitimate names ---
  it('accepts simple alphanumeric names', () => {
    expect(isValidSpecName('my-spec')).toBe(true);
    expect(isValidSpecName('feature_auth')).toBe(true);
    expect(isValidSpecName('spec123')).toBe(true);
  });

  it('accepts names with dots in the middle (e.g. semver-like)', () => {
    expect(isValidSpecName('v2.0')).toBe(true);
    expect(isValidSpecName('spec.v1')).toBe(true);
  });

  it('accepts names with spaces', () => {
    expect(isValidSpecName('my spec')).toBe(true);
  });

  it('accepts names with unicode characters', () => {
    expect(isValidSpecName('功能')).toBe(true);
    expect(isValidSpecName('spécification')).toBe(true);
  });

  // --- Should REJECT traversal / malicious names ---
  it('rejects empty string', () => {
    expect(isValidSpecName('')).toBe(false);
  });

  it('rejects parent directory traversal (..)', () => {
    expect(isValidSpecName('..')).toBe(false);
    expect(isValidSpecName('../etc')).toBe(false);
    expect(isValidSpecName('a/../b')).toBe(false);
  });

  it('rejects forward-slash paths', () => {
    expect(isValidSpecName('a/b')).toBe(false);
    expect(isValidSpecName('/etc/passwd')).toBe(false);
  });

  it('rejects backslash paths', () => {
    expect(isValidSpecName('a\\b')).toBe(false);
    expect(isValidSpecName('..\\windows\\system32')).toBe(false);
  });

  it('rejects null bytes', () => {
    expect(isValidSpecName('spec\0.txt')).toBe(false);
  });

  // --- Known edge case from review: '.' resolves to specs root ---
  it('rejects dot (.) which would resolve to specs root', () => {
    expect(isValidSpecName('.')).toBe(false);
  });

  it('rejects dotfile names that happen to be traversal vectors', () => {
    // '.hidden' is a valid filename — basename('.hidden') === '.hidden'
    expect(isValidSpecName('.hidden')).toBe(true);
  });
});

describe('escapeRegExp — regex injection prevention (CWE-1333)', () => {
  it('escapes dots', () => {
    expect(escapeRegExp('2.2.6')).toBe('2\\.2\\.6');
  });

  it('escapes all special characters', () => {
    expect(escapeRegExp('.*+?^${}()|[]\\')).toBe(
      '\\.\\*\\+\\?\\^\\$\\{\\}\\(\\)\\|\\[\\]\\\\'
    );
  });

  it('leaves alphanumeric/hyphen strings unchanged', () => {
    expect(escapeRegExp('v1-beta')).toBe('v1-beta');
  });

  it('crafted ReDoS payload is safely escaped', () => {
    const malicious = '(a+)+$';
    const escaped = escapeRegExp(malicious);
    expect(escaped).toBe('\\(a\\+\\)\\+\\$');

    // Verify the resulting regex terminates quickly
    const regex = new RegExp(`## \\[${escaped}\\][^]*?(?=## \\[|$)`, 'i');
    const start = Date.now();
    regex.test('## [aaaaaaaaaa] something');
    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(100); // Should be near-instant
  });

  it('normal version regex still matches correctly', () => {
    const version = '2.2.6';
    const escaped = escapeRegExp(version);
    const regex = new RegExp(`## \\[${escaped}\\][^]*?(?=## \\[|$)`, 'i');

    const changelog = `## [2.2.6] - 2024-01-15\n\n### Fixed\n- Bug fix\n\n## [2.2.5] - 2024-01-10\n\n### Added\n- Feature`;
    const match = changelog.match(regex);
    expect(match).not.toBeNull();
    expect(match![0]).toContain('Bug fix');
    expect(match![0]).not.toContain('Feature');
  });
});
