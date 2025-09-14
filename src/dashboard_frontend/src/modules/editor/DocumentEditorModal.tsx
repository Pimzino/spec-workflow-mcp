import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useApi } from '../api/api';
import { Markdown } from '../markdown/Markdown';
import { MarkdownEditor } from './MarkdownEditor';
import { ConfirmationModal } from '../modals/ConfirmationModal';
import { useTranslation } from 'react-i18next';

export type Document = {
  path: string;
  name: string;
  lastModified?: string;
  content?: string;
};

export function DocumentEditorModal({ document, isOpen, onClose }: { document: Document | null; isOpen: boolean; onClose: (shouldReload: boolean) => void }) {
  const { getCustomDocument, saveCustomDocument } = useApi();
  const { t } = useTranslation();
  const [viewMode, setViewMode] = useState<'rendered' | 'source' | 'editor'>('rendered');
  const [content, setContent] = useState<string>('');
  const [editContent, setEditContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [saved, setSaved] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string>('');
  const [confirmCloseModalOpen, setConfirmCloseModalOpen] = useState<boolean>(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    setHasUnsavedChanges(editContent !== content);
  }, [editContent, content]);

  // Load document when modal opens
  useEffect(() => {
    if (!isOpen || !document) {
      setContent('');
      setEditContent('');
      return;
    }

    let active = true;
    setLoading(true);

    getCustomDocument(document.path)
      .then((data) => {
        if (active) {
          const documentContent = data.content || '';
          setContent(documentContent);
          setEditContent(documentContent);
        }
      })
      .catch(() => {
        if (active) {
          setContent('');
          setEditContent('');
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => { active = false; };
  }, [isOpen, document, getCustomDocument]);

  useEffect(() => {
    setSaved(false);
    setSaveError('');
  }, [document]);

  const handleSave = useCallback(async () => {
    if (!document) return;

    setSaving(true);
    setSaveError('');

    try {
      const result = await saveCustomDocument(document.path, editContent);
      if (result.ok) {
        setSaved(true);
        setContent(editContent);
        setTimeout(() => setSaved(false), 3000);
      } else {
        setSaveError('Failed to save document');
      }
    } catch (error: any) {
      setSaveError(error.message || 'Failed to save document');
    } finally {
      setSaving(false);
    }
  }, [document, editContent, saveCustomDocument]);

  const handleClose = useCallback(() => {
    if (hasUnsavedChanges && viewMode === 'editor') {
      setConfirmCloseModalOpen(true);
      return;
    }
    onClose(hasUnsavedChanges);
  }, [hasUnsavedChanges, viewMode, onClose]);

  const handleConfirmClose = () => {
    onClose(false); // Don't reload if they discard changes
  };

  if (!isOpen || !document) return null;

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

    if (!content && viewMode !== 'editor') {
      return (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <p>{t('common.noContentAvailable')}</p>
          <button onClick={() => setViewMode('editor')} className="mt-4 btn-primary">
            {t('documents.createNow', 'Create Now')}
          </button>
        </div>
      );
    }

    if (viewMode === 'rendered') {
      return <Markdown content={content} />;
    } else if (viewMode === 'source') {
      return (
        <div className="bg-gray-50 dark:bg-gray-900 p-3 sm:p-4 rounded-lg text-xs sm:text-sm overflow-auto">
          <pre className="whitespace-pre-wrap text-gray-800 dark:text-gray-200 leading-relaxed overflow-x-auto">
            {content}
          </pre>
        </div>
      );
    } else {
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-7xl overflow-hidden flex flex-col h-[95vh]`}>
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white truncate">
            {t('documentEditor.title', { name: document.name })}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-2 -m-2 ml-4"
            aria-label={t('common.close')}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex items-center justify-end p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 gap-3 sm:gap-4">
          <div className="flex items-center bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600">
            <button onClick={() => setViewMode('rendered')} className={`px-3 py-1.5 text-sm rounded-l-lg transition-colors ${viewMode === 'rendered' ? 'bg-blue-600 text-white' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'}`}>
              {t('common.viewMode.rendered')}
            </button>
            <button onClick={() => setViewMode('source')} className={`px-3 py-1.5 text-sm transition-colors ${viewMode === 'source' ? 'bg-blue-600 text-white' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'}`}>
              {t('common.viewMode.source')}
            </button>
            <button onClick={() => setViewMode('editor')} className={`px-3 py-1.5 text-sm rounded-r-lg transition-colors ${viewMode === 'editor' ? 'bg-blue-600 text-white' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'}`}>
              {t('common.viewMode.editor')}
            </button>
          </div>
        </div>

        <div className={`${viewMode === 'editor' ? 'flex-1 overflow-hidden' : 'flex-1 p-3 sm:p-6 overflow-auto min-h-0'}`}>
          {renderContent()}
        </div>
      </div>

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
