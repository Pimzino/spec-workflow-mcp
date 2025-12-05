import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface ExecutionRecord {
  jobId: string;
  jobName: string;
  jobType: string;
  executedAt: string;
  success: boolean;
  duration: number;
  itemsProcessed: number;
  itemsDeleted: number;
  error?: string;
}

interface JobStats {
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  successRate: number;
  totalItemsDeleted: number;
  avgDuration: number;
  lastExecution: ExecutionRecord | null;
}

interface JobExecutionHistoryProps {
  jobId: string;
  isExpanded: boolean;
}

// Stat card icon components
const TotalRunsIcon = () => (
  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

const SuccessRateIcon = () => (
  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const DeletedIcon = () => (
  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const SuccessIcon = () => (
  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const FailedIcon = () => (
  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const DurationIcon = () => (
  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const HistoryIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const EmptyIcon = () => (
  <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
  </svg>
);

const ErrorIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

// Get success rate color gradient class based on percentage
const getSuccessRateGradient = (rate: number): string => {
  if (rate >= 80) return 'gradient-icon-green';
  if (rate >= 50) return 'gradient-icon-yellow';
  return 'gradient-icon-red';
};

export function JobExecutionHistory({ jobId, isExpanded }: JobExecutionHistoryProps) {
  const { t } = useTranslation();
  const [history, setHistory] = useState<ExecutionRecord[]>([]);
  const [stats, setStats] = useState<JobStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isExpanded) {
      loadData();
    }
  }, [isExpanded, jobId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [historyRes, statsRes] = await Promise.all([
        fetch(`/api/jobs/${jobId}/history?limit=20`),
        fetch(`/api/jobs/${jobId}/stats`)
      ]);

      if (historyRes.ok) {
        const historyData = await historyRes.json();
        setHistory(historyData);
      } else {
        throw new Error('Failed to load execution history');
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      } else {
        throw new Error('Failed to load statistics');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  if (!isExpanded) {
    return null;
  }

  // Loading state with gradient spinner
  if (loading) {
    return (
      <div className="p-4 glass border-t border-gray-200/30 dark:border-purple-500/10 animate-in fade-in duration-200">
        <div className="flex flex-col items-center justify-center py-6">
          <div className="spinner-gradient spinner-gradient-md mb-3" />
          <span className="text-gray-400 text-sm">Loading history...</span>
        </div>
      </div>
    );
  }

  // Error state with red-tinted glass
  if (error) {
    return (
      <div className="p-4 glass border-t border-red-300/30 dark:border-red-500/20 animate-in fade-in duration-200">
        <div className="glass-card p-4 border-red-200/50 dark:border-red-500/30" style={{ background: 'rgba(239, 68, 68, 0.1)' }}>
          <div className="flex items-center gap-3">
            <div className="gradient-icon-red w-10 h-10 flex-shrink-0">
              <ErrorIcon />
            </div>
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 glass border-t border-gray-200/30 dark:border-purple-500/10 space-y-4 animate-in slide-in-from-top-2 duration-300">
      {/* Statistics Summary */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {/* Total Runs */}
          <div className="glass-card p-3 glow-hover">
            <div className="flex items-center gap-2 mb-1">
              <div className="gradient-icon-blue w-7 h-7">
                <TotalRunsIcon />
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">Total Runs</span>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.totalExecutions}
            </div>
          </div>

          {/* Success Rate */}
          <div className="glass-card p-3 glow-hover">
            <div className="flex items-center gap-2 mb-1">
              <div className={`${getSuccessRateGradient(stats.successRate)} w-7 h-7`}>
                <SuccessRateIcon />
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">Success Rate</span>
            </div>
            <div className={`text-2xl font-bold ${
              stats.successRate >= 80
                ? 'text-green-600 dark:text-green-400'
                : stats.successRate >= 50
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-red-600 dark:text-red-400'
            }`}>
              {stats.successRate.toFixed(0)}%
            </div>
          </div>

          {/* Items Deleted */}
          <div className="glass-card p-3 glow-hover">
            <div className="flex items-center gap-2 mb-1">
              <div className="gradient-icon w-7 h-7">
                <DeletedIcon />
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">Items Deleted</span>
            </div>
            <div className="text-2xl font-bold gradient-text">
              {stats.totalItemsDeleted}
            </div>
          </div>

          {/* Successful */}
          <div className="glass-card p-3 glow-hover">
            <div className="flex items-center gap-2 mb-1">
              <div className="gradient-icon-green w-7 h-7">
                <SuccessIcon />
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">Successful</span>
            </div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {stats.successfulExecutions}
            </div>
          </div>

          {/* Failed */}
          <div className="glass-card p-3 glow-hover">
            <div className="flex items-center gap-2 mb-1">
              <div className="gradient-icon-red w-7 h-7">
                <FailedIcon />
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">Failed</span>
            </div>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {stats.failedExecutions}
            </div>
          </div>

          {/* Avg Duration */}
          <div className="glass-card p-3 glow-hover">
            <div className="flex items-center gap-2 mb-1">
              <div className="gradient-icon w-7 h-7">
                <DurationIcon />
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">Avg Duration</span>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {(stats.avgDuration / 1000).toFixed(1)}s
            </div>
          </div>
        </div>
      )}

      {/* Execution History */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="gradient-icon w-6 h-6">
            <HistoryIcon />
          </div>
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Recent Executions</h4>
        </div>

        {history.length === 0 ? (
          <div className="glass-card p-6 text-center">
            <div className="gradient-icon w-12 h-12 mx-auto mb-3">
              <EmptyIcon />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">No execution history yet</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
            {history.map((execution, index) => (
              <div
                key={`${execution.executedAt}-${index}`}
                className={`glass-card p-3 overflow-hidden relative card-lift ${
                  execution.success
                    ? 'border-l-[3px] border-l-green-500 dark:border-l-green-400'
                    : 'border-l-[3px] border-l-red-500 dark:border-l-red-400'
                }`}
                style={{
                  borderLeftStyle: 'solid',
                  borderImage: execution.success
                    ? 'linear-gradient(180deg, #22c55e 0%, #14b8a6 100%) 1'
                    : 'linear-gradient(180deg, #ef4444 0%, #f43f5e 100%) 1'
                }}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`status-badge ${execution.success ? 'status-badge-success' : 'status-badge-error'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${execution.success ? 'bg-green-500' : 'bg-red-500'}`}></span>
                      {execution.success ? 'Success' : 'Failed'}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {new Date(execution.executedAt).toLocaleString()}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-gray-50/50 dark:bg-gray-800/30 rounded-lg p-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400 block">Processed</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {execution.itemsProcessed}
                    </span>
                  </div>
                  <div className="bg-gray-50/50 dark:bg-gray-800/30 rounded-lg p-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400 block">Deleted</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {execution.itemsDeleted}
                    </span>
                  </div>
                  <div className="bg-gray-50/50 dark:bg-gray-800/30 rounded-lg p-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400 block">Duration</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {(execution.duration / 1000).toFixed(2)}s
                    </span>
                  </div>
                </div>

                {execution.error && (
                  <div className="mt-2 p-2 rounded-lg text-xs text-red-600 dark:text-red-400"
                    style={{
                      background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(244, 63, 94, 0.1) 100%)',
                      border: '1px solid rgba(239, 68, 68, 0.2)'
                    }}>
                    <div className="flex items-start gap-2">
                      <svg className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {execution.error}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
