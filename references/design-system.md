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
