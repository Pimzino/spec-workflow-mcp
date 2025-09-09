import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { ApiProvider, useApi } from '../api/api';
import { useWs } from '../ws/WebSocketProvider';
import { Markdown } from '../markdown/Markdown';
import { MarkdownEditor } from '../editor/MarkdownEditor';
import { ConfirmationModal } from '../modals/ConfirmationModal';
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
  const [viewMode, setViewMode] = useState<'rendered' | 'source' | 'editor'>('rendered');
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

  // Check for unsaved changes before closing
  const handleClose = useCallback(() => {
    const hasUnsaved = editContent !== content && viewMode === 'editor';
    
    if (hasUnsaved) {
      setConfirmCloseModalOpen(true);
      return;
    }
    
    onClose();
  }, [editContent, content, viewMode, onClose]);

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

    if (!content) {
      return (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          {t('common.noContentAvailable')}
        </div>
      );
    }

    if (viewMode === 'rendered') {
      return (
        <div className="prose prose-sm sm:prose-base md:prose-lg max-w-none dark:prose-invert prose-img:max-w-full prose-img:h-auto prose-headings:text-gray-900 dark:prose-headings:text-white prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-strong:text-gray-900 dark:prose-strong:text-white prose-code:text-gray-800 dark:prose-code:text-gray-200 prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-pre:bg-gray-50 dark:prose-pre:bg-gray-900 prose-blockquote:text-gray-700 dark:prose-blockquote:text-gray-300 prose-li:text-gray-700 dark:prose-li:text-gray-300 overflow-y-visible">
          <Markdown content={content} />
        </div>
      );
    } else if (viewMode === 'source') {
      return (
        <div className="bg-gray-50 dark:bg-gray-900 p-3 sm:p-4 rounded-lg text-xs sm:text-sm overflow-auto">
          <pre className="whitespace-pre-wrap text-gray-800 dark:text-gray-200 leading-relaxed overflow-x-auto">
            {content}
          </pre>
        </div>
      );
    } else {
      // Editor mode
      return (
        <div className="h-full">
          <MarkdownEditor
            content={content}
            editContent={editContent}
            onChange={setEditContent}
            onSave={handleSave}
            saving={saving}
            saved={saved}
            error={saveError}
          />
        </div>
      );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4 md:p-6">
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-7xl flex flex-col h-[95vh] max-h-[95vh] overflow-hidden`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 md:p-8 border-b border-gray-200 dark:border-gray-700">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900 dark:text-white truncate">
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
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 hidden sm:block">
              {isArchived ? `${t('specsPage.modal.archivedNotice')} • ` : ''}{t('common.lastModified', { date: formatDate(spec.lastModified, t) })}
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

        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between p-3 sm:p-4 md:p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 gap-3 sm:gap-4 md:gap-6">
          {/* Document Switcher */}
          <div className="flex items-center gap-2 flex-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">{t('specsPage.modal.docLabel')}</label>
            <select
              value={selectedDoc}
              onChange={(e) => setSelectedDoc(e.target.value)}
              className="flex-1 sm:flex-none px-3 py-1.5 text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              aria-label={t('specsPage.modal.docSelectAria')}
            >
              {availableDocs.map(doc => (
                <option key={doc} value={doc}>
                  {t(`specsPage.documents.${doc}`)}
                </option>
              ))}
            </select>
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 self-center sm:self-auto">
            <button
              onClick={() => setViewMode('rendered')}
              className={`px-2 sm:px-3 py-1.5 text-sm rounded-l-lg transition-colors flex items-center gap-1 ${
                viewMode === 'rendered'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span className="hidden md:inline">{t('common.viewMode.rendered')}</span>
            </button>
            <button
              onClick={() => setViewMode('source')}
              className={`px-2 sm:px-3 py-1.5 text-sm transition-colors flex items-center gap-1 ${
                viewMode === 'source'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              <span className="hidden md:inline">{t('common.viewMode.source')}</span>
            </button>
            <button
              onClick={() => setViewMode('editor')}
              className={`px-2 sm:px-3 py-1.5 text-sm rounded-r-lg transition-colors flex items-center gap-1 ${
                viewMode === 'editor'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span className="hidden md:inline">{t('common.viewMode.editor')}</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className={`${viewMode === 'editor' ? 'flex-1 overflow-hidden' : 'p-3 sm:p-6 md:p-8 overflow-auto min-h-0'}`}>
          {availableDocs.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
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
      className={`bg-white dark:bg-gray-800 shadow rounded-lg cursor-pointer hover:shadow-lg transition-all ${
        spec.status === 'completed' ? 'opacity-75' : ''
      }`}
      onClick={() => onOpenModal(spec)}
    >
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className={`text-lg font-medium mb-2 ${
              spec.status === 'completed' 
                ? 'text-gray-600 dark:text-gray-400' 
                : 'text-gray-900 dark:text-white'
            }`}>
              {spec.displayName}
            </h3>
            <div className={`flex items-center space-x-4 text-sm ${
              spec.status === 'completed' 
                ? 'text-gray-400 dark:text-gray-500' 
                : 'text-gray-500 dark:text-gray-400'
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
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{"width": `${progress}%`} as React.CSSProperties}
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {t('common.percentComplete', { percent: progress })}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function Content() {
  const { specs, archivedSpecs, reloadAll } = useApi();
  const [query, setQuery] = useState('');
  const [selectedSpec, setSelectedSpec] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<'active' | 'archived'>('active');
  const { t } = useTranslation();

  useEffect(() => { reloadAll(); }, [reloadAll]);

  const currentSpecs = activeTab === 'active' ? specs : archivedSpecs;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return currentSpecs;
    return currentSpecs.filter((s) => s.displayName.toLowerCase().includes(q) || s.name.toLowerCase().includes(q));
  }, [currentSpecs, query]);

  return (
    <div className="grid gap-4">
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">{t('specsPage.header.title')}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {activeTab === 'active' 
                ? t('specsPage.header.subtitle.active')
                : t('specsPage.header.subtitle.archived')
              }
            </p>
          </div>
          <input 
            className="px-3 py-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-auto" 
            placeholder={activeTab === 'active' ? t('specsPage.search.placeholder.active') : t('specsPage.search.placeholder.archived')}
            value={query} 
            onChange={(e) => setQuery(e.target.value)} 
          />
        </div>
        
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('active')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'active'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:border-gray-300'
              } transition-colors`}
            >
              {t('specsPage.tabs.active')} ({specs.length})
            </button>
            <button
              onClick={() => setActiveTab('archived')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'archived'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:border-gray-300'
              } transition-colors`}
            >
              {t('specsPage.tabs.archived')} ({archivedSpecs.length})
            </button>
          </nav>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((s) => (
          <SpecCard 
            key={s.name} 
            spec={s} 
            onOpenModal={setSelectedSpec} 
            isArchived={activeTab === 'archived'}
          />
        ))}
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
  const { initial } = useWs();
  return (
    <ApiProvider initial={initial}>
      <Content />
    </ApiProvider>
  );
}


