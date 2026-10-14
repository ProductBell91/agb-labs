#!/usr/bin/env node
/**
 * agb-labs.com's numbers: Google Analytics 4 (who visits, what they try) and Search Console (what people
 * search to find the site). Pulled by a service account and written as JSON to var/analytics/, like
 * Mavropost's src/analytics.mjs and BumpSync's and LittleSpots' scripts/analytics.
 *
 *   node scripts/analytics.mjs setup        find the property, register events, submit the sitemap
 *   node scripts/analytics.mjs ga4 [--days=N]
 *   node scripts/analytics.mjs gsc [--days=N]
 *   node scripts/analytics.mjs pull [--days=N]   both
 *
 * Identity: the BumpSync analytics service account (bumpsync-analytics@bumpsync-486821.iam.gserviceaccount.com),
 * key at /var/lib/agb-labs/analytics-sa.json. It needs Editor on the GA4 property (Viewer is enough once
 * setup has run) and Full user on the Search Console property sc-domain:agb-labs.com.
 *
 * Env (optional): AGB_GOOGLE_CREDENTIALS, AGB_GA4_PROPERTY_ID (numeric, found by setup if unset),
 * AGB_SEARCH_CONSOLE_SITE (default sc-domain:agb-labs.com).
 */

import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { GoogleAuth } from "google-auth-library";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "var", "analytics");
const MEASUREMENT_ID = "G-9VFMGRZ2NS";
const SITEMAP = "https://agb-labs.com/sitemap-index.xml";

const KEY_FILE = process.env.AGB_GOOGLE_CREDENTIALS || "/var/lib/agb-labs/analytics-sa.json";
const SITE = process.env.AGB_SEARCH_CONSOLE_SITE || "sc-domain:agb-labs.com";

const GA4_READ = "https://www.googleapis.com/auth/analytics.readonly";
const GA4_EDIT = "https://www.googleapis.com/auth/analytics.edit";
const GSC_READ = "https://www.googleapis.com/auth/webmasters.readonly";
const GSC_WRITE = "https://www.googleapis.com/auth/webmasters";

// Sent by public/consent.js. Custom dimensions make event params reportable; key events count as conversions.
const CUSTOM_DIMENSIONS = [["demo", "Demo"], ["location", "Page of contact click"]];
const KEY_EVENTS = ["contact_click"];

async function token(scopes) {
  const auth = new GoogleAuth({ keyFile: KEY_FILE, scopes: [].concat(scopes) });
  const { token: t } = await (await auth.getClient()).getAccessToken();
  if (!t) throw new Error("No Google access token from the service account");
  return t;
}

async function google(url, { token: t, method = "GET", body } = {}) {
  const res = await fetch(url, {
    method,
    headers: { authorization: `Bearer ${t}`, "content-type": "application/json", accept: "application/json" },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const text = await res.text();
  if (!res.ok) {
    let detail = text;
    try {
      detail = JSON.parse(text)?.error?.message ?? text;
    } catch {}
    const hint = [401, 403].includes(res.status) ? "\n→ Check the service account has access (Editor/Viewer in GA4, Full user in Search Console)." : "";
    throw new Error(`Google API ${res.status}: ${String(detail).slice(0, 300)}${hint}`);
  }
  return text ? JSON.parse(text) : {};
}

const day = (offset = 0) => new Date(Date.now() + offset * 86_400_000).toISOString().slice(0, 10);

function save(name, data) {
  mkdirSync(OUT, { recursive: true });
  const json = `${JSON.stringify(data, null, 2)}\n`;
  writeFileSync(path.join(OUT, `${name}-${day()}.json`), json);
  writeFileSync(path.join(OUT, `${name}-latest.json`), json);
  return path.join(OUT, `${name}-latest.json`);
}

/** The numeric GA4 property whose web stream has our measurement id. */
async function findProperty(t) {
  if (process.env.AGB_GA4_PROPERTY_ID) return process.env.AGB_GA4_PROPERTY_ID;
  const { accountSummaries = [] } = await google("https://analyticsadmin.googleapis.com/v1beta/accountSummaries?pageSize=200", { token: t });
  for (const p of accountSummaries.flatMap((a) => a.propertySummaries ?? [])) {
    const { dataStreams = [] } = await google(`https://analyticsadmin.googleapis.com/v1beta/${p.property}/dataStreams`, { token: t });
    if (dataStreams.some((s) => s.webStreamData?.measurementId === MEASUREMENT_ID)) return p.property.split("/")[1];
  }
  throw new Error(`No GA4 property visible to the service account has stream ${MEASUREMENT_ID}. Add it as a user on the property.`);
}

async function setup() {
  const t = await token([GA4_EDIT]);
  const property = await findProperty(t);
  const base = `https://analyticsadmin.googleapis.com/v1beta/properties/${property}`;
  console.log(`GA4 property ${property} (stream ${MEASUREMENT_ID})`);

  const dims = new Set(((await google(`${base}/customDimensions?pageSize=200`, { token: t })).customDimensions ?? []).map((d) => d.parameterName));
  for (const [parameterName, displayName] of CUSTOM_DIMENSIONS) {
    if (dims.has(parameterName)) console.log(`  = dimension ${parameterName}`);
    else {
      await google(`${base}/customDimensions`, { token: t, method: "POST", body: { parameterName, displayName, scope: "EVENT" } });
      console.log(`  + dimension ${parameterName}`);
    }
  }
  const keys = new Set(((await google(`${base}/keyEvents?pageSize=200`, { token: t })).keyEvents ?? []).map((e) => e.eventName));
  for (const eventName of KEY_EVENTS) {
    if (keys.has(eventName)) console.log(`  = key event ${eventName}`);
    else {
      await google(`${base}/keyEvents`, { token: t, method: "POST", body: { eventName, countingMethod: "ONCE_PER_EVENT" } });
      console.log(`  + key event ${eventName}`);
    }
  }

  const g = await token([GSC_WRITE]);
  const { siteEntry = [] } = await google("https://www.googleapis.com/webmasters/v3/sites", { token: g });
  const entry = siteEntry.find((s) => s.siteUrl === SITE);
  if (!entry) throw new Error(`Search Console: ${SITE} isn't visible to the service account. Add it as a Full user.`);
  console.log(`Search Console ${SITE}: ${entry.permissionLevel}`);
  const sm = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(SITE)}/sitemaps/${encodeURIComponent(SITEMAP)}`;
  await google(sm, { token: g, method: "PUT" });
  const status = await google(sm, { token: g });
  console.log(`  sitemap ${SITEMAP} submitted (${status.isPending ? "pending" : `last downloaded ${status.lastDownloaded ?? "never"}`})`);
  console.log(`\nSet AGB_GA4_PROPERTY_ID=${property} to skip the lookup next time.`);
}

async function runReport(t, property, { startDate, dimensions = [], metrics, limit = 100, dimensionFilter }) {
  const data = await google(`https://analyticsdata.googleapis.com/v1beta/properties/${property}:runReport`, {
    token: t,
    method: "POST",
    body: { dateRanges: [{ startDate, endDate: "today" }], dimensions: dimensions.map((name) => ({ name })), metrics: metrics.map((name) => ({ name })), limit, ...(dimensionFilter ? { dimensionFilter } : {}) },
  });
  const dn = (data.dimensionHeaders ?? []).map((h) => h.name);
  const mn = (data.metricHeaders ?? []).map((h) => h.name);
  return (data.rows ?? []).map((r) => ({
    ...Object.fromEntries(dn.map((n, i) => [n, r.dimensionValues[i]?.value])),
    ...Object.fromEntries(mn.map((n, i) => [n, Number(r.metricValues[i]?.value)])),
  }));
}

