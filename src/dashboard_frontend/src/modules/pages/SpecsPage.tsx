import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useApi } from '../api/api';
import { MDXEditorWrapper } from '../mdx-editor';
import { ConfirmationModal } from '../modals/ConfirmationModal';
import { SortDropdown } from '../components/SortDropdown';
import { useTranslation } from 'react-i18next';

function formatDate(dateStr?: string, t?: (k: string, o?: any) => string) {
  if (!dateStr) return t ? t('common.never') : 'Never';
  return new Date(dateStr).toLocaleDateString(undefined, { 
    month: 'short', 
    day: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit' 
  });
}

function SpecModal({ spec, isOpen, onClose, isArchived }: { spec: any; isOpen: boolean; onClose: () => void; isArchived?: boolean }) {
  const { getAllSpecDocuments, getAllArchivedSpecDocuments, saveSpecDocument, saveArchivedSpecDocument } = useApi();
  const { t } = useTranslation();
  const [selectedDoc, setSelectedDoc] = useState<string>('requirements');
  const [content, setContent] = useState<string>('');
  const [editContent, setEditContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [saved, setSaved] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string>('');
  const [allDocuments, setAllDocuments] = useState<Record<string, { content: string; lastModified: string } | null>>({});
  const [confirmCloseModalOpen, setConfirmCloseModalOpen] = useState<boolean>(false);

  const phases = spec?.phases || {};
  const availableDocs = ['requirements', 'design', 'tasks'].filter(doc => 
    phases[doc] && phases[doc].exists
  );

  // Set default document to first available
  useEffect(() => {
    if (availableDocs.length > 0 && !availableDocs.includes(selectedDoc)) {
      setSelectedDoc(availableDocs[0]);
    }
  }, [availableDocs, selectedDoc]);

  // Load all documents when modal opens
  useEffect(() => {
    if (!isOpen || !spec) {
      setAllDocuments({});
      setContent('');
      return;
    }

    let active = true;
    setLoading(true);
    
    const getDocuments = isArchived ? getAllArchivedSpecDocuments : getAllSpecDocuments;
    
    getDocuments(spec.name)
      .then((docs) => {
        if (active) {
          setAllDocuments(docs);
        }
      })
      .catch(() => {
        if (active) {
          setAllDocuments({});
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => { active = false; };
  }, [isOpen, spec, isArchived, getAllSpecDocuments, getAllArchivedSpecDocuments]);

  // Update content when selected document changes (but not during saves)
  useEffect(() => {
    if (selectedDoc && allDocuments[selectedDoc]) {
      const docContent = allDocuments[selectedDoc]?.content || '';
      setContent(docContent);
      // Only reset edit content if we're not currently saving
      // This prevents the auto-save from resetting the editor
      if (!saving) {
        setEditContent(docContent);
      }
    } else {
      setContent('');
      setEditContent('');
    }
    // Reset editor state when switching documents
    setSaved(false);
    setSaveError('');
  }, [selectedDoc, allDocuments, saving]);

  // Save function for editor
  const handleSave = useCallback(async () => {
    if (!spec || !selectedDoc || !editContent) return;
    
    setSaving(true);
    setSaveError('');
    
    try {
      const saveFunction = isArchived ? saveArchivedSpecDocument : saveSpecDocument;
      const result = await saveFunction(spec.name, selectedDoc, editContent);
      if (result.ok) {
        setSaved(true);
        // Update the documents state to reflect the save
        setAllDocuments(prev => ({
          ...prev,
          [selectedDoc]: {
            ...prev[selectedDoc]!,
            content: editContent,
            lastModified: new Date().toISOString()
          }
        }));
        // Update content state to match what was saved
        setContent(editContent);
        // Clear saved status after a delay
        setTimeout(() => setSaved(false), 3000);
      } else {
        setSaveError('Failed to save document');
      }
    } catch (error: any) {
      setSaveError(error.message || 'Failed to save document');
    } finally {
      setSaving(false);
    }
  }, [spec, selectedDoc, editContent, isArchived, saveSpecDocument, saveArchivedSpecDocument]);

  // Check for unsaved changes before closing (always in edit mode now)
  const handleClose = useCallback(() => {
    const hasUnsaved = editContent !== content;

    if (hasUnsaved) {
      setConfirmCloseModalOpen(true);
      return;
    }

    onClose();
  }, [editContent, content, onClose]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose]);

  const handleConfirmClose = () => {
    onClose();
  };

  if (!isOpen || !spec) return null;

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="spinner-gradient spinner-gradient-lg mb-4" />
          <span className="text-gray-400 text-sm">{t('common.loadingContent')}</span>
        </div>
      );
    }

    if (!content && !editContent) {
      return (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          {t('common.noContentAvailable')}
        </div>
      );
    }

    // Always use edit mode - MDX Editor toolbar has built-in source toggle
    return (
      <MDXEditorWrapper
        content={editContent}
        mode="edit"
        onChange={setEditContent}
        onSave={handleSave}
        saving={saving}
        saved={saved}
        error={saveError}
        enableMermaid={true}
        height="full"
      />
    );
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4 md:p-6">
      <div className="glass-card w-full max-w-7xl flex flex-col h-[95vh] max-h-[95vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 md:p-8 border-b border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            {/* Gradient Icon */}
            <div className="gradient-icon w-12 h-12 flex-shrink-0 hidden sm:flex">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white truncate">
                  {spec.displayName}
                </h2>
                {isArchived && (
                  <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium bg-orange-500/20 text-orange-500 rounded-full">
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8l4 4 4-4m0 6l-4 4-4-4" />
                    </svg>
                    {t('specsPage.modal.archivedBadge')}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 hidden sm:block">
                {isArchived ? `${t('specsPage.modal.archivedNotice')} • ` : ''}{t('common.lastModified', { date: formatDate(spec.lastModified, t) })}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="btn-icon ml-4"
            aria-label={t('specsPage.modal.closeAria')}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Document Tabs - Pill Style */}
        <div className="flex items-center gap-3 px-4 sm:px-6 md:px-8 py-3 border-b border-gray-200/50 dark:border-gray-700/50 bg-gray-50/50 dark:bg-black/20">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap hidden sm:inline">{t('specsPage.modal.docLabel')}</span>
          <div className="flex gap-2 p-1 bg-gray-100 dark:bg-black/30 rounded-full">
            {availableDocs.map(doc => (
              <button
                key={doc}
                onClick={() => setSelectedDoc(doc)}
                className={`btn-pill ${selectedDoc === doc ? 'active' : ''}`}
                aria-label={t(`specsPage.documents.${doc}`)}
              >
                {doc === 'requirements' && (
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                )}
                {doc === 'design' && (
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
                  </svg>
                )}
                {doc === 'tasks' && (
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                )}
                <span className="hidden sm:inline">{t(`specsPage.documents.${doc}`)}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content - MDX Editor handles its own toolbar with source toggle */}
        <div className="flex-1 overflow-hidden">
          {availableDocs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-500 dark:text-gray-400">
              <div className="gradient-icon w-16 h-16 mb-4">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-lg font-medium text-gray-900 dark:text-white mb-1">{t('specsPage.empty.title')}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('specsPage.empty.description')}</p>
            </div>
          ) : (
            renderContent()
          )}
        </div>
      </div>

      {/* Confirmation Modal for closing with unsaved changes */}
      <ConfirmationModal
        isOpen={confirmCloseModalOpen}
        onClose={() => setConfirmCloseModalOpen(false)}
        onConfirm={handleConfirmClose}
        title={t('common.unsavedChanges.title')}
        message={t('common.unsavedChanges.message')}
        confirmText={t('common.close')}
        cancelText={t('common.keepEditing')}
        variant="danger"
      />
    </div>
  );
}

function SpecCard({ spec, onOpenModal, isArchived }: { spec: any; onOpenModal: (spec: any) => void; isArchived: boolean }) {
  const { archiveSpec, unarchiveSpec } = useApi();
  const { t } = useTranslation();
  const [isArchiving, setIsArchiving] = useState(false);
  const progress = spec.taskProgress?.total
    ? Math.round((spec.taskProgress.completed / spec.taskProgress.total) * 100)
    : 0;

  const handleArchiveToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsArchiving(true);

    try {
      if (isArchived) {
        await unarchiveSpec(spec.name);
      } else {
        await archiveSpec(spec.name);
      }
    } catch (error) {
      console.error('Failed to toggle archive status:', error);
    } finally {
      setIsArchiving(false);
    }
  };

  const getProgressColor = (pct: number) => {
    if (pct >= 75) return 'bg-green-500/20 text-green-400';
    if (pct >= 50) return 'bg-amber-500/20 text-amber-400';
    return 'bg-purple-500/20 text-purple-400';
  };

  return (
    <div
      className={`glass-card card-lift glow-hover cursor-pointer group ${
        spec.status === 'completed' ? 'opacity-75' : ''
      }`}
      onClick={() => onOpenModal(spec)}
    >
      <div className="p-5">
        <div className="flex items-start gap-4">
          {/* Gradient Document Icon */}
          <div className="gradient-icon-blue w-10 h-10 flex-shrink-0">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>

          <div className="flex-1 min-w-0">
            {/* Spec Name with gradient hover */}
            <h3 className={`text-lg font-semibold mb-1 transition-all duration-200 ${
              spec.status === 'completed'
                ? 'text-gray-600 dark:text-gray-400'
                : 'text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400'
            }`}>
              {spec.displayName}
            </h3>

            {/* Metadata Row */}
            <div className={`flex items-center flex-wrap gap-3 text-sm ${
              spec.status === 'completed'
                ? 'text-gray-400 dark:text-gray-500'
                : 'text-gray-500 dark:text-gray-400'
            }`}>
              <span className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {formatDate(spec.lastModified)}
              </span>
              {spec.taskProgress && (
                <span className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                  {spec.taskProgress.completed}/{spec.taskProgress.total}
                </span>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={handleArchiveToggle}
              disabled={isArchiving}
              className={`btn-icon ${
                isArchiving
                  ? 'text-gray-400 cursor-not-allowed'
                  : isArchived
                    ? 'text-blue-500 hover:text-blue-400 hover:bg-blue-500/10'
                    : 'text-orange-500 hover:text-orange-400 hover:bg-orange-500/10'
              }`}
              title={isArchiving ? 'Processing...' : isArchived ? 'Unarchive spec' : 'Archive spec'}
            >
              {isArchiving ? (
                <div className="spinner-gradient spinner-gradient-sm" />
              ) : isArchived ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8l4 4 4-4m0 6l-4 4-4-4" />
                </svg>
              )}
            </button>
            <button className="btn-icon">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Progress bar with gradient */}
        {spec.taskProgress && spec.taskProgress.total > 0 && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-gray-500 dark:text-gray-400">{t('specsPage.table.progress')}</span>
              <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${getProgressColor(progress)}`}>
                {progress}%
              </span>
            </div>
            <div className="progress-gradient">
              <div
                className="progress-gradient-fill"
                style={{"width": `${progress}%`} as React.CSSProperties}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SpecTableRow({ spec, onOpenModal, isArchived }: { spec: any; onOpenModal: (spec: any) => void; isArchived: boolean }) {
  const { archiveSpec, unarchiveSpec } = useApi();
  const { t } = useTranslation();
  const [isArchiving, setIsArchiving] = useState(false);
  const progress = spec.taskProgress?.total
    ? Math.round((spec.taskProgress.completed / spec.taskProgress.total) * 100)
    : 0;

  const handleArchiveToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsArchiving(true);

    try {
      if (isArchived) {
        await unarchiveSpec(spec.name);
      } else {
        await archiveSpec(spec.name);
      }
    } catch (error) {
      console.error('Failed to toggle archive status:', error);
    } finally {
      setIsArchiving(false);
    }
  };

  const getProgressColor = (pct: number) => {
    if (pct >= 75) return 'bg-green-500/20 text-green-400';
    if (pct >= 50) return 'bg-amber-500/20 text-amber-400';
    return 'bg-purple-500/20 text-purple-400';
  };

  return (
    <tr
      className="hover:bg-purple-500/5 dark:hover:bg-purple-500/10 cursor-pointer transition-all duration-200 group"
      onClick={() => onOpenModal(spec)}
    >
      <td className="px-4 py-4">
        <div className="flex items-center">
          {/* Gradient Icon */}
          <div className="gradient-icon-blue w-10 h-10 flex-shrink-0">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div className="ml-4">
            <div className={`text-sm font-semibold transition-colors duration-200 ${
              spec.status === 'completed'
                ? 'text-gray-600 dark:text-gray-400'
                : 'text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400'
            }`}>
              {spec.displayName}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-500">
              {spec.name}
            </div>
          </div>
        </div>
      </td>
      <td className="px-4 py-4">
        {spec.taskProgress && spec.taskProgress.total > 0 ? (
          <div className="flex items-center gap-3">
            <div className="w-24 progress-gradient">
              <div
                className="progress-gradient-fill"
                style={{"width": `${progress}%`} as React.CSSProperties}
              />
            </div>
            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${getProgressColor(progress)}`}>
              {progress}%
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-500">
              {spec.taskProgress.completed}/{spec.taskProgress.total}
            </span>
          </div>
        ) : (
          <span className="text-sm text-gray-500 dark:text-gray-500">
            {t('specsPage.noTasks')}
          </span>
        )}
      </td>
      <td className="px-4 py-4">
        <span className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {formatDate(spec.lastModified, t)}
        </span>
      </td>
      <td className="px-4 py-4">
        <div className="flex items-center gap-1">
          <button
            onClick={handleArchiveToggle}
            disabled={isArchiving}
            className={`btn-icon ${
              isArchiving
                ? 'text-gray-400 cursor-not-allowed'
                : isArchived
                  ? 'text-blue-500 hover:text-blue-400 hover:bg-blue-500/10'
                  : 'text-orange-500 hover:text-orange-400 hover:bg-orange-500/10'
            }`}
            title={isArchiving ? 'Processing...' : isArchived ? 'Unarchive spec' : 'Archive spec'}
          >
            {isArchiving ? (
              <div className="spinner-gradient spinner-gradient-sm" />
            ) : isArchived ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8l4 4 4-4m0 6l-4 4-4-4" />
              </svg>
            )}
          </button>
          <button className="btn-icon">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
        </div>
      </td>
    </tr>
  );
}

