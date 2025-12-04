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

  const inputBaseClasses = "w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-200";

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-card rounded-2xl shadow-2xl w-full max-w-md border border-white/10 animate-in fade-in zoom-in-95 duration-200">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/5">
            <div className="flex items-center gap-4">
              {/* Icon with gradient background */}
              <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 shadow-lg shadow-purple-500/25">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white">
                {title}
              </h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/10"
              aria-label={t('common.closeModalAria')}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                className={`${inputBaseClasses} resize-vertical min-h-[120px]`}
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
                className={inputBaseClasses}
                autoFocus
              />
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/5">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-gray-300 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-white/20 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/10"
            >
              {cancelText}
            </button>
            <button
              type="submit"
              disabled={required && !value.trim()}
              className="px-5 py-2.5 text-sm font-medium text-white rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-purple-500 disabled:hover:to-indigo-500 disabled:hover:shadow-purple-500/25"
            >
              {submitText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
