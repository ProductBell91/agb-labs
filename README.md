# AGB Labs

Portfolio site for agb-labs.com. Static Astro, deployed to Cloudflare Pages.

```bash
npm install
npm run dev      # http://127.0.0.1:4010
npm run build    # outputs dist/
```

- Home page product demos: `src/components/demos/`
- Case studies: `src/content/work/*.mdx` (only `published: true` get a page)
- Tailnet preview: PM2 `agb-labs-preview` serves `dist/`

## Analytics, Search Console, privacy

- **GA4**: property `559028350`, stream `G-9VFMGRZ2NS`. `public/consent.js` loads it only after the visitor
  taps Accept (choice in localStorage `agb:cookie-consent`; "Cookie settings" in the footer asks again).
  Custom events: `demo_start` (param `demo`, first tap on each product demo) and `contact_click` (any mailto
  link, a key event). Fonts are self-hosted, so declining means no requests to Google.
- **Search Console**: `sc-domain:agb-labs.com`; sitemap `https://agb-labs.com/sitemap-index.xml` (in robots.txt).
- **API**: `scripts/analytics.mjs` with the BumpSync analytics service account (key
  `/var/lib/agb-labs/analytics-sa.json`). `npm run analytics:setup` registers dimensions/key events and
  submits the sitemap (idempotent; re-run after adding events). `npm run analytics:pull` writes
  `var/analytics/{ga4,search-console}-latest.json`; systemd `agb-labs-analytics.timer` runs it daily at 06:35 UK.
- **Policies**: `/privacy/` and `/cookies/` (`src/pages/`). Update the cookie table if a cookie is added and
  the "who helps" table if a provider is.
