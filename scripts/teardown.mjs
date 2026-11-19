#!/usr/bin/env node
/**
 * teardown.mjs — evidence-first teardown of a reference website.
 *
 * Loads the page in headless Chromium, scrolls it, and records what it is made of:
 * libraries (GSAP, ScrollTrigger, Lenis, three.js, R3F, Spline, Unicorn, Framer Motion…),
 * fonts actually rendered, the colour palette actually used, type scale, media
 * (videos, frame sequences, GLB/HDR), shader uniforms + comments, scroll length, pinned
 * sections, and screenshots along the scroll.
 *
 * Output: <outDir>/teardown.md (human summary) + teardown.json + shots/*.png
 *
 * Usage: node teardown.mjs <url> [outDir=./reference/teardown-<host>]
 * Needs: npm i -D playwright && npx playwright install chromium
 *
 * Method adapted from REA (github.com/morluto/rea, MIT): separate OBSERVED facts from
 * INFERENCES; note what you could not see. Use the result to learn techniques —
 * then design an original site. Never copy a reference's code, copy or assets.
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { loadPlaywright } from "./lib/load-playwright.mjs";
const { chromium } = await loadPlaywright();


const url = process.argv[2];
if (!url) { console.error("usage: node teardown.mjs <url> [outDir]"); process.exit(2); }
const host = new URL(url).hostname.replace(/^www\./, "");
const outDir = process.argv[3] || `./reference/teardown-${host}`;
await mkdir(path.join(outDir, "shots"), { recursive: true });

const SIGS = {
  "GSAP": /gsap\.(to|from|timeline)|_gsScope|GreenSockGlobals|gsap-core/,
  "ScrollTrigger": /ScrollTrigger/,
  "SplitText": /SplitText/,
  "ScrollSmoother": /ScrollSmoother/,
  "Lenis": /\blenis\b|Lenis\(/i,
  "Locomotive Scroll": /locomotive-scroll|LocomotiveScroll/,
  "three.js": /WebGLRenderer|THREE\.|three\.module|PerspectiveCamera/,
  "WebGPU": /WebGPURenderer|navigator\.gpu/,
  "React Three Fiber": /@react-three\/fiber|useFrame\(|__r3f/,
  "drei": /@react-three\/drei|MeshTransmissionMaterial|useGLTF/,
  "OGL": /\bogl\b|new Renderer\(\{[^}]*dpr/,
  "raw WebGL2": /getContext\(["']webgl2["']\)/,
  "custom shaders": /gl_FragColor|fragColor|precision (highp|mediump) float/,
  "Spline": /splinetool|spline\.design|prod\.spline/,
  "Unicorn Studio": /unicornstudio|UnicornStudio/,
  "Framer Motion / Motion": /framer-motion|motion\/react|useScroll\(/,
  "Barba / page transitions": /barba|@barba|swup/,
  "Swiper": /swiper/i,
  "Rive": /@rive-app|rive\.wasm/,
  "Lottie": /lottie|bodymovin/,
  "Draco / Meshopt": /draco|meshopt/i,
  "Webflow": /webflow\.js|data-wf-page/,
  "Framer (site builder)": /framerusercontent|__framer/,
  "Next.js": /__NEXT_DATA__|_next\/static/,
  "Nuxt": /__NUXT__|_nuxt\//,
  "Astro": /astro-island|_astro\//,
  "prefers-reduced-motion handled": /prefers-reduced-motion/,
};

const browser = await chromium.launch({ args: ["--use-gl=angle", "--enable-webgl", "--ignore-gpu-blocklist"] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
const scripts = new Map();
const media = new Set();
page.on("response", async (r) => {
  const u = r.url(); const ct = r.headers()["content-type"] || "";
  if (/\.(mp4|webm|mov|m3u8|glb|gltf|hdr|exr|ktx2|splinecode|riv|json)(\?|$)/i.test(u) || /video\//.test(ct)) media.add(u.slice(0, 200));
  if (/javascript/.test(ct) || /\.m?js(\?|$)/.test(u)) { try { const t = await r.text(); if (t.length < 8_000_000) scripts.set(u, t); } catch {} }
});

await page.goto(url, { waitUntil: "networkidle", timeout: 90000 }).catch((e) => console.error("goto:", e.message));
await page.waitForTimeout(2000);
const docH = await page.evaluate(() => document.documentElement.scrollHeight);
const steps = 8;
for (let i = 0; i <= steps; i++) {
  const y = Math.round(((docH - 900) * i) / steps);
  await page.mouse.wheel(0, 900);
  await page.evaluate((yy) => window.scrollTo(0, yy), y);
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(outDir, "shots", `${String(i).padStart(2, "0")}.png`) });
}
await page.evaluate(() => window.scrollTo(0, 0));

const dom = await page.evaluate(() => {
  const els = [...document.querySelectorAll("body *")].slice(0, 4000);
  const fonts = {}, colors = {}, bgs = {}, sizes = {};
  for (const el of els) {
    const cs = getComputedStyle(el);
    if (!el.childElementCount && el.textContent.trim()) {
      const fam = cs.fontFamily.split(",")[0].replace(/["']/g, "").trim();
      fonts[fam] = (fonts[fam] || 0) + 1;
      colors[cs.color] = (colors[cs.color] || 0) + 1;
      const px = Math.round(parseFloat(cs.fontSize)); sizes[px] = (sizes[px] || 0) + 1;
    }
    if (cs.backgroundColor && cs.backgroundColor !== "rgba(0, 0, 0, 0)") bgs[cs.backgroundColor] = (bgs[cs.backgroundColor] || 0) + 1;
  }
  const top = (o, n) => Object.entries(o).sort((a, b) => b[1] - a[1]).slice(0, n);
  const h = [...document.querySelectorAll("h1,h2,h3")].slice(0, 12).map((e) => ({ tag: e.tagName, text: e.textContent.trim().slice(0, 90), size: getComputedStyle(e).fontSize, family: getComputedStyle(e).fontFamily.split(",")[0] }));
  const pinned = [...document.querySelectorAll(".pin-spacer, [data-scroll-sticky], [style*='position: sticky']")].length;
  return {
    title: document.title,
    description: document.querySelector("meta[name=description]")?.content || null,
    fonts: top(fonts, 6), textColors: top(colors, 6), backgrounds: top(bgs, 6), fontSizes: top(sizes, 10),
    headings: h, canvases: document.querySelectorAll("canvas").length, videos: [...document.querySelectorAll("video")].map((v) => v.currentSrc || v.querySelector("source")?.src).filter(Boolean),
    pinnedSections: pinned, scrollHeightViewports: +(document.documentElement.scrollHeight / innerHeight).toFixed(1),
    sections: [...document.querySelectorAll("main > section, body > section, main > div > section")].length,
  };
});

const all = [...scripts.values()].join("\n");
const libs = Object.entries(SIGS).filter(([, re]) => re.test(all) || re.test(JSON.stringify(dom))).map(([k]) => k);
const uniforms = [...new Set([...all.matchAll(/uniform\s+\w+\s+(u[A-Z]\w*)/g)].map((m) => m[1]))].slice(0, 40);
const shaderComments = [...new Set([...all.matchAll(/\/\/\s?([^\n"'`]{12,90})\n[^\n]*(?:gl_|vec[234]|float |uniform )/g)].map((m) => m[1].trim()))].slice(0, 25);
const scrub = [...all.matchAll(/scrub\s*:\s*([\d.]+|true)/g)].map((m) => m[1]);
await browser.close();

const result = { url, observed: { ...dom, libraries: libs, media: [...media].slice(0, 30), shaderUniforms: uniforms, shaderComments, scrubValues: [...new Set(scrub)], scriptsCaptured: scripts.size } };
await writeFile(path.join(outDir, "teardown.json"), JSON.stringify(result, null, 2));

const md = `# Teardown: ${url}
_Generated by webbuild/scripts/teardown.mjs. OBSERVED = measured from the live page. Everything else you write below is INFERENCE — label it._

## Observed
- Title: ${dom.title}
- Stack signals: ${libs.join(", ") || "none detected (may be bundled/obfuscated — inspect screenshots)"}
- Canvases: ${dom.canvases} · Videos: ${dom.videos.length} · Pinned/sticky: ${dom.pinnedSections} · Page length: ${dom.scrollHeightViewports} viewports · Sections: ${dom.sections}
- Fonts rendered: ${dom.fonts.map(([f, n]) => `${f} (${n})`).join(", ")}
- Text colours: ${dom.textColors.map(([c]) => c).join(", ")}
- Backgrounds: ${dom.backgrounds.map(([c]) => c).join(", ")}
- Font sizes (px, by frequency): ${dom.fontSizes.map(([s]) => s).join(", ")}
- Scrub values: ${result.observed.scrubValues.join(", ") || "—"}
- Shader uniforms: ${uniforms.join(", ") || "—"}
- Shader comments: ${shaderComments.map((c) => `"${c}"`).join("; ") || "—"}
- Media: ${[...media].slice(0, 12).join("\n  ") || "—"}

## Headings
${dom.headings.map((h) => `- ${h.tag} ${h.size} ${h.family}: ${h.text}`).join("\n")}

## Screenshots
shots/00.png … shots/0${steps}.png — READ THEM. Describe the motion beat by beat (what moves, triggered by what, over how much scroll).

## Inference (fill in)
- Signature moment:
- How it's probably built (cite the evidence above):
- What to LEARN (technique), not copy (brand, copy, assets):
- Unknowns:
`;
await writeFile(path.join(outDir, "teardown.md"), md);
console.log(md);
