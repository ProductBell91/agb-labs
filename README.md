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
