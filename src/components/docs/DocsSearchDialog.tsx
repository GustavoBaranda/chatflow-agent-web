'use client';

import { usePathname } from 'next/navigation';
import DefaultSearchDialog, {
  type DefaultSearchDialogProps,
} from 'fumadocs-ui/components/dialog/search-default';
import { DOC_VERSIONS, type DocVersionTrack } from '@/config/docs-versions';

/**
 * Version-Aware Search Dialog component.
 *
 * Automatically detects the current documentation track from the active URL path,
 * defaulting to the stable v0.3 track for unversioned routes or home pages, and
 * scoping queries to v0.4 when browsing prerelease documentation.
 *
 * Provides tag selectors in the dialog footer to allow seamless switching between
 * stable and prerelease documentation results.
 */
export function DocsSearchDialog(props: DefaultSearchDialogProps) {
  const pathname = usePathname() || '';

  // Determine active track: explicitly v0.4 if inside prerelease docs, else stable v0.3
  const activeTrack: DocVersionTrack = pathname.includes('/docs/v0.4') ? 'v0.4' : 'v0.3';

  return (
    <DefaultSearchDialog
      {...props}
      defaultTag={props.defaultTag ?? activeTrack}
      tags={[
        { name: DOC_VERSIONS['v0.3'].label, value: 'v0.3' },
        { name: DOC_VERSIONS['v0.4'].label, value: 'v0.4' },
      ]}
    />
  );
}
