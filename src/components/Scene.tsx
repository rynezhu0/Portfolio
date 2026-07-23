'use client';

import { Canvas } from '@react-three/fiber';
import TileRow from './TileRow';
import { useNavStore } from '@/store/useNavStore';
import { sections } from '@/data/sections';

export default function Scene({ contentActive }: { contentActive: boolean }) {
  const { focusedIndex, expandedSection, setFocusedIndex, expandSection, startMorph } =
    useNavStore();

  // Every section is now a content page, so opening any tile plays the portal
  // morph from the tile's rect into its page.
  const openTop = (id: string, rect: DOMRect) => {
    startMorph({ x: rect.left, y: rect.top, w: rect.width, h: rect.height });
    expandSection(id);
  };

  return (
    <div
      className={`canvas-container${contentActive ? ' content-active' : ''}`}
      aria-hidden="true"
    >
      {/* Transparent canvas — the Canvas 2D streak background shows through
          from the DOM layer behind it */}
      <Canvas
        camera={{ position: [0, 0, 10], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
      >
        <ambientLight intensity={1} />

        {/* Top-level About Me / Projects / Experience / Skillset / Contact row */}
        <TileRow
          items={sections}
          focusedIndex={focusedIndex}
          expandedId={expandedSection}
          dimmed={false}
          onFocusIndex={setFocusedIndex}
          onSelect={openTop}
        />
      </Canvas>
    </div>
  );
}
