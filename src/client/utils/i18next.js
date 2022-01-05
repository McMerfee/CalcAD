import i18next from 'i18next';
import ChainedBackend from 'i18next-chained-backend';
import LocalStorageBackend from 'i18next-localstorage-backend';
import HttpApi from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

const backendOpts = {
  backends: [
    LocalStorageBackend,
    HttpApi,
  ],
  backendOptions: [{
    // prefix for stored languages
    prefix: 'i18next_res_',
    // expiration
    expirationTime: 7 * 24 * 60 * 60 * 1000,
    // Version applied to all languages, can be overriden using the option `versions`
    defaultVersion: '',
    // language versions
    versions: {},
    // can be either window.localStorage or window.sessionStorage. Default: window.localStorage
    store: window.localStorage,
  }, {
    loadPath: '/public/locales/{{lng}}/{{ns}}.json',
  }],
};
const detectionOpts = {
  // order and from where user language should be detected
  order: [
    'querystring',
    'navigator',
    'cookie',
    'localStorage',
    'sessionStorage',
    'htmlTag',
    'path',
    'subdomain',
  ],
  // keys or params to lookup language from
  lookupQuerystring: 'lng',
  lookupCookie: 'i18next',
  lookupLocalStorage: 'i18nextLng',
};
const i18nextOpts = {
  ns: [
    'components',
    'options',
  ],
  defaultNS: 'components',
  fallbackLng: 'uk',
  supportedLngs: ['uk', 'ru'],
  debug: true,
  interpolation: {
    escapeValue: false, // react already safes from xss
  },
  backend: backendOpts,
  detection: detectionOpts,
};
/* eslint consistent-return: "warn" */
const i18nextCallback = (err) => {
  // logger
  if (err) {
    return console.log('something went wrong loading', err);
  }
};

i18next
  // load translation using http (lazy loading + caching)
  .use(ChainedBackend)
  // detect user language
  .use(LanguageDetector)
  .use(initReactI18next)
  .init(i18nextOpts, i18nextCallback);

export default i18next;
