import React, { createContext, useContext, useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useApi } from '../api/api';
import { Howl } from 'howler';

// Split into two contexts to prevent unnecessary re-renders
// Actions context contains stable functions that don't change
type NotificationActionsContextType = {
  showNotification: (message: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
  removeNotification: (id: string) => void;
  toggleSound: () => void;
  setVolume: (volume: number) => void;
};

// State context contains dynamic state that changes frequently
type NotificationStateContextType = {
  notifications: Array<{ id: string; message: string; type: 'info' | 'success' | 'warning' | 'error'; timestamp: number }>;
  soundEnabled: boolean;
  volume: number;
};

const NotificationActionsContext = createContext<NotificationActionsContextType | undefined>(undefined);
const NotificationStateContext = createContext<NotificationStateContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  console.log('[NotificationProvider] ========== COMPONENT MOUNTED WITH DIAGNOSTIC CODE ==========');
  const { approvals, specs, getSpecTasksProgress } = useApi();
  const prevApprovalsRef = useRef<typeof approvals>([]);
  const prevTaskDataRef = useRef<Map<string, any>>(new Map());
  const isInitialLoadRef = useRef(true);
  const [notifications, setNotifications] = useState<Array<{ id: string; message: string; type: 'info' | 'success' | 'warning' | 'error'; timestamp: number }>>([]);
  const [soundEnabled, setSoundEnabled] = useState(() => {
    // Load sound preference from localStorage
    const saved = localStorage.getItem('notification-sound-enabled');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [volume, setVolumeState] = useState(() => {
    // Load volume preference from localStorage, default to max volume (100%)
    const saved = localStorage.getItem('notification-volume');
    return saved !== null ? parseFloat(saved) : 1.0;
  });

  // Toggle sound setting
  const toggleSound = useCallback(() => {
    setSoundEnabled(prev => {
      const newValue = !prev;
      localStorage.setItem('notification-sound-enabled', JSON.stringify(newValue));
      return newValue;
    });
  }, []);

  // Set volume (0.0 to 1.0)
  const setVolume = useCallback((newVolume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    setVolumeState(clampedVolume);
    localStorage.setItem('notification-volume', clampedVolume.toString());
  }, []);

  // Play notification sound using Howler.js
  const playNotificationSound = useCallback(() => {
    console.log('[Audio] playNotificationSound called - soundEnabled:', soundEnabled, 'volume:', volume);

    if (!soundEnabled) {
      console.log('[Audio] Sound is disabled, skipping playback');
      return;
    }

    try {
      console.log('[Audio] Playing notification with Howler - volume:', volume);

      // Create a simple notification beep programmatically
      // Using a publicly available notification sound for reliable testing
      // You can replace this with a local audio file later
      const notificationSound = 'https://notificationsounds.com/storage/sounds/file-sounds-1150-pristine.mp3';

      const sound = new Howl({
        src: [notificationSound],
        volume: volume,  // Howler.js volume control - should work correctly!
        html5: true, // Use HTML5 Audio (more reliable for simple sounds)
        onend: function() {
          sound.unload(); // Clean up after playing
        },
        onload: function() {
          console.log('[Audio] Howler sound loaded successfully');
        },
        onloaderror: function(id, error) {
          console.error('[Audio] Howler load error:', id, error);
          // Fallback: try to play with Web Audio anyway
        },
        onplayerror: function(id, error) {
          console.error('[Audio] Howler play error:', id, error);
        }
      });

      sound.play();
      console.log('[Audio] Howler sound playing - current volume:', sound.volume());
    } catch (error) {
      console.error('Could not play notification sound:', error);
    }
  }, [soundEnabled, volume]);


  // Show toast notification
  const showNotification = useCallback((message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info', playSound: boolean = true) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const notification = { id, message, type, timestamp: Date.now() };

    setNotifications(prev => [...prev, notification]);

    // Play notification sound (unless explicitly disabled)
    if (playSound) {
      playNotificationSound();
    }

    // Auto-remove after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  }, [playNotificationSound]);

  // Remove notification manually
  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  // Function to handle task updates
  const handleTaskUpdate = useCallback(async (specName: string, specDisplayName: string) => {
    try {
      console.log('[NotificationProvider] Handling task update for:', specName);
      
      // Fetch detailed task progress
      const currentTaskData = await getSpecTasksProgress(specName);
      const prevTaskData = prevTaskDataRef.current.get(specName);
      
      console.log('[NotificationProvider] Current task data:', currentTaskData);
      console.log('[NotificationProvider] Previous task data:', prevTaskData);
      
      if (prevTaskData && currentTaskData) {
        // Check for completion changes
        if (currentTaskData.completed > prevTaskData.completed) {
          const newlyCompleted = currentTaskData.completed - prevTaskData.completed;
          const message = newlyCompleted === 1 
            ? `Task completed in ${specDisplayName} (${currentTaskData.completed}/${currentTaskData.total})`
            : `${newlyCompleted} tasks completed in ${specDisplayName} (${currentTaskData.completed}/${currentTaskData.total})`;
          
          console.log('[NotificationProvider] Task completion detected:', message);
          showNotification(message, 'success');
        }

        // Check for in-progress changes
        if (currentTaskData.inProgress !== prevTaskData.inProgress) {
          if (currentTaskData.inProgress && !prevTaskData.inProgress) {
            // Task moved to in-progress
            const taskId = currentTaskData.inProgress;
            const task = currentTaskData.taskList?.find((t: any) => t.id === taskId || t.number === taskId);
            const taskTitle = task?.title || task?.description || `Task ${taskId}`;

            const message = `Task started: ${taskTitle} in ${specDisplayName}`;
            console.log('[NotificationProvider] Task in-progress detected:', message);
            showNotification(message, 'info');
          }
        }
        
        // Check if all tasks are now completed (project finished)
        if (currentTaskData.completed === currentTaskData.total && 
            prevTaskData.completed < currentTaskData.total && 
            currentTaskData.total > 0) {
          const message = `🎉 All tasks completed in ${specDisplayName}!`;
          console.log('[NotificationProvider] Project completion detected:', message);
          showNotification(message, 'success');
        }
      }
      
      // Store current data for next comparison
      prevTaskDataRef.current.set(specName, currentTaskData);
      
    } catch (error) {
      console.error('[NotificationProvider] Failed to handle task update:', error);
    }
  }, [getSpecTasksProgress, showNotification]);

  // Detect new approvals
  useEffect(() => {
    if (isInitialLoadRef.current) {
      // Skip notification on initial load
      prevApprovalsRef.current = approvals;
      isInitialLoadRef.current = false;
      return;
    }

    // Find new approvals by comparing IDs (not just array length)
    const prevIds = new Set(prevApprovalsRef.current.map(a => a.id));
    const newApprovals = approvals.filter(a => !prevIds.has(a.id));
    
    if (newApprovals.length > 0) {
      // Play sound once for all new approvals
      playNotificationSound();

      // Show notifications for each new approval (without playing sound for each)
      newApprovals.forEach(approval => {
        const message = `New approval request: ${approval.title}`;
        showNotification(message, 'info', false); // Pass false to skip sound for each toast
      });
    }

    prevApprovalsRef.current = approvals;
  }, [approvals, playNotificationSound, showNotification]);

  // Initialize task data on mount only
  useEffect(() => {
    if (isInitialLoadRef.current) {
      // Initialize task data for all specs on first load
      specs.forEach(spec => {
        handleTaskUpdate(spec.name, spec.displayName);
      });
      isInitialLoadRef.current = false;
    }
  }, []); // Empty dependency array - only run on mount

  // Memoize actions context - this should rarely change since functions are stable
  const actionsValue = useMemo(() => ({
    showNotification,
    removeNotification,
    toggleSound,
    setVolume
  }), [showNotification, removeNotification, toggleSound, setVolume]);

  // Memoize state context - this changes when notifications/settings change
  const stateValue = useMemo(() => ({
    notifications,
    soundEnabled,
    volume
  }), [notifications, soundEnabled, volume]);

  return (
    <NotificationActionsContext.Provider value={actionsValue}>
      <NotificationStateContext.Provider value={stateValue}>
        {children}
        <NotificationToasts />
      </NotificationStateContext.Provider>
    </NotificationActionsContext.Provider>
  );
}

// Toast notifications component
function NotificationToasts() {
  const { removeNotification } = useNotifications();
  const { notifications } = useNotificationState();

  // Get toast card styling based on notification type
  const getToastStyles = (type: 'info' | 'success' | 'warning' | 'error') => {
    switch (type) {
      case 'error':
        return 'bg-red-500/10 border-red-500/30 shadow-red-500/20';
      case 'warning':
        return 'bg-amber-500/10 border-amber-500/30 shadow-amber-500/20';
      case 'success':
        return 'bg-green-500/10 border-green-500/30 shadow-green-500/20';
      case 'info':
      default:
        return 'bg-purple-500/10 border-purple-500/30 shadow-purple-500/20';
    }
  };

  // Get icon container gradient based on notification type
  const getIconGradient = (type: 'info' | 'success' | 'warning' | 'error') => {
    switch (type) {
      case 'error':
        return 'bg-gradient-to-br from-red-500 to-rose-500';
      case 'warning':
        return 'bg-gradient-to-br from-amber-500 to-orange-500';
      case 'success':
        return 'bg-gradient-to-br from-green-500 to-emerald-500';
      case 'info':
      default:
        return 'bg-gradient-to-br from-purple-500 to-indigo-500';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {notifications.map(notification => (
        <div
          key={notification.id}
          className={`rounded-xl p-4 shadow-lg border backdrop-blur-md transition-all duration-300 animate-slide-in-right ${getToastStyles(notification.type)}`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              {/* Icon with gradient background container */}
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${getIconGradient(notification.type)}`}>
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {notification.type === 'error' ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  ) : notification.type === 'warning' ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                  ) : notification.type === 'success' ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  )}
                </svg>
              </div>
              <p className="text-sm font-medium break-words text-gray-900 dark:text-white pt-1">
                {notification.message}
              </p>
            </div>
            <button
              onClick={() => removeNotification(notification.id)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-white/10 rounded-lg p-1 transition-all duration-200 flex-shrink-0"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// Hook for accessing notification actions (stable, won't cause re-renders when notifications change)
export function useNotifications(): NotificationActionsContextType {
  const ctx = useContext(NotificationActionsContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
}

// Hook for accessing notification state (will cause re-renders when state changes)
export function useNotificationState(): NotificationStateContextType {
  const ctx = useContext(NotificationStateContext);
  if (!ctx) throw new Error('useNotificationState must be used within NotificationProvider');
  return ctx;
}