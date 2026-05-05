import React, { useEffect, useMemo, useState, useRef } from 'react';
import { useApi } from '../api/api';
import { useWs } from '../ws/WebSocketProvider';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ImplementationLogEntry } from '../../types';
import { SortDropdown } from '../components/SortDropdown';
import {
  GlobeAltIcon,
  CubeIcon,
  CodeBracketSquareIcon,
  CircleStackIcon,
  LinkIcon,
  ChevronRightIcon,
  ChevronDownIcon
} from '@heroicons/react/24/solid';
import { formatDate } from '../../lib/dateUtils';

// Helper functions for artifacts
function hasAnyArtifacts(artifacts: ImplementationLogEntry['artifacts']): boolean {
  if (!artifacts) return false;
  return !!(
    (artifacts.apiEndpoints && artifacts.apiEndpoints.length > 0) ||
    (artifacts.components && artifacts.components.length > 0) ||
    (artifacts.functions && artifacts.functions.length > 0) ||
    (artifacts.classes && artifacts.classes.length > 0) ||
    (artifacts.integrations && artifacts.integrations.length > 0)
  );
}

function getTotalArtifactCount(artifacts: ImplementationLogEntry['artifacts']): number {
  if (!artifacts) return 0;
  return (
    (artifacts.apiEndpoints?.length || 0) +
    (artifacts.components?.length || 0) +
    (artifacts.functions?.length || 0) +
    (artifacts.classes?.length || 0) +
    (artifacts.integrations?.length || 0)
  );
}

