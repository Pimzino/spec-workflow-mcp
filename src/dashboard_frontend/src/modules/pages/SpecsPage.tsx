import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useApi } from '../api/api';
import { MDXEditorWrapper } from '../mdx-editor';
import { ConfirmationModal } from '../modals/ConfirmationModal';
import { SortDropdown } from '../components/SortDropdown';
import { useTranslation } from 'react-i18next';
import { formatDate } from '../../lib/dateUtils';

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
        <div className="flex items-center justify-center py-12">
          <svg className="animate-spin h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="ml-2">{t('common.loadingContent')}</span>
        </div>
      );
    }

    if (!content && !editContent) {
      return (
        <div className="text-center py-12 text-[var(--text-muted)]">
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4 md:p-6">
      <div className={`bg-[var(--surface-panel)] rounded-lg shadow-xl w-full max-w-7xl flex flex-col h-[95vh] max-h-[95vh] overflow-hidden`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 md:p-8 border-b border-[var(--border-default)]">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-[var(--text-primary)] truncate">
                {spec.displayName}
              </h2>
              {isArchived && (
                <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400 rounded-full">
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8l4 4 4-4m0 6l-4 4-4-4" />
                  </svg>
                  {t('specsPage.modal.archivedBadge')}
                </span>
              )}
            </div>
            <p className="text-sm text-[var(--text-secondary)] mt-1 hidden sm:block">
              {isArchived ? `${t('specsPage.modal.archivedNotice')} • ` : ''}{t('common.lastModified', { date: formatDate(spec.lastModified, undefined, t) })}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-2 -m-2 ml-4"
            aria-label={t('specsPage.modal.closeAria')}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Document Switcher */}
        <div className="flex items-center gap-2 p-4 border-b border-[var(--border-default)] bg-[var(--surface-sunken)]">
          <label className="text-sm font-medium text-[var(--text-secondary)] whitespace-nowrap">{t('specsPage.modal.docLabel')}</label>
          <select
            value={selectedDoc}
            onChange={(e) => setSelectedDoc(e.target.value)}
            className="flex-1 sm:flex-none px-3 py-1.5 text-sm rounded-lg border border-[var(--border-default)] bg-[var(--surface-panel)] text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--interactive-primary)] focus:border-[var(--interactive-primary)]"
            aria-label={t('specsPage.modal.docSelectAria')}
          >
            {availableDocs.map(doc => (
              <option key={doc} value={doc}>
                {t(`specsPage.documents.${doc}`)}
              </option>
            ))}
          </select>
        </div>

        {/* Content - MDX Editor handles its own toolbar with source toggle */}
        <div className="flex-1 overflow-hidden">
          {availableDocs.length === 0 ? (
            <div className="text-center py-12 text-[var(--text-muted)]">
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-lg font-medium">{t('specsPage.empty.title')}</p>
              <p className="text-sm">{t('specsPage.empty.description')}</p>
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
  
  return (
    <div
      className={`bg-[var(--surface-panel)] border border-[var(--border-default)] rounded-lg cursor-pointer hover:bg-[var(--surface-hover)] transition-all ${
        spec.status === 'completed' ? 'opacity-75' : ''
      }`}
      onClick={() => onOpenModal(spec)}
    >
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className={`text-lg font-medium mb-2 ${
              spec.status === 'completed'
                ? 'text-[var(--text-secondary)]'
                : 'text-[var(--text-primary)]'
            }`}>
              {spec.displayName}
            </h3>
            <div className={`flex items-center space-x-4 text-sm ${
              spec.status === 'completed'
                ? 'text-[var(--text-muted)]'
                : 'text-[var(--text-secondary)]'
            }`}>
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {formatDate(spec.lastModified)}
              </span>
              {spec.taskProgress && (
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                  {spec.taskProgress.completed} / {spec.taskProgress.total} tasks
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleArchiveToggle}
              disabled={isArchiving}
              className={`p-2 rounded-lg transition-colors ${
                isArchiving 
                  ? 'text-gray-400 cursor-not-allowed'
                  : isArchived
                    ? 'text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/20'
                    : 'text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:text-orange-400 dark:hover:text-orange-300 dark:hover:bg-orange-900/20'
              }`}
              title={isArchiving ? 'Processing...' : isArchived ? 'Unarchive spec' : 'Archive spec'}
            >
              {isArchiving ? (
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : isArchived ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8l4 4 4-4m0 6l-4 4-4-4" />
                </svg>
              )}
            </button>
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </div>
        </div>

        {/* Progress bar */}
        {spec.taskProgress && spec.taskProgress.total > 0 && (
          <div className="mt-4">
            <div className="w-full bg-[var(--surface-sunken)] rounded-full h-2">
              <div
                className="bg-[var(--interactive-primary)] h-2 rounded-full transition-all duration-300"
                style={{"width": `${progress}%`} as React.CSSProperties}
              />
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              {t('common.percentComplete', { percent: progress })}
            </p>
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


  return (
    <tr
      className="hover:bg-[var(--surface-hover)] cursor-pointer transition-colors"
      onClick={() => onOpenModal(spec)}
    >
      <td className="px-4 py-4">
        <div className="flex items-center">
          <div className="flex-shrink-0 w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div className="ml-4">
            <div className={`text-sm font-medium ${
              spec.status === 'completed'
                ? 'text-[var(--text-secondary)]'
                : 'text-[var(--text-primary)]'
            }`}>
              {spec.displayName}
            </div>
            <div className="text-sm text-[var(--text-secondary)]">
              {spec.name}
            </div>
          </div>
        </div>
      </td>
      <td className="px-4 py-4">
        {spec.taskProgress && spec.taskProgress.total > 0 ? (
          <div className="flex items-center gap-2">
            <div className="w-20 bg-[var(--surface-sunken)] rounded-full h-2">
              <div
                className="bg-[var(--interactive-primary)] h-2 rounded-full transition-all duration-300"
                style={{"width": `${progress}%`} as React.CSSProperties}
              />
            </div>
            <span className="text-sm text-[var(--text-secondary)] whitespace-nowrap">
              {spec.taskProgress.completed}/{spec.taskProgress.total}
            </span>
          </div>
        ) : (
          <span className="text-sm text-[var(--text-muted)]">
            {t('specsPage.noTasks')}
          </span>
        )}
      </td>
      <td className="px-4 py-4 text-sm text-[var(--text-secondary)]">
        {formatDate(spec.lastModified, undefined, t)}
      </td>
      <td className="px-4 py-4">
        <div className="flex items-center gap-2">
          <button
            onClick={handleArchiveToggle}
            disabled={isArchiving}
            className={`p-2 rounded-lg transition-colors ${
              isArchiving
                ? 'text-gray-400 cursor-not-allowed'
                : isArchived
                  ? 'text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/20'
                  : 'text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:text-orange-400 dark:hover:text-orange-300 dark:hover:bg-orange-900/20'
            }`}
            title={isArchiving ? 'Processing...' : isArchived ? 'Unarchive spec' : 'Archive spec'}
          >
            {isArchiving ? (
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : isArchived ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8l4 4 4-4m0 6l-4 4-4-4" />
              </svg>
            )}
          </button>
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
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
      <div className="bg-[var(--surface-panel)] border border-[var(--border-default)] rounded-lg p-4">
        <div className="mb-4">
          <h2 className="text-lg sm:text-xl font-semibold text-[var(--text-primary)]">{t('specsPage.header.title')}</h2>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            {activeTab === 'active'
              ? t('specsPage.header.subtitle.active')
              : t('specsPage.header.subtitle.archived')
            }
          </p>
        </div>
        
        {/* Tab Navigation and Controls */}
        <div>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 py-2">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('active')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'active'
                    ? 'border-[var(--interactive-primary)] text-[var(--interactive-primary)]'
                    : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-default)]'
                } transition-colors`}
              >
                {t('specsPage.tabs.active')} ({specs.length})
              </button>
              <button
                onClick={() => setActiveTab('archived')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'archived'
                    ? 'border-[var(--interactive-primary)] text-[var(--interactive-primary)]'
                    : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-default)]'
                } transition-colors`}
              >
                {t('specsPage.tabs.archived')} ({archivedSpecs.length})
              </button>
            </nav>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <input
                className="min-w-[140px] md:min-w-[160px] px-3 py-2 md:px-4 md:py-2 rounded-lg bg-[var(--surface-panel)] border border-[var(--border-default)] text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--interactive-primary)] focus:border-[var(--interactive-primary)] transition-colors"
                placeholder={activeTab === 'active' ? t('specsPage.search.placeholder.active') : t('specsPage.search.placeholder.archived')}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <SortDropdown
                currentSort={sortBy}
                currentOrder={sortOrder}
                onSortChange={handleSortChange}
                sortOptions={specSortOptions}
                align="right"
              />
            </div>
          </div>
        </div>

        {/* Specs Table - Desktop */}
        <div className="overflow-x-auto hidden lg:block">
          <table className="min-w-full border border-[var(--border-default)] rounded-lg overflow-hidden">
            <thead className="bg-[var(--surface-sunken)]">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                  {t('specsPage.table.name')}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                  {t('specsPage.table.progress')}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                  {t('specsPage.table.lastModified')}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                  {t('specsPage.table.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-[var(--surface-panel)] divide-y divide-[var(--border-default)]">
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
          <div className="text-center py-12 mt-8 border-t border-[var(--border-default)]">
            <svg className="mx-auto h-12 w-12 text-[var(--text-muted)] mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-lg font-medium text-[var(--text-primary)] mb-2">
              {query ? t('specsPage.empty.noResults') : t('specsPage.empty.title')}
            </p>
            <p className="text-sm text-[var(--text-secondary)]">
              {query ? t('specsPage.empty.noResultsDescription') : t('specsPage.empty.description')}
            </p>
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


