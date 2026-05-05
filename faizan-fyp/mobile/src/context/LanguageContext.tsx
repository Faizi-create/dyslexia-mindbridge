import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Language } from '@/types';
import { STRINGS, StringKey, tFor } from '@/i18n/strings';

interface LanguageCtx {
  lang: Language;
  setLang: (lang: Language) => Promise<void>;
  t: (key: StringKey, vars?: Record<string, string | number>) => string;
}

const Ctx = createContext<LanguageCtx | undefined>(undefined);

const STORAGE_KEY = 'dmb.appLanguage';

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Language>('en');

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored === 'en' || stored === 'ur') setLangState(stored);
    });
  }, []);

  const setLang = useCallback(async (next: Language) => {
    setLangState(next);
    await AsyncStorage.setItem(STORAGE_KEY, next);
  }, []);

  const t = useCallback(
    (key: StringKey, vars?: Record<string, string | number>) => tFor(lang, key, vars),
    [lang],
  );

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};

export function useTranslation(): LanguageCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useTranslation must be used inside <LanguageProvider>');
  return ctx;
}

// re-export so callers don't need a separate import
export { STRINGS };
