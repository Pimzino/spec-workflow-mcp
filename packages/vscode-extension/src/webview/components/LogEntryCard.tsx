import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/solid';
import { Card, CardContent } from './ui/card';
import type { ImplementationLogEntry } from '../lib/vscode-api';
import { ArtifactSection } from './ArtifactSection';

interface LogEntryCardProps {
  entry: ImplementationLogEntry;
}

export function LogEntryCard({ entry }: LogEntryCardProps) {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <Card className="mb-4 hover:shadow-md transition-shadow cursor-pointer">
      <CardContent className="p-4">
        {/* Header - Always Visible */}
        <div
          className="flex items-start gap-4 hover:bg-muted/50 p-2 rounded -m-2"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="mt-0.5 flex-shrink-0">
            {isExpanded ? (
              <ChevronDownIcon className="w-5 h-5" />
            ) : (
              <ChevronRightIcon className="w-5 h-5" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 text-xs font-mono rounded">
                {entry.taskId}
              </span>
              <span className="text-sm text-muted-foreground">
                {formatDate(entry.timestamp)}
              </span>
            </div>
            <p className="text-sm font-medium mt-1">{entry.summary}</p>
          </div>
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="mt-4 pl-9 space-y-4 border-l-2 border-muted pl-4">
            {/* Statistics */}
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="p-2 bg-muted rounded">
                <div className="text-lg font-bold text-green-600">
                  +{entry.statistics.linesAdded}
                </div>
                <div className="text-xs text-muted-foreground">{t('logs.entry.added')}</div>
              </div>
              <div className="p-2 bg-muted rounded">
                <div className="text-lg font-bold text-red-600">
                  -{entry.statistics.linesRemoved}
                </div>
                <div className="text-xs text-muted-foreground">{t('logs.entry.removed')}</div>
              </div>
              <div className="p-2 bg-muted rounded">
                <div className="text-lg font-bold text-blue-600">
                  {entry.statistics.filesChanged}
                </div>
                <div className="text-xs text-muted-foreground">{t('logs.entry.filesChanged')}</div>
              </div>
              <div className="p-2 bg-muted rounded">
                <div className="text-lg font-bold text-purple-600">
                  {(entry.statistics.linesAdded - entry.statistics.linesRemoved)}
                </div>
                <div className="text-xs text-muted-foreground">{t('logs.entry.netChange')}</div>
              </div>
            </div>

            {/* Files Modified */}
            {entry.filesModified && entry.filesModified.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-2">{t('logs.entry.filesModified')}</h4>
                <ul className="space-y-1">
                  {entry.filesModified.map((file: string, idx: number) => (
                    <li key={idx} className="text-xs text-muted-foreground font-mono">
                      • {file}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Files Created */}
            {entry.filesCreated && entry.filesCreated.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-2">{t('logs.entry.filesCreated')}</h4>
                <ul className="space-y-1">
                  {entry.filesCreated.map((file: string, idx: number) => (
                    <li key={idx} className="text-xs text-muted-foreground font-mono">
                      • {file}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Artifacts */}
            {entry.artifacts && (
              <div className="space-y-4 pt-2">
                <ArtifactSection
                  type="apiEndpoints"
                  artifacts={entry.artifacts.apiEndpoints || []}
                />
                <ArtifactSection
                  type="components"
                  artifacts={entry.artifacts.components || []}
                />
                <ArtifactSection
                  type="functions"
                  artifacts={entry.artifacts.functions || []}
                />
                <ArtifactSection
                  type="classes"
                  artifacts={entry.artifacts.classes || []}
                />
                <ArtifactSection
                  type="integrations"
                  artifacts={entry.artifacts.integrations || []}
                />
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
