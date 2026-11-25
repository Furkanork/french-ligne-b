#!/usr/bin/env node
/* Ligne B test suite.
   Run from the repo root:  node tests/run.js
   Needs Playwright with Chromium (npm i -D playwright && npx playwright install chromium).
   Starts its own local server, so the service worker and offline mode are tested too. */
"use strict";
const http = require("http");
const fs = require("fs");
const path = require("path");
const { chromium, devices } = require("playwright");

const ROOT = path.resolve(__dirname, "..");
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".png": "image/png", ".md": "text/plain" };
let failures = 0;
const ok = (cond, msg, detail) => {
  console.log(`${cond ? "PASS" : "FAIL"}  ${msg}${!cond && detail ? `\n      ${detail}` : ""}`);
  if (!cond) failures++;
};

function serve() {
  return new Promise(res => {
    const srv = http.createServer((req, rsp) => {
      let p = decodeURIComponent(req.url.split("?")[0]);
      if (p.endsWith("/")) p += "index.html";
      const f = path.join(ROOT, p);
      if (!f.startsWith(ROOT) || !fs.existsSync(f)) { rsp.writeHead(404); return rsp.end(); }
      rsp.writeHead(200, { "Content-Type": TYPES[path.extname(f)] || "application/octet-stream" });
      fs.createReadStream(f).pipe(rsp);
    }).listen(0, () => res(srv));
  });
}

