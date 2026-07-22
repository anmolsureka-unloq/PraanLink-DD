# PraanLink Mobile-First Frontend Redesign

**Date:** 2026-07-23
**Status:** Approved, ready for implementation planning
**Context:** Converting the existing desktop-dashboard prototype into a mobile-first
app presentation for a product management competition. Frontend visual/layout
work only — no backend, API, database, or AI-pipeline changes.

## Goal

Replace the current fixed-sidebar desktop dashboard layout with a single
mobile-first app layout (bottom tab bar navigation), visually presented inside
a decorative phone-frame mockup when viewed on a desktop browser, while
preserving 100% of existing functionality, routes, API calls, and data flow.

## Non-goals / explicit exclusions

- No backend changes: no router, endpoint, schema, or AI-pipeline agent logic changes.
- No changes to any `fetch()` call, handler function, prop, or state logic — this is markup/className/layout-structure and design-token work only.
- No dark mode. Single, fully-polished light "Calm Clinical" theme.
- No new desktop dashboard variant kept alongside the mobile layout — the mobile layout is the only layout going forward.
- No new icon library — keep `lucide-react`.

## Chosen visual direction: "Calm Clinical"

A refined, premium execution of the existing teal/emerald healthcare palette
(warm, trustworthy, medical — not a rebrand to a different color family).
Selected via a 3-way visual mockup comparison (Calm Clinical vs. Vibrant
Companion vs. Minimal Premium); Calm Clinical was chosen because it best fits
the existing brand identity while allowing significant polish.

## Architecture

**One responsive mobile-first layout, wrapped in a CSS-only decorative phone frame.**

- `PhoneFrame` (new component, wraps the app in `App.tsx`): pure CSS/pseudo-element
  bezel, notch/status-bar strip, and home-indicator bar, centered on a soft
  ambient gradient backdrop. Device silhouette is a generic modern-smartphone
  shape (not a literal trademarked device outline) at roughly 390px wide ×
  844px tall — comparable to a standard modern phone viewport. Visible only
  above a ~640px browser viewport width (desktop/laptop browsers, e.g. during
  a live judging demo). Below that breakpoint (a real phone), all decorative
  chrome collapses to nothing and the app fills `100dvh`/`100vw` edge-to-edge
  natively.
- No JavaScript device detection or resize listeners — the frame's presence is
  driven entirely by a CSS media query, avoiding hydration/flash edge cases.

Approaches considered and rejected:
- *JS-based device detection* — same visual outcome as the CSS approach, more
  moving parts (resize listeners, hydration edge cases), no added benefit.
- *Keep the existing desktop sidebar dashboard alongside a new mobile layout*,
  switching at a breakpoint — doubles the UI surface to build and QA, and
  contradicts the explicit ask to replace the desktop screen rather than keep
  both.

## Layout shell & navigation

- `MobileLayout` (replaces `Layout.tsx`): three-zone vertical flex —
  1. Slim top app bar (small logo mark + current screen title) replacing the
     current large sidebar header.
  2. Scrollable content area rendering `<Outlet/>` (routing unchanged).
  3. Fixed bottom tab bar: 5 icons + micro-labels, same 5 destinations/routes
     as today's sidebar (Check-In, Upload, Summaries, Appointments, Insurance),
     same order. Active tab shown with a filled icon plus a small sliding
     indicator pill (framer-motion `layoutId` transition). Bottom bar respects
     `env(safe-area-inset-bottom)` for real-device safe areas.
- `AgentCall` remains a separate full-screen "pushed" route outside the tab bar
  (already architected this way — not a tab destination), restyled with a
  proper top-left back chevron (replacing the current desktop-style "Cancel"
  button) and mobile-sized call controls.
- React Router's route table and every page component's props/data-fetching
  are unchanged — this section is purely the shell/chrome around `<Outlet/>`.

## Visual system

- **Typography:** "Plus Jakarta Sans" (Google Fonts) as the single font family
  across the app, weights 400/500/600/700. Defined type scale (~28/22/17/15/13px
  with fixed line-heights) applied consistently, replacing today's ad hoc
  `text-lg`/`text-sm` usage scattered per-page.
- **Color:** Deepen the existing teal/emerald primary (e.g. `hsl(163 84% 32%)`)
  for richer contrast; warm-tinted off-white background instead of stark
  white. Formalize status colors (mood/severity/risk, currently inline
  Tailwind utility classes like `text-green-500` in `Summaries.tsx`) into
  semantic tokens (`success`/`warning`/`critical`) used consistently across
  all screens.
- **Icons:** Keep `lucide-react`. Standardize sizes by context: 22–24px in the
  bottom nav, 16–18px inline in cards/lists, 28–32px for feature moments (mic
  button, empty states) — replacing today's inconsistent ad hoc sizes
  (h-4 through h-16 with no clear rule).
- **Shape/shadow/motion:** Slightly larger corner radius (~1.1rem) for a
  friendlier app feel; refined/softened layered shadows (already tokenized);
  consistent framer-motion patterns — fade+slide on screen entry, sliding pill
  under the active bottom-tab, subtle scale-down on button tap, staggered card
  entry on list screens (Summaries).

## Page-by-page treatment

All pages keep their existing data-fetching, handlers, and API calls; only
layout/markup/styling changes.

- **Check-In** (`/`): greeting app bar, mic CTA card, "this week" tip card —
  replaces the current centered desktop `max-w-3xl` block layout with
  mobile-width cards.
- **Upload**: tap-to-pick unchanged; the prescription-vs-lab-report
  classification dialog becomes a bottom sheet using **Vaul** (drawer library,
  already installed and currently unused) instead of a centered desktop modal.
- **Summaries**: same tabs (Check-ins / Prescriptions / Lab Reports), restyled
  as compact mobile cards using the new semantic status-color tokens; report
  generation button and PDF link restyled for mobile width.
- **Appointments**: hospital list as mobile cards; the desktop half-screen map
  block collapses to a small "View map" affordance (same mock data).
- **Insurance**: same live-agent flow and same 3 plan cards, restyled for
  mobile width.
- **AgentCall**: restyled per the nav section above.
- **NotFound**: restyled to match the new system.

## Verification plan

1. `npm run build` completes cleanly (no TypeScript/build errors).
2. Manual click-through, in the dev server under a narrow (mobile-width)
   viewport, of every nav tab and every button/link on every page, confirming
   each still fires its existing handler/navigation — nothing silently
   detached during the markup restructuring.
3. Resize check: the phone frame appears correctly above the ~640px
   breakpoint and disappears/fills edge-to-edge below it.

## Open items for the implementation plan

None — design fully approved section-by-section by the user. The
implementation plan should sequence work roughly as: design tokens/fonts →
`PhoneFrame` + `MobileLayout` shell → bottom nav → per-page restyle (in the
order listed above) → `AgentCall` restyle → verification pass.
