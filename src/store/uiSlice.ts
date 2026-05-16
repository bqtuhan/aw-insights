import type { StateCreator } from 'zustand';
import type { StoreState, UIState, UIActions, SectionId } from './types';

const initialUIState: UIState = {
  currentSection: 'overview',
  sidebarOpen: true,
  theme: 'dark',
  language: 'en',
};

export const createUISlice: StateCreator<StoreState, [], [], UIState & UIActions> = (set) => ({
  ...initialUIState,

  setSection: (section: SectionId) =>
    set({
      currentSection: section,
      sidebarOpen: false, // auto-close sidebar on mobile after navigation
    }),

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  setTheme: (theme: 'dark' | 'light') => set({ theme }),

  setLanguage: (language: string) => set({ language }),
});