function Content() {
  const { specs, archivedSpecs, reloadAll } = useApi();
  const [query, setQuery] = useState('');
  const [selectedSpec, setSelectedSpec] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<'active' | 'archived'>('active');
  const [sortBy, setSortBy] = useState('default');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const { t } = useTranslation();

  useEffect(() => { reloadAll(); }, [reloadAll]);

  const currentSpecs = activeTab === 'active' ? specs : archivedSpecs;

  // Sorting function
  const sortSpecs = useCallback((specs: any[]) => {
    if (sortBy === 'default') {
      return specs;
    }

    return [...specs].sort((a, b) => {
      let compareValue = 0;

      switch (sortBy) {
        case 'name':
          compareValue = a.displayName.localeCompare(b.displayName);
          break;
        case 'progress':
          const aProgress = a.taskProgress?.total ? (a.taskProgress.completed / a.taskProgress.total) : 0;
          const bProgress = b.taskProgress?.total ? (b.taskProgress.completed / b.taskProgress.total) : 0;
          compareValue = aProgress - bProgress;
          break;
        case 'lastModified':
          const aDate = new Date(a.lastModified || 0).getTime();
          const bDate = new Date(b.lastModified || 0).getTime();
          compareValue = aDate - bDate;
          break;
        default:
          return 0;
      }

      return sortOrder === 'asc' ? compareValue : -compareValue;
    });
  }, [sortBy, sortOrder]);


  // Combined filtering and sorting
  const filtered = useMemo(() => {
    let result = currentSpecs;

    // Apply text search filter
    const q = query.trim().toLowerCase();
    if (q) {
      result = result.filter((s) => s.displayName.toLowerCase().includes(q) || s.name.toLowerCase().includes(q));
    }


    // Apply sorting
    result = sortSpecs(result);

    return result;
  }, [currentSpecs, query, sortSpecs]);


  const handleSortChange = (sort: string, order: string) => {
    setSortBy(sort);
    setSortOrder(order as 'asc' | 'desc');
  };


  // Sort options for specs
  const specSortOptions = [
    {
      id: 'default',
      label: t('specsPage.sort.defaultOrder'),
      description: t('specsPage.sort.defaultOrderDesc'),
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      )
    },
    {
      id: 'name',
      label: t('specsPage.sort.name'),
      description: t('specsPage.sort.nameDesc'),
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
        </svg>
      )
    },
    {
      id: 'progress',
      label: t('specsPage.sort.progress'),
      description: t('specsPage.sort.progressDesc'),
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      )
    },
    {
      id: 'lastModified',
      label: t('specsPage.sort.lastModified'),
      description: t('specsPage.sort.lastModifiedDesc'),
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  ];

  return (
    <div className="grid gap-4">
      <div className="glass-card p-4 sm:p-6 relative overflow-hidden">
        {/* Gradient accent line at top */}
        <div className="absolute top-0 left-0 right-0 h-1 gradient-purple" />

        <div className="mb-6">
          <div className="flex items-center gap-3">
            <div className="gradient-icon w-10 h-10 sm:w-12 sm:h-12">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{t('specsPage.header.title')}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {activeTab === 'active'
                  ? t('specsPage.header.subtitle.active')
                  : t('specsPage.header.subtitle.archived')
                }
              </p>
            </div>
          </div>
        </div>
        
        {/* Tab Navigation and Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Tab Pills */}
          <div className="flex gap-2 p-1 bg-gray-100 dark:bg-black/30 rounded-full">
            <button
              onClick={() => setActiveTab('active')}
              className={`btn-pill ${activeTab === 'active' ? 'active' : ''}`}
            >
              {t('specsPage.tabs.active')}
              <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs ${
                activeTab === 'active'
                  ? 'bg-white/20 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}>
                {specs.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('archived')}
              className={`btn-pill ${activeTab === 'archived' ? 'active' : ''}`}
            >
              {t('specsPage.tabs.archived')}
              <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs ${
                activeTab === 'archived'
                  ? 'bg-white/20 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}>
                {archivedSpecs.length}
              </span>
            </button>
          </div>

          {/* Search and Sort Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Glass Search Input */}
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                className="min-w-[180px] md:min-w-[220px] pl-10 pr-4 py-2 rounded-full bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                placeholder={activeTab === 'active' ? t('specsPage.search.placeholder.active') : t('specsPage.search.placeholder.archived')}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>

            {/* Results Count Badge */}
            <span className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-600 dark:text-purple-400">
              {filtered.length} {filtered.length === 1 ? t('specsPage.result') : t('specsPage.results')}
            </span>

            <SortDropdown
              currentSort={sortBy}
              currentOrder={sortOrder}
              onSortChange={handleSortChange}
              sortOptions={specSortOptions}
              align="right"
            />
          </div>
        </div>

        {/* Specs Table - Desktop */}
        <div className="overflow-x-auto hidden lg:block mt-6 rounded-xl">
          <table className="min-w-full">
            <thead className="sticky top-0 z-10">
              <tr className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-b-2 border-purple-500/30 dark:border-purple-400/30">
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider first:rounded-tl-lg">
                  {t('specsPage.table.name')}
                </th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  {t('specsPage.table.progress')}
                </th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  {t('specsPage.table.lastModified')}
                </th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider last:rounded-tr-lg">
                  {t('specsPage.table.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200/30 dark:divide-gray-700/30">
              {filtered.map((spec) => (
                <SpecTableRow
                  key={spec.name}
                  spec={spec}
                  onOpenModal={setSelectedSpec}
                  isArchived={activeTab === 'archived'}
                />
              ))}
            </tbody>
          </table>
        </div>

        {/* Specs Cards - Mobile/Tablet */}
        <div className="lg:hidden space-y-3 md:space-y-4">
          {filtered.map((spec) => (
            <SpecCard
              key={spec.name}
              spec={spec}
              onOpenModal={setSelectedSpec}
              isArchived={activeTab === 'archived'}
            />
          ))}
        </div>

        {/* Empty State */}
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 mt-6">
            <div className="gradient-icon w-16 h-16 mb-4">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              {query ? t('specsPage.empty.noResults') : t('specsPage.empty.title')}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm text-center">
              {query ? t('specsPage.empty.noResultsDescription') : t('specsPage.empty.description')}
            </p>
            {query && (
              <button
                onClick={() => setQuery('')}
                className="btn-pill mt-4"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
                {t('specsPage.empty.clearSearch')}
              </button>
            )}
          </div>
        )}
      </div>

      <SpecModal 
        spec={selectedSpec} 
        isOpen={!!selectedSpec} 
        onClose={() => setSelectedSpec(null)} 
        isArchived={activeTab === 'archived'}
      />
    </div>
  );
}

export function SpecsPage() {
  return <Content />;
}


