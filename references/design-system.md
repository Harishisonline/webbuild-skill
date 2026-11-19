# Design system: how to not look AI-generated

Read this before choosing colour, type, layout or copy. The question behind every rule:
**could this page belong to a different business if you swapped the logo?** If yes, it's slop.

## Contents
1. The tells (old and new)
2. Direction from the trade, not from "modern SaaS"
3. Typography + pairings
4. Colour
5. Layout
6. Imagery & icons
7. Motion
8. Copy
9. The plan → review → build → subtract loop
10. What owners still call slop (lessons from real reviews)
11. Anatomy of a premium footer
12. Buttons, hover and scroll (studied from the Promptbase demos)

## 1. The tells

**Classic 2023–25 tells** — purple/indigo→blue gradients; gradient headline text; Inter/Roboto/
Poppins at one weight; centred hero + two buttons → 3 identical icon cards → logo strip →
3 testimonials → pricing → FAQ; emoji or tinted-tile icons above every heading; glassmorphism;
blurred colour orbs; cards nested in cards; dot-grid backgrounds; "✨ New" pill; fade-up on every
section; bounce easing; "Unlock / Elevate / Seamless / Revolutionize"; "10,000+ happy
customers"; "Sarah J., CEO".

**Newer "tasteful AI" tells (2026)** — named in Anthropic's own frontend-design skill:
cream background + terracotta accent; near-black + acid-green or vermilion accent; broadsheet
hairline rules everywhere; monospace micro-labels; ALL-CAPS eyebrows; middle-dot meta strings
("Est. 1998 · Leeds · Family run"); "WORD — fragment" labels; one italic/accented word in the
headline; 01/02/03 numbering on things that aren't a sequence. *Fixing generic output by going
"editorial" is itself now a cliché.* Use any of these only when the brief genuinely calls for it,
and never more than one.

## 2. Direction from the trade

Write a 5-line brief before any pixels:
```
Business:      what they sell, where, since when, to whom
Primary action: the ONE thing a visitor should do (call / book / order / quote / visit)
Proof we have:  real ratings, years, numbers, press, licences, photos
3 adjectives:   how it should feel (e.g. "unhurried, exact, warm")
Signature:      the one thing someone will remember (see §7 and the 3D/scroll playbooks)
```
Then find the direction in the business's own world — its materials, signage, tools, place:

