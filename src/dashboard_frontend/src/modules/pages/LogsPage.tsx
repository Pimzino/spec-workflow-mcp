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
  ChevronDownIcon,
  CalendarDaysIcon,
  DocumentTextIcon,
  MagnifyingGlassIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/solid';

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

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

// Artifact Section Component with gradient pills
function ArtifactSection({
  title,
  icon: IconComponent,
  items,
  type
}: {
  title: string;
  icon: React.ComponentType<{ className: string }>;
  items: any[];
  type: 'api' | 'component' | 'function' | 'class' | 'integration';
}) {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);

  if (!items || items.length === 0) return null;

  const gradientStyles = {
    api: 'from-blue-500 to-cyan-400',
    component: 'from-purple-500 to-pink-400',
    function: 'from-green-500 to-emerald-400',
    class: 'from-orange-500 to-amber-400',
    integration: 'from-pink-500 to-rose-400'
  }[type];

  const bgStyles = {
    api: 'bg-blue-500/10 dark:bg-blue-500/20',
    component: 'bg-purple-500/10 dark:bg-purple-500/20',
    function: 'bg-green-500/10 dark:bg-green-500/20',
    class: 'bg-orange-500/10 dark:bg-orange-500/20',
    integration: 'bg-pink-500/10 dark:bg-pink-500/20'
  }[type];

  const textColor = {
    api: 'text-blue-600 dark:text-blue-400',
    component: 'text-purple-600 dark:text-purple-400',
    function: 'text-green-600 dark:text-green-400',
    class: 'text-orange-600 dark:text-orange-400',
    integration: 'text-pink-600 dark:text-pink-400'
  }[type];

  return (
    <div className="overflow-hidden rounded-xl">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full flex items-center justify-between p-3 transition-all duration-200 ${bgStyles} ${isExpanded ? 'rounded-t-xl' : 'rounded-xl'} hover:opacity-90`}
      >
        <div className="flex items-center gap-3">
          {/* Gradient pill with icon */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r ${gradientStyles} text-white shadow-md`}>
            <IconComponent className="w-4 h-4" />
            <span className="font-semibold text-sm">{title}</span>
          </div>
          {/* Count badge */}
          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${bgStyles} ${textColor}`}>
            {items.length}
          </span>
        </div>
        <div className={`transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`}>
          <ChevronRightIcon className={`w-5 h-5 ${textColor}`} />
        </div>
      </button>

      {/* Expandable content with animation */}
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className={`p-4 space-y-3 ${bgStyles} border-t border-white/10`}>
          {items.map((item, idx) => (
            <div
              key={idx}
              className="p-3 rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-white/5 dark:border-white/5 hover:bg-white/10 dark:hover:bg-black/30 transition-colors"
            >
              {type === 'api' && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-blue-500/20 text-blue-400 font-mono">
                      {item.method}
                    </span>
                    <code className="text-sm text-gray-300 font-mono">{item.path}</code>
                  </div>
                  <p className="text-sm text-gray-400">{item.purpose}</p>
                  {item.requestFormat && (
                    <div className="text-xs text-gray-500">
                      <span className="text-gray-600 dark:text-gray-500">{t('logsPage.artifacts.details.request')}</span> {item.requestFormat}
                    </div>
                  )}
                  {item.responseFormat && (
                    <div className="text-xs text-gray-500">
                      <span className="text-gray-600 dark:text-gray-500">{t('logsPage.artifacts.details.response')}</span> {item.responseFormat}
                    </div>
                  )}
                  <code className="inline-block text-xs bg-black/30 px-2 py-1 rounded font-mono text-gray-400">
                    {item.location}
                  </code>
                </div>
              )}

              {type === 'component' && (
                <div className="space-y-2">
                  <code className="text-sm font-bold text-purple-400 font-mono">{item.name}</code>
                  <div className="text-xs text-gray-500">{item.type}</div>
                  <p className="text-sm text-gray-400">{item.purpose}</p>
                  {item.props && (
                    <div className="text-xs text-gray-500">
                      <span className="text-gray-600 dark:text-gray-500">{t('logsPage.artifacts.details.props')}</span> {item.props}
                    </div>
                  )}
                  {item.exports && item.exports.length > 0 && (
                    <div className="text-xs text-gray-500">
                      <span className="text-gray-600 dark:text-gray-500">{t('logsPage.artifacts.details.exports')}</span> {item.exports.join(', ')}
                    </div>
                  )}
                  <code className="inline-block text-xs bg-black/30 px-2 py-1 rounded font-mono text-gray-400">
                    {item.location}
                  </code>
                </div>
              )}

              {type === 'function' && (
                <div className="space-y-2">
                  <code className="text-sm font-bold text-green-400 font-mono">{item.name}</code>
                  <p className="text-sm text-gray-400">{item.purpose}</p>
                  {item.signature && (
                    <code className="block text-xs text-gray-500 font-mono bg-black/30 p-2 rounded overflow-x-auto">
                      {item.signature}
                    </code>
                  )}
                  <div className="text-xs">
                    {item.isExported ? (
                      <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 font-semibold">{t('logsPage.artifacts.details.exported')}</span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-gray-500/20 text-gray-400">{t('logsPage.artifacts.details.private')}</span>
                    )}
                  </div>
                  <code className="inline-block text-xs bg-black/30 px-2 py-1 rounded font-mono text-gray-400">
                    {item.location}
                  </code>
                </div>
              )}

              {type === 'class' && (
                <div className="space-y-2">
                  <code className="text-sm font-bold text-orange-400 font-mono">{item.name}</code>
                  <p className="text-sm text-gray-400">{item.purpose}</p>
                  {item.methods && item.methods.length > 0 && (
                    <div className="text-xs text-gray-500">
                      <span className="text-gray-600 dark:text-gray-500">{t('logsPage.artifacts.details.methods')}</span> {item.methods.join(', ')}
                    </div>
                  )}
                  <div className="text-xs">
                    {item.isExported ? (
                      <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 font-semibold">{t('logsPage.artifacts.details.exported')}</span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-gray-500/20 text-gray-400">{t('logsPage.artifacts.details.private')}</span>
                    )}
                  </div>
                  <code className="inline-block text-xs bg-black/30 px-2 py-1 rounded font-mono text-gray-400">
                    {item.location}
                  </code>
                </div>
              )}

              {type === 'integration' && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-300">{item.description}</p>
                  <div className="text-xs text-gray-500">
                    <span className="text-gray-600 dark:text-gray-500">{t('logsPage.artifacts.details.component')}</span> {item.frontendComponent}
                  </div>
                  <div className="text-xs text-gray-500">
                    <span className="text-gray-600 dark:text-gray-500">{t('logsPage.artifacts.details.endpoint')}</span> {item.backendEndpoint}
                  </div>
                  <div className="text-xs bg-black/30 p-2 rounded text-gray-400">
                    <span className="text-gray-500">{t('logsPage.artifacts.details.flow')}</span> {item.dataFlow}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
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
        className="flex items-center justify-between w-full sm:w-auto md:w-auto min-w-[200px] md:min-w-[240px] px-4 py-2.5 glass-card hover:border-purple-500/30 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-200"
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg gradient-icon-blue flex items-center justify-center">
            <DocumentTextIcon className="w-4 h-4 text-white" />
          </div>
          <span className="text-gray-900 dark:text-white font-medium truncate">
            {selectedSpec ? selectedSpec.displayName : t('logsPage.specDropdown.selectPlaceholder')}
          </span>
        </div>
        <svg
          className={`w-4 h-4 ml-2 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 w-full sm:w-80 md:w-96 glass-card overflow-hidden z-50 shadow-2xl">
          <div className="p-3 border-b border-white/10 dark:border-gray-700/50">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder={t('logsPage.specDropdown.searchPlaceholder')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                autoFocus
              />
            </div>
          </div>
          <div className="overflow-y-auto max-h-80">
            {filteredSpecs.map((spec) => (
              <button
                key={spec.name}
                onClick={() => handleSelect(spec)}
                className="w-full text-left px-4 py-3 hover:bg-purple-500/10 border-b border-white/5 dark:border-gray-700/30 last:border-b-0 transition-all duration-200 group"
              >
                <div className="font-medium text-gray-900 dark:text-white group-hover:text-purple-400 transition-colors">{spec.displayName}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400 font-mono">{spec.name}</div>
              </button>
            ))}
            {filteredSpecs.length === 0 && (
              <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
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
    <div className={`glass-card overflow-hidden transition-all duration-300 ${isExpanded ? 'ring-1 ring-purple-500/30' : ''}`}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full flex items-start justify-between p-4 md:p-5 transition-all duration-200 ${isExpanded ? 'bg-purple-500/5' : 'hover:bg-white/5 dark:hover:bg-white/5'}`}
      >
        <div className="flex-1 text-left">
          <div className="flex flex-wrap items-center gap-3">
            {/* Task badge with gradient */}
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-blue-500 to-cyan-400 text-white shadow-md">
              {t('logsPage.taskBadge', 'Task')} {entry.taskId}
            </span>
            {/* Timestamp with calendar icon */}
            <span className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
              <CalendarDaysIcon className="w-4 h-4" />
              {formatDate(entry.timestamp)}
            </span>
          </div>
          <p className="mt-3 text-gray-900 dark:text-white font-semibold text-lg">{entry.summary}</p>
        </div>
        <div className={`ml-4 p-2 rounded-lg transition-all duration-300 ${isExpanded ? 'bg-purple-500/20 rotate-90' : 'bg-white/5 dark:bg-white/5'}`}>
          <ChevronRightIcon className={`w-5 h-5 transition-colors ${isExpanded ? 'text-purple-400' : 'text-gray-500 dark:text-gray-400'}`} />
        </div>
      </button>

      {/* Expandable content with animation */}
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="border-t border-white/10 dark:border-gray-700/50 p-4 md:p-5 space-y-5">
          {/* Code Statistics */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
              {t('logsPage.stats.title')}
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-green-500/10 dark:bg-green-500/20 border border-green-500/20">
                <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">{t('logsPage.stats.linesAdded')}</div>
                <div className="text-xl font-bold text-green-500">+{entry.statistics.linesAdded}</div>
              </div>
              <div className="p-3 rounded-xl bg-red-500/10 dark:bg-red-500/20 border border-red-500/20">
                <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">{t('logsPage.stats.linesRemoved')}</div>
                <div className="text-xl font-bold text-red-500">-{entry.statistics.linesRemoved}</div>
              </div>
              <div className="p-3 rounded-xl bg-blue-500/10 dark:bg-blue-500/20 border border-blue-500/20">
                <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">{t('logsPage.stats.filesChanged')}</div>
                <div className="text-xl font-bold text-blue-500">{entry.statistics.filesChanged}</div>
              </div>
              <div className="p-3 rounded-xl bg-purple-500/10 dark:bg-purple-500/20 border border-purple-500/20">
                <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">{t('logsPage.stats.netChange')}</div>
                <div className="text-xl font-bold text-purple-500">{entry.statistics.linesAdded - entry.statistics.linesRemoved}</div>
              </div>
            </div>
          </div>

          {/* Files Modified */}
          {entry.filesModified.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                {t('logsPage.files.modified')} ({entry.filesModified.length})
              </h4>
              <div className="space-y-1.5">
                {entry.filesModified.map((file, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm hover:bg-blue-500/10 transition-colors group">
                    <span className="w-2 h-2 rounded-full bg-blue-500 group-hover:ring-2 group-hover:ring-blue-500/30 transition-all"></span>
                    <code className="text-sm font-mono text-gray-600 dark:text-gray-300 group-hover:text-blue-400 transition-colors">
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
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                {t('logsPage.files.created')} ({entry.filesCreated.length})
              </h4>
              <div className="space-y-1.5">
                {entry.filesCreated.map((file, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm hover:bg-green-500/10 transition-colors group">
                    <span className="w-2 h-2 rounded-full bg-green-500 group-hover:ring-2 group-hover:ring-green-500/30 transition-all"></span>
                    <code className="text-sm font-mono text-gray-600 dark:text-gray-300 group-hover:text-green-400 transition-colors">
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
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                {t('logsPage.artifacts.title')} ({getTotalArtifactCount(entry.artifacts)})
              </h4>
              <div className="space-y-3">
                {entry.artifacts.apiEndpoints && entry.artifacts.apiEndpoints.length > 0 && (
                  <ArtifactSection
                    title={t('logsPage.artifacts.apiEndpoints')}
                    icon={GlobeAltIcon}
                    items={entry.artifacts.apiEndpoints}
                    type="api"
                  />
                )}

                {entry.artifacts.components && entry.artifacts.components.length > 0 && (
                  <ArtifactSection
                    title={t('logsPage.artifacts.components')}
                    icon={CubeIcon}
                    items={entry.artifacts.components}
                    type="component"
                  />
                )}

                {entry.artifacts.functions && entry.artifacts.functions.length > 0 && (
                  <ArtifactSection
                    title={t('logsPage.artifacts.functions')}
                    icon={CodeBracketSquareIcon}
                    items={entry.artifacts.functions}
                    type="function"
                  />
                )}

                {entry.artifacts.classes && entry.artifacts.classes.length > 0 && (
                  <ArtifactSection
                    title={t('logsPage.artifacts.classes')}
                    icon={CircleStackIcon}
                    items={entry.artifacts.classes}
                    type="class"
                  />
                )}

                {entry.artifacts.integrations && entry.artifacts.integrations.length > 0 && (
                  <ArtifactSection
                    title={t('logsPage.artifacts.integrations')}
                    icon={LinkIcon}
                    items={entry.artifacts.integrations}
                    type="integration"
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </div>
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
    <div className="w-full h-full flex flex-col bg-gray-50 dark:bg-[#0f0d1a]">
      {/* Header with glass card */}
      <div className="glass-card m-4 md:m-6 mb-0 p-4 md:p-6">
        {/* Title with gradient text */}
        <h1 className="text-3xl font-bold gradient-text mb-6">{t('logsPage.header.title')}</h1>

        {/* Controls */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <SearchableSpecDropdown
              specs={specs}
              selected={selectedSpec}
              onSelect={setSelectedSpec}
            />
            {/* Search input with glass styling */}
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder={t('logsPage.search.placeholder')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-2.5 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-full text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
              />
            </div>
            <SortDropdown
              currentSort={sortBy}
              currentOrder={sortOrder}
              onSortChange={handleSortChange}
              sortOptions={logSortOptions}
              align="right"
            />
          </div>

          {/* Task Filter Pills */}
          {uniqueTasks.length > 0 && (
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-3">
                {t('logsPage.filter.label')}
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setTaskFilter('')}
                  className={`btn-pill ${!taskFilter ? 'active' : ''}`}
                >
                  {t('logsPage.filter.all')}
                  <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs ${!taskFilter ? 'bg-white/20' : 'bg-gray-200 dark:bg-gray-700'}`}>
                    {logs.length}
                  </span>
                </button>
                {uniqueTasks.map(taskId => {
                  const count = logs.filter(log => log.taskId === taskId).length;
                  return (
                    <button
                      key={taskId}
                      onClick={() => setTaskFilter(taskId)}
                      className={`btn-pill ${taskFilter === taskId ? 'active' : ''}`}
                    >
                      {t('logsPage.filter.taskPrefix')} {taskId}
                      <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs ${taskFilter === taskId ? 'bg-white/20' : 'bg-gray-200 dark:bg-gray-700'}`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stats Cards with glass styling */}
      {selectedSpec && logs.length > 0 && (
        <div className="px-4 md:px-6 py-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="glass-card p-4 glow-hover">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl gradient-icon-blue flex items-center justify-center">
                  <ClipboardDocumentListIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">{t('logsPage.stats.totalEntries')}</div>
                  <div className="text-2xl font-bold text-blue-500">{stats.totalEntries}</div>
                </div>
              </div>
            </div>
            <div className="glass-card p-4 glow-hover">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl gradient-icon-green flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">{t('logsPage.stats.linesAdded')}</div>
                  <div className="text-2xl font-bold text-green-500">+{stats.totalLinesAdded}</div>
                </div>
              </div>
            </div>
            <div className="glass-card p-4 glow-hover">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-red-500 to-rose-400 flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
                  </svg>
                </div>
                <div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">{t('logsPage.stats.linesRemoved')}</div>
                  <div className="text-2xl font-bold text-red-500">-{stats.totalLinesRemoved}</div>
                </div>
              </div>
            </div>
            <div className="glass-card p-4 glow-hover">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl gradient-icon flex items-center justify-center">
                  <DocumentTextIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">{t('logsPage.stats.filesChanged')}</div>
                  <div className="text-2xl font-bold text-purple-500">{stats.totalFiles}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 pt-2">
        {!selectedSpec ? (
          /* Empty state - select spec */
          <div className="flex items-center justify-center h-full">
            <div className="text-center glass-card p-12 max-w-md">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl gradient-icon flex items-center justify-center">
                <DocumentTextIcon className="w-10 h-10 text-white" />
              </div>
              <p className="text-lg text-gray-500 dark:text-gray-400">{t('logsPage.empty.selectSpec')}</p>
            </div>
          </div>
        ) : error ? (
          <div className="glass-card border-red-500/30 p-6">
            <p className="text-red-500">{error}</p>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 rounded-2xl gradient-icon animate-pulse flex items-center justify-center">
                <ClipboardDocumentListIcon className="w-6 h-6 text-white" />
              </div>
              <p className="text-gray-500 dark:text-gray-400">{t('logsPage.loading')}</p>
            </div>
          </div>
        ) : filteredAndSortedLogs.length === 0 ? (
          /* Empty state - no logs */
          <div className="flex items-center justify-center h-64">
            <div className="text-center glass-card p-12 max-w-md">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-r from-gray-500 to-gray-400 flex items-center justify-center opacity-50">
                <ClipboardDocumentListIcon className="w-10 h-10 text-white" />
              </div>
              <p className="text-lg text-gray-500 dark:text-gray-400">
                {search || taskFilter
                  ? t('logsPage.empty.noResults')
                  : t('logsPage.empty.noLogs')}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAndSortedLogs.map((entry) => (
              <LogEntryCard key={entry.id} entry={entry} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
