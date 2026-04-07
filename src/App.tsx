/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import { Home } from "./pages/Home";
import { Tentang } from "./pages/Tentang";
import { LpjContainer } from "./pages/lpj/Container";
import { MubesContainer } from "./pages/mubes/Container";
import { AdArt } from "./pages/AdArt";
import { Install } from "./pages/Install";
import { TranslationProvider } from "./contexts/TranslationContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ChatProvider } from "./contexts/ChatContext";
import { WelcomePopup } from "./components/ui/WelcomePopup";
import { WebProtection } from "./components/WebProtection";

export default function App() {
  useEffect(() => {
    // Prevent right click
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    // Prevent copy, cut, paste
    const handleCopyCutPaste = (e: ClipboardEvent) => {
      e.preventDefault();
    };

    // Prevent keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // F12
      if (e.key === 'F12') {
        e.preventDefault();
      }
      // Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C
      if (e.ctrlKey && e.shiftKey && ['I', 'J', 'C', 'i', 'j', 'c'].includes(e.key)) {
        e.preventDefault();
      }
      // Ctrl+U (View Source)
      if (e.ctrlKey && (e.key === 'U' || e.key === 'u')) {
        e.preventDefault();
      }
      // Ctrl+C, Ctrl+S, Ctrl+P
      if (e.ctrlKey && ['C', 'c', 'S', 's', 'P', 'p'].includes(e.key)) {
        e.preventDefault();
      }
      // Print Screen
      if (e.key === 'PrintScreen') {
        try {
          navigator.clipboard.writeText('');
        } catch (err) {
          // Ignore
        }
      }
    };

    // Prevent drag
    const handleDragStart = (e: DragEvent) => {
      e.preventDefault();
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('copy', handleCopyCutPaste);
    document.addEventListener('cut', handleCopyCutPaste);
    document.addEventListener('paste', handleCopyCutPaste);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('dragstart', handleDragStart);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('copy', handleCopyCutPaste);
      document.removeEventListener('cut', handleCopyCutPaste);
      document.removeEventListener('paste', handleCopyCutPaste);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('dragstart', handleDragStart);
    };
  }, []);

  return (
    <ThemeProvider>
      <TranslationProvider>
        <ChatProvider>
          <WebProtection />
          <WelcomePopup />
          <Router>
            <Routes>
              <Route path="/install" element={<Install />} />
              <Route path="/" element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="tentang" element={<Tentang />} />
                <Route path="lpj/*" element={<LpjContainer />} />
                <Route path="mubes/*" element={<MubesContainer />} />
                <Route path="adart/*" element={<AdArt />} />
              </Route>
            </Routes>
          </Router>
        </ChatProvider>
      </TranslationProvider>
    </ThemeProvider>
  );
}
