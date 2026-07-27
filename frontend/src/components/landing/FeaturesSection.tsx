import { FileUp, MessageCircle, ShieldCheck, Stethoscope, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { RevealOnScroll } from "./RevealOnScroll";
import { TiltCard } from "./TiltCard";
import telehealthIllustration from "@/assets/telehealth-illustration.png";

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
    image: telehealthIllustration,
    spotlight: true,
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
            <RevealOnScroll
              key={feature.title}
              delay={index * 0.08}
              className={feature.spotlight ? "lg:col-span-2" : undefined}
            >
              <TiltCard>
                <div
                  className={cn(
                    "h-full rounded-2xl border border-border bg-card p-7 shadow-sm transition-shadow hover:shadow-xl",
                    feature.spotlight && "flex flex-col gap-6 sm:flex-row sm:items-center",
                  )}
                >
                  <div className={feature.spotlight ? "sm:flex-1" : undefined}>
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="mt-5 text-lg font-semibold text-foreground">{feature.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{feature.body}</p>
                  </div>
                  {feature.image && (
                    <div className="h-32 w-full shrink-0 overflow-hidden rounded-xl bg-primary/5 sm:h-32 sm:w-32">
                      <img
                        src={feature.image}
                        alt=""
                        width={128}
                        height={128}
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </TiltCard>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
};
