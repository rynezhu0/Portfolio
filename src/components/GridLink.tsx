'use client';

import { GithubIcon, GlobeIcon, ExternalLinkIcon } from './icons';

// The mark for a link chip, chosen from the link's own label so the data files
// stay plain strings; anything unrecognised gets the generic external-link
// icon rather than nothing.
function LinkIcon({ label }: { label: string }) {
  const props = { size: 15, className: 'grid-link-icon' };
  switch (label.trim().toLowerCase()) {
    case 'github':
      return <GithubIcon {...props} />;
    case 'website':
    case 'live':
    case 'demo':
      return <GlobeIcon {...props} />;
    default:
      return <ExternalLinkIcon {...props} />;
  }
}

// One link chip in a Projects/Experience detail panel.
export default function GridLink({ label, url }: { label: string; url: string }) {
  return (
    <a className="grid-link" href={url} target="_blank" rel="noopener noreferrer">
      <LinkIcon label={label} />
      {label}
    </a>
  );
}
