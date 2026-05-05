import { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { vscodeApi } from '../lib/vscode-api';
import type { ImplementationLogEntry } from '../lib/vscode-api';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Input } from '../components/ui/input';
import { Card, CardContent } from '../components/ui/card';
import { LogStatsPanel } from '../components/LogStatsPanel';
import { LogEntryCard } from '../components/LogEntryCard';

interface LogsData {
  specName: string;
  entries: ImplementationLogEntry[];
  stats: {
    totalEntries: number;
    totalLinesAdded: number;
    totalLinesRemoved: number;
    totalFilesChanged: number;
  };
}

type SortOption = 'timestamp' | 'taskId' | 'linesAdded' | 'filesChanged';
type SortOrder = 'asc' | 'desc';

export function LogsPage({
  specs,
  selectedSpec,
  onSpecChange,
}: {
  specs: any[];
  selectedSpec: string | null;
  onSpecChange: (spec: string) => void;
}) {
  const { t } = useTranslation();
  const [logsData, setLogsData] = useState<LogsData | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredEntries, setFilteredEntries] = useState<ImplementationLogEntry[]>([]);
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<SortOption>('timestamp');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [isLoading, setIsLoading] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Listen for logs updates
  useEffect(() => {
    const unsubscribe = vscodeApi.onMessage('logs-updated', (message: any) => {
      if (message.data) {
        setLogsData(message.data);
        setSelectedTasks(new Set());
        setSearchQuery('');
      }
    });

    return unsubscribe;
  }, []);

  // Listen for search results
  useEffect(() => {
    const unsubscribe = vscodeApi.onMessage('logs-search-results', (message: any) => {
      if (message.data) {
        const { entries } = message.data;
        applyFiltersAndSort(entries, new Set(), sortBy, sortOrder);
        setIsLoading(false);
      }
    });

    return unsubscribe;
  }, [sortBy, sortOrder]);

  // Handle spec change
  useEffect(() => {
    if (selectedSpec) {
      setIsLoading(true);
      vscodeApi.getLogs(selectedSpec);
    }
  }, [selectedSpec]);

  // Stop loading after logs are received
  useEffect(() => {
    if (logsData) {
      setIsLoading(false);
    }
  }, [logsData]);

  // Apply filters and sorting
  useEffect(() => {
    if (logsData) {
      applyFiltersAndSort(logsData.entries, selectedTasks, sortBy, sortOrder);
    }
  }, [logsData, selectedTasks, sortBy, sortOrder]);

  // Debounced search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!selectedSpec || !searchQuery.trim()) {
      // If search is empty, reset to full entries with filters
      if (logsData) {
        applyFiltersAndSort(logsData.entries, selectedTasks, sortBy, sortOrder);
      }
      return;
    }

    setIsLoading(true);
    searchTimeoutRef.current = setTimeout(() => {
      vscodeApi.searchLogs(selectedSpec, searchQuery);
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, selectedSpec, logsData]);

  const applyFiltersAndSort = (
    entries: ImplementationLogEntry[],
    tasks: Set<string>,
    sort: SortOption,
    order: SortOrder
  ) => {
    let filtered = [...entries];

    // Filter by selected tasks
    if (tasks.size > 0) {
      filtered = filtered.filter(e => tasks.has(e.taskId));
    }

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sort) {
        case 'timestamp':
          comparison = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
          break;
        case 'taskId':
          comparison = a.taskId.localeCompare(b.taskId);
          break;
        case 'linesAdded':
          comparison = a.statistics.linesAdded - b.statistics.linesAdded;
          break;
        case 'filesChanged':
          comparison = a.statistics.filesChanged - b.statistics.filesChanged;
          break;
      }

      return order === 'desc' ? -comparison : comparison;
    });

    setFilteredEntries(filtered);
  };

  // Get unique task IDs for filter pills
  const uniqueTasks = logsData
    ? Array.from(new Set(logsData.entries.map(e => e.taskId))).sort()
    : [];

  const toggleTaskFilter = (taskId: string) => {
    const newTasks = new Set(selectedTasks);
    if (newTasks.has(taskId)) {
      newTasks.delete(taskId);
    } else {
      newTasks.add(taskId);
    }
    setSelectedTasks(newTasks);
  };

  const toggleSort = (newSort: SortOption) => {
    if (sortBy === newSort) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSort);
      setSortOrder('desc');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">{t('logs.title')}</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {t('logs.subtitle')}
        </p>
      </div>

      {/* Controls */}
      <div className="space-y-4">
        {/* Spec Selector */}
        <Select value={selectedSpec || ''} onValueChange={onSpecChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder={t('logs.selectSpec')} />
          </SelectTrigger>
          <SelectContent>
            {specs.map((spec) => (
              <SelectItem key={spec.name} value={spec.name}>
                {spec.displayName || spec.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Search Input */}
        <Input
          placeholder={t('logs.searchPlaceholder')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          disabled={!selectedSpec}
        />

        {/* Task Filters */}
        {logsData && uniqueTasks.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {uniqueTasks.map((taskId) => (
              <button
                key={taskId}
                onClick={() => toggleTaskFilter(taskId)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  selectedTasks.has(taskId)
                    ? 'bg-blue-500 text-white'
                    : 'bg-muted text-muted-foreground hover:bg-muted-foreground/20'
                }`}
              >
                {taskId}
              </button>
            ))}
          </div>
        )}

        {/* Sort Controls */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => toggleSort('timestamp')}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
              sortBy === 'timestamp'
                ? 'bg-blue-500 text-white'
                : 'bg-muted text-muted-foreground hover:bg-muted-foreground/20'
            }`}
          >
            {t('logs.sort.timestamp')} {sortBy === 'timestamp' && (sortOrder === 'asc' ? '↑' : '↓')}
          </button>
          <button
            onClick={() => toggleSort('taskId')}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
              sortBy === 'taskId'
                ? 'bg-blue-500 text-white'
                : 'bg-muted text-muted-foreground hover:bg-muted-foreground/20'
            }`}
          >
            {t('logs.sort.taskId')} {sortBy === 'taskId' && (sortOrder === 'asc' ? '↑' : '↓')}
          </button>
          <button
            onClick={() => toggleSort('linesAdded')}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
              sortBy === 'linesAdded'
                ? 'bg-blue-500 text-white'
                : 'bg-muted text-muted-foreground hover:bg-muted-foreground/20'
            }`}
          >
            {t('logs.sort.linesAdded')} {sortBy === 'linesAdded' && (sortOrder === 'asc' ? '↑' : '↓')}
          </button>
          <button
            onClick={() => toggleSort('filesChanged')}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
              sortBy === 'filesChanged'
                ? 'bg-blue-500 text-white'
                : 'bg-muted text-muted-foreground hover:bg-muted-foreground/20'
            }`}
          >
            {t('logs.sort.filesChanged')} {sortBy === 'filesChanged' && (sortOrder === 'asc' ? '↑' : '↓')}
          </button>
        </div>
      </div>

      {/* Stats Panel */}
      {logsData && <LogStatsPanel stats={logsData.stats} />}

      {/* Loading State */}
      {isLoading && (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            {t('logs.loading')}
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!isLoading && !selectedSpec && (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            {t('logs.selectSpecMessage')}
          </CardContent>
        </Card>
      )}

      {!isLoading && selectedSpec && filteredEntries.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            {searchQuery
              ? t('logs.noSearchResults')
              : t('logs.noLogs')}
          </CardContent>
        </Card>
      )}

      {/* Log Entries */}
      {!isLoading && filteredEntries.length > 0 && (
        <div className="space-y-2">
          {filteredEntries.map((entry) => (
            <LogEntryCard key={entry.id} entry={entry} />
          ))}
        </div>
      )}
    </div>
  );
}
