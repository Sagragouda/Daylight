import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useTasks } from '../../context/TaskContext';
import { Priority, TaskCategory } from '../../types';
import { getTodayDateString } from '../../utils/date';
import { Calendar, Clock, Tag, Flag, Target } from 'lucide-react';
import { useGoals } from '../../context/GoalContext';

interface TaskCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORIES: TaskCategory[] = ['Work', 'Design', 'Personal', 'Health', 'Learning'];
const PRIORITIES: { value: Priority; label: string; color: string }[] = [
  { value: 'low', label: 'Low', color: 'border-blue-200 dark:border-blue-800 text-[#0071e3] dark:text-[#2997ff] bg-blue-50/70 dark:bg-blue-950/50' },
  { value: 'medium', label: 'Medium', color: 'border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 bg-amber-50/70 dark:bg-amber-950/50' },
  { value: 'high', label: 'High', color: 'border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 bg-rose-50/70 dark:bg-rose-950/50' },
];

export const TaskCreateModal: React.FC<TaskCreateModalProps> = ({ isOpen, onClose }) => {
  const { addTask } = useTasks();
  const { goals } = useGoals();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TaskCategory>('Work');
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState(getTodayDateString());
  const [dueTime, setDueTime] = useState('04:00 PM');
  const [estimatedMinutes, setEstimatedMinutes] = useState(25);
  const [goalId, setGoalId] = useState<string>('');

  const activeGoals = goals.filter((g) => g.status === 'active');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addTask({
      title,
      description,
      category,
      priority,
      dueDate,
      dueTime,
      estimatedMinutes,
      goalId: goalId || undefined,
    });

    // Reset form
    setTitle('');
    setDescription('');
    setCategory('Work');
    setPriority('medium');
    setDueDate(getTodayDateString());
    setDueTime('04:00 PM');
    setEstimatedMinutes(25);
    setGoalId('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Task"
      subtitle="Organize your day with clear intent and deliberate focus."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title Input */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#6e6e73] dark:text-[#98989f] mb-1.5">
            Task Name
          </label>
          <input
            type="text"
            required
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Design app launch banner"
            className="w-full px-3.5 py-2.5 rounded-xl border border-black/[0.08] dark:border-white/[0.1] bg-[#fbfbfd] dark:bg-[#1f212f] text-[#1d1d1f] dark:text-[#f5f5f7] placeholder:text-[#86868b] dark:placeholder:text-[#686872] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30 focus:border-[#0071e3] transition-all text-sm"
          />
        </div>

        {/* Description Input */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#6e6e73] dark:text-[#98989f] mb-1.5">
            Notes / Details (Optional)
          </label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add relevant links, context, or sub-steps..."
            className="w-full px-3.5 py-2 rounded-xl border border-black/[0.08] dark:border-white/[0.1] bg-[#fbfbfd] dark:bg-[#1f212f] text-[#1d1d1f] dark:text-[#f5f5f7] placeholder:text-[#86868b] dark:placeholder:text-[#686872] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30 focus:border-[#0071e3] transition-all text-sm resize-none"
          />
        </div>

        {/* Category Selector */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#6e6e73] dark:text-[#98989f] mb-1.5 flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-[#0071e3] dark:text-[#2997ff]" />
            Category
          </label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                type="button"
                key={cat}
                onClick={() => setCategory(cat)}
                className={`text-xs px-3 py-1.5 rounded-xl border font-semibold transition-all ${
                  category === cat
                    ? 'bg-[#0071e3] text-white border-[#0071e3] shadow-xs'
                    : 'bg-[#f5f5f7] dark:bg-white/[0.06] text-[#6e6e73] dark:text-[#d2d2d7] border-transparent hover:bg-black/[0.05] dark:hover:bg-white/[0.1]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Priority Selector */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#6e6e73] dark:text-[#98989f] mb-1.5 flex items-center gap-1.5">
            <Flag className="w-3.5 h-3.5 text-[#0071e3] dark:text-[#2997ff]" />
            Priority
          </label>
          <div className="grid grid-cols-3 gap-2">
            {PRIORITIES.map((p) => (
              <button
                type="button"
                key={p.value}
                onClick={() => setPriority(p.value)}
                className={`text-xs py-2 px-3 rounded-xl border font-semibold transition-all text-center ${
                  priority === p.value
                    ? `${p.color} border-current ring-1 ring-current`
                    : 'bg-[#fbfbfd] dark:bg-[#1f212f] border-black/[0.08] dark:border-white/[0.1] text-[#6e6e73] dark:text-[#d2d2d7] hover:bg-[#f5f5f7] dark:hover:bg-white/[0.06]'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Due Date & Time */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#6e6e73] dark:text-[#98989f] mb-1.5 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[#0071e3] dark:text-[#2997ff]" />
              Due Date
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-black/[0.08] dark:border-white/[0.1] bg-[#fbfbfd] dark:bg-[#1f212f] text-xs text-[#1d1d1f] dark:text-[#f5f5f7] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#6e6e73] dark:text-[#98989f] mb-1.5 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#0071e3] dark:text-[#2997ff]" />
              Time
            </label>
            <input
              type="text"
              value={dueTime}
              onChange={(e) => setDueTime(e.target.value)}
              placeholder="e.g. 03:00 PM"
              className="w-full px-3 py-2 rounded-xl border border-black/[0.08] dark:border-white/[0.1] bg-[#fbfbfd] dark:bg-[#1f212f] text-xs text-[#1d1d1f] dark:text-[#f5f5f7] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30"
            />
          </div>
        </div>

        {/* Optional Linked Goal */}
        {activeGoals.length > 0 && (
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#6e6e73] dark:text-[#98989f] mb-1.5 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-[#0071e3] dark:text-[#2997ff]" />
              Link to Goal (Optional)
            </label>
            <select
              value={goalId}
              onChange={(e) => setGoalId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-black/[0.08] dark:border-white/[0.1] bg-[#fbfbfd] dark:bg-[#1f212f] text-xs text-[#1d1d1f] dark:text-[#f5f5f7] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30"
            >
              <option value="">None (Independent Task)</option>
              {activeGoals.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.title} ({g.category})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Focus Sprint Estimate */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#6e6e73] dark:text-[#98989f] mb-1.5">
            Pomodoro Duration: {estimatedMinutes} mins
          </label>
          <div className="flex gap-2">
            {[15, 25, 45, 60].map((mins) => (
              <button
                type="button"
                key={mins}
                onClick={() => setEstimatedMinutes(mins)}
                className={`flex-1 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                  estimatedMinutes === mins
                    ? 'bg-[#0071e3]/10 dark:bg-[#0071e3]/20 border-[#0071e3] text-[#0071e3] dark:text-[#2997ff]'
                    : 'bg-[#fbfbfd] dark:bg-[#1f212f] border-black/[0.08] dark:border-white/[0.1] text-[#6e6e73] dark:text-[#d2d2d7] hover:bg-[#f5f5f7] dark:hover:bg-white/[0.06]'
                }`}
              >
                {mins}m
              </button>
            ))}
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-black/[0.06] dark:border-white/[0.08]">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm">
            Create Task
          </Button>
        </div>
      </form>
    </Modal>
  );
};
