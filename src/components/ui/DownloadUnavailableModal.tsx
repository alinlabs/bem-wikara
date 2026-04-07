import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, AlertCircle } from 'lucide-react';
import { createPortal } from 'react-dom';
import { Trans } from './Trans';

interface DownloadUnavailableModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentName: string;
}

export function DownloadUnavailableModal({ isOpen, onClose, documentName }: DownloadUnavailableModalProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9999]"
            onClick={onClose}
          />
          
          {/* Modal Content */}
          <div className={`fixed inset-0 flex z-[10000] pointer-events-none ${isMobile ? 'items-end' : 'items-center justify-center p-4'}`}>
            <motion.div
              initial={isMobile ? { y: '100%' } : { opacity: 0, scale: 0.9, y: 20 }}
              animate={isMobile ? { y: 0 } : { opacity: 1, scale: 1, y: 0 }}
              exit={isMobile ? { y: '100%' } : { opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className={`bg-white dark:bg-slate-900 w-full pointer-events-auto relative border border-slate-100 dark:border-slate-800 shadow-2xl overflow-hidden
                ${isMobile ? 'rounded-t-3xl pb-safe' : 'max-w-md rounded-3xl'}`}
            >
              {/* Close Button */}
              <button 
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full bg-slate-100/50 dark:bg-slate-800/50 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors z-10"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Header Graphic */}
              <div className="h-24 md:h-32 bg-gradient-to-br from-amber-500 to-orange-400 relative overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
                <div className="w-12 h-12 md:w-16 md:h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-lg border border-white/30">
                  <AlertCircle className="w-6 h-6 md:w-8 md:h-8 text-white" />
                </div>
              </div>

              {/* Content */}
              <div className="p-6 md:p-8 text-center">
                <h2 className="text-xl md:text-2xl font-bold font-heading text-slate-900 dark:text-white mb-3">
                  <Trans>Pemberitahuan</Trans>
                </h2>
                <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base leading-relaxed mb-6">
                  <Trans>Mohon maaf untuk</Trans> <strong className="text-slate-900 dark:text-white">{documentName}</strong> <Trans>tidak dapat diunduh karena masih dalam tahap sinkronisasi dan pengecekan akurasi data berkala. Mohon menunggu hingga maksimal H-1 sidang dilaksanakan.</Trans>
                </p>

                <button 
                  onClick={onClose}
                  className="w-full py-3 px-4 rounded-xl font-semibold text-white bg-primary-600 hover:bg-primary-700 transition-colors shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50 hover:-translate-y-0.5"
                >
                  <Trans>Mengerti</Trans>
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
