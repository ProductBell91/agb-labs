# Decisions

The calls behind this repo, in the same form as the notes in the case studies: what was chosen, what it
cost, and why. Newest first. When a decision changes, add a new entry rather than editing the old one.

---

## Lead with the person's name, not the brand

**Chose:** page titles and the Person schema start with "Adam Bell", with profile links in `sameAs`.
**Gave up:** brand-first titles for "AGB Labs".

The site's job is to show what one product manager can do. Search Console showed people finding it by
"agb labs" and never by name, so titles, structured data and the About page now say who it's about, and
LinkedIn and GitHub confirm it.

## The writing section doesn't exist until there's something in it

**Chose:** `/writing/`, its nav link and its index page are only built once one article is published.
**Gave up:** a "coming soon" page to show it's planned.

An empty section tells visitors and search engines that the site is unfinished. Articles live in the repo
as drafts (`published: false`) until they're ready.

## Only finished case studies get a page

**Chose:** a product shows as a card with a demo until its write-up is done; then `published: true` gives it
a page.
**Gave up:** a page for every product from day one.

A thin case study is worse than none. BumpSync has the full story; the others will follow when theirs is
worth reading.

## Analytics only with consent, and self-hosted fonts

**Chose:** Google Analytics loads only after a visitor taps Accept, and fonts ship with the site.
**Gave up:** numbers from anyone who declines or ignores the banner, so analytics undercounts real visits.

Declining should mean no requests to Google at all, and loading fonts from Google would break that.
Search Console fills part of the gap, because it counts search clicks without cookies.

## Pull the numbers into files, not a dashboard

**Chose:** a daily job writes GA4 and Search Console results to JSON in `var/analytics/`.
**Gave up:** a dashboard to look at.

A file can be read by a person in a terminal or by an agent mid-task, and kept over time. It's the same
pattern used across the products.

## Demos are small working copies, not screenshots or embeds

**Chose:** each product's core loop rebuilt as a small working demo inside a phone frame.
**Gave up:** fidelity to the real apps, and some upkeep when a product changes.

Hiring managers and users skim. Thirty seconds playing with the thing says more than a paragraph, and
embedding the real apps would mean logins, live data and a slow page.

## Static Astro with no client framework

**Chose:** static HTML from Astro; each demo is an Astro component with a few lines of inline script.
**Gave up:** reusing React components from the products.

The site is mostly words and a handful of interactions. Without a framework the home page is about 14 KB of
HTML and CSS compressed, and there's no runtime to keep updated.
