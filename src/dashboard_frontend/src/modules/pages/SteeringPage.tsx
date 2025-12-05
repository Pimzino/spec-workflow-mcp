import React, { useEffect, useState, useCallback } from 'react';
import { useApi } from '../api/api';
import { MDXEditorWrapper } from '../mdx-editor';
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

type SteeringDocument = {
  name: string;
  displayName: string;
  exists: boolean;
  lastModified?: string;
  content?: string;
};

// Document type icons with their gradient classes
const documentIcons: Record<string, { gradient: string; icon: React.ReactNode }> = {
  product: {
    gradient: 'gradient-icon-blue',
    icon: (
      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    )
  },
  tech: {
    gradient: 'gradient-icon',
    icon: (
      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    )
  },
  structure: {
    gradient: 'gradient-icon-green',
    icon: (
      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
      </svg>
    )
  }
};

function SteeringModal({ document, isOpen, onClose }: { document: SteeringDocument | null; isOpen: boolean; onClose: () => void }) {
  const { getSteeringDocument, saveSteeringDocument } = useApi();
  const { t } = useTranslation();
  const [content, setContent] = useState<string>('');
  const [editContent, setEditContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [saved, setSaved] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string>('');
  const [confirmCloseModalOpen, setConfirmCloseModalOpen] = useState<boolean>(false);

  // Load document when modal opens
  useEffect(() => {
    if (!isOpen || !document) {
      setContent('');
      setEditContent('');
      return;
    }

    let active = true;
    setLoading(true);

    getSteeringDocument(document.name)
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
  }, [isOpen, document, getSteeringDocument]);

  // Reset editor state when switching documents
  useEffect(() => {
    setSaved(false);
    setSaveError('');
  }, [document]);

  // Save function for editor
  const handleSave = useCallback(async () => {
    if (!document || !editContent) return;

    setSaving(true);
    setSaveError('');

    try {
      const result = await saveSteeringDocument(document.name, editContent);
      if (result.ok) {
        setSaved(true);
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
  }, [document, editContent, saveSteeringDocument]);

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
      window.document.addEventListener('keydown', handleKeyDown);
    }

    return () => window.document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose]);

  const handleConfirmClose = () => {
    onClose();
  };

  if (!isOpen || !document) return null;

  const iconConfig = documentIcons[document.name] || documentIcons.product;

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="spinner-gradient spinner-gradient-lg mb-4" />
          <span className="text-gray-400 text-sm">{t('common.loadingContent')}</span>
        </div>
      );
    }

    // Always use edit mode - MDX Editor toolbar has built-in source toggle
    // Show editor even for empty documents so users can create content
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="glass-card w-full max-w-7xl overflow-hidden flex flex-col h-[95vh] max-h-[95vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200/10 dark:border-gray-700/50">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className={`${iconConfig.gradient} w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0`}>
              {iconConfig.icon}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white truncate">
                {t('steeringPage.modal.title', { name: document.displayName })}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 hidden sm:flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {t('common.lastModified', { date: formatDate(document.lastModified, t) })}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="btn-icon ml-4 hover:bg-gray-100/50 dark:hover:bg-white/5"
            aria-label={t('steeringPage.modal.closeAria')}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content - MDX Editor handles its own toolbar with source toggle */}
        <div className="flex-1 overflow-hidden bg-gray-50/50 dark:bg-gray-900/50">
          {renderContent()}
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

function SteeringDocumentCard({ document, onOpenModal }: { document: SteeringDocument; onOpenModal: (document: SteeringDocument) => void }) {
  const { t } = useTranslation();
  const iconConfig = documentIcons[document.name] || documentIcons.product;

  return (
    <div
      className="glass-card card-lift glow-hover p-5 cursor-pointer group"
      onClick={() => onOpenModal(document)}
    >
      <div className="flex items-start gap-4">
        {/* Icon with gradient */}
        <div className={`${iconConfig.gradient} w-12 h-12 flex-shrink-0 shadow-lg`}>
          {iconConfig.icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                {document.displayName}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                {document.name}.md
              </p>
            </div>

            {/* Status Badge */}
            <span className={`status-badge flex-shrink-0 ${
              document.exists
                ? 'status-badge-success'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${document.exists ? 'bg-green-500' : 'bg-gray-400'}`}></span>
              {document.exists ? t('steeringPage.badge.available') : t('steeringPage.badge.notCreated')}
            </span>
          </div>

          {/* Last Modified & Action */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {formatDate(document.lastModified, t)}
            </div>

            {/* Edit Button */}
            <button
              className="btn-gradient py-1.5 px-3 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                onOpenModal(document);
              }}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              {t('common.edit')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Content() {
  const { steeringDocuments, reloadAll } = useApi();
  const [selectedDocument, setSelectedDocument] = useState<SteeringDocument | null>(null);
  const { t } = useTranslation();

  useEffect(() => { reloadAll(); }, [reloadAll]);

  const documents: SteeringDocument[] = [
    {
      name: 'product',
      displayName: 'Product',
      exists: steeringDocuments?.documents?.product || false,
      lastModified: steeringDocuments?.lastModified
    },
    {
      name: 'tech',
      displayName: 'Technical',
      exists: steeringDocuments?.documents?.tech || false,
      lastModified: steeringDocuments?.lastModified
    },
    {
      name: 'structure',
      displayName: 'Structure',
      exists: steeringDocuments?.documents?.structure || false,
      lastModified: steeringDocuments?.lastModified
    }
  ];

  return (
    <div className="grid gap-6">
      {/* Page Header */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-4">
          <div className="gradient-icon w-12 h-12 flex-shrink-0">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              {t('steeringPage.header.title')}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {t('steeringPage.header.subtitle')}
            </p>
          </div>
        </div>
      </div>

      {/* Document Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {documents.map((doc) => (
          <SteeringDocumentCard
            key={doc.name}
            document={doc}
            onOpenModal={setSelectedDocument}
          />
        ))}
      </div>

      {/* Empty State */}
      {!documents.some(doc => doc.exists) && (
        <div className="glass-card text-center py-12">
          <div className="gradient-icon w-16 h-16 mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">{t('steeringPage.empty.title')}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
            {t('steeringPage.empty.description')}
          </p>
        </div>
      )}

      <SteeringModal
        document={selectedDocument}
        isOpen={!!selectedDocument}
        onClose={() => setSelectedDocument(null)}
      />
    </div>
  );
}

export function SteeringPage() {
  return <Content />;
}
