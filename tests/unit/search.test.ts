import { describe, it, expect } from 'vitest';
import { GET } from '@/app/api/search/route';

describe('Version-Aware Documentation Search API Suite (Phase 6D)', () => {
  it('defaults unversioned requests to stable track (v0.3)', async () => {
    const req = new Request('http://localhost:3000/api/search?query=agents');
    const res = await GET(req);
    expect(res.status).toBe(200);

    const results = await res.json();
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBeGreaterThan(0);

    // All results must be strictly from v0.3
    for (const item of results) {
      expect(item.url).toContain('/docs/v0.3');
      expect(item.url).not.toContain('/docs/v0.4');
    }
  });

  it('isolates v0.3 search results when tag=v0.3 is requested', async () => {
    const req = new Request('http://localhost:3000/api/search?query=agents&tag=v0.3');
    const res = await GET(req);
    expect(res.status).toBe(200);

    const results = await res.json();
    expect(results.length).toBeGreaterThan(0);

    for (const item of results) {
      expect(item.url).toContain('/docs/v0.3');
      expect(item.url).not.toContain('/docs/v0.4');
    }
  });

  it('isolates v0.4 search results when tag=v0.4 is requested', async () => {
    const req = new Request('http://localhost:3000/api/search?query=agents&tag=v0.4');
    const res = await GET(req);
    expect(res.status).toBe(200);

    const results = await res.json();
    expect(results.length).toBeGreaterThan(0);

    for (const item of results) {
      expect(item.url).toContain('/docs/v0.4');
      expect(item.url).not.toContain('/docs/v0.3');
    }
  });

  it('supports version parameter as an alias for tag', async () => {
    const req = new Request('http://localhost:3000/api/search?query=agents&version=v0.4');
    const res = await GET(req);
    expect(res.status).toBe(200);

    const results = await res.json();
    expect(results.length).toBeGreaterThan(0);

    for (const item of results) {
      expect(item.url).toContain('/docs/v0.4');
      expect(item.url).not.toContain('/docs/v0.3');
    }
  });

  it('respects locale filtering and returns localized URLs', async () => {
    const req = new Request('http://localhost:3000/api/search?query=documentaci%C3%B3n&locale=es&tag=v0.3');
    const res = await GET(req);
    expect(res.status).toBe(200);

    const results = await res.json();
    expect(results.length).toBeGreaterThan(0);

    for (const item of results) {
      expect(item.url).toContain('/es/docs/v0.3');
      expect(item.url).not.toContain('/v0.4');
    }
  });

  it('preserves English fallback for untranslated content under localized locale', async () => {
    const req = new Request('http://localhost:3000/api/search?query=runner&locale=es&tag=v0.3');
    const res = await GET(req);
    expect(res.status).toBe(200);

    const results = await res.json();
    expect(results.length).toBeGreaterThan(0);

    for (const item of results) {
      expect(item.url).toContain('/es/docs/v0.3');
      expect(item.url).not.toContain('/docs/v0.4');
    }
  });

  it('does not leak prerelease-only topics into stable search results', async () => {
    // When searching for turn_timeout (prerelease feature in error-handling) in v0.3
    const req = new Request('http://localhost:3000/api/search?query=turn_timeout&tag=v0.3');
    const res = await GET(req);
    expect(res.status).toBe(200);

    const results = await res.json();
    for (const item of results) {
      expect(item.url).not.toContain('/docs/v0.4');
    }
  });

  it('returns empty array when query is empty', async () => {
    const req = new Request('http://localhost:3000/api/search?query=');
    const res = await GET(req);
    expect(res.status).toBe(200);

    const results = await res.json();
    expect(results).toEqual([]);
  });
});
