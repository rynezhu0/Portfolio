'use client';

import { useEffect, useLayoutEffect, useState } from 'react';
import { useNavStore, type MorphRect } from '@/store/useNavStore';

// How long the portal push runs before the clone is torn down. Kept in sync
// with the transform/opacity timing in globals.css (.morph-panel).
const ENTER_MS = 440;

// The "camera push through a window": when a content tile is opened, a clone
// of it starts exactly on the tile and rushes forward — scaling past the
// frame and dissolving — while the 3D menu behind it fades out and the
// section content zooms out + fades in to meet it. The clone is a full-frame
// box positioned onto the tile with an inverted transform (FLIP), then
// released to its resting scale so it grows smoothly on the GPU.
export default function TransitionLayer() {
  const morph = useNavStore((s) => s.morph);
  const clearMorph = useNavStore((s) => s.clearMorph);
  // The morph object that has been released to its played state. A fresh morph
  // (a new object) reads as "not yet played" until the next frame flips it, so
  // the inverted (tile-sized) frame paints first and the growth actually
  // animates.
  const [played, setPlayed] = useState<MorphRect | null>(null);
  const playing = !!morph && played === morph;

  useLayoutEffect(() => {
    if (!morph) return;
    const raf = requestAnimationFrame(() => setPlayed(morph));
    return () => cancelAnimationFrame(raf);
  }, [morph]);

  // Tear the clone down once the push has finished.
  useEffect(() => {
    if (!morph) return;
    const t = window.setTimeout(clearMorph, ENTER_MS + 60);
    return () => window.clearTimeout(t);
  }, [morph, clearMorph]);

  if (!morph) return null;

  // Invert a full-viewport box onto the source tile: scale it down to the
  // tile's size and translate its centre onto the tile's centre.
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const invert =
    `translate(${morph.x + morph.w / 2 - vw / 2}px, ${morph.y + morph.h / 2 - vh / 2}px) ` +
    `scale(${morph.w / vw}, ${morph.h / vh})`;

  return (
    <div
      className={`morph-panel${playing ? ' playing' : ''}`}
      style={playing ? undefined : { transform: invert }}
      aria-hidden="true"
    />
  );
}
