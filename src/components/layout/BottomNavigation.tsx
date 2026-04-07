import { Link, useLocation } from "react-router-dom";
import { Home, FileText, Users, BookOpen, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Trans } from "@/components/ui/Trans";
import { useChat } from "@/contexts/ChatContext";
import { motion, AnimatePresence } from "motion/react";

const links = [
  { name: "Beranda", path: "/", icon: Home },
  { name: "LPJ", path: "/lpj", icon: FileText },
  { name: "Mubes", path: "/mubes", icon: Users },
  { name: "AD/ART", path: "/adart", icon: BookOpen },
];

export function BottomNavigation() {
  const location = useLocation();
  const { isChatOpen, openChat } = useChat();

  return (
    <AnimatePresence>
      {!isChatOpen && (
        <motion.div 
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          exit={{ y: 100 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="lg:hidden fixed bottom-0 left-0 right-0 z-[60] bg-white dark:bg-slate-950 border-t border-slate-200/60 dark:border-slate-800/60 pb-safe shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] dark:shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.5)]"
        >
          <div className="flex justify-around items-center h-[68px] px-2">
            {links.map((link) => {
              const isActive = link.path === "/" ? location.pathname === "/" : location.pathname.startsWith(link.path);
              const Icon = link.icon;
              
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={cn(
                    "relative flex flex-col items-center justify-center w-full h-full transition-all duration-300",
                    isActive ? "text-primary-600 dark:text-primary-400" : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                  )}
                >
                  <div className="relative z-10 flex flex-col items-center justify-center gap-1 w-full h-full">
                    <div className={cn(
                      "relative flex items-center justify-center w-14 h-8 rounded-full transition-all duration-300",
                      isActive ? "bg-primary-100 dark:bg-primary-900/40" : "bg-transparent"
                    )}>
                      <Icon className={cn(
                        "w-5 h-5 transition-all duration-300",
                        isActive ? "scale-110 stroke-[2.5px]" : "stroke-2"
                      )} />
                    </div>
                    <span className={cn(
                      "text-[10px] font-medium tracking-wide transition-all duration-300",
                      isActive ? "opacity-100 font-semibold" : "opacity-70"
                    )}>
                      <Trans>{link.name}</Trans>
                    </span>
                  </div>
                </Link>
              );
            })}
            
            {/* Chat Button */}
            <button
              onClick={openChat}
              className={cn(
                "relative flex flex-col items-center justify-center w-full h-full transition-all duration-300",
                isChatOpen ? "text-primary-600 dark:text-primary-400" : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
              )}
            >
              <div className="relative z-10 flex flex-col items-center justify-center gap-1 w-full h-full">
                <div className={cn(
                  "relative flex items-center justify-center w-14 h-8 rounded-full transition-all duration-300",
                  isChatOpen ? "bg-primary-100 dark:bg-primary-900/40" : "bg-transparent"
                )}>
                  <MessageCircle className={cn(
                    "w-5 h-5 transition-all duration-300",
                    isChatOpen ? "scale-110 stroke-[2.5px]" : "stroke-2"
                  )} />
                </div>
                <span className={cn(
                  "text-[10px] font-medium tracking-wide transition-all duration-300",
                  isChatOpen ? "opacity-100 font-semibold" : "opacity-70"
                )}>
                  <Trans>Chat</Trans>
                </span>
              </div>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
