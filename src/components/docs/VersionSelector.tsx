'use client';

import { useState, useRef, useEffect, useId, useCallback } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ChevronDown, Check, GitBranch, Sparkles, CheckCircle2 } from 'lucide-react';
import {
  ALL_DOC_TRACKS,
  getVersionConfig,
  resolveVersionSwitchUrl,
  type DocVersionTrack,
} from '@/config/docs-versions';

export interface VersionSelectorProps {
  className?: string;
}

export function VersionSelector({ className = '' }: VersionSelectorProps) {
  const t = useTranslations('versionSelector');
  const locale = useLocale();
  const pathname = usePathname() || '';
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listboxId = useId();

  // Detect active version track from current pathname
  const activeTrack: DocVersionTrack = pathname.includes('/docs/v0.4') ? 'v0.4' : 'v0.3';
  const activeConfig = getVersionConfig(activeTrack);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen]);

  const handleSelect = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <div className={`relative inline-block text-left ${className}`} ref={containerRef}>
      <button
        ref={triggerRef}
        type="button"
        className="flex w-full items-center justify-between gap-2 rounded-lg border border-border bg-card/90 px-3 py-2 text-xs font-medium text-foreground transition-all hover:bg-muted hover:border-border/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary cursor-pointer shadow-xs"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls={listboxId}
        aria-label={t('switchVersion')}
        data-testid="version-selector-trigger"
      >
        <div className="flex items-center gap-2 truncate">
          <GitBranch className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
          <span className="font-semibold">{activeConfig.track}</span>
          <span
            className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium leading-none ${
              activeConfig.status === 'prerelease'
                ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300'
                : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
            }`}
          >
            {activeConfig.badgeLabel}
          </span>
          <span className="text-[11px] text-muted-foreground truncate hidden sm:inline">
            ({activeConfig.sdkVersion})
          </span>
        </div>
        <ChevronDown
          className={`h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <ul
          id={listboxId}
          role="listbox"
          aria-label={t('label')}
          className="absolute left-0 right-0 z-50 mt-1 min-w-[220px] rounded-lg border border-border bg-card p-1 shadow-xl ring-1 ring-black/5 focus:outline-hidden backdrop-blur-md"
          data-testid="version-selector-listbox"
        >
          {ALL_DOC_TRACKS.map((track) => {
            const config = getVersionConfig(track);
            const isSelected = track === activeTrack;
            const targetUrl = resolveVersionSwitchUrl({
              currentPathname: pathname,
              targetTrack: track,
              locale,
            });

            return (
              <li
                key={track}
                role="option"
                aria-selected={isSelected}
                className="list-none"
              >
                <Link
                  href={targetUrl}
                  onClick={handleSelect}
                  className={`flex items-center justify-between gap-3 rounded-md px-3 py-2 text-xs transition-colors outline-hidden hover:bg-muted focus-visible:bg-muted ${
                    isSelected ? 'bg-muted/70 font-medium text-foreground' : 'text-muted-foreground hover:text-foreground'
                  }`}
                  data-testid={`version-option-${track}`}
                >
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <div className="flex items-center gap-2">
                      {config.status === 'prerelease' ? (
                        <Sparkles className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400 shrink-0" aria-hidden="true" />
                      ) : (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" aria-hidden="true" />
                      )}
                      <span className="font-semibold text-foreground">{config.label}</span>
                    </div>
                    <span className="text-[11px] text-muted-foreground ps-5.5">
                      SDK {config.sdkVersion}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span
                      className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium leading-none ${
                        config.status === 'prerelease'
                          ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300'
                          : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                      }`}
                    >
                      {config.badgeLabel}
                    </span>
                    {isSelected && (
                      <Check className="h-3.5 w-3.5 text-primary shrink-0" aria-hidden="true" />
                    )}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
