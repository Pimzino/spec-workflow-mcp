import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AutomationJob } from '../../types';
import { getTemplatesByType } from './JobTemplates';

interface JobFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (job: Omit<AutomationJob, 'lastRun' | 'nextRun'>) => Promise<void>;
  initialJob?: AutomationJob | null;
  isLoading?: boolean;
}

// Common cron presets
const CRON_PRESETS = [
  { label: 'Daily at 2 AM', value: '0 2 * * *' },
  { label: 'Daily at 6 AM', value: '0 6 * * *' },
  { label: 'Weekly (Sunday 2 AM)', value: '0 2 ? * SUN' },
  { label: 'Bi-weekly (Sunday 2 AM)', value: '0 2 ? * SUN/2' },
  { label: 'Monthly (1st at 2 AM)', value: '0 2 1 * *' },
  { label: 'Every 6 hours', value: '0 */6 * * *' },
  { label: 'Every 12 hours', value: '0 */12 * * *' },
  { label: 'Custom', value: '' }
];

// Job type definitions
const JOB_TYPES = [
  {
    value: 'cleanup-approvals' as const,
    label: 'Cleanup Approvals',
    description: 'Delete approval records older than specified days'
  },
  {
    value: 'cleanup-specs' as const,
    label: 'Cleanup Specs',
    description: 'Delete active specifications older than specified days'
  },
  {
    value: 'cleanup-archived-specs' as const,
    label: 'Cleanup Archived Specs',
    description: 'Delete archived specifications older than specified days'
  }
];

