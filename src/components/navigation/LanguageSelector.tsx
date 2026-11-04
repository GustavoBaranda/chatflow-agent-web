'use client';

import { useState, useRef, useEffect, useId } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { SUPPORTED_LANGUAGES, getLanguage } from '@/config/languages';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface LanguageSelectorProps {
  side?: 'top' | 'bottom';
  align?: 'start' | 'end';
  onSelect?: () => void;
}

export function LanguageSelector({
  side = 'bottom',
  align = 'end',
  onSelect,
}: LanguageSelectorProps) {
  const t = useTranslations('languageSelector');
  const currentLocale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listboxId = useId();

  const currentLanguage = getLanguage(currentLocale);

  // Close dropdown when clicking outside
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

  // Handle escape key to close and restore focus
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && isOpen) {
        event.preventDefault();
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen]);

  function switchLanguage(newLocale: string) {
    setIsOpen(false);
    onSelect?.();
    if (newLocale === currentLocale) {
      return;
    }
    router.replace(pathname, { locale: newLocale });
  }

  function handleListboxKeyDown(event: React.KeyboardEvent<HTMLUListElement>) {
    const items = containerRef.current?.querySelectorAll<HTMLElement>('[role="option"]');
    if (!items || items.length === 0) return;

    const currentIndex = Array.from(items).indexOf(document.activeElement as HTMLElement);

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      const nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
      items[nextIndex].focus();
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      const prevIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
      items[prevIndex].focus();
    }
  }

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      <button
        ref={triggerRef}
        type="button"
        className="inline-flex h-9 items-center gap-2 rounded-lg border border-border bg-card px-3 text-xs font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary cursor-pointer"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls={listboxId}
        aria-label={t('changeLanguage')}
      >
        <Globe className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
        <span>{currentLanguage.localName}</span>
        <ChevronDown
          className={cn(
            'h-3 w-3 text-muted-foreground transition-transform',
            isOpen ? (side === 'top' ? '-rotate-180' : 'rotate-180') : ''
          )}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <ul
          id={listboxId}
          role="listbox"
          aria-label={t('label')}
          onKeyDown={handleListboxKeyDown}
          className={cn(
            'absolute z-50 min-w-[150px] rounded-md border border-border bg-card p-1 shadow-lg ring-1 ring-black/5 focus:outline-hidden',
            side === 'top'
              ? 'bottom-full mb-1.5 origin-bottom-right'
              : 'top-full mt-1.5 origin-top-right',
            align === 'start' ? 'left-0' : 'right-0'
          )}
        >
          {SUPPORTED_LANGUAGES.map((lang) => {
            const isSelected = lang.code === currentLocale;
            return (
              <li
                key={lang.code}
                role="option"
                aria-selected={isSelected}
                tabIndex={0}
                onClick={() => switchLanguage(lang.code)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    switchLanguage(lang.code);
                  }
                }}
                className={cn(
                  'flex cursor-pointer items-center justify-between rounded-sm px-2.5 py-1.5 text-xs transition-colors outline-hidden hover:bg-muted focus-visible:bg-muted',
                  isSelected ? 'font-semibold text-primary' : 'text-foreground'
                )}
              >
                <span className="flex items-center gap-1.5">
                  <span>{lang.localName}</span>
                </span>
                {isSelected && <Check className="h-3.5 w-3.5 text-primary" aria-hidden="true" />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
