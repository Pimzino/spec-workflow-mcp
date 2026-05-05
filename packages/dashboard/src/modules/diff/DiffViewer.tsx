import React, { useMemo } from 'react';
import { DiffResult, DiffLine, DiffChunk } from '../api/api';
import { diffWords, diffChars } from 'diff';

export interface DiffViewerProps {
  diff: DiffResult;
  viewMode: 'unified' | 'split' | 'inline';
  showLineNumbers?: boolean;
  highlightSyntax?: boolean;
  onLineComment?: (lineNumber: number, side: 'old' | 'new') => void;
  className?: string;
}

interface ProcessedLine extends DiffLine {
  isVisible: boolean;
  diffLineNumber: number;
}

export function DiffViewer({
  diff,
  viewMode,
  showLineNumbers = true,
  highlightSyntax = false,
  onLineComment,
  className = ''
}: DiffViewerProps) {

  const processedLines = useMemo(() => {
    const lines: ProcessedLine[] = [];
    let diffLineNumber = 1;

    diff.chunks.forEach(chunk => {
      chunk.lines.forEach(line => {
        lines.push({
          ...line,
          isVisible: true,
          diffLineNumber: diffLineNumber++
        });
      });
    });

    return lines;
  }, [diff]);

  const renderLineContent = (line: ProcessedLine) => {
    const content = line.content || '';

    if (highlightSyntax) {
      // TODO: Add syntax highlighting for markdown if needed
      return <pre className="whitespace-pre-wrap font-mono text-sm text-[var(--text-primary)]">{content}</pre>;
    }

    return (
      <pre className="whitespace-pre-wrap font-mono text-sm break-words overflow-x-auto text-[var(--text-primary)]">
        {content}
      </pre>
    );
  };

  const renderLineNumber = (lineNumber?: number) => (
    <div className="w-12 px-2 py-1 text-xs text-[var(--text-faint)] font-mono tabular-nums text-right border-r border-[var(--border-default)] bg-[var(--surface-inset)] select-none flex-shrink-0">
      {lineNumber || ''}
    </div>
  );

  const getLineClassName = (line: ProcessedLine, isLeft = false) => {
    const baseClass = "flex min-h-[1.5rem] hover:bg-[var(--surface-hover)]";

    switch (line.type) {
      case 'add':
        return `${baseClass} bg-[var(--status-success-muted)] ${!isLeft ? 'border-l-2 border-[var(--status-success)]' : ''}`;
      case 'delete':
        return `${baseClass} bg-[var(--status-error-muted)] ${!isLeft ? 'border-l-2 border-[var(--status-error)]' : ''}`;
      default:
        return `${baseClass} bg-[var(--surface-panel)]`;
    }
  };

  const getLineSymbol = (type: DiffLine['type']) => {
    switch (type) {
      case 'add': return '+';
      case 'delete': return '-';
      default: return ' ';
    }
  };

  // Inline view with character-level diff
  const renderInlineContent = (line: ProcessedLine) => {
    if (line.type === 'normal') {
      return <span className="text-[var(--text-primary)]">{line.content}</span>;
    }

    // Find corresponding old and new lines for character diff
    const oldContent = line.type === 'delete' ? line.content : '';
    const newContent = line.type === 'add' ? line.content : '';

    if (line.type === 'add') {
      return <span className="bg-[var(--status-success-muted)] text-[var(--status-success)]">{line.content}</span>;
    }

    if (line.type === 'delete') {
      return <span className="bg-[var(--status-error-muted)] text-[var(--status-error)] line-through">{line.content}</span>;
    }

    return <span>{line.content}</span>;
  };

  if (viewMode === 'inline') {
    // Group changes together and show with context
    const contextLines = 3;
    const visibleLines = processedLines.filter((line, index) => {
      if (line.type !== 'normal') return true;

      // Check if within context of any change
      for (let i = Math.max(0, index - contextLines); i <= Math.min(processedLines.length - 1, index + contextLines); i++) {
        if (processedLines[i].type !== 'normal') return true;
      }
      return false;
    });

    return (
      <div className={`border border-[var(--border-default)] rounded-lg overflow-hidden ${className}`}>
        <div className="bg-[var(--surface-inset)] px-3 py-2 border-b border-[var(--border-default)]">
          <div className="text-sm text-[var(--text-muted)] font-mono tabular-nums">
            <span className="text-[var(--status-success)]">+{diff.additions}</span>
            <span className="mx-2">-</span>
            <span className="text-[var(--status-error)]">-{diff.deletions}</span>
            {diff.changes > 0 && (
              <>
                <span className="mx-2">•</span>
                <span className="text-[var(--status-info)]">{diff.changes} changes</span>
              </>
            )}
            <span className="mx-2">•</span>
            <span className="text-[var(--text-faint)]">Character-level view</span>
          </div>
        </div>

        <div className="divide-y divide-[var(--border-subtle)]">
          {visibleLines.map((line, index) => (
            <div key={index} className={`flex min-h-[1.5rem] ${line.type === 'normal' ? 'bg-[var(--surface-panel)]' : line.type === 'add' ? 'bg-[var(--status-success-muted)]' : 'bg-[var(--status-error-muted)]'}`}>
              {showLineNumbers && renderLineNumber(line.newLineNumber || line.oldLineNumber)}
              <div className="flex-1 px-3 py-1 min-w-0">
                <pre className="whitespace-pre-wrap font-mono text-sm break-words overflow-x-auto">
                  {renderInlineContent(line)}
                </pre>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (viewMode === 'unified') {
    return (
      <div className={`border border-[var(--border-default)] rounded-lg overflow-hidden ${className}`}>
        <div className="bg-[var(--surface-inset)] px-3 py-2 border-b border-[var(--border-default)]">
          <div className="text-sm text-[var(--text-muted)] font-mono tabular-nums">
            <span className="text-[var(--status-success)]">+{diff.additions}</span>
            <span className="mx-2">-</span>
            <span className="text-[var(--status-error)]">-{diff.deletions}</span>
            {diff.changes > 0 && (
              <>
                <span className="mx-2">•</span>
                <span className="text-[var(--status-info)]">{diff.changes} changes</span>
              </>
            )}
          </div>
        </div>

        <div className="divide-y divide-[var(--border-subtle)]">
          {processedLines.map((line, index) => (
            <div key={index} className={getLineClassName(line)}>
              {showLineNumbers && (
                <>
                  {renderLineNumber(line.oldLineNumber)}
                  {renderLineNumber(line.newLineNumber)}
                </>
              )}
              <div className="w-6 px-2 py-1 text-xs text-[var(--text-faint)] font-mono text-center bg-[var(--surface-inset)] border-r border-[var(--border-default)] select-none flex-shrink-0">
                {getLineSymbol(line.type)}
              </div>
              <div className="flex-1 px-3 py-1 min-w-0">
                {renderLineContent(line)}
              </div>
              {onLineComment && (
                <button
                  onClick={() => onLineComment(line.newLineNumber || line.oldLineNumber || 0, line.type === 'delete' ? 'old' : 'new')}
                  className="w-8 h-6 mx-2 my-1 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:opacity-100 text-[var(--text-faint)] hover:text-[var(--accent-primary)] transition-opacity"
                  title="Add comment"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Split view
  const leftLines = processedLines.filter(line => line.type !== 'add');
  const rightLines = processedLines.filter(line => line.type !== 'delete');

  return (
    <div className={`border border-[var(--border-default)] rounded-lg overflow-hidden ${className}`}>
      <div className="bg-[var(--surface-inset)] px-3 py-2 border-b border-[var(--border-default)]">
        <div className="text-sm text-[var(--text-muted)] font-mono tabular-nums">
          <span className="text-[var(--status-success)]">+{diff.additions}</span>
          <span className="mx-2">-</span>
          <span className="text-[var(--status-error)]">-{diff.deletions}</span>
          {diff.changes > 0 && (
            <>
              <span className="mx-2">•</span>
              <span className="text-[var(--status-info)]">{diff.changes} changes</span>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 divide-x divide-[var(--border-default)]">
        {/* Left side (old content) */}
        <div className="bg-[var(--surface-panel)]">
          <div className="bg-[var(--status-error-muted)] px-3 py-1 text-xs font-medium text-[var(--status-error)] border-b border-[var(--border-default)]">
            Original
          </div>
          <div className="divide-y divide-[var(--border-subtle)]">
            {leftLines.map((line, index) => (
              <div key={index} className={getLineClassName(line, true)}>
                {showLineNumbers && renderLineNumber(line.oldLineNumber)}
                <div className="flex-1 px-3 py-1 min-w-0">
                  {renderLineContent(line)}
                </div>
                {onLineComment && line.type === 'delete' && (
                  <button
                    onClick={() => onLineComment(line.oldLineNumber || 0, 'old')}
                    className="w-8 h-6 mx-2 my-1 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:opacity-100 text-[var(--text-faint)] hover:text-[var(--accent-primary)] transition-opacity"
                    title="Add comment"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right side (new content) */}
        <div className="bg-[var(--surface-panel)]">
          <div className="bg-[var(--status-success-muted)] px-3 py-1 text-xs font-medium text-[var(--status-success)] border-b border-[var(--border-default)]">
            Updated
          </div>
          <div className="divide-y divide-[var(--border-subtle)]">
            {rightLines.map((line, index) => (
              <div key={index} className={getLineClassName(line)}>
                {showLineNumbers && renderLineNumber(line.newLineNumber)}
                <div className="flex-1 px-3 py-1 min-w-0">
                  {renderLineContent(line)}
                </div>
                {onLineComment && line.type === 'add' && (
                  <button
                    onClick={() => onLineComment(line.newLineNumber || 0, 'new')}
                    className="w-8 h-6 mx-2 my-1 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:opacity-100 text-[var(--text-faint)] hover:text-[var(--accent-primary)] transition-opacity"
                    title="Add comment"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}