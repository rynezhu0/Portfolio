'use client';

import Tile from './Tile';
import type { IconComponent } from './icons';

// PS4-style row geometry: tiles sit flush against each other (no gutters),
// share a common top edge, and the focused tile is enlarged with its left
// edge pinned near the left side of the screen — matching the real PS4
// dynamic menu rather than a centered carousel.
const SMALL_W = 1.9; // world units, unfocused tile width
const SMALL_H = 2.4; // unfocused tile height — noticeably taller than wide
const FOCUS_W = 3.2; // focused tile width
const FOCUS_H = 4.05; // focused tile height
const GAP = 0.0625; // ≈5px at 80px per world unit
const ANCHOR_X = -5.6; // left edge of the focused tile
const TOP_Y = 1.9; // shared top edge of the row
const PROTRUDE = 0.12; // the focused tile pokes ~10px above the row's top edge

export interface TileRowItem {
  id: string;
  title: string;
  icon?: IconComponent;
  /** Show the icon as large artwork filling the tile width (see Tile.tsx). */
  wideArt?: boolean;
}

interface TileRowProps {
  items: TileRowItem[];
  focusedIndex: number;
  /** Non-null once an item has been opened — hides the row under the content overlay. */
  expandedId: string | null;
  /** True when this row isn't the one currently being browsed (see Scene.tsx). */
  dimmed: boolean;
  onFocusIndex: (index: number) => void;
  onSelect: (id: string, rect: DOMRect) => void;
}

export default function TileRow({
  items,
  focusedIndex,
  expandedId,
  dimmed,
  onFocusIndex,
  onSelect,
}: TileRowProps) {
  const clampedFocus = Math.min(focusedIndex, items.length - 1);
  const hidden = dimmed || expandedId !== null;

  // Lay tiles out left-to-right with a hairline gap, then shift the whole
  // row so the focused tile's left edge lands on ANCHOR_X.
  const widths = items.map((_, i) => (i === clampedFocus ? FOCUS_W : SMALL_W));
  const heights = items.map((_, i) => (i === clampedFocus ? FOCUS_H : SMALL_H));
  const lefts: number[] = [];
  let acc = 0;
  for (const w of widths) {
    lefts.push(acc);
    acc += w + GAP;
  }
  const offset = ANCHOR_X - lefts[clampedFocus];

  return (
    <group>
      {items.map((item, index) => (
        <Tile
          key={item.id}
          title={item.title}
          icon={item.icon}
          wideArt={item.wideArt}
          width={widths[index]}
          height={heights[index]}
          targetX={offset + lefts[index] + widths[index] / 2}
          targetY={(index === clampedFocus ? TOP_Y + PROTRUDE : TOP_Y) - heights[index] / 2}
          isFocused={!hidden && clampedFocus === index}
          hidden={hidden}
          revealDelay={index * 70}
          onOpen={(rect) => onSelect(item.id, rect)}
          onFocus={() => {
            if (!expandedId) {
              onFocusIndex(index);
            }
          }}
        />
      ))}
    </group>
  );
}
