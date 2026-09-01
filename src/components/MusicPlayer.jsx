import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Music } from 'lucide-react';

export default function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioContextRef = useRef(null);
  const intervalRef = useRef(null);

  // Generatore di melodia romantica celebrativa con Web Audio API (funziona senza dipendere da file esterni)
  const startSynthesizerMusic = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioCtx();
      }

      if (audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
      }

      const ctx = audioContextRef.current;
      
      // Note arpeggiate in scala pentatonica / modo dorico sognante (Pachelbel Canon / Wedding mood)
      // D4, F#4, A4, D5, A4, F#4, B4, D5, G4, B4, D5, G4, A4, C#5, E5, A4
      const notes = [
        293.66, 369.99, 440.00, 587.33, 440.00, 369.99,
        493.88, 587.33, 392.00, 493.88, 587.33, 392.00,
        440.00, 554.37, 659.25, 440.00
      ];
      
      let step = 0;

      const playTone = (freq) => {
        if (!ctx || ctx.state !== 'running') return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        // Morbido attacco e riverbero acustico a campana/carillon
        gain.gain.setValueAtTime(0.001, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.04, ctx.currentTime + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.8);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 1.9);
      };

      intervalRef.current = setInterval(() => {
        playTone(notes[step % notes.length]);
        // Aggiungi un'armonia bassa ogni 4 battute
        if (step % 4 === 0) {
          playTone(notes[step % notes.length] / 2);
        }
        step++;
      }, 550);

      setIsPlaying(true);
    } catch (e) {
      console.warn('Audio playback error', e);
    }
  };

  const stopMusic = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state === 'running') {
      audioContextRef.current.suspend();
    }
    setIsPlaying(false);
  };

  const toggleMusic = () => {
    if (isPlaying) {
      stopMusic();
    } else {
      startSynthesizerMusic();
    }
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, []);

  return (
    <div className="music-player-widget">
      <button
        type="button"
        onClick={toggleMusic}
        className={`btn-music-toggle ${isPlaying ? 'playing' : ''}`}
        title={isPlaying ? 'Disattiva musica di sottofondo' : 'Attiva musica di sottofondo'}
        aria-label="Musica di sottofondo"
      >
        <div className="music-note-icon">
          <Music size={16} className={isPlaying ? 'music-note-animated' : ''} />
        </div>
        {isPlaying ? (
          <>
            <span className="music-label">Musica Attiva</span>
            <Volume2 size={16} />
          </>
        ) : (
          <>
            <span className="music-label">Musica d'Atmosfera</span>
            <VolumeX size={16} />
          </>
        )}
      </button>
    </div>
  );
}
