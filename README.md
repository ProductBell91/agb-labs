# AGB Labs

Source for [agb-labs.com](https://agb-labs.com), the portfolio of Adam Bell: a product manager in Manchester
who builds his own products with AI coding agents. Every product on the home page has a small playable demo,
written as plain Astro components with no framework runtime.

Built the same way as the products: I make the product calls, and agents write most of the code from my
phone ([How I build](https://agb-labs.com/how-i-build/)). Static [Astro](https://astro.build), deployed to
Cloudflare Pages.

```bash
npm install
npm run dev      # http://127.0.0.1:4010
npm run build    # outputs dist/
```

- Home page product demos: `src/components/demos/`
- Case studies: `src/content/work/*.mdx` (only `published: true` get a page)

## Search: name and writing

- **Name**: titles and the Person schema lead with "Adam Bell" (legal name `Adam Guy Bell` as `alternateName`).
  Profile links live in `src/site.ts`; each one goes into `sameAs`, the footer and `/about/`. `listed: false` keeps one in the schema only.
- **Writing**: Markdown/MDX in `src/content/writing/`, served at `/writing/<slug>/` with BlogPosting schema. Set
  `published: true` to ship one; the nav link and `/writing/` index only exist once at least one is published.

## Analytics, Search Console, privacy

- **GA4**: property `559028350`, stream `G-9VFMGRZ2NS`. `public/consent.js` loads it only after the visitor
  taps Accept (choice in localStorage `agb:cookie-consent`; "Cookie settings" in the footer asks again).
  Custom events: `demo_start` (param `demo`, first tap on each product demo) and `contact_click` (any mailto
  link, a key event). Fonts are self-hosted, so declining means no requests to Google.
- **Search Console**: `sc-domain:agb-labs.com`; sitemap `https://agb-labs.com/sitemap-index.xml` (in robots.txt).
- **API**: `scripts/analytics.mjs` with a Google service account (key path in `AGB_GOOGLE_CREDENTIALS`). `npm run analytics:setup` registers dimensions/key events and
  submits the sitemap (idempotent; re-run after adding events). `npm run analytics:pull` writes
  `var/analytics/{ga4,search-console}-latest.json` (gitignored); a daily timer runs it.
- **Policies**: `/privacy/` and `/cookies/` (`src/pages/`). Update the cookie table if a cookie is added and
  the "who helps" table if a provider is.
