import React, { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import { ApiProvider, useApi } from '../api/api';
import { useWs } from '../ws/WebSocketProvider';
import { useSearchParams } from 'react-router-dom';
import { useNotifications } from '../notifications/NotificationProvider';
import { AlertModal } from '../modals/AlertModal';

function formatDate(dateStr?: string) {
  if (!dateStr) return 'Never';
  return new Date(dateStr).toLocaleDateString(undefined, { 
    month: 'short', 
    day: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit' 
  });
}

function SearchableSpecDropdown({ specs, selected, onSelect }: { specs: any[]; selected: string; onSelect: (value: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

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

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
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
        className="flex items-center justify-between w-full sm:w-auto md:w-auto min-w-[200px] md:min-w-[240px] px-3 py-2 md:px-4 md:py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
      >
        <span className="truncate">
          {selectedSpec ? selectedSpec.displayName : 'Select a spec...'}
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
        <div className="absolute top-full mt-1 w-full sm:w-80 md:w-96 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-50 max-h-96 overflow-hidden">
          {/* Search Input */}
          <div className="p-3 md:p-4 border-b border-gray-200 dark:border-gray-600">
            <input
              type="text"
              placeholder="Search specs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              autoFocus
            />
          </div>
          
          {/* Options List */}
          <div className="max-h-60 overflow-y-auto">
            {filteredSpecs.length > 0 ? (
              filteredSpecs.map((spec) => (
                <button
                  key={spec.name}
                  onClick={() => handleSelect(spec)}
                  className={`w-full px-4 py-3 md:px-6 md:py-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700 focus:bg-gray-50 dark:focus:bg-gray-700 transition-colors ${
                    selected === spec.name ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' : 'text-gray-900 dark:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{spec.displayName}</div>
                      {spec.taskProgress && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {spec.taskProgress.completed} / {spec.taskProgress.total} tasks completed
                        </div>
                      )}
                    </div>
                    {selected === spec.name && (
                      <svg className="w-4 h-4 text-blue-600 dark:text-blue-400 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                <p className="text-sm">No specs found</p>
                <p className="text-xs mt-1">Try adjusting your search</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function copyTaskPrompt(specName: string, taskId: string, onSuccess?: () => void, onFailure?: (text: string) => void) {
  const command = `Please work on task ${taskId} for spec "${specName}"`;
  
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
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const { updateTaskStatus } = useApi();
  const { showNotification } = useNotifications();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const statusConfig = {
    'pending': {
      label: 'Pending',
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
      label: 'In Progress',
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
      label: 'Completed',
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

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
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
        const statusLabel = newStatus === 'completed' ? 'completed' : 
                          newStatus === 'in-progress' ? 'in progress' : 'pending';
        showNotification(`Task ${taskId} marked as ${statusLabel}`, 'success');
      } else {
        // Handle error - show error notification
        showNotification(`Failed to update task ${taskId} status`, 'error');
        console.error('Failed to update task status');
      }
    } catch (error) {
      showNotification(`Error updating task ${taskId} status`, 'error');
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
        title="Click to change status"
      >
        {isUpdating ? (
          <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
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
  const progress = spec.taskProgress?.total
    ? Math.round((spec.taskProgress.completed / spec.taskProgress.total) * 100)
    : 0;
  
  return (
    <div 
      className={`bg-white dark:bg-gray-800 shadow rounded-lg cursor-pointer hover:shadow-lg transition-all ${
        isSelected ? 'ring-2 ring-blue-500' : ''
      } ${
        spec.status === 'completed' ? 'opacity-75' : ''
      }`}
      onClick={() => onSelect(spec)}
    >
      <div className="p-4 sm:p-6 md:p-8">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className={`text-base sm:text-lg md:text-xl font-medium mb-2 truncate ${
              spec.status === 'completed' 
                ? 'text-gray-600 dark:text-gray-400' 
                : 'text-gray-900 dark:text-white'
            }`}>
              {spec.displayName}
            </h3>
            <div className={`flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-xs sm:text-sm md:text-base space-y-1 sm:space-y-0 ${
              spec.status === 'completed' 
                ? 'text-gray-400 dark:text-gray-500' 
                : 'text-gray-500 dark:text-gray-400'
            }`}>
              <span className="flex items-center gap-1">
                <svg className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {formatDate(spec.lastModified)}
              </span>
              {spec.taskProgress && (
                <span className="flex items-center gap-1">
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                  <span className="truncate">{spec.taskProgress.completed} / {spec.taskProgress.total} tasks</span>
                </span>
              )}
            </div>
          </div>
          <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-gray-400 ml-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        </div>

        {/* Progress bar */}
        {spec.taskProgress && spec.taskProgress.total > 0 && (
          <div className="mt-3 sm:mt-4">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {progress}% complete
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function TaskList({ specName }: { specName: string }) {
  const { getSpecTasksProgress } = useApi();
  const { subscribe, unsubscribe } = useWs();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any | null>(null);
  const [showFloatingButton, setShowFloatingButton] = useState(false);
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const [copiedTaskId, setCopiedTaskId] = useState<string | null>(null);
  
  // Filter and sort state
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'in-progress' | 'completed'>('all');
  const [sortBy, setSortBy] = useState<'default' | 'status' | 'id' | 'description'>('default');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // Storage key for per-spec preferences
  const storageKey = useMemo(() => `spec-workflow:task-preferences:${specName}`, [specName]);

  // Load preferences from localStorage
  useEffect(() => {
    try {
      const savedPreferences = localStorage.getItem(storageKey);
      if (savedPreferences) {
        const { statusFilter: savedStatusFilter, sortBy: savedSortBy, sortOrder: savedSortOrder } = JSON.parse(savedPreferences);
        if (savedStatusFilter) setStatusFilter(savedStatusFilter);
        if (savedSortBy) setSortBy(savedSortBy);
        if (savedSortOrder) setSortOrder(savedSortOrder);
      }
    } catch (error) {
      // Ignore localStorage errors
      console.warn('Failed to load task preferences from localStorage:', error);
    }
  }, [storageKey]);
  
  // Save preferences to localStorage
  useEffect(() => {
    try {
      const preferences = { statusFilter, sortBy, sortOrder };
      localStorage.setItem(storageKey, JSON.stringify(preferences));
    } catch (error) {
      // Ignore localStorage errors
      console.warn('Failed to save task preferences to localStorage:', error);
    }
  }, [storageKey, statusFilter, sortBy, sortOrder]);

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
          
          return {
            ...prevData,
            taskList: event.taskList,
            completed: event.summary.completed,
            total: event.summary.total,
            progress: event.summary.total > 0 ? (event.summary.completed / event.summary.total) * 100 : 0,
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
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="flex items-center justify-center py-12">
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Loading task progress…</span>
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
          <p className="text-lg font-medium">No task data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white truncate">
              Task Progress: {specName.replace(/-/g, ' ')}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Manage and track task completion
            </p>
          </div>
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Tasks Card */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-2 sm:mb-3">
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <svg className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <div className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Total</div>
          </div>
          <div className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-1">{data.total}</div>
          <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">All tasks</div>
        </div>

        {/* Completed Tasks Card */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-2 sm:mb-3">
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <svg className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Done</div>
          </div>
          <div className="text-xl sm:text-2xl font-semibold text-green-600 dark:text-green-400 mb-1">{data.completed}</div>
          <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Completed</div>
        </div>

        {/* Remaining Tasks Card */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-2 sm:mb-3">
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <svg className="w-3 h-3 sm:w-4 sm:h-4 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Left</div>
          </div>
          <div className="text-xl sm:text-2xl font-semibold text-amber-600 dark:text-amber-400 mb-1">{data.total - data.completed}</div>
          <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Remaining</div>
        </div>

        {/* Progress Percentage Card */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-2 sm:mb-3">
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <svg className="w-3 h-3 sm:w-4 sm:h-4 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Progress</div>
          </div>
          <div className="text-xl sm:text-2xl font-semibold text-purple-600 dark:text-purple-400 mb-1">{Math.round(data.progress)}%</div>
          <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Complete</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 sm:p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">Overall Progress</h3>
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{Math.round(data.progress)}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 sm:h-3">
          <div
            className="bg-blue-600 dark:bg-blue-500 h-2 sm:h-3 rounded-full transition-all duration-500"
            style={{ width: `${data.progress}%` }}
          />
        </div>
      </div>

      {/* Filter and Sort Controls */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white">Task Details</h3>
          
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">Status:</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'pending' | 'in-progress' | 'completed')}
                className="px-3 py-1.5 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All ({taskCounts.all})</option>
                <option value="pending">Pending ({taskCounts.pending})</option>
                <option value="in-progress">In Progress ({taskCounts['in-progress']})</option>
                <option value="completed">Completed ({taskCounts.completed})</option>
              </select>
            </div>
            
            {/* Sort Controls */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">Sort:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'default' | 'status' | 'id' | 'description')}
                className="px-3 py-1.5 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="default">Default Order</option>
                <option value="status">By Status</option>
                <option value="id">By Task ID</option>
                <option value="description">By Description</option>
              </select>
              
              {sortBy !== 'default' && (
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="px-2 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  title={`Sort ${sortOrder === 'asc' ? 'descending' : 'ascending'}`}
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
          </div>
        </div>
        
        {/* Results Summary */}
        {statusFilter !== 'all' && (
          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
            <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <span>
                Showing {filteredAndSortedTasks.filter((t: any) => !t.isHeader).length} tasks with status "{statusFilter.replace('-', ' ')}"
                {filteredAndSortedTasks.filter((t: any) => !t.isHeader).length === 0 && (
                  <span> - <button 
                    onClick={() => setStatusFilter('all')}
                    className="underline hover:no-underline"
                  >
                    show all tasks
                  </button></span>
                )}
              </span>
            </div>
          </div>
        )}
        
        {filteredAndSortedTasks.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            <p className="text-lg font-medium">No tasks found</p>
            <p className="text-sm mt-1">
              {statusFilter !== 'all' ? (
                <>No tasks with status "{statusFilter.replace('-', ' ')}" found. <button 
                  onClick={() => setStatusFilter('all')}
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Show all tasks
                </button></>
              ) : (
                'No tasks available for this specification'
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
                          {task.isHeader ? 'Section' : 'Task'} {task.id}
                        </span>
                        {!task.isHeader && (
                          <button
                            onClick={() => copyTaskPrompt(specName, task.id, () => {
                              setCopiedTaskId(task.id);
                              setTimeout(() => setCopiedTaskId(null), 2000);
                            })}
                            className={`px-2 sm:px-3 py-1 sm:py-1.5 text-xs rounded transition-colors flex items-center gap-1 min-h-[32px] sm:min-h-[36px] ${
                              copiedTaskId === task.id 
                                ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' 
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}
                            title="Copy prompt for AI agent"
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
                              {copiedTaskId === task.id ? 'Copied!' : 'Copy Prompt'}
                            </span>
                            <span className="sm:hidden">
                              {copiedTaskId === task.id ? 'Copied!' : 'Copy'}
                            </span>
                          </button>
                        )}
                        {task.isHeader && (
                          <span className="px-2 py-1 text-xs bg-purple-100 dark:bg-purple-800 text-purple-700 dark:text-purple-200 rounded whitespace-nowrap">
                            Task Group
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
                          Files:
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
                          Implementation:
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
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-4 right-4 flex flex-col gap-2 z-40">
        {/* Scroll to Top Button */}
        {showScrollToTop && (
          <button
            onClick={scrollToTop}
            className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group"
            title="Scroll to top"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
            {/* Tooltip */}
            <div className="absolute bottom-full right-0 mb-2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
              Scroll to Top
              <div className="absolute top-full right-3 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-gray-900 dark:border-t-gray-700"></div>
            </div>
          </button>
        )}

        {/* Next Pending Task Button */}
        {showFloatingButton && (
          <button
            onClick={scrollToNextPending}
            className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group"
            title="Jump to next pending task"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
            {/* Tooltip */}
            <div className="absolute bottom-full right-0 mb-2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
              Next Pending Task
              <div className="absolute top-full right-3 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-gray-900 dark:border-t-gray-700"></div>
            </div>
          </button>
        )}
      </div>
    </div>
  );
}

function Content() {
  const { specs, reloadAll, info } = useApi();
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
  
  useEffect(() => { reloadAll(); }, [reloadAll]);

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
    return (
      <div className="grid gap-4">
        {/* Header with Spec Selector */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Task Management</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Manage and track task completion
            </p>
          </div>
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">Spec:</label>
            <SearchableSpecDropdown 
              specs={specs}
              selected={selected}
              onSelect={handleSelectSpec}
            />
          </div>
        </div>
        <TaskList specName={selected} />
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {/* Header with Search */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Task Management</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Select a specification to view and manage its tasks
          </p>
        </div>
        <input 
          className="px-3 py-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-auto" 
          placeholder="Search specs..." 
          value={query} 
          onChange={(e) => setQuery(e.target.value)} 
        />
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
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 sm:p-12">
          <div className="text-center text-gray-500 dark:text-gray-400">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p className="text-lg font-medium mb-2">No specs found</p>
            <p className="text-sm">{query ? `No specs match "${query}"` : 'No specifications available to manage tasks for.'}</p>
          </div>
        </div>
      )}

      {/* Copy Failure Modal */}
      <AlertModal
        isOpen={copyFailureModal.isOpen}
        onClose={() => setCopyFailureModal({ isOpen: false, text: '' })}
        title="Copy Failed"
        message={`Copy failed. Please copy this text manually:\n\n${copyFailureModal.text}`}
        variant="error"
        okText="Close"
      />
    </div>
  );
}

export function TasksPage() {
  const { initial } = useWs();
  return (
    <ApiProvider initial={initial}>
      <Content />
    </ApiProvider>
  );
}


