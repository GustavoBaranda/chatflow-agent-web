import { AlertCircle, GitFork } from 'lucide-react';
import { getLanguage } from '@/config/languages';

export const DEFAULT_DOCS_REPO_URL = 'https://github.com/GustavoBaranda/chatflow-agent-web';
export const DEFAULT_DOCS_BRANCH = 'main';

export function resolveDocMdxPath(slug?: string): string {
  if (!slug) return '';
  if (slug === 'v0.3' || slug === 'v0.4') {
    return `${slug}/index.mdx`;
  }
  return slug.endsWith('.mdx') ? slug : `${slug}.mdx`;
}

export function getTranslationContributeUrl(
  targetLocale: string,
  slug?: string,
  branch: string = DEFAULT_DOCS_BRANCH,
  repoUrl: string = DEFAULT_DOCS_REPO_URL
): string {
  const mdxPath = resolveDocMdxPath(slug);
  return mdxPath
    ? `${repoUrl}/blob/${branch}/content/docs/en/${mdxPath}`
    : `${repoUrl}/tree/${branch}/content/docs/${targetLocale}`;
}

export interface TranslationNoticeProps {
  targetLocale: string;
  slug?: string;
  branch?: string;
  repoUrl?: string;
}

export function TranslationNotice({
  targetLocale,
  slug,
  branch = DEFAULT_DOCS_BRANCH,
  repoUrl = DEFAULT_DOCS_REPO_URL,
}: TranslationNoticeProps) {
  const lang = getLanguage(targetLocale);
  const langName = lang?.name ?? targetLocale;
  const contributeUrl = getTranslationContributeUrl(targetLocale, slug, branch, repoUrl);

  return (
    <aside
      role="alert"
      className="my-6 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-foreground backdrop-blur-xs transition-colors dark:border-amber-400/30 dark:bg-amber-400/10"
    >
      <div className="flex items-start gap-3">
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden="true" />
        <div className="flex-1 space-y-1">
          <p className="font-semibold text-amber-900 dark:text-amber-200">
            Authoritative English Content Displayed
          </p>
          <p className="text-muted-foreground leading-relaxed">
            This document is not yet officially translated into <strong className="text-foreground">{langName}</strong>. You are currently viewing the authoritative English documentation.
          </p>
          <div className="pt-2 flex flex-wrap items-center gap-3 text-xs">
            <a
              href={contributeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-medium text-primary hover:underline"
            >
              <GitFork className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Contribute a translation on GitHub</span>
            </a>
          </div>
        </div>
      </div>
    </aside>
  );
}
