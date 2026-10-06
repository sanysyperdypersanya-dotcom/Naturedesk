import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Repeat,
  Shuffle,
  Music,
  Upload,
  Disc,
} from 'lucide-react';

import carpathianMistImg from '../assets/images/nature_carpathian_mist_1791017301227.jpg';
import auroraFjordImg from '../assets/images/nature_aurora_fjord_1791286012564.jpg';
import sakuraFujiImg from '../assets/images/nature_sakura_fuji_1791286048687.jpg';
import milkywayDolomitesImg from '../assets/images/nature_milkyway_dolomites_1791286025182.jpg';
import autumnWoodlandImg from '../assets/images/nature_autumn_woodland_1791017375226.jpg';
import oceanCoastlineImg from '../assets/images/nature_ocean_coastline_1791017386994.jpg';

export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  album: string;
  coverSrc: string;
  durationSec: number;
  accentColor: string;
  // Frequencies (Hz) for generative ambient chord arpeggios when no external file is attached
  notes: number[];
  tempoMs: number;
  waveType: OscillatorType;
  customAudioUrl?: string;
}

const DEFAULT_TRACKS: MusicTrack[] = [
  {
    id: 'carpathian-dawn',
    title: 'Світанок у Карпатах (Lo-Fi Ambient)',
    artist: 'NatureDesk Studio',
    album: 'Гірська Тиша',
    coverSrc: carpathianMistImg,
    durationSec: 198,
    accentColor: '#fbbf24',
    // Fmaj7 -> Am7 warm pentatonic frequencies
    notes: [174.61, 220.0, 261.63, 329.63, 392.0, 440.0, 523.25, 329.63],
    tempoMs: 680,
    waveType: 'sine',
  },
  {
    id: 'northern-aurora',
    title: 'Сяйво Північного Неба',
    artist: 'Nordic Horizon',
    album: 'Полярна Ніч',
    coverSrc: auroraFjordImg,
    durationSec: 224,
    accentColor: '#34d399',
    // D minor 9 ethereal pad arpeggio
    notes: [146.83, 220.0, 261.63, 329.63, 349.23, 440.0, 523.25, 349.23],
    tempoMs: 760,
    waveType: 'triangle',
  },
  {
    id: 'sakura-breeze',
    title: 'Дихання Весняної Сакури',
    artist: 'Kyoto Acoustic',
    album: 'Тихе Озеро',
    coverSrc: sakuraFujiImg,
    durationSec: 185,
    accentColor: '#f472b6',
    // Japanese Hirajoshi-inspired soothing scale
    notes: [220.0, 246.94, 261.63, 329.63, 349.23, 440.0, 493.88, 329.63],
    tempoMs: 620,
    waveType: 'sine',
  },
  {
    id: 'cosmic-milkyway',
    title: 'Одіссея Чумацького Шляху',
    artist: 'Astra Ensemble',
    album: 'Зоряний Пил',
    coverSrc: milkywayDolomitesImg,
    durationSec: 242,
    accentColor: '#818cf8',
    // Deep Cmaj9 space chords
    notes: [130.81, 196.0, 246.94, 293.66, 329.63, 392.0, 493.88, 293.66],
    tempoMs: 820,
    waveType: 'sine',
  },
  {
    id: 'autumn-leaves-piano',
    title: 'Золотий Листопад (Акустика)',
    artist: 'Лісова Мелодія',
    album: 'Осінні Барви',
    coverSrc: autumnWoodlandImg,
    durationSec: 210,
    accentColor: '#f59e0b',
    // G major warm pastoral arpeggio
    notes: [196.0, 246.94, 293.66, 369.99, 392.0, 493.88, 587.33, 392.0],
    tempoMs: 650,
    waveType: 'triangle',
  },
  {
    id: 'ocean-sunset-waves',
    title: 'Оксамитовий Прибій',
    artist: 'Coastline Dreams',
    album: 'Вечірній Бриз',
    coverSrc: oceanCoastlineImg,
    durationSec: 204,
    accentColor: '#fb7185',
    // Ebmaj7 warm sunset chords
    notes: [155.56, 233.08, 293.66, 349.23, 392.0, 466.16, 587.33, 349.23],
    tempoMs: 720,
    waveType: 'sine',
  },
];

interface MusicPlayerWidgetProps {
  onPlaybackChange?: (isPlaying: boolean, trackTitle: string) => void;
}

