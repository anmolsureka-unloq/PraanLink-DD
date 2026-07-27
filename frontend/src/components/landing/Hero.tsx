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
