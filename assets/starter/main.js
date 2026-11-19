// main.js — motion shell: Lenis smooth scroll + GSAP ScrollTrigger + hero modes.
// Everything degrades: reduced-motion users and low-power phones get a still page.
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const small = matchMedia("(max-width: 767px)").matches;
const lowPower = (navigator.hardwareConcurrency || 8) <= 4 || navigator.connection?.saveData;

document.querySelectorAll("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));

// ---------- smooth scroll (skip entirely for reduced motion)
let lenis;
if (!reduce) {
  lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}

// ---------- hero
const hero = document.querySelector(".hero");
const mode = hero?.dataset.hero;
if (hero && !reduce) {
  if (mode === "frames") initFrames(hero);
  // start heavy scenes after first paint so they never delay the headline (LCP)
  const idle = (fn) => addEventListener("load", () => ("requestIdleCallback" in window ? requestIdleCallback(fn, { timeout: 900 }) : setTimeout(fn, 200)), { once: true });
  if (mode === "scene" && !lowPower) idle(() => import("./scene.js").then((m) => m.initScene(hero, { small })));
  if (mode === "video") {
    // treated footage: <video id="heroVideo" … hidden> + canvas#gl; data-look="film|clinic|night|print"
    const video = document.getElementById("heroVideo");
    if (video) import("./grade.js").then((m) => {
      if (m.initGrade(hero.querySelector("#gl"), video, m.LOOKS[hero.dataset.look] || m.LOOKS.film)) hero.classList.add("is-ready");
    });
  }
}

// ---------- reveal: one consistent, restrained entrance (not everything, not bouncy)
if (!reduce) {
  gsap.utils.toArray(".section > *").forEach((el) => {
    gsap.from(el, {
      y: 24, opacity: 0, duration: 0.9, ease: "power3.out",
      scrollTrigger: { trigger: el, start: "top 85%", once: true },
    });
  });
  // the h1 is usually the LCP element: move it, never fade it from 0 (that delays LCP by seconds)
  gsap.from(".hero__copy h1", { y: 24, duration: 1, ease: "power3.out", delay: 0.15 });
  gsap.from(".hero__copy > :not(h1)", { y: 20, opacity: 0, duration: 1, ease: "power3.out", stagger: 0.08, delay: 0.25 });
}

// ---------- scroll-scrubbed image sequence (Apple-style)
async function initFrames(section) {
  const base = section.dataset.frames;
  const manifest = await fetch(`${base}/manifest.json`).then((r) => r.json()).catch(() => null);
  if (!manifest) return; // poster image stays — still a good page
  const set = small ? manifest.mobile : manifest.desktop;
  const canvas = section.querySelector("canvas");
  const ctx = canvas.getContext("2d");
  const frames = new Array(manifest.count);
  const src = (i) => `${base}/${set.replace("%04d", String(i + 1).padStart(4, "0"))}`;
  const load = (i) => {
    if (frames[i]) return frames[i];
    const img = new Image();
    img.decoding = "async";
    img.src = src(i);
    return (frames[i] = img);
  };
  // first frame now, the rest progressively (every 4th first, then fill)
  load(0).onload = () => { section.classList.add("is-ready"); draw(0); };
  const order = [...Array(manifest.count).keys()].sort((a, b) => (a % 4) - (b % 4));
  let k = 0;
  (function pump() { for (let n = 0; n < 8 && k < order.length; n++) load(order[k++]); if (k < order.length) requestIdleCallback?.(pump) ?? setTimeout(pump, 50); })();

  const state = { f: 0 };
  function size() {
    const dpr = Math.min(devicePixelRatio, 2);
    canvas.width = canvas.clientWidth * dpr;
    canvas.height = canvas.clientHeight * dpr;
    draw(Math.round(state.f));
  }
  function draw(i) {
    let img = frames[i];
    for (let j = i; (!img || !img.complete) && j >= 0; j--) img = frames[j]; // nearest loaded
    if (!img?.complete) return;
    const { width: cw, height: ch } = canvas;
    const s = Math.max(cw / img.naturalWidth, ch / img.naturalHeight); // cover
    const w = img.naturalWidth * s, h = img.naturalHeight * s;
    ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
  }
  addEventListener("resize", size);
  size();
  gsap.to(state, {
    f: manifest.count - 1, ease: "none", snap: "f",
    scrollTrigger: { trigger: section, start: "top top", end: "+=250%", scrub: 0.5, pin: true },
    onUpdate: () => draw(Math.round(state.f)),
  });
}
