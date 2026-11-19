# 3D playbook: choosing and building the hero

## Contents
1. Pick the hero mode (decision table)
2. Real-time Three.js / R3F recipes
3. Performance budget
4. Accessibility & fallbacks
5. Stack choices

## 1. Pick the hero mode

| Mode | Use when | Cost | Starter |
|---|---|---|---|
| `still` — great photo / type | Places, food, salons, services, clinics. Often the *right* answer. | fastest | `data-hero="still"` |
| `video` — autoplay muted loop | Atmosphere (a room, a pour, a workout) with no interaction | light | `<video autoplay muted loop playsinline poster>` |
| `frames` — scroll-scrubbed sequence | A product or build process that *transforms* (exploded view, assembly, reveal) | medium, any phone | `frames.sh` + `initFrames` → `scroll-video-playbook.md` |
| `scene` — live Three.js | The user should *do* something: rotate, configure, explore; tech/product/architecture/gaming brands | heaviest | `scene.js` |
| Spline / Unicorn embed | Designer-made scene, fast turnaround, client OK with runtime weight | heavy | embed + poster |

Rule of thumb (from Taste Skill and every pro in the research): places, shops, cafés, hotels,
studios and services get photo- and type-led signature moments; WebGL goes where 3D *is* the
product story. When in doubt, `frames` — it gives the "3D" wow with near-zero risk.

## 2. Real-time recipes

**Subject first.** The mesh must be *the business's thing*: their product as GLB (Tripo/Meshy
from photos, or a supplied CAD export), an extruded logo (SVGLoader + ExtrudeGeometry), a
material shader (wood grain, water, dough, steel), a floor plan that extrudes into a building.
A torus knot or floating blob is placeholder, never shipped.

**Lighting.** Key + rim + soft hemisphere, or an HDRI `Environment` (drei presets / Poly Haven
1K). ACES tone mapping, sRGB output. One shadow-casting light max, or baked contact shadow.

**Choreography.** Scroll should *tell* something: the object turns to show a detail, opens,
assembles, the camera dollies through stages (MiladiCode used 5 camera stages). Drive with a
GSAP timeline `scrub: true` on the hero section, or drei `<ScrollControls>` in R3F.

**Interaction.** Pointer parallax eased with lerp (desktop only); hover highlights on parts;
drag to rotate (OrbitControls with damping, zoom disabled, polar limits).

**Loading GLB** (vanilla):
```js
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import { MeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js";
const loader = new GLTFLoader().setDRACOLoader(new DRACOLoader().setDecoderPath("https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/libs/draco/")).setMeshoptDecoder(MeshoptDecoder);
```
Compress first: `npx @gltf-transform/cli optimize in.glb out.glb --compress meshopt --texture-compress webp`
(R3F: `npx gltfjsx model.glb --transform`).

**R3F skeleton** (Next.js):
```jsx
const Hero = dynamic(() => import("./HeroScene"), { ssr: false });
<Canvas dpr={[1, 1.75]} camera={{ fov: 35, position: [0, 0, 6] }} gl={{ antialias: true }}>
  <PerformanceMonitor onDecline={() => setDpr(1)} />
  <Environment preset="studio" />
  <Float speed={1} rotationIntensity={0.3}><Model /></Float>
</Canvas>
```

## 3. Performance budget (pitches are opened on phones)

- LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1; Lighthouse mobile 90+ is the goal.
- **LCP element is HTML text or a poster `<img fetchpriority="high">`, never the canvas.**
  Load the scene after first paint / on idle; fade the canvas over the poster.
- JS ≤ ~200 KB gz excluding three (~150 KB gz). GLB ≤ 1–2 MB, textures ≤ 2K.
- DPR cap: `Math.min(devicePixelRatio, 2)` desktop, 1.5 phone. `frameloop="demand"` for static.
- Pause the render loop off-screen (IntersectionObserver) and on hidden tabs.
- ≤ 1 post-processing pass; bloom is expensive on mobile.
- Frames hero: desktop set ≤ ~6 MB, mobile ≤ ~2.5 MB, first frame instant.

**Hard-won gotchas (from real builds):**
- Observe the *section* with IntersectionObserver, not a canvas inside a pinned section:
  the canvas can report "not visible" forever and your render loop silently stops after frame 1.
- Drive overlay copy from the same scroll progress as the camera (`onUpdate` callback) instead of
  a second ScrollTrigger on the pinned element; the second one may never fire.
- Never fade the h1 from opacity 0 (it's the LCP element); start WebGL on `requestIdleCallback`
  after `load`. On one build this took phone LCP from 3–8 s to ~1.1 s.
- Reduced-motion stills render on demand: re-render when late textures (posters) arrive.
- `fog: false` on video screens/emissive signage, or fog washes them out.
- Fill the horizon (sky dome in world space + far silhouettes); a lone ground plane meeting a
  screen-space gradient leaves a visible seam.

## 4. Accessibility & fallbacks

- `prefers-reduced-motion`: no smooth scroll, no scrub, no pin — show the poster/end state.
- Low-power fallback: `hardwareConcurrency <= 4`, `navigator.connection.saveData`, WebGL2
  unavailable → poster image or short muted loop.
- Decorative canvas `aria-hidden="true"`; meaningful one `role="img" aria-label="…"`.
- No essential content or nav only inside WebGL. Scrim behind text over moving media.
- Don't hijack scroll so hard that find-in-page, back button, or keyboard paging break.

## 5. Stack choices

- **Single static page / pitch demo**: plain HTML + CSS + ES modules via importmap
  (`assets/starter/`) — deploys anywhere, no build, Claude edits it easily.
- **Multi-page, content-heavy**: Astro (islands for the 3D) or Vite.
- **React shop / app-like**: Next.js + R3F + `@gsap/react` + `lenis/react`.
- Pin versions; three r170+, GSAP 3.13+, Lenis 1.1+. Native CSS scroll-driven animations
  (`animation-timeline: view()`) for simple reveals in Chromium/Safari; keep GSAP for timelines.
