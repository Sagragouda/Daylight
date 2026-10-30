import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';
import { Header } from './Header';
import { TaskCreateModal } from '../tasks/TaskCreateModal';
import { HabitCreateModal } from '../habits/HabitCreateModal';

export const MainLayout: React.FC = () => {
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isHabitModalOpen, setIsHabitModalOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#fbfbfd]">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 lg:pb-8">
        <Header onOpenNewTaskModal={() => setIsTaskModalOpen(true)} />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-6 sm:py-8">
          <Outlet context={{
            openTaskModal: () => setIsTaskModalOpen(true),
            openHabitModal: () => setIsHabitModalOpen(true),
          }} />
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
