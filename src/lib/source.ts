import { docs } from '@/.source';
import { loader } from 'fumadocs-core/source';

export const source = loader({
  baseUrl: '/docs',
  source: docs.toFumadocsSource(),
  i18n: {
    languages: ['en', 'es', 'pt-BR'],
    defaultLanguage: 'en',
    hideLocale: 'never',
    parser: 'dir',
  },
});
