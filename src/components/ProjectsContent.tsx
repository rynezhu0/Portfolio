'use client';

import TileGridBrowser, { type GridBrowserItem } from './TileGridBrowser';
import { projects } from '@/data/projects';
import { ToolIcon } from './icons';
import Logo from './Logo';
import GridLink from './GridLink';

// Tile artwork, keyed by project id. Anything missing here keeps the default
// ToolIcon on the standard blue tile gradient.
const ART: Record<string, Pick<GridBrowserItem, 'art' | 'artBackground'>> = {
  // The site's own monogram — white on the tiles' normal gradient.
  portfolio: { art: <Logo /> },
  // Brand blue needs a light plate to read; it would sink into the blue tile.
  checkmark: {
    art: <img src="/images/checkmark.svg" alt="" />,
    artBackground: '#eef3fb',
  },
  // Black silhouette with fire-tinted flames, over the oxidised-metal texture.
  // The solid colour is a fallback: if counterstrafe-bg.png is absent the tile
  // still shows a matching slate rather than a broken image.
  'counterstrafe.ninja': {
    art: <img src="/images/counterstrafe.svg" alt="" />,
    artBackground: "#5f6f66 url('/images/counterstrafe-bg.png') center / cover",
  },
};

// Projects browse as a 3-column tile grid; selecting a tile reveals its
// description + links on the right (see TileGridBrowser).
export default function ProjectsContent() {
  const items: GridBrowserItem[] = projects.map((p) => ({
    id: p.id,
    title: p.title,
    icon: ToolIcon,
    ...ART[p.id],
    detail: (
      <>
        <h2 className="grid-detail-title">{p.title}</h2>
        <p className="grid-detail-meta">{p.year}</p>
        <p className="grid-detail-desc">{p.blurb}</p>

        {p.image && (
          <img
            className="grid-detail-image"
            src={p.image}
            alt={p.imageAlt ?? `${p.title} screenshot`}
          />
        )}

        {p.tags.length > 0 && (
          <div className="grid-detail-tags">
            {p.tags.map((tag) => (
              <span key={tag} className="grid-chip">
                {tag}
              </span>
            ))}
          </div>
        )}

        {p.links.length > 0 && (
          <div className="grid-detail-links">
            {p.links.map((link) => (
              <GridLink key={link.label} label={link.label} url={link.url} />
            ))}
          </div>
        )}
      </>
    ),
  }));

  return <TileGridBrowser items={items} label="Projects" />;
}
