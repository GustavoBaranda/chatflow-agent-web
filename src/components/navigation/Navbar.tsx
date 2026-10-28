'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Menu, Bot } from 'lucide-react';
import { GitHubIcon } from '@/components/ui/icons';
import { LanguageSelector } from './LanguageSelector';
import { MobileDrawer } from './MobileDrawer';

export function Navbar() {
  const t = useTranslations('navigation');
  const tCommon = useTranslations('common');
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <>
      {/* Skip to Content Accessible Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground focus:shadow-lg focus:outline-hidden"
      >
        {tCommon('skipToContent')}
      </a>

      <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Brand Logo & Title */}
          <Link
            href="/"
            className="flex items-center gap-2 font-bold tracking-tight text-foreground transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-primary"
            aria-label="chatflow-agent home"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs">
              <Bot className="h-4 w-4" aria-hidden="true" />
            </div>
            <span className="text-base sm:text-lg">chatflow-agent</span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden items-center gap-6 md:flex" aria-label="Main navigation">
            <Link
              href="/docs"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-primary"
            >
              {t('docs')}
            </Link>
            <Link
              href="/community"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-primary"
            >
              {t('community')}
            </Link>
          </nav>

          {/* Right actions: LanguageSelector, GitHub link, Mobile hamburger */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:block">
              <LanguageSelector />
            </div>

            <a
              href="https://github.com/GustavoBaranda/chatflow-agent"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-primary"
              aria-label={t('github')}
            >
              <GitHubIcon className="h-4 w-4" />
            </a>

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-primary md:hidden"
              onClick={() => setIsMobileOpen(true)}
              aria-expanded={isMobileOpen}
              aria-label={t('menu')}
            >
              <Menu className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <MobileDrawer isOpen={isMobileOpen} onClose={() => setIsMobileOpen(false)} />
    </>
  );
}
