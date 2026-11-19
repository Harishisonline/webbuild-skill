#!/usr/bin/env node
/**
 * shoot.mjs — look at the site the way a client will.
 *
 * Takes screenshots at phone / laptop / desktop widths, scrolls the page in
 * steps so scroll-triggered 3D and animations actually fire, and reports
 * console errors, failed requests, horizontal overflow and rough load timings.
 *
 * Usage:
 *   node shoot.mjs <url> [outDir=./shots] [--steps 6] [--reduced-motion]
 *
 * Needs Playwright once per machine:
 *   npm i -D playwright && npx playwright install chromium
 * (or run from any folder that already has playwright installed)
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { loadPlaywright } from "./lib/load-playwright.mjs";
const { chromium } = await loadPlaywright();


const args = process.argv.slice(2);
const url = args.find((a) => /^https?:|^file:/.test(a));
if (!url) {
  console.error("usage: node shoot.mjs <url> [outDir] [--steps N] [--reduced-motion]");
  process.exit(2);
}
const outDir = args.find((a, i) => i > 0 && !a.startsWith("--") && a !== url && !/^\d+$/.test(a)) || "./shots";
const stepsIdx = args.indexOf("--steps");
const steps = stepsIdx > -1 ? Number(args[stepsIdx + 1]) : 6;
const reduced = args.includes("--reduced-motion");

const viewports = [
  { name: "phone", width: 390, height: 844, isMobile: true, deviceScaleFactor: 2 },
  { name: "laptop", width: 1366, height: 768, deviceScaleFactor: 1 },
  { name: "desktop", width: 1920, height: 1080, deviceScaleFactor: 1 },
];

await mkdir(outDir, { recursive: true });
const browser = await chromium.launch({ args: ["--use-gl=angle", "--enable-webgl", "--ignore-gpu-blocklist"] });
const report = { url, reducedMotion: reduced, viewports: [] };

for (const vp of viewports) {
  const ctx = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: vp.deviceScaleFactor,
    isMobile: !!vp.isMobile,
    hasTouch: !!vp.isMobile,
    reducedMotion: reduced ? "reduce" : "no-preference",
  });
  const page = await ctx.newPage();
  const errors = [];
  const failed = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text().slice(0, 300)));
  page.on("pageerror", (e) => errors.push(String(e).slice(0, 300)));
  page.on("requestfailed", (r) => failed.push(`${r.failure()?.errorText} ${r.url().slice(0, 160)}`));

  const t0 = Date.now();
  await page.goto(url, { waitUntil: "load", timeout: 60000 }).catch((e) => errors.push("goto: " + e.message));
  const loadMs = Date.now() - t0;
  await page.waitForTimeout(1500);

  const lcpMs = await page.evaluate(() => new Promise((res) => {
    let last = null;
    new PerformanceObserver((l) => { const e = l.getEntries().at(-1); if (e) last = { t: Math.round(e.startTime), el: e.element ? e.element.tagName.toLowerCase() + (e.element.className ? "." + String(e.element.className).split(" ")[0] : "") : null }; })
      .observe({ type: "largest-contentful-paint", buffered: true });
    setTimeout(() => res(last), 300);
  }));
  const perf = await page.evaluate(() => {
    const nav = performance.getEntriesByType("navigation")[0];
    const lcp = null;
    const bytes = performance.getEntriesByType("resource").reduce((s, r) => s + (r.transferSize || 0), 0);
    return {
      domContentLoaded: nav ? Math.round(nav.domContentLoadedEventEnd) : null,
      
      transferKB: Math.round(bytes / 1024),
      docHeight: document.documentElement.scrollHeight,
      overflowX: document.documentElement.scrollWidth > window.innerWidth + 1,
      canvases: document.querySelectorAll("canvas").length,
    };
  });

  const shots = [];
  const total = Math.max(perf.docHeight - vp.height, 0);
  for (let i = 0; i <= steps; i++) {
    const y = Math.round((total * i) / steps);
    await page.mouse.wheel(0, y - (await page.evaluate(() => window.scrollY)));
    await page.evaluate((yy) => window.scrollTo(0, yy), y);
    await page.waitForTimeout(700); // let smooth-scroll + ScrollTrigger settle
    const file = path.join(outDir, `${vp.name}-${String(i).padStart(2, "0")}.png`);
    await page.screenshot({ path: file });
    shots.push(file);
  }
  report.viewports.push({ ...vp, loadMs, lcp: lcpMs?.t ?? null, lcpElement: lcpMs?.el ?? null, ...perf, consoleErrors: errors, failedRequests: failed, shots });
  await ctx.close();
}
await browser.close();

await writeFile(path.join(outDir, "report.json"), JSON.stringify(report, null, 2));
for (const v of report.viewports) {
  const flags = [
    v.overflowX && "HORIZONTAL OVERFLOW",
    v.consoleErrors.length && `${v.consoleErrors.length} console errors`,
    v.failedRequests.length && `${v.failedRequests.length} failed requests`,
    v.lcp && v.lcp > 2500 && `LCP ${v.lcp}ms > 2.5s`,
    v.lcpElement === "canvas" && "LCP element is the canvas — show a poster/text first",
    v.transferKB > 3000 && `${v.transferKB}KB transferred (heavy)`,
  ].filter(Boolean);
  console.log(`${v.name.padEnd(8)} lcp=${v.lcp ?? "?"}ms  ${v.transferKB}KB  canvases=${v.canvases}  lcpEl=${v.lcpElement ?? "?"}  ${flags.join(" | ") || "ok"}`);
  v.consoleErrors.slice(0, 3).forEach((e) => console.log("   err:", e));
}
console.log(`\nScreenshots + report.json in ${outDir} — now LOOK at them (Read the PNGs).`);
