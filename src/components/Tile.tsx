'use client';

import { useRef, useState, useLayoutEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { damp } from 'maath/easing';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useBootStore } from '@/store/useBootStore';
import type { IconComponent } from './icons';
import * as THREE from 'three';

// Html transform + distanceFactor 5 maps 80px of DOM to 1 world unit
// (drei scales transform-mode content by distanceFactor / 400), so the DOM
// face of a tile is sized at size * PX_PER_UNIT to exactly cover its mesh.
const PX_PER_UNIT = 80;

interface TileProps {
  title: string;
  icon?: IconComponent;
  /** Render the icon as large artwork spanning the tile width rather than a
   *  small centered glyph. Both are sized in % of the tile face, so either way
   *  the art tracks the damped tile scale exactly (no separate transition). */
  wideArt?: boolean;
  /** Tile dimensions in world units (already reflect focus state). */
  width: number;
  height: number;
  targetX: number;
  targetY: number;
  isFocused: boolean;
  hidden: boolean;
  /** Stagger delay (ms) for this tile's entrance after the boot sequence. */
  revealDelay: number;
  /** Open this tile's page (only called when it was focused before the press).
   *  Receives the tile face's on-screen rect so the transition can morph from it. */
  onOpen: (rect: DOMRect) => void;
  onFocus: () => void;
}

export default function Tile({
  title,
  icon: Icon,
  wideArt,
  width,
  height,
  targetX,
  targetY,
  isFocused,
  hidden,
  revealDelay,
  onOpen,
  onFocus,
}: TileProps) {
  const { bootDone, bootAnimated } = useBootStore();
  // Tracks whether this tile's entrance animation has run. The boot-enter
  // animation must never sit on a hidden tile — CSS animations override the
  // .hidden class's opacity, which made hidden nested-row tiles ghost in
  // over the main row at the end of the boot.
  const [entered, setEntered] = useState(false);
  const groupRef = useRef<THREE.Group>(null!);
  const meshRef = useRef<THREE.Mesh>(null!);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const initializedRef = useRef(false);
  // Whether this tile was already focused when the pointer went down. The
  // browser fires focus on mousedown, which re-renders the row before the
  // click lands on mouseup — deciding select-vs-open from current focus at
  // click time would therefore almost always see "already focused" and
  // wrongly open the page on the first click.
  const pressWasFocusedRef = useRef(false);
  const reducedMotion = useReducedMotion();
  // Short smoothTime for a snappy, console-like focus hop
  const smoothTime = reducedMotion ? 0 : 0.09;

  // On gaining focus, rewind the border-pulse animation to the current
  // point in the global 4s cycle, so every tile pulses on one shared clock
  // no matter when it was focused. Written imperatively (not via the style
  // prop) because reading the clock during render is impure.
  useLayoutEffect(() => {
    if (isFocused && buttonRef.current) {
      buttonRef.current.style.setProperty(
        '--pulse-delay',
        `${-Math.round(performance.now() % 4000)}ms`
      );
    }
  }, [isFocused]);

  // Snap straight to the resting layout on first mount so tiles don't fly
  // in from the origin; after that, position/scale changes are damped.
  useLayoutEffect(() => {
    if (!initializedRef.current && groupRef.current && meshRef.current) {
      groupRef.current.position.set(targetX, targetY, 0);
      meshRef.current.scale.set(width, height, 1);
      initializedRef.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useFrame((_, delta) => {
    if (!groupRef.current || !meshRef.current) return;
    damp(groupRef.current.position, 'x', targetX, smoothTime, delta);
    damp(groupRef.current.position, 'y', targetY, smoothTime, delta);
    damp(meshRef.current.scale, 'x', width, smoothTime, delta);
    damp(meshRef.current.scale, 'y', height, smoothTime, delta);

    // The DOM face's size is written from the damped mesh scale every frame
    // (instead of a CSS transition) so the face, its border, and the 3D
    // backing always agree mid-animation — a CSS transition runs on its own
    // curve and briefly disagrees with the damping, which is what caused
    // the border-not-hugging-the-tile gaps while focus moved.
    if (buttonRef.current) {
      buttonRef.current.style.width = `${meshRef.current.scale.x * PX_PER_UNIT}px`;
      buttonRef.current.style.height = `${meshRef.current.scale.y * PX_PER_UNIT}px`;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Invisible spatial anchor: the damped scale written here drives the
          DOM face's size each frame. It's not rendered because the browser
          composites the CSS-transformed DOM a frame behind the WebGL canvas
          during fast motion — a visible mesh would peek out around the face
          mid-animation. */}
      <mesh ref={meshRef} visible={false}>
        <boxGeometry args={[1, 1, 0.05]} />
      </mesh>

      {/* pointerEvents must be the drei prop, not a style: drei hardcodes
          pointer-events on its internal wrapper div, and a hidden tile's
          wrapper would otherwise silently swallow clicks aimed at the
          visible tiles stacked beneath it. */}
      <Html
        transform
        position={[0, 0, 0.04]}
        distanceFactor={5}
        pointerEvents={hidden ? 'none' : 'auto'}
      >
        <button
          ref={buttonRef}
          className={`tile-root${isFocused ? ' focused' : ''}${hidden ? ' hidden' : ''}${
            !bootDone
              ? ' boot-hidden'
              : bootAnimated && !entered && !hidden
                ? ' boot-enter'
                : ''
          }`}
          onAnimationEnd={(e) => {
            if (e.animationName === 'tile-enter') setEntered(true);
          }}
          style={{ '--enter-delay': `${revealDelay}ms` } as React.CSSProperties}
          onPointerDown={() => {
            pressWasFocusedRef.current = isFocused;
          }}
          onClick={(e) => {
            // e.detail === 0 means a keyboard-synthesized click (no pointer
            // press happened) — fall back to the live focus state for those.
            const wasFocused = e.detail === 0 ? isFocused : pressWasFocusedRef.current;
            if (wasFocused) {
              // Hand the tile's live screen rect to the transition so the
              // portal morph starts exactly where the tile sits.
              onOpen(e.currentTarget.getBoundingClientRect());
            } else {
              onFocus();
            }
          }}
          onFocus={onFocus}
          aria-label={title}
          tabIndex={hidden ? -1 : 0}
        >
          {/* Icon sized as a percentage so it scales continuously with the
              frame-synced tile face instead of jumping on focus change */}
          {Icon && <Icon size={64} className={wideArt ? 'tile-art-svg' : 'tile-icon-svg'} />}
          {isFocused && (
            <span className="tile-start" aria-hidden="true">
              Start
            </span>
          )}
        </button>
      </Html>

      {/* PS4-style label: the section name sits outside the tile, hanging off
          its bottom-right corner — tiles themselves carry no words. */}
      {isFocused && !hidden && bootDone && (
        <Html
          transform
          // Vertically level with the Start strip, like the real PS4 label
          position={[width / 2 + 0.35, -height / 2 + 0.55, 0.04]}
          distanceFactor={5}
          pointerEvents="none"
        >
          <div className="tile-label">{title}</div>
        </Html>
      )}
    </group>
  );
}
