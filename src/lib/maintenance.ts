/**
 * Maintenance mode configuration and utilities for chatflow-agent-web.
 *
 * Provides safe evaluation of maintenance mode status, Retry-After header parsing,
 * and static asset exclusion checking to prevent routing loops.
 */

export function isMaintenanceModeEnabled(): boolean {
  return process.env.MAINTENANCE_MODE === 'true';
}

export function getMaintenanceRetryAfter(): number {
  const parsed = parseInt(process.env.MAINTENANCE_RETRY_AFTER || '', 10);
  // Default to 3600 seconds (1 hour) if invalid or unspecified
  if (isNaN(parsed) || parsed <= 0) {
    return 3600;
  }
  return parsed;
}

export function getMaintenanceEstimatedMinutes(): number {
  return Math.ceil(getMaintenanceRetryAfter() / 60);
}

const STATIC_EXTENSIONS = [
  '.svg',
  '.png',
  '.jpg',
  '.jpeg',
  '.ico',
  '.webp',
  '.json',
  '.txt',
  '.xml',
  '.css',
  '.js',
  '.map',
  '.woff',
  '.woff2',
];

export function isStaticAsset(pathname: string): boolean {
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/brand') ||
    pathname.startsWith('/api') ||
    pathname === '/maintenance.html' ||
    pathname === '/favicon.ico' ||
    pathname === '/icon.svg' ||
    pathname === '/apple-icon.png' ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml'
  ) {
    return true;
  }

  const lower = pathname.toLowerCase();
  return STATIC_EXTENSIONS.some((ext) => lower.endsWith(ext));
}
