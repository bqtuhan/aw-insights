import type { NormalizedWindowEvent, NormalizedAFKEvent, DailySummary, DatasetError } from '@/types';

export type SectionId = 'overview' | 'focus' | 'flow' | 'burnout' | 'apps' | 'timeline';

export interface DataState {
  status: 'idle' | 'loading' | 'loaded' | 'error';
  error: DatasetError | null;
  windowEvents: NormalizedWindowEvent[];
  afkEvents: NormalizedAFKEvent[];
  dailySummaries: DailySummary[];
  processedAt: string | null;
}

export interface DataActions {
  setLoading: () => void;
  setDataset: (
    windowEvents: NormalizedWindowEvent[],
    afkEvents: NormalizedAFKEvent[],
    dailySummaries: DailySummary[],
    processedAt: string,
  ) => void;
  setError: (error: DatasetError) => void;
  clearDataset: () => void;
}

export interface UIState {
  currentSection: SectionId;
  sidebarOpen: boolean;
  theme: 'dark' | 'light';
  language: string;
}

export interface UIActions {
  setSection: (section: SectionId) => void;
  toggleSidebar: () => void;
  setTheme: (theme: 'dark' | 'light') => void;
  setLanguage: (language: string) => void;
}

export type StoreState = DataState & DataActions & UIState & UIActions;