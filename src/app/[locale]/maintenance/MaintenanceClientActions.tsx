'use client';

import { RotateCcw, ArrowUpRight } from 'lucide-react';
import { GitHubIcon } from '@/components/ui/icons';

interface MaintenanceClientActionsProps {
  refreshLabel: string;
  githubLabel: string;
}

export function MaintenanceClientActions({
  refreshLabel,
  githubLabel,
}: MaintenanceClientActionsProps) {
  return (
    <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
      <button
        type="button"
        onClick={() => {
          if (typeof window !== 'undefined') {
            window.location.reload();
          }
        }}
        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:scale-98 cursor-pointer"
      >
        <RotateCcw className="h-4 w-4" aria-hidden="true" />
        <span>{refreshLabel}</span>
      </button>

      <a
        href="https://github.com/GustavoBaranda/chatflow-agent"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-border/80 bg-background/80 px-6 text-sm font-semibold text-foreground backdrop-blur-xs transition-all hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:scale-98"
      >
        <GitHubIcon className="h-4 w-4" aria-hidden="true" />
        <span>{githubLabel}</span>
        <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
      </a>
    </div>
  );
}
