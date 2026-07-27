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
