import { useState } from "react";
import { Clock, MapPin, Calendar, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { motion, AnimatePresence } from "motion/react";
import { Trans } from "@/components/ui/Trans";
import { useTranslateText } from "@/contexts/TranslationContext";

export function AgendaSidang() {
  const [activeDay, setActiveDay] = useState(0);
  const { t } = useTranslateText();

  const days = [
    {
      date: "Jumat, 10 April 2026",
      title: "Sidang Pembukaan & Tata Tertib",
      focus: "Legitimasi formal acara, pengesahan aturan main (Tata Tertib), dan serah terima kekuasaan persidangan dari panitia kepada Pimpinan Sidang Tetap (Presidium).",
      schedule: [
        { time: "09.30 - 10.15", title: "Registrasi & Pengecekan Mandat Peserta", pic: "Divisi Kesekretariatan", desc: "Peserta menyerahkan Surat Mandat. Pemisahan duduk antara Peserta Penuh & Peninjau.", status: "terlaksana" },
        { time: "10.15 - 10.30", title: "Pengkondisian Ruang Sidang & Safety Briefing", pic: "Divisi Keamanan & Acara", desc: "Pintu ditutup sementara. Pembacaan tata tertib ruang sidang dasar oleh MC.", status: "terlaksana" },
        { time: "10.30 - 10.35", title: "CEREMONY PEMBUKAAN MUBES: Pembukaan Acara", pic: "Master of Ceremony (MC)", desc: "MC membuka acara pembukaan secara resmi dan membacakan susunan acara.", status: "terlaksana" },
        { time: "10.35 - 10.45", title: "Menyanyikan Lagu Indonesia Raya & Mars Mahasiswa", pic: "Dirigen & Seluruh Peserta", desc: "Peserta diwajibkan berdiri dengan sikap sempurna.", status: "terlaksana" },
        { time: "10.45 - 10.55", title: "Sambutan Ketua Pelaksana MUBES", pic: "Ketua Pelaksana", desc: "Laporan singkat mengenai persiapan dan jumlah peserta MUBES.", status: "terlaksana" },
        { time: "10.55 - 11.05", title: "Sambutan Presiden Mahasiswa (Ketua BEM)", pic: "Ketua BEM", desc: "Pengantar purna tugas dan harapan untuk persidangan.", status: "terlaksana" },
        { time: "11.05 - 11.15", title: "Sambutan Ketua STIE Wikara & Pembukaan Resmi", pic: "Ketua STIE Wikara", desc: "Sambutan institusi sekaligus membuka MUBES secara resmi (simbolis pemukulan gong/palu).", status: "terlaksana" },
        { time: "11.15 - 11.30", title: "Penyerahan Palu Sidang kepada Presidium Sementara (SC)", pic: "MC & Steering Committee", desc: "MC mundur, kendali forum diambil alih sepenuhnya oleh Presidium Sementara.", status: "terlaksana" },
        { time: "11.30 - 12.00", title: "SIDANG PLENO I (Sesi 1) Pembahasan Agenda Sidang & Tata Tertib MUBES", pic: "Presidium Sementara", desc: "Merupakan sesi krusial. Perdebatan terkait batas waktu bicara, mekanisme skorsing, dan hak suara.", status: "terlaksana" },
        { time: "12.00 - 13.00", title: "Istirahat, Salat, Makan (ISHOMA)", pic: "Divisi Konsumsi", desc: "Ruang sidang disterilkan.", status: "terlaksana" },
        { time: "13.00 - 15.30", title: "SIDANG PLENO I (Sesi 2) Lanjutan Pembahasan Tata Tertib", pic: "Presidium Sementara", desc: "Ketukan Palu Pengesahan Konsideran Tata Tertib MUBES STIE Wikara.", status: "terlaksana" },
        { time: "15.30 - 16.00", title: "Jeda Salat Asar & Coffee Break", pic: "Panitia Acara", desc: "Sekaligus masa persiapan serah terima berkas konsideran.", status: "terlaksana" },
        { time: "16.00 - 17.30", title: "Pemilihan Pimpinan Sidang Tetap (Presidium I, II, III)", pic: "Presidium Sementara & Forum", desc: "Pendelegasian calon presidium dari peserta penuh. Jika terjadi kebuntuan, dilakukan lobbying.", status: "terlaksana" },
        { time: "17.30 - 18.30", title: "Istirahat, Salat, Makan (ISHOMA)", pic: "Divisi Konsumsi", desc: "Pemulihan energi peserta dan panitia.", status: "terlaksana" },
        { time: "18.30 - 19.30", title: "Serah Terima Palu Sidang ke Presidium Tetap", pic: "Presidium Sementara & Tetap", desc: "Pengetukan palu pengalihan wewenang ke Presidium Tetap.", status: "terlaksana" },
        { time: "19.30 - 20.00", title: "Evaluasi Hari ke-1 & Penutupan Sidang", pic: "Presidium Tetap", desc: "Sidang di-skorsing hingga esok hari. Forum dibubarkan tepat pukul 20.00.", status: "terlaksana" }
      ]
    },
    {
      date: "Sabtu, 11 April 2026",
      title: "Sidang Laporan Pertanggungjawaban",
      focus: "Evaluasi menyeluruh terhadap kinerja BEM selama 1 periode. Pendekatan analitis, rasional, dan berlandaskan data. Diantisipasi sebagai hari dengan tensi paling tinggi.",
      schedule: [
        { time: "09.30 - 10.00", title: "Presensi & Pengkondisian Kuorum", pic: "Divisi Kesekretariatan", desc: "Sidang hanya bisa dimulai jika peserta memenuhi ½ n + 1 (sesuai AD Pasal 39).", status: "terlaksana" },
        { time: "10.00 - 10.15", title: "Pencabutan Skorsing & Pembukaan Sidang Pleno II", pic: "Presidium Tetap", desc: "Pembacaan konsideran agenda Pleno II.", status: "terlaksana" },
        { time: "10.15 - 12.00", title: "SIDANG PLENO II (Sesi 1) Pemaparan Laporan Pertanggungjawaban (LPJ) BEM", pic: "Ketua BEM & Jajaran Kabinet", desc: "Pemaparan difokuskan pada angka capaian KPI, serapan anggaran, dan progres per kementerian.", status: "terlaksana" },
        { time: "12.00 - 13.00", title: "ISHOMA & Waktu Salat Jumat", pic: "Divisi Konsumsi & Kerohanian", desc: "Mengakomodasi ibadah Salat Jumat bagi peserta muslim dan makan siang.", status: "terlaksana" },
        { time: "13.00 - 15.30", title: "Sesi Pandangan Umum & Tanya Jawab (Termin I)", pic: "Presidium Tetap", desc: "Peserta (HIMAMEN, HIMAKSI, UKM) memberikan kritik, pertanyaan, dan evaluasi. Alokasi waktu bicara dibatasi ketat.", status: "terlaksana" },
        { time: "15.30 - 16.00", title: "Jeda Salat Asar & Evaluasi Internal Delegasi", pic: "Panitia Acara", desc: "Digunakan untuk konsolidasi setiap fraksi/HIMA menentukan sikap akhir terhadap LPJ.", status: "terlaksana" },
        { time: "16.00 - 17.30", title: "SIDANG PLENO II (Sesi 2) Lanjutan Tanya Jawab & Jawaban dari Pengurus BEM", pic: "Presidium Tetap & Pengurus BEM", desc: "BEM memberikan klarifikasi atas setiap poin yang dipertanyakan oleh forum.", status: "terlaksana" },
        { time: "17.30 - 18.30", title: "Istirahat, Salat, Makan (ISHOMA)", pic: "Divisi Konsumsi", desc: "Jeda untuk meredakan tensi persidangan.", status: "terlaksana" },
        { time: "18.30 - 19.30", title: "Penetapan Status LPJ (Diterima / Diterima dengan Catatan / Ditolak)", pic: "Presidium Tetap", desc: "Menggunakan asas musyawarah mufakat. Jika mentok, dilakukan Lobbying atau Voting.", status: "terlaksana" },
        { time: "19.30 - 20.00", title: "Pembacaan Konsideran Demisioner & Skorsing Sidang", pic: "Presidium Tetap", desc: "Pengurus BEM dinyatakan Demisioner. Sidang di-skorsing tepat pukul 20.00.", status: "terlaksana" }
      ]
    },
    {
      date: "Senin, 13 April 2026",
      title: "Sidang AD/ART & GBHO",
      focus: "Amandemen konstitusi dan Garis Besar Haluan Organisasi. Membutuhkan ketelitian pembacaan teks hukum dan konsentrasi intelektual yang tinggi.",
      schedule: [
        { time: "09.30 - 10.00", title: "Presensi Kuorum & Pencabutan Skorsing", pic: "Divisi Kesekretariatan & Presidium", desc: "Presidium Tetap membuka Sidang Pleno III.", status: "terlaksana" },
        { time: "10.00 - 12.00", title: "SIDANG PLENO III (Sesi 1) Pembahasan Draf Anggaran Dasar (AD)", pic: "Presidium Tetap", desc: "Pembacaan dan bedah teks per pasal. Menitikberatkan pada status keanggotaan, asas, dan hierarki.", status: "terlaksana" },
        { time: "12.00 - 13.00", title: "Istirahat, Salat, Makan (ISHOMA)", pic: "Divisi Konsumsi", desc: "Pemulihan energi. Panitia merapikan draf amandemen sementara.", status: "terlaksana" },
        { time: "13.00 - 15.30", title: "SIDANG PLENO III (Sesi 2) Pembahasan Anggaran Rumah Tangga (ART)", pic: "Presidium Tetap", desc: "Dinamika tertinggi terjadi saat membahas job desk menteri, kriteria reshuffle, dan kode etik/sanksi.", status: "terlaksana" },
        { time: "15.30 - 16.00", title: "Jeda Salat Asar & Coffee Break", pic: "Panitia Konsumsi", desc: "Menjaga konsentrasi peserta dari kelelahan membaca teks konstitusi.", status: "terlaksana" },
        { time: "16.00 - 17.30", title: "Lanjutan Pembahasan ART & Waktu Lobbying", pic: "Presidium Tetap", desc: "Jika ada pasal krusial yang diperdebatkan tanpa ujung, Presidium melakukan Lobbying ketua-ketua delegasi.", status: "terlaksana" },
        { time: "17.30 - 18.30", title: "Istirahat, Salat, Makan (ISHOMA)", pic: "Divisi Konsumsi", desc: "Jeda istirahat malam.", status: "terlaksana" },
        { time: "18.30 - 19.30", title: "Pembahasan Garis Besar Haluan Organisasi (GBHO)", pic: "Presidium Tetap", desc: "Menetapkan arah kerja BEM selama 1 periode ke depan (indikator program utama).", status: "terlaksana" },
        { time: "19.30 - 20.00", title: "Pengesahan AD/ART & GBHO", pic: "Presidium Tetap", desc: "Pengetukan palu sidang paripurna Pleno III. Sidang di-skorsing untuk hari terakhir tepat pukul 20.00.", status: "terlaksana" }
      ]
    },
    {
      date: "Selasa, 14 April 2026",
      title: "Sidang Penutup / Paripurna",
      focus: "Penyelesaian administrasi legal organisasi, penetapan ketetapan akhir (TAP MUBES), rekonsiliasi seluruh peserta, dan selebrasi penutupan acara.",
      schedule: [
        { time: "09.30 - 10.00", title: "Pengkondisian Peserta & Pencabutan Skorsing Terakhir", pic: "Divisi Acara & Presidium", desc: "Peserta diharapkan hadir dalam keadaan kondusif dan berpakaian formal rapi (Jas Almamater/PDH).", status: "terlaksana" },
        { time: "10.00 - 12.00", title: "SIDANG PLENO IV (Paripurna) Pembacaan Seluruh Ketetapan (TAP) MUBES BEM STIE Wikara", pic: "Presidium Tetap", desc: "Pembacaan ulang poin-poin keputusan final secara garis besar untuk memastikan tidak ada kesalahan redaksional.", status: "terlaksana" },
        { time: "12.00 - 13.00", title: "Istirahat, Salat, Makan (ISHOMA)", pic: "Divisi Konsumsi", desc: "Jeda istirahat siang.", status: "terlaksana" },
        { time: "13.00 - 14.30", title: "Penandatanganan Berita Acara & Konsideran MUBES", pic: "Presidium Tetap & Saksi-Saksi", desc: "Penandatanganan dokumen legal oleh Presidium Sidang I, II, III dan perwakilan saksi penuh (HIMAMEN, HIMAKSI).", status: "terlaksana" },
        { time: "14.30 - 15.30", title: "Penyerahan Berkas MUBES kepada Pihak Institusi / DPM", pic: "Presidium Tetap", desc: "Berkas AD/ART dan GBHO yang telah disahkan diserahkan untuk proses penerbitan SK Ketua STIE Wikara.", status: "terlaksana" },
        { time: "15.30 - 16.00", title: "Jeda Salat Asar", pic: "Panitia Acara", desc: "Persiapan penutupan sidang.", status: "terlaksana" },
        { time: "16.00 - 17.00", title: "Penutupan Sidang Resmi (Ketukan Palu Paripurna)", pic: "Presidium Tetap", desc: "Presidium Tetap secara resmi membubarkan MUBES BEM STIE Wikara Periode 2025/2026.", status: "terlaksana" },
        { time: "17.00 - 17.05", title: "CEREMONY PENUTUPAN: Pembukaan Sesi Penutup", pic: "Master of Ceremony (MC)", desc: "MC memandu jalannya prosesi penutupan acara.", status: "terlaksana" },
        { time: "17.05 - 17.20", title: "Sambutan Penutup", pic: "Perwakilan Demisioner / Institusi", desc: "Mengembalikan marwah Silih Asah Silih Asih Silih Asuh. Seluruh perselisihan di ruang sidang ditinggalkan.", status: "terlaksana" },
        { time: "17.20 - 17.30", title: "Doa Penutup", pic: "Petugas Kerohanian", desc: "Doa bersama sebagai wujud syukur atas kelancaran acara.", status: "terlaksana" },
        { time: "17.30 - 18.30", title: "Istirahat, Salat, Makan (ISHOMA)", pic: "Divisi Konsumsi", desc: "Jeda istirahat malam.", status: "terlaksana" },
        { time: "18.30 - 20.00", title: "Foto Bersama, Salaman Rekonsiliasi & Sayonara", pic: "Panitia Seluruh Divisi", desc: "Acara selesai tepat pukul 20.00. Panitia melakukan operasi semut (membersihkan ruang sidang) dan evaluasi kepanitiaan.", status: "terlaksana" }
      ]
    }
  ];

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="grid grid-cols-2 gap-3 md:gap-4 mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 bg-white dark:bg-slate-800 px-3 py-3 md:px-6 md:py-4 rounded-lg md:rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="w-7 h-7 md:w-10 md:h-10 rounded-full bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 shrink-0">
            <Calendar className="w-3.5 h-3.5 md:w-5 md:h-5" />
          </div>
          <div>
            <p className="text-[10px] md:text-sm text-slate-500 dark:text-slate-400"><Trans>Waktu Pelaksanaan</Trans></p>
            <p className="text-xs md:text-base font-semibold text-slate-900 dark:text-white"><Trans>10 - 14 April 2026</Trans></p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 bg-white dark:bg-slate-800 px-3 py-3 md:px-6 md:py-4 rounded-lg md:rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="w-7 h-7 md:w-10 md:h-10 rounded-full bg-sky-50 dark:bg-sky-900/30 flex items-center justify-center text-sky-600 dark:text-sky-400 shrink-0">
            <MapPin className="w-3.5 h-3.5 md:w-5 md:h-5" />
          </div>
          <div>
            <p className="text-[10px] md:text-sm text-slate-500 dark:text-slate-400"><Trans>Lokasi</Trans></p>
            <p className="text-xs md:text-base font-semibold text-slate-900 dark:text-white"><Trans>Aula Utama STIE WIKARA</Trans></p>
          </div>
        </div>
      </div>

      <div className="glass-card p-3 md:p-8 rounded-xl md:rounded-3xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 md:gap-4 mb-4 md:mb-8">
          <h2 className="text-lg md:text-2xl font-bold font-heading text-slate-900 dark:text-white"><Trans>Rundown Acara</Trans></h2>
          
          <div className="flex flex-wrap gap-1.5 md:gap-2">
            {days.map((day, index) => (
              <button
                key={index}
                onClick={() => setActiveDay(index)}
                className={`px-2 py-1.5 md:px-4 md:py-2 rounded-md md:rounded-full text-[10px] md:text-sm font-medium transition-all duration-300 flex-1 sm:flex-none text-center ${
                  activeDay === index 
                    ? "bg-primary-600 text-white shadow-md shadow-primary-500/20" 
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                <Trans>Hari</Trans> {index + 1}
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeDay}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <div className="mb-4 md:mb-8 p-2.5 md:p-4 rounded-lg md:rounded-2xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50">
              <h3 className="text-sm md:text-lg font-bold text-slate-900 dark:text-white mb-1 md:mb-2"><Trans>{days[activeDay].date}</Trans> - <Trans>{days[activeDay].title}</Trans></h3>
              <p className="text-[10px] md:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                <span className="font-semibold text-slate-700 dark:text-slate-300"><Trans>Fokus Agenda:</Trans></span> <Trans>{days[activeDay].focus}</Trans>
              </p>
            </div>

            <div className="relative">
              <div className="absolute left-3 md:left-32 top-0 bottom-0 w-px bg-slate-200 dark:bg-slate-700" />
              
              <div className="space-y-3 md:space-y-6">
                {days[activeDay].schedule.map((item, i) => (
                  <div key={i} className="relative flex flex-col md:flex-row gap-1 md:gap-8 items-start pl-8 md:pl-0">
                    <div className="md:w-28 shrink-0 pt-1 flex items-center md:justify-end">
                      <span className="relative z-10 inline-block px-1.5 py-0.5 md:px-3 md:py-1 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-[10px] md:text-sm font-bold rounded-md md:rounded-full whitespace-nowrap border border-slate-200 dark:border-slate-700 shadow-sm">
                        {item.time}
                      </span>
                    </div>
                    <div className="absolute left-3 md:left-32 w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-primary-500 -translate-x-[5px] md:-translate-x-1.5 mt-2.5 shadow-[0_0_0_3px_rgba(59,130,246,0.2)] md:shadow-[0_0_0_4px_rgba(59,130,246,0.2)] dark:shadow-[0_0_0_3px_rgba(59,130,246,0.1)] z-10" />
                    <Card className="flex-1 glass-card overflow-hidden w-full rounded-xl md:rounded-2xl">
                      <CardContent className="p-0">
                        <div className="p-2.5 md:p-5">
                          <div className="flex flex-wrap items-start justify-between gap-2 mb-1 md:mb-2">
                            <h3 className="text-xs md:text-lg font-bold text-slate-900 dark:text-white leading-snug"><Trans>{item.title}</Trans></h3>
                          </div>
                          <p className="text-slate-600 dark:text-slate-400 text-[10px] md:text-sm mb-2 md:mb-3 leading-relaxed"><Trans>{item.desc}</Trans></p>
                          <div className="inline-flex items-center gap-1.5 md:gap-2 px-1.5 py-0.5 md:px-3 md:py-1.5 rounded md:rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
                            <span className="text-[10px] md:text-xs font-medium text-slate-500 dark:text-slate-400">PIC:</span>
                            <span className="text-[10px] md:text-xs font-semibold text-slate-700 dark:text-slate-300"><Trans>{item.pic}</Trans></span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
