import { create } from 'zustand';

// Screen-space rect of the tile being opened. Drives the "portal" morph in
// TransitionLayer — a clone panel starts here and rushes forward to become
// the doorway into the section's content.
export interface MorphRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface NavState {
  // Top-level navigation
  focusedIndex: number;
  expandedSection: string | null;

  // Sub-level navigation (inside Projects/Experience)
  subFocusedIndex: number;
  subExpandedId: string | null;

  // Transition state
  isTransitioning: boolean;
  // Set the instant a content tile is opened; consumed + cleared by the
  // TransitionLayer once the entry animation has played.
  morph: MorphRect | null;

  // Actions
  setFocusedIndex: (i: number) => void;
  moveFocus: (direction: -1 | 1, maxIndex: number) => void;
  expandSection: (section: string) => void;
  collapseSection: () => void;
  setSubFocusedIndex: (i: number) => void;
  moveSubFocus: (direction: -1 | 1, maxIndex: number) => void;
  expandSubItem: (id: string) => void;
  collapseSubItem: () => void;
  setTransitioning: (v: boolean) => void;
  startMorph: (rect: MorphRect) => void;
  clearMorph: () => void;
}

export const useNavStore = create<NavState>((set) => ({
  focusedIndex: 0,
  expandedSection: null,
  subFocusedIndex: 0,
  subExpandedId: null,
  isTransitioning: false,
  morph: null,

  setFocusedIndex: (i) => set({ focusedIndex: i }),

  moveFocus: (direction, maxIndex) =>
    set((state) => ({
      focusedIndex: Math.max(0, Math.min(maxIndex, state.focusedIndex + direction)),
    })),

  expandSection: (section) =>
    set({ expandedSection: section, isTransitioning: true }),

  collapseSection: () =>
    set({
      expandedSection: null,
      isTransitioning: true,
      subFocusedIndex: 0,
      subExpandedId: null,
    }),

  setSubFocusedIndex: (i) => set({ subFocusedIndex: i }),

  moveSubFocus: (direction, maxIndex) =>
    set((state) => ({
      subFocusedIndex: Math.max(0, Math.min(maxIndex, state.subFocusedIndex + direction)),
    })),

  expandSubItem: (id) => set({ subExpandedId: id, isTransitioning: true }),

  collapseSubItem: () => set({ subExpandedId: null, isTransitioning: true }),

  setTransitioning: (v) => set({ isTransitioning: v }),

  startMorph: (rect) => set({ morph: rect }),
  clearMorph: () => set({ morph: null }),
}));
