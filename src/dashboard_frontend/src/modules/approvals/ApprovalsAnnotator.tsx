import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { hexToColorObject, isValidHex } from './colors';
import { Markdown } from '../markdown/Markdown';
import { TextInputModal } from '../modals/TextInputModal';
import { ConfirmationModal } from '../modals/ConfirmationModal';

export type ApprovalComment = {
  type: 'general' | 'selection';
  comment: string;
  timestamp: string;
  selectedText?: string;
  highlightColor?: { bg: string; border: string; name: string };
  id?: string; // Add unique ID for each comment
};

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

export function renderContentWithAnnotations(content: string, comments: ApprovalComment[], onHighlightClick?: (commentId: string) => void, tooltip?: string) {
  let processedContent = (content ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
  const selectionComments = comments.filter((c) => c.type === 'selection' && c.selectedText && c.highlightColor) as Required<ApprovalComment>[];
  selectionComments.sort((a, b) => (b.selectedText?.length || 0) - (a.selectedText?.length || 0));
  for (const c of selectionComments) {
    const escaped = (c.selectedText || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
    const regex = new RegExp(escaped.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    const style = `background-color: ${c.highlightColor.bg}; border-bottom: 2px solid ${c.highlightColor.border}; padding: 1px 2px; border-radius: 2px; cursor: pointer;`;
    const clickHandler = onHighlightClick ? `data-comment-id="${c.id || ''}"` : '';
    const titleAttr = tooltip || 'Click to view/edit comment';
    processedContent = processedContent.replace(regex, `<span style="${style}" class="highlight-${c.highlightColor.name} highlight-clickable" ${clickHandler} title="${titleAttr}">${escaped}</span>`);
  }
  return processedContent;
}

export function ApprovalsAnnotator({ content, comments, onCommentsChange, viewMode, setViewMode }:
  { content: string; comments: ApprovalComment[]; onCommentsChange: (c: ApprovalComment[]) => void; viewMode: 'preview' | 'annotate'; setViewMode: (m: 'preview' | 'annotate') => void; }) {
  const { t } = useTranslation();
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    selectedText: string;
    isEditing: boolean;
    editingComment?: ApprovalComment;
  }>({ isOpen: false, selectedText: '', isEditing: false });
  const [generalCommentModalOpen, setGeneralCommentModalOpen] = useState(false);
  const [deleteModalState, setDeleteModalState] = useState<{ isOpen: boolean; commentIndex: number }>({ isOpen: false, commentIndex: -1 });

  // Generate unique ID for new comments
  const generateCommentId = () => `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  function handleSelectionMouseUp() {
    const selection = window.getSelection();
    const selectedText = selection?.toString().trim() || '';
    if (!selectedText) return;
    
    // Open modal for adding comment
    setModalState({
      isOpen: true,
      selectedText,
      isEditing: false
    });
    
    // Clear selection after a brief delay to prevent flicker
    setTimeout(() => {
      try { selection?.removeAllRanges(); } catch {}
    }, 50);
  }

  function handleHighlightClick(commentId: string) {
    const comment = comments.find(c => c.id === commentId);
    if (comment && comment.selectedText && comment.highlightColor) {
      setModalState({
        isOpen: true,
        selectedText: comment.selectedText,
        isEditing: true,
        editingComment: comment
      });
    }
  }

  function handleModalSave(commentText: string, color: { bg: string; border: string; name: string }) {
    if (modalState.isEditing && modalState.editingComment) {
      // Update existing comment
      const updatedComments = comments.map(c => 
        c.id === modalState.editingComment!.id 
          ? { ...c, comment: commentText, highlightColor: color, timestamp: new Date().toISOString() }
          : c
      );
      onCommentsChange(updatedComments);
    } else {
      // Add new comment
      const newComment: ApprovalComment = {
        type: 'selection',
        comment: commentText,
        timestamp: new Date().toISOString(),
        selectedText: modalState.selectedText,
        highlightColor: color,
        id: generateCommentId()
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

  const annotatedHtml = useMemo(() => renderContentWithAnnotations(content || '', comments, handleHighlightClick, t('approvals.annotator.tooltips.viewEditComment')), [content, comments, t]);

  // Handle clicks on highlighted text
  function handleContentClick(e: React.MouseEvent) {
    const target = e.target as HTMLElement;
    if (target.classList.contains('highlight-clickable')) {
      e.preventDefault();
      const commentId = target.getAttribute('data-comment-id');
      if (commentId) {
        handleHighlightClick(commentId);
      }
    }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-3 lg:gap-6">
      {/* Document Content - Takes 2 columns on desktop */}
      <div data-section="annotations" className="lg:col-span-2">
        {/* View Mode Toggle */}
        <div className="flex items-center justify-center p-2 sm:p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-t-lg">
          <div className="flex items-center bg-white dark:bg-gray-800 rounded-lg p-0.5 sm:p-1 shadow-sm border border-gray-200 dark:border-gray-600">
            <button
              onClick={() => setViewMode('preview')}
              className={`px-2 sm:px-3 py-1.5 text-sm rounded-md transition-colors flex items-center gap-1 ${
                viewMode === 'preview' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 616 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span className="hidden sm:inline">{t('approvals.annotator.viewMode.preview')}</span>
            </button>
            <button
              onClick={() => setViewMode('annotate')}
              className={`px-2 sm:px-3 py-1.5 text-sm rounded-md transition-colors flex items-center gap-1 ${
                viewMode === 'annotate' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span className="hidden sm:inline">{t('approvals.annotator.viewMode.annotate')}</span>
            </button>
          </div>
        </div>

        {/* Content Display */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-b-lg overflow-hidden">
          {viewMode === 'preview' ? (
            <div className="p-4 sm:p-6">
              <div className="prose prose-sm sm:prose-base max-w-none dark:prose-invert prose-img:max-w-full prose-img:h-auto prose-headings:text-gray-900 dark:prose-headings:text-white prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-strong:text-gray-900 dark:prose-strong:text-white prose-code:text-gray-800 dark:prose-code:text-gray-200 prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-pre:bg-gray-50 dark:prose-pre:bg-gray-900 prose-blockquote:text-gray-700 dark:prose-blockquote:text-gray-300 prose-li:text-gray-700 dark:prose-li:text-gray-300">
                <Markdown content={content || ''} />
              </div>
            </div>
          ) : (
            <div className="p-4">
              {/* Instruction note */}
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

              <div className="bg-gray-50 dark:bg-gray-900 p-3 sm:p-4 rounded-lg border border-gray-200 dark:border-gray-700 min-w-0">
                <pre 
                  className="whitespace-pre-wrap text-xs sm:text-sm leading-relaxed select-text cursor-text font-mono text-gray-900 dark:text-gray-100 overflow-x-auto break-words max-w-full" 
                  onMouseUp={handleSelectionMouseUp}
                  onClick={handleContentClick}
                  dangerouslySetInnerHTML={{ __html: annotatedHtml }} 
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Comments Sidebar - Right sidebar on desktop, bottom on mobile */}
      <div data-section="comments" className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg flex flex-col max-h-[60vh] lg:max-h-[80vh] lg:col-span-1">
        {/* Comments Header */}
        <div className="p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-t-lg">
          <h4 className="font-medium text-gray-900 dark:text-white mb-2 sm:mb-3 flex items-center gap-2 text-sm sm:text-base">
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Comments & Feedback
          </h4>

          {/* Preview mode note */}
          {viewMode === 'preview' && (
            <div className="mb-2 sm:mb-3 p-2 sm:p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg text-xs sm:text-sm text-blue-800 dark:text-blue-200">
              <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1 inline flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            {t('approvals.annotator.switchHelp')}
            </div>
          )}

          {/* Add comment button (only in annotate mode) */}
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

        {/* Comments List */}
        <div className="flex-1 p-3 sm:p-4 overflow-y-auto space-y-2 sm:space-y-3">
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
              <div key={idx} className="bg-gray-50 dark:bg-gray-900 p-2 sm:p-3 rounded-lg border border-gray-200 dark:border-gray-700 relative">
                {/* Color indicator for selection comments */}
                {c.type === 'selection' && c.highlightColor && (
                  <div
                    className="absolute left-0 top-0 bottom-0 w-1 rounded-l-lg"
                    style={{ backgroundColor: c.highlightColor.border }}
                  />
                )}

                <div className="flex items-start justify-between mb-1 sm:mb-2" style={{ marginLeft: c.type === 'selection' && c.highlightColor ? '8px' : '0' }}>
                  <div className="flex items-center gap-1 sm:gap-2 flex-1 min-w-0">
                    {/* Color dot for selection comments */}
                    {c.type === 'selection' && c.highlightColor && (
                      <div
                        className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border flex-shrink-0"
                        style={{ 
                          backgroundColor: c.highlightColor.bg, 
                          borderColor: c.highlightColor.border 
                        }}
                        title={t('approvals.annotator.colorHighlight', { color: c.highlightColor.name })}
                      />
                    )}
                    <span className="text-xs font-medium text-blue-600 dark:text-blue-400 flex items-center gap-1 truncate">
                      <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <span className="truncate">{c.type === 'selection' ? t('approvals.annotator.badge.textSelection') : t('approvals.annotator.badge.generalComment')}</span>
                    </span>
                  </div>
                  <button
                    onClick={() => remove(idx)}
                    className="text-gray-400 hover:text-red-500 text-xs p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors touch-manipulation flex-shrink-0 ml-2"
                    title={t('approvals.annotator.tooltips.deleteComment')}
                  >
                    <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>

                {c.selectedText && (
                  <div className="mb-1 sm:mb-2 p-1.5 sm:p-2 rounded text-xs italic leading-relaxed" style={{ 
                    marginLeft: c.highlightColor ? '8px' : '0',
                    backgroundColor: c.highlightColor?.bg || 'rgb(254, 249, 195)', 
                    borderColor: c.highlightColor?.border || '#F59E0B', 
                    borderWidth: '1px' 
                  }}>
                    <span className="break-words">"{c.selectedText.substring(0, 80)}{c.selectedText.length > 80 ? '...' : ''}"</span>
                  </div>
                )}

                <div className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed break-words" style={{ marginLeft: c.type === 'selection' && c.highlightColor ? '8px' : '0' }}>
                  {c.comment}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Comment Modal */}
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

      {/* General Comment Modal */}
      <TextInputModal
        isOpen={generalCommentModalOpen}
        onClose={() => setGeneralCommentModalOpen(false)}
        onSubmit={handleGeneralCommentSubmit}
        title={t('approvals.annotator.addGeneralComment.title')}
        placeholder={t('approvals.annotator.addGeneralComment.placeholder')}
        submitText={t('approvals.annotator.addGeneralComment.submit')}
        multiline={true}
      />

      {/* Delete Confirmation Modal */}
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


