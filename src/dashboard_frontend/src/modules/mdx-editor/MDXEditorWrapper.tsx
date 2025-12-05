import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  MDXEditor,
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  linkPlugin,
  tablePlugin,
  codeBlockPlugin,
  codeMirrorPlugin,
  markdownShortcutPlugin,
  toolbarPlugin,
  diffSourcePlugin,
  BoldItalicUnderlineToggles,
  BlockTypeSelect,
  CreateLink,
  InsertTable,
  ListsToggle,
  UndoRedo,
  CodeToggle,
  Separator,
  useCellValue,
  usePublisher,
  viewMode$,
  type MDXEditorMethods,
  type CodeBlockEditorDescriptor,
} from '@mdxeditor/editor';
import '@mdxeditor/editor/style.css';
import { useTranslation } from 'react-i18next';
import { useMDXEditorTheme } from './hooks/useMDXEditorTheme';
import { MermaidRenderer, isMermaidCode, mermaidCodeBlockDescriptor } from './plugins';
import type { MDXEditorWrapperProps, EditorMode } from './types';
import './MDXEditorWrapper.css';

// Custom code block renderer that handles mermaid
function CustomCodeBlockRenderer({ code, language }: { code: string; language?: string }) {
  if (isMermaidCode(language)) {
    return <MermaidRenderer code={code} />;
  }

  return (
    <pre className="hljs bg-gray-50 dark:bg-gray-900 rounded-lg p-4 overflow-auto">
      <code className={language ? `language-${language}` : ''}>
        {code}
      </code>
    </pre>
  );
}
// Plain text fallback code editor for unknown languages
function PlainTextCodeEditor({ code, language, onChange }: { code: string; language: string; onChange: (code: string) => void }) {
  return (
    <div className="my-4 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      <div className="bg-gray-100 dark:bg-gray-800 px-3 py-1 text-xs text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
        {language || 'text'}
      </div>
      <textarea
        value={code}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-3 font-mono text-sm bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 focus:outline-none resize-y min-h-[100px]"
        spellCheck={false}
      />
    </div>
  );
}

// Fallback descriptor for unknown code block languages (catches all)
const plainTextCodeBlockDescriptor: CodeBlockEditorDescriptor = {
  match: () => true,
  priority: -10, // Low priority - only used as fallback
  Editor: PlainTextCodeEditor as any,
};

// Custom source toggle that only shows Rich text and Source (no Diff)
function SourceToggle() {
  const viewMode = useCellValue(viewMode$);
  const changeViewMode = usePublisher(viewMode$);

  return (
    <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded p-0.5">
      <button
        onClick={() => changeViewMode('rich-text')}
        className={`px-2 py-1 text-xs rounded transition-colors ${
          viewMode === 'rich-text'
            ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
        }`}
        title="Rich text"
      >
        Rich
      </button>
      <button
        onClick={() => changeViewMode('source')}
        className={`px-2 py-1 text-xs rounded transition-colors ${
          viewMode === 'source'
            ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
        }`}
        title="Source"
      >
        Source
      </button>
    </div>
  );
}




