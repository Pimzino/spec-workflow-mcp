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
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full sm:w-auto md:w-auto min-w-[140px] md:min-w-[160px] px-3 py-2 md:px-4 md:py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
        title={t('tasksPage.sort.changeSortOrder')}
      >
        <span className="flex items-center gap-2 truncate">
          {currentSortOption.icon}
          <span className="text-sm font-medium">{currentSortOption.label}</span>
          {getOrderIcon(true)}
        </span>
        <svg 
          className={`w-4 h-4 ml-2 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className={`absolute top-full mt-1 w-full sm:w-64 md:w-72 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-50 max-h-80 overflow-hidden ${align === 'right' ? 'right-0' : 'left-0'}`}>
          <div className="py-1">
            {actualSortOptions.map((option) => {
              const isCurrentSort = currentSort === option.id;
              const orderIcon = getOrderIcon(isCurrentSort);
              
              return (
                <button
                  key={option.id}
                  onClick={() => handleSortSelect(option.id)}
                  className={`w-full px-4 py-3 md:px-4 md:py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 focus:bg-gray-50 dark:focus:bg-gray-700 transition-colors ${
                    isCurrentSort ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' : 'text-gray-900 dark:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className={`flex-shrink-0 ${isCurrentSort ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'}`}>
                        {option.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{option.label}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                          {option.description}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {orderIcon && (
                        <div className="text-gray-400 dark:text-gray-500">
                          {orderIcon}
                        </div>
                      )}
                      {isCurrentSort && (
                        <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
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
              <div className="border-t border-gray-200 dark:border-gray-600"></div>
              <div className="p-3">
                <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                  </svg>
                  {t('tasksPage.sort.sortOrder')}:
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => onSortChange(currentSort, 'asc')}
                    className={`px-2 py-1 text-xs rounded transition-colors flex items-center gap-1 ${
                      currentOrder === 'asc'
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
                    </svg>
                    {t('tasksPage.sort.ascending')}
                  </button>
                  <button
                    onClick={() => onSortChange(currentSort, 'desc')}
                    className={`px-2 py-1 text-xs rounded transition-colors flex items-center gap-1 ${
                      currentOrder === 'desc'
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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