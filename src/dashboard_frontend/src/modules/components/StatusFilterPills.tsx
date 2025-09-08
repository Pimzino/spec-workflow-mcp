import React from 'react';

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
  const totalTasks = taskCounts.pending + taskCounts.inProgress + taskCounts.completed;

  const filterOptions = [
    {
      id: 'all',
      label: 'All',
      count: totalTasks,
      bgColor: 'bg-gray-100 dark:bg-gray-700',
      textColor: 'text-gray-800 dark:text-gray-200',
      activeBg: 'bg-blue-100 dark:bg-blue-900',
      activeText: 'text-blue-800 dark:text-blue-200',
      hoverBg: 'hover:bg-gray-200 dark:hover:bg-gray-600',
      icon: (
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      )
    },
    {
      id: 'pending',
      label: 'Pending',
      count: taskCounts.pending,
      bgColor: 'bg-gray-100 dark:bg-gray-700',
      textColor: 'text-gray-800 dark:text-gray-200',
      activeBg: 'bg-gray-200 dark:bg-gray-600',
      activeText: 'text-gray-900 dark:text-gray-100',
      hoverBg: 'hover:bg-gray-200 dark:hover:bg-gray-600',
      icon: (
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      id: 'in-progress',
      label: 'In Progress',
      count: taskCounts.inProgress,
      bgColor: 'bg-orange-100 dark:bg-orange-900',
      textColor: 'text-orange-800 dark:text-orange-200',
      activeBg: 'bg-orange-200 dark:bg-orange-800',
      activeText: 'text-orange-900 dark:text-orange-100',
      hoverBg: 'hover:bg-orange-200 dark:hover:bg-orange-800',
      icon: (
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      id: 'completed',
      label: 'Completed',
      count: taskCounts.completed,
      bgColor: 'bg-green-100 dark:bg-green-900',
      textColor: 'text-green-800 dark:text-green-200',
      activeBg: 'bg-green-200 dark:bg-green-800',
      activeText: 'text-green-900 dark:text-green-100',
      hoverBg: 'hover:bg-green-200 dark:hover:bg-green-800',
      icon: (
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
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
            className={`px-3 py-2 sm:px-4 sm:py-2 text-xs sm:text-sm rounded-full whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              isActive 
                ? `${option.activeBg} ${option.activeText} ring-2 ring-blue-500 ring-opacity-50` 
                : `${option.bgColor} ${option.textColor} ${option.hoverBg}`
            }`}
            title={`Filter by ${option.label.toLowerCase()} tasks`}
          >
            {option.icon}
            <span className="font-medium">{option.label}</span>
            {option.count > 0 && (
              <span className={`px-1.5 py-0.5 text-xs rounded-full min-w-[20px] text-center ${
                isActive
                  ? 'bg-white/20 dark:bg-black/20'
                  : 'bg-white/30 dark:bg-black/30'
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