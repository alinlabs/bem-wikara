import { Outlet, useLocation } from "react-router-dom";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { BottomNavigation } from "./BottomNavigation";
import { AnimatePresence, motion, useScroll, useSpring } from "motion/react";
import { ChatWidget } from "../chat/ChatWidget";

export function Layout() {
  const { pathname } = useLocation();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Use base path for animation key so sub-route changes don't trigger full page transitions
  const basePath = pathname.split('/')[1] || 'home';

  return (
    <div className="min-h-screen flex flex-col font-sans bg-slate-50 dark:bg-slate-950 transition-colors duration-300 pb-14 lg:pb-0 overflow-x-hidden">
      <Navbar />
      <main className="flex-grow min-h-[calc(100vh-400px)] w-full overflow-x-hidden">
        <AnimatePresence mode="wait" onExitComplete={() => window.scrollTo(0, 0)}>
          <motion.div
            key={basePath}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="w-full"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
      <BottomNavigation />
      <ChatWidget />
    </div>
  );
}
