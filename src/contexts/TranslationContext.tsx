import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

type Language = {
  code: string;
  flagCode: string;
  name: string;
};

export const languages: Language[] = [
  { code: 'id', flagCode: 'id', name: 'Indonesia' },
  { code: 'en', flagCode: 'gb', name: 'English' },
  { code: 'es', flagCode: 'es', name: 'Español' },
  { code: 'zh', flagCode: 'cn', name: '中文' },
  { code: 'ar', flagCode: 'sa', name: 'العربية' },
  { code: 'hi', flagCode: 'in', name: 'हिन्दी' },
  { code: 'fr', flagCode: 'fr', name: 'Français' },
  { code: 'ru', flagCode: 'ru', name: 'Русский' },
  { code: 'pt', flagCode: 'pt', name: 'Português' },
  { code: 'ja', flagCode: 'jp', name: '日本語' },
];

interface TranslationContextType {
  currentLang: Language;
  setLanguage: (lang: Language) => void;
  translate: (text: string) => Promise<string>;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export const TranslationProvider = ({ children }: { children: ReactNode }) => {
  const [currentLang, setCurrentLang] = useState<Language>(languages[0]);

  useEffect(() => {
    const savedLangCode = localStorage.getItem('app_language');
    if (savedLangCode) {
      const lang = languages.find(l => l.code === savedLangCode);
      if (lang) setCurrentLang(lang);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setCurrentLang(lang);
    localStorage.setItem('app_language', lang.code);
  };

  const pendingApiCalls = React.useRef<Map<string, Promise<string>>>(new Map());

  const translate = async (text: string): Promise<string> => {
    if (currentLang.code === 'id') return text; // Base language
    if (!text || text.trim() === '') return text;

    const cacheKey = `trans_${currentLang.code}_${text}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) return cached;

    if (pendingApiCalls.current.has(cacheKey)) {
      return pendingApiCalls.current.get(cacheKey)!;
    }

    const translationPromise = (async () => {
      try {
        const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=id|${currentLang.code}`);
        const data = await response.json();
        
        if (data.responseData && data.responseData.translatedText) {
          const translated = data.responseData.translatedText;
          localStorage.setItem(cacheKey, translated);
          return translated;
        }
        return text;
      } catch (error) {
        console.error('Translation error:', error);
        return text;
      } finally {
        pendingApiCalls.current.delete(cacheKey);
      }
    })();

    pendingApiCalls.current.set(cacheKey, translationPromise);
    return translationPromise;
  };

  return (
    <TranslationContext.Provider value={{ currentLang, setLanguage, translate }}>
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(TranslationContext);
  if (!context) throw new Error('useTranslation must be used within TranslationProvider');
  return context;
};

export const useTranslateText = () => {
  const { currentLang, translate } = useTranslation();
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const requestedTexts = React.useRef<Set<string>>(new Set());
  const pendingTranslations = React.useRef<Set<string>>(new Set());

  useEffect(() => {
    setTranslations({});
    requestedTexts.current.clear();
    pendingTranslations.current.clear();
  }, [currentLang.code]);

  useEffect(() => {
    if (currentLang.code === 'id') return;

    let isMounted = true;
    const textsToProcess = Array.from(requestedTexts.current).filter(
      text => !translations[text] && !pendingTranslations.current.has(text)
    );

    if (textsToProcess.length > 0) {
      textsToProcess.forEach(text => {
        const cacheKey = `trans_${currentLang.code}_${text}`;
        const localCached = localStorage.getItem(cacheKey);
        
        if (localCached) {
          if (isMounted) {
            setTranslations(prev => ({ ...prev, [text as string]: localCached }));
          }
        } else {
          pendingTranslations.current.add(text);
          translate(text).then(translated => {
            if (isMounted) {
              setTranslations(prev => ({ ...prev, [text as string]: translated }));
            }
          }).finally(() => {
            pendingTranslations.current.delete(text);
          });
        }
      });
    }
    
    return () => {
      isMounted = false;
    };
  });

  const t = (text: string) => {
    if (currentLang.code === 'id' || !text) return text;
    
    const cacheKey = `trans_${currentLang.code}_${text}`;
    const localCached = localStorage.getItem(cacheKey);
    
    if (localCached) return localCached;
    if (translations[text]) return translations[text];
    
    requestedTexts.current.add(text);
    
    return text;
  };

  return { t };
};
