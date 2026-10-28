'use client';

import { useState, useRef, useEffect, useId } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { SUPPORTED_LANGUAGES, getLanguage } from '@/config/languages';
import { Globe, ChevronDown, Check } from 'lucide-react';

export function LanguageSelector() {
  const t = useTranslations('languageSelector');
  const currentLocale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
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

  // Handle escape key to close
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen]);

  function switchLanguage(newLocale: string) {
    if (newLocale === currentLocale) {
      setIsOpen(false);
      return;
    }
    setIsOpen(false);
    router.replace(pathname, { locale: newLocale });
  }

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      <button
        type="button"
        className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground shadow-xs hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls={listboxId}
        aria-label={t('changeLanguage')}
      >
        <Globe className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
        <span>{currentLanguage.localName}</span>
        <ChevronDown
          className={`h-3 w-3 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <ul
          id={listboxId}
          role="listbox"
          aria-label={t('label')}
          className="absolute right-0 z-50 mt-1 min-w-[140px] origin-top-right rounded-md border border-border bg-card p-1 shadow-lg ring-1 ring-black/5 focus:outline-hidden"
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
                className={`flex cursor-pointer items-center justify-between rounded-sm px-2.5 py-1.5 text-xs transition-colors outline-hidden hover:bg-muted focus-visible:bg-muted ${
                  isSelected ? 'font-semibold text-primary' : 'text-foreground'
                }`}
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
