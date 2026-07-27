import { Compass, Eye, Lightbulb } from "lucide-react";
import { RevealOnScroll } from "./RevealOnScroll";

const steps = [
  {
    icon: Eye,
    title: "Notice",
    body: "We check in weekly, in conversation, and quietly track what changes.",
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
