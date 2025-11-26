import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend, { HttpBackendOptions } from 'i18next-http-backend';
import { initReactI18next } from 'react-i18next';
import { trimTrailingSlash } from './utils/common';

// list of namespaces
export const NAMESPACES = [
  'components',
  'features',
  'pages',
  'hooks',
  'util'
] as const;

// list of supported languages
export const SUPPORTED_LANGUAGES = [
  { code: 'en-US', name: 'English', nativeName: 'English' },
  { code: 'en-GB', name: 'English (UK)', nativeName: 'English (UK)' },
  { code: 'zh-CN', name: 'Chinese (Simplified)', nativeName: '中文 (简体)' },
  { code: 'zh-TW', name: 'Chinese (Traditional)', nativeName: '中文 (繁體)' },
  { code: 'de-DE', name: 'German', nativeName: 'Deutsch' },
  { code: 'ja-JP', name: 'Japanese', nativeName: '日本語' },
  { code: 'ko-KR', name: 'Korean', nativeName: '한국어' },
  { code: 'fr-FR', name: 'French', nativeName: 'Français' },
  { code: 'es-ES', name: 'Spanish (Spain)', nativeName: 'Español (España)' },
  { code: 'es-419', name: 'Spanish (Latin America)', nativeName: 'Español (Latinoamérica)' },
  { code: 'pt-BR', name: 'Portuguese (Brazilian)', nativeName: 'Português (Brasil)' },
  { code: 'pt-PT', name: 'Portuguese (European)', nativeName: 'Português (Europeu)' },
  { code: 'ru-RU', name: 'Russian', nativeName: 'Русский' },
  { code: 'it-IT', name: 'Italian', nativeName: 'Italiano' },
  { code: 'nl-NL', name: 'Dutch', nativeName: 'Nederlands' },
  { code: 'hi-IN', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'ar-SA', name: 'Arabic', nativeName: 'العربية' },
  { code: 'tr-TR', name: 'Turkish', nativeName: 'Türkçe' },
  { code: 'vi-VN', name: 'Vietnamese', nativeName: 'Tiếng Việt' },
  { code: 'id-ID', name: 'Indonesian', nativeName: 'Bahasa Indonesia' },
  { code: 'pl-PL', name: 'Polish', nativeName: 'Polski' },
  { code: 'uk-UA', name: 'Ukrainian', nativeName: 'Українська' },
] as const;

i18n
  // i18next-http-backend
  // loads translations from your server
  // https://github.com/i18next/i18next-http-backend
  .use(Backend)
  // detect user language
  // learn more: https://github.com/i18next/i18next-browser-languageDetector
  .use(LanguageDetector)
  // pass the i18n instance to react-i18next.
  .use(initReactI18next)
  // init i18next
  // for all options read: https://www.i18next.com/overview/configuration-options
  .init<HttpBackendOptions>({
    debug: false,
    fallbackLng: 'en-US',
    supportedLngs: SUPPORTED_LANGUAGES.map(lang => lang.code),
    ns: NAMESPACES,
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },
    backend: {
      loadPath: `${trimTrailingSlash(import.meta.env.BASE_URL)}/public/locales/{{lng}}/{{ns}}.json`,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export default i18n;
