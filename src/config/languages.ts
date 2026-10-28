export interface Language {
  code: string;
  name: string;
  localName: string;
  direction: 'ltr' | 'rtl';
}

export const SUPPORTED_LANGUAGES: Language[] = [
  {
    code: 'en',
    name: 'English',
    localName: 'English',
    direction: 'ltr',
  },
  {
    code: 'es',
    name: 'Spanish',
    localName: 'Español',
    direction: 'ltr',
  },
  {
    code: 'pt-BR',
    name: 'Portuguese (Brazil)',
    localName: 'Português (Brasil)',
    direction: 'ltr',
  },
];

export const SUPPORTED_LOCALES = SUPPORTED_LANGUAGES.map((lang) => lang.code) as [string, ...string[]];

export const DEFAULT_LOCALE = 'en';

export function getLanguage(code: string): Language {
  return SUPPORTED_LANGUAGES.find((lang) => lang.code === code) ?? SUPPORTED_LANGUAGES[0];
}
