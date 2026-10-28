'use client';

import { useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { X, BookOpen, Users } from 'lucide-react';
import { GitHubIcon } from '@/components/ui/icons';
import { LanguageSelector } from './LanguageSelector';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileDrawer({ isOpen, onClose }: MobileDrawerProps) {
  const t = useTranslations('navigation');
  const drawerRef = useRef<HTMLDivElement>(null);

  // Close on Escape key press
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label={t('menu')}>
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <div
        ref={drawerRef}
        className="fixed inset-y-0 right-0 z-50 w-full max-w-xs border-l border-border bg-card p-6 shadow-xl transition-transform"
      >
        <div className="flex items-center justify-between border-b border-border pb-4">
          <span className="font-bold tracking-tight text-foreground">chatflow-agent</span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-primary"
            aria-label={t('closeMenu')}
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <nav className="mt-6 flex flex-col space-y-4" aria-label="Mobile navigation">
          <Link
            href="/"
            onClick={onClose}
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
          >
            {t('home')}
          </Link>
          <Link
            href="/docs"
            onClick={onClose}
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
          >
            <BookOpen className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            {t('docs')}
          </Link>
          <Link
            href="/community"
            onClick={onClose}
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
          >
            <Users className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            {t('community')}
          </Link>
          <a
            href="https://github.com/GustavoBaranda/chatflow-agent"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
          >
            <GitHubIcon className="h-4 w-4 text-muted-foreground" />
            {t('github')}
          </a>
        </nav>

        <div className="mt-8 border-t border-border pt-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Language</span>
            <LanguageSelector />
          </div>
        </div>
      </div>
    </div>
  );
}
