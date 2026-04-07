import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { Menu, Moon, Sun, ChevronDown, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { useTranslation, languages } from "@/contexts/TranslationContext";
import { Trans } from "@/components/ui/Trans";
import { Sidebar } from "./Sidebar";
import { useTheme } from "@/contexts/ThemeContext";

const links = [
  { name: "BERANDA", path: "/" },
  { name: "TENTANG", path: "/tentang" },
  { name: "LPJ", path: "/lpj" },
  { name: "MUBES", path: "/mubes" },
  { name: "AD/ART", path: "/adart" },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isHomePage = location.pathname === "/";
  const useDarkText = true; // Always use dark text since the home page hero is now light
  const isLpjDetail = location.pathname.startsWith("/lpj/") && location.pathname !== "/lpj";
  
  const { currentLang, setLanguage } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  
  const langMenuRef = useRef<HTMLDivElement>(null);
  const mobileLangMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setIsLangOpen(false);
      }
      if (mobileLangMenuRef.current && !mobileLangMenuRef.current.contains(event.target as Node)) {
        setIsLangOpen(false);
      }
    };
    
    if (isLangOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isLangOpen]);

  useEffect(() => {
    setIsOpen(false);
    setIsLangOpen(false);
  }, [location.pathname]);

  return (
    <>
      <header
        className={cn(
          "fixed top-0 w-full z-50 transition-all duration-500 border-b border-transparent",
          scrolled
            ? "bg-white dark:bg-slate-950 shadow-md py-3"
            : "bg-transparent py-5"
        )}
      >
        <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3 z-50">
            {isLpjDetail && (
              <button 
                onClick={() => navigate("/lpj")}
                className={cn(
                  "p-2 rounded-full transition-colors",
                  useDarkText ? "text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800" : "text-white hover:bg-white/20"
                )}
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="flex flex-col">
                <span className={cn("font-heading font-extrabold text-xl md:text-2xl tracking-tight leading-none transition-colors duration-300", useDarkText ? "text-slate-900 dark:text-white" : "text-white")}>
                  CAKRAWALA
                </span>
                <span className={cn("text-[10px] md:text-xs font-light tracking-wider transition-colors duration-300 mt-1", useDarkText ? "text-slate-500 dark:text-slate-400" : "text-slate-300")}>
                  BEM STIE WIKARA 2025/2026
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {links.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  "px-3 py-2 text-sm font-medium transition-all duration-300 relative group uppercase",
                  useDarkText ? "text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400" : "text-slate-200 hover:text-blue-400",
                  (link.path === "/" ? location.pathname === "/" : location.pathname.startsWith(link.path)) && "text-blue-600 dark:text-blue-400"
                )}
              >
                <span className="relative z-10"><Trans>{link.name}</Trans></span>
              </Link>
            ))}
            
            <div className="relative ml-2" ref={langMenuRef}>
              <button
                onClick={() => setIsLangOpen(!isLangOpen)}
                className={cn(
                  "flex items-center gap-1 px-2 py-1.5 rounded-lg transition-colors",
                  useDarkText ? "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800" : "text-white hover:bg-white/20"
                )}
              >
                <img src={`https://flagcdn.com/w40/${currentLang.flagCode}.png`} alt={currentLang.name} className="w-5 h-auto rounded-sm" />
                <ChevronDown className="w-3 h-3" />
              </button>
              
              <AnimatePresence>
                {isLangOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-36 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden z-50"
                  >
                    <div className="py-1">
                      {languages.map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => {
                            setLanguage(lang);
                            setIsLangOpen(false);
                          }}
                          className={cn(
                            "w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors text-left",
                            currentLang.code === lang.code 
                              ? "bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-medium" 
                              : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                          )}
                        >
                          <img src={`https://flagcdn.com/w40/${lang.flagCode}.png`} alt={lang.name} className="w-5 h-auto rounded-sm" />
                          {lang.name}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button 
              onClick={toggleTheme}
              className={cn(
                "ml-2 p-2 rounded-full transition-colors",
                useDarkText ? "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800" : "text-white hover:bg-white/20"
              )}
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </nav>

          {/* Mobile Toggle & Language */}
          <div className="flex items-center gap-2 lg:hidden z-50">
            <div className="relative" ref={mobileLangMenuRef}>
              <button
                onClick={() => setIsLangOpen(!isLangOpen)}
                className={cn(
                  "flex items-center gap-1 px-2 py-1.5 rounded-lg transition-colors",
                  useDarkText ? "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800" : "text-white hover:bg-white/20"
                )}
              >
                <img src={`https://flagcdn.com/w40/${currentLang.flagCode}.png`} alt={currentLang.name} className="w-5 h-auto rounded-sm" />
                <ChevronDown className="w-3 h-3" />
              </button>
              
              <AnimatePresence>
                {isLangOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-36 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden z-50"
                  >
                    <div className="py-1">
                      {languages.map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => {
                            setLanguage(lang);
                            setIsLangOpen(false);
                          }}
                          className={cn(
                            "w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors text-left",
                            currentLang.code === lang.code 
                              ? "bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-medium" 
                              : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                          )}
                        >
                          <img src={`https://flagcdn.com/w40/${lang.flagCode}.png`} alt={lang.name} className="w-5 h-auto rounded-sm" />
                          {lang.name}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <button
              className="p-2"
              onClick={() => setIsOpen(true)}
            >
              <Menu className={cn("w-6 h-6", useDarkText ? "text-slate-900 dark:text-white" : "text-white")} />
            </button>
          </div>
        </div>
      </header>

      <Sidebar 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
        isDark={isDark} 
        toggleTheme={toggleTheme} 
      />
    </>
  );
}
