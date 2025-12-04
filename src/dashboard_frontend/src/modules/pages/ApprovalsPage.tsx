import React, { useEffect, useMemo, useState } from 'react';
import { useApi, DocumentSnapshot, DiffResult } from '../api/api';
import { ApprovalsAnnotator, ApprovalComment } from '../approvals/ApprovalsAnnotator';
import { NotificationProvider } from '../notifications/NotificationProvider';
import { TextInputModal } from '../modals/TextInputModal';
import { AlertModal } from '../modals/AlertModal';
import { DiffViewer } from '../diff/DiffViewer';
import { DiffStats, DiffStatsBadge } from '../diff/DiffStats';
import { formatSnapshotTimestamp, createVersionLabel, hasDiffChanges, getSnapshotTriggerDescription } from '../diff/utils';
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


function ApprovalItem({ a }: { a: any }) {
  const { approvalsAction, getApprovalContent, getApprovalSnapshots, getApprovalDiff } = useApi();
  const { t } = useTranslation();
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'preview' | 'annotate' | 'diff'>('annotate');
  const [diffViewMode, setDiffViewMode] = useState<'unified' | 'split' | 'inline'>('split');
  const [comments, setComments] = useState<ApprovalComment[]>([]);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectModalOpen, setRejectModalOpen] = useState<boolean>(false);
  const [approvalWarningModalOpen, setApprovalWarningModalOpen] = useState<boolean>(false);
  const [revisionWarningModalOpen, setRevisionWarningModalOpen] = useState<boolean>(false);

  // Snapshot-related state
  const [snapshots, setSnapshots] = useState<DocumentSnapshot[]>([]);
  const [snapshotsLoading, setSnapshotsLoading] = useState<boolean>(false);
  const [selectedSnapshotVersion, setSelectedSnapshotVersion] = useState<number>(-1);
  const [diff, setDiff] = useState<DiffResult | null>(null);
  const [diffLoading, setDiffLoading] = useState<boolean>(false);

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

  // Load snapshots when approval is opened
  useEffect(() => {
    if (!open) return;

    let active = true;
    setSnapshotsLoading(true);

    getApprovalSnapshots(a.id)
      .then((snaps) => {
        if (active) {
          setSnapshots(snaps);
          // Set initial selected version to the last snapshot (most recent before current)
          if (snaps.length > 0) {
            setSelectedSnapshotVersion(snaps[snaps.length - 1].version);
          }
        }
      })
      .catch((error) => {
        console.error('Failed to load snapshots:', error);
      })
      .finally(() => {
        if (active) setSnapshotsLoading(false);
      });

    return () => { active = false; };
  }, [open, a.id, getApprovalSnapshots]);

  // Load diff when snapshot version changes or when switching to diff view
  useEffect(() => {
    if (viewMode !== 'diff' || snapshots.length === 0) {
      setDiff(null);
      return;
    }

    let active = true;
    setDiffLoading(true);

    getApprovalDiff(a.id, selectedSnapshotVersion, 'current')
      .then((diffResult) => {
        if (active) {
          setDiff(diffResult);
        }
      })
      .catch((error) => {
        console.error('Failed to load diff:', error);
      })
      .finally(() => {
        if (active) setDiffLoading(false);
      });

    return () => { active = false; };
  }, [viewMode, selectedSnapshotVersion, snapshots.length, a.id, getApprovalDiff]);

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
    <div className="glass-card rounded-xl transition-all duration-200 overflow-hidden max-w-full hover:shadow-lg hover:shadow-purple-500/5">
      <div className="p-3 sm:p-4 md:p-6 lg:p-8 min-w-0 max-w-full overflow-x-hidden">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 dark:text-white mb-2 truncate">
              {a.title}
            </h3>

            {/* File Path */}
            {a.filePath && (
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-3 flex items-center gap-2 min-w-0 max-w-full">
                <svg className="w-4 h-4 flex-shrink-0 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <code className="truncate text-xs break-all min-w-0 font-mono bg-gray-100 dark:bg-gray-800/50 px-2 py-0.5 rounded">{a.filePath}</code>
              </div>
            )}

            {/* Approval Status */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-sm mb-3">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${
                a.status === 'pending'
                  ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-amber-900 shadow-amber-500/25'
                  : a.status === 'needs-revision'
                  ? 'bg-gradient-to-r from-orange-400 to-orange-500 text-orange-900 shadow-orange-500/25'
                  : a.status === 'approved'
                  ? 'bg-gradient-to-r from-emerald-400 to-green-500 text-emerald-900 shadow-emerald-500/25'
                  : 'bg-gradient-to-r from-red-400 to-red-500 text-red-900 shadow-red-500/25'
              }`}>
                <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

              <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1.5 text-xs">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {formatDate(a.createdAt, t)}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 min-w-0">
              <button
                onClick={() => setOpen(!open)}
                className="px-4 py-2 rounded-full text-xs sm:text-sm font-medium flex items-center gap-1.5 min-w-0 touch-manipulation transition-all duration-200 bg-gray-100 dark:bg-gray-700/50 hover:bg-gray-200 dark:hover:bg-gray-600/50 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600"
              >
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {open ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  )}
                </svg>
                <span className="hidden sm:inline">{open ? t('approvalsPage.actions.closeReview') : t('approvalsPage.actions.openReview')}</span>
                <span className="sm:hidden">{open ? t('common.close') : t('approvalsPage.actions.reviewShort')}</span>
              </button>

              <button
                onClick={handleApprove}
                disabled={!!actionLoading}
                className="px-4 py-2 rounded-full text-xs sm:text-sm font-medium flex items-center gap-1.5 min-w-0 touch-manipulation transition-all duration-200 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shadow-md shadow-green-500/25 hover:shadow-lg hover:shadow-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
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
                className="px-4 py-2 rounded-full text-xs sm:text-sm font-medium flex items-center gap-1.5 min-w-0 touch-manipulation transition-all duration-200 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white shadow-md shadow-red-500/25 hover:shadow-lg hover:shadow-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
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
                  className="px-4 py-2 rounded-full text-xs sm:text-sm font-medium flex items-center gap-1.5 min-w-0 touch-manipulation transition-all duration-200 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white shadow-md shadow-orange-500/25 hover:shadow-lg hover:shadow-orange-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
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
                    <span className="ml-1.5 px-1.5 py-0.5 text-xs bg-white/20 rounded-full">({comments.length})</span>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {open && (
        <div className="border-t border-gray-200/50 dark:border-gray-700/50 p-2 sm:p-3 md:p-4 lg:p-6 min-w-0 max-w-full overflow-x-hidden relative bg-gray-50/50 dark:bg-gray-900/30">

          {/* View Controls */}
          <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* View Mode Tabs */}
            <div className="space-y-2">
              <div className="inline-flex items-center glass rounded-full p-1 shadow-sm">
              <button
                onClick={() => setViewMode('preview')}
                className={`px-4 py-1.5 text-sm rounded-full transition-all duration-200 flex items-center justify-center gap-1.5 font-medium ${
                  viewMode === 'preview'
                    ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-md shadow-purple-500/25'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span className="hidden sm:inline">Preview</span>
              </button>
              <button
                onClick={() => setViewMode('annotate')}
                className={`px-4 py-1.5 text-sm rounded-full transition-all duration-200 flex items-center justify-center gap-1.5 font-medium ${
                  viewMode === 'annotate'
                    ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-md shadow-purple-500/25'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span className="hidden sm:inline">Annotate</span>
              </button>
              {snapshots.length > 0 && (
                <button
                  onClick={() => setViewMode('diff')}
                  className={`px-4 py-1.5 text-sm rounded-full transition-all duration-200 flex items-center justify-center gap-1.5 font-medium ${
                    viewMode === 'diff'
                      ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-md shadow-purple-500/25'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="hidden sm:inline">Changes</span>
                </button>
              )}
              </div>
            </div>

            {/* Diff Controls (only shown when in diff mode) */}
            {viewMode === 'diff' && snapshots.length > 0 && (
              <div className="flex flex-col gap-3 overflow-x-hidden">
                {/* Two-dropdown comparison selector */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 min-w-0 w-full sm:w-auto">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">From:</label>
                    <select
                      value={selectedSnapshotVersion}
                      onChange={(e) => setSelectedSnapshotVersion(parseInt(e.target.value, 10))}
                      className="block w-full sm:w-auto max-w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      {snapshots.map((snapshot) => (
                        <option key={snapshot.version} value={snapshot.version}>
                          v{snapshot.version} - {snapshot.approvalTitle} - {getSnapshotTriggerDescription(snapshot.trigger)} ({formatSnapshotTimestamp(snapshot.timestamp)})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 min-w-0 w-full sm:w-auto">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">To:</label>
                    <div
                      className="px-3 py-1.5 text-sm bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-md border border-blue-200 dark:border-blue-800 truncate max-w-[200px]"
                      title={a.filePath}
                    >
                      {a.filePath ? a.filePath.split(/[/\\]/).pop() : 'Current Document'}
                    </div>
                  </div>
                </div>

              </div>
            )}
          </div>

          {/* Content Display */}
          {viewMode === 'diff' ? (
            <div>
              {diffLoading && (
                <div className="flex items-center justify-center py-8">
                  <svg className="animate-spin w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="ml-2 text-gray-600 dark:text-gray-400">Loading changes...</span>
                </div>
              )}

              {!diffLoading && diff && hasDiffChanges(diff) && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <DiffStats diff={diff} showDetails={true} />
                    {/* View Mode Toggle */}
                    <div className="inline-flex items-center glass rounded-full p-0.5">
                      <button
                        onClick={() => setDiffViewMode('split')}
                        className={`px-3 py-1 text-xs rounded-full transition-all duration-200 font-medium ${
                          diffViewMode === 'split'
                            ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-sm'
                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                        }`}
                      >
                        Split
                      </button>
                      <button
                        onClick={() => setDiffViewMode('unified')}
                        className={`px-3 py-1 text-xs rounded-full transition-all duration-200 font-medium ${
                          diffViewMode === 'unified'
                            ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-sm'
                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                        }`}
                      >
                        Unified
                      </button>
                      <button
                        onClick={() => setDiffViewMode('inline')}
                        className={`px-3 py-1 text-xs rounded-full transition-all duration-200 font-medium ${
                          diffViewMode === 'inline'
                            ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-sm'
                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                        }`}
                      >
                        Inline
                      </button>
                    </div>
                  </div>
                  <DiffViewer
                    diff={diff}
                    viewMode={diffViewMode}
                    showLineNumbers={true}
                  />
                </div>
              )}

              {!diffLoading && diff && !hasDiffChanges(diff) && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <svg className="mx-auto w-8 h-8 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="font-medium">No changes detected</p>
                  <p className="text-sm">The current version is identical to the selected snapshot.</p>
                </div>
              )}
            </div>
          ) : (
            <ApprovalsAnnotator
              content={content}
              comments={comments}
              onCommentsChange={setComments}
              viewMode={viewMode}
              setViewMode={(mode: 'preview' | 'annotate') => setViewMode(mode)}
            />
          )}

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
      if ((a as any).categoryName) {
        cats.add((a as any).categoryName);
      }
    });
    return Array.from(cats);
  }, [approvals]);

  // Filter approvals based on selected category and status (only show pending)
  const filteredApprovals = useMemo(() => {
    let filtered = approvals.filter(a => a.status === 'pending');
    
    if (filterCategory !== 'all') {
      filtered = filtered.filter(a => (a as any).categoryName === filterCategory);
    }
    
    return filtered;
  }, [approvals, filterCategory]);

  // Calculate pending count for header display
  const pendingCount = useMemo(() => {
    return filteredApprovals.filter(a => a.status === 'pending').length;
  }, [filteredApprovals]);

  return (
    <div className="grid gap-4 max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="glass-card rounded-xl p-4 sm:p-6 md:p-8 max-w-full overflow-x-hidden">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/25">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white">{t('approvalsPage.header.title')}</h2>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('approvalsPage.header.subtitle')}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                pendingCount > 0
                  ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-amber-900 shadow-lg shadow-amber-500/30 animate-pulse'
                  : 'bg-gradient-to-r from-emerald-400 to-green-500 text-emerald-900 shadow-md shadow-green-500/25'
              }`}>
                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {pendingCount > 0 ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  )}
                </svg>
                {t('approvalsPage.pendingCount', { count: pendingCount })}
              </span>
            </div>
          </div>

          {/* Filter Pills */}
          {categories.length > 1 && (
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-200/50 dark:border-gray-700/50">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400 mr-2">{t('approvalsPage.filter.label')}</span>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                    filterCategory === cat
                      ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-md shadow-purple-500/25'
                      : 'bg-gray-100 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600/50'
                  }`}
                >
                  {cat === 'all' ? t('approvalsPage.filter.options.all') :
                   cat === 'steering' ? t('approvalsPage.filter.options.steering') :
                   cat}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Approvals List */}
      {filteredApprovals.length === 0 ? (
        <div className="glass-card rounded-xl p-6 sm:p-8 max-w-full overflow-x-hidden">
          <div className="text-center py-8 sm:py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center shadow-lg shadow-green-500/25">
              <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">{t('approvalsPage.empty.title')}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto">{t('approvalsPage.empty.description')}</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4 max-w-full overflow-x-hidden">
          {filteredApprovals.map((a) => (
            <ApprovalItem key={a.id} a={a} />
          ))}
        </div>
      )}
    </div>
  );
}

export function ApprovalsPage() {
  return <Content />;
}


