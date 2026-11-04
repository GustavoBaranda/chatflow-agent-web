import { source } from '@/lib/source';
import { createFromSource } from 'fumadocs-core/search/server';
import { DEFAULT_STABLE_TRACK } from '@/config/docs-versions';

const searchServer = createFromSource(source, {
  buildIndex: async (page) => {
    // Isolate by documentation version track ('v0.3' or 'v0.4')
    const track = page.slugs[0] === 'v0.4' ? 'v0.4' : 'v0.3';
    const data = page.data as {
      structuredData: unknown;
      title?: string;
      description?: string;
    };

    const structuredData =
      typeof data.structuredData === 'function'
        ? await data.structuredData()
        : data.structuredData;

    return {
      id: page.url,
      url: page.url,
      title: data.title ?? page.path,
      description: data.description,
      structuredData: structuredData as never,
      tag: track,
    };
  },
});

export async function GET(request: Request) {
  const url = new URL(request.url);
  const tagParam = url.searchParams.get('tag');
  const versionParam = url.searchParams.get('version');

  // Map version parameter to tag if supplied
  if (versionParam && !tagParam) {
    url.searchParams.set('tag', versionParam);
  } else if (!tagParam && !versionParam) {
    // Unversioned legacy search queries default to the current stable track
    url.searchParams.set('tag', DEFAULT_STABLE_TRACK);
  }

  const modifiedRequest = new Request(url.toString(), {
    method: request.method,
    headers: request.headers,
  });

  return searchServer.GET(modifiedRequest);
}
