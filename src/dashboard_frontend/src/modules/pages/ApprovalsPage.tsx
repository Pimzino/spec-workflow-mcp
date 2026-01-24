import React, { useEffect, useMemo, useState } from 'react';
import { useApi, DocumentSnapshot, DiffResult } from '../api/api';
import { ApprovalsAnnotator, ApprovalComment, ViewMode } from '../approvals/ApprovalsAnnotator';
import { NotificationProvider } from '../notifications/NotificationProvider';
import { TextInputModal } from '../modals/TextInputModal';
import { AlertModal } from '../modals/AlertModal';
import { DiffViewer } from '../diff/DiffViewer';
import { DiffStats, DiffStatsBadge } from '../diff/DiffStats';
import { formatSnapshotTimestamp, createVersionLabel, hasDiffChanges, getSnapshotTriggerDescription } from '../diff/utils';
import { useTranslation } from 'react-i18next';
import { formatDate } from '../../lib/dateUtils';


function ApprovalItem({ a }: { a: any }) {
  const { approvalsAction, getApprovalContent, getApprovalSnapshots, getApprovalDiff } = useApi();
  const { t } = useTranslation();
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<ViewMode | 'diff'>('annotate');
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
    <div className="bg-[var(--surface-panel)] border border-[var(--border-default)] shadow rounded-lg transition-colors overflow-hidden max-w-full">
      <div className="p-3 sm:p-4 md:p-6 lg:p-8 min-w-0 max-w-full overflow-x-hidden">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="text-base sm:text-lg md:text-xl font-medium text-[var(--text-primary)] mb-2 truncate">
              {a.title}
            </h3>

            {/* File Path */}
            {a.filePath && (
              <div className="text-sm text-[var(--text-muted)] mb-2 flex items-center gap-1 min-w-0 max-w-full">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="truncate text-xs break-all min-w-0">{a.filePath}</span>
              </div>
            )}

            {/* Approval Status */}
            <div className="flex flex-wrap items-center gap-3 text-sm mb-3">
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                a.status === 'pending'
                  ? 'bg-[var(--status-warning-muted)] text-[var(--status-warning)]'
                  : a.status === 'needs-revision'
                  ? 'bg-[var(--status-warning-muted)] text-[var(--status-warning)]'
                  : a.status === 'approved'
                  ? 'bg-[var(--status-success-muted)] text-[var(--status-success)]'
                  : 'bg-[var(--status-error-muted)] text-[var(--status-error)]'
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

              <span className="text-[var(--text-faint)] flex items-center gap-1 font-mono tabular-nums">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4m-6 0h6M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V9a2 2 0 00-2-2h-2" />
                </svg>
                {formatDate(a.createdAt, { fallbackKey: 'common.unknown', fallbackText: 'Unknown' }, t)}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 min-w-0">
              <button
                onClick={() => setOpen(!open)}
                className="btn text-xs sm:text-sm flex items-center gap-1 min-w-0 touch-manipulation"
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
                className="btn bg-green-600 hover:bg-green-700 focus:ring-green-500 text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 min-w-0 touch-manipulation"
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
                className="btn bg-red-600 hover:bg-red-700 focus:ring-red-500 text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 min-w-0 touch-manipulation"
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
                  className="btn bg-orange-600 hover:bg-orange-700 focus:ring-orange-500 text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 min-w-0 touch-manipulation"
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
        <div className="border-t border-[var(--border-default)] p-2 sm:p-3 md:p-4 lg:p-6 min-w-0 max-w-full overflow-x-hidden relative">

          {/* View Controls */}
          <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* View Mode Tabs */}
            <div className="space-y-2">
              <div className="flex items-center bg-[var(--surface-panel)] rounded-lg p-1 shadow-sm border border-[var(--border-default)]">
              <button
                onClick={() => setViewMode('preview')}
                className={`flex-1 px-3 py-1.5 text-sm rounded-md transition-colors flex items-center justify-center gap-1 ${
                  viewMode === 'preview'
                    ? 'bg-[var(--accent-primary)] text-white'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
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
                className={`flex-1 px-3 py-1.5 text-sm rounded-md transition-colors flex items-center justify-center gap-1 ${
                  viewMode === 'annotate'
                    ? 'bg-[var(--accent-primary)] text-white'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span className="hidden sm:inline">Annotate</span>
              </button>
              <button
                onClick={() => setViewMode('side-by-side')}
                className={`flex-1 px-3 py-1.5 text-sm rounded-md transition-colors flex items-center justify-center gap-1 ${
                  viewMode === 'side-by-side'
                    ? 'bg-[var(--accent-primary)] text-white'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
                title={t('approvals.annotator.sideBySide.tooltip')}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                </svg>
                <span className="hidden sm:inline">{t('approvals.annotator.sideBySide.buttonLabel')}</span>
              </button>
              {snapshots.length > 0 && (
                <button
                  onClick={() => setViewMode('diff')}
                  className={`flex-1 px-3 py-1.5 text-sm rounded-md transition-colors flex items-center justify-center gap-1 ${
                    viewMode === 'diff'
                      ? 'bg-[var(--accent-primary)] text-white'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
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
                    <label className="text-sm font-medium text-[var(--text-secondary)] whitespace-nowrap">From:</label>
                    <select
                      value={selectedSnapshotVersion}
                      onChange={(e) => setSelectedSnapshotVersion(parseInt(e.target.value, 10))}
                      className="block w-full sm:w-auto max-w-full rounded-lg border-[var(--border-default)] bg-[var(--surface-panel)] text-sm focus:border-[var(--accent-primary)] focus:ring-[var(--accent-primary)]"
                    >
                      {snapshots.map((snapshot) => (
                        <option key={snapshot.version} value={snapshot.version}>
                          v{snapshot.version} - {snapshot.approvalTitle} - {getSnapshotTriggerDescription(snapshot.trigger)} ({formatSnapshotTimestamp(snapshot.timestamp)})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 min-w-0 w-full sm:w-auto">
                    <label className="text-sm font-medium text-[var(--text-secondary)] whitespace-nowrap">To:</label>
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
                  <span className="ml-2 text-[var(--text-muted)]">Loading changes...</span>
                </div>
              )}

              {!diffLoading && diff && hasDiffChanges(diff) && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <DiffStats diff={diff} showDetails={true} />
                    {/* View Mode Toggle */}
                    <div className="flex items-center bg-[var(--surface-inset)] rounded-lg p-0.5">
                      <button
                        onClick={() => setDiffViewMode('split')}
                        className={`px-2 py-1 text-xs rounded-md transition-colors ${
                          diffViewMode === 'split'
                            ? 'bg-[var(--surface-panel)] text-[var(--text-primary)] shadow-sm'
                            : 'text-[var(--text-muted)]'
                        }`}
                      >
                        Split
                      </button>
                      <button
                        onClick={() => setDiffViewMode('unified')}
                        className={`px-2 py-1 text-xs rounded-md transition-colors ${
                          diffViewMode === 'unified'
                            ? 'bg-[var(--surface-panel)] text-[var(--text-primary)] shadow-sm'
                            : 'text-[var(--text-muted)]'
                        }`}
                      >
                        Unified
                      </button>
                      <button
                        onClick={() => setDiffViewMode('inline')}
                        className={`px-2 py-1 text-xs rounded-md transition-colors ${
                          diffViewMode === 'inline'
                            ? 'bg-[var(--surface-panel)] text-[var(--text-primary)] shadow-sm'
                            : 'text-[var(--text-muted)]'
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
                <div className="text-center py-8 text-[var(--text-muted)]">
                  <svg className="mx-auto w-8 h-8 text-[var(--text-faint)] mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
              viewMode={viewMode as ViewMode}
              setViewMode={(mode: ViewMode) => setViewMode(mode)}
            />
          )}

          {/* Navigation FABs - show on mobile and tablet (hide only on desktop lg+) */}
          {(viewMode === 'annotate' || viewMode === 'side-by-side') && (
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
      <div className="bg-[var(--surface-panel)] border border-[var(--border-default)] shadow rounded-lg p-3 sm:p-4 md:p-6 lg:p-8 max-w-full overflow-x-hidden">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-[var(--text-primary)]">{t('approvalsPage.header.title')}</h2>
              <p className="text-sm text-[var(--text-muted)] mt-1">
                {t('approvalsPage.header.subtitle')}
              </p>
            </div>
            <div className="flex items-center gap-3 text-sm text-[var(--text-muted)]">
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                pendingCount > 0
                  ? 'bg-[var(--status-warning-muted)] text-[var(--status-warning)]'
                  : 'bg-[var(--status-success-muted)] text-[var(--status-success)]'
              }`}>
                {t('approvalsPage.pendingCount', { count: pendingCount })}
              </span>
            </div>
          </div>

          {/* Filter Dropdown */}
          {categories.length > 1 && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3 overflow-x-hidden">
              <label className="text-sm font-medium text-[var(--text-secondary)] whitespace-nowrap">{t('approvalsPage.filter.label')}</label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="block w-full sm:w-auto max-w-full rounded-lg border-[var(--border-default)] bg-[var(--surface-panel)] text-sm focus:border-[var(--accent-primary)] focus:ring-[var(--accent-primary)]"
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
          )}
        </div>
      </div>

      {/* Approvals List */}
      {filteredApprovals.length === 0 ? (
        <div className="bg-[var(--surface-panel)] border border-[var(--border-default)] shadow rounded-lg p-3 sm:p-4 md:p-6 max-w-full overflow-x-hidden">
          <div className="text-center py-8 sm:py-12 text-[var(--text-muted)]">
            <svg className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-[var(--text-faint)] mb-3 sm:mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-base sm:text-lg font-medium text-[var(--text-primary)] mb-1 sm:mb-2">{t('approvalsPage.empty.title')}</p>
            <p className="text-sm text-[var(--text-muted)] max-w-sm mx-auto">{t('approvalsPage.empty.description')}</p>
          </div>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4 max-w-full overflow-x-hidden">
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


