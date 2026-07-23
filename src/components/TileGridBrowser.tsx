'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { playSfx } from '@/lib/sound';
import type { IconComponent } from './icons';

export interface GridBrowserItem {
  id: string;
  title: string;
  icon: IconComponent;
  /** What shows on the right when this tile is selected. */
  detail: ReactNode;
  /** Logo/artwork shown large on the tile face instead of the small `icon`. */
  art?: ReactNode;
  /** CSS background for the tile face behind `art` — used to give a mark the
   *  colour it needs to read (maroon for the crest, white behind the leaf).
   *  Omit to keep the standard blue tile gradient. */
  artBackground?: string;
}

const COLUMNS = 3;
// Small cushion so sub-pixel rounding never clips the third row.
const ROW_BUFFER = 2;
// Space kept clear above + below the grid (matches the wide overlay's
// top/bottom padding: room for the persistent top bar above and the Back
// button below). Only bites on short viewports where three rows can't fit.
const VIEWPORT_MARGIN = 208;

// The Projects / Experience layout: a 3-column grid of tiles on the left that
// behaves like the main-menu row (focus ring, click / arrow-key selection, no
// "Start" strip), with the selected tile's description + links shown on the
// right. The grid shows at least three rows before it scrolls; the wheel and
// the left-hand scrollbar free-scroll the tiles (they don't step the
// selection), while arrow keys move the selection tile by tile and keep it in
// view. The detail panel stays fixed on the selected tile as you scroll.
export default function TileGridBrowser({
  items,
  label,
}: {
  items: GridBrowserItem[];
  label: string;
}) {
  const [selected, setSelected] = useState(0);
  const btnRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const tilesRef = useRef<HTMLDivElement>(null);
  const clamped = Math.min(selected, items.length - 1);

  // Cap the scroll viewport at three rows. For a 3-column grid of square
  // tiles, three rows tall is exactly the grid's content width — so measuring
  // the width gives an exact 3-row height that adapts to any screen. Never
  // let it run past the viewport (leaving room for the Back button).
  useLayoutEffect(() => {
    const scrollEl = scrollRef.current;
    const tilesEl = tilesRef.current;
    if (!scrollEl || !tilesEl) return;

    const apply = () => {
      // For a 3-column square grid with an 8px left inset and 4px top/bottom
      // padding, the height of three rows plus that padding equals the grid's
      // clientWidth — so clientWidth is the exact 3-row viewport height.
      const threeRows = tilesEl.clientWidth + ROW_BUFFER;
      const cap = window.innerHeight - VIEWPORT_MARGIN;
      scrollEl.style.maxHeight = `${Math.min(threeRows, cap)}px`;
    };

    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(scrollEl);
    window.addEventListener('resize', apply);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', apply);
    };
  }, []);

  // Move selection to an index, keeping it focused and scrolled into view.
  const select = useCallback(
    (to: number) => {
      const next = Math.max(0, Math.min(items.length - 1, to));
      const el = btnRefs.current[next];
      el?.focus({ preventScroll: true });
      el?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      setSelected(next);
    },
    [items.length]
  );

  // Focus the first tile once the page settles so arrow keys work without a
  // click first — preventScroll so it never nudges the layout.
  useEffect(() => {
    btnRefs.current[0]?.focus({ preventScroll: true });
  }, []);

  // Same focus-hop sound the main tile row makes, so moving through the grid
  // feels like moving through the menu. Driven off the selection itself rather
  // than the individual handlers because a click, an arrow key, and a tab all
  // land here — and React bails out when the index doesn't actually change, so
  // re-selecting the current tile stays silent. The mount pass is skipped: the
  // page is already arriving on the portal transition's own sound.
  const selectionSettledRef = useRef(false);
  useEffect(() => {
    if (!selectionSettledRef.current) {
      selectionSettledRef.current = true;
      return;
    }
    playSfx('motion');
  }, [clamped]);

  // Bound to the window rather than to the tiles themselves. A tile only
  // receives key events while it holds DOM focus, so clicking anywhere else on
  // the page — the backdrop, the detail panel — used to blur the roving
  // tabindex button and leave arrow keys dead until a tile was clicked again.
  // Listening globally makes the grid respond wherever the click landed, and
  // select() pulls focus back onto the tile so the ring reappears.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      // Leave browser/OS chords (Ctrl+A, Cmd+S, …) alone.
      if ((e.ctrlKey || e.metaKey || e.altKey) && e.key.length === 1) return;

      let delta: number;
      switch (e.key.length === 1 ? e.key.toLowerCase() : e.key) {
        case 'ArrowRight':
        case 'd':
          delta = 1;
          break;
        case 'ArrowLeft':
        case 'a':
          delta = -1;
          break;
        case 'ArrowDown':
        case 's':
          delta = COLUMNS;
          break;
        case 'ArrowUp':
        case 'w':
          delta = -COLUMNS;
          break;
        default:
          return;
      }

      e.preventDefault();
      select(clamped + delta);
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [clamped, select]);

  const current = items[clamped];

  return (
    <div className="grid-browser">
      {/* Scroll viewport — its scrollbar sits on the left (see globals.css) */}
      <div className="grid-browser__scroll" ref={scrollRef}>
        <div className="grid-browser__tiles" ref={tilesRef} role="listbox" aria-label={label}>
          {items.map((item, i) => {
            const Icon = item.icon;
            const isSelected = i === clamped;
            return (
              <button
                key={item.id}
                ref={(el) => {
                  btnRefs.current[i] = el;
                }}
                className={`grid-tile${isSelected ? ' selected' : ''}`}
                role="option"
                aria-selected={isSelected}
                aria-label={item.title}
                tabIndex={isSelected ? 0 : -1}
                style={item.artBackground ? { background: item.artBackground } : undefined}
                onClick={() => setSelected(i)}
                onFocus={() => setSelected(i)}
              >
                {item.art ? (
                  <span className="grid-tile-art">{item.art}</span>
                ) : (
                  <Icon size={64} className="grid-tile-icon" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid-browser__detail">
        {/* Re-keyed so switching selection re-runs the fade-in */}
        <div className="grid-detail" key={current.id}>
          {current.detail}
        </div>
      </div>
    </div>
  );
}
