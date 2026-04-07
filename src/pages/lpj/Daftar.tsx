import { useState, useMemo, useEffect, useRef } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { FileText, Calendar, Users, ArrowRight, CheckCircle, XCircle, Clock, AlertCircle, Filter, X, ChevronDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { motion, AnimatePresence } from "motion/react";
import { Trans } from "@/components/ui/Trans";
import { useTranslateText } from "@/contexts/TranslationContext";

interface LpjData {
  id: string;
  tanggal: string;
  kementerian: string;
  judul: string;
  status: string;
  deskripsi: string;
  fileSize: string;
}

export const shortenKementerian = (name: string) => {
  return name.replace(/^Kementerian\s+/i, '');
};

export const createSlug = (text: string) => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
};

export function Daftar() {
  const { kementerianSlug } = useParams();
  const navigate = useNavigate();
  const [lpjList, setLpjList] = useState<LpjData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("Semua");
  const [kementerianFilter, setKementerianFilter] = useState("Semua");
  const [tanggalFilter, setTanggalFilter] = useState("Semua");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeFilterTab, setActiveFilterTab] = useState<'tanggal' | 'kementerian'>('tanggal');
  const { t } = useTranslateText();
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    fetch('/data/lpj.json')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const excludedRoles = ["Presiden Mahasiswa", "Sekretaris Jendral", "Sekretaris", "Bendahara"];
          const filteredData = data.filter(item => !excludedRoles.includes(item.kementerian));
          setLpjList(filteredData);
        } else {
          setLpjList([]);
        }
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch LPJ data:", err);
        setIsLoading(false);
      });
  }, []);

  const kementerianList = useMemo(() => {
    return ["Semua", ...Array.from(new Set(lpjList.map(item => item.kementerian)))];
  }, [lpjList]);

  const tanggalList = useMemo(() => {
    return ["Semua", ...Array.from(new Set(lpjList.map(item => item.tanggal)))];
  }, [lpjList]);

  // Sync kementerianFilter with URL slug
  useEffect(() => {
    if (kementerianSlug && lpjList.length > 0) {
      const foundKementerian = kementerianList.find(k => k !== "Semua" && createSlug(shortenKementerian(k)) === kementerianSlug);
      if (foundKementerian) {
        setKementerianFilter(foundKementerian);
      } else {
        setKementerianFilter("Semua");
      }
    } else if (!kementerianSlug) {
      setKementerianFilter("Semua");
    }
  }, [kementerianSlug, kementerianList, lpjList]);

  const handleKementerianChange = (newKementerian: string) => {
    setKementerianFilter(newKementerian);
    setStatusFilter("Semua");
    if (newKementerian === "Semua") {
      navigate('/lpj');
    } else {
      navigate(`/lpj/${createSlug(shortenKementerian(newKementerian))}`);
    }
  };

  const filteredLpj = useMemo(() => {
    return lpjList.filter(item => {
      const displayStatus = item.status === 'Sedang Berjalan' ? 'Terlaksana' : 
                           item.status === 'Stagnan' ? 'Tidak Terlaksana' : 
                           item.status;
      const matchStatus = statusFilter === "Semua" || displayStatus === statusFilter;
      const matchKementerian = kementerianFilter === "Semua" || item.kementerian === kementerianFilter;
      const matchTanggal = tanggalFilter === "Semua" || item.tanggal === tanggalFilter;
      return matchStatus && matchKementerian && matchTanggal;
    });
  }, [lpjList, statusFilter, kementerianFilter, tanggalFilter]);

  const groupedLpj = useMemo(() => {
    if (kementerianFilter !== "Semua") {
      return { [kementerianFilter]: filteredLpj };
    }
    const groups: Record<string, LpjData[]> = {};
    filteredLpj.forEach(item => {
      if (!groups[item.kementerian]) {
        groups[item.kementerian] = [];
      }
      groups[item.kementerian].push(item);
    });
    return groups;
  }, [filteredLpj, kementerianFilter]);

  const statusTabs = ["Semua", "Terlaksana", "Tidak Terlaksana"];

  const formatKementerianName = (name: string) => {
    if (name === "Semua") return "Semua Bidang";
    return name.replace(/^Kementerian\s+/i, "");
  };

  return (
    <div className="pt-24 pb-12 md:pt-32 md:pb-20 min-h-screen bg-slate-50 dark:bg-slate-950 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[300px] h-[300px] md:w-[500px] md:h-[500px] bg-primary-500/10 rounded-full blur-[80px] md:blur-[100px] -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] md:w-[500px] md:h-[500px] bg-sky-400/10 rounded-full blur-[80px] md:blur-[100px] translate-y-1/3 -translate-x-1/3" />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-3xl mx-auto mb-6 md:mb-12"
        >
          <div className="inline-block mb-2 md:mb-4 px-2.5 py-1 md:px-4 md:py-1.5 rounded-full bg-primary-50 dark:bg-primary-900/30 border border-primary-100 dark:border-primary-800">
            <span className="text-primary-600 dark:text-primary-400 font-medium text-xs md:text-sm tracking-wider uppercase"><Trans>Dokumen Resmi</Trans></span>
          </div>
          <h1 className="text-2xl md:text-6xl font-bold mb-3 md:mb-6 font-heading text-slate-900 dark:text-white tracking-tight"><Trans>Laporan</Trans> <span className="text-gradient"><Trans>Pertanggung Jawaban</Trans></span></h1>
          <p className="text-sm md:text-xl text-slate-600 dark:text-slate-400 font-light leading-relaxed">
            <Trans>Transparansi dan akuntabilitas kinerja Kabinet Cakrawala selama satu periode kepengurusan.</Trans>
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="w-full mb-6 md:mb-10 space-y-3 md:space-y-6 relative"
          ref={filterRef}
        >
          {/* Status Tabs & Filter Button */}
          <div className="flex flex-wrap justify-center items-center gap-2">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`flex items-center justify-center w-8 h-8 md:w-10 md:h-10 bg-white dark:bg-slate-900 border rounded-full shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-slate-700 dark:text-slate-300 ${isFilterOpen ? 'border-primary-500 ring-1 ring-primary-500' : 'border-slate-200 dark:border-slate-800'}`}
              title={t("Filter Data")}
            >
              <Filter className="w-4 h-4" />
              {(kementerianFilter !== "Semua" || tanggalFilter !== "Semua") && (
                <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-primary-500 border border-white dark:border-slate-900"></span>
              )}
            </button>
            {statusTabs.map(status => {
              const isActive = statusFilter === status && kementerianFilter === "Semua" && tanggalFilter === "Semua";
              return (
              <button
                key={status}
                onClick={() => {
                  setStatusFilter(status);
                  if (kementerianFilter !== "Semua") {
                    setKementerianFilter("Semua");
                    navigate('/lpj');
                  }
                  setTanggalFilter("Semua");
                }}
                className={`px-3 py-1.5 md:px-5 md:py-2.5 rounded-full text-[11px] md:text-sm font-medium transition-all duration-300 ${
                  isActive 
                    ? 'bg-primary-600 text-white shadow-md shadow-primary-500/20 scale-105' 
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
                }`}
              >
                <Trans>{status}</Trans>
              </button>
            )})}
          </div>

          {/* Filter Section */}
          <AnimatePresence>
            {isFilterOpen && (
              <>
                {/* Mobile Overlay */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] md:hidden"
                  onClick={() => setIsFilterOpen(false)}
                />
                
                {/* Filter Content */}
                <motion.div
                  initial={{ y: "100%", opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: "100%", opacity: 0 }}
                  transition={{ type: "spring", damping: 25, stiffness: 200 }}
                  className="fixed bottom-0 left-0 right-0 z-[101] md:absolute md:top-full md:bottom-auto md:left-1/2 md:-translate-x-1/2 md:mt-2 md:w-[400px] md:max-w-[calc(100vw-2rem)] bg-white dark:bg-slate-900 rounded-t-3xl md:rounded-2xl shadow-2xl border border-slate-200/60 dark:border-slate-800/60 overflow-hidden flex flex-col"
                >
                  <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mt-3 mb-1 md:hidden shrink-0" />
                  
                  <div className="flex border-b border-slate-100 dark:border-slate-800 shrink-0">
                    <button
                      onClick={() => setActiveFilterTab('tanggal')}
                      className={`flex-1 py-3 text-sm font-medium transition-colors ${activeFilterTab === 'tanggal' ? 'text-primary-600 border-b-2 border-primary-500' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'}`}
                    >
                      <Trans>Tanggal</Trans>
                    </button>
                    <button
                      onClick={() => setActiveFilterTab('kementerian')}
                      className={`flex-1 py-3 text-sm font-medium transition-colors ${activeFilterTab === 'kementerian' ? 'text-primary-600 border-b-2 border-primary-500' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'}`}
                    >
                      <Trans>Kementerian</Trans>
                    </button>
                  </div>

                  <div className="p-4 md:p-6 max-h-[60vh] md:max-h-[50vh] overflow-y-auto custom-scrollbar flex-1">
                    {activeFilterTab === 'kementerian' ? (
                      <div className="space-y-2">
                        {kementerianList.map(k => (
                          <button
                            key={k}
                            onClick={() => {
                              handleKementerianChange(k);
                              setIsFilterOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors ${
                              kementerianFilter === k
                                ? 'bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 font-medium'
                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                          >
                            <Trans>{k === "Semua" ? "Semua Kementerian" : shortenKementerian(k)}</Trans>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {tanggalList.map(t_val => (
                          <button
                            key={t_val}
                            onClick={() => {
                              setTanggalFilter(t_val);
                              setStatusFilter("Semua");
                              setIsFilterOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors ${
                              tanggalFilter === t_val
                                ? 'bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300 font-medium'
                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                          >
                            <Trans>{t_val === "Semua" ? "Semua Tanggal" : t_val}</Trans>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="p-3 md:p-4 border-t border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/50 flex justify-center shrink-0">
                    <button
                      onClick={() => {
                        handleKementerianChange("Semua");
                        setTanggalFilter("Semua");
                        setIsFilterOpen(false);
                      }}
                      className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                    >
                      <Trans>Reset Filter</Trans>
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </motion.div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-slate-500 dark:text-slate-400"><Trans>Memuat data LPJ...</Trans></p>
          </div>
        ) : filteredLpj.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-900 mb-4">
              <FileText className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2"><Trans>Tidak ada LPJ ditemukan</Trans></h3>
            <p className="text-slate-500 dark:text-slate-400"><Trans>Coba ubah filter pencarian Anda.</Trans></p>
            <button 
              onClick={() => {
                setStatusFilter("Semua");
                handleKementerianChange("Semua");
                setTanggalFilter("Semua");
              }}
              className="mt-6 px-6 py-2 bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-full font-medium hover:bg-primary-100 dark:hover:bg-primary-900/50 transition-colors"
            >
              <Trans>Reset Filter</Trans>
            </button>
          </motion.div>
        ) : (
          <div className="w-full space-y-6 md:space-y-12">
            {Object.entries(groupedLpj).map(([kementerian, items], groupIdx) => (
              <div key={kementerian} className="space-y-3 md:space-y-6">
                {kementerianFilter === "Semua" && (
                  <div className="flex items-center gap-3 md:gap-4">
                    <h2 className="text-base md:text-2xl font-bold font-heading text-slate-900 dark:text-white"><Trans>{kementerian}</Trans></h2>
                    <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1"></div>
                  </div>
                )}
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-8">
                  {(items as any[]).map((item, idx) => {
                    const displayStatus = item.status === 'Sedang Berjalan' ? 'Terlaksana' : 
                                         item.status === 'Stagnan' ? 'Tidak Terlaksana' : 
                                         item.status;
                    const displayTanggal = item.tanggal === 'Berjalan sepanjang periode' ? 'Sepanjang Periode' :
                                           item.tanggal === 'Secara berkala' ? 'Berkala' :
                                           item.tanggal;
                    
                    const kementerianSlug = createSlug(shortenKementerian(item.kementerian));
                    const judulSlug = createSlug(item.judul);
                    
                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                      >
                        <Link to={`/lpj/${kementerianSlug}/${judulSlug}`} className="block h-full">
                          <Card className="h-full glass-card hover:-translate-y-2 transition-all duration-300 group overflow-hidden relative flex flex-col">
                            <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-5 transition-opacity duration-300 dark:group-hover:opacity-10 pointer-events-none" />
                            <CardHeader className="p-3 md:p-6">
                              <div className="flex items-start gap-2 md:gap-4 mb-1.5 md:mb-4">
                                <div className="w-7 h-7 md:w-12 md:h-12 shrink-0 rounded-md md:rounded-xl flex items-center justify-center bg-gradient-to-br from-primary-500 to-sky-400 text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                                  <FileText className="w-3.5 h-3.5 md:w-6 md:h-6" />
                                </div>
                                <CardTitle className="text-xs md:text-lg dark:text-white line-clamp-2 leading-snug"><Trans>{item.judul}</Trans></CardTitle>
                              </div>
                              <div className="flex flex-col gap-1 md:gap-3 text-[10px] md:text-sm text-slate-500 dark:text-slate-400">
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-3 h-3 md:w-4 md:h-4 text-sky-500 shrink-0" />
                                  <span><Trans>{displayTanggal}</Trans></span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className={`px-1.5 py-0.5 md:px-2.5 md:py-1 rounded text-[9px] md:text-xs font-medium flex items-center gap-0.5 md:gap-1.5 w-fit ${
                                    displayStatus === 'Terlaksana' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                    'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                  }`}>
                                    {displayStatus === 'Terlaksana' && <CheckCircle className="w-2.5 h-2.5 md:w-3.5 md:h-3.5" />}
                                    {displayStatus === 'Tidak Terlaksana' && <XCircle className="w-2.5 h-2.5 md:w-3.5 md:h-3.5" />}
                                    <Trans>{displayStatus}</Trans>
                                  </span>
                                </div>
                              </div>
                            </CardHeader>
                          </Card>
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