// Status indicator component
function StatusIndicator({ saving, saved, error, hasUnsavedChanges }: {
  saving: boolean;
  saved: boolean;
  error?: string;
  hasUnsavedChanges: boolean;
}) {
  const { t } = useTranslation();

  if (saving) {
    return (
      <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
        <div className="spinner-gradient spinner-gradient-sm" />
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
}

export function MDXEditorWrapper({
  content,
  mode,
  onChange,
  onSave,
  saving = false,
  saved = false,
  error,
  placeholder,
  className = '',
  enableMermaid = true,
  height = 'full',
}: MDXEditorWrapperProps) {
  const { t } = useTranslation();
  const { isDarkMode } = useMDXEditorTheme();
  const editorRef = useRef<MDXEditorMethods>(null);
  const [localContent, setLocalContent] = useState(content);
  const [lastSavedContent, setLastSavedContent] = useState(content);
  const isInternalChangeRef = useRef(false);
  const hasUnsavedChanges = localContent !== lastSavedContent;

  // Sync local content with prop when content changes from external source
  useEffect(() => {
    // Only update lastSavedContent if this is an external change (not from user editing)
    if (!isInternalChangeRef.current) {
      setLocalContent(content);
      setLastSavedContent(content);
      // Programmatically update MDX Editor content when prop changes
      if (editorRef.current) {
        editorRef.current.setMarkdown(content);
      }
    }
    // Reset the flag after processing
    isInternalChangeRef.current = false;
  }, [content]);

  // Update last saved content when save is successful
  useEffect(() => {
    if (saved && !saving) {
      setLastSavedContent(localContent);
    }
  }, [saved, saving, localContent]);

  // Handle content change
  const handleChange = useCallback((newContent: string) => {
    // Mark this as an internal change so the effect doesn't reset lastSavedContent
    isInternalChangeRef.current = true;
    setLocalContent(newContent);
    onChange?.(newContent);
  }, [onChange]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 's' && mode === 'edit') {
        e.preventDefault();
        onSave?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mode, onSave]);

  // Editor plugins configuration
  const plugins = useMemo(() => {
    const basePlugins = [
      headingsPlugin(),
      listsPlugin(),
      quotePlugin(),
      linkPlugin(),
      tablePlugin(),
      codeBlockPlugin({
        codeBlockEditorDescriptors: [
          mermaidCodeBlockDescriptor,      // Mermaid diagrams (priority 1)
          plainTextCodeBlockDescriptor,    // Fallback for all other languages (priority -10)
        ],
        defaultCodeBlockLanguage: 'text',
      }),
      codeMirrorPlugin({
        codeBlockLanguages: {
          js: 'JavaScript',
          ts: 'TypeScript',
          jsx: 'JSX',
          tsx: 'TSX',
          css: 'CSS',
          html: 'HTML',
          json: 'JSON',
          markdown: 'Markdown',
          md: 'Markdown',
          python: 'Python',
          py: 'Python',
          bash: 'Bash',
          sh: 'Shell',
          sql: 'SQL',
          yaml: 'YAML',
          xml: 'XML',
          text: 'Plain Text',
          '': 'Plain Text',
        },
      }),
      markdownShortcutPlugin(),
    ];

    // Add toolbar only in edit mode
    if (mode === 'edit') {
      basePlugins.push(diffSourcePlugin({ viewMode: 'rich-text' }));
      basePlugins.unshift(
        toolbarPlugin({
          toolbarContents: () => (
            <>
              <UndoRedo />
              <Separator />
              <BoldItalicUnderlineToggles />
              <CodeToggle />
              <Separator />
              <BlockTypeSelect />
              <Separator />
              <ListsToggle />
              <Separator />
              <CreateLink />
              <InsertTable />
              <Separator />
              <SourceToggle />
            </>
          ),
        })
      );
    }

    return basePlugins;
  }, [mode]);

  // Height style
  const heightStyle = useMemo(() => {
    if (height === 'full') return { height: '100%' };
    if (height === 'auto') return { height: 'auto' };
    return { height };
  }, [height]);

  // Render source view mode
  if (mode === 'source') {
    return (
      <div className={`mdx-editor-wrapper source-mode ${isDarkMode ? 'dark-theme' : ''} ${className}`} style={heightStyle}>
        <div className="source-content">
          <pre className="source-pre"><code>
            {content}</code>
          </pre>
        </div>
      </div>
    );
  }

  // Render view mode (read-only)
  if (mode === 'view') {
    return (
      <div className={`mdx-editor-wrapper view-mode ${isDarkMode ? 'dark-theme' : ''} ${className}`} style={heightStyle}>
        <MDXEditor
          ref={editorRef}
          markdown={content}
          plugins={plugins}
          readOnly={true}
          contentEditableClassName="prose prose-sm sm:prose-base max-w-none dark:prose-invert prose-img:max-w-full prose-img:h-auto prose-headings:text-gray-900 dark:prose-headings:text-white prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-strong:text-gray-900 dark:prose-strong:text-white prose-code:text-gray-800 dark:prose-code:text-gray-200 prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-pre:bg-gray-50 dark:prose-pre:bg-gray-900 prose-blockquote:text-gray-700 dark:prose-blockquote:text-gray-300 prose-li:text-gray-700 dark:prose-li:text-gray-300"
        />
      </div>
    );
  }

  // Render edit mode
  return (
    <div className={`mdx-editor-wrapper edit-mode flex flex-col ${isDarkMode ? 'dark-theme' : ''} ${className}`} style={heightStyle}>
      {/* Editor Header */}
      <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-600">
        <div className="flex items-center gap-4">
          <StatusIndicator
            saving={saving}
            saved={saved}
            error={error}
            hasUnsavedChanges={hasUnsavedChanges}
          />
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
              : 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400'
          }`}
        >
          {saving ? t('editor.markdown.saving') : t('editor.markdown.save')}
        </button>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-hidden">
        <MDXEditor
          ref={editorRef}
          markdown={localContent}
          onChange={handleChange}
          plugins={plugins}
          placeholder={placeholder || t('editor.markdown.placeholder')}
          contentEditableClassName="prose prose-sm max-w-none dark:prose-invert p-4 min-h-full focus:outline-none"
          overlayContainer={document.body}
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
