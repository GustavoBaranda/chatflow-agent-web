import { describe, it, expect } from 'vitest';
import * as navigation from '@/i18n/navigation';
import { menuSlide, slide } from '@/components/navigation/Animation';

describe('Navigation Helpers', () => {
  it('should export Link, redirect, usePathname, useRouter and getPathname', () => {
    expect(navigation.Link).toBeDefined();
    expect(navigation.redirect).toBeDefined();
    expect(navigation.usePathname).toBeDefined();
    expect(navigation.useRouter).toBeDefined();
    expect(navigation.getPathname).toBeDefined();
  });
});

describe('Navigation Animation Variants', () => {
  it('should define valid menuSlide variants for entering and exiting from right', () => {
    expect(menuSlide.initial).toEqual({ x: '100%' });
    expect(menuSlide.enter).toBeDefined();
    expect(menuSlide.exit).toBeDefined();
  });

  it('should define slide variants with custom index delay calculation', () => {
    expect(slide.initial).toEqual({ x: 60, opacity: 0 });
    if (typeof slide.enter === 'function') {
      const enterFn = slide.enter as (i: number) => { x: number; opacity: number };
      const target0 = enterFn(0);
      const target2 = enterFn(2);
      expect(target0.x).toBe(0);
      expect(target0.opacity).toBe(1);
      expect(target2.x).toBe(0);
    }
  });
});
