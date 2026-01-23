import React from 'react';
import { useTranslation } from 'react-i18next';

interface StatusFilterPillsProps {
  currentFilter: string;
  onFilterChange: (filter: string) => void;
  taskCounts: {
    pending: number;
    inProgress: number;
    completed: number;
  };
}

export function StatusFilterPills({ currentFilter, onFilterChange, taskCounts }: StatusFilterPillsProps) {
  const { t } = useTranslation();
  const totalTasks = taskCounts.pending + taskCounts.inProgress + taskCounts.completed;

  const filterOptions = [
    {
      id: 'all',
      label: t('tasksPage.filters.all'),
      count: totalTasks,
      bgColor: 'bg-[var(--surface-panel)]',
      textColor: 'text-[var(--text-secondary)]',
      activeBg: 'bg-[var(--surface-raised)]',
      activeText: 'text-[var(--text-primary)]',
      hoverBg: 'hover:bg-[var(--surface-raised)]',
      dotColor: 'bg-blue-500',
    },
    {
      id: 'pending',
      label: t('tasksPage.filters.pending'),
      count: taskCounts.pending,
      bgColor: 'bg-[var(--surface-panel)]',
      textColor: 'text-[var(--text-secondary)]',
      activeBg: 'bg-[var(--surface-raised)]',
      activeText: 'text-[var(--text-primary)]',
      hoverBg: 'hover:bg-[var(--surface-raised)]',
      dotColor: 'bg-gray-400',
    },
    {
      id: 'in-progress',
      label: t('tasksPage.filters.inProgress'),
      count: taskCounts.inProgress,
      bgColor: 'bg-[var(--surface-panel)]',
      textColor: 'text-[var(--text-secondary)]',
      activeBg: 'bg-[var(--surface-raised)]',
      activeText: 'text-[var(--text-primary)]',
      hoverBg: 'hover:bg-[var(--surface-raised)]',
      dotColor: 'bg-orange-500',
    },
    {
      id: 'completed',
      label: t('tasksPage.filters.completed'),
      count: taskCounts.completed,
      bgColor: 'bg-[var(--surface-panel)]',
      textColor: 'text-[var(--text-secondary)]',
      activeBg: 'bg-[var(--surface-raised)]',
      activeText: 'text-[var(--text-primary)]',
      hoverBg: 'hover:bg-[var(--surface-raised)]',
      dotColor: 'bg-green-500',
    }
  ];

  return (
    <div className="flex flex-wrap gap-2 sm:gap-3">
      {filterOptions.map((option) => {
        const isActive = currentFilter === option.id;

        return (
          <button
            key={option.id}
            onClick={() => onFilterChange(option.id)}
            className={`px-3 py-2 sm:px-4 sm:py-2 text-xs sm:text-sm rounded-md whitespace-nowrap transition-colors flex items-center gap-1.5 border ${
              isActive
                ? `${option.activeBg} ${option.activeText} border-[var(--border-strong)]`
                : `${option.bgColor} ${option.textColor} ${option.hoverBg} border-[var(--border-default)]`
            }`}
            title={t('tasksPage.filters.filterByTooltip', { status: option.label.toLowerCase() })}
          >
            <span className={`w-2 h-2 rounded-full ${option.dotColor}`} />
            <span className="font-medium">{option.label}</span>
            {option.count > 0 && (
              <span className={`px-1.5 py-0.5 text-xs rounded-md min-w-[20px] text-center font-mono tabular-nums ${
                isActive
                  ? 'bg-[var(--surface-base)]'
                  : 'bg-[var(--surface-base)]'
              }`}>
                {option.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}