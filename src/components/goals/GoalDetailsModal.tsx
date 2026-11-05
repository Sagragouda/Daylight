import React, { useState } from 'react';
import { Goal, Milestone } from '../../types';
import { Modal } from '../common/Modal';
import { ProgressBar } from '../common/ProgressBar';
import { MilestoneItem } from './MilestoneItem';
import {
  CATEGORY_CONFIG,
  getGoalIconComponent,
} from './goalIcons';
import {
  CheckCircle2,
  Trash2,
  Edit2,
  Trophy,
  TrendingUp,
} from 'lucide-react';
import { formatFriendlyDate, getTodayDateString } from '../../utils/date';

interface GoalDetailsModalProps {
  goal: Goal | null;
  milestones: Milestone[];
  progress: number;
  isOpen: boolean;
  onClose: () => void;
  onToggleMilestone: (id: string) => void;
  onDeleteMilestone: (id: string) => void;
  onAddMilestone: (title: string, dueDate?: string) => Promise<void>;
  onUpdateMetric: (currentValue: number) => Promise<void>;
  onEditGoal: (goal: Goal) => void;
  onDeleteGoal: (goalId: string) => void;
  onToggleGoalStatus: (goalId: string) => void;
}

export const GoalDetailsModal: React.FC<GoalDetailsModalProps> = ({
  goal,
  milestones,
  progress,
  isOpen,
  onClose,
  onToggleMilestone,
  onDeleteMilestone,
  onAddMilestone,
  onUpdateMetric,
  onEditGoal,
  onDeleteGoal,
  onToggleGoalStatus,
}) => {
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('');
  const [newMilestoneDate, setNewMilestoneDate] = useState('');
  const [isAddingMilestone, setIsAddingMilestone] = useState(false);

  if (!goal) return null;

  const catConfig = CATEGORY_CONFIG[goal.category] || CATEGORY_CONFIG.Other;
  const GoalIcon = getGoalIconComponent(goal.icon);

  const completedMilestones = milestones.filter((m) => m.isCompleted);
  const isCompleted = goal.status === 'completed' || progress === 100;

  const todayStr = getTodayDateString();
  const isOverdue =
    !isCompleted && goal.targetDate && goal.targetDate < todayStr;

  const handleAddMilestoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMilestoneTitle.trim()) return;

    try {
      setIsAddingMilestone(true);
      await onAddMilestone(newMilestoneTitle.trim(), newMilestoneDate || undefined);
      setNewMilestoneTitle('');
      setNewMilestoneDate('');
    } finally {
      setIsAddingMilestone(false);
    }
  };

  const handleQuickAdjust = async (delta: number) => {
    const current = goal.currentValue || 0;
    const nextVal = Math.max(0, current + delta);
    await onUpdateMetric(nextVal);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      maxWidth="lg"
    >
      <div className="space-y-6">
        {/* Top Header Card */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div
              className={`w-13 h-13 rounded-2xl flex items-center justify-center shrink-0 border ${catConfig.bgLight} ${catConfig.bgDark} ${catConfig.border} shadow-sm`}
            >
              <GoalIcon className={`w-6 h-6 ${catConfig.color}`} />
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-xl text-xs font-semibold border ${catConfig.bgLight} ${catConfig.bgDark} ${catConfig.color} ${catConfig.border}`}
                >
                  <catConfig.icon className="w-3.5 h-3.5" />
                  <span>{goal.category}</span>
                </span>

                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-lg border bg-black/[0.04] dark:bg-white/[0.05] border-black/[0.08] dark:border-white/[0.1] text-[#6e6e73] dark:text-[#98989f]">
                  {goal.priority} priority
                </span>

                {isCompleted && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/15 px-2.5 py-0.5 rounded-xl border border-emerald-500/30">
                    <Trophy className="w-3 h-3" />
                    Achieved!
                  </span>
                )}
              </div>

              <h2 className="text-xl font-bold text-[#1d1d1f] dark:text-[#f5f5f7] leading-snug">
                {goal.title}
              </h2>
            </div>
          </div>
        </div>

        {/* Motivation / Description */}
        {goal.description && (
          <div className="p-3.5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.05] dark:border-white/[0.08] text-xs text-[#6e6e73] dark:text-[#98989f]">
            <span className="font-bold text-[#1d1d1f] dark:text-[#f5f5f7] block mb-0.5">
              Motivation:
            </span>
            {goal.description}
          </div>
        )}

        {/* Progress & Target Section */}
        <div className="p-4 rounded-3xl bg-gradient-to-br from-white/90 to-black/[0.02] dark:from-[#1b1d2a] dark:to-[#12131d] border border-black/[0.08] dark:border-white/[0.1] shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold mb-2">
            <span className="text-[#6e6e73] dark:text-[#98989f] flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-[#0071e3]" />
              Progress Tracker
            </span>
            <span className="text-base font-extrabold text-[#0071e3] dark:text-[#2997ff]">
              {progress}%
            </span>
          </div>

          <ProgressBar
            progress={progress}
            size="lg"
            color={
              progress === 100
                ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                : 'bg-gradient-to-r from-[#0071e3] via-[#8b5cf6] to-[#ec4899]'
            }
          />

          {/* Measurable Target Interactive Controls */}
          {goal.trackingType === 'numeric' && (
            <div className="mt-4 pt-3 border-t border-black/[0.06] dark:border-white/[0.08] flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs">
                <span className="text-[#86868b] dark:text-[#98989f]">Target: </span>
                <span className="font-extrabold text-[#1d1d1f] dark:text-[#f5f5f7]">
                  {goal.currentValue || 0} / {goal.targetValue || 0}{' '}
                  {goal.unit || ''}
                </span>
              </div>

              {/* Quick +/- buttons */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleQuickAdjust(-1)}
                  className="px-2.5 py-1 rounded-xl bg-black/[0.05] dark:bg-white/[0.08] text-xs font-bold hover:bg-black/10 dark:hover:bg-white/15 transition-colors"
                >
                  -1
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickAdjust(1)}
                  className="px-2.5 py-1 rounded-xl bg-[#0071e3]/10 dark:bg-[#0071e3]/20 text-[#0071e3] dark:text-[#2997ff] text-xs font-bold hover:bg-[#0071e3]/20 transition-colors"
                >
                  +1
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickAdjust(5)}
                  className="px-2.5 py-1 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-bold hover:bg-purple-500/20 transition-colors"
                >
                  +5
                </button>
              </div>
            </div>
          )}

          {/* Dates footer */}
          <div className="flex items-center justify-between text-xs text-[#86868b] dark:text-[#98989f] mt-3 pt-2 border-t border-black/[0.04] dark:border-white/[0.06]">
            <span>Started: {formatFriendlyDate(goal.startDate)}</span>
            {goal.targetDate && (
              <span className={isOverdue ? 'text-rose-500 font-bold' : ''}>
                Target: {formatFriendlyDate(goal.targetDate)}
                {isOverdue && ' (Overdue)'}
              </span>
            )}
          </div>
        </div>

        {/* Milestones Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-[#1d1d1f] dark:text-[#f5f5f7] flex items-center gap-2">
              <span>Milestones & Action Steps</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-black/[0.04] dark:bg-white/[0.08] text-[#86868b] dark:text-[#98989f] font-semibold">
                {completedMilestones.length}/{milestones.length}
              </span>
            </h3>
          </div>

          {/* Milestones List */}
          {milestones.length === 0 ? (
            <div className="p-6 rounded-2xl border border-dashed border-black/10 dark:border-white/10 text-center text-xs text-[#86868b] dark:text-[#98989f]">
              No milestones added yet. Break this goal down into steps below!
            </div>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {milestones.map((m) => (
                <MilestoneItem
                  key={m.id}
                  milestone={m}
                  onToggle={onToggleMilestone}
                  onDelete={onDeleteMilestone}
                />
              ))}
            </div>
          )}

          {/* Quick Add Milestone Form */}
          <form
            onSubmit={handleAddMilestoneSubmit}
            className="mt-3 flex items-center gap-2"
          >
            <input
              type="text"
              value={newMilestoneTitle}
              onChange={(e) => setNewMilestoneTitle(e.target.value)}
              placeholder="+ Add milestone (e.g. Complete module 1, Save first ₹5k)..."
              className="flex-1 px-3.5 py-2 rounded-xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.1] text-xs text-[#1d1d1f] dark:text-[#f5f5f7] focus:outline-hidden focus:border-[#0071e3]"
            />
            <input
              type="date"
              value={newMilestoneDate}
              onChange={(e) => setNewMilestoneDate(e.target.value)}
              className="px-2 py-2 rounded-xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.1] text-xs text-[#86868b] dark:text-[#98989f]"
            />
            <button
              type="submit"
              disabled={isAddingMilestone || !newMilestoneTitle.trim()}
              className="px-3.5 py-2 rounded-xl bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-semibold shadow-xs transition-colors disabled:opacity-40 shrink-0"
            >
              Add
            </button>
          </form>
        </div>

        {/* Modal Action Controls */}
        <div className="pt-4 border-t border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between gap-2">
          {/* Delete Button */}
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Are you sure you want to delete this goal and its milestones?')) {
                onDeleteGoal(goal.id);
                onClose();
              }
            }}
            className="px-3 py-2 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </button>

          {/* Right actions: Edit, Toggle Completed */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                onEditGoal(goal);
              }}
              className="px-3.5 py-2 rounded-xl border border-black/[0.08] dark:border-white/[0.1] text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] hover:bg-black/5 dark:hover:bg-white/5 flex items-center gap-1.5 transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5 text-amber-500" />
              Edit
            </button>

            <button
              type="button"
              onClick={() => {
                onToggleGoalStatus(goal.id);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                isCompleted
                  ? 'bg-black/5 dark:bg-white/10 text-[#1d1d1f] dark:text-[#f5f5f7] hover:bg-black/10'
                  : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md hover:opacity-95'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              {isCompleted ? 'Mark Active' : 'Mark Achieved'}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
