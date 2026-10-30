import React, { useState, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useTasks } from '../context/TaskContext';
import { TaskItem } from '../components/tasks/TaskItem';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { AnimatedCounter } from '../components/common/AnimatedCounter';
import { Plus, Search, CheckCircle2, Clock, TrendingUp } from 'lucide-react';
import { TaskCategory, Priority } from '../types';

interface OutletContextType {
  openTaskModal: () => void;
}

const CATEGORIES: ('All' | TaskCategory)[] = ['All', 'Work', 'Design', 'Personal', 'Health', 'Learning'];
const PRIORITIES: ('All' | Priority)[] = ['All', 'high', 'medium', 'low'];

export const Tasks: React.FC = () => {
  const { openTaskModal } = useOutletContext<OutletContextType>();
  const { tasks, toggleTask, deleteTask, loading } = useTasks();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'All' | TaskCategory>('All');
  const [selectedPriority, setSelectedPriority] = useState<'All' | Priority>('All');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed'>('all');

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      // Search filter
      const matchesSearch =
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()));

      // Category filter
      const matchesCategory = selectedCategory === 'All' || t.category === selectedCategory;

      // Priority filter
      const matchesPriority = selectedPriority === 'All' || t.priority === selectedPriority;

      // Status filter
      const matchesStatus =
        statusFilter === 'all'
          ? true
          : statusFilter === 'active'
          ? !t.completed
          : t.completed;

      return matchesSearch && matchesCategory && matchesPriority && matchesStatus;
    });
  }, [tasks, searchQuery, selectedCategory, selectedPriority, statusFilter]);

  const activeCount = tasks.filter((t) => !t.completed).length;
  const completedCount = tasks.filter((t) => t.completed).length;
  const completionRate = tasks.length === 0 ? 0 : Math.round((completedCount / tasks.length) * 100);

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7]">
            My Tasks
          </h1>
          <p className="text-sm text-[#6e6e73] dark:text-[#98989f] mt-1">
            Capture, prioritize, and systematically conquer your action items.
          </p>
        </div>

        <Button
          onClick={openTaskModal}
          size="md"
          icon={<Plus className="w-4 h-4" />}
          className="shadow-sm self-start sm:self-auto"
        >
          Add Task
        </Button>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <Card className="p-4 sm:p-5 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#0071e3] dark:text-[#2997ff] border border-blue-100 dark:border-blue-900/40 flex items-center justify-center shrink-0 shadow-xs">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#86868b] dark:text-[#98989f]">
              Active
            </p>
            <p className="text-xl sm:text-2xl font-bold text-[#1d1d1f] dark:text-[#f5f5f7]">
              <AnimatedCounter value={activeCount} />
            </p>
          </div>
        </Card>

        <Card className="p-4 sm:p-5 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40 flex items-center justify-center shrink-0 shadow-xs">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#86868b] dark:text-[#98989f]">
              Completed
            </p>
            <p className="text-xl sm:text-2xl font-bold text-[#1d1d1f] dark:text-[#f5f5f7]">
              <AnimatedCounter value={completedCount} />
            </p>
          </div>
        </Card>

        <Card className="p-4 sm:p-5 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-900/40 flex items-center justify-center shrink-0 shadow-xs">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#86868b] dark:text-[#98989f]">
              Completion Rate
            </p>
            <p className="text-xl sm:text-2xl font-bold text-[#1d1d1f] dark:text-[#f5f5f7]">
              <AnimatedCounter value={completionRate} suffix="%" />
            </p>
          </div>
        </Card>
      </div>

      {/* Search and Filters Card */}
      <Card className="p-4 sm:p-5 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-[#86868b] dark:text-[#98989f]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks by name or description..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-black/[0.08] dark:border-white/[0.1] bg-[#fbfbfd] dark:bg-[#1a1c27] text-sm text-[#1d1d1f] dark:text-[#f5f5f7] placeholder:text-[#86868b] dark:placeholder:text-[#686872] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30 transition-all"
          />
        </div>

        {/* Filter Rows */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-2 border-t border-black/[0.05] dark:border-white/[0.08]">
          {/* Status Pills */}
          <div className="flex items-center gap-1 bg-[#f5f5f7] dark:bg-white/[0.06] p-1 rounded-xl shrink-0 self-start md:self-auto">
            {(['all', 'active', 'completed'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`text-xs px-3 py-1.5 rounded-lg font-semibold capitalize transition-all ${
                  statusFilter === tab
                    ? 'bg-white dark:bg-[#202230] text-[#1d1d1f] dark:text-[#f5f5f7] shadow-xs'
                    : 'text-[#86868b] dark:text-[#98989f] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Categories Horizontal Scroll */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-xs px-3 py-1.5 rounded-lg border font-semibold shrink-0 transition-all ${
                  selectedCategory === cat
                    ? 'bg-[#0071e3] text-white border-[#0071e3] shadow-xs'
                    : 'bg-white dark:bg-[#1a1c27] border-black/[0.06] dark:border-white/[0.08] text-[#6e6e73] dark:text-[#98989f] hover:bg-[#f5f5f7] dark:hover:bg-[#222434]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Priority dropdown */}
          <div className="flex items-center gap-1.5 text-xs shrink-0">
            <span className="text-[#86868b] dark:text-[#98989f] font-medium">Priority:</span>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value as 'All' | Priority)}
              className="px-2.5 py-1.5 rounded-xl border border-black/[0.08] dark:border-white/[0.1] bg-white dark:bg-[#1a1c27] text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30"
            >
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p === 'All' ? 'All Priorities' : p.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Task List */}
      <div className="space-y-3">
        {loading && tasks.length === 0 ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="p-4 sm:p-5 rounded-2xl border border-black/[0.04] dark:border-white/[0.06] bg-white dark:bg-[#14151e] animate-pulse flex items-center gap-3.5"
              >
                <div className="w-5 h-5 rounded-full bg-black/10 dark:bg-white/10 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="w-56 h-3.5 bg-black/10 dark:bg-white/10 rounded-full" />
                  <div className="w-32 h-2.5 bg-black/5 dark:bg-white/5 rounded-full" />
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
          <Card className="text-center py-14 px-4 border-dashed">
            <CheckCircle2 className="w-10 h-10 text-[#86868b] dark:text-[#98989f] mx-auto mb-3 opacity-40" />
            <h3 className="text-base font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
              No matching tasks found
            </h3>
            <p className="text-xs text-[#86868b] dark:text-[#98989f] mt-1 max-w-sm mx-auto">
              Try adjusting your search query, status or category filters, or create a brand new task.
            </p>
            <Button onClick={openTaskModal} size="sm" className="mt-4 shadow-xs">
              Create New Task
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
};
