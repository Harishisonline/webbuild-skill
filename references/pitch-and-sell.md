# Pitch & sell

Read this when the site is a spec build for a prospect, or the user asks how to price,
pitch, or deliver. Figures are creators' own claims from 2026 videos (several sponsored);
treat them as ranges, not promises.

## Who to target
Local, visual, owner-run businesses whose current site is dated but whose product is good:
restaurants & cafés, barbers & salons, dentists & clinics, gyms & studios, builders &
architects, realtors, detailers, boutique product brands. Skip SaaS, e-commerce with
checkout, anything needing logins/CMS — say so up front ("no CMS, blog, checkout or login").

Find them: Google Maps by category + town; Instagram accounts with 500–5,000 followers linking
an old site; Shopify/Amazon/Kickstarter sellers for product brands.

## Do the work first (spec homepage)
1. Pull their real brand: logo, colours, photos, menu/services, hours, reviews (from their
   site, Google Business profile, Instagram). Never invent reviews, prices or awards — mark
   unknowns `{{…}}` and ask.
2. Build the homepage with this skill (an afternoon, not a month).
3. Deploy to a free preview URL (Vercel / Netlify / GitHub Pages). Add `noindex` until sold
   so you don't compete with their real site in Google.
4. Record a 30–60 s before/after (old site, then new, scrolling on a phone).

## Outreach scripts (personalise the first line every time)
- **DM**: "Hi {{name}} — I rebuilt your homepage with a scroll animation of {{their product}}.
  Took an afternoon. 40-second video: {{link}}. If you like it, it's yours — I'd just ask for a
  testimonial. If you want the rest of the site, happy to talk."
- **Email (3 sentences + screenshot)**: subject "{{Business}} homepage — rebuilt". Body:
  what you did, the link, the low-friction ask. Include your address and an opt-out line
  (CAN-SPAM / local equivalent). Personalised emails reportedly get ~10× the replies of generic.
- Volume matters more than polish: "Will you actually send the 20 messages?"

## Pricing anchors (reported)
- Single landing page with scroll animation: $1.5K–5K. Multi-page: $5K–10K.
  Real-time Three.js agency work is quoted $5K–15K over 3–8 weeks — that's your anchor.
- Recurring: hosting + updates + small edits $50–300/month. This is where the business is.
- Lower-ticket reality check: one outreach campaign → 200 emails, 16 replies, 5 clients,
  ~$1.3K billed. Start cheaper for testimonials, raise prices with each case study.

## What makes a demo pitch-ready (checklist)
- Their real name, logo, photos, offer, prices or ranges, hours, address, phone.
- One obvious action above the fold (book / call / order / get a quote), repeated at the end.
- Proof: real Google rating + count, real quotes with names, real numbers.
- Loads fast on a phone over 4G (LCP < 2.5 s), no horizontal scroll, readable at 390px.
- Title, description, OG image (the link preview *is* your pitch in a DM), LocalBusiness
  JSON-LD, favicon.
- `scripts/slop_check.py` shows 0 FAIL, screenshots reviewed at 3 widths.

## Handover
Transfer the repo + hosting to their account (or yours with a maintenance contract), point
their domain, remove `noindex`, submit sitemap in Google Search Console, keep the small
"site by" credit only with their permission.
