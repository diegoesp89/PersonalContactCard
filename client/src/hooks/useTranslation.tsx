import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Language, getTranslation } from '../utils/translations';

interface TranslationContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof import('../utils/translations').translations.es) => string;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export const TranslationProvider: React.FC<{ children: ReactNode; defaultLanguage?: Language }> = ({ 
  children, 
  defaultLanguage = 'es' 
}) => {
  const [language, setLanguage] = useState<Language>(defaultLanguage);

  const t = (key: keyof typeof import('../utils/translations').translations.es): string => {
    return getTranslation(language, key);
  };

  return (
    <TranslationContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(TranslationContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
};