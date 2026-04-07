import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { AgendaSidang } from "./AgendaSidang";
import { TOR } from "./TOR";
import { TataTertib } from "./TataTertib";
import { useNavigate, useLocation, Routes, Route, Navigate } from "react-router-dom";
import { Trans } from "@/components/ui/Trans";
import { MoreVertical, Download, FileText } from "lucide-react";
import { DownloadUnavailableModal } from "@/components/ui/DownloadUnavailableModal";

export function MubesContainer() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [documentName, setDocumentName] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);

  // Extract the current tab from the URL path
  const pathParts = location.pathname.split('/');
  const currentTab = pathParts[pathParts.length - 1];
  
  // Default to agenda if no valid tab is found
  const activeTab = ["agenda", "tor", "tartib"].includes(currentTab) ? currentTab : "agenda";

  const tabs = [
    { id: "agenda", label: "Agenda Sidang" },
    { id: "tor", label: "Term of Reference", desktopLabel: "Term of Reference (TOR)" },
    { id: "tartib", label: "Tata Tertib" },
  ];

  // Redirect to /mubes/agenda if just /mubes is accessed
  useEffect(() => {
    if (location.pathname === "/mubes" || location.pathname === "/mubes/") {
      navigate("/mubes/agenda", { replace: true });
    }
  }, [location.pathname, navigate]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDownloadClick = (e: React.MouseEvent, docName: string) => {
    e.preventDefault();
    setDocumentName(docName);
    setIsModalOpen(true);
    setIsMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 relative overflow-hidden">
      <DownloadUnavailableModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        documentName={documentName} 
      />
      {/* Hero Section */}
      <div className="relative pt-24 pb-10 md:pt-40 md:pb-20 px-4 md:px-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 z-20">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-1/4 w-[300px] h-[300px] md:w-[600px] md:h-[600px] bg-primary-500/5 rounded-full blur-[80px] md:blur-[100px] -translate-y-1/2" />
          <div className="absolute bottom-0 left-1/4 w-[300px] h-[300px] md:w-[600px] md:h-[600px] bg-sky-400/5 rounded-full blur-[80px] md:blur-[100px] translate-y-1/2" />
        </div>
        
        <div className="container mx-auto relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto mb-8 md:mb-10"
          >
            <div className="inline-block mb-2 md:mb-4 px-2.5 py-1 md:px-4 md:py-1.5 rounded-full bg-primary-50 dark:bg-primary-900/30 border border-primary-100 dark:border-primary-800">
              <span className="text-primary-600 dark:text-primary-400 font-medium text-xs md:text-sm tracking-wider uppercase"><Trans>Informasi Sidang</Trans></span>
            </div>
            <h1 className="text-2xl md:text-6xl font-bold mb-3 md:mb-6 font-heading text-slate-900 dark:text-white tracking-tight"><Trans>Musyawarah</Trans> <span className="text-gradient"><Trans>Besar</Trans></span></h1>
            <p className="text-sm md:text-xl text-slate-600 dark:text-slate-400 font-light leading-relaxed">
              <Trans>Forum pengambilan keputusan tertinggi organisasi kemahasiswaan STIE WIKARA.</Trans>
            </p>
          </motion.div>

          {/* Tabs Navigation */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col items-center gap-3 md:gap-6 max-w-4xl mx-auto"
          >
            <div className="flex flex-row items-center justify-center gap-2 w-full sm:w-auto">
              <div className="flex flex-wrap justify-center gap-1 md:gap-3 flex-1 sm:flex-none">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => navigate(`/mubes/${tab.id}`)}
                    className={`px-2.5 py-1.5 md:px-6 md:py-2.5 rounded-lg md:rounded-full text-[10px] md:text-sm font-medium transition-all duration-300 flex-1 sm:flex-none leading-tight ${
                      activeTab === tab.id
                        ? "bg-primary-600 text-white shadow-md shadow-primary-500/20"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                    }`}
                  >
                    <span className="md:hidden"><Trans>{tab.label}</Trans></span>
                    <span className="hidden md:inline"><Trans>{tab.desktopLabel || tab.label}</Trans></span>
                  </button>
                ))}
              </div>
              
              <div className="relative shrink-0" ref={menuRef}>
                <button 
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="p-1.5 md:p-2.5 rounded-lg md:rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors flex items-center justify-center h-full"
                  aria-label="Download options"
                >
                  <Download className="w-4 h-4 md:w-5 md:h-5" />
                </button>
                
                <AnimatePresence>
                  {isMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 10 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 sm:right-auto sm:left-1/2 sm:-translate-x-1/2 top-full mt-2 w-56 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden z-50"
                    >
                      <div className="p-2 flex flex-col gap-1">
                        <div className="px-3 py-2 text-[10px] md:text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          <Trans>Download PDF</Trans>
                        </div>
                        <a href="https://drive.google.com/uc?export=download&id=1eDw3oGr5zklAGiMJBOtGXD1sJ4dL18y-" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 md:gap-3 px-3 py-2 md:py-2.5 text-xs md:text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-left w-full">
                          <FileText className="w-3.5 h-3.5 md:w-4 md:h-4 text-slate-400" />
                          <Trans>Agenda Sidang</Trans>
                        </a>
                        <a href="https://drive.google.com/uc?export=download&id=1XVflpGthHUggu_SMcey5LeWLrlqpaQIZ" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 md:gap-3 px-3 py-2 md:py-2.5 text-xs md:text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-left w-full">
                          <FileText className="w-3.5 h-3.5 md:w-4 md:h-4 text-slate-400" />
                          <Trans>Term of Reference (TOR)</Trans>
                        </a>
                        <a href="https://drive.google.com/uc?export=download&id=1LAT9zXbwR-rDZfxD1rTAGu2NKrc7wii5" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 md:gap-3 px-3 py-2 md:py-2.5 text-xs md:text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-left w-full">
                          <FileText className="w-3.5 h-3.5 md:w-4 md:h-4 text-slate-400" />
                          <Trans>Tata Tertib</Trans>
                        </a>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
            
            {/* Portal target for Tata Tertib search bar */}
            <div id="mubes-search-portal" className="w-full max-w-2xl mx-auto empty:hidden"></div>
          </motion.div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="container mx-auto px-4 md:px-6 py-6 md:py-12 relative z-10">
        <div className="w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className={activeTab === "tartib" || activeTab === "tor" ? "w-full" : "max-w-5xl mx-auto"}
            >
              <Routes>
                <Route path="agenda" element={<AgendaSidang />} />
                <Route path="tor" element={<TOR />} />
                <Route path="tartib" element={<TataTertib />} />
                <Route path="*" element={<Navigate to="agenda" replace />} />
              </Routes>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
