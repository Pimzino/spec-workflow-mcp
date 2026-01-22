import React, { useMemo, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { TextAnnotate, AnnotateTag } from 'react-text-annotate-blend';
import { hexToColorObject, isValidHex } from './colors';
import { MDXEditorWrapper } from '../mdx-editor';
import { TextInputModal } from '../modals/TextInputModal';
import { ConfirmationModal } from '../modals/ConfirmationModal';
import { SideBySideView } from './SideBySideView';

export type ViewMode = 'preview' | 'annotate' | 'side-by-side';

export type ApprovalComment = {
  type: 'general' | 'selection';
  comment: string;
  timestamp: string;
  selectedText?: string;
  highlightColor?: { bg: string; border: string; name: string };
  id?: string;
  startOffset?: number;
  endOffset?: number;
};

// Type for the TextAnnotate library's annotation format
interface AnnotationSpan extends AnnotateTag {
  start: number;
  end: number;
  text?: string;
  color?: string;
  tag?: string;
  commentId?: string; // Link back to our ApprovalComment
}

// Modal component for adding/editing comments
function CommentModal({
  isOpen,
  onClose,
  onSave,
  selectedText,
  highlightColor,
  initialComment = '',
  isEditing = false
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (comment: string, color: { bg: string; border: string; name: string }) => void;
  selectedText: string;
  highlightColor: { bg: string; border: string; name: string };
  initialComment?: string;
  isEditing?: boolean;
}) {
  const { t } = useTranslation();
  const [comment, setComment] = useState(initialComment);
  const [selectedColorHex, setSelectedColorHex] = useState(highlightColor.name || '#FFEB3B');
  const selectedColor = useMemo(() => hexToColorObject(selectedColorHex), [selectedColorHex]);

  React.useEffect(() => {
    setComment(initialComment);
    setSelectedColorHex(highlightColor.name || '#FFEB3B');
  }, [initialComment, highlightColor.name, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (comment.trim()) {
      onSave(comment.trim(), selectedColor);
      setComment('');
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-white dark:bg-gray-800 rounded-t-lg sm:rounded-lg shadow-xl w-full sm:max-w-2xl max-h-[90vh] sm:max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-4 lg:p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg sm:text-lg font-semibold text-gray-900 dark:text-white">
              {isEditing ? t('approvals.annotator.editCommentTitle') : t('approvals.annotator.addCommentTitle')}
            </h3>
            <p className="text-sm sm:text-sm text-gray-500 dark:text-gray-400 mt-1 sm:mt-1">
              {t('approvals.annotator.subtitle')}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-2 -m-2 touch-manipulation flex-shrink-0"
          >
            <svg className="w-6 h-6 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Highlighted Text Preview */}
        <div className="p-4 sm:p-4 lg:p-6 border-b border-gray-200 dark:border-gray-700 min-w-0 flex-shrink-0">
          <label className="block text-sm sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 sm:mb-2">
            {t('approvals.annotator.highlightedText')}
          </label>
          <div
            className="p-3 sm:p-3 rounded-lg border text-sm sm:text-sm leading-relaxed max-h-32 sm:max-h-32 overflow-y-auto min-w-0"
            style={{
              backgroundColor: selectedColor.bg,
              borderColor: selectedColor.border,
              borderWidth: '2px'
            }}
          >
            <pre className="whitespace-pre-wrap font-mono text-gray-900 dark:text-gray-100 break-words overflow-x-auto max-w-full">
              {selectedText}
            </pre>
          </div>
        </div>

        {/* Color Picker */}
        <div className="p-4 sm:p-4 lg:p-6 border-b border-gray-200 dark:border-gray-700 min-w-0 flex-shrink-0">
          <label className="block text-sm sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 sm:mb-2">
            {t('approvals.annotator.chooseHighlightColor')}
          </label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={selectedColorHex}
              onChange={(e) => {
                const v = e.target.value;
                if (isValidHex(v)) setSelectedColorHex(v.toUpperCase());
              }}
              className="w-10 h-10 border border-gray-300 dark:border-gray-600 rounded cursor-pointer"
              title={t('approvals.annotator.pickColorTooltip')}
            />
            <input
              type="text"
              value={selectedColorHex}
              onChange={(e) => {
                const v = e.target.value;
                if (isValidHex(v)) setSelectedColorHex(v.toUpperCase());
              }}
              className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white font-mono uppercase"
              placeholder="#FFEB3B"
              pattern="^#[0-9A-Fa-f]{6}$"
              maxLength={7}
            />
          </div>
        </div>

        {/* Comment Input */}
        <div className="p-4 sm:p-4 lg:p-6 min-w-0 flex-1 flex flex-col">
          <label className="block text-sm sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 sm:mb-2">
            {t('approvals.annotator.yourComment')}
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('approvals.annotator.commentPlaceholder')}
            className="w-full min-w-0 px-3 sm:px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-base leading-relaxed flex-1 min-h-[120px]"
            autoFocus
          />
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 sm:mt-2 break-words">
            <span className="hidden sm:inline">{t('approvals.annotator.hints.desktop')}</span>
            <span className="sm:hidden">{t('approvals.annotator.hints.mobile')}</span>
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 sm:gap-3 p-4 sm:p-4 lg:p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 sm:px-4 py-3 text-base text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors touch-manipulation"
          >
            {t('common.cancel')}
          </button>
          <button
            onClick={handleSave}
            disabled={!comment.trim()}
            className="px-4 sm:px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 sm:gap-2 text-base touch-manipulation"
          >
            <svg className="w-4 h-4 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            <span className="hidden sm:inline">{isEditing ? t('approvals.annotator.updateCommentButton') : t('approvals.annotator.addCommentButton')}</span>
            <span className="sm:hidden">{isEditing ? t('approvals.annotator.updateShort') : t('approvals.annotator.saveShort')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// Convert ApprovalComments to TextAnnotate spans
function commentsToSpans(comments: ApprovalComment[], content: string): AnnotationSpan[] {
  const spans: AnnotationSpan[] = [];

  for (const c of comments) {
    if (c.type !== 'selection' || !c.selectedText || !c.highlightColor) continue;

    let start = c.startOffset;
    let end = c.endOffset;

    // If offsets are missing or invalid, try to find the text
    if (start === undefined || end === undefined || start < 0 || end > content.length || start >= end) {
      const foundIndex = content.indexOf(c.selectedText);
      if (foundIndex !== -1) {
        start = foundIndex;
        end = foundIndex + c.selectedText.length;
      } else {
        // Can't find text, skip this annotation
        continue;
      }
    }

    spans.push({
      start,
      end,
      text: c.selectedText,
      color: c.highlightColor.bg,
      tag: c.id || '',
      commentId: c.id
    });
  }

  return spans;
}

export function ApprovalsAnnotator({ content, comments, onCommentsChange, viewMode, setViewMode }:
  { content: string; comments: ApprovalComment[]; onCommentsChange: (c: ApprovalComment[]) => void; viewMode: ViewMode; setViewMode: (m: ViewMode) => void; }) {
  const { t } = useTranslation();
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    selectedText: string;
    isEditing: boolean;
    editingComment?: ApprovalComment;
    startOffset?: number;
    endOffset?: number;
  }>({ isOpen: false, selectedText: '', isEditing: false });
  const [generalCommentModalOpen, setGeneralCommentModalOpen] = useState(false);
  const [deleteModalState, setDeleteModalState] = useState<{ isOpen: boolean; commentIndex: number }>({ isOpen: false, commentIndex: -1 });

  const generateCommentId = () => `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Convert comments to TextAnnotate format
  const annotationSpans = useMemo(() => commentsToSpans(comments, content || ''), [comments, content]);

  // Handle new selection from TextAnnotate
  const handleAnnotationChange = useCallback((newSpans: AnnotationSpan[]) => {
    // Find the new span (one that doesn't have a commentId yet)
    const newSpan = newSpans.find(s => !s.commentId);

    if (newSpan) {
      // User made a new selection - open the comment modal
      const selectedText = (content || '').slice(newSpan.start, newSpan.end);
      setModalState({
        isOpen: true,
        selectedText,
        isEditing: false,
        startOffset: newSpan.start,
        endOffset: newSpan.end
      });
    }
  }, [content]);

  // Handle clicking on an existing annotation
  const handleAnnotationClick = useCallback((span: AnnotationSpan) => {
    if (span.commentId) {
      const comment = comments.find(c => c.id === span.commentId);
      if (comment && comment.selectedText && comment.highlightColor) {
        setModalState({
          isOpen: true,
          selectedText: comment.selectedText,
          isEditing: true,
          editingComment: comment,
          startOffset: span.start,
          endOffset: span.end
        });
      }
    }
  }, [comments]);

  // Custom span renderer to make annotations clickable
  const getSpan = useCallback((span: AnnotationSpan): AnnotationSpan => {
    return {
      ...span,
      // Keep the span as-is, clicking will be handled separately
    };
  }, []);

  function handleModalSave(commentText: string, color: { bg: string; border: string; name: string }) {
    if (modalState.isEditing && modalState.editingComment) {
      const updatedComments = comments.map(c =>
        c.id === modalState.editingComment!.id
          ? { ...c, comment: commentText, highlightColor: color, timestamp: new Date().toISOString() }
          : c
      );
      onCommentsChange(updatedComments);
    } else {
      const newComment: ApprovalComment = {
        type: 'selection',
        comment: commentText,
        timestamp: new Date().toISOString(),
        selectedText: modalState.selectedText,
        highlightColor: color,
        id: generateCommentId(),
        startOffset: modalState.startOffset,
        endOffset: modalState.endOffset
      };
      onCommentsChange([...comments, newComment]);
    }
  }

  function handleModalClose() {
    setModalState({ isOpen: false, selectedText: '', isEditing: false });
  }

  function addGeneral() {
    setGeneralCommentModalOpen(true);
  }

  function handleGeneralCommentSubmit(commentText: string) {
    onCommentsChange([...comments, {
      type: 'general',
      comment: commentText,
      timestamp: new Date().toISOString(),
      id: generateCommentId()
    }]);
  }

  function remove(idx: number) {
    setDeleteModalState({ isOpen: true, commentIndex: idx });
  }

  function handleDeleteConfirm() {
    const dup = comments.slice();
    dup.splice(deleteModalState.commentIndex, 1);
    onCommentsChange(dup);
  }

  // Edit a comment from the card
  const editComment = useCallback((comment: ApprovalComment) => {
    if (comment.selectedText && comment.highlightColor) {
      setModalState({
        isOpen: true,
        selectedText: comment.selectedText,
        isEditing: true,
        editingComment: comment,
        startOffset: comment.startOffset,
        endOffset: comment.endOffset
      });
    }
  }, []);

  // Custom Mark component to handle clicks on annotations
  const handleMarkClick = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const target = e.target as HTMLElement;
    const mark = target.closest('mark');
    if (mark) {
      // The mark may contain the tag text as a sibling span, so we need to find by data attribute or position
      // Find which span was clicked by checking the mark's background color and position
      const markStyle = mark.getAttribute('style') || '';
      const bgColorMatch = markStyle.match(/background(?:-color)?:\s*([^;]+)/i);
      const bgColor = bgColorMatch ? bgColorMatch[1].trim() : '';

      // Find the span with matching color
      const clickedSpan = annotationSpans.find(s => {
        const spanColor = s.color || '';
        // Compare colors (they might have slight formatting differences)
        return spanColor === bgColor ||
               spanColor.replace(/\s/g, '') === bgColor.replace(/\s/g, '');
      });

      if (clickedSpan) {
        handleAnnotationClick(clickedSpan);
      } else {
        // Fallback: find by text content (excluding the tag)
        const markText = mark.textContent || '';
        const foundSpan = annotationSpans.find(s => {
          const expectedText = (content || '').slice(s.start, s.end);
          // The mark text might include the tag, so check if it starts with expected text
          return markText.includes(expectedText) || expectedText === markText;
        });
        if (foundSpan) {
          handleAnnotationClick(foundSpan);
        }
      }
    }
  }, [annotationSpans, content, handleAnnotationClick]);

  // Render comments list
  const renderCommentsList = () => (
    <>
      {comments.length === 0 ? (
        <div className="text-center py-6 sm:py-8 text-gray-500 dark:text-gray-400 text-sm">
          <svg className="mx-auto w-6 h-6 sm:w-8 sm:h-8 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <p className="text-xs sm:text-sm font-medium">{t('approvals.annotator.empty.title')}</p>
          <p className="text-xs mt-1">{t('approvals.annotator.empty.description')}</p>
        </div>
      ) : (
        comments.map((c, idx) => (
          <div
            key={c.id || idx}
            className="bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            {/* Card Header - Type badge + Actions */}
            <div className="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700/50">
              <div className="flex items-center gap-2">
                {/* Color indicator for selection comments */}
                {c.type === 'selection' && c.highlightColor && (
                  <div
                    className="w-2.5 h-2.5 rounded-full border"
                    style={{
                      backgroundColor: c.highlightColor.bg,
                      borderColor: c.highlightColor.border
                    }}
                  />
                )}
                {/* Comment type badge */}
                <span className="text-[11px] font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  {c.type === 'selection' ? t('approvals.annotator.badge.textSelection') : t('approvals.annotator.badge.generalComment')}
                </span>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-0.5">
                {c.type === 'selection' && c.selectedText && c.highlightColor && (
                  <button
                    onClick={() => editComment(c)}
                    className="p-1.5 rounded text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                    title={t('approvals.annotator.tooltips.editComment')}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                )}
                <button
                  onClick={() => remove(idx)}
                  className="p-1.5 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                  title={t('approvals.annotator.tooltips.deleteComment')}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Card Body */}
            <div className="p-3 space-y-3">
              {/* Comment ID - Full ID on its own line */}
              {c.id && (
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] uppercase tracking-wide text-gray-400 dark:text-gray-500">ID</span>
                  <code className="text-[11px] font-mono text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700/50 px-1.5 py-0.5 rounded">
                    {c.id}
                  </code>
                </div>
              )}

              {/* Highlighted text excerpt - Full text */}
              {c.selectedText && (
                <div
                  className="rounded-md border p-2.5 text-xs leading-relaxed"
                  style={{
                    backgroundColor: c.highlightColor?.bg || 'rgb(254, 249, 195)',
                    borderColor: c.highlightColor?.border || '#F59E0B',
                  }}
                >
                  <pre className="whitespace-pre-wrap font-mono text-gray-800 dark:text-gray-900 break-words m-0">
                    {c.selectedText}
                  </pre>
                </div>
              )}

              {/* Comment text - Full text */}
              <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                {c.comment}
              </div>
            </div>
          </div>
        ))
      )}
    </>
  );

  // Common TextAnnotate component
  const renderTextAnnotate = () => (
    <div
      onClick={handleMarkClick}
      className="text-annotate-container"
    >
      <TextAnnotate
        content={content || ''}
        value={annotationSpans}
        onChange={handleAnnotationChange}
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
  );

  // Side-by-side layout
  if (viewMode === 'side-by-side') {
    return (
      <div className="flex flex-col gap-4">
        <div data-section="annotations" className="w-full">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <div className="h-[75vh] lg:h-[80vh]">
              <SideBySideView
                content={content || ""}
                onAnnotationChange={handleAnnotationChange}
                onAnnotationClick={handleAnnotationClick}
                annotationSpans={annotationSpans}
              />
            </div>
          </div>
        </div>

        <div
          data-section="comments"
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg flex flex-col max-h-[50vh]"
        >
          <div className="p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-t-lg">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2 sm:mb-3 flex items-center gap-2 text-sm sm:text-base">
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Comments & Feedback
            </h4>
            <button
              onClick={addGeneral}
              className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg text-xs sm:text-sm hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 touch-manipulation"
            >
              <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span className="hidden sm:inline">{t('approvals.annotator.addGeneralComment.button')}</span>
              <span className="sm:hidden">{t('approvals.annotator.addCommentShort')}</span>
            </button>
          </div>

          <div className="flex-1 p-3 sm:p-4 overflow-y-auto space-y-2 sm:space-y-3">
            {renderCommentsList()}
          </div>
        </div>

        {modalState.isOpen && modalState.selectedText && (
          <CommentModal
            isOpen={modalState.isOpen}
            onClose={handleModalClose}
            onSave={handleModalSave}
            selectedText={modalState.selectedText}
            highlightColor={modalState.editingComment?.highlightColor || { bg: 'rgba(255, 235, 59, 0.3)', border: '#FFEB3B', name: '#FFEB3B' }}
            initialComment={modalState.editingComment?.comment || ''}
            isEditing={modalState.isEditing}
          />
        )}

        <TextInputModal
          isOpen={generalCommentModalOpen}
          onClose={() => setGeneralCommentModalOpen(false)}
          onSubmit={handleGeneralCommentSubmit}
          title={t('approvals.annotator.addGeneralComment.title')}
          placeholder={t('approvals.annotator.addGeneralComment.placeholder')}
          submitText={t('approvals.annotator.addGeneralComment.submit')}
          multiline={true}
        />

        <ConfirmationModal
          isOpen={deleteModalState.isOpen}
          onClose={() => setDeleteModalState({ isOpen: false, commentIndex: -1 })}
          onConfirm={handleDeleteConfirm}
          title={t('approvals.annotator.delete.title')}
          message={t('approvals.annotator.delete.message')}
          confirmText={t('common.delete')}
          cancelText={t('common.cancel')}
          variant="danger"
        />
      </div>
    );
  }

  // Default layout (preview and annotate modes)
  return (
    <div className="grid gap-4 lg:grid-cols-3 lg:gap-6">
      <div data-section="annotations" className="lg:col-span-2">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          {viewMode === 'preview' ? (
            <div className="p-4 sm:p-6">
              <div className="prose prose-sm sm:prose-base max-w-none dark:prose-invert prose-img:max-w-full prose-img:h-auto prose-headings:text-gray-900 dark:prose-headings:text-white prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-strong:text-gray-900 dark:prose-strong:text-white prose-code:text-gray-800 dark:prose-code:text-gray-200 prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-pre:bg-gray-50 dark:prose-pre:bg-gray-900 prose-blockquote:text-gray-700 dark:prose-blockquote:text-gray-300 prose-li:text-gray-700 dark:prose-li:text-gray-300">
                <MDXEditorWrapper content={content || ""} mode="view" enableMermaid={true} />
              </div>
            </div>
          ) : (
            <div className="p-4">
              <div className="mb-3 p-2 sm:p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
                <p className="text-xs text-blue-700 dark:text-blue-300 m-0 flex items-start gap-2">
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="leading-relaxed break-words">
                    <strong>{t('approvals.annotator.instructions.title')}</strong><br className="hidden sm:block" />
                    <span className="block sm:hidden">{t('approvals.annotator.instructions.mobile')}</span>
                    <span className="hidden sm:block">{t('approvals.annotator.instructions.step1')}</span><br className="hidden sm:block" />
                    <span className="hidden sm:block">{t('approvals.annotator.instructions.step2')}</span><br className="hidden sm:block" />
                    <span className="hidden sm:block">{t('approvals.annotator.instructions.step3')}</span>
                  </span>
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-900 p-3 sm:p-4 rounded-lg border border-gray-200 dark:border-gray-700 min-w-0 text-gray-900 dark:text-gray-100">
                {renderTextAnnotate()}
              </div>
            </div>
          )}
        </div>
      </div>

      <div data-section="comments" className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg flex flex-col max-h-[60vh] lg:max-h-[80vh] lg:col-span-1">
        <div className="p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-t-lg">
          <h4 className="font-medium text-gray-900 dark:text-white mb-2 sm:mb-3 flex items-center gap-2 text-sm sm:text-base">
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Comments & Feedback
          </h4>

          {viewMode === 'preview' && (
            <div className="mb-2 sm:mb-3 p-2 sm:p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg text-xs sm:text-sm text-blue-800 dark:text-blue-200">
              <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1 inline flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {t('approvals.annotator.switchHelp')}
            </div>
          )}

          {viewMode === 'annotate' && (
            <button
              onClick={addGeneral}
              className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg text-xs sm:text-sm hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 touch-manipulation"
            >
              <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span className="hidden sm:inline">{t('approvals.annotator.addGeneralComment.button')}</span>
              <span className="sm:hidden">{t('approvals.annotator.addCommentShort')}</span>
            </button>
          )}
        </div>

        <div className="flex-1 p-3 sm:p-4 overflow-y-auto space-y-2 sm:space-y-3">
          {renderCommentsList()}
        </div>
      </div>

      {modalState.isOpen && modalState.selectedText && (
        <CommentModal
          isOpen={modalState.isOpen}
          onClose={handleModalClose}
          onSave={handleModalSave}
          selectedText={modalState.selectedText}
          highlightColor={modalState.editingComment?.highlightColor || { bg: 'rgba(255, 235, 59, 0.3)', border: '#FFEB3B', name: '#FFEB3B' }}
          initialComment={modalState.editingComment?.comment || ''}
          isEditing={modalState.isEditing}
        />
      )}

      <TextInputModal
        isOpen={generalCommentModalOpen}
        onClose={() => setGeneralCommentModalOpen(false)}
        onSubmit={handleGeneralCommentSubmit}
        title={t('approvals.annotator.addGeneralComment.title')}
        placeholder={t('approvals.annotator.addGeneralComment.placeholder')}
        submitText={t('approvals.annotator.addGeneralComment.submit')}
        multiline={true}
      />

      <ConfirmationModal
        isOpen={deleteModalState.isOpen}
        onClose={() => setDeleteModalState({ isOpen: false, commentIndex: -1 })}
        onConfirm={handleDeleteConfirm}
        title={t('approvals.annotator.delete.title')}
        message={t('approvals.annotator.delete.message')}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        variant="danger"
      />
    </div>
  );
}
