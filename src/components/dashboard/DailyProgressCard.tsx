import React from 'react';
import { Card } from '../common/Card';
import { useTasks } from '../../context/TaskContext';
import { useHabits } from '../../context/HabitContext';
import { ProgressBar } from '../common/ProgressBar';
import { CheckCircle2, Flame, Award } from 'lucide-react';

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
    <Card className="p-6 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-base text-[#1d1d1f]">Daily Momentum</h3>
          <p className="text-xs text-[#86868b]">Dynamic goal & habit synchronization</p>
        </div>
        <div className="p-2 rounded-xl bg-blue-50 text-[#0071e3]">
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
              className="text-[#f0f0f4]"
              strokeWidth="9"
              stroke="currentColor"
              fill="transparent"
            />
            {/* Animated progress ring */}
            <circle
              cx="56"
              cy="56"
              r={radius}
              className="text-[#0071e3] transition-all duration-700 ease-out"
              strokeWidth="9"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-2xl font-bold tracking-tight text-[#1d1d1f]">
              {overallProgress}%
            </span>
            <span className="text-[10px] uppercase font-semibold text-[#86868b] tracking-wider">
              Overall
            </span>
          </div>
        </div>

        {/* Detailed Breakdown */}
        <div className="flex-1 space-y-3">
          <div>
            <div className="flex justify-between items-center text-xs font-medium mb-1">
              <span className="flex items-center gap-1.5 text-[#1d1d1f]">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#0071e3]" />
                Tasks ({completedTasksCount}/{totalTasksCount})
              </span>
              <span className="font-semibold text-[#0071e3]">{progressPercentage}%</span>
            </div>
            <ProgressBar progress={progressPercentage} size="sm" color="bg-[#0071e3]" />
          </div>

          <div>
            <div className="flex justify-between items-center text-xs font-medium mb-1">
              <span className="flex items-center gap-1.5 text-[#1d1d1f]">
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                Habits ({todayCompletedCount}/{totalHabitsCount})
              </span>
              <span className="font-semibold text-amber-600">{habitProgressPercentage}%</span>
            </div>
            <ProgressBar progress={habitProgressPercentage} size="sm" color="bg-amber-500" />
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-black/[0.05] text-xs text-[#6e6e73]">
        {overallProgress === 100 ? (
          <span className="text-emerald-600 font-medium">
            🎉 All scheduled items completed today! Stellar mindful execution.
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
