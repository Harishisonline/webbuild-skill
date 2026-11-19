# Reverse-engineering a reference (learn the technique, build an original)

Use when the user hands you a site they love ("make it feel like X"), a screen recording,
or a prospect's current site to rebuild.

## The boundary
Learn *how* it works — scroll length, pin structure, easing, type scale, shader idea, media
pipeline. Never ship its brand, copy, images, models, or code. The output is an original site
for *this* business. (REA's rule: separate observed behaviour from your design choices.
Promptbase's: "rebuild it as your own brand, never as a clone.")

## Workflow
1. **Questions first.** Turn "make it like X" into a checklist: What's the signature moment?
   How long is the scroll? What's pinned? What's the type system? What moves on hover? What's
   the media pipeline (video? frames? live 3D)? Which of these does *our* brief actually need?
2. **Measure** — `node scripts/teardown.mjs <url>` → `reference/teardown-<host>/`
   (libraries, fonts, palette, type sizes, media, shader uniforms + comments, scrub values,
   8 screenshots along the scroll). Shader uniform names and comments are the most revealing
   evidence (e.g. `uLift uGamma uGain uGrain` = a video grading pass; `uBalls` = metaballs).
3. **Watch.** Read every screenshot. If the user gave a screen recording, extract frames:
   `ffmpeg -i rec.mp4 -vf fps=4 reference/rec/%03d.png`, read them in order, and write a
   beat-by-beat spec: "0–30% scroll: product rotates 90°, headline words rise one by one;
   30–60%: pinned, parts separate along their axes; …". Video references are what make Claude
   nail motion ("if you can give it a video of your animation, Claude nails it").
4. **Ledger.** In `BUILD_NOTES.md` record each finding as
   `OBSERVED (evidence) → INFERENCE (confidence) → DECISION for our site`. Mark unknowns.
5. **Translate**, don't transplant: map their technique to the client's metaphor
   (their exploded headphones → our client's espresso machine; their ink metaballs → our
   florist's petals). Fresh palette, type, copy and assets from the client.

## Rebuilding a prospect's own site (the pitch)
Pull their real assets: logo, colours, photos, menu/services, hours, reviews — from their
site, Google Business Profile, Instagram. Keep their identity, replace the dated structure,
add one signature moment. This is "your products, your copy — just better", which is the pitch.

## Patterns observed across 40 professionally made 3D demo sites (Promptbase bootcamp, 2026)
- Stack everywhere: Vite + GSAP ScrollTrigger (`scrub`) + Lenis + reduced-motion fallback;
  real HTML text over the canvas, never UI overlapping the product.
- 29/40: **treated AI video** — an MP4 run through a WebGL2 grading shader (lift/gamma/gain,
  mid-tone grain, halation, subtle chromatic aberration, vignette, dither, pointer lens). This
  is why stock-looking AI clips read as bespoke → `assets/starter/grade.js` (original
  implementation of the idea).
- 8/40: real-time Three.js where the metaphor demanded it — procedural planet (space travel),
  contour terrain (geospatial), breath-synced particles (meditation), speed-line tunnel
  (CI/CD), ink metaballs masked around DOM text (type foundry).
- 3/40: no WebGL — photo parallax + type only (home care, orchard, workspace). Content-led
  brands don't need 3D.
- Per-brand type pairings: Anton, Instrument Serif, Fraunces, Cormorant, Bodoni Moda,
  Newsreader, Bricolage Grotesque, IBM Plex Mono, Caveat…
- Content bound through config attributes (`data-edit="hero.headline"`) so a template can be
  rebranded fast — worth copying as a pattern if you'll pitch many businesses in one niche.

## Going deeper: REA's engine
`teardown.mjs` is the quick pass. When it can't tell how an effect is built (minified bundle,
custom shader, unusual scroll engine), run REA (github.com/morluto/rea, MIT):

```bash
scripts/rea-teardown.sh <url> [out-dir] [observe-ms]
```

It starts a throwaway headless Chrome (temp profile, none of the user's logins) and runs
REA's browser tools: `inspect-web-page` (DOM, accessibility, scripts with sources, network,
console), `analyze-web-bundle` (vendor fingerprints with confidence, chunk graph, endpoints,
explicit unknowns), `export-web-scripts` (every script on disk) and `capture-web-screenshot`.
It writes `REA-TEARDOWN.md` with fingerprints, shader uniforms, GSAP eases and scrub values.

Then work the exported `scripts/` like evidence: grep for the effect
(`grep -rn "uniform\|ScrollTrigger.create\|timeline(" scripts`), read the surrounding code to
learn the technique, and record it in the ledger. REA's own guides are vendored in
`references/rea/`; start with `references/rea/README.md`. For more REA commands (module
graph, runtime listeners, comparing two captures) run the pinned runner shown there with `--help`.

REA runs on its own Node 24 via npx, so the user's Node version doesn't matter. The first
run downloads about 100 MB. The scripts you export are someone else's code: study them, never
paste them into the client's site.
