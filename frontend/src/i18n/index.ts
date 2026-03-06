import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './en.json';
import ar from './ar.json';

// Apply direction to <html> immediately (before React renders) to avoid flicker
const applyDir = (lng: string) => {
  const isRTL = lng === 'ar';
  document.documentElement.dir  = isRTL ? 'rtl' : 'ltr';
  document.documentElement.lang = lng;
};

// Read saved language synchronously — single source of truth
const savedLang = localStorage.getItem('lang') ?? 'en';
applyDir(savedLang);

// No LanguageDetector — we manage language manually via localStorage
i18n
  .use(initReactI18next)
  .init({
    resources: { en: { translation: en }, ar: { translation: ar } },
    lng: savedLang,
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  });

// Keep <html> dir + localStorage in sync whenever language changes
i18n.on('languageChanged', (lng) => {
  localStorage.setItem('lang', lng);
  applyDir(lng);
});

export default i18n;
