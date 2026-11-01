'use client';

import { usePathname } from 'next/navigation';
import DefaultSearchDialog, {
  type DefaultSearchDialogProps,
} from 'fumadocs-ui/components/dialog/search-default';
import type { DocVersionTrack } from '@/config/docs-versions';

/**
 * Version-Aware Search Dialog component.
 *
 * Automatically detects the current documentation track from the active URL path,
 * defaulting to the stable v0.3 track for unversioned routes or home pages, and
 * scoping queries to v0.4 when browsing prerelease documentation.
 *
 * Prevents DOM leakage when closed and removes redundant global version tags
 * that duplicate the functional version selector.
 */
export function DocsSearchDialog(props: DefaultSearchDialogProps) {
  const pathname = usePathname() || '';

  // Determine active track: explicitly v0.4 if inside prerelease docs, else stable v0.3
  const activeTrack: DocVersionTrack = pathname.includes('/docs/v0.4') ? 'v0.4' : 'v0.3';

  // Do not render anything into DOM when dialog is closed to prevent footer leakage above navbar
  if (!props.open) {
    return null;
  }

  return (
    <DefaultSearchDialog
      {...props}
      defaultTag={props.defaultTag ?? activeTrack}
    />
  );
}
