export const SOURCES = [
  { id: 'bbc-world', name: 'BBC News', group: 'News', url: 'https://feeds.bbci.co.uk/news/world/rss.xml', color: '#27323a', mark: 'BBC', description: 'International reporting and world affairs.' },
  { id: 'npr', name: 'NPR', group: 'News', url: 'https://feeds.npr.org/1001/rss.xml', color: '#b74234', mark: 'npr', description: 'US news, public affairs, and global reporting.' },
  { id: 'nyt', name: 'The New York Times', group: 'News', url: 'https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml', color: '#27323a', mark: 'T', description: 'Top stories. Read full articles with your student subscription.', subscription: true },
  { id: 'bbc-tech', name: 'BBC Technology', group: 'Technology', url: 'https://feeds.bbci.co.uk/news/technology/rss.xml', color: '#27323a', mark: 'BBC', description: 'Technology and its impact on everyday life.' },
  { id: 'ars', name: 'Ars Technica', group: 'Technology', url: 'https://feeds.arstechnica.com/arstechnica/index', color: '#c4512e', mark: 'ars', description: 'Computing, science, security, and technical analysis.' },
  { id: 'tc', name: 'TechCrunch', group: 'Technology', url: 'https://techcrunch.com/feed/', color: '#19784d', mark: 'TC', description: 'Startups, venture capital, and the business of technology.' },
  { id: 'ars-gear', name: 'Ars Gear & Gadgets', group: 'Technology', url: 'https://feeds.arstechnica.com/arstechnica/gadgets', color: '#c4512e', mark: 'ars', description: 'New devices, hardware launches, and hands-on product coverage.' },
  { id: 'tc-startups', name: 'TechCrunch Startups', group: 'Technology', scope: 'explore', url: 'https://techcrunch.com/category/startups/feed/', color: '#19784d', mark: 'TC', description: 'Startup launches, early companies and funding. Used in Startups & launches.' },
  { id: 'mit-tech', name: 'MIT Technology Review', group: 'Technology', scope: 'explore', url: 'https://www.technologyreview.com/feed/', color: '#9b3542', mark: 'TR', description: 'Emerging technology, research and prototypes. Used in Startups & launches.' },
  { id: 'product-hunt', name: 'Product Hunt', group: 'Technology', scope: 'explore', kind: 'launch', url: 'https://www.producthunt.com/feed', color: '#bf5839', mark: 'PH', description: 'Community product listings. Maker descriptions, not independent reviews; used in Startups & launches.' },
];

const TECH_SUBJECT = /\b(AI|artificial intelligence|LLM|OpenAI|Anthropic|ChatGPT|robot\w*|quantum|semiconductor\w*|chip\w*|processor\w*|software|hardware|cyber\w*|smartphone\w*|iPhone\w*|iPad\w*|laptop\w*|headset\w*|wearable\w*|drone\w*|self-driving|autonomous|battery|batteries|fusion|electric vehicle\w*|operating system\w*|data cent\w*)\b/i;
export function classifyGroup(source, title, summary, categories = [], url = '') {
  if (source.id === 'ars' && /\/(health|science|culture)\//i.test(url) && !TECH_SUBJECT.test(title)) return 'News';
  if (source.group === 'Technology') return 'Technology';
  if (categories.some(c => /^(technology|computing|artificial intelligence|robotics|software|hardware|gadgets)$/i.test(c)) || TECH_SUBJECT.test(title)) return 'Technology';
  return 'News';
}
export function isDiscovery(article) {
  if (article.group !== 'Technology') return false;
  const text = article.title + ' ' + (article.summary || '');
  if (/\b(deals?|discounts?|coupons?|best .* to buy|gift guide|layoffs?|buyouts?|recall\w*|crack\w*|lawsuit\w*|ipo|earnings|discontinu\w*|bankrupt\w*|scam\w*|security flaw\w*|vulnerabil\w*|outage\w*|breach\w*|fail\w*|problem\w*|broken|sued)\b/i.test(article.title)) return false;
  const product = /\b(robot\w*|device\w*|phone\w*|iPhone\w*|iPad\w*|tablet\w*|laptop\w*|headset\w*|wearable\w*|camera\w*|gadget\w*|chip\w*|processor\w*|AI model\w*|app\w*|software|browser\w*|batter\w*|fusion|quantum|excavator\w*|drone\w*|sensor\w*|satellite\w*|3D print\w*|smart glasses|e-reader\w*|e-bike\w*|electric vehicle\w*|developer tool\w*|synthesizer\w*|music production|pocket studio)\b/i.test(text);
  const novel = /\b(unveil\w*|introduc\w*|launch\w*|debut\w*|announc\w*|releas\w*|new|prototype\w*|first|breakthrough\w*|self-driving|autonomous|hands-on)\b/i.test(text);
  return product && novel;
}
export const MIXES = { technology: { technology: 8, news: 2 }, balanced: { technology: 7, news: 3 }, world: { technology: 2, news: 8 } };

export function plainText(value = '') {
  const entities = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', rsquo: '’', lsquo: '‘', ldquo: '“', rdquo: '”', ndash: '–', mdash: '—', hellip: '…' };
  return String(value).replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]*>/g, ' ').replace(/&(#x[\da-f]+|#\d+|\w+);/gi, (m, key) => {
      if (key[0] !== '#') return entities[key] ?? m;
      const n = key[1]?.toLowerCase() === 'x' ? parseInt(key.slice(2), 16) : parseInt(key.slice(1), 10);
      return n > 0 && n <= 0x10ffff ? String.fromCodePoint(n) : '';
    }).replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}
