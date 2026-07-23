'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import TopStrip from './TopStrip';
import BackButton from './BackButton';
import MobileFallback from './MobileFallback';
import Background from './Background';
import BootOverlay from './BootOverlay';
import SoundController from './SoundController';
import SoundMenu from './SoundMenu';
import TransitionLayer from './TransitionLayer';
import { useNavStore } from '@/store/useNavStore';
import { useBootStore } from '@/store/useBootStore';
import { useKeyboardNav } from '@/hooks/useKeyboardNav';
import { useWheelNav } from '@/hooks/useWheelNav';
import { sections } from '@/data/sections';

// Dynamic import Scene to avoid SSR (Canvas can't server-render)
const Scene = dynamic(() => import('./Scene'), {
  ssr: false,
  loading: () => (
    <div className="canvas-container flex items-center justify-center">
      <div className="font-mono text-[13px] text-text-secondary tracking-wider animate-pulse">
        Loading...
      </div>
    </div>
  ),
});

// Lives in the root layout so the <Canvas> (and its WebGL context / ambient
// background animation) persists across route changes instead of
// remounting every time the visitor navigates between sections.
export default function AppShell({ children }: { children: React.ReactNode }) {
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { expandedSection, setFocusedIndex, expandSection, collapseSection } = useNavStore();
  const { bootDone, finishBoot } = useBootStore();

  // Every section is a content page now, so its overlay shows as soon as the
  // section is expanded (and the boot has finished).
  const activeSection = sections.find((s) => s.id === expandedSection);
  const showOverlay = bootDone && !!activeSection;

  // Projects / Experience (grid-plus-detail) and Skillset (three columns) all
  // need more horizontal room than the centred text sections.
  const wideContent =
    expandedSection === 'projects' ||
    expandedSection === 'experience' ||
    expandedSection === 'skillset';

  useKeyboardNav();
  useWheelNav();

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Mobile fallback tiles aren't gated by the boot store, so the startup
  // overlay would sit over an already-visible page — bypass the boot there.
  useEffect(() => {
    if (isMobile && !bootDone) finishBoot(false);
  }, [isMobile, bootDone, finishBoot]);

  // Keeps the tile row's expand state and the URL in sync in both
  // directions — tile clicks/keyboard/Back button push a route, while a
  // direct link visit, page refresh, or browser Back/Forward updates the
  // store to match. Both `pathname` and `expandedSection` are read in one
  // effect (rather than two separate ones) specifically to avoid a race: two
  // effects keyed on different pieces of this two-way binding can each fire
  // in the same commit holding a stale view of the *other* piece, so on a
  // direct route visit a "sync store from route" effect and a "push route
  // from store" effect fired in the same pass would immediately fight and
  // bounce the URL back to '/'. Comparing against the previous values here
  // instead makes each mismatch resolve in exactly one direction.
  const prevPathnameRef = useRef(pathname);
  const prevExpandedRef = useRef(expandedSection);
  const isFirstSyncRef = useRef(true);

  useEffect(() => {
    const pathnameChanged = prevPathnameRef.current !== pathname;
    const expandedChanged = prevExpandedRef.current !== expandedSection;
    prevPathnameRef.current = pathname;
    prevExpandedRef.current = expandedSection;

    const routeSectionId =
      pathname === '/' ? null : sections.find((s) => s.route === pathname)?.id ?? null;

    if (routeSectionId === expandedSection) {
      isFirstSyncRef.current = false;
      return; // already in sync
    }

    // On the very first run (mount / direct link / refresh) there's nothing
    // to compare against yet — trust the URL. Otherwise, whichever side
    // actually changed since the last run is the one driving this update.
    const syncFromRoute = isFirstSyncRef.current || (pathnameChanged && !expandedChanged);
    isFirstSyncRef.current = false;

    if (syncFromRoute) {
      if (routeSectionId === null) {
        collapseSection();
      } else {
        const index = sections.findIndex((s) => s.id === routeSectionId);
        setFocusedIndex(index);
        expandSection(routeSectionId);
      }
    } else {
      const target = expandedSection
        ? sections.find((s) => s.id === expandedSection)?.route ?? '/'
        : '/';
      router.push(target);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, expandedSection]);

  return (
    <>
      {/* PS5-style god-rays + gold bokeh backdrop, behind everything */}
      <Background />

      {/* Headless audio: preloads SFX and plays navigation sounds */}
      <SoundController />

      <TopStrip />

      {isMobile ? (
        <div
          className="flex flex-col items-center justify-center min-h-screen pt-20 pb-10"
          style={{ position: 'relative', zIndex: 10 }}
        >
          <MobileFallback />
        </div>
      ) : (
        <Scene contentActive={showOverlay} />
      )}

      {/* Portal morph that plays when a content tile is opened */}
      {!isMobile && <TransitionLayer />}

      <div
        className={`section-overlay${showOverlay ? ' active' : ''}${
          wideContent ? ' section-overlay--wide' : ''
        }`}
        role="main"
      >
        {showOverlay && (
          // Arrival: starts slightly enlarged + transparent, then eases its
          // scale down to 100% while fading up — the mirror of the entry push
          // (see .section-content / @keyframes content-arrive in globals.css).
          <div
            key={expandedSection ?? 'home'}
            className={`section-content${wideContent ? ' section-content--wide' : ''}`}
          >
            {children}
          </div>
        )}
      </div>

      {bootDone && <BackButton />}

      {/* Sound settings menu, bottom-right (once the boot is done) */}
      {bootDone && <SoundMenu />}

      {/* PS5-style startup: power-on → welcome screen → enter */}
      {!isMobile && <BootOverlay />}
    </>
  );
}
