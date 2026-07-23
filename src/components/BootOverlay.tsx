'use client';

import { useEffect, useRef, useState } from 'react';
import { useBootStore } from '@/store/useBootStore';
import { unlockAudio, playStartup, fadeOutStartup, startMusic } from '@/lib/sound';
import Logo from './Logo';

// DOM-only startup:
//   logo    — black screen + centered RZ logo, "Press any button to power on".
//             The press unlocks audio, starts the startup sound, and dissolves
//             the black away.
//   welcome — the black backdrop fades to transparent (revealing the ambient
//             scene) while the logo STAYS centered and "Welcome to my
//             Portfolio" fades in. Holds 3s, then auto-continues.
//   exit    — the welcome copy fades out and, in the same beat, the centered
//             logo flies up to its resting spot in the top bar — a shared-
//             element morph measured against the real .top-logo.
//   handoff — the dashboard is revealed underneath; the boot logo cross-fades
//             out in place over the identical top-bar logo, then unmounts.
// Plays on every load — no persisted flag.

type Stage = 'logo' | 'welcome' | 'exit' | 'handoff';

const WELCOME_HOLD_MS = 3000;
const STARTUP_FADE_MS = 220;
// How long the logo takes to travel from centre to the top bar, and the cross-
// fade that hands it off to the real top-bar logo once it lands.
const LOGO_FLIGHT_MS = 650;
const HANDOFF_MS = 450;

export default function BootOverlay() {
  const { bootDone, finishBoot } = useBootStore();
  const [stage, setStage] = useState<Stage>('logo');
  const [gone, setGone] = useState(false);
  const stageRef = useRef<Stage>('logo');
  const bootLogoRef = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);

  // Mirror the stage into a ref (in an effect, not during render) so the
  // window-level input handler can read the latest value.
  useEffect(() => {
    stageRef.current = stage;
  }, [stage]);

  useEffect(() => {
    // Once the boot has advanced past the logo stage we no longer need the
    // "press to power on" listeners; the sequence runs itself on timers from
    // here (which live in `timers` and are cleared only on unmount, so the
    // bootDone flip mid-handoff can't cancel them).
    if (bootDone) return;

    // Shared-element morph: translate + scale the centred boot logo so it
    // lands exactly on the real top-bar logo. Measuring both rects makes it
    // exact at any viewport / responsive padding. The centred element's own
    // centre already sits at the viewport centre, so a plain delta of centres
    // lands it on target regardless of the scale factor.
    const flyLogoToTopBar = () => {
      const logoEl = bootLogoRef.current;
      const target = document.querySelector<HTMLElement>('.top-logo');
      if (!logoEl || !target) return;
      const b = logoEl.getBoundingClientRect();
      const t = target.getBoundingClientRect();
      const dx = t.left + t.width / 2 - (b.left + b.width / 2);
      const dy = t.top + t.height / 2 - (b.top + b.height / 2);
      const scale = t.width / b.width;
      logoEl.style.transition = `transform ${LOGO_FLIGHT_MS}ms cubic-bezier(0.7, 0, 0.2, 1)`;
      logoEl.style.transform = `translate(-50%, -50%) translate(${dx}px, ${dy}px) scale(${scale})`;
    };

    // Cross-fade the (now landed) boot logo out over the identical top-bar
    // logo revealed beneath it, then drop the overlay for good.
    const finishHandoff = () => {
      const logoEl = bootLogoRef.current;
      if (logoEl) {
        logoEl.style.transition = `opacity ${HANDOFF_MS}ms ease`;
        logoEl.style.opacity = '0';
      }
      timers.current.push(window.setTimeout(() => setGone(true), HANDOFF_MS));
    };

    const enter = () => {
      // Fade the startup out quickly and start the menu music.
      fadeOutStartup(STARTUP_FADE_MS);
      startMusic();
      // Welcome fades out while, in the same beat, the logo flies to the bar.
      setStage('exit');
      flyLogoToTopBar();
      timers.current.push(
        window.setTimeout(() => {
          finishBoot(true); // reveal the dashboard beneath
          setStage('handoff');
          finishHandoff();
        }, LOGO_FLIGHT_MS)
      );
    };

    const advance = () => {
      // This handler runs inside a user gesture — the moment browsers allow
      // audio, so unlock the context here.
      unlockAudio();
      if (stageRef.current !== 'logo') return; // welcome auto-continues
      // Power on: start the startup sound, reveal the welcome, and hold it
      // for 3s before continuing on its own.
      playStartup();
      setStage('welcome');
      timers.current.push(window.setTimeout(enter, WELCOME_HOLD_MS));
    };

    window.addEventListener('keydown', advance);
    window.addEventListener('pointerdown', advance);
    return () => {
      window.removeEventListener('keydown', advance);
      window.removeEventListener('pointerdown', advance);
    };
  }, [bootDone, finishBoot]);

  // Clear any pending timers if the overlay unmounts mid-sequence.
  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach((id) => clearTimeout(id));
  }, []);

  if (gone) return null;

  return (
    <div className={`boot-overlay stage-${stage}`}>
      <div className="boot-logo" aria-hidden="true" ref={bootLogoRef}>
        <Logo />
      </div>
      <p className="boot-logo-prompt">Press any button to power on</p>

      <div className="boot-welcome" role="status">
        <h1 className="boot-welcome-title">Welcome to my Portfolio</h1>
      </div>
    </div>
  );
}
