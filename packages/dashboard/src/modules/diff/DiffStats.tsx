import React from 'react';
import { DiffResult } from '../api/api';

export interface DiffStatsProps {
  diff: DiffResult;
  className?: string;
  showDetails?: boolean;
}

export function DiffStats({ diff, className = '', showDetails = false }: DiffStatsProps) {
  const totalChanges = diff.additions + diff.deletions + diff.changes;

  // Calculate approximate document size from chunks
  const totalLines = diff.chunks.reduce((sum, chunk) => sum + Math.max(chunk.oldLines, chunk.newLines), 0);
  const changePercentage = totalLines > 0 ? Math.round((totalChanges / totalLines) * 100) : 0;

  if (totalChanges === 0) {
    return (
      <div className={`inline-flex items-center px-2 py-1 rounded text-sm text-gray-500 dark:text-gray-400 ${className}`}>
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        No changes detected
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center space-x-3 ${className}`}>
      {/* Enhanced compact stats */}
      <div className="inline-flex items-center space-x-2 text-sm">
        {diff.additions > 0 && (
          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            +{diff.additions}
          </span>
        )}

        {diff.deletions > 0 && (
          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
            </svg>
            -{diff.deletions}
          </span>
        )}

        {diff.changes > 0 && (
          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            {diff.changes}
          </span>
        )}

        {/* Show percentage for significant changes */}
        {changePercentage > 5 && (
          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
            {changePercentage}% changed
          </span>
        )}
      </div>

      {showDetails && (
        <>
          {/* Visual diff bar */}
          <div className="hidden sm:flex w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            {diff.additions > 0 && (
              <div
                className="bg-green-500 h-full"
                style={{ width: `${(diff.additions / totalChanges) * 100}%` }}
              />
            )}
            {diff.changes > 0 && (
              <div
                className="bg-blue-500 h-full"
                style={{ width: `${(diff.changes / totalChanges) * 100}%` }}
              />
            )}
            {diff.deletions > 0 && (
              <div
                className="bg-red-500 h-full"
                style={{ width: `${(diff.deletions / totalChanges) * 100}%` }}
              />
            )}
          </div>

          {/* Total count */}
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {totalChanges} change{totalChanges !== 1 ? 's' : ''}
          </div>
        </>
      )}
    </div>
  );
}

export interface DiffStatsBadgeProps {
  diff: DiffResult;
  className?: string;
}

export function DiffStatsBadge({ diff, className = '' }: DiffStatsBadgeProps) {
  const totalChanges = diff.additions + diff.deletions + diff.changes;
  const totalLines = diff.chunks.reduce((sum, chunk) => sum + Math.max(chunk.oldLines, chunk.newLines), 0);
  const changePercentage = totalLines > 0 ? Math.round((totalChanges / totalLines) * 100) : 0;

  if (totalChanges === 0) {
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 ${className}`}>
        ✓ No changes
      </span>
    );
  }

  // Format badge based on change significance
  const badgeColor = changePercentage > 20
    ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
    : changePercentage > 10
    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
    : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${badgeColor} ${className}`}>
      {diff.additions > 0 && <span className="text-green-600 dark:text-green-400">+{diff.additions}</span>}
      {diff.additions > 0 && diff.deletions > 0 && <span className="mx-1 text-gray-400">•</span>}
      {diff.deletions > 0 && <span className="text-red-600 dark:text-red-400">-{diff.deletions}</span>}
      {(diff.additions > 0 || diff.deletions > 0) && diff.changes > 0 && <span className="mx-1 text-gray-400">•</span>}
      {diff.changes > 0 && <span className="text-blue-600 dark:text-blue-400">{diff.changes} mod</span>}
      {changePercentage > 5 && <span className="ml-1 opacity-75">({changePercentage}%)</span>}
    </span>
  );
}