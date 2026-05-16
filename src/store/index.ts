import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { StoreState } from './types';
import { createDataSlice } from './dataSlice';
import { createUISlice } from './uiSlice';

export const useAppStore = create<StoreState>()(
  devtools(
    (set, get, api) => ({
      ...createDataSlice(set, get, api),
      ...createUISlice(set, get, api),
    }),
    { name: 'aw-insights-store', enabled: import.meta.env.DEV },
  ),
);