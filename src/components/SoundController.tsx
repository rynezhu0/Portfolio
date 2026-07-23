'use client';

import { useEffect } from 'react';
import { preloadSounds, playSfx } from '@/lib/sound';
import { useSoundStore } from '@/store/useSoundStore';
import { useNavStore } from '@/store/useNavStore';
import { useBootStore } from '@/store/useBootStore';

// Headless: preloads the audio, applies the saved mute setting, and turns
// navigation-store transitions into UI sounds. Startup sound + music are
// triggered from BootOverlay (they need the boot "continue" gesture).
export default function SoundController() {
  const initMuted = useSoundStore((s) => s.initMuted);

  useEffect(() => {
    void preloadSounds();
    initMuted();

    const unsub = useNavStore.subscribe((state, prev) => {
      // Stay silent during the startup sequence
      if (!useBootStore.getState().bootDone) return;

      const openChanged =
        state.expandedSection !== prev.expandedSection ||
        state.subExpandedId !== prev.subExpandedId;
      const focusChanged =
        state.focusedIndex !== prev.focusedIndex ||
        state.subFocusedIndex !== prev.subFocusedIndex;

      // Did a tile get opened (vs. collapsed back out)? A section or nested
      // item going from nothing → something is a tile being entered.
      const tileOpened =
        (!prev.expandedSection && !!state.expandedSection) ||
        (!prev.subExpandedId && !!state.subExpandedId);

      // Opening/closing a section or item wins over the focus tick it may
      // also cause (e.g. collapse resets the sub-focus index). Entering a
      // tile gets its own sound; collapsing back out uses the plain click.
      if (openChanged) playSfx(tileOpened ? 'tileClick' : 'click');
      else if (focusChanged) playSfx('motion');
      /* startup sound is handled by BootOverlay */
    });

    return unsub;
  }, [initMuted]);

  return null;
}
