import React, { useState, useEffect } from 'react';
import { CheckCircle2, Circle, Plus, Trash2, Target, Sparkles } from 'lucide-react';
import { DailyIntention } from '../types';

export const DailyIntentions: React.FC = () => {
  const [intentions, setIntentions] = useState<DailyIntention[]>(() => {
    try {
      const saved = localStorage.getItem('today_intentions');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      { id: '1', text: 'Прогулятися на свіжому повітрі хоча б 20 хвилин', completed: false, createdAt: Date.now() },
      { id: '2', text: 'Зробити одну важливу справу без поспіху', completed: false, createdAt: Date.now() },
      { id: '3', text: 'Подякувати близькій людині за підтримку', completed: false, createdAt: Date.now() },
    ];
  });

  const [newText, setNewText] = useState('');

  useEffect(() => {
    try {
      localStorage.setItem('today_intentions', JSON.stringify(intentions));
    } catch {}
  }, [intentions]);

  const toggleComplete = (id: string) => {
    setIntentions((prev) =>
      prev.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item))
    );
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim()) return;
    const newItem: DailyIntention = {
      id: Date.now().toString(),
      text: newText.trim(),
      completed: false,
      createdAt: Date.now(),
    };
    setIntentions((prev) => [...prev, newItem]);
    setNewText('');
  };

  const handleDelete = (id: string) => {
    setIntentions((prev) => prev.filter((item) => item.id !== id));
  };

  const completedCount = intentions.filter((i) => i.completed).length;

  return (
    <div className="glass-panel rounded-2xl p-5 md:p-6 transition-all duration-300 flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-amber-300" />
            <h3 className="text-sm font-semibold text-white">Фокус та наміри дня</h3>
          </div>
          <div className="text-xs text-stone-300 font-data-mono">
            {completedCount} / {intentions.length} виконано
          </div>
        </div>

        {/* List of Intentions */}
        <div className="mt-3 space-y-2 max-h-56 overflow-y-auto pr-1">
          {intentions.map((item) => (
            <div
              key={item.id}
              className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                item.completed
                  ? 'bg-emerald-950/20 border-emerald-500/20 text-stone-400'
                  : 'bg-white/5 border-white/5 hover:border-white/15 text-stone-200'
              }`}
            >
              <button
                onClick={() => toggleComplete(item.id)}
                className="flex items-center gap-2.5 text-left flex-1 min-w-0 cursor-pointer"
              >
                {item.completed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <Circle className="w-4 h-4 text-stone-400 hover:text-amber-300 shrink-0" />
                )}
                <span
                  className={`text-xs sm:text-sm truncate ${
                    item.completed ? 'line-through text-stone-400' : 'text-stone-200'
                  }`}
                >
                  {item.text}
                </span>
              </button>

              <button
                onClick={() => handleDelete(item.id)}
                className="p-1 rounded text-stone-500 hover:text-rose-400 transition-colors ml-2 cursor-pointer"
                title="Видалити"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}

          {intentions.length === 0 && (
            <div className="py-6 text-center text-xs text-stone-400">
              На сьогодні ще немає записів. Додайте намір для гарного початку дня!
            </div>
          )}
        </div>
      </div>

      {/* Add New Input */}
      <form onSubmit={handleAdd} className="mt-4 pt-3 border-t border-white/10 flex gap-2">
        <input
          type="text"
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          placeholder="Додати свій намір на сьогодні..."
          className="flex-1 px-3 py-1.5 rounded-xl bg-white/10 border border-white/15 text-xs text-white placeholder-stone-400 focus:outline-none focus:border-amber-400"
        />
        <button
          type="submit"
          className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-medium text-xs rounded-xl transition-colors cursor-pointer flex items-center gap-1"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Додати</span>
        </button>
      </form>
    </div>
  );
};
