import React, { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useApiActions } from '../api/api';
import { useNotifications } from '../notifications/NotificationProvider';
import { MDXEditorWrapper } from '../mdx-editor';

type Tab = 'reviews' | 'settings';

interface ReviewVersion {
  version: number;
  filename: string;
  lastModified: string;
}

interface ReviewPhase {
  phase: string;
  versions: ReviewVersion[];
}

interface ReviewSpec {
  specName: string;
  displayName: string;
  phases: ReviewPhase[];
}

interface AdversarialSettings {
  customPreamble: string;
  requiredPhases: { requirements: boolean; design: boolean; tasks: boolean };
  reviewMethodology: string;
  responseMethodology: string;
  model: string;
}

const DEFAULT_SETTINGS: AdversarialSettings = {
  customPreamble: '',
  requiredPhases: { requirements: false, design: false, tasks: false },
  reviewMethodology: '',
  responseMethodology: '',
  model: '',
};

function Content() {
  const { t } = useTranslation();
  const actions = useApiActions();
  const { addNotification } = useNotifications();

  const [activeTab, setActiveTab] = useState<Tab>('reviews');

  // Reviews state
  const [reviewSpecs, setReviewSpecs] = useState<ReviewSpec[]>([]);
  const [selectedSpec, setSelectedSpec] = useState<string>('');
  const [expandedPhase, setExpandedPhase] = useState<string | null>(null);
  const [viewingContent, setViewingContent] = useState<{ content: string; lastModified: string; phase: string; version: number } | null>(null);
  const [loadingContent, setLoadingContent] = useState(false);
  const [loadingReviews, setLoadingReviews] = useState(true);

  // Settings state
  const [settings, setSettings] = useState<AdversarialSettings>(DEFAULT_SETTINGS);
  const [savedSettings, setSavedSettings] = useState<AdversarialSettings>(DEFAULT_SETTINGS);
  const [defaultReviewMethodology, setDefaultReviewMethodology] = useState('');
  const [defaultResponseMethodology, setDefaultResponseMethodology] = useState('');
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [expandedMethodology, setExpandedMethodology] = useState<'review' | 'response' | null>(null);

  const isDirty = JSON.stringify(settings) !== JSON.stringify(savedSettings);

  // Load reviews
  useEffect(() => {
    setLoadingReviews(true);
    actions.getAdversarialReviews()
      .then((data: any) => {
        setReviewSpecs(data.specs || []);
        if (data.specs?.length > 0 && !selectedSpec) {
          setSelectedSpec(data.specs[0].specName);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingReviews(false));
  }, [actions]); // eslint-disable-line react-hooks/exhaustive-deps

  // Load settings
  useEffect(() => {
    setLoadingSettings(true);
    actions.getAdversarialSettings()
      .then((data: any) => {
        const { defaultReviewMethodology: drm, defaultResponseMethodology: drem, ...rest } = data;
        const s = { ...DEFAULT_SETTINGS, ...rest };
        setSettings(s);
        setSavedSettings(s);
        if (drm) setDefaultReviewMethodology(drm);
        if (drem) setDefaultResponseMethodology(drem);
      })
      .catch(() => {})
      .finally(() => setLoadingSettings(false));
  }, [actions]);

  const currentSpec = reviewSpecs.find(s => s.specName === selectedSpec);

  const handleViewContent = useCallback(async (specName: string, phase: string, version: number) => {
    setLoadingContent(true);
    try {
      const data = await actions.getAdversarialReviewContent(specName, phase, version);
      setViewingContent({ ...data, phase, version });
    } catch {
      addNotification({ type: 'error', message: t('adversarialPage.reviews.loadError', 'Failed to load review content') });
    } finally {
      setLoadingContent(false);
    }
  }, [actions, addNotification, t]);

  const handleSaveSettings = useCallback(async () => {
    setSavingSettings(true);
    try {
      const res = await actions.saveAdversarialSettings(settings);
      if (res.ok) {
        setSavedSettings(settings);
        addNotification({ type: 'success', message: t('adversarialPage.settings.saved', 'Settings saved') });
      } else {
        addNotification({ type: 'error', message: t('adversarialPage.settings.saveError', 'Failed to save settings') });
      }
    } catch {
      addNotification({ type: 'error', message: t('adversarialPage.settings.saveError', 'Failed to save settings') });
    } finally {
      setSavingSettings(false);
    }
  }, [actions, settings, addNotification, t]);

  const phaseLabel = (phase: string) => {
    const labels: Record<string, string> = {
      requirements: t('specsPage.documents.requirements', 'Requirements'),
      design: t('specsPage.documents.design', 'Design'),
      tasks: t('specsPage.documents.tasks', 'Tasks'),
    };
    return labels[phase] || phase;
  };

  return (
    <div className="grid gap-4">
      {/* Header */}
      <div className="bg-[var(--surface-panel)] border border-[var(--border-default)] rounded-lg p-4">
        <div className="mb-4">
          <h2 className="text-lg sm:text-xl font-semibold text-[var(--text-primary)]">
            {t('adversarialPage.header.title', 'Adversarial Analysis')}
          </h2>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            {t('adversarialPage.header.subtitle', 'Browse historical adversarial reviews and configure review settings')}
          </p>
        </div>

        {/* Tab bar */}
        <div className="border-b border-[var(--border-default)]">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 py-2">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('reviews')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'reviews'
                    ? 'border-[var(--interactive-primary)] text-[var(--interactive-primary)]'
                    : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:border-[var(--border-default)]'
                } transition-colors`}
              >
                {t('adversarialPage.tabs.reviews', 'Reviews')}
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'settings'
                    ? 'border-[var(--interactive-primary)] text-[var(--interactive-primary)]'
                    : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:border-[var(--border-default)]'
                } transition-colors`}
              >
                {t('adversarialPage.tabs.settings', 'Settings')}
              </button>
            </nav>
          </div>
        </div>
      </div>

      {/* Reviews Tab */}
      {activeTab === 'reviews' && (
        <div className="bg-[var(--surface-panel)] border border-[var(--border-default)] rounded-lg p-4">
          {loadingReviews ? (
            <div className="text-center py-8 text-[var(--text-muted)]">
              {t('common.loadingContent', 'Loading content...')}
            </div>
          ) : reviewSpecs.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-[var(--text-muted)] mb-2">
                <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-[var(--text-primary)] mb-1">
                {t('adversarialPage.reviews.emptyTitle', 'No Adversarial Reviews')}
              </h3>
              <p className="text-sm text-[var(--text-secondary)]">
                {t('adversarialPage.reviews.emptyDesc', 'Adversarial reviews will appear here once triggered from the Approvals page or MCP tools.')}
              </p>
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Spec selector */}
              <div className="lg:w-64 flex-shrink-0">
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  {t('adversarialPage.reviews.selectSpec', 'Specification')}
                </label>
                <select
                  value={selectedSpec}
                  onChange={(e) => {
                    setSelectedSpec(e.target.value);
                    setViewingContent(null);
                    setExpandedPhase(null);
                  }}
                  className="w-full px-3 py-2 rounded-md border border-[var(--border-default)] bg-[var(--surface-base)] text-[var(--text-primary)] text-sm"
                >
                  {reviewSpecs.map(s => (
                    <option key={s.specName} value={s.specName}>{s.displayName}</option>
                  ))}
                </select>

                {/* Phase list */}
                {currentSpec && (
                  <div className="mt-4 space-y-2">
                    {currentSpec.phases.map(p => (
                      <div key={p.phase}>
                        <button
                          onClick={() => setExpandedPhase(expandedPhase === p.phase ? null : p.phase)}
                          className="w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium hover:bg-[var(--surface-hover)] transition-colors text-[var(--text-primary)]"
                        >
                          <span>{phaseLabel(p.phase)}</span>
                          <span className="flex items-center gap-2">
                            <span className="text-xs text-[var(--text-muted)]">
                              {p.versions.length} {p.versions.length === 1 ? 'version' : 'versions'}
                            </span>
                            <svg
                              className={`w-4 h-4 transition-transform ${expandedPhase === p.phase ? 'rotate-90' : ''}`}
                              fill="none" stroke="currentColor" viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                            </svg>
                          </span>
                        </button>
                        {expandedPhase === p.phase && (
                          <div className="ml-3 mt-1 space-y-1">
                            {p.versions.map(v => (
                              <button
                                key={v.version}
                                onClick={() => handleViewContent(currentSpec.specName, p.phase, v.version)}
                                className={`w-full text-left px-3 py-1.5 rounded text-sm transition-colors ${
                                  viewingContent?.phase === p.phase && viewingContent?.version === v.version
                                    ? 'bg-[color-mix(in_srgb,var(--interactive-primary)_10%,transparent)] text-[var(--interactive-primary)]'
                                    : 'text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]'
                                }`}
                              >
                                <div>v{v.version}</div>
                                <div className="text-xs text-[var(--text-muted)]">
                                  {new Date(v.lastModified).toLocaleDateString()}
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Content viewer */}
              <div className="flex-1 min-w-0">
                {loadingContent ? (
                  <div className="text-center py-8 text-[var(--text-muted)]">
                    {t('common.loadingContent', 'Loading content...')}
                  </div>
                ) : viewingContent ? (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-medium text-[var(--text-primary)]">
                        {phaseLabel(viewingContent.phase)} — v{viewingContent.version}
                      </h3>
                      <span className="text-xs text-[var(--text-muted)]">
                        {new Date(viewingContent.lastModified).toLocaleString()}
                      </span>
                    </div>
                    <MDXEditorWrapper content={viewingContent.content} mode="view" />
                  </div>
                ) : (
                  <div className="text-center py-12 text-[var(--text-muted)]">
                    {t('adversarialPage.reviews.selectReview', 'Select a phase and version to view the review')}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="bg-[var(--surface-panel)] border border-[var(--border-default)] rounded-lg p-4">
          {loadingSettings ? (
            <div className="text-center py-8 text-[var(--text-muted)]">
              {t('common.loadingContent', 'Loading content...')}
            </div>
          ) : (
            <div className="max-w-2xl space-y-6">
              {/* Custom Preamble */}
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                  {t('adversarialPage.settings.preambleLabel', 'Custom Preamble')}
                  <span className="ml-2 text-xs font-normal text-[var(--text-muted)]">
                    {t('adversarialPage.settings.preambleOptional', 'Optional')}
                  </span>
                </label>
                <p className="text-xs text-[var(--text-muted)] mb-2">
                  {t('adversarialPage.settings.preambleHelp', 'Additional instructions prepended to every adversarial review prompt. The defaults work well for most projects.')}
                </p>
                <textarea
                  value={settings.customPreamble}
                  onChange={(e) => setSettings(s => ({ ...s, customPreamble: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 rounded-md border border-[var(--border-default)] bg-[var(--surface-base)] text-[var(--text-primary)] text-sm resize-y"
                  placeholder={t('adversarialPage.settings.preamblePlaceholder', 'e.g., Focus on security implications and data privacy concerns...')}
                />
              </div>

              {/* Required Phases */}
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                  {t('adversarialPage.settings.requiredPhasesLabel', 'Required Phases')}
                </label>
                <p className="text-xs text-[var(--text-muted)] mb-2">
                  {t('adversarialPage.settings.requiredPhasesHelp', 'Phases that must have an adversarial review before approval.')}
                </p>
                <div className="space-y-2">
                  {(['requirements', 'design', 'tasks'] as const).map(phase => (
                    <label key={phase} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.requiredPhases[phase]}
                        onChange={(e) => setSettings(s => ({
                          ...s,
                          requiredPhases: { ...s.requiredPhases, [phase]: e.target.checked },
                        }))}
                        className="rounded border-[var(--border-default)]"
                      />
                      <span className="text-sm text-[var(--text-primary)]">{phaseLabel(phase)}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Model Selection */}
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                  {t('adversarialPage.settings.modelLabel', 'Claude Model')}
                  <span className="ml-2 text-xs font-normal text-[var(--text-muted)]">
                    {t('adversarialPage.settings.modelOptional', 'Optional')}
                  </span>
                </label>
                <p className="text-xs text-[var(--text-muted)] mb-2">
                  {t('adversarialPage.settings.modelHelp', 'Model used for background adversarial reviews. Leave empty to use your CLI default.')}
                </p>
                <select
                  value={settings.model || ''}
                  onChange={(e) => setSettings(s => ({ ...s, model: e.target.value }))}
                  className="w-full sm:w-auto px-3 py-2 rounded-md border border-[var(--border-default)] bg-[var(--surface-base)] text-[var(--text-primary)] text-sm"
                >
                  <option value="">{t('adversarialPage.settings.modelDefault', 'Default (CLI setting)')}</option>
                  <option value="opus">Opus</option>
                  <option value="sonnet">Sonnet</option>
                  <option value="haiku">Haiku</option>
                </select>
              </div>

              {/* Review Methodology */}
              <div className="border border-[var(--border-default)] rounded-lg">
                <button
                  onClick={() => setExpandedMethodology(expandedMethodology === 'review' ? null : 'review')}
                  className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-[var(--surface-hover)] transition-colors rounded-lg"
                >
                  <div>
                    <span className="text-sm font-medium text-[var(--text-primary)]">
                      {t('adversarialPage.settings.reviewMethodologyLabel', 'Review Methodology')}
                    </span>
                    <span className={`ml-2 text-xs px-1.5 py-0.5 rounded ${
                      settings.reviewMethodology
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                        : 'bg-[var(--surface-inset)] text-[var(--text-muted)]'
                    }`}>
                      {settings.reviewMethodology
                        ? t('adversarialPage.settings.usingCustom', 'Custom')
                        : t('adversarialPage.settings.usingDefault', 'Default')
                      }
                    </span>
                  </div>
                  <svg
                    className={`w-4 h-4 text-[var(--text-muted)] transition-transform ${expandedMethodology === 'review' ? 'rotate-90' : ''}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                {expandedMethodology === 'review' && (
                  <div className="px-4 pb-4 space-y-2">
                    <p className="text-xs text-[var(--text-muted)]">
                      {t('adversarialPage.settings.reviewMethodologyHelp', 'Instructions for how the adversarial review prompt is constructed. Leave empty to use the default.')}
                    </p>
                    <textarea
                      value={settings.reviewMethodology || defaultReviewMethodology}
                      onChange={(e) => setSettings(s => ({ ...s, reviewMethodology: e.target.value }))}
                      rows={16}
                      className="w-full px-3 py-2 rounded-md border border-[var(--border-default)] bg-[var(--surface-base)] text-[var(--text-primary)] text-sm font-mono resize-y"
                    />
                    {settings.reviewMethodology && (
                      <button
                        onClick={() => setSettings(s => ({ ...s, reviewMethodology: '' }))}
                        className="text-xs text-[var(--interactive-primary)] hover:underline"
                      >
                        {t('adversarialPage.settings.resetToDefault', 'Reset to default')}
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Response Methodology */}
              <div className="border border-[var(--border-default)] rounded-lg">
                <button
                  onClick={() => setExpandedMethodology(expandedMethodology === 'response' ? null : 'response')}
                  className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-[var(--surface-hover)] transition-colors rounded-lg"
                >
                  <div>
                    <span className="text-sm font-medium text-[var(--text-primary)]">
                      {t('adversarialPage.settings.responseMethodologyLabel', 'Response Methodology')}
                    </span>
                    <span className={`ml-2 text-xs px-1.5 py-0.5 rounded ${
                      settings.responseMethodology
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                        : 'bg-[var(--surface-inset)] text-[var(--text-muted)]'
                    }`}>
                      {settings.responseMethodology
                        ? t('adversarialPage.settings.usingCustom', 'Custom')
                        : t('adversarialPage.settings.usingDefault', 'Default')
                      }
                    </span>
                  </div>
                  <svg
                    className={`w-4 h-4 text-[var(--text-muted)] transition-transform ${expandedMethodology === 'response' ? 'rotate-90' : ''}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                {expandedMethodology === 'response' && (
                  <div className="px-4 pb-4 space-y-2">
                    <p className="text-xs text-[var(--text-muted)]">
                      {t('adversarialPage.settings.responseMethodologyHelp', 'Instructions for how to evaluate and respond to adversarial findings. Leave empty to use the default.')}
                    </p>
                    <textarea
                      value={settings.responseMethodology || defaultResponseMethodology}
                      onChange={(e) => setSettings(s => ({ ...s, responseMethodology: e.target.value }))}
                      rows={10}
                      className="w-full px-3 py-2 rounded-md border border-[var(--border-default)] bg-[var(--surface-base)] text-[var(--text-primary)] text-sm font-mono resize-y"
                    />
                    {settings.responseMethodology && (
                      <button
                        onClick={() => setSettings(s => ({ ...s, responseMethodology: '' }))}
                        className="text-xs text-[var(--interactive-primary)] hover:underline"
                      >
                        {t('adversarialPage.settings.resetToDefault', 'Reset to default')}
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Save button */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={handleSaveSettings}
                  disabled={!isDirty || savingSettings}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {savingSettings
                    ? t('common.processing', 'Processing...')
                    : t('adversarialPage.settings.save', 'Save Settings')
                  }
                </button>
                {isDirty && (
                  <span className="text-xs text-[var(--text-muted)]">
                    {t('editor.markdown.unsavedChanges', 'Unsaved changes')}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function AdversarialPage() {
  return <Content />;
}
