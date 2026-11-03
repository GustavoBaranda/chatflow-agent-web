'use client';

import { useSyncExternalStore } from 'react';
import { flushSync } from 'react-dom';
import { useTheme } from 'next-themes';
import { useTranslations } from 'next-intl';
import { Sun, Moon } from 'lucide-react';

const emptySubscribe = () => () => {};

export function ThemeToggle() {
  const t = useTranslations('theme');
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);

  if (!mounted) {
    return (
      <button
        type="button"
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-colors"
        aria-label={t('toggle')}
      >
        <Sun className="h-4 w-4" aria-hidden="true" />
      </button>
    );
  }

  const isDark = resolvedTheme === 'dark';

  const handleToggle = () => {
    const next = isDark ? 'light' : 'dark';
    const reduceMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!reduceMotion && typeof document !== 'undefined' && typeof document.startViewTransition === 'function') {
      try {
        document.startViewTransition(() => {
          flushSync(() => {
            setTheme(next);
          });
        });
        return;
      } catch {
        // Fall back to direct setTheme if startViewTransition throws or is aborted
      }
    }

    setTheme(next);
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-primary cursor-pointer"
      aria-label={isDark ? t('light') : t('dark')}
      aria-pressed={isDark}
    >
      {isDark ? (
        <Moon className="h-4 w-4 transition-transform" aria-hidden="true" />
      ) : (
        <Sun className="h-4 w-4 transition-transform" aria-hidden="true" />
      )}
    </button>
  );
}
