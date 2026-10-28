import type { Variants } from 'framer-motion';

export const menuSlide: Variants = {
  initial: { x: '100%' },
  enter: {
    x: '0%',
    transition: { duration: 0.5, ease: [0.76, 0, 0.24, 1] },
  },
  exit: {
    x: '100%',
    transition: { duration: 0.5, ease: [0.76, 0, 0.24, 1] },
  },
};

export const slide: Variants = {
  initial: { x: 60, opacity: 0 },
  enter: (i: number) => ({
    x: 0,
    opacity: 1,
    transition: { duration: 0.5, ease: [0.76, 0, 0.24, 1], delay: 0.04 * i },
  }),
  exit: (i: number) => ({
    x: 60,
    opacity: 0,
    transition: { duration: 0.4, ease: [0.76, 0, 0.24, 1], delay: 0.02 * i },
  }),
};
