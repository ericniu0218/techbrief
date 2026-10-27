import assert from 'node:assert/strict';
import worker from '../worker/index.js';

const response = await worker.fetch(new Request('https://techbrief.example/api/news'), {}, {});
assert.equal(response.status, 200);
const edition = await response.json();
console.log(JSON.stringify({
  articles: edition.articles.length,
  fetchedAt: edition.fetchedAt,
  stories: edition.articles.map(({ rank, title, bullets, summaryBasis }) => ({ rank, title, bulletCount: bullets.length, summaryBasis })),
  sources: edition.sources.map(({ name, status, count, error }) => ({ name, status, count, error })),
}, null, 2));
assert.ok(edition.articles.length > 0, 'At least one feed must return usable articles');
assert.ok(edition.articles.length <= 10, 'A briefing must contain at most ten stories');
assert.ok(edition.articles.every(a => a.bullets.length > 0 && a.bullets.length <= 5), 'Every story needs one to five bullets');
assert.ok(edition.articles.some(a => a.group === 'News'), 'General news must be available');
assert.ok(edition.articles.some(a => a.group === 'Technology'), 'Technology news must be available');
assert.ok(edition.articles.every(a => a.url.startsWith('https://') && a.summary.length <= 300));
