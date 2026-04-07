import { X, Moon, Sun, Globe, Home, FileText, Users, BookOpen, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { Trans } from "@/components/ui/Trans";
import { NavLink } from "react-router-dom";
import { createPortal } from "react-dom";
import { useEffect } from "react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
  toggleTheme: () => void;
}

export function Sidebar({ isOpen, onClose, isDark, toggleTheme }: SidebarProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const navItems = [
    { path: "/", label: "Beranda", icon: Home },
    { path: "/lpj", label: "LPJ", icon: FileText },
    { path: "/mubes", label: "Mubes", icon: Users },
    { path: "/adart", label: "AD/ART", icon: BookOpen },
    { path: "/tentang", label: "Tentang", icon: Info },
  ];

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm z-[100] lg:hidden"
          />
          
          {/* Sidebar */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 w-[280px] bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl shadow-2xl z-[101] lg:hidden flex flex-col border-l border-slate-200/50 dark:border-slate-800/50"
          >
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800/50">
              <span className="font-heading font-bold text-xl text-slate-900 dark:text-white tracking-tight">
                <Trans>Menu</Trans>
              </span>
              <button
                onClick={onClose}
                className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-8 pb-24">
              {/* Navigation Links */}
              <div className="space-y-1.5">
                {navItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group relative overflow-hidden",
                        isActive
                          ? "bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-semibold shadow-sm"
                          : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200"
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && (
                          <motion.div
                            layoutId="sidebarActiveIndicator"
                            className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary-500 rounded-r-full"
                          />
                        )}
                        <div className={cn(
                          "p-2 rounded-xl transition-colors relative z-10",
                          isActive ? "bg-white dark:bg-slate-800 shadow-sm" : "bg-slate-100 dark:bg-slate-800/50 group-hover:bg-white dark:group-hover:bg-slate-800"
                        )}>
                          <item.icon className={cn("w-5 h-5", isActive ? "stroke-[2.5px]" : "stroke-2")} />
                        </div>
                        <span className="text-sm relative z-10"><Trans>{item.label}</Trans></span>
                      </>
                    )}
                  </NavLink>
                ))}
              </div>

              {/* Theme Toggle */}
              <div className="space-y-4 px-2">
                <h3 className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  <Trans>Pengaturan</Trans>
                </h3>
                <button
                  onClick={toggleTheme}
                  className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-primary-200 dark:hover:border-primary-800/50 transition-all duration-300 group"
                >
                  <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                    <div className="p-2 rounded-xl bg-white dark:bg-slate-800 shadow-sm text-primary-500 dark:text-primary-400 group-hover:scale-110 transition-transform">
                      {isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                    </div>
                    <span className="text-sm font-medium">
                      <Trans>{isDark ? "Mode Gelap" : "Mode Terang"}</Trans>
                    </span>
                  </div>
                  <div className={cn(
                    "w-11 h-6 rounded-full p-1 transition-colors duration-300",
                    isDark ? "bg-primary-500" : "bg-slate-300 dark:bg-slate-700"
                  )}>
                    <div className={cn(
                      "w-4 h-4 rounded-full bg-white transition-transform duration-300 shadow-sm",
                      isDark ? "translate-x-5" : "translate-x-0"
                    )} />
                  </div>
                </button>
              </div>
            </div>
            
            <div className="p-6 border-t border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center justify-center gap-2 text-slate-400 dark:text-slate-500">
                <Globe className="w-4 h-4" />
                <p className="text-xs font-medium tracking-wide">
                  BEM STIE WIKARA &copy; 2025
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
