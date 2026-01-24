type TranslationFn = (key: string, options?: Record<string, unknown>) => string;

/**
 * Format a date string for display with locale-aware formatting.
 *
 * @param dateStr - ISO date string to format
 * @param options - Configuration options
 * @param options.fallbackKey - Translation key for fallback text (default: 'common.never')
 * @param options.fallbackText - Fallback text if no translation function provided (default: 'Never')
 * @param options.includeSeconds - Whether to include seconds in the output (default: false)
 * @param t - Optional translation function for fallback text
 */
export function formatDate(
  dateStr?: string,
  options?: {
    fallbackKey?: string;
    fallbackText?: string;
    includeSeconds?: boolean;
  },
  t?: TranslationFn
): string {
  const {
    fallbackKey = 'common.never',
    fallbackText = 'Never',
    includeSeconds = false,
  } = options ?? {};

  if (!dateStr) {
    return t ? t(fallbackKey) : fallbackText;
  }

  const formatOptions: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    ...(includeSeconds && { second: '2-digit' }),
  };

  return new Date(dateStr).toLocaleDateString(undefined, formatOptions);
}

/**
 * Format a date as a relative time string (e.g., "5m ago", "2h ago").
 *
 * @param dateStr - ISO date string to format
 */
export function formatDistanceToNow(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'Just now';
  }
  if (diffInSeconds < 3600) {
    return `${Math.floor(diffInSeconds / 60)}m ago`;
  }
  if (diffInSeconds < 86400) {
    return `${Math.floor(diffInSeconds / 3600)}h ago`;
  }
  if (diffInSeconds < 604800) {
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  }

  return formatDate(dateStr);
}
