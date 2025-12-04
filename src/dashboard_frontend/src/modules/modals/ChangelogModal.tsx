import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { XMarkIcon } from '@heroicons/react/24/solid';
import { MDXEditorWrapper } from '../mdx-editor';

interface ChangelogModalProps {
  isOpen: boolean;
  onClose: () => void;
  version: string;
  projectId?: string;
}

export function ChangelogModal({
  isOpen,
  onClose,
  version,
  projectId
}: ChangelogModalProps) {
  const { t } = useTranslation();
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (!isOpen) return;

    const fetchChangelog = async () => {
      setLoading(true);
      setError('');
      setContent('');

      try {
        const endpoint = projectId
          ? `/api/projects/${projectId}/changelog/${version}`
          : `/api/changelog/${version}`;

        const response = await fetch(endpoint);

        if (!response.ok) {
          throw new Error(`Failed to fetch changelog: ${response.statusText}`);
        }

        const data = await response.json() as { content: string };
        setContent(data.content);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load changelog');
      } finally {
        setLoading(false);
      }
    };

    fetchChangelog();
  }, [isOpen, version, projectId]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div className="glass-card rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-white/10 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <div className="flex items-center gap-4">
            {/* Icon with gradient background */}
            <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/25">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">
                {t('changelog.modal.title', 'Changelog')}
              </h3>
              <p className="text-sm text-gray-400 mt-0.5">
                {t('changelog.modal.version', 'Version')} <span className="text-emerald-400 font-medium">v{version}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/10"
            aria-label={t('common.close', 'Close')}
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[200px] gap-3">
              <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
              <div className="text-gray-400 text-sm">
                {t('changelog.modal.loading', 'Loading changelog...')}
              </div>
            </div>
          ) : error ? (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-lg bg-red-500/20">
                  <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-red-300 text-sm">
                  {error}
                </p>
              </div>
            </div>
          ) : content ? (
            <div className="prose prose-invert prose-purple max-w-none prose-headings:text-white prose-p:text-gray-300 prose-a:text-purple-400 prose-strong:text-white prose-code:text-purple-300 prose-code:bg-white/5 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-pre:bg-white/5 prose-pre:border prose-pre:border-white/10">
              <MDXEditorWrapper content={content} mode="view" enableMermaid={true} />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full min-h-[200px] gap-3">
              <div className="flex items-center justify-center h-16 w-16 rounded-xl bg-white/5">
                <svg className="h-8 w-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-gray-500 text-sm">
                {t('changelog.modal.notFound', 'Changelog not found for this version')}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-white/5 px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-medium text-white rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/20"
            autoFocus
          >
            {t('common.close', 'Close')}
          </button>
        </div>
      </div>
    </div>
  );
}
