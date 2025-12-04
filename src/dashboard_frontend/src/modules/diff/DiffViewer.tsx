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
      return <pre className="whitespace-pre-wrap font-mono text-sm">{content}</pre>;
    }

    return (
      <pre className="whitespace-pre-wrap font-mono text-sm break-words overflow-x-auto">
        {content}
      </pre>
    );
  };

  const renderLineNumber = (lineNumber?: number) => (
    <div className="w-12 px-2 py-1 text-xs text-gray-400 dark:text-gray-500 text-right border-r border-gray-200/50 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/30 select-none flex-shrink-0 font-mono">
      {lineNumber || ''}
    </div>
  );

  const getLineClassName = (line: ProcessedLine, isLeft = false) => {
    const baseClass = "flex min-h-[1.5rem] transition-colors duration-150";

    switch (line.type) {
      case 'add':
        return `${baseClass} bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/15 ${!isLeft ? 'border-l-2 border-emerald-400' : ''} hover:from-emerald-100 hover:to-green-100 dark:hover:from-emerald-900/30 dark:hover:to-green-900/25`;
      case 'delete':
        return `${baseClass} bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/15 ${!isLeft ? 'border-l-2 border-red-400' : ''} hover:from-red-100 hover:to-rose-100 dark:hover:from-red-900/30 dark:hover:to-rose-900/25`;
      default:
        return `${baseClass} bg-white dark:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-700/50`;
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
      return <span className="text-gray-900 dark:text-gray-100">{line.content}</span>;
    }

    // Find corresponding old and new lines for character diff
    const oldContent = line.type === 'delete' ? line.content : '';
    const newContent = line.type === 'add' ? line.content : '';

    if (line.type === 'add') {
      return <span className="bg-gradient-to-r from-emerald-100 to-green-100 dark:from-emerald-900/40 dark:to-green-900/30 text-emerald-800 dark:text-emerald-200 px-0.5 rounded">{line.content}</span>;
    }

    if (line.type === 'delete') {
      return <span className="bg-gradient-to-r from-red-100 to-rose-100 dark:from-red-900/40 dark:to-rose-900/30 text-red-800 dark:text-red-200 line-through px-0.5 rounded">{line.content}</span>;
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
      <div className={`glass-card rounded-xl overflow-hidden ${className}`}>
        <div className="glass px-4 py-3 border-b border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-center gap-3 text-sm">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-emerald-400 to-green-500 text-white shadow-sm shadow-green-500/25">
              +{diff.additions}
            </span>
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-red-400 to-rose-500 text-white shadow-sm shadow-red-500/25">
              -{diff.deletions}
            </span>
            {diff.changes > 0 && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-purple-400 to-indigo-500 text-white shadow-sm shadow-purple-500/25">
                {diff.changes} changes
              </span>
            )}
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto">Character-level view</span>
          </div>
        </div>

        <div className="divide-y divide-gray-100/50 dark:divide-gray-700/30">
          {visibleLines.map((line, index) => (
            <div key={index} className={`flex min-h-[1.5rem] transition-colors duration-150 ${line.type === 'normal' ? 'bg-white dark:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-700/50' : line.type === 'add' ? 'bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/15' : 'bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/15'}`}>
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
      <div className={`glass-card rounded-xl overflow-hidden ${className}`}>
        <div className="glass px-4 py-3 border-b border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-center gap-3 text-sm">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-emerald-400 to-green-500 text-white shadow-sm shadow-green-500/25">
              +{diff.additions}
            </span>
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-red-400 to-rose-500 text-white shadow-sm shadow-red-500/25">
              -{diff.deletions}
            </span>
            {diff.changes > 0 && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-purple-400 to-indigo-500 text-white shadow-sm shadow-purple-500/25">
                {diff.changes} changes
              </span>
            )}
          </div>
        </div>

        <div className="divide-y divide-gray-100/50 dark:divide-gray-700/30">
          {processedLines.map((line, index) => (
            <div key={index} className={getLineClassName(line)}>
              {showLineNumbers && (
                <>
                  {renderLineNumber(line.oldLineNumber)}
                  {renderLineNumber(line.newLineNumber)}
                </>
              )}
              <div className={`w-6 px-2 py-1 text-xs text-center select-none flex-shrink-0 font-mono font-bold ${
                line.type === 'add'
                  ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-900/20'
                  : line.type === 'delete'
                  ? 'text-red-600 dark:text-red-400 bg-red-50/50 dark:bg-red-900/20'
                  : 'text-gray-400 dark:text-gray-500 bg-gray-50/50 dark:bg-gray-800/30'
              } border-r border-gray-200/50 dark:border-gray-700/50`}>
                {getLineSymbol(line.type)}
              </div>
              <div className="flex-1 px-3 py-1 min-w-0">
                {renderLineContent(line)}
              </div>
              {onLineComment && (
                <button
                  onClick={() => onLineComment(line.newLineNumber || line.oldLineNumber || 0, line.type === 'delete' ? 'old' : 'new')}
                  className="w-8 h-6 mx-2 my-1 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:opacity-100 text-gray-400 hover:text-purple-500 transition-all duration-200 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20"
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
    <div className={`glass-card rounded-xl overflow-hidden ${className}`}>
      <div className="glass px-4 py-3 border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="flex items-center gap-3 text-sm">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-emerald-400 to-green-500 text-white shadow-sm shadow-green-500/25">
            +{diff.additions}
          </span>
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-red-400 to-rose-500 text-white shadow-sm shadow-red-500/25">
            -{diff.deletions}
          </span>
          {diff.changes > 0 && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-purple-400 to-indigo-500 text-white shadow-sm shadow-purple-500/25">
              {diff.changes} changes
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 divide-x divide-gray-200/50 dark:divide-gray-700/30">
        {/* Left side (old content) */}
        <div className="bg-white/50 dark:bg-gray-900/30">
          <div className="bg-gradient-to-r from-red-100 to-rose-100 dark:from-red-900/30 dark:to-rose-900/20 px-4 py-2 text-xs font-semibold text-red-700 dark:text-red-300 border-b border-gray-200/50 dark:border-gray-700/50 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            Original
          </div>
          <div className="divide-y divide-gray-100/50 dark:divide-gray-700/30">
            {leftLines.map((line, index) => (
              <div key={index} className={getLineClassName(line, true)}>
                {showLineNumbers && renderLineNumber(line.oldLineNumber)}
                <div className="flex-1 px-3 py-1 min-w-0">
                  {renderLineContent(line)}
                </div>
                {onLineComment && line.type === 'delete' && (
                  <button
                    onClick={() => onLineComment(line.oldLineNumber || 0, 'old')}
                    className="w-8 h-6 mx-2 my-1 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:opacity-100 text-gray-400 hover:text-purple-500 transition-all duration-200 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20"
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
        <div className="bg-white/50 dark:bg-gray-900/30">
          <div className="bg-gradient-to-r from-emerald-100 to-green-100 dark:from-emerald-900/30 dark:to-green-900/20 px-4 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300 border-b border-gray-200/50 dark:border-gray-700/50 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
            Updated
          </div>
          <div className="divide-y divide-gray-100/50 dark:divide-gray-700/30">
            {rightLines.map((line, index) => (
              <div key={index} className={getLineClassName(line)}>
                {showLineNumbers && renderLineNumber(line.newLineNumber)}
                <div className="flex-1 px-3 py-1 min-w-0">
                  {renderLineContent(line)}
                </div>
                {onLineComment && line.type === 'add' && (
                  <button
                    onClick={() => onLineComment(line.newLineNumber || 0, 'new')}
                    className="w-8 h-6 mx-2 my-1 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:opacity-100 text-gray-400 hover:text-purple-500 transition-all duration-200 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20"
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