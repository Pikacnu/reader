import { RemixI18Next } from 'remix-i18next/server';
import i18nextOptions from './i18n';
import { resolve } from 'node:path';
import { readFileSync } from 'node:fs';

// Custom backend for loading translations
const customBackend = {
  type: 'backend' as const,
  init() {},
  read(
    language: string,
    namespace: string,
    callback: (err: any, data: any) => void,
  ) {
    try {
      const filePath = resolve(
        `./public/locales/${language}/${namespace}.json`,
      );
      const data = readFileSync(filePath, 'utf8');
      callback(null, JSON.parse(data));
    } catch (error) {
      callback(error, null);
    }
  },
};

export const i18n = new RemixI18Next({
  detection: {
    supportedLanguages: i18nextOptions.supportedLngs,
    fallbackLanguage: i18nextOptions.fallbackLng,
  },
  i18next: {
    ...i18nextOptions,
  },
  plugins: [customBackend],
});
