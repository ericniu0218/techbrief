import assert from 'node:assert/strict';
import { collectNews } from '../worker/index.js';

const edition = await collectNews();
console.log(JSON.stringify({
  articles: edition.articles.length,
  fetchedAt: edition.fetchedAt,
  sources: edition.sources.map(({ name, status, count, error }) => ({ name, status, count, error })),
}, null, 2));
assert.ok(edition.articles.length > 0, 'At least one feed must return usable articles');
assert.ok(edition.articles.some(a => a.group === 'News'), 'General news must be available');
assert.ok(edition.articles.some(a => a.group === 'Technology'), 'Technology news must be available');
assert.ok(edition.articles.every(a => a.url.startsWith('https://') && a.summary.length <= 300));
