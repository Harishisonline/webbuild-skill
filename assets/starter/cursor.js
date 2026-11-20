// cursor.js — a cursor ring that makes hovers feel responsive (seen on most premium references).
// Drop-in: <script type="module" src="./cursor.js"></script>   (no dependencies)
// - Fine pointers only (mouse/trackpad); skipped on touch and for prefers-reduced-motion.
// - The native cursor stays (accessibility); the ring is extra feedback.
// - Grows over anything clickable, squeezes on press. Visible on light AND dark sections
//   (light ring with a thin dark outline).
// - Theme: --cr-accent on :root (defaults to the block-tower accent, then amber).

const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

if (fine && !reduce) {
  const css = `
  .cr-ring, .cr-dot { position: fixed; left: 0; top: 0; z-index: 2147483000; pointer-events: none; border-radius: 50%; opacity: 0; transition: opacity .2s; will-change: transform; }
  .cr-on .cr-ring, .cr-on .cr-dot { opacity: 1; }
  .cr-ring { --a: var(--cr-accent, var(--bb-accent, #ffb34d)); width: 34px; height: 34px; margin: -17px 0 0 -17px;
    border: 1.5px solid rgba(255,255,255,.75); box-shadow: 0 0 0 1px rgba(0,0,0,.28), inset 0 0 0 1px rgba(0,0,0,.18);
    transition: opacity .2s, width .18s cubic-bezier(.2,.8,.2,1), height .18s cubic-bezier(.2,.8,.2,1), margin .18s cubic-bezier(.2,.8,.2,1), background-color .18s, border-color .18s; }
  .cr-ring.is-hover { width: 58px; height: 58px; margin: -29px 0 0 -29px; border-color: var(--a); background: color-mix(in oklab, var(--a) 16%, transparent); }
  .cr-ring.is-press { width: 26px; height: 26px; margin: -13px 0 0 -13px; }
  .cr-dot { width: 5px; height: 5px; margin: -2.5px 0 0 -2.5px; background: var(--cr-accent, var(--bb-accent, #ffb34d)); box-shadow: 0 0 0 1px rgba(0,0,0,.3); }`;
  const style = document.createElement("style"); style.textContent = css; document.head.append(style);

  const ring = document.createElement("div"); ring.className = "cr-ring";
  const dot = document.createElement("div"); dot.className = "cr-dot";
  ring.ariaHidden = dot.ariaHidden = "true";
  document.body.append(ring, dot);

  let x = -100, y = -100, rx = x, ry = y;
  addEventListener("pointermove", (e) => { x = e.clientX; y = e.clientY; document.documentElement.classList.add("cr-on"); }, { passive: true });
  document.addEventListener("pointerleave", () => document.documentElement.classList.remove("cr-on"));
  document.addEventListener("pointerover", (e) => ring.classList.toggle("is-hover", !!e.target.closest("a, button, label, select, summary, [role=button], input[type=submit]")));
  addEventListener("pointerdown", () => ring.classList.add("is-press"));
  addEventListener("pointerup", () => ring.classList.remove("is-press"));

  (function loop() {
    rx += (x - rx) * 0.22; ry += (y - ry) * 0.22;           // ring trails slightly
    ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
    dot.style.transform = `translate3d(${x}px, ${y}px, 0)`;  // dot is exact
    requestAnimationFrame(loop);
  })();
}
