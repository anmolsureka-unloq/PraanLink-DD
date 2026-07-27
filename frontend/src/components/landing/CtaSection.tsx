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
