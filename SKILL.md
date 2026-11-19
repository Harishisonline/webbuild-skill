---
name: webbuild
description: Build professional, distinctive, pitch-ready business websites — including scroll-driven "3D" heroes (AI video scrubbed by scroll), real-time Three.js / React Three Fiber scenes, GSAP + Lenis motion, and treated-video shaders — that do NOT look AI-generated. Covers the brief, reverse-engineering reference sites, design system (type, colour, layout, copy), hero/asset pipeline, performance and accessibility, visual QA with screenshots, a slop linter, deployment, and pitching the site to a local business. Use this whenever the user wants to build, redesign or polish a website or landing page, mentions 3D websites, scroll animations, Awwwards-style or "$10K" sites, Three.js/GSAP/Spline, wants a site "like" another site, wants to rebuild a business's site to pitch or sell it, or complains a site looks generic / like AI slop — even if they don't say "webbuild".
---

# webbuild

Make websites a business owner would pay for: specific to *them*, fast on a phone, one
memorable moment, and nothing that screams "an AI made this". The craft is mostly in the
choices before code and in looking at the result honestly afterwards.

Paths below are relative to this skill's folder (`scripts/`, `references/`, `assets/`).

## 0. Set up the project (2 min)

- New site → copy `assets/starter/` into the project folder (plain HTML + CSS + ES modules,
  pinned CDN imports, no build step: deploys anywhere, easy to edit). Use Next.js / Astro / R3F
  only if the user asks or the project already uses them (`references/3d-playbook.md` §5).
- Existing project → keep its framework, tokens and components; this skill adds direction,
  motion and QA, not a rewrite.
- Create `BUILD_NOTES.md` in the project. It's the memory across context resets: brief,
  decisions, open questions, fixes that worked.

## 1. Brief — get the real business

