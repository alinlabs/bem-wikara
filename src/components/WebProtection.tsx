import { useEffect, useState } from 'react';

export function WebProtection() {
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    // 1. Disable Right Click
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    // 2. Block Shortcuts (F12, Ctrl+Shift+I, Ctrl+Shift+C, Ctrl+U, PrintScreen)
    const handleKeyDown = (e: KeyboardEvent) => {
      // F12
      if (e.key === 'F12') {
        e.preventDefault();
      }
      // Ctrl+Shift+I or Ctrl+Shift+C
      if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'C' || e.key === 'c')) {
        e.preventDefault();
      }
      // Ctrl+U
      if (e.ctrlKey && (e.key === 'U' || e.key === 'u')) {
        e.preventDefault();
      }
      // PrintScreen (PrtScn)
      if (e.key === 'PrintScreen') {
        e.preventDefault();
        // Optional: show a quick warning or copy blank text to clipboard
        try {
          navigator.clipboard.writeText('');
        } catch (err) {
          // Ignore clipboard write errors
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'PrintScreen') {
        try {
          navigator.clipboard.writeText('');
        } catch (err) {
          // Ignore clipboard write errors
        }
      }
    };

    // 3. Basic DevTools Detection (Checking window size difference)
    const detectDevTools = () => {
      // Ignore on mobile devices where address bar changes cause false positives on scroll/pull-to-refresh
      if (window.innerWidth <= 1024) {
        setShowWarning(false);
        return;
      }

      const threshold = 160;
      const widthDiff = window.outerWidth - window.innerWidth > threshold;
      const heightDiff = window.outerHeight - window.innerHeight > threshold;
      
      if (widthDiff || heightDiff) {
        setShowWarning(true);
      } else {
        setShowWarning(false);
      }
    };

    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('resize', detectDevTools);

    // Initial check
    detectDevTools();

    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('resize', detectDevTools);
    };
  }, []);

  return (
    <>
      {/* DevTools Warning Overlay */}
      {showWarning && (
        <div className="fixed inset-0 z-[9999] bg-slate-900/90 backdrop-blur-xl flex flex-col items-center justify-center text-white p-6 text-center">
          <div className="w-16 h-16 mb-4 text-red-500">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2">Akses Dibatasi</h2>
          <p className="text-slate-300 max-w-md">
            Tolong tutup Developer Tools (Inspect Element) untuk melanjutkan akses ke website ini.
          </p>
        </div>
      )}
    </>
  );
}
