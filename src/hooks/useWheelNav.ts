'use client';

import { useEffect, useRef } from 'react';
import { useNavStore } from '@/store/useNavStore';
import { useBootStore } from '@/store/useBootStore';
import { sections } from '@/data/sections';

// Scroll-wheel navigation on the main menu: wheel down moves focus right,
// wheel up moves it left — one tile per gesture, snap-to-tile like the d-pad,
// never free scroll. A short cooldown keeps momentum/trackpad wheels from
// skipping several tiles per flick. Once a section is open the wheel is left
// alone so its content page can scroll normally.
const COOLDOWN_MS = 220;
const MIN_DELTA = 4;

export function useWheelNav() {
  const lastMoveRef = useRef(0);
  const { expandedSection, moveFocus } = useNavStore();

  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      if (!useBootStore.getState().bootDone) return; // startup still playing
      if (expandedSection) return; // content page open — let it scroll

      const now = performance.now();
      if (now - lastMoveRef.current < COOLDOWN_MS) return;
      if (Math.abs(e.deltaY) < MIN_DELTA) return;

      const direction: -1 | 1 = e.deltaY > 0 ? 1 : -1;
      moveFocus(direction, sections.length - 1);
      lastMoveRef.current = now;
    };

    window.addEventListener('wheel', onWheel, { passive: true });
    return () => window.removeEventListener('wheel', onWheel);
  }, [expandedSection, moveFocus]);
}