export function JobFormModal({ isOpen, onClose, onSubmit, initialJob, isLoading }: JobFormModalProps) {
  const { t } = useTranslation();
  const isEditMode = !!initialJob;

  const [formData, setFormData] = useState({
    id: '',
    name: '',
    type: 'cleanup-approvals' as const,
    enabled: true,
    daysOld: 30,
    schedule: '0 2 * * *',
    createdAt: new Date().toISOString()
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showCronHelper, setShowCronHelper] = useState(false);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const availableTemplates = getTemplatesByType(formData.type);

  useEffect(() => {
    if (initialJob) {
      setFormData({
        id: initialJob.id,
        name: initialJob.name,
        type: initialJob.type,
        enabled: initialJob.enabled,
        daysOld: initialJob.config.daysOld,
        schedule: initialJob.schedule,
        createdAt: initialJob.createdAt
      });
    } else {
      // Reset form for new job
      setFormData({
        id: `job-${Date.now()}`,
        name: '',
        type: 'cleanup-approvals',
        enabled: true,
        daysOld: 30,
        schedule: '0 2 * * *',
        createdAt: new Date().toISOString()
      });
    }
    setErrors({});
  }, [initialJob, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Job name is required';
    }

    if (formData.daysOld < 1 || formData.daysOld > 3650) {
      newErrors.daysOld = 'Days must be between 1 and 3650';
    }

    if (!formData.schedule.trim()) {
      newErrors.schedule = 'Schedule (cron expression) is required';
    } else if (!isValidCronExpression(formData.schedule)) {
      newErrors.schedule = 'Invalid cron expression format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidCronExpression = (cron: string): boolean => {
    // Basic cron validation - should have 5 fields
    const parts = cron.trim().split(/\s+/);
    return parts.length === 5;
  };

  const applyTemplate = (templateKey: string) => {
    const template = getTemplatesByType(formData.type).find(t => t.name === templateKey);
    if (template) {
      setFormData(prev => ({
        ...prev,
        name: template.name,
        daysOld: template.daysOld,
        schedule: template.schedule
      }));
      setShowTemplateSelector(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit({
        id: formData.id,
        name: formData.name,
        type: formData.type,
        enabled: formData.enabled,
        config: { daysOld: formData.daysOld },
        schedule: formData.schedule,
        createdAt: formData.createdAt
      });
      onClose();
    } catch (error) {
      setErrors({ submit: error instanceof Error ? error.message : 'Failed to save job' });
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--surface-panel)] rounded-lg max-w-2xl w-full max-h-[90vh] flex flex-col">
        <div className="px-6 pt-6 pb-4 border-b border-[var(--border-default)]">
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">
            {isEditMode ? 'Edit Automation Job' : 'Create New Automation Job'}
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          <form id="job-form" onSubmit={handleSubmit} className="space-y-4">
          {/* Job Name */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
              Job Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Weekly Cleanup"
              className={`w-full px-3 py-2 bg-[var(--surface-panel)] border rounded-md text-[var(--text-primary)] ${
                errors.name ? 'border-[var(--status-error)]' : 'border-[var(--border-default)]'
              }`}
            />
            {errors.name && <p className="text-[var(--status-error)] text-sm mt-1">{errors.name}</p>}
          </div>

          {/* Job Type */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
              Job Type *
            </label>
            <div className="space-y-2">
              {JOB_TYPES.map((jobType) => (
                <label key={jobType.value} className="flex items-start cursor-pointer p-3 border border-[var(--border-default)] rounded-md hover:bg-[var(--surface-hover)] transition-colors">
                  <input
                    type="radio"
                    name="type"
                    value={jobType.value}
                    checked={formData.type === jobType.value}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="mt-1 mr-3 accent-[var(--accent-primary)]"
                  />
                  <div>
                    <div className="font-medium text-[var(--text-primary)]">{jobType.label}</div>
                    <div className="text-sm text-[var(--text-muted)]">{jobType.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Template Selector */}
          {availableTemplates.length > 0 && (
            <div>
              <button
                type="button"
                onClick={() => setShowTemplateSelector(!showTemplateSelector)}
                className="text-sm text-[var(--accent-primary)] hover:underline mb-2"
              >
                {showTemplateSelector ? 'Hide Templates' : 'Use Template'}
              </button>

              {showTemplateSelector && (
                <div className="p-3 bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/30 rounded-md space-y-2">
                  <p className="text-sm font-medium text-[var(--accent-primary)] mb-4">
                    Quick Templates for {formData.type === 'cleanup-approvals' ? 'Approvals' : formData.type === 'cleanup-specs' ? 'Specs' : 'Archived Specs'}:
                  </p>
                  <div className="space-y-2">
                    {availableTemplates.map((template) => (
                      <button
                        key={template.name}
                        type="button"
                        onClick={() => applyTemplate(template.name)}
                        className="w-full text-left p-2 bg-[var(--surface-panel)] hover:bg-[var(--surface-hover)] rounded-md transition-colors"
                      >
                        <div className="font-medium text-sm text-[var(--text-primary)]">
                          {template.name}
                        </div>
                        <div className="text-xs text-[var(--text-muted)]">
                          {template.description}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Days Old */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
              Delete records older than (days) *
            </label>
            <input
              type="number"
              min="1"
              max="3650"
              value={formData.daysOld}
              onChange={(e) => setFormData({ ...formData, daysOld: parseInt(e.target.value) || 0 })}
              className={`w-full px-3 py-2 bg-[var(--surface-panel)] border rounded-md text-[var(--text-primary)] ${
                errors.daysOld ? 'border-[var(--status-error)]' : 'border-[var(--border-default)]'
              }`}
            />
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Records created {formData.daysOld} or more days ago will be deleted
            </p>
            {errors.daysOld && <p className="text-[var(--status-error)] text-sm mt-1">{errors.daysOld}</p>}
          </div>

          {/* Schedule (Cron Expression) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-[var(--text-secondary)]">
                Schedule (Cron Expression) *
              </label>
              <button
                type="button"
                onClick={() => setShowCronHelper(!showCronHelper)}
                className="text-xs text-[var(--accent-primary)] hover:underline"
              >
                {showCronHelper ? 'Hide Helper' : 'Show Helper'}
              </button>
            </div>

            {/* Cron Presets */}
            {showCronHelper && (
              <div className="mb-4 p-3 bg-[var(--surface-secondary)] rounded-md space-y-2">
                <p className="text-xs font-medium text-[var(--text-secondary)] mb-2">
                  Common Schedules:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {CRON_PRESETS.map((preset) => (
                    <button
                      key={preset.value}
                      type="button"
                      onClick={() => {
                        if (preset.value) {
                          setFormData({ ...formData, schedule: preset.value });
                          setShowCronHelper(false);
                        }
                      }}
                      disabled={!preset.value}
                      className={`text-left px-2 py-1 text-xs rounded-md transition-colors ${
                        preset.value
                          ? 'bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/20'
                          : 'text-[var(--text-muted)] cursor-default'
                      }`}
                    >
                      <div className="font-medium">{preset.label}</div>
                      {preset.value && (
                        <div className="text-xs opacity-75 font-mono">{preset.value}</div>
                      )}
                    </button>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-[var(--border-default)]">
                  <p className="text-xs text-[var(--text-muted)] mb-2">
                    <strong>Cron Format:</strong> minute hour day month day-of-week
                  </p>
                  <ul className="text-xs text-[var(--text-muted)] space-y-1">
                    <li>* <code className="bg-[var(--surface-secondary)] px-1 rounded">0 2 * * *</code> = Daily at 2 AM</li>
                    <li>* <code className="bg-[var(--surface-secondary)] px-1 rounded">0 */6 * * *</code> = Every 6 hours</li>
                    <li>* <code className="bg-[var(--surface-secondary)] px-1 rounded">0 2 1 * *</code> = Monthly on 1st at 2 AM</li>
                  </ul>
                </div>
              </div>
            )}

            <input
              type="text"
              value={formData.schedule}
              onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
              placeholder="e.g., 0 2 * * * (daily at 2 AM)"
              className={`w-full px-3 py-2 bg-[var(--surface-panel)] border rounded-md text-[var(--text-primary)] font-mono text-sm ${
                errors.schedule ? 'border-[var(--status-error)]' : 'border-[var(--border-default)]'
              }`}
            />
            {errors.schedule && <p className="text-[var(--status-error)] text-sm mt-1">{errors.schedule}</p>}
          </div>

          {/* Enabled Toggle */}
          <div className="flex items-center gap-4">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.enabled}
                onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                className="w-5 h-5 rounded-md accent-[var(--accent-primary)]"
              />
              <span className="ml-2 text-sm font-medium text-[var(--text-secondary)]">
                Enabled
              </span>
            </label>
            <span className="text-xs text-[var(--text-muted)]">
              {formData.enabled ? 'This job will run according to its schedule' : 'This job is disabled and will not run'}
            </span>
          </div>

          {/* Submit Errors */}
          {errors.submit && (
            <div className="p-3 bg-[var(--status-error-bg)] border border-[var(--status-error-border)] rounded-md">
              <p className="text-sm text-[var(--status-error)]">{errors.submit}</p>
            </div>
          )}
          </form>
        </div>

        {/* Sticky Footer with Action Buttons */}
        <div className="px-6 pb-6 pt-4 border-t border-[var(--border-default)] bg-[var(--surface-panel)]">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-[var(--surface-secondary)] hover:bg-[var(--surface-hover)] text-[var(--text-secondary)] rounded-md transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="job-form"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-white rounded-md transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading && <span className="animate-spin">⟳</span>}
              {isEditMode ? 'Update Job' : 'Create Job'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
