import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface TextInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (text: string) => void;
  title: string;
  placeholder?: string;
  submitText?: string;
  cancelText?: string;
  required?: boolean;
  multiline?: boolean;
}

export function TextInputModal({
  isOpen,
  onClose,
  onSubmit,
  title,
  placeholder = 'Enter text...',
  submitText = 'Submit',
  cancelText = 'Cancel',
  required = true,
  multiline = false
}: TextInputModalProps) {
  const { t } = useTranslation();
  const [value, setValue] = useState('');

  // Reset value when modal opens
  useEffect(() => {
    if (isOpen) {
      setValue('');
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedValue = value.trim();
    if (!required || trimmedValue) {
      onSubmit(trimmedValue);
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
    if (e.key === 'Enter' && !multiline && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--surface-elevated)] border border-[var(--border-default)] rounded-lg shadow-[var(--shadow-overlay)] w-full max-w-md">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-[var(--border-default)]">
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">
              {title}
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors"
              aria-label={t('common.closeModalAria')}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {multiline ? (
              <textarea
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                className="w-full px-3 py-2 border border-[var(--border-default)] rounded-md bg-[var(--surface-panel)] text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-[var(--accent-primary)] resize-vertical min-h-[100px]"
                rows={4}
                autoFocus
              />
            ) : (
              <input
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                className="w-full px-3 py-2 border border-[var(--border-default)] rounded-md bg-[var(--surface-panel)] text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-[var(--accent-primary)]"
                autoFocus
              />
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-[var(--border-default)]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-[var(--text-secondary)] bg-[var(--surface-panel)] border border-[var(--border-default)] rounded-md hover:bg-[var(--surface-hover)] focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-[var(--accent-primary)] transition-colors"
            >
              {cancelText}
            </button>
            <button
              type="submit"
              disabled={required && !value.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-[var(--accent-primary)] border border-transparent rounded-md hover:bg-[var(--accent-primary-hover)] focus:ring-2 focus:ring-[var(--accent-primary)] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {submitText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
