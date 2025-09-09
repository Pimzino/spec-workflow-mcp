import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

interface MarkdownEditorProps {
  content: string;
  editContent: string;
  onChange: (content: string) => void;
  onSave: () => void;
  saving: boolean;
  saved: boolean;
  error?: string;
}

export function MarkdownEditor({ 
  content, 
  editContent,
  onChange, 
  onSave, 
  saving, 
  saved, 
  error
}: MarkdownEditorProps) {
  const { t } = useTranslation();
  const [localContent, setLocalContent] = useState(editContent);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Initialize local content when editContent prop changes
  useEffect(() => {
    setLocalContent(editContent);
  }, [editContent]);
  
  // Update unsaved changes status when either content changes
  useEffect(() => {
    setHasUnsavedChanges(localContent !== content);
  }, [localContent, content]);
  

  const handleContentChange = useCallback((newContent: string) => {
    setLocalContent(newContent);
    onChange(newContent);
  }, [onChange]);


  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // Ctrl+S to save
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault();
      onSave();
    }

    // Tab key for indentation
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newContent = localContent.substring(0, start) + '  ' + localContent.substring(end);
      
      handleContentChange(newContent);
      
      // Restore cursor position
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      }, 0);
    }
  }, [localContent, handleContentChange, onSave]);

  const getStatusIndicator = () => {
    if (saving) {
      return (
        <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-sm">{t('editor.markdown.saving')}</span>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <span className="text-sm">{t('editor.markdown.error')}: {error}</span>
        </div>
      );
    }

    if (saved && !hasUnsavedChanges) {
      return (
        <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-sm">{t('editor.markdown.saved')}</span>
        </div>
      );
    }

    if (hasUnsavedChanges) {
      return (
        <div className="flex items-center gap-1 text-orange-600 dark:text-orange-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm">{t('editor.markdown.unsavedChanges')}</span>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Editor Header */}
      <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-600">
        <div className="flex items-center gap-4">
          {getStatusIndicator()}
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {t('editor.markdown.hints')}
          </div>
        </div>
        <button
          onClick={onSave}
          disabled={saving || !hasUnsavedChanges}
          className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
            hasUnsavedChanges && !saving
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {saving ? t('editor.markdown.saving') : t('editor.markdown.save')}
        </button>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-hidden">
        <textarea
          ref={textareaRef}
          value={localContent}
          onChange={(e) => handleContentChange(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full h-full p-4 font-mono text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border-none resize-none focus:outline-none focus:ring-0"
          placeholder={t('editor.markdown.placeholder')}
          spellCheck={false}
          style={{
            minHeight: '100%',
            lineHeight: '1.5',
            tabSize: 2
          }}
        />
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-600 text-xs text-gray-500 dark:text-gray-400">
        <div>
          {t('editor.markdown.lines')}: {localContent.split('\n').length} | {t('editor.markdown.characters')}: {localContent.length}
        </div>
        <div>
          {t('editor.markdown.title')}
        </div>
      </div>
    </div>
  );
}
