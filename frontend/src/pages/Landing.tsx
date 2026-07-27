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
