import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import {
  TranslationNotice,
  resolveDocMdxPath,
  getTranslationContributeUrl,
  DEFAULT_DOCS_REPO_URL,
  DEFAULT_DOCS_BRANCH,
} from '@/components/docs/TranslationNotice';
import {
  OutdatedNotice,
  getOutdatedHistoryUrl,
} from '@/components/docs/OutdatedNotice';

describe('Documentation Notices Link Integrity & Resolution Suite', () => {
  describe('resolveDocMdxPath', () => {
    it('returns empty string when slug is missing', () => {
      expect(resolveDocMdxPath()).toBe('');
      expect(resolveDocMdxPath(undefined)).toBe('');
    });

    it('resolves track roots to index.mdx', () => {
      expect(resolveDocMdxPath('v0.3')).toBe('v0.3/index.mdx');
      expect(resolveDocMdxPath('v0.4')).toBe('v0.4/index.mdx');
    });

    it('appends .mdx to subpath slugs', () => {
      expect(resolveDocMdxPath('v0.3/getting-started/quickstart')).toBe(
        'v0.3/getting-started/quickstart.mdx'
      );
      expect(resolveDocMdxPath('v0.4/guides/agents')).toBe('v0.4/guides/agents.mdx');
    });

    it('preserves slugs that already include the .mdx extension', () => {
      expect(resolveDocMdxPath('v0.3/getting-started/installation.mdx')).toBe(
        'v0.3/getting-started/installation.mdx'
      );
    });
  });

  describe('getTranslationContributeUrl', () => {
    it('uses chatflow-agent-web and main branch by default', () => {
      const url = getTranslationContributeUrl('es', 'v0.3/getting-started/quickstart');
      expect(url).toContain('https://github.com/GustavoBaranda/chatflow-agent-web');
      expect(url).toContain('/blob/main/content/docs/en/v0.3/getting-started/quickstart.mdx');
      expect(url).not.toContain('chatflow-agent/');
    });

    it('resolves index.mdx for track root slugs', () => {
      const url = getTranslationContributeUrl('pt-BR', 'v0.3');
      expect(url).toBe(
        `${DEFAULT_DOCS_REPO_URL}/blob/${DEFAULT_DOCS_BRANCH}/content/docs/en/v0.3/index.mdx`
      );
    });

    it('falls back to locale tree when slug is omitted', () => {
      const url = getTranslationContributeUrl('es');
      expect(url).toBe(
        `${DEFAULT_DOCS_REPO_URL}/tree/${DEFAULT_DOCS_BRANCH}/content/docs/es`
      );
    });

    it('supports custom branch and repoUrl without hardcoded assumptions', () => {
      const url = getTranslationContributeUrl(
        'es',
        'v0.3/guides/tools',
        'develop',
        'https://github.com/custom-org/docs-repo'
      );
      expect(url).toBe(
        'https://github.com/custom-org/docs-repo/blob/develop/content/docs/en/v0.3/guides/tools.mdx'
      );
    });
  });

  describe('getOutdatedHistoryUrl', () => {
    it('uses chatflow-agent-web and main branch by default', () => {
      const url = getOutdatedHistoryUrl('v0.3/guides/runner-lifecycle');
      expect(url).toContain('https://github.com/GustavoBaranda/chatflow-agent-web');
      expect(url).toContain('/commits/main/content/docs/en/v0.3/guides/runner-lifecycle.mdx');
      expect(url).not.toContain('chatflow-agent/');
    });

    it('resolves index.mdx for track root slugs', () => {
      const url = getOutdatedHistoryUrl('v0.4');
      expect(url).toBe(
        `${DEFAULT_DOCS_REPO_URL}/commits/${DEFAULT_DOCS_BRANCH}/content/docs/en/v0.4/index.mdx`
      );
    });

    it('falls back to en root when slug is omitted', () => {
      const url = getOutdatedHistoryUrl();
      expect(url).toBe(
        `${DEFAULT_DOCS_REPO_URL}/commits/${DEFAULT_DOCS_BRANCH}/content/docs/en`
      );
    });

    it('supports custom branch and repoUrl', () => {
      const url = getOutdatedHistoryUrl(
        'v0.3/providers/openai',
        'release-0.3',
        'https://github.com/custom-org/docs-repo'
      );
      expect(url).toBe(
        'https://github.com/custom-org/docs-repo/commits/release-0.3/content/docs/en/v0.3/providers/openai.mdx'
      );
    });
  });

  describe('Component Rendering', () => {
    it('renders TranslationNotice with correct destination link to website repository', () => {
      const html = renderToString(
        <TranslationNotice targetLocale="es" slug="v0.3/getting-started/quickstart" />
      );
      expect(html).toContain('Authoritative English Content Displayed');
      expect(html).toContain('https://github.com/GustavoBaranda/chatflow-agent-web/blob/main/content/docs/en/v0.3/getting-started/quickstart.mdx');
    });

    it('renders OutdatedNotice with revision hash and correct history link', () => {
      const html = renderToString(
        <OutdatedNotice sourceRevision="7f25e1d" slug="v0.3/guides/agents" />
      );
      expect(html).toContain('Outdated Translation');
      expect(html).toContain('(7f25e1d)');
      expect(html).toContain('https://github.com/GustavoBaranda/chatflow-agent-web/commits/main/content/docs/en/v0.3/guides/agents.mdx');
    });
  });
});

