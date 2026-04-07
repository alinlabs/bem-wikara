import { Link } from "react-router-dom";
import { ArrowRight, FileText, Calendar, Award, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { motion } from "motion/react";
import { Trans } from "@/components/ui/Trans";
import { useState, useEffect } from "react";

export function Home() {
  const [stats, setStats] = useState({
    programKerja: 0,
    kementerian: 0,
    pengurusAktif: 0,
    tingkatKetercapaian: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [lpjResponse, anggotaResponse] = await Promise.all([
          fetch('/data/lpj.json'),
          fetch('/data/anggota.json')
        ]);
        
        const lpjData = await lpjResponse.json();
        const anggotaData = await anggotaResponse.json();
        
        // Calculate total ministries
        const kementerianSet = new Set();
        if (Array.isArray(anggotaData)) {
          anggotaData.forEach((a: any) => {
            if (a.kementerian && a.kementerian !== "Presidium" && a.kementerian !== "Sekretaris Jendral" && a.kementerian !== "Bendahara") {
              kementerianSet.add(a.kementerian);
            }
          });
        }
        const kementerian = kementerianSet.size > 0 ? kementerianSet.size : 0;
        
        // Calculate total program kerja and executed programs
        let totalProgram = 0;
        let executedProgram = 0;
        
        if (Array.isArray(lpjData)) {
          totalProgram = lpjData.length;
          executedProgram = lpjData.filter((p: any) => {
            const status = p.status ? p.status.toLowerCase() : '';
            return status === 'terlaksana' || status === 'sedang berjalan';
          }).length;
        }
        
        const tingkatKetercapaian = totalProgram > 0 ? Math.round((executedProgram / totalProgram) * 100) : 0;
        
        // Calculate active administrators
        let pengurusAktif = 0;
        if (Array.isArray(anggotaData)) {
          pengurusAktif = anggotaData.length;
        }
        
        setStats({
          programKerja: totalProgram,
          kementerian,
          pengurusAktif,
          tingkatKetercapaian
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };
    
    fetchStats();
  }, []);

  return (
    <div className="flex flex-col min-h-screen dark:bg-slate-950 overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative pt-28 pb-16 md:pt-48 md:pb-32 overflow-hidden w-full bg-white dark:bg-slate-950">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900" />
          
          {/* Animated Blobs */}
          <div className="absolute top-0 left-0 w-64 h-64 md:w-96 md:h-96 bg-primary-200/50 dark:bg-primary-900/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[80px] md:blur-[100px] animate-blob" />
          <div className="absolute top-0 right-0 w-64 h-64 md:w-96 md:h-96 bg-sky-200/50 dark:bg-sky-900/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[80px] md:blur-[100px] animate-blob animation-delay-2000" />
          <div className="absolute -bottom-32 left-1/2 w-64 h-64 md:w-96 md:h-96 bg-purple-200/50 dark:bg-purple-900/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[80px] md:blur-[100px] animate-blob animation-delay-4000" />
          
          {/* Noise overlay */}
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] dark:opacity-20 mix-blend-overlay"></div>
        </div>
        
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-block mb-4 md:mb-6 px-3 py-1 md:px-4 md:py-1.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm"
            >
              <span className="text-primary-600 dark:text-primary-400 font-medium text-xs md:text-sm tracking-wider uppercase flex items-center gap-2">
                <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-primary-500 animate-pulse" />
                <Trans>BEM CAKRAWALA 2025/2026</Trans>
              </span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-slate-900 dark:text-white mb-4 md:mb-6 leading-[1.1] md:leading-[1.2] font-heading tracking-tight"
            >
              <span className="block"><Trans>Akhir Perjalanan,</Trans></span>
              <span className="block text-gradient"><Trans>Awal Perubahan</Trans></span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-300 mb-8 md:mb-10 max-w-2xl mx-auto leading-relaxed font-light"
            >
              <Trans>Selamat datang di portal resmi Musyawarah Besar dan Laporan Pertanggung Jawaban BEM STIE WIKARA.</Trans><br className="hidden md:block" /> <Trans>Mari bersama merefleksikan satu tahun pengabdian untuk almamater tercinta.</Trans>
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-row gap-3 md:gap-4 justify-center"
            >
              <Link to="/lpj" className="flex-1 sm:flex-none">
                <Button size="lg" className="w-full sm:w-auto text-sm md:text-base h-12 md:h-14 px-4 md:px-8 rounded-full shadow-lg shadow-primary-600/20 hover:shadow-primary-600/40 transition-all hover:-translate-y-1">
                  <Trans>Lihat LPJ</Trans>
                  <ArrowRight className="ml-1 md:ml-2 w-4 h-4 md:w-5 md:h-5" />
                </Button>
              </Link>
              <Link to="/mubes" className="flex-1 sm:flex-none">
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-sm md:text-base h-12 md:h-14 px-4 md:px-8 rounded-full bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-800 transition-all hover:-translate-y-1">
                  <Trans>Informasi MUBES</Trans>
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 md:py-20 bg-slate-50 dark:bg-slate-900/50 border-y border-slate-100 dark:border-slate-800/50 relative w-full">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {[
              { label: "Program Kerja", value: stats.programKerja.toString() },
              { label: "Kementerian", value: stats.kementerian.toString() },
              { label: "Pengurus Aktif", value: stats.pengurusAktif.toString() },
              { label: "Tingkat Ketercapaian", value: `${stats.tingkatKetercapaian}%` },
            ].map((stat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="text-center p-4 md:p-6 rounded-2xl bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700/50 hover:-translate-y-1 transition-transform"
              >
                <div className="text-4xl md:text-6xl font-bold text-gradient mb-2 md:mb-3 font-heading">{stat.value}</div>
                <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 font-medium"><Trans>{stat.label}</Trans></p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Highlights Section */}
      <section className="py-16 md:py-24 bg-white dark:bg-slate-950 relative w-full overflow-hidden">
        <div className="absolute top-1/2 left-0 w-64 h-64 md:w-96 md:h-96 bg-primary-500/10 rounded-full mix-blend-multiply filter blur-[80px] md:blur-[100px]" />
        
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto mb-10 md:mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-4 md:mb-6 font-heading text-slate-900 dark:text-white tracking-tight"><Trans>Akses Cepat</Trans></h2>
            <p className="text-base md:text-lg text-slate-600 dark:text-slate-400"><Trans>Jelajahi dokumen penting dan laporan pertanggungjawaban BEM CAKRAWALA.</Trans></p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-4xl mx-auto">
            {[
              { icon: FileText, title: "Laporan Pertanggung Jawaban", desc: "Dokumen lengkap LPJ dari seluruh kementerian dan biro.", link: "/lpj", color: "from-blue-500 to-primary-600" },
              { icon: BookOpen, title: "Draft AD/ART", desc: "Rancangan perubahan Anggaran Dasar dan Anggaran Rumah Tangga.", link: "/adart", color: "from-purple-500 to-indigo-600" }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <Link to={item.link} className="block h-full">
                  <Card className="h-full glass-card hover:-translate-y-2 transition-all duration-300 group overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-5 transition-opacity duration-300 dark:group-hover:opacity-10 pointer-events-none" />
                    <CardHeader className="p-5 md:p-6 pb-5 md:pb-6">
                      <div className="flex items-start gap-4 mb-2">
                        <div className={`w-12 h-12 md:w-14 md:h-14 shrink-0 rounded-2xl flex items-center justify-center bg-gradient-to-br ${item.color} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                          <item.icon className="w-6 h-6 md:w-7 md:h-7" />
                        </div>
                        <CardTitle className="text-lg md:text-xl dark:text-white leading-tight flex items-center min-h-[3rem] md:min-h-[3.5rem]"><Trans>{item.title}</Trans></CardTitle>
                      </div>
                      <CardDescription className="text-sm md:text-base dark:text-slate-400 mt-2"><Trans>{item.desc}</Trans></CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 relative overflow-hidden w-full">
        <div className="absolute inset-0 bg-slate-50 dark:bg-slate-950">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-100 to-slate-100 dark:from-primary-900 dark:to-slate-900 mix-blend-multiply" />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 dark:opacity-20 mix-blend-overlay"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] md:w-[800px] md:h-[800px] bg-primary-300/30 dark:bg-primary-600/20 rounded-full blur-[80px] md:blur-[120px] animate-pulse" />
        </div>
        
        <div className="container mx-auto px-4 md:px-6 relative z-10 text-center max-w-3xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-6xl font-bold mb-4 md:mb-6 font-heading text-slate-900 dark:text-white tracking-tight"><Trans>Mari Sukseskan MUBES 2026</Trans></h2>
            <p className="text-primary-700 dark:text-primary-200 mb-8 md:mb-10 text-base md:text-xl font-light leading-relaxed">
              <Trans>Kehadiran dan partisipasi aktif seluruh mahasiswa sangat menentukan arah gerak organisasi ke depan.</Trans>
            </p>
            <Link to="/mubes">
              <Button size="lg" className="text-base md:text-lg font-semibold px-8 md:px-10 h-14 md:h-16 rounded-full shadow-xl shadow-primary-500/20 hover:shadow-primary-500/40 hover:-translate-y-1 transition-all">
                <Trans>Lihat Jadwal Sidang</Trans>
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