function tag(xml, name) { return xml.match(new RegExp('<' + name + '(?:\\s[^>]*)?>([\\s\\S]*?)<\\/' + name + '>', 'i'))?.[1] ?? ''; }
export function safeLink(value) {
  try {
    const url = new URL(plainText(value));
    if (url.protocol !== 'https:') return null;
    for (const key of [...url.searchParams.keys()]) if (/^(utm_|fbclid|gclid)/i.test(key)) url.searchParams.delete(key);
    url.hash = '';
    return url.href;
  } catch { return null; }
}
export function summarize(text, limit = 300) {
  const clean = plainText(text);
  if (clean.length <= limit) return clean;
  const part = clean.slice(0, limit - 1);
  const sentence = Math.max(part.lastIndexOf('. '), part.lastIndexOf('? '), part.lastIndexOf('! '));
  return sentence > limit / 2 ? part.slice(0, sentence + 1) : part.slice(0, Math.max(0, part.lastIndexOf(' '))) + '…';
}
export function parseFeed(xml, source) {
  if (/<!DOCTYPE|<!ENTITY/i.test(xml)) throw new Error('Unsupported XML declarations');
  if (!/<(?:rss|feed|rdf:RDF)\b/i.test(xml)) throw new Error('Invalid feed response');
  const entries = xml.match(/<item\b[^>]*>[\s\S]*?<\/item>|<entry\b[^>]*>[\s\S]*?<\/entry>/gi) ?? [];
  const stories = entries.slice(0, 30).map((entry, feedPosition) => {
    const atomLink = [...entry.matchAll(/<link\b([^>]+)>/gi)].find(m => !/rel=["'](?:self|enclosure)["']/i.test(m[1]));
    const url = safeLink(tag(entry, 'link') || atomLink?.[1].match(/href=["']([^"']+)/i)?.[1] || '');
    const title = plainText(tag(entry, 'title')).slice(0, 400);
    const date = new Date(plainText(tag(entry, 'pubDate') || tag(entry, 'published') || tag(entry, 'dc:date') || (source.kind === 'launch' ? '' : tag(entry, 'updated'))));
    const publishedAt = Number.isFinite(date.getTime()) ? date.toISOString() : null;
    const cleanFeedText = value => {
      const text = plainText(value);
      return source.kind === 'launch' ? text.replace(/\s*Discussion\s*\|\s*Link\s*$/i, '').trim() : text;
    };
    const summary = summarize(cleanFeedText(tag(entry, 'description') || tag(entry, 'summary') || tag(entry, 'content:encoded') || tag(entry, 'content')));
    const sourceText = cleanFeedText(tag(entry, 'content:encoded') || tag(entry, 'content') || tag(entry, 'description') || tag(entry, 'summary')).slice(0, 14000);
    const categories = [...entry.matchAll(/<category\b[^>]*>([\s\S]*?)<\/category>/gi)].map(m => plainText(m[1]));
    const content = title + ' ' + summary + ' ' + categories.join(' ');
    const group = classifyGroup(source, title, summary, categories, url);
    const topics = [group];
    if (/\b(AI|artificial intelligence|LLM|OpenAI|Anthropic|machine learning|ChatGPT)\b/i.test(content)) topics.push('AI');
    if (/\b(startup|start-up|funding|venture|Series [A-F])\b/i.test(content)) topics.push('Startups');
    if (/\b(science|scientist|space|NASA|climate|astronom|researchers|quantum)\b/i.test(content)) topics.push('Science');
    return { id: url, url, title, summary, sourceText, feedPosition, publishedAt, sourceId: source.id, source: source.name, group, topics, sponsored: categories.some(c => /sponsor|advertorial|insights/i.test(c)), sectionOnly: source.scope === 'explore', evidenceKind: source.kind === 'launch' ? 'maker' : 'reporting', subscription: !!source.subscription };
  }).filter(a => a.url && a.title && (!a.publishedAt || Date.parse(a.publishedAt) < Date.now() + 86400000));
  if (!stories.length) throw new Error('Feed contained no usable articles');
  return stories;
}
export function deduplicate(articles) {
  const seen = new Set();
  return articles.filter(a => {
    const title = a.title.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');
    if (seen.has(a.url) || seen.has(title)) return false;
    seen.add(a.url); seen.add(title); return true;
  });
}
const STOP_WORDS = new Set('about after again also amid among been before being could does first from have here into just latest more most much near news next over says said some than that their them then there these they this those through today under very what when where which while will with would your'.split(' '));
function titleTokens(text) {
  const normalized = text.toLowerCase().replace(/\bbuy\s+outs?\b/g, 'buyout').replace(/\bjob cuts?\b/g, 'layoffs').replace(/\binitial public offering\b/g, 'ipo');
  return new Set((normalized.match(/[\p{L}\p{N}]+/gu) || []).filter(t => t.length > 3 && !STOP_WORDS.has(t)).map(t => t.replace(/(?:ing|ed|s)$/, '')));
}
function overlap(a, b) {
  const common = [...a].filter(t => b.has(t)).length;
  return common >= 3 ? common / Math.max(1, Math.min(a.size, b.size)) : 0;
}
function publisher(id) { return id?.startsWith('bbc-') ? 'bbc' : id?.startsWith('ars') ? 'ars' : id?.startsWith('tc') ? 'tc' : id; }
function eventClass(title) {
  if (/\b(prosecut|indict|criminal|accus|leaks?)/i.test(title)) return 'prosecution';
  if (/\b(ipo|initial public offering|public debut|share listing|stock market debut)/i.test(title)) return 'ipo';
  if (/\b(buyouts?|buy out|layoffs?|job cuts?)/i.test(title)) return 'workforce';
  if (/\b(cyberattack|data breach|outage)/i.test(title)) return 'cyber-incident';
  return '';
}
const GENERIC_EVENT_TERMS = new Set('trump president administration justice department court government official officials agency company announce announc attempt charge accusation prosecut criminal leak workforce employee public market share offer buyout debut listing'.split(' '));

export function rankArticles(articles, { focus = 'technology', sourceIds = SOURCES.map(s => s.id), now = Date.now() } = {}) {
  const target = MIXES[focus] || MIXES.technology;
  const candidates = deduplicate(articles.filter(a => sourceIds.includes(a.sourceId) && !a.sectionOnly && SOURCES.find(s => s.id === a.sourceId)?.scope !== 'explore' && a.publishedAt && now - Date.parse(a.publishedAt) <= 96 * 3600000 && Date.parse(a.publishedAt) <= now + 3600000));
  const tokens = new Map(candidates.map(a => [a.id, titleTokens(a.title)]));
  const frequency = new Map();
  for (const set of tokens.values()) for (const token of set) frequency.set(token, (frequency.get(token) || 0) + 1);
  const sameEvent = (a, b) => {
    const at = tokens.get(a.id), bt = tokens.get(b.id);
    if (overlap(at, bt) >= .33) return true;
    const kind = eventClass(a.title);
    return !!kind && kind === eventClass(b.title) && [...at].some(t => bt.has(t) && !GENERIC_EVENT_TERMS.has(t) && frequency.get(t) <= 4);
  };
  const scored = candidates.map(article => {
    const text = article.title + ' ' + article.summary;
    const ageHours = Math.max(0, (now - Date.parse(article.publishedAt)) / 3600000);
    const coverage = new Set(candidates.filter(a => a.id !== article.id && publisher(a.sourceId) !== publisher(article.sourceId) && sameEvent(a, article)).map(a => publisher(a.sourceId))).size;
    let impact = 0;
    if (/\b(election|presiden|supreme court|ceasefire|invasion|war|nuclear|peace deal|prime minister|constitution|national security)/i.test(text)) impact += 23;
    if (/\b(interest rates|inflation|recession|central bank|federal reserve|trade war|tariff|global economy|unemployment|food assistance|millions|billion|workforce|layoffs)/i.test(text)) impact += 17;
    if (/\b(cyberattack|data breach|security flaw|vulnerabilit|outage|pandemic|earthquake|hurricane|wildfire|evacuat|killed|deaths|fatal)/i.test(text)) impact += 20;
    if (/\b(regulat|antitrust|legislation|lawsuit|ban|court|major|layoffs|workforce|buyouts)/i.test(text)) impact += 12;
    const technology = article.group === 'Technology';
    const relevance = focus === 'technology' ? (technology ? 23 : 0) : focus === 'world' ? (technology ? 0 : 23) : (technology ? 7 : 5);
    const techImpact = technology && /\b(AI|artificial intelligence|OpenAI|Anthropic|semiconductor|chip|operating system|breakthrough|data cent|IPO)/i.test(text) ? 10 : 0;
    let lowImpact = /\b(deals|discount|coupon|best .* to buy|review:|word of the year|celebrity|horoscope|watch out|secrets for winning)/i.test(article.title) ? 20 : 0;
    if (/^(how|why|what)\b/i.test(article.title)) lowImpact += 10;
    if (/\b(memoir|and,|roundup|morning news)/i.test(article.title)) lowImpact += 8;
    const discovery = isDiscovery(article);
    const freshness = 18 * Math.exp(-ageHours / 24);
    const placement = 8 / (1 + (article.feedPosition || 0) / 3);
    const score = freshness + placement + Math.min(impact, 42) + relevance + techImpact + Math.min(coverage, 3) * 13 + (discovery ? 8 : 0) - lowImpact;
    const reasons = [];
    if (impact >= 20) reasons.push('Broad public or economic impact');
    if (coverage) reasons.push('Related coverage from ' + (coverage + 1) + ' independent publishers');
    if (techImpact) reasons.push('Relevant to major technology developments');
    if (discovery) reasons.push('New product or emerging technology worth discovering');
    if (ageHours <= 12) reasons.push('Recent development');
    if (!reasons.length) reasons.push('Prominent in the available publisher feeds');
    return { ...article, discovery, score, reasons, coverage: coverage + 1 };
  });
  const selected = [], counts = new Map();
  while (scored.length && selected.length < 10) {
    // One representative per closely matching event; source variants still inform coverage.
    for (let i = scored.length - 1; i >= 0; i--) if (selected.some(a => sameEvent(a, scored[i]))) scored.splice(i, 1);
    if (!scored.length) break;
    const techCount = selected.filter(a => a.group === 'Technology').length;
    const newsCount = selected.length - techCount;
    const techAvailable = scored.some(a => a.group === 'Technology');
    const newsAvailable = scored.some(a => a.group !== 'Technology');
    const discoveryNeeded = Math.min(2, target.technology) - selected.filter(a => a.discovery).length;
    const reserveDiscovery = discoveryNeeded > 0 && target.technology - techCount <= discoveryNeeded && scored.some(a => a.discovery);
    const eligible = scored.filter(a => a.group === 'Technology'
      ? (techCount < target.technology || !newsAvailable) && (!reserveDiscovery || a.discovery)
      : newsCount < target.news || !techAvailable);
    if (!eligible.length) break;
    for (const a of scored) {
      const repetition = selected.reduce((max, b) => Math.max(max, overlap(tokens.get(a.id), tokens.get(b.id))), 0);
      a.adjustedScore = a.score - (counts.get(publisher(a.sourceId)) || 0) * 8 - (repetition >= .6 ? 36 : 0);
    }
    eligible.sort((a, b) => b.adjustedScore - a.adjustedScore || (Date.parse(b.publishedAt) - Date.parse(a.publishedAt)) || a.id.localeCompare(b.id));
    const chosen = eligible[0];
    scored.splice(scored.indexOf(chosen), 1);
    selected.push({ ...chosen, rank: selected.length + 1 });
    counts.set(publisher(chosen.sourceId), (counts.get(publisher(chosen.sourceId)) || 0) + 1);
  }
  return selected.sort((a, b) => b.adjustedScore - a.adjustedScore || Date.parse(b.publishedAt) - Date.parse(a.publishedAt)).map((a, i) => ({ ...a, rank: i + 1 }));
}

export function exploreCategory(article) {
  if (article.group !== 'Technology' || article.sponsored) return null;
  const title = article.title, text = title + ' ' + (article.summary || '');
  if (/\b(founder summit|disrupt 20\d\d|roundtables?|tickets?|conference|webinar|register now|coupon\w*|discount\w*|deals|gift guide|layoffs?|recall\w*|lawsuit\w*|ipo|earnings|bankrupt\w*|security flaw\w*|vulnerabil\w*|outage\w*|breach\w*|scam\w*|fail\w*|broken|problems?|vulnpocalypse|regulations?|antitrust|tariffs?)\b/i.test(title)) return null;
  if (/^(the download|the algorithm|opinion|how to|why you|best\b)|\b(secrets for|red flags|product-market fit|don't need to|don’t need to|wealth tax)\b/i.test(title)) return null;
  if (/\braises?\b.*\bfund\b/i.test(title)) return null;
  if (article.evidenceKind === 'maker' || article.sourceId === 'product-hunt') return article.summary?.length >= 20 ? 'Products & services' : null;
  const startup = /\b(startups?|start-ups?|seed funding|series [a-f])\b/i.test(text);
  const companyDevelopment = /\b(launch\w*|rais\w*|funding|back\w*|lands?|found\w*|build\w*|develop\w*|debut\w*|unveil\w*|new|aims? to|spun out)\b/i.test(text);
  if ((startup || article.sourceId === 'tc-startups') && companyDevelopment && !/\b(VCs? will|venture fund|fund to make big bets)\b/i.test(title)) return 'Startups';
  const emerging = /\b(prototype\w*|breakthrough\w*|researchers?|scientists?|experiment\w*|solid-state|quantum|fusion|batteries|battery|transformers?|3D print\w*|brain.computer|biotech\w*|nuclear|robot\w*)\b/i.test(title);
  if (emerging && /\b(new|first|could|develop\w*|demonstrat\w*|test\w*|build\w*|design\w*|discover\w*|prototype\w*|breakthrough\w*|unveil\w*|launch\w*|introduc\w*)\b/i.test(text)) return 'Emerging technology';
  if (isDiscovery(article) || (/\b(new|launch\w*|unveil\w*|introduc\w*|debut\w*|releas\w*)\b/i.test(title) && /\b(platform\w*|service\w*|tool\w*|program\w*|app\w*|model\w*)\b/i.test(text))) return 'Products & services';
  return null;
}

function sameExploreStory(a, b) {
  if (a.url === b.url || overlap(titleTokens(a.title), titleTokens(b.title)) >= .46) return true;
  // A short listing title can name a product covered in a longer reported headline.
  const listing = a.evidenceKind === 'maker' ? a : b.evidenceKind === 'maker' ? b : null;
  const report = listing === a ? b : a;
  if (!listing || listing.title.length < 5) return false;
  const normalized = value => value.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
  return (' ' + normalized(report.title) + ' ').includes(' ' + normalized(listing.title) + ' ');
}

export function selectExplore(articles, { sourceIds = SOURCES.map(s => s.id), now = Date.now(), exclude = [] } = {}) {
  const categories = ['Startups', 'Products & services', 'Emerging technology'];
  const candidates = deduplicate(articles.filter(a => sourceIds.includes(a.sourceId) && a.publishedAt && now - Date.parse(a.publishedAt) <= 7 * 86400000 && Date.parse(a.publishedAt) <= now + 3600000))
    .map(article => ({ ...article, exploreCategory: exploreCategory(article), evidenceKind: article.sourceId === 'product-hunt' ? 'maker' : article.evidenceKind || 'reporting' }))
    .filter(a => a.exploreCategory && !exclude.some(b => sameExploreStory(a, b)))
    .map(a => ({ ...a, discovery: true, score: 24 * Math.exp(-Math.max(0, now - Date.parse(a.publishedAt)) / 172800000) + 7 / (1 + (a.feedPosition || 0) / 4) + (a.evidenceKind === 'reporting' ? 12 : 0), reasons: [a.exploreCategory === 'Startups' ? 'A startup launch or company-building development' : a.exploreCategory === 'Emerging technology' ? 'An emerging technology, research result or prototype' : 'A new product, tool or service', a.evidenceKind === 'maker' ? 'Maker-provided listing; claims are not independently reviewed' : 'Reported by ' + a.source] }));
  const selected = [];
  const choose = category => {
    const eligible = candidates.filter(a => (!category || a.exploreCategory === category) && !selected.some(b => sameExploreStory(a, b)) && (a.evidenceKind !== 'maker' || selected.filter(b => b.evidenceKind === 'maker').length < 2));
    eligible.sort((a, b) => {
      const adjusted = item => item.score - selected.filter(s => publisher(s.sourceId) === publisher(item.sourceId)).length * 12 - selected.filter(s => s.exploreCategory === item.exploreCategory).length * 5;
      return adjusted(b) - adjusted(a) || Date.parse(b.publishedAt) - Date.parse(a.publishedAt) || a.id.localeCompare(b.id);
    });
    if (!eligible.length) return false;
    const chosen = eligible[0]; selected.push(chosen); candidates.splice(candidates.indexOf(chosen), 1); return true;
  };
  // Give every available category a place before filling the six-pick section.
  for (let round = 0; round < 2; round++) for (const category of categories) choose(category);
  while (selected.length < 6 && choose()) { /* Fill shortages with relevant available picks. */ }
  return selected.map((a, index) => ({ ...a, rank: index + 1 }));
}

export function extractBullets(article) {
  const text = plainText(article.sourceText || article.summary || article.title);
  const protectedText = text.replace(/\b(Mr|Mrs|Ms|Dr|Prof|Sr|Jr|St|vs)\./g, '$1\uE000').replace(/(\d)\.(?=\d)/g, '$1\uE000');
  const segments = typeof Intl.Segmenter === 'function' ? [...new Intl.Segmenter('en', { granularity: 'sentence' }).segment(protectedText)].map(s => s.segment) : protectedText.match(/[^.!?]+(?:[.!?]+[\u201d\u2019"']*(?=\s|$)|$)/g) || [protectedText];
  const sentences = segments.map(s => s.replace(/\uE000/g, '.'));
  const keywords = titleTokens(article.title);
  const seen = new Set();
  const choices = sentences.map((sentence, index) => {
    const value = summarize(sentence.trim(), 310);
    const key = value.toLowerCase().replace(/\W/g, '');
    if (value.length < 20 || seen.has(key) || /^\(?(read (the )?(full|more)|subscribe|sign up|advertisement|the post .* appeared first|image credit|hide caption)/i.test(value)) return null;
    seen.add(key);
    const matches = [...titleTokens(value)].filter(t => keywords.has(t)).length;
    if (value.length < 90 && /\b(consequences.*global|time will tell|more than ever|undoubtedly)/i.test(value)) return null;
    return { value, index, tokens: titleTokens(value), score: (index === 0 ? 12 : 0) + matches + (/\d/.test(value) ? 2 : 0) + (/\b(will|deadline|expects|plans to|however|but|warned|caution|affect|require)/i.test(value) ? 2 : 0) - index * .1 };
  }).filter(Boolean);
  const selected = [];
  while (choices.length && selected.length < 5) {
    for (const choice of choices) choice.noveltyScore = choice.score - selected.reduce((max, previous) => Math.max(max, overlap(choice.tokens, previous.tokens)), 0) * 12;
    choices.sort((a, b) => b.noveltyScore - a.noveltyScore);
    const next = choices.shift();
    if (!selected.some(previous => overlap(next.tokens, previous.tokens) >= .72)) selected.push(next);
  }
  selected.sort((a, b) => a.index - b.index);
  return selected.length ? selected.map(c => c.value) : [summarize(text || article.title, 310)];
}

export function extractArticleText(html) {
  // Prefer the publisher's explicit article body over unrelated page furniture.
  for (const match of html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      const findBody = value => {
        if (!value || typeof value !== 'object') return '';
        if (typeof value.articleBody === 'string' && value.isAccessibleForFree !== false && value.isAccessibleForFree !== 'false') return value.articleBody;
        for (const child of Object.values(value)) {
          if (typeof child === 'object') { const body = findBody(child); if (body) return body; }
        }
        return '';
      };
      const body = plainText(findBody(JSON.parse(match[1])));
      if (body.length >= 400) return body.slice(0, 14000);
    } catch { /* Some publishers include invalid JSON-LD; try their article markup. */ }
  }
  if (/"isAccessibleForFree"\s*:\s*(?:false|"false")/i.test(html)) return '';
  const section = (html.match(/<article\b[^>]*>([\s\S]*?)<\/article>/i)?.[1] || html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1] || '').replace(/<(figure|aside|nav)\b[^>]*>[\s\S]*?<\/\1>/gi, ' ');
  const paragraphs = [...section.matchAll(/<p\b([^>]*)>([\s\S]*?)<\/p>/gi)].map(m => {
    if (/(?:caption|credit|byline|related|recommend|promo)/i.test(m[1])) return '';
    const p = plainText(m[2]);
    const linkText = [...m[2].matchAll(/<a\b[^>]*>([\s\S]*?)<\/a>/gi)].map(a => plainText(a[1])).join(' ');
    if (linkText.length > p.length * .65 || /hide caption|image credit/i.test(p)) return '';
    return p;
  }).filter(p => p.length >= 45 && /[.!?][\u201d\u2019"')]*$/.test(p) && !/^(subscribe|sign up|advertisement|copyright|all rights reserved|read more|follow us|listen to|image source|image caption)/i.test(p));
  const text = paragraphs.join(' ');
  return text.length >= 400 ? text.slice(0, 14000) : '';
}

const articleCache = new Map();
const articleRequests = new Map();
const ARTICLE_HOSTS = { 'bbc-world': ['bbc.co.uk', 'bbc.com'], 'bbc-tech': ['bbc.co.uk', 'bbc.com'], npr: ['npr.org'], ars: ['arstechnica.com'], 'ars-gear': ['arstechnica.com'], tc: ['techcrunch.com'], 'tc-startups': ['techcrunch.com'], 'mit-tech': ['technologyreview.com'] };
function allowedArticleURL(url, sourceId) {
  try { const u = new URL(url); return u.protocol === 'https:' && (ARTICLE_HOSTS[sourceId] || []).some(host => u.hostname === host || u.hostname.endsWith('.' + host)); } catch { return false; }
}
export async function readPublicArticle(article, fetcher = fetch) {
  if (article.subscription || !allowedArticleURL(article.url, article.sourceId)) return article;
  if ((article.sourceText || '').length >= 1800) return { ...article, summaryBasis: 'Publisher article text in feed' };
  const existing = articleCache.get(article.url);
  if (existing && Date.now() - existing.at < 1800000) return { ...article, ...existing.content };
  if (!articleRequests.has(article.url)) articleRequests.set(article.url, (async () => {
    try {
      let url = article.url;
      for (let redirects = 0; redirects < 3; redirects++) {
        const res = await fetcher(url, { redirect: 'manual', headers: { Accept: 'text/html', 'User-Agent': 'TechBrief/1.0 personal-news-reader' }, signal: AbortSignal.timeout(7000) });
        if ([301, 302, 303, 307, 308].includes(res.status)) {
          const target = new URL(res.headers.get('Location'), url).href;
          if (!allowedArticleURL(target, article.sourceId)) return null;
          url = target; continue;
        }
        if (!res.ok || !/text\/html/i.test(res.headers.get('Content-Type') || '')) return null;
        const length = Number(res.headers.get('Content-Length') || 0);
        if (length > 2500000) return null;
        const html = await res.text();
        if (html.length > 2500000) return null;
        const sourceText = extractArticleText(html);
        return sourceText ? { sourceText, summaryBasis: 'Public article text' } : null;
      }
    } catch { /* Keep the publisher feed text when article access is unavailable. */ }
    return null;
  })().finally(() => articleRequests.delete(article.url)));
  const content = await articleRequests.get(article.url);
  if (articleCache.size >= 40) articleCache.delete(articleCache.keys().next().value);
  articleCache.set(article.url, { at: Date.now(), content: content || {} });
  return content ? { ...article, ...content } : article;
}

export function makeBriefing(edition, options = {}) {
  const ranked = rankArticles(edition.articles, options);
  const summarizeArticle = ({ sourceText, score, adjustedScore, feedPosition, ...article }) => ({ ...article, bullets: extractBullets({ ...article, sourceText }), summaryBasis: article.evidenceKind === 'maker' ? 'Maker description in Product Hunt feed' : article.summaryBasis || 'Publisher feed text' });
  const articles = ranked.map(summarizeArticle);
  const explore = { articles: selectExplore(edition.articles, { ...options, exclude: ranked }).map(summarizeArticle), maxStories: 6, windowDays: 7, selectionMethod: 'Up to six additional picks covering startups, products and services, and emerging technology. Recent relevant reporting is preferred, with publisher diversity and at most two maker listings. Stories already in the daily brief are excluded.' };
  const focus = MIXES[options.focus] ? options.focus : 'technology';
  const mix = { technology: articles.filter(a => a.group === 'Technology').length, news: articles.filter(a => a.group !== 'Technology').length, discoveries: articles.filter(a => a.discovery).length, target: MIXES[focus] };
  return { articles, explore, mix, sources: edition.sources, fetchedAt: edition.fetchedAt, focus, rankedAt: new Date(options.now || Date.now()).toISOString(), summaryMode: 'publisher', scannedCount: deduplicate(edition.articles.filter(a => !options.sourceIds || options.sourceIds.includes(a.sourceId))).length, summaryMethod: 'Up to five relevant sentences per story, extracted from accessible article text or publisher feeds. No facts are added beyond that source text.', rankingMethod: 'Tech-first selection with an 8/2 or 7/3 technology/news mix and up to two reserved discovery slots within the tech allocation. Stories remain ranked by impact, independent coverage, recency and relevance; quotas relax when a category lacks distinct recent reporting.' };
}

let cached = null;
let inflight = null;
export async function collectNews(fetcher = fetch, previous = null) {
  const results = await Promise.all(SOURCES.map(async source => {
    try {
      const res = await fetcher(source.url, { headers: { Accept: 'application/rss+xml, application/atom+xml, text/xml', 'User-Agent': 'TechBrief/1.0 personal-news-reader' }, signal: AbortSignal.timeout(12000) });
      if (!res.ok) throw new Error('Publisher returned HTTP ' + res.status);
      const xml = await res.text();
      if (xml.length > 2000000) throw new Error('Feed exceeds size limit');
      const articles = parseFeed(xml, source);
      return { articles, status: { ...source, status: 'live', count: articles.length, checkedAt: new Date().toISOString() } };
    } catch (error) {
      const fallback = previous?.articles.filter(a => a.sourceId === source.id) ?? [];
      return { articles: fallback, status: { ...source, status: fallback.length ? 'stale' : 'unavailable', count: fallback.length, checkedAt: new Date().toISOString(), error: error.name === 'TimeoutError' ? 'Publisher timed out' : String(error.message).slice(0, 120) } };
    }
  }));
  // Keep per-feed copies until preferences are applied, so excluding a general
  // feed does not discard a matching article from an enabled specialist feed.
  const articles = results.flatMap(r => r.articles).sort((a, b) => (Date.parse(b.publishedAt) || 0) - (Date.parse(a.publishedAt) || 0));
  return { articles, sources: results.map(r => r.status), fetchedAt: new Date().toISOString() };
}

const security = { 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'strict-origin-when-cross-origin', 'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self'; base-uri 'none'; frame-ancestors 'self'; form-action 'self'" };
function response(body, type, status = 200) { return new Response(body, { status, headers: { ...security, 'Content-Type': type } }); }
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (!['GET', 'HEAD'].includes(request.method)) return response('Method not allowed', 'text/plain', 405);
    if (url.pathname === '/api/news') {
      if (!cached || !cached.articles.length || Date.now() - Date.parse(cached.fetchedAt) > 300000) {
        if (!inflight) inflight = collectNews(fetch, cached).then(data => { cached = data; return data; }).finally(() => { inflight = null; });
        await inflight;
      }
      const focus = ['balanced', 'technology', 'world'].includes(url.searchParams.get('focus')) ? url.searchParams.get('focus') : 'technology';
      const sourceIds = url.searchParams.has('sources') ? url.searchParams.get('sources').split(',').filter(id => SOURCES.some(s => s.id === id)) : SOURCES.map(s => s.id);
      const options = { focus, sourceIds };
      const chosen = rankArticles(cached.articles, options);
      const explore = selectExplore(cached.articles, { ...options, exclude: chosen });
      const enriched = await Promise.all([...chosen, ...explore].map(article => readPublicArticle(article)));
      const lookup = new Map(enriched.map(article => [article.id, article]));
      const briefing = makeBriefing({ ...cached, articles: cached.articles.map(article => lookup.get(article.id) || article) }, options);
      const ok = briefing.articles.length > 0;
      return new Response(JSON.stringify(briefing), { headers: { ...security, 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': ok ? 'private, max-age=60' : 'no-store' } });
    }
    if (url.pathname === '/') return response(HTML, 'text/html; charset=utf-8');
    if (url.pathname === '/style.css') return response(CSS + BRIEF_CSS + EXPLORE_CSS, 'text/css; charset=utf-8');
    if (url.pathname === '/app.js') return response(CLIENT, 'application/javascript; charset=utf-8');
    if (url.pathname === '/source-plan') return response(PLAN, 'text/plain; charset=utf-8');
    if (url.pathname === '/health') return response('{"status":"ok"}', 'application/json');
    return response('Not found', 'text/plain; charset=utf-8', 404);
  }
};

const CSS = String.raw`
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;450;500;550;600;650;700&family=Instrument+Serif:ital@0;1&display=swap');
:root{--paper:#f7f8f5;--ink:#172d34;--muted:#697776;--line:#dfe5df;--green:#376c56;--soft:#e8eee6;--nav:#152d34;--serif:'Instrument Serif',Georgia,serif;--sans:'DM Sans',system-ui,sans-serif}
*{box-sizing:border-box}body{margin:0;background:var(--paper);color:var(--ink);font-family:var(--sans);font-size:14px;-webkit-font-smoothing:antialiased}button,input,select{font:inherit}button{cursor:pointer}a{color:inherit}button:focus-visible,a:focus-visible,input:focus-visible,select:focus-visible{outline:3px solid #b58d48;outline-offset:4px}button:disabled{cursor:wait;opacity:.6}.skip{position:fixed;top:-80px;background:white;padding:14px;z-index:20}.skip:focus{top:0}
.sidebar{width:226px;background:var(--nav);color:#d7e0dd;position:fixed;inset:0 auto 0 0;padding:35px 22px;display:flex;flex-direction:column;z-index:5}.brand{display:flex;align-items:center;gap:11px;color:#fff;font-size:24px;font-weight:650;letter-spacing:-1px;text-decoration:none}.brand-mark{width:31px;height:32px;display:grid;grid-template-columns:repeat(3,6px);align-items:center;gap:4px;transform:skewY(-12deg)}.brand-mark i{background:#a8c7a2;height:20px;border-radius:1px}.brand-mark i:nth-child(2){height:30px}.brand-mark i:nth-child(3){height:25px}.tagline{font-size:9px;letter-spacing:1.5px;text-transform:uppercase;color:#91aaa9;margin:12px 0 48px 42px}.nav-label{font-size:10px;letter-spacing:1.7px;text-transform:uppercase;color:#8fa5a4;margin:0 12px 13px}.nav-item{width:100%;border:0;text-align:left;background:none;color:#b7c9c8;padding:12px;display:flex;gap:12px;align-items:center;border-radius:7px;margin-bottom:5px;font-weight:500}.nav-item svg{width:18px;height:18px;flex-shrink:0}.nav-item.active{background:#2b454b;color:#fff}.nav-item:hover{background:#243e45;color:white}.nav-item .count{margin-left:auto;font-size:11px;color:#b9d0c3}.nav-line{height:1px;background:#355057;margin:23px 10px}.sidebar-bottom{margin-top:auto;padding:20px 10px 0}.sidebar-note{border-top:1px solid #355057;padding-top:21px;font-size:11px;line-height:1.8;color:#94aaa8}.tiny-dot{display:inline-block;width:6px;height:6px;border-radius:50%;background:#a7c59e;margin-right:7px}.edition{font-size:9px;color:#7f9a98;letter-spacing:.8px;margin-top:16px}
.shell{margin-left:226px}.topbar{height:87px;padding:0 42px;border-bottom:1px solid var(--line);display:flex;align-items:center;justify-content:space-between;gap:20px}.date{font-size:12px;color:var(--muted)}.date b{color:var(--ink);font-weight:550}.top-right{display:flex;gap:19px;align-items:center}.status{display:flex;align-items:center;font-size:11px;color:var(--muted)}.status .tiny-dot{background:#487e5e}.round-button{background:#fff;border:1px solid var(--line);width:34px;height:34px;display:grid;place-items:center;border-radius:50%;color:var(--ink)}.round-button svg{width:16px;height:16px}.avatar{width:33px;height:33px;border-radius:50%;background:#e3e9dd;display:grid;place-items:center;font-family:var(--serif);font-size:19px}.content{padding:38px 42px 25px;max-width:1580px;margin:0 auto}.intro{display:flex;align-items:flex-end;justify-content:space-between;gap:20px;margin-bottom:30px}.eyebrow{font-size:10px;font-weight:600;letter-spacing:1.8px;text-transform:uppercase;color:var(--green);margin-bottom:12px;display:flex;align-items:center;gap:7px}h1{font-family:var(--serif);font-weight:400;font-size:47px;line-height:1.06;letter-spacing:-1.2px;margin:0 0 12px}.intro p{margin:0;color:var(--muted);font-size:13px;line-height:1.6}.outline-button{background:transparent;border:1px solid #cbd6cd;border-radius:5px;color:var(--ink);padding:10px 14px;display:inline-flex;align-items:center;justify-content:center;gap:8px;white-space:nowrap;font-size:12px}.outline-button svg{width:15px;height:15px}.outline-button:hover{background:var(--soft)}
.brief-banner{background:#e9eee4;display:grid;grid-template-columns:1fr 170px;position:relative;padding:28px 30px;border:1px solid #d8e1d2;border-radius:8px;overflow:hidden;margin-bottom:32px}.brief-banner .eyebrow{margin-bottom:11px;font-size:9px}.brief-banner h2{font-family:var(--serif);font-weight:400;font-size:33px;letter-spacing:-.5px;margin:0 0 8px}.brief-banner p{max-width:530px;font-size:12px;color:#627065;line-height:1.7;margin:0 0 18px}.solid-button{background:var(--ink);color:white;border:0;border-radius:5px;padding:11px 15px;font-size:12px;display:inline-flex;align-items:center;gap:18px}.solid-button:hover{background:#2f4d50}.banner-art{position:relative;align-self:center;justify-self:center;width:125px;height:125px}.orbit{position:absolute;border:1px solid #9db295;border-radius:50%;inset:8px;transform:rotate(-30deg) scaleX(.48)}.orbit:nth-child(2){transform:rotate(30deg) scaleX(.48)}.orbit:nth-child(3){transform:rotate(90deg) scaleX(.48)}.art-core{position:absolute;inset:43px;background:#4e755b;border-radius:50%;box-shadow:0 0 0 8px #e9eee4}.art-dot{position:absolute;left:18px;top:22px;width:11px;height:11px;border-radius:50%;background:#78936d}.art-plus{position:absolute;right:2px;bottom:17px;font-size:23px;color:#8da382;font-weight:400}
.workspace{display:grid;grid-template-columns:minmax(0,1fr) 250px;gap:32px}.feed-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:19px;gap:15px}.section-title{font-family:var(--serif);font-weight:400;font-size:28px;margin:0}.sort{font-size:10px;color:var(--muted);display:flex;align-items:center;gap:6px}.sort select{border:none;background:transparent;color:var(--ink);max-width:130px;font-size:11px;padding:5px}.tabs{display:flex;gap:5px;border-bottom:1px solid var(--line);padding-bottom:13px;flex-wrap:wrap}.tab{border:0;background:transparent;font-size:11px;color:var(--muted);padding:8px 11px;border-radius:5px}.tab.active{background:var(--ink);color:#fff}.tab:hover:not(.active){background:var(--soft)}.search-wrap{margin-top:16px;position:relative}.search-wrap svg{position:absolute;left:12px;top:11px;width:15px;height:15px;color:#7c8984}.search-wrap input{width:100%;border:1px solid var(--line);border-radius:5px;padding:10px 35px;background:#fff;font-size:12px;color:var(--ink)}.search-wrap input::placeholder{color:#8a9690}.search-clear{position:absolute;right:8px;top:6px;background:transparent;border:0;font-size:20px;color:var(--muted)}.results-label{font-size:10px;color:#8a948e;margin:14px 0 2px;min-height:16px}.article{padding:23px 0;border-bottom:1px solid var(--line);display:grid;grid-template-columns:minmax(0,1fr) 32px;gap:15px}.article:first-child{padding-top:17px}.article-meta{display:flex;align-items:center;gap:8px;font-size:10px;color:var(--muted);flex-wrap:wrap}.source-mark{display:inline-flex;align-items:center;justify-content:center;height:19px;min-width:22px;padding:1px 4px;background:var(--source-color);color:white;border-radius:2px;font-size:8px;font-weight:700;letter-spacing:-.3px}.source-name{font-weight:600;color:#42534e}.separator{color:#b0bab3}.article h3{font-family:var(--serif);font-weight:400;font-size:27px;line-height:1.15;letter-spacing:-.25px;margin:11px 0 10px;overflow-wrap:anywhere}.article h3 button{text-align:left;font:inherit;letter-spacing:inherit;color:inherit;border:0;padding:0;background:transparent}.article h3 button:hover{color:var(--green)}.article p{font-size:12px;color:#69766f;line-height:1.8;margin:0 0 14px;max-width:650px;overflow-wrap:anywhere}.article-foot{display:flex;justify-content:space-between;align-items:center;gap:12px}.topic-tag{font-size:9px;text-transform:uppercase;letter-spacing:.6px;color:#667d65;display:flex;gap:8px;align-items:center}.topic-tag:before{content:'';width:4px;height:4px;background:#80987a;border-radius:50%}.read-link{font-size:10px;text-decoration:none;color:#345b47;font-weight:550}.read-link:hover{text-decoration:underline}.save-button{align-self:start;background:none;border:1px solid transparent;border-radius:4px;color:#819085;display:grid;place-items:center;padding:7px}.save-button svg{width:16px;height:16px}.save-button:hover{background:#e7ede3}.save-button.saved{color:#376c56;background:#e6ede2}.save-button.saved svg{fill:#c0d6b5}.subscription{font-size:9px;color:#8a7045;background:#f1ebdf;border-radius:3px;padding:2px 5px}.load-more{width:100%;padding:13px;border:1px solid #d4ddd2;border-radius:5px;background:transparent;color:#546d59;margin-top:24px;font-size:11px}.load-more:hover{background:var(--soft)}
.rail{padding-top:5px}.rail-block{margin-bottom:28px}.rail-title{font-size:10px;letter-spacing:1.3px;font-weight:600;text-transform:uppercase;margin:0 0 19px}.rail-title-row{display:flex;justify-content:space-between;align-items:center}.rail-title-row button{border:0;background:none;color:var(--green);font-size:10px;padding:0;margin-bottom:19px}.source-row{display:flex;align-items:center;gap:10px;margin:15px 0}.source-row .source-mark{min-width:28px;height:27px;font-size:10px}.source-row-info{flex:1;min-width:0;font-size:11px}.source-row-info small{display:block;color:#8c978e;font-size:9px;margin-top:3px}.source-led{width:5px;height:5px;background:#67965d;border-radius:50%}.source-led.unavailable{background:#c78758}.source-led.stale{background:#b49b4e}.rail-caption{font-size:10px;line-height:1.7;color:#8c968d;margin-top:18px}.rail-rule{height:1px;background:var(--line);margin:25px 0}.note-card{border:1px solid #d9e2d5;border-radius:6px;padding:19px;background:#f0f3eb}.note-icon{width:27px;height:27px;border:1px solid #c4d3bd;display:grid;place-items:center;border-radius:50%;color:#657c5d;margin-bottom:14px}.note-card h3{font-family:var(--serif);font-size:23px;font-weight:400;margin:0 0 8px}.note-card p{font-size:11px;line-height:1.8;color:#73806c;margin:0 0 15px}.note-card button{background:transparent;color:#466346;font-size:10px;border:0;padding:0;text-decoration:underline;text-underline-offset:4px}.principle{display:flex;gap:11px;font-size:11px;color:#607263;line-height:1.7;margin:12px 0}.principle span:first-child{font-size:15px;color:#8ba180}.footer{display:flex;justify-content:space-between;gap:20px;border-top:1px solid var(--line);margin-top:40px;padding-top:19px;color:#8b968d;font-size:9px}.footer button{border:0;background:none;font-size:9px;color:#687b69;padding:0}.notice{background:#fff4de;border:1px solid #e4d2a6;border-radius:5px;padding:12px 15px;font-size:12px;line-height:1.7;margin:0 0 20px}.hidden{display:none!important}.empty{padding:50px 20px;text-align:center;border-bottom:1px solid var(--line)}.empty h3{font-family:var(--serif);font-size:30px;font-weight:400;margin:0 0 8px}.empty p{font-size:12px;line-height:1.8;color:var(--muted)}.skeleton{height:145px;margin:25px 0;border-radius:5px;background:linear-gradient(100deg,#e8ede6 30%,#f3f5ef 50%,#e8ede6 70%);background-size:200% 100%;animation:shimmer 1.5s infinite}@keyframes shimmer{to{background-position:-200% 0}}.toast{position:fixed;bottom:25px;left:calc(50% + 90px);transform:translateX(-50%);background:var(--ink);color:white;padding:13px 20px;border-radius:6px;font-size:12px;z-index:30;box-shadow:0 5px 20px #172d3420;max-width:90vw}.spinner{animation:spin 1s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}
dialog{border:1px solid #d7e0d4;border-radius:10px;width:min(700px,calc(100vw - 28px));max-height:85vh;background:var(--paper);color:var(--ink);padding:32px;box-shadow:0 20px 100px #10262135}dialog::backdrop{background:#152d3480;backdrop-filter:blur(3px)}.dialog-top{display:flex;align-items:flex-start;justify-content:space-between;gap:15px}.dialog-top h2{font:400 35px/1.1 var(--serif);margin:0 0 14px}.dialog-close{background:#e8eee4;border:0;border-radius:50%;width:30px;height:30px;font-size:21px;flex-shrink:0;color:var(--ink)}.dialog-copy{font-size:12px;line-height:1.9;color:var(--muted);margin:0 0 22px}.dialog-copy a{color:var(--green)}.source-option{display:grid;grid-template-columns:32px 1fr 35px;gap:13px;align-items:center;padding:16px 0;border-top:1px solid var(--line)}.source-option .source-mark{height:30px;font-size:10px}.source-option strong{font-size:12px}.source-option p{font-size:11px;color:var(--muted);line-height:1.7;margin:5px 0}.source-option a{font-size:10px;color:var(--green)}.source-option input{width:17px;height:17px;accent-color:var(--green)}.health{font-size:10px;color:#5e7a55}.health.error{color:#a57838}.method{background:#eaf0e5;border-radius:5px;padding:16px;margin-top:20px;font-size:11px;line-height:1.8;color:#5d7056}.method strong{display:block;margin-bottom:5px;color:var(--ink)}.digest-item{padding:20px 0;border-top:1px solid var(--line)}.digest-item h3{font:400 25px/1.2 var(--serif);margin:9px 0}.digest-item p{font-size:12px;line-height:1.8;color:var(--muted);margin:0 0 11px}.detail-title{font:400 35px/1.15 var(--serif);margin:18px 0}.detail-summary{font-size:15px;color:#647469;line-height:1.9}.detail-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:25px}.detail-actions a{text-decoration:none}.detail-note{font-size:10px;color:#8a968b;line-height:1.8;margin-top:22px}
@media(min-width:1500px){.content{padding-top:45px}.workspace{grid-template-columns:minmax(0,1fr) 290px;gap:50px}.brief-banner{padding:33px 36px}.article{padding:28px 0}.article h3{font-size:30px}}
@media(max-width:1150px){.sidebar{width:194px;padding:30px 15px}.brand{font-size:22px}.tagline{font-size:8px}.shell{margin-left:194px}.content{padding:30px 28px}.topbar{padding:0 28px}.workspace{grid-template-columns:minmax(0,1fr) 210px;gap:24px}h1{font-size:42px}.brief-banner h2{font-size:30px}.brief-banner{grid-template-columns:1fr 120px}.article h3{font-size:25px}}
@media(max-width:900px){.rail{display:none}.workspace{grid-template-columns:1fr}.sidebar{width:185px}.shell{margin-left:185px}.content{padding:28px 25px}.topbar{padding:0 25px}.intro{align-items:flex-start}.intro>.outline-button{font-size:0;gap:0;padding:10px}.intro>.outline-button svg{width:17px;height:17px}.brief-banner{padding:24px}.brief-banner p{max-width:380px}.brief-banner h2{font-size:29px}}
@media(max-width:640px){.sidebar{position:relative;width:100%;height:auto;padding:20px 20px 0;background:var(--paper);color:var(--ink)}.brand{color:var(--ink);font-size:23px}.brand-mark i{background:#628260}.tagline,.nav-label,.nav-line,.sidebar-bottom,.sidebar .secondary-nav{display:none}.sidebar nav{display:flex;gap:8px;margin:20px -20px 0;padding:0 16px 13px;border-bottom:1px solid var(--line)}.nav-item{width:auto;white-space:nowrap;margin:0;padding:8px 11px;color:#71806f;font-size:11px;gap:7px}.nav-item svg{width:15px;height:15px}.nav-item.active{background:var(--ink);color:white}.nav-item:hover{background:#dfe7dc;color:var(--ink)}.nav-item .count{font-size:9px}.shell{margin:0}.topbar{height:58px;padding:0 20px;border-bottom:0}.date{font-size:10px}.top-right{gap:12px}.status{font-size:9px}.avatar{display:none}.round-button{height:29px;width:29px}.content{padding:20px}.intro{margin-bottom:23px}h1{font-size:40px}.eyebrow{font-size:9px;letter-spacing:1.3px}.intro p{font-size:11px}.brief-banner{grid-template-columns:1fr;padding:23px;margin-bottom:27px}.banner-art{position:absolute;right:-16px;top:14px;opacity:.32;width:100px;height:100px}.brief-banner>div:first-child{position:relative;z-index:1}.brief-banner h2{font-size:30px;max-width:240px}.brief-banner p{font-size:11px;max-width:260px}.section-title{font-size:26px}.feed-head{margin-bottom:13px}.tab{font-size:10px;padding:7px 9px}.tabs{gap:2px}.article h3{font-size:26px}.article p{font-size:12px;line-height:1.8}.article{gap:8px;padding:22px 0}.article-meta{font-size:9px;gap:6px}.source-mark{font-size:7px}.article-foot{align-items:flex-start}.read-link{white-space:nowrap}.footer{line-height:1.7;margin-top:30px}.footer span{max-width:220px}.toast{left:50%;width:max-content}dialog{padding:24px}.dialog-top h2{font-size:31px}.detail-title{font-size:31px}}
@media(prefers-reduced-motion:reduce){*{animation:none!important;scroll-behavior:auto!important}}
`;

const BRIEF_CSS = String.raw`
.discovery-badge{display:inline-flex;padding:3px 7px;border-radius:3px;background:#f3ecdc;color:#8c6838;font-size:9px;font-weight:600;letter-spacing:.3px}.discovery-note{margin:0 0 15px;color:#718268;font-size:11px;line-height:1.7}.brief-stats{flex-wrap:wrap}#mix-count{color:#4c7044}.content{max-width:1450px}.intro{margin-bottom:25px}.intro h1{font-size:49px}.intro p{font-size:14px}.brief-toolbar{display:flex;align-items:center;justify-content:space-between;gap:20px;background:#e9eee4;border:1px solid #d8e1d2;padding:17px 21px;border-radius:7px;margin-bottom:30px}.brief-stats{display:flex;gap:18px;align-items:center;color:#61745f;font-size:11px}.brief-stats b{color:#28483a;font-weight:650}.focus-label{display:flex;align-items:center;gap:10px;color:#627161;font-size:11px}.focus-label select{border:1px solid #c5d2bf;border-radius:4px;background:#f6f8f1;color:#29483a;padding:8px 28px 8px 11px;max-width:190px;font-size:12px}.workspace{grid-template-columns:minmax(0,1fr) 245px;gap:36px}.brief-list{display:grid;gap:20px}.story-card{border:1px solid #dce3d8;background:#fff;border-radius:8px;padding:25px 27px;position:relative}.story-heading{display:grid;grid-template-columns:42px 1fr;gap:12px;align-items:start}.story-rank{font:400 36px/1 var(--serif);color:#93a08e;padding-top:2px}.story-card:first-child{border-top:3px solid #64815b}.story-card:first-child .story-rank{color:#4f7447}.story-kicker{display:flex;align-items:center;gap:8px;flex-wrap:wrap;font-size:10px;color:#81907d;margin-bottom:9px;line-height:1.5}.story-kicker .category{color:#4c7044;text-transform:uppercase;letter-spacing:.8px;font-size:9px;font-weight:650}.story-card h2{font:400 30px/1.13 var(--serif);letter-spacing:-.35px;margin:0;color:#1b3435;overflow-wrap:anywhere}.story-bullets{list-style:none;padding:0;margin:21px 0 18px 54px;display:grid;gap:11px}.story-bullets li{position:relative;font-size:14px;line-height:1.75;color:#4c6054;padding-left:16px;overflow-wrap:anywhere}.story-bullets li:before{content:'';position:absolute;left:0;top:11px;width:4px;height:4px;background:#8ba47c;border-radius:50%}.story-footer{margin-left:54px;padding-top:15px;border-top:1px solid #edf0e9;display:flex;justify-content:space-between;align-items:center;gap:16px;font-size:10px;color:#81907d}.story-footer a{color:#52754c;text-decoration:none}.story-footer a:hover{text-decoration:underline}.story-actions{display:flex;gap:12px;align-items:center}.story-footer .save-button{padding:5px}.story-ranking summary{cursor:pointer;list-style:none;color:#607b56;font-size:10px}.story-ranking summary::-webkit-details-marker{display:none}.story-ranking summary:after{content:' +';color:#9bad93}.story-ranking[open] summary:after{content:' −'}.ranking-explanation{margin:13px 0 0 54px;padding:12px 15px;background:#f2f5ee;border-radius:4px;font-size:11px;line-height:1.8;color:#718269}.rank-reason{display:block}.rank-note{font-size:11px;line-height:1.8;color:#85917e;margin-top:20px}.rail .rail-title{margin-bottom:14px}.criteria{display:grid;gap:16px}.criterion{display:grid;grid-template-columns:22px 1fr;gap:9px}.criterion-number{font:400 18px/1 var(--serif);color:#91a285}.criterion strong{display:block;font-size:11px;font-weight:550;margin-bottom:4px;color:#536c4c}.criterion p{font-size:10px;line-height:1.7;color:#87927f;margin:0}.summary-limit{font-size:9px;color:#9a8a68}.rail .note-card p{font-size:11px}.method-button{border:0;background:none;color:#627b58;text-align:left;padding:0;font-size:10px;text-decoration:underline;text-underline-offset:4px}.brief-finish{text-align:center;padding:26px 10px 6px;color:#75886a;font-size:12px}.brief-finish span{display:block;font:400 29px/1.2 var(--serif);color:#49633f;margin-bottom:7px}.sidebar-bottom .edition{line-height:1.8}.page-loading{opacity:.55;pointer-events:none}.source-dialog-foot{display:flex;justify-content:flex-end;padding-top:20px;border-top:1px solid var(--line);margin-top:8px}.error-action{margin-top:15px}.topbar .status.error .tiny-dot{background:#b78553}
@media(max-width:1150px){.workspace{grid-template-columns:minmax(0,1fr) 210px;gap:24px}.story-card{padding:22px}.story-card h2{font-size:28px}.story-bullets li{font-size:13px}}
@media(max-width:900px){.workspace{grid-template-columns:1fr}.story-card{padding:25px}.brief-toolbar{flex-wrap:wrap;gap:15px}.intro h1{font-size:44px}.intro p{font-size:12px}}
@media(max-width:640px){.intro h1{font-size:40px}.intro p{font-size:12px;line-height:1.8;max-width:280px}.brief-toolbar{padding:15px 17px;gap:15px;margin-bottom:22px}.brief-stats{gap:13px;font-size:10px}.focus-label{width:100%;justify-content:space-between}.focus-label select{font-size:11px;max-width:195px}.story-card{padding:21px 18px}.story-heading{grid-template-columns:27px 1fr;gap:9px}.story-rank{font-size:29px;padding-top:3px}.story-card h2{font-size:27px}.story-kicker{font-size:9px;gap:5px}.story-bullets{margin:19px 0 18px;gap:12px}.story-bullets li{font-size:13px;line-height:1.8;padding-left:14px}.story-footer{margin-left:0;gap:10px}.ranking-explanation{margin:13px 0 0}.story-footer .source-mark{display:none}.story-actions{gap:8px}.rank-note{font-size:10px}.brief-finish span{font-size:26px}.intro>.outline-button{align-self:start;margin-top:30px}.content{padding-top:17px}.topbar{padding-top:0}.brief-list{gap:16px}}
`;

const EXPLORE_CSS = String.raw`
.explore-section{margin-top:45px;padding-top:32px;border-top:2px solid #c4d3ca;scroll-margin-top:24px}.explore-intro{border:1px solid #d5dfd8;border-radius:8px;background:#eaf0ed;padding:25px 27px;margin-bottom:20px}.explore-intro .eyebrow{margin-bottom:10px;color:#526c68}.explore-intro h2{font:400 38px/1.1 var(--serif);letter-spacing:-.6px;margin:0 0 12px}.explore-intro p{font-size:12px;line-height:1.8;color:#627671;margin:0 0 16px;max-width:580px}.explore-meta{font-size:10px;color:#657b73;margin-bottom:18px}.explore-filters{display:flex;gap:6px;flex-wrap:wrap}.explore-filters button{border:1px solid #cbd8cf;color:#50675e;background:#f5f8f4;border-radius:5px;padding:8px 11px;font-size:10px;line-height:1.5}.explore-filters button.active{background:#294b44;border-color:#294b44;color:white}.explore-card h3{font:400 30px/1.13 var(--serif);letter-spacing:-.35px;margin:0;color:#1b3435;overflow-wrap:anywhere}.explore-card:first-child{border-top:1px solid #dce3d8}.evidence-label{margin:15px 0 -7px 54px;font-size:10px;line-height:1.7;color:#6d8379}.evidence-label.maker-label{color:#8c6838}.explore-note{font-size:11px;line-height:1.8;color:#7b8b7f;margin:20px 0 0}.brief-finish button{border:0;background:none;color:#49633f;text-decoration:underline;text-underline-offset:3px;font-size:12px;padding:5px}.feed-column{min-width:0}
@media(max-width:1150px){.explore-card h3{font-size:28px}}
@media(max-width:640px){.sidebar nav{display:grid;grid-template-columns:1fr 1fr;gap:5px}.sidebar nav .nav-item{min-width:0}.explore-section{margin-top:32px;padding-top:25px}.explore-intro{padding:23px 18px}.explore-intro h2{font-size:33px}.explore-card h3{font-size:27px}.evidence-label{margin-left:0}.explore-filters{gap:6px}.explore-filters button{padding:7px 9px}.explore-intro p{font-size:12px}.brief-finish{line-height:1.8}}
`;

const CLIENT = String.raw`
const $=s=>document.querySelector(s);
const ALL_SOURCES=['bbc-world','npr','nyt','bbc-tech','ars','tc','ars-gear','tc-startups','mit-tech','product-hunt'];
const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const safeURL=s=>{try{const u=new URL(s);return u.protocol==='https:'?u.href:'#'}catch{return '#'}};
function readStore(key,fallback){try{return JSON.parse(localStorage.getItem(key))??fallback}catch{return fallback}}
let saved=readStore('techbrief-saved',[]);if(!Array.isArray(saved))saved=[];saved=saved.filter(a=>a&&typeof a.title==='string'&&typeof a.url==='string'&&typeof a.sourceId==='string').slice(0,100);
let disabled=readStore('techbrief-disabled',[]);if(!Array.isArray(disabled))disabled=[];
let focus=readStore('techbrief-mix','technology');if(!['balanced','technology'].includes(focus))focus='technology';
let state={articles:[],explore:[],exploreFilter:'All',sources:[],view:'briefing',loading:true,error:null,summaryMode:'publisher'};
let toastTimer,loadVersion=0;
function toast(message){$('#toast').textContent=message;$('#toast').classList.remove('hidden');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.add('hidden'),3200)}
function persist(key,value){try{localStorage.setItem(key,JSON.stringify(value))}catch{toast('Changes will last for this visit. Browser storage is unavailable.')}}
function relative(date){if(!date)return 'Time unavailable';const mins=Math.max(0,Math.floor((Date.now()-new Date(date))/60000));if(mins<1)return 'Just now';if(mins<60)return mins+'m ago';if(mins<1440)return Math.floor(mins/60)+'h ago';return new Date(date).toLocaleDateString(undefined,{month:'short',day:'numeric'})}
const bookmark='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M6 3h12v18l-6-4-6 4V3Z"/></svg>';
function sourceFor(a){return state.sources.find(s=>s.id===a.sourceId)||{color:'#376c56',mark:a.source?.slice(0,2)||'N'}}
function storyCard(a,index,explore=false){
 const isSaved=saved.some(s=>s.id===a.id),heading=explore?'h3':'h2',maker=a.evidenceKind==='maker';
 const bullets=(Array.isArray(a.bullets)&&a.bullets.length?a.bullets:[a.summary||a.title]).slice(0,5);
 return '<article class="story-card'+(explore?' explore-card':'')+'" data-group="'+escape(a.group)+'" data-discovery="'+!!a.discovery+'"><div class="story-heading"><span class="story-rank" aria-label="'+(explore?'Pick ':'Rank ')+(index+1)+'">'+String(index+1).padStart(2,'0')+'</span><div><div class="story-kicker">'+(!explore&&a.discovery?'<span class="discovery-badge">New &amp; notable</span>':'')+'<span class="category">'+escape(a.exploreCategory||(a.topics||[]).find(t=>!['News','Technology'].includes(t))||a.group)+'</span><span>·</span><span>'+escape(a.source)+'</span><span>·</span><time datetime="'+escape(a.publishedAt||'')+'">'+escape(relative(a.publishedAt))+'</time></div><'+heading+'>'+escape(a.title)+'</'+heading+'></div></div>'+(explore||maker?'<p class="evidence-label '+(maker?'maker-label':'')+'">'+(maker?'Maker description · Not independently reviewed':'Publisher reporting')+'</p>':'')+'<ul class="story-bullets">'+bullets.map(b=>'<li>'+escape(b)+'</li>').join('')+'</ul><div class="story-footer"><details class="story-ranking"><summary>Why this '+(explore?'pick':'story')+'?</summary><div class="ranking-explanation">'+(a.reasons||['Saved from an earlier briefing']).map(r=>'<span class="rank-reason">'+escape(r)+'</span>').join('')+'</div></details><div class="story-actions">'+(a.subscription?'<span class="summary-limit" title="Summary uses the publisher’s public feed abstract">Feed abstract</span>':'')+'<a href="'+escape(safeURL(a.url))+'" target="_blank" rel="noopener noreferrer" aria-label="Original source: '+escape(a.title)+'">'+(maker?'Listing':'Source')+' ↗</a><button class="save-button '+(isSaved?'saved':'')+'" data-save="'+escape(a.id)+'" aria-label="'+(isSaved?'Unsave: ':'Save: ')+escape(a.title)+'" aria-pressed="'+isSaved+'">'+bookmark+'</button></div></div></article>';
}
function renderExplore(){
 $('#explore').classList.toggle('hidden',state.view==='saved');
 const items=state.explore.filter(a=>state.exploreFilter==='All'||a.exploreCategory===state.exploreFilter);
 $('#explore-count').textContent=state.loading&&!state.explore.length?'Loading picks…':state.explore.length+' additional '+(state.explore.length===1?'pick':'picks')+' · Past 7 days';
 document.querySelectorAll('[data-explore-filter]').forEach(b=>{const active=b.dataset.exploreFilter===state.exploreFilter;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active))});
 if(state.loading&&!state.explore.length)$('#explore-stories').innerHTML='<div class="skeleton"></div><div class="skeleton"></div>';
 else if(items.length)$('#explore-stories').innerHTML=items.map((a,i)=>storyCard(a,i,true)).join('');
 else $('#explore-stories').innerHTML='<div class="empty"><h3>'+(state.error?'Discovery is taking a moment.':state.explore.length?'No picks in this category today.':'No recent discoveries available.')+'</h3><p>'+(state.error?'Try refreshing the briefing.':'We show relevant recent finds from your selected sources. No filler.')+'</p><button class="outline-button error-action" '+(state.error?'data-retry':'data-sources')+'>'+(state.error?'Try again':'Choose sources')+'</button></div>';
 $('#explore-stories').classList.toggle('page-loading',state.loading&&items.length>0);
}
function render(){
 const items=state.view==='saved'?saved:state.articles;
 $('#saved-count').textContent=saved.length||'';
 document.querySelectorAll('[data-view]').forEach(b=>{const active=b.dataset.view===state.view;b.classList.toggle('active',active);if(active)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current')});
 $('#page-title').textContent=state.view==='saved'?'Worth keeping.':'The tech worth knowing.';
 $('#page-subtitle').textContent=state.view==='saved'?'The stories and takeaways you saved.':'New tech, big ideas, and the headlines that matter. Up to five takeaways each.';
 $('#brief-toolbar').classList.toggle('hidden',state.view==='saved');
 $('#story-count').textContent=state.loading&&!state.articles.length?'—':state.articles.length;
 const techCount=state.articles.filter(a=>a.group==='Technology').length;
 $('#mix-count').textContent=state.articles.length?' · '+techCount+' tech / '+(state.articles.length-techCount)+' news':'';
 const discoveries=state.articles.filter(a=>a.discovery).length;
 $('#discovery-note').textContent=discoveries?'Including '+discoveries+' new '+(discoveries===1?'product or emerging technology':'products or emerging technologies')+' to discover.':'';
 $('#discovery-note').classList.toggle('hidden',!discoveries||state.view==='saved');
 const bulletCount=state.articles.reduce((n,a)=>n+(a.bullets?.length||1),0);
 const words=state.articles.reduce((n,a)=>n+(a.bullets||[a.summary||'']).join(' ').split(/\s+/).length,0);
 $('#takeaway-count').textContent=state.loading&&!state.articles.length?'—':bulletCount;
 $('#read-time').textContent=state.loading&&!state.articles.length?'—':Math.max(1,Math.ceil(words/220));
 $('#focus').value=focus;
 if(state.loading&&!items.length)$('#stories').innerHTML='<div class="skeleton"></div><div class="skeleton"></div><div class="skeleton"></div>';
 else if(items.length)$('#stories').innerHTML=items.map((a,i)=>storyCard(a,i)).join('');
 else $('#stories').innerHTML='<div class="empty"><h3>'+(state.view==='saved'?'Keep a little perspective.':state.error?'The briefing is taking a moment.':'No recent stories from these sources.')+'</h3><p>'+(state.view==='saved'?'Save a story to keep its takeaways here.':state.error?'Try loading your briefing again.':'Choose more sources to build your top 10.')+'</p><button class="outline-button error-action" '+(state.view==='saved'?'data-view="briefing"':state.error?'data-retry':'data-sources')+'>'+(state.view==='saved'?'Back to today':state.error?'Try again':'Choose sources')+'</button></div>';
 $('#stories').classList.toggle('page-loading',state.loading&&items.length>0);
 $('#finish').classList.toggle('hidden',!items.length||state.view==='saved'||state.loading);
 $('#finish-copy').textContent=state.articles.length===10?'Ten stories. You’re caught up.':state.articles.length+' recent stories available from your sources.';
 const failed=state.sources.filter(s=>s.status!=='live');
 $('#notice').classList.toggle('hidden',!state.error&&!failed.length);
 $('#notice').textContent=state.error||(failed.length?failed.map(s=>s.name).join(', ')+' temporarily unavailable or using cached reporting. The briefing uses the available sources.':'');
 $('#rail-sources').innerHTML=state.sources.map(s=>'<div class="source-row"><span class="source-mark" style="--source-color:'+escape(s.color)+'">'+escape(s.mark)+'</span><div class="source-row-info">'+escape(s.name)+'<small>'+escape(disabled.includes(s.id)?'Not included':s.scope==='explore'?'Startups & launches':s.group)+'</small></div><span class="source-led '+escape(s.status)+'" title="'+escape(s.status)+'" role="img" aria-label="'+escape(s.status)+'"></span></div>').join('');
 $('#sources-count').textContent=state.sources.length?state.sources.filter(s=>s.status==='live').length+' of '+state.sources.length+' feeds available':'Connecting to publishers…';
 $('#summary-note').textContent=state.summaryMode==='ai'?'Summaries are generated from available source text. Sources with limited text may have fewer takeaways.':'Takeaways are extracted from accessible article text and publisher feeds. A shorter source produces fewer bullets; missing details are never filled in.';
 $('#refresh').disabled=state.loading;$('#refresh svg').classList.toggle('spinner',state.loading);
 renderExplore();
}
async function loadNews(){const version=++loadVersion;state.loading=true;state.error=null;render();try{const params=new URLSearchParams({focus,sources:ALL_SOURCES.filter(id=>!disabled.includes(id)).join(',')});const res=await fetch('/api/news?'+params);if(!res.ok)throw new Error('service');if(!(res.headers.get('Content-Type')||'').includes('application/json'))throw new Error('signin');const data=await res.json();if(version!==loadVersion)return;if(!Array.isArray(data.articles))throw new Error('service');state.articles=data.articles.slice(0,10);state.explore=Array.isArray(data.explore?.articles)?data.explore.articles.slice(0,6):[];state.sources=data.sources;state.summaryMode=data.summaryMode;$('#updated').textContent='Updated '+new Date(data.fetchedAt).toLocaleTimeString(undefined,{hour:'numeric',minute:'2-digit'});}catch(error){if(version!==loadVersion)return;state.error=error.message==='signin'?'Your session needs a refresh. Reload this page to sign in again.':'The briefing service is temporarily unavailable. Try again in a moment.';$('#updated').textContent='Update unavailable'}finally{if(version===loadVersion){state.loading=false;render()}}}
function toggleSave(id){const a=state.articles.find(a=>a.id===id)||state.explore.find(a=>a.id===id)||saved.find(a=>a.id===id);if(!a)return;const at=saved.findIndex(s=>s.id===id);if(at>=0){saved.splice(at,1);toast('Removed from saved stories')}else{saved.unshift(a);saved=saved.slice(0,100);toast('Story and takeaways saved')}persist('techbrief-saved',saved);render()}
function showSources(){const options=state.sources.length?state.sources:ALL_SOURCES.map(id=>({id,name:id,description:'Feed connection is pending.',color:'#376c56',mark:'N',url:'https://www.bbc.com/news'}));$('#source-options').innerHTML=options.map(s=>'<div class="source-option"><span class="source-mark" style="--source-color:'+escape(s.color)+'">'+escape(s.mark)+'</span><div><strong>'+escape(s.name)+'</strong><p>'+escape(s.description)+'</p></div><input type="checkbox" data-source="'+escape(s.id)+'" aria-label="Include '+escape(s.name)+'" '+(disabled.includes(s.id)?'':'checked')+'></div>').join('');$('#sources-dialog').showModal()}
document.addEventListener('click',event=>{const save=event.target.closest('[data-save]');if(save){toggleSave(save.dataset.save);return}const filter=event.target.closest('[data-explore-filter]');if(filter){state.exploreFilter=filter.dataset.exploreFilter;renderExplore();return}if(event.target.closest('[data-explore]')){state.view='briefing';render();$('#explore-title').focus({preventScroll:true});$('#explore').scrollIntoView({block:'start'});return}const view=event.target.closest('[data-view]');if(view){state.view=view.dataset.view;render();window.scrollTo({top:0});return}if(event.target.closest('[data-sources]')){showSources();return}if(event.target.closest('[data-method]')){$('#method-dialog').showModal();return}if(event.target.closest('[data-close]')){event.target.closest('dialog').close();return}if(event.target.closest('[data-retry]'))loadNews()});
$('#apply-sources').onclick=()=>{disabled=Array.from($('#source-options').querySelectorAll('[data-source]')).filter(input=>!input.checked).map(input=>input.dataset.source);persist('techbrief-disabled',disabled);$('#sources-dialog').close();loadNews()};
$('#focus').onchange=e=>{focus=e.target.value;persist('techbrief-mix',focus);loadNews()};$('#refresh').onclick=loadNews;
for(const dialog of document.querySelectorAll('dialog'))dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close()}});
$('#date').textContent=new Date().toLocaleDateString(undefined,{weekday:'long',month:'long',day:'numeric',year:'numeric'});
render();loadNews();
`;

const HTML = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#152d34"><meta name="description" content="Ten ranked news stories plus startups, emerging technology and new products. Up to five takeaways each."><title>TechBrief — The tech worth knowing</title><link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E%3Crect width='40' height='40' rx='9' fill='%23152d34'/%3E%3Cpath d='M10 15v15m10-20v20m10-17v17' stroke='%23a8c7a2' stroke-width='5'/%3E%3C/svg%3E"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="/style.css"></head><body><a class="skip" href="#main">Skip to briefing</a>
<aside class="sidebar" aria-label="Main navigation"><a class="brand" href="/" aria-label="TechBrief home"><span class="brand-mark" aria-hidden="true"><i></i><i></i><i></i></span>techbrief<span style="color:#a4bc99">.</span></a><div class="tagline">Stay curious. Stay informed.</div><div class="nav-label">Your newsroom</div><nav><button class="nav-item active" data-view="briefing" aria-current="page"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/></svg>Daily brief</button><button class="nav-item" data-explore><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5Z"/></svg>Discover</button><button class="nav-item" data-view="saved"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M6 3h12v18l-6-4-6 4V3Z"/></svg>Saved stories<span class="count" id="saved-count"></span></button><button class="nav-item" data-sources><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c5 5 5 13 0 18-5-5-5-13 0-18Z"/></svg>My sources</button></nav><div class="secondary-nav"><div class="nav-line"></div><button class="nav-item" data-method><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 10v7M12 6v1"/></svg>How we choose</button></div><div class="sidebar-bottom"><div class="sidebar-note"><span class="tiny-dot"></span>Less scrolling.<br>More understanding.</div><div class="edition">10-STORY BRIEF + DISCOVERIES<br>UP TO 5 TAKEAWAYS EACH</div></div></aside>
<div class="shell"><header class="topbar"><div class="date"><b id="date"></b></div><div class="top-right"><span class="status"><span class="tiny-dot"></span><span id="updated" aria-live="polite">Preparing your brief</span></span><button class="round-button" id="refresh" aria-label="Refresh briefing" title="Refresh briefing"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M20 7v5h-5M4 17v-5h5M6 7a7 7 0 0 1 11.5-2L20 8M4 16l2.5 3A7 7 0 0 0 18 17"/></svg></button></div></header>
<main class="content" id="main"><div class="intro"><div><div class="eyebrow">A little discovery. A lot of perspective.</div><h1 id="page-title">The tech worth knowing.</h1><p id="page-subtitle">New tech, big ideas, and the headlines that matter. Up to five takeaways each.</p></div><button class="outline-button" data-sources aria-label="Customize sources"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M4 7h16M4 17h16M4 12h16"/><circle cx="8" cy="7" r="2" fill="#f7f8f5"/><circle cx="16" cy="12" r="2" fill="#f7f8f5"/><circle cx="10" cy="17" r="2" fill="#f7f8f5"/></svg>My sources</button></div>
<div class="brief-toolbar" id="brief-toolbar"><div class="brief-stats" aria-live="polite"><span><b id="story-count">—</b> stories<span id="mix-count"></span></span><span><b id="takeaway-count">—</b> takeaways</span><span>~<b id="read-time">—</b> min read</span></div><label class="focus-label">Your mix <select id="focus" aria-label="Briefing mix"><option value="technology">8 tech / 2 news</option><option value="balanced">7 tech / 3 news</option></select></label></div><div id="notice" class="notice hidden" role="status"></div>
<div class="workspace"><div class="feed-column"><section aria-label="Ranked stories and summaries"><p id="discovery-note" class="discovery-note hidden"></p><div id="stories" class="brief-list" aria-live="polite"></div><div id="finish" class="brief-finish hidden"><span id="finish-copy">Ten stories. You’re caught up.</span>Explore something new in <button data-explore>Startups &amp; launches ↓</button></div><p class="rank-note" id="summary-note"></p></section>
<section id="explore" class="explore-section" aria-labelledby="explore-title"><div class="explore-intro"><div class="eyebrow">Build, launch, discover</div><h2 id="explore-title" tabindex="-1">Startups &amp; launches.</h2><p>Young companies, useful new tools, and technology taking shape. Up to six extra picks, with the takeaways right here.</p><div class="explore-meta" id="explore-count" aria-live="polite">Finding recent discoveries…</div><div class="explore-filters" role="group" aria-label="Filter discoveries"><button class="active" data-explore-filter="All" aria-pressed="true">All finds</button><button data-explore-filter="Startups" aria-pressed="false">Startups</button><button data-explore-filter="Products &amp; services" aria-pressed="false">Products &amp; services</button><button data-explore-filter="Emerging technology" aria-pressed="false">Emerging tech</button></div></div><div id="explore-stories" class="brief-list" aria-live="polite"></div><p class="explore-note">TechCrunch, Ars Technica and MIT Technology Review reporting, plus clearly labeled Product Hunt maker listings. Listing dates are publication dates; prototypes and claims aren’t proof of availability or performance.</p></section></div>
<aside class="rail" aria-label="Briefing context"><div class="rail-block"><h2 class="rail-title">Chosen for a reason</h2><div class="criteria"><div class="criterion"><span class="criterion-number">01</span><div><strong>Impact over volume</strong><p>Developments affecting public life, the economy, and the technology you use.</p></div></div><div class="criterion"><span class="criterion-number">02</span><div><strong>A little new and notable</strong><p>Room for fresh devices, useful tools, and emerging technology alongside the big stories.</p></div></div><div class="criterion"><span class="criterion-number">03</span><div><strong>Tech first, with context</strong><p>Eight technology stories and two news stories by default. Choose 7/3 for a little more world news.</p></div></div></div></div><div class="rail-rule"></div><div class="rail-title-row"><h2 class="rail-title">Your sources</h2><button data-sources>Edit ↗</button></div><div id="rail-sources"></div><p class="rail-caption" id="sources-count">Connecting to publishers…</p><div class="rail-rule"></div><div class="note-card"><div class="note-icon" aria-hidden="true">✓</div><h3>The takeaways<br>are right here.</h3><p>Read the bullets and move on. Original links are there if you want to check a source or go deeper.</p><button data-method>How the briefing works</button></div></aside></div>
<footer class="footer"><span>A little context. A lot less scrolling.</span><button data-method>Sources & selection ↗</button></footer></main></div>
<dialog id="sources-dialog" aria-labelledby="sources-title"><div class="dialog-top"><div><div class="eyebrow">Your newsroom</div><h2 id="sources-title">Choose your sources.</h2></div><button class="dialog-close" data-close aria-label="Close sources">×</button></div><p class="dialog-copy">Choose sources for your top 10 and the separate Startups &amp; launches section. Your choices are remembered in this browser.</p><div id="source-options"></div><div class="source-dialog-foot"><button class="solid-button" id="apply-sources">Update my briefing ↗</button></div></dialog>
<dialog id="method-dialog" aria-labelledby="method-title"><div class="dialog-top"><div><div class="eyebrow">Behind the brief</div><h2 id="method-title">Ten stories worth your time.</h2></div><button class="dialog-close" data-close aria-label="Close selection approach">×</button></div><p class="dialog-copy"><strong>How stories are ranked.</strong> Your default mix is eight technology stories and two general-news stories; choose 7/3 for a little more news. Within the tech allocation, up to two slots are reserved for new products or emerging technology when available. We rank those selections by impact, independent coverage, freshness, and feed placement. If a category lacks recent distinct reporting, we fill from available sources and show the actual mix. Repeated publishers and similar subjects receive a diversity penalty. This is a transparent heuristic, not an objective measure of importance or a personalized model of you.</p><p class="dialog-copy"><strong>One story, up to five takeaways.</strong> We use text supplied in publisher feeds and accessible article pages. The most relevant factual sentences become concise bullets. Short sources produce fewer bullets. The briefing never invents extra facts to reach five. Article text may include attributed claims and quotes; those remain the publisher’s reporting.</p><p class="dialog-copy"><strong>Startups &amp; launches.</strong> Up to six additional picks from the past seven days cover startups, products and services, and emerging technology. Relevant reporting is preferred, with room for up to two Product Hunt listings. Maker descriptions are labeled and are not independent reviews. Articles already in the top 10, conference promotions, shopping deals and generic advice are excluded. Category filters narrow these six picks; fewer appear when sources lack suitable reporting.</p><p class="dialog-copy"><strong>NYT and subscriptions.</strong> NYT summaries use the public feed abstract. Your student subscription works when you open nytimes.com directly; this app does not receive your password or subscription cookies. Full-text access is not assumed.</p><p class="dialog-copy"><strong>Freshness and availability.</strong> The daily brief considers stories from the last four days; Startups &amp; launches uses seven days, based on original publication dates. Publisher feeds refresh on demand with a five-minute in-memory cache. Article text is cached for up to 30 minutes. Failed publishers are marked; fewer than 10 stories are shown when there is insufficient recent reporting.</p><div class="method"><strong>Your preferences stay here</strong>Source choices, relevance preference, and saved stories are stored in this browser. Read the <a href="/source-plan" target="_blank" rel="noopener noreferrer">source plan ↗</a> for details.</div></dialog><div id="toast" class="toast hidden" role="status" aria-live="polite"></div><noscript><p>Enable JavaScript to read your ranked briefing.</p></noscript><script src="/app.js" defer></script></body></html>`;

const PLAN = "# TechBrief source and selection plan\n\n## The reading experience\n\nThe home page is a ranked briefing of at most **10 stories**, with **one to five factual bullets per story**, expanded inline. The default mix is **8 technology / 2 general news**, with a **7/3** option. Within the technology allocation, up to two slots are reserved for new products or emerging technology when candidates are available. Original links are optional references. There is no full feed, load-more button, or requirement to open individual article dialogs. If fewer than ten distinct recent stories are available, the app shows fewer rather than filling the list with old or repeated reporting.\n\n## Startups & launches\n\nA separate section adds **up to six picks** beneath the daily top ten, with the same **one to five inline takeaways**. Its filters are Startups, Products & services, and Emerging technology. The Discover navigation button jumps directly to it on desktop or phone. These picks do not change the daily 8/2 or 7/3 allocation and do not repeat stories already selected there.\n\nUse original publication dates from the past **seven days**. Select up to two picks per available category before filling shortages with other relevant discoveries. Prefer publisher reporting, penalize repeated publishers, suppress matching headlines/products, and allow at most two maker listings. The selector is a relevance heuristic, not a product endorsement or a popularity chart. Show fewer picks when feeds fail or lack suitable recent items.\n\nExclude conference/ticket promotions, newsletter roundups, shopping deals, generic founder advice, sponsored categories, recalls, layoffs, outages and regulatory news. A funded startup can qualify when the reporting explains the company or technology; venture-fund announcements alone do not qualify. Research and prototypes are discoveries, not evidence that a product is available to buy.\n\n### Why these sources\n\n- **TechCrunch Startups** supplies focused reporting on young companies, launches and funding. Its category feed adds startup depth beyond the main TechCrunch feed. Filter out its event promotions and advice articles.\n- **MIT Technology Review** adds emerging-technology and research coverage beyond app launches. Its main RSS feed mixes those articles with newsletters, opinion and sponsored material, so only concrete relevant discoveries qualify. Limited public text stays limited.\n- **Product Hunt** adds small tools, apps and services that larger publications may not cover. Treat descriptions as **maker/community launch listings**, label them **not independently reviewed**, and link to the Product Hunt listing. Never turn promotional claims into independently verified facts or fetch arbitrary maker websites. An updated listing does not become a new launch: use its original `published` date, and exclude listings without one. Strip the feed's Discussion/Link footer and encoded HTML.\n- **Ars Gear & Gadgets**, already connected, provides reported hardware and device coverage. The main Ars and TechCrunch feeds also supply relevant additional discoveries.\n\nThe three new specialist feeds are used only by this section. They cannot fill the main news briefing, including when main feeds are unavailable. Source preferences apply before deduplication, so disabling a general feed does not remove a story offered by an enabled specialist feed. TechCrunch and its startup feed count as one publisher, as do both Ars feeds.\n\nSource references: https://techcrunch.com/category/startups/ , https://www.technologyreview.com/feed/ , https://www.producthunt.com/about , https://arstechnica.com/rss-feeds/\n\nVentureBeat was evaluated but its feed returned a rate-limit/security response during implementation. YC Launch is useful for manual discovery, but no stable official feed was confirmed; neither is wired into the automated edition. No new subscriptions, API keys or scraping of private launch-directory APIs are required.\n\n## Connected sources\n\n| Publisher | Coverage | Feed |\n| --- | --- | --- |\n| BBC News | World affairs | https://feeds.bbci.co.uk/news/world/rss.xml |\n| NPR | US and international news | https://feeds.npr.org/1001/rss.xml |\n| New York Times | Top stories | https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml |\n| BBC Technology | Technology | https://feeds.bbci.co.uk/news/technology/rss.xml |\n| Ars Technica | Technology and science | https://feeds.arstechnica.com/arstechnica/index |\n| Ars Gear & Gadgets | Devices and product launches | https://feeds.arstechnica.com/arstechnica/gadgets |\n| TechCrunch | Technology and startups | https://techcrunch.com/feed/ |\n| TechCrunch Startups | Startups & launches only: startup reporting | https://techcrunch.com/category/startups/feed/ |\n| MIT Technology Review | Startups & launches only: emerging technology | https://www.technologyreview.com/feed/ |\n| Product Hunt | Startups & launches only: maker listings | https://www.producthunt.com/feed |\n\n## Importance and relevance\n\n1. Consider only reporting published within the last four days. Missing dates are excluded from the ranked edition.\n2. Score public/economic impact using documented keyword rules: major political developments, public safety, security, economic policy and broad technology changes receive impact weight. New devices and emerging-technology coverage receive a discovery boost; deals and coupons do not count as discovery. Product defects, recalls and corporate layoffs are industry news, not discoveries.\n3. Add signals for freshness, publisher feed placement and related headlines from independent publishers. TechCrunch and TechCrunch Startups count as one publisher. BBC News and BBC Technology count as one publisher for coverage/diversity. Ars Technica and Ars Gear & Gadgets also count as one publisher.\n4. Apply the chosen mix: **8 tech / 2 news** by default, or **7 tech / 3 news**. Topic classification can recognize technology in general-news feeds and exclude unrelated health/history reporting from technology counts.\n5. Greedily select up to ten articles within the category allocation, reserving up to two of the tech slots for eligible product launches, useful new tools or emerging technologies. Fill shortages from the available category and expose actual counts. Then order the selected stories by importance/relevance, penalizing repeated publishers and suppressing closely matching event headlines. Variations such as “buy out” and “buyouts” are normalized.\n\nThis is an explicit heuristic, not an objective importance score, an editorial guarantee, or a learned profile of the visitor. Related-coverage detection uses normalized headline overlap; it can miss paraphrases or group distinct angles too aggressively. Feed order is used as placement, not assumed to represent a publisher's editorial ranking. Each story includes a short explanation of its ranking signals. Discovery stories carry a **New & notable** badge. The target is a minimum discovery allocation when available, not a ban on additional genuinely important new-technology stories.\n\n## Summaries you can read in the app\n\nFor selected stories in either section, use article text already included in the feed where available. Otherwise, attempt to read the publicly accessible article page on that publisher's allowlisted domain. Use structured `articleBody` or semantic article/main paragraphs; remove photo credits, captions, promotional text and link-heavy related-story lists. Never forward user cookies or fetch arbitrary user-supplied URLs. Follow only redirects that remain on the publisher's domain, with a bounded timeout and response size.\n\nGenerate an extractive summary: split source text into sentences, score relevance to the headline plus concrete details and developments, suppress repetitive sentences, choose up to five, and preserve their source order. Decimal numbers and common abbreviations remain intact. Long sentences are shortened at a word/sentence boundary. These are selected source sentences, not AI-written paraphrases or independently verified claims. The app does not invent extra bullets when the available text is short.\n\nNYT stories use the public RSS abstract. A user's reading subscription is not ingested and does not authorize backend full-text access. Pages explicitly marked inaccessible for free are not used for article text. When access or extraction fails, use the feed text and retain attribution. Short abstracts may yield only one or two bullets.\n\n## Your NYT student subscription\n\nUse your existing login directly on nytimes.com if you choose to open the original. The app does not collect your password or subscription cookies. No extra student subscriptions are necessary for the working briefing. Developer API access is separate from reading access.\n\nNYT developer documentation: https://developer.nytimes.com/\nNYT Top Stories specification: https://github.com/nytimes/public_api_specs/blob/master/top_stories/top_stories_v2.md\nNYT RSS directory and terms: https://www.nytimes.com/rss\n\n## Refresh, errors and privacy\n\nFeeds load on demand with a five-minute in-memory cache and twelve-second per-feed timeouts. Public article text is cached in memory for thirty minutes, capped at forty entries. A browser may reuse an API response for one minute. No platform Cache API is required. One publisher's failure does not prevent other reporting from loading; previous feed entries may be retained and the source marked stale.\n\nSource exclusions, relevance preference and saved summary snapshots stay in browser local storage. Hosted and localhost lists are separate. There is no account sync, durable article archive, background scheduler, or notification delivery.\n\n## Further integrations\n\n- NYT Top Stories / Article Search APIs: separate developer application and server-side API key. Confirm current quotas and permitted content before enabling.\n- Guardian Open Platform: developer key and an access tier appropriate to the use. https://open-platform.theguardian.com/documentation/\n- Licensed Reuters/AP coverage if required.\n- Optional AI paraphrasing with a separately authorized model API connection, validation against the provided source text, and explicit handling of limited-text articles. The currently working version uses extractive summaries and makes no model API calls.\n\nPublisher references: https://www.bbc.co.uk/news/10628494 , https://www.npr.org/rss/ , https://arstechnica.com/rss-feeds/ , https://techcrunch.com/feed/\n\nKeep this personal reading tool private, preserve attribution and original links, and review the publishers' applicable terms before broader distribution or commercial use. Do not assume RSS or subscription access grants unlimited reuse rights.\n";
