import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';
import { Header } from './Header';
import { TaskCreateModal } from '../tasks/TaskCreateModal';
import { HabitCreateModal } from '../habits/HabitCreateModal';
import { AppIntroSplash } from '../common/AppIntroSplash';
import { useBackground } from '../../context/BackgroundContext';

export const MainLayout: React.FC = () => {
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isHabitModalOpen, setIsHabitModalOpen] = useState(false);
  const location = useLocation();
  const { activeBackground, dimLevel, blurLevel } = useBackground();

  return (
    <div className="relative flex min-h-screen bg-[#fbfbfd] dark:bg-[#090a0f] text-[#1d1d1f] dark:text-[#f5f5f7] transition-colors duration-200">
      {/* Dynamic Glossy Background Layer */}
      {activeBackground && (
        <div
          className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
          aria-hidden="true"
        >
          <img
            src={activeBackground.url}
            alt=""
            className="w-full h-full object-cover select-none transition-all duration-700"
            style={{
              filter: `blur(${blurLevel}px) scale(1.05)`,
            }}
          />
          {/* Glass tint overlay ensuring 100% text contrast and readability */}
          <div
            className="absolute inset-0 bg-[#fbfbfd] dark:bg-[#090a0f] transition-opacity duration-300"
            style={{ opacity: dimLevel }}
          />
          {/* Ambient vignette */}
          <div className="absolute inset-0 bg-radial from-transparent via-transparent to-black/25 pointer-events-none" />
        </div>
      )}

      {/* 1-Time Session Intro Splash */}
      <AppIntroSplash />

      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="relative z-10 flex-1 flex flex-col min-w-0 pb-28 lg:pb-10">
        <Header onOpenNewTaskModal={() => setIsTaskModalOpen(true)} />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div key={location.pathname} className="animate-fade-in">
            <Outlet
              context={{
                openTaskModal: () => setIsTaskModalOpen(true),
                openHabitModal: () => setIsHabitModalOpen(true),
              }}
            />
          </div>
        </main>
      </div>

      {/* Mobile Bottom Dock Navigation */}
      <MobileNav />

      {/* Global Task Creation Modal */}
      <TaskCreateModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
      />

      {/* Global Habit Creation Modal */}
      <HabitCreateModal
        isOpen={isHabitModalOpen}
        onClose={() => setIsHabitModalOpen(false)}
      />
    </div>
  );
};
