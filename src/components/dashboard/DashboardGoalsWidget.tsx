import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../common/Card';
import { ProgressBar } from '../common/ProgressBar';
import { useGoals } from '../../context/GoalContext';
import {
  CATEGORY_CONFIG,
  getGoalIconComponent,
} from '../goals/goalIcons';
import {
  Target,
  ArrowRight,
  Plus,
  Calendar,
} from 'lucide-react';
import { formatFriendlyDate } from '../../utils/date';

export const DashboardGoalsWidget: React.FC = () => {
  const { goals, getGoalProgress, getGoalMilestones, activeGoalsCount } = useGoals();

  const activeGoals = React.useMemo(() => {
    return goals
      .filter((g) => g.status === 'active')
      .slice(0, 3);
  }, [goals]);

  return (
    <Card glowColor="aurora" className="p-5 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#0071e3]/20 to-[#a855f7]/20 text-[#0071e3] dark:text-[#2997ff] flex items-center justify-center">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm sm:text-base text-[#1d1d1f] dark:text-[#f5f5f7]">
              My Goals
            </h3>
            <p className="text-[11px] text-[#86868b] dark:text-[#98989f]">
              {activeGoalsCount} in active pursuit
            </p>
          </div>
        </div>

        <Link
          to="/goals"
          className="text-xs font-semibold text-[#0071e3] dark:text-[#2997ff] hover:underline flex items-center gap-1 group"
        >
          <span>View all</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* Goal list or empty state */}
      {activeGoals.length > 0 ? (
        <div className="space-y-3.5">
          {activeGoals.map((goal) => {
            const catConfig = CATEGORY_CONFIG[goal.category] || CATEGORY_CONFIG.Other;
            const GoalIcon = getGoalIconComponent(goal.icon);
            const progress = getGoalProgress(goal);
            const nextMilestone = getGoalMilestones(goal.id).find((m) => !m.isCompleted);

            return (
              <Link
                key={goal.id}
                to="/goals"
                className="block p-3 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.05] dark:border-white/[0.08] hover:border-[#0071e3]/40 transition-all hover:-translate-y-0.5"
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${catConfig.bgLight} ${catConfig.bgDark} ${catConfig.color}`}
                    >
                      <GoalIcon className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-bold text-xs text-[#1d1d1f] dark:text-[#f5f5f7] truncate">
                      {goal.title}
                    </span>
                  </div>

                  <span className="text-xs font-extrabold text-[#0071e3] dark:text-[#2997ff] shrink-0">
                    {progress}%
                  </span>
                </div>

                <ProgressBar
                  progress={progress}
                  size="sm"
                  color="bg-gradient-to-r from-[#0071e3] to-[#a855f7]"
                />

                <div className="flex items-center justify-between text-[11px] text-[#86868b] dark:text-[#98989f] mt-2">
                  <span className="truncate max-w-[180px]">
                    {nextMilestone
                      ? `Next: ${nextMilestone.title}`
                      : goal.trackingType === 'numeric'
                      ? `${goal.currentValue || 0} / ${goal.targetValue || 0} ${goal.unit || ''}`
                      : 'All milestones done'}
                  </span>

                  {goal.targetDate && (
                    <span className="shrink-0 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatFriendlyDate(goal.targetDate)}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-6 px-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-dashed border-black/[0.08] dark:border-white/[0.08]">
          <p className="text-xs text-[#86868b] dark:text-[#98989f] mb-3">
            No active goals set. Transform long-term ambitions into reality.
          </p>
          <Link
            to="/goals"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#0071e3] text-white text-xs font-semibold shadow-xs hover:bg-[#0077ed] transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create First Goal</span>
          </Link>
        </div>
      )}
    </Card>
  );
};
