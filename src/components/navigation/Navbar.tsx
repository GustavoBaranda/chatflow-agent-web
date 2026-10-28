'use client';

import { useState, useRef } from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { GitHubIcon } from '@/components/ui/icons';
import { LanguageSelector } from './LanguageSelector';
import { ThemeToggle } from './ThemeToggle';
import { MenuToggle } from './MenuToggle';
import { MobileDrawer } from './MobileDrawer';

export function Navbar() {
  const t = useTranslations('navigation');
  const tCommon = useTranslations('common');
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const menuToggleRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      {/* Skip to Content Accessible Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground focus:shadow-lg focus:outline-hidden"
      >
        {tCommon('skipToContent')}
      </a>

      <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Brand Logo & Title */}
          <Link
            href="/"
            className="group flex items-center gap-2.5 font-bold tracking-tight text-foreground transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-primary"
            aria-label="chatflow-agent home"
          >
            <Image
              src="/brand/logo-symbol.svg"
              alt="chatflow-agent logo"
              width={32}
              height={32}
              className="h-8 w-8 object-contain transition-transform duration-200 group-hover:scale-105"
              priority
            />
            <span className="text-base sm:text-lg font-bold">
              chatflow<span className="bg-gradient-to-r from-blue-500 to-violet-500 bg-clip-text text-transparent">-agent</span>
            </span>
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

          {/* Right actions: LanguageSelector, ThemeToggle, GitHub link, MenuToggle */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden sm:block">
              <LanguageSelector />
            </div>

            <ThemeToggle />

            <a
              href="https://github.com/GustavoBaranda/chatflow-agent"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-primary"
              aria-label={t('github')}
            >
              <GitHubIcon className="h-4 w-4" />
            </a>

            {/* Mobile Animated Hamburger Button */}
            <MenuToggle
              ref={menuToggleRef}
              active={isMobileOpen}
              onToggle={() => setIsMobileOpen((prev) => !prev)}
            />
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <MobileDrawer
        isOpen={isMobileOpen}
        onClose={() => setIsMobileOpen(false)}
        triggerRef={menuToggleRef}
      />
    </>
  );
}
