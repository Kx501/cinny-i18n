import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend, { HttpBackendOptions } from 'i18next-http-backend';
import { initReactI18next } from 'react-i18next';
import { trimTrailingSlash } from './utils/common';

// 定义命名空间列表
export const NAMESPACES = [
  'common',
  'atoms',
  'molecules',
  'organisms',
  'components',
  'features',
  'pages',
  'hooks',
  'util'
] as const;

// 支持的语言列表
export const SUPPORTED_LANGUAGES = [
  { code: 'en-US', name: 'English', nativeName: 'English' },
  { code: 'zh-CN', name: 'Chinese', nativeName: '中文' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' }
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
    fallbackLng: 'en',
    supportedLngs: SUPPORTED_LANGUAGES.map(lang => lang.code),
    ns: NAMESPACES,
    defaultNS: 'common',
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
