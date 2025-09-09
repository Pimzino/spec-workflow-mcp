import { promises as fs } from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { LRUCache } from 'lru-cache';
import Mustache from 'mustache';

// Since we are in an ES module, __dirname is not available.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const localesDir = path.resolve(__dirname, '../locales');

// Get supported languages from environment variable or use defaults
// Validate locale format: supports formats like 'en', 'ja', 'en-US', 'pt-BR'
const LOCALE_REGEX = /^[a-z]{2}(-[A-Z]{2})?$/;
const SUPPORTED_LANGUAGES = process.env.SUPPORTED_LANGUAGES 
  ? process.env.SUPPORTED_LANGUAGES.split(',')
      .map(lang => lang.trim())
      .filter(lang => {
        const isValid = LOCALE_REGEX.test(lang);
        if (!isValid) {
          console.warn(`Invalid locale format: ${lang}. Expected format: 'en' or 'en-US'`);
        }
        return isValid;
      })
  : ['en', 'ja', 'zh', 'es', 'pt', 'de', 'fr', 'ru', 'it', 'ko', 'ar'];

// Use LRU cache for memory-efficient translation storage
// Max 10MB of translation data (approximate)
const translationCache = new LRUCache<string, any>({
  max: 50, // Maximum number of language translations to cache
  sizeCalculation: (value) => {
    // Estimate size of translation object in memory
    return JSON.stringify(value).length;
  },
  maxSize: 10 * 1024 * 1024, // 10MB max size
  ttl: 1000 * 60 * 60, // 1 hour TTL
});

let translationsLoaded = false;
let loadingPromise: Promise<void> | null = null;

// Load translations asynchronously with caching
async function loadTranslations(): Promise<void> {
  if (translationsLoaded) return;
  
  if (loadingPromise) {
    await loadingPromise;
    return;
  }

  loadingPromise = (async () => {
    try {
      // Validate that locale directory exists
      try {
        await fs.access(localesDir);
      } catch (error) {
        const message = process.env.NODE_ENV === 'production' 
          ? 'Locales directory not found. Using fallback translations.'
          : `Locales directory not found at ${localesDir}. Using fallback translations.`;
        console.warn(message);
        // Set empty translations for all supported languages
        SUPPORTED_LANGUAGES.forEach(lang => translationCache.set(lang, {}));
        translationsLoaded = true;
        return;
      }

      // Load all supported languages in parallel
      const loadPromises = SUPPORTED_LANGUAGES.map(lang => 
        fs.readFile(path.join(localesDir, `${lang}.json`), 'utf8')
          .then(content => ({ lang, content, error: null }))
          .catch(error => ({ lang, content: null, error }))
      );
      
      const results = await Promise.all(loadPromises);
      
      // Handle translations for all supported languages
      for (const result of results) {
        if (result.content) {
          try {
            const translations = JSON.parse(result.content);
            translationCache.set(result.lang, translations);
          } catch (parseError) {
            const message = process.env.NODE_ENV === 'production'
              ? `Error parsing translations for ${result.lang}`
              : `Error parsing ${result.lang}.json: ${parseError}`;
            console.error(message);
            translationCache.set(result.lang, {});
          }
        } else {
          const message = process.env.NODE_ENV === 'production'
            ? `Translation file for ${result.lang} not found or unreadable`
            : `Translation file (${result.lang}.json) not found or unreadable: ${result.error}`;
          console.warn(message);
          translationCache.set(result.lang, {});
        }
      }
      
      translationsLoaded = true;
    } catch (error) {
      const message = process.env.NODE_ENV === 'production'
        ? 'Critical error loading translation files'
        : `Critical error loading translation files: ${error}`;
      console.error(message);
      // Fallback to empty translations for all supported languages
      SUPPORTED_LANGUAGES.forEach(lang => translationCache.set(lang, {}));
      translationsLoaded = true;
    }
  })();

  await loadingPromise;
}

// Initialize translations on first import (non-blocking)
loadTranslations().catch(error => {
  const message = process.env.NODE_ENV === 'production'
    ? 'Failed to initialize translations on import'
    : `Failed to initialize translations on import: ${error}`;
  console.error(message);
  // Note: This is a non-blocking error and shouldn't prevent the application from starting
  // Translations will fall back to using the key as the displayed text
  
  // In production environments, consider reporting this to monitoring/metrics systems
  if (process.env.NODE_ENV === 'production') {
    // TODO: Integrate with monitoring system (e.g., Sentry, DataDog, etc.)
    // Example: reportError('i18n-initialization-failed', { error: error.message });
  }
});

/**
 * Navigates through a nested object using a dot-separated key path.
 * @param obj - The object to navigate through
 * @param path - The dot-separated key path (e.g., 'nav.statistics')
 * @returns The value at the specified path, or undefined if not found
 * @example
 * navigate({ nav: { statistics: 'Stats' } }, 'nav.statistics') // returns 'Stats'
 * navigate<string>({ nav: { statistics: 'Stats' } }, 'nav.statistics') // returns 'Stats' with type safety
 */
function navigate<T = any>(obj: Record<string, any> | undefined, path: string): T | undefined {
  if (!obj) return undefined;
  return path.split('.').reduce((acc: any, part: string) => acc?.[part], obj);
}

/**
 * Translates a given key to the specified language with optional interpolation.
 * @param key - The translation key to look up (supports dot notation for nested keys)
 * @param lang - The target language code (defaults to 'en')
 * @param options - Optional key-value pairs for string interpolation using {{key}} syntax
 * @returns The translated string, or the key itself as fallback if translation is not found
 * @example
 * translate('welcome.message', 'en', { name: 'John' }) // returns translated text with {{name}} replaced
 */
export function translate(key: string, lang: string = 'en', options?: { [key: string]: string | number }): string {
  // Use cached translations if available, otherwise return key as fallback
  const langTranslations = translationCache.get(lang) || translationCache.get('en') || {};
  let translation = navigate(langTranslations, key) || key;

  if (options && typeof translation === 'string') {
    try {
      // Use Mustache for safe template interpolation
      // This prevents injection attacks and handles edge cases better
      translation = Mustache.render(translation, options);
    } catch (error) {
      // If Mustache fails, log error and return uninterpolated string
      const message = process.env.NODE_ENV === 'production'
        ? 'Template interpolation failed'
        : `Template interpolation failed for key '${key}': ${error}`;
      console.error(message);
    }
  }

  return translation;
}

// Export async initialization for cases where we need to ensure translations are loaded
export async function ensureTranslationsLoaded(): Promise<void> {
  await loadTranslations();
}
