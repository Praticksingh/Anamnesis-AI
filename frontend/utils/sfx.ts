type SoundName = "tick" | "whoosh" | "chime" | "hum";

type SoundBoard = Record<SoundName, HTMLAudioElement> | null;

const SOUND_PATHS: Record<SoundName, string> = {
  tick: "/sounds/tick.mp3",
  whoosh: "/sounds/whoosh.mp3",
  chime: "/sounds/chime.mp3",
  hum: "/sounds/hum.mp3",
};

let soundBoard: SoundBoard = null;
let muted = false;
let unlocked = false;

function createAudio(path: string, volume: number) {
  const audio = new Audio(path);
  audio.preload = "auto";
  audio.volume = volume;
  return audio;
}

export function getMuted() {
  return muted;
}

export function setMuted(nextMuted: boolean) {
  muted = nextMuted;
  if (!soundBoard) return;
  Object.values(soundBoard).forEach((audio) => {
    audio.volume = muted ? 0 : audio.dataset.baseVolume ? Number(audio.dataset.baseVolume) : 0.45;
  });
}

export function toggleMuted() {
  setMuted(!muted);
  return muted;
}

export function unlockSounds() {
  unlocked = true;
  if (!soundBoard) {
    soundBoard = {
      tick: createAudio(SOUND_PATHS.tick, 0.4),
      whoosh: createAudio(SOUND_PATHS.whoosh, 0.35),
      chime: createAudio(SOUND_PATHS.chime, 0.45),
      hum: createAudio(SOUND_PATHS.hum, 0.18),
    };
    Object.entries(soundBoard).forEach(([name, audio]) => {
      audio.dataset.baseVolume = audio.volume.toString();
      if (muted) audio.volume = 0;
      if (name === "hum") {
        audio.loop = true;
      }
    });
  }
}

export function ensureSoundBoard() {
  if (!soundBoard) {
    unlockSounds();
  }
  return soundBoard;
}

export function playSound(name: SoundName, { force = false } = {}) {
  if (!unlocked) return;
  const board = ensureSoundBoard();
  if (!board) return;
  const audio = board[name];
  if (muted && !force) return;
  try {
    audio.currentTime = 0;
    void audio.play();
  } catch {
    // Intentionally silent: audio can fail on some browsers before user gesture.
  }
}

export function playAmbientHum() {
  if (!unlocked || muted) return;
  const board = ensureSoundBoard();
  if (!board) return;
  const audio = board.hum;
  if (audio.paused) {
    audio.volume = Number(audio.dataset.baseVolume || "0.18");
    void audio.play().catch(() => undefined);
  }
}

