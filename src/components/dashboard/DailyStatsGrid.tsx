import React from 'react';
import { CheckCircle2, Clock, Flame, Zap, ArrowUpRight } from 'lucide-react';
import { useTasks } from '../../context/TaskContext';
import { useHabits } from '../../context/HabitContext';
import { useTimer } from '../../context/TimerContext';
import { Card } from '../common/Card';

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
      value: `${completedTasksCount}/${totalTasksCount}`,
      sub: `${progressPercentage}% of today`,
      icon: CheckCircle2,
      color: 'text-[#0071e3]',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-100',
    },
    {
      label: 'Focus Time',
      value: `${totalFocusMinutes}m`,
      sub: `${completedSessions} Pomodoros completed`,
      icon: Clock,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-100',
    },
    {
      label: 'Habits Active',
      value: `${todayCompletedCount}/${totalHabitsCount}`,
      sub: `${habitProgressPercentage}% consistency`,
      icon: Flame,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-100',
    },
    {
      label: 'Flow Score',
      value: `${compositeScore}`,
      sub: compositeScore >= 80 ? 'Peak momentum' : 'Gaining pace',
      icon: Zap,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-100',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <Card
            key={idx}
            hoverable
            className="p-4 sm:p-5 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#86868b]">
                {stat.label}
              </span>
              <div className={`w-8 h-8 rounded-xl ${stat.bgColor} ${stat.borderColor} border flex items-center justify-center shrink-0`}>
                <Icon className={`w-4 h-4 ${stat.color}`} />
              </div>
            </div>

            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1d1d1f]">
                  {stat.value}
                </span>
                <span className="inline-flex items-center text-[11px] font-semibold text-emerald-600">
                  <ArrowUpRight className="w-3 h-3" />
                </span>
              </div>
              <p className="text-xs text-[#6e6e73] mt-1 font-medium truncate">
                {stat.sub}
              </p>
            </div>
          </Card>
        );
      })}
    </div>
  );
};
