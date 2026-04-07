import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generatePdf = async (type: 'mubes' | 'adart', specificDoc?: string) => {
  try {
    const doc = new jsPDF();
    let yPos = 20;
    
    const addTitle = (title: string) => {
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      const textWidth = doc.getTextWidth(title);
      const xPos = (doc.internal.pageSize.width - textWidth) / 2;
      doc.text(title, xPos, yPos);
      yPos += 10;
    };

    const addSectionTitle = (title: string) => {
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(title, 14, yPos);
      yPos += 8;
    };

    const addParagraph = (text: string) => {
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      const lines = doc.splitTextToSize(text, 180);
      
      // Check page break
      if (yPos + (lines.length * 5) > 280) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.text(lines, 14, yPos);
      yPos += (lines.length * 5) + 5;
    };

    const addList = (items: string[]) => {
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      
      items.forEach((item, idx) => {
        if (!item) return;
        const lines = doc.splitTextToSize(item, 170);
        
        if (yPos + (lines.length * 5) > 280) {
          doc.addPage();
          yPos = 20;
        }
        
        // If it starts with a number or letter, don't add bullet
        const match = item.match(/^([0-9]+|[a-z])\.\s+(.*)/);
        if (match) {
          doc.text(lines, 14, yPos);
        } else {
          doc.text("•", 14, yPos);
          doc.text(lines, 20, yPos);
        }
        yPos += (lines.length * 5) + 2;
      });
      yPos += 5;
    };

    if (type === 'mubes') {
      if (!specificDoc || specificDoc === 'semua' || specificDoc === 'agenda') {
        const agendaRes = await fetch('/data/agenda-sidang.json');
        const agendaData = await agendaRes.json();
        
        addTitle("AGENDA SIDANG MUBES");
        
        if (Array.isArray(agendaData)) {
          agendaData.forEach((day: any) => {
            addSectionTitle(`${day.date} - ${day.title}`);
            
            const tableData = day.schedule.map((item: any) => [
              item.waktu || item.time,
              item.acara || item.title,
              item.keterangan || item.desc || "-"
            ]);
            
            autoTable(doc, {
              startY: yPos,
              head: [['Waktu', 'Acara', 'Keterangan']],
              body: tableData,
              theme: 'grid',
              headStyles: { fillColor: [37, 99, 235] },
              styles: { fontSize: 9 }
            });
            
            yPos = (doc as any).lastAutoTable.finalY + 15;
          });
        }
      }

      if (!specificDoc || specificDoc === 'semua' || specificDoc === 'tor') {
        if (yPos > 200) { doc.addPage(); yPos = 20; }
        
        const torRes = await fetch('/data/tor.json');
        const torData = await torRes.json();
        
        addTitle("TERM OF REFERENCE (TOR)");
        
        if (Array.isArray(torData)) {
          torData.forEach((section: any) => {
            addSectionTitle(section.title);
            if (section.content) {
              addParagraph(section.content);
            }
            if (section.points && section.points.length > 0) {
              addList(section.points);
            }
          });
        }
      }

      if (!specificDoc || specificDoc === 'semua' || specificDoc === 'tartib') {
        if (yPos > 200) { doc.addPage(); yPos = 20; }
        
        const tartibRes = await fetch('/data/tatatertib.json');
        const tartibData = await tartibRes.json();
        
        addTitle("TATA TERTIB MUBES");
        
        if (Array.isArray(tartibData)) {
          tartibData.forEach((bab: any) => {
            addSectionTitle(bab.bab + (bab.title ? ` - ${bab.title}` : ''));
            
            if (bab.pasal) {
              bab.pasal.forEach((p: any) => {
                addSectionTitle(p.nomor);
                if (p.points && p.points.length > 0) {
                  addList(p.points);
                }
              });
            }
          });
        }
      }
      
      doc.save(specificDoc === 'semua' ? 'Dokumen_Mubes_Lengkap.pdf' : `Dokumen_Mubes_${specificDoc}.pdf`);
      
    } else if (type === 'adart') {
      if (!specificDoc || specificDoc === 'semua' || specificDoc === 'ad') {
        const adartRes = await fetch('/data/adart.json');
        const adartData = await adartRes.json();
        const adData = adartData.ad;
        
        addTitle("ANGGARAN DASAR (AD)");
        
        if (Array.isArray(adData)) {
          adData.forEach((bab: any) => {
            addSectionTitle(bab.bab + (bab.title ? ` - ${bab.title}` : ''));
            
            if (bab.pasal) {
              bab.pasal.forEach((p: any) => {
                addSectionTitle(p.nomor);
                if (p.points && p.points.length > 0) {
                  addList(p.points);
                }
              });
            }
          });
        }
      }

      if (!specificDoc || specificDoc === 'semua' || specificDoc === 'art') {
        if (yPos > 200) { doc.addPage(); yPos = 20; }
        
        const adartRes = await fetch('/data/adart.json');
        const adartData = await adartRes.json();
        const artData = adartData.art;
        
        addTitle("ANGGARAN RUMAH TANGGA (ART)");
        
        if (Array.isArray(artData)) {
          artData.forEach((bab: any) => {
            addSectionTitle(bab.bab + (bab.title ? ` - ${bab.title}` : ''));
            
            if (bab.pasal) {
              bab.pasal.forEach((p: any) => {
                addSectionTitle(p.nomor);
                if (p.points && p.points.length > 0) {
                  addList(p.points);
                }
              });
            }
          });
        }
      }
      
      doc.save(specificDoc === 'semua' ? 'Dokumen_ADART_Lengkap.pdf' : `Dokumen_${specificDoc.toUpperCase()}.pdf`);
    }
  } catch (error) {
    console.error("Failed to generate PDF", error);
  }
};
