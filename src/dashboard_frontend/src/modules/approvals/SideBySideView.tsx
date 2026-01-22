import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { TextAnnotate, AnnotateTag } from 'react-text-annotate-blend';
import { MDXEditorWrapper } from '../mdx-editor';
import { useScrollSync } from './hooks/useScrollSync';

// Type for the TextAnnotate library's annotation format
interface AnnotationSpan extends AnnotateTag {
  start: number;
  end: number;
  text?: string;
  color?: string;
  tag?: string;
  commentId?: string;
}

export interface SideBySideViewProps {
  content: string;
  annotationSpans: AnnotationSpan[];
  onAnnotationChange: (spans: AnnotationSpan[]) => void;
  onAnnotationClick: (span: AnnotationSpan) => void;
}

/**
 * Side-by-side view component that displays source markdown (with annotation capability)
 * on the left and rendered preview on the right.
 */
export function SideBySideView({
  content,
  annotationSpans,
  onAnnotationChange,
  onAnnotationClick,
}: SideBySideViewProps) {
  const { t } = useTranslation();
  const [syncEnabled, setSyncEnabled] = useState(true);

  const { leftRef, rightRef, handleLeftScroll, handleRightScroll } = useScrollSync({
    enabled: syncEnabled,
    throttleMs: 16,
  });

  // Handle clicks on annotated marks
  const handleMarkClick = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const target = e.target as HTMLElement;
    const mark = target.closest('mark');
    if (mark) {
      // Find which span was clicked by checking the mark's background color
      const markStyle = mark.getAttribute('style') || '';
      const bgColorMatch = markStyle.match(/background(?:-color)?:\s*([^;]+)/i);
      const bgColor = bgColorMatch ? bgColorMatch[1].trim() : '';

      // Find the span with matching color
      const clickedSpan = annotationSpans.find(s => {
        const spanColor = s.color || '';
        return spanColor === bgColor ||
               spanColor.replace(/\s/g, '') === bgColor.replace(/\s/g, '');
      });

      if (clickedSpan) {
        onAnnotationClick(clickedSpan);
      } else {
        // Fallback: find by text content (excluding the tag)
        const markText = mark.textContent || '';
        const foundSpan = annotationSpans.find(s => {
          const expectedText = content.slice(s.start, s.end);
          return markText.includes(expectedText) || expectedText === markText;
        });
        if (foundSpan) {
          onAnnotationClick(foundSpan);
        }
      }
    }
  }, [annotationSpans, content, onAnnotationClick]);

  // Custom span renderer
  const getSpan = useCallback((span: AnnotationSpan): AnnotationSpan => {
    return { ...span };
  }, []);

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
            {t('approvals.annotator.sideBySide.title')}
          </span>
        </div>

        {/* Scroll Sync Toggle */}
        <button
          onClick={() => setSyncEnabled(!syncEnabled)}
          className={`flex items-center gap-1.5 px-2 py-1 text-xs rounded-md transition-colors ${
            syncEnabled
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
              : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
          }`}
          title={syncEnabled
            ? t('approvals.annotator.sideBySide.syncEnabled')
            : t('approvals.annotator.sideBySide.syncDisabled')
          }
        >
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {syncEnabled ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m5.656-9.243l-1.1 1.1m0 0a4 4 0 015.656 5.656l-4 4M7 7l10 10"
              />
            )}
          </svg>
          <span className="hidden sm:inline">
            {syncEnabled
              ? t('approvals.annotator.sideBySide.syncOn')
              : t('approvals.annotator.sideBySide.syncOff')
            }
          </span>
        </button>
      </div>

      {/* Instruction note */}
      <div className="p-2 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800">
        <p className="text-xs text-blue-700 dark:text-blue-300 m-0 flex items-start gap-2">
          <svg className="w-3 h-3 sm:w-4 sm:h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="leading-relaxed">
            {t('approvals.annotator.sideBySide.instructions')}
          </span>
        </p>
      </div>

      {/* Split Panels - Stack on mobile, side-by-side on md+ */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-200 dark:divide-gray-700 min-h-0">
        {/* Left Panel: Source (Annotatable) */}
        <div className="flex flex-col min-h-0 overflow-hidden">
          <div className="px-2 py-1 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400 flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              {t('approvals.annotator.sideBySide.sourceLabel')}
            </span>
          </div>
          <div
            ref={leftRef}
            onScroll={handleLeftScroll}
            onClick={handleMarkClick}
            className="flex-1 overflow-auto p-3 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100"
          >
            <TextAnnotate
              content={content || ''}
              value={annotationSpans}
              onChange={onAnnotationChange}
              getSpan={getSpan}
              style={{
                fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
                fontSize: '0.875rem',
                lineHeight: '1.625',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                color: 'inherit'
              }}
              markStyle={{
                padding: '1px 2px',
                borderRadius: '2px',
                cursor: 'pointer'
              }}
            />
          </div>
        </div>

        {/* Right Panel: Preview */}
        <div className="flex flex-col min-h-0 overflow-hidden">
          <div className="px-2 py-1 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400 flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              {t('approvals.annotator.sideBySide.previewLabel')}
            </span>
          </div>
          <div
            ref={rightRef}
            onScroll={handleRightScroll}
            className="flex-1 overflow-auto p-3 bg-white dark:bg-gray-800"
          >
            <div className="prose prose-sm max-w-none dark:prose-invert prose-img:max-w-full prose-img:h-auto prose-headings:text-gray-900 dark:prose-headings:text-white prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-strong:text-gray-900 dark:prose-strong:text-white prose-code:text-gray-800 dark:prose-code:text-gray-200 prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-pre:bg-gray-50 dark:prose-pre:bg-gray-900 prose-blockquote:text-gray-700 dark:prose-blockquote:text-gray-300 prose-li:text-gray-700 dark:prose-li:text-gray-300">
              <MDXEditorWrapper content={content || ""} mode="view" enableMermaid={true} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
