import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { darkColors, lightColors, ThemeColors, ThemeMode } from '@/constants/colors';

interface ThemeCtx {
  mode: ThemeMode;
  colors: ThemeColors;
  isDark: boolean;
  setMode: (mode: ThemeMode) => Promise<void>;
  toggleMode: () => Promise<void>;
}

const Ctx = createContext<ThemeCtx | undefined>(undefined);
const STORAGE_KEY = 'dmb.themeMode';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setModeState] = useState<ThemeMode>('light');

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored === 'dark' || stored === 'light') setModeState(stored);
    });
  }, []);

  const setMode = useCallback(async (next: ThemeMode) => {
    setModeState(next);
    await AsyncStorage.setItem(STORAGE_KEY, next);
  }, []);

  const toggleMode = useCallback(async () => {
    const next: ThemeMode = mode === 'dark' ? 'light' : 'dark';
    setModeState(next);
    await AsyncStorage.setItem(STORAGE_KEY, next);
  }, [mode]);

  const colors = mode === 'dark' ? darkColors : lightColors;

  const value = useMemo<ThemeCtx>(
    () => ({ mode, colors, isDark: mode === 'dark', setMode, toggleMode }),
    [mode, colors, setMode, toggleMode],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};

export function useTheme(): ThemeCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>');
  return ctx;
}
