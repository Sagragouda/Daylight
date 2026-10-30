import React from 'react';
import { Card } from '../common/Card';
import { useTasks } from '../../context/TaskContext';
import { useHabits } from '../../context/HabitContext';
import { ProgressBar } from '../common/ProgressBar';
import { AnimatedCounter } from '../common/AnimatedCounter';
import { CheckCircle2, Flame, Award, Sparkles } from 'lucide-react';

export const DailyProgressCard: React.FC = () => {
  const { progressPercentage, completedTasksCount, totalTasksCount } = useTasks();
  const { habitProgressPercentage, todayCompletedCount, totalHabitsCount } = useHabits();

  // Weighted overall daily progress
  const overallProgress = Math.round(progressPercentage * 0.6 + habitProgressPercentage * 0.4);

  // Circular progress calculations for SVG ring
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (overallProgress / 100) * circumference;

  return (
    <Card hoverable glowColor="aurora" className="p-6 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-base text-[#1d1d1f] dark:text-[#f5f5f7]">
            Daily Momentum
          </h3>
          <p className="text-xs text-[#86868b] dark:text-[#98989f]">
            Goal & habit synchronization
          </p>
        </div>
        <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#0071e3] dark:text-[#2997ff] border border-blue-100 dark:border-blue-900/40 flex items-center justify-center shadow-xs">
          <Award className="w-5 h-5" />
        </div>
      </div>

      {/* Circular Progress & Key Metric */}
      <div className="flex items-center justify-around gap-6 my-2">
        <div className="relative flex items-center justify-center shrink-0">
          <svg className="w-28 h-28 transform -rotate-90">
            {/* Background ring */}
            <circle
              cx="56"
              cy="56"
              r={radius}
              className="text-[#f0f0f4] dark:text-white/[0.08]"
              strokeWidth="9"
              stroke="currentColor"
              fill="transparent"
            />
            {/* Animated progress ring */}
            <circle
              cx="56"
              cy="56"
              r={radius}
              className="text-[#0071e3] dark:text-[#2997ff] transition-all duration-700 ease-out"
              strokeWidth="9"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
            />
          </svg>

          {/* Central Percentage */}
          <div className="absolute inset-0 flex flex-col items-center justify-center select-none">
            <span className="text-2xl font-bold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7]">
              <AnimatedCounter value={overallProgress} suffix="%" />
            </span>
            <span className="text-[10px] font-semibold text-[#86868b] dark:text-[#98989f] uppercase tracking-wider">
              Score
            </span>
          </div>
        </div>

        {/* Detailed Breakdown */}
        <div className="flex-1 space-y-3.5">
          {/* Tasks Progress */}
          <div>
            <div className="flex justify-between items-center text-xs font-medium mb-1">
              <span className="flex items-center gap-1.5 text-[#1d1d1f] dark:text-[#f5f5f7]">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#0071e3] dark:text-[#2997ff]" />
                Tasks ({completedTasksCount}/{totalTasksCount})
              </span>
              <span className="font-semibold text-[#0071e3] dark:text-[#2997ff]">
                {progressPercentage}%
              </span>
            </div>
            <ProgressBar progress={progressPercentage} size="sm" color="bg-[#0071e3] dark:bg-[#2997ff]" />
          </div>

          {/* Habits Progress */}
          <div>
            <div className="flex justify-between items-center text-xs font-medium mb-1">
              <span className="flex items-center gap-1.5 text-[#1d1d1f] dark:text-[#f5f5f7]">
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                Habits ({todayCompletedCount}/{totalHabitsCount})
              </span>
              <span className="font-semibold text-amber-600 dark:text-amber-400">
                {habitProgressPercentage}%
              </span>
            </div>
            <ProgressBar progress={habitProgressPercentage} size="sm" color="bg-amber-500" />
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-black/[0.05] dark:border-white/[0.08] text-xs text-[#6e6e73] dark:text-[#98989f]">
        {overallProgress === 100 ? (
          <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            All scheduled items completed today! Stellar mindful execution.
          </span>
        ) : (
          <span>
            {totalTasksCount - completedTasksCount > 0
              ? `${totalTasksCount - completedTasksCount} task(s) left to reach 100% daily completion.`
              : 'Tasks finished! Check in on remaining habits.'}
          </span>
        )}
      </div>
    </Card>
  );
};
