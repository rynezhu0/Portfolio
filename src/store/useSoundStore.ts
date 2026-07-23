import { create } from 'zustand';
import { setSfxMuted as engineSetSfxMuted, setMusicMuted as engineSetMusicMuted } from '@/lib/sound';

const SFX_KEY = 'sound-sfx-muted';
const MUSIC_KEY = 'sound-music-muted';

interface SoundState {
  sfxMuted: boolean;
  musicMuted: boolean;
  /** Load persisted prefs and apply them to the engine (client-only). */
  initMuted: () => void;
  toggleSfxMuted: () => void;
  toggleMusicMuted: () => void;
}

function read(key: string): boolean {
  try {
    return localStorage.getItem(key) === '1';
  } catch {
    return false;
  }
}
function write(key: string, v: boolean): void {
  try {
    localStorage.setItem(key, v ? '1' : '0');
  } catch {
    /* ignore */
  }
}

export const useSoundStore = create<SoundState>((set, get) => ({
  sfxMuted: false,
  musicMuted: false,
  initMuted: () => {
    const sfx = read(SFX_KEY);
    const music = read(MUSIC_KEY);
    engineSetSfxMuted(sfx);
    engineSetMusicMuted(music);
    set({ sfxMuted: sfx, musicMuted: music });
  },
  toggleSfxMuted: () => {
    const m = !get().sfxMuted;
    engineSetSfxMuted(m);
    write(SFX_KEY, m);
    set({ sfxMuted: m });
  },
  toggleMusicMuted: () => {
    const m = !get().musicMuted;
    engineSetMusicMuted(m);
    write(MUSIC_KEY, m);
    set({ musicMuted: m });
  },
}));
