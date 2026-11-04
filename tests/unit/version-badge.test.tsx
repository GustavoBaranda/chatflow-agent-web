import React from 'react';
import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import { VersionBadge } from '@/components/docs/VersionBadge';

describe('VersionBadge Component', () => {
  it('renders default stable badge', () => {
    const html = renderToString(<VersionBadge />);
    expect(html).toContain('Stable (0.3.4)');
    expect(html).toContain('bg-emerald-50');
  });

  it('renders prerelease badge for rc versions', () => {
    const html = renderToString(<VersionBadge version="0.4.0rc1" status="prerelease" />);
    expect(html).toContain('Prerelease (0.4.0rc1)');
    expect(html).toContain('bg-purple-50');
  });

  it('renders deprecated badge when status is deprecated', () => {
    const html = renderToString(<VersionBadge version="0.2.0" status="deprecated" />);
    expect(html).toContain('Deprecated (0.2.0)');
    expect(html).toContain('bg-rose-50');
  });

  it('renders custom children when provided', () => {
    const html = renderToString(<VersionBadge version="0.4.0rc1" status="prerelease">New in v0.4.0rc1</VersionBadge>);
    expect(html).toContain('New in v0.4.0rc1');
  });
});
