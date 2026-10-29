'use client';

import { useEffect, useRef } from 'react';
import { AnimatePresence, motion, MotionConfig } from 'framer-motion';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { BookOpen, Users, Home, Info } from 'lucide-react';
import { GitHubIcon } from '@/components/ui/icons';
import { LanguageSelector } from './LanguageSelector';
import { ThemeToggle } from './ThemeToggle';
import { menuSlide, slide } from './Animation';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  triggerRef?: React.RefObject<HTMLButtonElement | null>;
}

export function MobileDrawer({ isOpen, onClose, triggerRef }: MobileDrawerProps) {
  const t = useTranslations('navigation');
  const tFooter = useTranslations('footer');
  const drawerRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Background isolation: Mark background inert and aria-hidden when open
  useEffect(() => {
    if (!isOpen) return;

    previousActiveElement.current = document.activeElement as HTMLElement | null;
    const triggerElement = triggerRef?.current;

    const mainContent = document.getElementById('main-content');
    const footer = document.querySelector('footer');

    mainContent?.setAttribute('inert', '');
    mainContent?.setAttribute('aria-hidden', 'true');
    footer?.setAttribute('inert', '');
    footer?.setAttribute('aria-hidden', 'true');

    document.documentElement.classList.add('menu-open');

    return () => {
      mainContent?.removeAttribute('inert');
      mainContent?.removeAttribute('aria-hidden');
      footer?.removeAttribute('inert');
      footer?.removeAttribute('aria-hidden');
      document.documentElement.classList.remove('menu-open');

      // Focus restoration
      if (triggerElement) {
        triggerElement.focus({ preventScroll: true });
      } else if (previousActiveElement.current) {
        previousActiveElement.current.focus({ preventScroll: true });
      }
    };
  }, [isOpen, triggerRef]);

  // Keyboard navigation: Escape key and Focus Trap
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key === 'Tab') {
        const drawer = drawerRef.current;
        if (!drawer) return;

        const focusableSelector =
          'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';
        const drawerFocusables = Array.from(
          drawer.querySelectorAll<HTMLElement>(focusableSelector)
        ).filter((el) => !el.hasAttribute('disabled') && el.offsetParent !== null);

        // Include trigger button in the focus loop if provided
        const allFocusables = triggerRef?.current
          ? [triggerRef.current, ...drawerFocusables]
          : drawerFocusables;

        if (allFocusables.length === 0) return;

        const firstElement = allFocusables[0];
        const lastElement = allFocusables[allFocusables.length - 1];

        if (event.shiftKey) {
          // Shift + Tab on first element wraps to last
          if (document.activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
          }
        } else {
          // Tab on last element wraps to first
          if (document.activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
          }
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, triggerRef]);

  // Auto-close on resize to desktop (md: 768px)
  useEffect(() => {
    if (!isOpen) return;
    const media = window.matchMedia('(min-width: 768px)');
    const handleResize = (e: MediaQueryListEvent | MediaQueryList) => {
      if (e.matches) {
        onClose();
      }
    };
    media.addEventListener('change', handleResize);
    return () => media.removeEventListener('change', handleResize);
  }, [isOpen, onClose]);

  const navItems = [
    { href: '/', label: t('home'), icon: Home },
    { href: '/docs', label: t('docs'), icon: BookOpen },
    { href: '/community', label: t('community'), icon: Users },
    { href: '/about', label: t('about'), icon: Info },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <MotionConfig reducedMotion="user">
          <div
            role="dialog"
            aria-modal="true"
            id="mobile-navigation"
            aria-label={t('menu')}
            className="fixed inset-0 z-40 md:hidden"
          >
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
              aria-hidden="true"
            />

            {/* Drawer panel sliding in from the right */}
            <motion.div
              ref={drawerRef}
              variants={menuSlide}
              initial="initial"
              animate="enter"
              exit="exit"
              className="fixed inset-y-0 right-0 z-40 flex h-full w-full max-w-xs flex-col border-l border-border bg-card px-6 pt-18 pb-6 shadow-2xl"
            >
              {/* Header info inside drawer (brand badge) */}
              <div className="flex items-center gap-2 border-b border-border pb-4">
                <Image
                  src="/brand/logo-symbol.svg"
                  alt="chatflow-agent logo"
                  width={26}
                  height={26}
                  className="h-6.5 w-6.5 object-contain"
                />
                <span className="text-base font-bold tracking-tight text-foreground">
                  chatflow<span className="bg-gradient-to-r from-blue-500 to-violet-500 bg-clip-text text-transparent">-agent</span>
                </span>
              </div>

              {/* Staggered Navigation Items */}
              <nav className="mt-6 flex flex-1 flex-col space-y-2" aria-label="Mobile navigation">
                {navItems.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <motion.div
                      key={item.href}
                      variants={slide}
                      custom={index}
                      initial="initial"
                      animate="enter"
                      exit="exit"
                    >
                      <Link
                        href={item.href}
                        onClick={onClose}
                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-primary"
                      >
                        <Icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                        <span>{item.label}</span>
                      </Link>
                    </motion.div>
                  );
                })}

                {/* GitHub Link in nav */}
                <motion.div
                  variants={slide}
                  custom={navItems.length}
                  initial="initial"
                  animate="enter"
                  exit="exit"
                >
                  <a
                    href="https://github.com/GustavoBaranda/chatflow-agent"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-primary"
                  >
                    <GitHubIcon className="h-4 w-4 text-muted-foreground" />
                    <span>{t('github')}</span>
                  </a>
                </motion.div>
              </nav>

              {/* Drawer Footer with ThemeToggle, LanguageSelector and License */}
              <motion.div
                variants={slide}
                custom={navItems.length + 1}
                initial="initial"
                animate="enter"
                exit="exit"
                className="mt-auto border-t border-border pt-5"
              >
                <div className="flex items-center justify-between gap-3">
                  <LanguageSelector />
                  <div className="flex items-center gap-2">
                    <ThemeToggle />
                    <a
                      href="https://github.com/GustavoBaranda/chatflow-agent"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-primary"
                      aria-label={t('github')}
                    >
                      <GitHubIcon className="h-4 w-4" />
                    </a>
                  </div>
                </div>
                <p className="mt-4 text-center text-xs text-muted-foreground">
                  {tFooter('license')}
                </p>
              </motion.div>
            </motion.div>
          </div>
        </MotionConfig>
      )}
    </AnimatePresence>
  );
}
