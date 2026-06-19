import { useState, useEffect } from 'react';
import { VolumeX, Volume2 } from 'lucide-react';

// Simple global sound manager (placeholder implementation)
let sounds: Record<string, HTMLAudioElement> | null = null;

export default function SoundToggle() {
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && !sounds) {
      sounds = {
        tick: new window.Audio('/sounds/tick.mp3'),
        whoosh: new window.Audio('/sounds/whoosh.mp3'),
        chime: new window.Audio('/sounds/chime.mp3'),
        hum: new window.Audio('/sounds/hum.mp3')
      };
    }
  }, []);

  useEffect(() => {
    if (sounds) {
      Object.values(sounds).forEach(audio => {
        audio.volume = muted ? 0 : 0.5;
      });
    }
  }, [muted]);

  const toggleMute = () => setMuted(prev => !prev);

  return (
    <button
      onClick={toggleMute}
      className="flex items-center gap-1 rounded-lg bg-white/5 px-2 py-1 text-slate-400 hover:text-slate-200"
    >
      {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
      <span className="text-xs">{muted ? 'Unmute' : 'Mute'}</span>
    </button>
  );
}
