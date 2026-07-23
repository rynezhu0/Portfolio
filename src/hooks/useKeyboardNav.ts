'use client';

import { useEffect } from 'react';
import { useNavStore } from '@/store/useNavStore';
import { useBootStore } from '@/store/useBootStore';
import { sections } from '@/data/sections';

export function useKeyboardNav() {
  const { focusedIndex, expandedSection, moveFocus, expandSection, collapseSection, startMorph } =
    useNavStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // If user is typing in a form field, don't intercept
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      // During the startup animation the BootOverlay owns all input
      if (!useBootStore.getState().bootDone) return;

      // Never swallow browser/OS chords — Ctrl+A, Cmd+S and friends must still
      // reach the browser now that bare letters are navigation keys.
      if ((e.ctrlKey || e.metaKey || e.altKey) && e.key.length === 1) return;

      // A section (content page) is open — Escape returns to the menu. Arrow
      // keys inside the page belong to that page's own grid, so leave them be.
      if (expandedSection) {
        if (e.key === 'Escape') {
          e.preventDefault();
          collapseSection();
        }
        return;
      }

      // Top-level tile row navigation. The row is horizontal, so only the
      // left/right half of WASD has anything to do here; W and S fall through
      // to the browser rather than being swallowed for no effect.
      switch (e.key.length === 1 ? e.key.toLowerCase() : e.key) {
        case 'ArrowLeft':
        case 'a':
          e.preventDefault();
          moveFocus(-1, sections.length - 1);
          break;
        case 'ArrowRight':
        case 'd':
          e.preventDefault();
          moveFocus(1, sections.length - 1);
          break;
        case 'Enter':
        case ' ': {
          e.preventDefault();
          // Play the same portal morph a click would, from the focused tile.
          const el = document.querySelector('.tile-root.focused');
          if (el) {
            const r = el.getBoundingClientRect();
            startMorph({ x: r.left, y: r.top, w: r.width, h: r.height });
          }
          expandSection(sections[focusedIndex].id);
          break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusedIndex, expandedSection, moveFocus, expandSection, collapseSection, startMorph]);
}
