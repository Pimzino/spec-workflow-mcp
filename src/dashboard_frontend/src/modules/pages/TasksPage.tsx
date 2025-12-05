import React, { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import { useApi, useApiActions } from '../api/api';
import { useWs } from '../ws/WebSocketProvider';
import { useSearchParams } from 'react-router-dom';
import { useNotifications } from '../notifications/NotificationProvider';
import { AlertModal } from '../modals/AlertModal';
import { useTranslation } from 'react-i18next';
import { KanbanBoard } from '../components/KanbanBoard';

function formatDate(dateStr?: string, t?: (k: string, o?: any) => string) {
  if (!dateStr) return t ? t('common.never') : 'Never';
  return new Date(dateStr).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function SearchableSpecDropdown({ specs, selected, onSelect, align = 'left' }: { specs: any[]; selected: string; onSelect: (value: string) => void; align?: 'left' | 'right' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  const filteredSpecs = useMemo(() => {
    if (!search.trim()) return specs;
    const searchLower = search.toLowerCase();
    return specs.filter(spec =>
      spec.displayName.toLowerCase().includes(searchLower) ||
      spec.name.toLowerCase().includes(searchLower)
    );
  }, [specs, search]);

  const selectedSpec = specs.find(s => s.name === selected);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearch('');
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setIsOpen(false);
        setSearch('');
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

  const handleSelect = (spec: any) => {
    onSelect(spec.name);
    setIsOpen(false);
    setSearch('');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full sm:w-auto md:w-auto min-w-[200px] md:min-w-[240px] px-4 py-2.5 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white hover:bg-white/80 dark:hover:bg-gray-800/80 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
      >
        <span className="truncate font-medium">
          {selectedSpec ? selectedSpec.displayName : t('tasksPage.dropdown.selectPlaceholder')}
        </span>
        <svg
          className={`w-4 h-4 ml-2 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className={`absolute top-full mt-2 w-full sm:w-80 md:w-96 glass-card shadow-xl z-50 max-h-96 overflow-hidden ${align === 'right' ? 'right-0' : 'left-0'}`}>
          {/* Search Input */}
          <div className="p-3 md:p-4 border-b border-gray-200 dark:border-gray-700/50">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder={t('tasksPage.search.placeholder')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-full text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                autoFocus
              />
            </div>
          </div>

          {/* Options List */}
          <div className="max-h-60 overflow-y-auto">
            {filteredSpecs.length > 0 ? (
              filteredSpecs.map((spec) => (
                <button
                  key={spec.name}
                  onClick={() => handleSelect(spec)}
                  className={`w-full px-4 py-3 md:px-5 md:py-4 text-left transition-all duration-200 ${
                    selected === spec.name
                      ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
                      : 'text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{spec.displayName}</div>
                      {spec.taskProgress && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {t('tasksPage.dropdown.completedOutOfTotal', { completed: spec.taskProgress.completed, total: spec.taskProgress.total })}
                        </div>
                      )}
                    </div>
                    {selected === spec.name && (
                      <svg className="w-4 h-4 text-purple-600 dark:text-purple-400 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </button>
              ))
            ) : (
              <div className="px-4 py-6 text-center text-gray-500 dark:text-gray-400">
                <svg className="mx-auto h-8 w-8 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <p className="text-sm">{t('tasksPage.search.noSpecsFound')}</p>
                <p className="text-xs mt-1">{t('tasksPage.search.tryAdjusting')}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function copyTaskPrompt(specName: string, task: any, onSuccess?: () => void, onFailure?: (text: string) => void) {
  // Use custom prompt if available, otherwise fallback to default
  const command = task.prompt || `Please work on task ${task.id} for spec "${specName}"`;

  // Try modern clipboard API first
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(command).then(() => {
      onSuccess?.();
    }).catch(() => {
      // If clipboard API fails, fall back to legacy method
      fallbackCopy(command, onSuccess, onFailure);
    });
  } else {
    // Clipboard API not available (HTTP over LAN, older browsers, etc.)
    fallbackCopy(command, onSuccess, onFailure);
  }
}

function fallbackCopy(text: string, onSuccess?: () => void, onFailure?: (text: string) => void) {
  // Try legacy document.execCommand method
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.position = 'fixed';
  textArea.style.left = '-999999px';
  textArea.style.top = '-999999px';
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    const successful = document.execCommand('copy');
    if (!successful) {
      throw new Error('execCommand failed');
    }
    onSuccess?.();
  } catch (err) {
    // If all else fails, call the failure callback with the text
    onFailure?.(text);
  } finally {
    document.body.removeChild(textArea);
  }
}

function scrollToTask(taskId: string) {
  const element = document.querySelector(`[data-task-id="${taskId}"]`);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    // Add a brief highlight effect
    element.classList.add('ring-2', 'ring-blue-400', 'ring-opacity-75');
    setTimeout(() => {
      element.classList.remove('ring-2', 'ring-blue-400', 'ring-opacity-75');
    }, 2000);
  }
}

function StatusPill({
  currentStatus,
  taskId,
  specName,
  onStatusChange,
  disabled = false
}: {
  currentStatus: 'pending' | 'in-progress' | 'completed';
  taskId: string;
  specName: string;
  onStatusChange?: (newStatus: 'pending' | 'in-progress' | 'completed') => void;
  disabled?: boolean;
}) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const { updateTaskStatus } = useApiActions();
  const { showNotification } = useNotifications();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const statusConfig = {
    'pending': {
      label: t('tasksPage.statusPill.pending'),
      bgColor: 'bg-gray-100 dark:bg-gray-700',
      textColor: 'text-gray-800 dark:text-gray-200',
      hoverBg: 'hover:bg-gray-200 dark:hover:bg-gray-600',
      icon: (
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    'in-progress': {
      label: t('tasksPage.statusPill.inProgress'),
      bgColor: 'bg-orange-100 dark:bg-orange-900',
      textColor: 'text-orange-800 dark:text-orange-200',
      hoverBg: 'hover:bg-orange-200 dark:hover:bg-orange-800',
      icon: (
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    'completed': {
      label: t('tasksPage.statusPill.completed'),
      bgColor: 'bg-green-100 dark:bg-green-900',
      textColor: 'text-green-800 dark:text-green-200',
      hoverBg: 'hover:bg-green-200 dark:hover:bg-green-800',
      icon: (
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  };

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

  const handleStatusUpdate = async (newStatus: 'pending' | 'in-progress' | 'completed') => {
    if (newStatus === currentStatus || disabled || isUpdating) return;

    setIsUpdating(true);
    setIsOpen(false);

    try {
      const result = await updateTaskStatus(specName, taskId, newStatus);
      if (result.ok) {
        onStatusChange?.(newStatus);

        // Show success notification
        const statusLabel = newStatus === 'completed'
          ? t('tasksPage.statusPill.completed')
          : newStatus === 'in-progress'
            ? t('tasksPage.statusPill.inProgress')
            : t('tasksPage.statusPill.pending');
        showNotification(t('tasksPage.notifications.statusUpdated', { taskId, status: statusLabel }), 'success');
      } else {
        // Handle error - show error notification
        showNotification(t('tasksPage.notifications.updateFailed', { taskId }), 'error');
        console.error('Failed to update task status');
      }
    } catch (error) {
      showNotification(t('tasksPage.notifications.updateError', { taskId }), 'error');
      console.error('Error updating task status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const config = statusConfig[currentStatus];

  if (disabled) {
    return (
      <span className={`px-2 sm:px-3 py-1 text-xs rounded-full whitespace-nowrap ${config.bgColor} ${config.textColor}`}>
        {config.label}
      </span>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => !isUpdating && setIsOpen(!isOpen)}
        disabled={isUpdating}
        className={`px-2 sm:px-3 py-1 text-xs rounded-full whitespace-nowrap transition-colors flex items-center gap-1.5 ${config.bgColor} ${config.textColor} ${config.hoverBg} ${
          isUpdating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
        }`}
        title={t('tasksPage.statusPill.clickToChange')}
      >
        {isUpdating ? (
          <div className="spinner-gradient w-3 h-3" />
        ) : (
          config.icon
        )}
        <span>{config.label}</span>
        {!isUpdating && (
          <svg className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </button>

      {isOpen && !isUpdating && (
        <div className="absolute top-full mt-1 left-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg z-50 min-w-[120px]">
          {Object.entries(statusConfig).map(([status, statusConf]) => (
            <button
              key={status}
              onClick={() => handleStatusUpdate(status as 'pending' | 'in-progress' | 'completed')}
              className={`w-full px-3 py-2 text-xs text-left transition-colors flex items-center gap-2 ${
                status === currentStatus
                  ? `${statusConf.bgColor} ${statusConf.textColor}`
                  : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
              } ${status === currentStatus ? 'cursor-default' : 'cursor-pointer'}`}
              disabled={status === currentStatus}
            >
              {statusConf.icon}
              <span>{statusConf.label}</span>
              {status === currentStatus && (
                <svg className="w-3 h-3 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function SpecCard({ spec, onSelect, isSelected }: { spec: any; onSelect: (spec: any) => void; isSelected: boolean }) {
  const { t } = useTranslation();
  const progress = spec.taskProgress?.total
    ? Math.round((spec.taskProgress.completed / spec.taskProgress.total) * 100)
    : 0;

  return (
    <div
      className={`glass-card cursor-pointer card-lift glow-hover ${
        isSelected ? 'ring-2 ring-purple-500' : ''
      } ${
        spec.status === 'completed' ? 'opacity-75' : ''
      }`}
      onClick={() => onSelect(spec)}
    >
      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="gradient-icon w-10 h-10">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          {spec.taskProgress && (
            <span className={`status-badge ${progress >= 100 ? 'status-badge-success' : progress >= 50 ? 'status-badge-info' : 'status-badge-pending'}`}>
              {progress}%
            </span>
          )}
        </div>

        <h3 className={`text-base sm:text-lg font-bold mb-2 truncate ${
          spec.status === 'completed'
            ? 'text-gray-600 dark:text-gray-400'
            : 'text-gray-900 dark:text-white'
        }`}>
          {spec.displayName}
        </h3>

        <div className={`flex flex-wrap gap-2 text-xs mb-3 ${
          spec.status === 'completed'
            ? 'text-gray-400 dark:text-gray-500'
            : 'text-gray-500 dark:text-gray-400'
        }`}>
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {formatDate(spec.lastModified, t)}
          </span>
          {spec.taskProgress && (
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {t('tasksPage.dropdown.completedOutOfTotalShort', { completed: spec.taskProgress.completed, total: spec.taskProgress.total })}
            </span>
          )}
        </div>

        {/* Progress bar */}
        {spec.taskProgress && spec.taskProgress.total > 0 && (
          <div className="progress-gradient h-2">
            <div
              className="progress-gradient-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function TaskList({ specName }: { specName: string }) {
  const { t } = useTranslation();
  const { getSpecTasksProgress, updateTaskStatus } = useApiActions();
  const { subscribe, unsubscribe } = useWs();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any | null>(null);
  const [showFloatingButton, setShowFloatingButton] = useState(false);
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const [copiedTaskId, setCopiedTaskId] = useState<string | null>(null);
  const [expandedPrompts, setExpandedPrompts] = useState<Set<string>>(new Set());

  // Filter and sort state
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'in-progress' | 'completed'>('all');
  const [sortBy, setSortBy] = useState<'default' | 'status' | 'id' | 'description'>('default');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // View mode state
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');

  // Track pending status updates to prevent race conditions with websocket
  // Using ref instead of state to avoid re-renders and websocket re-subscriptions
  const pendingStatusUpdatesRef = useRef<Set<string>>(new Set());

  // Storage key for per-spec preferences
  const storageKey = useMemo(() => `spec-workflow:task-preferences:${specName}`, [specName]);

  // Load preferences from localStorage
  useEffect(() => {
    try {
      const savedPreferences = localStorage.getItem(storageKey);
      if (savedPreferences) {
        const { statusFilter: savedStatusFilter, sortBy: savedSortBy, sortOrder: savedSortOrder, viewMode: savedViewMode } = JSON.parse(savedPreferences);
        if (savedStatusFilter) setStatusFilter(savedStatusFilter);
        if (savedSortBy) setSortBy(savedSortBy);
        if (savedSortOrder) setSortOrder(savedSortOrder);
        if (savedViewMode) setViewMode(savedViewMode);
      }
    } catch (error) {
      // Ignore localStorage errors
      console.warn('Failed to load task preferences from localStorage:', error);
    }
  }, [storageKey]);

  // Save preferences to localStorage
  useEffect(() => {
    try {
      const preferences = { statusFilter, sortBy, sortOrder, viewMode };
      localStorage.setItem(storageKey, JSON.stringify(preferences));
    } catch (error) {
      // Ignore localStorage errors
      console.warn('Failed to save task preferences to localStorage:', error);
    }
  }, [storageKey, statusFilter, sortBy, sortOrder, viewMode]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    getSpecTasksProgress(specName)
      .then((d) => active && setData(d))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [getSpecTasksProgress, specName]);

  // Subscribe to task status updates via WebSocket
  useEffect(() => {
    const handleTaskStatusUpdate = (event: any) => {
      if (event.specName === specName) {
        setData((prevData: any) => {
          if (!prevData) return prevData;

          // Merge websocket updates while preserving pending optimistic updates
          const mergedTaskList = event.taskList.map((serverTask: any) => {
            // If this task has a pending update, keep the local version
            if (pendingStatusUpdatesRef.current.has(serverTask.id)) {
              const localTask = prevData.taskList.find((t: any) => t.id === serverTask.id);
              return localTask || serverTask;
            }
            return serverTask;
          });

          // Check if task list actually changed to avoid unnecessary re-renders
          if (prevData.taskList.length !== mergedTaskList.length) {
            // Length changed, definitely need to update
          } else {
            // Same length - check if any task actually changed
            let hasChanges = false;

            // Compare task lists by creating maps for efficient lookup
            const prevTaskMap = new Map(prevData.taskList.map((t: any) => [t.id, t]));
            const newTaskMap = new Map(mergedTaskList.map((t: any) => [t.id, t]));

            // Check if any task changed
            for (const [id, newTask] of newTaskMap) {
              const prevTask = prevTaskMap.get(id);
              if (!prevTask ||
                  prevTask.status !== newTask.status ||
                  prevTask.title !== newTask.title ||
                  prevTask.completed !== newTask.completed ||
                  prevTask.inProgress !== newTask.inProgress) {
                hasChanges = true;
                break;
              }
            }

            // Also check if total, progress, or inProgress changed
            if (!hasChanges &&
                prevData.total === event.summary.total &&
                prevData.inProgress === event.inProgress) {
              // Nothing changed - return previous data to avoid re-render
              return prevData;
            }
          }

          const completedCount = mergedTaskList.filter((t: any) => t.status === 'completed').length;

          return {
            ...prevData,
            taskList: mergedTaskList,
            completed: completedCount,
            total: event.summary.total,
            progress: event.summary.total > 0 ? (completedCount / event.summary.total) * 100 : 0,
            inProgress: event.inProgress
          };
        });
      }
    };

    subscribe('task-status-update', handleTaskStatusUpdate);

    return () => {
      unsubscribe('task-status-update', handleTaskStatusUpdate);
    };
  }, [specName, subscribe, unsubscribe]);

  // Helper functions
  const filterTasksByStatus = useCallback((tasks: any[]) => {
    if (statusFilter === 'all') return tasks;

    return tasks.filter((task: any) => {
      if (task.isHeader) return true; // Always include headers

      switch (statusFilter) {
        case 'pending':
          return task.status === 'pending';
        case 'in-progress':
          return task.status === 'in-progress';
        case 'completed':
          return task.status === 'completed';
        default:
          return true;
      }
    });
  }, [statusFilter]);

  const sortTasks = useCallback((tasks: any[]) => {
    if (sortBy === 'default') return tasks;

    const sorted = [...tasks].sort((a: any, b: any) => {
      // Headers always stay at the top
      if (a.isHeader && !b.isHeader) return -1;
      if (!a.isHeader && b.isHeader) return 1;
      if (a.isHeader && b.isHeader) return 0;

      let aValue: string | number;
      let bValue: string | number;

      switch (sortBy) {
        case 'status':
          // Sort by status priority: pending -> in-progress -> completed
          const statusOrder = { 'pending': 0, 'in-progress': 1, 'completed': 2 };
          aValue = statusOrder[a.status as keyof typeof statusOrder] || 0;
          bValue = statusOrder[b.status as keyof typeof statusOrder] || 0;
          break;
        case 'id':
          aValue = parseFloat(a.id) || 0;
          bValue = parseFloat(b.id) || 0;
          break;
        case 'description':
          aValue = (a.description || '').toLowerCase();
          bValue = (b.description || '').toLowerCase();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [sortBy, sortOrder]);

  const getTaskCounts = useCallback((tasks: any[]) => {
    const counts = {
      all: 0,
      pending: 0,
      'in-progress': 0,
      completed: 0
    };

    tasks?.forEach((task: any) => {
      if (!task.isHeader) {
        counts.all++;
        counts[task.status as keyof typeof counts]++;
      }
    });

    return counts;
  }, []);

  // Create filtered and sorted task list
  const filteredAndSortedTasks = useMemo(() => {
    if (!data?.taskList) return [];

    const filtered = filterTasksByStatus(data.taskList);
    const sorted = sortTasks(filtered);

    return sorted;
  }, [data?.taskList, filterTasksByStatus, sortTasks]);

  const taskCounts = useMemo(() => getTaskCounts(data?.taskList), [data?.taskList, getTaskCounts]);

  // Toggle prompt expansion
  const togglePromptExpansion = (taskId: string) => {
    setExpandedPrompts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  };

  // Show/hide floating buttons based on pending tasks and scroll position
  useEffect(() => {
    const hasPendingTasks = filteredAndSortedTasks?.some((task: any) => !task.completed && !task.isHeader);
    setShowFloatingButton(hasPendingTasks);

    const handleScroll = () => {
      setShowScrollToTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    // Initial check
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [filteredAndSortedTasks]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToNextPending = () => {
    const nextPending = filteredAndSortedTasks?.find((task: any) => !task.completed && !task.isHeader);
    if (nextPending) {
      scrollToTask(nextPending.id);
    }
  };

  if (loading) {
    return (
      <div className="glass-card p-6">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="spinner-gradient spinner-gradient-lg mb-4" />
          <span className="text-gray-400 text-sm">{t('tasksPage.loading')}</span>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
          <p className="text-lg font-medium">{t('tasksPage.noTaskData')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {/* Stats Grid - Glass cards with gradient icons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Tasks Card */}
        <div className="glass-card p-4 sm:p-5 glow-hover">
          <div className="flex items-start justify-between mb-3">
            <div className="gradient-icon-blue w-10 h-10 sm:w-12 sm:h-12">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <span className="status-badge status-badge-info text-[10px]">100%</span>
          </div>
          <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-1">{data.total}</div>
          <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{t('tasksPage.stats.total')}</div>
        </div>

        {/* Completed Tasks Card */}
        <div className="glass-card p-4 sm:p-5 glow-hover">
          <div className="flex items-start justify-between mb-3">
            <div className="gradient-icon-green w-10 h-10 sm:w-12 sm:h-12">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="status-badge status-badge-success text-[10px]">
              {data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0}%
            </span>
          </div>
          <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-green-600 dark:text-green-400 mb-1">{data.completed}</div>
          <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{t('tasksPage.stats.done')}</div>
        </div>

        {/* Remaining Tasks Card */}
        <div className="glass-card p-4 sm:p-5 glow-hover">
          <div className="flex items-start justify-between mb-3">
            <div className="gradient-icon-yellow w-10 h-10 sm:w-12 sm:h-12">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="status-badge status-badge-pending text-[10px]">
              {data.total > 0 ? Math.round(((data.total - data.completed) / data.total) * 100) : 0}%
            </span>
          </div>
          <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-amber-600 dark:text-amber-400 mb-1">{data.total - data.completed}</div>
          <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{t('tasksPage.stats.left')}</div>
        </div>

        {/* Progress Percentage Card */}
        <div className="glass-card p-4 sm:p-5 glow-hover">
          <div className="flex items-start justify-between mb-3">
            <div className="gradient-icon w-10 h-10 sm:w-12 sm:h-12">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <span className={`status-badge text-[10px] ${Math.round(data.progress) >= 75 ? 'status-badge-success' : Math.round(data.progress) >= 50 ? 'status-badge-info' : 'status-badge-pending'}`}>
              {Math.round(data.progress) >= 75 ? 'Great!' : Math.round(data.progress) >= 50 ? 'Good' : 'In Progress'}
            </span>
          </div>
          <div className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 mb-1">{Math.round(data.progress)}%</div>
          <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{t('tasksPage.stats.progress')}</div>
        </div>
      </div>

      {/* Progress Bar - Gradient style */}
      <div className="glass-card p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">{t('tasksPage.overallProgress')}</h3>
          <span className="px-3 py-1 rounded-full text-sm font-bold bg-gradient-to-r from-purple-600 to-pink-600 text-white">
            {Math.round(data.progress)}%
          </span>
        </div>
        <div className="progress-gradient h-3 sm:h-4">
          <div
            className="progress-gradient-fill"
            style={{ width: `${data.progress}%` }}
          />
        </div>
      </div>

      {/* Filter and Sort Controls - Glass card with pill buttons */}
      <div className="glass-card p-4 sm:p-5 overflow-hidden">
        <div className="flex flex-col gap-4">
          {/* Top row: Title and View Toggle */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">{t('tasksPage.taskDetails')}</h3>

            {/* View Mode Switcher - Pill style */}
            <div className="flex p-1 bg-gray-100 dark:bg-gray-800/80 rounded-full border border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
                  viewMode === 'list'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                <span>{t('common.viewMode.list', 'List')}</span>
              </button>
              <button
                onClick={() => setViewMode('kanban')}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
                  viewMode === 'kanban'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                <span>{t('common.viewMode.kanban', 'Kanban')}</span>
              </button>
            </div>
          </div>

          {/* Bottom row: Status Filter Pills and Sort */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            {/* Status Filter Pills */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setStatusFilter('all')}
                className={`btn-pill ${statusFilter === 'all' ? 'active' : ''}`}
              >
                <span>{t('tasksPage.filters.all')}</span>
                <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs ${statusFilter === 'all' ? 'bg-white/20' : 'bg-gray-200 dark:bg-gray-700'}`}>
                  {taskCounts.all}
                </span>
              </button>
              <button
                onClick={() => setStatusFilter('pending')}
                className={`btn-pill ${statusFilter === 'pending' ? 'active !bg-gray-500' : ''}`}
              >
                <span>{t('tasksPage.filters.pending')}</span>
                <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs ${statusFilter === 'pending' ? 'bg-white/20' : 'bg-gray-200 dark:bg-gray-700'}`}>
                  {taskCounts.pending}
                </span>
              </button>
              <button
                onClick={() => setStatusFilter('in-progress')}
                className={`btn-pill ${statusFilter === 'in-progress' ? 'active !bg-gradient-to-r !from-orange-500 !to-amber-500' : ''}`}
              >
                <span>{t('tasksPage.filters.inProgress')}</span>
                <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs ${statusFilter === 'in-progress' ? 'bg-white/20' : 'bg-gray-200 dark:bg-gray-700'}`}>
                  {taskCounts['in-progress']}
                </span>
              </button>
              <button
                onClick={() => setStatusFilter('completed')}
                className={`btn-pill ${statusFilter === 'completed' ? 'active !bg-gradient-to-r !from-green-500 !to-teal-500' : ''}`}
              >
                <span>{t('tasksPage.filters.completed')}</span>
                <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs ${statusFilter === 'completed' ? 'bg-white/20' : 'bg-gray-200 dark:bg-gray-700'}`}>
                  {taskCounts.completed}
                </span>
              </button>
            </div>

            {/* Sort Controls - Hide in kanban view */}
            {viewMode === 'list' && (
              <div className="flex items-center gap-2 ml-auto">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'default' | 'status' | 'id' | 'description')}
                  className="px-3 py-2 text-sm bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                >
                  <option value="default">{t('tasksPage.sort.defaultOrder')}</option>
                  <option value="status">{t('tasksPage.sort.byStatus')}</option>
                  <option value="id">{t('tasksPage.sort.byTaskId')}</option>
                  <option value="description">{t('tasksPage.sort.byDescription')}</option>
                </select>

                {sortBy !== 'default' && (
                  <button
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="p-2 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-gray-800/80 focus:ring-2 focus:ring-purple-500 transition-all"
                    title={t(`tasksPage.sort.${sortOrder === 'asc' ? 'sortDescending' : 'sortAscending'}`)}
                  >
                    {sortOrder === 'asc' ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    )}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Results Summary */}
        {statusFilter !== 'all' && (
          <div className="mt-4 p-3 bg-purple-50/50 dark:bg-purple-900/10 border border-purple-200/50 dark:border-purple-800/50 rounded-xl backdrop-blur-sm">
            <div className="flex items-center gap-2 text-sm text-purple-700 dark:text-purple-300">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <span>
                {t('tasksPage.showingTasksWithStatus', { count: filteredAndSortedTasks.filter((t: any) => !t.isHeader).length, status: statusFilter.replace('-', ' ') })}
                {filteredAndSortedTasks.filter((t: any) => !t.isHeader).length === 0 && (
                  <span> - <button
                    onClick={() => setStatusFilter('all')}
                    className="underline hover:no-underline font-medium"
                  >
                    {t('tasksPage.showAllTasks')}
                  </button></span>
                )}
              </span>
            </div>
          </div>
        )}

        {/* Content Area - Conditional Rendering based on View Mode */}
        {viewMode === 'kanban' ? (
          filteredAndSortedTasks.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              <p className="text-lg font-medium">{t('tasksPage.noTasksFound')}</p>
              <p className="text-sm mt-1">
                {statusFilter !== 'all' ? (
                  <>{t('tasksPage.noTasksWithStatus', { status: statusFilter.replace('-', ' ') })} <button
                    onClick={() => setStatusFilter('all')}
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {t('tasksPage.showAllTasks')}
                  </button></>
                ) : (
                  t('tasksPage.noTasksAvailable')
                )}
              </p>
            </div>
          ) : (
            <KanbanBoard
              tasks={filteredAndSortedTasks}
              specName={specName}
              statusFilter={statusFilter}
              onTaskStatusChange={(taskId, newStatus) => {
                // Find the task and trigger the existing status change logic
                const task = filteredAndSortedTasks.find(t => t.id === taskId);
                if (task) {
                  // Mark this task as having a pending update
                  pendingStatusUpdatesRef.current.add(taskId);

                  // Optimistically update the task in local data
                  setData((prevData: any) => {
                    if (!prevData) return prevData;
                    const updatedTaskList = prevData.taskList.map((t: any) =>
                      t.id === taskId ? { ...t, status: newStatus, completed: newStatus === 'completed', inProgress: newStatus === 'in-progress' } : t
                    );
                    return {
                      ...prevData,
                      taskList: updatedTaskList,
                      completed: updatedTaskList.filter((t: any) => t.status === 'completed').length,
                      progress: prevData.total > 0 ? (updatedTaskList.filter((t: any) => t.status === 'completed').length / prevData.total) * 100 : 0,
                      inProgress: newStatus === 'in-progress' ? taskId : (prevData.inProgress === taskId ? null : prevData.inProgress)
                    };
                  });

                  // Call the API to update the task status
                  updateTaskStatus(specName, taskId, newStatus)
                    .then(() => {
                      // Remove from pending updates on success
                      pendingStatusUpdatesRef.current.delete(taskId);
                    })
                    .catch(() => {
                      // Remove from pending updates on error
                      pendingStatusUpdatesRef.current.delete(taskId);
                      // Revert on error - fetch fresh data
                      getSpecTasksProgress(specName).then(setData);
                    });
                }
              }}
              onCopyTaskPrompt={(task) => {
                copyTaskPrompt(specName, task, () => {
                  setCopiedTaskId(task.id);
                  setTimeout(() => setCopiedTaskId(null), 2000);
                });
              }}
              copiedTaskId={copiedTaskId}
              data={data}
            />
          )
        ) : filteredAndSortedTasks.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            <p className="text-lg font-medium">{t('tasksPage.noTasksFound')}</p>
            <p className="text-sm mt-1">
              {statusFilter !== 'all' ? (
                <>{t('tasksPage.noTasksWithStatus', { status: statusFilter.replace('-', ' ') })} <button
                  onClick={() => setStatusFilter('all')}
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {t('tasksPage.showAllTasks')}
                </button></>
              ) : (
                t('tasksPage.noTasksAvailable')
              )}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:gap-4">
            {filteredAndSortedTasks?.map((task: any) => (
              <div
                key={task.id}
                data-task-id={task.id}
                className={`bg-white dark:bg-gray-800 border rounded-lg p-4 sm:p-6 transition-all hover:shadow-md ${
                  task.isHeader
                    ? 'border-purple-200 dark:border-purple-700 bg-purple-50 dark:bg-purple-900/10'
                    : task.completed
                    ? 'border-green-200 dark:border-green-700 bg-green-50 dark:bg-green-900/10'
                    : data.inProgress === task.id
                    ? 'border-orange-200 dark:border-orange-700 bg-orange-50 dark:bg-orange-900/10'
                    : 'border-gray-200 dark:border-gray-600'
                }`}
              >
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="flex-shrink-0 mt-0.5">
                    {task.isHeader ? (
                      <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                        <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5a2 2 0 012-2h2a2 2 0 012 2v0M8 5a2 2 0 012-2h2a2 2 0 012 2v0" />
                        </svg>
                      </div>
                    ) : task.completed ? (
                      <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                        <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    ) : data.inProgress === task.id ? (
                      <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                        <svg className="w-4 h-4 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                        <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`font-medium text-sm sm:text-base ${
                          task.isHeader
                            ? 'text-purple-700 dark:text-purple-300'
                            : task.completed
                            ? 'text-green-700 dark:text-green-300'
                            : data.inProgress === task.id
                            ? 'text-orange-700 dark:text-orange-300'
                            : 'text-gray-900 dark:text-gray-200'
                        }`}>
                          {task.isHeader ? t('tasksPage.item.section') : t('tasksPage.item.task')} {task.id}
                        </span>
                        {!task.isHeader && (
                          <button
                            onClick={() => copyTaskPrompt(specName, task, () => {
                              setCopiedTaskId(task.id);
                              setTimeout(() => setCopiedTaskId(null), 2000);
                            })}
                            className={`px-2 sm:px-3 py-1 sm:py-1.5 text-xs rounded transition-colors flex items-center gap-1 min-h-[32px] sm:min-h-[36px] ${
                              copiedTaskId === task.id
                                ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}
                            title={t('tasksPage.copyPrompt.tooltip')}
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
                            <span className="hidden sm:inline">
                              {copiedTaskId === task.id ? t('tasksPage.copyPrompt.copied') : t('tasksPage.copyPrompt.copyPrompt')}
                            </span>
                            <span className="sm:hidden">
                              {copiedTaskId === task.id ? t('tasksPage.copyPrompt.copied') : t('tasksPage.copyPrompt.copy')}
                            </span>
                          </button>
                        )}
                        {task.isHeader && (
                          <span className="px-2 py-1 text-xs bg-purple-100 dark:bg-purple-800 text-purple-700 dark:text-purple-200 rounded whitespace-nowrap">
                            {t('tasksPage.item.groupBadge')}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {!task.isHeader && (
                          <StatusPill
                            currentStatus={task.status}
                            taskId={task.id}
                            specName={specName}
                            onStatusChange={(newStatus) => {
                              // Mark this task as having a pending update
                              pendingStatusUpdatesRef.current.add(task.id);

                              // Optimistically update the task in local data
                              setData((prevData: any) => {
                                if (!prevData) return prevData;
                                const updatedTaskList = prevData.taskList.map((t: any) =>
                                  t.id === task.id ? { ...t, status: newStatus, completed: newStatus === 'completed', inProgress: newStatus === 'in-progress' } : t
                                );
                                return {
                                  ...prevData,
                                  taskList: updatedTaskList,
                                  completed: updatedTaskList.filter((t: any) => t.status === 'completed').length,
                                  progress: prevData.total > 0 ? (updatedTaskList.filter((t: any) => t.status === 'completed').length / prevData.total) * 100 : 0,
                                  inProgress: newStatus === 'in-progress' ? task.id : (prevData.inProgress === task.id ? null : prevData.inProgress)
                                };
                              });

                              // Call the API to update the task status
                              updateTaskStatus(specName, task.id, newStatus)
                                .then(() => {
                                  // Remove from pending updates on success
                                  pendingStatusUpdatesRef.current.delete(task.id);
                                })
                                .catch(() => {
                                  // Remove from pending updates on error
                                  pendingStatusUpdatesRef.current.delete(task.id);
                                  // Revert on error - fetch fresh data
                                  getSpecTasksProgress(specName).then(setData);
                                });
                            }}
                          />
                        )}
                      </div>
                    </div>

                    <p className={`text-sm sm:text-base mt-2 ${
                      task.isHeader
                        ? 'text-purple-700 dark:text-purple-300 font-medium'
                        : task.completed
                        ? 'text-green-600 dark:text-green-400'
                        : data.inProgress === task.id
                        ? 'text-orange-600 dark:text-orange-400'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      {task.description}
                    </p>

                    {/* File paths */}
                    {task.files && task.files.length > 0 && (
                      <div className="mt-3 sm:mt-4">
                        <div className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-1">
                          <svg className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          {t('tasksPage.files.label')}
                        </div>
                        <div className="flex flex-wrap gap-1 sm:gap-2">
                          {task.files.map((file: string) => (
                            <span key={file} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded font-mono break-all">
                              {file}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Implementation details */}
                    {task.implementationDetails && task.implementationDetails.length > 0 && (
                      <div className="mt-3 sm:mt-4">
                        <div className="text-xs sm:text-sm font-medium text-indigo-600 dark:text-indigo-400 mb-2 flex items-center gap-1">
                          <svg className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {t('tasksPage.implementation.label')}
                        </div>
                        <ul className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 list-disc list-inside space-y-1">
                          {task.implementationDetails.map((detail: string, index: number) => (
                            <li key={index} className="break-words">{detail}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Additional task information */}
                    {task.requirements && task.requirements.length > 0 && (
                      <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3 flex items-start gap-1">
                        <svg className="w-3 h-3 sm:w-4 sm:h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                        <span className="break-words"><strong>Requirements:</strong> {task.requirements.join(', ')}</span>
                      </div>
                    )}

                    {task.leverage && (
                      <div className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 mt-2 flex items-start gap-1">
                        <svg className="w-3 h-3 sm:w-4 sm:h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        <span className="break-words"><strong>Leverage:</strong> {task.leverage}</span>
                      </div>
                    )}

                    {/* AI Prompt */}
                    {task.prompt && (
                      <div className="mt-3 sm:mt-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-xs sm:text-sm font-medium text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            AI Prompt:
                          </div>
                          <button
                            onClick={() => togglePromptExpansion(task.id)}
                            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200 transition-colors p-1"
                            title={expandedPrompts.has(task.id) ? 'Collapse prompt' : 'Expand prompt'}
                          >
                            {expandedPrompts.has(task.id) ? (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                              </svg>
                            ) : (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                              </svg>
                            )}
                          </button>
                        </div>
                        {expandedPrompts.has(task.id) && (
                          <div className="text-xs sm:text-sm text-indigo-900 dark:text-indigo-100 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 rounded px-3 py-2 whitespace-pre-wrap break-words">
                            {task.prompt}
                          </div>
                        )}                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-4 right-4 flex flex-col gap-3 z-40">
        {/* Scroll to Top Button */}
        {showScrollToTop && (
          <button
            onClick={scrollToTop}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-3 rounded-full shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 hover:scale-105 active:scale-95 transition-all duration-200 group"
            title="Scroll to top"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
            {/* Glass Tooltip */}
            <div className="absolute bottom-full right-0 mb-2 px-3 py-1.5 bg-purple-900/80 dark:bg-purple-950/90 backdrop-blur-md border border-purple-500/20 text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap pointer-events-none shadow-lg shadow-purple-500/10">
              Scroll to Top
              <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-purple-900/80 dark:border-t-purple-950/90"></div>
            </div>
          </button>
        )}

        {/* Next Pending Task Button */}
        {showFloatingButton && (
          <button
            onClick={scrollToNextPending}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-3 rounded-full shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 hover:scale-105 active:scale-95 transition-all duration-200 group"
            title="Jump to next pending task"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
            {/* Glass Tooltip */}
            <div className="absolute bottom-full right-0 mb-2 px-3 py-1.5 bg-purple-900/80 dark:bg-purple-950/90 backdrop-blur-md border border-purple-500/20 text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap pointer-events-none shadow-lg shadow-purple-500/10">
              Next Pending Task
              <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-purple-900/80 dark:border-t-purple-950/90"></div>
            </div>
          </button>
        )}
      </div>
    </div>
  );
}

function Content() {
  const { specs, reloadAll, info } = useApi();
  const { t } = useTranslation();
  const [params, setParams] = useSearchParams();
  const specFromUrl = params.get('spec');
  const [selected, setSelected] = useState<string>('');
  const [query, setQuery] = useState('');
  const [copyFailureModal, setCopyFailureModal] = useState<{ isOpen: boolean; text: string }>({ isOpen: false, text: '' });

  const handleCopyFailure = (text: string) => {
    setCopyFailureModal({ isOpen: true, text });
  };

  // Create project-scoped storage key
  const storageKey = useMemo(() =>
    info?.projectName ? `spec-workflow:${info.projectName}:selectedSpec` : null,
    [info?.projectName]
  );

  // Handle spec selection with URL and localStorage sync
  const handleSelectSpec = useCallback((specName: string) => {
    setSelected(specName);

    // Update URL parameter
    if (specName) {
      setParams({ spec: specName });
    } else {
      setParams({});
    }

    // Save to localStorage (project-scoped)
    if (storageKey) {
      if (specName) {
        localStorage.setItem(storageKey, specName);
      } else {
        localStorage.removeItem(storageKey);
      }
    }
  }, [storageKey, setParams]);

  // Initialize spec selection with three-tier approach
  useEffect(() => {
    if (specFromUrl) {
      // 1. URL parameter takes precedence (source of truth)
      if (specs.some(s => s.name === specFromUrl)) {
        setSelected(specFromUrl);
        // Sync to localStorage
        if (storageKey) {
          localStorage.setItem(storageKey, specFromUrl);
        }
      } else {
        // Invalid spec in URL, remove it
        setParams({});
      }
    } else if (storageKey && specs.length > 0) {
      // 2. Try localStorage fallback
      const storedSpec = localStorage.getItem(storageKey);
      if (storedSpec && specs.some(s => s.name === storedSpec)) {
        setSelected(storedSpec);
        // Update URL to reflect restored selection
        setParams({ spec: storedSpec });
      } else {
        // 3. Default to first spec if no valid stored selection
        if (specs[0] && !selected) {
          handleSelectSpec(specs[0].name);
        }
      }
    } else if (specs[0] && !selected && !specFromUrl) {
      // 4. Fallback when no localStorage available yet
      setSelected(specs[0].name);
    }
  }, [specs, specFromUrl, selected, storageKey, setParams, handleSelectSpec]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return specs;
    return specs.filter((s) => s.displayName.toLowerCase().includes(q) || s.name.toLowerCase().includes(q));
  }, [specs, query]);

  // If a spec is selected, show its task details
  if (selected) {
    // Get selected spec for dynamic title
    const selectedSpec = specs.find(s => s.name === selected);

    return (
      <div className="grid gap-4">
        {/* Header with Spec Selector - Glass styling */}
        <div className="glass-card p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white truncate">
              {selectedSpec
                ? `${t('tasksPage.header.title')}: ${selectedSpec.displayName}`
                : t('tasksPage.header.title')
              }
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {t('tasksPage.header.subtitle.selected')}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <SearchableSpecDropdown
              specs={specs}
              selected={selected}
              onSelect={handleSelectSpec}
              align="right"
            />
          </div>
        </div>
        <TaskList specName={selected} />
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {/* Header with Search - Glass styling */}
      <div className="glass-card p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">{t('tasksPage.header.title')}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {t('tasksPage.header.subtitle.unselected')}
          </p>
        </div>
        <div className="relative w-full sm:w-auto">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            className="pl-10 pr-4 py-2.5 rounded-full bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 w-full sm:w-64 transition-all"
            placeholder={t('tasksPage.search.placeholder')}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Spec Selection Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((spec) => (
            <SpecCard
              key={spec.name}
              spec={spec}
              onSelect={(s) => handleSelectSpec(s.name)}
              isSelected={selected === spec.name}
            />
          ))}
        </div>
      ) : (
        <div className="glass-card p-6 sm:p-12">
          <div className="text-center text-gray-500 dark:text-gray-400">
            <div className="mx-auto w-16 h-16 gradient-icon mb-4">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <p className="text-lg font-bold text-gray-900 dark:text-white mb-2">{t('tasksPage.noSpecsFound.title')}</p>
            <p className="text-sm">{query ? t('tasksPage.noSpecsFound.noMatch', { query }) : t('tasksPage.noSpecsFound.noSpecsAvailable')}</p>
          </div>
        </div>
      )}

      {/* Copy Failure Modal */}
      <AlertModal
        isOpen={copyFailureModal.isOpen}
        onClose={() => setCopyFailureModal({ isOpen: false, text: '' })}
        title={t('tasksPage.copyFailed.title')}
        message={`${t('tasksPage.copyFailed.message')}\n\n${copyFailureModal.text}`}
        variant="error"
        okText={t('common.close')}
      />
    </div>
  );
}

export function TasksPage() {
  return <Content />;
}


