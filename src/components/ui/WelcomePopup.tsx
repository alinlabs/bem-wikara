import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Download } from 'lucide-react';
import { createPortal } from 'react-dom';
import { Trans } from './Trans';

export function WelcomePopup() {
  const [isOpen, setIsOpen] = useState(() => {
    if (typeof window !== 'undefined' && window.location.pathname === '/install') {
      return false;
    }
    return true;
  });
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // Check if it was already captured
    if ((window as any).deferredPWAInstallPrompt) {
      setDeferredPrompt((window as any).deferredPWAInstallPrompt);
    }

    // Listen for the beforeinstallprompt event in case it fires late
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      (window as any).deferredPWAInstallPrompt = e;
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
      setIsOpen(false);
    } else {
      console.log('User dismissed the install prompt');
    }
    
    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null);
  };

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
            onClick={() => setIsOpen(false)}
          />
          
          {/* Popup Content */}
          <div className="fixed inset-0 flex items-center justify-center z-[10000] p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden pointer-events-auto relative border border-slate-100 dark:border-slate-800"
            >
              {/* Close Button */}
              <button 
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-full bg-slate-100/50 dark:bg-slate-800/50 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors z-10"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Header Graphic */}
              <div className="h-32 bg-gradient-to-br from-primary-500 to-sky-400 relative overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
                <h2 className="text-4xl font-bold font-heading text-white tracking-tight drop-shadow-md z-10">
                  <Trans>Welcome</Trans>
                </h2>
              </div>

              {/* Content */}
              <div className="p-6 md:p-8 text-center">
                <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base leading-relaxed mb-6">
                  <Trans>Selamat datang di portal resmi BEM STIE WIKARA. Jelajahi informasi, LPJ, dan agenda MUBES kami.</Trans>
                </p>

                <div className="flex flex-col gap-3">
                  {deferredPrompt && (
                    <button 
                      onClick={handleInstallClick}
                      className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white py-3 px-4 rounded-xl font-semibold transition-all shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50 hover:-translate-y-0.5"
                    >
                      <Download className="w-5 h-5" />
                      <Trans>Install Aplikasi (PWA)</Trans>
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
