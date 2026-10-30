import React from 'react';
import { Check, Clock, Trash2 } from 'lucide-react';
import { Task } from '../../types';
import { Badge } from '../common/Badge';
import { formatFriendlyDate } from '../../utils/date';

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({ task, onToggle, onDelete }) => {
  return (
    <div
      className={`group relative flex items-start gap-3.5 p-3.5 sm:p-4 rounded-2xl border transition-all duration-200 ${
        task.completed
          ? 'bg-[#fbfbfd]/70 border-black/[0.04] opacity-75'
          : 'bg-white border-black/[0.06] hover:border-black/[0.12] hover:shadow-[0_4px_16px_rgba(0,0,0,0.03)]'
      }`}
    >
      {/* Apple-style Circular Checkbox */}
      <button
        type="button"
        onClick={() => onToggle(task.id)}
        className={`mt-0.5 w-5 h-5 rounded-full border flex items-center justify-center transition-all duration-200 shrink-0 active:scale-90 ${
          task.completed
            ? 'bg-[#0071e3] border-[#0071e3] text-white shadow-xs scale-105'
            : 'border-black/20 hover:border-[#0071e3] bg-white'
        }`}
        aria-label={task.completed ? 'Mark task incomplete' : 'Mark task complete'}
      >
        {task.completed && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
      </button>

      {/* Task Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p
            className={`text-sm font-medium transition-all ${
              task.completed
                ? 'line-through text-[#86868b]'
                : 'text-[#1d1d1f]'
            }`}
          >
            {task.title}
          </p>
        </div>

        {task.description && (
          <p
            className={`text-xs mt-1 line-clamp-2 ${
              task.completed ? 'text-[#86868b]/70 line-through' : 'text-[#6e6e73]'
            }`}
          >
            {task.description}
          </p>
        )}

        {/* Metadata Badges */}
        <div className="flex items-center gap-2 mt-2 flex-wrap text-xs text-[#86868b]">
          <Badge priority={task.priority} size="sm">
            {task.priority.toUpperCase()}
          </Badge>

          <span className="px-2 py-0.5 rounded-full bg-[#f5f5f7] text-[#6e6e73] font-medium text-[11px] border border-black/[0.03]">
            {task.category}
          </span>

          <span className="flex items-center gap-1 text-[11px] text-[#86868b]">
            <Clock className="w-3 h-3 text-[#86868b]" />
            {formatFriendlyDate(task.dueDate)} {task.dueTime ? `at ${task.dueTime}` : ''}
          </span>

          {task.estimatedMinutes && (
            <span className="text-[11px] text-[#86868b]">
              • {task.estimatedMinutes}m
            </span>
          )}
        </div>
      </div>

      {/* Actions (Delete button: visible on mobile, hover on desktop) */}
      <div className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex items-center shrink-0">
        <button
          onClick={() => onDelete(task.id)}
          className="w-8 h-8 flex items-center justify-center rounded-xl text-[#86868b] hover:text-rose-600 hover:bg-rose-50 transition-colors"
          title="Delete task"
          aria-label="Delete task"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
