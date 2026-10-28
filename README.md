# AGB Labs

Source for [agb-labs.com](https://agb-labs.com), the portfolio of Adam Bell, a product manager in Manchester
who builds his own products with AI coding agents.

The site is also a working example of how those products get built. Every product on the home page has a
small demo you can play with, every case study records what was chosen and what it cost, and the repo keeps
the same habits: decisions written down, privacy by default, numbers pulled where they can be read, and
nothing shipped half-finished.

[![Check](https://github.com/ProductBell91/agb-labs/actions/workflows/check.yml/badge.svg)](https://github.com/ProductBell91/agb-labs/actions/workflows/check.yml)

## How we build

**Decide first, and write down the trade-off.** Each product starts from one bet about what will make people
come back. Case studies show decisions as "Chose / Gave up" notes ([`Decision.astro`](src/components/Decision.astro)),
and this repo's own calls are in [`docs/decisions.md`](docs/decisions.md) in the same format.

**Show it working, don't describe it.** The home page demos are small working copies of each product's core
loop, not screenshots or videos: swipe on names, hum a tune, check a venue, approve a post
([`src/components/demos/`](src/components/demos/)). They're plain Astro components with a few lines of inline
script each, so the home page is about 14 KB of HTML and CSS compressed, plus fonts, with no framework.

**Let the numbers change the plan.** BumpSync's retention data rewrote its roadmap
([case study](https://agb-labs.com/work/bumpsync/)). Here, [`scripts/analytics.mjs`](scripts/analytics.mjs)
pulls Google Analytics and Search Console into JSON every day, so the numbers can be read in a terminal by
a person or an agent, with no dashboard needed.

**Privacy by default.** Analytics loads only after a visitor taps Accept ([`public/consent.js`](public/consent.js)),
and fonts are self-hosted, so declining means no requests to Google at all. The
[privacy](src/pages/privacy.astro) and [cookie](src/pages/cookies.astro) pages are written in plain English.

**Keep AI honest.** In the products, AI guesses are labelled as guesses until a person confirms them, and
nothing goes out in public without a person approving it. The site makes the same promise and shows each one
working.

**Agents write most of the code; a person makes the calls.** Coding agents run on a server and are directed
from a phone, with a browser API so they can run QA themselves and check the console
([How I build](https://agb-labs.com/how-i-build/)). Commits made with an agent say so.

## Running it

Needs Node 22 (see [`.nvmrc`](.nvmrc)).

```bash
npm install
npm run dev      # http://127.0.0.1:4010
npm run check    # type-check .astro and .ts
npm run build    # static site in dist/
```

Every push and pull request runs `check` and `build` in [GitHub Actions](.github/workflows/check.yml), and
a push to `main` that passes deploys to Cloudflare Pages. To deploy by hand:

```bash
npm run build && npx wrangler pages deploy dist --project-name agb-labs --branch main
```

## What's where

```
src/
  pages/              routes: home, how-i-build, about, privacy, cookies
    work/[slug]       case studies (only entries with published: true)
    writing/          articles; the section only exists once one is published
  content/
    work/             one MDX file per product: copy, metrics, screenshots, case study
    writing/          articles in Markdown or MDX
  components/
    Stage.astro       one product's slot on the home page: the pitch on one side, a demo on the other
    Decision.astro    the "Chose / Gave up" note
    demos/            the playable product demos
  layouts/Base.astro  head, Person schema, nav, footer
  site.ts             who the site is about, and their profile links
  styles/global.css   colour tokens (light and dark), type, shared phone frame
public/consent.js     consent banner and analytics loader
scripts/analytics.mjs GA4 and Search Console: setup and daily pull
docs/decisions.md     the decisions behind this repo
```

## Content

- **Products and case studies**: `src/content/work/*.mdx`. The front matter holds the copy, metrics and
  screenshots; a product only gets a case study page once its write-up is finished and `published: true` is set.
- **Writing**: `src/content/writing/`, served at `/writing/<slug>/` with BlogPosting schema. The nav link
  and `/writing/` index appear once at least one article has `published: true`.
- **Name and profiles**: titles and the Person schema lead with "Adam Bell". Profile links in `src/site.ts`
  go into the schema's `sameAs`, the footer and `/about/`; `listed: false` keeps one in the schema only.

## Analytics and Search Console

- **GA4** stream `G-9VFMGRZ2NS`, loaded by `public/consent.js` only after Accept. Custom events: `demo_start`
  (param `demo`, first tap on each demo) and `contact_click` (any mailto link, a key event).
- **Search Console** property `sc-domain:agb-labs.com`; the sitemap is listed in `robots.txt`.
- **API**: `scripts/analytics.mjs` with a Google service account (key file path in `AGB_GOOGLE_CREDENTIALS`).
  `npm run analytics:setup` registers custom dimensions and key events and submits the sitemap; it is safe to
  re-run. `npm run analytics:pull` writes `var/analytics/{ga4,search-console}-latest.json` (gitignored).
- If you add a cookie or a third-party provider, update the tables on `/cookies/` and `/privacy/`.

## Licence

© Adam Bell. The code is public to read and learn from; it isn't licensed for reuse. Product names, copy and
screenshots belong to their products.
