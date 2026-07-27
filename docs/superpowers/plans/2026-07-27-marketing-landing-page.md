# PraanLink Marketing Landing Page — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a premium, animated marketing landing page at the site root, using product-management-framed copy (StoryBrand + Jobs-to-be-Done) and CSS/Framer-Motion-driven "3D" visual effects, while relocating the existing product demo to `/app` with zero changes to its data-fetching, handlers, or API calls.

**Architecture:** A new `Landing` page (`src/pages/Landing.tsx`) composes seven single-purpose section components under `src/components/landing/` (`Hero`, `ProblemSection`, `SolutionSection`, `FeaturesSection`, `WorkflowSection`, `CtaSection`, `LandingFooter`), sharing two small motion primitives (`RevealOnScroll`, `TiltCard`). `App.tsx`'s route table changes so `/` renders `Landing` (unwrapped) and the existing product routes move under `/app` (still wrapped in `PhoneFrame`), which requires updating the handful of hardcoded internal path strings in `BottomNav.tsx`, `Layout.tsx`, `Appointments.tsx`, and `AgentCall.tsx`.

**Tech Stack:** React 18 + TypeScript + Vite, Tailwind CSS, Framer Motion, `lucide-react`, `@fontsource/plus-jakarta-sans` — all already installed. No new dependencies.

**Spec:** `docs/superpowers/specs/2026-07-27-marketing-landing-page-design.md`

## Global Constraints

- No backend, API endpoint, database, or ai-pipeline changes anywhere in this plan.
- No mention of underlying technology (Gemini, ADK, RAG, OCR, "AI agents", "AI pipeline") anywhere in landing page copy — every feature is described by user outcome, never mechanism.
- No fabricated statistics, testimonials, or social proof, and no hackathon/award badge anywhere on the landing page.
- No new npm dependencies — every visual effect is built from Framer Motion, Tailwind, `lucide-react`, and CSS already present in `frontend/package.json`.
- Existing product pages (`CheckIn`, `Upload`, `Summaries`, `Appointments`, `Insurance`, `AgentCall`, `NotFound`) keep every prop, state, handler, effect, and `fetch()` call exactly as-is — the only permitted changes to their files are the literal path-string updates called out in Task 3 (moving hardcoded `navigate()` targets from `/x` to `/app/x`).
- All work happens in `PraanLink/frontend/`. No test framework exists in this project (confirmed: no Jest/Vitest/Testing Library in `package.json`) — introducing one is out of scope for this visual/content feature. Verify every task with `npm run build` plus the concrete manual click-through described in each task's steps, per the spec's own verification plan.
- Git: work happens directly on `main` in the `PraanLink` repo; commits are pushed to the `fork` remote (`anmolsureka-unloq/PraanLink-DD`) only. The `origin` remote (`itsArnavPrasad/PraanLink`) is not touched.

---

### Task 1: Dark-section design tokens and ambient-motion CSS

**Files:**
- Modify: `frontend/src/index.css`

