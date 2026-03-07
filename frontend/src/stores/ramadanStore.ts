import { create } from 'zustand';

const RAMADAN_START = new Date('2026-02-18T00:00:00');
const RAMADAN_END   = new Date('2026-03-19T23:59:59');
const STORAGE_KEY   = 'ramadan-enabled';

function defaultEnabled(): boolean {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored !== null) return stored === 'true';
  // Auto-enable during Ramadan 1447 if user has never set a preference
  const now = new Date();
  return now >= RAMADAN_START && now <= RAMADAN_END;
}

interface RamadanState {
  enabled: boolean;
  setEnabled: (v: boolean) => void;
}

// Eagerly apply attribute before React mounts (avoids flash-of-wrong-theme)
const initial = defaultEnabled();
document.documentElement.setAttribute('data-ramadan', initial ? 'true' : 'false');

export const useRamadanStore = create<RamadanState>((set) => ({
  enabled: initial,
  setEnabled: (v) => {
    localStorage.setItem(STORAGE_KEY, String(v));
    document.documentElement.setAttribute('data-ramadan', v ? 'true' : 'false');
    set({ enabled: v });
  },
}));