// Artifact Section Component
function ArtifactSection({
  title,
  icon: IconComponent,
  items,
  type,
  color
}: {
  title: string;
  icon: React.ComponentType<{ className: string }>;
  items: any[];
  type: 'api' | 'component' | 'function' | 'class' | 'integration';
  color: string;
}) {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);

  if (!items || items.length === 0) return null;

  const bgColor = {
    api: 'bg-blue-50 dark:bg-blue-900/20',
    component: 'bg-purple-50 dark:bg-purple-900/20',
    function: 'bg-green-50 dark:bg-green-900/20',
    class: 'bg-orange-50 dark:bg-orange-900/20',
    integration: 'bg-indigo-50 dark:bg-indigo-900/20'
  }[type];

  const textColor = {
    api: 'text-blue-700 dark:text-blue-300',
    component: 'text-purple-700 dark:text-purple-300',
    function: 'text-green-700 dark:text-green-300',
    class: 'text-orange-700 dark:text-orange-300',
    integration: 'text-indigo-700 dark:text-indigo-300'
  }[type];

  return (
    <div className={`rounded-lg p-3 ${bgColor}`}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between hover:opacity-80 transition-opacity"
      >
        <div className="flex items-center gap-2">
          <IconComponent className={`w-5 h-5 ${textColor}`} />
          <h5 className={`font-semibold text-sm ${textColor}`}>
            {title} ({items.length})
          </h5>
        </div>
        {isExpanded ? (
          <ChevronDownIcon className={`w-4 h-4 ${textColor}`} />
        ) : (
          <ChevronRightIcon className={`w-4 h-4 ${textColor}`} />
        )}
      </button>

      {isExpanded && (
        <div className="mt-3 space-y-2 pt-3 border-t border-[var(--border-default)]">
          {items.map((item, idx) => (
            <div key={idx} className="text-sm">
              {type === 'api' && (
                <div className="space-y-1">
                  <div className="font-mono text-xs">
                    <span className="font-bold text-blue-600 dark:text-blue-400">{item.method}</span> {item.path}
                  </div>
                  <div className="text-[var(--text-muted)]">{item.purpose}</div>
                  {item.requestFormat && (
                    <div className="text-xs text-[var(--text-faint)]">
                      {t('logsPage.artifacts.details.request')} {item.requestFormat}
                    </div>
                  )}
                  {item.responseFormat && (
                    <div className="text-xs text-[var(--text-faint)]">
                      {t('logsPage.artifacts.details.response')} {item.responseFormat}
                    </div>
                  )}
                  <div className="text-xs bg-[var(--surface-inset)] px-2 py-1 rounded-lg font-mono w-fit">
                    {item.location}
                  </div>
                </div>
              )}

              {type === 'component' && (
                <div className="space-y-1">
                  <div className="font-mono text-xs font-bold text-purple-600 dark:text-purple-400">
                    {item.name}
                  </div>
                  <div className="text-[var(--text-muted)] text-xs">{item.type}</div>
                  <div className="text-[var(--text-muted)]">{item.purpose}</div>
                  {item.props && (
                    <div className="text-xs text-[var(--text-faint)]">
                      {t('logsPage.artifacts.details.props')} {item.props}
                    </div>
                  )}
                  {item.exports && item.exports.length > 0 && (
                    <div className="text-xs text-[var(--text-faint)]">
                      {t('logsPage.artifacts.details.exports')} {item.exports.join(', ')}
                    </div>
                  )}
                  <div className="text-xs bg-[var(--surface-inset)] px-2 py-1 rounded-lg font-mono w-fit">
                    {item.location}
                  </div>
                </div>
              )}

              {type === 'function' && (
                <div className="space-y-1">
                  <div className="font-mono text-xs font-bold text-green-600 dark:text-green-400">
                    {item.name}
                  </div>
                  <div className="text-[var(--text-muted)]">{item.purpose}</div>
                  {item.signature && (
                    <div className="text-xs text-[var(--text-faint)] font-mono bg-[var(--surface-inset)] p-1 rounded-lg">
                      {item.signature}
                    </div>
                  )}
                  <div className="text-xs">
                    {item.isExported ? (
                      <span className="text-green-600 dark:text-green-400 font-semibold">{t('logsPage.artifacts.details.exported')}</span>
                    ) : (
                      <span className="text-[var(--text-muted)]">{t('logsPage.artifacts.details.private')}</span>
                    )}
                  </div>
                  <div className="text-xs bg-[var(--surface-inset)] px-2 py-1 rounded-lg font-mono w-fit">
                    {item.location}
                  </div>
                </div>
              )}

              {type === 'class' && (
                <div className="space-y-1">
                  <div className="font-mono text-xs font-bold text-orange-600 dark:text-orange-400">
                    {item.name}
                  </div>
                  <div className="text-[var(--text-muted)]">{item.purpose}</div>
                  {item.methods && item.methods.length > 0 && (
                    <div className="text-xs text-[var(--text-faint)]">
                      {t('logsPage.artifacts.details.methods')} {item.methods.join(', ')}
                    </div>
                  )}
                  <div className="text-xs">
                    {item.isExported ? (
                      <span className="text-green-600 dark:text-green-400 font-semibold">{t('logsPage.artifacts.details.exported')}</span>
                    ) : (
                      <span className="text-[var(--text-muted)]">{t('logsPage.artifacts.details.private')}</span>
                    )}
                  </div>
                  <div className="text-xs bg-[var(--surface-inset)] px-2 py-1 rounded-lg font-mono w-fit">
                    {item.location}
                  </div>
                </div>
              )}

              {type === 'integration' && (
                <div className="space-y-1">
                  <div className="text-[var(--text-muted)] font-medium">{item.description}</div>
                  <div className="text-xs text-[var(--text-faint)]">
                    {t('logsPage.artifacts.details.component')} {item.frontendComponent}
                  </div>
                  <div className="text-xs text-[var(--text-faint)]">
                    {t('logsPage.artifacts.details.endpoint')} {item.backendEndpoint}
                  </div>
                  <div className="text-xs text-[var(--text-muted)] bg-[var(--surface-inset)] p-1 rounded-lg">
                    {t('logsPage.artifacts.details.flow')} {item.dataFlow}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SearchableSpecDropdown({ specs, selected, onSelect }: { specs: any[]; selected: string; onSelect: (value: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  const filteredSpecs = useMemo(() => {
    if (!search.trim()) return specs;
    const searchLower = search.toLowerCase();
    return specs.filter(spec =>
      spec.displayName.toLowerCase().includes(searchLower) ||
      spec.name.toLowerCase().includes(searchLower)
    );
  }, [specs, search]);

  const selectedSpec = specs.find(s => s.name === selected);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (spec: any) => {
    onSelect(spec.name);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full sm:w-auto md:w-auto min-w-[200px] md:min-w-[240px] px-3 py-2 md:px-4 md:py-3 bg-[var(--surface-panel)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] hover:bg-[var(--surface-hover)] focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-[var(--accent-primary)] transition-colors"
      >
        <span className="truncate">
          {selectedSpec ? selectedSpec.displayName : t('logsPage.specDropdown.selectPlaceholder')}
        </span>
        <svg
          className={`w-4 h-4 ml-2 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full mt-1 w-full sm:w-80 md:w-96 bg-[var(--surface-panel)] border border-[var(--border-default)] rounded-lg shadow-lg z-50 max-h-96 overflow-hidden">
          <div className="p-3 md:p-4 border-b border-[var(--border-default)]">
            <input
              type="text"
              placeholder={t('logsPage.specDropdown.searchPlaceholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-[var(--surface-inset)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] placeholder-[var(--text-faint)] focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-[var(--accent-primary)]"
              autoFocus
            />
          </div>
          <div className="overflow-y-auto max-h-80">
            {filteredSpecs.map((spec) => (
              <button
                key={spec.name}
                onClick={() => handleSelect(spec)}
                className="w-full text-left px-4 py-3 hover:bg-[var(--surface-hover)] border-b border-[var(--border-subtle)] last:border-b-0 transition-colors"
              >
                <div className="font-medium text-[var(--text-primary)]">{spec.displayName}</div>
                <div className="text-sm text-[var(--text-muted)]">{spec.name}</div>
              </button>
            ))}
            {filteredSpecs.length === 0 && (
              <div className="px-4 py-8 text-center text-[var(--text-faint)]">
                {t('logsPage.specDropdown.noSpecsFound')}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

interface LogEntryProps {
  entry: ImplementationLogEntry;
}

function LogEntryCard({ entry }: LogEntryProps) {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-[var(--surface-panel)] border border-[var(--border-default)] rounded-lg mb-3">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-start justify-between p-4 hover:bg-[var(--surface-hover)] transition-colors"
      >
        <div className="flex-1 text-left">
          <div className="flex items-center gap-3">
            <span className="inline-block px-2 py-0.5 bg-[var(--status-info-muted)] text-[var(--status-info)] rounded-lg text-xs font-medium">
              {t('logsPage.taskBadge', 'Task')} {entry.taskId}
            </span>
            <span className="text-sm text-[var(--text-faint)] font-mono tabular-nums">
              {formatDate(entry.timestamp, { includeSeconds: true })}
            </span>
          </div>
          <p className="mt-2 text-[var(--text-primary)] font-medium">{entry.summary}</p>
        </div>
        <div className="ml-4 text-[var(--text-muted)] flex-shrink-0">
          {isExpanded ? (
            <ChevronDownIcon className="w-5 h-5" />
          ) : (
            <ChevronRightIcon className="w-5 h-5" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="border-t border-[var(--border-default)] p-4 space-y-4">
          {/* Code Statistics */}
          <div>
            <h4 className="text-sm font-semibold text-[var(--text-secondary)] mb-2">{t('logsPage.stats.title')}</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-[var(--status-success-muted)] rounded-lg p-2">
                <div className="text-xs text-[var(--text-muted)]">{t('logsPage.stats.linesAdded')}</div>
                <div className="text-lg font-semibold text-[var(--status-success)] font-mono tabular-nums">+{entry.statistics.linesAdded}</div>
              </div>
              <div className="bg-[var(--status-error-muted)] rounded-lg p-2">
                <div className="text-xs text-[var(--text-muted)]">{t('logsPage.stats.linesRemoved')}</div>
                <div className="text-lg font-semibold text-[var(--status-error)] font-mono tabular-nums">-{entry.statistics.linesRemoved}</div>
              </div>
              <div className="bg-[var(--status-info-muted)] rounded-lg p-2">
                <div className="text-xs text-[var(--text-muted)]">{t('logsPage.stats.filesChanged')}</div>
                <div className="text-lg font-semibold text-[var(--status-info)] font-mono tabular-nums">{entry.statistics.filesChanged}</div>
              </div>
              <div className="bg-[var(--accent-secondary-muted)] rounded-lg p-2">
                <div className="text-xs text-[var(--text-muted)]">{t('logsPage.stats.netChange')}</div>
                <div className="text-lg font-semibold text-[var(--accent-secondary)] font-mono tabular-nums">{entry.statistics.linesAdded - entry.statistics.linesRemoved}</div>
              </div>
            </div>
          </div>

          {/* Files Modified */}
          {entry.filesModified.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-[var(--text-secondary)] mb-2">{t('logsPage.files.modified')} ({entry.filesModified.length})</h4>
              <div className="space-y-1">
                {entry.filesModified.map((file, idx) => (
                  <div key={idx} className="text-sm text-[var(--text-muted)] flex items-center">
                    <span className="inline-block w-1.5 h-1.5 bg-[var(--status-info)] rounded-full mr-2"></span>
                    <code className="font-mono text-xs bg-[var(--surface-inset)] px-2 py-1 rounded-lg">
                      {file}
                    </code>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Files Created */}
          {entry.filesCreated.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-[var(--text-secondary)] mb-2">{t('logsPage.files.created')} ({entry.filesCreated.length})</h4>
              <div className="space-y-1">
                {entry.filesCreated.map((file, idx) => (
                  <div key={idx} className="text-sm text-[var(--text-muted)] flex items-center">
                    <span className="inline-block w-1.5 h-1.5 bg-[var(--status-success)] rounded-full mr-2"></span>
                    <code className="font-mono text-xs bg-[var(--surface-inset)] px-2 py-1 rounded-lg">
                      {file}
                    </code>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Artifacts */}
          {hasAnyArtifacts(entry.artifacts) && (
            <div>
              <h4 className="text-sm font-semibold text-[var(--text-secondary)] mb-3">
                {t('logsPage.artifacts.title')} ({getTotalArtifactCount(entry.artifacts)})
              </h4>
              <div className="space-y-2">
                {entry.artifacts.apiEndpoints && entry.artifacts.apiEndpoints.length > 0 && (
                  <ArtifactSection
                    title={t('logsPage.artifacts.apiEndpoints')}
                    icon={GlobeAltIcon}
                    items={entry.artifacts.apiEndpoints}
                    type="api"
                    color="blue"
                  />
                )}

                {entry.artifacts.components && entry.artifacts.components.length > 0 && (
                  <ArtifactSection
                    title={t('logsPage.artifacts.components')}
                    icon={CubeIcon}
                    items={entry.artifacts.components}
                    type="component"
                    color="purple"
                  />
                )}

                {entry.artifacts.functions && entry.artifacts.functions.length > 0 && (
                  <ArtifactSection
                    title={t('logsPage.artifacts.functions')}
                    icon={CodeBracketSquareIcon}
                    items={entry.artifacts.functions}
                    type="function"
                    color="green"
                  />
                )}

                {entry.artifacts.classes && entry.artifacts.classes.length > 0 && (
                  <ArtifactSection
                    title={t('logsPage.artifacts.classes')}
                    icon={CircleStackIcon}
                    items={entry.artifacts.classes}
                    type="class"
                    color="orange"
                  />
                )}

                {entry.artifacts.integrations && entry.artifacts.integrations.length > 0 && (
                  <ArtifactSection
                    title={t('logsPage.artifacts.integrations')}
                    icon={LinkIcon}
                    items={entry.artifacts.integrations}
                    type="integration"
                    color="indigo"
                  />
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function LogsPage() {
  const api = useApi();
  const { subscribe, unsubscribe } = useWs();
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

  const [selectedSpec, setSelectedSpec] = useState<string>(searchParams.get('spec') || '');
  const [search, setSearch] = useState<string>(searchParams.get('search') || '');
  const [taskFilter, setTaskFilter] = useState<string>(searchParams.get('task') || '');
  const [sortBy, setSortBy] = useState<string>(searchParams.get('sort') || 'timestamp');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>((searchParams.get('order') as 'asc' | 'desc') || 'desc');
  const [logs, setLogs] = useState<ImplementationLogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const specs = api.specs;

  // Create storage key for per-spec sort preferences
  const storageKey = useMemo(() =>
    selectedSpec ? `spec-workflow:logs-preferences:${selectedSpec}` : null,
    [selectedSpec]
  );

  // Load sort preferences from localStorage when spec changes
  useEffect(() => {
    if (!storageKey) return;

    try {
      const savedPreferences = localStorage.getItem(storageKey);
      if (savedPreferences) {
        const { sortBy: savedSortBy, sortOrder: savedSortOrder } = JSON.parse(savedPreferences);
        if (savedSortBy) setSortBy(savedSortBy);
        if (savedSortOrder) setSortOrder(savedSortOrder);
      }
    } catch (error) {
      console.warn('Failed to load logs preferences from localStorage:', error);
    }
  }, [storageKey]);

  // Save sort preferences to localStorage
  useEffect(() => {
    if (!storageKey) return;

    try {
      const preferences = { sortBy, sortOrder };
      localStorage.setItem(storageKey, JSON.stringify(preferences));
    } catch (error) {
      console.warn('Failed to save logs preferences to localStorage:', error);
    }
  }, [storageKey, sortBy, sortOrder]);

  // Load logs when spec changes
  useEffect(() => {
    if (!selectedSpec) {
      setLogs([]);
      return;
    }

    setLoading(true);
    setError('');

    api.getImplementationLogs(selectedSpec, {
      taskId: taskFilter || undefined,
      search: search || undefined
    }).then(result => {
      setLogs(result.entries || []);
    }).catch(err => {
      setError('Failed to load implementation logs');
      console.error(err);
    }).finally(() => {
      setLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSpec, search, taskFilter]);

  const handleSortChange = (sort: string, order: string) => {
    setSortBy(sort);
    setSortOrder(order as 'asc' | 'desc');
  };

  // Subscribe to log updates
  useEffect(() => {
    if (!selectedSpec) return;

    const handleLogUpdate = (data: any) => {
      if (data.specName === selectedSpec) {
        setLogs(data.entries || []);
      }
    };

    subscribe('implementation-log-update', handleLogUpdate);

    return () => {
      unsubscribe('implementation-log-update', handleLogUpdate);
    };
  }, [selectedSpec, subscribe, unsubscribe]);

  // Sync URL parameters
  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedSpec) params.set('spec', selectedSpec);
    if (search) params.set('search', search);
    if (taskFilter) params.set('task', taskFilter);
    if (sortBy !== 'timestamp') params.set('sort', sortBy);
    if (sortOrder !== 'desc') params.set('order', sortOrder);

    if (params.toString()) {
      setSearchParams(params);
    } else {
      setSearchParams({});
    }
  }, [selectedSpec, search, taskFilter, sortBy, sortOrder, setSearchParams]);

  const filteredAndSortedLogs = useMemo(() => {
    let result = logs;

    if (taskFilter) {
      result = result.filter(log => log.taskId === taskFilter);
    }

    // Apply sorting
    result = [...result].sort((a, b) => {
      let compareValue = 0;

      switch (sortBy) {
        case 'timestamp':
          compareValue = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
          break;
        case 'taskId': {
          // Parse task IDs for proper numeric sorting (handles "1", "2.1", "10")
          const parseTaskId = (id: string) => id.split('.').map(p => parseInt(p, 10) || 0);
          const aIdParts = parseTaskId(a.taskId);
          const bIdParts = parseTaskId(b.taskId);
          for (let i = 0; i < Math.max(aIdParts.length, bIdParts.length); i++) {
            const diff = (aIdParts[i] || 0) - (bIdParts[i] || 0);
            if (diff !== 0) {
              compareValue = diff;
              break;
            }
          }
          break;
        }
        case 'linesAdded':
          compareValue = a.statistics.linesAdded - b.statistics.linesAdded;
          break;
        case 'filesChanged':
          compareValue = a.statistics.filesChanged - b.statistics.filesChanged;
          break;
        default:
          compareValue = 0;
      }

      return sortOrder === 'asc' ? compareValue : -compareValue;
    });

    return result;
  }, [logs, taskFilter, sortBy, sortOrder]);

  const uniqueTasks = useMemo(() => {
    return Array.from(new Set(logs.map(log => log.taskId))).sort();
  }, [logs]);

  const stats = useMemo(() => {
    return {
      totalEntries: logs.length,
      totalLinesAdded: logs.reduce((sum, log) => sum + (log.statistics?.linesAdded || 0), 0),
      totalLinesRemoved: logs.reduce((sum, log) => sum + (log.statistics?.linesRemoved || 0), 0),
      totalFiles: new Set(logs.flatMap(log => [
        ...(log.filesModified || []),
        ...(log.filesCreated || [])
      ])).size
    };
  }, [logs]);

  const logSortOptions = [
    {
      id: 'timestamp',
      label: t('logsPage.sort.timestamp'),
      description: t('logsPage.sort.timestampDesc'),
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      id: 'taskId',
      label: t('logsPage.sort.taskId'),
      description: t('logsPage.sort.taskIdDesc'),
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
        </svg>
      )
    },
    {
      id: 'linesAdded',
      label: t('logsPage.sort.linesAdded'),
      description: t('logsPage.sort.linesAddedDesc'),
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
        </svg>
      )
    },
    {
      id: 'filesChanged',
      label: t('logsPage.sort.filesChanged'),
      description: t('logsPage.sort.filesChangedDesc'),
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    }
  ];

  return (
    <div className="w-full h-full flex flex-col bg-[var(--surface-page)]">
      {/* Header */}
      <div className="bg-[var(--surface-panel)] border-b border-[var(--border-default)] p-4 md:p-6">
        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-6">{t('logsPage.header.title')}</h1>

        {/* Controls */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <SearchableSpecDropdown
              specs={specs}
              selected={selectedSpec}
              onSelect={setSelectedSpec}
            />
            <input
              type="text"
              placeholder={t('logsPage.search.placeholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 px-4 py-2 bg-[var(--surface-inset)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] placeholder-[var(--text-faint)] focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-[var(--accent-primary)]"
            />
            <SortDropdown
              currentSort={sortBy}
              currentOrder={sortOrder}
              onSortChange={handleSortChange}
              sortOptions={logSortOptions}
              align="right"
            />
          </div>

          {/* Task Filter */}
          {uniqueTasks.length > 0 && (
            <div>
              <label className="text-sm font-medium text-[var(--text-secondary)] block mb-2">
                {t('logsPage.filter.label')}
              </label>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setTaskFilter('')}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    !taskFilter
                      ? 'bg-[var(--accent-primary)] text-white'
                      : 'bg-[var(--surface-inset)] text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]'
                  }`}
                >
                  {t('logsPage.filter.all')} ({logs.length})
                </button>
                {uniqueTasks.map(taskId => {
                  const count = logs.filter(log => log.taskId === taskId).length;
                  return (
                    <button
                      key={taskId}
                      onClick={() => setTaskFilter(taskId)}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                        taskFilter === taskId
                          ? 'bg-[var(--accent-primary)] text-white'
                          : 'bg-[var(--surface-inset)] text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]'
                      }`}
                    >
                      {t('logsPage.filter.taskPrefix')} {taskId} ({count})
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      {selectedSpec && logs.length > 0 && (
        <div className="bg-[var(--surface-panel)] border-b border-[var(--border-default)] px-4 md:px-6 py-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-[var(--status-info-muted)] rounded-lg p-3">
              <div className="text-xs text-[var(--text-muted)] font-medium">{t('logsPage.stats.totalEntries')}</div>
              <div className="text-2xl font-bold text-[var(--status-info)] font-mono tabular-nums">{stats.totalEntries}</div>
            </div>
            <div className="bg-[var(--status-success-muted)] rounded-lg p-3">
              <div className="text-xs text-[var(--text-muted)] font-medium">{t('logsPage.stats.linesAdded')}</div>
              <div className="text-2xl font-bold text-[var(--status-success)] font-mono tabular-nums">+{stats.totalLinesAdded}</div>
            </div>
            <div className="bg-[var(--status-error-muted)] rounded-lg p-3">
              <div className="text-xs text-[var(--text-muted)] font-medium">{t('logsPage.stats.linesRemoved')}</div>
              <div className="text-2xl font-bold text-[var(--status-error)] font-mono tabular-nums">-{stats.totalLinesRemoved}</div>
            </div>
            <div className="bg-[var(--accent-secondary-muted)] rounded-lg p-3">
              <div className="text-xs text-[var(--text-muted)] font-medium">{t('logsPage.stats.filesChanged')}</div>
              <div className="text-2xl font-bold text-[var(--accent-secondary)] font-mono tabular-nums">{stats.totalFiles}</div>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        {!selectedSpec ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-[var(--text-muted)]">{t('logsPage.empty.selectSpec')}</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-[var(--status-error-muted)] border border-[var(--status-error)] rounded-lg p-4">
            <p className="text-[var(--status-error)]">{error}</p>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-[var(--text-muted)]">{t('logsPage.loading')}</div>
          </div>
        ) : filteredAndSortedLogs.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-[var(--text-muted)]">
                {search || taskFilter
                  ? t('logsPage.empty.noResults')
                  : t('logsPage.empty.noLogs')}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredAndSortedLogs.map((entry) => (
              <LogEntryCard key={entry.id} entry={entry} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
