/**
 * Date formatting utilities.
 * Pure TypeScript — no Node.js or browser APIs beyond Intl/Date.
 */

type TranslationFn = (key: string, options?: Record<string, unknown>) => string;

export function formatDate(
  dateStr?: string,
  options?: {
    fallbackKey?: string;
    fallbackText?: string;
    includeSeconds?: boolean;
  },
  t?: TranslationFn,
): string {
  const { fallbackKey = 'common.never', fallbackText = 'Never', includeSeconds = false } = options ?? {};

  if (!dateStr) return t ? t(fallbackKey) : fallbackText;

  const formatOptions: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    ...(includeSeconds && { second: '2-digit' }),
  };

  return new Date(dateStr).toLocaleDateString(undefined, formatOptions);
}

export function formatDistanceToNow(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) return 'just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(dateStr);
}
