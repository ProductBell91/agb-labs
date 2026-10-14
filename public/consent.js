/**
 * Analytics only with consent. Google Analytics (GA4) is not loaded, and sets no cookies, until the
 * visitor taps Accept; the choice is remembered in localStorage ("agb:cookie-consent") and can be changed
 * from "Cookie settings" in the footer. See /cookies/.
 *
 * Events (only after Accept): page views, scrolls and outbound clicks come from GA's enhanced measurement;
 * this file adds demo_start (first tap on each product demo, param demo) and contact_click (any mailto link).
 */
(() => {
  const GA_ID = "G-9VFMGRZ2NS";
  const KEY = "agb:cookie-consent";
  const read = () => { try { return localStorage.getItem(KEY); } catch { return null; } };
  const write = (v) => { try { localStorage.setItem(KEY, v); } catch {} };

  let loaded = false;
  function loadAnalytics() {
    if (loaded) return;
    loaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag("js", new Date());
    window.gtag("config", GA_ID);
    const s = document.createElement("script");
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
    document.head.appendChild(s);
  }

  /** Remove GA's cookies after someone changes their mind. */
  function clearAnalytics() {
    const host = location.hostname.replace(/^www\./, "");
    for (const c of document.cookie.split(";")) {
      const name = c.split("=")[0].trim();
      if (!/^_ga/.test(name)) continue;
      for (const domain of ["", `; domain=${host}`, `; domain=.${host}`]) {
        document.cookie = `${name}=; Max-Age=0; path=/${domain}`;
      }
    }
  }

  const css = `.cookie{position:fixed;left:16px;right:16px;bottom:16px;z-index:50;max-width:440px;margin-left:auto;background:var(--surface);color:var(--ink);
border:1px solid var(--rule);border-radius:18px;padding:16px;box-shadow:var(--shadow);font:15px/1.5 var(--body)}
.cookie p{margin:0;color:var(--muted)}.cookie a{color:var(--link)}
.cookie .row{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:12px}
.cookie button{font:inherit;font-weight:600;border-radius:999px;min-height:44px;padding:0 14px;cursor:pointer;border:0}
.cookie .no{background:transparent;color:var(--ink);box-shadow:inset 0 0 0 1px var(--rule)}.cookie .yes{background:var(--ink);color:var(--bg)}`;

  function banner() {
    if (document.querySelector(".cookie")) return;
    if (!document.getElementById("cookie-css")) {
      const st = document.createElement("style");
      st.id = "cookie-css";
      st.textContent = css;
      document.head.appendChild(st);
    }
    const el = document.createElement("div");
    el.className = "cookie";
    el.setAttribute("role", "region");
    el.setAttribute("aria-label", "Cookie choice");
    el.innerHTML = `<p>Can I use analytics cookies to see how people find this site? Nothing else, and never for ads. <a href="/cookies/">Cookie policy</a></p>
<div class="row"><button type="button" class="no">Necessary only</button><button type="button" class="yes">Accept</button></div>`;
    el.querySelector(".yes").onclick = () => { write("accepted"); el.remove(); loadAnalytics(); };
    el.querySelector(".no").onclick = () => { write("declined"); el.remove(); clearAnalytics(); };
    document.body.appendChild(el);
  }

  /** A GA event, only if the visitor said yes. */
  const track = (name, params) => { if (loaded) window.gtag("event", name, params || {}); };
  window.agbTrack = track;

  const started = new Set();
  function onInteract(e) {
    const stage = e.target.closest && e.target.closest(".stage[id]");
    if (stage && !started.has(stage.id)) { started.add(stage.id); track("demo_start", { demo: stage.id }); }
  }

  const start = () => {
    const choice = read();
    if (choice === "accepted") loadAnalytics();
    else if (choice !== "declined") banner();
    for (const a of document.querySelectorAll("[data-cookie-settings]")) a.addEventListener("click", (e) => { e.preventDefault(); banner(); });
    document.addEventListener("pointerdown", onInteract, { passive: true });
    document.addEventListener("keydown", onInteract);
    document.addEventListener("click", (e) => {
      const a = e.target.closest && e.target.closest('a[href^="mailto:"]');
      if (a) track("contact_click", { location: location.pathname });
    });
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
