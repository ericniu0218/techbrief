import { test } from 'node:test';
import assert from 'node:assert/strict';
import { rankArticles, makeBriefing, extractBullets, extractArticleText, readPublicArticle, SOURCES } from '../worker/index.js';

const now = Date.now();
function story(index, extra = {}) {
  const source = SOURCES[index % SOURCES.length];
  return { id: 'https://example.org/' + index, url: 'https://example.org/' + index, title: 'Report number ' + index, summary: 'The publisher reports a specific development with available details.', sourceText: '', sourceId: source.id, source: source.name, group: source.group, topics: [source.group], publishedAt: new Date(now - 3 * 3600000).toISOString(), feedPosition: index, ...extra };
}

test('importance outranks a newer product deal; the edition contains at most ten ranked stories', () => {
  const deal = story(0, { title: 'Best phone deals and discount coupons', publishedAt: new Date(now).toISOString() });
  const important = story(1, { title: 'Supreme Court blocks national ban affecting millions', feedPosition: 15 });
  const result = rankArticles([deal, important, ...Array.from({length: 24}, (_, i) => story(i + 2))], { now });
  assert.equal(result.length, 10);
  assert.equal(result[0].id, important.id);
  assert.deepEqual(result.map(a => a.rank), [1,2,3,4,5,6,7,8,9,10]);
  assert.equal(new Set(result.map(a => a.id)).size, 10);
});

test('a relevance preference changes ordering rather than offering source rotation or newest sorting', () => {
  const news = story(0, {title: 'A local council announces its new timetable', feedPosition: 0});
  const tech = story(4, {title: 'A software company announces its new product', feedPosition: 0});
  assert.equal(rankArticles([news, tech], {now, focus:'world'})[0].id, news.id);
  assert.equal(rankArticles([news, tech], {now, focus:'technology'})[0].id, tech.id);
});

test('source exclusions and a four-day freshness window are applied before the top ten', () => {
  const items = [story(0), story(1), story(4, {publishedAt:new Date(now-120*3600000).toISOString()}), story(5, {publishedAt:null})];
  const result=rankArticles(items,{now,sourceIds:[SOURCES[1].id,SOURCES[4].id,SOURCES[5].id]});
  assert.deepEqual(result.map(a=>a.id),[items[1].id]);
  assert.equal(rankArticles(items,{now,sourceIds:[]}).length,0);
});

test('the same buyout event across two publishers occupies only one position', () => {
  const result=rankArticles([story(4,{title:'Microsoft offers to buy out a quarter of its workforce'}),story(5,{title:'Microsoft offers buyouts to around 60,000 employees'})],{now});
  assert.equal(result.length,1);
});

test('a named prosecution covered with different legal wording occupies one position', () => {
  const result=rankArticles([story(1,{title:'Administration attempting to prosecute former FBI Director James Comey again'}),story(2,{title:'Justice Dept. Brings More Charges Against Comey, Accusing Him of Leaks'})],{now});
  assert.equal(result.length,1);
});

test('sentence boundaries preserve decimal numbers and abbreviations, and discard photo credits', () => {
  const bullets=extractBullets(story(0,{sourceText:'Mr. Smith says the new device has an 8.5-inch screen. The device costs $699 and ships next week. (Image credit: Example Agency)'}));
  assert.deepEqual(bullets,['Mr. Smith says the new device has an 8.5-inch screen.','The device costs $699 and ships next week.']);
});

test('related headlines across independent publishers count as coverage; BBC sections are one publisher', () => {
  const title = 'National security agency announces major software vulnerability';
  const result = rankArticles([story(0,{title}),story(3,{title:title+' details'}),story(4,{title:title+' response'})],{now});
  const bbc=result.find(a=>a.sourceId==='bbc-world');
  assert.equal(bbc.coverage,2);
});

test('each story has one to five source-grounded bullets, without filler or duplicate sentences', () => {
  const text='The agency announced a software update affecting two million users. The update fixes a security issue disclosed on Monday. Users can install the patch through their settings. The company says older versions remain affected. Researchers disclosed the issue last week. A sixth detail should not create a sixth bullet.';
  const bullets=extractBullets(story(0,{title:'Agency software update fixes security issue',sourceText:text}));
  assert.equal(bullets.length,5);
  assert.equal(new Set(bullets).size,5);
  assert.ok(bullets.every(b=>text.includes(b)));
  const short=extractBullets(story(1,{sourceText:'The publisher reports one confirmed development.'}));
  assert.equal(short.length,1);
});

test('API briefing exposes summaries for ten stories and does not expose full article bodies', () => {
  const edition={articles:Array.from({length:20},(_,i)=>story(i,{sourceText:'A confirmed development affects the region. Officials said an update will follow tomorrow.'})),sources:SOURCES,fetchedAt:new Date(now).toISOString()};
  const brief=makeBriefing(edition,{now});
  assert.equal(brief.articles.length,10);
  assert.ok(brief.articles.every(a=>a.bullets.length>0&&a.bullets.length<=5));
  assert.ok(brief.articles.every(a=>!('sourceText' in a)));
});

test('public article parsing uses article content and rejects a publisher paywall marker', () => {
  const body='Researchers announced a new computing result with specific details about the experiment. '.repeat(8);
  assert.equal(extractArticleText('<nav><p>Unrelated marketing material.</p></nav><article><p>'+body+'</p></article>'),body.trim());
  assert.equal(extractArticleText('<script type="application/ld+json">'+JSON.stringify({'@type':'NewsArticle',articleBody:body,isAccessibleForFree:false})+'</script><article><p>'+body+'</p></article>'),'');
});

test('subscription articles and redirects outside the publisher are never fetched as full text', async () => {
  let calls=0;
  const subscription=story(2,{subscription:true,url:'https://www.nytimes.com/story'});
  assert.equal(await readPublicArticle(subscription,async()=>{calls++;throw Error('Must not call')}),subscription);
  assert.equal(calls,0);
  const publicStory=story(0,{url:'https://www.bbc.com/news/test-redirect'});
  await readPublicArticle(publicStory,async()=>{calls++;return new Response(null,{status:302,headers:{Location:'https://unrelated.example/story'}})});
  assert.equal(calls,1);
});
