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
    <div className="relative overflow-hidden bg-gradient-to-br from-white via-white to-blue-50/50 rounded-3xl p-6 sm:p-8 border border-black/[0.06] shadow-[0_4px_24px_-4px_rgba(0,113,227,0.06)] animate-fade-in">
      {/* Decorative subtle ambient light circle */}
      <div className="absolute -top-16 -right-16 w-64 h-64 bg-blue-100/50 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-100/80 text-[#0071e3] text-xs font-semibold mb-3 select-none">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Today's Flow</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#1d1d1f]">
            {greeting.text}, {firstName}.
          </h1>

          <p className="text-sm sm:text-base text-[#6e6e73] mt-1.5 leading-relaxed">
            {greeting.subtext}
          </p>

          <div className="flex items-center gap-4 mt-4 text-xs font-medium text-[#86868b] flex-wrap">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#0071e3]" />
              <strong className="text-[#1d1d1f] font-semibold">{pendingTasksCount}</strong> priority {pendingTasksCount === 1 ? 'task' : 'tasks'} remaining
            </span>
            <span className="text-black/20">•</span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <strong className="text-[#1d1d1f] font-semibold">{todayCompletedCount} of {totalHabitsCount}</strong> habits checked in
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
            className="text-xs font-semibold text-[#0071e3] hover:text-[#0062c4] inline-flex items-center gap-1 px-3.5 py-2.5 rounded-xl hover:bg-blue-50/70 transition-colors"
          >
            Start Focus
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
