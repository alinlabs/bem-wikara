import React, { useEffect, useState } from 'react';
import { useTranslation } from '@/contexts/TranslationContext';

export const Trans = ({ children }: { children: React.ReactNode }) => {
  const { currentLang, translate } = useTranslation();
  const [translatedText, setTranslatedText] = useState<string>('');
  const [originalText, setOriginalText] = useState<string>('');

  useEffect(() => {
    let textToTranslate = '';
    if (typeof children === 'string') {
      textToTranslate = children;
    } else if (typeof children === 'number') {
      textToTranslate = children.toString();
    } else if (Array.isArray(children)) {
      textToTranslate = children.join('');
    }
    
    setOriginalText(textToTranslate);
  }, [children]);

  useEffect(() => {
    let isMounted = true;

    const doTranslation = async () => {
      if (!originalText) return;
      if (currentLang.code === 'id') {
        if (isMounted) setTranslatedText(originalText);
        return;
      }

      const result = await translate(originalText);
      if (isMounted) setTranslatedText(result);
    };

    doTranslation();

    return () => {
      isMounted = false;
    };
  }, [originalText, currentLang, translate]);

  if (typeof children !== 'string' && typeof children !== 'number' && !Array.isArray(children)) {
    return <>{children}</>;
  }

  return <>{translatedText || originalText}</>;
};
