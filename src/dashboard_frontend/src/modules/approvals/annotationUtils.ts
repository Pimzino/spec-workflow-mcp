/**
 * Annotation utilities for text selection and fuzzy matching in markdown content
 */

/**
 * Text selector with context information for fuzzy matching
 */
export interface TextSelector {
  exact: string;      // The exact selected text
  prefix?: string;    // Text context before the selection (for disambiguation)
  suffix?: string;    // Text context after the selection (for disambiguation)
}

/**
 * Position in markdown source
 */
export interface MarkdownPosition {
  startOffset: number;
  endOffset: number;
  confidence: number; // Matching confidence 0-1
}

/**
 * Normalize markdown text for searching by removing common markdown syntax
 * This helps match rendered text with source markdown
 */
export function normalizeMarkdownForSearch(text: string): string {
  return text
    // Remove bold/italic markers
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/(\*|_)(.*?)\1/g, '$2')
    // Remove inline code markers
    .replace(/`([^`]+)`/g, '$1')
    // Remove link syntax but keep text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Remove heading markers
    .replace(/^#{1,6}\s+/gm, '')
    // Normalize whitespace
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Get text context before a Range
 */
export function getTextContextBefore(range: Range, length: number): string {
  try {
    const preRange = document.createRange();
    const startContainer = range.startContainer;

    // Get the root element (walk up to find a suitable container)
    let rootElement: Node = startContainer;
    while (rootElement.parentNode && rootElement.parentNode.nodeType === Node.ELEMENT_NODE) {
      rootElement = rootElement.parentNode;
    }

    preRange.selectNodeContents(rootElement);
    preRange.setEnd(range.startContainer, range.startOffset);

    const beforeText = preRange.toString();
    return beforeText.slice(-length);
  } catch (error) {
    console.warn('Failed to get text context before:', error);
    return '';
  }
}

/**
 * Get text context after a Range
 */
export function getTextContextAfter(range: Range, length: number): string {
  try {
    const postRange = document.createRange();
    const endContainer = range.endContainer;

    // Get the root element
    let rootElement: Node = endContainer;
    while (rootElement.parentNode && rootElement.parentNode.nodeType === Node.ELEMENT_NODE) {
      rootElement = rootElement.parentNode;
    }

    postRange.selectNodeContents(rootElement);
    postRange.setStart(range.endContainer, range.endOffset);

    const afterText = postRange.toString();
    return afterText.slice(0, length);
  } catch (error) {
    console.warn('Failed to get text context after:', error);
    return '';
  }
}

/**
 * Calculate similarity score between two strings (0-1)
 */
function calculateSimilarity(str1: string, str2: string): number {
  if (str1 === str2) return 1.0;

  const len1 = str1.length;
  const len2 = str2.length;
  const maxLen = Math.max(len1, len2);

  if (maxLen === 0) return 1.0;

  // Simple Levenshtein distance approximation
  const minLen = Math.min(len1, len2);
  let matches = 0;

  for (let i = 0; i < minLen; i++) {
    if (str1[i] === str2[i]) matches++;
  }

  return matches / maxLen;
}

/**
 * Find text in markdown source using fuzzy matching with context
 */
export function findTextInMarkdown(
  selector: TextSelector,
  markdown: string
): MarkdownPosition | null {
  const { exact, prefix = '', suffix = '' } = selector;

  if (!exact || !markdown) return null;

  // Normalize both the search text and markdown
  const normalizedExact = normalizeMarkdownForSearch(exact);
  const normalizedMarkdown = normalizeMarkdownForSearch(markdown);

  // Try exact match first
  let index = normalizedMarkdown.indexOf(normalizedExact);

  if (index !== -1) {
    // Found exact match, calculate position in original markdown
    return {
      startOffset: mapNormalizedToOriginal(markdown, normalizedMarkdown, index),
      endOffset: mapNormalizedToOriginal(markdown, normalizedMarkdown, index + normalizedExact.length),
      confidence: 1.0
    };
  }

  // If exact match fails, try with context
  if (prefix || suffix) {
    const normalizedPrefix = normalizeMarkdownForSearch(prefix);
    const normalizedSuffix = normalizeMarkdownForSearch(suffix);

    // Search for pattern with context
    const contextPattern = `${normalizedPrefix}${normalizedExact}${normalizedSuffix}`;
    const contextIndex = normalizedMarkdown.indexOf(contextPattern);

    if (contextIndex !== -1) {
      const textStart = contextIndex + normalizedPrefix.length;
      return {
        startOffset: mapNormalizedToOriginal(markdown, normalizedMarkdown, textStart),
        endOffset: mapNormalizedToOriginal(markdown, normalizedMarkdown, textStart + normalizedExact.length),
        confidence: 0.9
      };
    }
  }

  // Fallback: find best fuzzy match
  const matches: Array<{ start: number; end: number; confidence: number }> = [];

  for (let i = 0; i <= normalizedMarkdown.length - normalizedExact.length; i++) {
    const candidate = normalizedMarkdown.slice(i, i + normalizedExact.length);
    const similarity = calculateSimilarity(normalizedExact, candidate);

    if (similarity > 0.8) {
      matches.push({
        start: i,
        end: i + normalizedExact.length,
        confidence: similarity
      });
    }
  }

  if (matches.length === 0) return null;

  // Return best match
  matches.sort((a, b) => b.confidence - a.confidence);
  const bestMatch = matches[0];

  return {
    startOffset: mapNormalizedToOriginal(markdown, normalizedMarkdown, bestMatch.start),
    endOffset: mapNormalizedToOriginal(markdown, normalizedMarkdown, bestMatch.end),
    confidence: bestMatch.confidence
  };
}

/**
 * Map position in normalized text back to original markdown
 * This is a simplified implementation that assumes normalization doesn't change character count significantly
 */
function mapNormalizedToOriginal(
  original: string,
  _normalized: string,
  normalizedPos: number
): number {
  // Simple approach: count characters in original that contribute to normalized position
  let origPos = 0;
  let normPos = 0;

  while (origPos < original.length && normPos < normalizedPos) {
    const normalizedChar = normalizeMarkdownForSearch(original.slice(origPos, origPos + 1));

    if (normalizedChar.length > 0) {
      normPos += normalizedChar.length;
    }
    origPos++;
  }

  return Math.min(origPos, original.length);
}
