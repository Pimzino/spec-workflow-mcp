import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useTranslation } from 'react-i18next';

interface Task {
  id: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  files?: string[];
  implementationDetails?: string[];
  requirements?: string[];
  leverage?: string;
  prompt?: string;
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
          bgColor: 'bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm',
          borderColor: 'border-gray-200/60 dark:border-gray-700/60',
          textColor: 'text-gray-900 dark:text-gray-200',
          iconBg: 'bg-gray-100 dark:bg-gray-700',
          iconColor: 'text-gray-500 dark:text-gray-400',
          badgeBg: 'bg-gray-100 dark:bg-gray-700',
          badgeText: 'text-gray-600 dark:text-gray-400',
          hoverGlow: 'hover:shadow-gray-200/50 dark:hover:shadow-gray-700/50',
          icon: (
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
        };
      case 'in-progress':
        return {
          bgColor: 'bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm',
          borderColor: 'border-orange-200/60 dark:border-orange-700/60',
          textColor: 'text-gray-900 dark:text-gray-200',
          iconBg: 'bg-gradient-to-br from-orange-500 to-amber-500',
          iconColor: 'text-white',
          badgeBg: 'bg-gradient-to-r from-orange-500 to-amber-500',
          badgeText: 'text-white',
          hoverGlow: 'hover:shadow-orange-200/50 dark:hover:shadow-orange-700/50',
          icon: (
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
        };
      case 'completed':
        return {
          bgColor: 'bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm',
          borderColor: 'border-green-200/60 dark:border-green-700/60',
          textColor: 'text-gray-900 dark:text-gray-200',
          iconBg: 'bg-gradient-to-br from-green-500 to-teal-500',
          iconColor: 'text-white',
          badgeBg: 'bg-gradient-to-r from-green-500 to-teal-500',
          badgeText: 'text-white',
          hoverGlow: 'hover:shadow-green-200/50 dark:hover:shadow-green-700/50',
          icon: (
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        touchAction: 'manipulation',
      }}
      {...attributes}
      {...listeners}
      className={`
        p-3 sm:p-4 rounded-xl border
        min-h-[80px]
        cursor-grab active:cursor-grabbing
        transition-all duration-200
        touch-manipulation select-none
        ${config.bgColor} ${config.borderColor}
        ${config.hoverGlow}
        hover:-translate-y-0.5 hover:shadow-lg
        ${isDragging ? 'rotate-2 scale-105 shadow-xl ring-2 ring-purple-500/50' : ''}
        ${isSortableDragging ? 'z-50 opacity-80' : ''}
      `}
    >
      {/* Task Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {/* Task ID Badge with gradient */}
          <span className={`px-2 py-1 rounded-lg text-[10px] sm:text-xs font-bold ${config.badgeBg} ${config.badgeText}`}>
            #{task.id}
          </span>
          {isInProgress && (
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 rounded-full">
              <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-medium text-orange-600 dark:text-orange-400">Active</span>
            </div>
          )}
        </div>

        {/* Copy Button - Icon only with tooltip effect */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onCopyTaskPrompt();
          }}
          className={`
            p-2 rounded-lg transition-all duration-200
            flex items-center justify-center
            touch-manipulation
            min-h-[36px] min-w-[36px]
            group relative
            ${copiedTaskId === task.id
              ? 'bg-gradient-to-r from-green-500 to-teal-500 text-white shadow-lg shadow-green-500/30'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-purple-100 dark:hover:bg-purple-900/30 hover:text-purple-600 dark:hover:text-purple-400'
            }
          `}
          title={t('tasksPage.copyPrompt.tooltip')}
          style={{
            touchAction: 'manipulation',
          }}
        >
          {copiedTaskId === task.id ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          )}
        </button>
      </div>

      {/* Task Description */}
      <p className={`text-xs sm:text-sm mb-3 line-clamp-3 leading-relaxed ${config.textColor}`}>
        {task.description}
      </p>

      {/* Task Metadata - Compact pills */}
      <div className="flex flex-wrap gap-1.5">
        {/* File count */}
        {task.files && task.files.length > 0 && (
          <div className="flex items-center gap-1 px-2 py-0.5 bg-gray-100 dark:bg-gray-700/50 rounded-full text-[10px] text-gray-600 dark:text-gray-400">
            <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>{task.files.length}</span>
          </div>
        )}

        {/* Implementation details count */}
        {task.implementationDetails && task.implementationDetails.length > 0 && (
          <div className="flex items-center gap-1 px-2 py-0.5 bg-gray-100 dark:bg-gray-700/50 rounded-full text-[10px] text-gray-600 dark:text-gray-400">
            <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{task.implementationDetails.length}</span>
          </div>
        )}

        {/* Has prompt indicator */}
        {task.prompt && (
          <div className="flex items-center gap-1 px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 rounded-full text-[10px] text-purple-600 dark:text-purple-400 font-medium">
            <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span>AI</span>
          </div>
        )}
      </div>
    </div>
  );
}