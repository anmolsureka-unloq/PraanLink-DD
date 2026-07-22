import { Outlet, useLocation } from "react-router-dom";
import { Activity } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { BottomNav, navigation } from "./BottomNav";

export const Layout = () => {
  const location = useLocation();
  const current = navigation.find((item) =>
    item.href === "/" ? location.pathname === "/" : location.pathname.startsWith(item.href)
  );

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-background">
      <header className="flex h-14 flex-shrink-0 items-center gap-2 border-b border-border bg-card/80 px-4 backdrop-blur">
        <Activity className="h-5 w-5 text-primary" />
        <h1 className="text-subtitle text-foreground">{current?.name ?? "PraanLink"}</h1>
      </header>
      <main className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="h-full"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      <BottomNav />
    </div>
  );
};
