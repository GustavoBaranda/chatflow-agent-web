import { describe, it, expect } from 'vitest';
import { cn } from '@/lib/utils';

describe('Smoke Test Suite', () => {
  it('should verify vitest is operational', () => {
    expect(true).toBe(true);
  });

  it('should correctly merge tailwind classes with cn utility', () => {
    const result = cn('px-2 py-1', 'bg-blue-500', { 'text-white': true, hidden: false });
    expect(result).toBe('px-2 py-1 bg-blue-500 text-white');
  });

  it('should resolve conflicting tailwind classes', () => {
    const result = cn('p-4', 'p-2');
    expect(result).toBe('p-2');
  });
});
