import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useWs } from '../ws/WebSocketProvider';

export interface ActivityItem {
  id: string;
  type: 'spec-edit' | 'task-complete' | 'approval' | 'log' | 'steering-edit';
  title: string;
  description: string;
  timestamp: Date;
  status?: 'success' | 'pending' | 'info';
}

interface ActivitySidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

// Activity type icons
const ActivityIcon: React.FC<{ type: ActivityItem['type'] }> = ({ type }) => {
  switch (type) {
    case 'spec-edit':
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
    case 'task-complete':
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      );
    case 'approval':
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case 'log':
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" />
        </svg>
      );
    case 'steering-edit':
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      );
    default:
      return null;
  }
};

// Status dot component
const StatusDot: React.FC<{ status: ActivityItem['status'] }> = ({ status }) => {
  const colorClass = {
    success: 'bg-green-500',
    pending: 'bg-amber-500',
    info: 'bg-gray-400',
  }[status || 'info'];

  return (
    <span
      className={`w-2 h-2 rounded-full ${colorClass} flex-shrink-0`}
      style={{ boxShadow: status === 'success' ? '0 0 6px rgba(34, 197, 94, 0.5)' : status === 'pending' ? '0 0 6px rgba(251, 191, 36, 0.5)' : undefined }}
    />
  );
};

// Format relative time
const formatRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return '1 day ago';
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString();
};

export function ActivitySidebar({ isOpen, onClose }: ActivitySidebarProps) {
  const { t } = useTranslation();
  const { subscribe, unsubscribe } = useWs();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const MAX_ACTIVITIES = 15;

  // Add new activity to the list
  const addActivity = useCallback((activity: Omit<ActivityItem, 'id' | 'timestamp'>) => {
    const newActivity: ActivityItem = {
      ...activity,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
    };
    setActivities((prev) => [newActivity, ...prev].slice(0, MAX_ACTIVITIES));
  }, []);

  // Subscribe to WebSocket events
  useEffect(() => {
    const handleSpecUpdate = (data: any) => {
      if (data?.name) {
        addActivity({
          type: 'spec-edit',
          title: t('activity.specEdited', 'Spec edited'),
          description: t('activity.specEditedDesc', 'Spec for {{name}} has been edited', { name: data.name }),
          status: 'success',
        });
      }
    };

    const handleTaskUpdate = (data: any) => {
      if (data?.taskId && data?.status === 'completed') {
        addActivity({
          type: 'task-complete',
          title: t('activity.taskCompleted', 'Task completed'),
          description: t('activity.taskCompletedDesc', 'Task {{id}} completed', { id: data.taskId }),
          status: 'success',
        });
      }
    };

    const handleApprovalUpdate = (data: any) => {
      const statusText = data?.status === 'approved' ? t('activity.approved', 'approved') :
                         data?.status === 'rejected' ? t('activity.rejected', 'rejected') :
                         t('activity.pending', 'pending');
      if (data?.title || data?.filePath) {
        addActivity({
          type: 'approval',
          title: t('activity.approval', 'Approval update'),
          description: t('activity.approvalDesc', 'Approval for {{title}} {{status}}', {
            title: data.title || data.filePath || 'document',
            status: statusText
          }),
          status: data?.status === 'approved' ? 'success' : data?.status === 'pending' ? 'pending' : 'info',
        });
      }
    };

    const handleLogUpdate = (data: any) => {
      addActivity({
        type: 'log',
        title: t('activity.logAdded', 'Log added'),
        description: t('activity.logAddedDesc', 'Implementation log added'),
        status: 'info',
      });
    };

    const handleSteeringUpdate = (data: any) => {
      const docType = data?.type || 'document';
      addActivity({
        type: 'steering-edit',
        title: t('activity.steeringEdited', 'Steering updated'),
        description: t('activity.steeringEditedDesc', '{{type}} document updated', { type: docType }),
        status: 'success',
      });
    };

    // Subscribe to events
    subscribe('spec-update', handleSpecUpdate);
    subscribe('task-update', handleTaskUpdate);
    subscribe('approval-update', handleApprovalUpdate);
    subscribe('approvals-update', handleApprovalUpdate);
    subscribe('log-update', handleLogUpdate);
    subscribe('logs-update', handleLogUpdate);
    subscribe('steering-update', handleSteeringUpdate);

    return () => {
      unsubscribe('spec-update', handleSpecUpdate);
      unsubscribe('task-update', handleTaskUpdate);
      unsubscribe('approval-update', handleApprovalUpdate);
      unsubscribe('approvals-update', handleApprovalUpdate);
      unsubscribe('log-update', handleLogUpdate);
      unsubscribe('logs-update', handleLogUpdate);
      unsubscribe('steering-update', handleSteeringUpdate);
    };
  }, [subscribe, unsubscribe, addActivity, t]);

  return (
    <>
      {/* Mobile overlay backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 right-0 z-50 h-full w-[280px]
          bg-white/95 dark:bg-[#1e1b2e]/95 backdrop-blur-xl
          border-l border-gray-200 dark:border-[#2d2640]/50
          transform transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:z-30
          ${isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
          flex flex-col
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200 dark:border-[#2d2640]/50">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {t('activity.lastActions', 'Last actions')}
          </h2>
          <div className="flex items-center gap-2">
            <button
              className="p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title={t('activity.settings', 'Activity settings')}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
            {/* Close button for mobile */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors lg:hidden"
              aria-label={t('common.close', 'Close')}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Activity List */}
        <div className="flex-1 overflow-y-auto px-4 py-3">
          {activities.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-8">
              <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('activity.noActivity', 'No recent activity')}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                {t('activity.noActivityDesc', 'Actions will appear here as you work')}
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className="group flex items-start gap-3 p-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-default"
                >
                  {/* Status dot */}
                  <div className="mt-1.5">
                    <StatusDot status={activity.status} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-gray-500 dark:text-gray-400">
                        <ActivityIcon type={activity.type} />
                      </span>
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">
                        {activity.title}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                      {activity.description}
                    </p>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">
                      {formatRelativeTime(activity.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer - Show all actions button */}
        <div className="px-4 py-3 border-t border-gray-200 dark:border-[#2d2640]/50">
          <button
            className="w-full py-2.5 px-4 rounded-xl text-sm font-medium text-gray-900 transition-all duration-200 btn-gradient-yellow"
            onClick={() => {
              // Could navigate to a full activity log page in the future
            }}
          >
            {t('activity.showAll', 'Show all actions')}
          </button>
        </div>
      </aside>
    </>
  );
}
