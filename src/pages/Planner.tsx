import React, { useState } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { initialPlannerBlocks } from '../utils/mockData';
import { loadFromStorage, saveToStorage } from '../utils/storage';
import { PlannerTimeBlock } from '../types';
import { Calendar, Clock, Plus, CheckCircle, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { getFormattedHeaderDate } from '../utils/date';

const STORAGE_KEY = 'daylight_planner_v1';

export const Planner: React.FC = () => {
  const [blocks, setBlocks] = useState<PlannerTimeBlock[]>(() => {
    return loadFromStorage<PlannerTimeBlock[]>(STORAGE_KEY, initialPlannerBlocks);
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState('09:00 AM');
  const [endTime, setEndTime] = useState('10:00 AM');
  const [category, setCategory] = useState('Focus');

  const handleAddBlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newBlock: PlannerTimeBlock = {
      id: `plan-${Date.now()}`,
      title: title.trim(),
      startTime,
      endTime,
      category,
      color: 'bg-blue-50 text-blue-700 border-blue-200',
    };

    const updated = [...blocks, newBlock];
    setBlocks(updated);
    saveToStorage(STORAGE_KEY, updated);

    setTitle('');
    setIsModalOpen(false);
  };

  const toggleCompleted = (id: string) => {
    const updated = blocks.map((b) =>
      b.id === id ? { ...b, completed: !b.completed } : b
    );
    setBlocks(updated);
    saveToStorage(STORAGE_KEY, updated);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1d1d1f]">
            Daily Planner & Time Blocks
          </h1>
          <p className="text-sm text-[#6e6e73] mt-1">
            Structure your hours with intentional deep work sprints and deliberate rest.
          </p>
        </div>

        <Button
          onClick={() => setIsModalOpen(true)}
          size="md"
          icon={<Plus className="w-4 h-4" />}
          className="shadow-sm self-start sm:self-auto"
        >
          Add Time Block
        </Button>
      </div>

      {/* Date Navigation Strip */}
      <Card className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#0071e3] flex items-center justify-center">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-[#1d1d1f]">
              {getFormattedHeaderDate()}
            </h3>
            <p className="text-xs text-[#86868b]">6 schedule segments mapped</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button className="p-1.5 rounded-lg border border-black/[0.08] text-[#86868b] hover:bg-[#f5f5f7]">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-semibold px-2 text-[#0071e3]">Today</span>
          <button className="p-1.5 rounded-lg border border-black/[0.08] text-[#86868b] hover:bg-[#f5f5f7]">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </Card>

      {/* Time Block Timeline */}
      <div className="space-y-3.5">
        {blocks.map((block) => (
          <div
            key={block.id}
            className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
              block.isCurrent
                ? 'bg-blue-50/40 border-[#0071e3]/40 shadow-sm ring-1 ring-[#0071e3]/30'
                : 'bg-white border-black/[0.06] hover:border-black/[0.12]'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#f5f5f7] flex flex-col items-center justify-center shrink-0 border border-black/[0.04]">
                <Clock className="w-4 h-4 text-[#86868b]" />
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-mono font-bold text-[#0071e3]">
                    {block.startTime} – {block.endTime}
                  </span>
                  {block.isCurrent && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#0071e3] text-white">
                      <Sparkles className="w-2.5 h-2.5" /> In Progress
                    </span>
                  )}
                </div>

                <h4
                  className={`text-base font-semibold mt-0.5 ${
                    block.completed ? 'line-through text-[#86868b]' : 'text-[#1d1d1f]'
                  }`}
                >
                  {block.title}
                </h4>

                <span className="inline-block mt-1 text-[11px] font-medium text-[#6e6e73]">
                  Category: {block.category}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <Button
                variant={block.completed ? 'secondary' : 'primary'}
                size="sm"
                onClick={() => toggleCompleted(block.id)}
                icon={<CheckCircle className="w-3.5 h-3.5" />}
              >
                {block.completed ? 'Done' : 'Mark Done'}
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Time Block Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="New Planner Time Block"
        subtitle="Carve out intentional blocks for your calendar."
      >
        <form onSubmit={handleAddBlock} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#6e6e73] mb-1.5">
              Block Title
            </label>
            <input
              type="text"
              required
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Deep Work: System Architecture"
              className="w-full px-3.5 py-2.5 rounded-xl border border-black/[0.08] bg-[#fbfbfd] text-sm text-[#1d1d1f] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#6e6e73] mb-1.5">
                Start Time
              </label>
              <input
                type="text"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                placeholder="09:00 AM"
                className="w-full px-3 py-2 rounded-xl border border-black/[0.08] bg-[#fbfbfd] text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#6e6e73] mb-1.5">
                End Time
              </label>
              <input
                type="text"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                placeholder="10:30 AM"
                className="w-full px-3 py-2 rounded-xl border border-black/[0.08] bg-[#fbfbfd] text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#6e6e73] mb-1.5">
              Category
            </label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Focus, Team, Personal, etc."
              className="w-full px-3.5 py-2 rounded-xl border border-black/[0.08] bg-[#fbfbfd] text-sm"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-black/[0.06]">
            <Button type="button" variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Save Block
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
