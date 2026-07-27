import { ArrowRight, ChevronDown, HeartPulse } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-morning-checkin.jpg";

export const Hero = () => {
  return (
    <section className="relative isolate overflow-hidden bg-background">
      <div className="relative h-72 w-full sm:h-96 md:absolute md:inset-0 md:h-full md:w-full">
        <img
          src={heroImage}
          alt=""
          width={1672}
          height={941}
          loading="eager"
          className="h-full w-full object-cover object-[32%_38%] md:object-[26%_40%]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent md:hidden" />
        <div className="absolute inset-0 hidden bg-gradient-to-r from-transparent via-background/60 to-background md:block" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-6 py-10 md:flex md:min-h-[44rem] md:items-center md:py-32">
        <motion.div
          className="md:ml-auto md:w-[47%]"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
            <HeartPulse className="h-4 w-4" />
            Your proactive health companion
          </span>

          <h1 className="mt-6 text-5xl font-bold leading-[1.05] tracking-tight text-foreground md:text-6xl lg:text-7xl">
            Someone's finally keeping track, <span className="text-primary">so you don't have to.</span>
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
      </div>
    </section>
  );
};
