const fs = require('fs');

const data = JSON.parse(fs.readFileSync('./public/data/lpj.json', 'utf8'));

const newData = data.map(item => {
  const isTerlaksana = item.status === 'Terlaksana' || item.status === 'Sedang Berjalan';
  
  const newItem = {
    id: item.id,
    tanggal: item.tanggal,
    kementerian: item.kementerian,
    judul: item.judul,
    status: item.status,
    fileSize: item.fileSize,
    pdfUrl: item.pdfUrl,
    bab1: {
      latarBelakang: "Program ini dilatarbelakangi oleh kebutuhan untuk meningkatkan kualitas dan efektivitas kegiatan mahasiswa di lingkungan kampus STIE Wikara.",
      tujuanKegiatan: "Tujuan utama dari kegiatan ini adalah untuk " + item.judul.toLowerCase() + " secara optimal.",
      manfaatKegiatan: "Manfaat dari kegiatan ini adalah memberikan dampak positif yang berkelanjutan bagi seluruh civitas akademika STIE Wikara."
    },
    bab2: {
      namaKegiatan: item.judul,
      tema: "Sinergi dan Kolaborasi untuk STIE Wikara yang Lebih Baik",
      waktuTempat: item.tanggal + " di Lingkungan Kampus STIE Wikara",
      sasaranPeserta: "Seluruh mahasiswa dan pengurus ormawa STIE Wikara"
    },
    bab3: {
      pelaksanaan: isTerlaksana ? "Kegiatan dilaksanakan sesuai dengan rundown yang telah ditetapkan oleh panitia pelaksana. Seluruh rangkaian acara berjalan dengan lancar dan tertib." : "Kegiatan tidak dapat dilaksanakan sesuai dengan rencana awal."
    },
    bab4: {
      catatanKegiatan: isTerlaksana ? "Kegiatan berjalan dengan baik dan mendapat antusiasme yang tinggi dari peserta." : "Kegiatan dibatalkan atau ditunda karena kendala teknis dan administratif.",
      output: isTerlaksana ? "Terciptanya pemahaman dan output yang sesuai dengan target awal program kerja." : "Tidak ada output yang dihasilkan karena kegiatan tidak terlaksana."
    },
    bab5: {
      kendala: isTerlaksana ? "Terdapat beberapa kendala teknis kecil di lapangan seperti masalah sound system dan keterlambatan beberapa peserta." : "Kurangnya partisipasi, bentrok dengan jadwal kegiatan akademik lain yang lebih mendesak, serta keterbatasan sumber daya pada saat pelaksanaan.",
      solusi: isTerlaksana ? "Panitia langsung berkoordinasi dengan pihak terkait untuk memperbaiki sound system dan menyesuaikan rundown acara." : "Melakukan evaluasi menyeluruh dan penjadwalan ulang untuk periode berikutnya.",
      perbaikan: "Perlu adanya persiapan yang lebih matang dan komunikasi yang lebih intensif antar panitia dan peserta."
    },
    bab6: {
      laporanKeuangan: isTerlaksana ? [
        { deskripsi: "Pemasukan Dana BEM", nominal: 5000000, jenis: "pemasukan" },
        { deskripsi: "Biaya Konsumsi", nominal: 1500000, jenis: "pengeluaran" },
        { deskripsi: "Biaya Perlengkapan", nominal: 1000000, jenis: "pengeluaran" },
        { deskripsi: "Biaya Pemateri/Narasumber", nominal: 1500000, jenis: "pengeluaran" }
      ] : [],
      lampiran: isTerlaksana ? ["Bukti Nota Konsumsi", "Bukti Pembelian Perlengkapan"] : []
    },
    bab7: {
      penutup: "Demikian Laporan Pertanggungjawaban ini kami buat dengan sebenar-benarnya sebagai bentuk transparansi dan akuntabilitas pelaksanaan program kerja. Semoga dapat menjadi bahan evaluasi untuk kegiatan selanjutnya."
    }
  };
  
  return newItem;
});

fs.writeFileSync('./public/data/lpj.json', JSON.stringify(newData, null, 2));
console.log('LPJ data updated successfully.');