(async () => {
  const srv = await serve();
  const URL = `http://localhost:${srv.address().port}/`;
  const browser = await chromium.launch();

  async function page(opts = {}) {
    const ctx = await browser.newContext({ reducedMotion: "reduce", ...opts });
    const p = await ctx.newPage();
    p.errs = [];
    p.on("pageerror", e => p.errs.push(e.message));
    p.on("dialog", d => d.accept());
    await p.goto(URL);
    await p.waitForTimeout(600);
    return { ctx, p };
  }

  /* ---------- 1. content integrity ---------- */
  {
    const { ctx, p } = await page();
    const r = await p.evaluate(() => {
      const probs = [];
      for (const [k, items] of Object.entries(BANKS)) items.forEach((q, i) => {
        if (!q.q || (q.type !== "typed" && (!Array.isArray(q.o) || q.o.length < 2))) probs.push(`${k}#${i + 1}: needs q and at least 2 options`);
        if (q.o && new Set(q.o).size !== q.o.length) probs.push(`${k}#${i + 1}: duplicate options`);
        if (q.type === "typed" && !(q.a && q.a.length)) probs.push(`${k}#${i + 1}: typed item without answers`);
      });
      for (const [k, arr] of Object.entries(DRILL_EN)) if (BANKS[k] && arr.length > BANKS[k].length) probs.push(`DRILL_EN.${k} has more lines than the drill`);
      const ids = STATIONS.map(s => s.id);
      ids.forEach(id => { if (!document.getElementById(id)) probs.push(`station ${id} has no section`); });
      document.querySelectorAll("[data-drill]").forEach(el => { const k = el.dataset.drill; if (!["exam", "examc"].includes(k) && !BANKS[k]) probs.push(`drill ${k} has no questions`); });
      const missingEN = [...document.querySelectorAll("main button.fr[data-say]")].filter(b => !b.closest("#conjOut,#fqList,#vocabGrid,.idiom,[data-drill]") && !EN[b.textContent.trim()]).map(b => b.textContent.trim());
      return { probs, missingEN: [...new Set(missingEN)] };
    });
    ok(!r.probs.length, "Content: every drill, station and translation table is consistent", r.probs.slice(0, 8).join("\n      "));
    ok(!r.missingEN.length, "Content: every example sentence has an English translation", r.missingEN.slice(0, 8).join(" | "));
    const marking = await p.evaluate(() => {
      const t = LigneB.checkTyped, it = { type: "typed", a: ["Il me les a données."] };
      const d = LigneB.compareWords("Quand j'étais petit, je jouais au foot.", "quand j'etais petit je jouais foot");
      return [t(it, "il me les a données") === "right", t(it, "Il me les a donnees.") === "accent", t(it, "Il me les a donné.") === "wrong",
              d.right === 6 && d.res.filter(x => x.s === "acc").length === 1 && d.res.filter(x => x.s === "miss").length === 1];
    });
    ok(marking.every(Boolean), "Typed-answer and dictation marking (accents, agreement, missed words)", JSON.stringify(marking));
    ok(!p.errs.length, "No script errors on load (desktop)", p.errs.join("; "));
    await ctx.close();
  }

  /* ---------- 1b. every file the page loads is in the offline cache list ---------- */
  {
    const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8"), sw = fs.readFileSync(path.join(ROOT, "sw.js"), "utf8");
    const files = [...html.matchAll(/<(?:script|link)[^>]+(?:src|href)="((?:js|css)\/[^"]+)"/g)].map(m => m[1]);
    const missing = files.filter(f => !sw.includes(`"./${f}"`));
    ok(!missing.length, `Offline cache lists all ${files.length} scripts and stylesheets`, missing.join(", "));
  }

  /* ---------- 2. phone layouts ---------- */
  for (const dev of ["iPhone 13", "Pixel 7"]) {
    const { ctx, p } = await page({ ...devices[dev] });
    const r = await p.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]);
    ok(r[0] <= r[1], `${dev}: nothing overflows sideways`, `page ${r[0]}px wide on a ${r[1]}px screen`);
    ok(!p.errs.length, `${dev}: no script errors`, p.errs.join("; "));
    await ctx.close();
  }

  /* ---------- 3. every drill runs, filled answers read cleanly ---------- */
  {
    const { ctx, p } = await page({ ...devices["iPhone 13"] });
    const r = await p.evaluate(() => {
      const out = [];
      for (const el of document.querySelectorAll("[data-drill]")) {
        let n = 0;
        for (let k = 0; k < 60; k++) {
          const inp = el.querySelector(".typed-in");
          if (inp) { inp.value = "x"; el.querySelector('[data-act="check"]').click(); }
          else { const o = el.querySelector(".opt:not(:disabled)"); if (!o) break; o.click(); }
          n++;
          const fr = el.querySelector(".feedback .fr");
          if (fr && /___|\(nothing\)| [.,]/.test(fr.textContent)) out.push(`${el.dataset.drill}: "${fr.textContent}"`);
          const nx = el.querySelector('[data-act="next"]'); if (nx) nx.click(); else break;
        }
        if (!n) out.push(`${el.dataset.drill}: no questions shown`);
      }
      return out;
    });
    ok(!r.length, "Every drill runs to the end with clean answer sentences", r.slice(0, 8).join("\n      "));
    ok(!p.errs.length, "No script errors while drilling", p.errs.join("; "));
    await ctx.close();
  }

  /* ---------- 4. numbering, links, exams ---------- */
  {
    const { ctx, p } = await page();
    const r = await p.evaluate(() => {
      const bad = [];
      STATIONS.forEach((s, i) => {
        const sec = document.getElementById(s.id);
        if (sec.querySelector(".roundel").textContent != i + 1) bad.push(`${s.id} numbered ${sec.querySelector(".roundel").textContent}`);
        const a = sec.querySelector(".station-foot .next a"), n = STATIONS[i + 1];
        if (n && s.id !== "terminus" && (!a || a.getAttribute("href") !== "#" + n.id)) bad.push(`${s.id} Next link wrong`);
      });
      const tags = sel => { const el = document.querySelector(`[data-drill="${sel}"]`); const t = new Set();
        for (let i = 0; i < 15; i++) { t.add(el.querySelector(".drill-top").textContent.split("·")[1].replace(/\d+ correct/, "").trim());
          const inp = el.querySelector(".typed-in"); if (inp) { inp.value = "x"; el.querySelector('[data-act="check"]').click(); } else el.querySelector(".opt").click();
          el.querySelector('[data-act="next"]').click(); } return [...t]; };
      const cNames = new Set(STATIONS.filter(s => s.lv[0] === "C").map(s => s.name));
      const b = tags("exam"), c = tags("examc");
      if (b.some(n => cNames.has(n))) bad.push("Terminus B contains C questions: " + b.join(", "));
      if (c.some(n => !cNames.has(n))) bad.push("Terminus C contains B questions: " + c.join(", "));
      return bad;
    });
    ok(!r.length, "Station numbers, Next links and exam pools are correct", r.join("\n      "));
    await ctx.close();
  }

  /* ---------- 5. phone navigation ---------- */
  {
    const { ctx, p } = await page({ ...devices["iPhone 13"] });
    await p.click("#navHere"); await p.click('#sheetList a[href="#subjonctif"]'); await p.waitForTimeout(500);
    const label = await p.textContent("#navHereTxt");
    await p.click('.bottombar [data-go="mistakes"]'); await p.waitForTimeout(400);
    const tab = await p.evaluate(() => document.querySelector('.tab[aria-selected="true"]').dataset.tab);
    await p.click('.bottombar [data-go="top"]'); await p.waitForTimeout(300);
    const y = await p.evaluate(() => scrollY);
    ok(/Subjonctif/.test(label) && tab === "err" && y === 0, "Station list, Mistakes and Top buttons work", `label "${label}", tab ${tab}, scrollY ${y}`);
    await ctx.close();
  }

  /* ---------- 5b. every practice tab opens cleanly ---------- */
  {
    const { ctx, p } = await page({ ...devices["iPhone 13"] });
    const tabs = await p.evaluate(() => [...document.querySelectorAll(".hub .tab")].map(t => t.dataset.tab));
    const empty = [];
    for (const t of tabs) { await p.click(`.tab[data-tab="${t}"]`); await p.waitForTimeout(150); if (!(await p.textContent("#hubPanel")).trim()) empty.push(t); }
    await p.click('.tab[data-tab="speak"]'); await p.click('[data-sm="prompt"]'); await p.click('[data-s="go"]'); await p.waitForTimeout(1200);
    await p.click('.tab[data-tab="mix"]'); await p.waitForTimeout(1200);
    ok(!empty.length && !p.errs.length, `All ${tabs.length} practice tabs open, and leaving a running timer is safe`, `empty: ${empty.join(",")} errors: ${p.errs.join("; ")}`);
    await ctx.close();
  }

  /* ---------- 6. backup round trip ---------- */
  {
    const { ctx, p } = await page({ ...devices["iPhone 13"], acceptDownloads: true });
    await p.evaluate(() => document.querySelector('.clear-btn[data-station="pronoms"]').click());
    const snap = () => p.evaluate(() => JSON.stringify(Object.keys(localStorage).filter(k => /^(frB\.|lb-)/.test(k) && k !== "lb-backup").sort().map(k => [k, localStorage.getItem(k)])));
    const before = await snap();
    const [dl] = await Promise.all([p.waitForEvent("download"), p.click("#bkFile")]);
    const file = path.join(require("os").tmpdir(), `lb-test-${Date.now()}.json`); await dl.saveAs(file);
    await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(400);
    await p.setInputFiles("#bkPick", file); await p.waitForLoadState(); await p.waitForTimeout(800);
    ok((await snap()) === before, "Backup file restores progress exactly");
    fs.unlinkSync(file);
    await ctx.close();
  }

  /* ---------- 7. installable + offline ---------- */
  {
    const { ctx, p } = await page({ ...devices["Pixel 7"] });
    await p.evaluate(() => navigator.serviceWorker.ready); await p.reload(); await p.waitForTimeout(500);
    const cdp = await ctx.newCDPSession(p);
    const inst = (await cdp.send("Page.getInstallabilityErrors")).installabilityErrors;
    ok(!inst.length, "Chrome can install it as an app", JSON.stringify(inst));
    await ctx.setOffline(true); await p.reload(); await p.waitForTimeout(800);
    const works = await p.evaluate(() => typeof STATIONS !== "undefined" && document.querySelectorAll("#route li").length === STATIONS.length);
    ok(works, "Works offline (page, styles and all scripts load from cache)");
    await ctx.close();
  }

  await browser.close(); srv.close();
  console.log(failures ? `\n${failures} check(s) failed.` : "\nAll checks passed.");
  process.exit(failures ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
