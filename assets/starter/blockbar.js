// blockbar.js — replaces the browser scrollbar with a 3D "block tower" section navigator.
//
// Drop-in: <script type="module" src="./blockbar.js"></script>
// - Hides the native scrollbar (the page still scrolls normally: wheel, keys, touch, trackpad).
// - Desktop: a vertical stack of small isometric cubes on the right edge, one per section.
//   The current section's cube turns accent-coloured and rotates; a rail fills with page
//   progress; a counter reads "02 / 07 Stories". Click a cube to jump to that section.
// - Phones: a segmented progress bar along the top edge (one segment per section).
// - Sections: elements with [data-bb-label], else `main > section[id]`. Label comes from
//   data-bb-label, aria-label, or the section's first heading.
// - Theme with CSS variables on :root: --bb-accent, --bb-ink, --bb-bone, --bb-line.
// - Uses window.__lenis for smooth jumps when present; respects prefers-reduced-motion.

const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

const CSS = `
html { scrollbar-width: none; }
html::-webkit-scrollbar, body::-webkit-scrollbar { display: none; width: 0; height: 0; }
.bb { --a: var(--bb-accent, #ffb34d); --ink: var(--bb-ink, #0b0b0e); --bone: var(--bb-bone, #f3f0ea); --line: var(--bb-line, rgba(243,240,234,.16));
  position: fixed; right: clamp(.9rem, 1.6vw, 1.6rem); top: 50%; translate: 0 -50%; z-index: 40; display: grid; justify-items: center; gap: 0; pointer-events: none; }
.bb__rail { position: absolute; top: 10px; bottom: 10px; left: 50%; width: 2px; translate: -50% 0; background: var(--line); border-radius: 2px; overflow: hidden; }
.bb__fill { position: absolute; inset: 0; background: var(--a); transform-origin: top; transform: scaleY(var(--p, 0)); box-shadow: 0 0 10px var(--a); }
.bb__btn { position: relative; pointer-events: auto; width: 34px; height: 34px; display: grid; place-items: center; padding: 0; margin: 0; border: 0; background: none; cursor: pointer; perspective: 160px; }
.bb__btn:focus-visible { outline: 2px solid var(--a); outline-offset: 2px; border-radius: 8px; }
.bb__cube { --s: 12px; position: relative; width: var(--s); height: var(--s); transform-style: preserve-3d; transform: rotateX(-30deg) rotateY(45deg) scale(var(--k, 1)); transition: transform .5s cubic-bezier(.2,.8,.2,1); }
.bb__cube i { position: absolute; inset: 0; border: 1px solid var(--line); background: color-mix(in oklab, var(--ink) 92%, var(--bone)); transition: background .35s, border-color .35s, box-shadow .35s; }
.bb__cube i:nth-child(1) { transform: translateZ(calc(var(--s) / 2)); }
.bb__cube i:nth-child(2) { transform: rotateY(90deg) translateZ(calc(var(--s) / 2)); filter: brightness(.7); }
.bb__cube i:nth-child(3) { transform: rotateX(90deg) translateZ(calc(var(--s) / 2)); filter: brightness(1.25); }
.bb__btn.is-past .bb__cube i { background: color-mix(in oklab, var(--bone) 55%, var(--ink)); border-color: transparent; }
.bb__btn.is-on .bb__cube { --k: 1.45; transform: rotateX(-30deg) rotateY(135deg) scale(var(--k)); }
.bb__btn.is-on .bb__cube i { background: var(--a); border-color: transparent; box-shadow: 0 0 14px color-mix(in oklab, var(--a) 70%, transparent); }
.bb__btn:hover .bb__cube { --k: 1.3; }
.bb__tip { position: absolute; right: 100%; top: 50%; translate: -.4rem -50%; white-space: nowrap; display: flex; align-items: baseline; gap: .5rem; padding: .35rem .65rem; border-radius: 8px; font: 600 .78rem/1 var(--bb-font, inherit); letter-spacing: .02em; color: var(--bone); background: color-mix(in oklab, var(--ink) 88%, transparent); box-shadow: inset 0 0 0 1px var(--line); opacity: 0; transform: translateX(6px); transition: opacity .18s, transform .18s cubic-bezier(.2,.8,.2,1); pointer-events: none; }
.bb__tip b { color: var(--a); font-weight: 600; font-variant-numeric: tabular-nums; }
.bb__btn:hover .bb__tip, .bb__btn:focus-visible .bb__tip, .bb__btn.is-on .bb__tip { opacity: 1; transform: none; }
.bb__btn.is-on:not(:hover):not(:focus-visible) .bb__tip { opacity: .8; }
.bb:hover .bb__btn.is-on:not(:hover) .bb__tip { opacity: 0; }
.bbm { position: fixed; inset: 0 0 auto; z-index: 60; display: none; gap: 3px; height: 3px; padding: 0 3px; pointer-events: none; }
.bbm span { flex: 1; background: var(--bb-line, rgba(243,240,234,.16)); border-radius: 2px; overflow: hidden; }
.bbm span::after { content: ""; display: block; height: 100%; background: var(--bb-accent, #ffb34d); transform-origin: left; transform: scaleX(var(--p, 0)); }
@media (max-width: 760px), (pointer: coarse) { .bb { display: none; } .bbm { display: flex; } }
@media (prefers-reduced-motion: reduce) { .bb__cube, .bb__tip { transition: none; } }
`;

