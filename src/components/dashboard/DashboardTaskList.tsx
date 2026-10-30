import React, { useState } from 'react';
import { Card } from '../common/Card';
import { TaskItem } from '../tasks/TaskItem';
import { useTasks } from '../../context/TaskContext';
import { Plus, CheckCheck, ListFilter } from 'lucide-react';
import { Button } from '../common/Button';

interface DashboardTaskListProps {
  onOpenNewTaskModal: () => void;
}

type FilterTab = 'all' | 'pending' | 'completed';

export const DashboardTaskList: React.FC<DashboardTaskListProps> = ({ onOpenNewTaskModal }) => {
  const { todayTasks, toggleTask, deleteTask, addTask, loading } = useTasks();
  const [filter, setFilter] = useState<FilterTab>('all');
  const [quickTitle, setQuickTitle] = useState('');

  const filteredTasks = todayTasks.filter((t) => {
    if (filter === 'pending') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;

    addTask({
      title: quickTitle.trim(),
      category: 'Work',
      priority: 'medium',
      dueDate: new Date().toISOString().split('T')[0],
      dueTime: '05:00 PM',
      estimatedMinutes: 25,
    });
    setQuickTitle('');
  };

  return (
    <Card hoverable glowColor="blue" className="p-6">
      {/* Header & Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-black/[0.05] dark:border-white/[0.08]">
        <div>
          <h3 className="font-semibold text-lg text-[#1d1d1f] dark:text-[#f5f5f7] flex items-center gap-2">
            Today's Priorities
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#f0f0f4] dark:bg-white/[0.08] text-[#6e6e73] dark:text-[#d2d2d7] font-semibold">
              {todayTasks.length}
            </span>
          </h3>
          <p className="text-xs text-[#86868b] dark:text-[#98989f]">
            Deliberate focus, one item at a time
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 bg-[#f5f5f7] dark:bg-white/[0.06] p-1 rounded-xl self-start sm:self-auto">
          {(['all', 'pending', 'completed'] as FilterTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`text-xs px-3 py-1 rounded-lg font-medium capitalize transition-all ${
                filter === tab
                  ? 'bg-white dark:bg-[#202230] text-[#1d1d1f] dark:text-[#f5f5f7] shadow-xs font-semibold'
                  : 'text-[#86868b] dark:text-[#98989f] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Add Inline Bar */}
      <form onSubmit={handleQuickAdd} className="mt-4 flex items-center gap-2">
        <input
          type="text"
          value={quickTitle}
          onChange={(e) => setQuickTitle(e.target.value)}
          placeholder="+ Quick add task for today (Press Enter)..."
          className="flex-1 px-3.5 py-2.5 rounded-xl border border-black/[0.08] dark:border-white/[0.1] bg-[#fbfbfd] dark:bg-[#1a1c27] text-sm text-[#1d1d1f] dark:text-[#f5f5f7] placeholder:text-[#86868b] dark:placeholder:text-[#686872] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30 focus:border-[#0071e3] transition-all"
        />
        {quickTitle.trim() && (
          <Button type="submit" size="sm">
            Add
          </Button>
        )}
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={onOpenNewTaskModal}
          icon={<Plus className="w-3.5 h-3.5" />}
          title="Open complete task creator modal"
        >
          Details
        </Button>
      </form>

      {/* Task List Items / Loading Skeletons */}
      <div className="mt-4 space-y-2.5">
        {loading && todayTasks.length === 0 ? (
          <div className="space-y-2.5">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="p-4 rounded-2xl border border-black/[0.04] dark:border-white/[0.06] bg-[#fbfbfd] dark:bg-white/[0.02] animate-pulse flex items-center gap-3.5"
              >
                <div className="w-5 h-5 rounded-full bg-black/10 dark:bg-white/10 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="w-48 h-3.5 bg-black/10 dark:bg-white/10 rounded-full" />
                  <div className="w-24 h-2.5 bg-black/5 dark:bg-white/5 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredTasks.length > 0 ? (
          filteredTasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={toggleTask}
              onDelete={deleteTask}
            />
          ))
        ) : (
          <div className="text-center py-10 px-4 rounded-2xl bg-[#fbfbfd] dark:bg-white/[0.02] border border-dashed border-black/[0.08] dark:border-white/[0.08]">
            <div className="w-10 h-10 mx-auto rounded-full bg-blue-50 dark:bg-blue-950/60 text-[#0071e3] dark:text-[#2997ff] flex items-center justify-center mb-2 shadow-xs">
              {filter === 'completed' ? (
                <ListFilter className="w-5 h-5" />
              ) : (
                <CheckCheck className="w-5 h-5" />
              )}
            </div>
            <p className="text-sm font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
              {filter === 'completed'
                ? 'No completed tasks yet'
                : filter === 'pending'
                ? 'All pending tasks completed!'
                : 'No tasks scheduled for today'}
            </p>
            <p className="text-xs text-[#86868b] dark:text-[#98989f] mt-1 max-w-xs mx-auto">
              {filter === 'completed'
                ? 'Check off a task above to see it recorded here.'
                : 'Add a new task to stay organized and achieve deep focus.'}
            </p>
            {filter !== 'completed' && (
              <Button
                variant="secondary"
                size="sm"
                onClick={onOpenNewTaskModal}
                className="mt-3.5 shadow-xs"
              >
                Create First Task
              </Button>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};
