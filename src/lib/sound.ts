// Audio engine for the site's UI sounds. Short SFX play through the Web Audio
// API (low latency, can overlap on rapid navigation); the looping menu music
// uses a plain <audio> element. Browsers block audio until a user gesture, so
// unlockAudio() must be called from within one (a boot press).

type SfxName = 'click' | 'tileClick' | 'motion' | 'startup';

const SFX_SRC: Record<SfxName, string> = {
  click: '/sounds/ClickSFX.mp3',
  // Clicking a selected tile to open it.
  tileClick: '/sounds/TileClickSFX.mp3',
  // Changing which tile is focused (the focus hop).
  motion: '/sounds/MotionSFX.mp3',
  startup: '/sounds/StartupSFX.mp3',
};
// Per-sound levels: motion is frequent but turned up here; startup is a moment.
// tileClick fires when a tile is opened; click is every other UI press.
const SFX_VOLUME: Record<SfxName, number> = { click: 0.55, tileClick: 0.6, motion: 0.55, startup: 0.7 };
// Playback rate per sound — all at natural speed.
const SFX_RATE: Record<SfxName, number> = { click: 1, tileClick: 1, motion: 1, startup: 1 };

const MUSIC_SRC = '/sounds/SystemMusic.mp3';
const MUSIC_VOLUME = 0.25;
// The track is ~30s; after it ends, wait this long before playing it again.
const MUSIC_GAP_MS = 30_000;

let ctx: AudioContext | null = null;
let sfxGain: GainNode | null = null; // SFX bus (muted independently)
const buffers: Partial<Record<SfxName, AudioBuffer>> = {};

// The startup sound keeps its own source + gain so it can be faded out.
let startupSource: AudioBufferSourceNode | null = null;
let startupGain: GainNode | null = null;

let music: HTMLAudioElement | null = null;
let musicStarted = false;
let musicTimer = 0;

let sfxMuted = false;
let musicMuted = false;
let preloaded = false;

function ensureContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const AC =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    sfxGain = ctx.createGain();
    sfxGain.gain.value = sfxMuted ? 0 : 1;
    sfxGain.connect(ctx.destination);
  }
  return ctx;
}

// Fetch + decode the SFX and prepare the music element. Safe to call before
// any user gesture — decoding works while the context is suspended.
export async function preloadSounds(): Promise<void> {
  if (preloaded || typeof window === 'undefined') return;
  preloaded = true;

  const c = ensureContext();
  if (c) {
    await Promise.all(
      (Object.keys(SFX_SRC) as SfxName[]).map(async (name) => {
        try {
          const res = await fetch(SFX_SRC[name]);
          buffers[name] = await c.decodeAudioData(await res.arrayBuffer());
        } catch {
          /* leave unset — that one sound just won't play */
        }
      })
    );
  }

  if (!music) {
    music = new Audio(MUSIC_SRC);
    music.loop = false; // looping is handled manually so we can insert the gap
    music.volume = musicMuted ? 0 : MUSIC_VOLUME;
    music.preload = 'auto';
    music.addEventListener('ended', () => {
      // 30s track finished → wait 30s of silence, then play it again. The
      // cycle keeps running while muted (silently) so unmuting resumes cleanly.
      window.clearTimeout(musicTimer);
      musicTimer = window.setTimeout(() => {
        if (musicStarted && !musicMuted && music) {
          music.currentTime = 0;
          void music.play().catch(() => {});
        }
      }, MUSIC_GAP_MS);
    });
  }
}

// Call from within a user gesture to permit playback.
export function unlockAudio(): void {
  const c = ensureContext();
  if (c && c.state === 'suspended') void c.resume();
}

export function playSfx(name: 'click' | 'tileClick' | 'motion'): void {
  if (sfxMuted) return;
  const c = ctx;
  const buf = buffers[name];
  if (!c || !buf || !sfxGain) return;
  if (c.state === 'suspended') void c.resume();
  const src = c.createBufferSource();
  src.buffer = buf;
  src.playbackRate.value = SFX_RATE[name];
  const g = c.createGain();
  g.gain.value = SFX_VOLUME[name];
  src.connect(g);
  g.connect(sfxGain);
  src.start();
}

// The boot "power on" sound — kept referenced so it can be faded out on enter.
export function playStartup(): void {
  const c = ctx;
  const buf = buffers.startup;
  if (!c || !buf || !sfxGain) return;
  if (c.state === 'suspended') void c.resume();
  try {
    startupSource?.stop();
  } catch {
    /* not started */
  }
  startupSource = c.createBufferSource();
  startupSource.buffer = buf;
  startupGain = c.createGain();
  startupGain.gain.value = SFX_VOLUME.startup;
  startupSource.connect(startupGain);
  startupGain.connect(sfxGain);
  startupSource.start();
}

export function fadeOutStartup(ms = 250): void {
  const c = ctx;
  if (!c || !startupGain || !startupSource) return;
  const now = c.currentTime;
  const g = startupGain.gain;
  g.cancelScheduledValues(now);
  g.setValueAtTime(g.value, now);
  g.linearRampToValueAtTime(0, now + ms / 1000);
  try {
    startupSource.stop(now + ms / 1000 + 0.02);
  } catch {
    /* already stopped */
  }
  startupSource = null;
  startupGain = null;
}

// Begin the menu music cycle. Must be called from within a user gesture.
export function startMusic(): void {
  if (!music) return;
  musicStarted = true;
  window.clearTimeout(musicTimer);
  music.currentTime = 0;
  music.volume = musicMuted ? 0 : MUSIC_VOLUME;
  void music.play().catch(() => {});
}

export function setSfxMuted(m: boolean): void {
  sfxMuted = m;
  if (sfxGain) sfxGain.gain.value = m ? 0 : 1;
}

export function setMusicMuted(m: boolean): void {
  musicMuted = m;
  if (!music) return;
  if (m) {
    // Actually stop the track (not just silence it) and cancel any pending
    // replay so nothing plays while muted.
    music.pause();
    window.clearTimeout(musicTimer);
  } else if (musicStarted) {
    music.volume = MUSIC_VOLUME;
    // If it ended (or was paused during the gap) while muted, restart the
    // cycle from the top; otherwise resume from where it paused.
    if (music.ended || music.currentTime === 0) {
      music.currentTime = 0;
    }
    void music.play().catch(() => {});
  }
}

export function isSfxMuted(): boolean {
  return sfxMuted;
}

export function isMusicMuted(): boolean {
  return musicMuted;
}
