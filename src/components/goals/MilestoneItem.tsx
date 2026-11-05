import React from 'react';
import { Milestone } from '../../types';
import { Check, Calendar, Trash2, Clock, AlertTriangle } from 'lucide-react';
import { formatFriendlyDate, getTodayDateString } from '../../utils/date';

interface MilestoneItemProps {
  milestone: Milestone;
  onToggle: (id: string) => void;
  onDelete?: (id: string) => void;
  readOnly?: boolean;
}

export const MilestoneItem: React.FC<MilestoneItemProps> = ({
  milestone,
  onToggle,
  onDelete,
  readOnly = false,
}) => {
  const isCompleted = milestone.isCompleted;
  const todayStr = getTodayDateString();
  const isOverdue =
    !isCompleted && milestone.dueDate && milestone.dueDate < todayStr;
  const isDueToday = !isCompleted && milestone.dueDate === todayStr;

  return (
    <div
      className={`group flex items-start justify-between gap-3 p-3 rounded-2xl border transition-all duration-200 ${
        isCompleted
          ? 'bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500/20 text-[#6e6e73] dark:text-[#98989f]'
          : 'bg-white/60 dark:bg-white/[0.03] border-black/[0.06] dark:border-white/[0.08] hover:border-black/[0.12] dark:hover:border-white/[0.15] text-[#1d1d1f] dark:text-[#f5f5f7]'
      }`}
    >
      <div className="flex items-start gap-3 min-w-0 flex-1">
        {/* Toggle Checkbox Button */}
        <button
          type="button"
          onClick={() => !readOnly && onToggle(milestone.id)}
          disabled={readOnly}
          aria-label={isCompleted ? 'Mark incomplete' : 'Mark completed'}
          className={`mt-0.5 w-5 h-5 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200 ${
            isCompleted
              ? 'bg-emerald-500 text-white shadow-xs'
              : 'border-2 border-black/20 dark:border-white/30 hover:border-[#0071e3] dark:hover:border-[#2997ff]'
          }`}
        >
          {isCompleted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
        </button>

        {/* Details */}
        <div className="min-w-0 flex-1">
          <p
            className={`text-sm font-medium leading-snug transition-all ${
              isCompleted
                ? 'line-through text-[#86868b] dark:text-[#98989f]'
                : 'text-[#1d1d1f] dark:text-[#f5f5f7]'
            }`}
          >
            {milestone.title}
          </p>

          {milestone.description && (
            <p className="text-xs text-[#86868b] dark:text-[#98989f] mt-0.5 line-clamp-2">
              {milestone.description}
            </p>
          )}

          {/* Badges: Due date, Overdue alert, Completed date */}
          <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[11px]">
            {milestone.dueDate && (
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-medium ${
                  isOverdue
                    ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                    : isDueToday
                    ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                    : 'bg-black/[0.04] dark:bg-white/[0.06] text-[#6e6e73] dark:text-[#98989f]'
                }`}
              >
                {isOverdue ? (
                  <AlertTriangle className="w-3 h-3 text-rose-500" />
                ) : (
                  <Calendar className="w-3 h-3" />
                )}
                <span>
                  {isOverdue
                    ? `Overdue (${formatFriendlyDate(milestone.dueDate)})`
                    : formatFriendlyDate(milestone.dueDate)}
                </span>
              </span>
            )}

            {isCompleted && milestone.completedAt && (
              <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400">
                <Clock className="w-2.5 h-2.5" />
                Done
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Delete Action Button */}
      {onDelete && !readOnly && (
        <button
          type="button"
          onClick={() => onDelete(milestone.id)}
          aria-label="Delete milestone"
          className="opacity-0 group-hover:opacity-100 focus:opacity-100 p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-all"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
