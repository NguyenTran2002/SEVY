import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import your translation files
import enTranslation from './locales/en.json';
import viTranslation from './locales/vi.json';

i18n
    .use(initReactI18next) // Connects with React
    .init({
        resources: {
            en: {
                translation: enTranslation,
            },
            vi: {
                translation: viTranslation,
            },
        },
        lng: 'vi', // Default language
        fallbackLng: 'en', // Fallback language if translation is missing
        interpolation: {
            escapeValue: false, // React already does escaping
        },
    });

export default i18n;