import assert from 'node:assert/strict';
import worker from '../worker/index.js';

const response = await worker.fetch(new Request('https://techbrief.example/api/news'), {}, {});
assert.equal(response.status, 200);
const edition = await response.json();
console.log(JSON.stringify({
  articles: edition.articles.length,
  mix: edition.mix,
  explore: edition.explore.articles.map(({ title, exploreCategory, source, evidenceKind, bullets }) => ({ title, category: exploreCategory, source, evidenceKind, bulletCount: bullets.length })),
  fetchedAt: edition.fetchedAt,
  stories: edition.articles.map(({ rank, title, bullets, summaryBasis }) => ({ rank, title, bulletCount: bullets.length, summaryBasis })),
  sources: edition.sources.map(({ name, status, count, error }) => ({ name, status, count, error })),
}, null, 2));
assert.ok(edition.articles.length > 0, 'At least one feed must return usable articles');
assert.ok(edition.articles.length <= 10, 'A briefing must contain at most ten stories');
assert.equal(edition.mix.technology + edition.mix.news, edition.articles.length);
assert.deepEqual(edition.mix.target, { technology: 8, news: 2 });
assert.ok(edition.articles.every(a => a.bullets.length > 0 && a.bullets.length <= 5), 'Every story needs one to five bullets');
assert.ok(edition.articles.some(a => a.group === 'News'), 'General news must be available');
assert.ok(edition.articles.some(a => a.group === 'Technology'), 'Technology news must be available');
assert.ok(edition.articles.every(a => a.url.startsWith('https://') && a.summary.length <= 300));
assert.ok(edition.explore.articles.length > 0 && edition.explore.articles.length <= 6, 'One to six separate discovery picks must be available');
assert.ok(edition.explore.articles.every(a => a.bullets.length > 0 && a.bullets.length <= 5));
assert.ok(edition.explore.articles.every(a => !edition.articles.some(b => b.url === a.url)), 'Discovery picks must not repeat the daily brief');
assert.ok(edition.explore.articles.every(a => !('sourceText' in a)), 'Full article bodies must stay on the server');
assert.ok(edition.explore.articles.filter(a => a.evidenceKind === 'maker').length <= 2);
