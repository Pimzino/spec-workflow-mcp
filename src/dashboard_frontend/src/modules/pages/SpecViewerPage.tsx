import React, { useEffect, useState } from 'react';
import { useApi } from '../api/api';
import { useSearchParams } from 'react-router-dom';
import { Markdown } from '../markdown/Markdown';
import hljs from 'highlight.js/lib/common';
import { useTranslation } from 'react-i18next';

type ViewMode = 'rendered' | 'source';

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

  const renderSourceView = (content: string) => {
    const highlighted = hljs.highlight(content, { language: 'markdown' }).value;
    return (
      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4 max-h-[80vh] overflow-auto">
        <pre className="text-sm leading-relaxed whitespace-pre-wrap break-words font-mono">
          <code 
            className="language-markdown hljs" 
            dangerouslySetInnerHTML={{ __html: highlighted }}
          />
        </pre>
      </div>
    );
  };

  return (
    <div className="grid gap-4">
      <div className="panel p-4 flex items-center justify-between">
        <div className="font-semibold">
          {t('specViewer.header.title')}: <span className="text-gray-600 dark:text-gray-400">{spec || t('common.unknown')}</span>
        </div>
        <div className="flex items-center gap-3">
          {/* Document Type Tabs */}
          <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            {(['requirements', 'design', 'tasks'] as const).map((d) => (
              <button 
                key={d} 
                className={`px-3 py-1 text-sm rounded-md transition-colors capitalize ${
                  activeDoc === d 
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
                onClick={() => setActiveDoc(d)}
              >
                {t(`specsPage.documents.${d}`)}
              </button>
            ))}
          </div>
          
          {/* View Mode Toggle */}
          {current && (
            <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button 
                className={`px-3 py-1 text-sm rounded-md transition-colors flex items-center gap-1 ${
                  viewMode === 'rendered' 
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
                onClick={() => setViewMode('rendered')}
                title={t('specViewer.tooltips.viewRendered')}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span className="text-xs">{t('common.viewMode.rendered')}</span>
              </button>
              <button 
                className={`px-3 py-1 text-sm rounded-md transition-colors flex items-center gap-1 ${
                  viewMode === 'source' 
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
                onClick={() => setViewMode('source')}
                title={t('specViewer.tooltips.viewSource')}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                <span className="text-xs font-mono">.md</span>
              </button>
            </div>
          )}
        </div>
      </div>
      
      <div className="panel p-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>{t('common.loadingContent')}</span>
          </div>
        ) : current ? (
          viewMode === 'rendered' ? (
            <Markdown content={current.content} />
          ) : (
            renderSourceView(current.content)
          )
        ) : (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-lg font-medium">{t('common.noContentAvailable')}</p>
            <p className="text-sm">{t('specViewer.empty.docNotCreated', { doc: t(`specsPage.documents.${activeDoc}`) })}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export function SpecViewerPage() {
  return <Content />;
}


