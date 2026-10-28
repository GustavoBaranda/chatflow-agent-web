export interface Language {
  code: string;
  name: string;
  localName: string;
  direction: 'ltr' | 'rtl';
  flag: string;
}

export const SUPPORTED_LANGUAGES: Language[] = [
  {
    code: 'en',
    name: 'English',
    localName: 'English',
    direction: 'ltr',
    flag: '🇺🇸',
  },
  {
    code: 'es',
    name: 'Spanish',
    localName: 'Español',
    direction: 'ltr',
    flag: '🇪🇸',
  },
];

export const SUPPORTED_LOCALES = SUPPORTED_LANGUAGES.map((lang) => lang.code) as [string, ...string[]];

export const DEFAULT_LOCALE = 'en';

export function getLanguage(code: string): Language {
  return SUPPORTED_LANGUAGES.find((lang) => lang.code === code) ?? SUPPORTED_LANGUAGES[0];
}
