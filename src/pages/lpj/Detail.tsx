import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, FileText, Calendar, Users, CheckCircle, XCircle, Clock, AlertCircle, Download } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { motion } from "motion/react";
import { PdfViewer } from "@/components/ui/PdfViewer";
import { Trans } from "@/components/ui/Trans";
import { useTranslateText } from "@/contexts/TranslationContext";
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface LpjData {
  id: string;
  tanggal: string;
  kementerian: string;
  judul: string;
  status: string;
  fileSize: string;
  pdfUrl: string;
  bab1?: {
    latarBelakang: string;
    tujuanKegiatan: string;
    manfaatKegiatan: string;
  };
  bab2?: {
    namaKegiatan: string;
    tema?: string;
    waktuTempat: string;
    sasaranPeserta: string;
  };
  bab3?: {
    pelaksanaan: string;
    alasanTidakTerlaksana?: string;
  };
  bab4?: {
    catatanKegiatan: string;
    output: string;
  };
  bab5?: {
    kendala: string;
    solusi: string;
    perbaikan: string;
  };
  bab6?: {
    laporanKeuangan: { 
      keterangan: string;
      qty: number;
      satuan: string;
      debit: number;
      kredit: number;
      saldo: number;
      // Legacy support
      deskripsi?: string;
      nominal?: number;
      jenis?: string;
    }[];
    lampiran?: string[];
  };
  bab7?: {
    penutup: string;
  };
}

const shortenKementerian = (name: string) => {
  return name.replace(/^Kementerian\s+/i, '');
};

const createSlug = (text: string) => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
};