export const MusicPlayerWidget: React.FC<MusicPlayerWidgetProps> = ({ onPlaybackChange }) => {
  const [tracks, setTracks] = useState<MusicTrack[]>(DEFAULT_TRACKS);
  const [currentTrackIdx, setCurrentTrackIdx] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [volume, setVolume] = useState<number>(0.65);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isShuffle, setIsShuffle] = useState<boolean>(false);
  const [isRepeat, setIsRepeat] = useState<boolean>(false);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const stepTimerRef = useRef<number | null>(null);
  const noteStepRef = useRef<number>(0);
  const htmlAudioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const currentTrack = tracks[currentTrackIdx] || tracks[0];

  const formatTime = (sec: number) => {
    const s = Math.max(0, Math.floor(sec));
    const mins = Math.floor(s / 60);
    const rem = s % 60;
    return `${String(mins).padStart(2, '0')}:${String(rem).padStart(2, '0')}`;
  };

  const onPlaybackChangeRef = useRef(onPlaybackChange);
  onPlaybackChangeRef.current = onPlaybackChange;

  // Notify parent for collapsed widget summary
  useEffect(() => {
    if (onPlaybackChangeRef.current && currentTrack) {
      onPlaybackChangeRef.current(isPlaying, currentTrack.title);
    }
  }, [isPlaying, currentTrack.title]);

  // Stop generative synth
  const stopSynth = useCallback(() => {
    if (stepTimerRef.current !== null) {
      window.clearInterval(stepTimerRef.current);
      stepTimerRef.current = null;
    }
  }, []);

  // Play a single warm ambient note with soft attack & long reverb-like release
  const triggerAmbientNote = useCallback(
    (freq: number, waveType: OscillatorType) => {
      if (isMuted || volume <= 0.01) return;
      if (!audioCtxRef.current) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const now = ctx.currentTime;

      // Primary tone
      const osc = ctx.createOscillator();
      const subOsc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const env = ctx.createGain();

      osc.type = waveType;
      osc.frequency.setValueAtTime(freq, now);

      // Warm sub-octave harmonic
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(freq * 0.5, now);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1100, now);

      const peakGain = (isMuted ? 0 : volume) * 0.14;
      env.gain.setValueAtTime(0.0001, now);
      env.gain.linearRampToValueAtTime(peakGain, now + 0.18);
      env.gain.exponentialRampToValueAtTime(0.0001, now + 2.4);

      osc.connect(filter);
      subOsc.connect(filter);
      filter.connect(env);
      env.connect(ctx.destination);

      osc.start(now);
      subOsc.start(now);
      osc.stop(now + 2.5);
      subOsc.stop(now + 2.5);
    },
    [volume, isMuted]
  );

  const handleNextTrack = useCallback(() => {
    setCurrentTime(0);
    setCurrentTrackIdx((prev) => {
      if (isShuffle && tracks.length > 1) {
        let next = Math.floor(Math.random() * tracks.length);
        if (next === prev) next = (prev + 1) % tracks.length;
        return next;
      }
      return (prev + 1) % tracks.length;
    });
  }, [isShuffle, tracks.length]);

  const handlePrevTrack = useCallback(() => {
    if (currentTime > 5) {
      setCurrentTime(0);
      if (htmlAudioRef.current) htmlAudioRef.current.currentTime = 0;
      return;
    }
    setCurrentTime(0);
    setCurrentTrackIdx((prev) => (prev - 1 + tracks.length) % tracks.length);
  }, [currentTime, tracks.length]);

  // Manage generative synth or custom HTML5 audio playback
  useEffect(() => {
    stopSynth();

    if (currentTrack.customAudioUrl) {
      if (!htmlAudioRef.current) {
        htmlAudioRef.current = new Audio();
      }
      const audio = htmlAudioRef.current;
      if (audio.src !== currentTrack.customAudioUrl) {
        audio.src = currentTrack.customAudioUrl;
      }
      audio.volume = isMuted ? 0 : volume;
      if (isPlaying) {
        audio.play().catch(() => {});
      } else {
        audio.pause();
      }
      return;
    } else if (htmlAudioRef.current) {
      htmlAudioRef.current.pause();
    }

    if (isPlaying) {
      // Play first note immediately
      const notes = currentTrack.notes;
      triggerAmbientNote(notes[noteStepRef.current % notes.length], currentTrack.waveType);

      stepTimerRef.current = window.setInterval(() => {
        noteStepRef.current = (noteStepRef.current + 1) % notes.length;
        const noteFreq = notes[noteStepRef.current];
        triggerAmbientNote(noteFreq, currentTrack.waveType);
      }, currentTrack.tempoMs);
    }

    return () => stopSynth();
  }, [isPlaying, currentTrack, triggerAmbientNote, stopSynth, volume, isMuted]);

  // Progress timer for track timeline
  useEffect(() => {
    if (!isPlaying) return;

    const timer = window.setInterval(() => {
      if (currentTrack.customAudioUrl && htmlAudioRef.current) {
        const cur = htmlAudioRef.current.currentTime;
        const dur = htmlAudioRef.current.duration || currentTrack.durationSec;
        if (cur >= dur - 0.5) {
          if (isRepeat) {
            htmlAudioRef.current.currentTime = 0;
            htmlAudioRef.current.play().catch(() => {});
          } else {
            handleNextTrack();
          }
        } else {
          setCurrentTime(cur);
        }
        return;
      }

      setCurrentTime((prev) => {
        if (prev + 1 >= currentTrack.durationSec) {
          if (isRepeat) {
            return 0;
          }
          handleNextTrack();
          return 0;
        }
        return prev + 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [isPlaying, currentTrack, isRepeat, handleNextTrack]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopSynth();
      if (htmlAudioRef.current) {
        htmlAudioRef.current.pause();
      }
    };
  }, [stopSynth]);

  const handleUploadAudio = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const cleanName = file.name.replace(/\.[^/.]+$/, '');
    const customTrack: MusicTrack = {
      id: `custom-${Date.now()}`,
      title: cleanName,
      artist: 'Локальний аудіофайл',
      album: 'Моя колекція',
      coverSrc: auroraFjordImg,
      durationSec: 210,
      accentColor: '#38bdf8',
      notes: [261.63, 329.63, 392.0, 523.25],
      tempoMs: 700,
      waveType: 'sine',
      customAudioUrl: url,
    };
    setTracks((prev) => [customTrack, ...prev]);
    setCurrentTrackIdx(0);
    setCurrentTime(0);
    setIsPlaying(true);
  };

  const progressPct = Math.min(
    100,
    Math.max(0, (currentTime / Math.max(1, currentTrack.durationSec)) * 100)
  );

  return (
    <div className="glass-panel rounded-2xl p-5 md:p-6 transition-all duration-300 flex flex-col justify-between h-full">
      <div>
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Music className="w-4 h-4 text-amber-300 shrink-0" />
            <h3 className="text-sm font-semibold text-white truncate">
              Музичний плеєр · Мелодії природи та Lo-Fi
            </h3>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              onChange={handleUploadAudio}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium glass-pill text-stone-300 hover:text-white hover:bg-white/15 transition-colors cursor-pointer"
              title="Завантажити власний MP3/WAV трек із пристрою"
            >
              <Upload className="w-3 h-3 text-amber-300" />
              <span>Свій трек</span>
            </button>
          </div>
        </div>

        {/* Cover Art + Song Metadata + Controls */}
        <div className="mt-4 flex flex-col sm:flex-row items-center gap-5">
          {/* Album Cover with Vinyl Disc & Equalizer Overlay */}
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 shrink-0 group">
            {/* Subtle Spinning Vinyl Rim behind cover */}
            <div
              className={`absolute -right-3 top-2 bottom-2 w-24 rounded-full bg-stone-900 border border-white/20 shadow-lg flex items-center justify-center transition-transform duration-700 ${
                isPlaying ? 'translate-x-2 animate-spin' : 'translate-x-0'
              }`}
              style={{ animationDuration: '9s' }}
            >
              <Disc className="w-8 h-8 text-stone-600" />
            </div>

            {/* Album Cover Image */}
            <div className="relative w-full h-full rounded-2xl overflow-hidden border border-white/20 shadow-xl bg-stone-900">
              <img
                src={currentTrack.coverSrc}
                alt={currentTrack.title}
                referrerPolicy="no-referrer"
                className={`w-full h-full object-cover transition-transform duration-700 ${
                  isPlaying ? 'scale-105' : 'scale-100'
                }`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />

              {/* Animated Equalizer Bars when playing */}
              <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-end justify-between">
                <div className="flex items-end gap-1 h-4">
                  {[0.55, 0.95, 0.7, 1.0, 0.6].map((h, i) => (
                    <span
                      key={i}
                      className="w-1 rounded-full bg-amber-300 transition-all duration-300"
                      style={{
                        height: isPlaying ? `${Math.round(h * 16)}px` : '3px',
                        animation: isPlaying
                          ? `svgSunPulse ${0.55 + i * 0.14}s ease-in-out infinite`
                          : 'none',
                      }}
                    />
                  ))}
                </div>
                <span className="text-[10px] font-data-mono text-stone-200">
                  {isPlaying ? 'Грає' : 'Пауза'}
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Track Title, Artist, Progress Bar & Transport Buttons */}
          <div className="flex-1 w-full min-w-0 text-center sm:text-left">
            <div className="text-[11px] text-amber-300/90 font-medium truncate">
              {currentTrack.album} · {currentTrack.artist}
            </div>
            <h4 className="text-base sm:text-lg font-semibold text-white font-serif-display tracking-wide truncate mt-0.5">
              {currentTrack.title}
            </h4>

            {/* Timeline Scrubber */}
            <div className="mt-3">
              <input
                type="range"
                min={0}
                max={currentTrack.durationSec}
                value={Math.floor(currentTime)}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setCurrentTime(val);
                  if (htmlAudioRef.current && currentTrack.customAudioUrl) {
                    htmlAudioRef.current.currentTime = val;
                  }
                }}
                aria-label="Позиція треку"
                className="w-full accent-amber-400 cursor-pointer h-1.5"
              />
              <div className="flex items-center justify-between text-[11px] text-stone-400 font-data-mono mt-0.5">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(currentTrack.durationSec)}</span>
              </div>
            </div>

            {/* Playback Controls Bar (Play/Pause, Prev, Next, Shuffle, Repeat, Volume) */}
            <div className="mt-2.5 flex flex-wrap items-center justify-center sm:justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsShuffle(!isShuffle)}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    isShuffle
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
                      : 'text-stone-400 hover:text-white'
                  }`}
                  title="Випадковий порядок"
                  aria-label="Випадковий порядок"
                >
                  <Shuffle className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={handlePrevTrack}
                  className="p-2 rounded-xl glass-pill text-stone-200 hover:text-white hover:bg-white/15 transition-colors cursor-pointer"
                  title="Попередній трек"
                  aria-label="Попередній трек"
                >
                  <SkipBack className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
                  title={isPlaying ? 'Пауза' : 'Відтворити'}
                  aria-label={isPlaying ? 'Пауза' : 'Відтворити'}
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-4 h-4 fill-current" />
                      <span>Пауза</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-current" />
                      <span>Грати</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleNextTrack}
                  className="p-2 rounded-xl glass-pill text-stone-200 hover:text-white hover:bg-white/15 transition-colors cursor-pointer"
                  title="Наступний трек"
                  aria-label="Наступний трек"
                >
                  <SkipForward className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => setIsRepeat(!isRepeat)}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    isRepeat
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
                      : 'text-stone-400 hover:text-white'
                  }`}
                  title="Повторювати трек"
                  aria-label="Повторювати трек"
                >
                  <Repeat className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Volume Control */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsMuted(!isMuted)}
                  className="p-1 text-stone-400 hover:text-white cursor-pointer"
                  title={isMuted ? 'Увімкнути звук' : 'Вимкнути звук'}
                  aria-label={isMuted ? 'Увімкнути звук' : 'Вимкнути звук'}
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-4 h-4 text-rose-300" />
                  ) : (
                    <Volume2 className="w-4 h-4 text-stone-300" />
                  )}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={isMuted ? 0 : volume}
                  onChange={(e) => {
                    setIsMuted(false);
                    setVolume(parseFloat(e.target.value));
                  }}
                  aria-label="Гучність плеєра"
                  className="w-20 accent-amber-400 cursor-pointer h-1"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Compact Track Playlist Selector */}
      <div className="mt-4 pt-3 border-t border-white/10">
        <div className="text-[11px] text-stone-400 mb-2">Плейлист спокою ({tracks.length} композицій):</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-32 overflow-y-auto pr-1">
          {tracks.map((tr, idx) => {
            const active = idx === currentTrackIdx;
            return (
              <button
                key={tr.id}
                type="button"
                onClick={() => {
                  setCurrentTrackIdx(idx);
                  setCurrentTime(0);
                  setIsPlaying(true);
                }}
                className={`flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-xl border text-left transition-all cursor-pointer ${
                  active
                    ? 'bg-amber-500/20 border-amber-400/45 text-white'
                    : 'bg-white/5 border-white/5 text-stone-300 hover:border-white/15 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <img
                    src={tr.coverSrc}
                    alt={tr.title}
                    referrerPolicy="no-referrer"
                    className="w-7 h-7 rounded-md object-cover shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="text-xs font-medium truncate">{tr.title}</div>
                    <div className="text-[10px] text-stone-400 truncate">{tr.artist}</div>
                  </div>
                </div>
                <span className="text-[10px] font-data-mono text-stone-400 shrink-0">
                  {formatTime(tr.durationSec)}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
