'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import LiveClock from './LiveClock';
import Logo from './Logo';
import { useBootStore } from '@/store/useBootStore';
import { sections } from '@/data/sections';
import { RESUME_URL } from '@/data/contact';

export default function TopStrip() {
  const bootDone = useBootStore((s) => s.bootDone);
  const pathname = usePathname();

  // Persistent nav bar once booted — it stays up through the portal morph too
  // (it sits above .morph-panel), so the bar never blinks on navigation.
  const visible = bootDone;

  return (
    <header
      className="top-strip"
      role="banner"
      style={{
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? undefined : 'none',
        transition: 'opacity 0.4s ease',
      }}
    >
      {/* Left — logo + section navigation */}
      <div className="flex items-center gap-6">
        <Link href="/" aria-label="Home" className="flex items-center">
          <Logo className="top-logo" title="Ryne Zhu" />
        </Link>
        {/* Nudged right (ml) so the links sit between the logo and the name,
            biased toward the logo side (kept small so the last link clears the
            centered name). */}
        <nav className="flex items-center gap-6 ml-[1.25vw]" aria-label="Sections">
          {sections.map((s) => {
            const active = pathname === s.route;
            return (
              <Link
                key={s.id}
                href={s.route}
                aria-current={active ? 'page' : undefined}
                className={`text-[17px] tracking-wide transition-colors no-underline ${
                  active ? 'text-text-primary' : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                {s.title}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Center — Name / Wordmark */}
      <div className="top-strip-center">
        <Link
          href="/"
          className="text-[48px] font-normal text-text-primary tracking-tight hover:opacity-80 transition-opacity no-underline"
          aria-label="Home"
        >
          Ryne Zhu
        </Link>
      </div>

      {/* Right — Résumé, then City + Clock */}
      <div className="flex items-center gap-6">
        <a
          href={RESUME_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[20px] font-normal text-text-secondary hover:text-text-primary tracking-wide transition-colors underline"
        >
          Résumé
        </a>
        <span className="text-[20px] text-text-secondary tracking-wide">Toronto, ON</span>
        <LiveClock />
      </div>
    </header>
  );
}
