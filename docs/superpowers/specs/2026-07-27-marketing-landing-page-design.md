# PraanLink Marketing Landing Page

**Date:** 2026-07-27
**Status:** Approved, ready for implementation planning
**Context:** PraanLink currently has no marketing/landing page — the frontend
boots straight into the product demo (Check-In screen, inside a decorative
`PhoneFrame`) at `/`. This adds a premium, animated marketing landing page as
the new root route, moving the existing product demo to `/app`. Frontend
visual/content work only — no backend, API, database, or AI-pipeline changes.

## Goal

Build a landing page that sells PraanLink to the person who would actually
use it — a proactive, empathetic health companion — using established product
marketing frameworks (StoryBrand-style narrative, Jobs-to-be-Done feature
framing, AIDA page flow), with a premium, animated, "3D-feeling" visual
treatment that stays visually consistent with the existing in-app "Calm
Clinical" design system.

## Non-goals / explicit exclusions

- No backend/API/database/AI-pipeline changes.
- No mention of underlying technology (Gemini, ADK, RAG, OCR, "AI agents",
  "AI pipeline") anywhere on the page — everything is framed as user outcomes,
  not implementation.
- No fabricated statistics, testimonials, or social proof — no real data
  exists yet, so none is invented.
- No hackathon/award badge — page stays 100% product-focused.
- No new npm dependencies — built entirely from libraries already installed
  (Framer Motion, Tailwind, `lucide-react`, `@fontsource/plus-jakarta-sans`).
- Does not touch any existing app page's data-fetching, handlers, or API
  calls — the product demo moves to a new path but is otherwise unchanged.

## Architecture & routing

- New root route `/` renders `Landing` (`src/pages/Landing.tsx`), full-width,
  outside `PhoneFrame` — the landing page is a normal scrolling web page, not
  a mobile-device mockup.
- The existing product demo (currently mounted at `/`, wrapped in
  `PhoneFrame`) moves to `/app/*`: `/app` (Check-In), `/app/upload`,
  `/app/summaries`, `/app/appointments`, `/app/insurance`, plus
  `/app/agent-call` for the existing separate `AgentCall` route. All existing
  sub-routes, components, data-fetching, and handlers are unchanged — only the
  path prefix changes.
- `NotFound` continues to catch `*`.
- Landing page composed from new, single-purpose components under
  `src/components/landing/`: `Hero.tsx`, `ProblemSection.tsx`,
  `SolutionSection.tsx`, `FeaturesSection.tsx`, `WorkflowSection.tsx`,
  `CtaSection.tsx`, `LandingFooter.tsx`. No shared internal state between
  them beyond scroll-triggered reveal animations (each section observes its
  own viewport entry).
- All CTAs on the landing page link to `/app` (the live demo). This is the
  only functional integration point with the rest of the app.

## Content strategy — messaging framework

- **StoryBrand-style narrative:** the visitor is the hero with a problem;
  PraanLink is the empathetic guide with a plan. Matches the project's own
  tagline ("Empathy meets intelligence — your proactive health steward").
- **Jobs-to-be-Done framing** for each of the 5 real features — lead with the
  outcome/benefit, not the mechanism.
- **AIDA page flow** (Attention → Interest → Desire → Action) across the
  overall section order.
- **No tech talk** — every feature is described by what it does *for the
  user*, never by what technology powers it.
- **Problem statements** are the real problems from the README (delay/
  complexity/language barriers to care, fragmented health data, no continuous
  record, missed early warning signs, insurance confusion), phrased as
  relatable feelings/situations — no invented statistics.
- **Feature reframing** (benefit-first headline + one-line outcome, exact
  copy to be finalized during implementation):
  - Weekly check-ins → a check-in that feels like being listened to, not
    interrogated.
  - Document upload → upload once, understand everything.
  - Health reports → your whole health story, in one place.
  - Doctor escalation → the homework is done before you even see a doctor.
  - Insurance guidance → insurance that finally makes sense.
- **Workflow section** is recast as the user's journey (Check in → We notice
  patterns → You get clarity → We connect you to care) — 4 human steps, not
  the underlying 7-stage technical report pipeline.
- **CTA:** one consistent action throughout ("Try PraanLink"), no competing
  asks.

## Visual system

**Palette** — extends (does not replace) the existing Calm Clinical design
tokens in `index.css`, so the marketing page and the in-app product feel like
one brand:
- Light sections (Hero, Problem, Solution, Features, CTA, Footer): existing
  warm off-white background (`hsl(40 22% 97%)`), deep teal primary
  (`hsl(163 84% 32%)`), teal secondary (`hsl(174 45% 50%)`), coral accent
  (`hsl(16 90% 65%)`) used sparingly for CTAs/highlighted words.
