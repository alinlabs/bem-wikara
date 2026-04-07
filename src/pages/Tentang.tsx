import { Target, Compass, Users, User } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { motion } from "motion/react";
import { Trans } from "@/components/ui/Trans";
import { useState, useEffect } from "react";

interface Anggota {
  jabatan: string;
  nama: string;
  nim: string;
  kementerian: string;
}

const OrgCard = ({ member }: any) => (
  <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm p-3 md:p-5 rounded-xl md:rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm w-full relative z-10 flex flex-col items-center hover:shadow-md hover:-translate-y-1 transition-all duration-300 group">
    <div className="w-10 h-10 md:w-14 md:h-14 bg-gradient-to-br from-primary-500 to-sky-400 text-white rounded-full flex items-center justify-center mb-2 md:mb-3 shadow-md group-hover:scale-110 transition-transform duration-300">
      <User className="w-5 h-5 md:w-6 md:h-6" />
    </div>
    <p className="text-[8px] md:text-[11px] font-bold text-primary-600 dark:text-primary-400 text-center mb-0.5 md:mb-1 leading-tight uppercase tracking-wider"><Trans>{member.jabatan}</Trans></p>
    <p className="text-[10px] md:text-sm font-bold text-slate-900 dark:text-white text-center mb-0.5 leading-tight line-clamp-2">{member.nama}</p>
    {member.nim !== "-" && (
      <p className="text-[8px] md:text-[10px] text-slate-500 dark:text-slate-400 text-center font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded mt-1">{member.nim}</p>
    )}
  </div>
);

