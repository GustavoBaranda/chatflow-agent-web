import React from 'react';
import { CheckCircle2, Sparkles, AlertOctagon } from 'lucide-react';

export interface VersionBadgeProps {
  version?: string;
  status?: 'stable' | 'prerelease' | 'deprecated';
  children?: React.ReactNode;
  className?: string;
}

export function VersionBadge({
  version = '0.3.4',
  status = 'stable',
  children,
  className = '',
}: VersionBadgeProps) {
  const isPrerelease = status === 'prerelease' || version.includes('rc') || version.includes('dev');
  const isDeprecated = status === 'deprecated';

  if (isDeprecated) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/60 ${className}`}
        role="status"
        aria-label={`Deprecated in ${version}`}
      >
        <AlertOctagon className="h-3 w-3 shrink-0" aria-hidden="true" />
        <span>{children || `Deprecated (${version})`}</span>
      </span>
    );
  }

  if (isPrerelease) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800/60 ${className}`}
        role="status"
        aria-label={`Prerelease feature: ${version}`}
      >
        <Sparkles className="h-3 w-3 shrink-0" aria-hidden="true" />
        <span>{children || `Prerelease (${version})`}</span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60 ${className}`}
      role="status"
      aria-label={`Stable version ${version}`}
    >
      <CheckCircle2 className="h-3 w-3 shrink-0" aria-hidden="true" />
      <span>{children || `Stable (${version})`}</span>
    </span>
  );
}
