# webbuild — a Claude Code skill for websites that don't look AI-made

**webbuild** turns Claude Code into a careful web studio. It builds professional, pitch-ready
business websites, including scroll-driven "3D" heroes, real-time Three.js scenes, GSAP + Lenis
motion and treated-video shaders. It then checks its own work so the result doesn't read as
generic AI output.

It came out of studying the most-watched 2026 "build $10K websites with Claude Code" tutorials,
40 professionally built 3D demo sites, the REA reverse-engineering method, and the current
anti-slop design guidance (Anthropic's frontend-design skill, Impeccable, Taste Skill). That
research is condensed into one workflow, four scripts and a starter.

## What it does

1. **Brief.** Gets the real business: its one primary action and real proof. It never invents reviews or stats.
2. **Reference.** `teardown.mjs` measures any site you admire: stack, fonts, palette, media,
   shader uniforms and scroll screenshots. For a deeper look, `rea-teardown.sh` runs
   [REA](https://github.com/morluto/rea)'s browser engine to fingerprint the bundle and export
   every script. You learn the technique without cloning the site.
3. **Direction.** Plans named colour tokens, a type pairing, wireframes and one signature
   moment, then reviews that plan against a list of classic and 2026 AI tells.
4. **Hero.** Picks one of four modes: still, treated video (WebGL grading shader), scroll-scrubbed frame sequence (the
   "$10K 3D website"), or live Three.js.
5. **Build.** A zero-build starter with pinned CDN imports, Lenis, ScrollTrigger, DPR caps and
   reduced-motion and low-power fallbacks.
6. **Look.** `shoot.mjs` screenshots phone, laptop and desktop along the scroll and reports
   errors, LCP and overflow. `slop_check.py` lints for AI slop and ship-readiness. It must show 0 FAIL.
7. **Ship and pitch.** Deploy notes, outreach scripts, pricing anchors and a pitch-ready checklist.

## Install

```bash
git clone https://github.com/Harishisonline/webbuild-skill ~/.claude/skills/webbuild
```

Restart Claude Code, then ask for a website ("build a premium homepage for the barbershop on my
street", "make a 3D landing page for my coffee brand", "this site looks like AI slop, fix it").
The skill triggers on its own. You can also say "use webbuild".

The browser scripts need Playwright once per project:

```bash
npm i -D playwright && npx playwright install chromium
```

`frames.sh` needs ffmpeg (`brew install ffmpeg`). `rea-teardown.sh` needs Google Chrome (or
Playwright's Chromium); it fetches REA and a compatible Node through npx on first run.

## What's inside

```
SKILL.md                      the workflow Claude follows
references/
  design-system.md            anti-slop rules, type pairings, colour, layout, copy
  3d-playbook.md              hero-mode decision table, Three.js/R3F recipes, perf + a11y budget
  scroll-video-playbook.md    keyframes → AI video → frames → scroll scrub, with prompts
  reverse-engineer.md         evidence-first teardown of reference sites
  rea/                        REA's web reverse-engineering guides (MIT, vendored)
  resources.md                21st.dev, React Bits, Aceternity, GSAP, Spline, inspiration…
  pitch-and-sell.md           finding clients, outreach scripts, pricing, handover
scripts/
  teardown.mjs                measure a reference site
  rea-teardown.sh             deep teardown with REA's engine (runs via npx)
  frames.sh                   video → WebP frame sequences + manifest
  shoot.mjs                   multi-viewport screenshots + errors/LCP/overflow
  slop_check.py               AI-slop + ship-readiness linter
assets/starter/               index.html, styles.css, main.js, scene.js, grade.js
evals/                        test cases (runnable with `claude plugin eval`)
```

## Credits

- [REA](https://github.com/morluto/rea) by morluto (MIT): its web guides are vendored in
  `references/rea/` with its license, and `rea-teardown.sh` runs its engine from npm.
- Design guidance draws on Anthropic's [frontend-design skill](https://github.com/anthropics/skills),
  [Impeccable](https://impeccable.style) and [Taste Skill](https://github.com/Leonxlnx/taste-skill).
- Technique notes from tutorials by Metics Media, Nate Herk, Jack Roberts, Nick Saraev,
  Chase AI, AI Chris Lee, AyzZ, Komputer Mechanic, MiladiCode and DesignCourse (links in
  `references/scroll-video-playbook.md`).
- Apart from REA's guides (MIT), no third-party code or assets are copied. `grade.js` is an
  original implementation of the treated-video idea.

## Author

Built by Harish: [LinkedIn](https://www.linkedin.com/in/harishpradhan0131/) · [GitHub](https://github.com/Harishisonline)

MIT licensed.
