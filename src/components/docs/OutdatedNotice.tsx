import { AlertTriangle, History } from 'lucide-react';

interface OutdatedNoticeProps {
  sourceRevision?: string;
  slug?: string;
}

export function OutdatedNotice({
  sourceRevision,
  slug,
}: OutdatedNoticeProps) {
  return (
    <aside
      role="alert"
      className="my-6 rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4 text-sm text-foreground backdrop-blur-xs transition-colors dark:border-yellow-400/30 dark:bg-yellow-400/10"
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-yellow-600 dark:text-yellow-400" aria-hidden="true" />
        <div className="flex-1 space-y-1">
          <p className="font-semibold text-yellow-900 dark:text-yellow-200">
            Outdated Translation
          </p>
          <p className="text-muted-foreground leading-relaxed">
            This localized article was translated from an earlier revision of the authoritative English documentation {sourceRevision ? `(${sourceRevision})` : ''} and may not reflect recent updates.
          </p>
          {sourceRevision && (
            <div className="pt-2 flex flex-wrap items-center gap-3 text-xs">
              <a
                href={`https://github.com/GustavoBaranda/chatflow-agent/commits/main/content/docs/en/${slug ? `${slug}.mdx` : ''}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-medium text-primary hover:underline"
              >
                <History className="h-3.5 w-3.5" aria-hidden="true" />
                <span>View revision history on GitHub</span>
              </a>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
