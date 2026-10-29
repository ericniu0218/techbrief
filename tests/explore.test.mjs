import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SOURCES, parseFeed, exploreCategory, selectExplore, rankArticles, makeBriefing, readPublicArticle, collectNews } from '../worker/index.js';

const now = Date.now();
const source = id => SOURCES.find(s => s.id === id);
function article(id, title, extra = {}) {
  return { id: 'https://example.org/' + id, url: 'https://example.org/' + id, title, sourceId: 'ars-gear', source: 'Ars Gear & Gadgets', group: 'Technology', evidenceKind: 'reporting', summary: 'The publisher describes a new device with specific technical details.', sourceText: 'The new device is a working prototype. Researchers plan a larger test next year.', publishedAt: new Date(now - 3600000).toISOString(), ...extra };
}
function pool() {
  return [
    article('startup-a', 'Atlas startup raises seed funding for construction software', { sourceId: 'tc-startups' }),
    article('startup-b', 'Beacon startup launches a developer platform', { sourceId: 'tc' }),
    article('product-a', 'Cobalt unveils a compact laptop'),
    article('product-b', 'Delta releases a new camera'),
    article('research-a', 'Scientists demonstrate a quantum prototype', { sourceId: 'mit-tech' }),
    article('research-b', 'Researchers develop a solid-state battery', { sourceId: 'mit-tech' }),
    article('maker-a', 'Evergreen', { sourceId: 'product-hunt', evidenceKind: 'maker' }),
    article('maker-b', 'Fable', { sourceId: 'product-hunt', evidenceKind: 'maker' }),
    article('maker-c', 'Granite', { sourceId: 'product-hunt', evidenceKind: 'maker' }),
  ];
}

test('the separate section covers available categories, caps at six and excludes the main briefing', () => {
  const articles = pool(), exclude = [articles[2]];
  const picks = selectExplore(articles, { now, exclude });
  assert.equal(picks.length, 6);
  assert.deepEqual(new Set(picks.map(a => a.exploreCategory)), new Set(['Startups', 'Products & services', 'Emerging technology']));
  assert.ok(!picks.some(a => a.id === exclude[0].id));
  assert.equal(new Set(picks.map(a => a.id)).size, 6);
  assert.ok(picks.filter(a => a.evidenceKind === 'maker').length <= 2);
});

test('launch listings stay out of the daily ranking even when reporting is unavailable', () => {
  const maker = pool().find(a => a.evidenceKind === 'maker');
  assert.equal(rankArticles([maker], { now }).length, 0);
  assert.equal(selectExplore([maker], { now }).length, 1);
});

test('conference promotions, deals, failures, advice, roundups and sponsored content are not discoveries', () => {
  for (const title of ['Founder Summit: save on tickets for startup founders', 'The Download: new AI tools', 'Best new phone deals', 'Robot startup announces layoffs', 'New camera screens have problems', 'Startup secrets for winning enterprise customers', 'AI startup files for an IPO', 'Startups don’t need to go viral', 'Disruptive raises $10B fund for startup bets']) {
    assert.equal(exploreCategory(article('bad', title, { sourceId: 'tc-startups' })), null, title);
  }
  assert.equal(exploreCategory(article('sponsor', 'Researchers develop new quantum software', { sponsored: true })), null);
  assert.equal(exploreCategory(article('news', 'Government announces new climate regulations')), null);
});

test('a seven-day publication window and source preferences apply before selecting discoveries', () => {
  const fresh = article('fresh', 'A startup launches a construction platform', { sourceId: 'tc-startups' });
  const older = article('old', 'Researchers develop a quantum processor', { publishedAt: new Date(now - 8 * 86400000).toISOString() });
  assert.deepEqual(selectExplore([fresh, older], { now }).map(a => a.id), [fresh.id]);
  assert.equal(selectExplore([fresh], { now, sourceIds: ['ars-gear'] }).length, 0);
  assert.equal(selectExplore([article('missing', 'A startup launches software', { publishedAt: null })], { now }).length, 0);
});

test('encoded Atom descriptions are cleaned and an updated listing does not become a new launch', () => {
  const feed = '<feed><entry><title>Aurora</title><published>2026-10-01T12:00:00Z</published><updated>2026-10-29T12:00:00Z</updated><link rel="alternate" href="https://www.producthunt.com/products/aurora"/><content type="html">&lt;p&gt;A new workspace app for small teams&lt;/p&gt;&lt;p&gt;&lt;a&gt;Discussion&lt;/a&gt; | &lt;a&gt;Link&lt;/a&gt;&lt;/p&gt;</content></entry></feed>';
  const [listing] = parseFeed(feed, source('product-hunt'));
  assert.equal(listing.publishedAt, '2026-10-01T12:00:00.000Z');
  assert.equal(listing.summary, 'A new workspace app for small teams');
  assert.equal(listing.sourceText, listing.summary);
  assert.equal(listing.evidenceKind, 'maker');
  assert.equal(selectExplore([listing], { now: Date.parse('2026-10-29T13:00:00Z') }).length, 0);
  assert.equal(parseFeed(feed.replace(/<published>.*?<\/published>/, ''), source('product-hunt'))[0].publishedAt, null);
});

test('duplicate coverage and maker listings of an already reported product are suppressed', () => {
  const report = article('report', 'Aurora Workspace launches a new desktop app');
  const listing = article('listing', 'Aurora Workspace', { sourceId: 'product-hunt', evidenceKind: 'maker' });
  assert.equal(selectExplore([report, { ...report, id: 'copy', url: 'https://example.org/copy' }, listing], { now }).length, 1);
  assert.equal(selectExplore([listing], { now, exclude: [report] }).length, 0);
});

test('source exclusions preserve articles also offered by an enabled specialist feed', () => {
  const general = article('same', 'A startup launches a construction platform', { sourceId: 'tc' });
  const specialist = { ...general, sourceId: 'tc-startups' };
  assert.deepEqual(selectExplore([general, specialist], { now, sourceIds: ['tc-startups'] }).map(a => a.sourceId), ['tc-startups']);
});

test('maker descriptions are labeled, bounded to two picks, and never fetch maker websites', async () => {
  const makers = pool().filter(a => a.evidenceKind === 'maker');
  const brief = makeBriefing({ articles: makers, sources: [], fetchedAt: new Date(now).toISOString() }, { now });
  assert.equal(brief.articles.length, 0);
  assert.equal(brief.explore.articles.length, 2);
  assert.ok(brief.explore.articles.every(a => a.summaryBasis === 'Maker description in Product Hunt feed' && a.bullets.length >= 1 && a.bullets.length <= 5 && !('sourceText' in a)));
  const listing = makers[0];
  assert.equal(await readPublicArticle(listing, () => { throw Error('Must not fetch arbitrary maker pages'); }), listing);
});

test('source failures yield an empty discovery section without filler', async () => {
  const edition = await collectNews(async () => new Response('Unavailable', { status: 503 }));
  const brief = makeBriefing(edition, { now });
  assert.deepEqual(brief.explore.articles, []);
  assert.ok(brief.sources.every(s => s.status === 'unavailable'));
});
