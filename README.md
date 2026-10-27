# TechBrief

**Eight tech stories, two news stories, and a little new-tech discovery. Up to five bullet points each.**

## Run locally

Requires Node.js 22+. No dependencies, API keys or extra subscriptions are needed for the working extractive briefing.

```sh
npm run dev
```

Open http://localhost:3000. Set `PORT` for another port. An initial edition can take several seconds while publisher feeds and accessible article text load.

## What it does

- Returns at most ten recent stories: **8 tech / 2 news** by default or **7 tech / 3 news**. Selected stories remain ordered by impact and relevance.
- Reserves up to two slots within the tech allocation for new products, devices, useful tools or emerging technology, marked **New & notable**. Category shortages fill from available reporting and actual counts are displayed.
- Displays one to five source-grounded bullets directly beneath every headline. Original links are optional.
- Suppresses matching event headlines and reduces repetition from a single publisher.
- Lets you prioritize **8 tech / 2 news** or **7 tech / 3 news** and choose publishers.
- Uses BBC News, NPR, NYT, BBC Technology, Ars Technica, Ars Gear & Gadgets and TechCrunch.
- Reads publicly available article text when possible. Falls back to publisher feed abstracts when it is unavailable.
- Preserves saved story/summary snapshots and preferences in this browser.

The ranking is a documented heuristic, not an objective importance judgment. Summaries select relevant source sentences; they are extractive, not AI paraphrases. NYT summaries use the public feed abstract and can have fewer bullets. Your NYT student login continues to work directly on nytimes.com.

## Verify

```sh
npm test
npm run smoke
npm run build
npm run validate
```

Tests cover the ten-story limit, 8/2 and 7/3 mixes, discovery inclusion, category-shortage recovery, importance/relevance ordering, repeated events, summary limits, article extraction, subscription/redirect boundaries, cache restrictions, partial failure recovery, RSS parsing and client syntax. The live smoke test exercises the actual API handler and confirms ranked summaries from real publishers.

## Structure

```text
worker/index.js                Feed adapters, ranking, article extraction, summaries and embedded UI
scripts/dev.mjs                Local Node server using the production handler
scripts/smoke.mjs               Live API integration check
scripts/build.sh               Dependency-free Worker artifact build
scripts/validate-artifact.mjs   Deployment validation
tests/                         Product/ranking, extraction and host regression tests
.openai/hosting.json            Existing private Sites identity
SOURCE_PLAN.md                 Sources, ranking, summary method and limitations
```

The ES module Worker exports `fetch(request, env, ctx)`. HTML/CSS/client JavaScript are embedded and served through separate routes. The API `/api/news` accepts `focus=technology` (default 8/2) or `focus=balanced` (7/3); the legacy `world` value remains supported as 2/8 and an optional comma-separated allowlist of `sources`. It exposes at most ten summary objects and never returns full article bodies. The app uses the same endpoint locally and in production.

Feeds use a five-minute in-memory cache; public article text uses a bounded thirty-minute cache. Browser API responses are private and may be reused for one minute. The platform's restricted default Cache API is never accessed. There is no background scheduler, durable archive, account sync or password collection.

Build output is `dist/server/index.js` plus `dist/.openai/hosting.json`. Publish through Sites using the exact pushed source commit, preserving the current private audience. Runtime API secrets for any future integration belong in hosted environment settings, never source control.

See [SOURCE_PLAN.md](SOURCE_PLAN.md) for source URLs, how ranking and extraction work, subscription limits and future integrations. The same plan is served at `/source-plan`.
