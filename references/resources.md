# Resources: components, effects, inspiration, companion skills

Verified November 2026 unless marked [?]. Search these *before* hand-writing a complex effect,
then adapt the code to the project's tokens — a pasted component in its demo colours is slop.

## Component registries (copy-into-project, shadcn CLI)
`npx shadcn@latest init` once, then `npx shadcn@latest add @ns/name` or a registry URL.
Index: https://ui.shadcn.com/r/registries.json

| Registry | Best for | Licence | Install |
|---|---|---|---|
| **21st.dev** | Community marketing blocks, AI UI variants | free catalog; AI gen needs key | `21st search "<need>"` (local skills `21st-cli-use`, `21st-ui-build`, `21st-ui-explore`) · `npx shadcn add <21st url>` |
| **React Bits** (reactbits.dev) | Creative text + backgrounds: SplitText, BlurText, Aurora, Silk, Threads | MIT core | `npx shadcn@latest add @react-bits/BlurText-TS-TW` |
| **Aceternity UI** | Spotlight, beams, 3D cards, parallax, lamp | free core + Pro | `npx shadcn@latest add @aceternity/<name>` |
| **Magic UI** | Marquee, globe, number ticker, bento | MIT core | `npx shadcn@latest add @magicui/<slug>` |
| **Motion Primitives** | Subtle tasteful micro-interactions | MIT | `npx motion-primitives@latest add <name>` |
| **Cult UI** · **Animate UI** | Animated shadcn variants | MIT / free | `@cult-ui/…`, `@animate-ui/…` |
| **Skiper UI** | Awwwards-flavoured interactions | free tier needs attribution | `npx shadcn add @skiper-ui/skiperNN` |
| **coss ui** (ex-Origin UI) | Forms + app components | MIT | `@coss/…` |
| **shadcn/ui** | Accessible primitives — restyle heavily | MIT | `npx shadcn@latest add button` |
| Uiverse | Single HTML/CSS buttons/loaders | MIT | copy |

Static-HTML project? Don't bolt React on for one component — read its source and rebuild it
in vanilla JS/CSS (the YouTube builds that worked did exactly this).

## 3D / shader / effect tools
- **three.js** + examples (threejs.org/examples) — canonical reference, WebGPU examples too.
- **React Three Fiber v9 + drei v10** (React 19) — `useGLTF`, `Environment`, `Float`,
  `MeshTransmissionMaterial`, `ScrollControls`, `PerformanceMonitor`, `AdaptiveDpr`.
  (v10/v11 alphas: not for client work.)
- **GSAP 3.13+** — 100% free incl. SplitText, ScrollSmoother, MorphSVG, DrawSVG (since Apr 2025).
  React: `@gsap/react` `useGSAP()`. Official agent skills: github.com/greensock/gsap-skills.
- **Lenis** (`lenis`, not `@studio-freight/lenis`).
- **Spline** (spline.design) — visual 3D, embed; free plan shows logo; heavy, so poster on mobile.
- **Unicorn Studio** — no-code WebGL layers; free embeds watermarked.
- **Paper Shaders** (`@paper-design/shaders-react`) — light mesh-gradient/grain/dither.
- **ShaderGradient** — use sparingly. **Vanta.js** — legacy, looks 2019; avoid.
- **Tripo / Meshy** — photo → GLB model. **gltf-transform** / **gltfjsx** — compress models.
- **Codrops** (tympanus.net/codrops) — best creative WebGL/GSAP tutorials with source.

## Inspiration (study, never copy)
Awwwards (SOTD) · Recent (ex-Godly [?]) · SiteInspire (restrained, good for services) ·
Land-book · Lapa Ninja · One Page Love · Mobbin · Refero · **Typewolf** (type on real sites) ·
Framer marketplace (layouts) · Dribbble/Behance (concepts, often unbuildable).

Build a small taste library per project: 3–6 screenshots in `reference/`, each with one line
on *what* to take from it (the type scale, the reveal, the density) — not "make it like this".

## Companion skills worth installing (optional)
- **Anthropic `frontend-design`** (github.com/anthropics/skills) — the base design discipline.
- **Impeccable** (impeccable.style, Apache-2.0) — `npx impeccable skills install`;
  `npx impeccable detect` is a second, LLM-free slop linter; `/impeccable critique|polish|bolder|quieter`.
- **Taste Skill** (github.com/Leonxlnx/taste-skill, MIT) — palettes by trade; note its rule
  that places/shops/services get photo-and-type moments, not WebGL.
- **GSAP skills** (greensock/gsap-skills).
- **UI UX Pro Max** (nextlevelbuilder/ui-ux-pro-max-skill) — big style/palette/font catalog.
- **rea** (github.com/morluto/rea) — reverse-engineering reference sites (see `reverse-engineer.md`).
- Locally installed here: `21st-ui-build`, `21st-ui-explore`, `21st-ui-review`, `21st-cli-use`,
  `kling-ai:*` (video), `social-media-skills:nano-banana` (image prompts).
