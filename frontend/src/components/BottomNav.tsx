import { NavLink, useLocation } from "react-router-dom";
import { MessageSquare, Upload, FileText, Calendar, Shield } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const navigation = [
  { name: "Check-In", href: "/", icon: MessageSquare },
  { name: "Upload", href: "/upload", icon: Upload },
  { name: "Summaries", href: "/summaries", icon: FileText },
  { name: "Appointments", href: "/appointments", icon: Calendar },
  { name: "Insurance", href: "/insurance", icon: Shield },
];

export const BottomNav = () => {
  const location = useLocation();

  return (
    <nav
      className="flex flex-shrink-0 items-stretch justify-around border-t border-border bg-card/95 px-1 pt-2 backdrop-blur"
      style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}
    >
      {navigation.map((item) => {
        const isActive =
          item.href === "/" ? location.pathname === "/" : location.pathname.startsWith(item.href);

        return (
          <NavLink
            key={item.name}
            to={item.href}
            end={item.href === "/"}
            className="relative flex flex-1 flex-col items-center gap-1 py-1 text-caption"
          >
            {isActive && (
              <motion.div
                layoutId="bottom-nav-indicator"
                className="absolute -top-2 h-0.5 w-8 rounded-full bg-primary"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <item.icon
              className={cn("h-6 w-6 transition-smooth", isActive ? "text-primary" : "text-muted-foreground")}
              strokeWidth={isActive ? 2.4 : 1.8}
            />
            <span className={cn(isActive ? "font-semibold text-primary" : "text-muted-foreground")}>
              {item.name}
            </span>
          </NavLink>
        );
      })}
    </nav>
  );
};
