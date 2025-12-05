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

// Status-specific active styles with gradient backgrounds
const statusActiveStyles: Record<string, string> = {
  all: 'btn-pill-active-purple',
  pending: 'btn-pill-active-gray',
  'in-progress': 'btn-pill-active-orange',
  completed: 'btn-pill-active-green',
};

export function StatusFilterPills({ currentFilter, onFilterChange, taskCounts }: StatusFilterPillsProps) {
  const { t } = useTranslation();
  const totalTasks = taskCounts.pending + taskCounts.inProgress + taskCounts.completed;

  const filterOptions = [
    {
      id: 'all',
      label: t('tasksPage.filters.all'),
      count: totalTasks,
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      )
    },
    {
      id: 'pending',
      label: t('tasksPage.filters.pending'),
      count: taskCounts.pending,
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      id: 'in-progress',
      label: t('tasksPage.filters.inProgress'),
      count: taskCounts.inProgress,
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      id: 'completed',
      label: t('tasksPage.filters.completed'),
      count: taskCounts.completed,
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  ];

  return (
    <div className="flex flex-wrap gap-2 sm:gap-3">
      {filterOptions.map((option) => {
        const isActive = currentFilter === option.id;
        const activeClass = statusActiveStyles[option.id] || '';

        return (
          <button
            key={option.id}
            onClick={() => onFilterChange(option.id)}
            className={`btn-pill ${isActive ? activeClass : ''}`}
            title={t('tasksPage.filters.filterByTooltip', { status: option.label.toLowerCase() })}
          >
            {option.icon}
            <span>{option.label}</span>
            {option.count > 0 && (
              <span className={`px-1.5 py-0.5 text-xs rounded-full min-w-[20px] text-center transition-colors ${
                isActive
                  ? 'bg-white/20'
                  : 'bg-gray-200/50 dark:bg-gray-700/50'
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