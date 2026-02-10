import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useTranslation } from 'react-i18next';

interface Task {
  id: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'blocked';
  files?: string[];
  implementationDetails?: string[];
  requirements?: string[];
  leverage?: string;
  prompt?: string;
  blockedReason?: string;
}

interface KanbanTaskCardProps {
  task: Task;
  specName: string;
  onCopyTaskPrompt: () => void;
  copiedTaskId: string | null;
  isInProgress?: boolean;
  isDragging?: boolean;
}

export function KanbanTaskCard({
  task,
  specName,
  onCopyTaskPrompt,
  copiedTaskId,
  isInProgress = false,
  isDragging = false
}: KanbanTaskCardProps) {
  const { t } = useTranslation();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({
    id: task.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging || isSortableDragging ? 0.5 : 1,
  };

  const getStatusConfig = () => {
    switch (task.status) {
      case 'pending':
        return {
          bgColor: 'bg-[var(--surface-panel)]',
          borderColor: 'border-[var(--border-default)]',
          textColor: 'text-[var(--text-primary)]',
          dotColor: 'bg-gray-400',
        };
      case 'in-progress':
        return {
          bgColor: 'bg-[var(--surface-panel)]',
          borderColor: 'border-[var(--border-default)]',
          textColor: 'text-[var(--text-primary)]',
          dotColor: 'bg-orange-500',
        };
      case 'blocked':
        return {
          bgColor: 'bg-[var(--surface-panel)]',
          borderColor: 'border-[var(--border-default)]',
          textColor: 'text-[var(--text-primary)]',
          dotColor: 'bg-red-500',
        };
      case 'completed':
        return {
          bgColor: 'bg-[var(--surface-panel)]',
          borderColor: 'border-[var(--border-default)]',
          textColor: 'text-[var(--text-primary)]',
          dotColor: 'bg-green-500',
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        touchAction: 'manipulation', // Allow scrolling while supporting drag
      }}
      {...attributes}
      {...listeners}
      className={`
        ${/* Touch-optimized padding and spacing */ ''}
        p-3 sm:p-3 rounded-md border
        ${/* Enhanced touch area */ ''}
        min-h-[80px]
        ${/* Cursor and interaction states */ ''}
        cursor-grab active:cursor-grabbing
        transition-all hover:shadow-md
        touch-manipulation select-none
        ${/* Colors and styling */ ''}
        ${config.bgColor} ${config.borderColor}
        ${/* Drag states */ ''}
        ${isDragging ? 'rotate-2 scale-105 shadow-lg' : ''}
        ${isSortableDragging ? 'z-50' : ''}
      `}
    >
      {/* Task Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {task.status === 'blocked' ? (
            <svg className="w-2 h-2 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          ) : (
            <div className={`w-2 h-2 rounded-full ${config.dotColor}`} />
          )}
          <span className={`text-xs sm:text-sm font-medium font-mono tabular-nums ${config.textColor}`}>
            {t('tasksPage.item.task')} {task.id}
          </span>
          {isInProgress && (
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" title="Currently in progress" />
          )}
        </div>

        {/* Copy Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onCopyTaskPrompt();
          }}
          className={`
            ${/* Touch-optimized sizing */ ''}
            p-2 sm:p-1.5 text-xs rounded-md transition-colors
            flex items-center justify-center gap-1
            touch-manipulation
            ${/* WCAG AAA compliant touch target sizes */ ''}
            min-h-[44px] min-w-[44px]
            sm:min-h-[36px] sm:min-w-[36px]
            ${/* Interactive states */ ''}
            ${copiedTaskId === task.id
              ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
              : 'bg-[var(--surface-base)] text-[var(--text-secondary)] hover:bg-[var(--surface-raised)] border border-[var(--border-default)]'
            }
          `}
          title={t('tasksPage.copyPrompt.tooltip')}
          style={{
            touchAction: 'manipulation', // Allow touch events for the button
          }}
        >
          {copiedTaskId === task.id ? (
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          )}
        </button>
      </div>

      {/* Task Description */}
      <p className="text-xs sm:text-sm mb-2 line-clamp-3 leading-relaxed text-[var(--text-secondary)]">
        {task.description}
      </p>

      {/* Blocked Reason */}
      {task.blockedReason && (
        <div className="flex items-center gap-1 text-xs text-red-500 dark:text-red-400 mb-2">
          <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
          </svg>
          <span className="truncate">{task.blockedReason}</span>
        </div>
      )}

      {/* Task Metadata */}
      <div className="space-y-1">
        {/* File count */}
        {task.files && task.files.length > 0 && (
          <div className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
            <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="truncate font-mono tabular-nums">{task.files.length} {task.files.length === 1 ? 'file' : 'files'}</span>
          </div>
        )}

        {/* Implementation details count */}
        {task.implementationDetails && task.implementationDetails.length > 0 && (
          <div className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
            <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="truncate font-mono tabular-nums">{task.implementationDetails.length} details</span>
          </div>
        )}

        {/* Has prompt indicator */}
        {task.prompt && (
          <div className="flex items-center gap-1 text-xs text-[var(--text-accent)]">
            <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span className="truncate">AI Prompt</span>
          </div>
        )}
      </div>
    </div>
  );
}