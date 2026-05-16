import type { StateCreator } from 'zustand';
import type { StoreState, DataState, DataActions } from './types';
import type { NormalizedWindowEvent, NormalizedAFKEvent, DailySummary, DatasetError } from '@/types';

const initialDataState: DataState = {
  status: 'idle',
  error: null,
  windowEvents: [],
  afkEvents: [],
  dailySummaries: [],
  processedAt: null,
};

export const createDataSlice: StateCreator<StoreState, [], [], DataState & DataActions> = (set) => ({
  ...initialDataState,

  setLoading: () =>
    set({
      status: 'loading',
      error: null,
    }),

  setDataset: (
    windowEvents: NormalizedWindowEvent[],
    afkEvents: NormalizedAFKEvent[],
    dailySummaries: DailySummary[],
    processedAt: string,
  ) =>
    set({
      status: 'loaded',
      windowEvents,
      afkEvents,
      dailySummaries,
      processedAt,
      error: null,
    }),

  setError: (error: DatasetError) =>
    set({
      status: 'error',
      error,
    }),

  clearDataset: () =>
    set({
      ...initialDataState,
      status: 'idle',
    }),
});