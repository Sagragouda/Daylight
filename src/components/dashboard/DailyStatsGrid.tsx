import React from 'react';
import { CheckCircle2, Clock, Flame, Zap, ArrowUpRight } from 'lucide-react';
import { useTasks } from '../../context/TaskContext';
import { useHabits } from '../../context/HabitContext';
import { useTimer } from '../../context/TimerContext';
import { Card } from '../common/Card';
import { AnimatedCounter } from '../common/AnimatedCounter';

export const DailyStatsGrid: React.FC = () => {
  const { completedTasksCount, totalTasksCount, progressPercentage } = useTasks();
  const { todayCompletedCount, totalHabitsCount, habitProgressPercentage } = useHabits();
  const { completedSessions } = useTimer();

  const totalFocusMinutes = completedSessions * 25;
  const compositeScore = Math.min(
    100,
    Math.round(progressPercentage * 0.55 + habitProgressPercentage * 0.45)
  );

  const stats = [
    {
      label: 'Tasks Completed',
      valueComponent: (
        <>
          <AnimatedCounter value={completedTasksCount} />
          <span className="text-xl sm:text-2xl text-[#86868b] dark:text-[#98989f] font-normal">
            /{totalTasksCount}
          </span>
        </>
      ),
      sub: `${progressPercentage}% of today`,
      icon: CheckCircle2,
      color: 'text-[#0071e3] dark:text-[#2997ff]',
      bgColor: 'bg-blue-50 dark:bg-blue-950/50',
      borderColor: 'border-blue-100 dark:border-blue-900/40',
      glowColor: 'blue' as const,
    },
    {
      label: 'Focus Time',
      valueComponent: <AnimatedCounter value={totalFocusMinutes} suffix="m" />,
      sub: `${completedSessions} Pomodoros completed`,
      icon: Clock,
      color: 'text-indigo-600 dark:text-indigo-400',
      bgColor: 'bg-indigo-50 dark:bg-indigo-950/50',
      borderColor: 'border-indigo-100 dark:border-indigo-900/40',
      glowColor: 'purple' as const,
    },
    {
      label: 'Habits Active',
      valueComponent: (
        <>
          <AnimatedCounter value={todayCompletedCount} />
          <span className="text-xl sm:text-2xl text-[#86868b] dark:text-[#98989f] font-normal">
            /{totalHabitsCount}
          </span>
        </>
      ),
      sub: `${habitProgressPercentage}% consistency`,
      icon: Flame,
      color: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-50 dark:bg-amber-950/50',
      borderColor: 'border-amber-100 dark:border-amber-900/40',
      glowColor: 'amber' as const,
    },
    {
      label: 'Flow Score',
      valueComponent: <AnimatedCounter value={compositeScore} />,
      sub: compositeScore >= 80 ? 'Peak momentum' : 'Gaining pace',
      icon: Zap,
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/50',
      borderColor: 'border-emerald-100 dark:border-emerald-900/40',
      glowColor: 'emerald' as const,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        const staggerClass = `stagger-${idx + 1}`;
        return (
          <Card
            key={idx}
            hoverable
            glowColor={stat.glowColor}
            className={`p-4 sm:p-5 flex flex-col justify-between animate-slide-up ${staggerClass}`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-[#86868b] dark:text-[#98989f]">
                {stat.label}
              </span>
              <div
                className={`w-8 h-8 rounded-xl ${stat.bgColor} ${stat.borderColor} border flex items-center justify-center shrink-0 shadow-xs`}
              >
                <Icon className={`w-4 h-4 ${stat.color}`} />
              </div>
            </div>

            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7]">
                  {stat.valueComponent}
                </span>
                <span className="inline-flex items-center text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
              </div>
              <p className="text-xs text-[#6e6e73] dark:text-[#98989f] mt-1 font-medium truncate">
                {stat.sub}
              </p>
            </div>
          </Card>
        );
      })}
    </div>
  );
};
