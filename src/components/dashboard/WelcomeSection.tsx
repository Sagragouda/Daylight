import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { getGreeting } from '../../utils/date';
import { useTasks } from '../../context/TaskContext';
import { useHabits } from '../../context/HabitContext';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../common/Button';

interface WelcomeSectionProps {
  onOpenNewTaskModal: () => void;
}

export const WelcomeSection: React.FC<WelcomeSectionProps> = ({ onOpenNewTaskModal }) => {
  const greeting = getGreeting();
  const { pendingTasksCount } = useTasks();
  const { todayCompletedCount, totalHabitsCount } = useHabits();
  const { getUserDisplayName } = useAuth();

  const rawName = getUserDisplayName();
  const firstName = rawName && rawName !== 'User' ? rawName.split(' ')[0] : 'friend';

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-white via-white to-blue-50/50 dark:from-[#14151e] dark:via-[#14151e] dark:to-blue-950/30 rounded-3xl p-6 sm:p-8 border border-black/[0.06] dark:border-white/[0.08] shadow-glossy-light dark:shadow-glossy-dark animate-fade-in transition-colors duration-200">
      {/* Decorative subtle ambient light circle */}
      <div className="absolute -top-16 -right-16 w-64 h-64 bg-blue-100/50 dark:bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-100/80 dark:border-blue-800/40 text-[#0071e3] dark:text-[#2997ff] text-xs font-semibold mb-3 select-none shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Today's Flow</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7]">
            {greeting.text}, {firstName}.
          </h1>

          <p className="text-sm sm:text-base text-[#6e6e73] dark:text-[#98989f] mt-1.5 leading-relaxed">
            {greeting.subtext}
          </p>

          <div className="flex items-center gap-4 mt-4 text-xs font-medium text-[#86868b] dark:text-[#98989f] flex-wrap">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#0071e3] dark:bg-[#2997ff]" />
              <strong className="text-[#1d1d1f] dark:text-[#f5f5f7] font-semibold">
                {pendingTasksCount}
              </strong>{' '}
              priority {pendingTasksCount === 1 ? 'task' : 'tasks'} remaining
            </span>
            <span className="text-black/20 dark:text-white/20">•</span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <strong className="text-[#1d1d1f] dark:text-[#f5f5f7] font-semibold">
                {todayCompletedCount} of {totalHabitsCount}
              </strong>{' '}
              habits checked in
            </span>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-3 shrink-0">
          <Button
            onClick={onOpenNewTaskModal}
            size="md"
            className="shadow-md hover:shadow-lg"
          >
            Create Task
          </Button>
          <a
            href="#dashboard-focus-timer"
            className="text-xs font-semibold text-[#0071e3] dark:text-[#2997ff] hover:text-[#0062c4] inline-flex items-center gap-1 px-3.5 py-2.5 rounded-xl hover:bg-blue-50/70 dark:hover:bg-blue-950/40 transition-colors"
          >
            Start Focus
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
