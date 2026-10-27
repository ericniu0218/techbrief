import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Script } from 'node:vm';
import worker, { SOURCES, parseFeed, safeLink, summarize, deduplicate, collectNews } from '../worker/index.js';

const sample = `<rss><channel><item><title><![CDATA[AI &amp; science]]></title><link>https://example.org/story?utm_source=test&amp;id=42</link><description><![CDATA[<p>Researchers announced a new result.</p><script>alert('bad')</script>]]></description><pubDate>Mon, 26 Oct 2026 12:00:00 GMT</pubDate></item></channel></rss>`;

test('RSS normalizes dates and tracking URLs and strips markup', () => {
  const [article] = parseFeed(sample, SOURCES[4]);
  assert.equal(article.title, 'AI & science');
  assert.equal(article.url, 'https://example.org/story?id=42');
  assert.equal(article.summary, 'Researchers announced a new result.');
  assert.equal(article.publishedAt, '2026-10-26T12:00:00.000Z');
  assert.deepEqual(article.topics, ['Technology', 'AI', 'Science']);
});

test('Atom alternate links work and missing dates stay missing', () => {
  const [article] = parseFeed('<feed><entry><title>Example</title><link rel="self" href="https://example.org/feed"/><link rel="alternate" href="https://example.org/story"/><summary>Brief.</summary></entry></feed>', SOURCES[0]);
  assert.equal(article.url, 'https://example.org/story');
  assert.equal(article.publishedAt, null);
});

test('unsafe links, invalid documents, and external entities are rejected', () => {
  assert.equal(safeLink('javascript:alert(1)'), null);
  assert.equal(safeLink('http://example.org/story'), null);
  assert.throws(() => parseFeed('<html>Blocked</html>', SOURCES[0]), /Invalid feed/);
  assert.throws(() => parseFeed('<!DOCTYPE rss SYSTEM "file:///etc/passwd"><rss/>', SOURCES[0]), /Unsupported XML/);
});

test('summaries end at a sentence or word boundary and stay within the limit', () => {
  const text = 'A useful first sentence. ' + 'More information follows here. '.repeat(20);
  const shortened = summarize(text, 120);
  assert.ok(shortened.length <= 120);
  assert.ok(shortened.endsWith('.') || shortened.endsWith('…'));
  assert.equal(summarize('Short summary.'), 'Short summary.');
});

test('duplicate URLs and exact normalized headlines are suppressed', () => {
  const base = { title: 'A news story!', url: 'https://example.org/a' };
  assert.equal(deduplicate([base, { ...base }, { title: 'A News Story', url: 'https://example.org/b' }]).length, 1);
});

test('a failed publisher retains only its own previous stories while other feeds succeed', async () => {
  const old = { ...parseFeed(sample, SOURCES[0])[0], title: 'Previously fetched report', id: 'https://example.org/old', url: 'https://example.org/old' };
  const result = await collectNews(async url => {
    if (url === SOURCES[0].url) throw new Error('Offline');
    return new Response(sample.replace('AI &amp; science', 'Report ' + SOURCES.find(s => s.url === url).id).replace('id=42', 'id=' + SOURCES.find(s => s.url === url).id));
  }, { articles: [old] });
  assert.equal(result.sources[0].status, 'stale');
  assert.equal(result.sources[1].status, 'live');
  assert.equal(result.sources[0].count, 1);
  assert.ok(result.articles.some(a => a.url === old.url));
  assert.equal(result.articles.length, 6);
});

test('an all-source failure returns an explicit empty edition, not invented stories', async () => {
  const result = await collectNews(async () => new Response('Blocked', { status: 503 }));
  assert.equal(result.articles.length, 0);
  assert.ok(result.sources.every(s => s.status === 'unavailable'));
});

test('worker serves a valid client script, app shell and source plan; rejects unknown routes and writes', async () => {
  const request = path => worker.fetch(new Request('http://localhost' + path), {}, {});
  const home = await request('/');
  assert.equal(home.status, 200);
  assert.match(await home.text(), /Your daily perspective/);
  const script = await request('/app.js');
  const client = await script.text();
  assert.doesNotThrow(() => new Script(client));
  assert.match(await (await request('/source-plan')).text(), /STUDENT SUBSCRIPTION/);
  assert.equal((await request('/missing')).status, 404);
  assert.equal((await worker.fetch(new Request('http://localhost/', { method: 'POST' }))).status, 405);
  assert.ok(home.headers.get('Content-Security-Policy').includes("script-src 'self'"));
});
