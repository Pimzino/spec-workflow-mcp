import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Cog6ToothIcon, PencilSquareIcon, ChevronDownIcon, DocumentDuplicateIcon } from '@heroicons/react/24/solid';
import { AutomationJob } from '../../types';
import { getTemplatesByType } from './JobTemplates';

// Custom Radio Indicator Component
function CustomRadioIndicator({ checked }: { checked: boolean }) {
  return (
    <div className={`
      relative w-5 h-5 rounded-full border-2 transition-all duration-200 flex-shrink-0
      ${checked
        ? 'border-purple-500 bg-gradient-to-br from-purple-500 to-pink-500'
        : 'border-gray-400 dark:border-gray-500 bg-transparent'
      }
    `}>
      {checked && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-white" />
        </div>
      )}
    </div>
  );
}

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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-card max-w-2xl w-full max-h-[90vh] flex flex-col">
        <div className="px-6 pt-6 pb-4 border-b border-gray-200 dark:border-gray-700/50">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {isEditMode ? 'Edit Automation Job' : 'Create New Automation Job'}
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          <form id="job-form" onSubmit={handleSubmit} className="space-y-6">
          {/* Job Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Job Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Weekly Cleanup"
              className={`input-glass ${
                errors.name ? 'error' : ''
              }`}
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          {/* Job Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Job Type *
            </label>
            <div className="space-y-3">
              {JOB_TYPES.map((jobType) => {
                const isSelected = formData.type === jobType.value;
                return (
                  <label
                    key={jobType.value}
                    className={`
                      relative flex items-start p-4 rounded-xl border cursor-pointer transition-all duration-200 backdrop-blur-sm overflow-hidden
                      ${isSelected
                        ? 'bg-purple-500/10 dark:bg-purple-500/20 border-purple-500/50 shadow-sm shadow-purple-500/10'
                        : 'bg-white/30 dark:bg-gray-800/30 border-gray-200/50 dark:border-gray-700/50 hover:bg-purple-500/5 dark:hover:bg-purple-500/10 hover:border-purple-500/30'
                      }
                    `}
                  >
                    {/* Hidden native radio for accessibility */}
                    <input
                      type="radio"
                      name="type"
                      value={jobType.value}
                      checked={isSelected}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                      className="sr-only"
                    />
                    {/* Custom radio indicator */}
                    <CustomRadioIndicator checked={isSelected} />
                    {/* Label content */}
                    <div className="ml-3 flex-1">
                      <div className="font-medium text-gray-900 dark:text-white">{jobType.label}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{jobType.description}</div>
                    </div>
                    {/* Selected accent indicator */}
                    {isSelected && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-purple-500 to-pink-500 rounded-r-full" />
                    )}
                  </label>
                );
              })}
            </div>
          </div>

          {/* Template Selector */}
          {availableTemplates.length > 0 && (
            <div className="space-y-3">
              {/* Use Template Toggle Button - Pill Style */}
              <button
                type="button"
                onClick={() => setShowTemplateSelector(!showTemplateSelector)}
                className={`
                  btn-pill gap-2
                  ${showTemplateSelector
                    ? 'active'
                    : 'hover:border-purple-400/50 hover:text-purple-600 dark:hover:text-purple-400'
                  }
                `}
              >
                <DocumentDuplicateIcon className="w-4 h-4" />
                <span>{showTemplateSelector ? 'Hide Templates' : 'Use Template'}</span>
                <ChevronDownIcon
                  className={`w-4 h-4 transition-transform duration-200 ${showTemplateSelector ? 'rotate-180' : ''}`}
                />
              </button>

              {/* Template Container - Glass Background with Smooth Animation */}
              <div
                className={`
                  overflow-hidden transition-all duration-300 ease-in-out
                  ${showTemplateSelector ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}
                `}
              >
                <div className="p-4 bg-purple-500/5 dark:bg-purple-500/10 backdrop-blur-sm border border-purple-200/50 dark:border-purple-800/50 rounded-xl">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                    <span className="gradient-icon w-6 h-6">
                      <DocumentDuplicateIcon className="w-3.5 h-3.5 text-white" />
                    </span>
                    Quick Templates for {formData.type === 'cleanup-approvals' ? 'Approvals' : formData.type === 'cleanup-specs' ? 'Specs' : 'Archived Specs'}
                  </p>

                  {/* Template Option Buttons - Glass Card Style */}
                  <div className="space-y-2">
                    {availableTemplates.map((template) => (
                      <button
                        key={template.name}
                        type="button"
                        onClick={() => applyTemplate(template.name)}
                        className="
                          group w-full text-left p-3
                          bg-white/50 dark:bg-gray-800/40 backdrop-blur-sm
                          border border-gray-200/30 dark:border-gray-700/30
                          rounded-xl
                          hover:bg-purple-500/10 hover:border-purple-500/30
                          hover:shadow-md hover:shadow-purple-500/5
                          active:scale-[0.99]
                          transition-all duration-200
                          card-lift
                        "
                      >
                        <div className="flex items-start gap-3">
                          {/* Template Icon */}
                          <div className="mt-0.5 w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0 group-hover:bg-purple-200 dark:group-hover:bg-purple-800/40 transition-colors">
                            <DocumentDuplicateIcon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                          </div>

                          {/* Template Info */}
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-sm text-gray-900 dark:text-white group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors">
                              {template.name}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
                              {template.description}
                            </div>
                          </div>

                          {/* Arrow indicator on hover */}
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity mt-1">
                            <ChevronDownIcon className="w-4 h-4 -rotate-90 text-purple-500" />
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Days Old */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Delete records older than (days) *
            </label>
            <input
              type="number"
              min="1"
              max="3650"
              value={formData.daysOld}
              onChange={(e) => setFormData({ ...formData, daysOld: parseInt(e.target.value) || 0 })}
              className={`input-glass ${
                errors.daysOld ? 'error' : ''
              }`}
            />
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Records created {formData.daysOld} or more days ago will be deleted
            </p>
            {errors.daysOld && <p className="text-red-500 text-sm mt-1">{errors.daysOld}</p>}
          </div>

          {/* Schedule (Cron Expression) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Schedule (Cron Expression) *
              </label>
              <button
                type="button"
                onClick={() => setShowCronHelper(!showCronHelper)}
                className="text-xs font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 hover:underline underline-offset-2 transition-colors"
              >
                {showCronHelper ? 'Hide Helper' : 'Show Helper'}
              </button>
            </div>

            {/* Cron Helper - Glass Container with Smooth Animation */}
            <div
              className={`
                overflow-hidden transition-all duration-300 ease-in-out mb-3
                ${showCronHelper ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}
              `}
            >
              <div className="p-4 bg-gray-100/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200/30 dark:border-gray-700/30 rounded-xl space-y-3">
                <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  Common Schedules:
                </p>

                {/* Preset Grid - 2 columns */}
                <div className="grid grid-cols-2 gap-2">
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
                      className={`
                        text-left px-3 py-2 text-xs rounded-lg transition-all duration-200
                        ${preset.value
                          ? `
                            bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm
                            border border-gray-200/50 dark:border-gray-600/50
                            text-gray-700 dark:text-gray-300
                            hover:bg-purple-500/10 hover:border-purple-500/30
                            hover:text-purple-600 dark:hover:text-purple-400
                            active:scale-[0.98]
                          `
                          : 'text-gray-400 dark:text-gray-500 cursor-default opacity-50'
                        }
                      `}
                    >
                      <div className="font-medium">{preset.label}</div>
                      {preset.value && (
                        <div className="text-[10px] opacity-70 font-mono mt-0.5">{preset.value}</div>
                      )}
                    </button>
                  ))}
                </div>

                {/* Cron Format Help Section */}
                <div className="pt-3 border-t border-gray-200/50 dark:border-gray-700/50">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                    <strong className="text-gray-700 dark:text-gray-300">Cron Format:</strong> minute hour day month day-of-week
                  </p>
                  <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1.5">
                    <li className="flex items-center gap-2">
                      <code className="px-1.5 py-0.5 bg-white/60 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded font-mono text-[10px] text-gray-700 dark:text-gray-300">0 2 * * *</code>
                      <span>= Daily at 2 AM</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <code className="px-1.5 py-0.5 bg-white/60 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded font-mono text-[10px] text-gray-700 dark:text-gray-300">0 */6 * * *</code>
                      <span>= Every 6 hours</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <code className="px-1.5 py-0.5 bg-white/60 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded font-mono text-[10px] text-gray-700 dark:text-gray-300">0 2 1 * *</code>
                      <span>= Monthly on 1st at 2 AM</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <input
              type="text"
              value={formData.schedule}
              onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
              placeholder="e.g., 0 2 * * * (daily at 2 AM)"
              className={`input-glass font-mono text-sm ${errors.schedule ? 'error' : ''}`}
            />
            {errors.schedule && <p className="text-red-500 text-sm mt-1">{errors.schedule}</p>}
          </div>

          {/* Enabled Toggle */}
          <div className="flex items-center gap-3">
            <label
              className="flex items-center cursor-pointer group"
              onClick={() => setFormData({ ...formData, enabled: !formData.enabled })}
            >
              {/* Custom Checkbox with Gradient */}
              <div
                className={`
                  w-5 h-5 rounded-md border-2 flex items-center justify-center
                  transition-all duration-200
                  ${formData.enabled
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 border-transparent shadow-lg shadow-purple-500/30'
                    : 'bg-white/10 border-gray-400 dark:border-gray-600 group-hover:border-purple-400'
                  }
                `}
              >
                {formData.enabled && (
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                Enabled
              </span>
            </label>
            <span className="text-xs text-gray-600 dark:text-gray-400">
              {formData.enabled ? 'This job will run according to its schedule' : 'This job is disabled and will not run'}
            </span>
          </div>

          {/* Submit Errors */}
          {errors.submit && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-700 dark:text-red-400">{errors.submit}</p>
            </div>
          )}
          </form>
        </div>

        {/* Sticky Footer with Action Buttons */}
        <div className="px-6 pb-6 pt-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 btn-glass transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="job-form"
              disabled={isLoading}
              className="flex-1 btn-gradient transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading && <div className="spinner-gradient spinner-gradient-sm" />}
              {isEditMode ? 'Update Job' : 'Create Job'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