- Dark section (Workflow only): new deep teal-black background
  (`hsl(160 30% 6%)`), glassmorphic cards (translucent dark surface +
  backdrop-blur + soft teal border glow), warm off-white text, teal/coral
  glow accents on the connecting path and step markers. New CSS variables
  added to `index.css` following the existing HSL-token convention (e.g.
  `--landing-dark-bg`, `--landing-glow-primary`, `--landing-glow-accent`).

**Typography** — no new font: continues using **Plus Jakarta Sans** (already
installed via `@fontsource/plus-jakarta-sans`), at a larger display type
scale suited to a full browser canvas (~64/48/36/24/18/16px) vs. the app's
mobile type scale.

**Motion & "3D" treatment — no new runtime dependencies:**
- Framer Motion (already installed) drives scroll-triggered, staggered
  fade+slide section reveals and hover/tap micro-interactions, consistent
  with the app's existing motion language.
- Pure CSS: slow-drifting blurred gradient "orbs" in the background (Hero +
  Workflow section) for ambient depth.
- CSS 3D (`perspective` + `rotateX`/`rotateY`) mouse-parallax tilt on the
  Hero's floating app-mockup collage and on Feature/Workflow cards on hover.
- Animated SVG stroke-draw for the connecting path between the 4 workflow
  steps, triggered on scroll.
- Everything respects `prefers-reduced-motion` (motion is enhancement only;
  content is fully readable with motion disabled).

## Page sections

1. **Hero** (light) — Headline + one-sentence subhead + primary CTA ("Try
   PraanLink") + secondary in-page link ("See how it works" → smooth-scrolls
   to Workflow). Floating, tilted collage: the existing `PhoneFrame` visual
   language showing a real app screen, plus 2–3 small floating glass "chip"
   cards at different depths, drifting gently, tilting toward the cursor.

2. **Problem** (light) — Short empathetic intro line, then the 5 real pains
   from the README as compact, icon-led statements phrased as feelings, not
   statistics.

3. **Solution** (light) — One-line positioning statement establishing
   PraanLink as the guide, then 3 numbered steps (Notice → Understand → Act)
   previewing the Workflow section, each with a one-line description.

4. **Features** (light) — Responsive grid (1 col mobile → 2–3 col desktop) of
   5 cards (Check-ins, Document upload, Health reports, Doctor escalation,
   Insurance guidance), each with a `lucide-react` icon, JTBD benefit
   headline, one supporting sentence, and hover tilt + shadow lift.

5. **Workflow — dark spectacle section** (dark) — Headline "How it feels,
   step by step." The 4 human-journey steps laid out along an animated
   glowing SVG path; each step is a glassmorphic floating card revealed on
   scroll as the connecting line draws itself. This is the page's visual
   centerpiece.

6. **Final CTA** (light) — Large closing statement + single CTA button ("Try
   PraanLink" → `/app`), no secondary competing action.

7. **Footer** (light) — praanLink wordmark/tagline ("Empathy meets
   intelligence.") and anchor links back to on-page sections only — no
   fabricated social/external links.

## Verification plan

1. `npm run build` completes with no TypeScript/build errors.
2. Manual click-through in the dev server: every CTA/anchor link works;
   `/app` resolves to the existing product demo with `PhoneFrame` intact; all
   5 existing app sub-routes function exactly as before the path-prefix
   change (no accidental regressions).
3. Responsive check at mobile/tablet/desktop breakpoints — hero collage,
   feature grid, and workflow path degrade gracefully; 3D tilt is a
   hover/mouse enhancement, never required for touch/mobile use.
4. `prefers-reduced-motion` check — animations pause/simplify, all content
   remains fully readable and navigable.
5. Visual QA of the light → dark → light section transitions for intentional,
   non-jarring feel.

## Git / delivery

- Work happens directly on `main` in this repo.
- Commits pushed to the `fork` remote (`anmolsureka-unloq/PraanLink-DD`),
  including the 15 pre-existing unpushed commits already on `main`.
- `origin` (`itsArnavPrasad/PraanLink`) is not touched by this work.

## Open items for the implementation plan

None — every section above was approved individually by the user. The
implementation plan should sequence work roughly as: design tokens (dark
section CSS variables, display type scale) → routing change (`/app` move) →
`Landing.tsx` shell → Hero → Problem → Solution → Features → Workflow (dark
spectacle) → final CTA → Footer → verification pass → commit/push.
