# PraanLink Mobile-First Frontend Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the desktop-sidebar dashboard layout with a single mobile-first app layout (bottom tab bar), presented inside a decorative CSS-only phone frame on desktop browsers, executed in a refined "Calm Clinical" visual system — with zero changes to backend, API calls, routing, or component logic.

**Architecture:** One responsive `MobileLayout` (rewritten `Layout.tsx` + new `BottomNav.tsx`) replaces the sidebar shell. A new `PhoneFrame` component wraps the router output and shows decorative bezel/notch/home-indicator only above a 640px viewport width via CSS media query — no JS device detection. All 7 existing page components get their JSX/className restyled in place; every state variable, handler, effect, and API call is untouched.

**Tech Stack:** React 18 + TypeScript + Vite, Tailwind CSS + shadcn/ui (Radix primitives), framer-motion (already installed), vaul/Drawer (already installed, currently unused), lucide-react. New dependency: `@fontsource/plus-jakarta-sans`.

**Spec:** `docs/superpowers/specs/2026-07-23-mobile-first-frontend-redesign-design.md`

## Global Constraints

- No backend, API endpoint, database, or ai-pipeline changes anywhere in this plan.
- No prop, state, handler, effect, or `fetch()` call signature changes in any page — restyle JSX/className only.
- No dark mode — single light "Calm Clinical" theme; do not touch the existing unused `.dark` CSS block or `next-themes` dependency (out of scope, pre-existing, unrelated).
- No new icon library — `lucide-react` only.
- Icon-size convention used by every task below: bottom-nav icons = `h-6 w-6` (24px); inline icons in cards/lists = `h-4 w-4` (16px) unless the original already used `h-5 w-5` (20px) for a card/section header icon, in which case keep `h-5 w-5`; feature/hero icons (mic button, empty states) = `h-8 w-8` (32px).
- Phone frame breakpoint: decorative chrome visible at `min-width: 640px`; device silhouette ~390px wide × 844px tall, generic modern-smartphone shape (not a trademarked device outline).
- All work happens in `PraanLink/frontend/`. Verify every task with `npm run build` (no test framework exists in this project — introducing one is out of scope for a visual redesign; verification is build-clean + a concrete manual click-through, per the spec's own verification plan).

---

### Task 1: Design tokens, typography, and semantic color system

**Files:**
- Modify: `frontend/package.json` (new dependency, via `npm install`)
- Modify: `frontend/src/main.tsx`
- Modify: `frontend/tailwind.config.ts`
- Modify: `frontend/src/index.css`

**Interfaces:**
- Produces: Tailwind utility classes used by every later task — `text-display`, `text-title`, `text-subtitle`, `text-body`, `text-caption` (font sizes); `bg-success`/`text-success`, `bg-warning`/`text-warning`, `bg-critical`/`text-critical` (+ `-foreground` variants) for semantic status colors; the global `--radius` (now 1.1rem) and deepened `--primary`/warmed `--background` CSS vars, which cascade automatically into every existing shadcn component (`Card`, `Button`, `Badge`, etc.) with no per-component changes required.

- [ ] **Step 1: Install the font package**

Run: `cd frontend && npm install @fontsource/plus-jakarta-sans`
Expected: `package.json` gains `"@fontsource/plus-jakarta-sans": "^5.3.0"` (or newer) under `dependencies`.

- [ ] **Step 2: Import the font in the app entrypoint**

In `frontend/src/main.tsx`, replace the full file with:

```tsx
import { createRoot } from "react-dom/client";
import "@fontsource/plus-jakarta-sans/400.css";
import "@fontsource/plus-jakarta-sans/500.css";
import "@fontsource/plus-jakarta-sans/600.css";
import "@fontsource/plus-jakarta-sans/700.css";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
```

- [ ] **Step 3: Extend the Tailwind theme**

In `frontend/tailwind.config.ts`, find:

```ts
    extend: {
      colors: {
```

Replace with (adds `fontFamily`, `fontSize` scale, and the `success`/`warning`/`critical` color tokens right before the existing `colors` block):

```ts
    extend: {
      fontFamily: {
        sans: ["'Plus Jakarta Sans'", "system-ui", "sans-serif"],
      },
      fontSize: {
        display: ["1.75rem", { lineHeight: "2.1rem", fontWeight: "700" }],
        title: ["1.375rem", { lineHeight: "1.75rem", fontWeight: "700" }],
        subtitle: ["1.0625rem", { lineHeight: "1.5rem", fontWeight: "600" }],
        body: ["0.9375rem", { lineHeight: "1.4rem", fontWeight: "400" }],
        caption: ["0.8125rem", { lineHeight: "1.15rem", fontWeight: "500" }],
      },
      colors: {
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        critical: {
          DEFAULT: "hsl(var(--critical))",
          foreground: "hsl(var(--critical-foreground))",
        },
```

(Leave every other key inside the original `colors: {` block — `border`, `input`, `ring`, `background`, `foreground`, `primary`, `secondary`, `destructive`, `muted`, `accent`, `popover`, `card`, `sidebar` — exactly as they are today; this step only inserts new keys before them.)

- [ ] **Step 4: Update design tokens in index.css**

In `frontend/src/index.css`, find the `:root` block's color/radius declarations:

```css
    --primary: 161 83% 37%;
    --primary-foreground: 0 0% 100%;
    --primary-light: 161 65% 85%;
    --primary-lighter: 161 60% 95%;
```

Replace with:

```css
    --primary: 163 84% 32%;
    --primary-foreground: 0 0% 100%;
    --primary-light: 163 65% 85%;
    --primary-lighter: 163 60% 95%;
```

Then find:

```css
    --background: 150 25% 98%;
    --foreground: 160 15% 15%;
```

Replace with:

```css
    --background: 40 22% 97%;
    --foreground: 160 15% 15%;
```

Then find:

```css
    --muted: 150 20% 96%;
    --muted-foreground: 160 10% 45%;
```

Replace with:

```css
    --muted: 40 16% 94%;
    --muted-foreground: 160 10% 45%;
```

Then find:

```css
    --border: 155 25% 88%;
    --input: 155 25% 92%;
    --ring: 161 83% 37%;

    --radius: 0.75rem;
```

Replace with:

```css
    --border: 35 18% 89%;
    --input: 35 18% 91%;
    --ring: 163 84% 32%;

    --radius: 1.1rem;

    --success: 152 60% 36%;
    --success-foreground: 0 0% 100%;
    --warning: 38 92% 50%;
    --warning-foreground: 0 0% 100%;
    --critical: 0 72% 51%;
    --critical-foreground: 0 0% 100%;
```

- [ ] **Step 5: Verify the build**

Run: `cd frontend && npm run build`
Expected: build completes cleanly (same output shape as the last verified build — `dist/index.html`, `dist/assets/*`), no TypeScript or Tailwind config errors.

- [ ] **Step 6: Manual visual check**

Run: `cd frontend && npm run dev`, open `http://localhost:8080`.
Expected: text now renders in Plus Jakarta Sans (visibly rounder than the previous system font), card corners are noticeably more rounded, no console errors. Existing pages still work exactly as before (this task only changes tokens, not any page markup).

- [ ] **Step 7: Commit**

```bash
git add frontend/package.json frontend/package-lock.json frontend/src/main.tsx frontend/tailwind.config.ts frontend/src/index.css
git commit -m "design: add Calm Clinical typography, color, and radius tokens"
```

---

### Task 2: PhoneFrame component

**Files:**
- Create: `frontend/src/components/PhoneFrame.tsx`
- Modify: `frontend/src/index.css`
- Modify: `frontend/src/App.tsx`

**Interfaces:**
- Consumes: nothing from other components.
- Produces: `PhoneFrame` — `({ children }: { children: ReactNode }) => JSX.Element`, a pure presentational wrapper used once in `App.tsx`.

- [ ] **Step 1: Create the PhoneFrame component**

Create `frontend/src/components/PhoneFrame.tsx`:

```tsx
import { ReactNode } from "react";

interface PhoneFrameProps {
  children: ReactNode;
}

export const PhoneFrame = ({ children }: PhoneFrameProps) => {
  return (
    <div className="phone-frame-backdrop">
      <div className="phone-frame-device">
        <div className="phone-frame-notch" />
        <div className="phone-frame-screen">{children}</div>
        <div className="phone-frame-home-indicator" />
      </div>
    </div>
  );
};
```

- [ ] **Step 2: Add the frame CSS**

In `frontend/src/index.css`, append this block at the end of the file (after the existing final `@layer base { ... }` block):

```css
@layer components {
  .phone-frame-backdrop {
    @apply flex min-h-screen w-full items-center justify-center;
    background:
      radial-gradient(circle at 25% 15%, hsl(163 60% 92%), transparent 55%),
      radial-gradient(circle at 85% 85%, hsl(174 45% 90%), transparent 50%),
      hsl(var(--background));
  }

  .phone-frame-device {
    position: relative;
    width: 100%;
    height: 100dvh;
  }

  .phone-frame-screen {
    @apply h-full w-full overflow-hidden bg-background;
  }

  .phone-frame-notch,
  .phone-frame-home-indicator {
    display: none;
  }

  @media (min-width: 640px) {
    .phone-frame-backdrop {
      @apply p-10;
    }

    .phone-frame-device {
      width: 390px;
      height: 844px;
      border-radius: 2.75rem;
      background: #0b0f0d;
      padding: 14px;
      box-shadow:
        0 30px 60px -15px rgba(15, 61, 45, 0.35),
        0 0 0 2px rgba(15, 61, 45, 0.08);
    }

    .phone-frame-screen {
      border-radius: 2.1rem;
    }

    .phone-frame-notch {
      display: block;
      position: absolute;
      top: 14px;
      left: 50%;
      transform: translateX(-50%);
      width: 120px;
      height: 26px;
      background: #0b0f0d;
      border-radius: 0 0 16px 16px;
      z-index: 20;
    }

    .phone-frame-home-indicator {
      display: block;
      position: absolute;
      bottom: 22px;
      left: 50%;
      transform: translateX(-50%);
      width: 120px;
      height: 4px;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.35);
      z-index: 20;
    }
  }
}
```

- [ ] **Step 3: Wire PhoneFrame into App.tsx**

In `frontend/src/App.tsx`, find:

```tsx
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import CheckIn from "./pages/CheckIn";
import Upload from "./pages/Upload";
import Summaries from "./pages/Summaries";
import Appointments from "./pages/Appointments";
import AgentCall from "./pages/AgentCall";
import Insurance from "./pages/Insurance";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<CheckIn />} />
            <Route path="upload" element={<Upload />} />
            <Route path="summaries" element={<Summaries />} />
            <Route path="appointments" element={<Appointments />} />
            <Route path="insurance" element={<Insurance />} />
          </Route>
          <Route path="agent-call" element={<AgentCall />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
```

Replace with:

```tsx
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { PhoneFrame } from "./components/PhoneFrame";
import CheckIn from "./pages/CheckIn";
import Upload from "./pages/Upload";
import Summaries from "./pages/Summaries";
import Appointments from "./pages/Appointments";
import AgentCall from "./pages/AgentCall";
import Insurance from "./pages/Insurance";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <PhoneFrame>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<CheckIn />} />
              <Route path="upload" element={<Upload />} />
              <Route path="summaries" element={<Summaries />} />
              <Route path="appointments" element={<Appointments />} />
              <Route path="insurance" element={<Insurance />} />
            </Route>
            <Route path="agent-call" element={<AgentCall />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </PhoneFrame>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
```

- [ ] **Step 4: Verify the build**

Run: `cd frontend && npm run build`
Expected: clean build, no errors.

- [ ] **Step 5: Manual resize check**

Run: `cd frontend && npm run dev`, open `http://localhost:8080` in a desktop browser window wider than 640px.
Expected: a dark rounded phone bezel with a notch at the top and a home-indicator bar at the bottom is visible, centered on a soft teal gradient backdrop, with the app rendering inside it.
Then narrow the browser window below 640px (or open the same URL on a real phone).
Expected: the bezel, notch, and home-indicator all disappear; the app fills the entire viewport edge-to-edge with no decorative chrome.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/components/PhoneFrame.tsx frontend/src/index.css frontend/src/App.tsx
git commit -m "feat: add decorative phone-frame wrapper for desktop viewing"
```

---

### Task 3: BottomNav + MobileLayout shell, global tap/transition motion (replaces Sidebar)

**Files:**
- Create: `frontend/src/components/BottomNav.tsx`
- Modify: `frontend/src/components/Layout.tsx`
- Modify: `frontend/src/components/ui/button.tsx`
- Delete: `frontend/src/components/Sidebar.tsx`

**Interfaces:**
- Produces: `navigation` — exported array `{ name: string; href: string; icon: LucideIcon }[]` from `BottomNav.tsx`, consumed by `Layout.tsx` to resolve the current screen's title.
- Produces: `BottomNav` — `() => JSX.Element`, renders the 5-item fixed bottom tab bar.
- Produces: `Layout` — `() => JSX.Element` (same export name/shape as before, so `App.tsx`'s existing `import { Layout } from "./components/Layout"` needs no change). Now also wraps `<Outlet/>` in a fade+slide route transition.
- Produces: every shadcn `Button` across the app now has a subtle tap-scale press animation (spec's "subtle scale-down on button tap") with zero call-site changes, since it's added to the shared `buttonVariants` base classes.

- [ ] **Step 1: Create BottomNav.tsx**

Create `frontend/src/components/BottomNav.tsx`:

```tsx
import { NavLink, useLocation } from "react-router-dom";
import { MessageSquare, Upload, FileText, Calendar, Shield } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const navigation = [
  { name: "Check-In", href: "/", icon: MessageSquare },
  { name: "Upload", href: "/upload", icon: Upload },
  { name: "Summaries", href: "/summaries", icon: FileText },
  { name: "Appointments", href: "/appointments", icon: Calendar },
  { name: "Insurance", href: "/insurance", icon: Shield },
];

export const BottomNav = () => {
  const location = useLocation();

  return (
    <nav
      className="flex flex-shrink-0 items-stretch justify-around border-t border-border bg-card/95 px-1 pt-2 backdrop-blur"
      style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}
    >
      {navigation.map((item) => {
        const isActive =
          item.href === "/" ? location.pathname === "/" : location.pathname.startsWith(item.href);

        return (
          <NavLink
            key={item.name}
            to={item.href}
            end={item.href === "/"}
            className="relative flex flex-1 flex-col items-center gap-1 py-1 text-caption"
          >
            {isActive && (
              <motion.div
                layoutId="bottom-nav-indicator"
                className="absolute -top-2 h-0.5 w-8 rounded-full bg-primary"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <item.icon
              className={cn("h-6 w-6 transition-smooth", isActive ? "text-primary" : "text-muted-foreground")}
              strokeWidth={isActive ? 2.4 : 1.8}
            />
            <span className={cn(isActive ? "font-semibold text-primary" : "text-muted-foreground")}>
              {item.name}
            </span>
          </NavLink>
        );
      })}
    </nav>
  );
};
```

- [ ] **Step 2: Rewrite Layout.tsx (with fade+slide route transitions)**

Replace the full contents of `frontend/src/components/Layout.tsx` with:

```tsx
import { Outlet, useLocation } from "react-router-dom";
import { Activity } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { BottomNav, navigation } from "./BottomNav";

export const Layout = () => {
  const location = useLocation();
  const current = navigation.find((item) =>
    item.href === "/" ? location.pathname === "/" : location.pathname.startsWith(item.href)
  );

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-background">
      <header className="flex h-14 flex-shrink-0 items-center gap-2 border-b border-border bg-card/80 px-4 backdrop-blur">
        <Activity className="h-5 w-5 text-primary" />
        <h1 className="text-subtitle text-foreground">{current?.name ?? "PraanLink"}</h1>
      </header>
      <main className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="h-full"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      <BottomNav />
    </div>
  );
};
```

- [ ] **Step 3: Add tap-scale feedback to the shared Button component**

In `frontend/src/components/ui/button.tsx`, find:

```tsx
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
```

Replace with:

```tsx
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors active:scale-[0.97] transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
```

(Almost every button in the app renders through this shared component, so this one change gives every existing button — across all 7 pages, including the shadcn-`Button`-based mic button in Insurance and the call button in AgentCall — the same consistent tap feedback with no per-page edits needed. The one exception is the raw, non-shadcn `<button>` mic element in Check-In, which gets the equivalent `active:scale-95` added directly in its own page task, Task 4, since it doesn't go through `Button`.)

- [ ] **Step 4: Delete the unused Sidebar component**

Run: `rm "frontend/src/components/Sidebar.tsx"`

- [ ] **Step 5: Confirm nothing else imports Sidebar**

Run: `cd frontend && grep -rn "components/Sidebar\|from \"./Sidebar\"" src/`
Expected: no output (no remaining references).

- [ ] **Step 6: Verify the build**

Run: `cd frontend && npm run build`
Expected: clean build, no errors, no warnings about a missing `Sidebar` module.

- [ ] **Step 7: Manual nav click-through**

Run: `cd frontend && npm run dev`, open `http://localhost:8080` with the browser narrowed below 640px (or devtools mobile emulation).
Expected: a bottom tab bar with 5 icons (Check-In, Upload, Summaries, Appointments, Insurance) is visible. Click/tap each one in turn:
- Check-In → URL becomes `/`, top app bar reads "Check-In", Check-In icon is filled/highlighted with the sliding indicator pill above it, and the content area fades/slides in briefly.
- Upload → URL becomes `/upload`, top app bar reads "Upload".
- Summaries → URL becomes `/summaries`, top app bar reads "Summaries".
- Appointments → URL becomes `/appointments`, top app bar reads "Appointments".
- Insurance → URL becomes `/insurance`, top app bar reads "Insurance".

Every tab switch must correctly update both the active icon styling and the app-bar title, with no console errors. Also click any shadcn `Button` (e.g. "Choose file" on Upload once you reach Task 5) and confirm it visibly compresses slightly on press.

- [ ] **Step 8: Commit**

```bash
git add frontend/src/components/BottomNav.tsx frontend/src/components/Layout.tsx frontend/src/components/ui/button.tsx
git rm frontend/src/components/Sidebar.tsx
git commit -m "feat: replace sidebar dashboard shell with mobile bottom-nav layout, add tap/transition motion"
```

---

### Task 4: Restyle CheckIn.tsx

**Files:**
- Modify: `frontend/src/pages/CheckIn.tsx`

**Interfaces:**
- Consumes: nothing new — reuses existing `Card` (`@/components/ui/card`), `cn` (`@/lib/utils`), `Mic`/`Square`/`Loader2` (`lucide-react`), `motion`/`AnimatePresence` (`framer-motion`), all already imported in this file. No new imports.
- Produces: nothing consumed elsewhere — this is a leaf route component.

**Do not touch** any code above the `return (` statement (state, `useEffect`s, `handleStartRecording`, `handleStopRecording`, `ensureAudioInitialized`, `playAudioChunk`, `formatTime`, the Gemini Live API wiring) — only the JSX below is replaced.

- [ ] **Step 1: Replace the returned JSX**

In `frontend/src/pages/CheckIn.tsx`, find the full `return ( ... )` block:

```tsx
  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-border bg-card px-8 py-6">
        <h1 className="text-3xl font-bold text-foreground">Daily Check-In</h1>
        <p className="mt-2 text-muted-foreground">
          Share how you're feeling today. Your voice matters.
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-8">
        <div className="mx-auto max-w-3xl space-y-6">
          {/* Recording Interface */}
          <Card className="p-8">
            <div className="flex flex-col items-center space-y-6">
              {/* Timer Display */}
              {isRecording && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center"
                >
                  <div className="text-4xl font-bold mb-2">{formatTime(elapsed)}</div>
                </motion.div>
              )}

              {/* Audio Visualizer */}
              <AnimatePresence>
                {isRecording && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex justify-center gap-1 mb-4 h-16 items-end"
                  >
                    {[...Array(15)].map((_, i) => (
                      <motion.div
                        key={i}
                        animate={{
                          height: [
                            "20%",
                            `${Math.random() * 80 + 20}%`,
                            "20%",
                          ],
                        }}
                        transition={{
                          repeat: Infinity,
                          duration: 0.8,
                          delay: i * 0.05,
                        }}
                        className="w-2 bg-gradient-to-t from-primary to-secondary rounded-full"
                      />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Mic Button */}
              <button
                onClick={isRecording ? handleStopRecording : handleStartRecording}
                disabled={isProcessing}
                className={cn(
                  "relative flex h-32 w-32 items-center justify-center rounded-full transition-all duration-300",
                  isRecording
                    ? "bg-destructive shadow-lg shadow-destructive/30 animate-pulse"
                    : "bg-primary shadow-md hover:shadow-lg hover:scale-105",
                  isProcessing && "opacity-50 cursor-not-allowed"
                )}
              >
                {isProcessing ? (
                  <Loader2 className="h-12 w-12 text-primary-foreground animate-spin" />
                ) : isRecording ? (
                  <Square className="h-12 w-12 text-destructive-foreground" />
                ) : (
                  <Mic className="h-12 w-12 text-primary-foreground" />
                )}
                
                {isRecording && (
                  <span className="absolute -bottom-2 -right-2 flex h-6 w-6">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive opacity-75"></span>
                    <span className="relative inline-flex h-6 w-6 rounded-full bg-destructive"></span>
                  </span>
                )}
              </button>

              <div className="text-center">
                <p className="text-lg font-medium text-foreground">
                  {isProcessing
                    ? "Processing your check-in..."
                    : isRecording
                    ? "Listening... Tap to stop"
                    : "Tap to start your check-in"}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {isRecording && "Talk naturally with your health assistant"}
                  {isAISpeaking && (
                    <motion.span
                      animate={{ opacity: [1, 0.5, 1] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                      className="block mt-2 text-primary font-medium"
                    >
                      Assistant is speaking...
                    </motion.span>
                  )}
                </p>
              </div>
            </div>
          </Card>

          {/* Tips Card */}
          {!isRecording && (
            <Card className="p-6 bg-muted/50">
              <h3 className="mb-3 text-lg font-semibold text-foreground">
                What We'll Talk About
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• How you've been feeling physically this week</li>
                <li>• Your sleep quality and energy levels</li>
                <li>• Any medications or treatments you're following</li>
                <li>• Your emotional wellbeing and stress levels</li>
                <li>• Any specific health concerns you'd like to discuss</li>
              </ul>
              <div className="mt-4 p-3 rounded-lg bg-primary/10">
                <p className="text-xs font-medium text-primary">
                  💡 Tip: Speak naturally and take your time. The assistant will ask follow-up questions and can search medical information and your past records to provide better support.
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
```

Replace with:

```tsx
  return (
    <div className="px-5 py-6">
      <div className="mx-auto max-w-md space-y-5">
        {/* Recording Interface */}
        <Card className="p-6 shadow-md">
          <div className="flex flex-col items-center space-y-5">
            {/* Timer Display */}
            {isRecording && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
                <div className="text-display text-foreground">{formatTime(elapsed)}</div>
              </motion.div>
            )}

            {/* Audio Visualizer */}
            <AnimatePresence>
              {isRecording && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex h-14 items-end justify-center gap-1"
                >
                  {[...Array(15)].map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{ height: ["20%", `${Math.random() * 80 + 20}%`, "20%"] }}
                      transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.05 }}
                      className="w-1.5 rounded-full bg-gradient-to-t from-primary to-secondary"
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Mic Button */}
            <button
              onClick={isRecording ? handleStopRecording : handleStartRecording}
              disabled={isProcessing}
              className={cn(
                "relative flex h-28 w-28 items-center justify-center rounded-full transition-smooth active:scale-95",
                isRecording
                  ? "bg-destructive shadow-lg shadow-destructive/30 animate-pulse"
                  : "bg-primary shadow-lg shadow-primary/25 hover:scale-105",
                isProcessing && "cursor-not-allowed opacity-50"
              )}
            >
              {isProcessing ? (
                <Loader2 className="h-8 w-8 animate-spin text-primary-foreground" />
              ) : isRecording ? (
                <Square className="h-8 w-8 text-destructive-foreground" />
              ) : (
                <Mic className="h-8 w-8 text-primary-foreground" />
              )}

              {isRecording && (
                <span className="absolute -bottom-1 -right-1 flex h-5 w-5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive opacity-75" />
                  <span className="relative inline-flex h-5 w-5 rounded-full bg-destructive" />
                </span>
              )}
            </button>

            <div className="text-center">
              <p className="text-subtitle text-foreground">
                {isProcessing
                  ? "Processing your check-in..."
                  : isRecording
                  ? "Listening... tap to stop"
                  : "Tap to start your check-in"}
              </p>
              <p className="mt-1 text-caption text-muted-foreground">
                {isRecording && "Talk naturally with your health assistant"}
                {isAISpeaking && (
                  <motion.span
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="mt-2 block font-medium text-primary"
                  >
                    Assistant is speaking...
                  </motion.span>
                )}
              </p>
            </div>
          </div>
        </Card>

        {/* Tips Card */}
        {!isRecording && (
          <Card className="p-5 bg-muted/50">
            <h3 className="mb-3 text-subtitle text-foreground">What we'll talk about</h3>
            <ul className="space-y-2 text-body text-muted-foreground">
              <li>• How you've been feeling physically this week</li>
              <li>• Your sleep quality and energy levels</li>
              <li>• Any medications or treatments you're following</li>
              <li>• Your emotional wellbeing and stress levels</li>
              <li>• Any specific health concerns you'd like to discuss</li>
            </ul>
            <div className="mt-4 rounded-xl bg-primary/10 p-3">
              <p className="text-caption font-medium text-primary">
                💡 Speak naturally and take your time. The assistant can search medical information and your past
                records to support you.
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify the build**

Run: `cd frontend && npm run build`
Expected: clean build.

- [ ] **Step 3: Manual functional check**

Run: `cd frontend && npm run dev`, open `http://localhost:8080` (narrow viewport), navigate to Check-In (`/`).
Expected: mic button, tip card render per the approved Calm Clinical mockup. Click the mic button — confirm the existing microphone-permission prompt / recording flow still starts exactly as before (same handler, only the button's visual style changed). Click again to stop — confirm the existing "Saving your check-in..." toast and upload flow still fire unchanged.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/pages/CheckIn.tsx
git commit -m "style: restyle Check-In screen for mobile Calm Clinical design"
```

---

### Task 5: Restyle Upload.tsx (Dialog → Drawer)

**Files:**
- Modify: `frontend/src/pages/Upload.tsx`

**Interfaces:**
- Consumes: `Drawer`, `DrawerContent`, `DrawerDescription`, `DrawerFooter`, `DrawerHeader`, `DrawerTitle` from `@/components/ui/drawer` (already exist, unused elsewhere — see `frontend/src/components/ui/drawer.tsx`).
- Produces: nothing consumed elsewhere.

**Do not touch** `handleDragOver`, `handleDragLeave`, `handleDrop`, `handleFileInput`, `handleFiles`, `handleClassification`, `removeFile`, `formatFileSize`, or any state — only imports and JSX change.

- [ ] **Step 1: Swap the Dialog import for Drawer**

In `frontend/src/pages/Upload.tsx`, find:

```tsx
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
```

Replace with:

```tsx
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
```

- [ ] **Step 2: Replace the returned JSX**

Find the full `return ( ... )` block:

```tsx
  return (
    <div className="flex h-screen flex-col">
      <Dialog open={showClassificationDialog} onOpenChange={setShowClassificationDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Classify Document</DialogTitle>
            <DialogDescription>
              Please select the type of document you're uploading
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 py-4">
            <Button
              className="w-full justify-start h-auto py-4"
              variant="outline"
              onClick={() => handleClassification("prescription")}
            >
              <div className="text-left">
                <div className="font-semibold">Prescription</div>
                <div className="text-sm text-muted-foreground">
                  Doctor's prescription with medications and dosage
                </div>
              </div>
            </Button>
            <Button
              className="w-full justify-start h-auto py-4"
              variant="outline"
              onClick={() => handleClassification("lab_report")}
            >
              <div className="text-left">
                <div className="font-semibold">Lab Report</div>
                <div className="text-sm text-muted-foreground">
                  Blood test, lipid profile, or other lab results
                </div>
              </div>
            </Button>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => {
              setShowClassificationDialog(false);
              setPendingFile(null);
            }}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="border-b border-border bg-card px-8 py-6">
        <h1 className="text-3xl font-bold text-foreground">Upload Reports</h1>
        <p className="mt-2 text-muted-foreground">
          Upload your lab reports, prescriptions, or medical documents
        </p>
      </div>

      <div className="flex-1 overflow-auto p-8">
        <div className="mx-auto max-w-4xl space-y-6">
          <Card
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
              "relative cursor-pointer border-2 border-dashed p-12 transition-all",
              isDragging
                ? "border-primary bg-primary/10"
                : "border-border hover:border-primary/50 hover:bg-muted/50",
              isProcessing && "opacity-50 pointer-events-none"
            )}
          >
            <input
              type="file"
              multiple={false}
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileInput}
              className="absolute inset-0 cursor-pointer opacity-0"
              disabled={isProcessing}
            />
            <div className="flex flex-col items-center text-center">
              <div className="rounded-full bg-primary/10 p-6">
                <Upload className="h-10 w-10 text-primary" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-foreground">
                {isProcessing ? "Processing..." : "Drop files here or click to upload"}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Supports PDF, JPG, PNG up to 10MB each
              </p>
              {!isProcessing && (
                <Button className="mt-6" variant="default">
                  Choose Files
                </Button>
              )}
            </div>
          </Card>

          {files.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">
                  Uploaded Files ({files.length})
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFiles([]);
                    toast.info("All files cleared");
                  }}
                >
                  Clear All
                </Button>
              </div>

              <div className="space-y-3">
                {files.map((file) => (
                  <Card
                    key={file.id}
                    className="p-4 transition-all hover:shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-primary/10 p-2">
                          <File className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            {file.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {formatFileSize(file.size)} • {file.type === "prescription" ? "Prescription" : "Lab Report"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(file.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {files.length === 0 && (
            <Card className="p-6 bg-muted/50">
              <h3 className="mb-3 text-lg font-semibold text-foreground">
                What can you upload?
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Blood test results and lab reports</li>
                <li>• X-rays, MRIs, and scan images</li>
                <li>• Prescriptions and medication lists</li>
                <li>• Doctor's notes and consultation summaries</li>
              </ul>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
```

Replace with:

```tsx
  return (
    <div className="px-5 py-6">
      <Drawer open={showClassificationDialog} onOpenChange={setShowClassificationDialog}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Classify document</DrawerTitle>
            <DrawerDescription>Please select the type of document you're uploading</DrawerDescription>
          </DrawerHeader>
          <div className="flex flex-col gap-3 px-4 pb-2">
            <Button
              className="h-auto w-full justify-start py-4"
              variant="outline"
              onClick={() => handleClassification("prescription")}
            >
              <div className="text-left">
                <div className="text-subtitle">Prescription</div>
                <div className="text-caption text-muted-foreground">
                  Doctor's prescription with medications and dosage
                </div>
              </div>
            </Button>
            <Button
              className="h-auto w-full justify-start py-4"
              variant="outline"
              onClick={() => handleClassification("lab_report")}
            >
              <div className="text-left">
                <div className="text-subtitle">Lab report</div>
                <div className="text-caption text-muted-foreground">
                  Blood test, lipid profile, or other lab results
                </div>
              </div>
            </Button>
          </div>
          <DrawerFooter>
            <Button
              variant="ghost"
              onClick={() => {
                setShowClassificationDialog(false);
                setPendingFile(null);
              }}
            >
              Cancel
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      <div className="space-y-5">
        <Card
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "relative cursor-pointer border-2 border-dashed p-8 transition-smooth",
            isDragging
              ? "border-primary bg-primary/10"
              : "border-border hover:border-primary/50 hover:bg-muted/50",
            isProcessing && "pointer-events-none opacity-50"
          )}
        >
          <input
            type="file"
            multiple={false}
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileInput}
            className="absolute inset-0 cursor-pointer opacity-0"
            disabled={isProcessing}
          />
          <div className="flex flex-col items-center text-center">
            <div className="rounded-full bg-primary/10 p-5">
              <Upload className="h-8 w-8 text-primary" />
            </div>
            <h3 className="mt-4 text-subtitle text-foreground">
              {isProcessing ? "Processing..." : "Drop a file or tap to upload"}
            </h3>
            <p className="mt-2 text-caption text-muted-foreground">Supports PDF, JPG, PNG up to 10MB</p>
            {!isProcessing && (
              <Button className="mt-5" variant="default">
                Choose file
              </Button>
            )}
          </div>
        </Card>

        {files.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-subtitle text-foreground">Uploaded ({files.length})</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setFiles([]);
                  toast.info("All files cleared");
                }}
              >
                Clear all
              </Button>
            </div>

            <div className="space-y-3">
              {files.map((file) => (
                <Card key={file.id} className="p-4 transition-smooth hover:shadow-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-primary/10 p-2">
                        <File className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-body font-medium text-foreground">{file.name}</p>
                        <p className="text-caption text-muted-foreground">
                          {formatFileSize(file.size)} •{" "}
                          {file.type === "prescription" ? "Prescription" : "Lab report"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                      <Button variant="ghost" size="sm" onClick={() => removeFile(file.id)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {files.length === 0 && (
          <Card className="p-5 bg-muted/50">
            <h3 className="mb-3 text-subtitle text-foreground">What can you upload?</h3>
            <ul className="space-y-2 text-body text-muted-foreground">
              <li>• Blood test results and lab reports</li>
              <li>• X-rays, MRIs, and scan images</li>
              <li>• Prescriptions and medication lists</li>
              <li>• Doctor's notes and consultation summaries</li>
            </ul>
          </Card>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Verify the build**

Run: `cd frontend && npm run build`
Expected: clean build.

- [ ] **Step 4: Manual functional check**

Navigate to Upload. Drop or pick a file — the classification bottom sheet should slide up from the bottom (Drawer, not a centered modal). Click "Prescription" — confirm the existing `handleClassification("prescription")` call still fires (check Network tab: `POST /upload-prescription`, or the equivalent existing endpoint). Repeat for "Lab report". Click "Cancel" — confirm the drawer closes and `pendingFile` resets exactly as before.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/pages/Upload.tsx
git commit -m "style: restyle Upload screen with mobile bottom-sheet classification"
```

---

### Task 6: Restyle Summaries.tsx + semantic status tokens + staggered card entry

**Files:**
- Modify: `frontend/src/pages/Summaries.tsx`

**Interfaces:**
- Consumes: `text-success`/`text-warning`/`text-critical`, `bg-critical`/`border-critical` (from Task 1); `motion` from `framer-motion` (new import for this file — every other page already imports it, this is the one page that didn't).
- Produces: nothing consumed elsewhere.

**Do not touch** `fetchLatestOverallReport`, `fetchAllData`, `handleGenerateOverallReport`, `formatDate`, `getMoodColor`, `getSeverityColor`, any `useState`/`useEffect`, or the `interface` declarations — only `getScoreColor`'s return values, the import list, and the JSX layout change.

- [ ] **Step 1: Add the framer-motion import**

Find:

```tsx
import { Calendar, TrendingUp, AlertCircle, Heart, Moon, Zap, Pill, ActivitySquare, FileText, Stethoscope, FlaskConical, FileDown, Loader2, ExternalLink } from "lucide-react";
import { toast } from "sonner";
```

Replace with:

```tsx
import { Calendar, TrendingUp, AlertCircle, Heart, Moon, Zap, Pill, ActivitySquare, FileText, Stethoscope, FlaskConical, FileDown, Loader2, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
```

- [ ] **Step 2: Formalize the severity color function**

Find:

```tsx
  const getScoreColor = (score: string | number) => {
    const scoreNum = typeof score === 'string' ? parseInt(score) : score;
    if (scoreNum >= 80) return 'text-green-500';
    if (scoreNum >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };
```

Replace with:

```tsx
  const getScoreColor = (score: string | number) => {
    const scoreNum = typeof score === 'string' ? parseInt(score) : score;
    if (scoreNum >= 80) return 'text-success';
    if (scoreNum >= 60) return 'text-warning';
    return 'text-critical';
  };
```

- [ ] **Step 3: Replace the loading-state return block**

Find:

```tsx
  if (loading) {
    return (
      <div className="flex h-full flex-col">
        <div className="border-b border-border bg-card px-8 py-6">
          <h1 className="text-3xl font-bold text-foreground">Health Summaries</h1>
          <p className="mt-2 text-muted-foreground">
            Your complete health history and insights
          </p>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading your health summaries...</p>
          </div>
        </div>
      </div>
    );
  }
```

Replace with:

```tsx
  if (loading) {
    return (
      <div className="flex h-full flex-col items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-b-2 border-primary"></div>
          <p className="text-body text-muted-foreground">Loading your health summaries...</p>
        </div>
      </div>
    );
  }
```

- [ ] **Step 4: Replace the full main return statement**

Find the entire remaining `return ( ... )` block, from the `return (` right after the loading-state block through the final closing of the component:

```tsx
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border bg-card px-8 py-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Health Summaries</h1>
            <p className="mt-2 text-muted-foreground">
              Your complete health history and insights
            </p>
          </div>
          <div className="flex flex-col items-end gap-3">
            <Button
              onClick={handleGenerateOverallReport}
              disabled={isGeneratingReport}
              className="flex items-center gap-2"
            >
              {isGeneratingReport ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating Report...
                </>
              ) : (
                <>
                  <FileDown className="h-4 w-4" />
                  Prepare Overall Report
                </>
              )}
            </Button>
            {pdfPath && (
              <a
                href={pdfPath}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-primary hover:underline"
              >
                <ExternalLink className="h-4 w-4" />
                View Generated PDF Report
              </a>
            )}
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <div className="border-b border-border bg-card px-8">
          <TabsList className="bg-transparent">
            <TabsTrigger value="checkins" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Check-ins ({checkIns.length})
            </TabsTrigger>
            <TabsTrigger value="prescriptions" className="flex items-center gap-2">
              <Stethoscope className="h-4 w-4" />
              Prescriptions ({prescriptions.length})
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <FlaskConical className="h-4 w-4" />
              Lab Reports ({reports.length})
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 overflow-auto">
          <TabsContent value="checkins" className="p-8 mt-0">
            {checkIns.length === 0 ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No Check-Ins Yet</h3>
                  <p className="text-muted-foreground">Start your first daily check-in to see summaries here</p>
                </div>
              </div>
            ) : (
              <div className="mx-auto max-w-5xl space-y-6">
                {checkIns.map((checkIn) => (
                  <Card key={checkIn.id} className="p-6 transition-all hover:shadow-md">
                    <div className="mb-4 flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <Calendar className="h-5 w-5 text-primary" />
                          <h3 className="text-lg font-semibold text-foreground">
                            {formatDate(checkIn.timestamp)}
                          </h3>
                        </div>
                        {checkIn.overall_score && (
                          <p className={`mt-1 text-sm font-medium ${getScoreColor(checkIn.overall_score)}`}>
                            Health Score: {checkIn.overall_score}
                          </p>
                        )}
                      </div>
                      {checkIn.mood && (
                        <Badge variant={getMoodColor(checkIn.mood)} className="capitalize">
                          Mood: {checkIn.mood}
                        </Badge>
                      )}
                    </div>

                    {checkIn.summary && (
                      <div className="mb-4 rounded-lg bg-muted/50 p-4">
                        <p className="text-sm text-foreground leading-relaxed">{checkIn.summary}</p>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      {checkIn.sleep_quality && (
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-500/10">
                          <Moon className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-foreground">Sleep Quality</p>
                            <p className="text-sm text-muted-foreground">{checkIn.sleep_quality}</p>
                          </div>
                        </div>
                      )}
                      {checkIn.energy_level && (
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-yellow-500/10">
                          <Zap className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-foreground">Energy Level</p>
                            <p className="text-sm text-muted-foreground">{checkIn.energy_level}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {checkIn.symptoms && checkIn.symptoms.length > 0 && (
                      <div className="mb-4">
                        <h4 className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
                          <ActivitySquare className="h-4 w-4 text-red-500" />
                          Symptoms Reported
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {checkIn.symptoms.map((symptom, idx) => (
                            <Badge key={idx} variant="outline" className="bg-red-500/10">{symptom}</Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {checkIn.medications_taken && checkIn.medications_taken.length > 0 && (
                      <div className="mb-4">
                        <h4 className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
                          <Pill className="h-4 w-4 text-green-500" />
                          Medications Taken
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {checkIn.medications_taken.map((med, idx) => (
                            <Badge key={idx} variant="outline" className="bg-green-500/10">{med}</Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {checkIn.ai_insights && checkIn.ai_insights.length > 0 && (
                      <div className="rounded-lg bg-primary/10 p-4">
                        <h4 className="mb-2 flex items-center gap-2 text-sm font-medium text-primary">
                          <TrendingUp className="h-4 w-4" />
                          AI Insights & Recommendations
                        </h4>
                        <ul className="space-y-1">
                          {checkIn.ai_insights.map((insight, idx) => (
                            <li key={idx} className="text-sm text-foreground">• {insight}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="prescriptions" className="p-8 mt-0">
            {prescriptions.length === 0 ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <Stethoscope className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No Prescriptions Yet</h3>
                  <p className="text-muted-foreground">Upload your first prescription to see summaries here</p>
                </div>
              </div>
            ) : (
              <div className="mx-auto max-w-5xl space-y-6">
                {prescriptions.map((prescription) => (
                  <Card key={prescription.id} className="p-6 transition-all hover:shadow-md">
                    <div className="mb-4 flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-primary" />
                          <h3 className="text-lg font-semibold text-foreground">
                            {prescription.prescription_date || formatDate(prescription.timestamp)}
                          </h3>
                        </div>
                        {prescription.doctor_name && (
                          <p className="mt-1 text-sm text-muted-foreground">
                            Dr. {prescription.doctor_name} {prescription.doctor_qualification && `(${prescription.doctor_qualification})`}
                          </p>
                        )}
                        {prescription.hospital && (
                          <p className="text-sm text-muted-foreground">{prescription.hospital}</p>
                        )}
                      </div>
                      {prescription.patient_name && (
                        <div className="text-right">
                          <Badge variant="outline">{prescription.patient_name}</Badge>
                          {(prescription.patient_age || prescription.patient_gender) && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {prescription.patient_age && `${prescription.patient_age}yr`}
                              {prescription.patient_age && prescription.patient_gender && ' • '}
                              {prescription.patient_gender}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {prescription.prescription_summary && (
                      <div className="mb-4 rounded-lg bg-muted/50 p-4">
                        <p className="text-sm text-foreground leading-relaxed">{prescription.prescription_summary}</p>
                      </div>
                    )}

                    {prescription.symptoms && (
                      <div className="mb-4">
                        <h4 className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
                          <ActivitySquare className="h-4 w-4 text-orange-500" />
                          Symptoms
                        </h4>
                        <p className="text-sm text-muted-foreground">{prescription.symptoms}</p>
                      </div>
                    )}

                    {prescription.diagnosis && (
                      <div className="mb-4 rounded-lg bg-blue-500/10 p-4">
                        <h4 className="mb-2 text-sm font-medium text-blue-600">Diagnosis</h4>
                        <p className="text-sm text-foreground">{prescription.diagnosis}</p>
                      </div>
                    )}

                    {prescription.medicines && prescription.medicines.length > 0 && (
                      <div className="mb-4">
                        <h4 className="mb-3 flex items-center gap-2 text-sm font-medium text-foreground">
                          <Pill className="h-4 w-4 text-green-500" />
                          Prescribed Medications
                        </h4>
                        <div className="space-y-2">
                          {prescription.medicines.map((med, idx) => (
                            <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-green-500/10">
                              <div className="flex-1">
                                <p className="font-medium text-sm text-foreground">{med.name}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {med.dosage && `${med.dosage}`}
                                  {med.frequency && ` • ${med.frequency}`}
                                  {med.duration && ` • ${med.duration}`}
                                </p>
                                {med.special_instructions && (
                                  <p className="text-xs text-muted-foreground mt-1 italic">{med.special_instructions}</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {prescription.advice && (
                      <div className="mb-4 rounded-lg bg-purple-500/10 p-4">
                        <h4 className="mb-2 text-sm font-medium text-purple-600">Advice</h4>
                        <p className="text-sm text-foreground">{prescription.advice}</p>
                      </div>
                    )}

                    {prescription.follow_up && (
                      <div className="rounded-lg bg-yellow-500/10 p-4">
                        <h4 className="mb-2 flex items-center gap-2 text-sm font-medium text-yellow-600">
                          <Calendar className="h-4 w-4" />
                          Follow-up
                        </h4>
                        <p className="text-sm text-foreground">{prescription.follow_up}</p>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="reports" className="p-8 mt-0">
            {reports.length === 0 ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <FlaskConical className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No Lab Reports Yet</h3>
                  <p className="text-muted-foreground">Upload your first lab report to see summaries here</p>
                </div>
              </div>
            ) : (
              <div className="mx-auto max-w-5xl space-y-6">
                {reports.map((report) => (
                  <Card key={report.id} className="p-6 transition-all hover:shadow-md">
                    <div className="mb-4 flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <FlaskConical className="h-5 w-5 text-primary" />
                          <h3 className="text-lg font-semibold text-foreground">
                            {report.report_date || formatDate(report.timestamp)}
                            {report.report_time && ` at ${report.report_time}`}
                          </h3>
                        </div>
                        {report.overall_health_risk_index !== null && (
                          <p className={`mt-1 text-sm font-medium ${getScoreColor(100 - report.overall_health_risk_index)}`}>
                            Health Risk Index: {report.overall_health_risk_index}
                          </p>
                        )}
                      </div>
                      {report.severity && (
                        <Badge variant={getSeverityColor(report.severity)} className="capitalize">
                          {report.severity}
                        </Badge>
                      )}
                    </div>

                    {report.lab_summary_overview && (
                      <div className="mb-4 rounded-lg bg-muted/50 p-4">
                        <p className="text-sm text-foreground leading-relaxed">{report.lab_summary_overview}</p>
                      </div>
                    )}

                    {report.critical_alerts && report.critical_alerts.length > 0 && (
                      <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/20 p-4">
                        <h4 className="mb-2 flex items-center gap-2 text-sm font-medium text-red-600">
                          <AlertCircle className="h-4 w-4" />
                          Critical Alerts
                        </h4>
                        <ul className="space-y-1">
                          {report.critical_alerts.map((alert, idx) => (
                            <li key={idx} className="text-sm text-red-600">• {alert}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {report.analyzed_metrics && report.analyzed_metrics.length > 0 && (
                      <div className="mb-4">
                        <h4 className="mb-3 text-sm font-medium text-foreground">Test Results</h4>
                        <div className="space-y-2">
                          {report.analyzed_metrics.slice(0, 100).map((metric, idx) => (
                            <div key={idx} className="flex items-center justify-between p-2 rounded bg-blue-500/10">
                              <div className="flex-1">
                                <p className="text-sm font-medium text-foreground">{metric.test_name}</p>
                                <p className="text-xs text-muted-foreground">{metric.reference_range}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-medium">{metric.value} {metric.unit}</p>
                                <Badge variant={metric.status?.toLowerCase().includes('abnormal') ? 'destructive' : 'outline'} className="text-xs">
                                  {metric.status || 'Normal'}
                                </Badge>
                              </div>
                            </div>
                          ))}
                          {report.analyzed_metrics.length > 100 && (
                            <p className="text-xs text-center text-muted-foreground pt-2">
                              +{report.analyzed_metrics.length - 100} more tests
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {report.recommendations && report.recommendations.length > 0 && (
                      <div className="rounded-lg bg-primary/10 p-4">
                        <h4 className="mb-2 flex items-center gap-2 text-sm font-medium text-primary">
                          <TrendingUp className="h-4 w-4" />
                          Recommendations
                        </h4>
                        <ul className="space-y-1">
                          {report.recommendations.map((rec, idx) => (
                            <li key={idx} className="text-sm text-foreground">• {rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
```

Replace with:

```tsx
  return (
    <div className="flex h-full flex-col">
      <div className="flex-shrink-0 border-b border-border bg-card px-5 py-4">
        <Button
          onClick={handleGenerateOverallReport}
          disabled={isGeneratingReport}
          className="flex w-full items-center justify-center gap-2"
        >
          {isGeneratingReport ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating report...
            </>
          ) : (
            <>
              <FileDown className="h-4 w-4" />
              Prepare overall report
            </>
          )}
        </Button>
        {pdfPath && (
          <a
            href={pdfPath}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 flex items-center justify-center gap-2 text-caption text-primary hover:underline"
          >
            <ExternalLink className="h-4 w-4" />
            View generated PDF report
          </a>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-1 flex-col">
        <div className="border-b border-border bg-card px-3">
          <TabsList className="bg-transparent">
            <TabsTrigger value="checkins" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Check-ins ({checkIns.length})
            </TabsTrigger>
            <TabsTrigger value="prescriptions" className="flex items-center gap-2">
              <Stethoscope className="h-4 w-4" />
              Prescriptions ({prescriptions.length})
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <FlaskConical className="h-4 w-4" />
              Lab reports ({reports.length})
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 overflow-auto">
          <TabsContent value="checkins" className="p-5 mt-0">
            {checkIns.length === 0 ? (
              <div className="flex h-64 items-center justify-center">
                <div className="text-center">
                  <Heart className="mx-auto mb-4 h-8 w-8 text-muted-foreground" />
                  <h3 className="mb-2 text-subtitle">No check-ins yet</h3>
                  <p className="text-caption text-muted-foreground">
                    Start your first daily check-in to see summaries here
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {checkIns.map((checkIn, index) => (
                  <motion.div
                    key={checkIn.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(index, 6) * 0.05, duration: 0.25 }}
                  >
                    <Card className="p-5 transition-smooth hover:shadow-md">
                      <div className="mb-3 flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-primary" />
                            <h3 className="text-subtitle text-foreground">{formatDate(checkIn.timestamp)}</h3>
                          </div>
                          {checkIn.overall_score && (
                            <p className={`mt-1 text-caption font-medium ${getScoreColor(checkIn.overall_score)}`}>
                              Health score: {checkIn.overall_score}
                            </p>
                          )}
                        </div>
                        {checkIn.mood && (
                          <Badge variant={getMoodColor(checkIn.mood)} className="capitalize">
                            {checkIn.mood}
                          </Badge>
                        )}
                      </div>

                      {checkIn.summary && (
                        <div className="mb-3 rounded-lg bg-muted/50 p-3">
                          <p className="text-body leading-relaxed text-foreground">{checkIn.summary}</p>
                        </div>
                      )}

                      <div className="mb-3 grid grid-cols-2 gap-3">
                        {checkIn.sleep_quality && (
                          <div className="flex items-start gap-2 rounded-lg bg-blue-500/10 p-3">
                            <Moon className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-500" />
                            <div>
                              <p className="text-caption font-medium text-foreground">Sleep</p>
                              <p className="text-caption text-muted-foreground">{checkIn.sleep_quality}</p>
                            </div>
                          </div>
                        )}
                        {checkIn.energy_level && (
                          <div className="flex items-start gap-2 rounded-lg bg-yellow-500/10 p-3">
                            <Zap className="mt-0.5 h-4 w-4 flex-shrink-0 text-yellow-500" />
                            <div>
                              <p className="text-caption font-medium text-foreground">Energy</p>
                              <p className="text-caption text-muted-foreground">{checkIn.energy_level}</p>
                            </div>
                          </div>
                        )}
                      </div>

                      {checkIn.symptoms && checkIn.symptoms.length > 0 && (
                        <div className="mb-3">
                          <h4 className="mb-2 flex items-center gap-2 text-caption font-medium text-foreground">
                            <ActivitySquare className="h-4 w-4 text-critical" />
                            Symptoms reported
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {checkIn.symptoms.map((symptom, idx) => (
                              <Badge key={idx} variant="outline" className="bg-critical/10">
                                {symptom}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {checkIn.medications_taken && checkIn.medications_taken.length > 0 && (
                        <div className="mb-3">
                          <h4 className="mb-2 flex items-center gap-2 text-caption font-medium text-foreground">
                            <Pill className="h-4 w-4 text-success" />
                            Medications taken
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {checkIn.medications_taken.map((med, idx) => (
                              <Badge key={idx} variant="outline" className="bg-success/10">
                                {med}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {checkIn.ai_insights && checkIn.ai_insights.length > 0 && (
                        <div className="rounded-lg bg-primary/10 p-3">
                          <h4 className="mb-2 flex items-center gap-2 text-caption font-medium text-primary">
                            <TrendingUp className="h-4 w-4" />
                            AI insights & recommendations
                          </h4>
                          <ul className="space-y-1">
                            {checkIn.ai_insights.map((insight, idx) => (
                              <li key={idx} className="text-body text-foreground">
                                • {insight}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="prescriptions" className="p-5 mt-0">
            {prescriptions.length === 0 ? (
              <div className="flex h-64 items-center justify-center">
                <div className="text-center">
                  <Stethoscope className="mx-auto mb-4 h-8 w-8 text-muted-foreground" />
                  <h3 className="mb-2 text-subtitle">No prescriptions yet</h3>
                  <p className="text-caption text-muted-foreground">
                    Upload your first prescription to see summaries here
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {prescriptions.map((prescription, index) => (
                  <motion.div
                    key={prescription.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(index, 6) * 0.05, duration: 0.25 }}
                  >
                    <Card className="p-5 transition-smooth hover:shadow-md">
                      <div className="mb-3 flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-primary" />
                            <h3 className="text-subtitle text-foreground">
                              {prescription.prescription_date || formatDate(prescription.timestamp)}
                            </h3>
                          </div>
                          {prescription.doctor_name && (
                            <p className="mt-1 text-caption text-muted-foreground">
                              Dr. {prescription.doctor_name}{" "}
                              {prescription.doctor_qualification && `(${prescription.doctor_qualification})`}
                            </p>
                          )}
                          {prescription.hospital && (
                            <p className="text-caption text-muted-foreground">{prescription.hospital}</p>
                          )}
                        </div>
                        {prescription.patient_name && (
                          <div className="text-right">
                            <Badge variant="outline">{prescription.patient_name}</Badge>
                            {(prescription.patient_age || prescription.patient_gender) && (
                              <p className="mt-1 text-caption text-muted-foreground">
                                {prescription.patient_age && `${prescription.patient_age}yr`}
                                {prescription.patient_age && prescription.patient_gender && " • "}
                                {prescription.patient_gender}
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      {prescription.prescription_summary && (
                        <div className="mb-3 rounded-lg bg-muted/50 p-3">
                          <p className="text-body leading-relaxed text-foreground">
                            {prescription.prescription_summary}
                          </p>
                        </div>
                      )}

                      {prescription.symptoms && (
                        <div className="mb-3">
                          <h4 className="mb-2 flex items-center gap-2 text-caption font-medium text-foreground">
                            <ActivitySquare className="h-4 w-4 text-orange-500" />
                            Symptoms
                          </h4>
                          <p className="text-body text-muted-foreground">{prescription.symptoms}</p>
                        </div>
                      )}

                      {prescription.diagnosis && (
                        <div className="mb-3 rounded-lg bg-blue-500/10 p-3">
                          <h4 className="mb-2 text-caption font-medium text-blue-600">Diagnosis</h4>
                          <p className="text-body text-foreground">{prescription.diagnosis}</p>
                        </div>
                      )}

                      {prescription.medicines && prescription.medicines.length > 0 && (
                        <div className="mb-3">
                          <h4 className="mb-2 flex items-center gap-2 text-caption font-medium text-foreground">
                            <Pill className="h-4 w-4 text-success" />
                            Prescribed medications
                          </h4>
                          <div className="space-y-2">
                            {prescription.medicines.map((med, idx) => (
                              <div key={idx} className="flex items-start gap-2 rounded-lg bg-success/10 p-3">
                                <div className="flex-1">
                                  <p className="text-body font-medium text-foreground">{med.name}</p>
                                  <p className="mt-1 text-caption text-muted-foreground">
                                    {med.dosage && `${med.dosage}`}
                                    {med.frequency && ` • ${med.frequency}`}
                                    {med.duration && ` • ${med.duration}`}
                                  </p>
                                  {med.special_instructions && (
                                    <p className="mt-1 text-caption italic text-muted-foreground">
                                      {med.special_instructions}
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {prescription.advice && (
                        <div className="mb-3 rounded-lg bg-purple-500/10 p-3">
                          <h4 className="mb-2 text-caption font-medium text-purple-600">Advice</h4>
                          <p className="text-body text-foreground">{prescription.advice}</p>
                        </div>
                      )}

                      {prescription.follow_up && (
                        <div className="rounded-lg bg-yellow-500/10 p-3">
                          <h4 className="mb-2 flex items-center gap-2 text-caption font-medium text-yellow-600">
                            <Calendar className="h-4 w-4" />
                            Follow-up
                          </h4>
                          <p className="text-body text-foreground">{prescription.follow_up}</p>
                        </div>
                      )}
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="reports" className="p-5 mt-0">
            {reports.length === 0 ? (
              <div className="flex h-64 items-center justify-center">
                <div className="text-center">
                  <FlaskConical className="mx-auto mb-4 h-8 w-8 text-muted-foreground" />
                  <h3 className="mb-2 text-subtitle">No lab reports yet</h3>
                  <p className="text-caption text-muted-foreground">
                    Upload your first lab report to see summaries here
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {reports.map((report, index) => (
                  <motion.div
                    key={report.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(index, 6) * 0.05, duration: 0.25 }}
                  >
                    <Card className="p-5 transition-smooth hover:shadow-md">
                      <div className="mb-3 flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <FlaskConical className="h-5 w-5 text-primary" />
                            <h3 className="text-subtitle text-foreground">
                              {report.report_date || formatDate(report.timestamp)}
                              {report.report_time && ` at ${report.report_time}`}
                            </h3>
                          </div>
                          {report.overall_health_risk_index !== null && (
                            <p
                              className={`mt-1 text-caption font-medium ${getScoreColor(
                                100 - report.overall_health_risk_index
                              )}`}
                            >
                              Health risk index: {report.overall_health_risk_index}
                            </p>
                          )}
                        </div>
                        {report.severity && (
                          <Badge variant={getSeverityColor(report.severity)} className="capitalize">
                            {report.severity}
                          </Badge>
                        )}
                      </div>

                      {report.lab_summary_overview && (
                        <div className="mb-3 rounded-lg bg-muted/50 p-3">
                          <p className="text-body leading-relaxed text-foreground">{report.lab_summary_overview}</p>
                        </div>
                      )}

                      {report.critical_alerts && report.critical_alerts.length > 0 && (
                        <div className="mb-3 rounded-lg border border-critical/20 bg-critical/10 p-3">
                          <h4 className="mb-2 flex items-center gap-2 text-caption font-medium text-critical">
                            <AlertCircle className="h-4 w-4" />
                            Critical alerts
                          </h4>
                          <ul className="space-y-1">
                            {report.critical_alerts.map((alert, idx) => (
                              <li key={idx} className="text-body text-critical">
                                • {alert}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {report.analyzed_metrics && report.analyzed_metrics.length > 0 && (
                        <div className="mb-3">
                          <h4 className="mb-2 text-caption font-medium text-foreground">Test results</h4>
                          <div className="space-y-2">
                            {report.analyzed_metrics.slice(0, 100).map((metric, idx) => (
                              <div key={idx} className="flex items-center justify-between rounded bg-blue-500/10 p-2">
                                <div className="flex-1">
                                  <p className="text-body font-medium text-foreground">{metric.test_name}</p>
                                  <p className="text-caption text-muted-foreground">{metric.reference_range}</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-body font-medium">
                                    {metric.value} {metric.unit}
                                  </p>
                                  <Badge
                                    variant={metric.status?.toLowerCase().includes("abnormal") ? "destructive" : "outline"}
                                    className="text-caption"
                                  >
                                    {metric.status || "Normal"}
                                  </Badge>
                                </div>
                              </div>
                            ))}
                            {report.analyzed_metrics.length > 100 && (
                              <p className="pt-2 text-center text-caption text-muted-foreground">
                                +{report.analyzed_metrics.length - 100} more tests
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {report.recommendations && report.recommendations.length > 0 && (
                        <div className="rounded-lg bg-primary/10 p-3">
                          <h4 className="mb-2 flex items-center gap-2 text-caption font-medium text-primary">
                            <TrendingUp className="h-4 w-4" />
                            Recommendations
                          </h4>
                          <ul className="space-y-1">
                            {report.recommendations.map((rec, idx) => (
                              <li key={idx} className="text-body text-foreground">
                                • {rec}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
```

- [ ] **Step 5: Verify the build**

Run: `cd frontend && npm run build`
Expected: clean build.

- [ ] **Step 6: Manual functional check**

Navigate to Summaries. Confirm all three tabs (Check-ins, Prescriptions, Lab Reports) still switch correctly and show the same data as before, and that cards fade/slide in with a slight stagger when a tab with multiple entries is opened. Click "Prepare overall report" — confirm it still calls `POST /generate-overall-report` (Network tab) and, on success, still renders the "View generated PDF report" link pointing at the same PDF URL as before. If any report has an `overall_health_risk_index` under 60 or a critical alert, confirm it now renders in the warning/critical token colors rather than the old raw yellow/red classes.

- [ ] **Step 7: Commit**

```bash
git add frontend/src/pages/Summaries.tsx
git commit -m "style: restyle Summaries screen for mobile, formalize severity colors, stagger card entry"
```

---

### Task 7: Restyle Appointments.tsx

**Files:**
- Modify: `frontend/src/pages/Appointments.tsx`

**Interfaces:**
- Consumes: nothing new.
- Produces: nothing consumed elsewhere.

**Do not touch** the `hospitals` mock array, `handleBookAppointment`, `getAvailabilityBadge`, or any state — only the returned JSX changes (collapsing the desktop half-screen map into a small preview, and restyling the hospital cards for a single mobile column).

- [ ] **Step 1: Replace the returned JSX**

Find the full `return ( ... )` block:

```tsx
  return (
    <div className="flex h-full flex-col lg:flex-row">
      {/* Left Side - Map */}
      <div className="relative h-96 w-full border-b border-border bg-muted lg:h-full lg:w-1/2 lg:border-b-0 lg:border-r">
        {/* Mock Map */}
        <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary-lighter to-secondary/20">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-primary shadow-lg">
              <MapPin className="h-12 w-12 text-primary-foreground" />
            </div>
            <p className="text-lg font-semibold text-foreground">Your Location</p>
            <p className="text-sm text-muted-foreground">Koramangala, Bangalore</p>
            <Button variant="outline" className="mt-4" size="sm">
              <Navigation className="mr-2 h-4 w-4" />
              Update Location
            </Button>
          </div>
        </div>

        {/* Map Overlay - Markers */}
        <div className="absolute left-1/4 top-1/4 animate-bounce">
          <div className="h-8 w-8 rounded-full bg-primary shadow-lg"></div>
        </div>
        <div className="absolute right-1/3 top-1/3 animate-bounce delay-100">
          <div className="h-8 w-8 rounded-full bg-primary shadow-lg"></div>
        </div>
        <div className="absolute bottom-1/3 left-1/3 animate-bounce delay-200">
          <div className="h-8 w-8 rounded-full bg-primary shadow-lg"></div>
        </div>
      </div>

      {/* Right Side - Hospital List */}
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <div className="border-b border-border bg-card px-6 py-5">
          <h1 className="text-2xl font-bold text-foreground">Nearby Hospitals</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {hospitals.length} hospitals within 5 km
          </p>
        </div>

        {/* Hospital List */}
        <div className="flex-1 overflow-auto p-6">
          <div className="space-y-4">
            {hospitals.map((hospital) => (
              <Card
                key={hospital.id}
                className="p-5 transition-smooth hover:shadow-md"
              >
                <div className="space-y-3">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-foreground">
                        {hospital.name}
                      </h3>
                      <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{hospital.address}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="h-4 w-4 fill-primary text-primary" />
                      <span className="font-medium text-foreground">
                        {hospital.rating}
                      </span>
                    </div>
                  </div>

                  {/* Distance & Availability */}
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">
                      <Navigation className="mr-1 h-3 w-3" />
                      {hospital.distance}
                    </Badge>
                    {getAvailabilityBadge(hospital.availability)}
                  </div>

                  {/* Specialties */}
                  <div className="flex flex-wrap gap-2">
                    {hospital.specialties.map((specialty, idx) => (
                      <span
                        key={idx}
                        className="rounded-full bg-primary-lighter px-3 py-1 text-xs font-medium text-primary"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>

                  {/* Contact & Book */}
                  <div className="flex items-center justify-between border-t border-border pt-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      <span>{hospital.phone}</span>
                    </div>
                    <Button
                      onClick={() => handleBookAppointment(hospital)}
                      disabled={selectedHospital === hospital.id}
                      size="sm"
                    >
                      {selectedHospital === hospital.id ? (
                        <>
                          <Clock className="mr-2 h-4 w-4 animate-spin" />
                          Booking...
                        </>
                      ) : (
                        "Book Appointment"
                      )}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
```

Replace with:

```tsx
  return (
    <div className="flex h-full flex-col">
      {/* Compact map preview */}
      <div className="relative h-28 w-full flex-shrink-0 border-b border-border bg-gradient-to-br from-primary-lighter to-secondary/20">
        <div className="absolute left-1/4 top-1/3 h-3 w-3 animate-bounce rounded-full bg-primary shadow-lg" />
        <div className="absolute right-1/3 top-1/2 h-3 w-3 animate-bounce rounded-full bg-primary shadow-lg delay-100" />
        <div className="flex h-full items-center justify-between px-5">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary shadow-md">
              <MapPin className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <p className="text-body font-semibold text-foreground">Koramangala, Bangalore</p>
              <p className="text-caption text-muted-foreground">{hospitals.length} hospitals within 5 km</p>
            </div>
          </div>
          <Button variant="outline" size="sm">
            <Navigation className="mr-1 h-4 w-4" />
            View map
          </Button>
        </div>
      </div>

      {/* Hospital List */}
      <div className="flex-1 overflow-auto px-5 py-5">
        <div className="space-y-4">
          {hospitals.map((hospital) => (
            <Card key={hospital.id} className="p-5 transition-smooth hover:shadow-md">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-subtitle text-foreground">{hospital.name}</h3>
                    <div className="mt-1 flex items-center gap-2 text-caption text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{hospital.address}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-caption">
                    <Star className="h-4 w-4 fill-primary text-primary" />
                    <span className="font-medium text-foreground">{hospital.rating}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Badge variant="outline">
                    <Navigation className="mr-1 h-3 w-3" />
                    {hospital.distance}
                  </Badge>
                  {getAvailabilityBadge(hospital.availability)}
                </div>

                <div className="flex flex-wrap gap-2">
                  {hospital.specialties.map((specialty, idx) => (
                    <span
                      key={idx}
                      className="rounded-full bg-primary-lighter px-3 py-1 text-caption font-medium text-primary"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between border-t border-border pt-3">
                  <div className="flex items-center gap-2 text-caption text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span>{hospital.phone}</span>
                  </div>
                  <Button
                    onClick={() => handleBookAppointment(hospital)}
                    disabled={selectedHospital === hospital.id}
                    size="sm"
                  >
                    {selectedHospital === hospital.id ? (
                      <>
                        <Clock className="mr-2 h-4 w-4 animate-spin" />
                        Booking...
                      </>
                    ) : (
                      "Book appointment"
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify the build**

Run: `cd frontend && npm run build`
Expected: clean build.

- [ ] **Step 3: Manual functional check**

Navigate to Appointments. Confirm the map preview strip and hospital cards render in a single mobile column. Click "Book appointment" on any hospital — confirm it still calls `handleBookAppointment(hospital)` and navigates to `/agent-call` with the same `hospital` object in router state as before (verify the AgentCall screen still receives `location.state?.hospital` correctly).

- [ ] **Step 4: Commit**

```bash
git add frontend/src/pages/Appointments.tsx
git commit -m "style: restyle Appointments screen for mobile, collapse map to preview strip"
```

---

### Task 8: Restyle Insurance.tsx

**Files:**
- Modify: `frontend/src/pages/Insurance.tsx`

**Interfaces:**
- Consumes: nothing new.
- Produces: nothing consumed elsewhere.

**Do not touch** the `insurancePlans` array, `systemInstruction` string, `customSetupConfig`, `useEffect` Gemini wiring, `startRecording`/`stopRecording`/`ensureAudioInitialized`/`playAudioChunk`/`formatTime`, or the `API_KEY`/`BACKEND_URL` lines — only the returned JSX changes.

- [ ] **Step 1: Replace the returned JSX**

Find the full `return ( ... )` block:

```tsx
  return (
    <div className="flex h-full flex-col">
      {/* Voice Agent Button - Top */}
      <div className="border-b border-border bg-card px-6 py-6">
        <div className="flex flex-col items-center gap-4">
          <div className="text-center">
            <h2 className="text-xl font-bold text-foreground mb-1">
              Insurance Assistant
            </h2>
            <p className="text-sm text-muted-foreground">
              {isRecording 
                ? `Consultation in progress - ${formatTime(elapsed)}`
                : "Tap to speak with your personal insurance advisor"}
            </p>
          </div>

          {/* Audio Visualizer */}
          <AnimatePresence>
            {isRecording && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex justify-center gap-1 h-12 items-end mb-2"
              >
                {[...Array(12)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{
                      height: [
                        "20%",
                        `${Math.random() * 80 + 20}%`,
                        "20%",
                      ],
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 0.8,
                      delay: i * 0.05,
                    }}
                    className="w-1.5 bg-gradient-to-t from-primary to-secondary rounded-full"
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
          
          <Button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isProcessing}
            size="lg"
            className={`h-20 w-20 rounded-full ${
              isRecording ? "bg-destructive hover:bg-destructive/90 animate-pulse" : ""
            }`}
          >
            {isProcessing ? (
              <Loader2 className="h-8 w-8 animate-spin" />
            ) : isRecording ? (
              <Square className="h-8 w-8" />
            ) : (
              <Mic className="h-8 w-8" />
            )}
          </Button>

          {isAISpeaking && (
            <motion.div
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="flex items-center gap-2 text-primary font-medium text-sm"
            >
              <div className="w-2 h-2 rounded-full bg-primary" />
              Advisor is speaking...
            </motion.div>
          )}
        </div>
      </div>

      {/* Insurance Plans - Below */}
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <div className="border-b border-border bg-card px-6 py-5">
          <h2 className="text-xl font-bold text-foreground">
            Available Plans
          </h2>
          <p className="text-sm text-muted-foreground">
            Talk to our advisor to find the best plan for you
          </p>
        </div>

        {/* Plans List */}
        <div className="flex-1 overflow-auto p-6">
          <div className="space-y-4">
            {recommendedPlans.map((plan) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="p-5 transition-smooth hover:shadow-md">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <Shield className="h-5 w-5 text-primary" />
                          <h3 className="text-lg font-semibold text-foreground">
                            {plan.name}
                          </h3>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {plan.provider}
                        </p>
                      </div>
                    </div>

                    {/* Coverage & Premium */}
                    <div className="flex gap-4">
                      <div className="flex-1 rounded-lg bg-primary/10 p-3">
                        <p className="text-xs text-muted-foreground">Coverage</p>
                        <p className="mt-1 text-lg font-bold text-primary">
                          {plan.coverage}
                        </p>
                      </div>
                      <div className="flex-1 rounded-lg bg-muted p-3">
                        <p className="text-xs text-muted-foreground">Premium</p>
                        <p className="mt-1 text-lg font-bold text-foreground">
                          {plan.premium}
                        </p>
                      </div>
                    </div>

                    {/* Features */}
                    <div>
                      <p className="mb-2 text-sm font-medium text-foreground">
                        Key Features
                      </p>
                      <div className="space-y-1.5">
                        {plan.features.map((feature, idx) => (
                          <div
                            key={idx}
                            className="flex items-start gap-2 text-sm text-muted-foreground"
                          >
                            <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Action */}
                    <Button
                      className="w-full"
                      onClick={() => {
                        toast.success(`Requesting details for ${plan.name}`);
                      }}
                    >
                      Get Quote
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Info Card */}
          {!isRecording && (
            <Card className="mt-4 bg-muted/50 p-4">
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Need Help Choosing?
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Talk to our insurance advisor above. They'll ask about your age, family, health situation, and budget to recommend the perfect plan for you.
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
```

Replace with:

```tsx
  return (
    <div className="flex h-full flex-col">
      {/* Voice Agent */}
      <div className="border-b border-border bg-card px-5 py-5 flex-shrink-0">
        <div className="flex flex-col items-center gap-3">
          <div className="text-center">
            <h2 className="text-subtitle text-foreground">Insurance assistant</h2>
            <p className="text-caption text-muted-foreground">
              {isRecording ? `Consultation in progress - ${formatTime(elapsed)}` : "Tap to speak with your advisor"}
            </p>
          </div>

          <AnimatePresence>
            {isRecording && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex h-10 items-end justify-center gap-1"
              >
                {[...Array(12)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{ height: ["20%", `${Math.random() * 80 + 20}%`, "20%"] }}
                    transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.05 }}
                    className="w-1.5 rounded-full bg-gradient-to-t from-primary to-secondary"
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <Button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isProcessing}
            size="lg"
            className={`h-16 w-16 rounded-full ${
              isRecording ? "bg-destructive hover:bg-destructive/90 animate-pulse" : ""
            }`}
          >
            {isProcessing ? (
              <Loader2 className="h-7 w-7 animate-spin" />
            ) : isRecording ? (
              <Square className="h-7 w-7" />
            ) : (
              <Mic className="h-7 w-7" />
            )}
          </Button>

          {isAISpeaking && (
            <motion.div
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="flex items-center gap-2 text-caption font-medium text-primary"
            >
              <div className="h-2 w-2 rounded-full bg-primary" />
              Advisor is speaking...
            </motion.div>
          )}
        </div>
      </div>

      {/* Plans */}
      <div className="flex-1 overflow-auto px-5 py-5">
        <h2 className="mb-1 text-subtitle text-foreground">Available plans</h2>
        <p className="mb-4 text-caption text-muted-foreground">Talk to the advisor to find the best fit</p>

        <div className="space-y-4">
          {recommendedPlans.map((plan) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="p-5 transition-smooth hover:shadow-md">
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-primary" />
                      <h3 className="text-subtitle text-foreground">{plan.name}</h3>
                    </div>
                    <p className="mt-1 text-caption text-muted-foreground">{plan.provider}</p>
                  </div>

                  <div className="flex gap-3">
                    <div className="flex-1 rounded-lg bg-primary/10 p-3">
                      <p className="text-caption text-muted-foreground">Coverage</p>
                      <p className="mt-1 text-subtitle text-primary">{plan.coverage}</p>
                    </div>
                    <div className="flex-1 rounded-lg bg-muted p-3">
                      <p className="text-caption text-muted-foreground">Premium</p>
                      <p className="mt-1 text-subtitle text-foreground">{plan.premium}</p>
                    </div>
                  </div>

                  <div>
                    <p className="mb-2 text-body font-medium text-foreground">Key features</p>
                    <div className="space-y-1.5">
                      {plan.features.map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-body text-muted-foreground">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button
                    className="w-full"
                    onClick={() => {
                      toast.success(`Requesting details for ${plan.name}`);
                    }}
                  >
                    Get quote
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {!isRecording && (
          <Card className="mt-4 bg-muted/50 p-4">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-body font-medium text-foreground">Need help choosing?</p>
                <p className="mt-1 text-caption text-muted-foreground">
                  Talk to the insurance advisor above. They'll ask about your age, family, health situation, and
                  budget to recommend the perfect plan for you.
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify the build**

Run: `cd frontend && npm run build`
Expected: clean build.

- [ ] **Step 3: Manual functional check**

Navigate to Insurance. Confirm all 3 plan cards render with the same data as before. Tap the mic button — confirm the existing Gemini Live connection/recording flow still starts (same handler names, `startRecording`/`stopRecording` untouched). Tap "Get quote" on a plan — confirm the existing `toast.success` still fires with the correct plan name.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/pages/Insurance.tsx
git commit -m "style: restyle Insurance screen for mobile Calm Clinical design"
```

---

### Task 9: Restyle AgentCall.tsx

**Files:**
- Modify: `frontend/src/pages/AgentCall.tsx`

**Interfaces:**
- Consumes: `useNavigate` from `react-router-dom` (already imported) for the new back-chevron button.
- Produces: nothing consumed elsewhere.

**Do not touch** the `systemInstruction` template string, `customSetupConfig`, the `onToolCall` handler (`getMedicalHistory`/`sendEmail` tool dispatch), `handleStartCall`, `handleEndCall`, `appointmentDetailsRef`, or any state/effect — only the returned JSX changes.

- [ ] **Step 1: Replace the returned JSX**

Find the full `return ( ... )` block (everything from `if (!hospital) {` through the final closing of the component):

```tsx
  if (!hospital) {
    return (
      <div className="flex h-full items-center justify-center">
        <Card className="p-8">
          <p className="text-lg text-muted-foreground">No hospital information provided</p>
          <Button onClick={() => navigate("/appointments")} className="mt-4">
            Back to Appointments
          </Button>
        </Card>
      </div>
    );
  }

  if (isLoadingContext) {
    return (
      <div className="flex h-full items-center justify-center">
        <Card className="p-8">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-lg font-medium">Loading patient medical context...</p>
            <p className="text-sm text-muted-foreground">Preparing agent with your medical data</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col items-center justify-center p-6 bg-gradient-to-br from-primary-lighter to-secondary/20">
      <Card className="w-full max-w-3xl p-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-foreground">AI Appointment Agent</h1>
            <p className="mt-2 text-muted-foreground">
              {hospital.name} - {hospital.phone}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {hospital.address}
            </p>
          </div>

          {/* Call Status */}
          <div className="flex items-center justify-center">
            <div className={`relative flex h-32 w-32 items-center justify-center rounded-full ${
              isCallActive ? "bg-primary animate-pulse" : callCompleted ? "bg-green-500" : "bg-muted"
            }`}>
              {callCompleted ? (
                <CheckCircle className="h-16 w-16 text-white" />
              ) : isCallActive ? (
                <>
                  <Phone className="h-16 w-16 text-primary-foreground" />
                  <div className="absolute h-full w-full animate-ping rounded-full bg-primary opacity-75"></div>
                </>
              ) : (
                <Phone className="h-16 w-16 text-muted-foreground" />
              )}
            </div>
          </div>

          {/* Timer Display */}
          {isRecording && (
                <div className="text-center">
              <div className="text-2xl font-bold">{formatTime(elapsed)}</div>
                </div>
          )}

          {/* Audio Visualizer */}
          <AnimatePresence>
            {isRecording && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex justify-center gap-1 h-16 items-end"
              >
                {[...Array(15)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{
                      height: [
                        "20%",
                        `${Math.random() * 80 + 20}%`,
                        "20%",
                      ],
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 0.8,
                      delay: i * 0.05,
                    }}
                    className="w-2 bg-gradient-to-t from-primary to-secondary rounded-full"
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Status Messages */}
          <div className="text-center">
            {isProcessing ? (
              <p className="text-lg text-muted-foreground">Processing...</p>
            ) : isCallActive ? (
              <p className="text-lg font-medium text-foreground">
                {isAISpeaking && (
                  <motion.span
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="block mt-2 text-primary"
                  >
                    AI Agent is speaking...
                  </motion.span>
                )}
                Call in progress - AI agent is talking to hospital staff
              </p>
            ) : callCompleted ? (
              <p className="text-lg font-medium text-green-600">
                Appointment booked successfully!
              </p>
            ) : (
              <p className="text-lg text-muted-foreground">
                Ready to start the call
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            {!callCompleted ? (
              <>
                <Button
                  onClick={isCallActive ? handleEndCall : handleStartCall}
                  disabled={isProcessing}
                  className="flex-1"
                  size="lg"
                  variant={isCallActive ? "destructive" : "default"}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Processing...
                    </>
                  ) : isCallActive ? (
                    <>
                      <PhoneOff className="mr-2 h-5 w-5" />
                      End Call
                    </>
                  ) : (
                    <>
                  <Phone className="mr-2 h-5 w-5" />
                      Start Call
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => navigate("/appointments")}
                  variant="outline"
                  size="lg"
                >
                  Cancel
                </Button>
              </>
            ) : (
                <Button
                onClick={() => navigate("/appointments")}
                  className="flex-1"
                  size="lg"
                >
                  Back to Appointments
                </Button>
            )}
          </div>

          {/* Info Card */}
          {!isCallActive && !callCompleted && (
            <Card className="p-6 bg-muted/50">
              <h3 className="mb-3 text-lg font-semibold text-foreground">
                What the AI Agent Will Do
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Review your medical history (check-ins, prescriptions, reports)</li>
                <li>• Call the hospital on your behalf</li>
                <li>• Discuss your medical needs and find the best appointment time</li>
                <li>• Send medical reports via email once appointment is confirmed</li>
              </ul>
            </Card>
          )}
        </div>
      </Card>
    </div>
  );
}
```

Replace with:

```tsx
  if (!hospital) {
    return (
      <div className="flex h-full items-center justify-center px-5">
        <Card className="p-6">
          <p className="text-body text-muted-foreground">No hospital information provided</p>
          <Button onClick={() => navigate("/appointments")} className="mt-4">
            Back to appointments
          </Button>
        </Card>
      </div>
    );
  }

  if (isLoadingContext) {
    return (
      <div className="flex h-full items-center justify-center px-5">
        <Card className="p-6">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-subtitle">Loading patient medical context...</p>
            <p className="text-caption text-muted-foreground">Preparing agent with your medical data</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-gradient-to-br from-primary-lighter to-secondary/20">
      <header className="flex h-14 flex-shrink-0 items-center gap-2 border-b border-border bg-card/80 px-2 backdrop-blur">
        <Button variant="ghost" size="sm" onClick={() => navigate("/appointments")} className="gap-1 px-2">
          <ChevronLeft className="h-5 w-5" />
          Back
        </Button>
      </header>

      <div className="flex flex-1 flex-col items-center justify-center overflow-auto px-5 py-6">
        <Card className="w-full p-6">
          <div className="space-y-5">
            <div className="text-center">
              <h1 className="text-title text-foreground">AI appointment agent</h1>
              <p className="mt-2 text-body text-muted-foreground">
                {hospital.name} - {hospital.phone}
              </p>
              <p className="mt-1 text-caption text-muted-foreground">{hospital.address}</p>
            </div>

            <div className="flex items-center justify-center">
              <div
                className={`relative flex h-24 w-24 items-center justify-center rounded-full ${
                  isCallActive ? "bg-primary animate-pulse" : callCompleted ? "bg-success" : "bg-muted"
                }`}
              >
                {callCompleted ? (
                  <CheckCircle className="h-12 w-12 text-success-foreground" />
                ) : isCallActive ? (
                  <>
                    <Phone className="h-12 w-12 text-primary-foreground" />
                    <div className="absolute h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                  </>
                ) : (
                  <Phone className="h-12 w-12 text-muted-foreground" />
                )}
              </div>
            </div>

            {isRecording && (
              <div className="text-center">
                <div className="text-title">{formatTime(elapsed)}</div>
              </div>
            )}

            <AnimatePresence>
              {isRecording && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex h-14 items-end justify-center gap-1"
                >
                  {[...Array(15)].map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{ height: ["20%", `${Math.random() * 80 + 20}%`, "20%"] }}
                      transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.05 }}
                      className="w-1.5 rounded-full bg-gradient-to-t from-primary to-secondary"
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="text-center">
              {isProcessing ? (
                <p className="text-body text-muted-foreground">Processing...</p>
              ) : isCallActive ? (
                <p className="text-subtitle text-foreground">
                  {isAISpeaking && (
                    <motion.span
                      animate={{ opacity: [1, 0.5, 1] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                      className="mb-1 block text-primary"
                    >
                      AI agent is speaking...
                    </motion.span>
                  )}
                  Call in progress - talking to hospital staff
                </p>
              ) : callCompleted ? (
                <p className="text-subtitle text-success">Appointment booked successfully!</p>
              ) : (
                <p className="text-body text-muted-foreground">Ready to start the call</p>
              )}
            </div>

            <div className="flex gap-3">
              {!callCompleted ? (
                <>
                  <Button
                    onClick={isCallActive ? handleEndCall : handleStartCall}
                    disabled={isProcessing}
                    className="flex-1"
                    size="lg"
                    variant={isCallActive ? "destructive" : "default"}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Processing...
                      </>
                    ) : isCallActive ? (
                      <>
                        <PhoneOff className="mr-2 h-5 w-5" />
                        End call
                      </>
                    ) : (
                      <>
                        <Phone className="mr-2 h-5 w-5" />
                        Start call
                      </>
                    )}
                  </Button>
                  <Button onClick={() => navigate("/appointments")} variant="outline" size="lg">
                    Cancel
                  </Button>
                </>
              ) : (
                <Button onClick={() => navigate("/appointments")} className="flex-1" size="lg">
                  Back to appointments
                </Button>
              )}
            </div>

            {!isCallActive && !callCompleted && (
              <Card className="p-5 bg-muted/50">
                <h3 className="mb-3 text-subtitle text-foreground">What the AI agent will do</h3>
                <ul className="space-y-2 text-body text-muted-foreground">
                  <li>• Review your medical history (check-ins, prescriptions, reports)</li>
                  <li>• Call the hospital on your behalf</li>
                  <li>• Discuss your medical needs and find the best appointment time</li>
                  <li>• Send medical reports via email once appointment is confirmed</li>
                </ul>
              </Card>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Add the ChevronLeft icon import**

Find:

```tsx
import { Phone, PhoneOff, Calendar, Mic, CheckCircle, Square, Loader2 } from "lucide-react";
```

Replace with:

```tsx
import { Phone, PhoneOff, Calendar, Mic, CheckCircle, Square, Loader2, ChevronLeft } from "lucide-react";
```

- [ ] **Step 3: Verify the build**

Run: `cd frontend && npm run build`
Expected: clean build.

- [ ] **Step 4: Manual functional check**

From Appointments, click "Book appointment" on a hospital to reach AgentCall. Confirm the back chevron navigates to `/appointments`. Click "Start call" — confirm the existing Gemini Live wiring, patient-context pre-load, and tool-call handling (`getMedicalHistory`, `sendEmail`) still behave exactly as before (check console logs for the same `🔧 Tool call received` messages as pre-restyle). Click "End call" — confirm existing cleanup logic still runs.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/pages/AgentCall.tsx
git commit -m "style: restyle AgentCall screen for mobile, add back navigation"
```

---

### Task 10: Restyle NotFound.tsx

**Files:**
- Modify: `frontend/src/pages/NotFound.tsx`

**Interfaces:**
- Consumes: nothing new.
- Produces: nothing consumed elsewhere.

**Do not touch** the `useEffect` console logging — only the returned JSX changes.

- [ ] **Step 1: Replace the returned JSX**

Find:

```tsx
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">404</h1>
        <p className="mb-4 text-xl text-gray-600">Oops! Page not found</p>
        <a href="/" className="text-blue-500 underline hover:text-blue-700">
          Return to Home
        </a>
      </div>
    </div>
  );
};
```

Replace with:

```tsx
  return (
    <div className="flex h-full items-center justify-center bg-background px-5">
      <div className="text-center">
        <h1 className="mb-2 text-display text-foreground">404</h1>
        <p className="mb-4 text-body text-muted-foreground">Oops! Page not found</p>
        <a href="/" className="text-body font-medium text-primary underline hover:no-underline">
          Return to home
        </a>
      </div>
    </div>
  );
};
```

- [ ] **Step 2: Verify the build**

Run: `cd frontend && npm run build`
Expected: clean build.

- [ ] **Step 3: Manual functional check**

Navigate to a non-existent route (e.g. `http://localhost:8080/does-not-exist`). Confirm the restyled 404 page renders and "Return to home" navigates back to `/`.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/pages/NotFound.tsx
git commit -m "style: restyle NotFound screen to match Calm Clinical design"
```

---

### Task 11: Final verification pass

**Files:** none (verification only, no code changes).

- [ ] **Step 1: Full build**

Run: `cd frontend && npm run build`
Expected: clean build, matching the working build confirmed after Task 1.

- [ ] **Step 2: Full click-through at mobile width**

Run: `cd frontend && npm run dev`, open `http://localhost:8080` with the browser window narrowed below 640px (or devtools mobile emulation, e.g. iPhone 14 Pro preset). Work through every screen and confirm every interactive element still does exactly what it did before this redesign:
- Bottom nav: all 5 tabs navigate correctly, active state and app-bar title update per tab.
- Check-In: mic button starts/stops recording.
- Upload: file picker opens the classification drawer; both classification buttons and Cancel work; uploaded-file list and Clear all work.
- Summaries: all 3 tabs switch; "Prepare overall report" triggers generation and (on success) shows the PDF link; existing data (check-ins/prescriptions/reports) renders correctly including any critical alerts in the new critical/warning/success colors.
- Appointments: "Book appointment" navigates to AgentCall with the correct hospital.
- Insurance: mic button starts/stops recording; "Get quote" shows the toast.
- AgentCall: back chevron returns to Appointments; Start call/End call work.
- NotFound: renders on an unknown route; "Return to home" works.

- [ ] **Step 3: Phone-frame resize check**

With the same dev server running, widen the browser window above 640px.
Expected: the decorative phone bezel, notch, and home-indicator appear, with the app centered inside them on the soft gradient backdrop. Narrow back below 640px — chrome disappears, app fills the viewport.

- [ ] **Step 4: Report status**

If every check in Steps 2-3 passes, the redesign is complete and ready for the product management competition demo. If anything fails, note exactly which screen/button/check failed before committing further — do not mark this task's checkbox complete until every item above is verified.
