'use client';

import Link from 'next/link';
import { sections } from '@/data/sections';

// Touch/small-screen fallback: a plain swipeable DOM carousel, no 3D canvas.
// Tiles are real links to each section's route — navigating updates the URL,
// and the shared nav store picks up the change (see AppShell's route sync).
export default function MobileFallback() {
  return (
    <div className="mobile-carousel" role="navigation" aria-label="Site sections">
      {sections.map((section) => {
        const Icon = section.icon;
        return (
          <Link
            key={section.id}
            href={section.route}
            className="mobile-carousel-tile no-underline"
            aria-label={section.title}
          >
            <span className="text-text-primary mb-4" aria-hidden="true">
              <Icon size={32} />
            </span>
            <h3 className="font-display text-xl font-semibold text-text-primary">
              {section.title}
            </h3>
          </Link>
        );
      })}
    </div>
  );
}
