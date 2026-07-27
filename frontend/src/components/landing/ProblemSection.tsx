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
