'use client';

import { useEffect, useRef } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

// PS5-style ambient — pure Canvas 2D, recolored to a PS4 deep-blue scheme.
// Motes travel a parametric 3D-ish path that snakes across the screen; a
// per-mote depth (z) scales their size to fake travelling into and out of
// the screen. They flow from the bottom-left, so at any instant the field is
// spread evenly left↔right. Blue-white light-blue palette, additive, twinkly.

const MOTE_COUNT = 300;

// Peak colors: light blues / blue-whites to match the blue background
const PEAK_COLORS: [number, number, number][] = [
  [223, 239, 255], // #dfefff near white-blue
  [188, 220, 255], // #bcdcff
  [158, 200, 255], // #9ec8ff
  [127, 180, 245], // #7fb4f5
  [90, 155, 232], // #5a9be8
  [74, 148, 239], // #4a94ef
  [169, 224, 255], // #a9e0ff pale cyan
];
const COLOR_WEIGHTS = [2, 3, 3, 3, 2, 2, 2];

const TAU = Math.PI * 2;
const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), hi);

// The path across the three horizontal thirds, as (s, x, y, z) control points.
// z is depth: higher = closer/bigger, lower = farther/smaller ("into screen").
//  • left third:  bottom-left → rising right, receding into the screen
//  • middle third: keeps rising to ~quarter height, coming out a bit
//  • right third:  recedes into the screen again, then exits past the right
// A double-bend river of light: enters low from the lower-left, rises to a
// first crest, dips back down, rises again to a second crest, then descends
// and exits off the right edge. z is depth (higher = closer/bigger), and it
// undulates with the wave so the ribbon reads as moving into and out of the
// screen. Compressed so both bends sit on-screen.
const PATH: [number, number, number, number][] = [
  [0.0, 0.03, 1.02, 0.8], // bottom-left, close/big
  [0.18, 0.2, 0.56, 0.45], // rising
  [0.36, 0.37, 0.36, 0.62], // crest 1 (out a bit)
  [0.55, 0.55, 0.6, 0.38], // dips back down (into the screen)
  [0.74, 0.74, 0.34, 0.62], // crest 2 (out again)
  [1.0, 1.05, 0.56, 0.2], // descends to ~half height and exits
];

function pathAt(s: number): { x: number; y: number; z: number } {
  s = clamp(s, 0, 0.9999);
  let i = 0;
  while (i < PATH.length - 2 && s > PATH[i + 1][0]) i++;
  const a = PATH[i];
  const b = PATH[i + 1];
  const f = (s - a[0]) / (b[0] - a[0]);
  return {
    x: a[1] + (b[1] - a[1]) * f,
    y: a[2] + (b[2] - a[2]) * f,
    z: a[3] + (b[3] - a[3]) * f,
  };
}

// Motes converge toward the path line through the right third — the "clump".
function offsetScale(s: number): number {
  if (s < 0.7) return 1;
  return 1 - 0.55 * ((s - 0.7) / 0.3);
}

interface Mote {
  s: number; // fixed anchor along the path [0,1) — the dot does NOT travel it
  offX: number; // perpendicular scatter (forms a band, not a line)
  offY: number;
  zJitter: number;
  sizeBase: number;
  baseAlpha: number;
  ampX: number; // local float amplitude around the anchor
  ampY: number;
  freqX: number;
  freqY: number;
  phaseX: number;
  phaseY: number;
  zBreatheFreq: number;
  zBreathePhase: number;
  pulseSpeed: number;
  pulsePhase: number;
  colorIndex: number;
}

function pickIndex(): number {
  const total = COLOR_WEIGHTS.reduce((a, b) => a + b, 0);
  let roll = Math.random() * total;
  for (let i = 0; i < COLOR_WEIGHTS.length; i++) {
    roll -= COLOR_WEIGHTS[i];
    if (roll <= 0) return i;
  }
  return COLOR_WEIGHTS.length - 1;
}

function makeMote(): Mote {
  // Anchor along the path — biased so ~40% land in the center-right clump.
  const s = Math.random() < 0.4 ? 0.55 + Math.random() * 0.35 : Math.random() * 0.95;
  return {
    s,
    offX: (Math.random() * 2 - 1) * 0.05,
    offY: (Math.random() * 2 - 1) * 0.13,
    zJitter: (Math.random() * 2 - 1) * 0.1,
    sizeBase: 2.5 + 5.5 * Math.random(),
    baseAlpha: 0.7 + 0.3 * Math.random(),
    // Small, slow local float so each dot drifts within its own little space
    ampX: 0.006 + 0.016 * Math.random(),
    ampY: 0.006 + 0.016 * Math.random(),
    freqX: 0.12 + 0.3 * Math.random(),
    freqY: 0.12 + 0.3 * Math.random(),
    phaseX: Math.random() * TAU,
    phaseY: Math.random() * TAU,
    zBreatheFreq: 0.1 + 0.25 * Math.random(),
    zBreathePhase: Math.random() * TAU,
    pulseSpeed: 0.7 + 1.3 * Math.random(), // fast → blinks a lot
    pulsePhase: Math.random() * TAU,
    colorIndex: pickIndex(),
  };
}

