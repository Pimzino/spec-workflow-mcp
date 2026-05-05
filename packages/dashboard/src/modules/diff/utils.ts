import { DiffResult, DiffLine, DiffChunk, DocumentSnapshot } from '../api/api';

/**
 * Basic diff computation for client-side use (fallback)
 * This is a simple implementation - the server should handle proper diffing
 */
export function computeBasicDiff(oldContent: string, newContent: string): DiffResult {
  const oldLines = oldContent.split('\n');
  const newLines = newContent.split('\n');

  const diffLines: DiffLine[] = [];
  let additions = 0;
  let deletions = 0;
  let changes = 0;

  // Simple line-by-line comparison
  const maxLines = Math.max(oldLines.length, newLines.length);

  for (let i = 0; i < maxLines; i++) {
    const oldLine = oldLines[i];
    const newLine = newLines[i];

    if (oldLine !== undefined && newLine !== undefined) {
      if (oldLine === newLine) {
        diffLines.push({
          type: 'normal',
          oldLineNumber: i + 1,
          newLineNumber: i + 1,
          content: oldLine
        });
      } else {
        changes++;
        diffLines.push({
          type: 'delete',
          oldLineNumber: i + 1,
          content: oldLine
        });
        diffLines.push({
          type: 'add',
          newLineNumber: i + 1,
          content: newLine
        });
      }
    } else if (oldLine !== undefined) {
      deletions++;
      diffLines.push({
        type: 'delete',
        oldLineNumber: i + 1,
        content: oldLine
      });
    } else if (newLine !== undefined) {
      additions++;
      diffLines.push({
        type: 'add',
        newLineNumber: i + 1,
        content: newLine
      });
    }
  }

  return {
    additions,
    deletions,
    changes,
    chunks: [{
      oldStart: 1,
      oldLines: oldLines.length,
      newStart: 1,
      newLines: newLines.length,
      lines: diffLines
    }]
  };
}

/**
 * Get diff statistics from a DiffResult
 */
export function getDiffStats(diff: DiffResult) {
  return {
    additions: diff.additions,
    deletions: diff.deletions,
    changes: diff.changes,
    total: diff.additions + diff.deletions + diff.changes,
    chunks: diff.chunks.length
  };
}

/**
 * Format a snapshot timestamp for display
 */
export function formatSnapshotTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) {
    return 'Just now';
  } else if (diffMinutes < 60) {
    return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  } else if (diffDays < 7) {
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  } else {
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}

/**
 * Get a human-readable description of the snapshot trigger
 */
export function getSnapshotTriggerDescription(trigger: DocumentSnapshot['trigger']): string {
  switch (trigger) {
    case 'initial':
      return 'Initial version';
    case 'revision_requested':
      return 'Before revision';
    case 'approved':
      return 'Approved version';
    case 'manual':
      return 'Manual snapshot';
    default:
      return trigger;
  }
}

/**
 * Get color scheme for snapshot trigger
 */
export function getSnapshotTriggerColor(trigger: DocumentSnapshot['trigger']): {
  bg: string;
  text: string;
  border: string;
} {
  switch (trigger) {
    case 'initial':
      return {
        bg: 'bg-blue-50 dark:bg-blue-900/20',
        text: 'text-blue-700 dark:text-blue-300',
        border: 'border-blue-200 dark:border-blue-800'
      };
    case 'revision_requested':
      return {
        bg: 'bg-orange-50 dark:bg-orange-900/20',
        text: 'text-orange-700 dark:text-orange-300',
        border: 'border-orange-200 dark:border-orange-800'
      };
    case 'approved':
      return {
        bg: 'bg-green-50 dark:bg-green-900/20',
        text: 'text-green-700 dark:text-green-300',
        border: 'border-green-200 dark:border-green-800'
      };
    case 'manual':
      return {
        bg: 'bg-gray-50 dark:bg-gray-900/20',
        text: 'text-gray-700 dark:text-gray-300',
        border: 'border-gray-200 dark:border-gray-800'
      };
    default:
      return {
        bg: 'bg-gray-50 dark:bg-gray-900/20',
        text: 'text-gray-700 dark:text-gray-300',
        border: 'border-gray-200 dark:border-gray-800'
      };
  }
}

/**
 * Create a version selector option label
 */
export function createVersionLabel(snapshot: DocumentSnapshot): string {
  const trigger = getSnapshotTriggerDescription(snapshot.trigger);
  const time = formatSnapshotTimestamp(snapshot.timestamp);
  const approvalInfo = snapshot.approvalTitle ? ` - ${snapshot.approvalTitle}` : '';
  return `v${snapshot.version} - ${trigger}${approvalInfo} (${time})`;
}

/**
 * Check if a diff has any changes
 */
export function hasDiffChanges(diff: DiffResult): boolean {
  return diff.additions > 0 || diff.deletions > 0 || diff.changes > 0;
}

/**
 * Filter diff lines by type
 */
export function filterDiffLines(diff: DiffResult, types: DiffLine['type'][]): DiffLine[] {
  return diff.chunks.flatMap(chunk =>
    chunk.lines.filter(line => types.includes(line.type))
  );
}

/**
 * Get context lines around changes (for unified view)
 */
export function getContextLines(lines: DiffLine[], contextSize: number = 3): DiffLine[] {
  const result: DiffLine[] = [];
  const changeIndices: number[] = [];

  // Find all change lines
  lines.forEach((line, index) => {
    if (line.type !== 'normal') {
      changeIndices.push(index);
    }
  });

  if (changeIndices.length === 0) {
    return lines; // No changes, return all lines
  }

  // Add context around each change
  const includedIndices = new Set<number>();

  changeIndices.forEach(changeIndex => {
    const start = Math.max(0, changeIndex - contextSize);
    const end = Math.min(lines.length - 1, changeIndex + contextSize);

    for (let i = start; i <= end; i++) {
      includedIndices.add(i);
    }
  });

  // Convert to sorted array and build result
  const sortedIndices = Array.from(includedIndices).sort((a, b) => a - b);

  sortedIndices.forEach(index => {
    result.push(lines[index]);
  });

  return result;
}

/**
 * Map line numbers between old and new versions
 */
export function mapLineNumbers(diff: DiffResult): {
  oldToNew: Map<number, number>;
  newToOld: Map<number, number>;
} {
  const oldToNew = new Map<number, number>();
  const newToOld = new Map<number, number>();

  diff.chunks.forEach(chunk => {
    chunk.lines.forEach(line => {
      if (line.oldLineNumber && line.newLineNumber) {
        oldToNew.set(line.oldLineNumber, line.newLineNumber);
        newToOld.set(line.newLineNumber, line.oldLineNumber);
      }
    });
  });

  return { oldToNew, newToOld };
}