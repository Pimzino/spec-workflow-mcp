import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ChevronRightIcon,
  ChevronDownIcon,
  Cog6ToothIcon,
  TrashIcon,
  ArchiveBoxIcon,
  DocumentIcon,
  ClockIcon,
  PlayIcon,
  PencilIcon
} from '@heroicons/react/24/solid';
import { AutomationJob } from '../../types';
import { JobFormModal } from './JobFormModal';
import { JobExecutionHistory } from './JobExecutionHistory';

interface JobUIState {
  id: string;
  name: string;
  type: 'cleanup-approvals' | 'cleanup-specs' | 'cleanup-archived-specs';
  enabled: boolean;
  daysOld: number;
  schedule: string;
  lastRun?: string;
  nextRun?: string;
}

// Custom Toggle Switch Component
function ToggleSwitch({
  checked,
  onChange,
  disabled = false
}: {
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      disabled={disabled}
      className={`
        relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300
        focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${checked
          ? 'bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg shadow-purple-500/30'
          : 'bg-gray-600 dark:bg-gray-700'
        }
      `}
    >
      <span
        className={`
          inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-300
          ${checked ? 'translate-x-6' : 'translate-x-1'}
        `}
      />
    </button>
  );
}

// Job Type Icon Component
function JobTypeIcon({ type }: { type: string }) {
  const iconClasses = "w-5 h-5 text-white";

  const getGradientClass = () => {
    switch (type) {
      case 'cleanup-approvals':
        return 'gradient-purple';
      case 'cleanup-specs':
        return 'gradient-blue';
      case 'cleanup-archived-specs':
        return 'gradient-green';
      default:
        return 'gradient-purple';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'cleanup-approvals':
        return <TrashIcon className={iconClasses} />;
      case 'cleanup-specs':
        return <DocumentIcon className={iconClasses} />;
      case 'cleanup-archived-specs':
        return <ArchiveBoxIcon className={iconClasses} />;
      default:
        return <DocumentIcon className={iconClasses} />;
    }
  };

  return (
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getGradientClass()}`}>
      {getIcon()}
    </div>
  );
}

function Content() {
  const { t } = useTranslation();
  const [jobs, setJobs] = useState<JobUIState[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingJob, setEditingJob] = useState<AutomationJob | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedJobs, setExpandedJobs] = useState<Set<string>>(new Set());

  const loadJobs = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/jobs');
      const data = await response.json();
      setJobs(data.map((job: AutomationJob) => ({
        id: job.id,
        name: job.name,
        type: job.type,
        enabled: job.enabled,
        daysOld: job.config.daysOld,
        schedule: job.schedule,
        lastRun: job.lastRun,
        nextRun: job.nextRun
      })));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const handleToggleJob = async (jobId: string, enabled: boolean) => {
    try {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !enabled })
      });

      if (response.ok) {
        setJobs(jobs.map(j => j.id === jobId ? { ...j, enabled: !j.enabled } : j));
        setError(null);
      } else {
        setError('Failed to update job');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update job');
    }
  };

  const handleRunJob = async (jobId: string) => {
    try {
      setRunning(prev => ({ ...prev, [jobId]: true }));
      const response = await fetch(`/api/jobs/${jobId}/run`, { method: 'POST' });
      const result = await response.json();

      if (response.ok) {
        // Update last run time
        setJobs(jobs.map(j => j.id === jobId ? { ...j, lastRun: result.startTime } : j));
        setError(null);
      } else {
        setError(result.error || 'Failed to run job');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to run job');
    } finally {
      setRunning(prev => ({ ...prev, [jobId]: false }));
    }
  };

  const handleFormSubmit = async (formJob: Omit<AutomationJob, 'lastRun' | 'nextRun'>) => {
    try {
      setIsSubmitting(true);
      setError(null);

      if (editingJob) {
        // Update existing job
        const response = await fetch(`/api/jobs/${formJob.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formJob.name,
            enabled: formJob.enabled,
            config: formJob.config,
            schedule: formJob.schedule
          })
        });

        if (response.ok) {
          // Reload jobs after update
          await loadJobs();
          setShowFormModal(false);
          setEditingJob(null);
        } else {
          const result = await response.json();
          throw new Error(result.error || 'Failed to update job');
        }
      } else {
        // Create new job
        const response = await fetch('/api/jobs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formJob)
        });

        if (response.ok) {
          // Reload jobs after creation
          await loadJobs();
          setShowFormModal(false);
        } else {
          const result = await response.json();
          throw new Error(result.error || 'Failed to create job');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save job');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteJob = async () => {
    if (!jobToDelete) return;

    try {
      const response = await fetch(`/api/jobs/${jobToDelete}`, { method: 'DELETE' });

      if (response.ok) {
        setJobs(jobs.filter(j => j.id !== jobToDelete));
        setJobToDelete(null);
        setShowDeleteModal(false);
        setError(null);
      } else {
        setError('Failed to delete job');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete job');
    }
  };

  const getJobTypeLabel = (type: string) => {
    const typeMap: Record<string, string> = {
      'cleanup-approvals': 'Cleanup Approvals',
      'cleanup-specs': 'Cleanup Specs',
      'cleanup-archived-specs': 'Cleanup Archived Specs'
    };
    return typeMap[type] || type;
  };

  const getJobTypeBadgeClass = (type: string) => {
    switch (type) {
      case 'cleanup-approvals':
        return 'bg-purple-500/20 text-purple-400 border border-purple-500/30';
      case 'cleanup-specs':
        return 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
      case 'cleanup-archived-specs':
        return 'bg-green-500/20 text-green-400 border border-green-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
    }
  };

  const toggleJobExpanded = (jobId: string) => {
    const newExpanded = new Set(expandedJobs);
    if (newExpanded.has(jobId)) {
      newExpanded.delete(jobId);
    } else {
      newExpanded.add(jobId);
    }
    setExpandedJobs(newExpanded);
  };

  const formatLastRun = (dateStr?: string) => {
    if (!dateStr) return 'Never';
    const date = new Date(dateStr);
    return date.toLocaleString();
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl gradient-purple flex items-center justify-center">
              <Cog6ToothIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {t('settings.title', 'Automation Jobs')}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                {t('settings.description', 'Manage automated cleanup jobs that run across all connected projects')}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setEditingJob(null);
              setShowFormModal(true);
            }}
            className="btn-gradient"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            {t('settings.addJob', 'Add Job')}
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="glass-card border-red-500/30 p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center">
              <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-sm text-red-400">{error}</p>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="glass-card p-12">
          <div className="flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-xl gradient-purple flex items-center justify-center mb-4 animate-pulse">
              <Cog6ToothIcon className="w-6 h-6 text-white animate-spin" />
            </div>
            <span className="text-gray-400">
              {t('settings.loading', 'Loading jobs...')}
            </span>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && jobs.length === 0 && (
        <div className="glass-card p-12">
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl gradient-purple flex items-center justify-center mx-auto mb-4">
              <Cog6ToothIcon className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {t('settings.noJobs', 'No automation jobs')}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
              {t('settings.noJobsDesc', 'Create your first automation job to automatically clean up old approval records, specifications, and archived specs.')}
            </p>
            <button
              onClick={() => {
                setEditingJob(null);
                setShowFormModal(true);
              }}
              className="btn-gradient"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              {t('settings.createFirst', 'Create First Job')}
            </button>
          </div>
        </div>
      )}

      {/* Jobs Grid */}
      {!loading && jobs.length > 0 && (
        <div className="grid grid-cols-1 gap-4">
          {jobs.map((job) => (
            <div key={job.id} className="glass-card glow-hover overflow-hidden">
              {/* Job Header */}
              <div className="p-6">
                <div className="flex items-start gap-4">
                  {/* Job Type Icon */}
                  <JobTypeIcon type={job.type} />

                  {/* Job Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                        {job.name}
                      </h3>
                      <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${getJobTypeBadgeClass(job.type)}`}>
                        {getJobTypeLabel(job.type)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t('settings.jobDescription', 'Delete records older than {{days}} days', {
                        days: job.daysOld
                      })}
                    </p>

                    {/* Job Details Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                      {/* Schedule */}
                      <div className="flex items-center gap-2">
                        <ClockIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-500">Schedule</p>
                          <p className="text-sm font-mono text-gray-900 dark:text-white">{job.schedule}</p>
                        </div>
                      </div>

                      {/* Last Run */}
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${job.lastRun ? 'bg-green-500 shadow-lg shadow-green-500/50' : 'bg-gray-500'}`} />
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-500">Last Run</p>
                          <p className="text-sm text-gray-900 dark:text-white">{formatLastRun(job.lastRun)}</p>
                        </div>
                      </div>

                      {/* Status */}
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${job.enabled ? 'bg-green-500 shadow-lg shadow-green-500/50 animate-pulse' : 'bg-gray-500'}`} />
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-500">Status</p>
                          <p className={`text-sm font-medium ${job.enabled ? 'text-green-400' : 'text-gray-400'}`}>
                            {job.enabled ? 'Active' : 'Disabled'}
                          </p>
                        </div>
                      </div>

                      {/* Toggle */}
                      <div className="flex items-center justify-end gap-3">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {job.enabled ? 'Enabled' : 'Disabled'}
                        </span>
                        <ToggleSwitch
                          checked={job.enabled}
                          onChange={() => handleToggleJob(job.id, job.enabled)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Bar */}
              <div className="px-6 py-4 bg-gray-50/50 dark:bg-gray-800/30 border-t border-gray-200 dark:border-gray-700/50">
                <div className="flex items-center justify-between">
                  {/* Left Actions */}
                  <button
                    type="button"
                    onClick={() => toggleJobExpanded(job.id)}
                    className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    {expandedJobs.has(job.id) ? (
                      <ChevronDownIcon className="w-4 h-4" />
                    ) : (
                      <ChevronRightIcon className="w-4 h-4" />
                    )}
                    <span>Execution History</span>
                  </button>

                  {/* Right Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleRunJob(job.id)}
                      disabled={running[job.id] || !job.enabled}
                      className="btn-gradient-green text-sm px-3 py-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {running[job.id] ? (
                        <>
                          <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          {t('settings.running', 'Running...')}
                        </>
                      ) : (
                        <>
                          <PlayIcon className="w-4 h-4" />
                          {t('settings.runNow', 'Run Now')}
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        const fullJob = {
                          id: job.id,
                          name: job.name,
                          type: job.type,
                          enabled: job.enabled,
                          config: { daysOld: job.daysOld },
                          schedule: job.schedule,
                          lastRun: job.lastRun,
                          nextRun: job.nextRun,
                          createdAt: new Date().toISOString()
                        };
                        setEditingJob(fullJob);
                        setShowFormModal(true);
                      }}
                      className="btn-glass text-sm px-3 py-1.5"
                    >
                      <PencilIcon className="w-4 h-4" />
                      {t('settings.edit', 'Edit')}
                    </button>
                    <button
                      onClick={() => {
                        setJobToDelete(job.id);
                        setShowDeleteModal(true);
                      }}
                      className="btn-gradient-red text-sm px-3 py-1.5"
                    >
                      <TrashIcon className="w-4 h-4" />
                      {t('settings.delete', 'Delete')}
                    </button>
                  </div>
                </div>
              </div>

              {/* Execution History */}
              <JobExecutionHistory jobId={job.id} isExpanded={expandedJobs.has(job.id)} />
            </div>
          ))}
        </div>
      )}

      {/* Job Form Modal */}
      <JobFormModal
        isOpen={showFormModal}
        onClose={() => {
          setShowFormModal(false);
          setEditingJob(null);
        }}
        onSubmit={handleFormSubmit}
        initialJob={editingJob}
        isLoading={isSubmitting}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteModal && jobToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-card p-6 max-w-md w-full">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
                <TrashIcon className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {t('settings.deleteJob', 'Delete Job')}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {t('settings.deleteConfirm', 'Are you sure you want to delete this automation job? All execution history will be permanently removed.')}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setJobToDelete(null);
                }}
                className="flex-1 btn-glass"
              >
                {t('settings.cancel', 'Cancel')}
              </button>
              <button
                onClick={handleDeleteJob}
                className="flex-1 btn-gradient-red"
              >
                <TrashIcon className="w-4 h-4" />
                {t('settings.delete', 'Delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function SettingsPage() {
  return <Content />;
}
