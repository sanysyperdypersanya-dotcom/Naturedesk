import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Heart } from 'lucide-react';

export const BreathingExercise: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [secondsLeft, setSecondsLeft] = useState(4);
  const [completedCycles, setCompletedCycles] = useState(0);

  useEffect(() => {
    if (!isActive) return;

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev > 1) return prev - 1;

        // Transition phases: 4s inhale -> 7s hold -> 8s exhale
        if (phase === 'inhale') {
          setPhase('hold');
          return 7;
        } else if (phase === 'hold') {
          setPhase('exhale');
          return 8;
        } else {
          setPhase('inhale');
          setCompletedCycles((c) => c + 1);
          return 4;
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, phase]);

  const handleReset = () => {
    setIsActive(false);
    setPhase('inhale');
    setSecondsLeft(4);
  };

  const getPhaseText = () => {
    switch (phase) {
      case 'inhale':
        return 'Вдих через ніс...';
      case 'hold':
        return 'Затримайте дихання...';
      case 'exhale':
        return 'Повільний плавний видих...';
    }
  };

  const getCircleScale = () => {
    if (!isActive) return 'scale-100';
    if (phase === 'inhale') return 'scale-125';
    if (phase === 'hold') return 'scale-125';
    return 'scale-90';
  };

  return (
    <div className="glass-panel rounded-2xl p-5 md:p-6 transition-all duration-300 flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-rose-300" />
            <h3 className="text-sm font-semibold text-white">Хвилина спокою: Дихання 4-7-8</h3>
          </div>
          <span className="text-xs text-stone-400 font-data-mono">
            {completedCycles} {completedCycles === 1 ? 'коло' : 'кіл'}
          </span>
        </div>

        {/* Breathing Circle Container */}
        <div className="my-5 flex flex-col items-center justify-center">
          <div className="relative w-36 h-36 flex items-center justify-center">
            {/* Outer subtle glow ring */}
            <div
              className={`absolute inset-0 rounded-full border border-amber-400/30 transition-transform duration-[3000ms] ease-in-out ${getCircleScale()} ${
                isActive ? 'opacity-100' : 'opacity-40'
              }`}
            />
            {/* Inner pulsing circle */}
            <div
              className={`w-28 h-28 rounded-full flex flex-col items-center justify-center transition-all duration-[3000ms] ease-in-out ${
                phase === 'inhale'
                  ? 'bg-gradient-to-tr from-amber-500/30 to-amber-300/40 text-amber-200'
                  : phase === 'hold'
                  ? 'bg-gradient-to-tr from-emerald-500/30 to-teal-300/40 text-emerald-200'
                  : 'bg-gradient-to-tr from-sky-500/30 to-indigo-300/40 text-sky-200'
              } ${getCircleScale()}`}
            >
              <span className="text-2xl font-bold font-data-mono">{secondsLeft}</span>
              <span className="text-[10px] tracking-wide uppercase font-semibold">
                {phase === 'inhale' ? 'Вдих' : phase === 'hold' ? 'Затримка' : 'Видих'}
              </span>
            </div>
          </div>

          <p className="mt-4 text-xs font-medium text-stone-300 tracking-wide text-center">
            {isActive ? getPhaseText() : 'Зробіть коротку паузу серед краси природи'}
          </p>
        </div>
      </div>

      {/* Action Controls */}
      <div className="pt-3 border-t border-white/10 flex items-center justify-center gap-3">
        <button
          onClick={() => setIsActive(!isActive)}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
            isActive
              ? 'bg-white/15 text-stone-200 hover:bg-white/25'
              : 'bg-amber-500 text-stone-950 hover:bg-amber-400'
          }`}
        >
          {isActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          <span>{isActive ? 'Пауза' : 'Почати вправу'}</span>
        </button>

        {isActive && (
          <button
            onClick={handleReset}
            className="p-1.5 glass-pill rounded-lg text-stone-400 hover:text-white transition-colors cursor-pointer"
            title="Скинути"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
