# Scroll-video playbook (the "$10K 3D website" technique)

Distilled from the most-watched 2026 Claude Code website tutorials (Metics Media, Nate Herk,
Jack Roberts, Nick Saraev, Chase AI, AI Chris Lee, AyzZ, Komputer Mechanic, MiladiCode,
DesignCourse — source list at the bottom). Most "3D websites" sold to local businesses are
**not real-time 3D**: they are an AI-generated video scrubbed by scroll. That's fine — it looks
expensive, runs on any phone, and takes an afternoon. Use real Three.js only when interaction
(rotate it, configure it, explore it) is the point. See `3d-playbook.md` for that path.

## Contents
1. Keyframes → video → frames
2. Prompts that worked
3. Blending the video into the page
4. Asset-generation MCPs
5. Pitfalls seen in every tutorial

## 1. Keyframes → video → frames

1. **Start frame**: the subject *assembled / at rest*. Brief the image model: "clean solid
   background in `<page --bg hex>`, no shadows, no hands, no reflections, nothing touching the
   edges, 16:9, 2048px+". 1K images look cheap when scaled to a 1920px canvas.
2. **End frame**: the *exploded / opened / transformed* state, generated **with the start frame
   as a reference** so parts and materials stay identical. Make 4 of each, pick the best pair.
   "The scroll is only as good as the start and end frame."
3. **Video**: first/last-frame mode in Kling 3.x, Seedance 2.x, Veo 3.x — 5–7 s, 16:9, 1080p.
   Draft at 480p while iterating on motion, re-render the keeper at 1080p (saves credits).
   Make 2–3 in parallel and keep the best. Cost ≈ $0.30–1 per clip.
4. **Frames**: `scripts/frames.sh clip.mp4 public/frames/hero 24 1920` → 90–180 WebP frames,
   desktop + mobile sets, manifest. Never scrub the raw MP4 (`video.currentTime` scrubbing
   stutters on most browsers) — draw frames to a `<canvas>` (the starter's `initFrames`).
5. **Preload**: draw frame 1 instantly (it's also the `<img>` poster and LCP element), load
   the rest progressively; optionally a 1–2 s branded loader so the first scroll is smooth.
6. **Commit the frames.** The #1 production bug in the tutorials: the frames folder was
   gitignored / not uploaded, so the hero vanished on Vercel/Netlify.

Good subjects: product exploded view (watch, shoe, espresso machine, sneaker), a house
assembling floor by floor (builders, architects, realtors), a dish assembling ingredient by
ingredient (restaurants), a car/bike reveal (dealers, detailers), a tooth/implant cross-section
(dentists — keep it tasteful), coffee beans → cup (cafés), a camera dolly through a space
(gyms, salons, hotels).

## 2. Prompts that worked

- Have Claude write the video prompt — it knows the palette and layout already:
  "Write a first/last-frame video prompt: the lid floats off, fruit and juice drop in, the lid
  goes back on. No shadows, no hands, no reflections. Camera locked."
- Exploded view: "Explode in all directions, every part travels along its own mounting axis
  (separating, not scattering), nothing leaves the frame, no text, background `#xxxxxx`."
- Turntable: "Rotate in place; the centre of mass must not move; camera locked."
- Build: "Scroll-driven frame animation: plays forward on scroll down, reverses on scroll up.
  Pin the hero for ~250% of viewport height. Headline enters after 30% progress."
- Iteration language that got results: "slow the scrub by 40%", "move the headline centre-left",
  "text is hard to read — add a subtle scrim behind it, not a box", "it's laggy — use
  preloaded compressed frames on canvas", "make the lower sections feel more expensive, not busier".

## 3. Blending the video into the page

- The page `--bg` must equal the video background exactly (eyedrop the first frame). Then
  add an inward radial mask / edge feather so no rectangle edge shows:
  `mask-image: radial-gradient(ellipse at center, #000 60%, transparent 100%)`.
- Copy sits on the side the subject is not; put a soft scrim gradient under it on mobile.
- Split headline into words and reveal them against scroll progress so text and video feel
  choreographed, not stacked.
- Phones: use the half-width frame set, shorten the pin (`+=150%`), or swap to the poster plus
  a short autoplay muted loop.

## 4. Asset-generation MCPs (optional — any image/video tool works)

- **Higgsfield MCP** (most used): Claude → Settings → Connectors → custom connector URL from
  higgsfield.ai "MCP & CLI". Run a cheap smoke-test image first. Gives Nano Banana Pro, GPT
  Image, Seedream, Kling, Seedance in-chat.
- **kie.ai** (API key in `.env`), **OpenArt MCP**, **Kling AI MCP**, Flashloop — same idea.
- If no generator is connected: ask the user to drop the clip in the project, or use real
  footage of the business (often better — it's *theirs*).
- Real 3D model from a photo: Tripo / Meshy → GLB → Three.js (see `3d-playbook.md`).

## 5. Pitfalls seen in every tutorial

- Nobody one-shots it. Expect 3–6 fix rounds: scrub speed, headline position, cut-out edges.
- Claude must *look* at the result (`scripts/shoot.mjs` or the browser pane) — tutorials only
  got unstuck when Claude "opened the page and inspected it live".
- 21st.dev React components pasted into a static HTML site: rebuild them in vanilla instead
  of bolting React on.
- Heavy hero: keep the desktop frame set under ~6 MB total; mobile under ~2.5 MB.
- Clear context around half-full on long builds; keep a `BUILD_NOTES.md` so nothing is lost.
- Fold every fix that worked back into this skill so the next build starts smarter.

## Sources (2026)
Metics Media "Build $10,000 Websites using Claude Code" (youtu.be/VMvZuhcDdnw) and "How to
Build $10K Websites in Minutes" (snErQUyqwCU) · Chase AI "Turn Claude Into A Design GENIUS"
(7FU98O0JLHs) · Nate Herk "Nano Banana 2 + Claude Code" (q0TgUtj6vIs), "ScrollCraft"
(QUI6Ug4cHnE) · Jack Roberts "Claude Code + Nano Banana 2" (TZUTe7s11-I) · Nick Saraev
"$15K Animated Sites" (ZfYvv-0l9NA) · AI Chris Lee "I Sell Them for $10K" (mhIAd5lVMag) ·
AyzZ "Build and animate award winning websites" (kau9QOV1G8E) · Komputer Mechanic
"Seedance 2.5" (mFgRGSOGNPM) · MiladiCode "Cinematic 3D Website with Three.js" (uQ_nqJSrZ_s) ·
DesignCourse "Fable 5 UI/UX One-Shots" (tSg3FAdWvzI).
