'use client';

import { useEffect, useRef } from 'react';
import { AnimatePresence, motion, MotionConfig } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { BookOpen, Users, Home, Info } from 'lucide-react';
import { GitHubIcon } from '@/components/ui/icons';
import { cn } from '@/lib/utils';
import { LanguageSelector } from './LanguageSelector';
import { menuSlide, slide } from './Animation';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  triggerRef?: React.RefObject<HTMLButtonElement | null>;
}

export function MobileDrawer({ isOpen, onClose, triggerRef }: MobileDrawerProps) {
  const t = useTranslations('navigation');
  const tLang = useTranslations('languageSelector');
  const pathname = usePathname();
  const drawerRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Background isolation, scroll lock, and focus management on open
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

    // Move focus into the first focusable element inside the drawer on open
    const timer = setTimeout(() => {
      const drawer = drawerRef.current;
      if (!drawer) return;
      const firstFocusable = drawer.querySelector<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      firstFocusable?.focus({ preventScroll: true });
    }, 60);

    return () => {
      clearTimeout(timer);
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
            className="fixed inset-0 z-40 md:hidden pointer-events-none"
          >
            {/* Backdrop overlay starting below the navbar */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={onClose}
              className="fixed inset-x-0 top-14 bottom-0 z-40 bg-black/60 backdrop-blur-xs pointer-events-auto"
              aria-hidden="true"
            />

            {/* Drawer panel sliding in from the right below the navbar */}
            <motion.div
              ref={drawerRef}
              variants={menuSlide}
              initial="initial"
              animate="enter"
              exit="exit"
              className="fixed top-14 right-0 bottom-0 z-40 flex h-[calc(100dvh-3.5rem)] w-full max-w-xs flex-col border-l border-border bg-card shadow-2xl pointer-events-auto"
            >
              {/* Sidebar Header: Localized subtle heading */}
              <div className="flex h-12 shrink-0 items-center justify-between border-b border-border px-6">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {t('sidebarHeading')}
                </span>
              </div>

              {/* Staggered Navigation Items (scrollable on short mobile viewports) */}
              <nav
                className="flex flex-1 flex-col space-y-1.5 overflow-y-auto px-6 py-6"
                aria-label="Mobile navigation"
              >
                {navItems.map((item, index) => {
                  const Icon = item.icon;
                  const isActive =
                    item.href === '/'
                      ? pathname === '/'
                      : pathname === item.href || pathname.startsWith(`${item.href}/`);
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
                        aria-current={isActive ? 'page' : undefined}
                        className={cn(
                          'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-primary',
                          isActive
                            ? 'bg-muted font-semibold text-foreground'
                            : 'font-medium text-foreground hover:bg-muted'
                        )}
                      >
                        <Icon
                          className={cn('h-4 w-4', isActive ? 'text-primary' : 'text-muted-foreground')}
                          aria-hidden="true"
                        />
                        <span>{item.label}</span>
                      </Link>
                    </motion.div>
                  );
                })}

                {/* GitHub link in nav */}
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

              {/* Drawer Footer with LanguageSelector opening upwards (side="top") */}
              <motion.div
                variants={slide}
                custom={navItems.length + 1}
                initial="initial"
                animate="enter"
                exit="exit"
                className="mt-auto shrink-0 border-t border-border px-6 py-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-medium text-muted-foreground">
                    {tLang('label')}
                  </span>
                  <LanguageSelector side="top" onSelect={onClose} />
                </div>
              </motion.div>
            </motion.div>
          </div>
        </MotionConfig>
      )}
    </AnimatePresence>
  );
}