| Trade | Direction seeds (pick, don't stack) |
|---|---|
| Old-school barber | sign-painting, enamel, chrome, strong condensed type |
| Dentist / clinic | calm, daylight, generous whitespace, soft neutral + one clinical accent |
| Specialty coffee | origin maps, paper bag kraft, roast-curve data, close-up texture |
| Fine dining | darkness and plates, slow reveals, menu typography, the room |
| Builder / architect | drawings, section cuts, measured grids, raw materials, assembling model |
| Gym / boxing | industrial, high contrast, motion blur, chalk, schedule front and centre |
| Florist / bakery | real produce, seasonal colour from the product, handwritten moments |
| Law / accounting | restraint, serif authority, clear fees, faces of the partners |
| Product brand | the object itself — exploded view, turntable, macro material shots |

## 3. Typography

- One expressive family used with range, **or** a display + text pair that clearly contrast.
- Avoid Inter / Roboto / Arial / Poppins / Montserrat as the *choice* (fine as a fallback).
- Fluid scale with `clamp()`, ratio ~1.25–1.333; `text-wrap: balance` on headings,
  `pretty` on paragraphs; body 60–75ch; headings tight (0.95–1.1 line-height, slight negative
  tracking at display sizes).
- Max 2 families, 3–4 files; self-host or Google Fonts with `display=swap`; preload the hero weight.

Free pairings that work (check each licence):
| Feel | Display | Text |
|---|---|---|
| Warm editorial | Fraunces | Instrument Sans |
| Refined / studio | Instrument Serif | Geist |
| Friendly local | Bricolage Grotesque | Figtree |
| Luxury / salon / hotel | Cormorant Garamond | Manrope |
| Bold studio | Clash Display / Cabinet Grotesk (Fontshare) | General Sans / Satoshi |
| Restaurant | DM Serif Display | DM Sans |
| Trades / industrial | Archivo Black / Archivo Expanded | Archivo |
| Technical / product | Space Grotesk (overused — use with care) | IBM Plex Sans |
| Creative | Syne | Work Sans |
| Classic (borderline cliché) | Playfair Display | Source Sans 3 |
Typewolf.com shows pairings on real sites — better than any list.

## 4. Colour

- Take it from the business: logo, storefront, uniform, product, photos. Eyedrop, then tune.
- One ground, one ink, one accent (≤10% of surface). Tint the neutrals toward the brand hue
  (write in OKLCH); avoid pure #000/#fff greys.
- No purple gradients unless the brand is purple. Large gradient washes = tell.
- WCAG AA: 4.5:1 body, 3:1 large text/UI. Put a scrim under text over video/3D.
- Write 4–6 named tokens before building (e.g. `--ink: Espresso`, `--ground: Steamed milk`).

## 5. Layout

- Vary rhythm: a full-bleed moment, a tight text column, a dense list, a big number.
- Replace the 3-card row with: a priced list, a large image with captions, a horizontal
  scroller, a split screen, an oversized stat with prose, a before/after slider.
- At most one card treatment per page. Asymmetry and overlap where they're earned.
- Mobile is designed, not shrunk: sticky call/book bar, shorter pins, thumb-reach CTAs.

## 6. Imagery & icons

- Real photos of the client first (their site, Google Business Profile, Instagram — ask
  before going live). Graded consistently.
- Stock only if distinctive; never present stock or AI images as the client's staff/premises.
  AI imagery is fine for textures, abstract backgrounds, product renders, hero video.
- Icons: one set, one stroke weight, or none. Never emoji.

## 7. Motion

- **One signature moment** (the scroll-scrub hero, a 3D object, a hero type reveal) +
  quiet micro-feedback (150–300 ms) everywhere else. Not a fade-up on every section.
- Easing: ease-out expo/quint (`cubic-bezier(0.16,1,0.3,1)` / `(0.22,1,0.36,1)`), never bounce.
- Animate `transform` and `opacity` only. Respect `prefers-reduced-motion` (show end states).
- Motion should *mean* something: the house assembles because they build houses.

## 8. Copy (local business)

- Headline = outcome + place + specificity: "Same-day boiler repair across Leeds", not
  "Elevate your heating experience".
- Specifics everywhere: years trading, suburbs served, licence numbers, "from £45",
  hours, the owner's name and face.
- Real reviews only — quote with name, stars, source link. Never invent stats or testimonials;
  unknowns stay `{{…}}` and go on the questions list for the user.
- CTA verbs say what happens: "Book a table", "Get a quote in 24h", "Call Mo".
- Banned: unlock, elevate, seamless, revolutionize, cutting-edge, empower, leverage, journey,
  game-changer, world-class, "in today's fast-paced world", delve, tapestry.

## 9. Plan → review → build → subtract

1. **Plan** in `BUILD_NOTES.md`: brief (§2), named colour tokens, type roles, an ASCII
   wireframe of each section, the signature moment, and 3 principles that make it distinctive.
2. **Review the plan** against §1: for every choice that reads as a default, write why it's
   right *for this business* or change it.
3. **Build** tokens first, then sections, then motion last.
4. **Look**: `scripts/shoot.mjs` at 390 / 1366 / 1920, read the PNGs, run `scripts/slop_check.py`.
5. **Subtract**: remove one decorative element before you call it done.

## 10. What owners still call slop (lessons from real reviews)

A site can pass every rule above and still get "this is AI slop" from the owner. From the
RBLX Animates review (v1 rejected, v2 accepted):

- **"On brand" isn't a licence to flood the page.** v1 used the channel's purple everywhere
  because the banner was purple. It read as generic. v2 used a near-black ground, warm white
  text and ONE accent; the brand colour survived only as light inside the 3D scene. Brand
  colours belong in light, logos and one accent, not on every surface.
- **Chunky "friendly" fonts read cheap.** Rubik + Figtree looked like a template. A refined
  display face (Clash Display) + a quiet text face (Satoshi), both free on Fontshare, read premium.
- **Weak closers and flat colour blocks.** "Don't miss the next one" over two flat coloured
  slabs was called out by name. Close with a line only this business could say, and give the
  final buttons real platform logos, a fill that sweeps in on hover, and a magnetic pull.
- **Use the real brand assets.** The owner wanted their actual profile picture in the logo,
  real platform logos on the follow buttons, and real numbers. Ask for or pull them first.
- **A hover preview that follows the cursor felt cheap.** A 3D ring of episode cards that turns
  with scroll felt premium. Interaction should feel like an object, not a tooltip.
- **3D only in the hero felt like a gimmick.** Owners who ask for a "3D website" expect the 3D
  to carry through the page (see `3d-playbook.md` §6).
- **The credit link matters to the builder.** "Site by …" should go where the builder wants
  leads (email), not to a code profile.

For creator / channel sites specifically: one section per platform (each with its own clip,
numbers and logo button), plus a separate **Results** section built from the owner's dashboard
screenshots (views, growth, followers, and a "most viewed" post card for each platform). Date
the numbers; never invent them.

## 11. Anatomy of a premium footer

The footer is the last thing a prospect sees and the most-criticised part of v1. Build it as:
1. Brand block: logo or avatar, name, one-line tagline.
2. Two or three link columns (Watch/Visit, Explore, Work with us), with platform logos inline.
3. Contact as buttons: email, plus a direct-message link if the business lives on social.
4. An oversized wordmark (outline or neon glow: white stroke + brand-colour `drop-shadow`,
   which keeps letters hollow, unlike `text-shadow`), with a slow light sweep that stops under
   reduced motion.
5. A bottom row: ©, one line that looks forward ("the best stories haven't been told yet"),
   and the builder credit. Keep any required legal line (e.g. a trademark non-affiliation
   notice) unless the owner explicitly says to drop it, and tell them the risk if they do.

## 12. Buttons, hover and scroll (studied from the Promptbase demos)

Measured on 8 of the 40 Promptbase 3D demos (Daimyo Games, Kai Moreno, Velocity, Blotter,
Gallop, Nudge, Pulp Parade, Lanternhare), after an owner said the hovers "aren't responding":

- **Speed is the whole feel.** Every reference reacts in 0.12–0.25 s on
  `cubic-bezier(.2,.8,.2,1)`. A 0.5 s fill wipe or a magnetic drift that follows the
  cursor reads as lag. No reference uses magnetic buttons.
- **Tactile bricks.** A solid fill plus a hard offset edge shadow (`0 5px 0 <darker>`), which
  lifts 2 px on hover and presses into the edge on `:active` (0.06 s). Nudge uses `steps()`
  timing for a pixel-game snap, perfect for blocky and Roblox brands.
- **Swap colour, don't wipe.** Fill or invert in ~0.18 s; gradients fade in via `::before`
  opacity.
- **A cursor ring** that grows over anything clickable and squeezes on press (fine pointers
  only; keep the native cursor). Most of the premium references have one.
- **Never let a scroll-in animation fight hover.** `gsap.from()` leaves an inline transform
  that overrides `:hover` transforms. Use `clearProps: "transform,opacity"` on entrances.
- **Wrap hover styles in `@media (hover: hover)`** so taps on phones don't leave buttons stuck
  in their hover state.
- **No native scrollbars, on any site, unless the owner asks for one.** The starter ships
  `blockbar.js`: a 3D block-tower section navigator on desktop (current section's cube lights
  up and rotates, counter "02 / 07 Stories", click to jump) and a segmented progress bar on
  phones. Give important sections `data-bb-label`, and theme it with `--bb-*` variables.
  Daimyo's "PLATE 01 / 04" counter is the reference for the idea.
- Test hover like a user does: hover, wiggle the pointer, press. `scripts/shoot.mjs` won't
  catch a slow or fighting hover; the hover probe in the RBLX Animates build log will.