Gather (from the user, the business's current site, Google Business Profile, Instagram):
name, what they sell, where, since when, the **one primary action** (call / book / order /
quote / visit), real proof (rating + count, years, licences, press), real photos, logo/colours,
hours, address, phone. Write the 5-line brief from `references/design-system.md` §2 into
`BUILD_NOTES.md`.

Never invent facts — fabricated reviews, stats, prices or addresses in a pitch destroy trust
the moment the owner reads them. Instead:
- **Write around unknowns** so the demo still reads finished: "Koregaon Park, Pune" instead of
  a made-up street number; "Rated 4.7 on Google" instead of invented quotes; service names
  without prices, or "from ₹…" only if known.
- Where a fact is genuinely required (phone, exact address, hours), use a visible
  `{{placeholder}}` — `slop_check.py` blocks shipping until it's filled.
- Put every unknown and assumption on an "Ask the client" list for the final report.

If the brief is thin and the user is around, ask at most 3 questions (business + city,
primary action, any site they love). If they want you to just go, make sensible assumptions,
write them down, and keep moving.

## 2. Reference (when the user names a site, sends a recording, or wants a "rebuild")

Follow `references/reverse-engineer.md`: `node scripts/teardown.mjs <url>` measures the stack,
fonts, palette, media and shader evidence and screenshots the scroll; screen recordings become
frames you read and turn into a beat-by-beat motion spec. When that quick pass can't explain
an effect, go deeper with REA's engine: `scripts/rea-teardown.sh <url>` captures the page,
fingerprints the bundle and exports every script so you can read how it's actually built
(guides in `references/rea/`). Record OBSERVED → INFERENCE → DECISION. Learn the technique;
never copy brand, copy, assets or code.

## 3. Direction — plan, then attack the plan

Read `references/design-system.md` (the anti-slop rules — classic *and* the newer
"tasteful AI" tells like cream + terracotta, ALL-CAPS eyebrows, editorial hairlines). In
`BUILD_NOTES.md` write:
- 4–6 named colour tokens taken from the business, type pairing + roles, radius language
- ASCII wireframe of each section (vary the rhythm — no hero → 3 cards → logos → testimonials)
- the **signature moment** (exactly one) and why it fits *this* business
- 3 principles that make it distinctive

Then review the plan against the tell list and, for each choice that reads as a default,
justify it for this business or change it. Asking "could this belong to another business if
I swapped the logo?" catches most problems here, where they're cheap.

For an undecided direction the user wants to choose, show 2–3 genuinely different directions
(a still or a quick HTML sketch each) before building — `21st-ui-explore` can help if installed.

## 4. Hero — pick the mode that serves the business

`references/3d-playbook.md` §1 has the decision table. Short version:
- **still** (great photo/type) — places, food, salons, clinics, services. Often the right call.
- **video** — atmosphere loop, ideally *treated* with `assets/starter/grade.js` so AI/stock
  footage gets a bespoke grade (grain, halation, lift/gamma/gain, vignette). Pick a LOOK and
  keep it subtle.
- **frames** — the "$10K 3D website": AI start/end keyframes → first/last-frame video →
  `scripts/frames.sh` → canvas scrubbed by scroll. Read `references/scroll-video-playbook.md`
  for the keyframe rules, prompts and blending.
- **scene** — live Three.js / R3F when 3D *is* the product story (configurable product,
  architecture, tech). Subject must be the business's thing, never the placeholder knot.

Generate assets with whatever is connected (Higgsfield / Kling / kie.ai / Nano Banana MCPs or
skills), or ask the user to drop files in. If nothing is available, build with a clearly
labelled placeholder and list exactly what asset to generate, with the prompt.

## 5. Build

Order: tokens (`styles.css :root`) → semantic HTML sections with real copy → layout at 390px
and 1440px → hero mode → motion last.

- Copy rules: `references/design-system.md` §8 (outcome + place + specifics, real CTA verbs,
  banned words).
- Required for a business site: one obvious CTA above the fold and again at the end, `tel:` /
  booking / form, hours + address + map link, real proof, title + description + OG image,
  LocalBusiness JSON-LD, favicon, sticky call/book bar on mobile when the action is a call.
- Motion: one signature moment + quiet 150–300 ms micro-feedback; ease-out, never bounce;
  `transform`/`opacity` only; reduced-motion shows end states.
- Components: search `references/resources.md` registries (21st.dev, React Bits, Aceternity,
  Motion Primitives…) before hand-writing complex effects, then restyle to the tokens. In a
  static site, rebuild React components in vanilla rather than adding React for one effect.
- Footer: the business's own socials, plus the small builder credit already in the starter
  ("Site by …" with LinkedIn / GitHub). Keep it if the user has a credit rule; the client can
  ask for it to be removed.

## 6. Look at it — this is where good sites are made

Serve locally (`npx serve .` or the project's dev server), then:
1. `node scripts/shoot.mjs http://localhost:3000 ./shots` — phone / laptop / desktop
   screenshots along the scroll + console errors, overflow, LCP, weight. **Read the PNGs.**
   (Or use the browser pane / Playwright MCP if available.) Also run once with
   `--reduced-motion`.
2. `python3 scripts/slop_check.py .` — must end with 0 FAIL. Treat WARNs as questions.
   (`npx impeccable detect` is a good second opinion if installed.)
3. Critique honestly against the brief: hierarchy, type, colour, the signature moment, mobile,
   copy specificity. Fix in batches with clear intent ("lower sections feel generic — make
   them more expensive, not busier").
4. **Subtract one decorative element** before calling it done.

Expect 3–6 rounds; nobody one-shots this. Log what fixed what in `BUILD_NOTES.md`.

## 7. Ship + pitch

- Deploy: Vercel / Netlify / Cloudflare Pages / GitHub Pages. **Commit the frames folder**
  (the most common "the hero vanished in production" bug). Add `<meta name="robots"
  content="noindex">` to spec demos until the client buys.
- If it's a pitch, read `references/pitch-and-sell.md`: before/after video, outreach scripts,
  pricing anchors, the pitch-ready checklist, handover.

## Final report to the user

Keep it short and concrete:
- What was built (direction in one line, signature moment, hero mode) and where (paths, URL)
- How to run it (`npx serve .` or the dev command)
- QA results: slop_check FAIL/WARN counts, shoot.mjs LCP / errors per viewport, what you
  looked at and fixed
- **Ask the client** list: every `{{placeholder}}` and assumption
- Assets still to generate (with ready-to-use prompts), if any

## Reference map

| Read | When |
|---|---|
| `references/design-system.md` | Always, before choosing colour/type/layout/copy |
| `references/3d-playbook.md` | Choosing the hero; any Three.js/R3F; performance + a11y budget |
| `references/scroll-video-playbook.md` | Scroll-scrubbed "3D" hero from AI video |
| `references/reverse-engineer.md` | A reference site, a recording, or rebuilding a prospect's site |
| `references/rea/README.md` | Going deeper than teardown.mjs with REA's tools |
| `references/resources.md` | Component registries, effect tools, inspiration, companion skills |
| `references/pitch-and-sell.md` | Spec site for a prospect, pricing, outreach, handover |

| Script | Does |
|---|---|
| `scripts/teardown.mjs <url>` | Measure a reference site (stack, fonts, palette, media, shaders, screenshots) |
| `scripts/rea-teardown.sh <url>` | Deep teardown with REA's engine: page capture, bundle fingerprints, exported scripts |
| `scripts/frames.sh <video> <out>` | Video → WebP frame sequences (desktop + mobile) + manifest |
| `scripts/shoot.mjs <url> [out]` | Screenshots at 3 widths along the scroll + errors/LCP/overflow |
| `scripts/slop_check.py <dir>` | AI-slop + ship-readiness linter (0 FAIL to ship) |

Playwright for the `.mjs` scripts: `npm i -D playwright && npx playwright install chromium`.
