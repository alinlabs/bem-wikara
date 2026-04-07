import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Download, MonitorSmartphone, Share2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Trans } from '@/components/ui/Trans';

export function Install() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Check if it was already captured
    if ((window as any).deferredPWAInstallPrompt) {
      setDeferredPrompt((window as any).deferredPWAInstallPrompt);
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      (window as any).deferredPWAInstallPrompt = e;
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listen for successful installation
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Install Aplikasi BEM STIE WIKARA',
          text: 'Dapatkan akses cepat ke portal resmi BEM STIE WIKARA dengan menginstal aplikasinya.',
          url: window.location.href,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link disalin ke clipboard!');
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 md:px-6 bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden"
      >
        <div className="h-40 bg-gradient-to-br from-primary-600 to-sky-500 relative overflow-hidden flex items-center justify-center">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
          <MonitorSmartphone className="w-16 h-16 text-white drop-shadow-md z-10" />
        </div>

        <div className="p-8 text-center">
          <h1 className="text-2xl font-bold font-heading text-slate-900 dark:text-white mb-3">
            <Trans>Install Aplikasi</Trans>
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
            <Trans>Pasang aplikasi portal resmi BEM STIE WIKARA di perangkat Anda untuk akses yang lebih cepat dan mudah kapan saja.</Trans>
          </p>

          <div className="flex flex-col gap-4">
            {isInstalled ? (
              <div className="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 p-4 rounded-xl font-medium border border-green-200 dark:border-green-800/30">
                <Trans>Aplikasi sudah terpasang di perangkat Anda!</Trans>
              </div>
            ) : deferredPrompt ? (
              <Button 
                onClick={handleInstallClick}
                size="lg" 
                className="w-full rounded-xl h-14 text-lg shadow-lg shadow-primary-500/25"
              >
                <Download className="w-5 h-5 mr-2" />
                <Trans>Install Sekarang</Trans>
              </Button>
            ) : (
              <div className="bg-slate-100 dark:bg-slate-800 p-5 rounded-xl text-left">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                  <Trans>Cara Install Manual:</Trans>
                </h3>
                <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-2">
                  <li className="flex items-start gap-2">
                    <ArrowRight className="w-4 h-4 mt-0.5 shrink-0 text-primary-500" />
                    <span><Trans><strong>iOS (Safari):</strong> Ketuk tombol Share di bawah layar, lalu pilih "Add to Home Screen".</Trans></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="w-4 h-4 mt-0.5 shrink-0 text-primary-500" />
                    <span><Trans><strong>Android (Chrome):</strong> Ketuk ikon menu (tiga titik) di pojok kanan atas, lalu pilih "Install app" atau "Add to Home screen".</Trans></span>
                  </li>
                </ul>
              </div>
            )}

            <Button 
              onClick={handleShare}
              variant="outline" 
              size="lg" 
              className="w-full rounded-xl h-14"
            >
              <Share2 className="w-5 h-5 mr-2" />
              <Trans>Bagikan Link Install</Trans>
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
