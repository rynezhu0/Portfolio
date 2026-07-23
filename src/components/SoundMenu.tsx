'use client';

import { useEffect, useRef, useState } from 'react';
import { useSoundStore } from '@/store/useSoundStore';
import { playSfx } from '@/lib/sound';

function SpeakerOn() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M11 5 6 9H2v6h4l5 4z" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    </svg>
  );
}

function SpeakerOff() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M11 5 6 9H2v6h4l5 4z" />
      <line x1="23" y1="9" x2="17" y2="15" />
      <line x1="17" y1="9" x2="23" y2="15" />
    </svg>
  );
}

function Toggle({
  label,
  on,
  onClick,
}: {
  label: string;
  on: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className="sound-row"
      role="switch"
      aria-checked={on}
      onClick={() => {
        playSfx('click');
        onClick();
      }}
    >
      <span>{label}</span>
      <span className={`sound-switch${on ? ' on' : ''}`} aria-hidden="true">
        <span className="sound-knob" />
      </span>
    </button>
  );
}

export default function SoundMenu() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const { sfxMuted, musicMuted, toggleSfxMuted, toggleMusicMuted } = useSoundStore();

  // Close when clicking outside or pressing Escape
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('pointerdown', onDown);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const allMuted = sfxMuted && musicMuted;

  return (
    <div className="sound-menu" ref={rootRef}>
      {open && (
        <div className="sound-panel" role="menu">
          <Toggle label="Sound Effects" on={!sfxMuted} onClick={toggleSfxMuted} />
          <Toggle label="Music" on={!musicMuted} onClick={toggleMusicMuted} />
        </div>
      )}
      <button
        className="sound-menu-button"
        onClick={() => {
          playSfx('click');
          setOpen((v) => !v);
        }}
        aria-label="Sound settings"
        aria-expanded={open}
      >
        {allMuted ? <SpeakerOff /> : <SpeakerOn />}
      </button>
    </div>
  );
}
