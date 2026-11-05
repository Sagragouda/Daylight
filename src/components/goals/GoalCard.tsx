import React, { useState } from 'react';
import { Goal, Milestone } from '../../types';
import { Card } from '../common/Card';
import { ProgressBar } from '../common/ProgressBar';
import {
  CATEGORY_CONFIG,
  getGoalIconComponent,
} from './goalIcons';
import {
  Calendar,
  CheckCircle2,
  Clock,
  MoreVertical,
  Edit2,
  Trash2,
  Check,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import { formatFriendlyDate, getTodayDateString } from '../../utils/date';

interface GoalCardProps {
  goal: Goal;
  milestones: Milestone[];
  progress: number;
  onOpenDetails: (goal: Goal) => void;
  onEdit: (goal: Goal) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string) => void;
  onToggleMilestone: (milestoneId: string) => void;
}

export const GoalCard: React.FC<GoalCardProps> = ({
  goal,
  milestones,
  progress,
  onOpenDetails,
  onEdit,
  onDelete,
  onToggleStatus,
  onToggleMilestone,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const catConfig = CATEGORY_CONFIG[goal.category] || CATEGORY_CONFIG.Other;
  const GoalIcon = getGoalIconComponent(goal.icon);

  const completedMilestones = milestones.filter((m) => m.isCompleted);
  const pendingMilestones = milestones.filter((m) => !m.isCompleted);

  const todayStr = getTodayDateString();
  const isCompleted = goal.status === 'completed';
  const isOverdue =
    !isCompleted && goal.targetDate && goal.targetDate < todayStr;

  // Days left calculation
  const daysLeft = React.useMemo(() => {
    if (!goal.targetDate || isCompleted) return null;
    const target = new Date(goal.targetDate + 'T00:00:00');
    const today = new Date(todayStr + 'T00:00:00');
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }, [goal.targetDate, todayStr, isCompleted]);

  // Priority badge styling
  const priorityStyles = {
    low: 'text-slate-600 dark:text-slate-400 bg-slate-500/10 border-slate-500/20',
    medium: 'text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/20',
    high: 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20',
    urgent: 'text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/20 font-bold',
  };

  return (
    <Card
      glowColor={catConfig.glow}
      hoverable
      className="p-5 sm:p-6 flex flex-col justify-between relative group cursor-pointer transition-all duration-200"
      onClick={() => onOpenDetails(goal)}
    >
      <div>
        {/* Top Header: Category & Priority & Menu */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Category Pill */}
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold border ${catConfig.bgLight} ${catConfig.bgDark} ${catConfig.color} ${catConfig.border}`}
            >
              <catConfig.icon className="w-3.5 h-3.5" />
              <span>{goal.category}</span>
            </span>

            {/* Priority Tag */}
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] uppercase font-bold tracking-wider border ${
                priorityStyles[goal.priority] || priorityStyles.medium
              }`}
            >
              {goal.priority}
            </span>

            {/* Completed Badge */}
            {isCompleted && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/15 border border-emerald-500/30">
                <CheckCircle2 className="w-3 h-3" />
                Done
              </span>
            )}
          </div>

          {/* Action Menu */}
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
              aria-label="Goal actions"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-1 w-44 bg-white/95 dark:bg-[#161722]/95 backdrop-blur-2xl rounded-2xl shadow-xl border border-black/[0.08] dark:border-white/[0.12] p-1.5 z-30 text-xs animate-scale-in">
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onOpenDetails(goal);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left hover:bg-black/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 transition-colors"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-blue-500" />
                  View Details
                </button>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onEdit(goal);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left hover:bg-black/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5 text-amber-500" />
                  Edit Goal
                </button>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onToggleStatus(goal.id);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left hover:bg-black/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 transition-colors"
                >
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  {isCompleted ? 'Reactivate' : 'Mark Complete'}
                </button>
                <div className="my-1 border-t border-black/5 dark:border-white/10" />
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onDelete(goal.id);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left hover:bg-rose-500/10 text-rose-600 dark:text-rose-400 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete Goal
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Goal Title & Icon */}
        <div className="flex items-start gap-3.5 my-2">
          <div
            className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border ${catConfig.bgLight} ${catConfig.bgDark} ${catConfig.border} shadow-sm group-hover:scale-105 transition-transform duration-200`}
          >
            <GoalIcon className={`w-5 h-5 ${catConfig.color}`} />
          </div>
          <div className="min-w-0 flex-1">
            <h3
              className={`font-bold text-base sm:text-lg leading-snug line-clamp-2 transition-colors ${
                isCompleted
                  ? 'text-[#86868b] dark:text-[#98989f] line-through'
                  : 'text-[#1d1d1f] dark:text-[#f5f5f7] group-hover:text-[#0071e3] dark:group-hover:text-[#2997ff]'
              }`}
            >
              {goal.title}
            </h3>
            {goal.description && (
              <p className="text-xs text-[#86868b] dark:text-[#98989f] line-clamp-2 mt-1">
                {goal.description}
              </p>
            )}
          </div>
        </div>

        {/* Progress Display */}
        <div className="mt-4 mb-3">
          <div className="flex items-center justify-between text-xs mb-1.5 font-semibold">
            {/* Metric or Milestone label */}
            <span className="text-[#6e6e73] dark:text-[#98989f]">
              {goal.trackingType === 'numeric' ? (
                <span>
                  {goal.currentValue || 0} / {goal.targetValue || 0}{' '}
                  {goal.unit || ''}
                </span>
              ) : goal.trackingType === 'milestone' ? (
                <span>
                  {completedMilestones.length} of {milestones.length} milestones
                </span>
              ) : (
                <span>Overall Completion</span>
              )}
            </span>

            {/* Percentage Badge */}
            <span
              className={`font-extrabold ${
                progress === 100
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-[#1d1d1f] dark:text-[#f5f5f7]'
              }`}
            >
              {progress}%
            </span>
          </div>

          <ProgressBar
            progress={progress}
            size="md"
            color={
              progress === 100
                ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                : 'bg-gradient-to-r from-[#0071e3] to-[#a855f7]'
            }
          />
        </div>

        {/* Next Milestones Preview (if any) */}
        {milestones.length > 0 && (
          <div
            className="my-3 space-y-1.5"
            onClick={(e) => e.stopPropagation()}
          >
            {pendingMilestones.slice(0, 2).map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between gap-2 p-2 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.06] text-xs hover:bg-black/[0.04] dark:hover:bg-white/[0.05] transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <button
                    onClick={() => onToggleMilestone(m.id)}
                    aria-label="Complete milestone"
                    className="w-4 h-4 rounded-md border-2 border-black/20 dark:border-white/30 hover:border-emerald-500 flex items-center justify-center shrink-0 transition-colors"
                  />
                  <span className="truncate text-xs text-[#1d1d1f] dark:text-[#f5f5f7]">
                    {m.title}
                  </span>
                </div>
                {m.dueDate && (
                  <span className="text-[10px] text-[#86868b] dark:text-[#98989f] shrink-0 font-medium">
                    {formatFriendlyDate(m.dueDate)}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer: Target Date & Status */}
      <div className="pt-3 border-t border-black/[0.05] dark:border-white/[0.08] flex items-center justify-between text-xs mt-2">
        <div className="flex items-center gap-1.5 text-[#86868b] dark:text-[#98989f]">
          <Calendar className="w-3.5 h-3.5" />
          <span>
            {goal.targetDate
              ? `Target: ${formatFriendlyDate(goal.targetDate)}`
              : 'No deadline'}
          </span>
        </div>

        {/* Remaining Days indicator */}
        {!isCompleted && goal.targetDate && (
          <div className="shrink-0">
            {isOverdue ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 dark:text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-lg border border-rose-500/20">
                <AlertCircle className="w-3 h-3" />
                Overdue
              </span>
            ) : daysLeft === 0 ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20">
                <Clock className="w-3 h-3" />
                Due Today
              </span>
            ) : (
              <span className="text-[11px] font-medium text-[#6e6e73] dark:text-[#98989f]">
                {daysLeft}d left
              </span>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};
