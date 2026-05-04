// Audio: tier-based looped music + one-shot sound effects.
// Mute preference persists in localStorage independent of game save state.

const MUTED_KEY    = 'little-chef-clicker:muted';
const MUSIC_VOLUME = 0.35;
const SFX_VOLUME   = 0.55;

// Track per fancy tier: index 0 = pre-tier (cps < 25), 1..5 = active tiers.
// Indices line up with `state.fancy` so the mapping is `tracks[state.fancy]`.
const MUSIC_TRACKS = [
  'music/apple_cider_loop.wav',
  'music/course_1_loop.wav',
  'music/course_2_loop.wav',
  'music/course_3_loop.wav',
  'music/course_4_loop.wav',
  'music/course_5_loop.wav',
];

const CRUNCH_FILES = [
  'sound effects/crunch/crunch.1.ogg',
  'sound effects/crunch/crunch.2.ogg',
  'sound effects/crunch/crunch.3.ogg',
  'sound effects/crunch/crunch.4.ogg',
  'sound effects/crunch/crunch.5.ogg',
  'sound effects/crunch/crunch.6.ogg',
  'sound effects/crunch/crunch.7.ogg',
];

const POP_FILES = [
  'sound effects/pop/pop1.wav',
  'sound effects/pop/pop2.wav',
  'sound effects/pop/pop3.wav',
  'sound effects/pop/pop4.wav',
  'sound effects/pop/pop5.wav',
  'sound effects/pop/pop6.wav',
  'sound effects/pop/pop7.wav',
  'sound effects/pop/pop8.wav',
  'sound effects/pop/pop9.wav',
];

const SADNESS_FILES = [
  'sound effects/sadness/Human Fart.mp3',
  'sound effects/sadness/Wine Glass Shatter.mp3',
];

const JOY_FILES = [
  'sound effects/joy/freesound_community-funny-yay-6273.mp3',
  'sound effects/joy/freesound_community-yay-6120.mp3',
];

let bgMusic        = null;
let currentTrackIx = -1;
let muted          = false;
let started        = false;
let crunchPool     = [];
let popPool        = [];
let sadnessPool    = [];
let joyPool        = [];

export function initAudio() {
  try { muted = localStorage.getItem(MUTED_KEY) === '1'; } catch (e) {}

  bgMusic = new Audio();
  bgMusic.loop    = true;
  bgMusic.volume  = MUSIC_VOLUME;
  bgMusic.muted   = muted;
  bgMusic.preload = 'auto';

  // Pre-build SFX pools. Each file becomes a "seed" Audio that gets
  // cloneNode()'d on play, which lets pops overlap when the player taps
  // the pot rapidly without piling up Audio constructors.
  const seed = src => { const a = new Audio(src); a.preload = 'auto'; return a; };
  crunchPool  = CRUNCH_FILES.map(seed);
  popPool     = POP_FILES.map(seed);
  sadnessPool = SADNESS_FILES.map(seed);
  joyPool     = JOY_FILES.map(seed);

  // Browsers block autoplay until the first user gesture.
  const kick = () => {
    if (started || !bgMusic.src) return;
    started = true;
    bgMusic.play().catch(() => { started = false; });
  };
  document.addEventListener('pointerdown', kick);
  document.addEventListener('keydown',     kick);
  document.addEventListener('touchstart',  kick);
}

// Switch to the music track for a given tier. Same-track calls are a no-op,
// so this is safe to call every frame from applyFancyTier.
export function setMusicTrack(idx) {
  if (!bgMusic) return;
  const i = Math.max(0, Math.min(MUSIC_TRACKS.length - 1, idx));
  if (i === currentTrackIx) return;
  currentTrackIx = i;
  bgMusic.src = MUSIC_TRACKS[i];
  if (started) bgMusic.play().catch(() => {});
}

export function isMuted() { return muted; }

export function toggleMute() {
  muted = !muted;
  if (bgMusic) bgMusic.muted = muted;
  try { localStorage.setItem(MUTED_KEY, muted ? '1' : '0'); } catch (e) {}
  return muted;
}

function playFromPool(pool, vol = SFX_VOLUME) {
  if (pool.length === 0) return;
  const seed = pool[Math.floor(Math.random() * pool.length)];
  const a = seed.cloneNode();
  a.volume = vol;
  a.play().catch(() => {});
}

export function playSfx(name) {
  if (muted) return;
  switch (name) {
    case 'crunch':  playFromPool(crunchPool); break;
    // Pops are quick clicks — lower volume so a rapid burst doesn't drown
    // out music or SFX layered on top (like the crunch on dish completion).
    case 'pop':     playFromPool(popPool, 0.35); break;
    case 'sadness': playFromPool(sadnessPool, 0.6); break;
    case 'joy':     playFromPool(joyPool, 0.7); break;
  }
}
