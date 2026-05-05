import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import enTranslation from './locales/en.json';
import jaTranslation from './locales/ja.json';
import zhTranslation from './locales/zh.json';
import esTranslation from './locales/es.json';
import ptTranslation from './locales/pt.json';
import deTranslation from './locales/de.json';
import frTranslation from './locales/fr.json';
import ruTranslation from './locales/ru.json';
import itTranslation from './locales/it.json';
import koTranslation from './locales/ko.json';
import arTranslation from './locales/ar.json';

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
      es: {
        translation: esTranslation,
      },
      pt: {
        translation: ptTranslation,
      },
      de: {
        translation: deTranslation,
      },
      fr: {
        translation: frTranslation,
      },
      ru: {
        translation: ruTranslation,
      },
      it: {
        translation: itTranslation,
      },
      ko: {
        translation: koTranslation,
      },
      ar: {
        translation: arTranslation,
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
