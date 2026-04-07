import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download } from 'lucide-react';
import { Button } from './Button';
import { Trans } from './Trans';

// Set up the worker for react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PdfViewerProps {
  url: string;
  title?: string;
}

export function PdfViewer({ url, title = "Dokumen PDF" }: PdfViewerProps) {
  const [numPages, setNumPages] = useState<number>();
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setPageNumber(1);
  }

  const changePage = (offset: number) => {
    setPageNumber(prevPageNumber => prevPageNumber + offset);
  };

  const previousPage = () => changePage(-1);
  const nextPage = () => changePage(1);

  const zoomIn = () => setScale(prev => Math.min(prev + 0.2, 3.0));
  const zoomOut = () => setScale(prev => Math.max(prev - 0.2, 0.5));

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto bg-slate-100 dark:bg-slate-900 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800">
      {/* Toolbar */}
      <div className="w-full bg-white dark:bg-slate-950 p-4 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <h3 className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[200px] sm:max-w-xs"><Trans>{title}</Trans></h3>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={zoomOut} disabled={scale <= 0.5} className="h-8 w-8 p-0">
            <ZoomOut className="w-4 h-4" />
          </Button>
          <span className="text-sm font-medium w-12 text-center text-slate-600 dark:text-slate-400">{Math.round(scale * 100)}%</span>
          <Button variant="outline" size="sm" onClick={zoomIn} disabled={scale >= 3.0} className="h-8 w-8 p-0">
            <ZoomIn className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={previousPage} disabled={pageNumber <= 1} className="h-8 w-8 p-0">
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm text-slate-600 dark:text-slate-400 min-w-[4rem] text-center">
              {pageNumber} / {numPages || '--'}
            </span>
            <Button variant="outline" size="sm" onClick={nextPage} disabled={pageNumber >= (numPages || 1)} className="h-8 w-8 p-0">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          <a href={url} download target="_blank" rel="noreferrer">
            <Button size="sm" className="h-8 gap-2">
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline"><Trans>Unduh</Trans></span>
            </Button>
          </a>
        </div>
      </div>

      {/* PDF Document */}
      <div className="w-full overflow-auto flex justify-center p-4 min-h-[500px] max-h-[70vh] custom-scrollbar">
        <Document
          file={url}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={
            <div className="flex flex-col items-center justify-center h-64 text-slate-500">
              <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p><Trans>Memuat dokumen...</Trans></p>
            </div>
          }
          error={
            <div className="flex flex-col items-center justify-center h-64 text-red-500">
              <p><Trans>Gagal memuat dokumen PDF.</Trans></p>
              <p className="text-sm text-slate-500 mt-2"><Trans>Pastikan URL valid atau coba unduh langsung.</Trans></p>
            </div>
          }
        >
          <Page 
            pageNumber={pageNumber} 
            scale={scale} 
            renderTextLayer={true}
            renderAnnotationLayer={true}
            className="shadow-lg"
          />
        </Document>
      </div>
    </div>
  );
}