**Interfaces:**
- Produces: CSS custom properties `--landing-dark-bg`, `--landing-dark-card`, `--landing-glow-primary`, `--landing-glow-accent` (all HSL triplets, matching the file's existing token convention), plus utility classes `.landing-orb` and `.landing-glass-card`, plus a `prefers-reduced-motion` guard on `.landing-orb`. Consumed by Task 4 (Hero) and Task 7 (Workflow).

- [ ] **Step 1: Add the new HSL tokens to `:root`**

In `frontend/src/index.css`, find:

```css
    --critical: 0 72% 51%;
    --critical-foreground: 0 0% 100%;
```

Replace with:

```css
    --critical: 0 72% 51%;
    --critical-foreground: 0 0% 100%;

    --landing-dark-bg: 160 30% 6%;
    --landing-dark-card: 160 22% 14%;
    --landing-glow-primary: 163 84% 45%;
    --landing-glow-accent: 16 90% 65%;
```

- [ ] **Step 2: Append the landing-only utility classes and keyframes**

At the end of the file, find (this is the current last content in the file):

```css
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

Replace with (keeps everything above unchanged, appends a new rule block plus keyframes/media query after the existing `@layer components` closes):

```css
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

@layer components {
  .landing-orb {
    position: absolute;
    border-radius: 9999px;
    filter: blur(70px);
    opacity: 0.35;
    pointer-events: none;
    animation: landing-drift 18s ease-in-out infinite alternate;
  }

  .landing-glass-card {
    background: hsl(var(--landing-dark-card) / 0.6);
    border: 1px solid hsl(var(--landing-glow-primary) / 0.25);
    backdrop-filter: blur(16px);
    box-shadow: 0 0 40px -10px hsl(var(--landing-glow-primary) / 0.35);
  }
}

@keyframes landing-drift {
  0% {
    transform: translate(0, 0) scale(1);
  }
  100% {
    transform: translate(30px, -24px) scale(1.08);
  }
}

@media (prefers-reduced-motion: reduce) {
  .landing-orb {
    animation: none;
  }
}
```

- [ ] **Step 3: Verify the build**

Run: `cd frontend && npm run build`
Expected: build completes with no errors (pure CSS addition, nothing consumes the new classes yet).

- [ ] **Step 4: Commit**

```bash
git add frontend/src/index.css
git commit -m "feat: add landing page dark-section design tokens"
```

---

### Task 2: Shared landing motion primitives

**Files:**
- Create: `frontend/src/components/landing/RevealOnScroll.tsx`
- Create: `frontend/src/components/landing/TiltCard.tsx`

**Interfaces:**
- Produces: `RevealOnScroll` — `({ children: ReactNode, delay?: number, className?: string })` — wraps children in a fade+slide-up reveal triggered once when scrolled into view. `TiltCard` — `({ children: ReactNode, className?: string })` — wraps children in a mouse-parallax 3D tilt. Both consumed by Tasks 4–8. Reduced-motion handling for both is centralized later in Task 4 via a single `<MotionConfig reducedMotion="user">` wrapper in `Landing.tsx` — neither component needs its own reduced-motion branching.

- [ ] **Step 1: Create `RevealOnScroll.tsx`**

```tsx
import type { ReactNode } from "react";
import { motion } from "framer-motion";

interface RevealOnScrollProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

export const RevealOnScroll = ({ children, delay = 0, className }: RevealOnScrollProps) => {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
};
```

- [ ] **Step 2: Create `TiltCard.tsx`**

```tsx
import { type MouseEvent, type ReactNode } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

interface TiltCardProps {
  children: ReactNode;
  className?: string;
}

export const TiltCard = ({ children, className }: TiltCardProps) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [8, -8]), { stiffness: 200, damping: 20 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-8, 8]), { stiffness: 200, damping: 20 });

  const handleMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    x.set((event.clientX - bounds.left) / bounds.width - 0.5);
    y.set((event.clientY - bounds.top) / bounds.height - 0.5);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <div className={cn("[perspective:1000px]", className)} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
      <motion.div style={{ rotateX, rotateY }}>{children}</motion.div>
    </div>
  );
};
```

- [ ] **Step 3: Verify the build**

Run: `cd frontend && npm run build`
Expected: build completes with no errors. (Nothing imports these two files yet, so no visual check is possible until Task 4 — that's expected.)

- [ ] **Step 4: Commit**

```bash
git add frontend/src/components/landing/RevealOnScroll.tsx frontend/src/components/landing/TiltCard.tsx
git commit -m "feat: add RevealOnScroll and TiltCard landing motion primitives"
```

---

### Task 3: Move the product demo to `/app`, add the Landing route

**Files:**
- Modify: `frontend/src/App.tsx`
- Modify: `frontend/src/components/BottomNav.tsx`
- Modify: `frontend/src/components/Layout.tsx`
- Modify: `frontend/src/pages/Appointments.tsx`
- Modify: `frontend/src/pages/AgentCall.tsx`
- Create: `frontend/src/pages/Landing.tsx` (placeholder — filled in by Tasks 4–8)

**Interfaces:**
- Produces: the route table `/` → `Landing`, `/app` (+ `upload`/`summaries`/`appointments`/`insurance`) → existing pages inside `PhoneFrame`, `/app/agent-call` → `AgentCall` inside `PhoneFrame`, `*` → `NotFound`. Consumed by every later task (they build out `Landing.tsx` in place) and by the CTA links added in Tasks 4 and 8 (`Link to="/app"`).

- [ ] **Step 1: Create a placeholder `Landing.tsx`**

```tsx
export default function Landing() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background px-6 text-center">
      <h1 className="text-2xl font-semibold text-foreground">praanLink — landing page under construction</h1>
    </div>
  );
}
```

- [ ] **Step 2: Rewrite `App.tsx`'s route table**

Replace the full contents of `frontend/src/App.tsx` with:

```tsx
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { PhoneFrame } from "./components/PhoneFrame";
import Landing from "./pages/Landing";
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
          <Route path="/" element={<Landing />} />
          <Route
            path="/app"
            element={
              <PhoneFrame>
                <Layout />
              </PhoneFrame>
            }
          >
            <Route index element={<CheckIn />} />
            <Route path="upload" element={<Upload />} />
            <Route path="summaries" element={<Summaries />} />
            <Route path="appointments" element={<Appointments />} />
            <Route path="insurance" element={<Insurance />} />
          </Route>
          <Route
            path="/app/agent-call"
            element={
              <PhoneFrame>
                <AgentCall />
              </PhoneFrame>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
```

(`NotFound` now renders full-width, unwrapped by `PhoneFrame` — consistent with `Landing` also being unwrapped, since both are "outside the app shell" contexts.)

- [ ] **Step 3: Update `BottomNav.tsx`'s route table**

In `frontend/src/components/BottomNav.tsx`, find:

```tsx
export const navigation = [
  { name: "Check-In", href: "/", icon: MessageSquare },
  { name: "Upload", href: "/upload", icon: Upload },
  { name: "Summaries", href: "/summaries", icon: FileText },
  { name: "Appointments", href: "/appointments", icon: Calendar },
  { name: "Insurance", href: "/insurance", icon: Shield },
];
```

Replace with:

```tsx
export const navigation = [
  { name: "Check-In", href: "/app", icon: MessageSquare },
  { name: "Upload", href: "/app/upload", icon: Upload },
  { name: "Summaries", href: "/app/summaries", icon: FileText },
  { name: "Appointments", href: "/app/appointments", icon: Calendar },
  { name: "Insurance", href: "/app/insurance", icon: Shield },
];
```

Then find:

```tsx
        const isActive =
          item.href === "/" ? location.pathname === "/" : location.pathname.startsWith(item.href);

        return (
          <NavLink
            key={item.name}
            to={item.href}
            end={item.href === "/"}
```

Replace with:

```tsx
        const isActive =
          item.href === "/app" ? location.pathname === "/app" : location.pathname.startsWith(item.href);

        return (
          <NavLink
            key={item.name}
            to={item.href}
            end={item.href === "/app"}
```

- [ ] **Step 4: Update `Layout.tsx`'s active-route lookup**

In `frontend/src/components/Layout.tsx`, find:

```tsx
  const current = navigation.find((item) =>
    item.href === "/" ? location.pathname === "/" : location.pathname.startsWith(item.href)
  );
```

Replace with:

```tsx
  const current = navigation.find((item) =>
    item.href === "/app" ? location.pathname === "/app" : location.pathname.startsWith(item.href)
  );
```

- [ ] **Step 5: Update the hardcoded `/agent-call` navigation target**

In `frontend/src/pages/Appointments.tsx`, find:

```tsx
    navigate("/agent-call", { state: { hospital } });
```

Replace with:

```tsx
    navigate("/app/agent-call", { state: { hospital } });
```

- [ ] **Step 6: Update the hardcoded `/appointments` navigation targets**

In `frontend/src/pages/AgentCall.tsx`, there are four identical occurrences of `navigate("/appointments")`. Replace every occurrence of:

```tsx
navigate("/appointments")
```

with:

```tsx
navigate("/app/appointments")
```

(All four call sites — lines ~611, ~636, ~748, ~753 — use the exact same string, so a project-wide find/replace of that literal string within this file is safe.)

- [ ] **Step 7: Verify the build**

Run: `cd frontend && npm run build`
Expected: build completes with no TypeScript/build errors.

- [ ] **Step 8: Manual click-through verification**

Run: `cd frontend && npm run dev`, open `http://localhost:8080/`.
Confirm:
- `/` shows the "landing page under construction" placeholder.
- `http://localhost:8080/app` shows the existing Check-In screen inside the phone frame, exactly as `/` used to.
- Bottom nav tabs (Upload, Summaries, Appointments, Insurance) all navigate correctly and highlight the active tab.
- On Appointments, clicking "Book Appointment" on any hospital navigates to `/app/agent-call` and the hospital context loads; the "Back"/"Back to appointments"/"Cancel" buttons return to `/app/appointments`.
- `http://localhost:8080/app/bogus` and `http://localhost:8080/bogus` both render `NotFound`.

- [ ] **Step 9: Commit**

```bash
git add frontend/src/App.tsx frontend/src/components/BottomNav.tsx frontend/src/components/Layout.tsx frontend/src/pages/Appointments.tsx frontend/src/pages/AgentCall.tsx frontend/src/pages/Landing.tsx
git commit -m "feat: move product demo to /app, add landing route placeholder"
```

---

### Task 4: Hero section

**Files:**
- Create: `frontend/src/components/landing/Hero.tsx`
- Modify: `frontend/src/pages/Landing.tsx`

**Interfaces:**
- Consumes: `TiltCard` from Task 2 (`src/components/landing/TiltCard.tsx`); `.landing-orb` CSS class from Task 1.
- Produces: `Hero` component, no props. Introduces the page-wide `<MotionConfig reducedMotion="user">` wrapper in `Landing.tsx`, which every later section relies on for automatic reduced-motion handling.

- [ ] **Step 1: Create `Hero.tsx`**

```tsx
import { ArrowRight, ChevronDown, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { TiltCard } from "./TiltCard";

export const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-background px-6 pb-24 pt-28 md:pt-36">
      <div className="landing-orb absolute -left-24 top-10 h-72 w-72 bg-primary/40" />
      <div
        className="landing-orb absolute -right-16 top-40 h-80 w-80 bg-secondary/30"
        style={{ animationDelay: "3s" }}
      />

      <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-16 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
            <Sparkles className="h-4 w-4" />
            Your proactive health companion
          </span>

          <h1 className="mt-6 text-5xl font-bold leading-[1.05] tracking-tight text-foreground md:text-7xl">
            Healthcare that notices <span className="text-primary">before you do.</span>
          </h1>

          <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted-foreground md:text-xl">
            PraanLink checks in on you like someone who actually cares — spotting patterns, catching
            early warning signs, and guiding you to care before small things become big ones.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Button asChild size="lg" className="group h-14 rounded-full px-8 text-base">
              <Link to="/app">
                Try PraanLink
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <a
              href="#workflow"
              className="flex items-center gap-1.5 text-base font-medium text-foreground/80 hover:text-primary"
            >
              See how it works
              <ChevronDown className="h-4 w-4" />
            </a>
          </div>
        </motion.div>

        <motion.div
          className="relative mx-auto w-full max-w-sm"
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <TiltCard className="mx-auto w-64">
            <div className="mx-auto rounded-[2.5rem] border border-border bg-card p-3 shadow-2xl">
              <div className="rounded-[2rem] bg-gradient-to-br from-primary-lighter to-secondary/20 p-5">
                <p className="text-sm text-muted-foreground">Good morning, Ananya</p>
                <p className="mt-1 text-lg font-semibold text-foreground">How are you feeling today?</p>
                <div className="mt-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
                  <Sparkles className="h-6 w-6" />
                </div>
                <div className="mt-6 rounded-2xl bg-card p-4 shadow-sm">
                  <p className="text-xs font-medium text-muted-foreground">This week</p>
                  <p className="mt-1 text-sm font-semibold text-foreground">Energy trending steady</p>
                </div>
              </div>
            </div>
          </TiltCard>

          <motion.div
            className="absolute -left-8 top-6 rounded-2xl border border-border bg-card px-4 py-3 shadow-lg"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <p className="text-xs font-medium text-muted-foreground">Lab report</p>
            <p className="text-sm font-semibold text-primary">Analyzed ✓</p>
          </motion.div>

          <motion.div
            className="absolute -right-6 bottom-10 rounded-2xl border border-border bg-card px-4 py-3 shadow-lg"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          >
            <p className="text-xs font-medium text-muted-foreground">Next check-in</p>
            <p className="text-sm font-semibold text-foreground">Thursday</p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
```

- [ ] **Step 2: Wire it into `Landing.tsx`**

Replace the full contents of `frontend/src/pages/Landing.tsx` with:

```tsx
import { MotionConfig } from "framer-motion";
import { Hero } from "@/components/landing/Hero";

export default function Landing() {
  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen w-full overflow-x-hidden bg-background">
        <Hero />
      </div>
    </MotionConfig>
  );
}
```

- [ ] **Step 3: Verify the build**

Run: `cd frontend && npm run build`
Expected: build completes with no errors.

- [ ] **Step 4: Manual visual verification**

Run: `cd frontend && npm run dev`, open `http://localhost:8080/`.
Confirm: headline and CTA fade/slide in on load; the phone mockup tilts as the mouse moves over it; the two floating chips bob gently; the "Try PraanLink" button navigates to `/app`; "See how it works" scrolls (currently to nowhere yet, since `#workflow` doesn't exist until Task 7 — that's expected at this point).

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/landing/Hero.tsx frontend/src/pages/Landing.tsx
git commit -m "feat: add landing page hero section"
```

---

### Task 5: Problem and Solution sections

**Files:**
- Create: `frontend/src/components/landing/ProblemSection.tsx`
- Create: `frontend/src/components/landing/SolutionSection.tsx`
- Modify: `frontend/src/pages/Landing.tsx`

**Interfaces:**
- Consumes: `RevealOnScroll` from Task 2.
- Produces: `ProblemSection` and `SolutionSection` components, no props, each rendering one `<section>` with an anchor `id` (`problem`, none needed for Solution).

- [ ] **Step 1: Create `ProblemSection.tsx`**

```tsx
import { AlertTriangle, Clock, FileStack, HelpCircle, History } from "lucide-react";
import { RevealOnScroll } from "./RevealOnScroll";

const problems = [
  {
    icon: Clock,
    title: "No time to slow down",
    body: "Time, complexity, and language get in the way of getting help when you need it.",
  },
  {
    icon: FileStack,
    title: "Your health data is scattered",
    body: "Lab reports, prescriptions, and conversations end up in different places — and none of them talk to each other.",
  },
  {
    icon: History,
    title: "No one remembers your story",
    body: "Every visit starts from zero, because nothing keeps track of your health over time.",
  },
  {
    icon: AlertTriangle,
    title: "Warning signs go unnoticed",
    body: "Small changes get missed until they turn into something that could have been caught early.",
  },
  {
    icon: HelpCircle,
    title: "Insurance feels like a maze",
    body: "Finding the right cover for your actual needs shouldn't require a translator.",
  },
];

export const ProblemSection = () => {
  return (
    <section id="problem" className="bg-background px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <RevealOnScroll>
          <h2 className="max-w-2xl text-3xl font-bold tracking-tight text-foreground md:text-5xl">
            Getting healthy care shouldn&apos;t feel this hard.
          </h2>
        </RevealOnScroll>

        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {problems.map((problem, index) => (
            <RevealOnScroll key={problem.title} delay={index * 0.08}>
              <div className="h-full rounded-2xl border border-border bg-card p-6 shadow-sm">
                <problem.icon className="h-8 w-8 text-primary" />
                <h3 className="mt-4 text-lg font-semibold text-foreground">{problem.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{problem.body}</p>
              </div>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
};
```

- [ ] **Step 2: Create `SolutionSection.tsx`**

```tsx
import { Compass, Eye, Lightbulb } from "lucide-react";
import { RevealOnScroll } from "./RevealOnScroll";

const steps = [
  {
    icon: Eye,
    title: "Notice",
    body: "We check in regularly, in conversation, and quietly track what changes.",
  },
  {
    icon: Lightbulb,
    title: "Understand",
    body: "Every report, prescription, and conversation comes together into one clear story.",
  },
  {
    icon: Compass,
    title: "Act",
    body: "When something needs attention, we help you get to the right doctor — or the right cover — with everything already in hand.",
  },
];

export const SolutionSection = () => {
  return (
    <section className="bg-primary-lighter/40 px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <RevealOnScroll className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-5xl">
            Meet your health steward.
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            PraanLink stays close, pays attention, and turns everything it learns into a plan you can
            actually act on.
          </p>
        </RevealOnScroll>

        <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
          {steps.map((step, index) => (
            <RevealOnScroll key={step.title} delay={index * 0.1}>
              <div className="relative rounded-2xl bg-card p-8 text-center shadow-md">
                <span className="absolute -top-4 left-1/2 flex h-8 w-8 -translate-x-1/2 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  {index + 1}
                </span>
                <step.icon className="mx-auto h-10 w-10 text-primary" />
                <h3 className="mt-4 text-xl font-semibold text-foreground">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
              </div>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
};
```

- [ ] **Step 3: Wire both into `Landing.tsx`**

Replace the full contents of `frontend/src/pages/Landing.tsx` with:

```tsx
import { MotionConfig } from "framer-motion";
import { Hero } from "@/components/landing/Hero";
import { ProblemSection } from "@/components/landing/ProblemSection";
import { SolutionSection } from "@/components/landing/SolutionSection";

export default function Landing() {
  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen w-full overflow-x-hidden bg-background">
        <Hero />
        <ProblemSection />
        <SolutionSection />
      </div>
    </MotionConfig>
  );
}
```

- [ ] **Step 4: Verify the build**

Run: `cd frontend && npm run build`
Expected: build completes with no errors.

- [ ] **Step 5: Manual visual verification**

Run: `cd frontend && npm run dev`, open `http://localhost:8080/`, scroll past the hero.
Confirm: the 5 problem cards fade/slide in staggered as you scroll to them; the 3 numbered solution steps fade in staggered underneath a tinted band.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/components/landing/ProblemSection.tsx frontend/src/components/landing/SolutionSection.tsx frontend/src/pages/Landing.tsx
git commit -m "feat: add landing page problem and solution sections"
```

---

### Task 6: Features section

**Files:**
- Create: `frontend/src/components/landing/FeaturesSection.tsx`
- Modify: `frontend/src/pages/Landing.tsx`

**Interfaces:**
- Consumes: `RevealOnScroll` and `TiltCard` from Task 2.
- Produces: `FeaturesSection` component, no props, rendering `<section id="features">`.

- [ ] **Step 1: Create `FeaturesSection.tsx`**

```tsx
import { FileUp, MessageCircle, ShieldCheck, Stethoscope, TrendingUp } from "lucide-react";
import { RevealOnScroll } from "./RevealOnScroll";
import { TiltCard } from "./TiltCard";

const features = [
  {
    icon: MessageCircle,
    title: "A check-in that feels like being heard",
    body: "Natural, conversational weekly check-ins — in English or Hindi — that pick up on how you're really doing, not just a symptom checklist.",
  },
  {
    icon: FileUp,
    title: "Upload once. Understand everything.",
    body: "Drop in a lab report or prescription and skip the manual data entry — we read it and tell you what it means.",
  },
  {
    icon: TrendingUp,
    title: "Your whole health story, in one place",
    body: "See trends, risks, and changes over time — a clear, patient-friendly picture instead of a stack of PDFs.",
  },
  {
    icon: Stethoscope,
    title: "The homework's done before you see a doctor",
    body: "When it's time for a specialist, we help find the right one, book the visit, and send them your context ahead of time.",
  },
  {
    icon: ShieldCheck,
    title: "Insurance that actually makes sense",
    body: "Get plan recommendations matched to your real health profile — explained in plain language, not policy-speak.",
  },
];

export const FeaturesSection = () => {
  return (
    <section id="features" className="bg-background px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <RevealOnScroll className="max-w-2xl">
          <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-5xl">
            Everything you need, nothing you don&apos;t.
          </h2>
        </RevealOnScroll>

        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <RevealOnScroll key={feature.title} delay={index * 0.08}>
              <TiltCard>
                <div className="h-full rounded-2xl border border-border bg-card p-7 shadow-sm transition-shadow hover:shadow-xl">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mt-5 text-lg font-semibold text-foreground">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{feature.body}</p>
                </div>
              </TiltCard>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
};
```

- [ ] **Step 2: Wire it into `Landing.tsx`**

Replace the full contents of `frontend/src/pages/Landing.tsx` with:

```tsx
import { MotionConfig } from "framer-motion";
import { Hero } from "@/components/landing/Hero";
import { ProblemSection } from "@/components/landing/ProblemSection";
import { SolutionSection } from "@/components/landing/SolutionSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";

export default function Landing() {
  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen w-full overflow-x-hidden bg-background">
        <Hero />
        <ProblemSection />
        <SolutionSection />
        <FeaturesSection />
      </div>
    </MotionConfig>
  );
}
```

- [ ] **Step 3: Verify the build**

Run: `cd frontend && npm run build`
Expected: build completes with no errors.

- [ ] **Step 4: Manual visual verification**

Run: `cd frontend && npm run dev`, open `http://localhost:8080/`, scroll to the features grid.
Confirm: 5 feature cards render in a responsive grid; hovering a card tilts it toward the cursor and lifts its shadow.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/landing/FeaturesSection.tsx frontend/src/pages/Landing.tsx
git commit -m "feat: add landing page features section"
```

---

### Task 7: Workflow section (dark spectacle centerpiece)

**Files:**
- Create: `frontend/src/components/landing/WorkflowSection.tsx`
- Modify: `frontend/src/pages/Landing.tsx`

**Interfaces:**
- Consumes: `RevealOnScroll` from Task 2; `.landing-orb` and `.landing-glass-card` CSS classes plus `--landing-dark-bg`/`--landing-glow-primary`/`--landing-glow-accent` tokens from Task 1.
- Produces: `WorkflowSection` component, no props, rendering `<section id="workflow">`.

- [ ] **Step 1: Create `WorkflowSection.tsx`**

```tsx
import { CircleCheck, Compass, Eye, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import { RevealOnScroll } from "./RevealOnScroll";

const steps = [
  {
    icon: MessageCircle,
    title: "Check in",
    body: "A quick, human conversation — however often you need it.",
  },
  {
    icon: Eye,
    title: "We notice patterns",
    body: "Quietly, in the background, across everything you share.",
  },
  {
    icon: CircleCheck,
    title: "You get clarity",
    body: "A clear, honest picture of where things stand — no jargon.",
  },
  {
    icon: Compass,
    title: "We connect you to care",
    body: "The right doctor or the right plan, with the context already there.",
  },
];

export const WorkflowSection = () => {
  return (
    <section
      id="workflow"
      className="relative overflow-hidden px-6 py-28"
      style={{ backgroundColor: "hsl(var(--landing-dark-bg))" }}
    >
      <div className="landing-orb absolute left-1/4 top-0 h-96 w-96 bg-primary/50" />
      <div
        className="landing-orb absolute bottom-0 right-1/4 h-80 w-80 bg-accent/40"
        style={{ animationDelay: "2s" }}
      />

      <div className="relative mx-auto max-w-3xl">
        <RevealOnScroll className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white md:text-5xl">
            How it feels, step by step.
          </h2>
        </RevealOnScroll>

        <div className="relative mt-20">
          <div className="absolute left-6 top-0 h-full w-px md:left-1/2">
            <motion.div
              className="h-full w-full origin-top"
              style={{
                background:
                  "linear-gradient(to bottom, hsl(var(--landing-glow-primary)), hsl(var(--landing-glow-accent)))",
                boxShadow: "0 0 16px hsl(var(--landing-glow-primary) / 0.8)",
              }}
              initial={{ scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, ease: "easeInOut" }}
            />
          </div>

          <div className="space-y-12">
            {steps.map((step, index) => (
              <RevealOnScroll key={step.title} delay={index * 0.15} className="relative pl-16 md:pl-0">
                <div
                  className={`md:flex md:items-center md:gap-10 ${
                    index % 2 === 1 ? "md:flex-row-reverse md:text-right" : ""
                  }`}
                >
                  <div className="md:w-1/2" />
                  <div className="landing-glass-card rounded-2xl p-6 md:w-1/2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-white/50">
                      Step {index + 1}
                    </span>
                    <h3 className="mt-2 text-xl font-semibold text-white">{step.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-white/70">{step.body}</p>
                  </div>
                </div>
                <div
                  className="absolute left-6 top-1 flex h-8 w-8 -translate-x-1/2 items-center justify-center rounded-full text-white md:left-1/2"
                  style={{ background: "hsl(var(--landing-glow-primary))" }}
                >
                  <step.icon className="h-4 w-4" />
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
```

- [ ] **Step 2: Wire it into `Landing.tsx`**

Replace the full contents of `frontend/src/pages/Landing.tsx` with:

```tsx
import { MotionConfig } from "framer-motion";
import { Hero } from "@/components/landing/Hero";
import { ProblemSection } from "@/components/landing/ProblemSection";
import { SolutionSection } from "@/components/landing/SolutionSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { WorkflowSection } from "@/components/landing/WorkflowSection";

export default function Landing() {
  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen w-full overflow-x-hidden bg-background">
        <Hero />
        <ProblemSection />
        <SolutionSection />
        <FeaturesSection />
        <WorkflowSection />
      </div>
    </MotionConfig>
  );
}
```

- [ ] **Step 3: Verify the build**

Run: `cd frontend && npm run build`
Expected: build completes with no errors.

- [ ] **Step 4: Manual visual verification**

Run: `cd frontend && npm run dev`, open `http://localhost:8080/`, scroll to the dark workflow section (also reachable via the hero's "See how it works" link, which should now scroll smoothly to this section).
Confirm: background shifts to dark teal-black with drifting glow orbs; the connecting line draws itself top-to-bottom as you scroll; the 4 step cards alternate left/right on desktop and stack left-aligned on mobile.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/landing/WorkflowSection.tsx frontend/src/pages/Landing.tsx
git commit -m "feat: add landing page dark workflow section"
```

---

### Task 8: Final CTA and Footer

**Files:**
- Create: `frontend/src/components/landing/CtaSection.tsx`
- Create: `frontend/src/components/landing/LandingFooter.tsx`
- Modify: `frontend/src/pages/Landing.tsx`

**Interfaces:**
- Consumes: `RevealOnScroll` from Task 2.
- Produces: `CtaSection` and `LandingFooter` components, no props. Completes `Landing.tsx`'s final composition.

- [ ] **Step 1: Create `CtaSection.tsx`**

```tsx
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { RevealOnScroll } from "./RevealOnScroll";

export const CtaSection = () => {
  return (
    <section className="bg-background px-6 py-28">
      <RevealOnScroll className="mx-auto max-w-3xl text-center">
        <h2 className="text-4xl font-bold tracking-tight text-foreground md:text-6xl">
          Your health deserves a steward, not a spreadsheet.
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
          Start the kind of care that shows up before you have to ask.
        </p>
        <div className="mt-10">
          <Button asChild size="lg" className="group h-14 rounded-full px-10 text-base">
            <Link to="/app">
              Try PraanLink
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
      </RevealOnScroll>
    </section>
  );
};
```

- [ ] **Step 2: Create `LandingFooter.tsx`**

```tsx
import { HeartPulse } from "lucide-react";

const links = [
  { label: "The problem", href: "#problem" },
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#workflow" },
];

export const LandingFooter = () => {
  return (
    <footer className="border-t border-border bg-background px-6 py-12">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 md:flex-row">
        <div className="flex items-center gap-2">
          <HeartPulse className="h-5 w-5 text-primary" />
          <div>
            <p className="font-semibold text-foreground">praanLink</p>
            <p className="text-xs text-muted-foreground">Empathy meets intelligence.</p>
          </div>
        </div>

        <nav className="flex flex-wrap items-center gap-6">
          {links.map((link) => (
            <a key={link.href} href={link.href} className="text-sm text-muted-foreground hover:text-primary">
              {link.label}
            </a>
          ))}
        </nav>

        <p className="text-xs text-muted-foreground">© 2026 PraanLink</p>
      </div>
    </footer>
  );
};
```

- [ ] **Step 3: Complete `Landing.tsx`**

Replace the full contents of `frontend/src/pages/Landing.tsx` with:

```tsx
import { MotionConfig } from "framer-motion";
import { Hero } from "@/components/landing/Hero";
import { ProblemSection } from "@/components/landing/ProblemSection";
import { SolutionSection } from "@/components/landing/SolutionSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { WorkflowSection } from "@/components/landing/WorkflowSection";
import { CtaSection } from "@/components/landing/CtaSection";
import { LandingFooter } from "@/components/landing/LandingFooter";

export default function Landing() {
  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen w-full overflow-x-hidden bg-background">
        <Hero />
        <ProblemSection />
        <SolutionSection />
        <FeaturesSection />
        <WorkflowSection />
        <CtaSection />
        <LandingFooter />
      </div>
    </MotionConfig>
  );
}
```

- [ ] **Step 4: Verify the build**

Run: `cd frontend && npm run build`
Expected: build completes with no errors.

- [ ] **Step 5: Manual visual verification**

Run: `cd frontend && npm run dev`, open `http://localhost:8080/`, scroll to the very bottom.
Confirm: closing CTA renders with a working "Try PraanLink" button (→ `/app`); footer's three anchor links (`#problem`, `#features`, `#workflow`) each scroll to the correct section.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/components/landing/CtaSection.tsx frontend/src/components/landing/LandingFooter.tsx frontend/src/pages/Landing.tsx
git commit -m "feat: add landing page final CTA and footer"
```

---

### Task 9: End-to-end verification and push

**Files:** none (verification only)

**Interfaces:** none

- [ ] **Step 1: Full build check**

Run: `cd frontend && npm run build`
Expected: completes with no TypeScript/build errors.

- [ ] **Step 2: Full manual click-through**

Run: `cd frontend && npm run dev`, open `http://localhost:8080/`.
Confirm, in order:
1. Landing page loads at `/`, all 7 sections render in order, no console errors.
2. Both "Try PraanLink" CTAs (hero + closing) and all 3 footer anchor links work.
3. `/app` shows the Check-In screen inside the phone frame; all 5 bottom-nav tabs work and highlight correctly; every existing page's own buttons/handlers still fire (spot-check Upload's file picker dialog and Summaries' tabs).
4. Appointments → "Book Appointment" → lands on `/app/agent-call` with hospital context; its back/cancel buttons return to `/app/appointments`.
5. `/app/does-not-exist` and `/does-not-exist` both render `NotFound`.

- [ ] **Step 3: Reduced-motion check**

In Chrome DevTools, open the Rendering tab and set "Emulate CSS media feature `prefers-reduced-motion`" to `reduce`. Reload `/`.
Confirm: hero chips no longer bob, tilt cards no longer tilt, background orbs no longer drift, the workflow connecting line no longer animates its draw — but all text and layout remain fully visible and readable.

- [ ] **Step 4: Responsive check**

Resize the browser (or use device toolbar) to ~375px width.
Confirm: every section stacks to a single column with no horizontal scrollbar; the workflow timeline collapses to a left-aligned single column with the icon markers and glass cards still aligned to the line.

- [ ] **Step 5: Confirm clean git state**

Run: `git status`
Expected: `nothing to commit, working tree clean` (every prior task already committed its own changes).

- [ ] **Step 6: Push to the fork remote**

Run: `git push fork main`
Expected: all local commits (including this feature's 9 task commits and the 15 pre-existing commits already on `main`) are pushed to `anmolsureka-unloq/PraanLink-DD`. Do not push to `origin`.
