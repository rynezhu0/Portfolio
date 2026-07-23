import { create } from 'zustand';

interface BootState {
  /** Dashboard chrome (tiles, top strip, overlays) may show. */
  bootDone: boolean;
  /** Whether the reveal should stagger-animate (false when the boot is bypassed, e.g. mobile). */
  bootAnimated: boolean;
  finishBoot: (animated: boolean) => void;
}

export const useBootStore = create<BootState>((set) => ({
  bootDone: false,
  bootAnimated: true,
  finishBoot: (animated) => set({ bootDone: true, bootAnimated: animated }),
}));
