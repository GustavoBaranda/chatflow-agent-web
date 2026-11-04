import { safeJsonLdReplacer } from '@/lib/structured-data';

interface JsonLdProps {
  data: Record<string, unknown> | Array<Record<string, unknown>>;
}

/**
 * Renders a secure application/ld+json script tag with safely escaped JSON.
 */
export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: safeJsonLdReplacer(data),
      }}
    />
  );
}

