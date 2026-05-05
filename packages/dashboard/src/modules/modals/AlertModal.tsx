import React from 'react';
import { useTranslation } from 'react-i18next';

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  okText?: string;
  variant?: 'info' | 'warning' | 'error' | 'success';
}

export function AlertModal({
  isOpen,
  onClose,
  title,
  message,
  okText,
  variant = 'info'
}: AlertModalProps) {
  const { t } = useTranslation();
  const finalOkText = okText || t('common.ok');
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' || e.key === 'Enter') {
      onClose();
    }
  };

  if (!isOpen) return null;

  // Icon based on variant
  const getIcon = () => {
    switch (variant) {
      case 'warning':
        return (
          <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 dark:bg-yellow-900/20">
            <svg className="h-6 w-6 text-yellow-600 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
        );
      case 'error':
        return (
          <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/20">
            <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
        );
      case 'success':
        return (
          <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/20">
            <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        );
      default: // info
        return (
          <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/20">
            <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
        );
    }
  };

  const buttonColor = variant === 'error'
    ? 'bg-[var(--status-error)] hover:opacity-90 focus:ring-[var(--status-error)]'
    : variant === 'warning'
    ? 'bg-[var(--status-warning)] hover:opacity-90 focus:ring-[var(--status-warning)]'
    : variant === 'success'
    ? 'bg-[var(--status-success)] hover:opacity-90 focus:ring-[var(--status-success)]'
    : 'bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] focus:ring-[var(--accent-primary)]';

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div className="bg-[var(--surface-elevated)] border border-[var(--border-default)] rounded-lg shadow-[var(--shadow-overlay)] w-full max-w-md">
        {/* Content */}
        <div className="p-6">
          <div className="sm:flex sm:items-start">
            {getIcon()}
            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                {title}
              </h3>
              <div className="mt-2">
                <p className="text-sm text-[var(--text-secondary)] whitespace-pre-wrap">
                  {message}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[var(--surface-panel)] px-6 py-3 rounded-b-lg border-t border-[var(--border-default)]">
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className={`px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md ${buttonColor} focus:ring-2 focus:ring-offset-2 transition-colors`}
              autoFocus
            >
              {finalOkText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}