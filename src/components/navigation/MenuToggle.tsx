'use client';

import { forwardRef, useSyncExternalStore } from 'react';
import { motion, MotionConfig } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

const motionQuery = '(prefers-reduced-motion: reduce)';

function subscribeMotion(notify: () => void) {
  if (typeof window === 'undefined') return () => {};
  const query = window.matchMedia(motionQuery);
  query.addEventListener('change', notify);
  return () => query.removeEventListener('change', notify);
}

const getReducedMotion = () =>
  typeof window !== 'undefined' ? window.matchMedia(motionQuery).matches : false;

export interface MenuToggleProps {
  active: boolean;
  onToggle: () => void;
  className?: string;
}

export const MenuToggle = forwardRef<HTMLButtonElement, MenuToggleProps>(
  function MenuToggle({ active, onToggle, className }, ref) {
    const t = useTranslations('navigation');
    const reducedMotion = useSyncExternalStore(subscribeMotion, getReducedMotion, () => false);

    return (
      <MotionConfig
        reducedMotion="never"
        transition={{
          duration: reducedMotion ? 0 : 0.45,
          ease: 'easeInOut',
        }}
      >
        <motion.button
          ref={ref}
          initial={false}
          type="button"
          aria-expanded={active}
          aria-controls="mobile-navigation"
          aria-haspopup="dialog"
          onClick={onToggle}
          className={cn(
            'relative z-50 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-card text-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-primary cursor-pointer md:hidden pointer-events-auto',
            className
          )}
          animate={active ? 'open' : 'closed'}
          aria-label={active ? t('closeMenu') : t('menu')}
        >
          {/* Top bar -> rotates 45deg to form top-left to bottom-right slash of the X */}
          <motion.span
            aria-hidden="true"
            className="absolute h-0.5 w-5 rounded-full bg-current"
            style={{ left: '50%', top: '35%', x: '-50%', y: '-50%' }}
            variants={{
              open: {
                rotate: ['0deg', '0deg', '45deg'],
                top: ['35%', '50%', '50%'],
              },
              closed: {
                rotate: ['45deg', '0deg', '0deg'],
                top: ['50%', '50%', '35%'],
              },
            }}
          />

          {/* Middle bar -> rotates -45deg to form bottom-left to top-right stroke */}
          <motion.span
            aria-hidden="true"
            className="absolute h-0.5 w-5 rounded-full bg-current"
            style={{ left: '50%', top: '50%', x: '-50%', y: '-50%' }}
            variants={{
              open: {
                rotate: ['0deg', '0deg', '-45deg'],
              },
              closed: {
                rotate: ['-45deg', '0deg', '0deg'],
              },
            }}
          />

          {/* Bottom bar -> half-width, animates to align and complete the X */}
          <motion.span
            aria-hidden="true"
            className="absolute h-0.5 w-2.5 rounded-full bg-current"
            style={{
              left: 'calc(50% - 5px)',
              bottom: '35%',
              x: '50%',
              y: '50%',
            }}
            variants={{
              open: {
                rotate: ['0deg', '0deg', '-45deg'],
                left: 'calc(50% - 10px)',
                bottom: ['35%', '50%', '50%'],
              },
              closed: {
                rotate: ['-45deg', '0deg', '0deg'],
                left: 'calc(50% - 5px)',
                bottom: ['50%', '50%', '35%'],
              },
            }}
          />
        </motion.button>
      </MotionConfig>
    );
  }
);