// Pre-baked soft-dot sprites (one crisp + one soft per palette color) so
// drawing 300 motes is a cheap drawImage instead of a per-frame gradient.
function makeSprite(color: [number, number, number], crisp: boolean): HTMLCanvasElement {
  const S = 96;
  const c = document.createElement('canvas');
  c.width = S;
  c.height = S;
  const ctx = c.getContext('2d')!;
  const r = S / 2;
  const [cr, cg, cb] = color;
  const solid = crisp ? 0.55 : 0.22;
  const g = ctx.createRadialGradient(r, r, 0, r, r, r);
  g.addColorStop(0, `rgba(${cr},${cg},${cb},1)`);
  g.addColorStop(solid, `rgba(${cr},${cg},${cb},1)`);
  g.addColorStop(1, `rgba(${cr},${cg},${cb},0)`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, S, S);
  return c;
}

function bakeVignette(w: number, h: number): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d')!;

  // Deep-blue vertical gradient: a rich royal blue up top that dips slightly
  // darker through the middle before settling into deep navy at the bottom.
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0.0, '#0c4291'); // deep blue top
  g.addColorStop(0.5, '#082f66'); // slightly darker middle
  g.addColorStop(0.82, '#04204a');
  g.addColorStop(1.0, '#00052d'); // deep navy bottom
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  return c;
}

function bakeRays(w: number, h: number): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d')!;

  const sx = -0.05 * w;
  const sy = -0.1 * h;
  const blur = Math.round(Math.min(w, h) * 0.045);
  ctx.filter = `blur(${blur}px)`;

  // Soft cool light brightening the upper-left, echoing the reference
  const glow = ctx.createRadialGradient(sx, sy, 0, sx, sy, 0.8 * w);
  glow.addColorStop(0, 'rgba(150,195,245,0.22)');
  glow.addColorStop(0.4, 'rgba(80,140,215,0.1)');
  glow.addColorStop(1, 'rgba(60,110,190,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);

  const diag = Math.sqrt(w * w + h * h);
  const shafts: [number, number, number][] = [
    [34, 0.15, 0.08],
    [50, 0.12, 0.06],
  ];
  for (const [deg, widthFrac, alpha] of shafts) {
    const angle = (deg * Math.PI) / 180;
    const len = diag * 0.85;
    const shaftW = widthFrac * h;
    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(angle);
    const grad = ctx.createLinearGradient(0, 0, len, 0);
    grad.addColorStop(0, `rgba(170,205,250,${alpha})`);
    grad.addColorStop(0.4, `rgba(90,140,210,${alpha * 0.5})`);
    grad.addColorStop(0.8, 'rgba(60,110,190,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, -shaftW / 2, len, shaftW);
    ctx.restore();
  }
  ctx.filter = 'none';

  return c;
}

export default function Background() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    let w = 0;
    let h = 0;
    let vignette: HTMLCanvasElement | null = null;
    let rays: HTMLCanvasElement | null = null;
    // sprites[colorIndex] = [crispSprite, softSprite]
    const sprites = PEAK_COLORS.map((col) => [makeSprite(col, true), makeSprite(col, false)]);
    const motes: Mote[] = Array.from({ length: MOTE_COUNT }, () => makeMote());
    const startT = performance.now();

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      vignette = bakeVignette(w, h);
      rays = bakeRays(w, h);
    };

    const draw = (t: number) => {
      if (!vignette || !rays) return;

      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
      ctx.drawImage(vignette, 0, 0, w, h);

      // Rays: baked, with only a very slow intensity breathe
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = 0.92 + 0.08 * Math.sin(t * 0.15);
      ctx.drawImage(rays, 0, 0, w, h);

      const scale = Math.min(w, h) / 800;
      for (const m of motes) {
        // The anchor is fixed — the dot only floats gently within its own
        // little space around it, so nothing streams along the path.
        const p = pathAt(m.s);
        const os = offsetScale(m.s);
        const fx = Math.sin(t * m.freqX + m.phaseX) * m.ampX;
        const fy = Math.sin(t * m.freqY + m.phaseY) * m.ampY;
        const px = (p.x + m.offX * os + fx) * w;
        const py = (p.y + m.offY * os + fy) * h;

        // Depth → size (into/out of screen), with a faint size breathe.
        const z = clamp(
          p.z + m.zJitter + Math.sin(t * m.zBreatheFreq + m.zBreathePhase) * 0.04,
          0.12,
          1
        );
        const radius = m.sizeBase * (0.45 + z) * scale;

        // Twinkle, plus a mild closer-is-brighter bias
        const b = Math.pow(0.5 + 0.5 * Math.sin(t * m.pulseSpeed + m.pulsePhase), 1.3);
        const alpha = b * (0.55 + 0.5 * z) * m.baseAlpha;
        if (alpha < 0.01) continue;

        // Near/big motes are softer (out of focus); far/small ones crisper
        const spr = sprites[m.colorIndex][z < 0.5 ? 0 : 1];
        const d = radius * 2;
        ctx.globalAlpha = Math.min(alpha, 1);
        ctx.drawImage(spr, px - radius, py - radius, d, d);
      }

      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
    };

    const loop = (now: number) => {
      draw((now - startT) / 1000);
      raf = requestAnimationFrame(loop);
    };

    resize();
    window.addEventListener('resize', resize);

    if (reducedMotion) {
      draw(8);
    } else {
      raf = requestAnimationFrame(loop);
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, [reducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    />
  );
}
