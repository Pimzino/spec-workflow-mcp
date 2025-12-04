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

  // Icon and gradient based on variant
  const getIconConfig = () => {
    switch (variant) {
      case 'warning':
        return {
          gradient: 'from-amber-500 to-orange-500',
          glowColor: 'shadow-amber-500/25',
          icon: (
            <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          )
        };
      case 'error':
        return {
          gradient: 'from-red-500 to-rose-500',
          glowColor: 'shadow-red-500/25',
          icon: (
            <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )
        };
      case 'success':
        return {
          gradient: 'from-emerald-500 to-green-500',
          glowColor: 'shadow-emerald-500/25',
          icon: (
            <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          )
        };
      default: // info
        return {
          gradient: 'from-blue-500 to-indigo-500',
          glowColor: 'shadow-blue-500/25',
          icon: (
            <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )
        };
    }
  };

  const iconConfig = getIconConfig();

  const getButtonStyles = () => {
    switch (variant) {
      case 'error':
        return 'bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 shadow-lg shadow-red-500/25 hover:shadow-red-500/40';
      case 'warning':
        return 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40';
      case 'success':
        return 'bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40';
      default:
        return 'bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40';
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div className="glass-card rounded-2xl shadow-2xl w-full max-w-md border border-white/10 animate-in fade-in zoom-in-95 duration-200">
        {/* Content */}
        <div className="p-6">
          <div className="flex flex-col items-center text-center sm:flex-row sm:items-start sm:text-left gap-4">
            {/* Icon with gradient background */}
            <div className={`flex-shrink-0 flex items-center justify-center h-14 w-14 rounded-xl bg-gradient-to-br ${iconConfig.gradient} shadow-lg ${iconConfig.glowColor}`}>
              {iconConfig.icon}
            </div>

            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white">
                {title}
              </h3>
              <div className="mt-2">
                <p className="text-sm text-gray-400 whitespace-pre-wrap leading-relaxed">
                  {message}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/5">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className={`px-5 py-2.5 text-sm font-medium text-white rounded-xl ${getButtonStyles()} transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/20`}
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
