import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useTasks } from '../../context/TaskContext';
import { Priority, TaskCategory } from '../../types';
import { getTodayDateString } from '../../utils/date';
import { Calendar, Clock, Tag, Flag } from 'lucide-react';

interface TaskCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORIES: TaskCategory[] = ['Work', 'Design', 'Personal', 'Health', 'Learning'];
const PRIORITIES: { value: Priority; label: string; color: string }[] = [
  { value: 'low', label: 'Low', color: 'border-blue-200 text-blue-700 bg-blue-50/50' },
  { value: 'medium', label: 'Medium', color: 'border-amber-200 text-amber-700 bg-amber-50/50' },
  { value: 'high', label: 'High', color: 'border-rose-200 text-rose-700 bg-rose-50/50' },
];

export const TaskCreateModal: React.FC<TaskCreateModalProps> = ({ isOpen, onClose }) => {
  const { addTask } = useTasks();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TaskCategory>('Work');
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState(getTodayDateString());
  const [dueTime, setDueTime] = useState('04:00 PM');
  const [estimatedMinutes, setEstimatedMinutes] = useState(25);

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
    });

    // Reset form
    setTitle('');
    setDescription('');
    setCategory('Work');
    setPriority('medium');
    setDueDate(getTodayDateString());
    setDueTime('04:00 PM');
    setEstimatedMinutes(25);
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
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#6e6e73] mb-1.5">
            Task Name
          </label>
          <input
            type="text"
            required
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Design app launch banner"
            className="w-full px-3.5 py-2.5 rounded-xl border border-black/[0.08] bg-[#fbfbfd] text-[#1d1d1f] placeholder:text-[#86868b] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30 focus:border-[#0071e3] transition-all text-sm"
          />
        </div>

        {/* Description Input */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#6e6e73] mb-1.5">
            Notes / Details (Optional)
          </label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add relevant links, context, or sub-steps..."
            className="w-full px-3.5 py-2 rounded-xl border border-black/[0.08] bg-[#fbfbfd] text-[#1d1d1f] placeholder:text-[#86868b] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30 focus:border-[#0071e3] transition-all text-sm resize-none"
          />
        </div>

        {/* Category Selector */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#6e6e73] mb-1.5 flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-[#0071e3]" />
            Category
          </label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                type="button"
                key={cat}
                onClick={() => setCategory(cat)}
                className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${
                  category === cat
                    ? 'bg-[#0071e3] text-white border-[#0071e3] shadow-sm'
                    : 'bg-[#f5f5f7] text-[#6e6e73] border-transparent hover:bg-black/[0.05]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Priority Selector */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#6e6e73] mb-1.5 flex items-center gap-1.5">
            <Flag className="w-3.5 h-3.5 text-[#0071e3]" />
            Priority
          </label>
          <div className="grid grid-cols-3 gap-2">
            {PRIORITIES.map((p) => (
              <button
                type="button"
                key={p.value}
                onClick={() => setPriority(p.value)}
                className={`text-xs py-2 px-3 rounded-xl border font-medium transition-all text-center ${
                  priority === p.value
                    ? `${p.color} border-current ring-1 ring-current font-semibold`
                    : 'bg-[#fbfbfd] border-black/[0.08] text-[#6e6e73] hover:bg-[#f5f5f7]'
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
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#6e6e73] mb-1.5 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[#0071e3]" />
              Due Date
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-black/[0.08] bg-[#fbfbfd] text-xs text-[#1d1d1f] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#6e6e73] mb-1.5 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#0071e3]" />
              Time
            </label>
            <input
              type="text"
              value={dueTime}
              onChange={(e) => setDueTime(e.target.value)}
              placeholder="e.g. 03:00 PM"
              className="w-full px-3 py-2 rounded-xl border border-black/[0.08] bg-[#fbfbfd] text-xs text-[#1d1d1f] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30"
            />
          </div>
        </div>

        {/* Focus Sprint Estimate */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#6e6e73] mb-1.5">
            Pomodoro Sprint Duration: {estimatedMinutes} mins
          </label>
          <div className="flex gap-2">
            {[15, 25, 45, 60].map((mins) => (
              <button
                type="button"
                key={mins}
                onClick={() => setEstimatedMinutes(mins)}
                className={`flex-1 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                  estimatedMinutes === mins
                    ? 'bg-[#0071e3]/10 border-[#0071e3] text-[#0071e3] font-semibold'
                    : 'bg-[#fbfbfd] border-black/[0.08] text-[#6e6e73] hover:bg-[#f5f5f7]'
                }`}
              >
                {mins}m
              </button>
            ))}
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-black/[0.06]">
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
