# TechBrief source plan

## CONNECTED NOW
BBC World: https://feeds.bbci.co.uk/news/world/rss.xml
BBC Technology: https://feeds.bbci.co.uk/news/technology/rss.xml
NPR: https://feeds.npr.org/1001/rss.xml
NYT Top Stories: https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml
Ars Technica: https://feeds.arstechnica.com/arstechnica/index
TechCrunch: https://techcrunch.com/feed/

We retrieve public RSS headlines, dates, descriptions and original links. Summaries are cleaned descriptions shortened to 300 characters. No full article text or abstractive AI generation is used. No API keys are needed for this version.

## YOUR STUDENT SUBSCRIPTION
Use your NYT login directly on nytimes.com when opening the original article. No password or subscription cookies are collected by this app. API access requires a separate developer application. Reading access does not by itself authorize full-text ingestion or redistribution.

## NEXT SOURCES
1. NYT Top Stories / Article Search API: developer account and appropriate API keys. Store secrets on the server, confirm current limits and terms, retain RSS fallback.
https://developer.nytimes.com/
https://github.com/nytimes/public_api_specs/blob/master/top_stories/top_stories_v2.md
2. Guardian Open Platform: developer key and suitable access tier.
https://open-platform.theguardian.com/documentation/
https://open-platform.theguardian.com/access/
3. Official research releases, arXiv papers and company engineering blogs, clearly labeled as primary sources. https://info.arxiv.org/help/api/index.html
4. Reuters / AP only through licensed access.

No additional student subscriptions are needed for this MVP. Check existing university library access before paying for more reading subscriptions.

## PROCESSING
Fetch on demand with a five-minute cache and 12-second feed timeouts. Retain previous in-memory stories if a feed fails and mark it stale. Other feeds continue working. Normalize HTTPS URLs, remove tracking parameters, deduplicate URLs and exact normalized titles. Sort chronologically or rotate through each publisher. Topic labels use keyword matching, not semantic classification. Different reports about the same event are not yet clustered. Missing publication dates remain missing; older feed entries show their original dates. There is no background refresh or durable article archive.

## SUMMARY ROADMAP
For richer summaries use licensed article text or text provided by the user. Ground factual bullets in original links, retain disagreement and uncertainty, and distinguish reporting, opinion and company claims. Event clustering and cross-source synthesis are future work.

## SOURCE REFERENCES
NYT RSS directory/terms: https://www.nytimes.com/rss
BBC feed help: https://www.bbc.co.uk/news/10628494
NPR feed directory: https://www.npr.org/rss/
Ars feed directory: https://arstechnica.com/rss-feeds/
TechCrunch feed: https://techcrunch.com/feed/

Personal reading tool. Keep publisher attribution and original links. Review current publisher terms before broader distribution, commercial use or full-text features. RSS availability does not imply unlimited reuse rights. The hosted app is private by default.

## STORAGE
Reading list and source preferences are browser-local. No account sync, password collection, scheduled email delivery, or paywall bypass. Deployment source and a more detailed plan are in the GitHub repository.