async function pullGa4(days) {
  const t = await token(GA4_READ);
  const property = await findProperty(t);
  const q = (o) => runReport(t, property, { startDate: day(-(days - 1)), ...o });
  const event = (value) => ({ filter: { fieldName: "eventName", stringFilter: { matchType: "EXACT", value } } });
  const [totals, pages, channels, sources, countries, devices, demos, contacts] = await Promise.all([
    q({ metrics: ["activeUsers", "sessions", "screenPageViews", "engagementRate", "averageSessionDuration"] }),
    q({ dimensions: ["pagePath"], metrics: ["screenPageViews", "activeUsers"] }),
    q({ dimensions: ["sessionDefaultChannelGroup"], metrics: ["sessions", "activeUsers"] }),
    q({ dimensions: ["sessionSource", "sessionMedium"], metrics: ["sessions"] }),
    q({ dimensions: ["country"], metrics: ["activeUsers"] }),
    q({ dimensions: ["deviceCategory"], metrics: ["activeUsers"] }),
    q({ dimensions: ["customEvent:demo"], metrics: ["eventCount"], dimensionFilter: event("demo_start") }).catch(() => []),
    q({ metrics: ["eventCount"], dimensionFilter: event("contact_click") }),
  ]);
  return save("ga4", {
    source: "ga4", property, range: { startDate: day(-(days - 1)), endDate: day(), days }, pulledAt: new Date().toISOString(),
    totals: totals[0] ?? {}, contactClicks: contacts[0]?.eventCount ?? 0, demos, pages, channels, sources, countries, devices,
  });
}

async function pullGsc(days) {
  const t = await token(GSC_READ);
  const startDate = day(-(days + 2));
  const endDate = day(-2);
  const q = async (dimensions, rowLimit = 250) =>
    ((await google(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(SITE)}/searchAnalytics/query`, { token: t, method: "POST", body: { startDate, endDate, dimensions, rowLimit } })).rows ?? [])
      .map((r) => ({ keys: r.keys, clicks: r.clicks, impressions: r.impressions, ctr: r.ctr, position: r.position }));
  const [totals, queries, pages, devices, countries] = await Promise.all([q([], 1), q(["query"]), q(["page"]), q(["device"]), q(["country"], 50)]);
  const { keys: _k, ...total } = totals[0] ?? { clicks: 0, impressions: 0, ctr: 0, position: 0 };
  return save("search-console", { source: "search-console", site: SITE, range: { startDate, endDate }, pulledAt: new Date().toISOString(), totals: total, queries, pages, devices, countries });
}

const [cmd = "pull", ...args] = process.argv.slice(2);
const days = Number(args.find((a) => a.startsWith("--days="))?.split("=")[1] ?? 28);
const run = {
  setup,
  ga4: async () => console.log(`→ ${await pullGa4(days)}`),
  gsc: async () => console.log(`→ ${await pullGsc(days)}`),
  pull: async () => { console.log(`→ ${await pullGa4(days)}`); console.log(`→ ${await pullGsc(days)}`); },
}[cmd];
if (!run) {
  console.error("Usage: node scripts/analytics.mjs setup|ga4|gsc|pull [--days=N]");
  process.exit(1);
}
run().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
