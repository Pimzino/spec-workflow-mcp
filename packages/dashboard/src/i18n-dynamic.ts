import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Dynamic import function for translations
const loadTranslation = async (lang: string) => {
  try {
    const translation = await import(`./locales/${lang}.json`);
    return translation.default || translation;
  } catch (error) {
    console.error(`Failed to load translation for ${lang}:`, error);
    // Fallback to English if language file not found
    if (lang !== 'en') {
      const fallback = await import('./locales/en.json');
      return fallback.default || fallback;
    }
    return {};
  }
};

// Initialize i18n with dynamic loading
const initI18n = async () => {
  // Detect initial language
  const detector = new LanguageDetector();
  detector.init();
  const detectedLang = detector.detect() as string || 'en';
  const initialLang = ['en', 'ja', 'zh'].includes(detectedLang) ? detectedLang : 'en';
  
  // Load initial translation
  const initialTranslation = await loadTranslation(initialLang);
  
  await i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources: {
        [initialLang]: {
          translation: initialTranslation,
        },
      },
      fallbackLng: 'en',
      detection: {
        // Order of detection methods
        order: ['localStorage', 'navigator', 'htmlTag'],
        // Key to store language preference in localStorage
        lookupLocalStorage: 'preferred-language',
        // Cache the language detection result in localStorage
        caches: ['localStorage'],
      },
      interpolation: {
        escapeValue: true, // Enable for defense-in-depth, even though React provides XSS protection
      },
      react: {
        useSuspense: false, // Disable suspense for async loading
      },
    });
  
  // Add language changed listener to dynamically load translations
  i18n.on('languageChanged', async (lng) => {
    if (!i18n.hasResourceBundle(lng, 'translation')) {
      const translation = await loadTranslation(lng);
      i18n.addResourceBundle(lng, 'translation', translation, true, true);
    }
  });
  
  return i18n;
};

// Export the initialization promise
export const i18nPromise = initI18n();

// Export i18n instance for backward compatibility
export default i18n;