import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  CheckCircle2,
  Flame,
  Timer,
  Menu,
  X,
  Calendar,
  FileText,
  TrendingUp,
  Settings,
  Database,
} from 'lucide-react';
import { useTasks } from '../../context/TaskContext';

export const MobileNav: React.FC = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { pendingTasksCount } = useTasks();

  const primaryItems = [
    { name: 'Overview', path: '/', icon: LayoutDashboard },
    { name: 'Tasks', path: '/tasks', icon: CheckCircle2, badge: pendingTasksCount },
    { name: 'Habits', path: '/habits', icon: Flame },
    { name: 'Focus', path: '/focus', icon: Timer },
  ];

  const secondaryItems = [
    { name: 'Planner', path: '/planner', icon: Calendar },
    { name: 'Notes', path: '/notes', icon: FileText },
    { name: 'Insights', path: '/insights', icon: TrendingUp },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <>
      {/* Slide-out Drawer for "More" sections */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={() => setDrawerOpen(false)}
          />

          <div className="fixed inset-x-0 bottom-0 max-h-[80vh] bg-white rounded-t-3xl p-6 shadow-2xl border-t border-black/[0.08] z-10 overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-black/[0.06] mb-4">
              <span className="font-semibold text-lg text-[#1d1d1f]">All Navigation</span>
              <button
                onClick={() => setDrawerOpen(false)}
                className="p-1.5 rounded-full text-[#86868b] hover:bg-[#f5f5f7]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {[...primaryItems, ...secondaryItems].map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setDrawerOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 p-3 rounded-2xl border text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-[#0071e3]/10 border-[#0071e3]/30 text-[#0071e3] font-semibold'
                          : 'bg-[#fbfbfd] border-black/[0.04] text-[#1d1d1f] hover:bg-[#f5f5f7]'
                      }`
                    }
                  >
                    <Icon className="w-5 h-5 text-[#0071e3]" />
                    <span>{item.name}</span>
                  </NavLink>
                );
              })}
            </div>

            <div className="mt-6 pt-4 border-t border-black/[0.06] flex items-center justify-between text-xs text-[#86868b]">
              <span className="flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-[#0071e3]" />
                Supabase ready for Phase 2
              </span>
              <span>Daylight v1.0</span>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Floating Navigation Dock for Mobile */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-white/90 backdrop-blur-xl border-t border-black/[0.06] px-4 py-2 z-40 safe-bottom">
        <div className="flex items-center justify-around max-w-md mx-auto">
          {primaryItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `relative flex flex-col items-center py-1 px-3 rounded-xl transition-all duration-200 ${
                    isActive ? 'text-[#0071e3]' : 'text-[#86868b] hover:text-[#1d1d1f]'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="relative">
                      <Icon className="w-5 h-5" />
                      {Boolean(item.badge && item.badge > 0) && (
                        <span className="absolute -top-1.5 -right-2.5 bg-[#0071e3] text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <span className={`text-[10px] mt-1 ${isActive ? 'font-semibold' : 'font-normal'}`}>
                      {item.name}
                    </span>
                  </>
                )}
              </NavLink>
            );
          })}

          {/* More Menu Toggle */}
          <button
            onClick={() => setDrawerOpen(true)}
            className="flex flex-col items-center py-1 px-3 rounded-xl text-[#86868b] hover:text-[#1d1d1f]"
          >
            <Menu className="w-5 h-5" />
            <span className="text-[10px] mt-1">More</span>
          </button>
        </div>
      </nav>
    </>
  );
};
