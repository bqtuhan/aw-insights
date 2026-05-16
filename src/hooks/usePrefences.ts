import { useEffect, useCallback } from 'react';
import { useAppStore } from '@/store';
import i18n from 'i18next';

const STORAGE_KEY_THEME = 'aw-insights-theme';
const STORAGE_KEY_LANGUAGE = 'aw-insights-language';
const STORAGE_KEY_SIDEBAR = 'aw-insights-sidebar-open';

function readStoredValue<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    if (typeof fallback === 'string') return raw as unknown as T;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeStoredValue<T>(key: string, value: T): void {
  try {
    if (typeof value === 'string') {
      localStorage.setItem(key, value);
    } else {
      localStorage.setItem(key, JSON.stringify(value));
    }
  } catch {
    // Storage full or unavailable — silently ignore side effects
  }
}

export function usePreferences() {
  const theme = useAppStore((s) => s.theme);
  const language = useAppStore((s) => s.language);
  const sidebarOpen = useAppStore((s) => s.sidebarOpen);
  
  const setTheme = useAppStore((s) => s.setTheme);
  const setLanguage = useAppStore((s) => s.setLanguage);
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);
  const setSection = useAppStore((s) => s.setSection);

  useEffect(() => {
    // useAppStore.getState() bypasses strict-mode stale closure traps entirely
    const currentStore = useAppStore.getState();
    
    const storedTheme = readStoredValue<'dark' | 'light'>(STORAGE_KEY_THEME, 'dark');
    const storedLang = readStoredValue<string>(STORAGE_KEY_LANGUAGE, 'en');
    const storedSidebar = readStoredValue<boolean>(STORAGE_KEY_SIDEBAR, true);

    if (storedTheme !== currentStore.theme) setTheme(storedTheme);
    if (storedLang !== currentStore.language) setLanguage(storedLang);
    if (storedSidebar !== currentStore.sidebarOpen) toggleSidebar();
  }, [setTheme, setLanguage, toggleSidebar]);

  useEffect(() => {
    writeStoredValue(STORAGE_KEY_THEME, theme);
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.remove('dark');
    } else {
      root.classList.add('dark');
    }
  }, [theme]);

  useEffect(() => {
    writeStoredValue(STORAGE_KEY_LANGUAGE, language);
    document.documentElement.lang = language;
    if (i18n.language !== language) {
      i18n.changeLanguage(language).catch(() => {});
    }
  }, [language]);

  useEffect(() => {
    writeStoredValue(STORAGE_KEY_SIDEBAR, sidebarOpen);
  }, [sidebarOpen]);

  const updateTheme = useCallback(
    (newTheme: 'dark' | 'light') => {
      setTheme(newTheme);
    },
    [setTheme],
  );

  const updateLanguage = useCallback(
    (newLang: string) => {
      setLanguage(newLang);
    },
    [setLanguage],
  );

  const navigateTo = useCallback(
    (section: 'overview' | 'focus' | 'flow' | 'burnout' | 'apps' | 'timeline') => {
      setSection(section);
    },
    [setSection],
  );

  return {
    theme,
    language,
    sidebarOpen,
    updateTheme,
    updateLanguage,
    toggleSidebar,
    navigateTo,
  };
}
