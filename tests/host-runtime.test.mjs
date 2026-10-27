import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mock } from 'node:test';
import worker, { SOURCES } from '../worker/index.js';

test('news endpoint works when the host prohibits the Cache API and reuses its in-memory edition', async () => {
  const originalCaches = Object.getOwnPropertyDescriptor(globalThis, 'caches');
  Object.defineProperty(globalThis, 'caches', {
    configurable: true,
    get() { throw new Error('This Worker is not permitted to access the default cache.'); },
  });
  const fetchMock = mock.method(globalThis, 'fetch', async url => {
    const source = SOURCES.find(s => s.url === url);
    return new Response(`<rss><channel><item><title>Report from ${source.id}</title><link>https://example.org/${source.id}</link><description>Publisher summary.</description><pubDate>${new Date().toUTCString()}</pubDate></item></channel></rss>`);
  });
  try {
    const first = await worker.fetch(new Request('https://techbrief.example/api/news'), {}, {});
    assert.equal(first.status, 200);
    assert.equal(first.headers.get('Cache-Control'), 'private, max-age=60');
    const data = await first.json();
    assert.equal(data.articles.length, SOURCES.length);
    assert.ok(data.sources.every(s => s.status === 'live'));
    assert.equal(fetchMock.mock.callCount(), SOURCES.length);

    const second = await worker.fetch(new Request('https://techbrief.example/api/news'), {}, {});
    const next = await second.json();
    assert.deepEqual(next.articles, data.articles);
    assert.equal(next.fetchedAt, data.fetchedAt);
    assert.equal(fetchMock.mock.callCount(), SOURCES.length, 'A warm instance should reuse its fetched edition');
  } finally {
    fetchMock.mock.restore();
    if (originalCaches) Object.defineProperty(globalThis, 'caches', originalCaches);
    else delete globalThis.caches;
  }
});
