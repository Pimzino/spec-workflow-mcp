import React, { useEffect, useRef, useState, useCallback } from 'react';
import mermaid from 'mermaid';
import { useMDXEditorTheme } from '../hooks/useMDXEditorTheme';
import type { CodeBlockEditorDescriptor } from '@mdxeditor/editor';

interface MermaidRendererProps {
  code: string;
}

export function MermaidRenderer({ code }: MermaidRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<string>('');
  const { mermaidTheme, mermaidThemeVariables } = useMDXEditorTheme();

  useEffect(() => {
    if (!code) return;

    const renderDiagram = async () => {
      try {
        mermaid.initialize({
          startOnLoad: false,
          theme: mermaidTheme,
          themeVariables: mermaidThemeVariables,
          securityLevel: 'loose',
        });

        const uniqueId = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
        const { svg: renderedSvg } = await mermaid.render(uniqueId, code);
        setSvg(renderedSvg);
        setError('');
      } catch (err) {
        console.debug('Mermaid rendering error:', err);
        setError(err instanceof Error ? err.message : 'Failed to render diagram');
        setSvg('');
      }
    };

    renderDiagram();
  }, [code, mermaidTheme, mermaidThemeVariables]);

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 my-4">
        <p className="text-red-700 dark:text-red-300 text-sm font-medium mb-2">Mermaid Diagram Error</p>
        <pre className="text-red-600 dark:text-red-400 text-xs overflow-auto whitespace-pre-wrap">{error}</pre>
        <details className="mt-2">
          <summary className="text-red-600 dark:text-red-400 text-xs cursor-pointer">Show source</summary>
          <pre className="text-gray-600 dark:text-gray-400 text-xs mt-2 overflow-auto whitespace-pre-wrap">{code}</pre>
        </details>
      </div>
    );
  }

  if (!svg) {
    return (
      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 my-4 animate-pulse">
        <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
          <span className="text-gray-500 dark:text-gray-400 text-sm">Loading diagram...</span>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="mermaid-container my-4 overflow-auto bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

export function isMermaidCode(language: string | undefined): boolean {
  return language?.toLowerCase() === 'mermaid';
}

interface MermaidCodeBlockEditorProps {
  code: string;
  language: string;
  meta: string;
  nodeKey: string;
  onChange: (code: string) => void;
}

function MermaidCodeBlockEditor({ code, onChange }: MermaidCodeBlockEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [localCode, setLocalCode] = useState(code);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setLocalCode(code);
  }, [code]);

  const handleSave = useCallback(() => {
    onChange(localCode);
    setIsEditing(false);
  }, [localCode, onChange]);

  const handleCancel = useCallback(() => {
    setLocalCode(code);
    setIsEditing(false);
  }, [code]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleCancel();
    } else if (e.key === 'Enter' && e.ctrlKey) {
      handleSave();
    }
  }, [handleCancel, handleSave]);

  if (isEditing) {
    return (
      <div className="border border-blue-300 dark:border-blue-600 rounded-lg overflow-hidden my-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 px-3 py-2 flex items-center justify-between border-b border-blue-200 dark:border-blue-700">
          <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Editing Mermaid Diagram</span>
          <div className="flex gap-2">
            <button
              onClick={handleCancel}
              className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Save (Ctrl+Enter)
            </button>
          </div>
        </div>
        <textarea
          ref={textareaRef}
          value={localCode}
          onChange={(e) => setLocalCode(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full h-64 p-3 font-mono text-sm bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 focus:outline-none resize-y"
          autoFocus
        />
      </div>
    );
  }

  return (
    <div className="relative group my-4">
      <button
        onClick={() => setIsEditing(true)}
        className="absolute top-2 right-2 z-10 px-2 py-1 text-xs bg-gray-800/70 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
      >
        Edit
      </button>
      <MermaidRenderer code={code} />
    </div>
  );
}

export const mermaidCodeBlockDescriptor: CodeBlockEditorDescriptor = {
  match: (language, _meta) => language === 'mermaid',
  priority: 1,
  Editor: MermaidCodeBlockEditor as any,
};
