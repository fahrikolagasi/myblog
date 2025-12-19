import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import translationTR from './locales/tr/translation.json';
import translationEN from './locales/en/translation.json';

// Configuration
const resources = {
    tr: {
        translation: translationTR
    },
    en: {
        translation: translationEN
    }
};

i18n
    // .use(LanguageDetector) // Disable detector for now to strictly enforce TR default as requested first
    .use(initReactI18next)
    .init({
        resources,
        lng: 'tr', // Default language is Turkish
        fallbackLng: 'tr', // Fallback is Turkish

        interpolation: {
            escapeValue: false // React already safes from xss
        },

        react: {
            useSuspense: false // Avoid styling issues during loading
        }
    });

export default i18n;
