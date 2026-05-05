import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronRightIcon, ChevronDownIcon } from '@heroicons/react/24/solid';
import { useApi } from '../api/api';
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
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

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

  const toggleJobExpanded = (jobId: string) => {
    const newExpanded = new Set(expandedJobs);
    if (newExpanded.has(jobId)) {
      newExpanded.delete(jobId);
    } else {
      newExpanded.add(jobId);
    }
    setExpandedJobs(newExpanded);
  };

  const toggleSectionExpanded = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const formatLastRun = (dateStr?: string) => {
    if (!dateStr) return 'Never';
    const date = new Date(dateStr);
    return date.toLocaleString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[var(--surface-panel)] rounded-lg border border-[var(--border-default)] p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-[var(--text-primary)] mb-1">
              {t('settings.title', 'Settings')}
            </h1>
            <p className="text-[var(--text-secondary)]">
              {t('settings.description', 'Manage automated cleanup jobs that run across all connected projects')}
            </p>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-[var(--status-error-bg)] border border-[var(--status-error-border)] rounded-lg p-4">
          <p className="text-sm text-[var(--status-error)]">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="bg-[var(--surface-panel)] rounded-lg border border-[var(--border-default)] p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--accent-primary)]"></div>
            <span className="ml-3 text-[var(--text-secondary)]">
              {t('settings.loading', 'Loading jobs...')}
            </span>
          </div>
        </div>
      )}

      {/* Automated Cleanup Section */}
      <div className="bg-[var(--surface-panel)] rounded-lg border border-[var(--border-default)] overflow-hidden">
        {/* Section Header */}
        <button
          onClick={() => toggleSectionExpanded('automatedCleanup')}
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-[var(--surface-hover)] transition-colors"
        >
          <div className="flex items-center gap-4 flex-1 text-left">
            <ChevronRightIcon className={`w-5 h-5 text-[var(--text-muted)] transition-transform ${expandedSections.has('automatedCleanup') ? 'rotate-90' : ''}`} />
            <div>
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                {t('settings.section.automatedCleanup', 'Automated Cleanup')}
              </h2>
            </div>
          </div>
        </button>

        {/* Section Description and Content */}
        {expandedSections.has('automatedCleanup') && (
          <div className="border-t border-[var(--border-default)] p-6 space-y-6">
            <p className="text-sm text-[var(--text-secondary)]">
              {t('settings.section.automatedCleanupDesc', 'Automatically delete old approval records, specifications, and archived specifications based on a schedule. Configure cleanup jobs to run on a recurring basis across all connected projects.')}
            </p>

            {/* Add Job Button */}
            <div className="flex justify-end">
              <button
                onClick={() => {
                  setEditingJob(null);
                  setShowFormModal(true);
                }}
                className="px-4 py-2 bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-white text-sm font-medium rounded-md transition-colors"
              >
                {t('settings.addJob', 'Add Job')}
              </button>
            </div>

            {/* Jobs List */}
            {!loading && jobs.length === 0 && (
              <div className="bg-[var(--surface-secondary)] rounded-lg border border-[var(--border-default)] p-8">
                <div className="text-center">
                  <svg className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="text-lg font-medium text-[var(--text-primary)] mb-1">
                    {t('settings.noJobs', 'No automation jobs')}
                  </h3>
                  <p className="text-sm text-[var(--text-secondary)] mb-6">
                    {t('settings.noJobsDesc', 'Create your first automation job to get started')}
                  </p>
                  <button
                    onClick={() => {
                      setEditingJob(null);
                      setShowFormModal(true);
                    }}
                    className="px-4 py-2 bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-white text-sm font-medium rounded-md transition-colors"
                  >
                    {t('settings.createFirst', 'Create First Job')}
                  </button>
                </div>
              </div>
            )}

            {/* Jobs Grid */}
            {!loading && jobs.length > 0 && (
              <div className="grid grid-cols-1 gap-4">
                {jobs.map((job) => (
          <div key={job.id} className="bg-[var(--surface-panel)] rounded-lg border border-[var(--border-default)] overflow-hidden">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-2">
                  <h3 className="text-lg font-semibold text-[var(--text-primary)]">{job.name}</h3>
                  <span className="px-2 py-1 bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] text-xs font-medium rounded-md">
                    {getJobTypeLabel(job.type)}
                  </span>
                </div>
                <p className="text-sm text-[var(--text-secondary)] mb-4">
                  {t('settings.jobDescription', 'Delete records older than {{days}} days on schedule: {{schedule}}', {
                    days: job.daysOld,
                    schedule: job.schedule
                  })}
                </p>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="text-xs font-medium text-[var(--text-muted)] block mb-1">
                      {t('settings.lastRun', 'Last Run')}
                    </label>
                    <p className="text-sm text-[var(--text-primary)]">{formatLastRun(job.lastRun)}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[var(--text-muted)] block mb-1">
                      {t('settings.schedule', 'Schedule')}
                    </label>
                    <p className="text-sm text-[var(--text-primary)] font-mono">{job.schedule}</p>
                  </div>
                </div>
              </div>

              {/* Expand/Collapse and Toggle */}
              <div className="flex flex-col gap-2 ml-4 items-end">
                <button
                  type="button"
                  onClick={() => toggleJobExpanded(job.id)}
                  className="flex items-center gap-1 text-sm text-[var(--accent-primary)] hover:underline"
                >
                  {expandedJobs.has(job.id) ? (
                    <ChevronDownIcon className="w-4 h-4" />
                  ) : (
                    <ChevronRightIcon className="w-4 h-4" />
                  )}
                  History
                </button>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={job.enabled}
                    onChange={() => handleToggleJob(job.id, job.enabled)}
                    className="w-5 h-5 rounded-md accent-[var(--accent-primary)]"
                  />
                  <span className="text-sm font-medium text-[var(--text-secondary)]">
                    {job.enabled ? 'Enabled' : 'Disabled'}
                  </span>
                </label>
              </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4 border-t border-[var(--border-default)]">
              <button
                onClick={() => handleRunJob(job.id)}
                disabled={running[job.id] || !job.enabled}
                className="flex-1 px-3 py-2 bg-[var(--status-success-bg)] hover:opacity-80 text-[var(--status-success)] text-sm font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {running[job.id] ? (
                  <>
                    <span className="inline-block mr-2 animate-spin">⟳</span>
                    {t('settings.running', 'Running...')}
                  </>
                ) : (
                  t('settings.runNow', 'Run Now')
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
                className="flex-1 px-3 py-2 bg-[var(--surface-secondary)] hover:bg-[var(--surface-hover)] text-[var(--text-secondary)] text-sm font-medium rounded-md transition-colors"
              >
                {t('settings.edit', 'Edit')}
              </button>
              <button
                onClick={() => {
                  setJobToDelete(job.id);
                  setShowDeleteModal(true);
                }}
                className="flex-1 px-3 py-2 bg-[var(--status-error-bg)] hover:opacity-80 text-[var(--status-error)] text-sm font-medium rounded-md transition-colors"
              >
                {t('settings.delete', 'Delete')}
              </button>
            </div>

            {/* Execution History */}
            <JobExecutionHistory jobId={job.id} isExpanded={expandedJobs.has(job.id)} />
          </div>
        ))}
              </div>
            )}
          </div>
        )}
      </div>

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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--surface-panel)] rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">
              {t('settings.deleteJob', 'Delete Job')}
            </h2>
            <p className="text-[var(--text-secondary)] mb-6">
              {t('settings.deleteConfirm', 'Are you sure you want to delete this automation job? This action cannot be undone.')}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setJobToDelete(null);
                }}
                className="flex-1 px-4 py-2 bg-[var(--surface-secondary)] hover:bg-[var(--surface-hover)] text-[var(--text-secondary)] rounded-md transition-colors"
              >
                {t('settings.cancel', 'Cancel')}
              </button>
              <button
                onClick={handleDeleteJob}
                className="flex-1 px-4 py-2 bg-[var(--status-error)] hover:opacity-80 text-white rounded-md transition-colors"
              >
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
