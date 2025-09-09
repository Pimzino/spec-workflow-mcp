import React, { useEffect, useMemo, useState } from 'react';
import { ApiProvider, useApi } from '../api/api';
import { useWs } from '../ws/WebSocketProvider';
import { ApprovalsAnnotator, ApprovalComment } from '../approvals/ApprovalsAnnotator';
import { NotificationProvider } from '../notifications/NotificationProvider';
import { TextInputModal } from '../modals/TextInputModal';
import { AlertModal } from '../modals/AlertModal';
import { useTranslation } from 'react-i18next';

function formatDate(dateStr?: string, t?: (k: string, o?: any) => string) {
  if (!dateStr) return t ? t('common.unknown') : 'Unknown';
  return new Date(dateStr).toLocaleDateString(undefined, { 
    month: 'short', 
    day: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit' 
  });
}

function getApprovalPreview(approval: any) {
  if (!approval) return '';
  return approval.content ? String(approval.content).substring(0, 200) : '';
}

function ApprovalItem({ a }: { a: any }) {
  const { approvalsAction, getApprovalContent } = useApi();
  const { t } = useTranslation();
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'preview' | 'annotate'>('annotate');
  const [comments, setComments] = useState<ApprovalComment[]>([]);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectModalOpen, setRejectModalOpen] = useState<boolean>(false);
  const [approvalWarningModalOpen, setApprovalWarningModalOpen] = useState<boolean>(false);
  const [revisionWarningModalOpen, setRevisionWarningModalOpen] = useState<boolean>(false);

  // Scroll functions for navigation FABs
  const scrollToComments = () => {
    const commentsSection = document.querySelector('[data-section="comments"]');
    if (commentsSection) {
      commentsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const scrollToAnnotations = () => {
    const annotationSection = document.querySelector('[data-section="annotations"]');
    if (annotationSection) {
      annotationSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  useEffect(() => {
    let active = true;
    setLoading(true);
    if (!a.filePath && a.content) {
      const c = String(a.content);
      setContent(c);
      setLoading(false);
    } else {
      getApprovalContent(a.id)
        .then((res) => { if (active) setContent(String(res.content || '')); })
        .finally(() => active && setLoading(false));
    }
    return () => { active = false; };
  }, [a, getApprovalContent]);

  const handleApprove = async () => {
    if (comments.length > 0) {
      setApprovalWarningModalOpen(true);
      return;
    }
    setActionLoading('approve');
    try {
      await approvalsAction(a.id, 'approve', { response: t('approvalsPage.messages.approvedViaDashboard') });
      setOpen(false);
    } catch (error) {
      console.error('Failed to approve:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    setRejectModalOpen(true);
  };

  const handleRejectWithFeedback = async (feedback: string) => {
    setActionLoading('reject');
    try {
      await approvalsAction(a.id, 'reject', { response: feedback });
      setOpen(false);
    } catch (error) {
      console.error('Failed to reject:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRevision = async () => {
    if (comments.length === 0) {
      setRevisionWarningModalOpen(true);
      return;
    }
    
    const general = comments.filter(c => c.type === 'general');
    const selections = comments.filter(c => c.type === 'selection');
    let summary = `Feedback Summary (${comments.length} comments):\n\n`;
    
    if (general.length) {
      summary += 'General Comments:\n';
      general.forEach((c, i) => { summary += `${i + 1}. ${c.comment}\n`; });
      summary += '\n';
    }
    
    if (selections.length) {
      summary += 'Specific Text Comments:\n';
      selections.forEach((c, i) => { 
        const t = (c.selectedText || ''); 
        summary += `${i + 1}. "${t.substring(0, 50)}${t.length > 50 ? '...' : ''}": ${c.comment}\n`; 
      });
    }
    
    const payload = {
      response: summary,
      annotations: JSON.stringify({ 
        decision: 'needs-revision', 
        comments, 
        summary, 
        timestamp: new Date().toISOString() 
      }, null, 2),
      comments,
    };
    
    setActionLoading('revision');
    try {
      await approvalsAction(a.id, 'needs-revision', payload);
      setOpen(false);
      setComments([]);
    } catch (error) {
      console.error('Failed to request revision:', error);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg transition-colors overflow-hidden">
      <div className="p-4 sm:p-6 md:p-8 min-w-0">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="text-base sm:text-lg md:text-xl font-medium text-gray-900 dark:text-white mb-2 truncate">
              {a.title}
            </h3>

            {/* File Path */}
            {a.filePath && (
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-1 min-w-0 max-w-full">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="truncate text-xs break-all min-w-0">{a.filePath}</span>
              </div>
            )}

            {/* Approval Status */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-sm mb-3">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                a.status === 'pending' 
                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                  : a.status === 'needs-revision'
                  ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                  : a.status === 'approved'
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              }`}>
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {a.status === 'pending' && (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  )}
                  {a.status === 'needs-revision' && (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  )}
                  {a.status === 'approved' && (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  )}
                  {a.status === 'rejected' && (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  )}
                </svg>
                {a.status === 'needs-revision' ? t('approvals.status.needsRevision') : t(`approvals.status.${a.status}`)}
              </span>

              <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4m-6 0h6M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V9a2 2 0 00-2-2h-2" />
                </svg>
                {formatDate(a.createdAt, t)}
              </span>

              {a.type && (
                <span className="inline-flex items-center text-xs text-blue-600 dark:text-blue-400">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  {a.type}
                </span>
              )}
            </div>

            {/* Preview Content */}
            {!open && (
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 sm:p-4 md:p-6 mb-3 sm:mb-4 md:mb-6">
                <div className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-400 max-h-24 sm:max-h-32 md:max-h-40 overflow-y-auto">
                  {loading ? (
                    <div className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 sm:mr-3 h-3 w-3 sm:h-4 sm:w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span className="text-xs sm:text-sm">{t('common.loadingContent')}</span>
                    </div>
                  ) : (
                    <div className="text-xs leading-relaxed break-words overflow-hidden">
                      {content ? (content.length > 250 ? content.slice(0, 250) + '...' : content) : t('common.noContentAvailable')}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 min-w-0">
              <button
                onClick={() => setOpen(!open)}
                className="px-3 py-2 md:px-4 md:py-3 bg-blue-600 text-white rounded-lg text-xs sm:text-sm md:text-base hover:bg-blue-700 transition-colors flex items-center gap-1 min-w-0 touch-manipulation"
              >
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {open ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  )}
                </svg>
                <span className="hidden sm:inline">{open ? t('approvalsPage.actions.closeReview') : t('approvalsPage.actions.openReview')}</span>
                <span className="sm:hidden">{open ? t('common.close') : t('approvalsPage.actions.reviewShort')}</span>
              </button>

              <button
                onClick={handleApprove}
                disabled={!!actionLoading}
                className="px-3 py-2 md:px-4 md:py-3 bg-green-600 text-white rounded-lg text-xs sm:text-sm md:text-base hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1 min-w-0 touch-manipulation"
              >
                {actionLoading === 'approve' ? (
                  <svg className="animate-spin w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                )}
                <span className="hidden sm:inline">{t('approvalsPage.actions.quickApprove')}</span>
                <span className="sm:hidden">{t('approvalsPage.actions.approve')}</span>
              </button>

              <button
                onClick={handleReject}
                disabled={!!actionLoading}
                className="px-3 py-2 md:px-4 md:py-3 bg-red-600 text-white rounded-lg text-xs sm:text-sm md:text-base hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1 min-w-0 touch-manipulation"
              >
                {actionLoading === 'reject' ? (
                  <svg className="animate-spin w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
                <span className="hidden sm:inline">{t('approvalsPage.actions.quickReject')}</span>
                <span className="sm:hidden">{t('approvalsPage.actions.reject')}</span>
              </button>

              {open && (
                <button
                  onClick={handleRevision}
                  disabled={!!actionLoading || comments.length === 0}
                  className="px-3 py-2 md:px-4 md:py-3 bg-orange-600 text-white rounded-lg text-xs sm:text-sm md:text-base hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1 min-w-0 touch-manipulation"
                >
                  {actionLoading === 'revision' ? (
                    <svg className="animate-spin w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  )}
                  <span className="hidden sm:inline">{t('approvalsPage.actions.requestRevisions')}</span>
                  <span className="sm:hidden">{t('approvalsPage.actions.revisions')}</span>
                  {comments.length > 0 && (
                    <span className="ml-1 text-xs opacity-75">({comments.length})</span>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {open && (
        <div className="border-t border-gray-200 dark:border-gray-700 p-3 sm:p-4 lg:p-6 min-w-0 overflow-hidden relative">
          <ApprovalsAnnotator 
            content={content} 
            comments={comments} 
            onCommentsChange={setComments} 
            viewMode={viewMode} 
            setViewMode={setViewMode} 
          />
          
          {/* Navigation FABs - show on mobile and tablet (hide only on desktop lg+) */}
          {viewMode === 'annotate' && (
            <div className="fixed bottom-4 right-4 flex flex-col gap-2 z-40 lg:hidden">
              {/* Scroll to Annotations FAB - at the top */}
              <button
                onClick={scrollToAnnotations}
                className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full shadow-lg transition-colors flex items-center justify-center"
                title={t('approvalsPage.tooltips.goToAnnotations')}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              </button>
              
              {/* Scroll to Comments FAB - at the bottom */}
              <button
                onClick={scrollToComments}
                className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full shadow-lg transition-colors flex items-center justify-center"
                title={t('approvalsPage.tooltips.goToComments')}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Rejection Feedback Modal */}
      <TextInputModal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        onSubmit={handleRejectWithFeedback}
        title={t('approvalsPage.reject.title')}
        placeholder={t('approvalsPage.reject.placeholder')}
        submitText={t('approvalsPage.reject.submit')}
        multiline={true}
      />

      {/* Approval Warning Modal */}
      <AlertModal
        isOpen={approvalWarningModalOpen}
        onClose={() => setApprovalWarningModalOpen(false)}
        title={t('approvalsPage.approvalWarning.title')}
        message={t('approvalsPage.approvalWarning.message')}
        variant="warning"
      />

      {/* Revision Warning Modal */}
      <AlertModal
        isOpen={revisionWarningModalOpen}
        onClose={() => setRevisionWarningModalOpen(false)}
        title={t('approvalsPage.revision.noCommentsTitle')}
        message={t('approvalsPage.revision.noCommentsMessage')}
        variant="warning"
      />
    </div>
  );
}

function Content() {
  const { approvals } = useApi();
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const { t } = useTranslation();
  
  // Get unique categories from approvals
  const categories = useMemo(() => {
    const cats = new Set<string>();
    cats.add('all');
    approvals.forEach(a => {
      if (a.categoryName) {
        cats.add(a.categoryName);
      }
    });
    return Array.from(cats);
  }, [approvals]);
  
  // Filter approvals based on selected category
  const filteredApprovals = useMemo(() => {
    if (filterCategory === 'all') {
      return approvals;
    }
    return approvals.filter(a => a.categoryName === filterCategory);
  }, [approvals, filterCategory]);
  
  // Calculate pending count for header display
  const pendingCount = useMemo(() => {
    return filteredApprovals.filter(a => a.status === 'pending').length;
  }, [filteredApprovals]);
  
  return (
    <div className="grid gap-4">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 sm:p-6 md:p-8 max-w-full">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900 dark:text-white">{t('approvalsPage.header.title')}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {t('approvalsPage.header.subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            pendingCount > 0 
              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' 
              : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
          }`}>
            {t('approvalsPage.pendingCount', { count: pendingCount })}
          </span>
        </div>
        </div>
      </div>
      
      {/* Filter Dropdown */}
      {categories.length > 1 && (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('approvalsPage.filter.label')}</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="block w-auto rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm focus:border-blue-500 focus:ring-blue-500"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? t('approvalsPage.filter.options.all') : 
                   cat === 'steering' ? t('approvalsPage.filter.options.steering') : 
                   cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Approvals List */}
      {filteredApprovals.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 sm:p-6">
          <div className="text-center py-8 sm:py-12 text-gray-500 dark:text-gray-400">
            <svg className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mb-3 sm:mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-1 sm:mb-2">{t('approvalsPage.empty.title')}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto">{t('approvalsPage.empty.description')}</p>
          </div>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {filteredApprovals.map((a) => (
            <ApprovalItem key={a.id} a={a} />
          ))}
        </div>
      )}
    </div>
  );
}

export function ApprovalsPage() {
  const { initial } = useWs();
  return (
    <ApiProvider initial={initial}>
      <Content />
    </ApiProvider>
  );
}


