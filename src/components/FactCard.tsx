import React, { useState } from 'react';
import {
  Sparkles,
  Shuffle,
  Copy,
  Check,
  BookOpen,
  Share2,
  TreePine,
  History,
  Compass,
  Quote,
  X,
} from 'lucide-react';
import { DailyFact, FactCategory } from '../types';
import { DAILY_FACTS } from '../data/dailyFacts';

export const FactCard: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<FactCategory | 'all'>('all');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Filtered facts
  const filteredFacts =
    selectedCategory === 'all'
      ? DAILY_FACTS
      : DAILY_FACTS.filter((f) => f.category === selectedCategory);

  const activeFact = filteredFacts[currentIndex % filteredFacts.length] || DAILY_FACTS[0];

  const handleNextFact = () => {
    setCurrentIndex((prev) => (prev + 1) % filteredFacts.length);
  };

  const handleCopyFact = () => {
    const text = `${activeFact.title}\n\n${activeFact.snippet}\n\n${activeFact.detail}\n— ${activeFact.sourceOrAuthor || 'Сьогодні'}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getCategoryIcon = (cat: FactCategory) => {
    switch (cat) {
      case 'nature':
        return <TreePine className="w-3.5 h-3.5 text-emerald-300" />;
      case 'history':
        return <History className="w-3.5 h-3.5 text-amber-300" />;
      case 'word':
        return <BookOpen className="w-3.5 h-3.5 text-sky-300" />;
      case 'quote':
        return <Quote className="w-3.5 h-3.5 text-rose-300" />;
      default:
        return <Sparkles className="w-3.5 h-3.5 text-amber-300" />;
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-5 md:p-6 transition-all duration-300 flex flex-col justify-between h-full">
      <div>
        {/* Header & Category Switcher */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            {getCategoryIcon(activeFact.category)}
            <span className="text-xs uppercase tracking-wider text-amber-200 font-semibold">
              {activeFact.categoryLabel}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleCopyFact}
              className="p-1.5 glass-pill rounded-lg text-stone-300 hover:text-white transition-colors cursor-pointer"
              title="Скопіювати факт"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={handleNextFact}
              className="flex items-center gap-1 px-2.5 py-1.5 glass-pill rounded-lg text-xs text-stone-200 hover:text-white hover:bg-white/15 transition-colors cursor-pointer"
              title="Інший факт"
            >
              <Shuffle className="w-3.5 h-3.5 text-amber-400" />
              <span>Ще</span>
            </button>
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="mt-3 flex items-center gap-1 p-1 bg-white/5 rounded-xl overflow-x-auto no-scrollbar">
          <button
            onClick={() => {
              setSelectedCategory('all');
              setCurrentIndex(0);
            }}
            className={`px-2.5 py-1 text-xs rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-white/20 text-white font-medium shadow-sm'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Всі
          </button>
          <button
            onClick={() => {
              setSelectedCategory('nature');
              setCurrentIndex(0);
            }}
            className={`px-2.5 py-1 text-xs rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
              selectedCategory === 'nature'
                ? 'bg-white/20 text-white font-medium shadow-sm'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Природа
          </button>
          <button
            onClick={() => {
              setSelectedCategory('history');
              setCurrentIndex(0);
            }}
            className={`px-2.5 py-1 text-xs rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
              selectedCategory === 'history'
                ? 'bg-white/20 text-white font-medium shadow-sm'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Історія
          </button>
          <button
            onClick={() => {
              setSelectedCategory('word');
              setCurrentIndex(0);
            }}
            className={`px-2.5 py-1 text-xs rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
              selectedCategory === 'word'
                ? 'bg-white/20 text-white font-medium shadow-sm'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Слово дня
          </button>
          <button
            onClick={() => {
              setSelectedCategory('quote');
              setCurrentIndex(0);
            }}
            className={`px-2.5 py-1 text-xs rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
              selectedCategory === 'quote'
                ? 'bg-white/20 text-white font-medium shadow-sm'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Думка
          </button>
        </div>

        {/* Fact Main Content */}
        <div className="mt-4">
          <h3 className="text-base sm:text-lg font-semibold text-stone-100 font-serif-display tracking-tight leading-snug line-clamp-2">
            {activeFact.title}
          </h3>

          <p className="mt-2 text-xs sm:text-sm text-stone-300 leading-relaxed font-sans line-clamp-3">
            {activeFact.snippet}
          </p>

          <p className="mt-2.5 text-xs text-stone-400/90 leading-relaxed line-clamp-2 italic">
            "{activeFact.detail}"
          </p>
        </div>
      </div>

      {/* Footer Metadata & Read More */}
      <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-stone-400">
        <div className="flex items-center gap-1.5 truncate max-w-[200px]">
          <span>{activeFact.tag}</span>
          {activeFact.sourceOrAuthor && (
            <>
              <span aria-hidden="true">·</span>
              <span className="text-stone-300 truncate">{activeFact.sourceOrAuthor}</span>
            </>
          )}
        </div>

        <button
          onClick={() => setIsDetailModalOpen(true)}
          className="text-amber-300 hover:text-amber-200 transition-colors font-medium text-xs whitespace-nowrap cursor-pointer hover:underline"
        >
          Читати повністю →
        </button>
      </div>

      {/* Fact Full Detail Modal */}
      {isDetailModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-stone-900 border border-white/15 rounded-2xl p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                {getCategoryIcon(activeFact.category)}
                <span className="text-xs font-semibold uppercase tracking-wider text-amber-300">
                  {activeFact.categoryLabel}
                </span>
              </div>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <h2 className="text-xl font-bold font-serif-display text-white">
                {activeFact.title}
              </h2>

              <p className="text-sm font-medium text-amber-200/90 leading-relaxed bg-amber-500/10 p-3 rounded-xl border border-amber-500/20">
                {activeFact.snippet}
              </p>

              <div className="text-sm text-stone-300 leading-relaxed space-y-2">
                <p>{activeFact.detail}</p>
              </div>

              {activeFact.sourceOrAuthor && (
                <div className="pt-2 text-xs text-stone-400 flex items-center gap-2 border-t border-white/10">
                  <span>Джерело / Автор:</span>
                  <span className="text-stone-200 font-medium">{activeFact.sourceOrAuthor}</span>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={handleCopyFact}
                className="flex items-center gap-1.5 px-3 py-1.5 glass-pill rounded-lg text-xs text-stone-200 hover:text-white cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Скопійовано' : 'Копіювати'}</span>
              </button>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
              >
                Зрозуміло
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
