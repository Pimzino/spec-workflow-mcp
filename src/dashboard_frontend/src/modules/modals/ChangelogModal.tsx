import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { XMarkIcon } from '@heroicons/react/24/solid';
import { Markdown } from '../markdown/Markdown';

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
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t('changelog.modal.title', 'Changelog')}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {t('changelog.modal.version', 'Version')} v{version}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label={t('common.close', 'Close')}
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-gray-500 dark:text-gray-400">
                {t('changelog.modal.loading', 'Loading changelog...')}
              </div>
            </div>
          ) : error ? (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-red-700 dark:text-red-300 text-sm">
                {error}
              </p>
            </div>
          ) : content ? (
            <div className="prose dark:prose-invert max-w-none">
              <Markdown content={content} />
            </div>
          ) : (
            <div className="text-gray-500 dark:text-gray-400 text-center">
              {t('changelog.modal.notFound', 'Changelog not found for this version')}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-6 bg-gray-50 dark:bg-gray-700/50 rounded-b-lg flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 border border-transparent rounded-md focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            autoFocus
          >
            {t('common.close', 'Close')}
          </button>
        </div>
      </div>
    </div>
  );
}
