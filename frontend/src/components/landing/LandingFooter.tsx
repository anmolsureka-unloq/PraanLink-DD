import { HeartPulse } from "lucide-react";

const links = [
  { label: "The problem", href: "#problem" },
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#workflow" },
];

export const LandingFooter = () => {
  return (
    <footer className="border-t border-border bg-background px-6 py-12">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 md:flex-row">
        <div className="flex items-center gap-2">
          <HeartPulse className="h-5 w-5 text-primary" />
          <div>
            <p className="font-semibold text-foreground">praanLink</p>
            <p className="text-xs text-muted-foreground">Empathy meets intelligence.</p>
          </div>
        </div>

        <nav className="flex flex-wrap items-center gap-6">
          {links.map((link) => (
            <a key={link.href} href={link.href} className="text-sm text-muted-foreground hover:text-primary">
              {link.label}
            </a>
          ))}
        </nav>

        <p className="text-xs text-muted-foreground">© 2026 praanLink</p>
      </div>

      <p className="mx-auto mt-8 max-w-6xl text-center text-xs text-muted-foreground">
        PraanLink supports your health journey and does not replace professional medical advice.
      </p>
    </footer>
  );
};
