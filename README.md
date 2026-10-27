# TechBrief

A personal news and technology reader: short publisher summaries, a quick briefing, and links to original articles.

## Run locally

Requires Node.js 22 or newer. There are no npm dependencies and no API keys to configure.

```sh
npm run dev
```

Open http://localhost:3000. Set `PORT` to use another port. The app fetches live feeds when you open it; the first request can take up to 12 seconds if a publisher is slow.

## What works

- General news and technology from BBC News, NPR, The New York Times, BBC Technology, Ars Technica, and TechCrunch.
- Feed descriptions cleaned and shortened to 300 characters, with publisher and publication time.
- Quick briefing with the newest available article from each selected feed, up to six.
- World/news, technology, AI, startup, and science filters; text search; newest-first or publisher-balanced sorting.
- Source controls and health reporting, including partial failures and stale in-memory fallback.
- Saved article snapshots and publisher preferences in browser local storage.
- Responsive desktop/mobile interface, native keyboard-accessible dialogs, and original publisher links.

## Source plan and student access

See [SOURCE_PLAN.md](SOURCE_PLAN.md) for the connected feeds, ingestion design, API roadmap, and limitations. The same plan is available inside the app under **How it works** and at `/source-plan`.

Your NYT student subscription can unlock original NYT articles when you sign in directly on nytimes.com. TechBrief does not collect your subscription password or cookies. No extra subscriptions are needed for this version. NYT developer access is separate from a reading subscription.

The current summaries are shortened publisher descriptions. Richer AI summaries from licensed full text, related-story clustering, and cross-source synthesis are planned; they are not implemented in this version. Topic tags use keyword rules. Publisher balance rotates through sources; it does not rank reliability or editorial importance.

## Verify

```sh
npm test              # parser, safety, failure recovery, routing, and client syntax
npm run smoke         # real network check against all feeds
npm run build         # package the Worker
npm run validate      # check the deployment artifact
```

The live smoke check requires internet access. Unit tests use fixtures and mocked feed responses.

## Project structure

```text
worker/index.js                App, embedded UI, feed adapters, caching, and source plan
scripts/dev.mjs                Node development server
scripts/build.sh               Portable Worker artifact build
scripts/validate-artifact.mjs   Deployment shape validation
scripts/smoke.mjs               Live feed integration check
tests/news.test.mjs             Deterministic integration/unit tests
.openai/hosting.json            Sites project identity and storage configuration
SOURCE_PLAN.md                 Source research and next integrations
```

The dependency-free app uses an ES module Worker with `fetch(request, env, ctx)`. The Node dev server exercises the same handler as production. HTML, CSS, and client JS are embedded in the Worker and served from separate routes. No subscription credentials, AI keys, or user accounts are required.

## Refresh and storage

Feeds load on demand with a five-minute memory/edge cache and a 12-second timeout per publisher. Refresh may return the same cached edition. The app removes common tracking parameters and deduplicates identical URLs/headlines; it does not yet group different reports about one event. Feed coverage can be incomplete and older entries retain their original publication dates.

Local storage is specific to a browser and origin. Localhost and the hosted site have separate reading lists. There is no account sync, durable article archive, background scheduler, or email digest. In-memory fallback may disappear when a server instance restarts. Failed feeds and cached articles are identified in the source panel.

## Hosting

This project is configured for a private OpenAI Site in `.openai/hosting.json`. A successful build produces `dist/server/index.js` and `dist/.openai/hosting.json`. Save and deploy it through Sites using the exact pushed source commit. Secrets, if future API integrations need them, belong in runtime environment settings rather than source control.

For other Worker-compatible hosts, use `worker/index.js` as the ES module entry point and configure deployment with that provider. The Node server can also run locally without deployment.

Publisher RSS availability does not imply unlimited reuse rights. This version is a personal reading tool. Retain attribution and original links, and review each source's terms before broader distribution or commercial use.
