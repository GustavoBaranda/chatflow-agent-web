'use client';

import { useEffect, useRef } from 'react';
import { AnimatePresence, motion, MotionConfig } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { BookOpen, Users, Home, Info, Heart } from 'lucide-react';
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
  const tFoot = useTranslations('footer');
  const pathname = usePathname();
  const drawerRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Scroll lock, scroll restoration, background isolation, and focus management
  useEffect(() => {
    if (!isOpen) return;

    // 1. Capture exact scroll position before locking
    const scrollY = window.scrollY || document.documentElement.scrollTop;
    previousActiveElement.current = document.activeElement as HTMLElement | null;
    const triggerElement = triggerRef?.current;

    const mainContent = document.getElementById('main-content');
    const footer = document.querySelector('footer');

    mainContent?.setAttribute('inert', '');
    mainContent?.setAttribute('aria-hidden', 'true');
    footer?.setAttribute('inert', '');
    footer?.setAttribute('aria-hidden', 'true');

    // 2. Lock scroll on documentElement and body without shifting DOM elements
    const prevHtmlOverflow = document.documentElement.style.overflow;
    const prevBodyOverflow = document.body.style.overflow;
    const prevBodyTouchAction = document.body.style.touchAction;

    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';
    document.documentElement.classList.add('menu-open');

    // 3. Move focus into first focusable element inside drawer
    const timer = setTimeout(() => {
      const drawer = drawerRef.current;
      if (!drawer) return;
      const firstFocusable = drawer.querySelector<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      firstFocusable?.focus({ preventScroll: true });
    }, 50);

    return () => {
      clearTimeout(timer);
      mainContent?.removeAttribute('inert');
      mainContent?.removeAttribute('aria-hidden');
      footer?.removeAttribute('inert');
      footer?.removeAttribute('aria-hidden');

      // 4. Release scroll lock and restore exact scroll position
      document.documentElement.style.overflow = prevHtmlOverflow;
      document.body.style.overflow = prevBodyOverflow;
      document.body.style.touchAction = prevBodyTouchAction;
      document.documentElement.classList.remove('menu-open');

      window.scrollTo(0, scrollY);

      // 5. Restore focus to trigger element
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

        if (drawerFocusables.length === 0 && !triggerRef?.current) return;

        const trigger = triggerRef?.current;
        const allFocusables = trigger ? [trigger, ...drawerFocusables] : drawerFocusables;

        const firstElement = allFocusables[0];
        const lastElement = allFocusables[allFocusables.length - 1];

        if (event.shiftKey) {
          if (document.activeElement === firstElement || (trigger && (document.activeElement === trigger || trigger.contains(document.activeElement)))) {
            event.preventDefault();
            lastElement.focus();
          } else if (trigger && document.activeElement === drawerFocusables[0]) {
            event.preventDefault();
            trigger.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
          } else if (trigger && (document.activeElement === trigger || trigger.contains(document.activeElement))) {
            event.preventDefault();
            drawerFocusables[0]?.focus();
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
            className="fixed inset-0 top-14 z-40 md:hidden"
          >
            {/* Backdrop overlay covering the entire viewport below the persistent navbar */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={onClose}
              onTouchMove={(e) => e.preventDefault()}
              className="fixed inset-0 top-14 z-40 bg-black/60 backdrop-blur-xs touch-none"
              aria-hidden="true"
            />

            {/* Drawer panel anchored below the persistent navbar */}
            <motion.div
              ref={drawerRef}
              variants={menuSlide}
              initial="initial"
              animate="enter"
              exit="exit"
              className="fixed top-14 right-0 bottom-0 z-40 flex h-[calc(100vh-3.5rem)] h-[calc(100dvh-3.5rem)] w-full max-w-xs flex-col border-l border-border bg-card shadow-2xl"
            >
              {/* Navigation Items with comfortable >=44px touch targets and generous spacing */}
              <nav
                className="flex flex-1 flex-col space-y-2.5 overflow-y-auto px-5 py-6 sm:px-6"
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
                          'flex min-h-[44px] items-center gap-3.5 rounded-lg px-3.5 py-2.5 text-[15px] transition-colors focus-visible:outline-2 focus-visible:outline-primary',
                          isActive
                            ? 'bg-muted font-semibold text-foreground'
                            : 'font-medium text-foreground hover:bg-muted'
                        )}
                      >
                        <Icon
                          className={cn('h-5 w-5', isActive ? 'text-primary' : 'text-muted-foreground')}
                          aria-hidden="true"
                        />
                        <span>{item.label}</span>
                      </Link>
                    </motion.div>
                  );
                })}

                {/* Subtle visual separator before external GitHub link */}
                <motion.div
                  variants={slide}
                  custom={navItems.length}
                  initial="initial"
                  animate="enter"
                  exit="exit"
                  className="py-1"
                >
                  <div className="h-px w-full bg-border/60" role="separator" />
                </motion.div>

                {/* GitHub link in nav */}
                <motion.div
                  variants={slide}
                  custom={navItems.length + 1}
                  initial="initial"
                  animate="enter"
                  exit="exit"
                >
                  <a
                    href="https://github.com/GustavoBaranda/chatflow-agent"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex min-h-[44px] items-center gap-3.5 rounded-lg px-3.5 py-2.5 text-[15px] font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-primary"
                  >
                    <GitHubIcon className="h-5 w-5 text-muted-foreground" />
                    <span>{t('github')}</span>
                  </a>
                </motion.div>
              </nav>

              {/* Compact Bottom Section: Language Selector, Python SDK Attribution, Creator Signature & Sponsor */}
              <motion.div
                variants={slide}
                custom={navItems.length + 2}
                initial="initial"
                animate="enter"
                exit="exit"
                className="mt-auto shrink-0 border-t border-border bg-card/60 px-5 py-4 sm:px-6 pb-[max(1rem,env(safe-area-inset-bottom))] flex flex-col gap-3"
              >
                {/* Language Selector */}
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-medium text-muted-foreground">
                    {tLang('label')}
                  </span>
                  <LanguageSelector side="top" onSelect={onClose} />
                </div>

                <div className="h-px w-full bg-border/60" />

                {/* Attribution: Python SDK MIT License, Creator Signature, Sponsor & Contributor recognition */}
                <div className="flex flex-col gap-1.5 text-center text-[11px] leading-tight text-muted-foreground">
                  <p>{tFoot('sdkLicense')}</p>
                  <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
                    <a
                      href="https://gustavobaranda.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 font-medium text-foreground transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-primary"
                      aria-label="Gustavo Baranda Personal Website"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="/brand/gustavo-baranda.svg"
                        alt="Gustavo Baranda"
                        width={20}
                        height={20}
                        className="h-5 w-5 object-contain dark:brightness-0 dark:invert dark:opacity-65 transition-opacity hover:opacity-80"
                      />
                      <span>Gustavo Baranda · © 2026</span>
                    </a>
                    <span className="text-muted-foreground/50 select-none">•</span>
                    <a
                      href="https://github.com/sponsors/GustavoBaranda"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-medium text-pink-700 dark:text-pink-300 transition-colors hover:text-pink-600 dark:hover:text-pink-200 focus-visible:outline-2 focus-visible:outline-pink-500"
                      aria-label="GitHub Sponsors Gustavo Baranda"
                    >
                      <Heart className="h-3 w-3 fill-pink-500 text-pink-500" aria-hidden="true" />
                      <span>{tFoot('links.sponsor')}</span>
                    </a>
                    <span className="text-muted-foreground/50 select-none">•</span>
                    <span>contributors</span>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </MotionConfig>
      )}
    </AnimatePresence>
  );
}
