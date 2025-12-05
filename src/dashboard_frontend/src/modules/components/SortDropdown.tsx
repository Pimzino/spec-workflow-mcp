import React, { useEffect, useMemo, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';

interface SortOption {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
}

interface SortDropdownProps {
  currentSort: string;
  currentOrder: string;
  onSortChange: (sort: string, order: string) => void;
  sortOptions?: SortOption[];
  align?: 'left' | 'right';
}

export function SortDropdown({ currentSort, currentOrder, onSortChange, sortOptions, align = 'left' }: SortDropdownProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const defaultSortOptions = [
    {
      id: 'default',
      label: t('tasksPage.sort.defaultOrder'),
      description: t('tasksPage.sort.defaultOrderDesc'),
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      )
    },
    {
      id: 'status',
      label: t('tasksPage.sort.status'),
      description: t('tasksPage.sort.statusDesc'),
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      id: 'taskId',
      label: t('tasksPage.sort.taskId'),
      description: t('tasksPage.sort.taskIdDesc'),
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
        </svg>
      )
    },
    {
      id: 'description',
      label: t('tasksPage.sort.description'),
      description: t('tasksPage.sort.descriptionDesc'),
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
        </svg>
      )
    }
  ];

  const actualSortOptions = sortOptions || defaultSortOptions;
  const currentSortOption = actualSortOptions.find(option => option.id === currentSort) || actualSortOptions[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSortSelect = (sortId: string) => {
    if (sortId === 'default') {
      onSortChange(sortId, 'asc');
    } else if (sortId === currentSort) {
      // Toggle order if same sort option is selected
      const newOrder = currentOrder === 'asc' ? 'desc' : 'asc';
      onSortChange(sortId, newOrder);
    } else {
      // Default to ascending for new sort options
      onSortChange(sortId, 'asc');
    }
    setIsOpen(false);
  };

  const getOrderIcon = (isCurrentSort: boolean) => {
    if (!isCurrentSort || currentSort === 'default') return null;

    return currentOrder === 'asc' ? (
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Dropdown Button with Glass Effect */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center justify-between w-full sm:w-auto md:w-auto min-w-[140px] md:min-w-[160px]
          px-3 py-2 md:px-4 md:py-2.5
          bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm
          border border-gray-200/50 dark:border-gray-700/50
          rounded-xl
          text-gray-900 dark:text-white
          transition-all duration-200
          hover:bg-white/70 dark:hover:bg-gray-800/70
          hover:border-gray-300/50 dark:hover:border-gray-600/50
          hover:shadow-lg hover:shadow-purple-500/5 dark:hover:shadow-purple-500/10
          focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500/50
          ${isOpen ? 'ring-2 ring-purple-500/30 border-purple-500/50' : ''}
        `}
        title={t('tasksPage.sort.changeSortOrder')}
      >
        <span className="flex items-center gap-2 truncate">
          <span className={`transition-colors duration-200 ${isOpen ? 'text-purple-500 dark:text-purple-400' : 'text-gray-500 dark:text-gray-400'}`}>
            {currentSortOption.icon}
          </span>
          <span className="text-sm font-medium">{currentSortOption.label}</span>
          {getOrderIcon(true)}
        </span>
        <svg
          className={`w-4 h-4 ml-2 transition-all duration-200 ${isOpen ? 'rotate-180 text-purple-500 dark:text-purple-400' : 'text-gray-400'}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu with Glass Card Styling */}
      {isOpen && (
        <div
          className={`
            absolute top-full mt-2 w-full sm:w-72 md:w-80
            glass-card shadow-2xl
            z-50 max-h-[400px] overflow-hidden
            animate-in fade-in slide-in-from-top-2 duration-200
            ${align === 'right' ? 'right-0' : 'left-0'}
          `}
        >
          {/* Sort Options */}
          <div className="py-2">
            {actualSortOptions.map((option) => {
              const isCurrentSort = currentSort === option.id;
              const orderIcon = getOrderIcon(isCurrentSort);

              return (
                <button
                  key={option.id}
                  onClick={() => handleSortSelect(option.id)}
                  className={`
                    w-full px-4 py-3 text-left
                    transition-all duration-150
                    ${isCurrentSort
                      ? 'bg-purple-500/10 dark:bg-purple-500/15 border-l-2 border-purple-500'
                      : 'hover:bg-purple-500/5 dark:hover:bg-purple-500/10 border-l-2 border-transparent'
                    }
                  `}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {/* Icon Container */}
                      <div className={`
                        flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center
                        transition-all duration-200
                        ${isCurrentSort
                          ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                        }
                      `}>
                        {option.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={`font-medium text-sm truncate ${isCurrentSort ? 'text-purple-700 dark:text-purple-300' : 'text-gray-900 dark:text-white'}`}>
                          {option.label}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                          {option.description}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                      {orderIcon && (
                        <div className="text-purple-500 dark:text-purple-400">
                          {orderIcon}
                        </div>
                      )}
                      {isCurrentSort && (
                        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Sort Order Toggle for Non-Default Options */}
          {currentSort !== 'default' && (
            <>
              {/* Divider with Glass Effect */}
              <div className="mx-4 border-t border-gray-200/50 dark:border-gray-700/50"></div>

              <div className="p-4">
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                  </svg>
                  {t('tasksPage.sort.sortOrder')}
                </div>

                {/* Pill-style Order Toggle Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => onSortChange(currentSort, 'asc')}
                    className={`
                      flex-1 px-3 py-2 text-xs font-medium rounded-full
                      flex items-center justify-center gap-1.5
                      transition-all duration-200
                      ${currentOrder === 'asc'
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }
                    `}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
                    </svg>
                    {t('tasksPage.sort.ascending')}
                  </button>
                  <button
                    onClick={() => onSortChange(currentSort, 'desc')}
                    className={`
                      flex-1 px-3 py-2 text-xs font-medium rounded-full
                      flex items-center justify-center gap-1.5
                      transition-all duration-200
                      ${currentOrder === 'desc'
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }
                    `}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                    {t('tasksPage.sort.descending')}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