function labelOf(s, i) {
  const t = s.dataset.bbLabel || s.getAttribute("aria-label") || s.querySelector("h1,h2,h3")?.textContent || `Section ${i + 1}`;
  const clean = t.replace(/\s+/g, " ").trim();
  return clean.length > 26 ? clean.slice(0, 24).replace(/\s\S*$/, "") + "…" : clean;
}

function init() {
  const sections = [...document.querySelectorAll("[data-bb-label]")].length
    ? [...document.querySelectorAll("[data-bb-label]")]
    : [...document.querySelectorAll("main > section[id], main > section")];
  if (sections.length < 2) return;

  const style = document.createElement("style"); style.textContent = CSS; document.head.append(style);
  const pad = (n) => String(n).padStart(2, "0");
  const total = pad(sections.length);

  const bar = document.createElement("nav");
  bar.className = "bb"; bar.setAttribute("aria-label", "Page sections");
  bar.innerHTML = `<span class="bb__rail" aria-hidden="true"><span class="bb__fill"></span></span>` +
    sections.map((s, i) => `<button class="bb__btn" type="button" aria-label="Go to ${labelOf(s, i)}"><span class="bb__cube" aria-hidden="true"><i></i><i></i><i></i></span><span class="bb__tip" aria-hidden="true"><b>${pad(i + 1)} / ${total}</b>${labelOf(s, i)}</span></button>`).join("");
  const mobile = document.createElement("div");
  mobile.className = "bbm"; mobile.setAttribute("aria-hidden", "true");
  mobile.innerHTML = sections.map(() => "<span></span>").join("");
  document.body.append(bar, mobile);

  const btns = [...bar.querySelectorAll(".bb__btn")];
  const segs = [...mobile.children];
  const fill = bar.querySelector(".bb__fill");
  const box = (s) => s.closest(".pin-spacer") || s; // pinned sections scroll for their spacer's height

  btns.forEach((b, i) => b.addEventListener("click", () => {
    const el = box(sections[i]);
    if (window.__lenis) window.__lenis.scrollTo(el, { duration: reduce ? 0 : 1.4, immediate: reduce });
    else el.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
  }));

  let tops = [], heights = [];
  const measure = () => { tops = sections.map((s) => box(s).getBoundingClientRect().top + scrollY); heights = sections.map((s) => box(s).offsetHeight || 1); };
  const update = () => {
    const mid = scrollY + innerHeight * 0.5;
    let on = 0;
    tops.forEach((t, i) => { if (mid >= t) on = i; });
    const max = document.documentElement.scrollHeight - innerHeight;
    fill.style.setProperty("--p", max > 0 ? Math.min(1, scrollY / max).toFixed(4) : 0);
    btns.forEach((b, i) => { b.classList.toggle("is-on", i === on); b.classList.toggle("is-past", i < on); b.toggleAttribute("aria-current", i === on); });
    segs.forEach((sg, i) => sg.style.setProperty("--p", Math.max(0, Math.min(1, (mid - tops[i]) / heights[i])).toFixed(3)));
  };
  measure(); update();
  addEventListener("scroll", update, { passive: true });
  addEventListener("resize", () => { measure(); update(); });
  addEventListener("load", () => { measure(); update(); });
  // pinned sections and late images change the layout after load
  new ResizeObserver(() => { measure(); update(); }).observe(document.body);
}

document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", init) : init();
