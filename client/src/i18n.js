import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import enTranslations from './locales/en.json';
import frTranslations from './locales/fr.json';
import ptTranslations from './locales/pt.json';
import esTranslations from './locales/es.json';

const resources = {
  en: {
    translation: enTranslations
  },
  fr: {
    translation: frTranslations
  },
  pt: {
    translation: ptTranslations
  },
  es: {
    translation: esTranslations
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    // Do NOT set `lng` — that would override the LanguageDetector and force
    // English on every page load. Let the detector pick from localStorage
    // first (persisted choice), then the browser language, then the HTML
    // tag, falling back to English if none matches.
    fallbackLng: 'en',
    supportedLngs: ['en', 'fr', 'pt', 'es'],
    debug: false,

    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      lookupLocalStorage: 'i18nextLng',
      caches: ['localStorage'],
    },

    interpolation: {
      escapeValue: false // react already does escaping
    }
  });

export default i18n;
