# TechBrief source and selection plan

## The reading experience

The home page is a ranked briefing of at most **10 stories**, with **one to five factual bullets per story**, expanded inline. The default mix is **8 technology / 2 general news**, with a **7/3** option. Within the technology allocation, up to two slots are reserved for new products or emerging technology when candidates are available. Original links are optional references. There is no full feed, load-more button, or requirement to open individual article dialogs. If fewer than ten distinct recent stories are available, the app shows fewer rather than filling the list with old or repeated reporting.

## Connected sources

| Publisher | Coverage | Feed |
| --- | --- | --- |
| BBC News | World affairs | https://feeds.bbci.co.uk/news/world/rss.xml |
| NPR | US and international news | https://feeds.npr.org/1001/rss.xml |
| New York Times | Top stories | https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml |
| BBC Technology | Technology | https://feeds.bbci.co.uk/news/technology/rss.xml |
| Ars Technica | Technology and science | https://feeds.arstechnica.com/arstechnica/index |
| Ars Gear & Gadgets | Devices and product launches | https://feeds.arstechnica.com/arstechnica/gadgets |
| TechCrunch | Technology and startups | https://techcrunch.com/feed/ |

## Importance and relevance

1. Consider only reporting published within the last four days. Missing dates are excluded from the ranked edition.
2. Score public/economic impact using documented keyword rules: major political developments, public safety, security, economic policy and broad technology changes receive impact weight. New devices and emerging-technology coverage receive a discovery boost; deals and coupons do not count as discovery. Product defects, recalls and corporate layoffs are industry news, not discoveries.
3. Add signals for freshness, publisher feed placement and related headlines from independent publishers. BBC News and BBC Technology count as one publisher for coverage/diversity. Ars Technica and Ars Gear & Gadgets also count as one publisher.
4. Apply the chosen mix: **8 tech / 2 news** by default, or **7 tech / 3 news**. Topic classification can recognize technology in general-news feeds and exclude unrelated health/history reporting from technology counts.
5. Greedily select up to ten articles within the category allocation, reserving up to two of the tech slots for eligible product launches, useful new tools or emerging technologies. Fill shortages from the available category and expose actual counts. Then order the selected stories by importance/relevance, penalizing repeated publishers and suppressing closely matching event headlines. Variations such as “buy out” and “buyouts” are normalized.

This is an explicit heuristic, not an objective importance score, an editorial guarantee, or a learned profile of the visitor. Related-coverage detection uses normalized headline overlap; it can miss paraphrases or group distinct angles too aggressively. Feed order is used as placement, not assumed to represent a publisher's editorial ranking. Each story includes a short explanation of its ranking signals. Discovery stories carry a **New & notable** badge. The target is a minimum discovery allocation when available, not a ban on additional genuinely important new-technology stories.

## Summaries you can read in the app

For selected stories, use article text already included in the feed where available. Otherwise, attempt to read the publicly accessible article page on that publisher's allowlisted domain. Use structured `articleBody` or semantic article/main paragraphs; remove photo credits, captions, promotional text and link-heavy related-story lists. Never forward user cookies or fetch arbitrary user-supplied URLs. Follow only redirects that remain on the publisher's domain, with a bounded timeout and response size.

Generate an extractive summary: split source text into sentences, score relevance to the headline plus concrete details and developments, suppress repetitive sentences, choose up to five, and preserve their source order. Decimal numbers and common abbreviations remain intact. Long sentences are shortened at a word/sentence boundary. These are selected source sentences, not AI-written paraphrases or independently verified claims. The app does not invent extra bullets when the available text is short.

NYT stories use the public RSS abstract. A user's reading subscription is not ingested and does not authorize backend full-text access. Pages explicitly marked inaccessible for free are not used for article text. When access or extraction fails, use the feed text and retain attribution. Short abstracts may yield only one or two bullets.

## Your NYT student subscription

Use your existing login directly on nytimes.com if you choose to open the original. The app does not collect your password or subscription cookies. No extra student subscriptions are necessary for the working briefing. Developer API access is separate from reading access.

NYT developer documentation: https://developer.nytimes.com/
NYT Top Stories specification: https://github.com/nytimes/public_api_specs/blob/master/top_stories/top_stories_v2.md
NYT RSS directory and terms: https://www.nytimes.com/rss

## Refresh, errors and privacy

Feeds load on demand with a five-minute in-memory cache and twelve-second per-feed timeouts. Public article text is cached in memory for thirty minutes, capped at forty entries. A browser may reuse an API response for one minute. No platform Cache API is required. One publisher's failure does not prevent other reporting from loading; previous feed entries may be retained and the source marked stale.

Source exclusions, relevance preference and saved summary snapshots stay in browser local storage. Hosted and localhost lists are separate. There is no account sync, durable article archive, background scheduler, or notification delivery.

## Further integrations

- NYT Top Stories / Article Search APIs: separate developer application and server-side API key. Confirm current quotas and permitted content before enabling.
- Guardian Open Platform: developer key and an access tier appropriate to the use. https://open-platform.theguardian.com/documentation/
- Licensed Reuters/AP coverage if required.
- Optional AI paraphrasing with a separately authorized model API connection, validation against the provided source text, and explicit handling of limited-text articles. The currently working version uses extractive summaries and makes no model API calls.

Publisher references: https://www.bbc.co.uk/news/10628494 , https://www.npr.org/rss/ , https://arstechnica.com/rss-feeds/ , https://techcrunch.com/feed/

Keep this personal reading tool private, preserve attribution and original links, and review the publishers' applicable terms before broader distribution or commercial use. Do not assume RSS or subscription access grants unlimited reuse rights.
