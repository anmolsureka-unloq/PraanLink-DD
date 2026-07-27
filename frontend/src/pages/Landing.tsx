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
