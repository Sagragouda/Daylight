import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useHabits } from '../../context/HabitContext';
import { Sparkles, Droplets, BookOpen, Activity, Flame, Check } from 'lucide-react';

interface HabitCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AVAILABLE_ICONS = [
  { name: 'Sparkles', label: 'Mindfulness', icon: Sparkles },
  { name: 'Droplets', label: 'Health', icon: Droplets },
  { name: 'BookOpen', label: 'Learning', icon: BookOpen },
  { name: 'Activity', label: 'Fitness', icon: Activity },
  { name: 'Flame', label: 'Energy', icon: Flame },
];

const COLORS = ['#0071e3', '#0ea5e9', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899'];

export const HabitCreateModal: React.FC<HabitCreateModalProps> = ({ isOpen, onClose }) => {
  const { addHabit } = useHabits();

  const [name, setName] = useState('');
  const [category, setCategory] = useState('Mindfulness');
  const [iconName, setIconName] = useState('Sparkles');
  const [color, setColor] = useState('#0071e3');
  const [frequency, setFrequency] = useState('Daily');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addHabit({
      name,
      category,
      iconName,
      color,
      frequency,
    });

    setName('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Habit"
      subtitle="Anchor tiny daily routines that compound over time."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#6e6e73] mb-1.5">
            Habit Name
          </label>
          <input
            type="text"
            required
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. 10-minute morning breathwork"
            className="w-full px-3.5 py-2.5 rounded-xl border border-black/[0.08] bg-[#fbfbfd] text-[#1d1d1f] text-sm focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30 transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#6e6e73] mb-1.5">
            Category
          </label>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Mindfulness, Fitness, Learning, etc."
            className="w-full px-3.5 py-2 rounded-xl border border-black/[0.08] bg-[#fbfbfd] text-sm text-[#1d1d1f] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30 transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#6e6e73] mb-1.5">
            Choose Icon
          </label>
          <div className="flex gap-2">
            {AVAILABLE_ICONS.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  type="button"
                  key={item.name}
                  onClick={() => setIconName(item.name)}
                  className={`flex-1 p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                    iconName === item.name
                      ? 'bg-[#0071e3] text-white border-[#0071e3] shadow-xs'
                      : 'bg-[#fbfbfd] border-black/[0.08] text-[#6e6e73] hover:bg-[#f5f5f7]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-[10px] font-semibold">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#6e6e73] mb-1.5">
            Color Accent
          </label>
          <div className="flex gap-3 items-center">
            {COLORS.map((c) => (
              <button
                type="button"
                key={c}
                onClick={() => setColor(c)}
                className="w-7 h-7 rounded-full flex items-center justify-center transition-transform hover:scale-110 shadow-xs"
                style={{ backgroundColor: c }}
                aria-label={`Select color ${c}`}
              >
                {color === c && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#6e6e73] mb-1.5">
            Target Frequency
          </label>
          <select
            value={frequency}
            onChange={(e) => setFrequency(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-black/[0.08] bg-[#fbfbfd] text-xs font-semibold text-[#1d1d1f] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30"
          >
            <option value="Daily">Daily</option>
            <option value="5x / week">5x / week</option>
            <option value="3x / week">3x / week</option>
            <option value="Weekdays only">Weekdays only</option>
          </select>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-black/[0.06]">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm">
            Save Habit
          </Button>
        </div>
      </form>
    </Modal>
  );
};