export function Tentang() {
  const [anggota, setAnggota] = useState<Anggota[]>([]);

  useEffect(() => {
    fetch('/data/anggota.json')
      .then(res => res.json())
      .then(data => setAnggota(data))
      .catch(err => console.error("Failed to fetch anggota data:", err));
  }, []);

  // Group members by kementerian
  const groupedAnggota = anggota.reduce((acc, curr) => {
    if (!acc[curr.kementerian]) {
      acc[curr.kementerian] = [];
    }
    acc[curr.kementerian].push(curr);
    return acc;
  }, {} as Record<string, Anggota[]>);

  // Define order of ministries
  const kementerianOrder = [
    "Presidium",
    "Sekretaris Jendral",
    "Bendahara",
    "Kementerian Dalam Negeri",
    "Kementerian Hubungan Strategis & Kemitraan",
    "Kementerian Akademik & Prestasi",
    "Kementerian Ekonomi Kreatif & Digital",
    "Kementerian Hukum & Advokasi",
    "Kementerian Komunikasi & Informasi",
    "Kementerian Seni, Budaya & Olahraga",
    "Kementerian Sosial & Aspirasi Mahasiswa"
  ];

  return (
    <div className="pt-20 pb-12 md:pt-32 md:pb-20 min-h-screen bg-slate-50 dark:bg-slate-950 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 right-0 w-[250px] h-[250px] md:w-[500px] md:h-[500px] bg-primary-500/10 rounded-full blur-[60px] md:blur-[100px] -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-[250px] h-[250px] md:w-[500px] md:h-[500px] bg-sky-400/10 rounded-full blur-[60px] md:blur-[100px] translate-y-1/3 -translate-x-1/3" />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-3xl mx-auto mb-8 md:mb-20"
        >
          <div className="inline-block mb-2 md:mb-4 px-2 py-1 md:px-4 md:py-1.5 rounded-full bg-primary-50 dark:bg-primary-900/30 border border-primary-100 dark:border-primary-800">
            <span className="text-primary-600 dark:text-primary-400 font-medium text-[9px] md:text-sm tracking-wider uppercase"><Trans>Profil Organisasi</Trans></span>
          </div>
          <h1 className="text-xl md:text-5xl font-bold mb-2 md:mb-6 font-heading text-slate-900 dark:text-white tracking-tight"><Trans>Tentang Kabinet</Trans> <span className="text-gradient"><Trans>Cakrawala</Trans></span></h1>
          <p className="text-[11px] md:text-lg text-slate-600 dark:text-slate-400 font-light leading-relaxed px-2 md:px-4">
            <Trans>Mengenal lebih dekat visi, misi, dan filosofi yang menjadi landasan gerak BEM STIE WIKARA 2025/2026.</Trans>
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-16 items-center mb-10 md:mb-24">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="relative px-2 md:px-0 h-full"
          >
            <div className="grid grid-cols-2 gap-4 h-full">
              <div className="glass-card p-6 rounded-2xl flex flex-col items-center justify-center text-center gap-3 hover:-translate-y-1 transition-transform border border-primary-100 dark:border-primary-900/30 h-full">
                <div className="w-12 h-12 bg-primary-50 dark:bg-primary-900/20 rounded-full flex items-center justify-center text-primary-600 dark:text-primary-400 shrink-0">
                  <Target className="w-6 h-6" />
                </div>
                <div className="flex-1 flex flex-col justify-center">
                  <h4 className="font-bold text-slate-900 dark:text-white mb-1"><Trans>Fokus</Trans></h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400"><Trans>Berorientasi pada tujuan dan hasil nyata</Trans></p>
                </div>
              </div>
              <div className="glass-card p-6 rounded-2xl flex flex-col items-center justify-center text-center gap-3 hover:-translate-y-1 transition-transform border border-sky-100 dark:border-sky-900/30 mt-6 h-full">
                <div className="w-12 h-12 bg-sky-50 dark:bg-sky-900/20 rounded-full flex items-center justify-center text-sky-600 dark:text-sky-400 shrink-0">
                  <Users className="w-6 h-6" />
                </div>
                <div className="flex-1 flex flex-col justify-center">
                  <h4 className="font-bold text-slate-900 dark:text-white mb-1"><Trans>Kolaboratif</Trans></h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400"><Trans>Sinergi dalam setiap pergerakan</Trans></p>
                </div>
              </div>
              <div className="glass-card p-6 rounded-2xl flex flex-col items-center justify-center text-center gap-3 hover:-translate-y-1 transition-transform border border-purple-100 dark:border-purple-900/30 -mt-6 h-full">
                <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/20 rounded-full flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
                  <Compass className="w-6 h-6" />
                </div>
                <div className="flex-1 flex flex-col justify-center">
                  <h4 className="font-bold text-slate-900 dark:text-white mb-1"><Trans>Adaptif</Trans></h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400"><Trans>Responsif terhadap perubahan zaman</Trans></p>
                </div>
              </div>
              <div className="glass-card p-6 rounded-2xl flex flex-col items-center justify-center text-center gap-3 hover:-translate-y-1 transition-transform border border-emerald-100 dark:border-emerald-900/30 h-full">
                <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                  <User className="w-6 h-6" />
                </div>
                <div className="flex-1 flex flex-col justify-center">
                  <h4 className="font-bold text-slate-900 dark:text-white mb-1"><Trans>Integritas</Trans></h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400"><Trans>Kejujuran sebagai fondasi utama</Trans></p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="px-2 md:px-0 text-center lg:text-left mt-4 lg:mt-0"
          >
            <h2 className="text-lg md:text-4xl font-bold mb-3 md:mb-8 font-heading text-slate-900 dark:text-white"><Trans>Nilai-Nilai Inti</Trans></h2>
            <div className="space-y-2 md:space-y-6 text-[11px] md:text-lg text-slate-600 dark:text-slate-300 font-light leading-relaxed">
              <p>
                <Trans>Kami percaya bahwa perubahan besar dimulai dari fondasi nilai yang kuat. Nilai-nilai ini menjadi kompas yang memandu setiap langkah, keputusan, dan program kerja kami.</Trans>
              </p>
              <p>
                <Trans>Melalui fokus yang tajam, semangat kolaborasi, kemampuan beradaptasi, dan integritas yang tak tergoyahkan, kami berkomitmen untuk membawa BEM STIE WIKARA menuju pencapaian yang lebih tinggi dan berdampak luas.</Trans>
              </p>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 mb-10 md:mb-24 px-1 md:px-0">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="md:col-span-1"
          >
            <Card className="h-full glass-card p-4 md:p-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-20 h-20 md:w-32 md:h-32 bg-primary-500/10 rounded-full blur-xl md:blur-2xl group-hover:bg-primary-500/20 transition-colors" />
              <div className="flex items-center gap-3 md:gap-4 mb-3 md:mb-8">
                <div className="w-10 h-10 md:w-16 md:h-16 bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/30 shrink-0">
                  <Target className="w-5 h-5 md:w-8 md:h-8" />
                </div>
                <h3 className="text-base md:text-2xl font-bold font-heading text-slate-900 dark:text-white m-0"><Trans>Visi</Trans></h3>
              </div>
              <p className="text-[11px] md:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
                <Trans>Mewujudkan ekosistem organisasi dan mahasiswa STIE Wikara yang bernilai strategis dan mampu menjadi representasi unggulan dalam dinamika kompetisi global.</Trans>
              </p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="md:col-span-2"
          >
            <Card className="h-full glass-card p-4 md:p-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-20 h-20 md:w-32 md:h-32 bg-sky-400/10 rounded-full blur-xl md:blur-2xl group-hover:bg-sky-400/20 transition-colors" />
              <div className="flex items-center gap-3 md:gap-4 mb-3 md:mb-8">
                <div className="w-10 h-10 md:w-16 md:h-16 bg-gradient-to-br from-sky-400 to-blue-600 text-white rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg shadow-sky-400/30 shrink-0">
                  <Compass className="w-5 h-5 md:w-8 md:h-8" />
                </div>
                <h3 className="text-base md:text-2xl font-bold font-heading text-slate-900 dark:text-white m-0"><Trans>Misi</Trans></h3>
              </div>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 md:gap-6">
                {[
                  "Mendorong terciptanya mahasiswa dan organisasi yang berpikir kritis, inovatif, dan adaptif terhadap perubahan, melalui program pengembangan intelektual, kepemimpinan, dan literasi digital yang relevan dengan zaman.",
                  "Menjadi ruang yang terbuka dan aktif menyerap aspirasi, dengan sistem penyaluran gagasan, kritik, dan harapan yang jelas—mewakili kepentingan mahasiswa sekaligus memperkuat peran organisasi mahasiswa sebagai corong utama perubahan.",
                  "Membangun budaya kerja sama yang kuat antarorganisasi, antar mahasiswa, serta dengan pihak eksternal, demi menciptakan gerakan yang berdampak luas dan berkelanjutan bagi komunitas kampus.",
                  "Mengembangkan perspektif mahasiswa dan organisasi terhadap isu-isu global dan lokal melalui forum diskusi, pertukaran ide lintas disiplin, dan eksposur terhadap dunia profesional, sosial, dan budaya.",
                  "Menegakkan transparansi dan tanggung jawab dalam seluruh proses organisasi—dari perencanaan hingga pelaporan—dengan menjadikan kejujuran dan kepercayaan sebagai fondasi utama gerakan mahasiswa."
                ].map((misi, i) => (
                  <li key={i} className="flex gap-2 md:gap-4 items-start">
                    <div className="w-4 h-4 md:w-8 md:h-8 rounded-full bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400 flex items-center justify-center shrink-0 font-bold text-[9px] md:text-base mt-0.5 md:mt-0">
                      {i + 1}
                    </div>
                    <p className="text-[11px] md:text-base text-slate-600 dark:text-slate-400 leading-relaxed"><Trans>{misi}</Trans></p>
                  </li>
                ))}
              </ul>
            </Card>
          </motion.div>
        </div>

        {/* Daftar Anggota Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="w-full mx-auto"
        >
          <div className="text-center mb-6 md:mb-16">
            <div className="inline-block mb-2 md:mb-4 px-2.5 py-1 md:px-4 md:py-1.5 rounded-full bg-sky-50 dark:bg-sky-900/30 border border-sky-100 dark:border-sky-800">
              <span className="text-sky-600 dark:text-sky-400 font-medium text-[9px] md:text-sm tracking-wider uppercase"><Trans>Struktur Organisasi</Trans></span>
            </div>
            <h2 className="text-lg md:text-5xl font-bold font-heading text-slate-900 dark:text-white"><Trans>Daftar Pengurus</Trans></h2>
          </div>

          <div className="space-y-8 md:space-y-16">
            {/* Top Leadership: Presidium, Sekjen, Bendahara */}
            <div className="space-y-6 md:space-y-12">
              {kementerianOrder.slice(0, 3).map((k) => {
                const members = groupedAnggota[k];
                if (!members || members.length === 0) return null;
                return (
                  <div key={k} className="space-y-3 md:space-y-6">
                    <h3 className="text-sm md:text-xl font-bold text-slate-900 dark:text-white text-center border-b border-slate-200 dark:border-slate-800 pb-2 md:pb-4 max-w-[200px] md:max-w-xs mx-auto">
                      <Trans>{k}</Trans>
                    </h3>
                    <div className="flex flex-wrap justify-center gap-2 md:gap-6 max-w-3xl mx-auto">
                      {members.map((m, idx) => (
                        <div key={idx} className="w-[calc(50%-0.25rem)] sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)] max-w-[250px]">
                          <OrgCard member={m} />
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Ministries */}
            <div className="space-y-6 md:space-y-12">
              <h3 className="text-base md:text-2xl font-bold text-slate-900 dark:text-white text-center mb-4 md:mb-8">
                <Trans>Kementerian</Trans>
              </h3>
              <div className="space-y-6 md:space-y-12">
                {kementerianOrder.slice(3).map((k) => {
                  const members = groupedAnggota[k];
                  if (!members || members.length === 0) return null;
                  return (
                    <div key={k} className="space-y-3 md:space-y-6">
                      <h4 className="text-xs md:text-lg font-bold text-slate-800 dark:text-slate-200 text-center border-b border-slate-200/60 dark:border-slate-800/60 pb-2 max-w-[250px] md:max-w-sm mx-auto">
                        <Trans>{k}</Trans>
                      </h4>
                      <div className="flex flex-wrap justify-center gap-2 md:gap-6">
                        {members.map((m, idx) => (
                          <div key={idx} className="w-[calc(50%-0.25rem)] sm:w-[calc(33.333%-0.5rem)] lg:w-[calc(25%-1.125rem)] max-w-[250px]">
                            <OrgCard member={m} />
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
