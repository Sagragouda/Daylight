import React, { useState, useMemo } from 'react';
import { useGoals } from '../context/GoalContext';
import {
  Goal,
  GoalCategory,
  CreateGoalInput,
  UpdateGoalInput,
} from '../types';
import { Card } from '../components/common/Card';
import { AnimatedCounter } from '../components/common/AnimatedCounter';
import { GoalCard } from '../components/goals/GoalCard';
import { GoalFormModal } from '../components/goals/GoalFormModal';
import { GoalDetailsModal } from '../components/goals/GoalDetailsModal';
import {
  CATEGORY_CONFIG,
} from '../components/goals/goalIcons';
import {
  Target,
  Plus,
  Trophy,
  Flame,
  TrendingUp,
  Search,
  ArrowUpDown,
} from 'lucide-react';
import { getTodayDateString } from '../utils/date';

type StatusFilter = 'all' | 'active' | 'completed' | 'overdue';
type SortOption = 'targetDate' | 'priority' | 'progress' | 'recent';

const PRESET_TEMPLATES = [
  {
    title: 'Master C++ & Systems Programming',
    category: 'Learning' as GoalCategory,
    priority: 'high' as const,
    trackingType: 'milestone' as const,
    icon: 'Code',
    color: 'blue',
    description: 'Learn modern C++20, memory management, pointers, and concurrency.',
    milestones: ['Understand pointers & memory layout', 'Build CLI memory visualizer', 'Master RAII & Smart Pointers'],
  },
  {
    title: 'Read 12 Books This Year',
    category: 'Personal' as GoalCategory,
    priority: 'medium' as const,
    trackingType: 'numeric' as const,
    targetValue: 12,
    currentValue: 3,
    unit: 'books',
    icon: 'BookOpen',
    color: 'purple',
    description: 'Expand knowledge across science, psychology, philosophy, and history.',
    milestones: ['Finish Q1 reading list', 'Finish Q2 reading list'],
  },
  {
    title: 'Emergency Fund Savings',
    category: 'Finance' as GoalCategory,
    priority: 'high' as const,
    trackingType: 'numeric' as const,
    targetValue: 50000,
    currentValue: 15000,
    unit: '₹',
    icon: 'DollarSign',
    color: 'amber',
    description: 'Build a solid financial safety net for peace of mind.',
    milestones: ['Reach ₹10,000 milestone', 'Reach ₹25,000 milestone', 'Reach ₹50,000 complete'],
  },
  {
    title: 'Run 5km Consistently',
    category: 'Health & Fitness' as GoalCategory,
    priority: 'medium' as const,
    trackingType: 'milestone' as const,
    icon: 'Dumbbell',
    color: 'emerald',
    description: 'Build cardiovascular endurance and morning stamina.',
    milestones: ['Complete Couch to 2km', 'Run 3.5km continuous', 'Run full 5km sub-30min'],
  },
];

