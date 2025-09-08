import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import enTranslation from './locales/en.json';
import jaTranslation from './locales/ja.json';
import zhTranslation from './locales/zh.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: enTranslation,
      },
      ja: {
        translation: jaTranslation,
      },
      zh: {
        translation: zhTranslation,
      },
    },
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
    debug: true, // Enable debug mode for webview
    detection: {
      // Configure language detector to check for manual preference first
      order: ['localStorage', 'navigator', 'htmlTag'],
      lookupLocalStorage: 'spec-workflow-language',
      caches: ['localStorage'],
    },
  });

export default i18n;
