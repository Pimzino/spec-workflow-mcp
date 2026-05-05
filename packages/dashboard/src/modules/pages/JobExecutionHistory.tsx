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

  if (loading) {
    return (
      <div className="p-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-600">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Loading history...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 border-t border-red-200 dark:border-red-800">
        <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-600 space-y-4">
      {/* Statistics Summary */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
            <div className="text-xs text-gray-600 dark:text-gray-400">Total Runs</div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {stats.totalExecutions}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
            <div className="text-xs text-gray-600 dark:text-gray-400">Success Rate</div>
            <div className={`text-lg font-semibold ${stats.successRate === 100 ? 'text-green-600 dark:text-green-400' : stats.successRate >= 50 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'}`}>
              {stats.successRate.toFixed(0)}%
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
            <div className="text-xs text-gray-600 dark:text-gray-400">Items Deleted</div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {stats.totalItemsDeleted}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
            <div className="text-xs text-gray-600 dark:text-gray-400">Successful</div>
            <div className="text-lg font-semibold text-green-600 dark:text-green-400">
              {stats.successfulExecutions}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
            <div className="text-xs text-gray-600 dark:text-gray-400">Failed</div>
            <div className="text-lg font-semibold text-red-600 dark:text-red-400">
              {stats.failedExecutions}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
            <div className="text-xs text-gray-600 dark:text-gray-400">Avg Duration</div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {(stats.avgDuration / 1000).toFixed(1)}s
            </div>
          </div>
        </div>
      )}

      {/* Execution History */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Recent Executions</h4>
        {history.length === 0 ? (
          <div className="p-3 text-center text-sm text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-lg">
            No execution history yet
          </div>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {history.map((execution, index) => (
              <div
                key={`${execution.executedAt}-${index}`}
                className="p-3 bg-white dark:bg-gray-800 rounded-lg border-l-4"
                style={{
                  borderLeftColor: execution.success ? '#10b981' : '#ef4444'
                }}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`inline-block w-2 h-2 rounded-full ${execution.success ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {execution.success ? 'Success' : 'Failed'}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(execution.executedAt).toLocaleString()}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Processed:</span>
                    <span className="ml-1 font-medium text-gray-900 dark:text-white">
                      {execution.itemsProcessed}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Deleted:</span>
                    <span className="ml-1 font-medium text-gray-900 dark:text-white">
                      {execution.itemsDeleted}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Duration:</span>
                    <span className="ml-1 font-medium text-gray-900 dark:text-white">
                      {(execution.duration / 1000).toFixed(2)}s
                    </span>
                  </div>
                </div>

                {execution.error && (
                  <div className="mt-2 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-2 rounded">
                    {execution.error}
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
