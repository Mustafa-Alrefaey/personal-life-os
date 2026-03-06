import { create } from 'zustand';

interface SidebarState {
  collapsed: boolean;
  toggle: () => void;
}

export const useSidebarStore = create<SidebarState>((set, get) => ({
  collapsed: localStorage.getItem('sidebar-collapsed') === 'true',

  toggle: () => {
    const next = !get().collapsed;
    localStorage.setItem('sidebar-collapsed', String(next));
    set({ collapsed: next });
  },
}));
