import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasI18nError: boolean;
  error?: Error;
}

/**
 * Error boundary to handle i18n initialization failures gracefully.
 * Falls back to English text when translation system fails.
 */
export class I18nErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasI18nError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Check if this is an i18n-related error
    const isI18nError = error.message.includes('i18n') || 
                        error.message.includes('translation') ||
                        error.message.includes('react-i18next');
    
    return { 
      hasI18nError: isI18nError, 
      error: isI18nError ? error : undefined 
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log i18n errors for debugging
    if (this.state.hasI18nError) {
      console.error('I18n Error Boundary caught an error:', error, errorInfo);
    }
  }

  render() {
    if (this.state.hasI18nError) {
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 flex items-center justify-center">
          <div className="text-center p-8">
            <div className="text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold mb-4">Translation System Error</h1>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              The translation system failed to initialize. The application is running with fallback text.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Reload Application
            </button>
            {process.env.NODE_ENV === 'development' && (
              <details className="mt-4 text-left">
                <summary className="cursor-pointer text-sm text-gray-500">
                  Error Details (Development)
                </summary>
                <pre className="mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs overflow-auto">
                  {this.state.error?.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}