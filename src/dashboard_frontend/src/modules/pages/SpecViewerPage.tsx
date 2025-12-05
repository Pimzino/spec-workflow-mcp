import React, { useEffect, useState, useMemo } from 'react';
import { useApi } from '../api/api';
import { useSearchParams, Link } from 'react-router-dom';
import { MDXEditorWrapper } from '../mdx-editor';
import hljs from 'highlight.js/lib/common';
import { useTranslation } from 'react-i18next';

type ViewMode = 'rendered' | 'source';

// Document type icons
const DocumentIcons = {
  requirements: (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
  ),
  design: (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
    </svg>
  ),
  tasks: (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  ),
};

// Source view component with line numbers
function SourceViewWithLineNumbers({ content }: { content: string }) {
  const lines = useMemo(() => content.split('\n'), [content]);
  const highlighted = useMemo(
    () => hljs.highlight(content, { language: 'markdown' }).value,
    [content]
  );

  // Split highlighted content by newlines to align with line numbers
  const highlightedLines = useMemo(() => {
    // Create a temporary div to parse the highlighted HTML
    const temp = document.createElement('div');
    temp.innerHTML = highlighted;
    return highlighted.split('\n');
  }, [highlighted]);

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700/50 overflow-hidden bg-gray-50 dark:bg-gray-900/50">
      <div className="flex max-h-[80vh] overflow-auto">
        {/* Line numbers */}
        <div className="flex flex-col py-4 px-3 bg-gray-100/50 dark:bg-gray-800/30 border-r border-gray-200 dark:border-gray-700/50 select-none sticky left-0">
          {lines.map((_, i) => (
            <span key={i} className="text-xs text-gray-400 dark:text-gray-500 text-right min-w-[2rem] leading-relaxed font-mono">
              {i + 1}
            </span>
          ))}
        </div>
        {/* Code content */}
        <div className="flex-1 overflow-x-auto">
          <pre className="p-4">
            <code className="language-markdown hljs text-sm leading-relaxed whitespace-pre font-mono">
              {highlightedLines.map((line, i) => (
                <div
                  key={i}
                  dangerouslySetInnerHTML={{ __html: line || '\u00A0' }}
                  className="min-h-[1.5rem]"
                />
              ))}
            </code>
          </pre>
        </div>
      </div>
    </div>
  );
}

function Content() {
  const { getAllSpecDocuments } = useApi();
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const spec = params.get('name') || '';
  const initialDoc = (params.get('doc') as 'requirements' | 'design' | 'tasks') || 'requirements';
  const initialMode = (params.get('mode') as ViewMode) || 'rendered';
  const [activeDoc, setActiveDoc] = useState<'requirements' | 'design' | 'tasks'>(initialDoc);
  const [viewMode, setViewMode] = useState<ViewMode>(initialMode);
  const [documents, setDocuments] = useState<Record<string, { content: string; lastModified: string } | null>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!spec) return;
    let active = true;
    setLoading(true);
    getAllSpecDocuments(spec)
      .then((docs) => active && setDocuments(docs))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [spec, getAllSpecDocuments]);

  const current = documents?.[activeDoc];

  return (
    <div className="grid gap-4">
      {/* Header with glass card */}
      <div className="glass-card p-4 sm:p-6 relative overflow-hidden">
        {/* Gradient accent line */}
        <div className="absolute top-0 left-0 right-0 h-1 gradient-purple" />

        {/* Back button and Breadcrumb row */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <Link
            to="/specs"
            className="btn-glass px-3 py-1.5 text-sm flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="hidden sm:inline">{t('nav.specs')}</span>
          </Link>

          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Link
              to="/specs"
              className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
            >
              {t('nav.specs')}
            </Link>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
            <span className="gradient-text font-semibold truncate max-w-[200px]">{spec || t('common.unknown')}</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-gray-600 dark:text-gray-300">{t(`specsPage.documents.${activeDoc}`)}</span>
          </nav>
        </div>

        {/* Main header content */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Title section */}
          <div className="flex items-center gap-4">
            <div className="gradient-icon w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white truncate">
                {spec || t('common.unknown')}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('specViewer.header.title')}
              </p>
            </div>
          </div>

          {/* Controls section */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            {/* Document type pills */}
            <div className="flex gap-1 p-1 bg-gray-100 dark:bg-black/30 rounded-full">
              {(['requirements', 'design', 'tasks'] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => setActiveDoc(d)}
                  className={`btn-pill ${activeDoc === d ? 'active' : ''}`}
                  title={t(`specsPage.documents.${d}`)}
                >
                  {DocumentIcons[d]}
                  <span className="hidden sm:inline">{t(`specsPage.documents.${d}`)}</span>
                </button>
              ))}
            </div>

            {/* View mode toggle */}
            {current && (
              <div className="flex gap-1 p-1 bg-gray-100 dark:bg-black/30 rounded-full">
                <button
                  onClick={() => setViewMode('rendered')}
                  className={`btn-pill ${viewMode === 'rendered' ? 'active' : ''}`}
                  title={t('specViewer.tooltips.viewRendered')}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span className="hidden sm:inline text-xs">{t('common.viewMode.rendered')}</span>
                </button>
                <button
                  onClick={() => setViewMode('source')}
                  className={`btn-pill ${viewMode === 'source' ? 'active' : ''}`}
                  title={t('specViewer.tooltips.viewSource')}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                  <span className="hidden sm:inline text-xs font-mono">{t('common.viewMode.source')}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content area */}
      <div className="glass-card p-4 sm:p-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="spinner-gradient spinner-gradient-lg mb-4" />
            <span className="text-gray-400 text-sm">{t('common.loadingContent')}</span>
          </div>
        ) : current ? (
          viewMode === 'rendered' ? (
            <MDXEditorWrapper content={current.content} mode="view" enableMermaid={true} />
          ) : (
            <SourceViewWithLineNumbers content={current.content} />
          )
        ) : (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="gradient-icon w-16 h-16 mb-4">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              {t('common.noContentAvailable')}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-sm">
              {t('specViewer.empty.docNotCreated', { doc: t(`specsPage.documents.${activeDoc}`) })}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export function SpecViewerPage() {
  return <Content />;
}
