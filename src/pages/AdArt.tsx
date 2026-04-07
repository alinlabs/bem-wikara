import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Search, ChevronDown, ChevronRight, PanelRight, PanelRightClose, X, MoreVertical, Download, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate, useLocation } from "react-router-dom";
import { Trans } from "@/components/ui/Trans";
import { useTranslateText } from "@/contexts/TranslationContext";
import { DownloadUnavailableModal } from "@/components/ui/DownloadUnavailableModal";

interface Pasal {
  id: string;
  nomor: string;
  points: string[];
}

interface Bab {
  id: string;
  bab: string;
  title: string;
  pasal: Pasal[];
}

export function AdArt() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Extract the current tab from the URL path
  const pathParts = location.pathname.split('/');
  const currentTab = pathParts[pathParts.length - 1];
  
  // Default to pembukaan if no valid tab is found
  const activeTab = ["pembukaan", "ad", "art"].includes(currentTab) ? currentTab as "pembukaan" | "ad" | "art" : "pembukaan";

  const [adartData, setAdartData] = useState<{ad: Bab[], art: Bab[]}>({ ad: [], art: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [expandedBab, setExpandedBab] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedBabId, setSelectedBabId] = useState<string | "SEMUA">("SEMUA");
  const [showSidebar, setShowSidebar] = useState(() => typeof window !== 'undefined' ? window.innerWidth >= 1024 : true);
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' ? window.innerWidth < 1024 : false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setShowSidebar(window.innerWidth >= 1024);
    }
  }, [location.pathname]);

  useEffect(() => {
    if (isMobile && showSidebar) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showSidebar, isMobile]);

  const [highlightInfo, setHighlightInfo] = useState<{ id: string, query: string, active: boolean } | null>(null);

  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslateText();

  // Redirect to /adart/pembukaan if just /adart is accessed
  useEffect(() => {
    if (location.pathname === "/adart" || location.pathname === "/adart/") {
      navigate("/adart/pembukaan", { replace: true });
    }
  }, [location.pathname, navigate]);

  useEffect(() => {
    setSelectedBabId("SEMUA");
    if (activeTab === "ad" && adartData.ad.length > 0) {
      setExpandedBab(adartData.ad[0].id);
    } else if (activeTab === "art" && adartData.art.length > 0) {
      setExpandedBab(adartData.art[0].id);
    } else {
      setExpandedBab(null);
    }
  }, [activeTab, adartData]);

  useEffect(() => {
      fetch('/data/adart.json')
      .then(res => {
        if (!res.ok) throw new Error("Gagal mengambil data");
        return res.json();
      })
      .then(data => {
        setAdartData({
          ad: Array.isArray(data?.ad) ? data.ad : [],
          art: Array.isArray(data?.art) ? data.art : []
        });
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch AD/ART data:", err);
        setError("Gagal memuat data AD/ART. Silakan coba lagi.");
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const toggleBab = (id: string) => {
    setExpandedBab(expandedBab === id ? null : id);
  };

  const currentData = activeTab === "ad" ? adartData.ad : activeTab === "art" ? adartData.art : [];

  let displayData = currentData;
  if (selectedBabId !== "SEMUA") {
    displayData = currentData.filter(b => b.id === selectedBabId);
  }

  // Search logic for popup
  const searchSource = [
    ...adartData.ad.map(b => ({ ...b, sourceTab: "ad" as const })),
    ...adartData.art.map(b => ({ ...b, sourceTab: "art" as const }))
  ];

  const searchResults = searchSource.map(bab => {
    const matchingPasal = (bab.pasal || []).map(p => {
      const matchingPoint = (p.points || []).find(pt => pt && pt.toLowerCase().includes(searchQuery.toLowerCase()));
      if ((p.nomor && p.nomor.toLowerCase().includes(searchQuery.toLowerCase())) || matchingPoint) {
        let snippet = matchingPoint || (p.points && p.points[0]) || "";
        if (matchingPoint) {
          const lowerPoint = matchingPoint.toLowerCase();
          const lowerQuery = searchQuery.toLowerCase();
          const idx = lowerPoint.indexOf(lowerQuery);
          const start = Math.max(0, idx - 30);
          const end = Math.min(matchingPoint.length, idx + lowerQuery.length + 30);
          snippet = (start > 0 ? "..." : "") + matchingPoint.substring(start, end) + (end < matchingPoint.length ? "..." : "");
        }
        return { ...p, snippet };
      }
      return null;
    }).filter(Boolean) as (Pasal & { snippet: string })[];
    
    const babMatches = (bab.bab && bab.bab.toLowerCase().includes(searchQuery.toLowerCase())) || 
                       (bab.title && bab.title.toLowerCase().includes(searchQuery.toLowerCase()));
                       
    if (babMatches || matchingPasal.length > 0) {
      return {
        ...bab,
        pasal: matchingPasal
      };
    }
    return null;
  }).filter(Boolean);

  const handleSearchResultClick = (babId: string, pasalId: string, sourceTab: "ad" | "art") => {
    navigate(`/adart/${sourceTab}`);
    setSelectedBabId(babId);
    setExpandedBab(babId);
    setIsSearchOpen(false);
    setHighlightInfo({ id: pasalId, query: searchQuery, active: true });
    
    setTimeout(() => scrollToSection(pasalId), 100);
    
    setTimeout(() => {
      setHighlightInfo(prev => prev ? { ...prev, active: false } : null);
    }, 3000);
  };

  const renderHighlightedText = (text: string, id: string) => {
    const translatedText = t(text);
    if (!translatedText) return translatedText;
    if (!highlightInfo || highlightInfo.id !== id || !highlightInfo.query) return translatedText;
    
    const query = highlightInfo.query;
    const parts = translatedText.split(new RegExp(`(${query})`, 'gi'));
    return (
      <>
        {parts.map((part, i) => 
          part.toLowerCase() === query.toLowerCase() ? (
            <span key={i} className={`transition-colors duration-1000 rounded px-1 ${highlightInfo.active ? 'bg-blue-300 dark:bg-blue-600 text-blue-900 dark:text-white' : 'bg-transparent'}`}>
              {part}
            </span>
          ) : (
            part
          )
        )}
      </>
    );
  };

  const highlightMatch = (text: string, query: string) => {
    if (!query || !text) return text;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return (
      <>
        {parts.map((part, i) => 
          part.toLowerCase() === query.toLowerCase() ? (
            <span key={i} className="bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded px-0.5">
              {part}
            </span>
          ) : (
            part
          )
        )}
      </>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 relative overflow-hidden">
      <DownloadUnavailableModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        documentName="Draft AD/ART" 
      />
      {/* Hero Section */}
      <div className="relative pt-24 pb-10 md:pt-40 md:pb-20 px-4 md:px-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 z-20">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[400px] md:w-[800px] md:h-[800px] bg-primary-500/5 rounded-full blur-[80px] md:blur-[120px]" />
        </div>
        
        <div className="container mx-auto relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto mb-8 md:mb-10"
          >
            <div className="inline-block mb-2 md:mb-4 px-2.5 py-1 md:px-4 md:py-1.5 rounded-full bg-primary-50 dark:bg-primary-900/30 border border-primary-100 dark:border-primary-800">
              <span className="text-primary-600 dark:text-primary-400 font-medium text-xs md:text-sm tracking-wider uppercase"><Trans>Konstitusi</Trans></span>
            </div>
            <h1 className="text-2xl md:text-6xl font-bold font-heading text-slate-900 dark:text-white tracking-tight mb-2 md:mb-4"><Trans>Draft</Trans> <span className="text-gradient"><Trans>AD/ART</Trans></span></h1>
            <p className="text-slate-600 dark:text-slate-400 text-sm md:text-xl font-light"><Trans>Rancangan perubahan Anggaran Dasar dan Anggaran Rumah Tangga.</Trans></p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col items-center gap-3 md:gap-6 max-w-4xl mx-auto"
          >
            <div className="flex flex-row items-center justify-center gap-2 w-full sm:w-auto">
              <div className="flex flex-wrap justify-center gap-1 md:gap-3 flex-1 sm:flex-none">
                <button 
                  onClick={() => { 
                    navigate("/adart/pembukaan"); 
                  }}
                  className={`px-2.5 py-1.5 md:px-6 md:py-2.5 rounded-lg md:rounded-full text-[10px] md:text-sm font-medium transition-all duration-300 flex-1 sm:flex-none leading-tight ${activeTab === "pembukaan" ? "bg-primary-600 text-white shadow-md shadow-primary-500/20" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"}`}
                >
                  <Trans>Pembukaan</Trans>
                </button>
                <button 
                  onClick={() => { 
                    navigate("/adart/ad"); 
                  }}
                  className={`px-2.5 py-1.5 md:px-6 md:py-2.5 rounded-lg md:rounded-full text-[10px] md:text-sm font-medium transition-all duration-300 flex-1 sm:flex-none leading-tight ${activeTab === "ad" ? "bg-primary-600 text-white shadow-md shadow-primary-500/20" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"}`}
                >
                  <Trans>Anggaran Dasar</Trans>
                </button>
                <button 
                  onClick={() => { 
                    navigate("/adart/art"); 
                  }}
                  className={`px-2.5 py-1.5 md:px-6 md:py-2.5 rounded-lg md:rounded-full text-[10px] md:text-sm font-medium transition-all duration-300 flex-1 sm:flex-none leading-tight ${activeTab === "art" ? "bg-primary-600 text-white shadow-md shadow-primary-500/20" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"}`}
                >
                  <Trans>Anggaran Rumah Tangga</Trans>
                </button>
              </div>
              
              <a 
                href="https://drive.google.com/uc?export=download&id=1zyxIWleK3R-iFPcB1_7Ab8RlObksyTfo"
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 md:p-2.5 rounded-lg md:rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors flex items-center justify-center shrink-0 h-full"
                aria-label="Download PDF"
                title="Download Draft AD/ART"
              >
                <Download className="w-4 h-4 md:w-5 md:h-5" />
              </a>
            </div>
            
            <div className="flex items-center gap-2 md:gap-3 w-full max-w-2xl mx-auto" id="mubes-search-portal">
              <div className="relative w-full" ref={searchRef}>
                <Search className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-slate-400" />
                <input 
                  type="text" 
                  placeholder={t("Cari pasal atau bab...")}
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setIsSearchOpen(true);
                  }}
                  onFocus={() => setIsSearchOpen(true)}
                  className="w-full pl-8 md:pl-12 pr-8 md:pr-10 py-1.5 md:py-3.5 rounded-lg md:rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-shadow shadow-sm dark:text-white text-xs md:text-base"
                />
                {searchQuery && (
                  <button 
                    onClick={() => {
                      setSearchQuery("");
                      setIsSearchOpen(false);
                    }}
                    className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <X className="w-3.5 h-3.5 md:w-5 md:h-5" />
                  </button>
                )}
                
                {/* Search Results Dropdown */}
                
                <AnimatePresence>
                  {isSearchOpen && searchQuery && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden z-50 max-h-[300px] md:max-h-[400px] overflow-y-auto text-left"
                    >
                      {searchResults.length === 0 ? (
                        <div className="p-3 md:p-4 text-center text-xs md:text-sm text-slate-500 dark:text-slate-400">
                          <Trans>Tidak ada hasil yang ditemukan</Trans>
                        </div>
                      ) : (
                        <ul className="py-1 md:py-2">
                          {searchResults.map((bab) => (
                            <li key={`search-${bab.id}`}>
                              <button
                                onClick={() => {
                                  navigate(`/adart/${bab.sourceTab}`);
                                  setSelectedBabId(bab.id);
                                  setExpandedBab(bab.id);
                                  setIsSearchOpen(false);
                                  setTimeout(() => scrollToSection(bab.id), 100);
                                }}
                                className="w-full text-left px-3 py-1.5 md:px-4 md:py-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                              >
                                <span className="block text-xs md:text-sm font-semibold text-slate-900 dark:text-white">
                                  {highlightMatch(t(bab.bab), searchQuery)}
                                </span>
                                <span className="block text-[10px] md:text-xs text-slate-500 dark:text-slate-400 truncate">
                                  <span className="font-semibold text-primary-600 dark:text-primary-400 mr-1 md:mr-2">
                                    {bab.sourceTab === 'ad' ? 'AD' : 'ART'}
                                  </span>
                                  {highlightMatch(t(bab.title), searchQuery)}
                                </span>
                              </button>
                              {bab.pasal.map(p => (
                                <button
                                  key={`search-${bab.id}-${p.id}`}
                                  onClick={() => handleSearchResultClick(bab.id, p.id, bab.sourceTab)}
                                  className="w-full text-left px-6 py-1.5 md:px-8 md:py-2 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors border-l-2 border-transparent hover:border-primary-500"
                                >
                                  <span className="block text-xs md:text-sm font-medium text-slate-700 dark:text-slate-300">
                                    {highlightMatch(t(p.nomor), searchQuery)}
                                  </span>
                                  <span className="block text-[10px] md:text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                                    {highlightMatch(t(p.snippet), searchQuery)}
                                  </span>
                                </button>
                              ))}
                            </li>
                          ))}
                        </ul>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <button 
                onClick={() => setShowSidebar(!showSidebar)} 
                className="p-1.5 md:p-3.5 rounded-lg md:rounded-2xl bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800 transition-colors flex items-center justify-center shrink-0 shadow-sm" 
                title={showSidebar ? t("Sembunyikan Navigasi") : t("Tampilkan Navigasi")}
              >
                {showSidebar ? <PanelRightClose className="w-4 h-4 md:w-5 md:h-5" /> : <PanelRight className="w-4 h-4 md:w-5 md:h-5" />}
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 py-6 md:py-12 relative z-10">
        <motion.div
          key="content-viewer"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`grid grid-cols-1 ${showSidebar ? 'lg:grid-cols-4' : 'lg:grid-cols-1'} gap-3 md:gap-8`}
        >
          {/* Main Content */}
          <div className={`${showSidebar ? 'lg:col-span-3' : 'lg:col-span-1 w-full'} space-y-3 md:space-y-8 w-full`}>
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-10 md:py-20 bg-white/50 dark:bg-slate-900/50 rounded-2xl md:rounded-3xl border border-slate-100 dark:border-slate-800">
                <div className="w-8 h-8 md:w-12 md:h-12 border-3 md:border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-3 md:mb-4"></div>
                <p className="text-sm md:text-base text-slate-500 dark:text-slate-400"><Trans>Memuat data AD/ART...</Trans></p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-10 md:py-20 bg-white/50 dark:bg-slate-900/50 rounded-2xl md:rounded-3xl border border-slate-100 dark:border-slate-800">
                <p className="text-sm md:text-base text-red-500 dark:text-red-400 mb-3 md:mb-4"><Trans>{error}</Trans></p>
                <button onClick={() => window.location.reload()} className="px-4 py-1.5 md:px-6 md:py-2 text-sm md:text-base bg-primary-600 hover:bg-primary-700 text-white rounded-full transition-colors">
                  <Trans>Coba Lagi</Trans>
                </button>
              </div>
            ) : activeTab === "pembukaan" ? (
                  <Card className="glass-card overflow-hidden rounded-lg md:rounded-2xl">
                    <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 relative p-3 md:p-6">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-500" />
                      <CardTitle className="text-sm md:text-xl text-slate-900 dark:text-white text-center">
                        <Trans>PEMBUKAAN</Trans>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4 pb-6 px-3 md:pt-8 md:pb-10 md:px-12 prose prose-slate dark:prose-invert max-w-none text-justify leading-relaxed md:leading-loose text-sm md:text-lg text-slate-700 dark:text-slate-300">
                      <p className="mb-4 md:mb-6">
                        <Trans>Bahwa sesungguhnya mahasiswa sebagai bagian dari civitas academica memiliki peran strategis dalam mewujudkan cita-cita Tridharma Perguruan Tinggi, yaitu pendidikan, penelitian, dan pengabdian kepada masyarakat.</Trans>
                      </p>
                      <p className="mb-4 md:mb-6">
                        <Trans>Menyadari akan hak, kewajiban, dan tanggung jawabnya sebagai insan akademis yang beriman dan bertakwa kepada Tuhan Yang Maha Esa, serta berlandaskan pada Pancasila dan Undang-Undang Dasar 1945, mahasiswa STIE WIKARA bertekad untuk membina persatuan, kesatuan, dan kesejahteraan bersama.</Trans>
                      </p>
                      <p>
                        <Trans>Untuk mewujudkan tekad tersebut, serta demi kelancaran dan ketertiban roda organisasi kemahasiswaan, maka disusunlah Anggaran Dasar dan Anggaran Rumah Tangga (AD/ART) Badan Eksekutif Mahasiswa STIE WIKARA sebagai pedoman dasar dalam setiap gerak dan langkah organisasi.</Trans>
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  displayData.map((bab) => (
                    <Card key={bab.id} id={bab.id} className="glass-card overflow-hidden group scroll-mt-24 md:scroll-mt-28 rounded-lg md:rounded-2xl">
                        <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 relative p-3 md:p-6">
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-500" />
                          <CardTitle className="text-sm md:text-xl text-slate-900 dark:text-white text-center">
                            {renderHighlightedText(bab.bab, bab.id)}<br/>
                            <span className="text-xs md:text-base font-normal text-slate-500 dark:text-slate-400 mt-1 block">
                              {renderHighlightedText(bab.title, bab.id)}
                            </span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-3 md:pt-6 p-3 md:p-6 prose prose-slate dark:prose-invert max-w-none">
                          {(bab.pasal || []).map((p, pIdx) => (
                            <div key={p.id} id={p.id} className={`scroll-mt-24 md:scroll-mt-28 ${pIdx > 0 ? 'mt-6 pt-4 md:mt-12 md:pt-8 border-t border-slate-100 dark:border-slate-800/50' : ''}`}>
                              <h4 className="font-bold text-slate-900 dark:text-white flex items-center justify-center gap-2 mb-1 text-sm md:text-lg">
                                {renderHighlightedText(p.nomor, p.id)}
                              </h4>
                              <div className="text-[10px] md:text-sm text-slate-700 dark:text-slate-300 leading-relaxed space-y-1.5 md:space-y-3 mt-0">
                                {(p.points || []).map((point, ptIdx) => {
                                  if (ptIdx === 0) {
                                    return <h5 key={ptIdx} className="text-center font-bold text-slate-900 dark:text-white mb-1 text-xs md:text-lg">{renderHighlightedText(point, p.id)}</h5>;
                                  }
                                  const match = point && point.match ? point.match(/^([0-9]+|[a-z])\.\s+(.*)/) : null;
                                  if (match) {
                                    return (
                                      <div key={ptIdx} className="flex gap-1 md:gap-3 pl-1 md:pl-8">
                                        <span className="shrink-0 font-medium w-3 md:w-6 text-right">{match[1]}.</span>
                                        <span className="flex-1 text-justify">{renderHighlightedText(match[2], p.id)}</span>
                                      </div>
                                    );
                                  }
                                  return <p key={ptIdx} className="m-0 text-justify px-1 md:px-8">{renderHighlightedText(point, p.id)}</p>;
                                })}
                              </div>
                            </div>
                          ))}
                        </CardContent>
                    </Card>
                  ))
                )}
              </div>

              {/* Sidebar Navigation */}
              {isMobile ? createPortal(
                <AnimatePresence>
                  {showSidebar && (
                    <>
                      {/* Mobile Overlay */}
                      <motion.div 
                        key="mobile-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowSidebar(false)}
                        className="fixed inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm z-[100] lg:hidden"
                      />
                      
                      {/* Sidebar Content */}
                      <motion.div 
                        key="mobile-sidebar"
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed top-0 right-0 bottom-0 w-[280px] bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl shadow-2xl z-[101] lg:hidden flex flex-col border-l border-slate-200/50 dark:border-slate-800/50"
                      >
                        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800/50">
                          <span className="font-heading font-bold text-xl text-slate-900 dark:text-white tracking-tight">
                            <Trans>Daftar Isi</Trans>
                          </span>
                          <button onClick={() => setShowSidebar(false)} className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors">
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 pb-24">
                          <ul className="text-sm space-y-1">
                            <li>
                              <button 
                                onClick={() => {
                                  navigate("/adart/pembukaan");
                                  setSelectedBabId("SEMUA");
                                  setExpandedBab(null);
                                  window.scrollTo({ top: 0, behavior: 'smooth' });
                                  setShowSidebar(false);
                                }}
                                className={`w-full flex items-center px-4 py-3 rounded-xl font-medium transition-colors text-left ${activeTab === "pembukaan" ? "text-primary-600 bg-primary-50 dark:bg-primary-900/20" : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50"}`}
                              >
                                <Trans>PEMBUKAAN</Trans>
                              </button>
                            </li>
                            <li>
                              <button 
                                onClick={() => {
                                  if (activeTab === "pembukaan") navigate("/adart/ad");
                                  setSelectedBabId("SEMUA");
                                  setExpandedBab(null);
                                  window.scrollTo({ top: 0, behavior: 'smooth' });
                                  setShowSidebar(false);
                                }}
                                className={`w-full flex items-center px-4 py-3 rounded-xl font-medium transition-colors text-left ${selectedBabId === "SEMUA" && activeTab !== "pembukaan" ? "text-primary-600 bg-primary-50 dark:bg-slate-800" : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50"}`}
                              >
                                <Trans>SEMUA</Trans>
                              </button>
                            </li>
                            {currentData.map((bab) => (
                              <li key={bab.id}>
                                <button 
                                  onClick={() => {
                                    toggleBab(bab.id);
                                    setSelectedBabId(bab.id);
                                    scrollToSection(bab.id);
                                  }}
                                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-colors text-left ${selectedBabId === bab.id ? "text-primary-600 bg-primary-50 dark:bg-slate-800 font-semibold" : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 font-medium"}`}
                                >
                                  <div className="flex flex-col items-start pr-2">
                                    <span>{t(bab.bab)}</span>
                                    <span className="text-[10px] md:text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-normal line-clamp-2 leading-tight">{t(bab.title)}</span>
                                  </div>
                                  {expandedBab === bab.id ? (
                                    <ChevronDown className="w-4 h-4 text-slate-400" />
                                  ) : (
                                    <ChevronRight className="w-4 h-4 text-slate-400" />
                                  )}
                                </button>
                                
                                <AnimatePresence>
                                  {expandedBab === bab.id && (
                                    <motion.ul 
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: "auto", opacity: 1 }}
                                      exit={{ height: 0, opacity: 0 }}
                                      className="overflow-hidden mt-1"
                                    >
                                      {bab.pasal.map((p) => (
                                        <li key={p.id}>
                                          <button 
                                            onClick={() => {
                                              setSelectedBabId(bab.id);
                                              setTimeout(() => scrollToSection(p.id), 100);
                                              setShowSidebar(false);
                                            }}
                                            className="w-full flex flex-col items-start px-8 py-2.5 text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors rounded-lg"
                                          >
                                            <span className="text-sm font-medium">{t(p.nomor)}</span>
                                            <span className="text-[10px] md:text-xs text-slate-500 dark:text-slate-500 mt-0.5 font-normal line-clamp-2 leading-tight text-left">{t(p.points[0])}</span>
                                          </button>
                                        </li>
                                      ))}
                                    </motion.ul>
                                  )}
                                </AnimatePresence>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>,
                document.body
              ) : (
                <AnimatePresence>
                  {showSidebar && (
                    <motion.div 
                      key="desktop-sidebar"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="hidden lg:block lg:col-span-1"
                    >
                      <div className="sticky top-24 md:top-28 lg:h-auto overflow-y-auto lg:overflow-visible">
                        <Card className="glass-card overflow-hidden lg:max-h-[calc(100vh-150px)] flex flex-col rounded-xl md:rounded-2xl border-0 lg:border">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-500 to-sky-400 hidden lg:block" />
                        <CardHeader className="pb-2 md:pb-3 p-4 md:p-6 border-b border-slate-100 dark:border-slate-800 shrink-0 hidden lg:block">
                          <CardTitle className="text-base md:text-lg text-slate-900 dark:text-white"><Trans>Daftar Isi</Trans></CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 overflow-y-auto flex-1">
                          <ul className="text-xs md:text-sm">
                            <li className="border-b border-slate-100 dark:border-slate-800/50">
                              <button 
                                onClick={() => {
                                  navigate("/adart/pembukaan");
                                  setSelectedBabId("SEMUA");
                                  setExpandedBab(null);
                                  window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                                className={`w-full flex items-center px-3 py-3 md:px-4 md:py-3 font-medium transition-colors text-left ${activeTab === "pembukaan" ? "text-primary-600 bg-primary-50 dark:bg-primary-900/20" : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50"}`}
                              >
                                <Trans>PEMBUKAAN</Trans>
                              </button>
                            </li>
                            <li className="border-b border-slate-100 dark:border-slate-800/50">
                              <button 
                                onClick={() => {
                                  if (activeTab === "pembukaan") navigate("/adart/ad");
                                  setSelectedBabId("SEMUA");
                                  setExpandedBab(null);
                                  window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                                className={`w-full flex items-center px-3 py-3 md:px-4 md:py-3 font-medium transition-colors text-left ${selectedBabId === "SEMUA" && activeTab !== "pembukaan" ? "text-primary-600 bg-primary-50 dark:bg-slate-800" : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50"}`}
                              >
                                <Trans>SEMUA</Trans>
                              </button>
                            </li>
                            {currentData.map((bab) => (
                              <li key={bab.id} className="border-b border-slate-100 dark:border-slate-800/50 last:border-0">
                                <button 
                                  onClick={() => {
                                    toggleBab(bab.id);
                                    setSelectedBabId(bab.id);
                                    scrollToSection(bab.id);
                                  }}
                                  className={`w-full flex items-center justify-between px-3 py-3 md:px-4 md:py-3 transition-colors text-left ${selectedBabId === bab.id ? "text-primary-600 bg-primary-50 dark:bg-slate-800 font-semibold" : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 font-medium"}`}
                                >
                                  <div className="flex flex-col items-start pr-2">
                                    <span>{t(bab.bab)}</span>
                                    <span className="text-[10px] md:text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-normal line-clamp-2 leading-tight">{t(bab.title)}</span>
                                  </div>
                                  {expandedBab === bab.id ? (
                                    <ChevronDown className="w-3 h-3 md:w-4 md:h-4 text-slate-400" />
                                  ) : (
                                    <ChevronRight className="w-3 h-3 md:w-4 md:h-4 text-slate-400" />
                                  )}
                                </button>
                                
                                <AnimatePresence>
                                  {expandedBab === bab.id && (
                                    <motion.ul 
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: "auto", opacity: 1 }}
                                      exit={{ height: 0, opacity: 0 }}
                                      className="bg-slate-50/50 dark:bg-slate-900/30 overflow-hidden"
                                    >
                                      {bab.pasal.map((p) => (
                                        <li key={p.id}>
                                          <button 
                                            onClick={() => {
                                              setSelectedBabId(bab.id);
                                              setTimeout(() => scrollToSection(p.id), 100);
                                            }}
                                            className="w-full flex flex-col items-start px-6 py-3 md:px-8 md:py-2.5 text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors border-l-2 border-transparent hover:border-primary-500"
                                          >
                                            <span className="text-xs md:text-sm font-medium">{t(p.nomor)}</span>
                                            <span className="text-[10px] md:text-xs text-slate-500 dark:text-slate-500 mt-0.5 font-normal line-clamp-2 leading-tight text-left">{t(p.points[0])}</span>
                                          </button>
                                        </li>
                                      ))}
                                    </motion.ul>
                                  )}
                                </AnimatePresence>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
          </motion.div>
      </div>
    </div>
  );
}
