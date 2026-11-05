import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { WelcomeSection } from '../components/dashboard/WelcomeSection';
import { DailyStatsGrid } from '../components/dashboard/DailyStatsGrid';
import { DailyProgressCard } from '../components/dashboard/DailyProgressCard';
import { DashboardTaskList } from '../components/dashboard/DashboardTaskList';
import { DashboardHabitTracker } from '../components/dashboard/DashboardHabitTracker';
import { MiniFocusTimer } from '../components/dashboard/MiniFocusTimer';
import { DashboardGoalsWidget } from '../components/dashboard/DashboardGoalsWidget';

interface OutletContextType {
  openTaskModal: () => void;
  openHabitModal: () => void;
}

export const Overview: React.FC = () => {
  const { openTaskModal, openHabitModal } = useOutletContext<OutletContextType>();

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      {/* Welcome Banner */}
      <WelcomeSection onOpenNewTaskModal={openTaskModal} />

      {/* Daily Statistics Cards */}
      <DailyStatsGrid />

      {/* Main Grid: Left side Priorities & Habits, Right side Progress & Focus Timer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        {/* Left Column (7 cols): Today's Tasks & Habit Consistency */}
        <div className="lg:col-span-7 space-y-6 sm:space-y-8">
          <DashboardTaskList onOpenNewTaskModal={openTaskModal} />
          <DashboardHabitTracker onOpenNewHabitModal={openHabitModal} />
        </div>

        {/* Right Column (5 cols): Daily Progress, Pomodoro Timer & Goals Tracker */}
        <div className="lg:col-span-5 space-y-6 sm:space-y-8">
          <DailyProgressCard />
          <MiniFocusTimer />
          <DashboardGoalsWidget />
        </div>
      </div>
    </div>
  );
};
