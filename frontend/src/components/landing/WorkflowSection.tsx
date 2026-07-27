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
