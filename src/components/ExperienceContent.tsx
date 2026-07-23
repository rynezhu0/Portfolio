'use client';

import TileGridBrowser, { type GridBrowserItem } from './TileGridBrowser';
import { experience } from '@/data/experience';
import { BriefcaseIcon } from './icons';
import Logo from './Logo';
import GridLink from './GridLink';

// Tile artwork, keyed by role id. Each mark gets the background colour it needs
// to read; anything missing here keeps the default BriefcaseIcon on the
// standard blue tile gradient.
const ART: Record<string, Pick<GridBrowserItem, 'art' | 'artBackground'>> = {
  'project-manager': {
    art: <img src="/images/mcmaster.svg" alt="" />,
    artBackground: '#7A003C', // McMaster maroon
  },
  'student-instructor': {
    art: <img src="/images/canada-leaf.svg" alt="" />,
    artBackground: '#ffffff',
  },
  // Self-employed — the site's own monogram on the tiles' normal gradient.
  'private-tutor': { art: <Logo /> },
};

// Experience browses as a 3-column tile grid; selecting a role reveals its
// description + links on the right (see TileGridBrowser).
export default function ExperienceContent() {
  const items: GridBrowserItem[] = experience.map((role) => ({
    id: role.id,
    title: role.title,
    icon: BriefcaseIcon,
    ...ART[role.id],
    detail: (
      <>
        <h2 className="grid-detail-title">{role.title}</h2>
        <p className="grid-detail-company">{role.company}</p>
        <p className="grid-detail-meta">{role.period}</p>
        <p className="grid-detail-desc">{role.blurb}</p>

        {!!role.links?.length && (
          <div className="grid-detail-links">
            {role.links.map((link) => (
              <GridLink key={link.label} label={link.label} url={link.url} />
            ))}
          </div>
        )}
      </>
    ),
  }));

  return <TileGridBrowser items={items} label="Experience" />;
}