export const Goals: React.FC = () => {
  const {
    goals,
    createGoal,
    updateGoal,
    deleteGoal,
    toggleGoalStatus,
    addMilestone,
    deleteMilestone,
    toggleMilestone,
    updateGoalMetric,
    getGoalProgress,
    getGoalMilestones,
    totalGoalsCount,
    activeGoalsCount,
    completedGoalsCount,
    overallProgressPercentage,
    totalMilestonesCompleted,
  } = useGoals();

  // Filter & Search states
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('targetDate');

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [detailsGoal, setDetailsGoal] = useState<Goal | null>(null);

  const todayStr = getTodayDateString();

  // Category list with counts
  const categoriesWithCounts = useMemo(() => {
    const list: { id: string; name: string; count: number }[] = [
      { id: 'all', name: 'All Categories', count: goals.length },
    ];
    const catKeys = Object.keys(CATEGORY_CONFIG) as GoalCategory[];
    catKeys.forEach((cat) => {
      const count = goals.filter((g) => g.category === cat).length;
      list.push({ id: cat, name: cat, count });
    });
    return list;
  }, [goals]);

  // Filtered & Sorted goals
  const filteredGoals = useMemo(() => {
    return goals
      .filter((goal) => {
        // Category filter
        if (selectedCategory !== 'all' && goal.category !== selectedCategory) {
          return false;
        }

        // Status filter
        if (statusFilter === 'active' && goal.status !== 'active') return false;
        if (statusFilter === 'completed' && goal.status !== 'completed') return false;
        if (statusFilter === 'overdue') {
          if (
            goal.status === 'completed' ||
            !goal.targetDate ||
            goal.targetDate >= todayStr
          ) {
            return false;
          }
        }

        // Search filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = goal.title.toLowerCase().includes(q);
          const matchDesc = goal.description?.toLowerCase().includes(q);
          if (!matchTitle && !matchDesc) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'targetDate') {
          if (!a.targetDate) return 1;
          if (!b.targetDate) return -1;
          return a.targetDate.localeCompare(b.targetDate);
        }
        if (sortBy === 'priority') {
          const rank = { urgent: 4, high: 3, medium: 2, low: 1 };
          return (rank[b.priority] || 0) - (rank[a.priority] || 0);
        }
        if (sortBy === 'progress') {
          return getGoalProgress(b) - getGoalProgress(a);
        }
        // recent
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      });
  }, [
    goals,
    selectedCategory,
    statusFilter,
    searchQuery,
    sortBy,
    todayStr,
    getGoalProgress,
  ]);

  const handleOpenCreateModal = () => {
    setEditingGoal(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (goal: Goal) => {
    setEditingGoal(goal);
    setIsFormModalOpen(true);
  };

  const handleOpenDetails = (goal: Goal) => {
    setDetailsGoal(goal);
  };

  const handleFormSubmit = async (
    input: CreateGoalInput | UpdateGoalInput,
    initialMilestoneTitles?: string[]
  ) => {
    if (editingGoal) {
      await updateGoal(editingGoal.id, input);
    } else {
      await createGoal(input as CreateGoalInput, initialMilestoneTitles);
    }
  };

  const handleApplyTemplate = async (tmpl: typeof PRESET_TEMPLATES[0]) => {
    await createGoal(
      {
        title: tmpl.title,
        description: tmpl.description,
        category: tmpl.category,
        priority: tmpl.priority,
        trackingType: tmpl.trackingType,
        targetValue: (tmpl as any).targetValue,
        currentValue: (tmpl as any).currentValue,
        unit: (tmpl as any).unit,
        icon: tmpl.icon,
        color: tmpl.color,
      },
      tmpl.milestones
    );
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-xl bg-blue-500/10 dark:bg-blue-500/20 text-[#0071e3] dark:text-[#2997ff]">
              <Target className="w-5 h-5" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7]">
              Goals & Milestones
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-[#86868b] dark:text-[#98989f]">
            Define meaningful ambitions, divide them into milestones, and track execution daily.
          </p>
        </div>

        {/* Primary Action Button */}
        <button
          onClick={handleOpenCreateModal}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#0071e3] via-[#8b5cf6] to-[#ec4899] hover:opacity-95 text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all shrink-0 active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>New Goal</span>
        </button>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        {/* Total Goals */}
        <Card glowColor="blue" className="p-4 sm:p-5">
          <div className="flex items-center justify-between text-[#86868b] dark:text-[#98989f] text-xs font-semibold mb-2">
            <span>Total Goals</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7]">
            <AnimatedCounter value={totalGoalsCount} />
          </div>
          <p className="text-[11px] text-[#86868b] dark:text-[#98989f] mt-1 font-medium">
            Personal & professional
          </p>
        </Card>

        {/* Active Goals */}
        <Card glowColor="purple" className="p-4 sm:p-5">
          <div className="flex items-center justify-between text-[#86868b] dark:text-[#98989f] text-xs font-semibold mb-2">
            <span>In Progress</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7]">
            <AnimatedCounter value={activeGoalsCount} />
          </div>
          <p className="text-[11px] text-[#86868b] dark:text-[#98989f] mt-1 font-medium">
            Actively being pursued
          </p>
        </Card>

        {/* Completed Goals */}
        <Card glowColor="emerald" className="p-4 sm:p-5">
          <div className="flex items-center justify-between text-[#86868b] dark:text-[#98989f] text-xs font-semibold mb-2">
            <span>Achieved</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Trophy className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-emerald-600 dark:text-emerald-400">
            <AnimatedCounter value={completedGoalsCount} />
          </div>
          <p className="text-[11px] text-[#86868b] dark:text-[#98989f] mt-1 font-medium">
            {totalMilestonesCompleted} milestones finished
          </p>
        </Card>

        {/* Overall Progress */}
        <Card glowColor="cyan" className="p-4 sm:p-5">
          <div className="flex items-center justify-between text-[#86868b] dark:text-[#98989f] text-xs font-semibold mb-2">
            <span>Overall Pace</span>
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
            {overallProgressPercentage}%
          </div>
          <p className="text-[11px] text-[#86868b] dark:text-[#98989f] mt-1 font-medium">
            Combined achievement score
          </p>
        </Card>
      </div>

      {/* Category Pills Slider */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categoriesWithCounts.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all border shrink-0 ${
                isSelected
                  ? 'bg-[#0071e3] text-white border-[#0071e3] shadow-xs'
                  : 'bg-white/80 dark:bg-[#14151c]/80 backdrop-blur-xl border-black/[0.06] dark:border-white/[0.08] text-[#6e6e73] dark:text-[#98989f] hover:border-black/[0.12] dark:hover:border-white/[0.15]'
              }`}
            >
              <span>{cat.name}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  isSelected
                    ? 'bg-white/20 text-white'
                    : 'bg-black/[0.05] dark:bg-white/[0.08] text-[#86868b] dark:text-[#98989f]'
                }`}
              >
                {cat.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filters & Search Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white/70 dark:bg-[#14151c]/70 backdrop-blur-xl border border-black/[0.06] dark:border-white/[0.08] overflow-x-auto">
          {(['all', 'active', 'completed', 'overdue'] as StatusFilter[]).map(
            (tab) => {
              const active = statusFilter === tab;
              const labels: Record<StatusFilter, string> = {
                all: 'All Goals',
                active: 'In Progress',
                completed: 'Completed',
                overdue: 'Overdue',
              };
              return (
                <button
                  key={tab}
                  onClick={() => setStatusFilter(tab)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold capitalize whitespace-nowrap transition-all ${
                    active
                      ? 'bg-[#0071e3] text-white shadow-xs'
                      : 'text-[#6e6e73] dark:text-[#98989f] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7]'
                  }`}
                >
                  {labels[tab]}
                </button>
              );
            }
          )}
        </div>

        {/* Right side: Search & Sort */}
        <div className="flex items-center gap-2.5">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 text-[#86868b] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search goals..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white/70 dark:bg-[#14151c]/70 backdrop-blur-xl border border-black/[0.06] dark:border-white/[0.08] text-xs text-[#1d1d1f] dark:text-[#f5f5f7] focus:outline-hidden focus:border-[#0071e3]"
            />
          </div>

          {/* Sort Dropdown */}
          <div className="relative shrink-0">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-3 py-1.5 pr-8 rounded-xl bg-white/70 dark:bg-[#14151c]/70 backdrop-blur-xl border border-black/[0.06] dark:border-white/[0.08] text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] focus:outline-hidden focus:border-[#0071e3] appearance-none cursor-pointer"
            >
              <option value="targetDate">Target Date</option>
              <option value="priority">Priority</option>
              <option value="progress">Progress %</option>
              <option value="recent">Recently Added</option>
            </select>
            <ArrowUpDown className="w-3 h-3 text-[#86868b] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Goals Grid */}
      {filteredGoals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredGoals.map((goal) => {
            const goalMilestones = getGoalMilestones(goal.id);
            const progress = getGoalProgress(goal);
            return (
              <GoalCard
                key={goal.id}
                goal={goal}
                milestones={goalMilestones}
                progress={progress}
                onOpenDetails={handleOpenDetails}
                onEdit={handleOpenEditModal}
                onDelete={deleteGoal}
                onToggleStatus={toggleGoalStatus}
                onToggleMilestone={toggleMilestone}
              />
            );
          })}
        </div>
      ) : (
        /* Empty State with Template Recommendations */
        <div className="p-8 sm:p-12 rounded-3xl bg-white/60 dark:bg-[#14151c]/60 backdrop-blur-xl border border-dashed border-black/[0.08] dark:border-white/[0.1] text-center max-w-3xl mx-auto my-6">
          <div className="w-14 h-14 rounded-3xl bg-gradient-to-tr from-blue-500/20 to-purple-500/20 border border-blue-500/30 flex items-center justify-center mx-auto mb-4 text-[#0071e3] dark:text-[#2997ff]">
            <Target className="w-7 h-7" />
          </div>

          <h3 className="text-lg font-bold text-[#1d1d1f] dark:text-[#f5f5f7] mb-1">
            {searchQuery || selectedCategory !== 'all' || statusFilter !== 'all'
              ? 'No matching goals found'
              : 'No goals set yet'}
          </h3>
          <p className="text-xs sm:text-sm text-[#86868b] dark:text-[#98989f] max-w-md mx-auto mb-6">
            {searchQuery
              ? 'Try adjusting your search keywords or clear filters.'
              : 'Choose one of our popular productivity blueprints below or create your own custom goal.'}
          </p>

          {!searchQuery && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left mb-6">
              {PRESET_TEMPLATES.map((tmpl, idx) => (
                <div
                  key={idx}
                  onClick={() => handleApplyTemplate(tmpl)}
                  className="p-3.5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.05] dark:border-white/[0.08] hover:border-[#0071e3]/40 cursor-pointer transition-all hover:-translate-y-0.5 group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                      {tmpl.category}
                    </span>
                    <span className="text-xs text-[#0071e3] opacity-0 group-hover:opacity-100 transition-opacity font-bold">
                      + Use
                    </span>
                  </div>
                  <h4 className="font-bold text-xs text-[#1d1d1f] dark:text-[#f5f5f7] line-clamp-1">
                    {tmpl.title}
                  </h4>
                  <p className="text-[11px] text-[#86868b] dark:text-[#98989f] line-clamp-1 mt-0.5">
                    {tmpl.description}
                  </p>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#0071e3] to-[#a855f7] text-white font-semibold text-xs shadow-md hover:opacity-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create Custom Goal</span>
          </button>
        </div>
      )}

      {/* Goal Form Modal (Create / Edit) */}
      <GoalFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialGoal={editingGoal}
      />

      {/* Goal Details Modal */}
      {detailsGoal && (
        <GoalDetailsModal
          goal={detailsGoal}
          milestones={getGoalMilestones(detailsGoal.id)}
          progress={getGoalProgress(detailsGoal)}
          isOpen={Boolean(detailsGoal)}
          onClose={() => setDetailsGoal(null)}
          onToggleMilestone={toggleMilestone}
          onDeleteMilestone={deleteMilestone}
          onAddMilestone={async (title, dueDate) => {
            await addMilestone({ goalId: detailsGoal.id, title, dueDate });
          }}
          onUpdateMetric={async (val) => {
            await updateGoalMetric(detailsGoal.id, val);
            // Refresh local modal pointer
            setDetailsGoal((prev) => (prev ? { ...prev, currentValue: val } : null));
          }}
          onEditGoal={(g) => {
            setDetailsGoal(null);
            handleOpenEditModal(g);
          }}
          onDeleteGoal={deleteGoal}
          onToggleGoalStatus={toggleGoalStatus}
        />
      )}
    </div>
  );
};
