import React from 'react';
import { useTranslation } from 'react-i18next';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'danger';
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default'
}: ConfirmationModalProps) {
  const { t } = useTranslation();

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      handleConfirm();
    }
  };

  if (!isOpen) return null;

  const isDanger = variant === 'danger';

  const confirmButtonClasses = isDanger
    ? 'px-5 py-2.5 text-sm font-medium text-white rounded-xl bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 shadow-lg shadow-red-500/25 hover:shadow-red-500/40 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/20'
    : 'px-5 py-2.5 text-sm font-medium text-white rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/20';

  const iconConfig = isDanger
    ? {
        gradient: 'from-red-500 to-rose-500',
        glowColor: 'shadow-red-500/25',
        icon: (
          <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        )
      }
    : {
        gradient: 'from-purple-500 to-indigo-500',
        glowColor: 'shadow-purple-500/25',
        icon: (
          <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div className="glass-card rounded-2xl shadow-2xl w-full max-w-md border border-white/10 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <div className="flex items-center gap-4">
            {/* Icon with gradient background */}
            <div className={`flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-br ${iconConfig.gradient} shadow-lg ${iconConfig.glowColor}`}>
              {iconConfig.icon}
            </div>
            <h3 className="text-lg font-semibold text-white">
              {title}
            </h3>
          </div>
          <button
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
          <p className="text-gray-400 leading-relaxed">
            {message}
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/5">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-medium text-gray-300 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-white/20 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/10"
            autoFocus
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            className={confirmButtonClasses}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