export function Detail() {
  const { kementerianSlug, judulSlug } = useParams();
  const [lpj, setLpj] = useState<LpjData | null>(null);
  const [anggota, setAnggota] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("ringkasan");
  const { t } = useTranslateText();

  const formatText = (text: string | undefined) => {
    if (!text) return null;
    
    // Check if the text contains numbered lists like "1. ", "2. ", etc.
    if (/\b\d+\.\s/.test(text)) {
      // Split by numbered list pattern, keeping the numbers
      const parts = text.split(/(\b\d+\.\s)/).filter(Boolean);
      
      const listItems = [];
      let currentNumber = "";
      
      for (let i = 0; i < parts.length; i++) {
        if (/\b\d+\.\s/.test(parts[i])) {
          currentNumber = parts[i];
        } else if (currentNumber) {
          listItems.push({ number: currentNumber, text: parts[i] });
          currentNumber = "";
        } else {
          // Text before the first number
          listItems.push({ number: "", text: parts[i] });
        }
      }

      if (listItems.length > 0) {
        return (
          <div className="space-y-3">
            {listItems.map((item, i) => (
              item.number ? (
                <div key={i} className="flex gap-2 md:gap-3">
                  <span className="text-xs md:text-base font-medium text-slate-700 dark:text-slate-300 shrink-0">{item.number.trim()}</span>
                  <p className="text-xs md:text-base text-slate-600 dark:text-slate-400 leading-relaxed text-justify">
                    <Trans>{item.text.trim()}</Trans>
                  </p>
                </div>
              ) : (
                <p key={i} className="text-xs md:text-base text-slate-600 dark:text-slate-400 leading-relaxed text-justify">
                  <Trans>{item.text.trim()}</Trans>
                </p>
              )
            ))}
          </div>
        );
      }
    }
    
    return <p className="text-xs md:text-base text-slate-600 dark:text-slate-400 leading-relaxed text-justify"><Trans>{text}</Trans></p>;
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    Promise.all([
      fetch('/data/lpj.json').then(res => res.json()),
      fetch('/data/anggota.json').then(res => res.json())
    ])
      .then(([lpjData, anggotaData]) => {
        let found = null;
        
        const safeLpjData = Array.isArray(lpjData) ? lpjData : [];
        const safeAnggotaData = Array.isArray(anggotaData) ? anggotaData : [];

        if (kementerianSlug && judulSlug) {
          found = safeLpjData.find((item) => {
            const itemKementerianSlug = createSlug(shortenKementerian(item.kementerian));
            const itemJudulSlug = createSlug(item.judul);
            return itemKementerianSlug === kementerianSlug && itemJudulSlug === judulSlug;
          });
        } else if (judulSlug) {
          // Fallback for old URLs or if kementerianSlug is missing
          found = safeLpjData.find((item) => item.id === judulSlug);
        }
        
        setLpj(found || null);
        setAnggota(safeAnggotaData);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch data:", err);
        setIsLoading(false);
      });
  }, [kementerianSlug, judulSlug]);

  const relatedMembers = lpj ? anggota.filter(m => m.kementerian === lpj.kementerian) : [];

  const handleDownloadPdf = () => {
    if (!lpj) return;
    const doc = new jsPDF();
    let yPos = 20;

    const checkPageBreak = (neededSpace: number) => {
      if (yPos + neededSpace > 280) {
        doc.addPage();
        yPos = 20;
      }
    };

    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    const title = "LAPORAN PERTANGGUNG JAWABAN";
    const textWidth = doc.getTextWidth(title);
    const xPos = (doc.internal.pageSize.width - textWidth) / 2;
    doc.text(title, xPos, yPos);
    yPos += 15;

    doc.setFontSize(14);
    const splitJudul = doc.splitTextToSize(lpj.judul, 180);
    doc.text(splitJudul, 14, yPos);
    yPos += (splitJudul.length * 7) + 5;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Kementerian: ${lpj.kementerian}`, 14, yPos);
    yPos += 6;
    doc.text(`Tanggal: ${lpj.tanggal}`, 14, yPos);
    yPos += 6;
    doc.text(`Status: ${lpj.status === 'Sedang Berjalan' ? 'Terlaksana' : lpj.status === 'Stagnan' ? 'Tidak Terlaksana' : lpj.status}`, 14, yPos);
    yPos += 10;

    const addSection = (title: string, content: string) => {
      if (!content) return;
      checkPageBreak(20);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text(title, 14, yPos);
      yPos += 6;
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      const lines = doc.splitTextToSize(content, 170);
      checkPageBreak(lines.length * 5);
      doc.text(lines, 22, yPos); // Indented to align roughly with the start of the title text after the number
      yPos += (lines.length * 5) + 10;
    };

    if (lpj.bab1) {
      checkPageBreak(30);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("BAB I", doc.internal.pageSize.width / 2, yPos, { align: 'center' });
      yPos += 6;
      doc.text("PENDAHULUAN", doc.internal.pageSize.width / 2, yPos, { align: 'center' });
      yPos += 12;
      addSection("1.1 Latar Belakang", lpj.bab1.latarBelakang);
      addSection("1.2 Tujuan Kegiatan", lpj.bab1.tujuanKegiatan);
      addSection("1.3 Manfaat Kegiatan", lpj.bab1.manfaatKegiatan);
    }

    if (lpj.bab2) {
      checkPageBreak(30);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("BAB II", doc.internal.pageSize.width / 2, yPos, { align: 'center' });
      yPos += 6;
      doc.text("DESKRIPSI KEGIATAN", doc.internal.pageSize.width / 2, yPos, { align: 'center' });
      yPos += 12;
      addSection("2.1 Nama Kegiatan/Program Kerja", lpj.bab2.namaKegiatan);
      if (lpj.bab2.tema) addSection("2.2 Tema", lpj.bab2.tema);
      addSection(`${lpj.bab2.tema ? '2.3' : '2.2'} Waktu dan Tempat Pelaksanaan`, lpj.bab2.waktuTempat);
      addSection(`${lpj.bab2.tema ? '2.4' : '2.3'} Sasaran/Peserta Kegiatan`, lpj.bab2.sasaranPeserta);
    }

    if (lpj.bab3) {
      checkPageBreak(30);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("BAB III", doc.internal.pageSize.width / 2, yPos, { align: 'center' });
      yPos += 6;
      doc.text("PELAKSANAAN", doc.internal.pageSize.width / 2, yPos, { align: 'center' });
      yPos += 12;
      addSection("3.1 Pelaksanaan / Rundown", lpj.bab3.pelaksanaan);
      if (lpj.status === 'Tidak Terlaksana' || lpj.status === 'Stagnan') {
        addSection("3.2 Alasan Tidak Terlaksana", lpj.bab3.alasanTidakTerlaksana || lpj.bab5?.kendala || "Kendala teknis dan administratif.");
      }
    }

    if (lpj.bab4) {
      checkPageBreak(30);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("BAB IV", doc.internal.pageSize.width / 2, yPos, { align: 'center' });
      yPos += 6;
      doc.text("HASIL KEGIATAN", doc.internal.pageSize.width / 2, yPos, { align: 'center' });
      yPos += 12;
      addSection("4.1 Catatan Kegiatan", lpj.bab4.catatanKegiatan);
      addSection("4.2 Output", lpj.bab4.output);
    }

    if (lpj.bab5) {
      checkPageBreak(30);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("BAB V", doc.internal.pageSize.width / 2, yPos, { align: 'center' });
      yPos += 6;
      doc.text("EVALUASI", doc.internal.pageSize.width / 2, yPos, { align: 'center' });
      yPos += 12;
      addSection("5.1 Kendala yang Dihadapi", lpj.bab5.kendala);
      addSection("5.2 Solusi yang Dilakukan", lpj.bab5.solusi);
      addSection("5.3 Hal yang Perlu Diperbaiki ke Depan", lpj.bab5.perbaikan);
    }

    if (lpj.bab6) {
      checkPageBreak(30);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("BAB VI", doc.internal.pageSize.width / 2, yPos, { align: 'center' });
      yPos += 6;
      doc.text("KEUANGAN", doc.internal.pageSize.width / 2, yPos, { align: 'center' });
      yPos += 12;
      
      const isNoBudget = !lpj.bab6.laporanKeuangan || lpj.bab6.laporanKeuangan.length === 0;
      const isNotExecuted = lpj.status === 'Tidak Terlaksana' || lpj.status === 'Stagnan';

      if (isNoBudget || isNotExecuted) {
        doc.setFontSize(10);
        doc.setFont("helvetica", "italic");
        doc.text("Tidak ada riwayat rincian keuangan", 14, yPos);
        yPos += 10;
      } else {
        checkPageBreak(15);
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.text("6.1 Tabel Laporan Keuangan", 14, yPos);
        yPos += 8;
        
        const tableData = lpj.bab6.laporanKeuangan.map((item, index) => [
          index + 1,
          item.keterangan || item.deskripsi || "-",
          item.qty || 1,
          item.satuan || "-",
          item.debit ? `Rp ${item.debit.toLocaleString('id-ID')}` : (item.jenis === 'pemasukan' ? `Rp ${item.nominal?.toLocaleString('id-ID')}` : "Rp 0"),
          item.kredit ? `Rp ${item.kredit.toLocaleString('id-ID')}` : (item.jenis === 'pengeluaran' ? `Rp ${item.nominal?.toLocaleString('id-ID')}` : "Rp 0"),
          item.saldo ? `Rp ${item.saldo.toLocaleString('id-ID')}` : "-"
        ]);

        (doc as any).autoTable({
          startY: yPos,
          head: [['No', 'Keterangan', 'QTY', 'Satuan', 'Debit', 'Kredit', 'Saldo']],
          body: tableData,
          theme: 'grid',
          headStyles: { fillColor: [51, 65, 85], textColor: [255, 255, 255], fontStyle: 'bold' },
          styles: { fontSize: 8, cellPadding: 2 },
          columnStyles: {
            0: { cellWidth: 10 },
            2: { cellWidth: 15 },
            3: { cellWidth: 20 },
            4: { cellWidth: 30, halign: 'right' },
            5: { cellWidth: 30, halign: 'right' },
            6: { cellWidth: 30, halign: 'right' },
          }
        });
        
        yPos = (doc as any).lastAutoTable.finalY + 10;
      }
      
      if (lpj.bab6.lampiran && lpj.bab6.lampiran.length > 0) {
        checkPageBreak(15);
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.text("6.2 Lampiran Bukti Transaksi", 14, yPos);
        yPos += 8;
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text(lpj.bab6.lampiran.join(", "), 14, yPos);
        yPos += 15;
      }
    }

    if (lpj.bab7) {
      checkPageBreak(30);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("BAB VII", doc.internal.pageSize.width / 2, yPos, { align: 'center' });
      yPos += 6;
      doc.text("PENUTUP", doc.internal.pageSize.width / 2, yPos, { align: 'center' });
      yPos += 12;
      addSection("7.1 Penutup", lpj.bab7.penutup);
    }

    if (relatedMembers.length > 0) {
      checkPageBreak(15);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Tim Pelaksana / Kementerian Terkait", 14, yPos);
      yPos += 8;
      
      doc.setFontSize(10);
      relatedMembers.forEach(member => {
        checkPageBreak(6);
        doc.setFont("helvetica", "bold");
        doc.text(`${member.jabatan}:`, 14, yPos);
        doc.setFont("helvetica", "normal");
        doc.text(`${member.nama} ${member.nim !== '-' ? `(${member.nim})` : ''}`, 60, yPos);
        yPos += 6;
      });
      yPos += 5;
    }

    window.open(doc.output('bloburl'), '_blank');
  };

  if (isLoading) {
    return (
      <div className="pt-24 pb-12 md:pt-32 md:pb-20 min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center">
        <div className="w-6 h-6 md:w-8 md:h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-3 md:mb-4"></div>
        <p className="text-sm md:text-base text-slate-500"><Trans>Memuat data...</Trans></p>
      </div>
    );
  }

  if (!lpj) {
    return (
      <div className="pt-24 pb-12 md:pt-32 md:pb-20 min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center">
        <h2 className="text-lg md:text-2xl font-bold text-slate-900 dark:text-white mb-3 md:mb-4"><Trans>Data tidak ditemukan</Trans></h2>
        <Link to="/lpj">
          <Button variant="outline" size="sm" className="md:hidden"><Trans>Kembali</Trans></Button>
          <Button variant="outline" className="hidden md:flex"><Trans>Kembali ke Daftar LPJ</Trans></Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-12 md:pt-32 md:pb-20 min-h-screen bg-slate-50 dark:bg-slate-950 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[300px] h-[300px] md:w-[500px] md:h-[500px] bg-primary-500/10 rounded-full blur-[80px] md:blur-[100px] -translate-y-1/2 translate-x-1/3" />
      
      <div className="container mx-auto px-4 md:px-6 relative z-10 max-w-4xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4 md:space-y-6"
        >
          <div className="glass-card p-4 md:p-12 rounded-xl md:rounded-3xl">
            <div className="flex items-start justify-between gap-3 md:gap-4 mb-4 md:mb-8">
              <div className="flex items-center gap-3 md:gap-6">
                <div className="w-10 h-10 md:w-20 md:h-20 rounded-lg md:rounded-2xl flex items-center justify-center bg-gradient-to-br from-primary-500 to-sky-400 text-white shadow-lg shrink-0">
                  <FileText className="w-5 h-5 md:w-10 md:h-10" />
                </div>
                <h1 className="text-base md:text-4xl font-bold font-heading text-slate-900 dark:text-white leading-tight">
                  <Trans>{lpj.judul}</Trans>
                </h1>
              </div>
            </div>
            
            <div className="flex border-b border-slate-200 dark:border-slate-800 mb-6 md:mb-8">
              <button
                onClick={() => setActiveTab("ringkasan")}
                className={`px-4 py-2 text-sm md:text-base font-medium border-b-2 transition-colors ${
                  activeTab === "ringkasan"
                    ? "border-primary-500 text-primary-600 dark:text-primary-400"
                    : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
                }`}
              >
                <Trans>Ringkasan</Trans>
              </button>
              <button
                onClick={() => setActiveTab("dokumen")}
                className={`px-4 py-2 text-sm md:text-base font-medium border-b-2 transition-colors ${
                  activeTab === "dokumen"
                    ? "border-primary-500 text-primary-600 dark:text-primary-400"
                    : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
                }`}
              >
                <Trans>Dokumen</Trans>
              </button>
            </div>

            {activeTab === "ringkasan" && (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-6 mb-6 md:mb-10 p-3 md:p-6 bg-slate-50 dark:bg-slate-900/50 rounded-xl md:rounded-2xl border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2 md:gap-4 text-slate-600 dark:text-slate-300 col-span-2 sm:col-span-1">
                    <div className="w-8 h-8 md:w-12 md:h-12 rounded-full bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 shrink-0">
                      <Users className="w-3.5 h-3.5 md:w-5 md:h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] md:text-sm text-slate-400 mb-0.5 md:mb-1"><Trans>Kementerian</Trans></p>
                      <p className="text-xs md:text-base font-medium"><Trans>{lpj.kementerian}</Trans></p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 md:gap-4 text-slate-600 dark:text-slate-300">
                    <div className="w-8 h-8 md:w-12 md:h-12 rounded-full bg-sky-50 dark:bg-sky-900/30 flex items-center justify-center text-sky-600 dark:text-sky-400 shrink-0">
                      <Calendar className="w-3.5 h-3.5 md:w-5 md:h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] md:text-sm text-slate-400 mb-0.5 md:mb-1"><Trans>Tanggal</Trans></p>
                      <p className="text-xs md:text-base font-medium"><Trans>{lpj.tanggal}</Trans></p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 md:gap-4 text-slate-600 dark:text-slate-300">
                    <div className={`w-8 h-8 md:w-12 md:h-12 rounded-full flex items-center justify-center shrink-0 ${
                      (lpj.status === 'Terlaksana' || lpj.status === 'Sedang Berjalan') ? 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400' :
                      'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {(lpj.status === 'Terlaksana' || lpj.status === 'Sedang Berjalan') && <CheckCircle className="w-3.5 h-3.5 md:w-5 md:h-5" />}
                      {(lpj.status === 'Tidak Terlaksana' || lpj.status === 'Stagnan') && <XCircle className="w-3.5 h-3.5 md:w-5 md:h-5" />}
                    </div>
                    <div>
                      <p className="text-[10px] md:text-sm text-slate-400 mb-0.5 md:mb-1"><Trans>Status</Trans></p>
                      <p className="text-xs md:text-base font-medium">
                        <Trans>{lpj.status === 'Sedang Berjalan' ? 'Terlaksana' : 
                         lpj.status === 'Stagnan' ? 'Tidak Terlaksana' : 
                         lpj.status}</Trans>
                      </p>
                    </div>
                  </div>
                </div>

                {relatedMembers.length > 0 && (
                  <div className="mb-6 md:mb-10 p-3 md:p-6 bg-white dark:bg-slate-900 rounded-xl md:rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <h3 className="text-sm md:text-lg font-bold text-slate-900 dark:text-white mb-3 md:mb-4 flex items-center gap-2">
                      <Users className="w-4 h-4 md:w-5 md:h-5 text-primary-500" />
                      <Trans>Tim Pelaksana / Kementerian Terkait</Trans>
                    </h3>
                    <div className="grid grid-cols-2 gap-2 md:gap-4">
                      {relatedMembers.map((member, idx) => (
                        <div key={idx} className="p-2.5 md:p-4 rounded-lg md:rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
                          <p className="text-[10px] md:text-xs font-bold text-primary-600 dark:text-primary-400 uppercase tracking-wider mb-0.5 md:mb-1"><Trans>{member.jabatan}</Trans></p>
                          <p className="text-[11px] md:text-base font-medium text-slate-900 dark:text-white line-clamp-2 leading-tight">{member.nama}</p>
                          {member.nim !== "-" && (
                            <p className="text-[9px] md:text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5 md:mt-1">{member.nim}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {activeTab === "dokumen" && (
              <>
                {lpj.bab1 && (
                  <div className="pt-4 md:pt-8">
                    <div className="text-center mb-4 md:mb-10">
                      <h3 className="text-sm md:text-xl font-bold text-slate-900 dark:text-white uppercase">BAB I</h3>
                      <h3 className="text-sm md:text-xl font-bold text-slate-900 dark:text-white uppercase"><Trans>Pendahuluan</Trans></h3>
                    </div>
                    <div className="space-y-4 md:space-y-8">
                      <div>
                        <h4 className="text-xs md:text-base font-bold text-slate-900 dark:text-white mb-1 md:mb-1">1.1 <Trans>Latar Belakang</Trans></h4>
                        <div className="pl-2 md:pl-8">
                          {formatText(lpj.bab1.latarBelakang)}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-xs md:text-base font-bold text-slate-900 dark:text-white mb-1 md:mb-1">1.2 <Trans>Tujuan Kegiatan</Trans></h4>
                        <div className="pl-2 md:pl-8">
                          {formatText(lpj.bab1.tujuanKegiatan)}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-xs md:text-base font-bold text-slate-900 dark:text-white mb-1 md:mb-1">1.3 <Trans>Manfaat Kegiatan</Trans></h4>
                        <div className="pl-2 md:pl-8">
                          {formatText(lpj.bab1.manfaatKegiatan)}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {lpj.bab2 && (
                  <div className="pt-4 md:pt-8 border-t border-slate-100 dark:border-slate-800 mt-4 md:mt-8">
                    <div className="text-center mb-4 md:mb-10">
                      <h3 className="text-sm md:text-xl font-bold text-slate-900 dark:text-white uppercase">BAB II</h3>
                      <h3 className="text-sm md:text-xl font-bold text-slate-900 dark:text-white uppercase"><Trans>Deskripsi Kegiatan</Trans></h3>
                    </div>
                    <div className="space-y-4 md:space-y-8">
                      <div>
                        <h4 className="text-xs md:text-base font-bold text-slate-900 dark:text-white mb-1 md:mb-1">2.1 <Trans>Nama Kegiatan/Program Kerja</Trans></h4>
                        <div className="pl-2 md:pl-8">
                          {formatText(lpj.bab2.namaKegiatan)}
                        </div>
                      </div>
                      {lpj.bab2.tema && (
                        <div>
                          <h4 className="text-xs md:text-base font-bold text-slate-900 dark:text-white mb-1 md:mb-1">2.2 <Trans>Tema</Trans></h4>
                          <div className="pl-2 md:pl-8">
                            {formatText(lpj.bab2.tema)}
                          </div>
                        </div>
                      )}
                      <div>
                        <h4 className="text-xs md:text-base font-bold text-slate-900 dark:text-white mb-1 md:mb-1">{lpj.bab2.tema ? '2.3' : '2.2'} <Trans>Waktu dan Tempat Pelaksanaan</Trans></h4>
                        <div className="pl-2 md:pl-8">
                          {formatText(lpj.bab2.waktuTempat)}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-xs md:text-base font-bold text-slate-900 dark:text-white mb-1 md:mb-1">{lpj.bab2.tema ? '2.4' : '2.3'} <Trans>Sasaran/Peserta Kegiatan</Trans></h4>
                        <div className="pl-2 md:pl-8">
                          {formatText(lpj.bab2.sasaranPeserta)}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {lpj.bab3 && (
                  <div className="pt-4 md:pt-8 border-t border-slate-100 dark:border-slate-800 mt-4 md:mt-8">
                    <div className="text-center mb-4 md:mb-10">
                      <h3 className="text-sm md:text-xl font-bold text-slate-900 dark:text-white uppercase">BAB III</h3>
                      <h3 className="text-sm md:text-xl font-bold text-slate-900 dark:text-white uppercase"><Trans>Pelaksanaan</Trans></h3>
                    </div>
                    <div className="space-y-4 md:space-y-8">
                      <div>
                        <h4 className="text-xs md:text-base font-bold text-slate-900 dark:text-white mb-1 md:mb-1">3.1 <Trans>Pelaksanaan / Rundown</Trans></h4>
                        <div className="pl-2 md:pl-8">
                          {formatText(lpj.bab3.pelaksanaan)}
                        </div>
                      </div>
                      {(lpj.status === 'Tidak Terlaksana' || lpj.status === 'Stagnan') && (
                        <div>
                          <h4 className="text-xs md:text-base font-bold text-slate-900 dark:text-white mb-1 md:mb-1">3.2 <Trans>Alasan Tidak Terlaksana</Trans></h4>
                          <div className="pl-2 md:pl-8">
                            <p className="text-xs md:text-base text-slate-600 dark:text-slate-400 leading-relaxed text-justify italic">
                              <Trans>{lpj.bab3.alasanTidakTerlaksana || lpj.bab5?.kendala || "Kendala teknis dan administratif."}</Trans>
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {lpj.bab4 && (
                  <div className="pt-4 md:pt-8 border-t border-slate-100 dark:border-slate-800 mt-4 md:mt-8">
                    <div className="text-center mb-4 md:mb-10">
                      <h3 className="text-sm md:text-xl font-bold text-slate-900 dark:text-white uppercase">BAB IV</h3>
                      <h3 className="text-sm md:text-xl font-bold text-slate-900 dark:text-white uppercase"><Trans>Hasil Kegiatan</Trans></h3>
                    </div>
                    <div className="space-y-4 md:space-y-8">
                      <div>
                        <h4 className="text-xs md:text-base font-bold text-slate-900 dark:text-white mb-1 md:mb-1">4.1 <Trans>Catatan Kegiatan</Trans></h4>
                        <div className="pl-2 md:pl-8">
                          {formatText(lpj.bab4.catatanKegiatan)}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-xs md:text-base font-bold text-slate-900 dark:text-white mb-1 md:mb-1">4.2 <Trans>Output</Trans></h4>
                        <div className="pl-2 md:pl-8">
                          {formatText(lpj.bab4.output)}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {lpj.bab5 && (
                  <div className="pt-4 md:pt-8 border-t border-slate-100 dark:border-slate-800 mt-4 md:mt-8">
                    <div className="text-center mb-4 md:mb-10">
                      <h3 className="text-sm md:text-xl font-bold text-slate-900 dark:text-white uppercase">BAB V</h3>
                      <h3 className="text-sm md:text-xl font-bold text-slate-900 dark:text-white uppercase"><Trans>Evaluasi</Trans></h3>
                    </div>
                    <div className="space-y-4 md:space-y-8">
                      <div>
                        <h4 className="text-xs md:text-base font-bold text-slate-900 dark:text-white mb-1 md:mb-1">5.1 <Trans>Kendala yang Dihadapi</Trans></h4>
                        <div className="pl-2 md:pl-8">
                          {formatText(lpj.bab5.kendala)}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-xs md:text-base font-bold text-slate-900 dark:text-white mb-1 md:mb-1">5.2 <Trans>Solusi yang Dilakukan</Trans></h4>
                        <div className="pl-2 md:pl-8">
                          {formatText(lpj.bab5.solusi)}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-xs md:text-base font-bold text-slate-900 dark:text-white mb-1 md:mb-1">5.3 <Trans>Hal yang Perlu Diperbaiki ke Depan</Trans></h4>
                        <div className="pl-2 md:pl-8">
                          {formatText(lpj.bab5.perbaikan)}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {lpj.bab6 && (
                  <div className="pt-4 md:pt-8 border-t border-slate-100 dark:border-slate-800 mt-4 md:mt-8">
                    <div className="text-center mb-4 md:mb-10">
                      <h3 className="text-sm md:text-xl font-bold text-slate-900 dark:text-white uppercase">BAB VI</h3>
                      <h3 className="text-sm md:text-xl font-bold text-slate-900 dark:text-white uppercase"><Trans>Keuangan</Trans></h3>
                    </div>
                    <div className="space-y-4 md:space-y-8">
                      <div>
                        <h4 className="text-xs md:text-base font-bold text-slate-900 dark:text-white mb-2 md:mb-4">6.1 <Trans>Tabel Laporan Keuangan</Trans></h4>
                        <div className="overflow-x-auto">
                          <table className="w-full text-[10px] md:text-sm text-left text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700/60 rounded-lg overflow-hidden">
                            <thead className="text-[10px] md:text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-800/50 dark:text-slate-300 border-b border-slate-200/60 dark:border-slate-700/60">
                              <tr>
                                <th scope="col" className="px-2 py-2 md:px-4 md:py-3 font-semibold border-r border-slate-200/60 dark:border-slate-700/60">No</th>
                                <th scope="col" className="px-2 py-2 md:px-4 md:py-3 font-semibold border-r border-slate-200/60 dark:border-slate-700/60"><Trans>Keterangan</Trans></th>
                                <th scope="col" className="px-2 py-2 md:px-4 md:py-3 font-semibold text-center border-r border-slate-200/60 dark:border-slate-700/60">QTY</th>
                                <th scope="col" className="px-2 py-2 md:px-4 md:py-3 font-semibold text-center border-r border-slate-200/60 dark:border-slate-700/60"><Trans>Satuan</Trans></th>
                                <th scope="col" className="px-2 py-2 md:px-4 md:py-3 font-semibold text-right border-r border-slate-200/60 dark:border-slate-700/60">Debit</th>
                                <th scope="col" className="px-2 py-2 md:px-4 md:py-3 font-semibold text-right border-r border-slate-200/60 dark:border-slate-700/60">Kredit</th>
                                <th scope="col" className="px-2 py-2 md:px-4 md:py-3 font-semibold text-right">Saldo</th>
                              </tr>
                            </thead>
                            <tbody>
                              {[1, 2, 3, 4, 5].map((item, idx) => (
                                <tr key={idx} className="bg-white dark:bg-slate-900 border-b border-slate-200/60 dark:border-slate-700/60 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                  <td className="px-2 py-2.5 md:px-4 md:py-4 border-r border-slate-200/60 dark:border-slate-700/60">{idx + 1}</td>
                                  <td className="px-2 py-2.5 md:px-4 md:py-4 border-r border-slate-200/60 dark:border-slate-700/60">-</td>
                                  <td className="px-2 py-2.5 md:px-4 md:py-4 text-center border-r border-slate-200/60 dark:border-slate-700/60">-</td>
                                  <td className="px-2 py-2.5 md:px-4 md:py-4 text-center border-r border-slate-200/60 dark:border-slate-700/60">-</td>
                                  <td className="px-2 py-2.5 md:px-4 md:py-4 text-right whitespace-nowrap border-r border-slate-200/60 dark:border-slate-700/60">-</td>
                                  <td className="px-2 py-2.5 md:px-4 md:py-4 text-right whitespace-nowrap border-r border-slate-200/60 dark:border-slate-700/60">-</td>
                                  <td className="px-2 py-2.5 md:px-4 md:py-4 text-right font-medium whitespace-nowrap text-slate-700 dark:text-slate-300 bg-slate-50/30 dark:bg-slate-800/20">-</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                      {lpj.bab6.lampiran && lpj.bab6.lampiran.length > 0 && (
                        <div>
                          <h4 className="text-xs md:text-base font-bold text-slate-900 dark:text-white mb-2 md:mb-2">6.2 <Trans>Lampiran Bukti Transaksi</Trans></h4>
                          <div className="pl-2 md:pl-8">
                            <ul className="list-disc pl-4 md:pl-5 text-xs md:text-base text-slate-600 dark:text-slate-400">
                              {lpj.bab6.lampiran.map((lampiran, idx) => (
                                <li key={idx}><Trans>{lampiran}</Trans></li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {lpj.bab7 && (
                  <div className="pt-4 md:pt-8 border-t border-slate-100 dark:border-slate-800 mt-4 md:mt-8">
                    <div className="text-center mb-4 md:mb-10">
                      <h3 className="text-sm md:text-xl font-bold text-slate-900 dark:text-white uppercase">BAB VII</h3>
                      <h3 className="text-sm md:text-xl font-bold text-slate-900 dark:text-white uppercase"><Trans>Penutup</Trans></h3>
                    </div>
                    <div className="space-y-4 md:space-y-8">
                      <div>
                        <h4 className="text-xs md:text-base font-bold text-slate-900 dark:text-white mb-1 md:mb-1">7.1 <Trans>Penutup</Trans></h4>
                        <div className="pl-2 md:pl-8">
                          {formatText(lpj.bab7.penutup)}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {lpj.pdfUrl && (
                  <div className="pt-4 md:pt-8 border-t border-slate-100 dark:border-slate-800 mt-4 md:mt-8">
                    <h3 className="text-base md:text-xl font-bold text-slate-900 dark:text-white mb-2 md:mb-4"><Trans>Dokumen LPJ</Trans></h3>
                    <PdfViewer url={lpj.pdfUrl} title={t(`Dokumen LPJ - ${lpj.judul}`)} />
                  </div>
                )}
              </>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
